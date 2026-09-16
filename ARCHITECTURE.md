# BUKKAPP Architecture & Technical Design

## 1. System Architecture Overview

BUKKAPP is engineered as a modern, modular web application built on **Next.js App Router**, **TypeScript**, and a client/server data management layer with zero paid dependencies.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser Layer                     │
│  - Tailwind CSS + Inter Font + Electric Lime Tokens        │
│  - Leaflet + OpenStreetMap Interactive Maps                │
│  - Instant Live Time-Slot Grid & Local State Hydration      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Route Handlers                │
│  - / (Homepage & Discovery)                                 │
│  - /search (Natural Language Intent + Multivariant Filters) │
│  - /category/[slug] (SEO & Subcategory taxonomy)           │
│  - /business/[slug] (Storefront, Services & Reviews)        │
│  - /book/[businessSlug]/[serviceId] (Booking Flow)          │
│  - /booking/[bookingId] (Digital Boarding Pass Ticket)      │
│  - /account (Customer History, Favorites, Reviews)          │
│  - /business/dashboard (Merchant SaaS Control Panel)        │
│  - /admin (Operations, Verification & Moderation)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       Core Engine Layer                     │
│  - SearchIntentParser (Rule-based NLP & intent extraction)  │
│  - BookingEngine (Atomic slot locking & conflict prevention)│
│  - PaymentProvider (MockPaymentProvider / Razorpay ready)   │
│  - NotificationEngine (Google Calendar URL + ICS generator) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data & Persistence Layer                  │
│  - DataStore (In-Memory Singleton + LocalStorage Sync)      │
│  - Supabase PostgreSQL Client Adapter Ready                 │
│  - 32+ Seeded Dehradun Businesses & 100+ Services           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Natural Language Search Intent Engine

The `SearchIntentParser` parses unstructured consumer search queries into structured filter tuples:

```typescript
interface ParsedSearchIntent {
  rawQuery: string;
  detectedCategory?: string;       // e.g. 'health-wellness'
  detectedNeighborhood?: string;   // e.g. 'Rajpur Road'
  detectedDate?: string;           // e.g. '2026-08-23'
  detectedTimeFrom?: string;       // e.g. '18:00'
  detectedMaxPrice?: number;       // e.g. 800
  detectedRating?: number;         // e.g. 4.5
  confidence: number;              // 0 to 100%
}
```

Queries like `"dentist tomorrow after 6 under 1000"` are parsed into category, date, time floor, and price ceiling before querying the indexed business catalog.

---

## 3. Server-Authoritative Booking Concurrency

The `BookingEngine` enforces a 10-step atomic validation sequence to ensure slots cannot be double-booked:

1. **Identity & Contact Check**: Validates name, phone number, and email.
2. **Business Status**: Confirms merchant is currently active and accepting bookings.
3. **Service Validation**: Ensures service ID exists and belongs to the merchant.
4. **Date Integrity**: Forbids appointments in the past.
5. **Operating Hours**: Validates that start time and `durationMinutes` fall completely inside the merchant's open hours for that specific day of the week.
6. **Collision Check**: Scans existing bookings on that date for overlapping time intervals `(start < bEnd && end > bStart)`.
7. **Atomic Creation**: Appends confirmed booking with unique reference `BK-XXXXXX`.
8. **Notification & Calendar**: Emits event and generates `.ics` attachment and Google Calendar deep link.

---

## 4. Map Integration Without Paid Google APIs

Leaflet is loaded with OpenStreetMap raster tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- Client-only dynamic initialization prevents Next.js SSR `window is not defined` errors.
- Custom HTML markers render interactive price tags (e.g. `₹500`) with hover elevation and popup cards.
