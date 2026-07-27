# Contributing to Sunshine ERP

Thank you for contributing to **Sunshine ERP**! To maintain a highly stable, production-grade application, we follow a strict branching strategy, clean coding conventions, and mandatory quality controls.

---

## 🌿 Git Branching Strategy

Our repository operates on a clear, role-based Git branching structure:

```text
  [ main ] (Production Baseline - Stable Firebase Version)
     ▲
     │ (Only merged after exhaustive testing)
  [ develop ] (Active Integration & QA)
     ▲
     ├─► [ feature/supabase-migration ] (Database Migration Sandbox)
     ├─► [ feature/payment ] (Payment Gateway Integration)
     ├─► [ feature/store ] (Sunshine Store Modules)
     └─► [ hotfix/enrollment ] (Urgent Production Repairs)
```

### Branch Rules:
1. **`main`**: Represents our production baseline. No direct commits are allowed on `main`. It must remain fully compiled and bug-free.
2. **`develop`**: Where active integrations are consolidated.
3. **Feature Branches (`feature/*`)**: Created for individual modules (e.g. `feature/supabase-migration`). Code must build successfully and be fully tested before merging into `develop`.
4. **Hotfix Branches (`hotfix/*`)**: Created strictly for resolving urgent bugs in production.

---

## 💬 Commit Message Policy

We enforce semantic commit formatting to maintain a highly clear, readable repository log:

- **`feat: <description>`**: Introducing a new capability (e.g. `feat: configure Supabase client`).
- **`fix: <description>`**: Resolving a bug (e.g. `fix: align camera viewport mirror`).
- **`refactor: <description>`**: Editing code structure without changing features (e.g. `refactor: route student lists through SyncService`).
- **`chore: <description>`**: Updating auxiliary dependencies or configurations (e.g. `chore: update env.example`).

---

## 📝 Coding Standards

When creating or modifying components:
1. **Type Safety**: Avoid `any` types. Make use of `/src/types.ts` schemas.
2. **Interactive Elements ID rule**: All new interactive items (buttons, inputs, checklists, or modals) **MUST** feature a unique, explicit, and lowercase `id` attribute.
3. **No Unrequested Changes**: Do not change layouts, branding, color schemes, or core navigation.
4. **Prerequisites Checklist**:
   - Run `npm run lint` to confirm zero formatting errors.
   - Run `npm run build` to confirm successful production compilability.
