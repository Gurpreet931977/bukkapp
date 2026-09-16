'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DEHRADUN_NEIGHBORHOODS } from '@/lib/seed/data';
import { MapPin, Navigation, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (loc: string) => void;
}

export function LocationSelectorModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}: LocationSelectorModalProps) {
  const [isDetecting, setIsDetecting] = useState(false);

  const handleUseCurrentLocation = () => {
    setIsDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsDetecting(false);
          onSelectLocation('Rajpur Road'); // Defaults to central Dehradun anchor
          onClose();
        },
        () => {
          setIsDetecting(false);
          onSelectLocation('Dehradun (All Areas)');
          onClose();
        }
      );
    } else {
      setIsDetecting(false);
      onSelectLocation('Dehradun (All Areas)');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Location"
      description="Discover availability and book instantly in your neighborhood."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Geolocation Button */}
        <button
          onClick={handleUseCurrentLocation}
          disabled={isDetecting}
          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-brand-lime bg-[#FAFDF4] hover:bg-[#F2FCD9] text-brand-black transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-lime flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4 text-brand-black" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-brand-black">Use Current Location</p>
              <p className="text-xs text-brand-secondary">Find bookable spots closest to you</p>
            </div>
          </div>
          {isDetecting && (
            <span className="text-xs font-semibold text-neutral-500 animate-pulse">Detecting...</span>
          )}
        </button>

        <div className="pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
            Dehradun Neighborhoods
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {DEHRADUN_NEIGHBORHOODS.map((hood) => {
              const isSelected = currentLocation === hood || (hood === 'All Areas' && currentLocation === 'Dehradun');
              return (
                <button
                  key={hood}
                  onClick={() => {
                    onSelectLocation(hood === 'All Areas' ? 'Dehradun' : hood);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-sm transition-all text-left ${
                    isSelected
                      ? 'bg-brand-black text-white font-medium shadow-xs'
                      : 'bg-brand-surface-alt hover:bg-[#EBEBE5] text-brand-black'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-brand-lime' : 'text-neutral-400'}`} />
                    <span className="truncate">{hood}</span>
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-brand-lime shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs text-brand-muted">
          <span>More cities launching soon</span>
          <span className="font-semibold text-brand-black">Default: Dehradun, UK</span>
        </div>
      </div>
    </Modal>
  );
}
