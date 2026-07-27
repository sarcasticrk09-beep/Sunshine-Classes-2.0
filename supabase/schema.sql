-- ====================================================================
-- Sunshine Classes ERP V2 - PostgreSQL / Supabase Database Schema
-- ====================================================================

-- Enable UUID extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. ENUMS AND CUSTOM TYPES
-- --------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('FOUNDER', 'CO-FOUNDER', 'ADMIN', 'RECEPTIONIST', 'TEACHER', 'STUDENT');
CREATE TYPE student_status AS ENUM ('ACTIVE', 'SUSPENDED', 'COMPLETED', 'DEPARTED');
CREATE TYPE teacher_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE admission_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE fee_invoice_status AS ENUM ('PAID', 'PENDING', 'PARTIAL');

-- --------------------------------------------------------------------
-- 2. PUBLIC USERS PROFILE TABLE
-- --------------------------------------------------------------------
-- Extends Supabase Auth users metadata with ERP-specific attributes
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'STUDENT',
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  force_password_change BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for fast lookups
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_role ON public.users(role);

-- --------------------------------------------------------------------
-- 3. STUDENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  roll_no VARCHAR(20) UNIQUE NOT NULL, -- e.g., "SC-1002"
  name VARCHAR(150) NOT NULL,
  class_name VARCHAR(50) NOT NULL, -- "Class 10" (maps to "class" in Firestore)
  preferred_batch VARCHAR(100) NOT NULL, -- Preferred Batch Name
  father_name VARCHAR(150) NOT NULL,
  mother_name VARCHAR(150) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status student_status NOT NULL DEFAULT 'ACTIVE',
  monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_students_roll_no ON public.students(roll_no);
CREATE INDEX idx_students_class_status ON public.students(class_name, status);

-- --------------------------------------------------------------------
-- 4. TEACHERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  specialty TEXT[] NOT NULL DEFAULT '{}', -- Subject list string array
  qualification VARCHAR(255) NOT NULL,
  salary NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status teacher_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX idx_teachers_status ON public.teachers(status);

-- --------------------------------------------------------------------
-- 5. ADMISSIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.admissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name VARCHAR(150) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  preferred_batch VARCHAR(100) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  status admission_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admissions_status ON public.admissions(status);

-- --------------------------------------------------------------------
-- 6. FEE STATUSES (Invoices) TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.fee_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student_name VARCHAR(150) NOT NULL, -- Denormalized for rapid list fetching
  month VARCHAR(50) NOT NULL, -- e.g., "July 2026"
  total_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  paid_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  pending_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status fee_invoice_status NOT NULL DEFAULT 'PENDING',
  due_date DATE NOT NULL,
  payment_history JSONB NOT NULL DEFAULT '[]'::jsonb, -- Logs itemized payments
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, month)
);

CREATE INDEX idx_fee_statuses_student_id ON public.fee_statuses(student_id);
CREATE INDEX idx_fee_statuses_status ON public.fee_statuses(status);
CREATE INDEX idx_fee_statuses_month ON public.fee_statuses(month);

-- --------------------------------------------------------------------
-- 7. FEE RECEIPTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.fee_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount_paid NUMERIC(10, 2) NOT NULL,
  payment_mode VARCHAR(50) NOT NULL, -- "CASH", "UPI", "ONLINE"
  receipt_no VARCHAR(50) UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fee_receipts_student_id ON public.fee_receipts(student_id);
CREATE INDEX idx_fee_receipts_date ON public.fee_receipts(date);

-- --------------------------------------------------------------------
-- 8. AUDIT LOGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.audit_logs (
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

CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- --------------------------------------------------------------------
-- 9. AUTOMATIC USER SYNCHRONIZATION FROM SUPABASE AUTH
-- --------------------------------------------------------------------
-- Trigger function that executes on user signup in Supabase Auth (auth.users)
-- This synchronizes authentication profiles to the public ERP users table automatically.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username VARCHAR(100);
  v_name VARCHAR(150);
  v_role user_role;
  v_phone VARCHAR(20);
BEGIN
  -- Extract values from user_metadata JSON
  v_username := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  v_phone := new.raw_user_meta_data->>'phone';
  
  -- Assign role based on metadata, mapping strings safely
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
    role = EXCLUDED.role;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies mapping ERP permission levels:
-- 1. public.users policies
CREATE POLICY "Users can view all user profiles" ON public.users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super Admins can edit user profiles" ON public.users
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role IN ('FOUNDER', 'CO-FOUNDER', 'ADMIN')
    )
  );

-- 2. public.students policies
CREATE POLICY "Users can view student roster" ON public.students
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage student roster" ON public.students
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role IN ('FOUNDER', 'CO-FOUNDER', 'ADMIN', 'RECEPTIONIST')
    )
  );

-- 3. public.teachers policies
CREATE POLICY "Users can view teachers roster" ON public.teachers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage teachers" ON public.teachers
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role IN ('FOUNDER', 'CO-FOUNDER', 'ADMIN')
    )
  );

-- 4. public.audit_logs policies
CREATE POLICY "Only Admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role IN ('FOUNDER', 'CO-FOUNDER', 'ADMIN')
    )
  );

CREATE POLICY "Any authenticated session can create audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);
