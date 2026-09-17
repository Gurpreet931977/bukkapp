'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  ArrowRight,
  Layers,
  Calendar,
  Clock,
  X,
  Zap,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Scissors,
  Activity,
  Wind,
  CarFront,
  Stethoscope,
  Leaf,
  TrendingUp,
  Compass,
  Flame,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchIntentParser } from '@/lib/search/intentParser';
import { INITIAL_CATEGORIES } from '@/lib/seed/data';

interface HeroSectionProps {
  currentLocation?: string;
  onOpenLocation?: () => void;
}

interface KineticService {
  name: string;
  Icon: LucideIcon;
}

const KINETIC_SERVICES: KineticService[] = [
  { name: 'Pickleball Courts', Icon: Activity },
  { name: 'Precision Fades', Icon: Scissors },
  { name: 'Dentist Clinics', Icon: Stethoscope },
  { name: 'Same-Day AC Repair', Icon: Wind },
  { name: 'Ayurvedic Spas', Icon: Leaf },
  { name: 'Car Detailing', Icon: CarFront },
];

const ROTATING_SUGGESTIONS = [
  'dentist tomorrow after 6',
  'pickleball court for 4 Saturday',
  'precision beard fade in Jakhan',
  'AC deep repair under 800',
  'ayurvedic spa Rajpur Rd',
  'car detailing this weekend',
];

interface QuickPick {
  label: string;
  query: string;
  Icon: LucideIcon;
}

const POPULAR_QUICK_PICKS: QuickPick[] = [
  { label: 'Dentist Consultation', query: 'dentist tomorrow', Icon: Stethoscope },
  { label: 'Pickleball Court', query: 'pickleball for 4 saturday', Icon: Activity },
  { label: 'Salon & Haircut', query: 'haircut jakhan', Icon: Scissors },
  { label: 'AC Service & Repair', query: 'ac repair under 800', Icon: Wind },
  { label: 'Ayurvedic Spa', query: 'spa rajpur road', Icon: Leaf },
  { label: 'Car Detailing', query: 'car detailing dehradun', Icon: CarFront },
];

interface CategoryDockItem {
  label: string;
  Icon: LucideIcon;
  status: string;
  query: string;
}

const CATEGORY_DOCK: CategoryDockItem[] = [
  { label: 'Pickleball', Icon: Activity, status: '4 venues', query: 'pickleball' },
  { label: 'Salons', Icon: Scissors, status: '12 open', query: 'haircut' },
  { label: 'Dentists', Icon: Stethoscope, status: 'Verified', query: 'dentist' },
  { label: 'AC Service', Icon: Wind, status: 'Same-day', query: 'ac repair' },
  { label: 'Detailing', Icon: CarFront, status: 'Top rated', query: 'detailing' },
  { label: 'Wellness', Icon: Leaf, status: '5 spas', query: 'spa' },
  { label: 'Fitness', Icon: Flame, status: 'Live slots', query: 'gym' },
  { label: 'Pet Care', Icon: HeartPulse, status: 'Available', query: 'veterinary' },
];

