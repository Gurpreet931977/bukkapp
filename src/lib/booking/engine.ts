import { Business, Service, Booking, TimeSlot } from '@/types';
import { formatTime24to12, getTimePeriod, addMinutesToTime, generateBookingReference } from '@/lib/utils';

export interface BookingValidationResult {
  isValid: boolean;
  error?: string;
  booking?: Booking;
}

export class BookingEngine {
  /**
   * Generates discrete time slots for a given business on a specific date,
   * factoring in working hours, slot intervals, and current confirmed bookings.
   */
  static generateSlotsForDate(
    business: Business,
    dateString: string,
    serviceDurationMinutes: number = 45,
    existingBookings: Booking[] = []
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    if (!business.active) return slots;

    // Determine Day of Week for the target date
    const [year, month, day] = dateString.split('-').map((n) => parseInt(n, 10));
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay();

    const schedule = business.schedule.find((s) => s.dayOfWeek === dayOfWeek);
    if (!schedule || !schedule.isOpen) {
      return slots; // Closed on this day
    }

    const [openH, openM] = schedule.openTime.split(':').map((n) => parseInt(n, 10));
    const [closeH, closeM] = schedule.closeTime.split(':').map((n) => parseInt(n, 10));

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    const interval = schedule.slotDurationMinutes || 45;

    // Filter confirmed bookings for this business on this date
    const relevantBookings = existingBookings.filter(
      (b) =>
        b.businessId === business.id &&
        b.date === dateString &&
        b.status !== 'cancelled'
    );

    // Check if the target date is today to filter out past hours
    const now = new Date();
    const isToday =
      now.getFullYear() === year &&
      now.getMonth() === month - 1 &&
      now.getDate() === day;
    const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

    for (let m = openMinutes; m + interval <= closeMinutes; m += interval) {
      const slotHour = Math.floor(m / 60);
      const slotMin = m % 60;
      const time24 = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`;
      const endMinutes = m + interval;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;
      const endTime24 = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

      // Check conflict with existing bookings
      const hasConflict = relevantBookings.some((b) => {
        const [bStartH, bStartM] = b.startTime.split(':').map((n) => parseInt(n, 10));
        const [bEndH, bEndM] = b.endTime.split(':').map((n) => parseInt(n, 10));
        const bStart = bStartH * 60 + bStartM;
        const bEnd = bEndH * 60 + bEndM;

        // Overlap condition: start < bEnd and end > bStart
        return m < bEnd && endMinutes > bStart;
      });

      // If slot is today and in the past (with a 30m buffer), mark unavailable
      const isPast = isToday && m < currentMinutesNow + 15;

      const isAvailable = !hasConflict && !isPast;

      slots.push({
        time: time24,
        displayTime: formatTime24to12(time24),
        period: getTimePeriod(time24),
        isAvailable,
        remainingSlots: isAvailable ? 1 : 0,
        date: dateString,
      });
    }

    return slots;
  }

  /**
   * Server-authoritative atomic validation and creation.
   */
  static createBookingAtomically(params: {
    userId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    business: Business;
    service: Service;
    date: string;
    startTime: string;
    specialRequests?: string;
    existingBookings: Booking[];
  }): BookingValidationResult {
    const {
      userId,
      customerName,
      customerPhone,
      customerEmail,
      business,
      service,
      date,
      startTime,
      specialRequests,
      existingBookings,
    } = params;

    // 1. Verify User Info
    if (!customerName || !customerPhone || !customerEmail) {
      return { isValid: false, error: 'Customer contact details are incomplete.' };
    }

    // 2. Verify Business Status
    if (!business || !business.active) {
      return { isValid: false, error: 'This business is currently not accepting bookings.' };
    }

    // 3. Verify Service
    if (!service || !service.active || service.businessId !== business.id) {
      return { isValid: false, error: 'The requested service is unavailable.' };
    }

    // 4. Verify Date (Cannot book in the past)
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      return { isValid: false, error: 'Cannot book appointments for past dates.' };
    }

    // 5. Calculate End Time
    const duration = service.durationMinutes || 45;
    const endTime = addMinutesToTime(startTime, duration);

    // 6. Verify Slot within Working Hours
    const [year, month, day] = date.split('-').map((n) => parseInt(n, 10));
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay();
    const schedule = business.schedule.find((s) => s.dayOfWeek === dayOfWeek);

    if (!schedule || !schedule.isOpen) {
      return { isValid: false, error: 'The business is closed on the selected day.' };
    }

    const [startH, startM] = startTime.split(':').map((n) => parseInt(n, 10));
    const [endH, endM] = endTime.split(':').map((n) => parseInt(n, 10));
    const [openH, openM] = schedule.openTime.split(':').map((n) => parseInt(n, 10));
    const [closeH, closeM] = schedule.closeTime.split(':').map((n) => parseInt(n, 10));

    const reqStartMin = startH * 60 + startM;
    const reqEndMin = endH * 60 + endM;
    const busOpenMin = openH * 60 + openM;
    const busCloseMin = closeH * 60 + closeM;

    if (reqStartMin < busOpenMin || reqEndMin > busCloseMin) {
      return { isValid: false, error: 'The requested slot falls outside working hours.' };
    }

    // 7. Atomic Collision Check
    const conflict = existingBookings.find((b) => {
      if (b.businessId !== business.id || b.date !== date || b.status === 'cancelled') {
        return false;
      }
      const [bStartH, bStartM] = b.startTime.split(':').map((n) => parseInt(n, 10));
      const [bEndH, bEndM] = b.endTime.split(':').map((n) => parseInt(n, 10));
      const bStart = bStartH * 60 + bStartM;
      const bEnd = bEndH * 60 + bEndM;

      return reqStartMin < bEnd && reqEndMin > bStart;
    });

    if (conflict) {
      return {
        isValid: false,
        error: `This time slot (${formatTime24to12(startTime)}) was just booked by another customer. Please choose another slot.`,
      };
    }

    // 8. Construct Confirmed Booking Record
    const booking: Booking = {
      id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      bookingReference: generateBookingReference(),
      userId,
      customerName,
      customerPhone,
      customerEmail,
      businessId: business.id,
      businessName: business.name,
      businessSlug: business.slug,
      businessAddress: `${business.address}, ${business.neighborhood}, ${business.city}`,
      businessPhone: business.phone,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      durationMinutes: duration,
      date,
      startTime,
      endTime,
      status: 'confirmed',
      specialRequests: specialRequests || undefined,
      paymentStatus: 'simulated_success',
      createdAt: new Date().toISOString(),
    };

    return {
      isValid: true,
      booking,
    };
  }
}
