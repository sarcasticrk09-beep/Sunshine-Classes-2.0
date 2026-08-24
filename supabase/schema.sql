-- ====================================================================
-- SUNSHINE CLASSES ERP - COMPLETE MASTER POSTGRESQL SCHEMA (SUPABASE)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enum Types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('FOUNDER', 'CO-FOUNDER', 'SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'TEACHER', 'STUDENT', 'ACCOUNTANT');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE student_status AS ENUM ('ACTIVE', 'SUSPENDED', 'COMPLETED', 'DEPARTED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE teacher_status AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE admission_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEED_MORE_INFO');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE fee_invoice_status AS ENUM ('PAID', 'PENDING', 'PARTIAL');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_mode AS ENUM ('CASH', 'UPI', 'ONLINE', 'CARD', 'NET_BANKING');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- --------------------------------------------------------------------
-- 3. PUBLIC USERS PROFILE TABLE (Linked to auth.users)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'STUDENT',
  phone VARCHAR(25),
  status VARCHAR(25) DEFAULT 'ACTIVE',
  must_change_password BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- --------------------------------------------------------------------
-- 4. CLASSES & CURRICULUM TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classes (
  id VARCHAR(50) PRIMARY KEY,
  class_id VARCHAR(50),
  class_name VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 1,
  monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  subjects TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 5. STUDENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  roll_no VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  preferred_batch VARCHAR(100) NOT NULL,
  father_name VARCHAR(150) NOT NULL,
  mother_name VARCHAR(150) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  mobile VARCHAR(25) NOT NULL,
  whatsapp VARCHAR(25) NOT NULL,
  email VARCHAR(255),
  admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status student_status NOT NULL DEFAULT 'ACTIVE',
  monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  photo_url TEXT,
  parent_email VARCHAR(255),
  emergency_contact VARCHAR(25),
  blood_group VARCHAR(10),
  school_name VARCHAR(150),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON public.students(roll_no);
CREATE INDEX IF NOT EXISTS idx_students_class_status ON public.students(class_name, status);
CREATE INDEX IF NOT EXISTS idx_students_mobile ON public.students(mobile);

-- --------------------------------------------------------------------
-- 6. DEPARTED / ALUMNI STUDENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departed_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  roll_no VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  father_name VARCHAR(150),
  mobile VARCHAR(25),
  departure_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT,
  total_dues_cleared BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 7. TEACHERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(25) NOT NULL,
  specialty TEXT[] NOT NULL DEFAULT '{}',
  qualification VARCHAR(255) NOT NULL,
  salary NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  joined_date DATE DEFAULT CURRENT_DATE,
  status teacher_status NOT NULL DEFAULT 'ACTIVE',
  photo_url TEXT,
  bio TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_status ON public.teachers(status);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON public.teachers(email);

-- --------------------------------------------------------------------
-- 8. ADMISSIONS PIPELINE TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name VARCHAR(150) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  preferred_batch VARCHAR(100) NOT NULL,
  mobile VARCHAR(25) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  gender VARCHAR(20),
  father_name VARCHAR(150),
  mother_name VARCHAR(150),
  dob DATE,
  previous_school VARCHAR(150),
  status admission_status NOT NULL DEFAULT 'PENDING',
  monthly_fee NUMERIC(10, 2) DEFAULT 0.00,
  rejection_reason TEXT,
  admin_notes TEXT,
  reviewed_by VARCHAR(150),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admissions_status ON public.admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_mobile ON public.admissions(mobile);

-- --------------------------------------------------------------------
-- 9. BATCHES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  subject VARCHAR(100),
  time VARCHAR(50) NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  teacher_name VARCHAR(150),
  monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  billing_cycle VARCHAR(50) DEFAULT 'Monthly',
  next_due_date DATE,
  status VARCHAR(25) DEFAULT 'ACTIVE',
  capacity INT DEFAULT 30,
  room_no VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batches_class ON public.batches(class_name);
CREATE INDEX IF NOT EXISTS idx_batches_teacher ON public.batches(teacher_id);

-- --------------------------------------------------------------------
-- 10. ATTENDANCE TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(25) NOT NULL DEFAULT 'PRESENT', -- PRESENT, ABSENT, LATE, LEAVE
  marked_by VARCHAR(150),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_batch ON public.attendance(batch_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique ON public.attendance(student_id, date);

-- --------------------------------------------------------------------
-- 11. FEE INVOICES & STATUSES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fee_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student_name VARCHAR(150) NOT NULL,
  month VARCHAR(50) NOT NULL,
  total_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  paid_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  pending_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status fee_invoice_status NOT NULL DEFAULT 'PENDING',
  due_date DATE NOT NULL,
  payment_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, month)
);

CREATE INDEX IF NOT EXISTS idx_fee_statuses_student_id ON public.fee_statuses(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_statuses_status ON public.fee_statuses(status);
CREATE INDEX IF NOT EXISTS idx_fee_statuses_month ON public.fee_statuses(month);

-- --------------------------------------------------------------------
-- 12. FEE RECEIPTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fee_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount_paid NUMERIC(10, 2) NOT NULL,
  payment_mode VARCHAR(50) NOT NULL DEFAULT 'CASH',
  receipt_no VARCHAR(100) UNIQUE NOT NULL,
  month VARCHAR(50),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  collected_by VARCHAR(150),
  remarks TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_receipts_student_id ON public.fee_receipts(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_date ON public.fee_receipts(date);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_no ON public.fee_receipts(receipt_no);

-- --------------------------------------------------------------------
-- 13. PAYMENT VERIFICATION QUEUE (UPI Screenshot Approvals)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student_name VARCHAR(150) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  month VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(100),
  proof_image_url TEXT NOT NULL,
  status VARCHAR(25) NOT NULL DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_by VARCHAR(150),
  verified_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_payment_verifications_status ON public.payment_verifications(status);

-- --------------------------------------------------------------------
-- 14. TESTS & EXAMINATIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  class_name VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  total_marks INT NOT NULL DEFAULT 100,
  passing_marks INT NOT NULL DEFAULT 35,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tests_class_subject ON public.tests(class_name, subject);

-- --------------------------------------------------------------------
-- 15. STUDENT MARKS & EXAM SCORES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  marks_obtained NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  is_present BOOLEAN NOT NULL DEFAULT TRUE,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (test_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_student_marks_student ON public.student_marks(student_id);

-- --------------------------------------------------------------------
-- 16. HOMEWORK & ASSIGNMENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.homework (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  class_name VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  attachment_url TEXT,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  teacher_name VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homework_class ON public.homework(class_name);
CREATE INDEX IF NOT EXISTS idx_homework_due_date ON public.homework(due_date);

-- --------------------------------------------------------------------
-- 17. HOMEWORK SUBMISSIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.homework_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  homework_id UUID NOT NULL REFERENCES public.homework(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  submission_url TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  remarks TEXT,
  grade VARCHAR(10),
  evaluated_by VARCHAR(150),
  evaluated_at TIMESTAMPTZ,
  UNIQUE (homework_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_homework_submissions_student ON public.homework_submissions(student_id);

-- --------------------------------------------------------------------
-- 18. MERIT TOPPERS & HONORS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.toppers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  percentage VARCHAR(20) NOT NULL,
  rank VARCHAR(20),
  year VARCHAR(20) NOT NULL,
  photo_url TEXT,
  exam_type VARCHAR(100) DEFAULT 'Board Examination',
  quote TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 19. STUDY MATERIALS & RESOURCES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) DEFAULT 'PDF',
  file_size VARCHAR(50),
  uploaded_by VARCHAR(150),
  is_public BOOLEAN DEFAULT TRUE,
  download_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_materials_class_subject ON public.study_materials(class_name, subject);

-- --------------------------------------------------------------------
-- 20. SUNSHINE STORE - CATEGORIES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  display_order INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 21. SUNSHINE STORE - PRODUCTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  category_id VARCHAR(50) REFERENCES public.store_categories(id) ON DELETE SET NULL,
  class_name VARCHAR(50),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_price NUMERIC(10, 2),
  stock_quantity INT NOT NULL DEFAULT 0,
  image_url TEXT,
  description TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 22. SUNSHINE STORE - ORDERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  student_name VARCHAR(150) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(25) DEFAULT 'PLACED', -- PLACED, PREPARED, COMPLETED, CANCELLED
  payment_status VARCHAR(25) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 23. BATCH BULLETINS & ANNOUNCEMENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.batch_bulletins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  class_name VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
  attachment_url TEXT,
  author_name VARCHAR(150) NOT NULL,
  author_role VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 24. INQUIRIES & HELP DESK TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  email VARCHAR(255),
  class_interest VARCHAR(50),
  message TEXT NOT NULL,
  status VARCHAR(25) DEFAULT 'NEW', -- NEW, CONTACTED, RESOLVED, CLOSED
  assigned_to VARCHAR(150),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);

-- --------------------------------------------------------------------
-- 25. SETTINGS & SYSTEM CONFIGURATION TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
  id VARCHAR(100) PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 26. AUDIT LOGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  username VARCHAR(100) NOT NULL,
  action VARCHAR(150) NOT NULL,
  details TEXT NOT NULL,
  performed_by VARCHAR(150) NOT NULL,
  ip_address VARCHAR(45),
  device_info TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- --------------------------------------------------------------------
-- 27. AUTOMATIC USER AUTH SYNC TRIGGER
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username VARCHAR(100);
  v_name VARCHAR(150);
  v_role user_role;
  v_phone VARCHAR(25);
BEGIN
  v_username := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  v_phone := new.raw_user_meta_data->>'phone';
  
  BEGIN
    v_role := (COALESCE(new.raw_user_meta_data->>'role', 'STUDENT'))::user_role;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'STUDENT'::user_role;
  END;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- 28. HELPER SECURITY FUNCTIONS: AUTH & ROLE RESOLUTION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS VARCHAR AS $$
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

CREATE OR REPLACE FUNCTION public.get_auth_student_id()
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM public.students WHERE user_id = auth.uid() LIMIT 1;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.get_auth_teacher_id()
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM public.teachers WHERE user_id = auth.uid() LIMIT 1;
  RETURN v_id;
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
  SELECT id::text INTO v_student_id FROM public.students
  WHERE user_id::text = auth.uid()::text OR (v_email IS NOT NULL AND email = v_email)
  LIMIT 1;
  RETURN v_student_id;
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
  WHERE user_id::text = auth.uid()::text OR (v_email IS NOT NULL AND email = v_email)
  LIMIT 1;
  RETURN COALESCE(v_batches, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

-- Revoke all execute from public and anon
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_auth_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin_or_super_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin_or_receptionist() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_auth_student_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_auth_teacher_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_current_student_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_current_teacher_batches() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_auth_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_receptionist() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_student_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_teacher_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_student_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_teacher_batches() TO authenticated;

-- --------------------------------------------------------------------
-- 29. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departed_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toppers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. USERS
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR id = auth.uid()
  );

CREATE POLICY "users_admin_manage_policy" ON public.users
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

-- 2. STUDENTS
CREATE POLICY "students_select_policy" ON public.students
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR user_id = auth.uid()
    OR preferred_batch IN (
      SELECT name FROM public.batches WHERE teacher_id = public.get_auth_teacher_id()
    )
  );

CREATE POLICY "students_staff_manage_policy" ON public.students
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- 3. TEACHERS
CREATE POLICY "teachers_select_policy" ON public.teachers
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR user_id::text = auth.uid()::text
  );

CREATE POLICY "teachers_admin_manage_policy" ON public.teachers
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

CREATE POLICY "teachers_self_update_policy" ON public.teachers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. CLASSES
CREATE POLICY "classes_select_policy" ON public.classes
  FOR SELECT USING (true);

CREATE POLICY "classes_admin_manage_policy" ON public.classes
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

-- 5. BATCHES
CREATE POLICY "batches_select_policy" ON public.batches
  FOR SELECT USING (true);

CREATE POLICY "batches_staff_manage_policy" ON public.batches
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- 6. ADMISSIONS
CREATE POLICY "admissions_select_policy" ON public.admissions
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

CREATE POLICY "admissions_safe_public_insert_policy" ON public.admissions
  FOR INSERT WITH CHECK (
    status = 'PENDING' OR status IS NULL
  );

CREATE POLICY "admissions_staff_manage_policy" ON public.admissions
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- 7. INQUIRIES
CREATE POLICY "inquiries_select_policy" ON public.inquiries
  FOR SELECT TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE);

CREATE POLICY "inquiries_safe_public_insert_policy" ON public.inquiries
  FOR INSERT WITH CHECK (name IS NOT NULL);

CREATE POLICY "inquiries_staff_manage_policy" ON public.inquiries
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- 8. ATTENDANCE
CREATE POLICY "attendance_select_policy" ON public.attendance
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR student_id = public.get_auth_student_id()
    OR batch_id IN (
      SELECT id FROM public.batches WHERE teacher_id = public.get_auth_teacher_id()
    )
  );

CREATE POLICY "attendance_staff_manage_policy" ON public.attendance
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR batch_id IN (
      SELECT id FROM public.batches WHERE teacher_id = public.get_auth_teacher_id()
    )
  )
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR batch_id IN (
      SELECT id FROM public.batches WHERE teacher_id = public.get_auth_teacher_id()
    )
  );

