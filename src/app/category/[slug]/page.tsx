'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Business, Category } from '@/types';
import { store } from '@/lib/db/store';
import { INITIAL_CATEGORIES, DEHRADUN_NEIGHBORHOODS } from '@/lib/seed/data';
import { BusinessCard } from '@/components/business/BusinessCard';
import { ArrowLeft, CheckCircle2, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All Areas');

  useEffect(() => {
    const cat = INITIAL_CATEGORIES.find((c) => c.slug === slug);
    if (cat) {
      setCategory(cat);
      const bizList = store.getBusinesses({ category: cat.id });
      setBusinesses(bizList);
    }
  }, [slug]);

  if (!category) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-brand-black">Category Not Found</h2>
        <p className="text-sm text-brand-secondary">We could not locate the requested category.</p>
        <Link href="/">
          <Button variant="primary" size="md">Return Home</Button>
        </Link>
      </div>
    );
  }

  const filteredBusinesses = businesses.filter((b) => {
    if (selectedNeighborhood === 'All Areas') return true;
    return b.neighborhood.toLowerCase() === selectedNeighborhood.toLowerCase();
  });

  const faqs = [
    {
      q: `How do I book ${category.name} on BUKKAPP?`,
      a: `Select a verified business above, choose your required service, pick an open time slot, and confirm your booking instantly. You will receive an instant digital confirmation ticket.`,
    },
    {
      q: `Are the pricing and availability real-time?`,
      a: `Yes. All service rates, duration estimates, and calendar slots shown are live and guaranteed by the merchant.`,
    },
    {
      q: `Can I reschedule or cancel my appointment?`,
      a: `Yes. You can manage your appointments anytime from your customer account page with zero cancellation fees.`,
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Category Hero Banner */}
      <div className="bg-white border-b border-brand-border/80 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discovery</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-[#E8F8CE] px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                <span>Verified Category</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-black tracking-tight">
                {category.name} in Dehradun
              </h1>
              <p className="text-sm sm:text-base text-brand-secondary leading-relaxed">
                {category.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 max-w-md">
              {category.popularServices.map((srv) => (
                <span
                  key={srv}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-brand-surface-alt border border-brand-border text-brand-black"
                >
                  {srv}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Neighborhood Filter Pills */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
            Filter by Dehradun Area
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {DEHRADUN_NEIGHBORHOODS.slice(0, 9).map((hood) => {
              const isSelected = selectedNeighborhood === hood;
              return (
                <button
                  key={hood}
                  onClick={() => setSelectedNeighborhood(hood)}
                  className={`text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-brand-black text-white shadow-xs'
                      : 'bg-white border border-brand-border text-brand-secondary hover:text-brand-black'
                  }`}
                >
                  {hood}
                </button>
              );
            })}
          </div>
        </div>

        {/* Business Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-black tracking-tight">
              Top Rated Providers ({filteredBusinesses.length})
            </h2>
            <Link
              href={`/search?category=${category.id}`}
              className="text-xs font-bold text-brand-black hover:underline"
            >
              View on live map →
            </Link>
          </div>

          {filteredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((biz) => (
                <BusinessCard key={biz.id} business={biz} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-brand-border p-6">
              <p className="font-bold text-base text-brand-black">No providers found in {selectedNeighborhood}</p>
              <button
                onClick={() => setSelectedNeighborhood('All Areas')}
                className="mt-3 text-xs font-bold px-4 py-2 rounded-xl bg-brand-black text-white"
              >
                Reset to All Areas
              </button>
            </div>
          )}
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl border border-brand-border/80 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-neutral-400" />
            <h3 className="text-lg font-bold text-brand-black">Frequently Asked Questions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {faqs.map((faq, i) => (
              <div key={i} className="space-y-2">
                <h4 className="text-sm font-bold text-brand-black">{faq.q}</h4>
                <p className="text-xs text-brand-secondary leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
