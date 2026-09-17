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
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchIntentParser } from '@/lib/search/intentParser';
import { INITIAL_CATEGORIES } from '@/lib/seed/data';

interface HeroSectionProps {
  currentLocation?: string;
  onOpenLocation?: () => void;
}

const KINETIC_HEADLINES = [
  'Pickleball courts',
  'Dentist clinics',
  'Precision fades',
  'Same-day AC repair',
  'Ayurvedic spas',
  'Car detailing',
];

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

const CATEGORY_DOCK = [
  { label: 'Pickleball', icon: '🎾', status: '4 venues', query: 'pickleball' },
  { label: 'Salons', icon: '✂️', status: '12 open', query: 'haircut' },
  { label: 'Dentists', icon: '🦷', status: 'Verified', query: 'dentist' },
  { label: 'AC Service', icon: '❄️', status: 'Same-day', query: 'ac repair' },
  { label: 'Detailing', icon: '🚗', status: 'Top rated', query: 'detailing' },
  { label: 'Wellness', icon: '🧖', status: '5 spas', query: 'spa' },
];

export function HeroSection({ currentLocation = 'Dehradun', onOpenLocation }: HeroSectionProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [kineticIndex, setKineticIndex] = useState(0);

  // Rotating suggestion carousel
  useEffect(() => {
    if (query) return;
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % ROTATING_SUGGESTIONS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [query]);

  // Kinetic headline flipper (cycles every 2.8s)
  useEffect(() => {
    const timer = setInterval(() => {
      setKineticIndex((prev) => (prev + 1) % KINETIC_HEADLINES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

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
    <section className="relative pt-12 pb-16 md:pt-18 md:pb-24 bg-[#FAFAF8] overflow-hidden">
      {/* Subtle Atmospheric Himalayan Valley Light Leak */}
      <div
        className="pointer-events-none absolute -top-36 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-brand-lime/15 via-brand-lime/4 to-transparent blur-3xl -z-10"
        aria-hidden="true"
      />

      {/* Outer 7XL Framing Container for Harmonious Floating Cards & Central Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Floating Live Activity Card: Left (Confirmed Booking Proof) */}
        <div className="hidden xl:block absolute top-20 left-2 2xl:left-6 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={() => handlePromptClick('pickleball')}
            className="group block text-left animate-float-left bg-white/90 backdrop-blur-xl border border-neutral-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] rounded-2xl p-3.5 w-64 transition-all duration-300 hover:scale-[1.02] select-none cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Confirmed 2m ago
              </span>
              <span className="text-[10px] font-mono text-neutral-400">#BK-9241</span>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-surface-alt flex items-center justify-center text-lg shrink-0 border border-neutral-200/70 group-hover:scale-105 transition-transform">
                🎾
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-brand-black truncate group-hover:text-neutral-700 transition-colors">
                  Zenith Pickleball Club
                </p>
                <p className="text-[11px] text-neutral-600 font-medium">Court 1 · 6:00 PM Today</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">Rajpur Road, Dehradun</p>
              </div>
            </div>
          </button>
        </div>

        {/* Floating Live Activity Card: Right (Instant Open Slot) */}
        <div className="hidden xl:block absolute top-24 right-2 2xl:right-6 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={() => handlePromptClick('haircut')}
            className="group block text-left animate-float-right bg-white/90 backdrop-blur-xl border border-neutral-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] rounded-2xl p-3.5 w-64 transition-all duration-300 hover:scale-[1.02] select-none cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-surface-alt text-brand-black text-[10px] font-bold border border-brand-border">
                <Clock className="w-3 h-3 text-neutral-500" />
                Next Open Slot
              </span>
              <span className="text-[10px] font-bold text-brand-black flex items-center gap-0.5">
                <span className="text-amber-500">★</span> 4.9 <span className="text-neutral-400 font-normal">(128)</span>
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-lg shrink-0 border border-neutral-200/70 group-hover:scale-105 transition-transform">
                ✂️
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-brand-black truncate group-hover:text-neutral-700 transition-colors">
                  Jakhan Precision Fades
                </p>
                <p className="text-[11px] font-bold text-emerald-600">Today at 4:30 PM</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400">1 slot left</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-black group-hover:text-neutral-600">
                    <span>Book in 10s</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Central Hero Column */}
        <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8 relative z-10">
          {/* Market Location Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-border text-xs font-semibold text-brand-black shadow-subtle animate-fade-in hover:shadow-hover transition-all">
            <span className="w-2 h-2 rounded-full bg-brand-lime live-pulse-dot" />
            <span>Universal Local Booking in</span>
            <button
              type="button"
              onClick={onOpenLocation}
              className="text-brand-black font-bold underline decoration-brand-lime hover:text-neutral-600 transition-colors cursor-pointer"
            >
              {currentLocation}
            </button>
          </div>

          {/* Hero Title with Kinetic Category Word Flipper */}
          <div className={`space-y-3 transition-opacity duration-300 ${isFocused ? 'opacity-90' : 'opacity-100'}`}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-black text-brand-black tracking-tight leading-[1.08] animate-hero-title">
              <span>Everything you need.</span>
              <span className="block mt-1 sm:mt-2">
                <span className="relative inline-block whitespace-nowrap">
                  <span
                    key={kineticIndex}
                    className="relative z-10 inline-block animate-kinetic-flip text-brand-black"
                  >
                    {KINETIC_HEADLINES[kineticIndex]}
                  </span>
                  <span className="absolute bottom-1 sm:bottom-2 left-0 w-full h-3 sm:h-4 bg-brand-lime -z-0 rounded-xs transition-all duration-300" />
                </span>
                <span className="text-brand-black font-black"> · Booked.</span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-brand-secondary max-w-xl mx-auto font-normal leading-relaxed">
              Discover verified local businesses, see real-time open calendar slots, and confirm appointments in seconds.
            </p>
          </div>

          {/* Universal Search Command Center */}
          <div className="pt-1 relative max-w-2xl mx-auto">
            {/* Ambient Glow Aura behind the search bar */}
            <div
              className={`absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-brand-lime/25 via-brand-lime/10 to-brand-lime/30 blur-xl transition-opacity duration-500 pointer-events-none -z-10 ${
                isFocused ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />

            <form
              onSubmit={handleSearch}
              className={`relative p-2 bg-white rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-center gap-2 group/form ${
                isFocused
                  ? 'border-brand-black shadow-[0_12px_36px_-8px_rgba(0,0,0,0.12),0_0_0_1px_#111111] -translate-y-0.5'
                  : 'border-brand-border shadow-card hover:border-neutral-400 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]'
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
                        className="animate-kinetic-flip inline-flex items-center text-neutral-700"
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

          {/* Visual Category Pill Dock with Live Status Indicators */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-brand-border/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] max-w-full overflow-x-auto no-scrollbar">
              {CATEGORY_DOCK.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => handlePromptClick(cat.query)}
                  className="shrink-0 flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-left transition-all duration-200 hover:bg-neutral-100 active:scale-95 group cursor-pointer"
                >
                  <span className="text-sm sm:text-base shrink-0 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-brand-black leading-tight">
                      {cat.label}
                    </span>
                    <span className="text-[10px] text-neutral-500 group-hover:text-brand-black flex items-center gap-1 font-medium leading-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                      {cat.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Trust & Live Speed Strip */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] text-neutral-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Calendar Sync
            </span>
            <span className="hidden sm:inline text-neutral-300">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
              100% Free to Book
            </span>
            <span className="hidden sm:inline text-neutral-300">•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-lime fill-brand-lime" />
              Instant Confirmation Pass
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

