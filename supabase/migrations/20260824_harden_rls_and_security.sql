-- ====================================================================
-- SUNSHINE CLASSES ERP - COMPLETE HARDENED RLS & SECURITY DEFINER MIGRATION
-- Migration: 20260824_harden_rls_and_security.sql
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. SECURITY DEFINER HELPER FUNCTIONS WITH FIXED SEARCH_PATH
-- --------------------------------------------------------------------

-- Helper: Get Authenticated User Role
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := COALESCE(
    current_setting('request.jwt.claims', true)::jsonb->>'role',
    (SELECT role::text FROM public.users WHERE id::text = auth.uid()::text LIMIT 1)
  );
  RETURN COALESCE(v_role, 'ANONYMOUS');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

-- Helper: Check If Current User Is Admin or Super Admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_auth_role() IN ('SUPER_ADMIN', 'FOUNDER', 'CO-FOUNDER', 'ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

-- Helper: Check If Current User Is Staff (Admin, Super Admin, Receptionist, Accountant)
CREATE OR REPLACE FUNCTION public.is_admin_or_receptionist()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_auth_role() IN ('SUPER_ADMIN', 'FOUNDER', 'CO-FOUNDER', 'ADMIN', 'RECEPTIONIST', 'ACCOUNTANT');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

-- Helper: Resolve Student ID For Authenticated User
CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS TEXT AS $$
DECLARE
  v_student_id TEXT;
  v_email TEXT;
BEGIN
  v_email := current_setting('request.jwt.claims', true)::jsonb->>'email';
  SELECT id::text INTO v_student_id FROM public.students
  WHERE user_id::text = auth.uid()::text OR (v_email IS NOT NULL AND email = v_email)
  LIMIT 1;
  RETURN v_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

-- Helper: Resolve Teacher ID For Authenticated User
CREATE OR REPLACE FUNCTION public.get_current_teacher_id()
RETURNS TEXT AS $$
DECLARE
  v_teacher_id TEXT;
  v_email TEXT;
BEGIN
  v_email := current_setting('request.jwt.claims', true)::jsonb->>'email';
  SELECT id::text INTO v_teacher_id FROM public.teachers
  WHERE user_id::text = auth.uid()::text OR (v_email IS NOT NULL AND email = v_email)
  LIMIT 1;
  RETURN v_teacher_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

-- Helper: Resolve Assigned Batches For Authenticated Teacher
CREATE OR REPLACE FUNCTION public.get_current_teacher_batches()
RETURNS TEXT[] AS $$
DECLARE
  v_batches TEXT[];
  v_email TEXT;
BEGIN
  v_email := current_setting('request.jwt.claims', true)::jsonb->>'email';
  SELECT assigned_batches INTO v_batches FROM public.teachers
  WHERE user_id::text = auth.uid()::text OR (v_email IS NOT NULL AND email = v_email)
  LIMIT 1;
  RETURN COALESCE(v_batches, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

-- Helper: Auth User Created Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_name TEXT;
  v_phone TEXT;
  v_role TEXT;
BEGIN
  v_username := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  v_phone := new.raw_user_meta_data->>'phone';
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'STUDENT');

  INSERT INTO public.users (id, username, name, email, role, phone)
  VALUES (
    new.id,
    LOWER(v_username),
    v_name,
    new.email,
    v_role,
    v_phone
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    role = EXCLUDED.role,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- --------------------------------------------------------------------
-- 2. RESTRICT / REVOKE SENSITIVE FUNCTION EXECUTION PRIVILEGES
-- --------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_auth_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin_or_super_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin_or_receptionist() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_current_student_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_current_teacher_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_current_teacher_batches() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_auth_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_receptionist() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_student_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_teacher_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_teacher_batches() TO authenticated;

-- --------------------------------------------------------------------
-- 3. ENABLE RLS ON ALL PUBLIC TABLES
-- --------------------------------------------------------------------

DO $$ 
DECLARE
  t text;
  tables text[] := ARRAY[
    'users', 'students', 'teachers', 'classes', 'batches', 'admissions',
    'inquiries', 'attendance', 'fee_statuses', 'fee_receipts', 'fee_structures',
    'payment_verifications', 'homework', 'submissions', 'homework_submissions',
    'tests', 'student_marks', 'study_materials', 'toppers', 'store_categories',
    'store_products', 'store_orders', 'batch_bulletins', 'settings', 'audit_logs',
    'departed_students'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END IF;
  END LOOP;
END $$;

-- --------------------------------------------------------------------
-- 4. CLEANUP OLD OVERLY-PERMISSIVE POLICIES
-- --------------------------------------------------------------------

DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- --------------------------------------------------------------------
-- 5. HARDENED ROLE-BASED POLICIES
-- --------------------------------------------------------------------

-- [1] USERS TABLE
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR id::text = auth.uid()::text
  );

CREATE POLICY "users_admin_manage_policy" ON public.users
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

-- [2] STUDENTS TABLE
CREATE POLICY "students_select_policy" ON public.students
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR user_id::text = auth.uid()::text
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        preferred_batch = ANY(public.get_current_teacher_batches())
        OR array_length(public.get_current_teacher_batches(), 1) IS NULL
      )
    )
  );

