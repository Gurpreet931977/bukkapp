'use client';

import React, { useState, useEffect } from 'react';
import { SearchFilters } from '@/types';
import { INITIAL_CATEGORIES, DEHRADUN_NEIGHBORHOODS } from '@/lib/seed/data';
import { Filter, Check, SlidersHorizontal, RotateCcw, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useBottomSheetDrag } from '@/hooks/useBottomSheetDrag';

interface FilterBarProps {
  filters: SearchFilters;
  onChange: (newFilters: SearchFilters) => void;
  onReset: () => void;
  resultCount: number;
}

export function FilterBar({ filters, onChange, onReset, resultCount }: FilterBarProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const {
    sheetRef: filterSheetRef,
    backdropRef: filterBackdropRef,
    dragHandleProps: filterDragHandleProps,
    dismissWithAnimation: dismissFilterDrawer,
  } = useBottomSheetDrag({
    onClose: () => setIsMobileDrawerOpen(false),
    isOpen: isMobileDrawerOpen,
  });

  // Lock body scroll and prevent Lenis hijacking when mobile filter drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }
    } else {
      document.body.style.overflow = 'unset';
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
    };
  }, [isMobileDrawerOpen]);

  const categories = [{ id: 'all', name: 'All Categories' }, ...INITIAL_CATEGORIES];

  const timePeriods: { label: string; value: SearchFilters['timePeriod'] }[] = [
    { label: 'Any Time', value: undefined },
    { label: 'Morning (Before 12 PM)', value: 'morning' },
    { label: 'Afternoon (12 PM - 5 PM)', value: 'afternoon' },
    { label: 'Evening (After 5 PM)', value: 'evening' },
  ];

  const sortOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Highest Rated', value: 'highest_rated' },
    { label: 'Lowest Price', value: 'lowest_price' },
    { label: 'Nearest to You', value: 'nearest' },
  ];

  const handleCategoryChange = (catId: string) => {
    onChange({ ...filters, category: catId === 'all' ? undefined : catId });
  };

  const handleNeighborhoodChange = (neighborhood: string) => {
    onChange({ ...filters, neighborhood: neighborhood === 'All Areas' ? undefined : neighborhood });
  };

  const handleVerifiedToggle = () => {
    onChange({ ...filters, verifiedOnly: !filters.verifiedOnly });
  };

  const handleSortChange = (sortBy: SearchFilters['sortBy']) => {
    onChange({ ...filters, sortBy });
  };

  const activeFilterCount = [
    Boolean(filters.category),
    Boolean(filters.neighborhood),
    Boolean(filters.verifiedOnly),
    Boolean(filters.timePeriod),
    Boolean(filters.maxPrice),
    Boolean(filters.date),
  ].filter(Boolean).length;

  return (
    <>
      <div className="bg-white rounded-2xl border border-brand-border/80 p-3.5 sm:p-5 shadow-subtle space-y-3 sm:space-y-4">
        {/* Top Filter Controls: Horizontal Scrollable Category Pills */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex-1 min-w-0 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
            <div className="flex items-center gap-2 w-max">
              {categories.map((cat) => {
                const isSelected = (!filters.category && cat.id === 'all') || filters.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer select-none tap-target ${
                      isSelected
                        ? 'bg-brand-black text-white shadow-xs font-bold'
                        : 'bg-brand-surface-alt hover:bg-[#EAEAE4] text-brand-secondary hover:text-brand-black'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Filter Sheet Trigger Button */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-black text-white text-xs font-bold shrink-0 tap-target shadow-subtle"
            aria-label="Open search filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-lime text-brand-black text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Filter Controls Grid */}
        <div className="hidden sm:grid pt-3 border-t border-brand-border/60 grid-cols-2 md:grid-cols-4 gap-3">
          {/* Neighborhood Selector */}
          <div>
            <CustomSelect
              label="Neighborhood"
              value={filters.neighborhood || 'All Areas'}
              onChange={handleNeighborhoodChange}
              options={DEHRADUN_NEIGHBORHOODS}
              searchable
            />
          </div>

          {/* Time of Day */}
          <div>
            <CustomSelect
              label="Time Slot"
              value={filters.timePeriod || ''}
              onChange={(val) => onChange({ ...filters, timePeriod: (val || undefined) as any })}
              options={timePeriods.map((tp) => ({ label: tp.label, value: tp.value || '' }))}
            />
          </div>

          {/* Sort By */}
          <div>
            <CustomSelect
              label="Sort Order"
              value={filters.sortBy || 'recommended'}
              onChange={(val) => handleSortChange(val as any)}
              options={sortOptions.map((opt) => ({ label: opt.label, value: opt.value }))}
            />
          </div>

          {/* Verified Only Toggle */}
          <div className="flex items-end">
            <button
              onClick={handleVerifiedToggle}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                filters.verifiedOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-brand-surface-alt text-brand-secondary border-brand-border hover:bg-[#EBEBE5]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                  filters.verifiedOnly ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-neutral-300 bg-white'
                }`}
              >
                {filters.verifiedOnly && <Check className="w-3 h-3" />}
              </span>
              <span>Verified Only</span>
            </button>
          </div>
        </div>

        {/* Reset button if active */}
        {activeFilterCount > 0 && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={onReset}
              className="text-xs font-bold text-neutral-500 hover:text-brand-black flex items-center gap-1 shrink-0 px-2 py-1 rounded-md hover:bg-brand-surface-alt"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* MOBILE FILTER BOTTOM SHEET / DRAWER */}
      {isMobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-lenis-prevent
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs sm:hidden overscroll-contain"
        >
          <div
            ref={filterBackdropRef}
            className="absolute inset-0 transition-opacity"
            onClick={dismissFilterDrawer}
          />

          <div
            ref={filterSheetRef}
            data-lenis-prevent
            className="relative w-full max-h-[85vh] bg-white rounded-t-3xl border-t border-brand-border flex flex-col shadow-modal animate-slide-up overflow-hidden overscroll-contain will-change-transform"
          >
            {/* Mobile Pull / Drag Indicator */}
            <div
              {...filterDragHandleProps}
              className="w-full flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none group touch-none shrink-0"
              role="button"
              tabIndex={0}
              aria-label="Drag down or tap to close"
              title="Drag down or tap to close"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  dismissFilterDrawer();
                }
              }}
            >
              <div className="w-12 h-1.5 rounded-full bg-neutral-300 group-hover:bg-neutral-400 group-active:bg-neutral-500 transition-colors" />
            </div>

            {/* Drawer Header */}
            <div
              {...filterDragHandleProps}
              className="px-4 py-2.5 border-b border-brand-border/70 flex items-center justify-between cursor-grab active:cursor-grabbing select-none touch-none"
            >
              <div className="flex items-center gap-2 pointer-events-none">
                <SlidersHorizontal className="w-4 h-4 text-brand-black" />
                <h3 className="font-extrabold text-base text-brand-black">Filters & Sorting</h3>
                {activeFilterCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-lime text-brand-black">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissFilterDrawer();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-full bg-brand-surface-alt flex items-center justify-center text-neutral-500 hover:text-brand-black tap-target cursor-pointer pointer-events-auto"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body Scrollable */}
            <div data-lenis-prevent className="p-5 overflow-y-auto overscroll-contain space-y-5 custom-scrollbar">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted block">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isSelected = (!filters.category && cat.id === 'all') || filters.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`text-xs font-bold p-2.5 rounded-xl border text-left truncate transition-all ${
                          isSelected
                            ? 'bg-brand-black text-white border-brand-black'
                            : 'bg-brand-surface-alt text-brand-black border-brand-border'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Neighborhood */}
              <div className="space-y-1.5">
                <CustomSelect
                  label="Neighborhood (Dehradun)"
                  value={filters.neighborhood || 'All Areas'}
                  onChange={handleNeighborhoodChange}
                  options={DEHRADUN_NEIGHBORHOODS}
                  searchable
                  size="lg"
                />
              </div>

              {/* Time of Day */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted block">
                  Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {timePeriods.map((tp) => {
                    const isSelected = filters.timePeriod === tp.value || (!filters.timePeriod && tp.value === undefined);
                    return (
                      <button
                        key={tp.label}
                        onClick={() => onChange({ ...filters, timePeriod: tp.value })}
                        className={`text-xs font-bold p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-brand-black text-white border-brand-black'
                            : 'bg-brand-surface-alt text-brand-black border-brand-border'
                        }`}
                      >
                        {tp.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted block">
                  Sort By
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {sortOptions.map((opt) => {
                    const isSelected = (filters.sortBy || 'recommended') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSortChange(opt.value as any)}
                        className={`text-xs font-bold p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-brand-black text-white border-brand-black'
                            : 'bg-brand-surface-alt text-brand-black border-brand-border'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Verified Filter */}
              <div className="pt-2">
                <button
                  onClick={handleVerifiedToggle}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold border transition-all ${
                    filters.verifiedOnly
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-brand-surface-alt text-brand-secondary border-brand-border'
                  }`}
                >
                  <span>Verified Spots Only</span>
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      filters.verifiedOnly ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-neutral-300 bg-white'
                    }`}
                  >
                    {filters.verifiedOnly && <Check className="w-3.5 h-3.5" />}
                  </span>
                </button>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 border-t border-brand-border/70 bg-white flex items-center gap-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    onReset();
                    setIsMobileDrawerOpen(false);
                  }}
                  className="px-4 py-3 rounded-xl border border-brand-border text-xs font-bold text-neutral-600 hover:text-brand-black"
                >
                  Reset
                </button>
              )}
              <Button
                variant="accent"
                size="md"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-1 font-black text-xs py-3.5 bg-brand-lime text-brand-black rounded-xl btn-press"
              >
                <span>Show {resultCount} {resultCount === 1 ? 'Spot' : 'Spots'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
