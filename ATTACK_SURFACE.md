# BUKKAPP Attack Surface Inventory & Threat Boundary Analysis

## 1. System Overview & Trust Boundaries

BUKKAPP is a multi-tenant local booking marketplace built on Next.js, TypeScript, and Supabase / PostgreSQL.
The architecture establishes 3 primary trust boundaries:
1. **Client Boundary (Browser / Mobile Web)**: Zero trust. Any client-sent price, duration, availability status, user role, or ownership claim is untrusted.
2. **Application / Server Action Layer**: Enforces input validation, role checks, and atomic state transactions.
3. **Database / Storage Layer**: PostgreSQL with Row Level Security (RLS) policies and append-only audit logging.

---

## 2. Actor Perspectives & Roles

| Actor | Identification | Privilege Scope | Key Threat Concerns |
|---|---|---|---|
| **Anonymous Visitor** | Unauthenticated | Public storefront browsing, category search, SEO pages | Denial-of-Service via search abuse, scraping, open redirect exploitation |
| **Customer** | `role: customer` | Bookings, profile, favorites, verified review submission | IDOR on other bookings, price tampering, fake reviews, account takeover |
| **Business Owner** | `role: business_owner` | Own storefront management, services, schedule, bookings | Cross-tenant breach (Business A -> Business B), privilege escalation to admin |
| **Administrator** | `role: admin` | Business verification, audit inspection, review moderation | Compromise of administrative credentials, unauthorized status transitions |

---

## 3. Attack Surface Inventory

### A. Public & Consumer Routes
- `/`: Hero, category shortcuts, natural language intent parser, featured cards.
- `/search`: Multi-parameter search (`q`, `category`, `neighborhood`, `minRating`, `maxPrice`, `sortBy`).
- `/category/[slug]`: Category-filtered marketplace listings.
- `/business/[slug]`: Business profile, service catalog, real-time availability slots, interactive map.
- `/book/[businessSlug]/[serviceId]`: Service booking entry point.
- `/booking/[bookingId]`: Booking confirmation ticket, opaque reference lookup (`BK-XXXXXX`).

### B. Authenticated Consumer Routes
- `/account`: Customer profile view and details.
- `/account/bookings`: List of customer's active and historical appointments.
- `/account/favorites`: Bookmarked businesses list.

### C. Merchant / Business Console Routes (Requires `ownerId` Authorization)
- `/business/dashboard`: Revenue, bookings count, upcoming appointments.
- `/business/bookings`: Booking management, status updates (confirm, complete, cancel).
- `/business/calendar`: Daily & weekly schedule view.
- `/business/services`: CRUD operations on services catalog.
- `/business/availability`: Business operating hours, blocked time slots.
- `/business/customers`: Customer list derived from business's appointments.
- `/business/reviews`: Review replies and customer feedback management.
- `/business/settings`: Storefront details, contact info, address.
- `/business/onboarding`: New merchant listing registration.

### D. Admin Console Routes (Requires `role === 'admin'`)
- `/admin`: Global verification queue, approval workflow, status transition controls, review moderation, category management, and append-only audit trail.

### E. Data Mutation Endpoints & Core Engines
- **Atomic Booking Engine (`src/lib/services/bookingService.ts`)**: Server-side interval collision guard, price snapshotting, reference generation.
- **Availability Service (`src/lib/services/availabilityService.ts`)**: Slot generation based on operating hours, duration, and blocked times.
- **Admin Service (`src/lib/services/adminService.ts`)**: State machine transition rules, audit log creation.
- **Data Store (`src/lib/db/store.ts`)**: In-memory indexed query engine with localStorage hydration.
- **Supabase RLS Script (`supabase/schema.sql`)**: PostgreSQL Row Level Security policies.
