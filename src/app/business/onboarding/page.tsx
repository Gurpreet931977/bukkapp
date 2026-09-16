'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import { Button } from '@/components/ui/Button';
import { INITIAL_CATEGORIES, DEHRADUN_NEIGHBORHOODS } from '@/lib/seed/data';
import {
  Store,
  Layers,
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(INITIAL_CATEGORIES[0].id);
  const [subcategory, setSubcategory] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('Rajpur Road');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');

  // Services
  const [serviceName, setServiceName] = useState('Standard Service Session');
  const [servicePrice, setServicePrice] = useState('500');
  const [serviceDuration, setServiceDuration] = useState('45');

  // Hours
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('20:00');

  // Photo
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bukkapp_onboarding_draft');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.name) setName(d.name);
        if (d.categoryId) setCategoryId(d.categoryId);
        if (d.subcategory) setSubcategory(d.subcategory);
        if (d.phone) setPhone(d.phone);
        if (d.email) setEmail(d.email);
        if (d.address) setAddress(d.address);
        if (d.neighborhood) setNeighborhood(d.neighborhood);
        if (d.serviceName) setServiceName(d.serviceName);
        if (d.servicePrice) setServicePrice(d.servicePrice);
        if (d.serviceDuration) setServiceDuration(d.serviceDuration);
        if (d.openTime) setOpenTime(d.openTime);
        if (d.closeTime) setCloseTime(d.closeTime);
        if (d.coverImage) setCoverImage(d.coverImage);
        if (d.currentStep) setCurrentStep(d.currentStep);
        setDraftRestored(true);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Auto-save draft on change
  useEffect(() => {
    if (name || phone || email) {
      try {
        localStorage.setItem(
          'bukkapp_onboarding_draft',
          JSON.stringify({
            currentStep,
            name,
            categoryId,
            subcategory,
            phone,
            email,
            address,
            neighborhood,
            serviceName,
            servicePrice,
            serviceDuration,
            openTime,
            closeTime,
            coverImage,
          })
        );
      } catch (e) {}
    }
  }, [
    currentStep,
    name,
    categoryId,
    subcategory,
    phone,
    email,
    address,
    neighborhood,
    serviceName,
    servicePrice,
    serviceDuration,
    openTime,
    closeTime,
    coverImage,
  ]);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitForReview = () => {
    localStorage.removeItem('bukkapp_onboarding_draft');
    setIsSubmitting(true);
    const category = INITIAL_CATEGORIES.find((c) => c.id === categoryId) || INITIAL_CATEGORIES[0];

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const standardSchedule = [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
      dayOfWeek,
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
      isOpen: true,
      openTime,
      closeTime,
    }));

    const newBiz = store.addBusiness({
      ownerId: store.getCurrentUser().id,
      name: name.trim() || 'My Business',
      slug: slug || `business-${Date.now()}`,
      tagline: tagline.trim() || `Top-rated ${category.name} service in Dehradun`,
      description: description.trim() || 'Professional booking service on BUKKAPP.',
      categoryId: category.id,
      categoryName: category.name,
      subcategory: subcategory.trim() || category.popularServices[0] || 'Service',
      address: address.trim() || 'Rajpur Road, Dehradun',
      neighborhood,
      city: 'Dehradun',
      state: 'Uttarakhand',
      country: 'India',
      postalCode: '248001',
      latitude: 30.3165,
      longitude: 78.0322,
      phone: phone.trim() || '+91 98765 00000',
      email: email.trim() || 'contact@business.in',
      coverImage: coverImage.trim(),
      gallery: [coverImage.trim()],
      verified: false,
      status: 'pending_review',
      startingPrice: parseInt(servicePrice, 10) || 500,
      features: ['Air Conditioned', 'Instant Confirmation', 'Free Parking'],
      schedule: standardSchedule,
      active: false,
    });

    // Add initial service
    store.addService({
      businessId: newBiz.id,
      name: serviceName.trim(),
      description: 'Standard booking session.',
      price: parseInt(servicePrice, 10) || 500,
      durationMinutes: parseInt(serviceDuration, 10) || 45,
      active: true,
    });

    // Switch current user's business ID
    const u = store.getCurrentUser();
    store.setCurrentUser({ ...u, role: 'business_owner', businessId: newBiz.id });

    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/business/dashboard');
    }, 1000);
  };

  const steps = [
    { num: 1, label: 'Business Details' },
    { num: 2, label: 'Add Services' },
    { num: 3, label: 'Working Hours' },
    { num: 4, label: 'Photos' },
    { num: 5, label: 'Preview & Submit' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Progress Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
              Step {currentStep} of 5
            </span>
            <span className="text-xs font-black text-brand-black">
              {Math.round((currentStep / 5) * 100)}% Complete
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-brand-border/60 overflow-hidden">
            <div
              className="h-full bg-brand-black transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-card space-y-6">
          {/* STEP 1: Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
                  Tell us about your business
                </h1>
                <p className="text-xs sm:text-sm text-brand-secondary mt-1">
                  Enter basic contact and location details for your BUKKAPP storefront
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Business Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Zenith Pickleball Club"
                    className="w-full px-4 py-3 rounded-xl border border-brand-border text-sm focus:outline-hidden focus:border-brand-black text-brand-black font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black bg-white text-brand-black font-semibold"
                    >
                      {INITIAL_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Subcategory</label>
                    <input
                      type="text"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      placeholder="e.g. Pickleball Arena, Dental Clinic"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Street Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Plot 14, Old Rajpur Road"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Neighborhood</label>
                    <select
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black bg-white text-brand-black font-semibold"
                    >
                      {DEHRADUN_NEIGHBORHOODS.slice(1).map((hood) => (
                        <option key={hood} value={hood}>{hood}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@business.in"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Services */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
                  Add what customers can book
                </h1>
                <p className="text-xs sm:text-sm text-brand-secondary mt-1">
                  You can add more services and custom prices later in your dashboard
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Primary Service Name</label>
                  <input
                    type="text"
                    required
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g. Standard Court Booking (60m)"
                    className="w-full px-4 py-3 rounded-xl border border-brand-border text-sm focus:outline-hidden focus:border-brand-black text-brand-black font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Price (INR)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      placeholder="600"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Duration</label>
                    <select
                      value={serviceDuration}
                      onChange={(e) => setServiceDuration(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black bg-white text-brand-black font-semibold"
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes (1 hour)</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Working Hours */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
                  Tell us when customers can visit
                </h1>
                <p className="text-xs sm:text-sm text-brand-secondary mt-1">
                  Set your standard daily opening and closing hours
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Opening Time</label>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-border text-xs text-brand-black font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Closing Time</label>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-border text-xs text-brand-black font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Photos */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
                  Add your photos
                </h1>
                <p className="text-xs sm:text-sm text-brand-secondary mt-1">
                  High-quality photography builds trust with customers
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Cover Image URL</label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-border text-xs text-brand-black"
                  />
                </div>

                <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-brand-border">
                  <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Preview & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
                  Preview your page
                </h1>
                <p className="text-xs sm:text-sm text-brand-secondary mt-1">
                  This is how your storefront will look to customers on BUKKAPP
                </p>
              </div>

              {/* Preview Card */}
              <div className="p-6 rounded-2xl bg-brand-surface-alt border border-brand-border space-y-4">
                <div className="flex items-start gap-4">
                  <img src={coverImage} alt="Cover" className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <h3 className="text-lg font-black text-brand-black">{name || 'Your Business Name'}</h3>
                    <p className="text-xs text-brand-secondary">{subcategory || 'Service'} • {neighborhood}, Dehradun</p>
                    <p className="text-xs font-bold text-brand-black mt-1">
                      {serviceName} — {formatPrice(parseInt(servicePrice, 10) || 500)} ({serviceDuration}m)
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-brand-border text-xs text-brand-secondary">
                  Open daily: {openTime} to {closeTime}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-brand-border flex items-center justify-between">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" size="md" onClick={handlePrev} className="text-xs font-bold gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNext}
                disabled={currentStep === 1 && !name.trim()}
                className="text-xs font-bold bg-brand-black text-white gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="accent"
                size="lg"
                onClick={handleSubmitForReview}
                disabled={isSubmitting}
                className="text-xs font-black bg-brand-lime text-brand-black px-8"
              >
                <span>{isSubmitting ? 'Sending...' : 'Send page for verification'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
