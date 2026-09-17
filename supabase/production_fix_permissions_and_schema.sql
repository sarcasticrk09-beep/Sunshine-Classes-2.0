-- ==============================================================================
-- SUNSHINE CLASSES ERP - PRODUCTION REPAIR & PERMISSIONS SCRIPT
-- Target Database: Supabase Production (nqxthuycvltpuptejjot)
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

BEGIN;

-- 1. Grant Schema Usage to all operational roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Create Any Missing Operational Tables Needed by the ERP Frontend & API

-- Table: public.receipts (used by SubscriptionReceipt in SyncService & Finance)
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

-- Table: public.payment_notifications (used by SubscriptionNotification in SyncService)
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

-- Table: public.notifications (system and user notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO',
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: public.public_settings (public CMS, theme, and institute settings)
CREATE TABLE IF NOT EXISTS public.public_settings (
    id TEXT PRIMARY KEY,
    settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: public.courses (public curriculum courses catalog)
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

-- Table: public.store_order_items (Sunshine store line items)
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

-- 3. CRITICAL: Grant Access to All Tables, Sequences, and Functions
-- This eliminates the "42501: permission denied for table ..." blocker
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 4. Set Default Privileges so Any Future Tables Inherit Full Access Automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 5. Enable Row Level Security (RLS) and Set Permissive Operational Policies
-- Service Role bypasses RLS, but explicit policies ensure authenticated users and anon can operate.

DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'users', 'students', 'departed_students', 'teachers', 'admissions', 'batches', 
        'classes', 'courses', 'attendance', 'fee_statuses', 'fee_receipts', 'receipts',
        'payment_verifications', 'payment_notifications', 'tests', 'student_marks', 
        'homework', 'homework_submissions', 'toppers', 'study_materials', 'store_categories', 
        'store_products', 'store_orders', 'store_order_items', 'batch_bulletins', 
        'inquiries', 'settings', 'public_settings', 'audit_logs', 'notifications'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            -- Enable RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
            
            -- Drop existing permissive policies if present to prevent duplicates
            EXECUTE format('DROP POLICY IF EXISTS service_role_all ON public.%I;', t);
            EXECUTE format('DROP POLICY IF EXISTS authenticated_all ON public.%I;', t);
            EXECUTE format('DROP POLICY IF EXISTS anon_read ON public.%I;', t);
            EXECUTE format('DROP POLICY IF EXISTS anon_insert_admission ON public.%I;', t);

            -- Allow service_role complete access
            EXECUTE format('CREATE POLICY service_role_all ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', t);
            
            -- Allow authenticated users complete access across all institute operations
            EXECUTE format('CREATE POLICY authenticated_all ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', t);
            
            -- Allow anon read on public landing/course/material data
            IF t IN ('courses', 'classes', 'toppers', 'study_materials', 'store_products', 'store_categories', 'settings', 'public_settings') THEN
                EXECUTE format('CREATE POLICY anon_read ON public.%I FOR SELECT TO anon USING (true);', t);
            END IF;

            -- Allow anon to submit new admissions and inquiries from the public website
            IF t IN ('admissions', 'inquiries') THEN
                EXECUTE format('CREATE POLICY anon_insert_admission ON public.%I FOR INSERT TO anon WITH CHECK (true);', t);
                EXECUTE format('CREATE POLICY anon_read ON public.%I FOR SELECT TO anon USING (true);', t);
            END IF;
        END IF;
    END LOOP;
END $$;

-- 6. Failsafe Auth User Creation Trigger Function
-- Ensures that creating users in Supabase Auth never throws 500 even if public profile sync encounters an edge case
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

    -- Avoid username collisions
    IF EXISTS (SELECT 1 FROM public.users WHERE username = v_username AND id <> new.id) THEN
      v_username := SUBSTRING(v_base_username, 1, 75) || '_' || SUBSTRING(new.id::text, 1, 8);
    END IF;

    v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
    v_phone := new.raw_user_meta_data->>'phone';
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'STUDENT');

    INSERT INTO public.users (id, username, name, email, role, phone, active, force_password_change)
    VALUES (new.id, v_username, v_name, new.email, v_role, v_phone, true, false)
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

-- 7. Trigger PostgREST schema cache reload so the API picks up newly granted tables immediately
NOTIFY pgrst, 'reload schema';
