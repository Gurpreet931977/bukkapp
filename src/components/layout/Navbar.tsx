'use client';

// ============================================================================
// BUKKAPP Global Navigation Bar
// Responsive navigation with role-based profile menu and authentication
// ============================================================================

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { LocationSelectorModal } from '@/components/layout/LocationSelectorModal';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Dehradun');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    showToast('Signed Out', 'info', 'You have been safely signed out.');
    router.push('/');
  };

  const navLinks = [
    { label: 'Explore', href: '/search' },
    { label: 'Categories', href: '/#categories' },
    { label: 'How it works', href: '/#how-it-works' },
  ];

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

          {/* MIDDLE: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xs font-bold transition-colors ${
                    isActive ? 'text-brand-black' : 'text-neutral-600 hover:text-brand-black'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Actions & Authentication */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Quick Action */}
            <Link
              href="/search"
              className="p-2 sm:px-3 sm:py-1.5 rounded-full text-brand-black hover:bg-brand-surface-alt border border-transparent hover:border-brand-border transition-all flex items-center gap-2 text-xs font-bold"
              aria-label="Search services"
            >
              <Search className="w-4 h-4 text-neutral-700" />
              <span className="hidden sm:inline">Search</span>
            </Link>

            {/* Merchant Portal shortcut */}
            {role !== 'business_owner' && role !== 'admin' && (
              <Link href="/business" className="hidden sm:block">
                <span className="text-xs font-bold text-neutral-600 hover:text-brand-black px-2 py-1 transition-colors">
                  For Business
                </span>
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
              /* Unauthenticated: Sign In & Register buttons */
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold px-3 py-1.5 rounded-full border-brand-border hover:border-brand-black"
                  >
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="accent"
                    size="sm"
                    className="text-xs font-extrabold px-4 py-1.5 rounded-full shadow-2xs"
                  >
                    <span>Get Started</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-black hover:bg-brand-surface-alt rounded-xl transition-colors active:scale-95"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              <Link
                href="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-brand-black hover:bg-brand-surface-alt flex items-center gap-2 active:scale-98 transition-all"
              >
                <Search className="w-4 h-4 text-neutral-500" />
                <span>Search & Explore</span>
              </Link>
              <Link
                href="/#categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-brand-black hover:bg-brand-surface-alt flex items-center gap-2 active:scale-98 transition-all"
              >
                <Layers className="w-4 h-4 text-neutral-500" />
                <span>Categories</span>
              </Link>

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
                    className="w-full text-center py-2.5 px-4 min-h-[44px] flex items-center justify-center rounded-xl bg-[#C7F36B] text-xs font-extrabold text-brand-black hover:bg-[#bbf054] active:scale-98 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Location Modal */}
      <LocationSelectorModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentLocation={selectedLocation}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
      />
    </>
  );
}
