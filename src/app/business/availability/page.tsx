'use client';

import React, { useState, useEffect } from 'react';
import { store } from '@/lib/db/store';
import { Business, DaySchedule, BlockedTime } from '@/types';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { BusinessService } from '@/lib/services/businessService';
import {
  Clock,
  Copy,
  Plus,
  ShieldAlert,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export default function BusinessAvailabilityPage() {
  const getInitialBiz = () => {
    const user = store.getCurrentUser();
    const allBiz = store.getAllBusinessesAdmin();
    return user.businessId ? store.getBusinessById(user.businessId) || allBiz[0] : allBiz[0];
  };

  const [business, setBusiness] = useState<Business | null>(getInitialBiz);
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => getInitialBiz()?.schedule || []);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>(() => {
    const biz = getInitialBiz();
    return biz ? store.getBlockedTimesByBusinessId(biz.id) : [];
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  // Block time form
  const [blockDate, setBlockDate] = useState(new Date().toISOString().split('T')[0]);
  const [blockStartTime, setBlockStartTime] = useState('13:00');
  const [blockEndTime, setBlockEndTime] = useState('15:00');
  const [blockReason, setBlockReason] = useState('');

  const refreshData = () => {
    const user = store.getCurrentUser();
    const allBiz = store.getAllBusinessesAdmin();
    const activeBiz = user.businessId
      ? store.getBusinessById(user.businessId) || allBiz[0]
      : allBiz[0];

    if (activeBiz) {
      setBusiness(activeBiz);
      setSchedule(JSON.parse(JSON.stringify(activeBiz.schedule)));
      setBlockedTimes(store.getBlockedTimesByBusinessId(activeBiz.id));
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = store.subscribe(() => refreshData());
    return unsub;
  }, []);

  const handleToggleDay = (dayIndex: number) => {
    const updated = [...schedule];
    updated[dayIndex].isOpen = !updated[dayIndex].isOpen;
    setSchedule(updated);
  };

  const handleTimeChange = (dayIndex: number, field: 'openTime' | 'closeTime', val: string) => {
    const updated = [...schedule];
    updated[dayIndex][field] = val;
    setSchedule(updated);
  };

  const handleCopyMonday = () => {
    const copied = BusinessService.copyMondayToWeekdays(schedule);
    setSchedule(copied);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSaveSchedule = () => {
    if (!business) return;
    store.updateBusinessProfile(business.id, { schedule });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddBlockedTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    store.addBlockedTime(
      business.id,
      `${blockDate}T${blockStartTime}:00`,
      `${blockDate}T${blockEndTime}:00`,
      blockReason.trim() || 'Temporary Closure'
    );

    setIsBlockModalOpen(false);
    setBlockReason('');
    refreshData();
  };

  const handleDeleteBlockedTime = (id: string) => {
    store.deleteBlockedTime(id);
    refreshData();
  };

  return (
    <BusinessLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
              When Can Customers Book You?
            </h1>
            <p className="text-xs sm:text-sm text-brand-secondary mt-0.5">
              Set your regular weekly opening hours and block temporary time off
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyMonday}
              className="text-xs font-bold border-brand-border hover:border-brand-black gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Monday to weekdays</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveSchedule}
              className="text-xs font-bold bg-brand-black text-white"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>Save hours</span>
            </Button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            Your schedule has been successfully updated and is live on your BUKKAPP page.
          </div>
        )}

        {/* Weekly Schedule Table */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-muted">
            Regular Weekly Hours
          </h2>

          <div className="space-y-3 divide-y divide-brand-border/60">
            {schedule.map((day, idx) => (
              <div key={day.dayName} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-32">
                  <input
                    type="checkbox"
                    id={`day-${day.dayName}`}
                    checked={day.isOpen}
                    onChange={() => handleToggleDay(idx)}
                    className="w-4 h-4 rounded text-brand-black accent-brand-black"
                  />
                  <label htmlFor={`day-${day.dayName}`} className="text-xs font-black text-brand-black cursor-pointer">
                    {day.dayName}
                  </label>
                </div>

                {day.isOpen ? (
                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="time"
                      value={day.openTime}
                      onChange={(e) => handleTimeChange(idx, 'openTime', e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-brand-border text-xs text-brand-black font-semibold"
                    />
                    <span className="text-brand-muted font-bold">to</span>
                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) => handleTimeChange(idx, 'closeTime', e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-brand-border text-xs text-brand-black font-semibold"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-bold text-neutral-400">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Blocked Dates & Times */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-brand-muted">
                Blocked Dates & Special Closures
              </h2>
              <p className="text-xs text-brand-secondary">
                Holidays, private events, maintenance, or sudden breaks
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBlockModalOpen(true)}
              className="text-xs font-bold border-brand-border"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Block date/time</span>
            </Button>
          </div>

          {blockedTimes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {blockedTimes.map((blk) => (
                <div
                  key={blk.id}
                  className="p-4 rounded-xl bg-brand-surface-alt border border-brand-border flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-brand-black">{blk.reason}</p>
                    <p className="text-neutral-500 text-[11px]">
                      {blk.startDatetime.replace('T', ' ')} to {blk.endDatetime.replace('T', ' ')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteBlockedTime(blk.id)}
                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-700"
                    title="Remove block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic">No blocked dates scheduled.</p>
          )}
        </div>
      </div>

      {/* BLOCK TIME MODAL */}
      <Modal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        title="Block Date or Hours"
      >
        <form onSubmit={handleAddBlockedTime} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Date</label>
            <input
              type="date"
              required
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">From Time</label>
              <input
                type="time"
                required
                value={blockStartTime}
                onChange={(e) => setBlockStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">To Time</label>
              <input
                type="time"
                required
                value={blockEndTime}
                onChange={(e) => setBlockEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Reason</label>
            <input
              type="text"
              required
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="e.g. Renovation, Public Holiday, Lunch Break"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
            />
          </div>

          <div className="pt-2">
            <Button variant="primary" size="md" type="submit" className="w-full justify-center font-bold text-xs bg-brand-black text-white">
              <span>Confirm block</span>
            </Button>
          </div>
        </form>
      </Modal>
    </BusinessLayout>
  );
}
