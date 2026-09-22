'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { Business } from '@/types';
import { formatPrice } from '@/lib/utils';

interface LeafletMapProps {
  businesses: Business[];
  selectedBusinessId?: string;
  onSelectBusiness?: (business: Business) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

export function LeafletMap({
  businesses,
  selectedBusinessId,
  onSelectBusiness,
  className = 'h-[500px] w-full',
  center = [30.345, 78.05], // Central Dehradun coordinates
  zoom = 13,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Dynamically load Leaflet to prevent SSR breakage
    let isMounted = true;

    async function initMap() {
      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      // If map is already created, remove it before reinitializing
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        scrollWheelZoom: false,
      });

      // Add OpenStreetMap tile layer (Free Open-Source Tiles)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersRef.current = [];

      // Render custom price badges for each business
      businesses.forEach((biz) => {
        if (!biz.latitude || !biz.longitude) return;

        const isSelected = biz.id === selectedBusinessId;
        const iconHtml = `
          <div class="custom-map-pin ${isSelected ? 'active' : ''}">
            <span>${formatPrice(biz.startingPrice)}</span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-leaflet-div-icon',
          iconSize: [60, 26],
          iconAnchor: [30, 13],
        });

        const marker = L.marker([biz.latitude, biz.longitude], { icon: customIcon }).addTo(map);

        const popupContent = `
          <div style="font-family: sans-serif; padding: 4px; max-width: 220px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 2px; color: #111;">${biz.name}</div>
            <div style="font-size: 11px; color: #666; margin-bottom: 6px;">${biz.subcategory} • ${biz.neighborhood}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-top: 6px; border-top: 1px solid #eee; padding-top: 6px;">
              <span style="font-weight: 700;">${formatPrice(biz.startingPrice)}</span>
              <a href="/business/${biz.slug}" style="background: #111; color: #fff; text-decoration: none; padding: 3px 8px; border-radius: 6px; font-weight: 600; font-size: 11px;">Book</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          if (onSelectBusiness) onSelectBusiness(biz);
        });

        markersRef.current.push({ id: biz.id, marker });
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [businesses, selectedBusinessId]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-brand-border shadow-card ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />
    </div>
  );
}

export default LeafletMap;
