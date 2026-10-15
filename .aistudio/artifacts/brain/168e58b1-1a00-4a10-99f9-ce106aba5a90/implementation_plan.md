# Storage Quota Error Recovery & Background Cache Optimization Plan

Fix the `QuotaExceededError: Failed to execute 'setItem' on 'Storage'` crash in Sunshine ERP when saving large offline data to browser `localStorage` (such as `sunshine_users`, `sunshine_students`, `sunshine_fee_statuses`, etc.).

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the error handling and storage retention strategy:
> - **Error Handling Choice**: Safely catch `QuotaExceededError` exceptions, sanitize/strip bloated base64 data strings (like inline avatars and document previews) from local storage payloads, and prune expired offline cache entries.
> - **UI Maintenance Choice**: Perform silent, automatic background cache cleanup without introducing a manual button to the Admin Dashboard.

## 1. Overview & Core Concept

When syncing large collections (such as `users`, `students`, or `fee_statuses`) from Firestore/backend, calling `localStorage.setItem()` directly can throw an unhandled `QuotaExceededError` once browser storage reaches its ~5MB limit. This unhandled error crashes React state updates during component render (`APP_RENDER_ERROR`).

We will implement a robust storage manager utility (`safeLocalStorage`) and patch `SyncService`, `useCollectionListener`, `AuthProvider`, `useStudentDirectory`, and `App.tsx` to handle quota limits gracefully without interrupting user workflow or crashing the application.

## 2. User Experience & Visual Design

- **Seamless Resilience**: When storage quota is exceeded, the application transparently degrades local persistence to memory cache while continuing full read/write operations against the backend API and memory state.
- **Zero UI Disruptions**: No error banners or `APP_RENDER_ERROR` modal overlays will interrupt student/staff navigation.
- **Silent Storage Hygiene**: Heavy base64 data URLs (e.g. `data:image/...` profile images or file attachments) are automatically omitted from `localStorage` sync representations, storing only light references while preserving full image content in server/memory state.

## 3. Key Product Decisions & Trade-Offs

- **Safe Storage Wrapper (`safeLocalStorage`)**:
  - *Chosen Approach*: Replace raw `localStorage.setItem` calls with a fallback wrapper that catches `QuotaExceededError`, auto-prunes stale logs (`sunshine_audit_logs`, `sunshine_sent_emails`, `sunshine_local_backups_archive`), removes base64 media strings, and falls back gracefully to in-memory state if storage remains full.
  - *Why*: Guarantees zero-crash stability even on constrained mobile web browsers or saturated desktop storage environments.

- **Background Auto-Cleanup Strategy**:
  - *Chosen Approach*: Automatically check local storage size during initialization and run pruning cycles if usage exceeds 80% capacity (4MB), purging temporary logs older than 7 days.
  - *Why*: Keeps storage lean without requiring staff or student intervention.

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────┐
│              Browser Runtime & State                    │
│                                                         │
│   ┌───────────────────┐       ┌─────────────────────┐   │
│   │   SyncService &   │       │  React Hooks &      │   │
│   │ Collection Listener│      │  Auth Provider      │   │
│   └─────────┬─────────┘       └──────────┬──────────┘   │
│             │                            │              │
│             ▼                            ▼              │
│   ┌─────────────────────────────────────────────────┐   │
│   │            safeLocalStorage Wrapper             │   │
│   │  - try / catch QuotaExceededError               │   │
│   │  - Base64 Stripping & Log Pruning               │   │
│   │  - Memory Storage Fallback                      │   │
│   └─────────────────────────┬───────────────────────┘   │
│                             │                           │
│        ┌────────────────────┴──────────────────┐        │
│        ▼                                       ▼        │
│  ┌──────────────┐                     ┌─────────────────┐ │
│  │ localStorage │ (If within 5MB)     │ Memory Fallback │ │ (If quota exceeded)
│  └──────────────┘                     └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Affected System Components

1. **`src/utils/safeLocalStorage.ts`**:
   - Create a safe storage utility wrapped with `try/catch` block for `setItem`, `getItem`, `removeItem`.
   - Implement `stripBase64FromPayload` to clean heavy base64 profile pictures and attachments before caching to disk.
   - Implement `pruneStaleCache` to trim audit logs and archive backups when quota errors occur.

2. **`src/hooks/useCollectionListener.ts`**:
   - Replace raw `localStorage.setItem(storageKey, JSON.stringify(items))` calls with `safeLocalStorage.setItem(storageKey, items)`.

3. **`src/services/SyncService.ts`**:
   - Replace direct `localStorage.setItem` calls during offline sync and collection saves with `safeLocalStorage.setItem`.

4. **`src/auth/AuthProvider.tsx` & `src/App.tsx`**:
   - Replace `localStorage.setItem('sunshine_users', ...)` and session storage writes with `safeLocalStorage`.
