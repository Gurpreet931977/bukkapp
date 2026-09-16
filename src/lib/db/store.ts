'use client';

import {
  Business,
  Category,
  Service,
  Booking,
  Review,
  User,
  Resource,
  BlockedTime,
  Notification,
  AuditLog,
  CustomerProfile,
  SearchFilters,
  BusinessStatus,
  BookingStatus,
} from '@/types';
import {
  INITIAL_BUSINESSES,
  INITIAL_CATEGORIES,
  INITIAL_SERVICES,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
  INITIAL_RESOURCES,
  INITIAL_BLOCKED_TIMES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  DEMO_USERS,
} from '@/lib/seed/data';
import { BookingService, CreateBookingRequest } from '@/lib/services/bookingService';
import { AdminService } from '@/lib/services/adminService';
import { NotificationService } from '@/lib/services/notificationService';
import { SearchIntentParser } from '@/lib/search/intentParser';
import { calculateDistanceKm } from '@/lib/utils';

const STORAGE_KEYS = {
  BUSINESSES: 'bukkapp_businesses_v2',
  SERVICES: 'bukkapp_services_v2',
  BOOKINGS: 'bukkapp_bookings_v2',
  REVIEWS: 'bukkapp_reviews_v2',
  RESOURCES: 'bukkapp_resources_v2',
  BLOCKED_TIMES: 'bukkapp_blocked_times_v2',
  NOTIFICATIONS: 'bukkapp_notifications_v2',
  AUDIT_LOGS: 'bukkapp_audit_logs_v2',
  CATEGORIES: 'bukkapp_categories_v2',
  FAVORITES: 'bukkapp_favorites_v2',
  CURRENT_USER: 'bukkapp_current_user_v2',
};

class DataStore {
  private businesses: Business[] = [...INITIAL_BUSINESSES];
  private categories: Category[] = [...INITIAL_CATEGORIES];
  private services: Service[] = [...INITIAL_SERVICES];
  private bookings: Booking[] = [...INITIAL_BOOKINGS];
  private reviews: Review[] = [...INITIAL_REVIEWS];
  private resources: Resource[] = [...INITIAL_RESOURCES];
  private blockedTimes: BlockedTime[] = [...INITIAL_BLOCKED_TIMES];
  private notifications: Notification[] = [...INITIAL_NOTIFICATIONS];
  private auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
  private favorites: string[] = ['biz-zenith-pickleball', 'biz-smile-studio'];
  private currentUser: User = DEMO_USERS[0];
  private listeners: (() => void)[] = [];

  // O(1) Index Caches
  private businessByIdCache = new Map<string, Business>();
  private businessBySlugCache = new Map<string, Business>();
  private servicesByBizCache = new Map<string, Service[]>();
  private bookingsByUserCache = new Map<string, Booking[]>();
  private bookingsByBizCache = new Map<string, Booking[]>();
  private reviewsByBizCache = new Map<string, Review[]>();

  constructor() {
    this.initStore();
    this.rebuildIndexes();
  }

  private rebuildIndexes() {
    this.businessByIdCache.clear();
    this.businessBySlugCache.clear();
    for (const b of this.businesses) {
      this.businessByIdCache.set(b.id, b);
      this.businessBySlugCache.set(b.slug, b);
    }

    this.servicesByBizCache.clear();
    for (const s of this.services) {
      const list = this.servicesByBizCache.get(s.businessId) || [];
      list.push(s);
      this.servicesByBizCache.set(s.businessId, list);
    }

    this.bookingsByUserCache.clear();
    this.bookingsByBizCache.clear();
    for (const bk of this.bookings) {
      const userList = this.bookingsByUserCache.get(bk.userId) || [];
      userList.push(bk);
      this.bookingsByUserCache.set(bk.userId, userList);

      const bizList = this.bookingsByBizCache.get(bk.businessId) || [];
      bizList.push(bk);
      this.bookingsByBizCache.set(bk.businessId, bizList);
    }

    this.reviewsByBizCache.clear();
    for (const r of this.reviews) {
      const list = this.reviewsByBizCache.get(r.businessId) || [];
      list.push(r);
      this.reviewsByBizCache.set(r.businessId, list);
    }
  }

  private initStore() {
    if (typeof window === 'undefined') {
      this.rebuildIndexes();
      return;
    }
    try {
      const storedBiz = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
      if (storedBiz) this.businesses = JSON.parse(storedBiz);
      else localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(this.businesses));

      const storedSrv = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (storedSrv) this.services = JSON.parse(storedSrv);
      else localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(this.services));

