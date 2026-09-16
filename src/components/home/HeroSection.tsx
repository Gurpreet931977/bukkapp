'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight, Sparkles, Layers, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchIntentParser } from '@/lib/search/intentParser';
import { INITIAL_CATEGORIES } from '@/lib/seed/data';

interface HeroSectionProps {
  currentLocation?: string;
  onOpenLocation?: () => void;
}

export function HeroSection({ currentLocation = 'Dehradun', onOpenLocation }: HeroSectionProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const quickPrompts = [
    { label: 'Dentist tomorrow after 6', query: 'dentist tomorrow after 6' },
    { label: 'Pickleball court Saturday', query: 'pickleball for 4 saturday' },
    { label: 'AC repair under 800', query: 'ac repair under 800' },
    { label: 'Precision beard fade', query: 'haircut jakhan' },
    { label: 'Ayurvedic spa Rajpur Rd', query: 'spa rajpur road' },
  ];

  // Dynamic natural language intent preview
  const liveIntent = useMemo(() => {
    if (!query.trim() || query.trim().length < 3) return null;
    const parsed = SearchIntentParser.parse(query);
    if (parsed.confidence > 0) return parsed;
    return null;
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      router.push('/search');
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handlePromptClick = (promptQuery: string) => {
    router.push(`/search?q=${encodeURIComponent(promptQuery)}`);
  };

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 bg-[#FAFAF8] overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
        {/* Market Location Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-border text-xs font-semibold text-brand-black shadow-subtle animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-brand-lime live-pulse-dot" />
          <span>Universal Local Booking in</span>
          <button
            onClick={onOpenLocation}
            className="text-brand-black font-bold underline decoration-brand-lime hover:text-neutral-600 transition-colors"
          >
            {currentLocation}
          </button>
        </div>

        {/* Hero Title */}
        <div className={`space-y-3 transition-opacity duration-300 ${isFocused ? 'opacity-90' : 'opacity-100'}`}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-black text-brand-black tracking-tight leading-[1.03] animate-hero-title">
            Everything you need.{' '}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10">Booked.</span>
              <span className="absolute bottom-1 sm:bottom-2 left-0 w-full h-3 sm:h-4 bg-brand-lime -z-0 rounded-xs" />
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-brand-secondary max-w-2xl mx-auto font-normal leading-relaxed">
            Discover trusted local businesses, see real available time slots, and confirm appointments in minutes.
          </p>
        </div>

        {/* Universal Search Command Center */}
        <div className="pt-2 relative max-w-2xl mx-auto">
          <form
            onSubmit={handleSearch}
            className={`relative p-2 bg-white rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-center gap-2 ${
              isFocused
                ? 'border-brand-black shadow-hover scale-[1.01]'
                : 'border-brand-border shadow-card hover:border-neutral-400'
            }`}
          >
            <div className="flex items-center gap-3 w-full px-3 py-2">
              <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-brand-black' : 'text-neutral-400'} shrink-0`} />
              <input
                type="text"
                value={query}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What do you want to book? (e.g. dentist tomorrow after 6)"
                className="w-full text-sm sm:text-base text-brand-black placeholder-neutral-400 bg-transparent focus:outline-hidden font-medium"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-xl font-bold text-white text-xs sm:text-sm bg-brand-black hover:bg-neutral-800 btn-press gap-1.5"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Real-Time Natural Language Intent Badges */}
          {liveIntent && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-brand-border shadow-subtle flex flex-wrap items-center justify-center gap-1.5 text-xs animate-slide-up">
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-neutral-600" />
                <span>Detected:</span>
              </span>

              {liveIntent.detectedCategory && (
                <span className="px-2 py-0.5 rounded-md bg-brand-lime text-brand-black font-bold text-[11px] flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>
                    {INITIAL_CATEGORIES.find((c) => c.id === liveIntent.detectedCategory)?.name || liveIntent.detectedCategory}
                  </span>
                </span>
              )}

              {liveIntent.detectedDate && (
                <span className="px-2 py-0.5 rounded-md bg-brand-surface-alt text-brand-black font-semibold text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-neutral-500" />
                  <span>Date: {liveIntent.detectedDate}</span>
                </span>
              )}

              {liveIntent.detectedTimeFrom && (
                <span className="px-2 py-0.5 rounded-md bg-brand-surface-alt text-brand-black font-semibold text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  <span>From: {liveIntent.detectedTimeFrom}</span>
                </span>
              )}

              {liveIntent.detectedNeighborhood && (
                <span className="px-2 py-0.5 rounded-md bg-brand-surface-alt text-brand-black font-semibold text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-500" />
                  <span>{liveIntent.detectedNeighborhood}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Natural Language Prompt Suggestions */}
        <div className="pt-1 space-y-2">
          <p className="text-xs text-brand-muted font-semibold uppercase tracking-wider">
            Try searching by intent:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {quickPrompts.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePromptClick(p.query)}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white hover:bg-brand-surface-alt border border-brand-border text-brand-secondary hover:text-brand-black transition-all shadow-2xs hover:border-brand-black hover:-translate-y-0.5"
              >
                &ldquo;{p.label}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
