# BUKKAPP Admin Console: Marketplace Operations Guide

## 1. Role & Purpose

The Admin Console (`/admin`) is the central operations room for the BUKKAPP marketplace founder and operations team to govern supply quality, verify new merchant storefronts, moderate reviews, and supervise city-wide bookings.

---

## 2. Business Verification Workflow

```text
Draft (Owner creating page)
    ↓
Pending Review (Owner submits for verification)
    ↓
Admin Review Decision:
    ├── Approve & Publish -> Status becomes 'active' (Verified badge granted)
    ├── Request Changes -> Status becomes 'needs_changes' (Owner receives actionable feedback)
    └── Reject / Suspend -> Status becomes 'suspended'
```

---

## 3. Core Admin Capabilities

1. **Storefront Verification**: Inspect submitted businesses, review photos and hours, trigger 1-click approvals, or send structured change requests.
2. **Review Moderation**: Inspect reported customer reviews, hide abusive content from the public storefront, or restore valid feedback.
3. **Category Taxonomy**: Create and reorder categories with slugs and description meta.
4. **Marketplace Bookings Stream**: Search all city-wide bookings by reference (`BK-XXXXXX`), customer name, or business, with emergency cancellation controls.
5. **System Audit Trail**: Immutable logging of all admin actions (`business_approved`, `changes_requested`, `business_suspended`, `category_created`).