CREATE POLICY "students_staff_manage_policy" ON public.students
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- [3] TEACHERS TABLE
CREATE POLICY "teachers_select_policy" ON public.teachers
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR user_id::text = auth.uid()::text
  );

CREATE POLICY "teachers_staff_manage_policy" ON public.teachers
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

CREATE POLICY "teachers_self_update_policy" ON public.teachers
  FOR UPDATE TO authenticated
  USING (user_id::text = auth.uid()::text)
  WITH CHECK (user_id::text = auth.uid()::text);

-- [4] CLASSES TABLE
CREATE POLICY "classes_select_policy" ON public.classes
  FOR SELECT
  USING (true);

CREATE POLICY "classes_admin_manage_policy" ON public.classes
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

-- [5] BATCHES TABLE
CREATE POLICY "batches_select_policy" ON public.batches
  FOR SELECT
  USING (true);

CREATE POLICY "batches_staff_manage_policy" ON public.batches
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- [6] ADMISSIONS TABLE
CREATE POLICY "admissions_select_policy" ON public.admissions
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR user_id::text = auth.uid()::text
    OR email = (current_setting('request.jwt.claims', true)::jsonb->>'email')
  );

CREATE POLICY "admissions_safe_public_insert_policy" ON public.admissions
  FOR INSERT
  WITH CHECK (
    status = 'PENDING' 
    OR status IS NULL
  );

CREATE POLICY "admissions_staff_manage_policy" ON public.admissions
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- [7] INQUIRIES TABLE
CREATE POLICY "inquiries_select_policy" ON public.inquiries
  FOR SELECT TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE);

CREATE POLICY "inquiries_safe_public_insert_policy" ON public.inquiries
  FOR INSERT
  WITH CHECK (
    name IS NOT NULL
  );

CREATE POLICY "inquiries_staff_manage_policy" ON public.inquiries
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- [8] ATTENDANCE TABLE
CREATE POLICY "attendance_select_policy" ON public.attendance
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR student_id::text = public.get_current_student_id()
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        batch = ANY(public.get_current_teacher_batches())
        OR array_length(public.get_current_teacher_batches(), 1) IS NULL
      )
    )
  );

CREATE POLICY "attendance_staff_manage_policy" ON public.attendance
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        batch = ANY(public.get_current_teacher_batches())
        OR array_length(public.get_current_teacher_batches(), 1) IS NULL
      )
    )
  )
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        batch = ANY(public.get_current_teacher_batches())
        OR array_length(public.get_current_teacher_batches(), 1) IS NULL
      )
    )
  );

