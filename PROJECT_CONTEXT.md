# Project Context: Sunshine Classes ERP

## 🏫 About Sunshine Classes
Sunshine Classes is a premier educational coaching institute dedicated to providing top-tier academic coaching and comprehensive test preparation. The Sunshine Classes ERP is a bespoke administrative platform engineered to manage the entire educational lifecycle of the institute.

---

## 🎯 Business Goals & Operational Scope
The system coordinates and digitizes all key administrative and pedagogical workflows of the institute:

1. **Digital Admissions**: Streamlines onboarding with a public enrollment form and real-time webcam photo capture for student profile registration.
2. **Attendance Management**: Multi-role tracking (student attendance logged by teachers, staff attendance logged by administrators) visualized with rich analytics.
3. **Fee & Ledger Management**: Automated class-wise monthly billing, fee transaction records, partial collections, and instant PDF receipts.
4. **Academic Results**: A digital gradebook allowing teachers to grade periodic tests and students to track their progress metrics.
5. **Study Materials**: Centralized repository of downloadable study materials, NCERT solution notes, and homework worksheets.
6. **Sunshine Store**: Integrated digital shop for purchasing uniforms, textbooks, and academic stationary.
7. **Analytics Telemetry**: Centralized statistics tracker showing active rosters, payroll audits, and institute-wide financials.
8. **Future Mobile App Integration**: Architecture prepared to host native mobile wrapper applications.

---

## 🖥️ System Portals and Workspaces

- **Public Website & Intake**: The public landing page serves as the digital storefront where prospective students search study notes, review courses, and submit digital admissions forms.
- **Admin & Founder Panel**: Unified executive suite with global finances, audit logs, payroll configuration, teacher registrations, and class assignments.
- **Reception Workspace**: Front-desk cashier desk for manual fee collection, student search directory, admission processing, and subscription limits.
- **Teacher Workspace**: A specialized dashboard for marking attendance grids, uploading digital resources/homework, and grading period marksheets.
- **Student & Parent Portal**: Student workspace for completing online homework, downloading study notes, reviewing personal timetables, tracking paid/pending fee records, and asking the Gemini AI Chatbot helper.

---

## ⚠️ Important Rules & Safety Mandates (Absolutely Non-Negotiable)

To preserve the production baseline and avoid disruptive over-engineering, any developer or AI assistant working on this codebase must strictly observe these rules:

1. **Never Redesign the UI**: The current user interface is our stable, proven production baseline. Do not change colors, layouts, margins, or fonts unless explicitly requested.
2. **Preserve Branding**: Always preserve the branding, visual hierarchy, logos (`SunshineLogo`), and the designated palette.
3. **Keep Workflows Unchanged**: Ensure student onboarding, fee calculations, and permission gates continue working exactly as defined in the master state orchestrator.
4. **Never Remove Features**: Under no circumstances should active features, widgets (like the Webcam Capture, AI Chatbot, or Twilio WhatsApp notifications), or API endpoints be disabled, bypassed, or deleted without explicit owner approval.
5. **Maintain Constant Compilability**: Always run `lint_applet` and `compile_applet` before ending your turn to guarantee the branch is production-ready.
