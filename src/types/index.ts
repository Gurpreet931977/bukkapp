export type UserRole = 'customer' | 'business_owner' | 'admin';

export type BusinessStatus =
  | 'draft'
  | 'pending_review'
  | 'needs_changes'
  | 'approved'
  | 'active'
  | 'suspended'
  | 'closed';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type ResourceType = 'court' | 'room' | 'chair' | 'staff' | 'equipment';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  businessId?: string;
}

export interface DaySchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayName: string;
  isOpen: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "20:00"
  slotDurationMinutes?: number;
  periods?: { openTime: string; closeTime: string }[];
}

export interface Resource {
  id: string;
  businessId: string;
  name: string;
  type: ResourceType;
  active: boolean;
}

export interface BlockedTime {
  id: string;
  businessId: string;
  startDatetime: string; // "2026-08-25T14:00:00"
  endDatetime: string; // "2026-08-25T17:00:00"
  reason: string;
  createdAt: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  categoryId: string;
  categoryName: string;
  subcategory: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  instagram?: string;
  logo?: string;
  coverImage: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  status: BusinessStatus;
  changeRequestReason?: string;
  adminNotes?: string;
  startingPrice: number;
  features: string[];
  schedule: DaySchedule[];
  resources?: Resource[];
  active: boolean;
  distanceKm?: number;
  nextAvailableSlot?: string;
  pageViewsThisWeek?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  count: number;
  popularServices: string[];
  active: boolean;
  sortOrder: number;
  parentId?: string;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  durationMinutes: number;
  category?: string;
  active: boolean;
  resourceRequired?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  time: string; // "14:30" (24h)
  displayTime: string; // "2:30 PM"
  isAvailable: boolean;
  resourceId?: string;
  resourceName?: string;
  period: 'morning' | 'afternoon' | 'evening';
  remainingSlots?: number;
  date?: string;
}

export interface Booking {
  id: string;
  bookingReference: string; // "BK-8F3K9L"
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  businessAddress: string;
  businessPhone?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  durationMinutes: number;
  resourceId?: string;
  resourceName?: string;
  date: string; // "2026-08-25"
  startTime: string; // "10:00"
  endTime: string; // "10:45"
  status: BookingStatus;
  paymentStatus: 'paid_simulated' | 'simulated_success' | 'pending' | 'refunded';
  notes?: string;
  specialRequests?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  bookingId?: string;
  serviceName?: string;
  createdAt: string;
  isReported?: boolean;
  isHidden?: boolean;
  businessReply?: {
    comment: string;
    createdAt: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  businessId?: string;
  type: 'booking_created' | 'booking_cancelled' | 'business_approved' | 'changes_requested' | 'review_posted' | 'system_alert';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  action: string;
  entityType: 'business' | 'booking' | 'review' | 'category' | 'user';
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  businessId: string;
  name: string;
  phone: string;
  email: string;
  totalBookings: number;
  lastBookingDate?: string;
  favoriteService?: string;
  notes?: string;
  createdAt: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  neighborhood?: string;
  date?: string;
  timeFrom?: string;
  timeTo?: string;
  timePeriod?: 'morning' | 'afternoon' | 'evening';
  minRating?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  sortBy?: 'recommended' | 'price_low' | 'price_high' | 'rating' | 'distance';
}

export interface ParsedSearchIntent {
  rawQuery: string;
  detectedCategory?: string;
  detectedNeighborhood?: string;
  detectedDate?: string;
  detectedTimeFrom?: string;
  detectedTimeTo?: string;
  detectedTimePeriod?: 'morning' | 'afternoon' | 'evening';
  detectedMaxPrice?: number;
  detectedRating?: number;
  confidence: number;
}
