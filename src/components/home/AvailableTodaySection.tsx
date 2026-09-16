'use client';

import React from 'react';
import Link from 'next/link';
import { Business } from '@/types';
import { Clock, Star, ArrowRight, Zap } from 'lucide-react';
import { VerifiedBadge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

interface AvailableTodaySectionProps {
  businesses: Business[];
}

export function AvailableTodaySection({ businesses }: AvailableTodaySectionProps) {
  const todaySlotsMap: Record<string, string[]> = {
    'biz-smile-studio': ['6:30 PM', '7:15 PM', '8:00 PM'],
    'biz-the-groom-room': ['5:45 PM', '6:30 PM', '7:15 PM'],
    'biz-smashzone-turf': ['7:00 PM', '8:00 PM', '9:00 PM'],
    'biz-quickcool-ac': ['5:30 PM', '6:30 PM'],
    'biz-motogloss-detailing': ['5:00 PM', '6:30 PM'],
    'biz-blush-and-glow': ['6:00 PM', '7:00 PM', '8:00 PM'],
  };

  const availableBiz = businesses.filter((b) => todaySlotsMap[b.id]);

  return (
    <section className="py-16 bg-[#F3F3EF] border-y border-brand-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-black bg-brand-lime px-2.5 py-0.5 rounded-full mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-black animate-pulse" />
              <span>Real-Time Availability</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
              Available Today in Dehradun
            </h2>
            <p className="text-xs sm:text-sm text-brand-secondary mt-1">
              Confirmed open appointments you can lock in right now without waiting
            </p>
          </div>

          <Link
            href="/search?date=today"
            className="text-xs font-bold text-brand-black hover:text-neutral-600 flex items-center gap-1 group shrink-0"
          >
            <span>See all today&apos;s slots</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {availableBiz.slice(0, 6).map((biz) => {
            const slots = todaySlotsMap[biz.id] || ['6:00 PM', '7:00 PM'];
            return (
              <div
                key={biz.id}
                className="bg-white rounded-2xl p-5 border border-brand-border/90 hover:border-brand-black transition-all shadow-subtle hover:shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <img
                      src={biz.coverImage}
                      alt={biz.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-brand-border"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                          {biz.subcategory}
                        </span>
                        {biz.verified && <VerifiedBadge />}
                      </div>
                      <Link href={`/business/${biz.slug}`}>
                        <h3 className="font-bold text-sm sm:text-base text-brand-black truncate hover:underline">
                          {biz.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-xs text-brand-secondary">
                        <span className="flex items-center gap-0.5 font-bold text-brand-black">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {biz.rating}
                        </span>
                        <span>•</span>
                        <span className="truncate">{biz.neighborhood}</span>
                      </div>
                    </div>
                  </div>

                  {/* Discrete Slot Chips */}
                  <div className="mt-4 pt-3 border-t border-brand-border/60">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>Instant Open Slots Today:</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {slots.map((slot) => (
                        <Link
                          key={slot}
                          href={`/business/${biz.slug}`}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-brand-surface-alt hover:bg-brand-lime hover:text-brand-black text-brand-black border border-brand-border transition-all flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>{slot}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-brand-border/50 flex items-center justify-between text-xs">
                  <span className="text-brand-secondary font-medium">
                    From <strong className="text-brand-black font-extrabold">{formatPrice(biz.startingPrice)}</strong>
                  </span>
                  <Link
                    href={`/business/${biz.slug}`}
                    className="font-bold text-brand-black hover:text-neutral-600 flex items-center gap-1"
                  >
                    <span>Choose service</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
