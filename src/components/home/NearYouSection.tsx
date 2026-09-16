'use client';

import React, { useState } from 'react';
import { Business } from '@/types';
import { BusinessCard } from '@/components/business/BusinessCard';
import { DEHRADUN_NEIGHBORHOODS } from '@/lib/seed/data';

interface NearYouSectionProps {
  businesses: Business[];
}

export function NearYouSection({ businesses }: NearYouSectionProps) {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All Areas');

  const filtered = businesses.filter((b) => {
    if (selectedNeighborhood === 'All Areas') return true;
    return b.neighborhood.toLowerCase() === selectedNeighborhood.toLowerCase();
  });

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#FAFAF8]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-muted block mb-1">
            Local Curation
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
            Book Near You
          </h2>
          <p className="text-xs sm:text-sm text-brand-secondary mt-1">
            Verified local clinics, barbers, courts, and technicians near your area
          </p>
        </div>
      </div>

      {/* Neighborhood Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {DEHRADUN_NEIGHBORHOODS.slice(0, 8).map((hood) => {
          const isSelected = selectedNeighborhood === hood;
          return (
            <button
              key={hood}
              onClick={() => setSelectedNeighborhood(hood)}
              className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-all select-none ${
                isSelected
                  ? 'bg-brand-black text-white shadow-2xs'
                  : 'bg-white border border-brand-border text-brand-secondary hover:text-brand-black hover:border-neutral-400'
              }`}
            >
              {hood}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((biz) => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-brand-border p-6">
          <p className="text-sm font-bold text-brand-black">No businesses found in {selectedNeighborhood}</p>
          <p className="text-xs text-brand-secondary mt-1">Try selecting &ldquo;All Areas&rdquo; or explore other neighborhoods.</p>
          <button
            onClick={() => setSelectedNeighborhood('All Areas')}
            className="mt-4 text-xs font-bold px-4 py-2 rounded-xl bg-brand-black text-white"
          >
            Show All Areas
          </button>
        </div>
      )}
    </section>
  );
}
