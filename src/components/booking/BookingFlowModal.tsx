'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Business, Service, TimeSlot, User } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { BookingEngine } from '@/lib/booking/engine';
import { store } from '@/lib/db/store';
import { cn, formatPrice, formatTime24to12, getTodayDateString, getTomorrowDateString, formatDatePretty } from '@/lib/utils';
import { Clock, Calendar, ShieldCheck, CheckCircle2, User as UserIcon, Phone, Mail, FileText, AlertCircle, ArrowLeft, ArrowRight, ChevronDown, Check } from 'lucide-react';

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

  const businessServices = business ? store.getServicesByBusinessId(business.id) : [];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [activeService, setActiveService] = useState<Service | null>(selectedService || businessServices[0] || null);
  const [isSelectingService, setIsSelectingService] = useState(false);

  // Customer Contact Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prefill logged in demo user
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

    try {
      // Simulate minor network processing
      await new Promise((resolve) => setTimeout(resolve, 600));

      const booking = store.createBooking({
        userId: store.getCurrentUser().id || 'usr-guest',
        customerName,
        customerPhone,
        customerEmail,
        business,
        service: activeService,
        date: selectedDate,
        startTime: selectedSlot,
        specialRequests,
      });

      setIsSubmitting(false);
      onClose();

      if (onBookingSuccess) {
        onBookingSuccess(booking.id);
      } else {
        router.push(`/booking/${booking.id}`);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Slot collision occurred. Please choose another time.');
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
                                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                                  isSelected
                                    ? 'bg-brand-lime text-brand-black border-brand-black shadow-xs scale-102'
                                    : slot.isAvailable
                                    ? 'bg-brand-surface-alt hover:bg-[#EAEAE4] text-brand-black border-brand-border'
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
                <span className="font-bold text-brand-black">Total to Pay (at venue/free prototype)</span>
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
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
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
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
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
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
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
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-brand-border focus:border-brand-black focus:outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Prototype Guarantee Badge */}
            <div className="p-3 rounded-xl bg-[#FAFDF4] border border-[#D5F58D] flex items-center gap-2.5 text-xs text-brand-black">
              <ShieldCheck className="w-4 h-4 text-[#558B07] shrink-0" />
              <span>Instant slot lock with server-side validation. Zero cancellation charges.</span>
            </div>

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
                <span>Confirm & Lock Booking</span>
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
