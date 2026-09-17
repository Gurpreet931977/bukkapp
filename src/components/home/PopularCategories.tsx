import React from 'react';
import Link from 'next/link';
import { INITIAL_CATEGORIES } from '@/lib/seed/data';
import { ArrowRight } from 'lucide-react';

const categoryImages: Record<string, string> = {
  'health-wellness': 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
  'beauty-grooming': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
  'fitness-sports': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=80',
  'home-services': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  'auto-care': 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=80',
};

export function PopularCategories() {
  return (
    <section id="categories" className="py-16 border-t border-brand-border/70 bg-[#FAFAF8] gsap-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-muted block mb-1">
              Visual Discovery
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
              Explore by Category
            </h2>
            <p className="text-xs sm:text-sm text-brand-secondary mt-1">
              Verified local specialists with live bookable schedules in Dehradun
            </p>
          </div>
          <Link
            href="/search"
            className="text-xs font-bold text-brand-black hover:text-neutral-600 flex items-center gap-1 group shrink-0"
          >
            <span>All listings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Editorial Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {INITIAL_CATEGORIES.map((category) => {
            const imgUrl = categoryImages[category.id] || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80';
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-brand-border/80 hover:border-brand-black transition-all shadow-subtle hover:shadow-card flex flex-col justify-between p-5 bg-neutral-900"
              >
                {/* Background Image with Dark Editorial Scrim */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={category.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                </div>

                {/* Top Badge */}
                <div className="relative z-10 flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-brand-black backdrop-blur-xs">
                    {category.count} Verified
                  </span>
                  <div className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-brand-lime group-hover:text-brand-black text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 space-y-1.5">
                  <h3 className="font-extrabold text-lg text-white tracking-tight leading-tight">
                    {category.name}
                  </h3>
                  <p className="text-xs text-neutral-300 line-clamp-1">
                    {category.popularServices.slice(0, 2).join(' • ')}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
