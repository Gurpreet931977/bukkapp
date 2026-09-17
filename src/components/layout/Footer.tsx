import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { INITIAL_CATEGORIES, DEHRADUN_NEIGHBORHOODS } from '@/lib/seed/data';

export function Footer() {
  return (
    <footer className="bg-brand-black text-white border-t border-neutral-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo href="/" size="lg" theme="dark" />
            <p className="text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed">
              The universal local booking marketplace. Discover verified businesses, check real-time availability, and book instantly in seconds.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-brand-lime" />
              <span>Launch Market: <strong className="text-white font-bold">Dehradun, Uttarakhand</strong></span>
            </div>
          </div>

          {/* Categories Column */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-4">
              Categories
            </p>
            <ul className="space-y-2.5 text-xs">
              {INITIAL_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-neutral-300 hover:text-brand-lime transition-colors flex items-center justify-between group font-medium"
                  >
                    <span>{cat.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-lime" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Neighborhoods Column */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-4">
              Dehradun Areas
            </p>
            <ul className="space-y-2 text-xs text-neutral-300 font-medium">
              {DEHRADUN_NEIGHBORHOODS.slice(1, 7).map((hood) => (
                <li key={hood}>
                  <Link
                    href={`/search?neighborhood=${encodeURIComponent(hood)}`}
                    className="hover:text-white transition-colors"
                  >
                    {hood}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business & Operations Column */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-4">
              For Merchants
            </p>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link
                  href="/business/onboarding"
                  className="text-brand-lime font-bold hover:underline flex items-center gap-1"
                >
                  <span>List your business</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/business/dashboard" className="text-neutral-300 hover:text-white transition-colors">
                  Merchant Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-neutral-300 hover:text-white transition-colors">
                  Admin Control Room
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-neutral-300 hover:text-white transition-colors">
                  Live Slot Inventory
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} BUKKAPP Technologies Inc. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-neutral-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/cancellation-policy" className="hover:text-white transition-colors">
              Cancellation Policy
            </Link>
            <Link href="/faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
            <Link href="/support" className="hover:text-white transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
