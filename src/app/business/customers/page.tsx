'use client';

import React, { useState, useEffect } from 'react';
import { store } from '@/lib/db/store';
import { Business, CustomerProfile } from '@/types';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { Button } from '@/components/ui/Button';
import { formatDatePretty } from '@/lib/utils';
import {
  Users,
  Search,
  Phone,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';

export default function BusinessCustomersPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshData = () => {
    const user = store.getCurrentUser();
    const allBiz = store.getAllBusinessesAdmin();
    const activeBiz = user.businessId
      ? store.getBusinessById(user.businessId) || allBiz[0]
      : allBiz[0];

    if (activeBiz) {
      setBusiness(activeBiz);
      setCustomers(store.getCustomersByBusinessId(activeBiz.id));
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = store.subscribe(() => refreshData());
    return unsub;
  }, []);

  const filtered = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
              Customers
            </h1>
            <p className="text-xs sm:text-sm text-brand-secondary mt-0.5">
              People who have booked appointments with your business
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name or phone..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-brand-border bg-white text-xs text-brand-black placeholder-neutral-400 focus:outline-hidden focus:border-brand-black"
            />
          </div>
        </div>

        {/* Customer Cards Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((cust) => (
              <div
                key={cust.id}
                className="p-5 rounded-2xl bg-white border border-brand-border hover:border-brand-black transition-all shadow-subtle flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-base text-brand-black">{cust.name}</h3>
                      <a href={`tel:${cust.phone}`} className="text-xs text-brand-secondary font-semibold hover:underline">
                        {cust.phone}
                      </a>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-surface-alt text-brand-black border border-brand-border">
                      {cust.totalBookings} {cust.totalBookings === 1 ? 'booking' : 'bookings'}
                    </span>
                  </div>

                  <div className="pt-3 space-y-1.5 text-xs text-brand-muted">
                    {cust.favoriteService && (
                      <p className="flex items-center gap-1.5 text-brand-black font-medium">
                        <Layers className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Most booked: {cust.favoriteService}</span>
                      </p>
                    )}
                    {cust.lastBookingDate && (
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Last visited: {formatDatePretty(cust.lastBookingDate)}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                  <a
                    href={`tel:${cust.phone}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-black hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Customer</span>
                  </a>

                  <a
                    href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Message on WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-brand-border space-y-3">
            <Users className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-bold text-brand-black">No customers found</h3>
            <p className="text-xs text-brand-secondary">
              Customer contact records and visit histories will automatically populate as appointments are booked.
            </p>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
