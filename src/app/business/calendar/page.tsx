'use client';

import React, { useState, useEffect } from 'react';
import { store } from '@/lib/db/store';
import { Business, Booking, BlockedTime } from '@/types';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatPrice, formatTime24to12, formatDatePretty } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Trash2,
} from 'lucide-react';

export default function BusinessCalendarPage() {
  const [business, setBusiness] = useState<Business | null>(() => {
    const all = store.getAllBusinessesAdmin();
    const u = store.getCurrentUser();
    return u?.businessId ? store.getBusinessById(u.businessId) || all[0] : all[0];
  });
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const all = store.getAllBusinessesAdmin();
    const u = store.getCurrentUser();
    const activeBiz = u?.businessId ? store.getBusinessById(u.businessId) || all[0] : all[0];
    return activeBiz ? store.getBookingsByBusinessId(activeBiz.id) : [];
  });
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>(() => {
    const all = store.getAllBusinessesAdmin();
    const u = store.getCurrentUser();
    const activeBiz = u?.businessId ? store.getBusinessById(u.businessId) || all[0] : all[0];
    return activeBiz ? store.getBlockedTimesByBusinessId(activeBiz.id) : [];
  });
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isBlockTimeModalOpen, setIsBlockTimeModalOpen] = useState(false);

  // Block time form
  const [blockReason, setBlockReason] = useState('');
  const [blockStartTime, setBlockStartTime] = useState('13:00');
  const [blockEndTime, setBlockEndTime] = useState('14:30');

  const refreshData = () => {
    const user = store.getCurrentUser();
    const allBiz = store.getAllBusinessesAdmin();
    const activeBiz = user.businessId
      ? store.getBusinessById(user.businessId) || allBiz[0]
      : allBiz[0];

    if (activeBiz) {
      setBusiness(activeBiz);
      setBookings(store.getBookingsByBusinessId(activeBiz.id));
      setBlockedTimes(store.getBlockedTimesByBusinessId(activeBiz.id));
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = store.subscribe(() => refreshData());
    return unsub;
  }, []);

  const handleDateChange = (daysToAdd: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + daysToAdd);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleAddBlockedTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    store.addBlockedTime(
      business.id,
      `${selectedDate}T${blockStartTime}:00`,
      `${selectedDate}T${blockEndTime}:00`,
      blockReason.trim() || 'Temporary Closure / Blocked Schedule'
    );

    setIsBlockTimeModalOpen(false);
    setBlockReason('');
    refreshData();
  };

  const handleDeleteBlockedTime = (id: string) => {
    store.deleteBlockedTime(id);
    refreshData();
  };

  const dayBookings = bookings.filter((b) => b.date === selectedDate && b.status !== 'cancelled');
  const dayBlockedTimes = blockedTimes.filter((blk) => blk.startDatetime.startsWith(selectedDate));

  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
  ];

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
              Schedule & Calendar
            </h1>
            <p className="text-xs sm:text-sm text-brand-secondary mt-0.5">
              Visual timeline of appointments, working hours, and blocked times
            </p>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={() => setIsBlockTimeModalOpen(true)}
            className="font-bold text-xs border-brand-border hover:border-brand-black gap-1.5"
          >
            <ShieldAlert className="w-4 h-4 text-neutral-600" />
            <span>Block time</span>
          </Button>
        </div>

        {/* Date Navigator Strip */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border flex items-center justify-between gap-4 shadow-subtle">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-2 rounded-xl hover:bg-brand-surface-alt text-brand-black border border-brand-border"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <p className="text-base sm:text-lg font-black text-brand-black">
              {formatDatePretty(selectedDate)}
            </p>
            <p className="text-[11px] text-brand-secondary font-medium">
              {dayBookings.length} bookings • {dayBlockedTimes.length} blocked periods
            </p>
          </div>

          <button
            onClick={() => handleDateChange(1)}
            className="p-2 rounded-xl hover:bg-brand-surface-alt text-brand-black border border-brand-border"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Blocked Times on Selected Date */}
        {dayBlockedTimes.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
              Blocked Hours on this Date
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dayBlockedTimes.map((blk) => (
                <div
                  key={blk.id}
                  className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-amber-950">{blk.reason}</p>
                    <p className="text-amber-800 text-[11px]">
                      {blk.startDatetime.split('T')[1]?.substring(0, 5)} to {blk.endDatetime.split('T')[1]?.substring(0, 5)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteBlockedTime(blk.id)}
                    className="p-1.5 rounded-lg hover:bg-amber-200 text-amber-900"
                    title="Remove block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Timeline */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-brand-muted">
            Daily Timeline
          </h3>

          <div className="space-y-2 divide-y divide-brand-border/40">
            {hours.map((hour) => {
              const matchedBookings = dayBookings.filter((b) => b.startTime.startsWith(hour.split(':')[0]));
              return (
                <div key={hour} className="pt-3 first:pt-0 flex items-start gap-4">
                  <span className="w-16 font-mono text-xs font-bold text-neutral-400 shrink-0">
                    {formatTime24to12(hour)}
                  </span>
                  <div className="flex-1 space-y-2">
                    {matchedBookings.length > 0 ? (
                      matchedBookings.map((bk) => (
                        <div
                          key={bk.id}
                          className="p-3 rounded-xl bg-brand-black text-white text-xs flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div>
                            <p className="font-bold text-white">
                              {bk.customerName} · {bk.serviceName}
                            </p>
                            <p className="text-[11px] text-neutral-300">
                              {formatTime24to12(bk.startTime)} to {formatTime24to12(bk.endTime)} ({bk.durationMinutes}m)
                              {bk.resourceName && ` • ${bk.resourceName}`}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-lime text-brand-black shrink-0">
                            {bk.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="h-6 rounded-lg bg-brand-surface-alt/50 border border-dashed border-brand-border/60 flex items-center px-3">
                        <span className="text-[10px] text-neutral-400 font-medium">Open for customer booking</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BLOCK TIME MODAL */}
      <Modal
        isOpen={isBlockTimeModalOpen}
        onClose={() => setIsBlockTimeModalOpen(false)}
        title="Block Out Working Time"
      >
        <form onSubmit={handleAddBlockedTime} className="space-y-4 pt-2">
          <p className="text-xs text-brand-secondary">
            Prevent customers from booking during cleaning, team breaks, or temporary closures.
          </p>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Reason</label>
            <input
              type="text"
              required
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="e.g. Lunch Break, Maintenance, Private Event"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Start Time</label>
              <input
                type="time"
                required
                value={blockStartTime}
                onChange={(e) => setBlockStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">End Time</label>
              <input
                type="time"
                required
                value={blockEndTime}
                onChange={(e) => setBlockEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button variant="primary" size="md" type="submit" className="w-full justify-center font-bold text-xs bg-brand-black text-white">
              <span>Save blocked time</span>
            </Button>
          </div>
        </form>
      </Modal>
    </BusinessLayout>
  );
}
