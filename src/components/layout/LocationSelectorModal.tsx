'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DEHRADUN_NEIGHBORHOODS } from '@/lib/seed/data';
import { MapPin, Navigation, Check, Search, X } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNeighborhoods = useMemo(() => {
    if (!searchQuery.trim()) return DEHRADUN_NEIGHBORHOODS;
    const q = searchQuery.toLowerCase().trim();
    return DEHRADUN_NEIGHBORHOODS.filter((hood) =>
      hood.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleUseCurrentLocation = () => {
    setIsDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsDetecting(false);
          onSelectLocation('Rajpur Road'); // Central Dehradun anchor
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
          className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-brand-lime bg-[#FAFDF4] hover:bg-[#F2FCD9] text-brand-black transition-colors"
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

        <div className="pt-1">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Dehradun Neighborhoods
            </p>
            <span className="text-[11px] text-neutral-400 font-medium">
              {filteredNeighborhoods.length} areas
            </span>
          </div>

          {/* Search Filter Input */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area (e.g. Rajpur, Jakhan...)"
              className="w-full pl-8.5 pr-8 py-2 text-xs font-medium bg-neutral-50 hover:bg-white focus:bg-white border border-brand-border/80 focus:border-brand-black rounded-xl transition-all placeholder:text-neutral-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-brand-black rounded-full"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dedicated Scroll Container Wrapper (prevents WebKit grid clipping, adds gutter & bottom padding) */}
          <div className="overflow-y-auto overscroll-contain max-h-[290px] sm:max-h-[330px] pr-2 -mr-2 pb-2 custom-scrollbar">
            {filteredNeighborhoods.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredNeighborhoods.map((hood) => {
                  const isSelected =
                    currentLocation === hood ||
                    (hood === 'All Areas' &&
                      (currentLocation === 'Dehradun' || currentLocation === 'Dehradun (All Areas)'));
                  return (
                    <button
                      key={hood}
                      type="button"
                      onClick={() => {
                        onSelectLocation(hood === 'All Areas' ? 'Dehradun' : hood);
                        onClose();
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all text-left border ${
                        isSelected
                          ? 'bg-brand-black text-white border-brand-black shadow-xs'
                          : 'bg-neutral-50 hover:bg-white text-brand-black border-brand-border/70 hover:border-brand-border hover:shadow-2xs'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <MapPin
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-brand-lime' : 'text-neutral-400'
                          }`}
                        />
                        <span className="truncate">{hood}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-lime shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-neutral-400 font-medium">
                No neighborhoods matching &quot;{searchQuery}&quot;
              </div>
            )}
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