-- 9. FEE_STATUSES
CREATE POLICY "fee_statuses_select_policy" ON public.fee_statuses
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR student_id = public.get_auth_student_id()
  );

CREATE POLICY "fee_statuses_staff_manage_policy" ON public.fee_statuses
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- 10. FEE_RECEIPTS
CREATE POLICY "fee_receipts_select_policy" ON public.fee_receipts
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR student_id = public.get_auth_student_id()
  );

CREATE POLICY "fee_receipts_staff_manage_policy" ON public.fee_receipts
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- 11. FEE_STRUCTURES
CREATE POLICY "fee_structures_select_policy" ON public.fee_structures
  FOR SELECT USING (true);

CREATE POLICY "fee_structures_admin_manage_policy" ON public.fee_structures
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

-- 12. PAYMENT_VERIFICATIONS
CREATE POLICY "payment_verifications_select_policy" ON public.payment_verifications
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR student_id = public.get_auth_student_id()
  );

CREATE POLICY "payment_verifications_insert_policy" ON public.payment_verifications
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR student_id = public.get_auth_student_id()
  );

CREATE POLICY "payment_verifications_staff_manage_policy" ON public.payment_verifications
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- 13. HOMEWORK
CREATE POLICY "homework_select_policy" ON public.homework
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "homework_staff_manage_policy" ON public.homework
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR teacher_id = public.get_auth_teacher_id()
  )
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR teacher_id = public.get_auth_teacher_id()
  );

