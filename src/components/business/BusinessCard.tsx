'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Business } from '@/types';
import { MapPin, Bookmark, ArrowRight } from 'lucide-react';
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

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = store.toggleFavorite(business.id);
    setIsFav(newStatus);
  };

  return (
    <div className="group bg-white rounded-2xl border border-brand-border/90 hover:border-brand-black transition-all duration-300 shadow-subtle hover:shadow-card overflow-hidden flex flex-col justify-between">
      {/* Top Media & Tags */}
      <div>
        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
          <img
            src={business.coverImage}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 backdrop-blur-xs text-brand-black border border-neutral-200/80 shadow-2xs">
              {business.subcategory}
            </span>

            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full pointer-events-auto transition-all shadow-2xs ${
                isFav
                  ? 'bg-brand-lime text-brand-black shadow-lime scale-110'
                  : 'bg-white/90 text-neutral-500 hover:text-brand-black hover:bg-white'
              }`}
              aria-label={isFav ? 'Remove from saved' : 'Save business'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-brand-black' : ''}`} />
            </button>
          </div>

          {/* Real-Time Live Status Pill */}
          <div className="absolute bottom-3 left-3">
            <AvailabilityBadge text="Open Today" isAvailable={true} />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-2">
          {/* Header & Rating */}
          <div className="flex items-start justify-between gap-2">
            <Link href={`/business/${business.slug}`} className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {business.verified && <VerifiedBadge />}
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-brand-black group-hover:text-neutral-900 line-clamp-1 tracking-tight">
                {business.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 shrink-0 bg-neutral-100/90 px-2.5 py-1 rounded-lg border border-neutral-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs font-black text-brand-black">{business.rating}</span>
              <span className="text-[10px] text-neutral-400 font-semibold">({business.reviewCount})</span>
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
