'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Search, Menu, X, ChevronDown, Calendar, Bookmark, Store, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { LocationSelectorModal } from '@/components/layout/LocationSelectorModal';
import { store } from '@/lib/db/store';
import { DEMO_USERS } from '@/lib/seed/data';
import { User } from '@/types';

export function Navbar() {
  const pathname = usePathname();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Dehradun');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);

  useEffect(() => {
    setCurrentUser(store.getCurrentUser());
  }, []);

  const handleSwitchUser = (user: User) => {
    store.setCurrentUser(user);
    setCurrentUser(user);
    setIsUserMenuOpen(false);
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
            <BrandLogo href="/" size="md" theme="light" />

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
                  className={`text-xs sm:text-sm font-semibold transition-colors hover:text-brand-black ${
                    isActive ? 'text-brand-black font-extrabold' : 'text-brand-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: CTAs & User Menu */}
          <div className="flex items-center gap-3">
            {/* List Your Business Button (Highlighted in Brand Lime) */}
            <Link href="/business/onboarding" className="hidden sm:inline-flex">
              <Button
                variant="accent"
                size="sm"
                className="font-extrabold text-xs px-4 py-2 rounded-full border border-brand-black/15 hover:border-brand-black shadow-xs hover:shadow-lime transition-all duration-200 gap-1.5 btn-press"
              >
                <Store className="w-3.5 h-3.5 text-brand-black" />
                <span>List your business</span>
              </Button>
            </Link>

            {/* Direct Quick Search on Mobile / Tablet */}
            <Link href="/search" className="lg:hidden p-2 rounded-full hover:bg-brand-surface-alt text-brand-black" aria-label="Search">
              <Search className="w-5 h-5" />
            </Link>

            {/* User Account / Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-full bg-white hover:bg-brand-surface-alt border border-brand-border transition-all text-xs font-medium text-brand-black shadow-2xs"
                aria-label="Account menu"
              >
                <div className="w-6 h-6 rounded-full bg-brand-black text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <span className="hidden md:inline-block max-w-[100px] truncate font-bold text-xs">
                  {currentUser.name.split(' ')[0]}
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
                      <p className="text-[10px] text-brand-muted uppercase tracking-wider font-bold">Active Profile</p>
                      <p className="text-xs font-black text-brand-black truncate mt-0.5">{currentUser.name}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-lime text-brand-black">
                        Role: {currentUser.role.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Navigation Items */}
                    <div className="py-1">
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-brand-black hover:bg-brand-surface-alt transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-brand-secondary" />
                        <span>My Bookings</span>
                      </Link>
                      <Link
                        href="/account/favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-brand-black hover:bg-brand-surface-alt transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-brand-secondary" />
                        <span>Saved Businesses</span>
                      </Link>
                      <Link
                        href="/business/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-brand-black hover:bg-brand-surface-alt transition-colors"
                      >
                        <Store className="w-4 h-4 text-brand-secondary" />
                        <span>Business Dashboard</span>
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-brand-black hover:bg-brand-surface-alt transition-colors"
                      >
                        <Shield className="w-4 h-4 text-brand-secondary" />
                        <span>Admin Portal</span>
                      </Link>
                    </div>

                    {/* Switch Persona */}
                    <div className="border-t border-brand-border/60 pt-2 px-3 pb-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted px-1 mb-1.5">
                        Switch Persona (Prototype)
                      </p>
                      <div className="space-y-1">
                        {DEMO_USERS.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => handleSwitchUser(u)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              currentUser.id === u.id
                                ? 'bg-brand-surface-alt font-bold text-brand-black'
                                : 'hover:bg-brand-surface-alt text-brand-secondary'
                            }`}
                          >
                            <span>{u.name} ({u.role.replace('_', ' ')})</span>
                            {currentUser.id === u.id && <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-brand-black hover:bg-brand-surface-alt rounded-lg transition-colors"
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
              className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-surface-alt border border-brand-border text-xs font-bold text-brand-black"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-600" />
                <span>Location: {selectedLocation}</span>
              </div>
              <span className="text-[11px] text-brand-secondary underline">Change</span>
            </button>

            <div className="flex flex-col space-y-2">
              <Link
                href="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-bold text-brand-black hover:bg-brand-surface-alt flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-neutral-500" />
                <span>Search & Explore</span>
              </Link>
              <Link
                href="/#categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-bold text-brand-black hover:bg-brand-surface-alt flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-neutral-500" />
                <span>Categories</span>
              </Link>
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-bold text-brand-black hover:bg-brand-surface-alt flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-neutral-500" />
                <span>My Bookings</span>
              </Link>
              <Link
                href="/business/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-bold text-brand-black hover:bg-brand-surface-alt flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-neutral-500" />
                <span>Business Dashboard</span>
              </Link>
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-bold text-brand-black hover:bg-brand-surface-alt flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-neutral-500" />
                <span>Admin Portal</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-brand-border">
              <Link href="/business/onboarding" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="accent" size="md" className="w-full justify-center text-xs font-extrabold gap-2 shadow-xs">
                  <Store className="w-4 h-4 text-brand-black" />
                  <span>List your business</span>
                </Button>
              </Link>
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
