'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  Star,
  Check,
  CornerDownLeft,
} from 'lucide-react';
import { store } from '@/lib/db/store';
import { INITIAL_CATEGORIES } from '@/lib/seed/data';
import { Business } from '@/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_TRENDING_PROMPTS = [
  { label: 'Pickleball Courts', query: 'pickleball', categorySlug: 'fitness-sports' },
  { label: 'Precision Fades', query: 'fade barber', categorySlug: 'beauty-grooming' },
  { label: 'Dentist Checkup', query: 'dentist', categorySlug: 'health-wellness' },
  { label: 'AC Service & Gas', query: 'ac repair', categorySlug: 'appliance-repair' },
  { label: 'Doorstep Plumber', query: 'plumber', categorySlug: 'plumbing-sanitary' },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Focus input automatically when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut to open/close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open via custom event or state
          window.dispatchEvent(new CustomEvent('bukkapp:open-search'));
        }
      }

      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Query filtering logic
  const allBusinesses = useMemo(() => store.getBusinesses(), []);

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return INITIAL_CATEGORIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.includes(q)
    ).slice(0, 3);
  }, [query]);

  const filteredBusinesses = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allBusinesses
      .filter((b) => {
        const matchesBasic =
          b.name.toLowerCase().includes(q) ||
          b.categoryName?.toLowerCase().includes(q) ||
          b.subcategory?.toLowerCase().includes(q) ||
          b.neighborhood?.toLowerCase().includes(q) ||
          b.tagline?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q);

        if (matchesBasic) return true;

        const services = store.getServicesByBusinessId(b.id);
        return services.some((s) => s.name.toLowerCase().includes(q));
      })
      .slice(0, 5);
  }, [allBusinesses, query]);

  // Total navigable item count for keyboard arrow traversal
  const totalNavigableCount = filteredCategories.length + filteredBusinesses.length + 1;

  const handleSelectBusiness = (b: Business) => {
    onClose();
    router.push(`/business/${b.slug}`);
  };

  const handleSelectCategory = (slug: string) => {
    onClose();
    router.push(`/category/${slug}`);
  };

  const handleSearchSubmit = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % totalNavigableCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalNavigableCount) % totalNavigableCount);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!query.trim()) {
        return;
      }
      if (selectedIndex === 0) {
        handleSearchSubmit(query);
      } else if (selectedIndex <= filteredCategories.length) {
        const cat = filteredCategories[selectedIndex - 1];
        if (cat) handleSelectCategory(cat.slug);
      } else {
        const bizIndex = selectedIndex - 1 - filteredCategories.length;
        const biz = filteredBusinesses[bizIndex];
        if (biz) handleSelectBusiness(biz);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-brand-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-brand-border shadow-modal overflow-hidden animate-scale-in text-left flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Shimmer Accent Header Line */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-lime via-[#AEE144] to-brand-lime" />

        {/* Input Bar */}
        <div className="relative p-4 sm:p-5 border-b border-brand-border/70 flex items-center gap-3 bg-brand-surface-alt/40">
          <div className="w-9 h-9 rounded-xl bg-brand-black text-brand-lime flex items-center justify-center shrink-0 shadow-2xs">
            <Search className="w-4 h-4 stroke-[2.5]" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search verified businesses, clinics, turf, stylists..."
            className="w-full text-base sm:text-lg font-bold text-brand-black placeholder:text-neutral-400 bg-transparent outline-none border-none ring-0 focus:ring-0 focus:outline-none"
            autoComplete="off"
            spellCheck="false"
          />

          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-full hover:bg-neutral-200/70 text-neutral-500 transition-colors"
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-neutral-100 text-neutral-500 border border-neutral-200 font-mono">
              ESC
            </kbd>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {!query.trim() ? (
            /* Default State: Trending Prompts & Top Verified Highlights */
            <>
              {/* Quick Trending Searches */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-secondary" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-brand-secondary">
                    Trending in Dehradun
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TRENDING_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => handleSearchSubmit(prompt.query)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface-alt hover:bg-brand-lime/25 border border-brand-border/80 hover:border-brand-lime text-xs font-bold text-brand-black transition-all cursor-pointer group active:scale-95 shadow-2xs"
                    >
                      <span>{prompt.label}</span>
                      <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-brand-black group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-brand-secondary" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-brand-secondary">
                      Browse by Category
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INITIAL_CATEGORIES.slice(0, 6).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.slug)}
                      className="p-3 rounded-2xl bg-white border border-brand-border hover:border-brand-black hover:bg-brand-surface-alt text-left transition-all group cursor-pointer flex items-center justify-between shadow-2xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-brand-black truncate group-hover:text-black">
                          {cat.name}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-0.5 font-medium">Verified local slots</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-brand-black group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Spotlights */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-brand-secondary">
                    Top Verified Specialists
                  </span>
                </div>
                <div className="space-y-2">
                  {allBusinesses.slice(0, 3).map((biz) => (
                    <div
                      key={biz.id}
                      onClick={() => handleSelectBusiness(biz)}
                      className="p-2.5 rounded-2xl border border-brand-border hover:border-brand-black bg-white hover:bg-brand-surface-alt transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={biz.coverImage}
                          alt={biz.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-neutral-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-brand-black truncate">
                              {biz.name}
                            </h4>
                            <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-brand-lime text-brand-black shrink-0">
                              <Check className="w-2 h-2 stroke-[3.5]" />
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 truncate flex items-center gap-1 mt-0.5 font-medium">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            <span>{biz.neighborhood}</span>
                            <span className="text-neutral-300">·</span>
                            <span>{biz.categoryName}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-xs font-extrabold text-brand-black">
                          From ₹{biz.startingPrice}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-brand-black text-white flex items-center justify-center group-hover:bg-brand-lime group-hover:text-brand-black transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Live Filtered Results */
            <div className="space-y-4">
              {/* Primary Query Submit Row */}
              <button
                type="button"
                onClick={() => handleSearchSubmit(query)}
                className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer ${
                  selectedIndex === 0
                    ? 'bg-brand-lime/20 border-brand-lime text-brand-black'
                    : 'bg-brand-surface-alt border-brand-border/80 text-brand-black hover:border-brand-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-black text-brand-lime flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black">
                      Search all listings for &ldquo;<span className="text-brand-black underline">{query}</span>&rdquo;
                    </p>
                    <p className="text-[10px] text-neutral-500 font-medium">
                      Check live slot schedules across Dehradun
                    </p>
                  </div>
                </div>
                <CornerDownLeft className="w-4 h-4 text-neutral-400 shrink-0" />
              </button>

              {/* Matched Categories */}
              {filteredCategories.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-2">
                    Matching Categories
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {filteredCategories.map((cat, idx) => {
                      const itemIndex = idx + 1;
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectCategory(cat.slug)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-brand-lime/20 border-brand-lime font-black'
                              : 'bg-white border-brand-border hover:border-brand-black font-bold'
                          }`}
                        >
                          <span className="text-xs text-brand-black truncate">{cat.name}</span>
                          <ArrowRight className="w-3 h-3 text-neutral-400 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matched Verified Businesses */}
              {filteredBusinesses.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-2">
                    Direct Storefronts ({filteredBusinesses.length})
                  </p>
                  <div className="space-y-2">
                    {filteredBusinesses.map((biz, idx) => {
                      const itemIndex = filteredCategories.length + 1 + idx;
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <div
                          key={biz.id}
                          onClick={() => handleSelectBusiness(biz)}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-brand-lime/20 border-brand-lime shadow-xs'
                              : 'bg-white border-brand-border hover:border-brand-black'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={biz.coverImage}
                              alt={biz.name}
                              className="w-11 h-11 rounded-xl object-cover shrink-0 border border-neutral-200"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-black text-brand-black truncate">
                                  {biz.name}
                                </h4>
                                <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-brand-lime text-brand-black shrink-0">
                                  <Check className="w-2 h-2 stroke-[3.5]" />
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-500 truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-neutral-400" />
                                <span>{biz.neighborhood}</span>
                                <span className="text-neutral-300">·</span>
                                <Star className="w-3 h-3 fill-brand-black text-brand-black inline" />
                                <span className="font-bold text-brand-black">{biz.rating}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-bold">
                                Starting
                              </span>
                              <span className="text-xs font-black text-brand-black block">
                                ₹{biz.startingPrice}
                              </span>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-brand-black text-white flex items-center justify-center">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No results fallback */}
              {filteredCategories.length === 0 && filteredBusinesses.length === 0 && (
                <div className="py-8 text-center space-y-2">
                  <p className="text-sm font-bold text-brand-black">
                    No exact storefront match for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Press <span className="font-bold text-brand-black">Enter</span> to run an AI intent search across all services and slots.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-5 py-3 border-t border-brand-border/70 bg-brand-surface-alt/70 flex items-center justify-between text-[11px] text-neutral-400 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-brand-border text-[10px] font-mono text-neutral-600 font-bold">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-brand-border text-[10px] font-mono text-neutral-600 font-bold">
                ↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-brand-border text-[10px] font-mono text-neutral-600 font-bold">
                ↵
              </kbd>
              <span>Select</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
            <span className="text-brand-black font-bold">BUKKAPP Spotlight</span>
          </div>
        </div>
      </div>
    </div>
  );
}
