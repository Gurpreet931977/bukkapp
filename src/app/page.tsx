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
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentLocation, setCurrentLocation] = useState('Dehradun');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    setBusinesses(store.getBusinesses());
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
        onSelectLocation={(loc) => setCurrentLocation(loc)}
      />
    </main>
  );
}
