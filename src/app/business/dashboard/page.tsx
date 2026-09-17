'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import { Business, Booking, Service, BlockedTime } from '@/types';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { formatPrice, formatTime24to12, formatDatePretty } from '@/lib/utils';
import {
  CalendarCheck,
  Clock,
  Eye,
  Users,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Share2,
  ExternalLink,
  Store,
  Zap,
  Phone,
  AlertCircle,
} from 'lucide-react';

export default function BusinessDashboardPage() {
  const [business, setBusiness] = useState<Business | null>(() => {
    const all = store.getAllBusinessesAdmin();
    const u = store.getCurrentUser();
    return u?.businessId ? store.getBusinessById(u.businessId) || all[0] : all[0];
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  // Manual booking form state
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualCustomerEmail, setManualCustomerEmail] = useState('');
  const [manualServiceId, setManualServiceId] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('18:00');
  const [manualNotes, setManualNotes] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualSuccess, setManualSuccess] = useState(false);

  // Quick service form state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('45');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  const refreshData = () => {
    const user = store.getCurrentUser();
    const allBiz = store.getAllBusinessesAdmin();
    const activeBiz = user.businessId
      ? store.getBusinessById(user.businessId) || allBiz[0]
      : allBiz[0];

    if (activeBiz) {
      setBusiness(activeBiz);
      setBookings(store.getBookingsByBusinessId(activeBiz.id));
      setServices(store.getServicesByBusinessId(activeBiz.id));
      if (!manualServiceId && services.length > 0) {
        setManualServiceId(services[0].id);
      }
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = store.subscribe(() => {
      refreshData();
    });
    return unsub;
  }, []);

  if (!business) {
    return (
      <BusinessLayout>
        <div className="py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-brand-black">No Business Profile Found</h2>
          <Link href="/business/onboarding">
            <Button variant="primary" size="md">Set up your business page</Button>
          </Link>
        </div>
      </BusinessLayout>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.date === todayStr && b.status !== 'cancelled');
  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed');
  const nextBooking = upcomingBookings[0];

  const handleUpdateBookingStatus = (bookingId: string, status: Booking['status']) => {
    store.updateBookingStatus(bookingId, status);
    refreshData();
  };

  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);

    const srv = services.find((s) => s.id === manualServiceId) || services[0];
    if (!srv) {
      setManualError('Please add a service first.');
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
      setManualSuccess(true);
      setTimeout(() => {
        setManualSuccess(false);
        setIsAddBookingModalOpen(false);
        setManualCustomerName('');
        setManualCustomerPhone('');
      }, 1200);
    } catch (err: any) {
      setManualError(err.message || 'Slot collision occurred.');
    }
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice) return;

    store.addService({
      businessId: business.id,
      name: newServiceName.trim(),
      description: newServiceDesc.trim() || 'Professional service by certified specialists.',
      price: parseInt(newServicePrice, 10),
      durationMinutes: parseInt(newServiceDuration, 10) || 45,
      active: true,
    });

    setIsAddServiceModalOpen(false);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDesc('');
  };

  return (
    <BusinessLayout>
      <div className="space-y-8">
        {/* PERSONALIZED BUSINESS CARD */}
        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={business.coverImage}
              alt={business.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-brand-border shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
                  {business.subcategory}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    business.status === 'active'
                      ? 'bg-brand-lime text-brand-black'
                      : business.status === 'needs_changes'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {business.status === 'active' ? 'Live & Bookable' : business.status.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
                {business.name}
              </h1>
              <p className="text-xs text-brand-secondary">
                {business.address}, {business.neighborhood}, Dehradun
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Link href={`/business/${business.slug}`} target="_blank" className="flex-1 md:flex-initial">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View my page</span>
              </Button>
            </Link>
            <Link href="/business/profile" className="flex-1 md:flex-initial">
              <Button variant="primary" size="sm" className="w-full text-xs font-bold bg-brand-black text-white">
                <span>Edit page</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* NOTIFICATION / ACTION REQUIRED BANNER */}
        {business.status === 'needs_changes' && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-900">Action Required Before Page Publication</h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                {business.changeRequestReason || 'Please update your business hours and photos.'}
              </p>
              <Link href="/business/profile" className="inline-block pt-1 text-xs font-bold text-amber-950 underline">
                Fix business details now
              </Link>
            </div>
          </div>
        )}

        {/* BUSINESS PROFILE COMPLETION BAR */}
        {(() => {
          const checks = [
            { label: 'Basic Info & Tagline', done: Boolean(business.name && business.tagline), weight: 20, link: '/business/profile' },
            { label: 'Cover Photo', done: Boolean(business.coverImage), weight: 20, link: '/business/profile' },
            { label: 'At least 1 Service', done: services.length > 0, weight: 25, link: '/business/services' },
            { label: 'Weekly Schedule', done: business.schedule && business.schedule.some((d) => d.isOpen), weight: 20, link: '/business/availability' },
            { label: 'Contact Phone & Email', done: Boolean(business.phone && business.email), weight: 15, link: '/business/profile' },
          ];
          const completedScore = checks.filter((c) => c.done).reduce((acc, curr) => acc + curr.weight, 0);
          const missingChecks = checks.filter((c) => !c.done);

          if (completedScore === 100) return null;

          return (
            <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-black flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Storefront Profile Completion: {completedScore}%</span>
                  </h3>
                  <p className="text-[11px] text-brand-secondary mt-0.5">
                    Complete your setup to maximize customer booking conversion in {business.neighborhood}
                  </p>
                </div>
                <span className="text-xs font-black text-brand-black">{completedScore}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-brand-surface-alt overflow-hidden border border-brand-border/40">
                <div
                  className="h-full bg-brand-lime transition-all duration-300 rounded-full"
                  style={{ width: `${completedScore}%` }}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {missingChecks.map((m) => (
                  <Link
                    key={m.label}
                    href={m.link}
                    className="text-[11px] font-bold px-3 py-1 rounded-xl bg-brand-surface-alt hover:bg-neutral-200 text-brand-black border border-brand-border transition-colors flex items-center gap-1"
                  >
                    <span>+ Add {m.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* GREETING & SUMMARY HEADER */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-black tracking-tight">
            Good day, {business.name.split(' ')[0]}
          </h2>
          <p className="text-xs sm:text-sm text-brand-secondary mt-0.5">
            You have <strong className="text-brand-black">{todayBookings.length} bookings</strong> scheduled for today.
          </p>
        </div>

        {/* 4 CORE METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-subtle space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>Today&apos;s Bookings</span>
            </span>
            <p className="text-2xl sm:text-3xl font-black text-brand-black">{todayBookings.length}</p>
            <p className="text-[11px] text-brand-secondary font-medium">
              {bookings.filter((b) => b.status === 'confirmed').length} upcoming total
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-subtle space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Open Slots Today</span>
            </span>
            <p className="text-2xl sm:text-3xl font-black text-brand-black">6</p>
            <p className="text-[11px] text-emerald-800 font-semibold">Available for instant booking</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-subtle space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-neutral-400" />
              <span>Page Visitors</span>
            </span>
            <p className="text-2xl sm:text-3xl font-black text-brand-black">{business.pageViewsThisWeek || 140}</p>
            <p className="text-[11px] text-brand-secondary font-medium">This week</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-subtle space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-neutral-400" />
              <span>Customer Base</span>
            </span>
            <p className="text-2xl sm:text-3xl font-black text-brand-black">{bookings.length + 8}</p>
            <p className="text-[11px] text-brand-secondary font-medium">Repeat rate: 64%</p>
          </div>
        </div>

        {/* NEXT UPCOMING BOOKING SPOTLIGHT */}
        {nextBooking ? (
          <div className="p-6 rounded-2xl bg-brand-black text-white border border-neutral-800 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-[10px] font-black uppercase tracking-wider text-brand-lime">
                <Clock className="w-3 h-3 text-brand-lime" />
                <span>Next Upcoming Booking</span>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {formatTime24to12(nextBooking.startTime)} • {nextBooking.customerName}
              </h3>
              <p className="text-xs text-neutral-300">
                {nextBooking.serviceName} ({nextBooking.durationMinutes} mins) • {formatDatePretty(nextBooking.date)}
              </p>
              {nextBooking.resourceName && (
                <p className="text-xs text-brand-lime font-bold">Assigned: {nextBooking.resourceName}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`tel:${nextBooking.customerPhone}`}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Customer</span>
              </a>
              <Button
                variant="accent"
                size="sm"
                onClick={() => handleUpdateBookingStatus(nextBooking.id, 'completed')}
                className="text-xs font-bold bg-brand-lime text-brand-black"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                <span>Mark Completed</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white border border-brand-border p-6 text-center space-y-2">
            <p className="text-sm font-bold text-brand-black">No upcoming bookings right now</p>
            <p className="text-xs text-brand-secondary">Share your booking link to fill open time slots.</p>
          </div>
        )}

        {/* QUICK ACTIONS BAR */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-brand-muted">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setIsAddBookingModalOpen(true)}
              className="p-4 rounded-2xl bg-white hover:bg-brand-surface-alt border border-brand-border text-left transition-all shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-black text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <p className="font-extrabold text-xs text-brand-black">Add booking</p>
              <p className="text-[10px] text-brand-secondary">Record a direct phone call</p>
            </button>

            <button
              onClick={() => setIsAddServiceModalOpen(true)}
              className="p-4 rounded-2xl bg-white hover:bg-brand-surface-alt border border-brand-border text-left transition-all shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-black text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <p className="font-extrabold text-xs text-brand-black">Add a service</p>
              <p className="text-[10px] text-brand-secondary">Create a new offering</p>
            </button>

            <Link
              href="/business/availability"
              className="p-4 rounded-2xl bg-white hover:bg-brand-surface-alt border border-brand-border text-left transition-all shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-black text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <p className="font-extrabold text-xs text-brand-black">Change availability</p>
              <p className="text-[10px] text-brand-secondary">Update hours or block time</p>
            </Link>

            <Link
              href="/business/profile"
              className="p-4 rounded-2xl bg-white hover:bg-brand-surface-alt border border-brand-border text-left transition-all shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-black text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Store className="w-4 h-4" />
              </div>
              <p className="font-extrabold text-xs text-brand-black">Edit my page</p>
              <p className="text-[10px] text-brand-secondary">Photos, description, info</p>
            </Link>
          </div>
        </div>

        {/* RECENT BOOKINGS TABLE */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-brand-black tracking-tight">
                Recent Bookings ({bookings.length})
              </h3>
              <p className="text-xs text-brand-secondary">All incoming customer appointments</p>
            </div>
            <Link href="/business/bookings" className="text-xs font-bold text-brand-black hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-border text-[10px] uppercase font-bold text-brand-muted">
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Service</th>
                  <th className="py-3 pr-4">Date & Time</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {bookings.slice(0, 5).map((bk) => (
                  <tr key={bk.id} className="hover:bg-brand-surface-alt/50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-bold text-brand-black">{bk.customerName}</p>
                      <p className="text-[11px] text-neutral-400">{bk.customerPhone}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-brand-black">{bk.serviceName}</p>
                      <p className="text-[11px] text-brand-muted">{formatPrice(bk.servicePrice)} • {bk.durationMinutes}m</p>
                    </td>
                    <td className="py-3 pr-4 font-medium text-brand-black">
                      {formatDatePretty(bk.date)} at {formatTime24to12(bk.startTime)}
                    </td>
                    <td className="py-3 pr-4">
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
                    </td>
                    <td className="py-3 text-right">
                      {bk.status === 'confirmed' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateBookingStatus(bk.id, 'completed')}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg bg-brand-surface-alt hover:bg-brand-lime hover:text-brand-black text-brand-black border border-brand-border"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(bk.id, 'cancelled')}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg bg-brand-surface-alt hover:bg-red-50 hover:text-red-700 text-neutral-500 border border-brand-border"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QUICK ADD BOOKING MODAL */}
      <Modal
        isOpen={isAddBookingModalOpen}
        onClose={() => setIsAddBookingModalOpen(false)}
        title="Add a Booking Manually"
      >
        <form onSubmit={handleCreateManualBooking} className="space-y-4 pt-2">
          <p className="text-xs text-brand-secondary">
            Use this when a customer calls you or books in-person so your BUKKAPP schedule stays accurate.
          </p>

          {manualError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-bold border border-red-200">
              {manualError}
            </div>
          )}

          {manualSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              Booking successfully recorded!
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

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Notes (Optional)</label>
            <input
              type="text"
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              placeholder="e.g. Requested court 2, bringing equipment"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
            />
          </div>

          <div className="pt-3">
            <Button variant="primary" size="md" type="submit" className="w-full justify-center font-bold text-xs bg-brand-black text-white">
              <span>Confirm and lock slot</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* QUICK ADD SERVICE MODAL */}
      <Modal
        isOpen={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
        title="Add a Service"
      >
        <form onSubmit={handleCreateService} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Service Name</label>
            <input
              type="text"
              required
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              placeholder="e.g. Standard Court Session (60m)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Price (INR)</label>
              <input
                type="number"
                required
                min="0"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                placeholder="600"
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
              />
            </div>
            <div>
              <CustomSelect
                label="Duration"
                value={newServiceDuration}
                onChange={setNewServiceDuration}
                options={[
                  { label: '15 mins', value: '15' },
                  { label: '30 mins', value: '30' },
                  { label: '45 mins', value: '45' },
                  { label: '60 mins', value: '60' },
                  { label: '90 mins', value: '90' },
                  { label: '120 mins', value: '120' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Description</label>
            <textarea
              rows={2}
              value={newServiceDesc}
              onChange={(e) => setNewServiceDesc(e.target.value)}
              placeholder="What does this service include?"
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
            />
          </div>

          <div className="pt-2">
            <Button variant="primary" size="md" type="submit" className="w-full justify-center font-bold text-xs bg-brand-black text-white">
              <span>Save and publish service</span>
            </Button>
          </div>
        </form>
      </Modal>
    </BusinessLayout>
  );
}
