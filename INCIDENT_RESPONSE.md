# BUKKAPP Practical Incident Response Manual

## 1. Purpose & Scope

This manual provides immediate, actionable protocols for handling critical security incidents on the BUKKAPP platform.

---

## 2. Incident Scenarios & Response Runbooks

### Scenario A: API Key or Database Credential Leak
- **Trigger**: Accidental git commit or public exposure of `SUPABASE_SERVICE_ROLE_KEY` or database password.
- **Immediate Response**:
  1. Go to [supabase.com](https://supabase.com) -> Project **Settings** -> **API**.
  2. Click **Rotate API Keys** (instantly invalidates the leaked service-role secret).
  3. Go to **Database** -> **Reset Database Password**.
  4. In Vercel -> Project **Settings** -> **Environment Variables**, update the keys and trigger a redeployment.
  5. Check Git history using `git log -S "<leaked-string>"` and re-write commit history if committed.

### Scenario B: Merchant Account Takeover / Unauthorized Business Modification
- **Trigger**: Business owner reports their storefront name, hours, or services were changed without authorization.
- **Immediate Response**:
  1. Open the BUKKAPP Admin Console (`/admin`) and navigate to the **Audit Logs** tab.
  2. Filter logs by `entity_type: business` and `entity_id: <biz-id>` to identify the actor ID, timestamp, and metadata.
  3. Revert the business status to `suspended` or reset the `ownerId` to the verified merchant user ID.
  4. Force a password reset for the affected merchant account in Supabase Auth dashboard.

### Scenario C: Review Manipulation or Competitor Spam
- **Trigger**: Merchant reports malicious fake reviews posted to lower their rating.
- **Immediate Response**:
  1. In the BUKKAPP Admin Console, open the **Reviews Moderation** tab.
  2. Inspect the `booking_id` associated with the reported review.
  3. Click **"Hide Review"** (instantly removes the review from the public storefront and automatically recalculates the business's average rating).
  4. If the customer account is a repeat spammer, update their role in the database to restrict review creation.

### Scenario D: Customer Privacy / GDPR Data Deletion Request
- **Trigger**: Customer requests complete deletion of their account and contact details.
- **Immediate Response**:
  1. Locate the customer record in Supabase Auth and public `users` table.
  2. Anonymize customer name, phone, and email on historical booking records (`customer_name: 'Anonymized User'`, `customer_phone: 'REDACTED'`, `customer_email: 'deleted@bukkapp.in'`) to preserve historical accounting totals without retaining PII.
  3. Delete user account from `users` and `auth.users`.

---

## 3. Post-Incident Review Protocol
Following any resolved incident:
1. Log root cause and recovery steps in the engineering change log.
2. Verify automated test suite passes: `npm test`.
3. Check for any regression in production error boundaries or audit logs.
