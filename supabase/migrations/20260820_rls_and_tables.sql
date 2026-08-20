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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

-- Enable RLS on core entities
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role from JWT / users table
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to get current student ID for authenticated user
CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS TEXT AS $$
DECLARE
  v_student_id TEXT;
BEGIN
  SELECT id INTO v_student_id FROM public.students
  WHERE user_id = auth.uid()::text OR email = (current_setting('request.jwt.claims', true)::jsonb->>'email');
  RETURN v_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to get assigned batches for current teacher
CREATE OR REPLACE FUNCTION public.get_current_teacher_batches()
RETURNS TEXT[] AS $$
DECLARE
  v_batches TEXT[];
BEGIN
  SELECT assigned_batches INTO v_batches FROM public.teachers
  WHERE user_id = auth.uid()::text OR email = (current_setting('request.jwt.claims', true)::jsonb->>'email');
  RETURN COALESCE(v_batches, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ========================================================
-- 1. RLS POLICIES FOR 'students' TABLE
-- ========================================================

DROP POLICY IF EXISTS "Admins and Staff have full access to students" ON public.students;
CREATE POLICY "Admins and Staff have full access to students"
ON public.students
FOR ALL
USING (
  public.get_auth_role() IN ('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST')
);

DROP POLICY IF EXISTS "Students can view only their own record" ON public.students;
CREATE POLICY "Students can view only their own record"
ON public.students
FOR SELECT
USING (
  public.get_auth_role() = 'STUDENT'
  AND (
    user_id = auth.uid()::text
    OR email = (current_setting('request.jwt.claims', true)::jsonb->>'email')
  )
);

DROP POLICY IF EXISTS "Teachers can view students in their assigned batches" ON public.students;
CREATE POLICY "Teachers can view students in their assigned batches"
ON public.students
FOR SELECT
USING (
  public.get_auth_role() = 'TEACHER'
  AND (
    preferred_batch = ANY(public.get_current_teacher_batches())
    OR array_length(public.get_current_teacher_batches(), 1) IS NULL
  )
);

-- ========================================================
-- 2. RLS POLICIES FOR 'fee_statuses' TABLE
-- ========================================================

DROP POLICY IF EXISTS "Admins and Receptionists have full access to fee_statuses" ON public.fee_statuses;
CREATE POLICY "Admins and Receptionists have full access to fee_statuses"
ON public.fee_statuses
FOR ALL
USING (
  public.get_auth_role() IN ('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST')
);

DROP POLICY IF EXISTS "Students can view only their own fee status" ON public.fee_statuses;
CREATE POLICY "Students can view only their own fee status"
ON public.fee_statuses
FOR SELECT
USING (
  public.get_auth_role() = 'STUDENT'
  AND student_id = public.get_current_student_id()
);

DROP POLICY IF EXISTS "Teachers can view fee statuses for students in their batches" ON public.fee_statuses;
CREATE POLICY "Teachers can view fee statuses for students in their batches"
ON public.fee_statuses
FOR SELECT
USING (
  public.get_auth_role() = 'TEACHER'
  AND student_id IN (
    SELECT id FROM public.students
    WHERE preferred_batch = ANY(public.get_current_teacher_batches())
  )
);

-- ========================================================
-- 3. RLS POLICIES FOR 'submissions' TABLE
-- ========================================================

DROP POLICY IF EXISTS "Admins have full access to submissions" ON public.submissions;
CREATE POLICY "Admins have full access to submissions"
ON public.submissions
FOR ALL
USING (
  public.get_auth_role() IN ('SUPER_ADMIN', 'ADMIN')
);

DROP POLICY IF EXISTS "Students can manage only their own submissions" ON public.submissions;
CREATE POLICY "Students can manage only their own submissions"
ON public.submissions
FOR ALL
USING (
  public.get_auth_role() = 'STUDENT'
  AND student_id = public.get_current_student_id()
)
WITH CHECK (
  public.get_auth_role() = 'STUDENT'
  AND student_id = public.get_current_student_id()
);

DROP POLICY IF EXISTS "Teachers can view and grade submissions for their homework" ON public.submissions;
CREATE POLICY "Teachers can view and grade submissions for their homework"
ON public.submissions
FOR ALL
USING (
  public.get_auth_role() = 'TEACHER'
  AND homework_id IN (
    SELECT id FROM public.homework
    WHERE teacher_id = (SELECT id FROM public.teachers WHERE user_id = auth.uid()::text LIMIT 1)
       OR batch_name = ANY(public.get_current_teacher_batches())
  )
);

-- ========================================================
-- 4. PUBLIC ACCESS POLICIES FOR PUBLIC STUDY MATERIALS
-- ========================================================

DROP POLICY IF EXISTS "Anyone can view public study materials" ON public.study_materials;
CREATE POLICY "Anyone can view public study materials"
ON public.study_materials
FOR SELECT
USING (
  is_public = TRUE AND status = 'PUBLISHED'
);

DROP POLICY IF EXISTS "Staff full access to study materials" ON public.study_materials;
CREATE POLICY "Staff full access to study materials"
ON public.study_materials
FOR ALL
USING (
  public.get_auth_role() IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER')
);
