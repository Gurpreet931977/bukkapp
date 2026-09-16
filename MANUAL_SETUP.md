# FOUNDER MANUAL ACTION REPORT: BUKKAPP

This guide lists everything you (the founder) must manually configure. All tasks are written in non-technical terms with exact steps, accounts, costs, and expected outcomes.

---

## 1. What You Must Manually Do NOW (Local Testing — 100% Free)

### Task 1.1: Run the Automated Test Suite
- **Exact Action**: In your terminal inside the project folder, run `npm test`.
- **Where to perform**: Mac Terminal / Command Line.
- **Account needed**: None.
- **Cost**: Free ($0).
- **Expected Result**: All 19 tests pass (verifying booking calculations, double-booking prevention, search intent parser, and admin security).

### Task 1.2: Test All Three Product Personas
- **Exact Action**: Open `http://localhost:3000` in Google Chrome or Safari. Use the persona switcher dropdown in the top-right corner of the header to test:
  1. **Customer Persona (`Gurpreet Singh`)**: Test searching for dentists, booking a slot at *Zenith Pickleball Club*, and downloading your `.ics` calendar pass.
  2. **Business Owner Persona (`Rahul Kapoor`)**: Open `/business/dashboard`, review the profile completion bar, test adding a manual booking (+ Add booking), and edit weekly hours.
  3. **Admin Persona (`BUKKAPP Admin`)**: Open `/admin`, approve a pending storefront (*Doon Ayurveda*), send a change request note on *Jakhan Crossfit*, and inspect the audit trail.
- **Where to perform**: Browser (`http://localhost:3000`).
- **Cost**: Free ($0).
- **Expected Result**: Clean transitions across customer, merchant, and admin consoles.

---

## 2. What You Must Manually Do BEFORE DEPLOYMENT (100% Free)

### Task 2.1: Create a GitHub Repository
- **Exact Action**:
  1. Go to [github.com](https://github.com) and log in.
  2. Click **New Repository** -> Name: `bukkapp`.
  3. Push your local files:
     ```bash
     git init
     git add .
     git commit -m "feat: complete BUKKAPP platform release"
     git branch -M main
     git remote add origin https://github.com/<your-username>/bukkapp.git
     git push -u origin main
     ```
- **Where to perform**: github.com and Mac Terminal.
- **Account needed**: GitHub account (free).
- **Cost**: Free ($0).
- **Expected Result**: Code safely stored in version control.

### Task 2.2: Deploy to Vercel (Global Hosting)
- **Exact Action**:
  1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
  2. Click **Add New Project** -> Select your `bukkapp` repository.
  3. Vercel automatically detects Next.js. Click **Deploy**.
- **Where to perform**: vercel.com.
- **Account needed**: Vercel account (free Hobby tier).
- **Cost**: Free ($0).
- **Expected Result**: Your website is live worldwide at `https://bukkapp.vercel.app` in under 2 minutes.

### Task 2.3: Create Free Supabase Database (Optional for Cloud DB)
- **Exact Action**:
  1. Go to [supabase.com](https://supabase.com) and sign up for a free account.
  2. Click **New Project** -> Name: `bukkapp-prod` -> Choose Mumbai / Singapore region (`ap-south-1`).
  3. In Project Settings -> API, copy `Project URL` and `anon public key`.
  4. Paste these into your Vercel Project Settings under **Environment Variables**:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Where to perform**: supabase.com and vercel.com.
- **Account needed**: Supabase account (free tier).
- **Cost**: Free ($0).
- **Expected Result**: Managed cloud PostgreSQL database backing your live platform.

---

## 3. What You Must Manually Do BEFORE CONNECTING YOUR DOMAIN

### Task 3.1: Purchase Your Domain Name
- **Exact Action**: Buy `bukkapp.in` or `bukkapp.com` from a domain registrar like Namecheap, Cloudflare, or GoDaddy.
- **Where to perform**: Domain registrar website.
- **Cost**: ~$8–$12 / year (the only paid expense in the entire platform roadmap).
- **Expected Result**: Ownership of your brand domain.

### Task 3.2: Link Domain in Vercel
- **Exact Action**:
  1. In Vercel -> Project **Settings** -> **Domains** -> Add `bukkapp.in` and `www.bukkapp.in`.
  2. In your domain registrar DNS manager, add the 2 DNS records shown on Vercel:
     - `A` Record: Host `@` pointing to `76.76.21.21`
     - `CNAME` Record: Host `www` pointing to `cname.vercel-dns.com`
- **Where to perform**: Vercel & Registrar DNS settings.
- **Cost**: Free ($0).
- **Expected Result**: Free SSL certificate automatically activated and domain live.

---

## 4. What You Must Manually Do BEFORE ADDING REAL BUSINESSES

### Task 4.1: Merchant Onboarding & Verification Protocol
- **Exact Action**:
  1. Share the link `https://bukkapp.in/business/onboarding` with local business owners in Dehradun.
  2. As businesses submit their storefront details, visit `/admin` to review their address, phone number, and service pricing.
  3. Click **"Approve & Publish"** or **"Request Changes"** (with a helpful note like *"Please add photos of your clinic entrance"*).
- **Where to perform**: BUKKAPP Admin Console (`/admin`).
- **Cost**: Free ($0).
- **Expected Result**: High supply quality and verified listings across Dehradun.

---

## 5. What You Must Manually Do BEFORE ACCEPTING REAL PAYMENTS

### Task 5.1: Payment Gateway Setup (Razorpay India / Stripe)
- **Status now**: Built-in `MockPaymentProvider` simulates instant booking confirmations with zero payment friction.
- **When ready to collect upfront booking deposits or merchant fees**:
  1. Create a business account on [razorpay.com](https://razorpay.com) or [stripe.com](https://stripe.com).
  2. Complete your business KYC verification with bank account details.
  3. Replace the mock provider in `src/lib/payment/provider.ts` with your live API keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
- **Cost**: Free account setup; standard 2% transaction fee only when transactions occur.
- **Expected Result**: Automated online payments deposited into your merchant bank account.

---

## 6. What Can Remain for Later (Future Scaling)

1. **WhatsApp Automated Messaging**: Integrate Gupshup / Twilio WhatsApp API once appointment volume exceeds 50 bookings/day.
2. **Native iOS & Android Apps**: The current web app is built with mobile-first PWA responsiveness and bottom tab bars. Native apps can be wrapped later using Capacitor / React Native.
3. **Multi-City Expansion**: Expand beyond Dehradun to Rishikesh, Haridwar, Chandigarh, and Jaipur by adding new city records to `locations`.

---

## Summary of Credentials Needed

| Account | Purpose | When Needed | Cost |
|---|---|---|---|
| **GitHub** | Code repository | Before deployment | Free |
| **Vercel** | Web hosting & edge network | Before deployment | Free |
| **Supabase** | Cloud PostgreSQL database | Before deployment | Free |
| **Domain Registrar** | `bukkapp.in` domain | Before public launch | ~$8–$12/year |
| **Razorpay / Stripe** | Live consumer payments | When accepting real money | 2% per txn |
