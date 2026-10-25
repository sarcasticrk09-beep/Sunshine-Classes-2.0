# Self-Service Password Recovery & Streamlined Login Portal Plan

Establish a secure self-service password recovery flow for students and faculty while decluttering the Sunshine Classes ERP login terminal to create a clean, distraction-free authentication experience.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product specifications were confirmed during the clarification step:

* **Password Recovery Flow**: Students and staff will request a **secure 6-digit verification code sent to their registered contact/email or roll number**, verify the code, and immediately set a compliant new password (minimum 6 characters with letters and numbers).
* **Login Portal Streamlining & De-Cluttering**:
  1. **Remove default password hints**: Eliminate all hardcoded `Default: Sunshine123` labels and new admission password notes to avoid confusing existing users and disclosing credentials in plain sight.
  2. **Remove telemetry & sync status badges**: Remove `<SyncStatusBadge />` and bottom encrypted-session status bars from the login screen in compliance with clean UI standards.
  3. **Remove browser Supabase keys modal & dev notes**: Strip out runtime browser API key configuration forms and Railway dev instructions so regular parents and students see a pure, professional portal.
  4. **Preserve Google Sign-In**: Maintain Google OAuth for registered institutional accounts.

---

## 1. Overview & Core Concept

* **What It Does**: Provides an intuitive multi-step password recovery workflow on the login page (`authMode = 'forgot-password'`) allowing students, parents, and faculty who forgot their password to self-recover without manual administrative intervention, while streamlining the login surface into a focused, modern interface.
* **Target Audience**: Students, parents, teachers, and administrators accessing Sunshine Classes ERP across mobile and desktop devices.
* **Key Value**: Drastically reduces support requests for forgotten credentials while eliminating dev/telemetry artifacts from public login screens.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[Login Screen] ──▶ Click "Forgot Password?" ──▶ [Step 1: Contact Identifier]
                                                         │
                                                  (Enter Roll No/Email)
                                                         ▼
[Login Screen] ◀── Password Updated ◀── [Step 2: Enter 6-Digit Code & New Pass]
```

1. **Clean Login View**:
   - The user sees clean fields for Roll No / Email / Mobile and Password, with a subtle "Forgot Password?" button positioned right above or beside the password input (`id="btn-forgot-password"`).
   - Removed: all `Default: Sunshine123` hints, sync badges, compliance banners, and developer key inputs.
   - Clean placeholder: `Enter your password` instead of mentioning default test credentials.

2. **Step 1: Password Recovery Request**:
   - Title: "Reset Your Password" with an explanatory subtitle: "Enter your registered Roll Number, Email, or Mobile to receive a verification code."
   - Input: Identifier field (`id="forgot-identifier-input"`).
   - Action: "Send Verification Code" (`id="btn-send-reset-code"`), with a smooth loading spinner state.
   - Secondary: "Back to Sign In" (`id="btn-back-to-login"`).

3. **Step 2: Code Verification & Password Reset**:
   - Input: 6-digit verification code input with letter-spaced typography (`id="forgot-code-input"`).
   - Input: New password with show/hide toggle (`id="forgot-new-password"`).
   - Input: Confirm password (`id="forgot-confirm-password"`).
   - Real-time client-side validation for minimum 6 characters with letters and numbers.
   - Action: "Reset Password & Log In" (`id="btn-submit-reset-password"`).
   - Success transition: Displays green confirmation banner and automatically returns the user to login or logs them directly into their portal.

### Visual Styling & Accessibility
* **Theme & Colors**: Retains Sunshine ERP's brand colors (Amber-500 `#f59e0b` / Brand Blue `#1e40af` and crisp neutral slate canvas).
* **Anti-Slop Discipline**: No decorative pulsing dots, no code-comment titles, no nested card shadows, and no telemetry tickers.
* **Interactive Element ID Compliance**: All newly introduced inputs, buttons, and error/success alerts will possess explicit, lowercase unique IDs (`id="btn-forgot-password"`, `id="btn-send-reset-code"`, `id="btn-submit-reset-password"`, `id="forgot-code-input"`).

---

## 3. Key Product Decisions & Trade-Offs

* **Decision 1: Verification Code Architecture**:
  - *Chosen Approach*: Server generates a cryptographically secure 6-digit numeric OTP with a 15-minute TTL, stored in the server session/verification store and synchronized across memory/Supabase. In development preview environments, the generated code is also returned in the response payload and logged, ensuring zero testing blockers if external SMTP gateways are unconfigured.
  - *Why*: Provides robust verification without external provider dependency failures.
* **Decision 2: Seamless Tab Integration**:
  - *Chosen Approach*: Embed the forgot password workflow as a mode state (`authMode = 'login' | 'register' | 'forgot-password'`) inside `Login.tsx` rather than forcing a heavy full-page routing transition.
  - *Why*: Smooth, single-page transition with instant return to Sign In, fully preserving mobile drawer layouts and desktop frame bounds.
* **Decision 3: Complete Removal of Developer Modals from Login**:
  - *Chosen Approach*: Remove the inline Supabase configuration modal and Railway variables card from the client login page.
  - *Why*: Exposing raw API keys, textareas, and hosting configuration in a client login interface breaches UI hygiene and presents a confusing experience to students and parents.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│                                                             │
│   ┌───────────────┐     ┌───────────────────────────────┐   │
│   │  Login Form   │ ──▶ │ Forgot Password Flow (Mode)   │   │
│   └───────────────┘     │ - Step 1: Identifier Input    │   │
│                         │ - Step 2: OTP + New Password  │   │
│                         └───────────────┬───────────────┘   │
└─────────────────────────────────────────┼───────────────────┘
                                          │
                  POST /api/auth/forgot-password (Identifier)
                  POST /api/auth/reset-password-with-code
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Express Backend                        │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ AuthController                                      │   │
│   │ - requestPasswordReset(identifier)                  │   │
│   │   * Resolve user/student record                     │   │
│   │   * Generate 6-digit code with 15-min expiration    │   │
│   │   * Store in memoryStore.resetCodes                 │   │
│   │ - verifyAndResetPassword(identifier, code, newPass) │   │
│   │   * Validate 6+ chars & letters+numbers             │   │
│   │   * Hash via bcrypt (PasswordService)               │   │
│   │   * Update Supabase users, SEED_USERS, local store  │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Components to Update
1. **`src/server/auth/AuthController.ts`**:
   - Add `requestPasswordReset(req, res)`: Public endpoint accepting `{ identifier }`. Resolves student/user record, generates 6-digit code with timestamp, stores in `memoryStore.resetCodes`.
   - Add `resetPasswordWithCode(req, res)`: Public endpoint accepting `{ identifier, code, newPassword }`. Validates complexity, verifies OTP validity, hashes password, and updates user records.
2. **`src/server/index.ts` / `server.ts`**:
   - Register public routes:
     - `POST /api/auth/forgot-password`
     - `POST /api/auth/reset-password-with-code`
3. **`src/auth/AuthProvider.tsx`**:
   - Add helper methods `requestPasswordReset(identifier)` and `resetPasswordWithCode(identifier, code, newPassword)` to context.
4. **`src/pages/Login.tsx`**:
   - Add `"Forgot Password?"` trigger button next to the password label.
   - Implement the two-step interactive reset card.
   - Clean up login interface: remove `<SyncStatusBadge />`, remove compliance badges, remove all default password hints, and remove Supabase configuration dev modal and buttons.
