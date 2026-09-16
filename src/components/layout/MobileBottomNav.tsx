'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, CalendarCheck, Bookmark, User as UserIcon } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on Business Console and Admin Console routes (they have their own tailored nav)
  if (pathname.startsWith('/business') || pathname.startsWith('/admin') || pathname.startsWith('/claim')) {
    return null;
  }

  const tabs = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Bookings', href: '/account/bookings', icon: CalendarCheck },
    { label: 'Saved', href: '/account/favorites', icon: Bookmark },
    { label: 'Account', href: '/account', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-brand-border shadow-modal pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center h-full tap-target transition-all ${
                isActive ? 'text-brand-black font-bold' : 'text-neutral-400 hover:text-brand-black'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-black' : 'text-neutral-500'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-lime" />
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-black text-brand-black' : 'font-medium'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
