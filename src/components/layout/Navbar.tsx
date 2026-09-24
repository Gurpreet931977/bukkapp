'use client';

// ============================================================================
// BUKKAPP Global Navigation Bar
// Responsive navigation with role-based profile menu and authentication
// ============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  MapPin,
  Search,
  Menu,
  X,
  ChevronDown,
  Calendar,
  Bookmark,
  Store,
  Shield,
  LogOut,
  User,
  LogIn,
  UserPlus,
  Settings,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { LocationSelectorModal } from '@/components/layout/LocationSelectorModal';
import { CommandPalette } from '@/components/search/CommandPalette';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bukkapp_location') || 'Dehradun';
    }
    return 'Dehradun';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchPaletteOpen, setIsSearchPaletteOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const NAV_PLACEHOLDERS = [
    'Search "Pickleball"...',
    'Search "Dentist clinics"...',
    'Search "Barber fade"...',
    'Search "AC repair"...',
    'Search "Doorstep plumbers"...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % NAV_PLACEHOLDERS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [NAV_PLACEHOLDERS.length]);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchPaletteOpen(true);
    window.addEventListener('bukkapp:open-search', handleOpenSearch);
    return () => window.removeEventListener('bukkapp:open-search', handleOpenSearch);
  }, []);

  const handleSelectLocation = (loc: string) => {
    setSelectedLocation(loc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bukkapp_location', loc);
      window.dispatchEvent(new CustomEvent('bukkapp:location-change', { detail: loc }));
    }
  };

  useEffect(() => {
    const handleLoc = (e: any) => {
      if (e.detail) setSelectedLocation(e.detail);
    };
    window.addEventListener('bukkapp:location-change', handleLoc);
    return () => window.removeEventListener('bukkapp:location-change', handleLoc);
  }, []);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    showToast('Signed Out', 'info', 'You have been safely signed out.');
    router.push('/');
  };

  const handleScrollToSection = (e: React.MouseEvent, sectionId: 'categories' | 'how-it-works') => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        if (typeof window !== 'undefined' && (window as any).__lenis) {
          (window as any).__lenis.scrollTo(element, { offset: -70, duration: 0.9 });
        } else {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('bukkapp_scroll_target', sectionId);
      }
      router.push('/');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FAFAF8] border-b border-brand-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
          {/* LEFT: Wordmark Logo */}
          <div className="flex items-center gap-6">
            <BrandLogo href="/" size="md" theme="light" withIcon={false} />

            {/* Location Selector Trigger */}
            <button
              onClick={() => setIsLocationOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-brand-surface-alt border border-brand-border text-xs font-semibold text-brand-black transition-all shadow-2xs"
              aria-label="Change city or neighborhood"
            >
              <MapPin className="w-3.5 h-3.5 text-neutral-600" />
              <span>{selectedLocation}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>
          </div>

          {/* MIDDLE: Navigation Links (No Hashtags) */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/search"
              className={`text-xs font-bold transition-colors ${
                pathname === '/search' ? 'text-brand-black' : 'text-neutral-600 hover:text-brand-black'
              }`}
            >
              Explore
            </Link>
            <button
              type="button"
              onClick={(e) => handleScrollToSection(e, 'categories')}
              className="text-xs font-bold text-neutral-600 hover:text-brand-black transition-colors cursor-pointer"
            >
              Categories
            </button>
            <button
              type="button"
              onClick={(e) => handleScrollToSection(e, 'how-it-works')}
              className="text-xs font-bold text-neutral-600 hover:text-brand-black transition-colors cursor-pointer"
            >
              How it works
            </button>
          </nav>

          {/* RIGHT: Actions & Authentication */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Crazy, Creative, Modern Search Omnibar */}
            <button
              type="button"
              onClick={() => setIsSearchPaletteOpen(true)}
              className="group relative h-9 px-3 rounded-full bg-white hover:bg-neutral-50 border border-brand-border/90 hover:border-brand-black/60 shadow-2xs hover:shadow-subtle transition-all duration-200 flex items-center gap-2 text-xs text-neutral-500 hover:text-brand-black cursor-pointer overflow-hidden max-w-[130px] sm:max-w-[170px] md:max-w-[200px] lg:max-w-[230px]"
              aria-label="Open search command palette (Command + K)"
            >
              {/* Shimmer sweep effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-lime/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />

              {/* Animated Search Icon with electric lime micro-dot */}
              <div className="relative shrink-0 flex items-center justify-center">
                <Search className="w-3.5 h-3.5 text-neutral-600 group-hover:text-brand-black transition-colors" />
                <span className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-brand-lime opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Kinetic Rotating Discovery Placeholder */}
              <span className="truncate font-medium text-neutral-400 group-hover:text-neutral-700 transition-colors text-[11px] sm:text-xs select-none">
                {NAV_PLACEHOLDERS[placeholderIndex]}
              </span>

              {/* Command K Badge */}
              <kbd className="ml-auto hidden md:inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-black text-neutral-400 group-hover:text-brand-black bg-neutral-100 group-hover:bg-brand-lime/30 rounded border border-neutral-200/80 transition-all font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Merchant Portal shortcut */}
            {role !== 'business_owner' && role !== 'admin' && (
              <Link
                href="/business"
                className="hidden sm:inline-flex h-9 items-center px-3 rounded-full text-xs font-bold text-neutral-600 hover:text-brand-black hover:bg-brand-surface-alt transition-colors"
              >
                For Business
              </Link>
            )}

            {/* AUTHENTICATION STATE */}
            {isAuthenticated && user ? (
              /* Logged In User Avatar & Dropdown */
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 rounded-full bg-white hover:bg-brand-surface-alt border border-brand-border transition-all shadow-2xs focus:outline-hidden"
                  aria-label="User profile menu"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-black text-white font-extrabold text-[11px] flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.name.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-bold text-brand-black hidden sm:inline max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-neutral-500 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-modal border border-brand-border py-2 z-40 animate-slide-down">
                      {/* User Header */}
                      <div className="px-4 py-2.5 border-b border-brand-border/60">
                        <p className="text-[10px] text-brand-muted uppercase tracking-wider font-bold">
                          Signed In As
                        </p>
                        <p className="text-xs font-black text-brand-black truncate mt-0.5">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-brand-muted truncate">{user.email || user.phone}</p>
                        <span
                          className={`inline-block mt-1.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            role === 'admin'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : role === 'business_owner'
                              ? 'bg-[#FAFDF4] text-[#427003] border border-[#D5F58D]'
                              : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                          }`}
                        >
                          {role === 'admin'
                            ? 'Admin'
                            : role === 'business_owner'
                            ? 'Verified Merchant'
                            : 'Customer'}
                        </span>
                      </div>

                      {/* Navigation Items by Role */}
                      <div className="py-1">
                        {/* Admin Exclusive Links */}
                        {role === 'admin' && (
                          <>
                            <Link
                              href="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-brand-black hover:bg-brand-surface-alt transition-colors"
                            >
                              <Shield className="w-4 h-4 text-purple-600" />
                              <span>Admin Console</span>
                            </Link>
                            <Link
                              href="/admin?tab=businesses"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-brand-black hover:bg-brand-surface-alt transition-colors"
                            >
                              <Store className="w-4 h-4 text-neutral-600" />
                              <span>Merchant Approvals</span>
                            </Link>
                          </>
                        )}

                        {/* Business Owner Exclusive Links */}
                        {(role === 'business_owner' || role === 'admin') && (
                          <>
                            <Link
                              href="/business/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-brand-black hover:bg-brand-surface-alt transition-colors"
                            >
                              <Store className="w-4 h-4 text-[#558B07]" />
                              <span>Business Dashboard</span>
                            </Link>
                            <Link
                              href="/business/calendar"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-brand-black hover:bg-brand-surface-alt transition-colors"
                            >
                              <Calendar className="w-4 h-4 text-neutral-600" />
                              <span>Schedule & Calendar</span>
                            </Link>
                          </>
                        )}

                        {/* Customer Links */}
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-brand-black hover:bg-brand-surface-alt transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-neutral-600" />
                          <span>My Bookings</span>
                        </Link>
                        <Link
                          href="/account/favorites"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-brand-black hover:bg-brand-surface-alt transition-colors"
                        >
                          <Bookmark className="w-4 h-4 text-neutral-600" />
                          <span>Saved Places</span>
                        </Link>

                        {/* Customer -> Merchant conversion */}
                        {role === 'customer' && (
                          <Link
                            href="/business/onboarding"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#558B07] hover:bg-[#FAFDF4] transition-colors border-t border-brand-border/40 mt-1 pt-1.5"
                          >
                            <Sparkles className="w-4 h-4 text-[#558B07]" />
                            <span>List Your Business</span>
                          </Link>
                        )}
                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-brand-border/60 pt-1 px-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Unauthenticated: Sign In & Register buttons with pixel-perfect alignment */
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <button
                    type="button"
                    className="h-9 px-3.5 sm:px-4 rounded-full border border-brand-border hover:border-brand-black bg-white hover:bg-neutral-50 text-xs font-bold text-brand-black shadow-2xs transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center"
                  >
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button
                    type="button"
                    className="h-9 px-3.5 sm:px-4 rounded-full bg-brand-lime hover:bg-brand-lime-dark text-xs font-black text-brand-black shadow-2xs transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center"
                  >
                    Get Started
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden h-9 w-9 flex items-center justify-center text-brand-black bg-white hover:bg-brand-surface-alt border border-brand-border rounded-xl transition-colors active:scale-95 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-brand-border bg-white px-4 pt-3 pb-6 space-y-4 animate-slide-down">
            <button
              onClick={() => {
                setIsLocationOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 min-h-[44px] rounded-xl bg-brand-surface-alt border border-brand-border text-xs font-bold text-brand-black active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-600" />
                <span>Location: {selectedLocation}</span>
              </div>
              <span className="text-[11px] text-brand-secondary underline">Change</span>
            </button>

            <div className="flex flex-col space-y-1">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchPaletteOpen(true);
                }}
                className="w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-brand-black hover:bg-brand-surface-alt flex items-center justify-between active:scale-98 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-neutral-500" />
                  <span>Search & Explore</span>
                </div>
                <kbd className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                  ⌘K
                </kbd>
              </button>
              <button
                type="button"
                onClick={(e) => handleScrollToSection(e, 'categories')}
                className="w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-brand-black hover:bg-brand-surface-alt flex items-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-neutral-500" />
                <span>Categories</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleScrollToSection(e, 'how-it-works')}
                className="w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-brand-black hover:bg-brand-surface-alt flex items-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-neutral-500" />
                <span>How It Works</span>
              </button>

              {isAuthenticated && (
                <>
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-brand-black hover:bg-brand-surface-alt flex items-center gap-2 active:scale-98 transition-all"
                  >
                    <Calendar className="w-4 h-4 text-neutral-500" />
                    <span>My Bookings</span>
                  </Link>

                  {(role === 'business_owner' || role === 'admin') && (
                    <Link
                      href="/business/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-[#427003] hover:bg-[#FAFDF4] flex items-center gap-2 active:scale-98 transition-all"
                    >
                      <Store className="w-4 h-4 text-[#558B07]" />
                      <span>Business Dashboard</span>
                    </Link>
                  )}

                  {role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-purple-700 hover:bg-purple-50 flex items-center gap-2 active:scale-98 transition-all"
                    >
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span>Admin Portal</span>
                    </Link>
                  )}
                </>
              )}
            </div>

            <div className="pt-3 border-t border-brand-border space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-2.5 min-h-[44px] rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 active:scale-98 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({user?.name})</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 px-4 min-h-[44px] flex items-center justify-center rounded-xl border border-brand-border text-xs font-bold text-brand-black bg-neutral-50 hover:bg-neutral-100 active:scale-98 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 px-4 min-h-[44px] flex items-center justify-center rounded-xl bg-brand-lime text-xs font-black text-brand-black hover:bg-brand-lime-dark active:scale-98 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Universal Creative Command Search Palette */}
      <CommandPalette
        isOpen={isSearchPaletteOpen}
        onClose={() => setIsSearchPaletteOpen(false)}
      />

      {/* Location Modal */}
      <LocationSelectorModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
      />
    </>
  );
}
