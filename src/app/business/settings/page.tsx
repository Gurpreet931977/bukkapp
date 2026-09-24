'use client';

import React, { useState, useEffect } from 'react';
import { store } from '@/lib/db/store';
import { Business } from '@/types';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatDatePretty } from '@/lib/utils';
import {
  Settings,
  Bell,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

export default function BusinessSettingsPage() {
  const getInitialBiz = () => {
    const user = store.getCurrentUser();
    const allBiz = store.getAllBusinessesAdmin();
    return user.businessId ? store.getBusinessById(user.businessId) || allBiz[0] : allBiz[0];
  };

  const [business, setBusiness] = useState<Business | null>(getInitialBiz);
  const [isPaused, setIsPaused] = useState(() => !getInitialBiz()?.active);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const refreshData = () => {
    const user = store.getCurrentUser();
    const allBiz = store.getAllBusinessesAdmin();
    const activeBiz = user.businessId
      ? store.getBusinessById(user.businessId) || allBiz[0]
      : allBiz[0];

    if (activeBiz) {
      setBusiness(activeBiz);
      setIsPaused(!activeBiz.active);
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = store.subscribe(() => refreshData());
    return unsub;
  }, []);

  const handleTogglePause = () => {
    if (!business) return;
    const newActive = isPaused; // unpausing makes it active
    store.updateBusinessProfile(business.id, { active: newActive });
    setIsPaused(!newActive);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleActivateVerification = () => {
    if (!business) return;
    store.activateVerificationSubscription(business.id);
    setVerificationFeedback('30-Day Free Trial activated! Your storefront is now verified.');
    setTimeout(() => setVerificationFeedback(null), 3500);
  };

  const handleCancelVerification = () => {
    if (!business) return;
    store.cancelVerificationSubscription(business.id);
    setVerificationFeedback('Verified subscription paused. You can reactivate anytime.');
    setTimeout(() => setVerificationFeedback(null), 3500);
  };

  return (
    <BusinessLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
            Business Settings
          </h1>
          <p className="text-xs sm:text-sm text-brand-secondary mt-0.5">
            Manage your account preferences, notification alerts, and storefront visibility
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            Settings updated successfully.
          </div>
        )}

        {/* Notifications Setting */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-muted flex items-center gap-2">
            <Bell className="w-4 h-4 text-neutral-500" />
            <span>Booking Notifications</span>
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-brand-surface-alt border border-brand-border cursor-pointer">
              <div>
                <p className="font-bold text-brand-black">In-App Dashboard Alerts</p>
                <p className="text-neutral-500">Receive instant alerts when a customer books or cancels</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-brand-black accent-brand-black" />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-brand-surface-alt border border-brand-border cursor-pointer">
              <div>
                <p className="font-bold text-brand-black">WhatsApp Booking Confirmations (Future)</p>
                <p className="text-neutral-500">Receive direct WhatsApp messages for every appointment</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-brand-black accent-brand-black" />
            </label>
          </div>
        </div>

        {/* Verification Feedback Notice */}
        {verificationFeedback && (
          <div className="p-4 rounded-2xl bg-brand-black text-brand-lime text-xs font-bold border border-brand-lime/30 shadow-subtle flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-brand-lime shrink-0" />
            <span>{verificationFeedback}</span>
          </div>
        )}

        {/* BUKKAPP Verified Merchant Subscription & Billing */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-brand-border">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-brand-black flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-black" />
                <span>BUKKAPP Verified Merchant Subscription</span>
              </h2>
              <p className="text-xs text-brand-secondary mt-0.5">
                Official trust badge, priority placement in search, and verified customer assurance
              </p>
            </div>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full w-max flex items-center gap-1.5 ${
                business?.verified
                  ? 'bg-brand-black text-brand-lime shadow-2xs'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {business?.verified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-lime" />
                  <span>
                    {business.verificationPlan?.status === 'free_trial'
                      ? 'Free Trial Active'
                      : 'Verified Active'}
                  </span>
                </>
              ) : (
                <span>Not Subscribed</span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-brand-surface-alt border border-brand-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-brand-muted">Monthly Plan</span>
              <p className="text-lg font-black text-brand-black">₹450 / month</p>
              <p className="text-[11px] text-brand-secondary">Includes 1st month free trial</p>
            </div>

            <div className="p-4 rounded-xl bg-brand-surface-alt border border-brand-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-brand-muted">Billing Cycle</span>
              <p className="text-lg font-black text-brand-black">
                {business?.verified
                  ? business.verificationPlan?.status === 'free_trial'
                    ? '30-Day Free Trial'
                    : 'Monthly Auto-Renewal'
                  : 'Pay Monthly'}
              </p>
              <p className="text-[11px] text-brand-secondary">
                {business?.verificationPlan?.trialEndsAt
                  ? `Trial ends ${formatDatePretty(business.verificationPlan.trialEndsAt.split('T')[0])}`
                  : 'Cancel or resume anytime'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-brand-surface-alt border border-brand-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-brand-muted">Trust Benefits</span>
              <p className="text-xs font-bold text-brand-black">Verified Checkmark Badge</p>
              <p className="text-[11px] text-brand-secondary">3x discovery boost in local searches</p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-brand-secondary">
              {business?.verified
                ? 'Your storefront is actively enjoying all verified merchant benefits.'
                : 'Activate now to begin your 30-day trial (₹0 charged today).'}
            </p>

            {business?.verified ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelVerification}
                className="text-xs font-bold text-red-700 border-red-200 hover:bg-red-50 shrink-0"
              >
                <span>Cancel Subscription</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleActivateVerification}
                className="text-xs font-black bg-brand-lime text-brand-black hover:bg-[#cbf000] shrink-0 gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-black" />
                <span>Activate 30-Day Trial (₹0 Today)</span>
              </Button>
            )}
          </div>
        </div>

        {/* Danger Zone: Pause or Deactivate */}
        <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Storefront Visibility Control</span>
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-50/50 border border-red-200">
            <div>
              <p className="font-bold text-xs text-brand-black">
                {isPaused ? 'Your BUKKAPP page is currently PAUSED' : 'Your BUKKAPP page is LIVE and accepting bookings'}
              </p>
              <p className="text-[11px] text-brand-secondary mt-0.5">
                {isPaused
                  ? 'Customers cannot book appointments until you resume accepting bookings.'
                  : 'Temporarily pause bookings if you are on vacation or at maximum capacity.'}
              </p>
            </div>

            <Button
              variant={isPaused ? 'primary' : 'outline'}
              size="sm"
              onClick={handleTogglePause}
              className={`text-xs font-bold shrink-0 ${
                isPaused
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  : 'text-red-700 border-red-300 hover:bg-red-50'
              }`}
            >
              {isPaused ? 'Resume Bookings' : 'Pause Bookings'}
            </Button>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}
