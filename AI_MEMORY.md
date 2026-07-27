# Permanent AI Memory & Architectural Continuity Guide

This file serves as the permanent memory for all AI assistants (Google AI Studio, Cursor, Claude Code, Copilot, or ChatGPT) collaborating on **Sunshine Classes ERP (Sunshine ERP)**. Reading this file ensures complete continuity, visual consistency, and prevents code regressions.

---

## 🧭 Architectural North Star

### 1. Zero-Regression Policy
Never break, disable, or modify:
- **webcam snapshot modules** during student intake.
- **unique username auto-generation** and default passwords (`"Sunshine123"`).
- **immediate login alert popups** on successful approval.
- **twelve-month billing ledgers** generated upon enrollment.

### 2. State Mapping & Synchronizations
All client interactions must route through the centralized Sync manager (`/src/services/SyncService.ts`). 
- Double check bidirectional conversions (`toPostgresRow` and `fromPostgresRow`) to ensure that Firestore camelCase maps correctly to PostgreSQL snake_case rows.

---

## 📋 1. File-to-Feature Mapping

| Feature | Entry / Main Component | Sub-Components | Services | Database Tables / Collections |
| :--- | :--- | :--- | :--- | :--- |
| **Admissions & Intake** | `LandingPage.tsx` | `AdmissionsModule.tsx` | `adminService.ts`, `userService.ts` | `students`, `users` |
| **Fees & Collections** | `ReceptionDashboard.tsx` | `FeeCollectionManager.tsx`, `StudentFeeSettingsView.tsx` | `studentService.ts`, `SyncService.ts` | `fee_statuses`, `fee_receipts` |
| **Fee Alerts & Reminders** | `ReceptionDashboard.tsx` | `FeeReminderManager.tsx`, `WhatsAppNotificationManager.tsx` | `whatsappService.ts`, `gmailService.ts` | `fee_statuses`, `students` |
| **Teacher Workspace** | `TeacherDashboard.tsx` | Attendance grids, test marksheets, materials uploader | `teacherService.ts`, `studyMaterialService.ts` | `teachers`, `attendance`, `marks` |
| **Student Workspace** | `StudentDashboard.tsx` | Homework cards, personal gradebooks, study material downloads | `studentService.ts`, `studyMaterialService.ts` | `students`, `fee_statuses`, `study_materials` |
| **Executive Control** | `AdminDashboard.tsx` | `FinanceDashboard.tsx`, `EnrollmentHealthDashboard.tsx`, `StudentDirectory.tsx` | `adminService.ts`, `SyncService.ts` | `students`, `teachers`, `fee_statuses` |
| **Sunshine Store** | `LandingPage.tsx` | `SunshineStoreShowcase.tsx`, `SunshineStoreAdmin.tsx`, `ProductCard.tsx` | `storeService.ts` | `store_items`, `orders` |
| **Study Materials CMS** | `LandingPage.tsx` | `StudyMaterialCMS.tsx`, `StudyMaterialShowcase.tsx` | `studyMaterialService.ts` | `study_materials` |
| **Inline AI Helper** | `ChatBot.tsx` | Floating widget UI | Server: `POST /api/chat` (Gemini API) | Session-bound cache only |
| **Profile & Security** | Navbars / Sidebars | `UserProfileSecurityModal.tsx`, `ForcePasswordChange.tsx` | `userService.ts` | `users` |

---

## 📂 2. Complete Folder Tree

