'use client';

// ============================================================================
// BUKKAPP Registration Portal
// Dedicated onboarding workflows for Customers and Business Merchants
// ============================================================================

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { BrandLogo, BrandText } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { store } from '@/lib/db/store';
import { Category } from '@/types';
import {
  User,
  Store,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Tag,
} from 'lucide-react';

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'business' ? 'business' : 'customer';

  const { signupCustomer, signupBusiness, isLoading } = useAuth();
  const { showToast } = useToast();

  const [accountType, setAccountType] = useState<'customer' | 'business'>(defaultRole);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer Form State
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custPassword, setCustPassword] = useState('');

  // Business Form State
  const [bizOwnerName, setBizOwnerName] = useState('');
  const [bizName, setBizName] = useState('');
  const [bizCategory, setBizCategory] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizCity, setBizCity] = useState('Dehradun');
  const [bizPassword, setBizPassword] = useState('');

  useEffect(() => {
    const cats = store.getCategories();
    setCategories(cats);
    if (cats.length > 0 && !bizCategory) {
      setBizCategory(cats[0].id);
    }
  }, [bizCategory]);

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (!custName.trim()) {
      setErrorMessage('Please enter your full name');
      setIsSubmitting(false);
      return;
    }

    if (!custEmail.trim() || !custEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signupCustomer({
        name: custName,
        email: custEmail,
        phone: custPhone,
        password: custPassword,
      });

      if (result.success && result.user) {
        showToast(`Welcome, ${result.user.name}!`, 'success', 'Your BUKKAPP customer account has been created.');
        router.push('/account');
      } else {
        setErrorMessage(result.error || 'Failed to create account');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (!bizOwnerName.trim()) {
      setErrorMessage('Please enter the business owner name');
      setIsSubmitting(false);
      return;
    }

    if (!bizName.trim()) {
      setErrorMessage('Please enter your registered business or clinic name');
      setIsSubmitting(false);
      return;
    }

    if (!bizEmail.trim() || !bizEmail.includes('@')) {
      setErrorMessage('Please enter a valid business contact email');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signupBusiness({
        ownerName: bizOwnerName,
        businessName: bizName,
        categoryId: bizCategory || categories[0]?.id || 'health-wellness',
        email: bizEmail,
        phone: bizPhone,
        address: bizAddress,
        city: bizCity,
        password: bizPassword,
      });

      if (result.success && result.business) {
        showToast('Storefront Registered!', 'success', `Welcome ${bizName}. Let us complete your store setup.`);
        router.push('/business/onboarding');
      } else {
        setErrorMessage(result.error || 'Failed to register business');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during merchant registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 sm:p-6 bg-[#FAFAF8]">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-border shadow-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-block mb-3">
            <BrandLogo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-brand-black">
            Create Your <BrandText /> Account
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1 font-medium">
            Join Dehradun's real-time local booking network
          </p>
        </div>

        {/* Account Type Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              setAccountType('customer');
              setErrorMessage('');
            }}
            className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
              accountType === 'customer'
                ? 'border-brand-black bg-[#FAFDF4] shadow-sm'
                : 'border-brand-border/80 hover:border-brand-border bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  accountType === 'customer' ? 'bg-brand-black text-brand-lime' : 'bg-neutral-100 text-brand-muted'
                }`}
              >
                <User className="w-4 h-4" />
              </div>
              {accountType === 'customer' && (
                <CheckCircle2 className="w-4 h-4 text-[#558B07]" />
              )}
            </div>
            <p className="text-sm font-extrabold text-brand-black">Customer</p>
            <p className="text-[11px] text-brand-muted font-medium mt-0.5">
              Book local appointments in seconds
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setAccountType('business');
              setErrorMessage('');
            }}
            className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
              accountType === 'business'
                ? 'border-brand-black bg-[#FAFDF4] shadow-sm'
                : 'border-brand-border/80 hover:border-brand-border bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  accountType === 'business' ? 'bg-brand-black text-brand-lime' : 'bg-neutral-100 text-brand-muted'
                }`}
              >
                <Store className="w-4 h-4" />
              </div>
              {accountType === 'business' && (
                <CheckCircle2 className="w-4 h-4 text-[#558B07]" />
              )}
            </div>
            <p className="text-sm font-extrabold text-brand-black">Business Merchant</p>
            <p className="text-[11px] text-brand-muted font-medium mt-0.5">
              List services & accept bookings
            </p>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2.5 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* CUSTOMER REGISTRATION FORM */}
        {accountType === 'customer' ? (
          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-black mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Gurpreet Singh"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-brand-black mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  <input
                    type="email"
                    required
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-black mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  <input
                    type="tel"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="password"
                  value={custPassword}
                  onChange={(e) => setCustPassword(e.target.value)}
                  placeholder="Create secure password"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={isSubmitting || isLoading}
              className="w-full font-bold shadow-md text-sm mt-3"
            >
              <span>Create Customer Account</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          /* BUSINESS MERCHANT REGISTRATION FORM */
          <form onSubmit={handleBusinessSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-brand-black mb-1.5">
                  Owner / Representative Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  <input
                    type="text"
                    required
                    value={bizOwnerName}
                    onChange={(e) => setBizOwnerName(e.target.value)}
                    placeholder="e.g. Dr. Arjun Verma"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-black mb-1.5">
                  Business / Clinic Name
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  <input
                    type="text"
                    required
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    placeholder="e.g. Zenith Sports Club"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-brand-black mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  <select
                    value={bizCategory}
                    onChange={(e) => setBizCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all appearance-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-black mb-1.5">
                  Business Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  <input
                    type="tel"
                    required
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                    placeholder="+91 98123 00000"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-1.5">
                Official Business Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="email"
                  required
                  value={bizEmail}
                  onChange={(e) => setBizEmail(e.target.value)}
                  placeholder="contact@yourbusiness.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-brand-black mb-1.5">
                  Street / Area Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  <input
                    type="text"
                    value={bizAddress}
                    onChange={(e) => setBizAddress(e.target.value)}
                    placeholder="e.g. Rajpur Road, Jakhan"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-black mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={bizCity}
                  onChange={(e) => setBizCity(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-neutral-100 border border-brand-border text-brand-black font-semibold cursor-not-allowed"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="password"
                  value={bizPassword}
                  onChange={(e) => setBizPassword(e.target.value)}
                  placeholder="Create business password"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-neutral-50 border border-brand-border focus:border-brand-black focus:bg-white focus:outline-hidden font-medium transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={isSubmitting || isLoading}
              className="w-full font-bold shadow-md text-sm mt-3"
            >
              <span>Register Business & Launch Console</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {/* Footer links */}
        <div className="mt-6 text-center text-xs text-brand-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-black font-extrabold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-brand-muted">
          Loading registration portal...
        </div>
      }
    >
      <SignupFormContent />
    </Suspense>
  );
}
