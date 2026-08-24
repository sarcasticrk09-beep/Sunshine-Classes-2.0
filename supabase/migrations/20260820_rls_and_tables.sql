-- ========================================================
-- Sunshine Classes ERP - Supabase Database Schema & RLS Setup
-- Migration: 20260820_rls_and_tables.sql
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'STUDENT',
  name TEXT,
  username TEXT UNIQUE,
  phone TEXT,
  status TEXT DEFAULT 'ACTIVE',
  is_locked BOOLEAN DEFAULT FALSE,
  must_change_password BOOLEAN DEFAULT FALSE,
  force_password_change BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  roll_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  preferred_batch TEXT NOT NULL,
  gender TEXT DEFAULT 'OTHER',
  admission_date DATE DEFAULT CURRENT_DATE,
  mobile TEXT,
  parent_mobile TEXT,
  email TEXT,
  address TEXT,
  father_name TEXT,
  mother_name TEXT,
  dob DATE,
  school TEXT,
  discount_percentage NUMERIC DEFAULT 0,
  scholarship_percentage NUMERIC DEFAULT 0,
  base_monthly_fee NUMERIC DEFAULT 1200,
  fee_start_month TEXT,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS public.teachers (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  teacher_id TEXT UNIQUE,
  name TEXT NOT NULL,
  specialty TEXT[] DEFAULT '{}',
  qualification TEXT,
  email TEXT,
  phone TEXT,
  assigned_batches TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FEE STATUSES TABLE
CREATE TABLE IF NOT EXISTS public.fee_statuses (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  month TEXT NOT NULL,
  total_fee NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  scholarship NUMERIC DEFAULT 0,
  paid_fee NUMERIC DEFAULT 0,
  pending_fee NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING',
  due_date DATE NOT NULL,
  class TEXT,
  is_skipped BOOLEAN DEFAULT FALSE,
  is_waived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FEE RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS public.fee_receipts (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  class TEXT NOT NULL,
  month TEXT NOT NULL,
  amount_paid NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  received_by TEXT NOT NULL,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HOMEWORK TABLE
CREATE TABLE IF NOT EXISTS public.homework (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  batch_id TEXT,
  batch_name TEXT,
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  homework_id TEXT NOT NULL REFERENCES public.homework(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  submission_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'PENDING',
  answer_text TEXT,
  file_url TEXT,
  marks NUMERIC,
  feedback TEXT,
  graded_by TEXT,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  batch TEXT,
  marked_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TESTS & MARKS TABLES
CREATE TABLE IF NOT EXISTS public.tests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  class TEXT NOT NULL,
  batch TEXT,
  date DATE NOT NULL,
  total_marks NUMERIC NOT NULL,
  teacher_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_marks (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  marks_obtained NUMERIC NOT NULL,
  total_marks NUMERIC NOT NULL,
  grade TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STUDY MATERIALS TABLE
CREATE TABLE IF NOT EXISTS public.study_materials (
  id TEXT PRIMARY KEY,
  material_id TEXT,
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  class TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT,
  material_type TEXT DEFAULT 'NOTES',
  category TEXT DEFAULT 'NOTES',
  file_url TEXT,
  thumbnail_url TEXT,
  youtube_url TEXT,
  external_url TEXT,
  size TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'PUBLISHED',
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  username TEXT,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & HELPER FUNCTIONS
-- ========================================================

-- Enable RLS on core entities
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 1. Helper Security Functions with Explicit search_path
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := COALESCE(
    current_setting('request.jwt.claims', true)::jsonb->>'role',
    (SELECT role FROM public.users WHERE id = auth.uid()::text)
  );
  RETURN COALESCE(v_role, 'ANONYMOUS');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_auth_role() IN ('SUPER_ADMIN', 'FOUNDER', 'CO-FOUNDER', 'ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_admin_or_receptionist()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_auth_role() IN ('SUPER_ADMIN', 'FOUNDER', 'CO-FOUNDER', 'ADMIN', 'RECEPTIONIST', 'ACCOUNTANT');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS TEXT AS $$
DECLARE
  v_student_id TEXT;
  v_email TEXT;
BEGIN
  v_email := current_setting('request.jwt.claims', true)::jsonb->>'email';
  SELECT id INTO v_student_id FROM public.students
  WHERE user_id = auth.uid()::text OR (v_email IS NOT NULL AND email = v_email)
  LIMIT 1;
  RETURN v_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.get_current_teacher_id()
RETURNS TEXT AS $$
DECLARE
  v_teacher_id TEXT;
  v_email TEXT;
BEGIN
  v_email := current_setting('request.jwt.claims', true)::jsonb->>'email';
  SELECT id INTO v_teacher_id FROM public.teachers
  WHERE user_id = auth.uid()::text OR (v_email IS NOT NULL AND email = v_email)
  LIMIT 1;
  RETURN v_teacher_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.get_current_teacher_batches()
RETURNS TEXT[] AS $$
DECLARE
  v_batches TEXT[];
  v_email TEXT;
BEGIN
  v_email := current_setting('request.jwt.claims', true)::jsonb->>'email';
  SELECT assigned_batches INTO v_batches FROM public.teachers
  WHERE user_id = auth.uid()::text OR (v_email IS NOT NULL AND email = v_email)
  LIMIT 1;
  RETURN COALESCE(v_batches, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

-- Revoke permissions
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

-- ========================================================
-- RLS POLICIES
-- ========================================================

-- [1] USERS
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR id = auth.uid()::text
  );

DROP POLICY IF EXISTS "users_admin_manage_policy" ON public.users;
CREATE POLICY "users_admin_manage_policy" ON public.users
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

-- [2] STUDENTS
DROP POLICY IF EXISTS "students_select_policy" ON public.students;
CREATE POLICY "students_select_policy" ON public.students
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR user_id = auth.uid()::text
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        preferred_batch = ANY(public.get_current_teacher_batches())
        OR array_length(public.get_current_teacher_batches(), 1) IS NULL
      )
    )
  );

DROP POLICY IF EXISTS "students_staff_manage_policy" ON public.students;
CREATE POLICY "students_staff_manage_policy" ON public.students
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- [3] TEACHERS
DROP POLICY IF EXISTS "teachers_select_policy" ON public.teachers;
CREATE POLICY "teachers_select_policy" ON public.teachers
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR user_id::text = auth.uid()::text
  );

DROP POLICY IF EXISTS "teachers_admin_manage_policy" ON public.teachers;
CREATE POLICY "teachers_admin_manage_policy" ON public.teachers
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

-- [4] FEE_STATUSES
DROP POLICY IF EXISTS "fee_statuses_select_policy" ON public.fee_statuses;
CREATE POLICY "fee_statuses_select_policy" ON public.fee_statuses
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'STUDENT'
      AND student_id = public.get_current_student_id()
    )
  );

DROP POLICY IF EXISTS "fee_statuses_staff_manage_policy" ON public.fee_statuses;
CREATE POLICY "fee_statuses_staff_manage_policy" ON public.fee_statuses
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- [5] FEE_RECEIPTS
DROP POLICY IF EXISTS "fee_receipts_select_policy" ON public.fee_receipts;
CREATE POLICY "fee_receipts_select_policy" ON public.fee_receipts
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'STUDENT'
      AND student_id = public.get_current_student_id()
    )
  );

