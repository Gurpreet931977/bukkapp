'use client';

// ============================================================================
// BUKKAPP Login Portal
// Unified authentication for Customers, Merchants, and Master Administrators
// ============================================================================

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { BrandLogo, BrandText } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Store,
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const defaultTab = searchParams.get('tab') === 'admin' ? 'admin' : 'standard';

  const { login, loginMasterAdmin, isLoading } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'standard' | 'admin'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1-Click test credentials helper
  const handleQuickFill = (type: 'customer' | 'merchant' | 'admin') => {
    setErrorMessage('');
    if (type === 'customer') {
      setActiveTab('standard');
      setEmail('gurpreet@bukkapp.in');
      setPassword('customer123');
    } else if (type === 'merchant') {
      setActiveTab('standard');
      setEmail('arjun@smilestudio.in');
      setPassword('merchant123');
    } else if (type === 'admin') {
      setActiveTab('admin');
      setAdminPasskey('admin123');
    }
  };

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password);
      if (result.success && result.user) {
        showToast(`Welcome back, ${result.user.name}`, 'success', 'Successfully signed in.');

        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (result.user.role === 'admin') {
          router.push('/admin');
        } else if (result.user.role === 'business_owner') {
          router.push('/business/dashboard');
        } else {
          router.push('/account');
        }
      } else {
        setErrorMessage(result.error || 'Invalid credentials');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (!adminPasskey.trim()) {
      setErrorMessage('Please enter the Master Admin passkey');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await loginMasterAdmin(adminPasskey);
      if (result.success && result.user) {
        showToast('Admin Access Authorized', 'success', 'Entering Master Control Console.');
        router.push('/admin');
      } else {
        setErrorMessage(result.error || 'Invalid admin passkey');
      }
    } catch {
      setErrorMessage('Failed to authenticate as Master Admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-[#FAFAF8]">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-border shadow-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-block mb-3">
            <BrandLogo size="lg" />
          </div>
          <h1 className="text-2xl font-display font-black text-brand-black">
            Sign In to <BrandText />
          </h1>
          <p className="text-xs text-brand-muted mt-1 font-medium">
            Universal local bookings in Dehradun
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-2xl mb-6 border border-brand-border/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab('standard');
              setErrorMessage('');
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'standard'
                ? 'bg-white text-brand-black shadow-xs font-extrabold'
                : 'text-brand-muted hover:text-brand-black'
            }`}
          >
            User & Merchant
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setErrorMessage('');
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'admin'
                ? 'bg-brand-black text-white shadow-xs font-extrabold'
                : 'text-brand-muted hover:text-brand-black'
            }`}
          >
            Master Admin
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2.5 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Standard User / Merchant Form */}
        {activeTab === 'standard' ? (
          <form onSubmit={handleStandardSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-black mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-brand-black">Password</label>
                <span className="text-[11px] text-brand-muted">Min 6 characters</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={isSubmitting || isLoading}
              className="w-full font-bold shadow-md text-sm mt-2"
            >
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          /* Master Admin Passkey Form */
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-black mb-1.5">
                Master Administrator Passkey
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="password"
                  required
                  value={adminPasskey}
                  onChange={(e) => setAdminPasskey(e.target.value)}
                  placeholder="Enter admin passkey (e.g. admin123)"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
                />
              </div>
              <p className="text-[11px] text-brand-muted mt-1.5">
                Restricted to authorized system operators only.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting || isLoading}
              className="w-full font-bold shadow-md text-sm mt-2"
            >
              <span>Unlock Admin Console</span>
              <ArrowRight className="w-4 h-4 text-brand-lime" />
            </Button>
          </form>
        )}

        {/* Quick Fill Fast Switcher for Testing */}
        <div className="mt-6 pt-5 border-t border-brand-border/60">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted text-center mb-2.5">
            Quick Fill Test Accounts
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              className="py-1.5 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-brand-black text-[11px] font-bold border border-brand-border transition-all text-center truncate"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('merchant')}
              className="py-1.5 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-brand-black text-[11px] font-bold border border-brand-border transition-all text-center truncate"
            >
              Merchant
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="py-1.5 px-2 rounded-lg bg-[#FAFDF4] hover:bg-[#F0FBD4] text-[#427003] text-[11px] font-extrabold border border-[#D5F58D] transition-all text-center truncate"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 text-center text-xs text-brand-muted">
          Don't have an account?{' '}
          <Link
            href={`/signup${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-brand-black font-extrabold hover:underline"
          >
            Create one for free
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-brand-muted">
          Loading authentication portal...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