-- [9] FEE_STATUSES TABLE (Protected from Teacher access)
CREATE POLICY "fee_statuses_select_policy" ON public.fee_statuses
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'STUDENT'
      AND student_id::text = public.get_current_student_id()
    )
  );

CREATE POLICY "fee_statuses_staff_manage_policy" ON public.fee_statuses
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- [10] FEE_RECEIPTS TABLE
CREATE POLICY "fee_receipts_select_policy" ON public.fee_receipts
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'STUDENT'
      AND student_id::text = public.get_current_student_id()
    )
  );

CREATE POLICY "fee_receipts_staff_manage_policy" ON public.fee_receipts
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- [11] FEE_STRUCTURES TABLE
CREATE POLICY "fee_structures_select_policy" ON public.fee_structures
  FOR SELECT
  USING (true);

CREATE POLICY "fee_structures_admin_manage_policy" ON public.fee_structures
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

-- [12] PAYMENT_VERIFICATIONS TABLE
CREATE POLICY "payment_verifications_select_policy" ON public.payment_verifications
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR student_id::text = public.get_current_student_id()
  );

CREATE POLICY "payment_verifications_insert_policy" ON public.payment_verifications
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'STUDENT'
      AND student_id::text = public.get_current_student_id()
    )
  );

CREATE POLICY "payment_verifications_staff_manage_policy" ON public.payment_verifications
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- [13] HOMEWORK TABLE
CREATE POLICY "homework_select_policy" ON public.homework
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "homework_staff_manage_policy" ON public.homework
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        teacher_id::text = public.get_current_teacher_id()
        OR batch_name = ANY(public.get_current_teacher_batches())
      )
    )
  )
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        teacher_id::text = public.get_current_teacher_id()
        OR batch_name = ANY(public.get_current_teacher_batches())
      )
    )
  );

