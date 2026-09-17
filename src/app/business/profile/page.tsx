'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import { Business } from '@/types';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DEHRADUN_NEIGHBORHOODS } from '@/lib/seed/data';
import {
  Store,
  ExternalLink,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  Phone,
  Globe,
} from 'lucide-react';

export default function BusinessProfileEditorPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('Rajpur Road');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const refreshData = () => {
    const user = store.getCurrentUser();
    const allBiz = store.getAllBusinessesAdmin();
    const activeBiz = user.businessId
      ? store.getBusinessById(user.businessId) || allBiz[0]
      : allBiz[0];

    if (activeBiz) {
      setBusiness(activeBiz);
      setName(activeBiz.name);
      setTagline(activeBiz.tagline || '');
      setDescription(activeBiz.description || '');
      setAddress(activeBiz.address);
      setNeighborhood(activeBiz.neighborhood);
      setPhone(activeBiz.phone);
      setEmail(activeBiz.email);
      setWebsite(activeBiz.website || '');
      setInstagram(activeBiz.instagram || '');
      setCoverImage(activeBiz.coverImage);
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = store.subscribe(() => refreshData());
    return unsub;
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    store.updateBusinessProfile(business.id, {
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      address: address.trim(),
      neighborhood,
      phone: phone.trim(),
      email: email.trim(),
      website: website.trim() || undefined,
      instagram: instagram.trim() || undefined,
      coverImage: coverImage.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  if (!business) return null;

  return (
    <BusinessLayout>
      <form onSubmit={handleSave} className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
              My BUKKAPP Page
            </h1>
            <p className="text-xs sm:text-sm text-brand-secondary mt-0.5">
              Edit what customers see when visiting your public storefront
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/business/${business.slug}`} target="_blank">
              <Button type="button" variant="outline" size="sm" className="text-xs font-bold border-brand-border gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Preview as customer</span>
              </Button>
            </Link>

            <Button type="submit" variant="primary" size="sm" className="text-xs font-bold bg-brand-black text-white gap-1.5">
              <Save className="w-3.5 h-3.5" />
              <span>Save changes</span>
            </Button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            Your changes were saved successfully and are now live for customers!
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-muted">
            Storefront Basics
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Business Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black font-semibold text-brand-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">One-Line Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Premier 3-Court Pickleball Arena in Dehradun"
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">About Your Business</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers about your facilities, experience, and what makes your business special..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Photos & Cover */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-muted">
            Photos & Imagery
          </h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Cover Photo URL</label>
              <input
                type="url"
                required
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
              />
            </div>

            {coverImage && (
              <div className="relative aspect-16/9 max-w-md rounded-2xl overflow-hidden border border-brand-border">
                <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Location & Neighborhood */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-muted">
            Location & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Street Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Plot 14, Old Rajpur Road"
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
              />
            </div>

            <div>
              <CustomSelect
                label="Neighborhood"
                value={neighborhood}
                onChange={setNeighborhood}
                options={DEHRADUN_NEIGHBORHOODS.slice(1)}
                searchable
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Phone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@business.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto font-black text-xs px-8 bg-brand-black text-white">
            <span>Save and publish page changes</span>
          </Button>
        </div>
      </form>
    </BusinessLayout>
  );
}
