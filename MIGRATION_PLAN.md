# Firebase to Supabase Migration Plan

This document serves as the master engineering roadmap for migrating the **Sunshine ERP** database, media, and authorization layers from Google Firebase to Supabase.

---

## 📅 Roadmap Overview
The migration is executed in a modular, branch-controlled flow inside `feature/supabase-migration` to prevent disruption to our stable `main` branch.

```text
               [ PHASE 1: PREPARATION ] - COMPLETE
               ├── Setup Supabase Local client configurations
               └── Establish Database Schema (supabase/schema.sql)
                          │
                          ▼
            [ PHASE 2: AUTHENTICATION ] - IN PROGRESS
            ├── Integrate Supabase Auth Context
            └── Write Firebase Auth Dual-Fallback Bridges
                          │
                          ▼
              [ PHASE 3: CORE DATA SYNC ]
              ├── Route students, teachers via SyncService
              └── Backfill data via PostgreSQL scripts
                          │
                          ▼
               [ PHASE 4: REPLACEMENT ]
               ├── Deprecate Firebase direct SDK dependencies
               └── Transition media storage from Cloudinary
                          │
                          ▼
                [ PHASE 5: VERIFICATION ]
                └── Comprehensive End-to-End QA
```

---

## 🛠️ Step-by-Step Execution Checklist

### Phase 1: Client Setup & Database Schemas (Status: COMPLETE)
- [x] Configure Supabase client initialization in `/src/lib/supabase.ts` backed by secure `.env` variables.
- [x] Setup comprehensive PostgreSQL schema matching the Firestore structure (`supabase/schema.sql`).
- [x] Integrate bidirectional mapping helpers (`toPostgresRow` and `fromPostgresRow`) inside `/src/services/SyncService.ts` to seamlessly convert camelCase objects to snake_case rows.

### Phase 2: Authentication & Sessions (Status: IN PROGRESS)
- [ ] Implement Supabase Authentication wrappers in `/src/auth/` alongside existing Firebase Auth.
- [ ] Ensure user login verification searches the PostgreSQL `users` table and matches hashed credentials.
- [ ] Enforce security boundaries and session tracking under React context wrappers.

### Phase 3: Core Business Modules (Status: PLANNED)
- [ ] **Students & Rosters**: Route student lists, search queries, and status updates through Supabase via `SyncService`.
- [ ] **Teachers & Salaries**: Connect teacher specialties (`string[]` array mapping), Qualifications, and Base Salary metrics.
- [ ] **Fee & Receipts**: Connect monthly invoicing structures, payment history records, and ledger status updates.
- [ ] **Attendance grids**: Hook up student and staff attendance logging grids.
- [ ] **Store & CMS**: Connect study materials catalog, store items, and NCERT files.

### Phase 4: Media Assets & Communications (Status: PLANNED)
- [ ] Setup Supabase Storage buckets for student photographs and documents.
- [ ] Replace Cloudinary uploader with direct Supabase Storage upload APIs.
- [ ] Update server endpoint routers (WhatsApp, Emails) to read database profiles from PostgreSQL.

### Phase 5: Verification & Cleanup (Status: PLANNED)
- [ ] Run full institute operations test run: Online admission -> webcam portrait upload -> credentials pop-up -> fee invoice ledger creation -> receipt PDF generation -> WhatsApp dispatch.
- [ ] Wipe Firebase dependencies from `package.json`.
- [ ] Merge branch `feature/supabase-migration` into `main`.

---

## 🧪 Testing Checklist
1. **Admissions Pipeline**: Confirm submitting an admission form creates a student profile, user credentials, 12 months of pending fee status records, and triggers the popup.
2. **Fee Desk PDF Generation**: Confirm manual payment collection recalculates balances and instantly compiles PDF receipts.
3. **Webcam capture**: Confirm photo uploader captures and uploads portraits.
4. **AI Chatbot**: Confirm inline chatbot replies correctly using server Gemini keys.

---

## 🔄 Rollback Plan
If critical runtime errors occur in production during the transition:
1. **Rollback Branch**: Immediately abort the merge and revert the production server back to the stable `main` branch.
2. **Database Fallback**: Turn off the `isSupabaseConfigured` flag in `/src/lib/supabase.ts` to instantly route all reads/writes back to Cloud Firestore with zero downtime.
