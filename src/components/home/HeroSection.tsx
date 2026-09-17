'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  ArrowRight,
  Sparkles,
  Layers,
  Calendar,
  Clock,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchIntentParser } from '@/lib/search/intentParser';
import { INITIAL_CATEGORIES } from '@/lib/seed/data';

interface HeroSectionProps {
  currentLocation?: string;
  onOpenLocation?: () => void;
}

const ROTATING_SUGGESTIONS = [
  'dentist tomorrow after 6',
  'pickleball court for 4 Saturday',
  'precision beard fade in Jakhan',
  'AC deep repair under 800',
  'ayurvedic spa Rajpur Rd',
  'car detailing this weekend',
];

const POPULAR_QUICK_PICKS = [
  { label: 'Dentist Consultation', query: 'dentist tomorrow', icon: '🦷' },
  { label: 'Pickleball Court', query: 'pickleball for 4 saturday', icon: '🎾' },
  { label: 'Salon & Haircut', query: 'haircut jakhan', icon: '✂️' },
  { label: 'AC Service & Repair', query: 'ac repair under 800', icon: '❄️' },
  { label: 'Ayurvedic Spa', query: 'spa rajpur road', icon: '🧖' },
  { label: 'Car Detailing', query: 'car detailing dehradun', icon: '🚗' },
];

export function HeroSection({ currentLocation = 'Dehradun', onOpenLocation }: HeroSectionProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  // Rotating suggestion carousel
  useEffect(() => {
    if (query) return;
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % ROTATING_SUGGESTIONS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [query]);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur();
        setIsFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

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
    setQuery(promptQuery);
    router.push(`/search?q=${encodeURIComponent(promptQuery)}`);
  };

  const handleFillSuggestion = (text: string) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 bg-[#FAFAF8] overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
        {/* Market Location Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-border text-xs font-semibold text-brand-black shadow-subtle animate-fade-in hover:shadow-hover transition-all">
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
          {/* Ambient Glow Aura behind the search bar */}
          <div
            className={`absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-lime/30 via-brand-lime/10 to-brand-lime/40 blur-lg transition-opacity duration-500 pointer-events-none -z-10 ${
              isFocused ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />

          <form
            onSubmit={handleSearch}
            className={`relative p-2 bg-white rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-center gap-2 group/form ${
              isFocused
                ? 'border-brand-black ring-2 ring-brand-black/90 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.14),0_0_30px_rgba(199,243,107,0.4)] -translate-y-0.5 scale-[1.01]'
                : 'border-brand-border shadow-card hover:border-neutral-400 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08),0_0_15px_rgba(199,243,107,0.2)]'
            }`}
          >
            {/* Ambient Shimmer Beam Sweep on Top Border */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-lime to-transparent opacity-0 group-hover/form:opacity-100 transition-opacity animate-shimmer-sweep" />
            </div>

            <div className="relative flex items-center gap-3 w-full px-3 py-2">
              {/* Search Icon with Interactive State */}
              <div className="relative shrink-0 flex items-center justify-center">
                <Search
                  className={`w-5 h-5 transition-all duration-300 ${
                    isFocused
                      ? 'text-brand-black scale-110 rotate-[-5deg]'
                      : 'text-neutral-400 group-hover/form:text-neutral-600'
                  }`}
                />
                {isFocused && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse" />
                )}
              </div>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 220)}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-sm sm:text-base text-brand-black bg-transparent outline-none focus:outline-none focus:ring-0 ring-0 font-medium z-10"
                autoComplete="off"
                spellCheck="false"
              />

              {/* Dynamic Animated Placeholder Overlay */}
              {!query && (
                <div
                  onClick={() => inputRef.current?.focus()}
                  className="absolute left-11 sm:left-12 right-14 sm:right-28 top-0 bottom-0 flex items-center pointer-events-none text-xs sm:text-base text-neutral-400 select-none overflow-hidden"
                >
                  <span className="hidden md:inline shrink-0">What do you want to book? (e.g.&nbsp;</span>
                  <span className="md:hidden shrink-0">Try&nbsp;</span>
                  <span className="inline-flex items-center overflow-hidden h-6 relative font-medium text-brand-black">
                    <span
                      key={suggestionIndex}
                      className="animate-slide-up inline-flex items-center text-neutral-700"
                    >
                      &ldquo;{ROTATING_SUGGESTIONS[suggestionIndex]}&rdquo;
                    </span>
                    <span className="inline-block w-[2px] h-3.5 sm:h-4 bg-brand-lime ml-1 animate-cursor" />
                  </span>
                  <span className="hidden md:inline shrink-0">)</span>
                </div>
              )}

              {/* Clear (X) Button when query is populated */}
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded-full text-neutral-400 hover:text-brand-black hover:bg-neutral-100 transition-all animate-scale-in shrink-0 z-10"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Keyboard Shortcut Keycap (Cmd+K) */}
              {!query && (
                <kbd
                  onClick={() => inputRef.current?.focus()}
                  className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-neutral-400 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-md transition-all cursor-pointer select-none shrink-0"
                  title="Press ⌘K to search"
                >
                  <span className="text-[11px]">⌘</span>K
                </kbd>
              )}
            </div>

            {/* Search Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className={`w-full sm:w-auto shrink-0 px-6 py-3 rounded-xl font-bold text-white text-xs sm:text-sm bg-brand-black hover:bg-neutral-800 btn-press gap-2 transition-all duration-200 group/btn ${
                query.trim().length > 0 ? 'ring-2 ring-brand-lime shadow-lime' : ''
              }`}
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1.5" />
            </Button>
          </form>

          {/* Interactive Floating Command Dropdown when Focused & Empty */}
          {isFocused && !query && (
            <div className="absolute left-0 right-0 top-full mt-2.5 bg-white/98 backdrop-blur-md rounded-2xl border border-brand-border shadow-modal p-4 text-left z-30 animate-slide-down">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
                  Popular Right Now in Dehradun
                </span>
                <span className="text-[10px] text-neutral-400">Click to fill</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POPULAR_QUICK_PICKS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleFillSuggestion(item.query);
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-brand-surface-alt hover:bg-brand-lime/25 border border-transparent hover:border-brand-lime/50 text-xs font-semibold text-brand-black transition-all text-left group/item"
                  >
                    <span className="text-base shrink-0 group-hover/item:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-brand-lime" />
                  Natural Search: try &ldquo;after 6&rdquo;, &ldquo;under 800&rdquo;, &ldquo;Rajpur Rd&rdquo;
                </span>
                <span className="font-mono text-[10px] text-neutral-400">ESC to close</span>
              </div>
            </div>
          )}

          {/* Real-Time Natural Language Intent Badges */}
          {liveIntent && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-brand-border shadow-subtle flex flex-wrap items-center justify-center gap-1.5 text-xs animate-slide-up">
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-neutral-600" />
                <span>Detected:</span>
              </span>

              {liveIntent.detectedCategory && (
                <span className="px-2 py-0.5 rounded-md bg-brand-lime text-brand-black font-bold text-[11px] flex items-center gap-1 shadow-2xs">
                  <Layers className="w-3 h-3" />
                  <span>
                    {INITIAL_CATEGORIES.find((c) => c.id === liveIntent.detectedCategory)?.name ||
                      liveIntent.detectedCategory}
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

