# BUKKAPP Security Architecture, Hardening & Vulnerability Prevention

## 1. Core Threat Model & Security Principles

BUKKAPP is a multi-tenant booking marketplace with three distinct actor domains:
1. **Customer**: Can browse active storefronts, search, book, manage own bookings, and post verified reviews.
2. **Business Owner**: Can manage only their owned business, services, working hours, and merchant appointments.
3. **Administrator**: Can perform platform verification, moderate reviews, manage categories, and inspect the immutable audit trail.

### Absolute Rule: Zero Client Trust
The server never trusts client-supplied inputs for:
- `user_id`, `business_id`, `service_id`
- `role` / administrative permissions
- `servicePrice`, `durationMinutes`, and working hours
- Live slot availability and conflict resolution

---

## 2. Authentication & Authorization Architecture

- **Authentication**: Managed via Supabase Auth (or simulated secure session store for development).
- **Session Tokens**: Transmitted via secure, HttpOnly, SameSite cookies.
- **Role-Based Access Control (RBAC)**: Roles (`customer`, `business_owner`, `admin`) are strictly verified on the server. Role escalation attempts via client payload mutations are rejected.
- **Insecure Direct Object Reference (IDOR) Protection**: All merchant dashboard queries verify that `business.ownerId === currentUser.id` or `currentUser.role === 'admin'`. Merchants cannot view or modify other businesses' appointments.

---

## 3. Database Row Level Security (RLS)

All tables in PostgreSQL / Supabase enforce strict RLS policies (defined in [`supabase/schema.sql`](file:///Users/metagurpreet/Desktop/Bukkapp/supabase/schema.sql)):

| Table | Public Access | Customer Access | Business Owner Access | Admin Access |
|---|---|---|---|---|
| `users` | Basic public profiles | Read/Update own profile | Read/Update own profile | Full CRUD |
| `businesses` | Read active/approved | Read active/approved | Read/Update owned business | Full CRUD |
| `services` | Read active services | Read active services | Full CRUD on owned services | Full CRUD |
| `bookings` | None | Read/Create/Cancel own | Read/Update owned business bookings | Full CRUD |
| `reviews` | Read non-hidden | Insert for own completed visit | Reply to reviews on owned business | Moderate / Hide / Delete |
| `audit_logs` | None | None | None | Read / Append only |
| `notifications` | None | Read own notifications | Read own notifications | Full CRUD |

---

## 4. Server-Authoritative Booking Integrity & Concurrency Guard

1. **Atomic Overlapping Conflict Check**: The server tests `(reqStartMin < bEnd && reqEndMin > bStart)` against existing non-cancelled bookings and active blocked times on the same date/resource before committing.
2. **Price Snapshot Locking**: The booked `servicePrice` is permanently snapshotted at creation time from the authoritative database record, preventing price tampering.
3. **Reference Security**: Public booking references follow opaque alphanumeric formatting (`BK-XXXXXX`) rather than sequential auto-incrementing integer IDs.

---

## 5. HTTP Security Headers

Configured in `next.config.js` across all application routes:
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options`: `SAMEORIGIN` (Clickjacking prevention)
- `X-Content-Type-Options`: `nosniff` (MIME-sniffing prevention)
- `Referrer-Policy`: `strict-origin-when-cross-origin`
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=(self)`
- `X-DNS-Prefetch-Control`: `on`

---

## 6. Secrets & Environment Segregation

- **Public Variables**: Only non-sensitive endpoints (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are allowed on the client.
- **Service Role Secrets**: The Supabase `SERVICE_ROLE_KEY`, database connection strings, and payment API secrets must NEVER be prefixed with `NEXT_PUBLIC_` or bundled into client code.
- **`.gitignore` Enforcement**: `.env`, `.env.local`, and `.env.production` are strictly excluded from source control.

---

## 7. Input Validation, XSS & Injection Defense

- **Parameterized Database Queries**: All database operations use Supabase client query builders or parameterized SQL, eliminating SQL injection vectors.
- **Zero Raw HTML Injection**: All user-generated text (business descriptions, customer review comments, notes) is rendered as sanitized React text nodes. Zero instances of `dangerouslySetInnerHTML` exist in the codebase.
- **URL Sanitization**: Redirects and directions URLs are validated against allowed protocols (`https://`) to prevent open redirect vulnerabilities.

---

## 8. Anti-Abuse & Rate Limiting Strategy

1. **Search Queries**: Query strings are normalized, trimmed, and capped to 100 characters.
2. **Booking Submissions**: Debounced with duplicate reference checks.
3. **Review Eligibility**: Reviews require a confirmed `bookingId` with `userId` verification, preventing fake review spam.
4. **Ownership Claims**: Business claims generate an immutable audit log (`business_claimed`) and require administrator manual review before ownership transfer.
