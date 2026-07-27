# Changelog: Sunshine ERP

All notable changes to the Sunshine ERP project are documented in this file.

---

## [2.1.1] - 2026-07-27
### Added
- Integrated an automatic OS system preference detector inside `App.tsx` to align initial application themes natively with dark mode preferences.

### Changed
- Redesigned the brand loading splash screen with high-contrast colors and a refined dark background (`#0a0f1d`) to provide a consistent, eye-safe preloading transition.

---

## [2.1.0] - 2026-07-26
### Added
- Created the professional repository documentation hierarchy: `/README.md`, `/PROJECT_CONTEXT.md`, `/ARCHITECTURE.md`, `/MIGRATION_PLAN.md`, `/CHANGELOG.md`, `/CONTRIBUTING.md`, `/AI_MEMORY.md`, and `/docs/` space.
- Integrated the bidirectional Postgres-to-Firestore schema mappings inside `/src/services/SyncService.ts`.
- Configured local-first state mirrors in `/src/services/SyncService.ts` to seamlessly swap backends using simple environment configurations.

### Changed
- Refactored `AGENTS.md` to combine role-based typings with the 12 strict development instructions for AI assistants.

---

## [2.0.0] - 2026-07-25
### Added
- Configured Supabase Client in `/src/lib/supabase.ts` with secure environment loaders.
- Created `supabase/schema.sql` defining full PostgreSQL database tables, relationships, and custom metadata indexes.
- Improved `AuthProvider` to handle multi-role session queries safely.
- Introduced `SyncService` to synchronize front-end UI state changes with both Firestore and PostgreSQL databases.

### Changed
- Refactored Admin Dashboard to streamline rosters, statistics pipelines, and search operations.

---

## [1.1.0] - 2026-07-16
### Added
- Integrated high-resolution device Webcam Portrait capture buttons into the Cloudinary upload modal.
- Configured green visual focus rings and mirrored viewport components for a native camera feel.
- Introduced automated unique Username generations and uniform default passwords (`"Sunshine123"`) during approved enrollments.
- Programmed instant login popup alerts for front-desk registrars and administrators.

---

## [1.0.0] - 2026-06-01
### Added
- Initial full-stack Express + Vite release of Sunshine ERP.
- Completed Core Role-Based Access Controls (Founder, Co-Founder, Admin, Receptionist, Teacher, Student).
- Developed Fee Billing Cycle engine, manual cash desks, client-side printable PDF receipt compilers, and Twilio WhatsApp dispatch APIs.
- Configured cloud integrations: Cloud Firestore, Firebase Authentication, Cloudinary CDN, Nodemailer SMTP, and server-side Gemini Chat bot.
