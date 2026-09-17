import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ReviewPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-secondary hover:text-brand-black">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-card space-y-6">
          <div className="space-y-2 border-b border-brand-border pb-6">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Trust & Authenticity</span>
            <h1 className="text-3xl font-black text-brand-black tracking-tight">Review Trust & Verification Policy</h1>
            <p className="text-xs text-brand-secondary">Last updated: August 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-brand-secondary leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">1. 100% Verified Customer Reviews</h2>
              <p>
                To maintain authentic trust across Dehradun, reviews on BUKKAPP can only be submitted by customers with a completed, confirmed booking record.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">2. Prohibition of Self-Reviews & Inauthentic Feedback</h2>
              <p>
                Business owners and staff are strictly prohibited from submitting reviews for their own listings. Violations result in listing suspension.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-brand-black">3. Owner Right of Reply</h2>
              <p>
                Merchants have the right to post an official public response to any customer review directly via the Business Console.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
