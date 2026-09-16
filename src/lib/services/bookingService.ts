import { Booking, Business, Service, BlockedTime } from '@/types';
import { AvailabilityService } from './availabilityService';
import { addMinutesToTime, generateBookingReference } from '@/lib/utils';

export interface CreateBookingRequest {
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  business: Business;
  service: Service;
  date: string;
  startTime: string;
  notes?: string;
  specialRequests?: string;
  resourceId?: string;
  resourceName?: string;
  existingBookings: Booking[];
  blockedTimes?: BlockedTime[];
}

export class BookingService {
  /**
   * Authoritatively validate and create a booking
   */
  public static createBookingAtomically(req: CreateBookingRequest): {
    isValid: boolean;
    error?: string;
    booking?: Booking;
  } {
    if (!req.business || !req.business.active || ['suspended', 'closed', 'draft'].includes(req.business.status)) {
      return { isValid: false, error: 'This business is currently not accepting bookings.' };
    }

    if (!req.service || !req.service.active) {
      return { isValid: false, error: 'The selected service is currently unavailable.' };
    }

    if (!req.customerName.trim() || !req.customerPhone.trim()) {
      return { isValid: false, error: 'Customer name and phone number are required.' };
    }

    const duration = req.service.durationMinutes || 45;
    const conflictCheck = AvailabilityService.hasConflict(
      req.business.id,
      req.date,
      req.startTime,
      duration,
      req.existingBookings,
      req.blockedTimes || [],
      req.resourceId
    );

    if (conflictCheck.hasConflict) {
      return { isValid: false, error: conflictCheck.reason };
    }

    const endTime = addMinutesToTime(req.startTime, duration);
    const bookingRef = generateBookingReference();

    const newBooking: Booking = {
      id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookingReference: bookingRef,
      userId: req.userId,
      customerName: req.customerName.trim(),
      customerPhone: req.customerPhone.trim(),
      customerEmail: req.customerEmail.trim(),
      businessId: req.business.id,
      businessName: req.business.name,
      businessSlug: req.business.slug,
      businessAddress: `${req.business.address}, ${req.business.neighborhood}`,
      serviceId: req.service.id,
      serviceName: req.service.name,
      servicePrice: req.service.price,
      durationMinutes: duration,
      resourceId: req.resourceId,
      resourceName: req.resourceName,
      date: req.date,
      startTime: req.startTime,
      endTime,
      status: 'confirmed',
      paymentStatus: 'paid_simulated',
      notes: req.notes?.trim() || req.specialRequests?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { isValid: true, booking: newBooking };
  }
}