-- 14. HOMEWORK_SUBMISSIONS
CREATE POLICY "homework_submissions_select_policy" ON public.homework_submissions
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR student_id = public.get_auth_student_id()
    OR homework_id IN (
      SELECT id FROM public.homework WHERE teacher_id = public.get_auth_teacher_id()
    )
  );

CREATE POLICY "homework_submissions_insert_policy" ON public.homework_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = public.get_auth_student_id()
    OR public.is_admin_or_receptionist() = TRUE
  );

CREATE POLICY "homework_submissions_update_policy" ON public.homework_submissions
  FOR UPDATE TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (student_id = public.get_auth_student_id() AND status = 'PENDING')
    OR homework_id IN (
      SELECT id FROM public.homework WHERE teacher_id = public.get_auth_teacher_id()
    )
  )
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR (student_id = public.get_auth_student_id() AND status = 'PENDING')
    OR homework_id IN (
      SELECT id FROM public.homework WHERE teacher_id = public.get_auth_teacher_id()
    )
  );

CREATE POLICY "homework_submissions_admin_delete_policy" ON public.homework_submissions
  FOR DELETE TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE);

-- 15. TESTS
CREATE POLICY "tests_select_policy" ON public.tests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "tests_staff_manage_policy" ON public.tests
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR teacher_id = public.get_auth_teacher_id()
  )
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR teacher_id = public.get_auth_teacher_id()
  );