```text
src/
 ├── auth/                            # Session, Gating, and Security Contexts
 │    ├── AuthContext.ts              # React Authentication Context declaration
 │    ├── AuthProvider.tsx            # Session states & multi-role loading hooks
 │    ├── PermissionService.ts        # Access control & action gating
 │    ├── ProtectedRoute.tsx          # Router wrapping gate for logged-in sessions
 │    ├── RoleGuard.tsx               # Component-level layout RBAC guards
 │    └── useAuth.ts                  # Lightweight state retrieval hook
 ├── components/                      # Modular UI Widgets & Portals
 │    ├── admissions/                 # Intake workflow files
 │    │    └── AdmissionsModule.tsx   # Webcam, form, & onboarding validator
 │    ├── landing/                    # Public website components
 │    │    ├── ContactSection.tsx     # Contact details map & links
 │    │    ├── CoursesSection.tsx     # Active syllabus list cards
 │    │    ├── EcosystemFeatures.tsx  # Product feature displays
 │    │    ├── FAQSection.tsx         # Collapsible accordion answers
 │    │    ├── FacultySection.tsx     # Teacher introduction cards
 │    │    ├── Footer.tsx             # Standard visual bottom credits
 │    │    ├── HeroSection.tsx        # High-impact image & call-to-actions
 │    │    ├── MobileBottomNav.tsx    # Responsive bottom action menu
 │    │    ├── Navbar.tsx             # Global visual header
 │    │    ├── QuickAccessHub.tsx     # Floating portal links
 │    │    ├── StudyMaterialShowcase.s# Public NCERT note search lists
 │    │    └── SunshineStoreShowcase.s# Public uniforms & textbooks grid
 │    ├── AdminDashboard.tsx          # Founder console, rosters, payroll, audits
 │    ├── ChatBot.tsx                 # Pop-up assistant panels (Gemini API)
 │    ├── CloudinaryUpload.tsx        # Camera viewports & media file upload triggers
 │    ├── EnrollmentHealthDashboard.t # New registrations charts & visual widgets
 │    ├── FeeCollectionManager.tsx    # Cashier transactional input form
 │    ├── FeeReminderManager.tsx      # Multi-channel reminder manager
 │    ├── FeeStructureManager.tsx     # Class-wise standard pricing configurations
 │    ├── FinanceDashboard.tsx        # Global earnings analytics, Recharts lines
 │    ├── ForcePasswordChange.tsx     # Default security update workflow
 │    ├── GmailHub.tsx                # Reception newsletter & mail scheduler
 │    ├── LandingPage.tsx             # Unified public marketing website
 │    ├── MailSimulatorWidget.tsx     # Local SMTP log validator
 │    ├── MediaUploader.tsx           # Document & homework uploader
 │    ├── ProductCard.tsx             # Standardized e-commerce item displays
 │    ├── ReceptionDashboard.tsx      # Receipt compilers, fee status managers
 │    ├── SEOHead.tsx                 # Meta tags manager (React Helmet wrapper)
 │    ├── StudentDashboard.tsx        # Pupil marks, homework, schedules
 │    ├── StudentDirectory.tsx        # Searchable, filterable student lists
 │    ├── StudentFeeSettingsView.tsx  # Customize target monthly fee parameters
 │    ├── StudentProfile.tsx          # Read-only student ID card layout
 │    ├── StudyMaterialCMS.tsx        # Staff uploader for NCERT files
 │    ├── SunshineLogo.tsx            # Styled vector brand svg logo
 │    ├── SunshineStoreAdmin.tsx      # Inventory, stocking, & order desks
 │    ├── TeacherDashboard.tsx        # Attendance logs, marks grids, uploads
 │    ├── UserProfileSecurityModal.tsx# Password reset & security logs modal
 │    ├── WebsiteManagementSystem.tsx # Public content customizers
 │    ├── WhatsAppCommunication.tsx   # Direct parent contact drawer
 │    ├── WhatsAppIcon.tsx            # Visual brand floating icon
 │    └── WhatsAppNotificationManager.# Bulk text blast controls
 ├── data/                            # Static Mock and Fallback Datasets
 │    └── data.ts                     # Predefined course schedules & FAQs
 ├── hooks/                           # Shared Global Hooks
 │    └── useCollectionListener.ts   # Live real-time Firestore listeners
 ├── lib/                             # Core Integration SDK Init Scripts
 │    ├── cloudinaryService.ts        # Cloudinary client endpoints config
 │    ├── feeUtils.ts                 # Billing ledger automatic generator
 │    ├── firebase.ts                 # Firebase Auth & Firestore client
 │    ├── paymentProviders.ts         # Payment gateway helper libraries
 │    ├── pdfGenerator.ts             # Dynamic jsPDF receipt compiler
 │    ├── permissions.ts              # Permission map definitions
 │    ├── supabase.ts                 # Supabase PostgreSQL client init
 │    └── whatsappService.ts          # Front-end WhatsApp formatters
 ├── pages/                           # Screen Containers (if any)
 ├── server/                          # Back-end Server Configurations
 ├── services/                        # Business Layer Logic
 │    ├── SyncService.ts              # Centralized Dual-Database Sync Engine
 │    ├── adminService.ts             # Admissions & payroll APIs
 │    ├── cloudinaryService.ts        # Server signature upload endpoints
 │    ├── firestoreDbService.ts       # Specialized Firestore query hooks
 │    ├── gmailService.ts             # SMTP email formatting & dispatchers
 │    ├── initDbService.ts            # Local cache database instantiations
 │    ├── mediaService.ts             # Photo file sync processes
 │    ├── storeService.ts             # Order processing state triggers
 │    ├── studentService.ts           # Grades and invoice retrievals
 │    ├── studyMaterialService.ts     # CMS storage uploads & catalogs
 │    ├── teacherService.ts           # Class schedules and salary listings
 │    ├── userService.ts              # Users records, pass hash, RBAC loaders
 │    └── whatsappService.ts          # Outbound Twilio WhatsApp trigger APIs
 ├── types/                           # Static Type Definitions
 ├── utils/                           # Secondary Math / Date Helpers
 ├── App.tsx                          # App Entrypoint, Central Routing & State Orchestrator
 ├── index.css                        # Global Tailwind CSS Stylesheet
 ├── main.tsx                         # DOM mounting, Vite client index
 ├── serviceWorkerRegistration.ts    # Service Worker for offline support
 └── types.ts                         # Master single-source-of-truth type definitions
```

