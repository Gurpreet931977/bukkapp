'use client';

// ============================================================================
// BUKKAPP For Business Partner Landing Portal
// If logged in as Merchant/Admin, navigates to Dashboard.
// Otherwise presents high-conversion merchant benefits & onboarding access.
// ============================================================================

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { BrandText, BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import {
  Store,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  LogIn,
} from 'lucide-react';

export default function BusinessPage() {
  const router = useRouter();
  const { user, role, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (role === 'business_owner' || role === 'admin')) {
      router.push('/business/dashboard');
    }
  }, [role, isLoading, router]);

  const features = [
    {
      icon: CalendarCheck,
      title: 'Real-Time Schedule Sync',
      desc: 'Automatic slot locking prevents schedule collisions and eliminates missed phone inquiries.',
    },
    {
      icon: TrendingUp,
      title: 'Local Customer Discovery',
      desc: 'Gain exposure to thousands of active customers across Rajpur Road, Jakhan, and Dehradun.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Merchant Trust',
      desc: 'Earn the official verified checkmark and collect genuine, verified customer reviews.',
    },
    {
      icon: Zap,
      title: 'Instant Confirmation',
      desc: 'Automatic booking confirmations with calendar downloads and zero platform commission during launch.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-brand-black text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C7F36B]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-bold text-[#C7F36B]">
            <Store className="w-3.5 h-3.5" />
            <span>BUKKAPP Merchant Partner Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight leading-tight">
            Turn your local business into a{' '}
            <span className="text-[#C7F36B] underline decoration-[#C7F36B]/40">
              bookable powerhouse.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Dentists, salons, turf arenas, plumbers, carpenters, and auto detailers across Dehradun use{' '}
            <BrandText /> to automate bookings, eliminate phone tag, and maximize weekly capacity.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href="/signup?role=business">
              <Button
                variant="accent"
                size="lg"
                className="w-full sm:w-auto font-extrabold text-sm px-8 py-4 shadow-lg"
              >
                <span>Register Your Business</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/login?tab=standard">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto font-bold text-sm px-8 py-4 border-neutral-700 text-white hover:bg-neutral-800"
              >
                <LogIn className="w-4 h-4 text-[#C7F36B]" />
                <span>Existing Merchant Sign In</span>
              </Button>
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-neutral-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#C7F36B]" /> 3-Minute Setup
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#C7F36B]" /> Zero Commission Launch Tier
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#C7F36B]" /> Cancel Anytime
            </span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-2">
            Built For Growth
          </p>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-brand-black">
            Everything your business needs to succeed
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border-2 border-brand-border/80 shadow-xs hover:border-brand-black hover:shadow-md transition-all space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#FAFDF4] border border-[#D5F58D] text-[#558B07] flex items-center justify-center">
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-black">{feat.title}</h3>
              <p className="text-xs text-brand-muted leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Onboarding Steps */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white rounded-3xl border-2 border-brand-border shadow-sm mb-12">
        <div className="text-center mb-10">
          <h3 className="text-xl font-display font-black text-brand-black">
            Get started in 3 simple steps
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-brand-black text-[#C7F36B] font-black text-sm flex items-center justify-center mx-auto">
              1
            </div>
            <h4 className="text-sm font-bold text-brand-black">Create Your Account</h4>
            <p className="text-xs text-brand-muted">
              Enter your business name, category, and contact details.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-brand-black text-[#C7F36B] font-black text-sm flex items-center justify-center mx-auto">
              2
            </div>
            <h4 className="text-sm font-bold text-brand-black">Add Services & Hours</h4>
            <p className="text-xs text-brand-muted">
              Select your service pricing, duration, and open time slots.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-brand-black text-[#C7F36B] font-black text-sm flex items-center justify-center mx-auto">
              3
            </div>
            <h4 className="text-sm font-bold text-brand-black">Receive Bookings</h4>
            <p className="text-xs text-brand-muted">
              Go live on BUKKAPP and receive confirmed customer appointments instantly.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-brand-border/60 text-center">
          <Link href="/signup?role=business">
            <Button variant="accent" size="lg" className="font-black px-8 py-3.5 shadow-md">
              <span>Start Business Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