-- [14] SUBMISSIONS / HOMEWORK_SUBMISSIONS TABLE
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'submissions') THEN
    CREATE POLICY "submissions_select_policy" ON public.submissions
      FOR SELECT TO authenticated
      USING (
        public.is_admin_or_receptionist() = TRUE
        OR student_id::text = public.get_current_student_id()
        OR (
          public.get_auth_role() = 'TEACHER'
          AND homework_id IN (
            SELECT id::text FROM public.homework 
            WHERE teacher_id::text = public.get_current_teacher_id() 
               OR batch_name = ANY(public.get_current_teacher_batches())
          )
        )
      );

    CREATE POLICY "submissions_student_insert_policy" ON public.submissions
      FOR INSERT TO authenticated
      WITH CHECK (
        student_id::text = public.get_current_student_id()
        OR public.is_admin_or_receptionist() = TRUE
      );

    CREATE POLICY "submissions_update_policy" ON public.submissions
      FOR UPDATE TO authenticated
      USING (
        public.is_admin_or_receptionist() = TRUE
        OR (public.get_auth_role() = 'STUDENT' AND student_id::text = public.get_current_student_id())
        OR (
          public.get_auth_role() = 'TEACHER'
          AND homework_id IN (
            SELECT id::text FROM public.homework 
            WHERE teacher_id::text = public.get_current_teacher_id() 
               OR batch_name = ANY(public.get_current_teacher_batches())
          )
        )
      )
      WITH CHECK (
        public.is_admin_or_receptionist() = TRUE
        OR (public.get_auth_role() = 'STUDENT' AND student_id::text = public.get_current_student_id())
        OR (
          public.get_auth_role() = 'TEACHER'
          AND homework_id IN (
            SELECT id::text FROM public.homework 
            WHERE teacher_id::text = public.get_current_teacher_id() 
               OR batch_name = ANY(public.get_current_teacher_batches())
          )
        )
      );

    CREATE POLICY "submissions_admin_delete_policy" ON public.submissions
      FOR DELETE TO authenticated
      USING (public.is_admin_or_super_admin() = TRUE);
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'homework_submissions') THEN
    CREATE POLICY "hw_submissions_select_policy" ON public.homework_submissions
      FOR SELECT TO authenticated
      USING (
        public.is_admin_or_receptionist() = TRUE
        OR student_id::text = public.get_current_student_id()
        OR (
          public.get_auth_role() = 'TEACHER'
          AND homework_id IN (
            SELECT id::text FROM public.homework 
            WHERE teacher_id::text = public.get_current_teacher_id() 
               OR batch_name = ANY(public.get_current_teacher_batches())
          )
        )
      );

    CREATE POLICY "hw_submissions_student_insert_policy" ON public.homework_submissions
      FOR INSERT TO authenticated
      WITH CHECK (
        student_id::text = public.get_current_student_id()
        OR public.is_admin_or_receptionist() = TRUE
      );

    CREATE POLICY "hw_submissions_update_policy" ON public.homework_submissions
      FOR UPDATE TO authenticated
      USING (
        public.is_admin_or_receptionist() = TRUE
        OR (public.get_auth_role() = 'STUDENT' AND student_id::text = public.get_current_student_id())
        OR (
          public.get_auth_role() = 'TEACHER'
          AND homework_id IN (
            SELECT id::text FROM public.homework 
            WHERE teacher_id::text = public.get_current_teacher_id() 
               OR batch_name = ANY(public.get_current_teacher_batches())
          )
        )
      )
      WITH CHECK (
        public.is_admin_or_receptionist() = TRUE
        OR (public.get_auth_role() = 'STUDENT' AND student_id::text = public.get_current_student_id())
        OR (
          public.get_auth_role() = 'TEACHER'
          AND homework_id IN (
            SELECT id::text FROM public.homework 
            WHERE teacher_id::text = public.get_current_teacher_id() 
               OR batch_name = ANY(public.get_current_teacher_batches())
          )
        )
      );

    CREATE POLICY "hw_submissions_admin_delete_policy" ON public.homework_submissions
      FOR DELETE TO authenticated
      USING (public.is_admin_or_super_admin() = TRUE);
  END IF;
END $$;

-- [15] TESTS TABLE
CREATE POLICY "tests_select_policy" ON public.tests
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "tests_staff_manage_policy" ON public.tests
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        teacher_id::text = public.get_current_teacher_id()
        OR batch = ANY(public.get_current_teacher_batches())
      )
    )
  )
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        teacher_id::text = public.get_current_teacher_id()
        OR batch = ANY(public.get_current_teacher_batches())
      )
    )
  );

-- [16] STUDENT_MARKS TABLE
CREATE POLICY "student_marks_select_policy" ON public.student_marks
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'STUDENT'
      AND student_id::text = public.get_current_student_id()
    )
    OR (
      public.get_auth_role() = 'TEACHER'
      AND test_id IN (
        SELECT id::text FROM public.tests 
        WHERE teacher_id::text = public.get_current_teacher_id() 
           OR batch = ANY(public.get_current_teacher_batches())
      )
    )
  );

CREATE POLICY "student_marks_staff_manage_policy" ON public.student_marks
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND test_id IN (
        SELECT id::text FROM public.tests 
        WHERE teacher_id::text = public.get_current_teacher_id() 
           OR batch = ANY(public.get_current_teacher_batches())
      )
    )
  )
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND test_id IN (
        SELECT id::text FROM public.tests 
        WHERE teacher_id::text = public.get_current_teacher_id() 
           OR batch = ANY(public.get_current_teacher_batches())
      )
    )
  );

