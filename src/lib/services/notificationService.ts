import { Notification } from '@/types';

export class NotificationService {
  public static createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    businessId?: string,
    link?: string
  ): Notification {
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      businessId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      link,
    };
  }
}
