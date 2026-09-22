# BUKKAPP Database Setup Guide

This guide explains how to provision, connect, and deploy the BUKKAPP PostgreSQL database schema using Supabase, Neon, AWS RDS, or any standard PostgreSQL server.

---

## 1. Prerequisites

- A PostgreSQL database instance (PostgreSQL 14 or higher).
- Recommended managed providers:
  - **Supabase** (includes Auth, Storage, and Realtime natively)
  - **Neon Serverless Postgres**
  - **AWS RDS PostgreSQL**

---

## 2. Deploying the Schema

### Option A: Via Supabase SQL Editor (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project and navigate to the **SQL Editor** in the left sidebar.
3. Click **New query**.
4. Open [DATABASE_SCHEMA.sql](file:///Users/metagurpreet/Desktop/Bukkapp/DATABASE_SCHEMA.sql) from this project.
5. Copy and paste the entire content into the SQL Editor.
6. Click **Run** (or `Cmd + Enter`).
7. All 9 tables, enum types, partial unique collision indexes, and Row Level Security (RLS) policies will be created.

### Option B: Via `psql` Command Line

Run the schema script against your PostgreSQL connection string:

```bash
psql "postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DB_NAME" -f DATABASE_SCHEMA.sql
```

---

## 3. Database Architecture & Key Protections

| Table | Purpose | Security & Constraints |
| :--- | :--- | :--- |
| `users` | Customer, Merchant, and Master Admin accounts | Unique email, indexed roles |
| `categories` | Service taxonomy (Health, Sports, Plumbing, etc.) | Unique slug, active status filter |
| `businesses` | Local merchants in Dehradun | Geo-indexed (lat, lng), status lifecycle |
| `services` | Services offered by merchants | Cascades from business, active toggle |
| `business_hours` | Weekly schedule (0=Sun, 1=Mon, ..., 6=Sat) | Unique per business and day |
| `time_blocks` | Temporary merchant closures or breaks | Overlap checks |
| `bookings` | Customer appointments with price locking | **Atomic Unique Index** prevents duplicate slots |
| `reviews` | Verified customer ratings & merchant replies | Star rating 1-5 check, verified badge |
| `audit_logs` | Immutable operational ledger | Restricted to Admin |

### Atomic Double-Booking Defense

The schema includes a database-level partial unique index:

```sql
CREATE UNIQUE INDEX uq_booking_slot_collision
ON bookings (business_id, date, time_slot)
WHERE status IN ('pending', 'confirmed');
```

This ensures that even if two customers click "Book" at the exact same millisecond, the database engine guarantees that only one transaction succeeds, completely eliminating race conditions.

---

## 4. Connecting to the Next.js Application

### Environment Variables

Add your database connection string to `.env.local`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
```

If using Prisma or Drizzle ORM, you can pull the schema directly:

```bash
# With Prisma (optional)
npx prisma db pull

# With Drizzle (optional)
npx drizzle-kit introspect
```

---

## 5. Seed Verification

To verify that the database is configured properly, run the following verification query:

```sql
SELECT
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected result: 9 tables (`audit_logs`, `bookings`, `business_hours`, `businesses`, `categories`, `reviews`, `services`, `time_blocks`, `users`).