---

## 🔀 3. Service Dependency Graph

Below is the flow of transactional operations across the ecosystem:

### Core Data & Database Sync Flow
```text
┌────────────────────────────────────────────────────────┐
│               UI View Layer Component                  │
│       (e.g., Admissions Form or FeeCashierDesk)        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Domain Specific Service Layer              │
│       (e.g., studentService.ts or adminService.ts)      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│              SyncService (Master Engine)               │
│  • Manages client-side local cache state instantly     │
│  • Performs model validation & schema mappings         │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
                ▼ (Branch: main)         ▼ (Branch: supabase-migration)
┌────────────────────────┐      ┌────────────────────────┐
│     Cloud Firestore    │      │  Supabase PostgreSQL   │
│  Direct Web SDK connection     │  Direct SQL connection  │
└────────────────────────┘      └────────────────────────┘
```

### Authentication & Gating Architecture
```text
                       ┌────────────────────────┐
                       │  Firebase Auth Server  │
                       └───────────┬────────────┘
                                   │  (Identity Session Token)
                                   ▼
                       ┌────────────────────────┐
                       │      AuthProvider      │
                       │   (React context api)  │
                       └───────────┬────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
        ┌───────────────────────┐     ┌───────────────────────┐
        │      ProtectedRoute   │     │       RoleGuard       │
        │   (Router gate block) │     │  (Component rendering)│
        └───────────┬───────────┘     └───────────┬───────────┘
                    │                             │
                    ▼                             ▼
         [ Screen / View Allowed ]      [ Active UI Items Checked ]
```

---

## 🔒 4. Environment Checklist

Ensure the following variables are maintained. Never push plain secrets to `.env.example`.

