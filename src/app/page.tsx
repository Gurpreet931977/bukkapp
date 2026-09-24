'use client';

import React, { useState, useEffect } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { PopularCategories } from '@/components/home/PopularCategories';
import { AvailableTodaySection } from '@/components/home/AvailableTodaySection';
import { NearYouSection } from '@/components/home/NearYouSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { BusinessCTA } from '@/components/home/BusinessCTA';
import { LocationSelectorModal } from '@/components/layout/LocationSelectorModal';
import { store } from '@/lib/db/store';
import { Business } from '@/types';

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>(() => store.getBusinesses());
  const [currentLocation, setCurrentLocation] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bukkapp_location') || 'Dehradun';
    }
    return 'Dehradun';
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handleSelectLocation = (loc: string) => {
    setCurrentLocation(loc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bukkapp_location', loc);
      window.dispatchEvent(new CustomEvent('bukkapp:location-change', { detail: loc }));
    }
  };

  useEffect(() => {
    const handleLoc = (e: any) => {
      if (e.detail) setCurrentLocation(e.detail);
    };
    window.addEventListener('bukkapp:location-change', handleLoc);
    return () => window.removeEventListener('bukkapp:location-change', handleLoc);
  }, []);

  useEffect(() => {
    // Keep in sync with store updates
    const unsub = store.subscribe(() => {
      setBusinesses(store.getBusinesses());
    });
    return unsub;
  }, []);

  return (
    <main className="min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection
        currentLocation={currentLocation}
        onOpenLocation={() => setIsLocationModalOpen(true)}
      />

      {/* 2. Popular Categories */}
      <PopularCategories />

      {/* 3. Available Today Live Slots */}
      <AvailableTodaySection businesses={businesses} />

      {/* 4. Book Near You Grid */}
      <NearYouSection businesses={businesses} />

      {/* 5. How BUKKAPP Works */}
      <HowItWorks />

      {/* 6. Business Partner CTA */}
      <BusinessCTA />

      {/* Location Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
      />
    </main>
  );
}
