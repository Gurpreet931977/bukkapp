import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-secondary hover:text-brand-black">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-card space-y-6">
          <div className="space-y-2 border-b border-brand-border pb-6">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Legal Agreements</span>
            <h1 className="text-3xl font-black text-brand-black tracking-tight">Terms of Service</h1>
            <p className="text-xs text-brand-secondary">Last updated: August 2026 • Effective in Dehradun, India</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-brand-secondary leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">1. Acceptance of Terms</h2>
              <p>
                By accessing or using BUKKAPP (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service.
                BUKKAPP connects customers with local independent service merchants in Dehradun and surrounding regions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">2. Booking Infrastructure & Appointments</h2>
              <p>
                BUKKAPP provides real-time booking scheduling and confirmation infrastructure. When you book an appointment with a merchant,
                you enter into a direct agreement with that independent service provider.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">3. Merchant Responsibility & Healthcare Notice</h2>
              <p>
                Services provided by independent clinics, sports facilities, salons, and technicians are the sole responsibility
                of the respective business. Healthcare consultations booked through BUKKAPP do not replace emergency medical care.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">4. Fair Use & Customer Conduct</h2>
              <p>
                Users agree not to make fraudulent bookings, create duplicate fake reviews, or misuse contact details provided for appointment scheduling.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
