'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Business, Service, TimeSlot } from '@/types';
import { store } from '@/lib/db/store';
import { BookingEngine } from '@/lib/booking/engine';
import { formatPrice, formatTime24to12, getTodayDateString, getTomorrowDateString, formatDatePretty } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Clock, MapPin, CheckCircle2, ShieldCheck, User, Phone, Mail, FileText, AlertCircle } from 'lucide-react';

export default function DedicatedBookingPage() {
  const params = useParams();
  const router = useRouter();
  const businessSlug = params?.businessSlug as string;
  const serviceId = params?.serviceId as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [service, setService] = useState<Service | null>(null);

  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!businessSlug) return;
    const biz = store.getBusinessBySlug(businessSlug);
    if (biz) {
      setBusiness(biz);
      const srv = store.getServiceById(serviceId) || store.getServicesByBusinessId(biz.id)[0];
      setService(srv || null);

      const currentUser = store.getCurrentUser();
      if (currentUser) {
        setCustomerName(currentUser.name || '');
        setCustomerPhone(currentUser.phone || '');
        setCustomerEmail(currentUser.email || '');
      }
    }
  }, [businessSlug, serviceId]);

  useEffect(() => {
    if (!business || !selectedDate) return;
    const existingBookings = store.getAllBookings();
    const duration = service?.durationMinutes || 45;
    const slots = BookingEngine.generateSlotsForDate(business, selectedDate, duration, existingBookings);
    setAvailableSlots(slots);
    setSelectedSlot(null);
  }, [business, selectedDate, service]);

  if (!business || !service) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-brand-black">Service or Business Not Found</h2>
        <Link href="/search">
          <Button variant="primary" size="md">Browse Businesses</Button>
        </Link>
      </div>
    );
  }

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMessage('Please select a time slot for your appointment.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await new Promise((res) => setTimeout(res, 500));
      const booking = store.createBooking({
        userId: store.getCurrentUser().id || 'usr-guest',
        customerName,
        customerPhone,
        customerEmail,
        business,
        service,
        date: selectedDate,
        startTime: selectedSlot,
        specialRequests,
      });

      setIsSubmitting(false);
      router.push(`/booking/${booking.id}`);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Slot collision occurred. Please select another slot.');
    }
  };

  return (
    <div className="min-h-screen py-10 bg-brand-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/business/${business.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {business.name}</span>
          </Link>
          <span className="text-xs font-semibold text-brand-muted">Instant Slot Reservation</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Booking Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-brand-border/80 p-6 sm:p-8 shadow-subtle space-y-6">
            <div>
              <h1 className="text-2xl font-black text-brand-black tracking-tight">
                Complete Your Booking
              </h1>
              <p className="text-xs text-brand-secondary mt-1">
                Select your preferred date & time, provide contact info, and lock your spot.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleConfirmBooking} className="space-y-6">
              {/* 1. Date Picker */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-brand-black block mb-2.5">
                  1. Choose Date
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedDate(todayStr)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedDate === todayStr
                        ? 'border-brand-black bg-brand-black text-white shadow-xs'
                        : 'border-brand-border bg-white text-brand-black hover:bg-brand-surface-alt'
                    }`}
                  >
                    <span className="text-[11px] block opacity-80">Today</span>
                    <span className="text-xs sm:text-sm font-bold block">{formatDatePretty(todayStr).split(',')[0]}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDate(tomorrowStr)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedDate === tomorrowStr
                        ? 'border-brand-black bg-brand-black text-white shadow-xs'
                        : 'border-brand-border bg-white text-brand-black hover:bg-brand-surface-alt'
                    }`}
                  >
                    <span className="text-[11px] block opacity-80">Tomorrow</span>
                    <span className="text-xs sm:text-sm font-bold block">{formatDatePretty(tomorrowStr).split(',')[0]}</span>
                  </button>

                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`w-full p-2.5 text-xs font-bold rounded-xl border text-center focus:outline-hidden ${
                      selectedDate !== todayStr && selectedDate !== tomorrowStr
                        ? 'border-brand-black bg-brand-black text-white'
                        : 'border-brand-border bg-white text-brand-black'
                    }`}
                  />
                </div>
              </div>

              {/* 2. Slot Picker */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-black">
                    2. Select Time Slot
                  </label>
                  <span className="text-xs text-brand-muted">{formatDatePretty(selectedDate)}</span>
                </div>

                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                            isSelected
                              ? 'bg-brand-lime text-brand-black border-brand-black shadow-xs font-extrabold'
                              : slot.isAvailable
                              ? 'bg-brand-surface-alt hover:bg-[#EAEAE4] text-brand-black border-brand-border'
                              : 'bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed line-through'
                          }`}
                        >
                          {slot.displayTime}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-brand-surface-alt rounded-xl border border-brand-border text-xs text-brand-secondary">
                    No slots available for this day.
                  </div>
                )}
              </div>

              {/* 3. Customer Info */}
              <div className="space-y-3 pt-2 border-t border-brand-border/60">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-black block">
                  3. Contact Information
                </label>

                <div>
                  <label className="text-xs font-medium text-brand-secondary block mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Gurpreet Singh"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-brand-surface-alt border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-brand-secondary block mb-1">Phone Number (WhatsApp) *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-brand-surface-alt border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-brand-secondary block mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="gurpreet@example.com"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-brand-surface-alt border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-brand-secondary block mb-1">
                    Special Requests / Notes (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                    <textarea
                      rows={2}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Notes for the specialist..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-brand-surface-alt border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-brand-border/60">
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  disabled={!selectedSlot}
                  isLoading={isSubmitting}
                  className="w-full font-extrabold text-brand-black py-4"
                >
                  <span>Confirm & Lock Booking ({formatPrice(service.price)})</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Right Summary Sidebar (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-24">
            <div className="bg-white rounded-2xl border border-brand-border/80 p-6 shadow-subtle space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted">
                Appointment Summary
              </h2>

              <div className="flex items-start gap-3">
                <img
                  src={business.coverImage}
                  alt={business.name}
                  className="w-14 h-14 rounded-xl object-cover border border-brand-border shrink-0"
                />
                <div>
                  <h3 className="font-bold text-sm text-brand-black">{business.name}</h3>
                  <p className="text-xs text-brand-secondary flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    <span>{business.neighborhood}, Dehradun</span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface-alt border border-brand-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-brand-secondary">Service:</span>
                  <span className="font-bold text-brand-black">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-secondary">Duration:</span>
                  <span className="font-semibold text-brand-black">{service.durationMinutes} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-secondary">Date:</span>
                  <span className="font-semibold text-brand-black">{formatDatePretty(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-secondary">Time Slot:</span>
                  <span className="font-bold text-brand-black">
                    {selectedSlot ? formatTime24to12(selectedSlot) : 'Not selected yet'}
                  </span>
                </div>

                <div className="pt-2 border-t border-brand-border/80 flex justify-between text-sm">
                  <span className="font-bold text-brand-black">Total:</span>
                  <span className="font-black text-brand-black">{formatPrice(service.price)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFDF4] border border-[#D5F58D] flex items-center gap-2 text-xs text-brand-black">
                <ShieldCheck className="w-4 h-4 text-[#558B07] shrink-0" />
                <span>Zero prepayment required. Pay at venue or via simulated checkout.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
