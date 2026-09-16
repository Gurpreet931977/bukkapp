import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Store } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function BusinessCTA() {
  const perks = [
    'Zero commission during initial launch tier',
    'Real-time automated calendar booking',
    'Customer reminders & instant confirmations',
    'Complete merchant SaaS control panel',
  ];

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#FAFAF8]">
      <div className="relative rounded-3xl bg-brand-black text-white p-8 sm:p-12 md:p-16 overflow-hidden border border-neutral-800 shadow-modal">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-xs font-semibold text-brand-lime">
              <Store className="w-3.5 h-3.5" />
              <span>For Business Owners in Dehradun</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Turn your business into a <span className="text-brand-lime">bookable business.</span>
            </h2>

            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg leading-relaxed">
              Stop losing customers to missed phone calls and delayed messages. Get listed on BUKKAPP, manage your schedule, and fill open slots effortlessly.
            </p>

            <div className="pt-2">
              <Link href="/business/onboarding">
                <Button variant="accent" size="lg" className="rounded-xl text-xs sm:text-sm font-black text-brand-black px-8 py-4 bg-brand-lime hover:bg-brand-lime-dark">
                  <span>List your business today</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-2">
              Why partner with BUKKAPP?
            </h3>
            <ul className="space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300">
                  <div className="w-4 h-4 rounded-full bg-brand-lime/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-brand-lime" />
                  </div>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Onboarding takes under 3 minutes</span>
              <span className="text-white font-bold">100% Free Launch Tier</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
