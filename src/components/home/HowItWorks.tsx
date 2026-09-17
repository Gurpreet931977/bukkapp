import React from 'react';
import { Search, CalendarCheck, Zap } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Discover & Compare',
      desc: 'Search local services by intent or category. View verified prices, real photos, and authentic reviews without phone calls.',
      icon: Search,
    },
    {
      num: '02',
      title: 'Pick Real Availability',
      desc: 'Browse live working schedules. Select the exact date and open time slot that fits your day seamlessly.',
      icon: CalendarCheck,
    },
    {
      num: '03',
      title: 'Instant Confirmation',
      desc: 'Lock in your booking in one click. Receive an instant digital ticket with directions and automatic calendar sync.',
      icon: Zap,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-t border-brand-border/80 gsap-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">
            Simplicity by Design
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-black tracking-tight">
            How BUKKAPP Works
          </h2>
          <p className="text-xs sm:text-sm text-brand-secondary">
            No back-and-forth WhatsApp texts. No guessing prices. Just transparent local bookings.
          </p>
        </div>

        {/* Neo-Brutalist Numbered Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="relative p-8 rounded-2xl bg-[#FAFAF8] border border-brand-border hover:border-brand-black transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white border border-brand-border flex items-center justify-center shadow-2xs">
                      <Icon className="w-5 h-5 text-brand-black" />
                    </div>
                    <span className="text-3xl font-black text-neutral-300 tracking-tighter">
                      {s.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-brand-black mb-2 tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
