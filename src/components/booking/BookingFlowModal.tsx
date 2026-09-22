'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Business, Service, TimeSlot, User } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { BookingEngine } from '@/lib/booking/engine';
import { store } from '@/lib/db/store';
import { cn, formatPrice, formatTime24to12, getTodayDateString, getTomorrowDateString, formatDatePretty } from '@/lib/utils';
import { Clock, Calendar, ShieldCheck, CheckCircle2, User as UserIcon, Phone, Mail, FileText, AlertCircle, ArrowLeft, ArrowRight, ChevronDown, Check, CreditCard, Banknote, Sparkles, Lock } from 'lucide-react';

interface BookingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  selectedService: Service | null;
  onBookingSuccess?: (bookingId: string) => void;
}

export function BookingFlowModal({
  isOpen,
  onClose,
  business,
  selectedService,
  onBookingSuccess,
}: BookingFlowModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Date & Service -> 2: Time Slot -> 3: Contact Details -> 4: Processing/Confirmation

  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Selected Service
  const businessServices = business ? store.getServicesByBusinessId(business.id) : [];
  const [activeService, setActiveService] = useState<Service | null>(selectedService || businessServices[0] || null);
  const [isSelectingService, setIsSelectingService] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentChoice, setPaymentChoice] = useState<'cashfree' | 'pay_at_venue'>('cashfree');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prefill authenticated user credentials if signed in
  useEffect(() => {
    if (isOpen) {
      const user = store.getCurrentUser();
      if (user) {
        setCustomerName(user.name || '');
        setCustomerPhone(user.phone || '');
        setCustomerEmail(user.email || '');
      }
      setStep(1);
      setErrorMessage(null);
      setSelectedSlot(null);
      setIsSelectingService(!selectedService && businessServices.length > 1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedService) {
      setActiveService(selectedService);
      setIsSelectingService(false);
    } else if (businessServices.length > 0 && !activeService) {
      setActiveService(businessServices[0]);
    }
  }, [selectedService, business]);

  // Compute live available slots whenever date, business, or active service change
  useEffect(() => {
    if (!business || !selectedDate) return;
    const existingBookings = store.getAllBookings();
    const duration = activeService?.durationMinutes || 45;
    const slots = BookingEngine.generateSlotsForDate(business, selectedDate, duration, existingBookings);
    setAvailableSlots(slots);
    setSelectedSlot(null);
  }, [business, selectedDate, activeService]);

  if (!isOpen || !business) return null;

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleProceedToDetails = () => {
    if (!selectedSlot) {
      setErrorMessage('Please select a time slot to proceed.');
      return;
    }
    setErrorMessage(null);
    setStep(3);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerEmail) {
      setErrorMessage('Please provide your name, phone number, and email.');
      return;
    }
    if (!selectedSlot || !activeService) {
      setErrorMessage('Service or slot missing.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Option A: Pay at Venue
    if (paymentChoice === 'pay_at_venue') {
      try {
        setProcessingStatus('Securing your appointment...');
        await new Promise((resolve) => setTimeout(resolve, 400));

        const booking = store.createBookingAtomically({
          userId: store.getCurrentUser()?.id || 'usr-guest',
          customerName,
          customerPhone,
          customerEmail,
          business,
          service: activeService,
          date: selectedDate,
          startTime: selectedSlot,
          specialRequests,
          paymentStatus: 'pay_at_venue',
          paymentMethod: 'pay_at_venue',
        });

        setIsSubmitting(false);
        setProcessingStatus(null);
        onClose();

        if (onBookingSuccess) {
          onBookingSuccess(booking.id);
        } else {
          router.push(`/booking/${booking.id}`);
        }
      } catch (err: any) {
        setIsSubmitting(false);
        setProcessingStatus(null);
        setErrorMessage(err.message || 'Slot collision occurred. Please choose another time.');
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
          serviceId: activeService.id,
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

      // Handle Sandbox simulation mode
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
        onClose();

        const finalBookingId = (verifyData.success && verifyData.bookingId) || bookingId;
        if (onBookingSuccess) {
          onBookingSuccess(finalBookingId);
        } else {
          router.push(`/booking/${finalBookingId}?payment=success`);
        }
        return;
      }

      // Live / Sandbox Drop-in Checkout
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

        setProcessingStatus('Confirming payment receipt with Cashfree...');
        const verifyRes = await fetch('/api/payments/cashfree/verify-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, bookingId }),
        });
        const verifyData = await verifyRes.json();

        setIsSubmitting(false);
        setProcessingStatus(null);
        onClose();

        if (verifyData.success) {
          if (onBookingSuccess) onBookingSuccess(bookingId);
          else router.push(`/booking/${bookingId}?payment=success`);
        } else {
          if (onBookingSuccess) onBookingSuccess(bookingId);
          else router.push(`/booking/${bookingId}`);
        }
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setProcessingStatus(null);
      setErrorMessage(err.message || 'Payment initialization error. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
              Step {step} of 3 • Instant Booking
            </span>
            <h2 className="text-xl font-bold text-brand-black tracking-tight">{business.name}</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-brand-muted block">Service</span>
            <span className="text-sm font-extrabold text-brand-black">
              {activeService ? formatPrice(activeService.price) : ''}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1 & 2: DATE & TIME SLOT SELECTION */}
        {(step === 1 || step === 2) && (
          <div className="space-y-6">
            {/* Service Selection Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-brand-black uppercase tracking-wider block">
                  Service
                </label>
                {businessServices.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIsSelectingService(!isSelectingService)}
                    className="text-xs font-bold text-brand-black hover:text-neutral-600 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{isSelectingService ? 'Done' : 'Choose Service'}</span>
                    <ChevronDown
                      className={cn('w-3.5 h-3.5 transition-transform duration-200', isSelectingService && 'rotate-180')}
                    />
                  </button>
                )}
              </div>

              {/* Service Cards / Expanded List */}
              {isSelectingService && businessServices.length > 1 ? (
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 p-2.5 rounded-2xl bg-brand-surface-alt border border-brand-border">
                  <div className="px-2 py-1 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      Available Services ({businessServices.length})
                    </span>
                    <span className="text-[11px] text-neutral-400">Select one to book</span>
                  </div>
                  {businessServices.map((srv) => {
                    const isSelected = activeService?.id === srv.id;
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => {
                          setActiveService(srv);
                          setIsSelectingService(false);
                          setSelectedSlot(null);
                          setErrorMessage(null);
                        }}
                        className={cn(
                          'w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer',
                          isSelected
                            ? 'border-brand-black bg-brand-black text-white shadow-xs'
                            : 'border-brand-border bg-white hover:border-neutral-400 hover:bg-neutral-50 text-brand-black'
                        )}
                      >
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <p className={cn('text-xs font-bold', isSelected ? 'text-white' : 'text-brand-black')}>
                              {srv.name}
                            </p>
                            {isSelected && (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-lime text-brand-black">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className={cn('text-[11px] flex items-center gap-2 mt-0.5', isSelected ? 'text-neutral-300' : 'text-brand-secondary')}>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {srv.durationMinutes} mins
                            </span>
                            {srv.category && <span>• {srv.category}</span>}
                          </p>
                          {srv.description && (
                            <p className={cn('text-[11px] line-clamp-1 mt-1 font-normal', isSelected ? 'text-neutral-300' : 'text-neutral-500')}>
                              {srv.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className={cn('text-sm font-extrabold block', isSelected ? 'text-brand-lime' : 'text-brand-black')}>
                            {formatPrice(srv.price)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                activeService && (
                  <div
                    onClick={() => businessServices.length > 1 && setIsSelectingService(true)}
                    className={cn(
                      'p-3.5 rounded-xl bg-brand-surface-alt border border-brand-border/80 flex items-center justify-between transition-all',
                      businessServices.length > 1 && 'cursor-pointer hover:border-neutral-400 hover:bg-white group shadow-2xs'
                    )}
                  >
                    <div>
                      <p className="text-xs font-bold text-brand-black">{activeService.name}</p>
                      <p className="text-[11px] text-brand-secondary flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activeService.durationMinutes} mins
                        </span>
                        {activeService.category && <span>• {activeService.category}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-brand-black">{formatPrice(activeService.price)}</span>
                      {businessServices.length > 1 && (
                        <span className="text-[11px] font-bold text-brand-black bg-white px-2.5 py-1 rounded-lg border border-brand-border group-hover:border-brand-black group-hover:bg-brand-black group-hover:text-white transition-all flex items-center gap-1 shadow-2xs">
                          Change
                          <ChevronDown className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Date Picker Row */}
            <div>
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider block mb-2.5">
                1. Select Date
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleDateSelect(todayStr)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedDate === todayStr
                      ? 'border-brand-black bg-brand-black text-white shadow-xs'
                      : 'border-brand-border bg-white text-brand-black hover:bg-brand-surface-alt'
                  }`}
                >
                  <span className="text-[11px] block opacity-80">Today</span>
                  <span className="text-sm font-bold block">{formatDatePretty(todayStr).split(',')[0]}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDateSelect(tomorrowStr)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedDate === tomorrowStr
                      ? 'border-brand-black bg-brand-black text-white shadow-xs'
                      : 'border-brand-border bg-white text-brand-black hover:bg-brand-surface-alt'
                  }`}
                >
                  <span className="text-[11px] block opacity-80">Tomorrow</span>
                  <span className="text-sm font-bold block">{formatDatePretty(tomorrowStr).split(',')[0]}</span>
                </button>

                <div className="relative">
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    className={`w-full h-full p-2.5 text-xs font-bold rounded-xl border transition-all text-center focus:outline-hidden ${
                      selectedDate !== todayStr && selectedDate !== tomorrowStr
                        ? 'border-brand-black bg-brand-black text-white'
                        : 'border-brand-border bg-white text-brand-black'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Time Slots Grid */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-brand-black uppercase tracking-wider">
                  2. Select Live Available Time Slot
                </label>
                <span className="text-xs text-brand-muted">
                  {formatDatePretty(selectedDate)}
                </span>
              </div>

              {availableSlots.length > 0 ? (
                <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
                  {/* Categorized by Morning / Afternoon / Evening */}
                  {['morning', 'afternoon', 'evening'].map((period) => {
                    const periodSlots = availableSlots.filter((s) => s.period === period);
                    if (periodSlots.length === 0) return null;

                    return (
                      <div key={period}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1.5 capitalize">
                          {period} Slots
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {periodSlots.map((slot) => {
                            const isSelected = selectedSlot === slot.time;
                            return (
                              <button
                                key={slot.time}
                                type="button"
                                disabled={!slot.isAvailable}
                                onClick={() => setSelectedSlot(slot.time)}
                                className={`py-2.5 px-2 min-h-[44px] rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-brand-lime text-brand-black border-brand-black shadow-xs scale-102'
                                    : slot.isAvailable
                                    ? 'bg-brand-surface-alt hover:bg-[#EAEAE4] active:scale-95 text-brand-black border-brand-border'
                                    : 'bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed line-through'
                                }`}
                              >
                                <span>{slot.displayTime}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-brand-surface-alt rounded-xl border border-brand-border text-xs text-brand-secondary">
                  No available time slots for this date. The business is either closed or fully booked.
                </div>
              )}
            </div>

            {/* Next Step CTA */}
            <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between">
              <span className="text-xs text-brand-muted">
                {selectedSlot ? `Selected: ${formatTime24to12(selectedSlot)}` : 'Choose a time slot to continue'}
              </span>
              <Button
                variant="accent"
                size="md"
                disabled={!selectedSlot}
                onClick={handleProceedToDetails}
                className="px-6 font-bold"
              >
                <span>Continue to Details</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: CONTACT & CONFIRMATION */}
        {step === 3 && (
          <form onSubmit={handleConfirmBooking} className="space-y-5">
            {/* Booking Summary Box */}
            <div className="p-4 rounded-xl bg-brand-surface-alt border border-brand-border/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-muted">Date & Time</span>
                <strong className="text-brand-black">
                  {formatDatePretty(selectedDate)} at {selectedSlot ? formatTime24to12(selectedSlot) : ''}
                </strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-muted">Selected Service</span>
                <strong className="text-brand-black">{activeService?.name}</strong>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-brand-border/60">
                <span className="font-bold text-brand-black">Total to Pay (Pay upon arrival at venue)</span>
                <span className="text-base font-black text-brand-black">
                  {activeService ? formatPrice(activeService.price) : ''}
                </span>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-brand-black block mb-1">Your Full Name *</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm rounded-xl bg-white border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-brand-black block mb-1">Phone Number (WhatsApp) *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm rounded-xl bg-white border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-brand-black block mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="rahul@example.com"
                      className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm rounded-xl bg-white border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-black block mb-1">
                  Special Notes or Medical Context (Optional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any specific requests, allergies, vehicle model, or court preferences..."
                    className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm rounded-xl bg-white border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2.5 pt-2 border-t border-brand-border/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-black block">
                  Choose Payment Method
                </label>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Cashfree Protected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option 1: Cashfree Online */}
                <div
                  onClick={() => setPaymentChoice('cashfree')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                    paymentChoice === 'cashfree'
                      ? 'border-brand-black bg-[#FAFDF4] shadow-2xs'
                      : 'border-brand-border bg-white hover:bg-brand-surface-alt'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${
                          paymentChoice === 'cashfree'
                            ? 'bg-brand-black text-brand-lime border-brand-black'
                            : 'bg-brand-surface-alt text-brand-black border-brand-border'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-black">Pay Online (Cashfree)</p>
                        <p className="text-[10px] text-brand-secondary">UPI, Cards, NetBanking</p>
                      </div>
                    </div>
                    {paymentChoice === 'cashfree' && (
                      <CheckCircle2 className="w-4 h-4 text-brand-black shrink-0 mt-0.5" />
                    )}
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-brand-border/60 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-emerald-700 flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> Instant Lock
                    </span>
                    <span className="font-bold text-brand-black">{activeService ? formatPrice(activeService.price) : ''}</span>
                  </div>
                </div>

                {/* Option 2: Pay at Venue */}
                <div
                  onClick={() => setPaymentChoice('pay_at_venue')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                    paymentChoice === 'pay_at_venue'
                      ? 'border-brand-black bg-[#FAFDF4] shadow-2xs'
                      : 'border-brand-border bg-white hover:bg-brand-surface-alt'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${
                          paymentChoice === 'pay_at_venue'
                            ? 'bg-brand-black text-brand-lime border-brand-black'
                            : 'bg-brand-surface-alt text-brand-black border-brand-border'
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-black">Pay at Venue</p>
                        <p className="text-[10px] text-brand-secondary">Cash or UPI upon arrival</p>
                      </div>
                    </div>
                    {paymentChoice === 'pay_at_venue' && (
                      <CheckCircle2 className="w-4 h-4 text-brand-black shrink-0 mt-0.5" />
                    )}
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-brand-border/60 flex items-center justify-between text-[10px]">
                    <span className="text-brand-secondary font-medium">Zero Prepayment</span>
                    <span className="font-bold text-brand-black">{activeService ? formatPrice(activeService.price) : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant Booking Guarantee Badge */}
            <div className="p-3 rounded-xl bg-[#FAFDF4] border border-[#D5F58D] flex items-center gap-2.5 text-xs text-brand-black">
              <ShieldCheck className="w-4 h-4 text-[#558B07] shrink-0" />
              {paymentChoice === 'cashfree' ? (
                <span>Instant slot lock with Cashfree. 100% refund on timely cancellation.</span>
              ) : (
                <span>Instant slot lock with server-side validation. Zero cancellation charges.</span>
              )}
            </div>

            {processingStatus && (
              <div className="p-3 rounded-xl bg-brand-lime/30 border border-brand-black/20 text-xs font-semibold text-brand-black flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-black shrink-0 animate-spin" />
                <span>{processingStatus}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between gap-3">
              <Button type="button" variant="outline" size="md" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>

              <Button
                type="submit"
                variant="accent"
                size="md"
                isLoading={isSubmitting}
                className="px-8 font-bold"
              >
                {paymentChoice === 'cashfree' ? (
                  <span>Pay with Cashfree ({activeService ? formatPrice(activeService.price) : ''})</span>
                ) : (
                  <span>Confirm & Pay at Venue</span>
                )}
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