### Required (Core Platform Operations)
- `GEMINI_API_KEY`: Required server-side for the Inline Helper Chatbot (`/api/chat`).
- `VITE_FIREBASE_API_KEY`: Client Google Firebase web configuration.
- `VITE_FIREBASE_AUTH_DOMAIN`: Client authentication namespace index.
- `VITE_FIREBASE_PROJECT_ID`: Target cloud-platform workspace project ID.
- `VITE_FIREBASE_STORAGE_BUCKET`: Asset upload cloud directory.
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Message handler registration.
- `VITE_FIREBASE_APP_ID`: Master app ID index.

### Optional / Migration Target (Supabase Core)
- `VITE_SUPABASE_URL`: Supabase project database connection gateway url.
- `VITE_SUPABASE_ANON_KEY`: Public anonymous secure API access key.

### Outbound Communication (Server-Side SMTP & Messaging)
- `TWILIO_ACCOUNT_SID`: Admin credentials for twilio messaging clients.
- `TWILIO_AUTH_TOKEN`: Twilio client secret token keys.
- `TWILIO_WHATSAPP_NUMBER`: Valid sender whatsapp profile identification number.
- `SMTP_HOST`: Production mail host (e.g. `smtp.gmail.com`).
- `SMTP_PORT`: Mail protocol delivery ports (`465` or `587`).
- `SMTP_USER`: Sender authentication address account.
- `SMTP_PASS`: App password string generated via administrative portals.

### Production Specific
- `NODE_ENV`: Set to `production` in live containers.
- `PORT`: Hardcoded by cloud reverse-proxies to `3000`.

---

## 🚀 5. Current Development Priorities

These parameters represent the active target roadmap for developers and AI assistants:

```text
  HIGH PRIORITY (Active Migration & Security Validation)
  ├── 1. Finish Supabase Migration (Complete Phase 2 & Phase 3 of the MIGRATION_PLAN)
  │    ├── Route students, teachers, and fee_statuses completely through Supabase client
  │    └── Implement dual-verification writes to verify data parity between Firestore & SQL
  ├── 2. Enforce Strict DB RLS policies inside Supabase PostgreSQL environment
  └── 3. Implement ForcePasswordChange modal triggers on active student first-logins
  
  MEDIUM PRIORITY (Communications & Payments Setup)
  ├── 1. Setup online automated Payment Gateways (Razorpay or Stripe APIs)
  ├── 2. Incorporate Twilio WhatsApp business-profile approvals to remove sandbox restrictions
  └── 3. Setup real-time incoming WhatsApp webhook bots to answer parental queries
  
  LOW PRIORITY (Syllabus & SEO tuning)
  ├── 1. Upload comprehensive NCERT syllabus catalog notes under CMS folders
  └── 2. Optimize SEO metadata descriptions using React Helmet
```

---

## 📝 6. AI Architectural Decision Log

Documentation of critical architectural decisions to maintain context:

### Decision #1: Preserve the `SyncService` Orchestrator
- **Reason**: The master state synchronization service (`SyncService.ts`) handles caching, conversions, validation, and real-time dispatches. Preserving it prevents having to modify hundreds of separate UI dashboard files, maintaining standard decoupled interfaces.

### Decision #2: Dual-Fallback Synchronous Database Mode
- **Reason**: During the transition to Supabase, writing to both Cloud Firestore and Supabase PostgreSQL with a fallback flag allows zero-downtime testing. If Supabase features are disabled or error-out, transactions seamlessly fall back to Firestore.

### Decision #3: Mirror Webcam Portraits inside Client Canvas
- **Reason**: Standardizing WebRTC mirrors to run on client canvases ensures that portraits align visually with on-screen green focal guidelines, resolving uneven captures on mobile Safari devices.

### Decision #4: Keep Gemini Models and SMTP Private
- **Reason**: Restricting Gemini models and transactional SMTP mail distributions to server-side routers under `/api/*` keeps sensitive master tokens, account identifiers, and application secrets safe from DevTools scanners.