DROP POLICY IF EXISTS "fee_receipts_staff_manage_policy" ON public.fee_receipts;
CREATE POLICY "fee_receipts_staff_manage_policy" ON public.fee_receipts
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- [6] SUBMISSIONS
DROP POLICY IF EXISTS "submissions_select_policy" ON public.submissions;
CREATE POLICY "submissions_select_policy" ON public.submissions
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (public.get_auth_role() = 'STUDENT' AND student_id = public.get_current_student_id())
    OR (
      public.get_auth_role() = 'TEACHER'
      AND homework_id IN (
        SELECT id FROM public.homework 
        WHERE teacher_id = public.get_current_teacher_id() 
           OR batch_name = ANY(public.get_current_teacher_batches())
      )
    )
  );

DROP POLICY IF EXISTS "submissions_student_insert_policy" ON public.submissions;
CREATE POLICY "submissions_student_insert_policy" ON public.submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = public.get_current_student_id()
    OR public.is_admin_or_receptionist() = TRUE
  );

DROP POLICY IF EXISTS "submissions_update_policy" ON public.submissions;
CREATE POLICY "submissions_update_policy" ON public.submissions
  FOR UPDATE TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (public.get_auth_role() = 'STUDENT' AND student_id = public.get_current_student_id())
    OR (
      public.get_auth_role() = 'TEACHER'
      AND homework_id IN (
        SELECT id FROM public.homework 
        WHERE teacher_id = public.get_current_teacher_id() 
           OR batch_name = ANY(public.get_current_teacher_batches())
      )
    )
  )
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR (public.get_auth_role() = 'STUDENT' AND student_id = public.get_current_student_id())
    OR (
      public.get_auth_role() = 'TEACHER'
      AND homework_id IN (
        SELECT id FROM public.homework 
        WHERE teacher_id = public.get_current_teacher_id() 
           OR batch_name = ANY(public.get_current_teacher_batches())
      )
    )
  );

