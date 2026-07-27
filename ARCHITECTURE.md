# Architecture Guide: Sunshine ERP

This document describes the architectural layout, data pipelines, session mechanics, and structural constraints of **Sunshine ERP**.

---

## 1. High-Level System Architecture

Sunshine ERP is built as a unified **full-stack Express + Vite containerized application** hosted on Port 3000. 

```text
       [ Web Browser Client / React SPA ]
                       │
                       ▼ (Port 3000)
             [ Nginx Reverse Proxy ]
                       │
                       ▼ (Port 3000)
    [ Unified Express Backend Server (server.ts) ]
        ├── Dev: Vite Live Middleware (HMR Disabled)
        └── Prod: Static Bundle Serving (dist/index.html)
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   [ API Router: /api/* ]   [ Direct Web SDK Integrations ]
   ├── /api/chat (Gemini)   ├── Firebase Auth (Identity)
   ├── /api/send-email      ├── Cloud Firestore (Sync)
   ├── /api/send-whatsapp   └── Supabase Client (Sync V2)
```

### Architectural Flows:
1. **Frontend-to-Backend REST API**: Large operations requiring private environment secrets (e.g. Gemini AI, Nodemailer SMTP mailers, Twilio WhatsApp alerts) are handled via Express server routes mapped under `/api/*`.
2. **Direct Client-to-DB SDK**: Reading/writing database documents is performed directly from the browser using standard web SDK configurations. This dramatically speeds up real-time queries and synchronization.
3. **Dual Sync Strategy**: Local modifications are written to `localStorage` immediately to allow zero-latency UI responses, then synchronized with Cloud Firestore (or Supabase in branch `feature/supabase-migration`).

---

## 2. Frontend Flow (React Architecture)

Our frontend operates on a component-driven declarative rendering model:

```text
[ main.tsx (Entry Point) ]
          │
          ▼
   [ App.tsx (Master Orchestrator, State & Client-Side Router) ]
          │
          ├─► [ useAuth.tsx (React context, Firebase Session, User Metadata) ]
          │
          ├─► [ Global Navigation Frame (Sidebar/Navbar/Theme) ]
          │
          ├─► [ Role-Based Dashboards ]
          │    ├── Founder / Co-Founder Console
          │    ├── Admin Dashboard
          │    ├── Receptionist Cash Desk
          │    ├── Teacher Workspace
          │    └── Student & Parent Dashboard
          │
          └─► [ Shared Modular UI Components & Integrations ]
               ├── Webcam portrait capture (CloudinaryUpload)
               ├── Interactive charts (Recharts & D3)
               └── AI Companion widget (ChatBot.tsx)
```

---

## 3. Client-Side Routing and Security Guards

Routing is handled via **React Router DOM v6** inside `/src/App.tsx`:
- **Public Routes**: Includes the Institute website, Course explorer, NCERT study material directory, and the Admission Enrollment form. No login required.
- **Private/Protected Routes**: Dashboard paths wrapped under `<ProtectedRoute>` hooks that read the current session context.
- **Security Gates**: If the user's mapped `role` from the database does not match the dashboard's role permission boundaries, the router aborts and redirects them to their default landing page.

---

## 4. Authentication Flow

The system supports a dual Google and Simplified Username authentication flow:

```text
                   [ User Logs In ]
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
 [ Google Auth Pop-up ]      [ Simplified Username & Pass ]
 ├── OAuth Token Issued      ├── Check if exists in Auth
 └── Match Email in DB       └── Verify Hashed Pass (simpleSecureHash)
          │                               │
          └───────────────┬───────────────┘
                          ▼
           [ Fetch Role from Database ]
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
   [ STUDENT ]       [ TEACHER ]     [ ADMIN / STAFF ]
   Redirect to       Redirect to       Redirect to
 Student Dashboard Teacher Dashboard  Staff Dashboards
```

---

## 5. State Management & Cache Synchronization

To bypass network latency and provide a fast, offline-first experience, Sunshine ERP uses a **Bidirectional Sync State Engine**:

1. **Local State React Hook**: Primary UI state binds to native React hooks or custom Context providers.
2. **Local Storage Backup**: State snapshots are instantly written into client `localStorage` on every transaction.
3. **Database Synchronization (`SyncService.ts`)**: Changes queue up and write to Cloud Firestore/Supabase via `SyncService` which validates data models, triggers read-after-write verifications, and updates local states reactively.
