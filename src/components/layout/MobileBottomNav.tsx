'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Search, CalendarCheck, Bookmark, User as UserIcon } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    { label: 'Home', href: '/', icon: Home, isActive: isHomeActive },
    { label: 'Explore', href: '/search', icon: Search, isActive: isSearchActive },
    { label: 'Bookings', href: '/account?tab=upcoming', icon: CalendarCheck, isActive: isBookingsActive },
    { label: 'Saved', href: '/account?tab=favorites', icon: Bookmark, isActive: isSavedActive },
    { label: 'Account', href: '/account', icon: UserIcon, isActive: isAccountActive },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-brand-border/80 shadow-modal pb-[max(0.375rem,env(safe-area-inset-bottom,0px))]">
      <div className="flex items-center justify-around h-15 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[48px] rounded-xl transition-all duration-150 active:scale-95 select-none ${
                active ? 'text-brand-black' : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    active ? 'scale-110 text-brand-black stroke-[2.4]' : 'stroke-[1.8] text-neutral-400'
                  }`}
                />
                {active && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-brand-lime ring-2 ring-brand-black" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight leading-none transition-all ${
                  active ? 'font-black text-brand-black' : 'font-semibold text-neutral-400'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
