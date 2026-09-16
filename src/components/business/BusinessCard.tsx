'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Business } from '@/types';
import { Star, MapPin, Bookmark, ArrowRight } from 'lucide-react';
import { VerifiedBadge, AvailabilityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { store } from '@/lib/db/store';

interface BusinessCardProps {
  business: Business;
  onQuickBook?: (business: Business) => void;
  showSlots?: boolean;
}

export function BusinessCard({ business, onQuickBook }: BusinessCardProps) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(store.isFavorite(business.id));
  }, [business.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = store.toggleFavorite(business.id);
    setIsFav(newStatus);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-brand-border/90 hover:border-brand-black transition-all duration-300 shadow-subtle hover:shadow-hover hover:-translate-y-1 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Cover Image Container (16:10 Aspect Ratio) */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-100">
          <img
            src={business.coverImage}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Top Overlays */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/95 text-brand-black shadow-2xs backdrop-blur-xs">
                {business.subcategory}
              </span>
              {business.verified && <VerifiedBadge />}
            </div>

            <button
              onClick={handleToggleFavorite}
              aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
              className="pointer-events-auto w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-brand-black hover:scale-105 active:scale-95 shadow-2xs transition-all"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-brand-black text-brand-black' : 'text-neutral-600'}`} />
            </button>
          </div>

          {/* Live Availability Signature Badge in Image */}
          {business.nextAvailableSlot && (
            <div className="absolute bottom-3 left-3 pointer-events-none">
              <AvailabilityBadge text={business.nextAvailableSlot} />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-2">
          {/* Header row: Title & Rating */}
          <div className="flex items-start justify-between gap-2">
            <Link href={`/business/${business.slug}`} className="focus:outline-hidden">
              <h3 className="font-extrabold text-base sm:text-lg text-brand-black group-hover:text-neutral-900 line-clamp-1 tracking-tight">
                {business.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1 shrink-0 bg-brand-surface-alt px-2 py-0.5 rounded-md border border-brand-border/60">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-brand-black">{business.rating}</span>
              <span className="text-[10px] text-neutral-400">({business.reviewCount})</span>
            </div>
          </div>

          {/* Subtitle / Tagline */}
          <p className="text-xs text-brand-secondary line-clamp-1">
            {business.tagline || business.description}
          </p>

          {/* Location & Distance */}
          <div className="flex items-center gap-2 text-xs text-brand-muted pt-1">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="truncate">{business.neighborhood}</span>
            {business.distanceKm !== undefined && (
              <>
                <span>•</span>
                <span>{business.distanceKm} km away</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer / High-Contrast CTA Bar */}
      <div className="px-4 sm:p-5 pb-4 pt-3 border-t border-brand-border/70 flex items-center justify-between gap-3 bg-white">
        <div>
          <span className="text-[10px] text-brand-muted block uppercase tracking-wider font-bold">
            From
          </span>
          <span className="font-display text-sm sm:text-base font-bold text-brand-black tracking-tight">
            {formatPrice(business.startingPrice)}
          </span>
        </div>

        <Link href={`/business/${business.slug}`}>
          <Button variant="primary" size="sm" className="font-bold text-xs rounded-xl px-4 py-2 bg-brand-black hover:bg-neutral-800 text-white">
            <span>Book now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
