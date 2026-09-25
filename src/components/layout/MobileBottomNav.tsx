'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Search, CalendarCheck, Bookmark, User as UserIcon } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [optimisticIndex, setOptimisticIndex] = useState<number | null>(null);

  // Clear optimistic index when navigation completes
  useEffect(() => {
    setOptimisticIndex(null);
  }, [pathname, searchParams]);

  // Hide bottom nav on Business Console, Admin Console, and Merchant claim routes
  if (
    pathname.startsWith('/business') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/claim') ||
    pathname.startsWith('/book/')
  ) {
    return null;
  }

  const activeTab = searchParams.get('tab');

  const isHomeActive = pathname === '/';
  const isSearchActive = pathname.startsWith('/search') || pathname.startsWith('/category');
  const isBookingsActive =
    pathname.startsWith('/account/bookings') ||
    (pathname === '/account' && (activeTab === 'upcoming' || activeTab === 'past')) ||
    pathname.startsWith('/booking/');
  const isSavedActive =
    pathname.startsWith('/account/favorites') ||
    (pathname === '/account' && activeTab === 'favorites');
  const isAccountActive =
    (pathname === '/account' && !['upcoming', 'past', 'favorites'].includes(activeTab || '')) ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup');

  const tabs = [
    { id: 'home', label: 'Home', href: '/', icon: Home, isActive: isHomeActive },
    { id: 'explore', label: 'Explore', href: '/search', icon: Search, isActive: isSearchActive },
    { id: 'bookings', label: 'Bookings', href: '/account?tab=upcoming', icon: CalendarCheck, isActive: isBookingsActive },
    { id: 'saved', label: 'Saved', href: '/account?tab=favorites', icon: Bookmark, isActive: isSavedActive },
    { id: 'account', label: 'Account', href: '/account', icon: UserIcon, isActive: isAccountActive },
  ];

  const currentActiveIndex = tabs.findIndex((t) => t.isActive);
  const activeIndex = optimisticIndex !== null ? optimisticIndex : currentActiveIndex;

  const handleTabClick = (e: React.MouseEvent, tabIndex: number, href: string) => {
    setOptimisticIndex(tabIndex);
    if (tabIndex === 0 && pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/92 backdrop-blur-2xl border-t border-brand-border/80 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] pb-[max(0.375rem,env(safe-area-inset-bottom,0px))] transition-colors select-none"
    >
      {/* Specular Ambient Edge Highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent pointer-events-none" />

      <div className="relative max-w-md mx-auto px-2 py-1.5">
        {/* Animated Sliding Magnetic Active Capsule */}
        {activeIndex >= 0 && (
          <div
            className="absolute top-1.5 bottom-1.5 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none will-change-transform"
            style={{
              width: '20%',
              transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
            }}
          >
            <div className="mx-1 h-full rounded-[18px] bg-brand-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.18)] relative overflow-hidden flex flex-col items-center justify-between py-1">
              {/* High-Voltage Electric Lime Active Top Beam */}
              <div className="absolute top-0 inset-x-3.5 h-[2.5px] rounded-full bg-[#D0E967] shadow-[0_0_10px_rgba(208,233,103,0.95)]" />

              {/* Soft Radiant Lime Underglow */}
              <div className="absolute top-0 w-12 h-6 bg-[#D0E967]/15 rounded-full blur-md pointer-events-none" />
            </div>
          </div>
        )}

        {/* 5 Tab Navigation Items */}
        <div className="relative grid grid-cols-5 items-center">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const active = activeIndex === idx;

            return (
              <Link
                key={tab.label}
                href={tab.href}
                onClick={(e) => handleTabClick(e, idx, tab.href)}
                className={`relative flex flex-col items-center justify-center py-1.5 min-h-[50px] rounded-2xl transition-all duration-200 active:scale-90 motion-reduce:transition-none select-none z-10 group ${
                  active ? 'text-white' : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-all duration-250 ease-out ${
                      active
                        ? 'scale-110 text-white stroke-[2.3]'
                        : 'scale-100 text-neutral-400 stroke-[1.8] group-hover:text-neutral-600'
                    } ${tab.id === 'saved' && active ? 'fill-[#D0E967] text-[#D0E967]' : ''}`}
                  />

                  {/* Creative Micro-Pips on Active State */}
                  {active && tab.id === 'account' && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#D0E967] ring-1.5 ring-brand-black shadow-[0_0_6px_rgba(208,233,103,0.9)] animate-pulse" />
                  )}
                  {active && tab.id === 'explore' && (
                    <span className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-[#D0E967] shadow-[0_0_5px_rgba(208,233,103,0.9)]" />
                  )}
                  {active && tab.id === 'bookings' && (
                    <span className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-[#D0E967] shadow-[0_0_5px_rgba(208,233,103,0.9)]" />
                  )}
                </div>

                <span
                  className={`text-[10px] mt-1 tracking-tight leading-none transition-all duration-200 ${
                    active ? 'font-black text-white' : 'font-semibold text-neutral-400 group-hover:text-neutral-600'
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