-- 16. STUDENT_MARKS
CREATE POLICY "student_marks_select_policy" ON public.student_marks
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR student_id = public.get_auth_student_id()
    OR test_id IN (
      SELECT id FROM public.tests WHERE teacher_id = public.get_auth_teacher_id()
    )
  );

CREATE POLICY "student_marks_staff_manage_policy" ON public.student_marks
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR test_id IN (
      SELECT id FROM public.tests WHERE teacher_id = public.get_auth_teacher_id()
    )
  )
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR test_id IN (
      SELECT id FROM public.tests WHERE teacher_id = public.get_auth_teacher_id()
    )
  );

-- 17. STUDY_MATERIALS
CREATE POLICY "study_materials_select_policy" ON public.study_materials
  FOR SELECT USING (
    (is_public = TRUE AND status = 'PUBLISHED')
    OR public.get_auth_role() IN ('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'TEACHER')
  );

CREATE POLICY "study_materials_staff_manage_policy" ON public.study_materials
  FOR ALL TO authenticated
  USING (public.get_auth_role() IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER'))
  WITH CHECK (public.get_auth_role() IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER'));

-- 18. TOPPERS
CREATE POLICY "toppers_select_policy" ON public.toppers
  FOR SELECT USING (true);

CREATE POLICY "toppers_admin_manage_policy" ON public.toppers
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

-- 19. STORE_CATEGORIES & STORE_PRODUCTS
CREATE POLICY "store_categories_select_policy" ON public.store_categories
  FOR SELECT USING (true);

CREATE POLICY "store_categories_admin_manage_policy" ON public.store_categories
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

CREATE POLICY "store_products_select_policy" ON public.store_products
  FOR SELECT USING (true);

CREATE POLICY "store_products_admin_manage_policy" ON public.store_products
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

-- 20. STORE_ORDERS
CREATE POLICY "store_orders_select_policy" ON public.store_orders
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

CREATE POLICY "store_orders_insert_policy" ON public.store_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "store_orders_staff_manage_policy" ON public.store_orders
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- 21. BATCH_BULLETINS
CREATE POLICY "batch_bulletins_select_policy" ON public.batch_bulletins
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR batch_name = (
      SELECT preferred_batch FROM public.students WHERE user_id = auth.uid() LIMIT 1
    )
    OR batch_id IN (
      SELECT id FROM public.batches WHERE teacher_id = public.get_auth_teacher_id()
    )
  );

CREATE POLICY "batch_bulletins_insert_policy" ON public.batch_bulletins
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR batch_id IN (
      SELECT id FROM public.batches WHERE teacher_id = public.get_auth_teacher_id()
    )
    OR batch_name = (
      SELECT preferred_batch FROM public.students WHERE user_id = auth.uid() LIMIT 1
    )
  );

CREATE POLICY "batch_bulletins_manage_policy" ON public.batch_bulletins
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_super_admin() = TRUE
    OR author_id = auth.uid()
  )
  WITH CHECK (
    public.is_admin_or_super_admin() = TRUE
    OR author_id = auth.uid()
  );

-- 22. SETTINGS
CREATE POLICY "settings_select_policy" ON public.settings
  FOR SELECT TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE);

CREATE POLICY "settings_admin_manage_policy" ON public.settings
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE)
  WITH CHECK (public.is_admin_or_super_admin() = TRUE);

-- 23. AUDIT_LOGS
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin_or_super_admin() = TRUE);

CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- 24. DEPARTED_STUDENTS
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


