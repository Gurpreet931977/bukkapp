# BUKKAPP Backup, Disaster Recovery & Reseeding Manual

## 1. Overview & Single Source of Truth

BUKKAPP is architected with a relational database model (PostgreSQL / Supabase) and a reactive data engine that ensures zero data loss during platform updates.

---

## 2. Supabase PostgreSQL Backup Strategy

### Automated Backups
- Supabase automatically takes daily snapshots of the database with Point-in-Time Recovery (PITR) available on production tiers.

### Manual Backup (Pre-Deployment or Major Migrations)
To take a complete local snapshot of the production database:
```bash
# Export complete schema and records
pg_dump -h db.<PROJECT-REF>.supabase.co -U postgres -d postgres > bukkapp_backup_$(date +%Y%m%d).sql
```

---

## 3. Disaster Recovery Scenarios

### Scenario A: Vercel Project Recreated
1. Code remains safe in your GitHub repository.
2. Link the new Vercel project to your GitHub repository (`bukkapp`).
3. Add the two environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will rebuild in under 2 minutes.

### Scenario B: Restoring from SQL Backup
```bash
# Restore from SQL snapshot into a fresh Supabase database
psql -h db.<NEW-PROJECT-REF>.supabase.co -U postgres -d postgres < bukkapp_backup_20260822.sql
```

### Scenario C: Resetting & Reseeding Development Demo Data
To reset the development prototype to the pristine baseline (with Zenith Pickleball Club, Smile Studio, and verified sample bookings):
- Clear browser localStorage key `bukkapp_businesses_v2`, `bukkapp_bookings_v2`, etc.
- Or trigger `store.resetToDefault()` from the developer console.

---

## 4. Historical Integrity Guarantee
- Every booking permanently stores `servicePrice` and `durationMinutes` as an immutable record at the instant of booking creation.
- Even if a business updates its future service prices, past booking records and financial logs remain unchanged.
