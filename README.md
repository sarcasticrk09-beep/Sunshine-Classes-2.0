# Sunshine Classes ERP (Sunshine ERP)

Welcome to the **Sunshine Classes ERP (Sunshine ERP)** platform, a unified, production-grade administrative ecosystem and educational portal built to manage student lifecycles, fee collection cycles, multi-role dashboards, student performance, staff operations, and digital assets for **Sunshine Classes**.

The application operates as a full-stack Node.js + Express application hosting a live React frontend. This setup supports complete offline capabilities via local caching, camera viewfinder integrations for real-time portraits, secure automated messaging via WhatsApp and SMTP, and an inline Gemini AI Chatbot helper.

---

## 🚀 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React (v18+) | Component-driven declarative UI |
| **Tooling** | Vite (v5+) | Fast compilation and hot module bundling |
| **Styling** | Tailwind CSS (v4+) | Utility-first, fluid responsive styling |
| **Routing** | React Router DOM (v6+) | Client-side routing and session guards |
| **Animations**| Motion (v11+) | Fluid page and interactive animations |
| **Icons** | Lucide React | Modern vector icon pack |
| **Charts** | Recharts & D3 | Financial analytics, attendance graphs |
| **Backend** | Express + Node.js (v20+) | Secure REST APIs and asset delivery |
| **Database** | Firebase Firestore (v10+) | Durable, real-time cloud persistence (migrating to Supabase) |
| **Auth** | Firebase Auth / Supabase Auth | Identity provider & role management |
| **Storage** | Cloudinary / Supabase Storage | Document uploads & webcam portraits |

---

## 📂 Repository Structure

The project conforms to a highly professional, modular layout:

```text
/
├── README.md                   # Project overview, tech stack, setup instructions
├── PROJECT_CONTEXT.md          # Business identity, core operations, operational rules
├── ARCHITECTURE.md             # System, network, data, and session flows
├── AGENTS.md                   # Strict guidelines and type safety directives for AI assistants
├── MIGRATION_PLAN.md           # Step-by-step Firebase to Supabase transition checklist
├── CHANGELOG.md                # Historic releases and incremental changes
├── CONTRIBUTING.md             # Git branch workflows and coding standards
├── AI_MEMORY.md                # Permanent AI assistant contextual memory
├── .env.example                # Blank configuration template for secrets
├── package.json                # Dependencies, compile scripts, and run parameters
├── server.ts                   # Unified Express entry point with Vite middleware hooks
├── docs/                       # Comprehensive modular documentation
│   ├── API.md                  # Detailed endpoint payload specs
│   ├── DATABASE.md             # Entity schemas, index tables, and RLS policies
│   ├── FEATURES.md             # Detailed product capabilities and webcam logic
│   ├── ROADMAP.md              # Project status tracker and future releases
│   ├── KNOWN_BUGS.md           # Outstanding defects, prioritizations, and workarounds
│   └── DEPLOYMENT.md           # Cloud Run and standalone hosting configuration
├── supabase/                   # Supabase migrations, seed files, and schemas
├── src/                        # React Frontend Source
│   ├── main.tsx                # Client initialization entry point
│   ├── App.tsx                 # Master state orchestrator and central router
│   ├── types.ts                # TypeScript interfaces (Single Source of Truth)
│   ├── auth/                   # React session context managers
│   ├── components/             # Reusable UI dashboards and visual elements
│   ├── lib/                    # SDK initializations and client utilities
│   └── services/               # Outbound integrations (Cloudinary, WhatsApp, SMTP)
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js**: v20+ (LTS recommended)
- **npm**: v10+
- **Git**: v2.40+

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/sarcasticrk09-beep/Sunshine-Classes.git
cd Sunshine-Classes
npm install
```

### 3. Environment Variables
Copy the template and populate it with your local development keys (Firebase, Cloudinary, Twilio, and SMTP):
```bash
cp .env.example .env
```

### 4. Running the App
Launch the unified full-stack server on Port 3000:
```bash
npm run dev
```
Open `http://localhost:3000` to interact with the application.

### 5. Compiling & Building
Build frontend static assets and bundle the backend using `esbuild` to verify zero compile warnings:
```bash
npm run build
```
Start the standalone compiled package:
```bash
npm run start
```

---

## 🔒 Security and Permissions

All state changes on client reads/writes are guarded by:
1. **Role-Based Access Control (RBAC)**: Defined inside `/src/types.ts` and gated inside `/src/App.tsx`.
2. **Database Security Rules**: Enforced at the cloud level (e.g., Firestore rules and Postgres RLS).
3. **Cryptographic Credentials**: Enforced via `simpleSecureHash` with `sha256_` prefix strings on client/server.
