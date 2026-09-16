import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-secondary hover:text-brand-black">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-card space-y-6">
          <div className="space-y-2 border-b border-brand-border pb-6">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Privacy & Trust</span>
            <h1 className="text-3xl font-black text-brand-black tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-brand-secondary">Last updated: August 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-brand-secondary leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">1. Customer Privacy Commitment</h2>
              <p>
                BUKKAPP collects only information strictly required to coordinate appointments: name, phone number, and optional booking notes.
                We never sell or rent your personal telephone number or email to third-party marketing companies.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">2. Data Shared with Businesses</h2>
              <p>
                When you book a service, your name and phone number are shared solely with that specific merchant so they can prepare for your visit or reach you if you are delayed.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">3. Data Security & Storage</h2>
              <p>
                All account data and appointment history are stored with Row Level Security (RLS) encryption. Access to business consoles is strictly isolated by owner permissions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
