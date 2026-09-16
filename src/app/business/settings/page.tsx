'use client';

import React, { useState, useEffect } from 'react';
import { store } from '@/lib/db/store';
import { Business } from '@/types';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { Button } from '@/components/ui/Button';
import {
  Settings,
  Bell,
  Lock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function BusinessSettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
