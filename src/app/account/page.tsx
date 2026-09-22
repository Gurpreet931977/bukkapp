'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Booking, Business, Review } from '@/types';
import { store } from '@/lib/db/store';
import { formatPrice, formatTime24to12, formatDatePretty, buildDirectionsUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  RotateCw,
  MessageSquare,
  Navigation,
  Bookmark,
  User,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';

function AccountContent() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(store.getCurrentUser());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Business[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'favorites'>('upcoming');

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const refreshData = () => {
    const currentUser = store.getCurrentUser();
    setUser(currentUser);
    setBookings(store.getBookingsByUser(currentUser.id));
    setFavorites(store.getFavorites());
  };

  useEffect(() => {
    refreshData();
    const unsub = store.subscribe(() => refreshData());
    return unsub;
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'upcoming' || tabParam === 'past' || tabParam === 'favorites') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'upcoming' | 'past' | 'favorites') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/account?tab=${tab}`);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingBookings = bookings.filter((b) => b.date >= todayStr && b.status !== 'cancelled');
  const pastBookings = bookings.filter((b) => b.date < todayStr || b.status === 'cancelled' || b.status === 'completed');

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      store.updateBookingStatus(bookingId, 'cancelled');
      setBookings(store.getBookingsByUser(user.id));
    }
  };

  const handleOpenReviewModal = (b: Booking) => {
    setReviewBooking(b);
    setReviewRating(5);
    setReviewComment('');
    setReviewSuccess(false);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking || !reviewComment.trim()) return;

    store.addReview({
      userId: user.id,
      userName: user.name,
      businessId: reviewBooking.businessId,
      bookingId: reviewBooking.id,
      rating: reviewRating,
      comment: reviewComment.trim(),
      serviceName: reviewBooking.serviceName,
    });
    setReviewSuccess(true);
    setTimeout(() => {
      setIsReviewModalOpen(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen py-10 bg-[#FAFAF8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Welcome Banner */}
        <div className="bg-white rounded-3xl border border-brand-border/80 p-6 sm:p-8 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-black text-white flex items-center justify-center text-xl font-bold overflow-hidden shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-brand-black tracking-tight">{user.name}</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-lime text-brand-black">
                  Customer
                </span>
              </div>
              <p className="text-xs text-brand-secondary mt-1">
                {user.email} • {user.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/search">
              <Button variant="accent" size="sm" className="font-bold text-xs">
                <span>Book New Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-brand-border/80 pb-3">
          <button
            onClick={() => handleTabChange('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-brand-black text-white shadow-xs'
                : 'bg-white text-brand-secondary hover:text-brand-black border border-brand-border'
            }`}
          >
            Upcoming Appointments ({upcomingBookings.length})
          </button>
          <button
            onClick={() => handleTabChange('past')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'past'
                ? 'bg-brand-black text-white shadow-xs'
                : 'bg-white text-brand-secondary hover:text-brand-black border border-brand-border'
            }`}
          >
            Past History ({pastBookings.length})
          </button>
          <button
            onClick={() => handleTabChange('favorites')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-brand-black text-white shadow-xs'
                : 'bg-white text-brand-secondary hover:text-brand-black border border-brand-border'
            }`}
          >
            Saved Businesses ({favorites.length})
          </button>
        </div>

        {/* TAB 1: UPCOMING BOOKINGS */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl border border-brand-border/80 p-6 shadow-subtle space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                            Ref: {b.bookingReference}
                          </span>
                          <Link href={`/business/${b.businessSlug}`} className="text-base font-bold text-brand-black hover:underline">
                            {b.businessName}
                          </Link>
                        </div>
                        <span className="text-xs font-black text-brand-black bg-brand-surface-alt px-2.5 py-1 rounded-lg border border-brand-border">
                          {formatPrice(b.servicePrice)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-brand-surface-alt border border-brand-border/60 space-y-1.5 text-xs">
                        <p className="font-bold text-brand-black">{b.serviceName}</p>
                        <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDatePretty(b.date)} at {formatTime24to12(b.startTime)}</span>
                        </p>
                        <p className="text-brand-secondary flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{b.businessAddress}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between gap-2">
                      <Link href={`/booking/${b.id}`}>
                        <Button variant="outline" size="sm" className="text-xs font-bold">
                          View Ticket
                        </Button>
                      </Link>

                      <div className="flex items-center gap-2">
                        <a
                          href={buildDirectionsUrl(b.businessAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="text-xs font-semibold gap-1">
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Directions</span>
                          </Button>
                        </a>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelBooking(b.id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-brand-border/80 p-6">
                <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-brand-black">No upcoming appointments</h3>
                <p className="text-xs text-brand-secondary mt-1">Explore top-rated services in Dehradun and book your first spot.</p>
                <Link href="/search" className="inline-block mt-4">
                  <Button variant="primary" size="sm">Explore Available Services</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PAST BOOKINGS */}
        {activeTab === 'past' && (
          <div className="space-y-4">
            {pastBookings.length > 0 ? (
              <div className="space-y-3">
                {pastBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl border border-brand-border/80 p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-brand-black">{b.businessName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.status === 'cancelled'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {b.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                        </span>
                      </div>
                      <p className="text-xs text-brand-secondary">
                        {b.serviceName} • {formatDatePretty(b.date)} ({formatTime24to12(b.startTime)})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {b.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReviewModal(b)}
                          className="text-xs font-bold gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Leave Review</span>
                        </Button>
                      )}

                      <Link href={`/book/${b.businessSlug}/${b.serviceId}`}>
                        <Button variant="primary" size="sm" className="text-xs font-bold gap-1">
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Rebook</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-brand-border p-6 text-xs text-brand-secondary">
                No past booking records found.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FAVORITES */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((biz) => (
                  <div
                    key={biz.id}
                    className="bg-white rounded-2xl border border-brand-border/80 p-5 shadow-subtle space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={biz.coverImage}
                        alt={biz.name}
                        className="w-16 h-16 rounded-xl object-cover border border-brand-border shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                          {biz.subcategory}
                        </span>
                        <Link href={`/business/${biz.slug}`}>
                          <h3 className="font-bold text-sm text-brand-black truncate hover:underline">
                            {biz.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-brand-secondary flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-neutral-400" />
                          <span className="truncate">{biz.neighborhood}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-black">From {formatPrice(biz.startingPrice)}</span>
                      <Link href={`/business/${biz.slug}`}>
                        <Button variant="accent" size="sm" className="text-xs font-bold">
                          View & Book
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-brand-border p-6 text-xs text-brand-secondary">
                You have not saved any businesses yet. Click the bookmark icon on any business card to save it.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Leave a Verified Review"
        description={reviewBooking ? `For ${reviewBooking.serviceName} at ${reviewBooking.businessName}` : ''}
        maxWidth="md"
      >
        {reviewSuccess ? (
          <div className="text-center py-8 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-brand-black">Review Published!</h3>
            <p className="text-xs text-brand-secondary">Thank you for helping the Dehradun community discover great services.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-black">
                  Rating Score
                </label>
                <span className="text-xs font-black text-brand-black">
                  {reviewRating === 5
                    ? '5.0 · Exceptional'
                    : reviewRating === 4
                    ? '4.0 · Very Good'
                    : reviewRating === 3
                    ? '3.0 · Average'
                    : reviewRating === 2
                    ? '2.0 · Mediocre'
                    : '1.0 · Poor'}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setReviewRating(score)}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border cursor-pointer ${
                      score === reviewRating
                        ? 'bg-brand-black text-white border-brand-black shadow-2xs scale-102'
                        : score < reviewRating
                        ? 'bg-brand-lime/20 text-brand-black border-brand-lime/40'
                        : 'bg-brand-surface-alt text-neutral-500 border-brand-border hover:border-neutral-400'
                    }`}
                  >
                    <span>{score}.0</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-black block mb-1">
                Your Feedback
              </label>
              <textarea
                required
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How was the service, timing, and overall experience?"
                className="w-full p-3 text-xs rounded-xl bg-brand-surface-alt border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Verified Review
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-16 text-center text-xs text-brand-secondary font-bold">Loading Account...</div>}>
      <AuthGuard allowedRoles={['customer', 'business_owner', 'admin']}>
        <AccountContent />
      </AuthGuard>
    </Suspense>
  );
}
