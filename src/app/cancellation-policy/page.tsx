import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-secondary hover:text-brand-black">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-card space-y-6">
          <div className="space-y-2 border-b border-brand-border pb-6">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Booking Rules</span>
            <h1 className="text-3xl font-black text-brand-black tracking-tight">Cancellation & Rescheduling Policy</h1>
            <p className="text-xs text-brand-secondary">Last updated: August 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-brand-secondary leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">1. Customer Free Cancellations</h2>
              <p>
                Customers can cancel any confirmed booking free of charge up to 2 hours prior to the scheduled appointment time directly from their BUKKAPP Account page.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">2. Merchant Cancellations & Emergency Notice</h2>
              <p>
                In the rare event that a merchant must reschedule due to emergency maintenance or medical leave, the customer is immediately notified via SMS and in-app alert.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">3. Rescheduling</h2>
              <p>
                To reschedule, customers can cancel their existing slot and select a new available time on the merchant&apos;s live calendar.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
