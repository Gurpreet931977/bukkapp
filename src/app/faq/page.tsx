import React from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: 'How does booking an appointment on BUKKAPP work?',
      a: 'Browse verified businesses in Dehradun, view live open slots, select a convenient time, and enter your name and phone number. Your appointment is instantly locked and confirmed on the merchant’s calendar.',
    },
    {
      q: 'Is there any fee to book on BUKKAPP?',
      a: 'Booking through BUKKAPP is 100% free for customers. You only pay the listed price directly for the service.',
    },
    {
      q: 'How do I list my business on BUKKAPP?',
      a: 'Click "List Your Business" in the top navigation or visit /business/onboarding. The 5-step guided wizard will help you enter your business details, add bookable services, set working hours, and upload photos in under 5 minutes.',
    },
    {
      q: 'How does verification work for new businesses?',
      a: 'Our local operations team checks the physical address, phone verification, and service catalog within 24 hours to ensure high quality before publishing your storefront live on BUKKAPP.',
    },
    {
      q: 'Can I add walk-in or telephone bookings to my calendar?',
      a: 'Yes! The Business Console includes a "+ Add booking" button so you can record phone appointments and keep your availability synchronized in one place.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-secondary hover:text-brand-black">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-card space-y-8">
          <div className="space-y-2 border-b border-brand-border pb-6">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Help & Answers</span>
            <h1 className="text-3xl font-black text-brand-black tracking-tight">Frequently Asked Questions</h1>
            <p className="text-xs text-brand-secondary">Everything you need to know about booking and managing businesses on BUKKAPP</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-sm sm:text-base font-extrabold text-brand-black">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
