'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import { Business } from '@/types';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  ShieldCheck,
  Building,
  Phone,
  Mail,
  FileText,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function ClaimBusinessPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { showToast } = useToast();

  const [business, setBusiness] = useState<Business | null>(null);
  const [claimantName, setClaimantName] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [claimantEmail, setClaimantEmail] = useState('');
  const [proofNote, setProofNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (slug) {
      const biz = store.getBusinessBySlug(slug);
      if (biz) {
        setBusiness(biz);
      }
    }
  }, [slug]);

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !claimantName.trim() || !claimantPhone.trim()) return;

    // Create an admin audit log for the claim
    store.addAuditLog(
      store.getCurrentUser().id,
      claimantName.trim(),
      'business_claimed' as any,
      'business',
      business.id,
      {
        claimantPhone,
        claimantEmail,
        proofNote,
        businessName: business.name,
      }
    );

    // Notify Admins
    store.addNotification(
      'usr-admin',
      'system_alert',
      'Business Claim Submitted',
      `${claimantName} submitted an ownership claim for ${business.name}.`,
      business.id,
      '/admin'
    );

    setIsSubmitted(true);
    showToast('Claim submitted for verification', 'success', 'Our team will contact you within 24 hours.');
  };

  if (!business) {
    return (
      <div className="min-h-screen py-20 bg-[#FAFAF8] text-center space-y-4">
        <p className="text-sm font-bold text-brand-black">Business listing not found.</p>
        <Link href="/search">
          <Button variant="outline" size="sm">Back to Search</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        <Link
          href={`/business/${business.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-secondary hover:text-brand-black"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {business.name}</span>
        </Link>

        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-card space-y-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmitClaim} className="space-y-6">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-brand-lime text-brand-black flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-brand-black tracking-tight">
                  Claim {business.name}
                </h1>
                <p className="text-xs text-brand-secondary">
                  Are you the owner or authorized manager of this business in {business.neighborhood}, {business.city}?
                  Submit your details to gain full access to the BUKKAPP Business Console.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-brand-surface-alt border border-brand-border flex items-center gap-3">
                <img
                  src={business.coverImage}
                  alt={business.name}
                  className="w-12 h-12 rounded-xl object-cover border border-brand-border shrink-0"
                />
                <div>
                  <h3 className="font-extrabold text-sm text-brand-black">{business.name}</h3>
                  <p className="text-xs text-brand-secondary">{business.subcategory} • {business.address}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    placeholder="e.g. Rahul Kapoor"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black font-semibold text-brand-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Mobile Number (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      value={claimantPhone}
                      onChange={(e) => setClaimantPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Business Email</label>
                    <input
                      type="email"
                      required
                      value={claimantEmail}
                      onChange={(e) => setClaimantEmail(e.target.value)}
                      placeholder="owner@business.in"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Proof of Ownership / Notes</label>
                  <textarea
                    rows={3}
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                    placeholder="e.g. GSTIN, Electricity bill info, or mention your official website / Instagram handle for fast verification..."
                    className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full justify-center font-bold text-xs bg-brand-black text-white"
                >
                  <span>Submit Ownership Claim</span>
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-brand-black">Claim Submitted Successfully</h2>
                <p className="text-xs text-brand-secondary max-w-sm mx-auto">
                  Our operations team will verify your phone number and ownership credentials within 24 hours. You will receive an SMS and email with your Business Console login details.
                </p>
              </div>

              <div className="pt-4">
                <Link href={`/business/${business.slug}`}>
                  <Button variant="outline" size="sm" className="font-bold text-xs">
                    Return to Business Page
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
