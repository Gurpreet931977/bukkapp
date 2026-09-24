'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import { Business } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Navigation } from 'lucide-react';

interface LeafletMapProps {
  businesses: Business[];
  selectedBusinessId?: string;
  onSelectBusiness?: (business: Business) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

/**
 * Creates luxury custom map pin icon with downward stem and active electric lime state.
 */
function createMarkerIcon(L: any, price: number, isSelected: boolean) {
  const iconHtml = `
    <div class="bukk-map-pin ${isSelected ? 'active' : ''}">
      <span class="pin-price">${formatPrice(price)}</span>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-div-icon',
    iconSize: [64, 30],
    iconAnchor: [32, 30], // Anchors exactly at the downward stem point
    popupAnchor: [0, -32], // Opens popup just above the pin
  });
}

/**
 * Creates rich modern popup card with media, rating, category, and direct booking CTA.
 */
function createPopupContent(biz: Business): string {
  const cover = biz.coverImage || (biz.gallery && biz.gallery[0]) || '';
  const subcategory = biz.subcategory || biz.categoryName || 'Service';
  const rating = typeof biz.rating === 'number' ? biz.rating.toFixed(1) : '5.0';
  const reviewCount = biz.reviewCount || 0;

  return `
    <div class="bukk-popup-card">
      ${cover ? `
        <div class="bukk-popup-media" style="background-image: url('${cover}')">
          <span class="bukk-popup-tag">${subcategory}</span>
          ${biz.verified ? '<span class="bukk-popup-verified">✓ Verified</span>' : ''}
        </div>
      ` : ''}
      <div class="bukk-popup-content">
        <div class="bukk-popup-header">
          <h4 class="bukk-popup-title" title="${biz.name}">${biz.name}</h4>
          <div class="bukk-popup-rating">
            <span class="bukk-star">★</span>
            <span class="bukk-rating-val">${rating}</span>
            <span class="bukk-rating-count">(${reviewCount})</span>
          </div>
        </div>
        <p class="bukk-popup-loc">${biz.neighborhood}, ${biz.city}</p>
        <div class="bukk-popup-action">
          <div class="bukk-popup-pricing">
            <span class="bukk-from-label">Starts at</span>
            <span class="bukk-price-val">${formatPrice(biz.startingPrice)}</span>
          </div>
          <a href="/business/${biz.slug}" class="bukk-popup-btn">
            <span>Book</span>
            <svg style="width:12px;height:12px;margin-left:4px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
          </a>
        </div>
      </div>
    </div>
  `;
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
  const LRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());

  // 1. Initialize Map Instance and Tile Layer ONCE on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    let isMounted = true;

    async function initMap() {
      const L = await import('leaflet');
      if (!isMounted || !mapContainerRef.current) return;
      LRef.current = L;

      // Fix default Leaflet asset path warnings
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '',
        iconUrl: '',
        shadowUrl: '',
      });

      // Tear down previous instance if present
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      // High-resolution, open CartoDB Voyager tiles (100% reliable, zero rate-limit blocks)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Force size invalidation across render microtasks to eliminate grey viewport tiles
      const invalidate = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      };

      invalidate();
      const t1 = setTimeout(invalidate, 120);
      const t2 = setTimeout(invalidate, 350);
      const t3 = setTimeout(invalidate, 700);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    initMap();

    // ResizeObserver ensures map always adapts to split container resize without grey clipping
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Synchronize Markers whenever businesses change
  useEffect(() => {
    if (!mapInstanceRef.current || !LRef.current) return;
    const L = LRef.current;
    const map = mapInstanceRef.current;

    // Remove obsolete markers
    markersMapRef.current.forEach((marker) => {
      map.removeLayer(marker);
    });
    markersMapRef.current.clear();

    const validBusinesses = businesses.filter((biz) => biz.latitude && biz.longitude);

    validBusinesses.forEach((biz) => {
      const isSelected = biz.id === selectedBusinessId;
      const customIcon = createMarkerIcon(L, biz.startingPrice, isSelected);

      const marker = L.marker([biz.latitude, biz.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 0,
      }).addTo(map);

      marker.bindPopup(createPopupContent(biz), {
        maxWidth: 260,
        className: 'bukk-custom-popup',
      });

      marker.on('click', () => {
        if (onSelectBusiness) onSelectBusiness(biz);
      });

      markersMapRef.current.set(biz.id, marker);
    });

    // Automatically frame all pins with 45px padding so no edge pins are cut off
    if (validBusinesses.length > 1) {
      const bounds = L.latLngBounds(validBusinesses.map((b) => [b.latitude, b.longitude]));
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
    } else if (validBusinesses.length === 1) {
      map.setView([validBusinesses[0].latitude, validBusinesses[0].longitude], zoom || 14);
    } else {
      map.setView(center, zoom);
    }

    // Trigger an immediate tile refresh after markers populate
    map.invalidateSize();
  }, [businesses]);

  // 3. Smoothly highlight selected pin WITHOUT tearing down the map
  useEffect(() => {
    if (!mapInstanceRef.current || !LRef.current) return;
    const L = LRef.current;

    markersMapRef.current.forEach((marker, id) => {
      const isSelected = id === selectedBusinessId;
      const biz = businesses.find((b) => b.id === id);
      if (!biz) return;

      const element = marker.getElement();
      if (element) {
        const pin = element.querySelector('.bukk-map-pin');
        if (pin) {
          if (isSelected) {
            pin.classList.add('active');
            marker.setZIndexOffset(1000);
          } else {
            pin.classList.remove('active');
            marker.setZIndexOffset(0);
          }
        }
      } else {
        // Fallback update icon if element is not in DOM
        marker.setIcon(createMarkerIcon(L, biz.startingPrice, isSelected));
        marker.setZIndexOffset(isSelected ? 1000 : 0);
      }
    });
  }, [selectedBusinessId, businesses]);

  // Recenter handler to smoothly frame all visible spots
  const handleRecenter = useCallback(() => {
    if (!mapInstanceRef.current || !LRef.current) return;
    const L = LRef.current;
    const valid = businesses.filter((b) => b.latitude && b.longitude);
    if (valid.length > 1) {
      const bounds = L.latLngBounds(valid.map((b) => [b.latitude, b.longitude]));
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 15,
        animate: true,
      });
    } else if (valid.length === 1) {
      mapInstanceRef.current.setView([valid[0].latitude, valid[0].longitude], 14, { animate: true });
    } else {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [businesses, center, zoom]);

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-brand-border/80 shadow-card bg-[#EAEAE4] ${className}`}
    >
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />

      {/* Floating Header Badge (Bottom Left) */}
      <div className="absolute bottom-4 left-3 z-[400] pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-black/5 shadow-subtle text-xs font-bold text-brand-black">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {businesses.length} {businesses.length === 1 ? 'spot' : 'spots'}
          </span>
        </div>
      </div>

      {/* Floating Recenter Button (Top Right) */}
      {businesses.length > 1 && (
        <button
          type="button"
          onClick={handleRecenter}
          className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white backdrop-blur-md border border-black/5 shadow-subtle hover:shadow-card text-xs font-bold text-brand-black transition-all active:scale-95 cursor-pointer"
          title="Recenter and frame all spots"
        >
          <Navigation className="w-3.5 h-3.5 text-brand-black" />
          <span>Fit All</span>
        </button>
      )}
    </div>
  );
}

export default LeafletMap;
