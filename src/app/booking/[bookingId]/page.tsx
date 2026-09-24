'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Booking } from '@/types';
import { store } from '@/lib/db/store';
import { formatPrice, formatTime24to12, formatDatePretty, buildDirectionsUrl } from '@/lib/utils';
import { buildGoogleCalendarUrl, downloadICSFile } from '@/lib/notification/calendar';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Share2,
  Download,
  ExternalLink,
  Navigation,
  ArrowRight,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.bookingId as string;

  const [booking, setBooking] = useState<Booking | null>(() => {
    if (!bookingId) return null;
    return store.getBookingById(bookingId) || null;
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    const bk = store.getBookingById(bookingId);
    if (bk) {
      setBooking(bk);
    }
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="min-h-screen max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-brand-black">Booking Not Found</h2>
        <p className="text-xs text-brand-secondary">We could not locate this booking reference.</p>
        <Link href="/account">
          <Button variant="primary" size="md">View My Bookings</Button>
        </Link>
      </div>
    );
  }

  const handleCopyReference = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(booking.bookingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Success Banner */}
        <div className="text-center space-y-3 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-brand-lime flex items-center justify-center mx-auto shadow-lime animate-scale-in border-2 border-brand-black">
            <CheckCircle2 className="w-8 h-8 text-brand-black" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-black bg-brand-lime px-3.5 py-1 rounded-full border border-brand-black shadow-2xs inline-block">
            Appointment Confirmed & Guaranteed
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-black tracking-tight">
            You&apos;re booked.
          </h1>

          <p className="text-xs sm:text-sm text-brand-secondary max-w-md mx-auto">
            A confirmation was generated for <strong>{booking.customerName}</strong>. The merchant has reserved your slot.
          </p>
        </div>

        {/* Digital Boarding Ticket Card */}
        <div className="bg-white rounded-3xl border border-brand-border/80 shadow-modal overflow-hidden">
          {/* Ticket Header */}
          <div className="bg-brand-black text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-lime block mb-1">
                Booking Reference
              </span>
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-black tracking-wider font-mono text-white">
                  {booking.bookingReference}
                </span>
                <button
                  onClick={handleCopyReference}
                  className="text-xs font-bold text-neutral-300 hover:text-white bg-neutral-800 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-neutral-400 block">
                {booking.paymentStatus === 'paid' ? 'Paid via Cashfree' : 'Amount Due'}
              </span>
              <span className="font-display text-xl sm:text-2xl font-bold text-brand-lime">
                {formatPrice(booking.servicePrice)}
              </span>
              {booking.paymentStatus === 'paid' && (
                <span className="block text-[10px] text-emerald-400 font-semibold tracking-wide">
                  ✓ Verified Prepayment
                </span>
              )}
            </div>
          </div>

          {/* Ticket Body Grid */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Details */}
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">
                    Business
                  </span>
                  <Link
                    href={`/business/${booking.businessSlug}`}
                    className="text-base font-bold text-brand-black hover:underline"
                  >
                    {booking.businessName}
                  </Link>
                  <p className="text-xs text-brand-secondary flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{booking.businessAddress}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">
                    Service
                  </span>
                  <p className="text-sm font-bold text-brand-black">{booking.serviceName}</p>
                  <p className="text-xs text-brand-secondary mt-0.5">
                    Duration: {booking.durationMinutes} minutes
                  </p>
                </div>
              </div>

              {/* Right Details: Date & Time + QR */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">
                    Date & Time
                  </span>
                  <p className="text-base font-black text-brand-black flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-4 h-4 text-brand-black" />
                    <span>{formatDatePretty(booking.date)}</span>
                  </p>
                  <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span>{formatTime24to12(booking.startTime)} to {formatTime24to12(booking.endTime)}</span>
                  </p>
                </div>

                {/* Simulated QR Check-in Code */}
                <div className="p-3 bg-brand-surface-alt rounded-2xl border border-brand-border/80 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center border border-brand-border shrink-0">
                    <QrCode className="w-10 h-10 text-brand-black" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-black">Fast Check-In Code</p>
                    <p className="text-[11px] text-brand-secondary">Show this code or reference at venue arrival</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Transaction Receipt Banner */}
            <div className="p-4 rounded-2xl bg-brand-surface-alt border border-brand-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                    booking.paymentStatus === 'paid'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-brand-black">
                      {booking.paymentStatus === 'paid' ? 'Payment Verified (Cashfree)' : 'Payment Due at Venue'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        booking.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {booking.paymentStatus === 'paid' ? 'Prepaid Online' : 'Pay at Venue'}
                    </span>
                  </div>
                  <p className="text-brand-secondary text-[11px] mt-0.5">
                    {booking.paymentStatus === 'paid'
                      ? `Txn ID: ${booking.transactionId || 'CF-PAID'} • Method: ${
                          booking.paymentMethod?.replace('_', ' ').toUpperCase() || 'UPI/CARD'
                        }`
                      : `Amount of ${formatPrice(booking.servicePrice)} to be settled directly at the venue upon arrival`}
                  </p>
                </div>
              </div>

              {booking.paidAt && (
                <div className="text-left sm:text-right text-[11px] text-brand-muted shrink-0">
                  <span className="block text-[10px] uppercase font-bold tracking-wider">Settled on</span>
                  <span className="font-semibold text-brand-black">
                    {new Date(booking.paidAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Special notes if any */}
            {(booking.notes || booking.specialRequests) && (
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                <span className="font-bold text-brand-black">Special Note: </span>
                <span className="text-brand-secondary">{booking.notes || booking.specialRequests}</span>
              </div>
            )}

            {/* Action Buttons Grid */}
            <div className="pt-4 border-t border-brand-border/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Google Calendar */}
              <a
                href={buildGoogleCalendarUrl(booking)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" size="sm" className="w-full justify-center text-xs font-bold gap-1.5 py-3 min-h-[44px]">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Calendar</span>
                </Button>
              </a>

              {/* Download ICS */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadICSFile(booking)}
                className="w-full justify-center text-xs font-bold gap-1.5 py-3 min-h-[44px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ICS</span>
              </Button>

              {/* Get Directions */}
              <a
                href={buildDirectionsUrl(booking.businessAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="secondary" size="sm" className="w-full justify-center text-xs font-bold gap-1.5 py-3 min-h-[44px]">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Navigation CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Link href="/account" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full sm:w-auto font-bold text-xs px-6">
              <span>View In My Bookings</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/search" className="text-xs font-bold text-brand-black hover:underline">
            Book another local service →
          </Link>
        </div>
      </div>
    </div>
  );
}
