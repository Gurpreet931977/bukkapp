# BUKKAPP Environment Configuration

BUKKAPP is configured to run out of the box with zero external configuration. When deploying to production or connecting Supabase, use the following variables in `.env.local` or Vercel Environment Variables.

---

## Environment Variables Reference

```env
# ==============================================================================
# BUKKAPP CORE ENVIRONMENT CONFIGURATION
# ==============================================================================

# Next.js Environment Mode
NODE_ENV=development

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Default Launch Market
NEXT_PUBLIC_DEFAULT_CITY=Dehradun
NEXT_PUBLIC_DEFAULT_STATE=Uttarakhand
NEXT_PUBLIC_DEFAULT_COUNTRY=India

# ==============================================================================
# OPTIONAL: SUPABASE POSTGRESQL & AUTH (Free Tier)
# ==============================================================================
# Leave blank for local self-contained in-memory + LocalStorage storage
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ==============================================================================
# OPTIONAL: PAYMENT GATEWAY (Razorpay / Stripe)
# ==============================================================================
# When empty, MockPaymentProvider simulates instant 100% free prototype checkout
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

# ==============================================================================
# OPTIONAL: TRANSACTIONAL MESSAGING (Twilio / Gupshup / Resend)
# ==============================================================================
RESEND_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

---

## Security Guidelines

1. Never commit `.env.local` or `.env.production` files to GitHub.
2. The `SUPABASE_SERVICE_ROLE_KEY` must never be prefixed with `NEXT_PUBLIC_` to prevent leaking admin credentials to the browser bundle.
3. Server Actions and API handlers must enforce authentication checks on sensitive merchant updates.
