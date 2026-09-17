# BUKKAPP - Universal Local Booking Marketplace

> **"Everything you need. Booked."**

BUKKAPP is a universal local booking marketplace and infrastructure platform connecting consumers with trusted local businesses across appointments, time-slot bookings, service visits, and reservations.

Built with a **zero-paid-dependency / free-first architecture**, production-quality TypeScript, Next.js App Router, Tailwind CSS, Leaflet OpenStreetMap, an atomic collision-free booking engine, and a natural language search intent parser.

---

## Key Highlights

- **Linear / Airbnb / Stripe Aesthetic**: Near-black `#111111`, electric lime `#C7F36B` focal highlights, warm white surfaces `#FAFAF8`, and crisp typography.
- **Natural Language Search Parser (`SearchIntentParser`)**: Interprets queries like `"dentist tomorrow after 6"` or `"pickleball for 4 saturday"`.
- **Live Time Slot Availability**: Visually communicates discrete bookable hours (e.g. `5:30 PM`, `6:30 PM`, `7:15 PM`) right on cards and category pages.
- **Server-Authoritative Atomic Booking Engine**: Guarantees zero double-booking or concurrency collisions with unique references (`BK-XXXXXX`).
- **Interactive Leaflet + OpenStreetMap**: Dynamic client-safe maps with custom price pin overlays and popups (zero Google Maps API costs).
- **Merchant SaaS Dashboard**: Multi-store switcher, live booking status controls, service catalog CRUD, operating schedule editor, and customer review response portal.
- **Super-Admin Operations Room**: City-wide listing approvals, verification badges, booking oversight, and taxonomy management.
- **Calendar Synchronization**: One-click Google Calendar integration and `.ics` file downloads.
- **Launch City Seed**: Pre-seeded with 32+ realistic businesses in **Dehradun, Uttarakhand, India** across 10 neighborhoods (Rajpur Road, Jakhan, Ballupur, Vasant Vihar, Race Course, Sahastradhara Road, Clock Tower, etc.).

---

## Technology Stack

| Layer | Technology | Cost / Tier |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) + React 18 | 100% Free / Open Source |
| **Language** | TypeScript | Free |
| **Styling** | Tailwind CSS + Custom Design Tokens | Free |
| **Icons** | Lucide React | Free / Open Source |
| **Maps** | Leaflet + OpenStreetMap (OSM) | Free / Zero API Keys |
| **Data Layer** | Unified Store (In-Memory + LocalStorage + Supabase Adapter) | Free |
| **Hosting Target** | Vercel Free Tier | Free |

---

## Quickstart Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## Key Routes

- `/`: Consumer Homepage with NLP Search, Popular Categories, and Live Slots
- `/search`: Universal Search & Filter Engine with Grid / Split Map View
- `/category/[slug]`: Category Landing Pages (e.g. `/category/health-wellness`, `/category/beauty-grooming`)
- `/business/[slug]`: Business Storefront & Interactive Booking Trigger
- `/book/[businessSlug]/[serviceId]`: Multi-step Booking Checkout
- `/booking/[bookingId]`: Digital Boarding Ticket, Calendar Sync & Directions
- `/account`: Customer Hub (Upcoming appointments, past history, review modal, favorites)
- `/business/onboarding`: 4-Step Merchant Storefront Onboarding Wizard
- `/business/dashboard`: Merchant Control Center
- `/admin`: Super-Admin Verification & Operations Room

---

## Project Documentation

- [`MANUAL_SETUP.md`](./MANUAL_SETUP.md): Step-by-step founder checklist for testing, Supabase setup, and deployment.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md): Technical deep dive into data flow, search parser, and booking concurrency.
- [`ENVIRONMENT.md`](./ENVIRONMENT.md): Environment variables, secrets handling, and defaults.
- [`PRODUCT_NOTES.md`](./PRODUCT_NOTES.md): Business model, product thesis, and future monetization placeholders.
- [`TESTING.md`](./TESTING.md): Comprehensive QA checklist and verification runbook.
