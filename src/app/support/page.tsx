'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Mail, Phone, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function SupportPage() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setSubmitted(true);
    showToast('Message sent to BUKKAPP Support', 'success', 'We will respond within 4 hours.');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-secondary hover:text-brand-black">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-card space-y-6">
          <div className="space-y-2 border-b border-brand-border pb-6">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Help & Support</span>
            <h1 className="text-3xl font-black text-brand-black tracking-tight">How can we help you?</h1>
            <p className="text-xs text-brand-secondary">Reach the BUKKAPP team in Dehradun</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Gurpreet Singh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Email or Phone</label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. gurpreet@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question about my booking / Business onboarding"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="md" className="w-full justify-center font-bold text-xs bg-brand-black text-white">
                  <span>Send Message</span>
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-brand-black">Thank you! Message Received</h2>
              <p className="text-xs text-brand-secondary max-w-sm mx-auto">
                Our support team has received your message and will get back to you shortly.
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-brand-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-brand-secondary">
            <div className="p-4 rounded-2xl bg-brand-surface-alt border border-brand-border space-y-1">
              <p className="font-bold text-brand-black flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span>Email Support</span>
              </p>
              <p className="text-[11px] text-neutral-500">support@bukkapp.in</p>
            </div>

            <div className="p-4 rounded-2xl bg-brand-surface-alt border border-brand-border space-y-1">
              <p className="font-bold text-brand-black flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-500" />
                <span>Helpline (Dehradun)</span>
              </p>
              <p className="text-[11px] text-neutral-500">+91 135 271 0000 (9 AM - 8 PM)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
