import { Business, Booking, BlockedTime, TimeSlot, Resource } from '@/types';
import { formatTime24to12, getTimePeriod } from '@/lib/utils';

export class AvailabilityService {
  /**
   * Converts "HH:MM" 24-hour string to minutes from midnight
   */
  public static timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
    return (h || 0) * 60 + (m || 0);
  }

  /**
   * Converts minutes from midnight to "HH:MM" 24-hour format
   */
  public static minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  /**
   * Generates discrete available time slots for a business on a target date
   */
  public static generateSlotsForDate(
    business: Business,
    dateString: string,
    serviceDurationMinutes: number,
    existingBookings: Booking[],
    blockedTimes: BlockedTime[] = [],
    selectedResourceId?: string
  ): TimeSlot[] {
    if (!business || !business.active || ['suspended', 'closed', 'draft'].includes(business.status)) {
      return [];
    }

    const dateObj = new Date(dateString);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const daySchedule = business.schedule.find((s) => s.dayOfWeek === dayOfWeek);
    if (!daySchedule || !daySchedule.isOpen) {
      return [];
    }

    const intervals: { startMin: number; endMin: number }[] = [];
    if (daySchedule.periods && daySchedule.periods.length > 0) {
      for (const p of daySchedule.periods) {
        intervals.push({
          startMin: this.timeToMinutes(p.openTime),
          endMin: this.timeToMinutes(p.closeTime),
        });
      }
    } else {
      intervals.push({
        startMin: this.timeToMinutes(daySchedule.openTime),
        endMin: this.timeToMinutes(daySchedule.closeTime),
      });
    }

    const activeBookings = existingBookings.filter(
      (b) =>
        b.businessId === business.id &&
        b.date === dateString &&
        b.status !== 'cancelled' &&
        (!selectedResourceId || !b.resourceId || b.resourceId === selectedResourceId)
    );

    // Filter relevant blocked times on this date
    const dayBlockedTimes = blockedTimes.filter((blk) => {
      if (blk.businessId !== business.id) return false;
      const blkDate = blk.startDatetime.split('T')[0];
      return blkDate === dateString;
    });

    const stepInterval = serviceDurationMinutes >= 60 ? 30 : 15;
    const slots: TimeSlot[] = [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isToday = dateString === todayStr;
    const currentMin = now.getHours() * 60 + now.getMinutes() + 15; // 15 min buffer

    for (const interval of intervals) {
      for (
        let start = interval.startMin;
        start + serviceDurationMinutes <= interval.endMin;
        start += stepInterval
      ) {
        if (isToday && start < currentMin) {
          continue;
        }

        const end = start + serviceDurationMinutes;
        const time24 = this.minutesToTime(start);

        // Check booking overlap
        const hasBookingOverlap = activeBookings.some((b) => {
          const bStart = this.timeToMinutes(b.startTime);
          const bEnd = this.timeToMinutes(b.endTime);
          return start < bEnd && end > bStart;
        });

        // Check blocked time overlap
        const hasBlockedOverlap = dayBlockedTimes.some((blk) => {
          const blkStartTime = blk.startDatetime.split('T')[1]?.substring(0, 5) || '00:00';
          const blkEndTime = blk.endDatetime.split('T')[1]?.substring(0, 5) || '23:59';
          const blkStartMin = this.timeToMinutes(blkStartTime);
          const blkEndMin = this.timeToMinutes(blkEndTime);
          return start < blkEndMin && end > blkStartMin;
        });

        const isAvailable = !hasBookingOverlap && !hasBlockedOverlap;

        slots.push({
          time: time24,
          displayTime: formatTime24to12(time24),
          isAvailable,
          period: getTimePeriod(time24),
          resourceId: selectedResourceId,
        });
      }
    }

    return slots;
  }

  /**
   * Conflict detection check
   */
  public static hasConflict(
    businessId: string,
    dateString: string,
    startTime: string,
    durationMinutes: number,
    existingBookings: Booking[],
    blockedTimes: BlockedTime[] = [],
    resourceId?: string
  ): { hasConflict: boolean; reason?: string } {
    const reqStart = this.timeToMinutes(startTime);
    const reqEnd = reqStart + durationMinutes;

    // Check bookings
    const conflictingBooking = existingBookings.find((b) => {
      if (b.businessId !== businessId || b.date !== dateString || b.status === 'cancelled') {
        return false;
      }
      if (resourceId && b.resourceId && b.resourceId !== resourceId) {
        return false;
      }
      const bStart = this.timeToMinutes(b.startTime);
      const bEnd = this.timeToMinutes(b.endTime);
      return reqStart < bEnd && reqEnd > bStart;
    });

    if (conflictingBooking) {
      return {
        hasConflict: true,
        reason: `This time slot (${formatTime24to12(startTime)}) was just booked by another customer.`,
      };
    }

    // Check blocked times
    const conflictingBlock = blockedTimes.find((blk) => {
      if (blk.businessId !== businessId) return false;
      const blkDate = blk.startDatetime.split('T')[0];
      if (blkDate !== dateString) return false;
      const blkStartTime = blk.startDatetime.split('T')[1]?.substring(0, 5) || '00:00';
      const blkEndTime = blk.endDatetime.split('T')[1]?.substring(0, 5) || '23:59';
      const blkStartMin = this.timeToMinutes(blkStartTime);
      const blkEndMin = this.timeToMinutes(blkEndTime);
      return reqStart < blkEndMin && reqEnd > blkStartMin;
    });

    if (conflictingBlock) {
      return {
        hasConflict: true,
        reason: `This time is marked as unavailable: ${conflictingBlock.reason}`,
      };
    }

    return { hasConflict: false };
  }
}
