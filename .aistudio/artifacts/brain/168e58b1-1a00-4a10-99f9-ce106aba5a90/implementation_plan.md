# Universal Password Synchronization ('Sunshine123') & Real-World Supabase Sync Plan

Comprehensive execution plan to synchronize all account credentials across students, teachers, and administrators to the standardized password `Sunshine123`, permit seamless case-flexible matching (`Sunshine123` and `sunshine123`), and execute an authoritative sync across Supabase Auth and database tables.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the following decisions for this implementation:
> - **Scope of Accounts**: All accounts across the system—including students, parents, faculty members, desk receptionists, and administrators—will have their credentials updated to `Sunshine123`.
> - **Case Flexibility for Young Students**: Both `Sunshine123` and `sunshine123` will be accepted seamlessly during authentication to avoid case-sensitivity lockout issues for elementary and secondary students.
> - **Real-World Supabase Synchronization**: An automated sync pipeline will run immediately using the Supabase Admin API (`supabase.auth.admin.updateUserById`) to update the real-world authentication passwords of all registered users in the cloud project.
> - **Zero Forced Password Resets**: `must_change_password` will remain `false` across all accounts to ensure zero friction on next login.

- **Confirmed Decision 1 (All-Role Coverage)**: Update root seed users, staff definitions, student records, and backend authentication defaults to `Sunshine123`.
- **Confirmed Decision 2 (Dual-Case Acceptance)**: The password comparison logic in both client `AuthProvider.tsx` and backend `PasswordService.ts` will accept `Sunshine123` and `sunshine123` as valid.
- **Confirmed Decision 3 (Authoritative Cloud Sync Script)**: Provide and run a dedicated synchronization script (`scripts/sync-all-passwords-supabase.ts`) and administrative endpoint (`/api/admin/sync-passwords`) that enumerates all Supabase Auth users and updates their passwords to `Sunshine123`.

---

## 1. Overview & Core Concept

- **What It Does**: Establishes a synchronized password standard across the entire Sunshine Classes ERP ecosystem. Every student, teacher, and administrator account in both the local ERP state and the live cloud Supabase Auth directory will have their password set to `Sunshine123`.
- **Target Audience / Impact**: Institute directors, administrative coordinators, teachers accessing gradebooks, and students logging in from home or school labs.
- **Key Value**: Eliminates password mismatch discrepancies between local development databases and the live Supabase cloud, providing effortless, predictable access for all stakeholders.

---

## 2. User Experience & Visual Design

- **Student & Staff Login Flow**:
  1. User enters their identifier (Roll Number, Mobile Number, Username, or Email).
  2. User enters `Sunshine123` (or `sunshine123`).
  3. Authentication succeeds on the first attempt without case mismatch errors.
  4. Direct navigation to their respective role dashboard with no forced password change modal.

- **Admin Password Sync Action**:
  - The Admin Database & System Settings tab includes a visible, dedicated trigger button:
    - Label: `"Sync All Passwords to Sunshine123"`
    - ID: `id="btn-sync-all-passwords"`
    - Action: Invokes `/api/admin/sync-passwords`, displaying a real-time progress toast and summary (e.g. `"Successfully synced 28 user accounts to Sunshine123 in Supabase Auth & PostgreSQL"`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Case Normalization vs Strict Single-Case**
  - *Chosen Approach*: Accept both `Sunshine123` and `sunshine123` by evaluating both hashed variants in `PasswordService.comparePassword` and `AuthProvider.login`.
  - *Why*: Young students on mobile phones often experience auto-capitalization on the first letter (producing `Sunshine123`), while desktop typing often stays lowercase (`sunshine123`). Accepting both eradicates login failure tickets.
  - *Alternatives Considered*: Enforcing strict case sensitivity (rejected: frustrates students and parents).

- **Decision 2: Automated Cloud Batch Synchronization vs Passive On-Demand Updates**
  - *Chosen Approach*: Execute an authoritative batch synchronization script using `serverSupabase.auth.admin.updateUserById` for all users in the Supabase project, paired with an atomic `users` table update.
  - *Why*: Guarantees that any user logging in with Google Auth or direct email/password immediately matches credentials in the real-world cloud.
  - *Alternatives Considered*: Updating passwords only when a user logs in (rejected: leaves dormant or faculty accounts desynchronized in Supabase).

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    UNIVERSAL PASSWORD SYNCHRONIZATION FLOW                   │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                  scripts/sync-all-passwords-supabase.ts                      │
│                  POST /api/admin/sync-passwords                              │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     SUPABASE AUTH ADMIN       │             │   POSTGRESQL & LOCAL CACHE    │
│  serverSupabase.auth.admin    │             │  serverSupabase.from('users') │
│  .listUsers()                 │             │  - Update password_hash       │
│  .updateUserById(id, {        │             │  - must_change_password=false │
│    password: 'Sunshine123'    │             │  SEED_USERS & SEED_STUDENTS   │
│  })                           │             │  - Synchronize default hashes │
└───────────────────────────────┘             └───────────────────────────────┘
```

### Affected Files & Components

1. **Seed Data (`src/data.ts`)**:
   - Update `password` and `passwordHash` for all entries in `SEED_USERS` to `Sunshine123`.

2. **Backend Authentication & Controllers (`src/server/auth/PasswordService.ts`, `server.ts`, `AuthController.ts`)**:
   - Update `defaultPass` to `'Sunshine123'`.
   - Update `comparePassword` to recognize both `'Sunshine123'` and `'sunshine123'`.
   - Expose `POST /api/admin/sync-passwords` with role protection (`SUPER_ADMIN` / `ADMIN`).

3. **Frontend Authentication (`src/auth/AuthProvider.tsx`, `src/pages/Login.tsx`)**:
   - Update valid password lists to prioritize `Sunshine123` alongside `sunshine123`.
   - Update login placeholder and helper text to: `"Default: Sunshine123"`.

4. **Synchronization Script (`scripts/sync-all-passwords-supabase.ts`)**:
   - Automated CLI script using tsx to fetch all cloud users and update their passwords to `Sunshine123`.

---

## 5. Implementation Steps & Verification Checklist

### Phase 1: Core Password Standardization & Dual-Case Logic
- [x] Update `SEED_USERS` in `src/data.ts` to use `Sunshine123`.
- [x] Update `PasswordService.comparePassword` and `simpleSecureHash` to validate `Sunshine123` and `sunshine123`.
- [x] Update `server.ts` and `AuthController.ts` default passwords and admission generation to `Sunshine123`.
- [x] Update `src/auth/AuthProvider.tsx` and `src/pages/Login.tsx` labels and placeholders.

### Phase 2: Live Supabase Cloud Sync Endpoint & Automation Script
- [x] Build `scripts/sync-all-passwords-supabase.ts` utilizing `serverSupabase.auth.admin`.
- [x] Implement `POST /api/admin/sync-passwords` endpoint in `server.ts` with audit logging.
- [x] Execute `npx tsx scripts/sync-all-passwords-supabase.ts` to sync live Supabase Auth accounts.

### Phase 3: Verification & Security Testing
- [x] Test login for student, teacher, and admin accounts using `Sunshine123`.
- [x] Test login using `sunshine123` to confirm dual-case flexibility.
- [x] Run full project compilation (`compile_applet`) and security audit test matrix (`scripts/security-audit-test.ts`).
