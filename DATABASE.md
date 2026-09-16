# BUKKAPP Relational Database Architecture

## 1. Schema Diagram (PostgreSQL / Supabase)

```text
               +-------------------+
               |       users       |
               +-------------------+
               | id (PK)           |
               | name, email, role |
               +---------+---------+
                         |
           +-------------+-------------+
           |                           | (1:N)
+----------v----------+       +--------v---------+
|     businesses      |       |     bookings     |
+---------------------+       +------------------+
| id (PK)             | (1:N) | id (PK)          |
| owner_id (FK)       +------>| business_id (FK) |
| name, slug, status  |       | user_id (FK)     |
| starting_price      |       | service_id (FK)  |
+----------+----------+       | resource_id (FK) |
           | (1:N)            | date, start_time |
     +-----+-----+            | status, price    |
     |           |            +------------------+
+----v----+ +----v----+
|services | |resources|
+---------+ +---------+
| id (PK) | | id (PK) |
| price   | | type    |
+---------+ +---------+
```

---

## 2. Core Tables Specification

### `users`
- `id` (UUID / TEXT, PK)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)
- `phone` (TEXT, NOT NULL)
- `role` (TEXT: `'customer' | 'business_owner' | 'admin'`, DEFAULT `'customer'`)
- `avatar_url` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `businesses`
- `id` (UUID / TEXT, PK)
- `owner_id` (UUID / TEXT, FK -> `users.id`, NOT NULL)
- `name` (TEXT, NOT NULL)
- `slug` (TEXT, UNIQUE, NOT NULL)
- `tagline` (TEXT)
- `description` (TEXT)
- `category_id` (TEXT, FK -> `categories.id`)
- `address`, `neighborhood`, `city`, `state`, `postal_code` (TEXT)
- `latitude`, `longitude` (NUMERIC)
- `phone`, `email` (TEXT)
- `cover_image_url` (TEXT)
- `rating` (NUMERIC(2,1), DEFAULT 5.0)
- `review_count` (INTEGER, DEFAULT 0)
- `verified` (BOOLEAN, DEFAULT FALSE)
- `status` (TEXT: `'draft' | 'pending_review' | 'needs_changes' | 'approved' | 'active' | 'suspended' | 'closed'`, DEFAULT `'pending_review'`)
- `change_request_reason` (TEXT)
- `admin_notes` (TEXT)
- `starting_price` (INTEGER, NOT NULL)
- `active` (BOOLEAN, DEFAULT TRUE)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `services`
- `id` (UUID / TEXT, PK)
- `business_id` (UUID / TEXT, FK -> `businesses.id`, ON DELETE CASCADE)
- `name` (TEXT, NOT NULL)
- `description` (TEXT)
- `price` (INTEGER, NOT NULL)
- `duration_minutes` (INTEGER, NOT NULL)
- `active` (BOOLEAN, DEFAULT TRUE)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `resources` (Courts, Chairs, Rooms, Staff)
- `id` (UUID / TEXT, PK)
- `business_id` (UUID / TEXT, FK -> `businesses.id`, ON DELETE CASCADE)
- `name` (TEXT, NOT NULL)
- `type` (TEXT: `'court' | 'room' | 'chair' | 'staff' | 'equipment'`)
- `active` (BOOLEAN, DEFAULT TRUE)

### `blocked_times`
- `id` (UUID / TEXT, PK)
- `business_id` (UUID / TEXT, FK -> `businesses.id`, ON DELETE CASCADE)
- `start_datetime` (TIMESTAMPTZ, NOT NULL)
- `end_datetime` (TIMESTAMPTZ, NOT NULL)
- `reason` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ)

### `bookings`
- `id` (UUID / TEXT, PK)
- `booking_reference` (TEXT, UNIQUE, NOT NULL) — Format: `BK-XXXXXX`
- `user_id` (UUID / TEXT, FK -> `users.id`, NOT NULL)
- `business_id` (UUID / TEXT, FK -> `businesses.id`, NOT NULL)
- `service_id` (UUID / TEXT, FK -> `services.id`, NOT NULL)
- `resource_id` (UUID / TEXT, FK -> `resources.id`, NULLABLE)
- `customer_name`, `customer_phone`, `customer_email` (TEXT)
- `date` (DATE, NOT NULL)
- `start_time` (TEXT, NOT NULL) — "HH:MM"
- `end_time` (TEXT, NOT NULL) — "HH:MM"
- `service_price` (INTEGER, NOT NULL) — Fixed price record
- `duration_minutes` (INTEGER, NOT NULL)
- `status` (TEXT: `'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'`, DEFAULT `'confirmed'`)
- `payment_status` (TEXT: `'paid_simulated' | 'pending' | 'refunded'`)
- `notes` (TEXT)
- `cancellation_reason` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `reviews`
- `id` (UUID / TEXT, PK)
- `business_id` (UUID / TEXT, FK -> `businesses.id`, ON DELETE CASCADE)
- `user_id` (UUID / TEXT, FK -> `users.id`)
- `user_name` (TEXT)
- `rating` (INTEGER CHECK (rating >= 1 AND rating <= 5))
- `comment` (TEXT)
- `owner_reply` (JSONB)
- `is_reported` (BOOLEAN, DEFAULT FALSE)
- `is_hidden` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMPTZ)

### `audit_logs`
- `id` (UUID / TEXT, PK)
- `actor_user_id` (UUID / TEXT, NOT NULL)
- `actor_name` (TEXT, NOT NULL)
- `action` (TEXT, NOT NULL)
- `entity_type` (TEXT: `'business' | 'booking' | 'review' | 'category' | 'user'`)
- `entity_id` (TEXT, NOT NULL)
- `metadata` (JSONB)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

---

## 3. Database Indexes

```sql
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_bookings_business_date ON bookings(business_id, date);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_ref ON bookings(booking_reference);
CREATE INDEX idx_services_business ON services(business_id);
CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_blocked_times_biz_date ON blocked_times(business_id, start_datetime);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```