-- [7] HOMEWORK
DROP POLICY IF EXISTS "homework_select_policy" ON public.homework;
CREATE POLICY "homework_select_policy" ON public.homework
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "homework_staff_manage_policy" ON public.homework;
CREATE POLICY "homework_staff_manage_policy" ON public.homework
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        teacher_id = public.get_current_teacher_id()
        OR batch_name = ANY(public.get_current_teacher_batches())
      )
    )
  )
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        teacher_id = public.get_current_teacher_id()
        OR batch_name = ANY(public.get_current_teacher_batches())
      )
    )
  );

-- [8] ATTENDANCE
DROP POLICY IF EXISTS "attendance_select_policy" ON public.attendance;
CREATE POLICY "attendance_select_policy" ON public.attendance
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR student_id = public.get_current_student_id()
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        batch = ANY(public.get_current_teacher_batches())
        OR array_length(public.get_current_teacher_batches(), 1) IS NULL
      )
    )
  );

DROP POLICY IF EXISTS "attendance_staff_manage_policy" ON public.attendance;
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

-- [9] TESTS & STUDENT_MARKS
DROP POLICY IF EXISTS "tests_select_policy" ON public.tests;
CREATE POLICY "tests_select_policy" ON public.tests
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tests_staff_manage_policy" ON public.tests;
CREATE POLICY "tests_staff_manage_policy" ON public.tests
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        teacher_id = public.get_current_teacher_id()
        OR batch = ANY(public.get_current_teacher_batches())
      )
    )
  )
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND (
        teacher_id = public.get_current_teacher_id()
        OR batch = ANY(public.get_current_teacher_batches())
      )
    )
  );

DROP POLICY IF EXISTS "student_marks_select_policy" ON public.student_marks;
CREATE POLICY "student_marks_select_policy" ON public.student_marks
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (public.get_auth_role() = 'STUDENT' AND student_id = public.get_current_student_id())
    OR (
      public.get_auth_role() = 'TEACHER'
      AND test_id IN (
        SELECT id FROM public.tests 
        WHERE teacher_id = public.get_current_teacher_id() 
           OR batch = ANY(public.get_current_teacher_batches())
      )
    )
  );

DROP POLICY IF EXISTS "student_marks_staff_manage_policy" ON public.student_marks;
CREATE POLICY "student_marks_staff_manage_policy" ON public.student_marks
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND test_id IN (
        SELECT id FROM public.tests 
        WHERE teacher_id = public.get_current_teacher_id() 
           OR batch = ANY(public.get_current_teacher_batches())
      )
    )
  )
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR (
      public.get_auth_role() = 'TEACHER'
      AND test_id IN (
        SELECT id FROM public.tests 
        WHERE teacher_id = public.get_current_teacher_id() 
           OR batch = ANY(public.get_current_teacher_batches())
      )
    )
  );

-- [10] STUDY MATERIALS
DROP POLICY IF EXISTS "study_materials_select_policy" ON public.study_materials;
CREATE POLICY "study_materials_select_policy" ON public.study_materials
  FOR SELECT USING (
    (is_public = TRUE AND status = 'PUBLISHED')
    OR public.get_auth_role() IN ('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'TEACHER')
  );

DROP POLICY IF EXISTS "study_materials_staff_manage_policy" ON public.study_materials;
CREATE POLICY "study_materials_staff_manage_policy" ON public.study_materials
  FOR ALL TO authenticated
  USING (public.get_auth_role() IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER'))
  WITH CHECK (public.get_auth_role() IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER'));

-- [11] AUDIT LOGS (Immutable)
DROP POLICY IF EXISTS "audit_logs_select_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE);

DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- [12] SETTINGS
DROP POLICY IF EXISTS "settings_select_policy" ON public.settings;
CREATE POLICY "settings_select_policy" ON public.settings
  FOR SELECT TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE);

DROP POLICY IF EXISTS "settings_admin_manage_policy" ON public.settings;
CREATE POLICY "settings_admin_manage_policy" ON public.settings
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);
