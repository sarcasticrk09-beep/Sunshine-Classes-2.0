# Database Specification: Sunshine ERP

This document serves as the absolute technical reference for the database layer of the **Sunshine Classes ERP (Sunshine ERP)** platform, covering our current Firestore implementation and the new PostgreSQL database specifications.

---

## 📊 Database Engine & Migration Status

- **Primary Production Database**: Google Cloud Firestore.
- **Migration Target Database**: Supabase (PostgreSQL 15+).
- **Current Branch Status (`feature/supabase-migration`)**: Dual-DB synchronous bridging enabled. Transaction writes sync to PostgreSQL tables while reading-after-writing to verify structural correctness.

---

## 🗄️ Database Schema & Table Structures

```text
 USERS (User logins & session contexts)
   ├── id (UUID / PK)
   ├── username (TEXT - Unique lowercase)
   ├── email (TEXT)
   ├── role (TEXT)
   └── password (TEXT - Hashed sha256)
        │
        ├─► STUDENTS (Active pupils)
        │     ├── id (UUID / PK)
        │     ├── user_id (UUID / FK)
        │     ├── roll_no (TEXT - "SC-XXXX")
        │     ├── class_name (TEXT)
        │     ├── preferred_batch (TEXT)
        │     └── monthly_fee (NUMERIC)
        │           │
        │           ├─► FEE_STATUSES (Monthly invoicing invoices)
        │           │     ├── id (UUID / PK)
        │           │     ├── student_id (UUID / FK)
        │           │     ├── month (TEXT - "July 2026")
        │           │     ├── total_fee (NUMERIC)
        │           │     └── pending_fee (NUMERIC)
        │           │
        │           └─► FEE_RECEIPTS (Payment collections history)
        │                 ├── id (UUID / PK)
        │                 ├── student_id (UUID / FK)
        │                 ├── amount_paid (NUMERIC)
        │                 └── payment_mode (TEXT)
        │
        └─► TEACHERS (Instructor staff)
              ├── id (UUID / PK)
              ├── user_id (UUID / FK)
              ├── specialty (TEXT[] - subjects list)
              └── salary (NUMERIC)
```

---

## 🛡️ PostgreSQL DDL & Tables (Supabase)

### 1. `users` Table
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('FOUNDER', 'CO-FOUNDER', 'ADMIN', 'RECEPTION', 'TEACHER', 'STUDENT')),
    phone TEXT,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 2. `students` Table
```sql
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    roll_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    preferred_batch TEXT NOT NULL,
    father_name TEXT NOT NULL,
    mother_name TEXT NOT NULL,
    dob DATE NOT NULL,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    address TEXT NOT NULL,
    mobile TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    admission_date DATE DEFAULT CURRENT_DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'SUSPENDED', 'COMPLETED', 'DEPARTED')),
    monthly_fee NUMERIC(10, 2) NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 3. `teachers` Table
```sql
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    specialty TEXT[] NOT NULL, -- Subject list. Note: NEVER use a single direct string
    qualification TEXT NOT NULL,
    salary NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 4. `fee_statuses` Table
```sql
CREATE TABLE public.fee_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    month TEXT NOT NULL, -- E.g. "July 2026"
    total_fee NUMERIC(10, 2) NOT NULL,
    paid_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    pending_fee NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PAID', 'PENDING', 'PARTIAL')),
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 5. `fee_receipts` Table
```sql
CREATE TABLE public.fee_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('UPI', 'Cash', 'Card', 'Check')),
    receipt_no TEXT UNIQUE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## 🔒 Security & Access Rules

### 1. Firestore Security Rules
Managed inside `firestore.rules`. Restricts write access to authenticated users:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sunshine_erp_state/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 2. PostgreSQL Row Level Security (RLS)
PostgreSQL tables are protected using Supabase RLS policies to restrict profile readings to logged-in accounts and modifications exclusively to Admin and Founders.

---

## 📦 Remaining Firebase Dependencies

Until the Supabase migration is finalized, the system relies on Firebase for:
1. **Direct Session State Tracking**: Firebase Auth on the client side (`useAuth.tsx`).
2. **Real-time Live Syncs**: Firestore collections sync for class calendars and homework lists.
