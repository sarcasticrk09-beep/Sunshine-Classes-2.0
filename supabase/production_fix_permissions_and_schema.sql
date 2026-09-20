-- ==============================================================================
-- SUNSHINE CLASSES ERP - COMPLETE PRODUCTION SCHEMA & PERMISSIONS REPAIR
-- Target Database: Supabase Production (nqxthuycvltpuptejjot)
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

BEGIN;

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Grant Schema Usage to all operational roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 3. Create All Required Operational Tables (IF NOT EXISTS)
-- ------------------------------------------------------------------------------

-- Users table (public profiles linked to auth accounts)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'STUDENT',
    phone TEXT,
    password TEXT,
    password_hash TEXT,
    status TEXT DEFAULT 'ACTIVE',
    active BOOLEAN DEFAULT TRUE,
    must_change_password BOOLEAN DEFAULT FALSE,
    force_password_change BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    roll_no TEXT UNIQUE,
    enrollment_id TEXT,
    name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    preferred_batch TEXT,
    father_name TEXT,
    mother_name TEXT,
    dob TEXT,
    gender TEXT,
    address TEXT,
    mobile TEXT,
    whatsapp TEXT,
    parent_mobile TEXT,
    email TEXT,
    preferred_timing TEXT,
    admission_date TEXT,
    attendance_percentage NUMERIC DEFAULT 100,
    status TEXT DEFAULT 'ACTIVE',
    photo_url TEXT,
    document_url TEXT,
    fee_start_month TEXT,
    monthly_fee NUMERIC(10, 2) DEFAULT 0,
    due_day INTEGER DEFAULT 10,
    admission_fee NUMERIC(10, 2) DEFAULT 0,
    registration_fee NUMERIC(10, 2) DEFAULT 0,
    discount NUMERIC(10, 2) DEFAULT 0,
    scholarship NUMERIC(10, 2) DEFAULT 0,
    current_balance NUMERIC(10, 2) DEFAULT 0,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departed students table
