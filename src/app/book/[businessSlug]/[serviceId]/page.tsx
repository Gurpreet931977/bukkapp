'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Business, Service, TimeSlot } from '@/types';
import { store } from '@/lib/db/store';
import { BookingEngine } from '@/lib/booking/engine';
import { formatPrice, formatTime24to12, getTodayDateString, getTomorrowDateString, formatDatePretty } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  CreditCard,
  Banknote,
  Sparkles,
  Lock,
} from 'lucide-react';

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
  const [paymentChoice, setPaymentChoice] = useState<'cashfree' | 'pay_at_venue'>('cashfree');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
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

    // Option A: Pay at Venue
    if (paymentChoice === 'pay_at_venue') {
      try {
        setProcessingStatus('Securing your appointment...');
        await new Promise((res) => setTimeout(res, 400));
        const booking = store.createBookingAtomically({
          userId: store.getCurrentUser().id || 'usr-guest',
          customerName,
          customerPhone,
          customerEmail,
          business,
          service,
          date: selectedDate,
          startTime: selectedSlot,
          specialRequests,
          paymentStatus: 'pay_at_venue',
          paymentMethod: 'pay_at_venue',
        });

        setIsSubmitting(false);
        setProcessingStatus(null);
        router.push(`/booking/${booking.id}`);
      } catch (err: any) {
        setIsSubmitting(false);
        setProcessingStatus(null);
        setErrorMessage(err.message || 'Slot collision occurred. Please select another slot.');
      }
      return;
    }

    // Option B: Pay Online via Cashfree
    try {
      setProcessingStatus('Initializing Cashfree Secure Gateway...');
      const response = await fetch('/api/payments/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          serviceId: service.id,
          customerName,
          customerPhone,
          customerEmail,
          date: selectedDate,
          startTime: selectedSlot,
          specialRequests,
          userId: store.getCurrentUser()?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment order with Cashfree');
      }

      const { orderId, paymentSessionId, bookingId, isSimulated } = data;

      // Handle Simulated/Developer Sandbox when Cashfree live keys are not yet configured
      if (isSimulated || paymentSessionId.startsWith('session_sim_')) {
        setProcessingStatus('Simulating verified UPI payment on Cashfree Sandbox...');
        await new Promise((res) => setTimeout(res, 800));

        const verifyRes = await fetch('/api/payments/cashfree/verify-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, bookingId }),
        });
        const verifyData = await verifyRes.json();

        setIsSubmitting(false);
        setProcessingStatus(null);
        if (verifyData.success && verifyData.bookingId) {
          router.push(`/booking/${verifyData.bookingId}?payment=success`);
        } else {
          router.push(`/booking/${bookingId}?payment=success`);
        }
        return;
      }

      // Live / Real Sandbox Cashfree SDK Drop-in Checkout
      setProcessingStatus('Opening Cashfree Checkout...');
      const { load } = await import('@cashfreepayments/cashfree-js');
      const cashfreeEnv = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
      const cashfree = await load({ mode: cashfreeEnv });

      cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_modal',
      }).then(async (result: any) => {
        if (result.error) {
          setIsSubmitting(false);
          setProcessingStatus(null);
          setErrorMessage(result.error.message || 'Payment was cancelled or failed.');
          return;
        }

        // Verify completion with our authoritative backend
        setProcessingStatus('Confirming payment receipt with Cashfree...');
        const verifyRes = await fetch('/api/payments/cashfree/verify-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, bookingId }),
        });
        const verifyData = await verifyRes.json();

        setIsSubmitting(false);
        setProcessingStatus(null);
        if (verifyData.success) {
          router.push(`/booking/${bookingId}?payment=success`);
        } else {
          setErrorMessage('Payment verification pending. You can track this in your account.');
          router.push(`/booking/${bookingId}`);
        }
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setProcessingStatus(null);
      setErrorMessage(err.message || 'Payment initialization error. Please try again.');
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
                          className={`py-2.5 px-2 min-h-[44px] rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center ${
                            isSelected
                              ? 'bg-brand-lime text-brand-black border-brand-black shadow-xs font-extrabold'
                              : slot.isAvailable
                              ? 'bg-brand-surface-alt hover:bg-[#EAEAE4] active:scale-95 text-brand-black border-brand-border'
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
                      className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm rounded-xl bg-brand-surface-alt border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
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
                        className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm rounded-xl bg-brand-surface-alt border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
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
                        className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm rounded-xl bg-brand-surface-alt border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
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
                      className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm rounded-xl bg-brand-surface-alt border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Payment Method Selection */}
              <div className="space-y-3 pt-2 border-t border-brand-border/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-black block">
                    4. Choose Payment Method
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Cashfree Protected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Cashfree Online Prepayment */}
                  <div
                    onClick={() => setPaymentChoice('cashfree')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                      paymentChoice === 'cashfree'
                        ? 'border-brand-black bg-[#FAFDF4] shadow-xs ring-1 ring-brand-black/10'
                        : 'border-brand-border bg-white hover:bg-brand-surface-alt'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                            paymentChoice === 'cashfree'
                              ? 'bg-brand-black text-brand-lime border-brand-black'
                              : 'bg-brand-surface-alt text-brand-black border-brand-border'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-brand-black flex items-center gap-1">
                            <span>Pay Online (Cashfree)</span>
                          </p>
                          <p className="text-[10px] text-brand-secondary mt-0.5">
                            UPI (GPay / PhonePe), Cards, NetBanking
                          </p>
                        </div>
                      </div>
                      {paymentChoice === 'cashfree' && (
                        <CheckCircle2 className="w-4 h-4 text-brand-black shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-brand-border/60 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Instant Slot Lock
                      </span>
                      <span className="font-bold text-brand-black">{formatPrice(service.price)}</span>
                    </div>
                  </div>

                  {/* Option 2: Pay at Venue */}
                  <div
                    onClick={() => setPaymentChoice('pay_at_venue')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                      paymentChoice === 'pay_at_venue'
                        ? 'border-brand-black bg-[#FAFDF4] shadow-xs ring-1 ring-brand-black/10'
                        : 'border-brand-border bg-white hover:bg-brand-surface-alt'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                            paymentChoice === 'pay_at_venue'
                              ? 'bg-brand-black text-brand-lime border-brand-black'
                              : 'bg-brand-surface-alt text-brand-black border-brand-border'
                          }`}
                        >
                          <Banknote className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-brand-black">Pay at Venue</p>
                          <p className="text-[10px] text-brand-secondary mt-0.5">
                            Cash or UPI upon arrival
                          </p>
                        </div>
                      </div>
                      {paymentChoice === 'pay_at_venue' && (
                        <CheckCircle2 className="w-4 h-4 text-brand-black shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-brand-border/60 flex items-center justify-between text-[11px]">
                      <span className="text-brand-secondary font-medium">Zero Prepayment</span>
                      <span className="font-bold text-brand-black">{formatPrice(service.price)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {processingStatus && (
                <div className="p-3 rounded-xl bg-brand-lime/30 border border-brand-black/20 text-xs font-semibold text-brand-black flex items-center gap-2">
                  <Lock className="w-4 h-4 text-brand-black shrink-0 animate-spin" />
                  <span>{processingStatus}</span>
                </div>
              )}

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
                  {paymentChoice === 'cashfree' ? (
                    <span>Pay with Cashfree & Lock Booking ({formatPrice(service.price)})</span>
                  ) : (
                    <span>Confirm Booking & Pay at Venue ({formatPrice(service.price)})</span>
                  )}
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

                <div className="flex justify-between">
                  <span className="text-brand-secondary">Payment Mode:</span>
                  <span className="font-bold text-brand-black">
                    {paymentChoice === 'cashfree' ? 'Cashfree (UPI / Cards)' : 'Pay at Venue'}
                  </span>
                </div>

                <div className="pt-2 border-t border-brand-border/80 flex justify-between text-sm">
                  <span className="font-bold text-brand-black">Total:</span>
                  <span className="font-black text-brand-black">{formatPrice(service.price)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFDF4] border border-[#D5F58D] flex items-center gap-2 text-xs text-brand-black">
                <ShieldCheck className="w-4 h-4 text-[#558B07] shrink-0" />
                {paymentChoice === 'cashfree' ? (
                  <span>Instant slot lock with Cashfree. 100% refund on timely cancellation.</span>
                ) : (
                  <span>Zero prepayment required. Pay securely at venue upon arrival.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
