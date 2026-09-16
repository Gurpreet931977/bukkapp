import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Store } from 'lucide-react';

export default function BusinessTermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-secondary hover:text-brand-black">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-card space-y-6">
          <div className="space-y-2 border-b border-brand-border pb-6">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Merchant Agreements</span>
            <h1 className="text-3xl font-black text-brand-black tracking-tight">Business Partner Terms</h1>
            <p className="text-xs text-brand-secondary">Last updated: August 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-brand-secondary leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">1. Merchant Verification</h2>
              <p>
                All merchants must provide accurate operating locations, genuine service descriptions, and valid contact numbers.
                BUKKAPP operations review and verify each storefront prior to granting public active status.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">2. Honor Booked Appointments</h2>
              <p>
                Merchants agree to honor confirmed customer bookings during the scheduled time interval. In case of emergency closures,
                merchants must block out schedule hours using the Business Console calendar.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">3. Pricing Accuracy Guarantee</h2>
              <p>
                Services listed on BUKKAPP must match the rate charged to the customer at the venue. No unauthorized price markups are permitted.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
