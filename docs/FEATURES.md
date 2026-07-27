# Master Feature Specifications: Sunshine ERP

This document contains a comprehensive breakdown of every completed and active feature in **Sunshine ERP**, detailing its purpose, status, file locations, dependencies, and known limitations.

---

## 🛠️ Feature Index

---

### 1. Unified Authentication & Session Gating
- **Purpose**: Provides secure login methods and role-based access restrictions.
- **Current Status**: COMPLETE
- **Files Involved**:
  - `/src/auth/useAuth.tsx` (React session wrapper)
  - `/src/App.tsx` (Client router and navigation guards)
  - `/src/lib/firebase.ts` (Firebase Auth Initialization)
- **Dependencies**: `firebase/auth`, `react-router-dom`
- **Known Limitations**: Users must match database email indexes to access dashboard views.

---

### 2. Manual and Online Admission Onboarding
- **Purpose**: Manages prospects registering online or front-desk intakes. Auto-provisions credential listings and fee ledger status tables upon approvals.
- **Current Status**: COMPLETE
- **Files Involved**:
  - `/src/components/LandingPage.tsx` (Public enrollment form)
  - `/src/components/AdminDashboard.tsx` (Approval queue workspace)
  - `/src/lib/feeUtils.ts` (12-month billing generator)
- **Dependencies**: `@google/genai` (Auto-username validation), `Nodemailer` (SMTP email alerts)
- **Known Limitations**: Roll numbers sequentially increment `rollNo` strings to ensure unique identification indices.

---

### 3. Integrated Device Webcam Photo Capture Module
- **Purpose**: Allows front-desk registrars and applicants to take a live portrait using their webcam during intake.
- **Current Status**: COMPLETE
- **Files Involved**:
  - `/src/components/CloudinaryUpload.tsx` (Viewfinder and capture canvas)
  - `/src/services/cloudinaryService.ts` (Signature uploader pipeline)
- **Dependencies**: Browser WebRTC (`navigator.mediaDevices.getUserMedia`), Cloudinary API
- **Webcam Specifications**:
  - Captures frames from mirrored viewports.
  - Implements a centered green focus circle to assist portrait alignments.
  - Generates optimized `image/jpeg` file blobs for upload.

---

### 4. Interactive Cash Desk & Fee Collection
- **Purpose**: Processes payments via UPI, Cash, Cards, and Checks. Recalculates pending dues and issues print-ready PDF receipts on-screen.
- **Current Status**: COMPLETE
- **Files Involved**:
  - `/src/components/ReceptionDashboard.tsx` (Cashier workstation)
  - `/src/lib/pdfGenerator.ts` (Client receipt PDF compiler)
- **Dependencies**: `jspdf` / `pdfmake` for dynamic PDF assembly
- **Known Limitations**: Receipts must carry distinct invoice serial numbers.

---

### 5. Multi-Role Attendance Grids
- **Purpose**: Logs class attendance for pupils (recorded by teachers) and staff hours (recorded by founders).
- **Current Status**: COMPLETE
- **Files Involved**:
  - `/src/components/TeacherDashboard.tsx` (Class grid)
  - `/src/components/AdminDashboard.tsx` (Teacher check-in rosters)
- **Dependencies**: `recharts` for visualization grids
- **Known Limitations**: Restricts class editing to assigned batches only.

---

### 6. Outbound Twilio WhatsApp Pipeline
- **Purpose**: Dispatches automated homework, alerts, and invoice payment reminders directly to parent mobiles.
- **Current Status**: COMPLETE
- **Files Involved**:
  - `/src/lib/whatsappService.ts` (Text formulator)
  - `server.ts` (Twilio client API endpoint)
- **Dependencies**: `twilio` SDK, Twilio API account
- **Known Limitations**: Requires valid international numbering formats (`+91` etc.).

---

### 7. Online Study Materials Library
- **Purpose**: Centralized downloadable repository of NCERT solution guides, syllabus notes, and active homework worksheets.
- **Current Status**: COMPLETE
- **Files Involved**:
  - `/src/components/LandingPage.tsx` (NCERT Explorer)
  - `/src/components/StudentDashboard.tsx` (Study desk downloads)
  - `/src/components/TeacherDashboard.tsx` (Resource uploader)
- **Dependencies**: Supabase Storage / Cloudinary buckets
- **Known Limitations**: Restricted to PDF, JPEG, and PNG formats.

---

### 8. Inline AI Helper Chatbot Widget
- **Purpose**: Answers user and student queries regarding batch timing, course structures, and coaching schedules.
- **Current Status**: COMPLETE
- **Files Involved**:
  - `/src/components/ChatBot.tsx` (Interactive popup panel)
  - `server.ts` (Server api endpoint: `/api/chat`)
- **Dependencies**: `@google/genai` TypeScript SDK (Gemini Flash)
- **Known Limitations**: Chat history is stored inside client states and resets upon session log-outs.
