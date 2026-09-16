# BUKKAPP - MASTER INTERACTION & MICRO-ANIMATION INVENTORY

**Date:** August 22, 2026  
**Author:** Gemini / Antigravity Design & Interaction Unit  
**Design Tokens:** Black (`#111111`), Warm Off-White (`#FAFAF8`), Electric Lime (`#C7F36B`), Soft Neutral (`#F3F3EF`)  

---

## 1. Motion Principles & Timing Hierarchy

The BUKKAPP interaction model is structured across three distinct motion tiers with explicit timing budgets and easing curves:

1. **Level 1 - Micro-Feedback (100ms - 220ms)**
   - **Curves:** `cubic-bezier(0.4, 0, 0.2, 1)` (snappy ease-out) / `cubic-bezier(0.175, 0.885, 0.32, 1.275)` (playful spring)
   - **Usage:** Button active clicks (`.btn-press`), favorite heart pops (`.animate-heart-pop`), time slot clicks (`.slot-tactile`), accordion toggles, tooltip reveals.
2. **Level 2 - Interface Transitions (200ms - 400ms)**
   - **Curves:** `cubic-bezier(0.16, 1, 0.3, 1)` (deceleration curve)
   - **Usage:** Modal dialog entries (`animate-scale-in`, `animate-slide-up`), tab switches, toast notifications, sticky booking bar slide-in (`.animate-sticky-cta`).
3. **Level 3 - Editorial & Brand Delight (400ms - 800ms)**
   - **Curves:** `cubic-bezier(0.34, 1.56, 0.64, 1)` (overshoot stamp effect)
   - **Usage:** Digital boarding pass ticket stamp (`.animate-ticket-stamp`), rotating hero intent placeholder (3.6s cycle), shimmer loading states (`.skeleton-shimmer`).

---

## 2. Interactive Component Dictionary

### A. Discovery & Hero (`HeroSection.tsx`)
- **Rotating Intent Placeholder**: Cycles through realistic natural-language search queries ("Pickleball court near Rajpur Road", "Dentist appointment tomorrow 6 PM", "Hair spa in Jakhan under ₹1000", "AC servicing in Ballupur") every 3600ms with a vertical flip transition.
- **Intent Chips Strip**: Chips detect matching keywords in real-time. Clicking any chip immediately inputs the intent, navigates to `/search`, and activates corresponding category and price filters.
- **Micro-Press Physics**: The primary search submit button triggers a tactile `scale(0.97)` depression on pointer-down with shadow elevation reduction.

### B. Business Marketplace Cards (`BusinessCard.tsx`)
- **Elevation Physics**: Hovering over any card triggers an upward translate of `-3px` with shadow expansion (`shadow-subtle` to `shadow-card`) and a subtle lime border highlight.
- **Heart Pop Favorite Toggle**: Clicking the bookmark icon triggers a bouncy scale pop (`scale(1.35) -> scale(1.0)`) via `.animate-heart-pop` and renders a bottom-right toast message (`"Saved to your favorites"` / `"Removed from favorites"`).
- **Live Availability Soft Pulse**: Verified businesses displaying open slots today render a lime beacon with an infinite soft pulse keyframe (`pp-glow-pulse`).
- **Quick Direct Book Trigger**: Clicking "Book Slot" opens the `BookingFlowModal` directly on top of the search view, eliminating page reloads and context loss.

### C. Public Storefront (`/business/[slug]`)
- **Full-Screen Photo Lightbox**: Clicking any photo in the 5-photo grid or cover header opens `LightboxModal` with smooth backdrop blur, keyboard navigation (Left/Right Arrow, Escape), swipe gestures, and clickable thumbnail reel.
- **Sticky Floating Action Bar**: When the user scrolls past the top booking card, a floating bottom bar slides into view (`.animate-sticky-cta`) featuring the business avatar, price, and instant "Book Appointment" CTA.
- **5-Star Interactive Rating Form**: Clicking the "Write a Review" button triggers a modal with interactive star hovers, review submission, and instant store update.
- **Operating Hours Accordion**: Clicking the "Working Hours" accordion smoothly expands the 7-day schedule with visual highlighting of the current day.

### D. Digital Ticket Pass (`/booking/[bookingId]`)
- **Holographic Entrance Stamp**: Upon loading a confirmed reservation, a diagonal "CONFIRMED" boarding pass stamp slams down with spring physics (`.animate-ticket-stamp`).
- **1-Click Calendar Sync**: Clicking "Add to Google Calendar" opens a pre-populated event URL; clicking "Apple / Outlook (.ICS)" automatically triggers a downloadable RFC-5545 calendar file.
- **Copy Booking Code**: Clicking the booking reference copy button triggers clipboard write and renders a confirmation toast.
- **Cancellation Modal with Slot Release**: Clicking "Cancel Booking" opens a confirmation dialog that atomizes slot release back into the pool.

### E. Customer Account Hub (`/account`)
- **Synchronized Tab Switching**: Switching between "Upcoming Bookings", "Past Appointments", and "Saved Specialists" updates URL parameters in real time (`?tab=...`), enabling shareable deep links.
- **In-Situ Review Submission**: Completed appointments feature a "Review Specialist" button that opens an in-modal rating dialog without leaving the page.
- **Saved Favorites Direct Booking**: Saved merchant cards include a 1-click "Book Again" button that launches the booking modal directly.

### F. Merchant Business Console (`/business/*`)
- **Dynamic Profile Meter**: Progress bar recalculates in real-time as merchants add services, photos, and hours.
- **Direct Walk-In Reservation Modal**: Allows merchant to record a phone booking in 3 clicks with automated slot collision detection.
- **Schedule Copy Utility**: "Copy Monday to Weekdays" copies standard hours across Monday-Friday with single-click confirmation toast.
- **Calendar Time Slot Inspection**: Clicking any open slot on the timeline opens a quick-block modal; clicking any booked slot displays customer details and phone link.
- **Public Owner Review Reply**: Merchants can type and post official public responses directly under verified customer reviews.

### G. Admin Operations Control Room (`/admin`)
- **1-Click Moderation Actions**: Approve, Request Changes (with custom feedback note modal), and Suspend actions update merchant status and append an immutable entry to the audit log.
- **Marketplace Category Creator**: Validates and creates new category taxonomies with automated URL slug generation.
- **Immutable Audit Log Filter**: Real-time searchable log of all platform transactions and admin operations.

---

## 3. Accessibility & Reduced Motion

All interaction components check for user motion preferences:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
All modals trap keyboard focus, provide `aria-labels`, support Escape-key dismissal, and maintain minimum contrast ratios of 4.5:1 against the warm-white background.
