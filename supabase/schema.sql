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
  SELECT role::VARCHAR FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_student_id()
RETURNS UUID AS $$
  SELECT id FROM public.students WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_teacher_id()
RETURNS UUID AS $$
  SELECT id FROM public.teachers WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_or_receptionist()
RETURNS BOOLEAN AS $$
  SELECT role IN ('SUPER_ADMIN', 'FOUNDER', 'CO-FOUNDER', 'ADMIN', 'RECEPTIONIST', 'ACCOUNTANT')
  FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

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

-- --------------------------------------------------------------------
-- GRANULAR POLICIES: STUDENTS TABLE
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Students read policy" ON public.students;
DROP POLICY IF EXISTS "Manage students" ON public.students;

-- 1. Students: View own record only.
-- 2. Teachers: View students enrolled in batches they teach.
-- 3. Staff (Admin, Super Admin, Receptionist): View all students.
CREATE POLICY "Granular students select policy" ON public.students
  FOR SELECT TO authenticated
  USING (
    -- Admin, Receptionist, Accountant, Super Admin have full read access
    public.is_admin_or_receptionist() = TRUE
    OR
    -- Student can only see their own profile
    user_id = auth.uid()
    OR
    -- Teacher can only see students whose preferred_batch matches a batch taught by them
    preferred_batch IN (
      SELECT name FROM public.batches WHERE teacher_id = public.get_auth_teacher_id()
    )
  );

CREATE POLICY "Admin manage students" ON public.students
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- --------------------------------------------------------------------
-- GRANULAR POLICIES: FEE_STATUSES TABLE
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Fee statuses read policy" ON public.fee_statuses;
DROP POLICY IF EXISTS "Manage fee statuses" ON public.fee_statuses;

-- 1. Students: View only their own fee invoices/statuses.
-- 2. Staff (Admin, Super Admin, Receptionist, Accountant): Full access to manage & view fees.
-- 3. Teachers: BLOCKED from viewing fee records.
CREATE POLICY "Granular fee_statuses select policy" ON public.fee_statuses
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR
    student_id = public.get_auth_student_id()
  );

CREATE POLICY "Admin manage fee_statuses" ON public.fee_statuses
  FOR ALL TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE)
  WITH CHECK (public.is_admin_or_receptionist() = TRUE);

-- --------------------------------------------------------------------
-- GRANULAR POLICIES: HOMEWORK_SUBMISSIONS (SUBMISSIONS) TABLE
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Homework submissions read policy" ON public.homework_submissions;
DROP POLICY IF EXISTS "Manage homework submissions" ON public.homework_submissions;

-- 1. Students: View and insert only their own submissions.
-- 2. Teachers: View & evaluate submissions for homework assigned to their batches/created by them.
-- 3. Staff (Admin, Super Admin): View all submissions.
CREATE POLICY "Granular homework_submissions select policy" ON public.homework_submissions
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR
    student_id = public.get_auth_student_id()
    OR
    homework_id IN (
      SELECT id FROM public.homework WHERE teacher_id = public.get_auth_teacher_id()
    )
  );

CREATE POLICY "Student insert own homework_submissions" ON public.homework_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = public.get_auth_student_id()
    OR
    public.is_admin_or_receptionist() = TRUE
  );

CREATE POLICY "Teacher or admin evaluate homework_submissions" ON public.homework_submissions
  FOR UPDATE TO authenticated
  USING (
    public.is_admin_or_receptionist() = TRUE
    OR
    homework_id IN (
      SELECT id FROM public.homework WHERE teacher_id = public.get_auth_teacher_id()
    )
  )
  WITH CHECK (
    public.is_admin_or_receptionist() = TRUE
    OR
    homework_id IN (
      SELECT id FROM public.homework WHERE teacher_id = public.get_auth_teacher_id()
    )
  );

CREATE POLICY "Admin delete homework_submissions" ON public.homework_submissions
  FOR DELETE TO authenticated
  USING (public.is_admin_or_receptionist() = TRUE);

-- --------------------------------------------------------------------
-- GENERAL POLICIES FOR REMAINING TABLES
-- --------------------------------------------------------------------
CREATE POLICY "Users read policy" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Classes read policy" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Departed students read policy" ON public.departed_students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers read policy" ON public.teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admissions read policy" ON public.admissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Batches read policy" ON public.batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Attendance read policy" ON public.attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Fee receipts read policy" ON public.fee_receipts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Payment verifications read policy" ON public.payment_verifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tests read policy" ON public.tests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Student marks read policy" ON public.student_marks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Homework read policy" ON public.homework FOR SELECT TO authenticated USING (true);
CREATE POLICY "Toppers read policy" ON public.toppers FOR SELECT USING (true);
CREATE POLICY "Study materials read policy" ON public.study_materials FOR SELECT USING (true);
CREATE POLICY "Store categories read policy" ON public.store_categories FOR SELECT USING (true);
CREATE POLICY "Store products read policy" ON public.store_products FOR SELECT USING (true);
CREATE POLICY "Store orders read policy" ON public.store_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Batch bulletins read policy" ON public.batch_bulletins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inquiries read policy" ON public.inquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Settings read policy" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Audit logs read policy" ON public.audit_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage all users" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage classes" ON public.classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage departed students" ON public.departed_students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage teachers" ON public.teachers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage admissions" ON public.admissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public insert admissions" ON public.admissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Manage batches" ON public.batches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage attendance" ON public.attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage fee receipts" ON public.fee_receipts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage payment verifications" ON public.payment_verifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage tests" ON public.tests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage student marks" ON public.student_marks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage homework" ON public.homework FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage toppers" ON public.toppers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage study materials" ON public.study_materials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage store categories" ON public.store_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage store products" ON public.store_products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage store orders" ON public.store_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage batch bulletins" ON public.batch_bulletins FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage inquiries" ON public.inquiries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public insert inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Manage settings" ON public.settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