      const storedBk = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (storedBk) this.bookings = JSON.parse(storedBk);
      else localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));

      const storedRev = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (storedRev) this.reviews = JSON.parse(storedRev);
      else localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));

      const storedRes = localStorage.getItem(STORAGE_KEYS.RESOURCES);
      if (storedRes) this.resources = JSON.parse(storedRes);
      else localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(this.resources));

      const storedBlk = localStorage.getItem(STORAGE_KEYS.BLOCKED_TIMES);
      if (storedBlk) this.blockedTimes = JSON.parse(storedBlk);
      else localStorage.setItem(STORAGE_KEYS.BLOCKED_TIMES, JSON.stringify(this.blockedTimes));

      const storedNotif = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotif) this.notifications = JSON.parse(storedNotif);
      else localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));

      const storedAud = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (storedAud) this.auditLogs = JSON.parse(storedAud);
      else localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));

      const storedCat = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (storedCat) this.categories = JSON.parse(storedCat);
      else localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));

      const storedFav = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (storedFav) this.favorites = JSON.parse(storedFav);

      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedUser) this.currentUser = JSON.parse(storedUser);
    } catch (err) {
      console.warn('LocalStorage hydration error, using initial memory seed:', err);
    }
    this.rebuildIndexes();
  }

  private persist(key: string, data: any) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.error('LocalStorage write failed:', err);
      }
    }
    this.rebuildIndexes();
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // ==========================================
  // USERS
  // ==========================================
  public getUsers(): User[] {
    return DEMO_USERS;
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(user: User) {
    this.currentUser = user;
    this.persist(STORAGE_KEYS.CURRENT_USER, user);
  }

  // ==========================================
  // CATEGORIES
  // ==========================================
  public getCategories(): Category[] {
    return this.categories.filter((c) => c.active);
  }

  public getAllCategoriesAdmin(): Category[] {
    return this.categories;
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.categories.find((c) => c.slug === slug);
  }

  public addCategory(cat: Omit<Category, 'id' | 'count'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      count: 0,
    };
    this.categories.push(newCat);
    this.persist(STORAGE_KEYS.CATEGORIES, this.categories);
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>) {
    this.categories = this.categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.persist(STORAGE_KEYS.CATEGORIES, this.categories);
  }

  // ==========================================
  // BUSINESSES
  // ==========================================
  public getBusinesses(filters?: SearchFilters): Business[] {
    let result = [...this.businesses];

    // For public consumers, only show active businesses
    result = result.filter((b) => b.status === 'active' && b.active);

    if (!filters) return result;

    let resolvedFilters = { ...filters };
    if (filters.query) {
      const parsed = SearchIntentParser.parse(filters.query);
      if (parsed.confidence >= 40) {
        if (parsed.detectedCategory && !resolvedFilters.category) resolvedFilters.category = parsed.detectedCategory;
        if (parsed.detectedNeighborhood && !resolvedFilters.neighborhood) resolvedFilters.neighborhood = parsed.detectedNeighborhood;
        if (parsed.detectedMaxPrice && !resolvedFilters.maxPrice) resolvedFilters.maxPrice = parsed.detectedMaxPrice;
      }
    }

    if (resolvedFilters.category && resolvedFilters.category !== 'all') {
      result = result.filter(
        (b) =>
          b.categoryId.toLowerCase() === resolvedFilters.category?.toLowerCase() ||
          b.categoryName.toLowerCase() === resolvedFilters.category?.toLowerCase() ||
          b.slug.toLowerCase().includes(resolvedFilters.category!.toLowerCase())
      );
    }

    if (resolvedFilters.neighborhood && resolvedFilters.neighborhood !== 'All Areas') {
      result = result.filter(
        (b) => b.neighborhood.toLowerCase() === resolvedFilters.neighborhood?.toLowerCase()
      );
    }

    if (resolvedFilters.verifiedOnly) {
      result = result.filter((b) => b.verified);
    }

    if (resolvedFilters.minRating) {
      result = result.filter((b) => b.rating >= (resolvedFilters.minRating || 0));
    }

    if (resolvedFilters.maxPrice) {
      result = result.filter((b) => b.startingPrice <= (resolvedFilters.maxPrice || 999999));
    }

    if (resolvedFilters.query) {
      const q = resolvedFilters.query.toLowerCase().trim();
      result = result.filter((b) => {
        return (
          b.name.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.subcategory.toLowerCase().includes(q) ||
          b.neighborhood.toLowerCase().includes(q) ||
          b.features.some((f) => f.toLowerCase().includes(q))
        );
      });
    }

    if (resolvedFilters.sortBy === 'price_low') {
      result.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (resolvedFilters.sortBy === 'price_high') {
      result.sort((a, b) => b.startingPrice - a.startingPrice);
    } else if (resolvedFilters.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (resolvedFilters.sortBy === 'distance') {
      result.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return result;
  }

  public getAllBusinessesAdmin(): Business[] {
    return this.businesses;
  }

  public getBusinessBySlug(slug: string): Business | undefined {
    return this.businessBySlugCache.get(slug) || this.businesses.find((b) => b.slug === slug);
  }

  public getBusinessById(id: string): Business | undefined {
    return this.businessByIdCache.get(id) || this.businesses.find((b) => b.id === id);
  }

  public getBusinessByOwnerId(ownerId: string): Business | undefined {
    return this.businesses.find((b) => b.ownerId === ownerId) || this.businesses[0];
  }

  public addBusiness(biz: Omit<Business, 'id' | 'rating' | 'reviewCount' | 'createdAt' | 'updatedAt'>): Business {
    const newBiz: Business = {
      ...biz,
      id: `biz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.businesses.unshift(newBiz);
    this.persist(STORAGE_KEYS.BUSINESSES, this.businesses);

    // Audit log
    this.auditLogs.unshift(
      AdminService.createAuditLog(
        this.currentUser.id,
        this.currentUser.name,
        'business_created',
        'business',
        newBiz.id,
        { name: newBiz.name, status: newBiz.status }
      )
    );
    this.persist(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);

    return newBiz;
  }

  public updateBusinessProfile(id: string, updates: Partial<Business>): Business {
    const idx = this.businesses.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Business not found');

    const updated = {
      ...this.businesses[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.businesses[idx] = updated;
    this.persist(STORAGE_KEYS.BUSINESSES, this.businesses);
    return updated;
  }

  public updateBusinessStatus(
    id: string,
    status: BusinessStatus,
    changeRequestReason?: string,
    adminNotes?: string
  ): Business {
    const idx = this.businesses.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Business not found');

    const biz = this.businesses[idx];
    const isNowActive = status === 'active';
    const isVerified = status === 'active' ? true : biz.verified;

    const updated: Business = {
      ...biz,
      status,
      active: isNowActive,
      verified: isVerified,
      changeRequestReason: changeRequestReason || (status === 'active' ? undefined : biz.changeRequestReason),
      adminNotes: adminNotes || biz.adminNotes,
      updatedAt: new Date().toISOString(),
    };

    this.businesses[idx] = updated;
    this.persist(STORAGE_KEYS.BUSINESSES, this.businesses);

    // Notification to business owner
    if (status === 'approved' || status === 'active') {
      this.addNotification(
        biz.ownerId,
        'business_approved',
        'Your BUKKAPP Page is Live!',
        `${biz.name} has been verified and is now accepting live customer bookings.`,
        biz.id,
        '/business/dashboard'
      );
    } else if (status === 'needs_changes') {
      this.addNotification(
        biz.ownerId,
        'changes_requested',
        'Action Required on Your BUKKAPP Listing',
        changeRequestReason || 'Please review and update your business details.',
        biz.id,
        '/business/profile'
      );
    }

    // Audit Log
    this.auditLogs.unshift(
      AdminService.createAuditLog(
        this.currentUser.id,
        this.currentUser.name,
        `business_status_${status}`,
        'business',
        biz.id,
        { previousStatus: biz.status, newStatus: status, reason: changeRequestReason }
      )
    );
    this.persist(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);

    return updated;
  }

  // ==========================================
  // SERVICES
  // ==========================================
  public getServicesByBusinessId(businessId: string): Service[] {
    const cached = this.servicesByBizCache.get(businessId);
    return cached ? cached.filter((s) => s.active) : this.services.filter((s) => s.businessId === businessId && s.active);
  }

  public getAllServicesByBusinessIdAdmin(businessId: string): Service[] {
    return this.servicesByBizCache.get(businessId) || this.services.filter((s) => s.businessId === businessId);
  }

  public getServiceById(id: string): Service | undefined {
    return this.services.find((s) => s.id === id);
  }

  public addService(srv: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Service {
    const newService: Service = {
      ...srv,
      id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.services.push(newService);
    this.persist(STORAGE_KEYS.SERVICES, this.services);
    return newService;
  }

  public updateService(id: string, updates: Partial<Service>): Service {
    const idx = this.services.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Service not found');

    const updated = {
      ...this.services[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.services[idx] = updated;
    this.persist(STORAGE_KEYS.SERVICES, this.services);
    return updated;
  }

  public deleteService(id: string) {
    this.services = this.services.filter((s) => s.id !== id);
    this.persist(STORAGE_KEYS.SERVICES, this.services);
  }

  // ==========================================
  // RESOURCES & BLOCKED TIMES
  // ==========================================
  public getResourcesByBusinessId(businessId: string): Resource[] {
    return this.resources.filter((r) => r.businessId === businessId && r.active);
  }

  public addResource(res: Omit<Resource, 'id'>): Resource {
    const newRes: Resource = {
      ...res,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    this.resources.push(newRes);
    this.persist(STORAGE_KEYS.RESOURCES, this.resources);
    return newRes;
  }

  public getBlockedTimesByBusinessId(businessId: string): BlockedTime[] {
    return this.blockedTimes.filter((b) => b.businessId === businessId);
  }

  public addBlockedTime(businessId: string, startDatetime: string, endDatetime: string, reason: string): BlockedTime {
    const newBlock: BlockedTime = {
      id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      businessId,
      startDatetime,
      endDatetime,
      reason: reason.trim() || 'Temporary Closure / Blocked Schedule',
      createdAt: new Date().toISOString(),
    };
    this.blockedTimes.push(newBlock);
    this.persist(STORAGE_KEYS.BLOCKED_TIMES, this.blockedTimes);
    return newBlock;
  }

  public deleteBlockedTime(id: string) {
    this.blockedTimes = this.blockedTimes.filter((b) => b.id !== id);
    this.persist(STORAGE_KEYS.BLOCKED_TIMES, this.blockedTimes);
  }

  // ==========================================
  // BOOKINGS
  // ==========================================
  public getBookingsByUserId(userId: string): Booking[] {
    const list = this.bookingsByUserCache.get(userId) || this.bookings.filter((b) => b.userId === userId);
    return [...list].sort((a, b) => new Date(b.date + 'T' + b.startTime).getTime() - new Date(a.date + 'T' + a.startTime).getTime());
  }

  public getBookingsByUser(userId: string): Booking[] {
    return this.getBookingsByUserId(userId);
  }

  public getBookingsByBusinessId(businessId: string): Booking[] {
    const list = this.bookingsByBizCache.get(businessId) || this.bookings.filter((b) => b.businessId === businessId);
    return [...list].sort((a, b) => new Date(b.date + 'T' + b.startTime).getTime() - new Date(a.date + 'T' + a.startTime).getTime());
  }

  public getAllBookings(): Booking[] {
    return [...this.bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getBookingById(id: string): Booking | undefined {
    return this.bookings.find((b) => b.id === id || b.bookingReference === id);
  }

  public createBookingAtomically(req: Omit<CreateBookingRequest, 'existingBookings' | 'blockedTimes'>): Booking {
    const validation = BookingService.createBookingAtomically({
      ...req,
      existingBookings: this.bookings,
      blockedTimes: this.blockedTimes,
    });

    if (!validation.isValid || !validation.booking) {
      throw new Error(validation.error || 'Failed to complete booking');
    }

    const booking = validation.booking;
    this.bookings.unshift(booking);
    this.persist(STORAGE_KEYS.BOOKINGS, this.bookings);

    // Notify Business Owner
    this.addNotification(
      req.business.ownerId,
      'booking_created',
      'New Booking Received',
      `${booking.customerName} booked ${booking.serviceName} for ${booking.date} at ${booking.startTime}.`,
      req.business.id,
      '/business/bookings'
    );

    return booking;
  }

  public createBooking(req: Omit<CreateBookingRequest, 'existingBookings' | 'blockedTimes'>): Booking {
    return this.createBookingAtomically(req);
  }

  public updateBookingStatus(id: string, status: BookingStatus, cancellationReason?: string): Booking {
    const idx = this.bookings.findIndex((b) => b.id === id || b.bookingReference === id);
    if (idx === -1) throw new Error('Booking not found');

    const updated: Booking = {
      ...this.bookings[idx],
      status,
      cancellationReason: cancellationReason || this.bookings[idx].cancellationReason,
      updatedAt: new Date().toISOString(),
    };

    this.bookings[idx] = updated;
    this.persist(STORAGE_KEYS.BOOKINGS, this.bookings);

    // If cancelled, notify
    if (status === 'cancelled') {
      this.addNotification(
        updated.userId,
        'booking_cancelled',
        'Booking Cancelled',
        `Your booking (${updated.bookingReference}) for ${updated.serviceName} was cancelled.`,
        updated.businessId,
        '/account'
      );
    }

    return updated;
  }

  // ==========================================
  // REVIEWS
  // ==========================================
  public getReviewsByBusinessId(businessId: string): Review[] {
    return this.reviews.filter((r) => r.businessId === businessId && !r.isHidden);
  }

  public getAllReviewsAdmin(): Review[] {
    return this.reviews;
  }

  public addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.reviews.unshift(newRev);
    this.persist(STORAGE_KEYS.REVIEWS, this.reviews);

    // Recalculate business rating
    const bizReviews = this.reviews.filter((r) => r.businessId === review.businessId && !r.isHidden);
    const avg = bizReviews.reduce((acc, r) => acc + r.rating, 0) / bizReviews.length;
    const biz = this.getBusinessById(review.businessId);
    if (biz) {
      this.updateBusinessProfile(biz.id, {
        rating: Math.round(avg * 10) / 10,
        reviewCount: bizReviews.length,
      });

      // Notify owner
      this.addNotification(
        biz.ownerId,
        'review_posted',
        'New Customer Review',
        `${review.userName} left a ${review.rating}-star review for ${biz.name}.`,
        biz.id,
        '/business/reviews'
      );
    }

    return newRev;
  }

  public replyToReview(reviewId: string, replyComment: string) {
    const idx = this.reviews.findIndex((r) => r.id === reviewId);
    if (idx === -1) throw new Error('Review not found');

    this.reviews[idx].businessReply = {
      comment: replyComment.trim(),
      createdAt: new Date().toISOString(),
    };
    this.persist(STORAGE_KEYS.REVIEWS, this.reviews);
  }

  public toggleHideReview(reviewId: string): boolean {
    const idx = this.reviews.findIndex((r) => r.id === reviewId);
    if (idx === -1) return false;
    this.reviews[idx].isHidden = !this.reviews[idx].isHidden;
    this.persist(STORAGE_KEYS.REVIEWS, this.reviews);
    return this.reviews[idx].isHidden || false;
  }

  // ==========================================
  // NOTIFICATIONS & AUDIT LOGS
  // ==========================================
  public getNotificationsByUserId(userId: string): Notification[] {
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    businessId?: string,
    link?: string
  ): Notification {
    const notif = NotificationService.createNotification(userId, type, title, message, businessId, link);
    this.notifications.unshift(notif);
    this.persist(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    return notif;
  }

  public markNotificationRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.persist(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addAuditLog(
    actorUserId: string,
    actorName: string,
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    metadata?: Record<string, any>
  ): AuditLog {
    const log = AdminService.createAuditLog(actorUserId, actorName, action, entityType, entityId, metadata);
    this.auditLogs.unshift(log);
    this.persist(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    return log;
  }

  // ==========================================
  // CUSTOMERS
  // ==========================================
  public getCustomersByBusinessId(businessId: string): CustomerProfile[] {
    const bookings = this.getBookingsByBusinessId(businessId);
    const map = new Map<string, CustomerProfile>();

    for (const b of bookings) {
      if (!map.has(b.customerPhone)) {
        map.set(b.customerPhone, {
          id: `cust-${b.userId}`,
          userId: b.userId,
          businessId,
          name: b.customerName,
          phone: b.customerPhone,
          email: b.customerEmail,
          totalBookings: 0,
          favoriteService: b.serviceName,
          lastBookingDate: b.date,
          createdAt: b.createdAt,
        });
      }
      const existing = map.get(b.customerPhone)!;
      existing.totalBookings += 1;
      if (new Date(b.date).getTime() > new Date(existing.lastBookingDate || '').getTime()) {
        existing.lastBookingDate = b.date;
      }
    }

    return Array.from(map.values());
  }

  // ==========================================
  // FAVORITES
  // ==========================================
  public getFavorites(): Business[] {
    return this.businesses.filter((b) => this.favorites.includes(b.id));
  }

  public toggleFavorite(businessId: string): boolean {
    const idx = this.favorites.indexOf(businessId);
    let isFav = false;
    if (idx === -1) {
      this.favorites.push(businessId);
      isFav = true;
    } else {
      this.favorites.splice(idx, 1);
      isFav = false;
    }
    this.persist(STORAGE_KEYS.FAVORITES, this.favorites);
    return isFav;
  }

  public isFavorite(businessId: string): boolean {
    return this.favorites.includes(businessId);
  }
}

export const store = new DataStore();
