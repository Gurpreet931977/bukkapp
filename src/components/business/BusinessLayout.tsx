'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Layers,
  Clock,
  Users,
  MessageSquare,
  ExternalLink,
  Settings,
  HelpCircle,
  Share2,
  QrCode,
  Store,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  MoreHorizontal,
} from 'lucide-react';
import { store } from '@/lib/db/store';
import { Business, User } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useBottomSheetDrag } from '@/hooks/useBottomSheetDrag';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface BusinessLayoutProps {
  children: React.ReactNode;
}

export function BusinessLayout({ children }: BusinessLayoutProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User>(store.getCurrentUser());
  const [business, setBusiness] = useState<Business | null>(() => {
    const all = store.getAllBusinessesAdmin();
    const u = store.getCurrentUser();
    return u?.businessId ? store.getBusinessById(u.businessId) || all[0] : all[0];
  });
  const [allMyBusinesses, setAllMyBusinesses] = useState<Business[]>(() => store.getAllBusinessesAdmin().slice(0, 3));
  const [isStoreSwitcherOpen, setIsStoreSwitcherOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    sheetRef: moreSheetRef,
    backdropRef: moreBackdropRef,
    dragHandleProps: moreDragHandleProps,
    dismissWithAnimation: dismissMoreMenu,
  } = useBottomSheetDrag({
    onClose: () => setIsMobileMoreOpen(false),
    isOpen: isMobileMoreOpen,
  });

  // Lock body scroll and prevent Lenis hijacking when mobile menu sheet is open
  useEffect(() => {
    if (isMobileMoreOpen) {
      document.body.style.overflow = 'hidden';
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }
    } else {
      document.body.style.overflow = 'unset';
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
    };
  }, [isMobileMoreOpen]);

  useEffect(() => {
    const user = store.getCurrentUser();
    setCurrentUser(user);

    const allBiz = store.getAllBusinessesAdmin();
    const activeBiz = user.businessId
      ? store.getBusinessById(user.businessId) || allBiz[0]
      : allBiz[0];

    if (activeBiz) {
      setBusiness(activeBiz);
    }
    setAllMyBusinesses(allBiz.slice(0, 3));

    const unsub = store.subscribe(() => {
      const u = store.getCurrentUser();
      setCurrentUser(u);
      if (activeBiz) {
        setBusiness(store.getBusinessById(activeBiz.id) || activeBiz);
      }
    });
    return unsub;
  }, []);

  const handleSwitchStore = (b: Business) => {
    setBusiness(b);
    setIsStoreSwitcherOpen(false);
  };

  const navItems = [
    { label: 'Home', href: '/business/dashboard', icon: LayoutDashboard },
    { label: 'Bookings', href: '/business/bookings', icon: CalendarCheck },
    { label: 'Calendar', href: '/business/calendar', icon: Calendar },
    { label: 'Services', href: '/business/services', icon: Layers },
    { label: 'Availability', href: '/business/availability', icon: Clock },
    { label: 'Customers', href: '/business/customers', icon: Users },
    { label: 'Reviews', href: '/business/reviews', icon: MessageSquare },
    { label: 'My BUKKAPP Page', href: '/business/profile', icon: Store },
    { label: 'Business Settings', href: '/business/settings', icon: Settings },
  ];

  const publicUrl = business ? `https://bukkapp.in/business/${business.slug}` : 'https://bukkapp.in';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && business) {
      try {
        await navigator.share({
          title: business.name,
          text: `Book an appointment with ${business.name} on BUKKAPP`,
          url: publicUrl,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <AuthGuard allowedRoles={['business_owner', 'admin']}>
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col md:flex-row pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r border-brand-border bg-white sticky top-16 h-[calc(100vh-4rem)] p-4 justify-between shrink-0">
        <div className="space-y-4 overflow-y-auto no-scrollbar">
          {/* Store Switcher / Identity Badge */}
          {business && (
            <div className="relative">
              <button
                onClick={() => setIsStoreSwitcherOpen(!isStoreSwitcherOpen)}
                className="w-full p-3 rounded-2xl bg-brand-surface-alt hover:bg-neutral-100 border border-brand-border text-left transition-all flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={business.coverImage}
                    alt={business.name}
                    className="w-9 h-9 rounded-xl object-cover border border-brand-border shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-brand-black truncate">{business.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${business.active ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-[10px] text-brand-secondary capitalize font-semibold">
                        {business.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              </button>

              {/* Store Switcher Dropdown */}
              {isStoreSwitcherOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsStoreSwitcherOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-modal border border-brand-border p-2 z-40 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted px-2 py-1">
                      Your Businesses
                    </p>
                    {allMyBusinesses.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleSwitchStore(b)}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          business.id === b.id ? 'bg-brand-surface-alt font-bold text-brand-black' : 'hover:bg-neutral-50 text-brand-secondary'
                        }`}
                      >
                        <span className="truncate">{b.name}</span>
                        {business.id === b.id && <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />}
                      </button>
                    ))}
                    <div className="pt-1 border-t border-brand-border">
                      <Link
                        href="/business/onboarding"
                        onClick={() => setIsStoreSwitcherOpen(false)}
                        className="block w-full text-left px-2 py-1.5 text-xs font-bold text-brand-black hover:bg-brand-surface-alt rounded-lg"
                      >
                        + Add another business
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-black text-white shadow-2xs'
                      : 'text-brand-secondary hover:text-brand-black hover:bg-brand-surface-alt'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-lime' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Share & Preview */}
        {business && (
          <div className="pt-4 border-t border-brand-border space-y-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-brand-black bg-brand-surface-alt hover:bg-neutral-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5 text-neutral-500" />
                <span>Share Page & QR</span>
              </div>
              <QrCode className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <Link
              href={`/business/${business.slug}`}
              target="_blank"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-brand-secondary hover:text-brand-black hover:bg-brand-surface-alt transition-colors"
            >
              <span>Preview as customer</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </Link>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-border px-2 flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom,0px)] shadow-modal">
        <Link
          href="/business/dashboard"
          className={`flex-1 flex flex-col items-center justify-center h-full tap-target transition-all ${
            pathname === '/business/dashboard' ? 'text-brand-black font-bold' : 'text-neutral-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>
        <Link
          href="/business/bookings"
          className={`flex-1 flex flex-col items-center justify-center h-full tap-target transition-all ${
            pathname === '/business/bookings' ? 'text-brand-black font-bold' : 'text-neutral-400'
          }`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Bookings</span>
        </Link>
        <Link
          href="/business/calendar"
          className={`flex-1 flex flex-col items-center justify-center h-full tap-target transition-all ${
            pathname === '/business/calendar' ? 'text-brand-black font-bold' : 'text-neutral-400'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Calendar</span>
        </Link>
        <button
          onClick={() => setIsMobileMoreOpen(true)}
          className="flex-1 flex flex-col items-center justify-center h-full tap-target text-neutral-400 hover:text-brand-black"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </div>

      {/* MOBILE MORE MENU BOTTOM SHEET */}
      {isMobileMoreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-lenis-prevent
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs md:hidden overscroll-contain"
        >
          <div
            ref={moreBackdropRef}
            className="absolute inset-0 transition-opacity"
            onClick={dismissMoreMenu}
          />
          <div
            ref={moreSheetRef}
            data-lenis-prevent
            className="relative w-full bg-white rounded-t-3xl border-t border-brand-border p-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-modal animate-slide-up space-y-3 overscroll-contain will-change-transform"
          >
            {/* Mobile Pull / Drag Indicator */}
            <div
              {...moreDragHandleProps}
              className="w-full flex items-center justify-center pt-1 pb-2 cursor-grab active:cursor-grabbing select-none group touch-none shrink-0"
              role="button"
              tabIndex={0}
              aria-label="Drag down or tap to close"
              title="Drag down or tap to close"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  dismissMoreMenu();
                }
              }}
            >
              <div className="w-12 h-1.5 rounded-full bg-neutral-300 group-hover:bg-neutral-400 group-active:bg-neutral-500 transition-colors" />
            </div>

            <div
              {...moreDragHandleProps}
              className="flex items-center justify-between pb-2 border-b border-brand-border cursor-grab active:cursor-grabbing select-none touch-none"
            >
              <h3 className="font-extrabold text-base text-brand-black pointer-events-none">Business Console Menu</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissMoreMenu();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-full bg-brand-surface-alt flex items-center justify-center text-neutral-500 tap-target cursor-pointer pointer-events-auto"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/business/services"
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-3.5 rounded-xl bg-brand-surface-alt hover:bg-neutral-200 border border-brand-border flex items-center gap-2.5 text-xs font-bold text-brand-black"
              >
                <Layers className="w-4 h-4 text-brand-black" />
                <span>Services</span>
              </Link>
              <Link
                href="/business/availability"
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-3.5 rounded-xl bg-brand-surface-alt hover:bg-neutral-200 border border-brand-border flex items-center gap-2.5 text-xs font-bold text-brand-black"
              >
                <Clock className="w-4 h-4 text-brand-black" />
                <span>Availability</span>
              </Link>
              <Link
                href="/business/customers"
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-3.5 rounded-xl bg-brand-surface-alt hover:bg-neutral-200 border border-brand-border flex items-center gap-2.5 text-xs font-bold text-brand-black"
              >
                <Users className="w-4 h-4 text-brand-black" />
                <span>Customers</span>
              </Link>
              <Link
                href="/business/reviews"
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-3.5 rounded-xl bg-brand-surface-alt hover:bg-neutral-200 border border-brand-border flex items-center gap-2.5 text-xs font-bold text-brand-black"
              >
                <MessageSquare className="w-4 h-4 text-brand-black" />
                <span>Reviews</span>
              </Link>
              <Link
                href="/business/profile"
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-3.5 rounded-xl bg-brand-surface-alt hover:bg-neutral-200 border border-brand-border flex items-center gap-2.5 text-xs font-bold text-brand-black"
              >
                <Store className="w-4 h-4 text-brand-black" />
                <span>My Page</span>
              </Link>
              <Link
                href="/business/settings"
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-3.5 rounded-xl bg-brand-surface-alt hover:bg-neutral-200 border border-brand-border flex items-center gap-2.5 text-xs font-bold text-brand-black"
              >
                <Settings className="w-4 h-4 text-brand-black" />
                <span>Settings</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-brand-border space-y-2">
              <button
                onClick={() => {
                  setIsMobileMoreOpen(false);
                  setIsShareModalOpen(true);
                }}
                className="w-full p-3 rounded-xl bg-brand-lime text-brand-black font-black text-xs flex items-center justify-center gap-2 btn-press"
              >
                <QrCode className="w-4 h-4" />
                <span>Share Storefront & QR Code</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE / QR MODAL */}
      {business && (
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Share Your BUKKAPP Business Page"
        >
          <div className="space-y-5 pt-2">
            {/* Digital Business Card */}
            <div className="p-6 rounded-2xl bg-brand-black text-white text-center space-y-3 border border-neutral-800 shadow-card">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-[10px] font-black uppercase tracking-wider text-brand-lime">
                <span>BUKKAPP Verified Storefront</span>
              </div>
              <h3 className="text-xl font-black text-white">{business.name}</h3>
              <p className="text-xs text-neutral-400">{business.subcategory} • {business.neighborhood}, Dehradun</p>

              {/* QR Mock */}
              <div className="w-36 h-36 mx-auto bg-white p-3 rounded-xl flex items-center justify-center">
                <QrCode className="w-full h-full text-brand-black" />
              </div>
              <p className="text-[11px] text-neutral-400 font-medium">Scan to view live availability and book in seconds</p>
            </div>

            {/* Link Sharing Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Your Booking Link</label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-brand-surface-alt border border-brand-border">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="w-full text-xs font-mono bg-transparent focus:outline-hidden text-brand-black"
                />
                <Button variant="primary" size="sm" onClick={handleCopyLink} className="shrink-0 text-xs font-bold">
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleNativeShare}
                className="w-full justify-center font-bold text-xs"
              >
                <Share2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Share via Phone</span>
              </Button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Book an appointment with ${business.name} on BUKKAPP: ${publicUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="accent" size="md" className="w-full justify-center font-bold text-xs bg-brand-lime text-brand-black">
                  <span>WhatsApp Link</span>
                </Button>
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
    </AuthGuard>
  );
}
