'use client';

import React, { useState, useEffect } from 'react';
import { store } from '@/lib/db/store';
import { Business, Booking, Service } from '@/types';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { formatPrice, formatTime24to12, formatDatePretty } from '@/lib/utils';
import {
  CalendarCheck,
  Search,
  Plus,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Filter,
} from 'lucide-react';

export default function BusinessBookingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);

  // Manual booking form state
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualCustomerEmail, setManualCustomerEmail] = useState('');
  const [manualServiceId, setManualServiceId] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('18:00');
  const [manualNotes, setManualNotes] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  const refreshData = () => {
    const user = store.getCurrentUser();
    const allBiz = store.getAllBusinessesAdmin();
    const activeBiz = user.businessId
      ? store.getBusinessById(user.businessId) || allBiz[0]
      : allBiz[0];

    if (activeBiz) {
      setBusiness(activeBiz);
      setBookings(store.getBookingsByBusinessId(activeBiz.id));
      const srvs = store.getServicesByBusinessId(activeBiz.id);
      setServices(srvs);
      if (!manualServiceId && srvs.length > 0) {
        setManualServiceId(srvs[0].id);
      }
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = store.subscribe(() => refreshData());
    return unsub;
  }, []);

  const handleUpdateStatus = (bookingId: string, status: Booking['status']) => {
    store.updateBookingStatus(bookingId, status);
    refreshData();
  };

  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);

    const srv = services.find((s) => s.id === manualServiceId) || services[0];
    if (!business || !srv) {
      setManualError('Please select a service.');
      return;
    }

    try {
      store.createBookingAtomically({
        userId: 'usr-walkin',
        customerName: manualCustomerName,
        customerPhone: manualCustomerPhone,
        customerEmail: manualCustomerEmail || 'direct@bukkapp.in',
        business,
        service: srv,
        date: manualDate,
        startTime: manualTime,
        notes: manualNotes ? `Direct booking: ${manualNotes}` : 'Direct walk-in / phone booking',
      });
      setIsAddBookingModalOpen(false);
      setManualCustomerName('');
      setManualCustomerPhone('');
      refreshData();
    } catch (err: any) {
      setManualError(err.message || 'Slot collision occurred.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab !== 'all' && b.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q) ||
        b.serviceName.toLowerCase().includes(q) ||
        b.bookingReference.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
              Customer Bookings
            </h1>
            <p className="text-xs sm:text-sm text-brand-secondary mt-0.5">
              View and manage all appointments scheduled through your BUKKAPP page
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddBookingModalOpen(true)}
            className="font-bold text-xs bg-brand-black text-white gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add booking</span>
          </Button>
        </div>

        {/* Search & Tabs Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(
              [
                { key: 'all', label: `All (${bookings.length})` },
                { key: 'confirmed', label: `Upcoming (${bookings.filter((b) => b.status === 'confirmed').length})` },
                { key: 'completed', label: `Completed (${bookings.filter((b) => b.status === 'completed').length})` },
                { key: 'cancelled', label: `Cancelled (${bookings.filter((b) => b.status === 'cancelled').length})` },
                { key: 'no_show', label: 'No-show' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-brand-black text-white shadow-2xs'
                    : 'bg-white border border-brand-border text-brand-secondary hover:text-brand-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer or phone..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-brand-border bg-white text-xs text-brand-black placeholder-neutral-400 focus:outline-hidden focus:border-brand-black"
            />
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-3">
            {filteredBookings.map((bk) => (
              <div
                key={bk.id}
                className="p-5 rounded-2xl bg-white border border-brand-border hover:border-brand-black transition-all shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-brand-black">{bk.customerName}</span>
                    <span className="text-[10px] font-mono font-bold text-neutral-400 bg-brand-surface-alt px-2 py-0.5 rounded-md">
                      {bk.bookingReference}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        bk.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : bk.status === 'completed'
                          ? 'bg-neutral-100 text-neutral-600'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {bk.status}
                    </span>
                  </div>

                  <p className="text-xs text-brand-secondary">
                    <strong>{bk.serviceName}</strong> • {formatPrice(bk.servicePrice)} ({bk.durationMinutes} mins)
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-brand-muted pt-1">
                    <span className="flex items-center gap-1 font-semibold text-brand-black">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      {formatDatePretty(bk.date)} at {formatTime24to12(bk.startTime)}
                    </span>
                    <span>•</span>
                    <a href={`tel:${bk.customerPhone}`} className="hover:underline text-brand-black font-semibold">
                      {bk.customerPhone}
                    </a>
                    {bk.notes && <span>• Notes: {bk.notes}</span>}
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-brand-border/60">
                  <a
                    href={`tel:${bk.customerPhone}`}
                    className="p-2 rounded-xl border border-brand-border hover:bg-brand-surface-alt text-brand-black text-xs font-bold"
                    aria-label="Call customer"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  {bk.status === 'confirmed' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateStatus(bk.id, 'completed')}
                        className="text-xs font-bold bg-brand-black text-white"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span>Complete</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(bk.id, 'no_show')}
                        className="text-xs font-bold text-neutral-600 border-brand-border"
                      >
                        <span>No-show</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateStatus(bk.id, 'cancelled')}
                        className="text-xs font-bold text-red-700 hover:bg-red-50"
                      >
                        <span>Cancel</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-brand-border space-y-3">
            <CalendarCheck className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-bold text-brand-black">No bookings found in this view</h3>
            <p className="text-xs text-brand-secondary">
              When customers book through your BUKKAPP page or you record manual calls, they will appear here.
            </p>
          </div>
        )}
      </div>

      {/* MANUAL BOOKING MODAL */}
      <Modal
        isOpen={isAddBookingModalOpen}
        onClose={() => setIsAddBookingModalOpen(false)}
        title="Add a Booking Manually"
      >
        <form onSubmit={handleCreateManualBooking} className="space-y-4 pt-2">
          {manualError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-bold border border-red-200">
              {manualError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Customer Name</label>
            <input
              type="text"
              required
              value={manualCustomerName}
              onChange={(e) => setManualCustomerName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Phone Number</label>
              <input
                type="tel"
                required
                value={manualCustomerPhone}
                onChange={(e) => setManualCustomerPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
              />
            </div>
            <div>
              <CustomSelect
                label="Service"
                value={manualServiceId}
                onChange={setManualServiceId}
                options={services.map((s) => ({
                  label: `${s.name} (${formatPrice(s.price)})`,
                  value: s.id,
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Date</label>
              <input
                type="date"
                required
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Time</label>
              <input
                type="time"
                required
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
              />
            </div>
          </div>

          <div className="pt-3">
            <Button variant="primary" size="md" type="submit" className="w-full justify-center font-bold text-xs bg-brand-black text-white">
              <span>Save booking</span>
            </Button>
          </div>
        </form>
      </Modal>
    </BusinessLayout>
  );
}