-- [17] STUDY_MATERIALS TABLE
CREATE POLICY "study_materials_select_policy" ON public.study_materials
  FOR SELECT
  USING (
    (is_public = TRUE AND status = 'PUBLISHED')
    OR public.get_auth_role() IN ('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'TEACHER')
  );

CREATE POLICY "study_materials_staff_manage_policy" ON public.study_materials
  FOR ALL TO authenticated
  USING (public.get_auth_role() IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER'))
  WITH CHECK (public.get_auth_role() IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER'));

-- [18] TOPPERS TABLE
CREATE POLICY "toppers_select_policy" ON public.toppers
  FOR SELECT
  USING (true);

CREATE POLICY "toppers_admin_manage_policy" ON public.toppers
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

-- [19] STORE_CATEGORIES & STORE_PRODUCTS TABLES
CREATE POLICY "store_categories_select_policy" ON public.store_categories
  FOR SELECT
  USING (true);

CREATE POLICY "store_categories_admin_manage_policy" ON public.store_categories
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

CREATE POLICY "store_products_select_policy" ON public.store_products
  FOR SELECT
  USING (true);

CREATE POLICY "store_products_admin_manage_policy" ON public.store_products
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

-- [20] STORE_ORDERS TABLE
CREATE POLICY "store_orders_select_policy" ON public.store_orders
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR user_id::text = auth.uid()::text
  );

CREATE POLICY "store_orders_insert_policy" ON public.store_orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "store_orders_staff_manage_policy" ON public.store_orders
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- [21] BATCH_BULLETINS TABLE
CREATE POLICY "batch_bulletins_select_policy" ON public.batch_bulletins
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'STUDENT'
      AND batch_name = (
        SELECT preferred_batch FROM public.students 
        WHERE user_id::text = auth.uid()::text LIMIT 1
      )
    )
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        batch_name = ANY(public.get_current_teacher_batches())
        OR array_length(public.get_current_teacher_batches(), 1) IS NULL
      )
    )
  );

CREATE POLICY "batch_bulletins_insert_policy" ON public.batch_bulletins
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        batch_name = ANY(public.get_current_teacher_batches())
        OR array_length(public.get_current_teacher_batches(), 1) IS NULL
      )
    )
    OR (
      public.get_auth_role() = 'STUDENT'
      AND batch_name = (
        SELECT preferred_batch FROM public.students 
        WHERE user_id::text = auth.uid()::text LIMIT 1
      )
    )
  );

CREATE POLICY "batch_bulletins_manage_policy" ON public.batch_bulletins
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_super_admin() = TRUE
    OR author_id::text = auth.uid()::text
  )
  WITH CHECK (
    public.is_admin_or_super_admin() = TRUE
    OR author_id::text = auth.uid()::text
  );

-- [22] SETTINGS TABLE
CREATE POLICY "settings_select_policy" ON public.settings
  FOR SELECT TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE);

CREATE POLICY "settings_admin_manage_policy" ON public.settings
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

-- [23] AUDIT_LOGS TABLE (Immutable log: Insert allowed, Select for Admins, Update/Delete blocked)
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE);

CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- [24] DEPARTED_STUDENTS TABLE
CREATE POLICY "departed_students_staff_manage_policy" ON public.departed_students
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- ========================================================
-- SANITIZED PUBLIC VIEWS (FOR FACULTY SHOWCASE & PUBLIC CONFIG)
-- ========================================================

-- Public Faculty Showcase View (Excludes salary, phone, private email, address)
CREATE OR REPLACE VIEW public.public_teachers WITH (security_barrier = true) AS
SELECT 
  id,
  name,
  specialty,
  qualification,
  experience,
  bio,
  photo_url,
  joined_date,
  status
FROM public.teachers
WHERE status = 'ACTIVE';

GRANT SELECT ON public.public_teachers TO anon, authenticated;

-- Public Settings View (Excludes internal private system configuration)
CREATE OR REPLACE VIEW public.public_settings WITH (security_barrier = true) AS
SELECT 
  id,
  data,
  updated_at
FROM public.settings
WHERE id IN ('branding', 'public_contact', 'institute_info', 'store_settings', 'landing_page_config');

GRANT SELECT ON public.public_settings TO anon, authenticated;