export function HeroSection({ currentLocation = 'Dehradun', onOpenLocation }: HeroSectionProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // Kinetic Service Typewriter State (Famous typing -> pause -> backspace one by one -> loop)
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = KINETIC_SERVICES[typewriterIndex].name;
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText.length < currentFullText.length) {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.slice(0, displayText.length + 1));
        }, 70);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 1800);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.slice(0, displayText.length - 1));
        }, 35);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(false);
          setTypewriterIndex((prev) => (prev + 1) % KINETIC_SERVICES.length);
        }, 200);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, typewriterIndex]);

  // Touch-responsive marquee state for category dock (responsive to touch instead of hover)
  const [isTouchActive, setIsTouchActive] = useState(false);
  const touchResumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    setIsTouchActive(true);
    if (touchResumeTimerRef.current) clearTimeout(touchResumeTimerRef.current);
  };

  const handleTouchEnd = () => {
    if (touchResumeTimerRef.current) clearTimeout(touchResumeTimerRef.current);
    touchResumeTimerRef.current = setTimeout(() => {
      setIsTouchActive(false);
    }, 1800);
  };

  useEffect(() => {
    return () => {
      if (touchResumeTimerRef.current) clearTimeout(touchResumeTimerRef.current);
    };
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
        {/* Interactive Floating Live Activity Card: Left (Staggered beside kinetic ticker & search) */}
        <div className="hidden xl:block absolute top-[215px] 2xl:top-[230px] left-0 2xl:left-4 z-20 pointer-events-auto">
          <div
            onClick={() => setIsPassModalOpen(true)}
            className="group block text-left animate-float-left bg-white/95 backdrop-blur-2xl border border-neutral-200/90 hover:border-brand-black shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.12),0_0_24px_rgba(199,243,107,0.3)] rounded-2xl p-4 w-68 2xl:w-72 transition-all duration-300 hover:-translate-y-1.5 select-none cursor-pointer"
          >
            {/* Header: Live Confirmed Radar Pill + Monospace Ref */}
            <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-neutral-100">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                  Confirmed 2m ago
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                #BK-9241
              </span>
            </div>

            {/* Venue Profile with Real Image */}
            <div className="flex items-start gap-3 mb-3">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-neutral-200 shadow-2xs">
                <img
                  src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=160&q=80"
                  alt="Zenith Pickleball Club"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <span className="absolute bottom-0 right-0 bg-brand-black/90 backdrop-blur-xs p-1 rounded-tl text-brand-lime flex items-center justify-center">
                  <Activity className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-black text-brand-black truncate">Zenith Pickleball Club</h4>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <p className="text-[11px] font-semibold text-neutral-700 mt-0.5">Court 1 · 6:00 PM Today</p>
                <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                  <span>Rajpur Road, Dehradun</span>
                </p>
              </div>
            </div>

            {/* Interactive Tear-off Ticket Footer */}
            <div className="pt-2.5 border-t border-dashed border-neutral-200 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold leading-tight">Total Paid</span>
                <span className="text-xs font-black text-brand-black leading-tight">₹600 via UPI</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPassModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-black text-white text-[11px] font-bold hover:bg-neutral-800 transition-colors group/btn shadow-2xs cursor-pointer"
              >
                <span>View Pass</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Floating Live Activity Card: Right (Staggered beside search bar & categories) */}
        <div className="hidden xl:block absolute top-[285px] 2xl:top-[305px] right-0 2xl:right-4 z-20 pointer-events-auto">
          <div
            onClick={() => router.push('/business/the-groom-room')}
            className="group block text-left animate-float-right bg-white/95 backdrop-blur-2xl border border-neutral-200/90 hover:border-brand-black shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.12),0_0_24px_rgba(199,243,107,0.3)] rounded-2xl p-4 w-68 2xl:w-72 transition-all duration-300 hover:-translate-y-1.5 select-none cursor-pointer"
          >
            {/* Header: Next Open Slot + Rating (No star icon) */}
            <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-neutral-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-lime live-pulse-dot" />
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-800">
                  Next Open Slot
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>4.9</span>
                <span className="text-neutral-400 font-normal">(148)</span>
              </span>
            </div>

            {/* Venue Profile with Real Image */}
            <div className="flex items-start gap-3 mb-3">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-neutral-200 shadow-2xs">
                <img
                  src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=160&q=80"
                  alt="The Groom Room"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <span className="absolute bottom-0 right-0 bg-brand-black/90 backdrop-blur-xs p-1 rounded-tl text-brand-lime flex items-center justify-center">
                  <Scissors className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-black text-brand-black truncate">The Groom Room</h4>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <p className="text-[11px] font-bold text-emerald-600 mt-0.5">Today at 4:30 PM</p>
                <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                  <span>Ballupur, Dehradun</span>
                </p>
              </div>
            </div>

            {/* Interactive Tear-off Ticket Footer */}
            <div className="pt-2.5 border-t border-dashed border-neutral-200 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold leading-tight">1 slot left</span>
                <span className="text-xs font-black text-brand-black leading-tight">From ₹450</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/business/the-groom-room');
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-black text-white text-[11px] font-bold hover:bg-neutral-800 transition-colors group/btn shadow-2xs cursor-pointer"
              >
                <span>Book Slot</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          </div>
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

          {/* Hero Title & Kinetic Discovery Ticker (Rock-solid, zero line-jumping) */}
          <div className={`space-y-3.5 sm:space-y-4 transition-opacity duration-300 ${isFocused ? 'opacity-90' : 'opacity-100'}`}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-black text-brand-black tracking-tight leading-[1.04] animate-hero-title">
              <span>Everything you need</span>{' '}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10">Booked.</span>
                <span className="absolute bottom-1.5 sm:bottom-2.5 left-0 w-full h-3 sm:h-4 bg-brand-lime -z-0 rounded-xs" />
              </span>
            </h1>

            {/* Minimal Kinetic Discovery Typewriter Ticker */}
            <div className="flex items-center justify-center flex-wrap gap-2 text-sm sm:text-base text-brand-secondary font-medium min-h-[38px]">
              <span>Real-time availability for</span>
              <span className="inline-flex items-center min-h-[34px] overflow-visible relative">
                {(() => {
                  const currentService = KINETIC_SERVICES[typewriterIndex] || KINETIC_SERVICES[0];
                  const CurrentIcon = currentService.Icon;
                  return (
                    <button
                      type="button"
                      onClick={() => handlePromptClick(currentService.name)}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-neutral-200/90 shadow-2xs hover:border-brand-black/40 text-xs sm:text-sm font-semibold text-brand-black transition-all cursor-pointer group select-none"
                      title={`Search ${currentService.name}`}
                    >
                      <span className="w-5 h-5 rounded-full bg-brand-surface-alt flex items-center justify-center shrink-0 border border-neutral-100 group-hover:bg-brand-lime/30 transition-colors">
                        <CurrentIcon className="w-3 h-3 text-neutral-800" />
                      </span>
                      <span className="tracking-tight text-brand-black font-bold">
                        {displayText}
                      </span>
                      <span className="inline-block w-[1.5px] h-3.5 bg-brand-black ml-0.5 animate-pulse align-middle" />
                    </button>
                  );
                })()}
              </span>
            </div>
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

                {/* Dynamic Animated Placeholder Overlay (Clean, Single-line, No-wrap) */}
                {!query && (
                  <div
                    onClick={() => inputRef.current?.focus()}
                    className="absolute left-11 sm:left-12 right-12 sm:right-24 top-0 bottom-0 flex items-center pointer-events-none text-xs sm:text-sm md:text-base text-neutral-400 select-none overflow-hidden whitespace-nowrap"
                  >
                    <span className="shrink-0 font-normal text-neutral-400">Search&nbsp;</span>
                    <span className="inline-flex items-center overflow-hidden h-6 relative font-normal text-neutral-400 whitespace-nowrap">
                      <span
                        key={suggestionIndex}
                        className="animate-kinetic-flip inline-flex items-center whitespace-nowrap text-neutral-400"
                      >
                        &ldquo;{ROTATING_SUGGESTIONS[suggestionIndex]}&rdquo;
                      </span>
                      <span className="inline-block w-[2px] h-3.5 sm:h-4 bg-brand-lime ml-1.5 animate-cursor shrink-0" />
                    </span>
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
                    className="p-1 rounded-full text-neutral-400 hover:text-brand-black hover:bg-neutral-100 transition-all animate-scale-in shrink-0 z-10 cursor-pointer"
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
                    <TrendingUp className="w-3.5 h-3.5 text-brand-lime" />
                    Popular Right Now in Dehradun
                  </span>
                  <span className="text-[10px] text-neutral-400">Click to fill</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_QUICK_PICKS.map((item) => {
                    const ItemIcon = item.Icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleFillSuggestion(item.query);
                        }}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-brand-surface-alt hover:bg-brand-lime/25 border border-transparent hover:border-brand-lime/50 text-xs font-semibold text-brand-black transition-all text-left group/item cursor-pointer"
                      >
                        <span className="w-6 h-6 rounded-lg bg-white border border-neutral-200/80 flex items-center justify-center shrink-0 group-hover/item:scale-105 group-hover/item:border-brand-black transition-all shadow-2xs">
                          <ItemIcon className="w-3.5 h-3.5 text-neutral-800 group-hover/item:text-brand-black" />
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
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
                  <Compass className="w-3.5 h-3.5 text-neutral-600" />
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

          {/* Visual Category Pill Dock - Automatic Continuous Marquee in Infinite Loop (Touch Responsive) */}
          <div className="pt-2 w-full max-w-4xl mx-auto flex justify-center px-2 sm:px-4">
            <div
              className="relative w-full max-w-full overflow-hidden rounded-full bg-white/95 backdrop-blur-xl border border-neutral-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-1.5 cursor-pointer select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              {/* Soft Edge Gradient Fade Masks for seamless entrance/exit */}
              <div className="pointer-events-none absolute left-0 inset-y-0 w-8 sm:w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10 rounded-l-full" />
              <div className="pointer-events-none absolute right-0 inset-y-0 w-8 sm:w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 rounded-r-full" />

              <div className="flex w-max">
                {/* Track 1 */}
                <div
                  className="flex items-center gap-1 sm:gap-1.5 shrink-0 animate-marquee-scroll pr-1 sm:pr-1.5"
                  style={{
                    animationPlayState: isTouchActive ? 'paused' : 'running',
                  }}
                >
                  {[...CATEGORY_DOCK, ...CATEGORY_DOCK].map((cat, idx) => {
                    const CatIcon = cat.Icon;
                    return (
                      <button
                        key={`t1-${cat.label}-${idx}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePromptClick(cat.query);
                        }}
                        className="group shrink-0 flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-left transition-all duration-200 hover:bg-neutral-100/90 active:scale-95 cursor-pointer border border-transparent hover:border-neutral-200/70 select-none"
                      >
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-brand-lime/40 transition-all">
                          <CatIcon className="w-4 h-4 text-neutral-800 group-hover:text-brand-black transition-colors" strokeWidth={1.8} />
                        </div>
                        <div className="flex flex-col pr-1">
                          <span className="text-xs font-bold text-brand-black leading-tight group-hover:text-black">
                            {cat.label}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-medium leading-tight flex items-center gap-1 group-hover:text-neutral-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {cat.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Track 2 (Clone for mathematical infinite seamless continuous loop) */}
                <div
                  aria-hidden="true"
                  className="flex items-center gap-1 sm:gap-1.5 shrink-0 animate-marquee-scroll pr-1 sm:pr-1.5"
                  style={{
                    animationPlayState: isTouchActive ? 'paused' : 'running',
                  }}
                >
                  {[...CATEGORY_DOCK, ...CATEGORY_DOCK].map((cat, idx) => {
                    const CatIcon = cat.Icon;
                    return (
                      <button
                        key={`t2-${cat.label}-${idx}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePromptClick(cat.query);
                        }}
                        className="group shrink-0 flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-left transition-all duration-200 hover:bg-neutral-100/90 active:scale-95 cursor-pointer border border-transparent hover:border-neutral-200/70 select-none"
                      >
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-brand-lime/40 transition-all">
                          <CatIcon className="w-4 h-4 text-neutral-800 group-hover:text-brand-black transition-colors" strokeWidth={1.8} />
                        </div>
                        <div className="flex flex-col pr-1">
                          <span className="text-xs font-bold text-brand-black leading-tight group-hover:text-black">
                            {cat.label}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-medium leading-tight flex items-center gap-1 group-hover:text-neutral-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {cat.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
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

      {/* Interactive Live Booking Pass Modal */}
      {isPassModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsPassModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-3xl border border-brand-border shadow-modal overflow-hidden animate-scale-in text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-brand-black text-white p-6 relative">
              <button
                type="button"
                onClick={() => setIsPassModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close pass"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-brand-lime live-pulse-dot" />
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-lime">
                  Verified Booking Pass
                </span>
              </div>

              <div className="flex items-baseline justify-between pr-8">
                <h3 className="text-xl font-black tracking-tight text-white">
                  Zenith Pickleball Club
                </h3>
                <span className="font-mono text-xs font-bold text-neutral-400">#BK-9241</span>
              </div>
              <p className="text-xs text-neutral-300 mt-1">Rajpur Road, Dehradun</p>
            </div>

            {/* Pass Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-brand-surface-alt border border-brand-border/60 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Reserved Resource
                  </span>
                  <span className="font-black text-brand-black mt-0.5 block">
                    Court 1 (Pro Synthetic)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Scheduled Slot
                  </span>
                  <span className="font-black text-emerald-600 mt-0.5 block">
                    Today · 6:00 PM to 7:00 PM
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Customer
                  </span>
                  <span className="font-black text-brand-black mt-0.5 block">
                    Gurpreet S.
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Payment Status
                  </span>
                  <span className="font-black text-brand-black mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>₹600 Paid via UPI</span>
                  </span>
                </div>
              </div>

              {/* Digital QR Check-in Strip */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-brand-black block">Check-in at Reception</span>
                  <span className="text-[11px] text-neutral-500 block">Show this QR pass at venue desk</span>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl border border-neutral-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                  <QrCode className="w-10 h-10 text-brand-black" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsPassModalOpen(false);
                    router.push('/business/zenith-pickleball');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-black text-white text-xs font-bold hover:bg-neutral-800 transition-colors text-center cursor-pointer shadow-subtle flex items-center justify-center gap-1.5"
                >
                  <span>Book Next Court Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPassModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-brand-black text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


