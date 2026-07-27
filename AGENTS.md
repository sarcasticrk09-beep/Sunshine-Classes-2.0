# Coding and Communication Instructions for Sunshine ERP

This file serves as the strict, permanent system instruction overlay for all AI coding assistants (such as Antigravity, Gemini, or Claude) collaborating on the **Sunshine Classes ERP (Sunshine ERP)** repository.

---

## 1. Core Development Rules (Pre-Flight Directives)

Any AI assistant modifying this codebase must adhere strictly to these 12 rules:

1. **Never Redesign the UI**: The user interface is our stable, proven production baseline. Do not make cosmetic, sizing, layout, or structural design changes without explicit permission.
2. **Preserve Branding**: Retain all logos (`SunshineLogo`), designated brand palettes, typography settings, and visual hierarchies.
3. **Preserve Navigation**: Do not modify sidebar layouts, navigation tabs, drawer structures, or role-based dashboard links.
4. **Explain Changes Before Editing**: Provide a brief, single-sentence summary of your intended modifications immediately before calling file-editing tools.
5. **Analyze Before Modifying**: Always read the existing code files completely using `view_file` to grasp target structures before making any edits.
6. **Fix Root Causes**: When debugging, investigate structural issues (such as state, types, or service limits) rather than applying band-aid patches.
7. **Avoid Duplicate Code**: Keep all code modular, dry, and reusable. Do not copy-paste logic blocks or create redundant utility files.
8. **Use SyncService**: Always route database transactions (reads, lists, updates, inserts, deletes) through the centralized state-synchronization manager (`/src/services/SyncService.ts`).
9. **Use TypeScript Strict Mode**: Write fully-typed code. Avoid using `any` type overrides, handle undefined parameters defensively, and ensure compile safety.
10. **Make Small commits**: Make logical, atomic updates corresponding to target features instead of one massive, combined file modification.
11. **Never Remove Features Without Approval**: Do not disable, deprecate, or delete existing features, helpers, visual indicators, or backend endpoints.
12. **Keep Project Production-Ready**: Keep code compilable at all times. Verify your changes immediately by running `lint_applet` and `compile_applet`.

---

## 2. Database Type Safety & Schema Boundaries

To prevent compilation and runtime errors, you must respect these type definitions from `/src/types.ts`:

- **Student Object Properties**:
  - Use `student.preferredBatch` (type string) for the student's batch name.
  - Do **NOT** use `student.batchId`.
  - Use `student.rollNo` or `student.id` for student identification.

- **Teacher Object Properties**:
  - Use `teacher.specialty` (type string[]) for the teacher's subject list or specializations.
  - Do **NOT** use `teacher.subject` as a direct string.
  - Use `teacher.qualification` (type string) and `teacher.name` (type string).

- **FeeStatus Object Properties**:
  - Contains billing cycle info: `fee.month` (e.g., 'June 2026', 'July 2026'), `fee.totalFee`, `fee.paidFee`, `fee.pendingFee`, `fee.status` ('PAID' | 'PENDING' | 'PARTIAL'), and `fee.dueDate` (string formatted 'YYYY-MM-DD').

---

## 3. Communication and Summary Directives

To maximize cooperation and ensure clean handovers:
- **Prioritize Code**: Focus on compiling, fully working code blocks over lengthy explanations.
- **Answer Conciseness**: Keep final summaries to **1-2 short, highly scannable paragraphs** or **2-3 direct, elegant bullet points**.
- **Hide Internal Paths**: Avoid listing internal file paths or raw components in final summaries unless explicitly asked.
- **Avoid Hype**: Speak objectively and professionally. Do not use self-praising or marketing buzzwords ("stellar", "gorgeous", "flawless", "supercharge").
- **Interactive Element ID rule**: Ensure every newly created button, input, checkbox, or modal container has an explicit, unique, and lowercase `id` attribute (e.g., `id="btn-confirm-attendance"`).
