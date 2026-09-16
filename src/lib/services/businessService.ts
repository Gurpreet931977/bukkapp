import { Service, DaySchedule, BlockedTime } from '@/types';

export class BusinessService {
  /**
   * Helper to copy Monday schedule to all weekdays (Tuesday - Friday)
   */
  public static copyMondayToWeekdays(schedule: DaySchedule[]): DaySchedule[] {
    const monday = schedule.find((s) => s.dayOfWeek === 1);
    if (!monday) return schedule;

    return schedule.map((s) => {
      // If weekday (Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5)
      if (s.dayOfWeek >= 2 && s.dayOfWeek <= 5) {
        return {
          ...s,
          isOpen: monday.isOpen,
          openTime: monday.openTime,
          closeTime: monday.closeTime,
          periods: monday.periods ? JSON.parse(JSON.stringify(monday.periods)) : undefined,
        };
      }
      return s;
    });
  }

  /**
   * Generates a new BlockedTime record
   */
  public static createBlockedTime(
    businessId: string,
    startDatetime: string,
    endDatetime: string,
    reason: string
  ): BlockedTime {
    return {
      id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      businessId,
      startDatetime,
      endDatetime,
      reason: reason.trim() || 'Temporary Closure / Maintenance',
      createdAt: new Date().toISOString(),
    };
  }
}