CREATE TABLE IF NOT EXISTS public.departed_students (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    name TEXT,
    class_name TEXT,
    roll_no TEXT,
    departure_date TEXT,
    reason TEXT,
    cleared_dues BOOLEAN DEFAULT FALSE,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS public.teachers (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    qualification TEXT,
    specialty TEXT[] DEFAULT '{}',
    batches TEXT[] DEFAULT '{}',
    salary NUMERIC(10, 2) DEFAULT 0,
    join_date TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admissions table
CREATE TABLE IF NOT EXISTS public.admissions (
    id TEXT PRIMARY KEY,
    enrollment_id TEXT,
    student_name TEXT,
    name TEXT,
    father_name TEXT,
    mother_name TEXT,
    dob TEXT,
    gender TEXT,
    class_name TEXT,
    preferred_batch TEXT,
    preferred_timing TEXT,
    address TEXT,
    mobile TEXT,
    whatsapp TEXT,
    parent_mobile TEXT,
    email TEXT,
    previous_school TEXT,
    score_percentage NUMERIC,
    status TEXT DEFAULT 'PENDING',
    admission_date TEXT,
    photo_url TEXT,
    document_url TEXT,
    roll_no TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    aadhar TEXT,
    board TEXT,
    payment_plan TEXT,
    monthly_fee NUMERIC(10, 2),
    class TEXT,
    house_flat TEXT,
    area_locality TEXT,
    city TEXT,
    district TEXT,
    state TEXT,
    pincode TEXT,
    preferred_start_month TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all existing tables have any missing extension columns
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS roll_no TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS aadhar TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS board TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS payment_plan TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(10, 2);
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS class TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS house_flat TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS area_locality TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS preferred_start_month TEXT;

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS class TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS fee_plan_id TEXT;

-- Classes table
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY,
    class_id TEXT,
    class_name TEXT NOT NULL,
    display_order INTEGER DEFAULT 1,
    monthly_fee NUMERIC(10, 2) DEFAULT 0,
    subjects TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batches table
CREATE TABLE IF NOT EXISTS public.batches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class_name TEXT,
    timing TEXT,
    max_students INTEGER DEFAULT 40,
    teacher_id TEXT,
    teacher_name TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    roll_no TEXT,
    class_name TEXT,
    batch_id TEXT,
    date TEXT,
    status TEXT DEFAULT 'PRESENT',
    marked_by TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee statuses table
CREATE TABLE IF NOT EXISTS public.fee_statuses (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    roll_no TEXT,
    class_name TEXT,
    month TEXT,
    billing_month TEXT,
    billing_year TEXT,
    total_fee NUMERIC(10, 2) DEFAULT 0,
    paid_fee NUMERIC(10, 2) DEFAULT 0,
    pending_fee NUMERIC(10, 2) DEFAULT 0,
    discount NUMERIC(10, 2) DEFAULT 0,
    scholarship NUMERIC(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    due_date TEXT,
    payment_history JSONB DEFAULT '[]'::jsonb,
    receipt_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee receipts table
CREATE TABLE IF NOT EXISTS public.fee_receipts (
    id TEXT PRIMARY KEY,
    receipt_no TEXT,
    student_id TEXT,
    student_name TEXT,
    class_name TEXT,
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    month TEXT,
    date TEXT,
    payment_mode TEXT DEFAULT 'CASH',
    transaction_id TEXT,
    received_by TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipts table
CREATE TABLE IF NOT EXISTS public.receipts (
    id TEXT PRIMARY KEY,
    payment_id TEXT,
    student_id TEXT,
    student_name TEXT,
    admission_no TEXT,
    batch_name TEXT,
    payment_month TEXT,
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    transaction_id TEXT,
    payment_method TEXT DEFAULT 'CASH',
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    date TEXT,
    month TEXT,
    received_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    amount NUMERIC(10, 2) DEFAULT 0,
    payment_mode TEXT DEFAULT 'UPI',
    transaction_id TEXT,
    status TEXT DEFAULT 'COMPLETED',
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment verifications table
CREATE TABLE IF NOT EXISTS public.payment_verifications (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    amount NUMERIC(10, 2) DEFAULT 0,
    transaction_id TEXT,
    upi_ref TEXT,
    screenshot_url TEXT,
    status TEXT DEFAULT 'PENDING',
    verified_by TEXT,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment notifications table
CREATE TABLE IF NOT EXISTS public.payment_notifications (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    title TEXT NOT NULL,
    content TEXT,
    date TEXT,
    type TEXT DEFAULT 'REMINDER_DUE_DATE',
    status TEXT DEFAULT 'PENDING',
    channel TEXT DEFAULT 'DASHBOARD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UPI payments table
CREATE TABLE IF NOT EXISTS public.upi_payments (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    amount NUMERIC(10, 2) DEFAULT 0,
    upi_ref TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tests table
CREATE TABLE IF NOT EXISTS public.tests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    class_name TEXT,
    subject TEXT,
    total_marks NUMERIC DEFAULT 100,
    date TEXT,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student marks table
CREATE TABLE IF NOT EXISTS public.student_marks (
    id TEXT PRIMARY KEY,
    test_id TEXT,
    test_title TEXT,
    student_id TEXT,
    student_name TEXT,
    roll_no TEXT,
    class_name TEXT,
    marks_obtained NUMERIC DEFAULT 0,
    total_marks NUMERIC DEFAULT 100,
    percentage NUMERIC DEFAULT 0,
    rank INTEGER,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Homework table
CREATE TABLE IF NOT EXISTS public.homework (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    class_name TEXT,
    subject TEXT,
    due_date TEXT,
    assigned_date TEXT,
    teacher_id TEXT,
    teacher_name TEXT,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Homework submissions tables
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY,
    homework_id TEXT,
    student_id TEXT,
    student_name TEXT,
    roll_no TEXT,
    file_url TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'SUBMITTED',
    marks NUMERIC,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.homework_submissions (
    id TEXT PRIMARY KEY,
    homework_id TEXT,
    student_id TEXT,
    student_name TEXT,
    roll_no TEXT,
    file_url TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'SUBMITTED',
    marks NUMERIC,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timetable table
CREATE TABLE IF NOT EXISTS public.timetable (
    id TEXT PRIMARY KEY,
    class_name TEXT,
    day TEXT,
    time_slot TEXT,
    subject TEXT,
    teacher_name TEXT,
    room TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    content TEXT,
    rating NUMERIC DEFAULT 5,
    photo_url TEXT,
    year TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Toppers table
CREATE TABLE IF NOT EXISTS public.toppers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class_name TEXT,
    percentage NUMERIC DEFAULT 0,
    year TEXT,
    photo_url TEXT,
    rank TEXT,
    school TEXT,
    stream TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study materials table
CREATE TABLE IF NOT EXISTS public.study_materials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    class_name TEXT,
    subject TEXT,
    chapter TEXT,
    file_url TEXT,
    file_type TEXT DEFAULT 'PDF',
    downloads_count INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Founders table
CREATE TABLE IF NOT EXISTS public.founders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    bio TEXT,
    photo_url TEXT,
    qualification TEXT,
    quote TEXT,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT,
    excerpt TEXT,
    content TEXT,
    cover_image TEXT,
    author TEXT,
    published_at TEXT,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery table
CREATE TABLE IF NOT EXISTS public.gallery (
    id TEXT PRIMARY KEY,
    title TEXT,
    category TEXT,
    image_url TEXT NOT NULL,
    description TEXT,
    event_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store tables
CREATE TABLE IF NOT EXISTS public.store_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.store_products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT,
    type TEXT,
    category_name TEXT,
    brand_name TEXT,
    publisher TEXT,
    author TEXT,
    class_name TEXT,
    subject TEXT,
    price NUMERIC(10, 2) DEFAULT 0,
    original_price NUMERIC(10, 2) DEFAULT 0,
    discount_percent NUMERIC DEFAULT 0,
    rating NUMERIC DEFAULT 5,
    rating_count INTEGER DEFAULT 0,
    stock_status TEXT DEFAULT 'IN_STOCK',
    featured_image TEXT,
    gallery TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    why_sunshine_recommends TEXT,
    key_features TEXT[] DEFAULT '{}',
    specifications JSONB DEFAULT '{}'::jsonb,
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    is_staff_pick BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    is_most_recommended BOOLEAN DEFAULT FALSE,
    purchase_links JSONB DEFAULT '[]'::jsonb,
    seo_title TEXT,
    meta_description TEXT,
    keywords TEXT[] DEFAULT '{}',
    canonical_url TEXT,
    status TEXT DEFAULT 'PUBLISHED',
    views_count INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.store_orders (
    id TEXT PRIMARY KEY,
    order_no TEXT,
    student_id TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    delivery_address TEXT,
    total_amount NUMERIC(10, 2) DEFAULT 0,
    payment_status TEXT DEFAULT 'PENDING',
    order_status TEXT DEFAULT 'PLACED',
    payment_method TEXT DEFAULT 'COD',
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.store_order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    product_id TEXT,
    product_name TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(10, 2) DEFAULT 0,
    total_price NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batch bulletins table
CREATE TABLE IF NOT EXISTS public.batch_bulletins (
    id TEXT PRIMARY KEY,
    batch_id TEXT,
    batch_name TEXT,
    title TEXT,
    message TEXT,
    author TEXT,
    date TEXT,
    priority TEXT DEFAULT 'NORMAL',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    student_class TEXT,
    message TEXT,
    source TEXT DEFAULT 'WEBSITE',
    status TEXT DEFAULT 'NEW',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings and Config tables
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY,
    data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.public_settings (
    id TEXT PRIMARY KEY,
    settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscription_config (
    id TEXT PRIMARY KEY,
    config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_subscriptions (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    admission_no TEXT,
    batch_id TEXT,
    batch_name TEXT,
    monthly_fee NUMERIC(10, 2) DEFAULT 0,
    start_date TEXT,
    billing_cycle TEXT DEFAULT 'Monthly',
    next_due_date TEXT,
    status TEXT DEFAULT 'ACTIVE',
    days_remaining INTEGER DEFAULT 30,
    grace_period_days INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_templates (
    id TEXT PRIMARY KEY,
    templates JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
    id TEXT PRIMARY KEY,
    templates JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    username TEXT,
    action TEXT NOT NULL,
    details TEXT,
    performed_by TEXT,
    ip_address TEXT,
    device_info TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL,
    content TEXT,
    message TEXT,
    type TEXT DEFAULT 'INFO',
    category TEXT DEFAULT 'GENERAL',
    target_role TEXT DEFAULT 'ALL',
    target_class TEXT,
    read BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    class_name TEXT,
    subject TEXT,
    description TEXT,
    fee NUMERIC(10, 2) DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. Grant Full Access to All Tables, Sequences, and Routines
-- ------------------------------------------------------------------------------
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 5. Enable Row Level Security (RLS) and Set Permissive Operational Policies
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'users', 'students', 'departed_students', 'teachers', 'admissions', 'batches', 
        'classes', 'courses', 'attendance', 'fee_statuses', 'fee_receipts', 'receipts',
        'payments', 'payment_verifications', 'payment_notifications', 'upi_payments',
        'tests', 'student_marks', 'homework', 'submissions', 'homework_submissions',
        'timetable', 'testimonials', 'toppers', 'study_materials', 'founders', 'blogs',
        'gallery', 'store_categories', 'store_products', 'store_orders', 'store_order_items', 
        'batch_bulletins', 'inquiries', 'settings', 'public_settings', 'subscription_config',
        'student_subscriptions', 'email_templates', 'whatsapp_templates', 'audit_logs', 'notifications'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
            
            EXECUTE format('DROP POLICY IF EXISTS service_role_all ON public.%I;', t);
            EXECUTE format('DROP POLICY IF EXISTS authenticated_all ON public.%I;', t);
            EXECUTE format('DROP POLICY IF EXISTS anon_read ON public.%I;', t);
            EXECUTE format('DROP POLICY IF EXISTS anon_all ON public.%I;', t);

            EXECUTE format('CREATE POLICY service_role_all ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', t);
            EXECUTE format('CREATE POLICY authenticated_all ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', t);
            EXECUTE format('CREATE POLICY anon_all ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true);', t);
        END IF;
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 6. Failsafe Auth User Creation Trigger Function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_base_username VARCHAR(100);
  v_username VARCHAR(100);
  v_name VARCHAR(150);
  v_role VARCHAR(50);
  v_phone VARCHAR(25);
BEGIN
  BEGIN
    v_base_username := LOWER(REGEXP_REPLACE(COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), '[^a-zA-Z0-9_]', '', 'g'));
    IF v_base_username IS NULL OR LENGTH(v_base_username) = 0 THEN
      v_base_username := 'user_' || SUBSTRING(new.id::text, 1, 8);
    END IF;
    v_username := v_base_username;

    IF EXISTS (SELECT 1 FROM public.users WHERE username = v_username AND id <> new.id::text) THEN
      v_username := SUBSTRING(v_base_username, 1, 75) || '_' || SUBSTRING(new.id::text, 1, 8);
    END IF;

    v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
    v_phone := new.raw_user_meta_data->>'phone';
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'STUDENT');

    INSERT INTO public.users (id, username, name, email, role, phone, active, force_password_change)
    VALUES (new.id::text, v_username, v_name, new.email, v_role, v_phone, true, false)
    ON CONFLICT (id) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, public.users.name),
      email = EXCLUDED.email,
      phone = COALESCE(EXCLUDED.phone, public.users.phone),
      role = COALESCE(EXCLUDED.role, public.users.role),
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user warning (non-fatal): %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

COMMIT;

-- 7. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

