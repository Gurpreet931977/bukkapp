-- ==============================================================================
-- BUKKAPP PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Target: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'business_owner', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE business_status AS ENUM ('draft', 'pending_review', 'needs_changes', 'approved', 'active', 'suspended', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_entity_type AS ENUM ('business', 'booking', 'review', 'category', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES

-- Users Table (Synchronized with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    role user_role DEFAULT 'customer' NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    count INTEGER DEFAULT 0 NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
    id TEXT PRIMARY KEY,
    owner_id TEXT REFERENCES public.users(id) ON DELETE RESTRICT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    description TEXT,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory TEXT NOT NULL,
    address TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    city TEXT DEFAULT 'Dehradun' NOT NULL,
    state TEXT DEFAULT 'Uttarakhand' NOT NULL,
    postal_code TEXT,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    rating NUMERIC(3, 1) DEFAULT 5.0 NOT NULL,
    review_count INTEGER DEFAULT 0 NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    status business_status DEFAULT 'pending_review' NOT NULL,
    change_request_reason TEXT,
    admin_notes TEXT,
    starting_price INTEGER NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    features TEXT[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    business_id TEXT REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Resources Table (Courts, Chairs, Rooms, Staff)
CREATE TABLE IF NOT EXISTS public.resources (
    id TEXT PRIMARY KEY,
    business_id TEXT REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'court' NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Blocked Times (Temporary Closures / Private Maintenance)
CREATE TABLE IF NOT EXISTS public.blocked_times (
    id TEXT PRIMARY KEY,
    business_id TEXT REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    reason TEXT DEFAULT 'Temporary Closure' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CHECK (end_datetime > start_datetime)
);

-- Bookings Table (Atomic Single Source of Truth)
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    booking_reference TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES public.users(id) ON DELETE RESTRICT NOT NULL,
    business_id TEXT REFERENCES public.businesses(id) ON DELETE RESTRICT NOT NULL,
    service_id TEXT REFERENCES public.services(id) ON DELETE RESTRICT NOT NULL,
    resource_id TEXT REFERENCES public.resources(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TEXT NOT NULL, -- HH:MM
    end_time TEXT NOT NULL,   -- HH:MM
    service_price INTEGER NOT NULL, -- Permanent historical snapshot
    duration_minutes INTEGER NOT NULL,
    status booking_status DEFAULT 'confirmed' NOT NULL,
    payment_status TEXT DEFAULT 'paid_simulated' NOT NULL,
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    business_id TEXT REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    user_id TEXT REFERENCES public.users(id) ON DELETE RESTRICT NOT NULL,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    service_name TEXT,
    business_reply JSONB,
    is_reported BOOLEAN DEFAULT FALSE NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_id TEXT,
    link TEXT,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Audit Logs Table (Append-Only Immutable Ledger)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    actor_user_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type audit_entity_type NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. PERFORMANCE & INTEGRITY INDEXES
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_business_date ON public.bookings(business_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON public.bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_services_business ON public.services(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_blocked_times_biz_date ON public.blocked_times(business_id, start_datetime);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if current user is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: users
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id OR public.is_admin());

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id OR public.is_admin());

-- RLS: categories
CREATE POLICY "Public can view active categories" ON public.categories
    FOR SELECT USING (active = true OR public.is_admin());

CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (public.is_admin());

-- RLS: businesses
CREATE POLICY "Public can view active approved businesses" ON public.businesses
    FOR SELECT USING (status IN ('approved', 'active') OR owner_id = auth.uid()::text OR public.is_admin());

CREATE POLICY "Owners can create draft business" ON public.businesses
    FOR INSERT WITH CHECK (auth.uid()::text = owner_id OR public.is_admin());

CREATE POLICY "Owners can update their own business" ON public.businesses
    FOR UPDATE USING (auth.uid()::text = owner_id OR public.is_admin());

-- RLS: services
CREATE POLICY "Public can view active services" ON public.services
    FOR SELECT USING (active = true OR public.is_admin() OR EXISTS (
        SELECT 1 FROM public.businesses WHERE businesses.id = services.business_id AND businesses.owner_id = auth.uid()::text
    ));

CREATE POLICY "Owners can manage services of their business" ON public.services
    FOR ALL USING (public.is_admin() OR EXISTS (
        SELECT 1 FROM public.businesses WHERE businesses.id = services.business_id AND businesses.owner_id = auth.uid()::text
    ));

-- RLS: bookings
CREATE POLICY "Customers can view their own bookings" ON public.bookings
    FOR SELECT USING (user_id = auth.uid()::text OR public.is_admin() OR EXISTS (
        SELECT 1 FROM public.businesses WHERE businesses.id = bookings.business_id AND businesses.owner_id = auth.uid()::text
    ));

CREATE POLICY "Authenticated users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR public.is_admin());

CREATE POLICY "Customers and Owners can cancel bookings" ON public.bookings
    FOR UPDATE USING (user_id = auth.uid()::text OR public.is_admin() OR EXISTS (
        SELECT 1 FROM public.businesses WHERE businesses.id = bookings.business_id AND businesses.owner_id = auth.uid()::text
    ));

-- RLS: reviews
CREATE POLICY "Public can view non-hidden reviews" ON public.reviews
    FOR SELECT USING (is_hidden = false OR public.is_admin() OR user_id = auth.uid()::text);

CREATE POLICY "Customers can post reviews for their bookings" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR public.is_admin());

CREATE POLICY "Owners can reply to reviews on their business" ON public.reviews
    FOR UPDATE USING (public.is_admin() OR EXISTS (
        SELECT 1 FROM public.businesses WHERE businesses.id = reviews.business_id AND businesses.owner_id = auth.uid()::text
    ));

-- RLS: notifications
CREATE POLICY "Users can access their own notifications" ON public.notifications
    FOR ALL USING (auth.uid()::text = user_id OR public.is_admin());

-- RLS: audit_logs
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY "System and admins can append audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (public.is_admin() OR auth.uid() IS NOT NULL);
