'use client';

// ============================================================================
// BUKKAPP Login Portal: Hybrid Auth System
// Free Phone OTP (Firebase) + Supabase PostgreSQL Engine + Master Admin Bypass
// ============================================================================

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { BrandLogo, BrandText } from '@/components/ui/BrandLogo';
import {
  Lock,
  Mail,
  Shield,
  ArrowRight,
  Sparkles,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { sanitizeText } from '@/lib/security/sanitize';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const defaultTab = searchParams.get('tab') === 'admin' ? 'admin' : 'phone';

  const { login, sendOtp, verifyOtp, loginMasterAdmin, isLoading } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'phone' | 'email' | 'admin'>(defaultTab);

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Admin state
  const [adminPasskey, setAdminPasskey] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Phone OTP - Step 1: Send SMS
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (!phoneNumber.trim() || phoneNumber.replace(/[^0-9]/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await sendOtp(phoneNumber);
      if (res.success) {
        setOtpSent(true);
        showToast('OTP Sent', 'success', 'Verification code dispatched to your mobile phone.');
      } else {
        setErrorMessage(res.error || 'Failed to dispatch verification code');
      }
    } catch {
      setErrorMessage('An unexpected error occurred sending OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Phone OTP - Step 2: Verify & Log In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await verifyOtp(otpCode);
      if (res.success && res.user) {
        showToast(`Welcome, ${res.user.name}`, 'success', 'Successfully logged in with verified mobile.');
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (res.user.role === 'admin') {
          router.push('/admin');
        } else if (res.user.role === 'business_owner') {
          router.push('/business/dashboard');
        } else {
          router.push('/account');
        }
      } else {
        setErrorMessage(res.error || 'Invalid OTP code');
      }
    } catch {
      setErrorMessage('OTP verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Email + Password
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const cleanEmail = sanitizeText(email).toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(cleanEmail, password);
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

  // 3. Admin Password
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const cleanPasskey = sanitizeText(adminPasskey);
    if (!cleanPasskey) {
      setErrorMessage('Please enter the admin password');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await loginMasterAdmin(cleanPasskey);
      if (result.success && result.user) {
        showToast('Admin Access Authorized', 'success', 'Entering Control Console.');
        router.push('/admin');
      } else {
        setErrorMessage(result.error || 'Invalid admin password');
      }
    } catch {
      setErrorMessage('Failed to authenticate as admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-[#FAFAF8]">
      {/* Invisible container for Firebase Phone Recaptcha */}
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-border shadow-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-block mb-3">
            <BrandLogo size="lg" />
          </div>
          <h1 className="text-2xl font-display font-black text-brand-black">
            Sign In to Bukkapp
          </h1>
          <p className="text-xs text-brand-muted mt-1 font-medium">
            Universal real-time local bookings & appointments
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 rounded-2xl mb-6 border border-brand-border/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab('phone');
              setErrorMessage('');
            }}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
              activeTab === 'phone'
                ? 'bg-white text-brand-black shadow-xs font-extrabold'
                : 'text-brand-muted hover:text-brand-black'
            }`}
          >
            Phone OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('email');
              setErrorMessage('');
            }}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
              activeTab === 'email'
                ? 'bg-white text-brand-black shadow-xs font-extrabold'
                : 'text-brand-muted hover:text-brand-black'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setErrorMessage('');
            }}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
              activeTab === 'admin'
                ? 'bg-brand-black text-white shadow-xs font-extrabold'
                : 'text-brand-muted hover:text-brand-black'
            }`}
          >
            I am admin
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2.5 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Phone OTP Form */}
        {activeTab === 'phone' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-black mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500">
                      +91
                    </div>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full pl-12 pr-4 py-2.5 text-base sm:text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all tracking-wide"
                    />
                  </div>
                  <p className="text-[11px] text-brand-muted mt-1.5">
                    We will send a 6-digit SMS verification code to this number.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  isLoading={isSubmitting || isLoading}
                  className="w-full font-bold shadow-md text-sm mt-2"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  <span>Send Verification Code</span>
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-neutral-50 rounded-xl border border-brand-border text-center">
                  <p className="text-xs text-brand-muted">Verification code sent to</p>
                  <p className="text-sm font-extrabold text-brand-black mt-0.5">+91 {phoneNumber}</p>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[11px] text-brand-secondary underline mt-1 font-semibold"
                  >
                    Change Number
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-black mb-1.5">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="••••••"
                    className="w-full py-3 text-center text-lg font-black tracking-widest rounded-xl bg-neutral-50 border-2 border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  isLoading={isSubmitting || isLoading}
                  className="w-full font-bold shadow-md text-sm mt-2"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  <span>Verify & Sign In</span>
                </Button>
              </form>
            )}
          </div>
        )}

        {/* 2. Email Form */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                  className="w-full pl-10 pr-4 py-2.5 text-base sm:text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
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
                  className="w-full pl-10 pr-4 py-2.5 text-base sm:text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
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
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        )}

        {/* 3. Admin Form */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-neutral-900 text-white border border-neutral-800">
              <div className="flex items-center gap-2 mb-1 text-xs font-bold text-[#C7F36B]">
                <Shield className="w-4 h-4" />
                <span>Restricted Operations Console</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Enter your administrative password to access marketplace oversight, moderation, and full store management.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="password"
                  required
                  value={adminPasskey}
                  onChange={(e) => setAdminPasskey(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-4 py-2.5 text-base sm:text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-mono font-medium transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting || isLoading}
              className="w-full font-bold bg-brand-black text-white hover:bg-neutral-800 shadow-md text-sm mt-2"
            >
              <Shield className="w-4 h-4 mr-1 text-[#C7F36B]" />
              <span>Authorize Admin</span>
            </Button>
          </form>
        )}

        {/* Sign Up Direct Link */}
        <div className="mt-6 text-center text-xs text-brand-muted">
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="font-extrabold text-brand-black underline hover:text-neutral-700">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-xs font-bold">Loading Login...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
