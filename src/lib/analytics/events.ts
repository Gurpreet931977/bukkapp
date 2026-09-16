'use client';

export type AnalyticsEventName =
  | 'search'
  | 'business_view'
  | 'service_view'
  | 'slot_view'
  | 'booking_started'
  | 'booking_completed'
  | 'booking_cancelled'
  | 'favorite_added'
  | 'business_shared'
  | 'business_signup'
  | 'business_onboarding_started'
  | 'business_onboarding_completed'
  | 'business_profile_updated'
  | 'review_created'
  | 'review_reported';

export interface AnalyticsEvent {
  id: string;
  name: AnalyticsEventName;
  properties?: Record<string, any>;
  timestamp: string;
}

class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private readonly STORAGE_KEY = 'bukkapp_analytics_events_v1';

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          this.events = JSON.parse(stored);
        }
      } catch (err) {
        this.events = [];
      }
    }
  }

  public track(name: AnalyticsEventName, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.events.unshift(event);
    if (this.events.length > 500) {
      this.events = this.events.slice(0, 500);
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
      } catch (err) {
        // Storage full or private mode
      }
    }

    if (process.env.NODE_ENV === 'development') {
      // Lightweight non-intrusive dev logger
      // console.debug(`[BUKKAPP Analytics] ${name}`, properties);
    }
  }

  public getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  public getEventsByName(name: AnalyticsEventName): AnalyticsEvent[] {
    return this.events.filter((e) => e.name === name);
  }
}

export const analytics = new AnalyticsTracker();
