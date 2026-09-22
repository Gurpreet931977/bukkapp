'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Business, Service, Review } from '@/types';
import { store } from '@/lib/db/store';
import { formatPrice, buildDirectionsUrl } from '@/lib/utils';
import { VerifiedBadge, AvailabilityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookingFlowModal } from '@/components/booking/BookingFlowModal';
import { BusinessCard } from '@/components/business/BusinessCard';
import {
  MapPin,
  Clock,
  Navigation,
  CheckCircle2,
  Share2,
  Bookmark,
  ArrowLeft,
} from 'lucide-react';

const LeafletMap = dynamic(
  () => import('@/components/map/LeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[220px] bg-brand-surface-alt rounded-2xl flex items-center justify-center text-xs text-brand-secondary font-bold border border-brand-border">
        Loading location map...
      </div>
    ),
  }
);

export default function BusinessProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarBusinesses, setSimilarBusinesses] = useState<Business[]>([]);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const biz = store.getBusinessBySlug(slug);
    if (biz) {
      setBusiness(biz);
      setServices(store.getServicesByBusinessId(biz.id));
      setReviews(store.getReviewsByBusinessId(biz.id));
      setIsFavorite(store.isFavorite(biz.id));

      const similar = store
        .getBusinesses({ category: biz.categoryId })
        .filter((b) => b.id !== biz.id)
        .slice(0, 3);
      setSimilarBusinesses(similar);
    }
  }, [slug]);

  if (!business) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-brand-black">Business Not Found</h2>
        <p className="text-xs text-brand-secondary">We could not find the business you are looking for.</p>
        <Link href="/search">
          <Button variant="primary" size="md">Browse All Businesses</Button>
        </Link>
      </div>
    );
  }

  const handleStartBooking = (service?: Service) => {
    setSelectedServiceForBooking(service || (services.length > 0 ? services[0] : null));
    setIsBookingModalOpen(true);
  };

  const handleToggleFavorite = () => {
    const status = store.toggleFavorite(business.id);
    setIsFavorite(status);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-[#FAFAF8]">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-brand-border py-3 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Search</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-full border border-brand-border bg-white hover:bg-brand-surface-alt text-xs font-bold text-brand-black flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full border transition-all shadow-2xs ${
                isFavorite
                  ? 'bg-brand-black text-brand-lime border-brand-black'
                  : 'bg-white text-brand-black border-brand-border hover:bg-brand-surface-alt'
              }`}
              aria-label="Save to favorites"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStartBooking()}
              className="hidden sm:inline-flex font-bold text-xs px-4 bg-brand-black text-white"
            >
              Book appointment
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Editorial Photo Gallery Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden max-h-[420px] bg-neutral-100 border border-brand-border">
          <div className="md:col-span-2 relative h-64 md:h-[420px]">
            <img
              src={business.coverImage}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:flex flex-col gap-3 h-[420px]">
            {business.gallery.slice(0, 2).map((img, i) => (
              <div key={i} className="relative h-[204px] overflow-hidden rounded-xl">
                <img
                  src={img}
                  alt={`${business.name} view ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Header Information Strip */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 sm:p-8 shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-surface-alt text-brand-black">
                {business.subcategory}
              </span>
              {business.verified && <VerifiedBadge text="Verified Merchant" />}
              {business.nextAvailableSlot && (
                <AvailabilityBadge text={business.nextAvailableSlot} />
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-brand-black tracking-tight">
              {business.name}
            </h1>

            <p className="text-xs sm:text-sm text-brand-secondary max-w-2xl leading-relaxed">
              {business.tagline}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-brand-muted">
              <div className="flex items-center gap-1.5 font-bold text-brand-black bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{business.rating}</span>
                <span className="text-neutral-400 font-normal">({business.reviewCount} reviews)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>{business.address}, {business.neighborhood}</span>
              </div>
              {business.distanceKm !== undefined && (
                <>
                  <span>•</span>
                  <span>{business.distanceKm} km from center</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-brand-border/60">
            <div>
              <span className="text-[10px] text-brand-muted uppercase tracking-wider block font-bold">Starting from</span>
              <span className="text-2xl font-black text-brand-black">{formatPrice(business.startingPrice)}</span>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleStartBooking()}
              className="w-full sm:w-auto font-black px-8 bg-brand-black text-white hover:bg-neutral-800"
            >
              <span>Instant Book</span>
            </Button>
          </div>
        </div>

        {/* Main Details & Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Cols: Services, About, Reviews */}
          <div className="lg:col-span-8 space-y-10">
            {/* Services Section */}
            <div id="services" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-brand-black tracking-tight">
                  Bookable Services & Rates ({services.length})
                </h2>
                <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Fixed rate guarantee</span>
              </div>

              <div className="space-y-3">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-5 rounded-2xl bg-white border border-brand-border hover:border-brand-black transition-all shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-lg">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-extrabold text-brand-black tracking-tight">{srv.name}</h3>
                        {srv.originalPrice && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Save {Math.round(((srv.originalPrice - srv.price) / srv.originalPrice) * 100)}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-brand-secondary leading-relaxed">
                        {srv.description}
                      </p>
                      <div className="pt-1 flex items-center gap-3 text-xs text-brand-muted">
                        <span className="flex items-center gap-1 font-semibold text-brand-black">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          {srv.durationMinutes} mins
                        </span>
                        {srv.category && <span>• {srv.category}</span>}
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-border/60">
                      <div className="text-right">
                        <span className="text-base font-black text-brand-black block">
                          {formatPrice(srv.price)}
                        </span>
                        {srv.originalPrice && (
                          <span className="text-xs text-neutral-400 line-through block">
                            {formatPrice(srv.originalPrice)}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStartBooking(srv)}
                        className="font-bold text-xs px-4 bg-brand-black text-white"
                      >
                        Book slot
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* About & Amenities */}
            <div className="bg-white rounded-2xl border border-brand-border p-6 sm:p-8 space-y-6 shadow-subtle">
              <h2 className="text-xl font-black text-brand-black tracking-tight">About {business.name}</h2>
              <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">{business.description}</p>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">
                  Facility Highlights & Standards
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {business.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs font-semibold text-brand-black">
                      <CheckCircle2 className="w-4 h-4 text-brand-black shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="bg-white rounded-2xl border border-brand-border p-6 sm:p-8 space-y-6 shadow-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-brand-black tracking-tight">
                    Verified Customer Reviews
                  </h2>
                  <p className="text-xs text-brand-secondary mt-0.5">
                    Reviews from customers who completed bookings through BUKKAPP
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-black text-brand-black">{business.rating}</span>
                  <span className="text-xs text-neutral-400 font-medium">/ 5.0</span>
                </div>
              </div>

              <div className="space-y-4 divide-y divide-brand-border/60">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-black text-white font-bold text-xs flex items-center justify-center">
                          {rev.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-brand-black">{rev.userName}</p>
                          {rev.serviceName && (
                            <p className="text-[10px] text-brand-muted font-medium">Booked: {rev.serviceName}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-bold text-brand-black">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-brand-secondary leading-relaxed">{rev.comment}</p>

                    {rev.businessReply && (
                      <div className="mt-2 p-3 rounded-xl bg-brand-surface-alt border border-brand-border text-xs space-y-1">
                        <p className="font-bold text-brand-black text-[10px] uppercase tracking-wider">
                          Official Reply from {business.name}:
                        </p>
                        <p className="text-brand-secondary">{rev.businessReply.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Location Map & Schedule Sidebar */}
          <div className="lg:col-span-4 space-y-6 sticky top-32">
            {/* Quick Action Card */}
            <div className="bg-brand-black text-white rounded-2xl p-6 shadow-card space-y-4 border border-neutral-800">
              <div>
                <span className="text-[11px] text-brand-lime font-bold uppercase tracking-wider">Fast instant checkout</span>
                <h3 className="text-xl font-black text-white mt-1">Ready to book?</h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Choose from {services.length} verified services with live slot confirmation.
              </p>
              <Button
                variant="accent"
                size="lg"
                onClick={() => handleStartBooking()}
                className="w-full font-black text-brand-black bg-brand-lime hover:bg-brand-lime-dark"
              >
                <span>Select service & slot</span>
              </Button>
            </div>

            {/* Operating Hours Card */}
            <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-4">
              <h3 className="text-xs font-black text-brand-black uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-500" />
                <span>Operating Hours</span>
              </h3>

              <div className="space-y-2 text-xs">
                {business.schedule.map((day) => (
                  <div key={day.dayName} className="flex items-center justify-between py-1 border-b border-brand-border/40 last:border-0">
                    <span className="font-bold text-brand-black w-10">{day.dayName}</span>
                    <span className={day.isOpen ? 'text-brand-black font-semibold' : 'text-neutral-400 font-medium'}>
                      {day.isOpen ? `${day.openTime} to ${day.closeTime}` : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Map Card */}
            <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-4">
              <h3 className="text-xs font-black text-brand-black uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span>Location & Map</span>
              </h3>

              <p className="text-xs text-brand-secondary">
                {business.address}, {business.neighborhood}, {business.city}, Uttarakhand {business.postalCode}
              </p>

              <LeafletMap
                businesses={[business]}
                selectedBusinessId={business.id}
                center={[business.latitude, business.longitude]}
                zoom={14}
                className="h-[220px] w-full"
              />

              <a
                href={buildDirectionsUrl(business.address, business.latitude, business.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" size="sm" className="w-full justify-center text-xs font-bold gap-1.5 py-2.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions in Google Maps</span>
                </Button>
              </a>
            </div>

            {/* Claim this business widget */}
            <div className="p-5 rounded-2xl bg-brand-surface-alt border border-brand-border text-center space-y-2">
              <p className="text-xs font-bold text-brand-black">Are you the owner of this business?</p>
              <p className="text-[11px] text-brand-secondary">
                Claim your official page to manage services, live working hours, and customer bookings.
              </p>
              <Link href={`/claim/${business.slug}`} className="inline-block pt-1">
                <span className="text-xs font-bold text-brand-black underline hover:text-neutral-600">
                  Claim this business listing
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Similar Businesses Strip */}
        {similarBusinesses.length > 0 && (
          <div className="pt-12 border-t border-brand-border space-y-6">
            <h2 className="text-xl font-black text-brand-black tracking-tight">
              Similar Verified Spots in Dehradun
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarBusinesses.map((simBiz) => (
                <BusinessCard key={simBiz.id} business={simBiz} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Booking Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden px-4 py-3 bg-white/95 backdrop-blur-md border-t border-brand-border shadow-modal flex items-center justify-between gap-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <div className="min-w-0">
          <span className="text-[10px] text-brand-muted block uppercase tracking-wider font-bold truncate">Starting from</span>
          <span className="text-base font-black text-brand-black">{formatPrice(business.startingPrice)}</span>
        </div>
        <Button
          variant="accent"
          size="md"
          onClick={() => handleStartBooking()}
          className="font-black text-xs px-5 py-2.5 bg-brand-lime text-brand-black btn-press shrink-0 shadow-xs"
        >
          <span>Select Service & Slot</span>
        </Button>
      </div>

      {/* Booking Flow Modal */}
      <BookingFlowModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        business={business}
        selectedService={selectedServiceForBooking}
      />
    </div>
  );
}
