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

/**
 * Synchronizes markers and auto-bounds on the given Leaflet map instance.
 */
function syncMarkersToMap(
  L: any,
  map: any,
  list: Business[],
  selectedId: string | undefined,
  markersMap: Map<string, any>,
  onSelect?: (b: Business) => void,
  defaultCenter: [number, number] = [30.345, 78.05],
  defaultZoom: number = 13
) {
  // Remove existing markers
  markersMap.forEach((marker) => {
    try {
      map.removeLayer(marker);
    } catch (e) {}
  });
  markersMap.clear();

  const validBusinesses = list.filter(
    (biz) => typeof biz.latitude === 'number' && typeof biz.longitude === 'number'
  );

  validBusinesses.forEach((biz) => {
    const isSelected = biz.id === selectedId;
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
      if (onSelect) onSelect(biz);
    });

    markersMap.set(biz.id, marker);
  });

  // Fit bounds or center
  if (validBusinesses.length > 1) {
    const bounds = L.latLngBounds(validBusinesses.map((b) => [b.latitude, b.longitude]));
    map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
  } else if (validBusinesses.length === 1) {
    map.setView([validBusinesses[0].latitude, validBusinesses[0].longitude], defaultZoom || 14);
  } else {
    map.setView(defaultCenter, defaultZoom);
  }
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
    let isDisposed = false;
    const timers: NodeJS.Timeout[] = [];

    async function initMap() {
      const L = await import('leaflet');
      if (isDisposed || !mapContainerRef.current) return;
      LRef.current = L;

      // Fix default Leaflet asset path warnings
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '',
        iconUrl: '',
        shadowUrl: '',
      });

      // Tear down previous instance if present and purge _leaflet_id to prevent "Map container is already initialized"
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }

      if (mapContainerRef.current) {
        delete (mapContainerRef.current as any)._leaflet_id;
        mapContainerRef.current.innerHTML = '';
      }

      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      if (isDisposed) {
        try {
          map.remove();
        } catch (e) {}
        return;
      }

      mapInstanceRef.current = map;

      // Primary: Esri WorldStreetMap (enterprise CDN, zero ad-blocker domain issues, highly detailed cartography)
      const primaryTiles = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution:
            '&copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; StreetMap',
          maxZoom: 19,
          errorTileUrl:
            'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22256%22%20height%3D%22256%22%20viewBox%3D%220%200%20256%20256%22%3E%3Crect%20width%3D%22256%22%20height%3D%22256%22%20fill%3D%22%23EAEAE4%22%2F%3E%3C%2Fsvg%3E',
        }
      );

      // Reliable OpenStreetMap France fallback if primary experiences any network issue
      let fallbackTriggered = false;
      const handleTileError = () => {
        if (!fallbackTriggered && !isDisposed && mapInstanceRef.current) {
          fallbackTriggered = true;
          try {
            const fallbackTiles = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
              attribution:
                '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
              subdomains: 'abc',
              maxZoom: 19,
              errorTileUrl:
                'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22256%22%20height%3D%22256%22%20viewBox%3D%220%200%20256%20256%22%3E%3Crect%20width%3D%22256%22%20height%3D%22256%22%20fill%3D%22%23EAEAE4%22%2F%3E%3C%2Fsvg%3E',
            });
            fallbackTiles.addTo(mapInstanceRef.current);
          } catch (e) {}
        }
      };

      primaryTiles.on('tileerror', handleTileError);
      primaryTiles.addTo(map);

      // Immediately synchronize markers onto the map instance
      syncMarkersToMap(
        L,
        map,
        businesses,
        selectedBusinessId,
        markersMapRef.current,
        onSelectBusiness,
        center,
        zoom
      );

      // Force size invalidation across render microtasks to eliminate grey viewport tiles
      const invalidate = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      };

      invalidate();
      timers.push(setTimeout(invalidate, 80));
      timers.push(setTimeout(invalidate, 250));
      timers.push(setTimeout(invalidate, 500));
      timers.push(setTimeout(invalidate, 1000));
    }

    initMap();

    // Invalidate map whenever window is resized
    const handleWindowResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleWindowResize);

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
      isDisposed = true;
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        delete (mapContainerRef.current as any)._leaflet_id;
        mapContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  // 2. Synchronize Markers whenever businesses change
  useEffect(() => {
    if (!mapInstanceRef.current || !LRef.current) return;
    const L = LRef.current;
    const map = mapInstanceRef.current;

    syncMarkersToMap(
      L,
      map,
      businesses,
      selectedBusinessId,
      markersMapRef.current,
      onSelectBusiness,
      center,
      zoom
    );

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
    const map = mapInstanceRef.current;
    syncMarkersToMap(
      L,
      map,
      businesses,
      selectedBusinessId,
      markersMapRef.current,
      onSelectBusiness,
      center,
      zoom
    );
    map.invalidateSize();
  }, [businesses, selectedBusinessId, onSelectBusiness, center, zoom]);

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-brand-border/80 shadow-card bg-[#EAEAE4] ${className}`}
    >
      <div ref={mapContainerRef} className="w-full h-full min-h-[220px]" />

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
