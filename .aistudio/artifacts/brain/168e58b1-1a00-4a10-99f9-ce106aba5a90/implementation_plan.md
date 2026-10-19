# Security Hardening & Vulnerability Remediation Plan

Comprehensive remediation blueprint to resolve GitHub Security alerts for **Sunshine Classes ERP (v2.0)**, encompassing CodeQL code scanning vulnerabilities, Dependabot package CVEs, and secret scanning alert mitigation.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the following priorities for this security remediation cycle:
> - **Remediation Priority**: Full remediation across all three categories (CodeQL code scanning, secret scanning alerts, and Dependabot package dependencies).
> - **Sensitive Credential Storage**: Eliminate plain credentials from client `localStorage`, migrating strictly to salted SHA-256 hashes and memory/session state.
> - **Server Request Security**: Implement destination host allowlisting against SSRF and configure `express-rate-limit` across public and administrative API routes.

- **Confirmed Decision 1**: Apply strict IP/domain destination validation on outbound server dispatch calls (`server.ts`) to block Server-Side Request Forgery (SSRF) targeting loopback, metadata services, and internal RFC 1918 subnets.
- **Confirmed Decision 2**: Introduce tiered rate limiters using `express-rate-limit` for public webhooks, authentication endpoints, and student portal routes.
- **Confirmed Decision 3**: Upgrade and audit vulnerable dependencies via `npm audit fix` and targeted `package.json` version constraints for `compression`, `nodemailer`, `qs`, `proxy-addr`, and `body-parser`.
- **Confirmed Decision 4**: Sanitize all dynamic HTML injection points using `DOMPurify` to eradicate DOM-based XSS risks in administrative template previews.

---

## 1. Overview & Core Concept

- **What It Does**: Hardens Sunshine Classes ERP against remote exploitation, unauthorized data extraction, and denial-of-service by fixing all static analysis vulnerabilities identified by GitHub CodeQL, rotating leaked credential references, and updating known vulnerable npm packages.
- **Target Audience / Impact**: Protects student records, billing logs, and administrative credentials from exploitation while ensuring zero disruption to daily attendance, fee receipting, and student portal operations.
- **Key Value**: Closes open GitHub Security advisories, satisfies production compliance benchmarks, and provides defence-in-depth protection across both backend Express services and client-side React storage.

---

## 2. Structural & Architectural Security Posture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SUNSHINE ERP SECURITY PERIMETER                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 1. EDGE & EXPRESS INGRESS (server.ts)                                  │
│  ├── Helmet Content Security Policy & Secure Headers                   │
│  ├── express-rate-limit: Global (300 req/15min) & Auth (15 req/15min)  │
│  ├── Destination Host Allowlist Guard (SSRF Barrier)                   │
│  │    Blocked: 127.0.0.1, localhost, 169.254.169.254, 10.x, 192.168.x │
│  │    Allowed: graph.facebook.com, api.twilio.com, supabase.co        │
│  └── Input Validation & JSON Body Parser Constraints                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. APPLICATION SERVICES (Cloudinary, WhatsApp, Sync)                   │
│  ├── cloudinaryService.ts: new URL(u).hostname strict check           │
│  ├── DOMPurify.sanitize() on all dynamic HTML previews                │
│  └── Safe URL parser routines avoiding regex backtracking             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. CLIENT BROWSER STORAGE & SESSION (App.tsx / AuthProvider.tsx)       │
│  ├── Zero plainPassword or unencrypted token in localStorage           │
│  ├── Salted SHA-256 password hashing for offline credential checks     │
│  └── Sensitive configurations moved to env vars & sessionStorage       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technical Strategy & Vulnerability Analysis

### Category A: CodeQL Code Scanning Alerts

1. **Server-Side Request Forgery (SSRF) (`server.ts` :1240, :1262, outbound dispatches)**:
   - **Root Cause**: Outbound `fetch` operations in notification and recovery endpoints accept dynamic URLs or unvalidated target destinations without hostname verification.
   - **Remediation**:
     - Construct a centralized `safeFetch` / `validateOutboundUrl` helper in `server.ts` that enforces HTTPS and strictly validates destination hostnames against an approved allowlist (`graph.facebook.com`, `api.twilio.com`, `*.supabase.co`, `api.cloudinary.com`).
     - Block loopback (`127.0.0.1`, `::1`), private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and AWS/GCP cloud metadata endpoints (`169.254.169.254`).

2. **Missing Rate Limiting (`server.ts` :1626)**:
   - **Root Cause**: Express routes handling enrollment processing, support tickets, and authentication lacks rate-limiting middleware, exposing endpoints to brute force and resource exhaustion.
   - **Remediation**:
     - Implement tiered rate limiters using `express-rate-limit`:
       - `apiGeneralLimiter`: 300 requests per 15 minutes for standard API reads.
       - `apiAuthLimiter`: 15 requests per 15 minutes for login, password resets, and user creation.
       - `apiActionLimiter`: 30 requests per 15 minutes for batch notifications and enrollment approval transactions.

3. **Incomplete URL Substring Sanitization (`src/services/cloudinaryService.ts` :33, :59)**:
   - **Root Cause**: Code utilizes `url.includes("cloudinary.com")` or `indexOf(...)` which allows attacker-controlled domains containing the substring (e.g. `https://attacker.com/cloudinary.com` or `https://cloudinary.com.evil.com`).
   - **Remediation**:
     - Parse URLs safely using standard `new URL(url)`.
     - Validate that `parsed.protocol === "https:"` and `parsed.hostname === "res.cloudinary.com"` or `parsed.hostname.endsWith(".cloudinary.com")`.

4. **DOM Text Reinterpreted as HTML (`src/components/AdminDashboard.tsx` :16310, :11754, :14226)**:
   - **Root Cause**: Passing raw template strings or variables to `dangerouslySetInnerHTML={{ __html: ... }}` without sanitization.
   - **Remediation**:
     - Wrap all dynamic HTML payloads with `DOMPurify.sanitize(content, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span', 'table', 'tr', 'td', 'th', 'thead', 'tbody'], ALLOWED_ATTR: ['href', 'target', 'class', 'style', 'id'] })`.

5. **Clear Text Storage of Sensitive Information (`src/App.tsx`, `src/auth/AuthProvider.tsx`, `src/components/AdminDashboard.tsx`)**:
   - **Root Cause**: `plainPassword` properties stored in `sunshine_users` in `localStorage`, and `sunshine_supabase_anon_key` stored in plain `localStorage`.
   - **Remediation**:
     - Strip `plainPassword` from all user objects before any storage write.
     - Only store salted hashes (`sha256_...`) for offline/local credential comparison.
     - Prevent storing API keys or anon keys directly in persistent `localStorage`; load them through build-time environment variables (`import.meta.env`) or temporary `sessionStorage`.

---

### Category B: Secret Scanning Alerts

1. **Compromised Google API Keys (`src/lib/firebase.ts:17`)**:
   - **Root Cause**: Legacy API keys committed in historical commits `#1` (Jul 6) and `#2` (Jul 10).
   - **Remediation**:
     - Confirm that `src/lib/firebase.ts` is eliminated from the current working tree and replaced by client-side Supabase / server-side SDKs.
     - Provide actionable guidance for the repository administrator to rotate/delete the leaked keys in Google Cloud Console (`APIs & Services > Credentials`) and mark the alerts as revoked/resolved on GitHub.

---

### Category C: Dependabot Vulnerability Remediation

1. **Targeted Package Upgrades via `npm`**:
   - Upgrade `compression` to safe version `>=1.8.2`.
   - Upgrade `nodemailer` to safe version `>=6.10.0` or `>=9.0.4` resolving addressparser quadratic backtracking (GHSA-r5c5-5942-8228, GHSA-rc2n-w244-ch59).
   - Update `express`, `proxy-addr`, `qs`, and `body-parser` to patched versions to prevent IP spoofing and bracket-key array bypasses.
   - Upgrade `source-map-js`, `browserslist`, and `baseline-browser-mapping` transitive dependencies.
   - For `xlsx` (SheetJS ReDoS & Prototype pollution): Wrap spreadsheet parsing in strict schema sanitization and update to latest secure revision or configure safe options (`dense: true`, prototype pollution guards).

---

## 4. Implementation Steps & Verification Checklist

### Phase 1: Server Hardening & CodeQL Remediation
- [x] Add `validateOutboundUrl` and SSRF prevention guard in `server.ts` (enforces HTTPS and blocks localhost, 127.0.0.1, 169.254.169.254, and private RFC 1918 subnets).
- [x] Integrate `express-rate-limit` middleware for public, auth, and webhook routes in `server.ts` (`apiLimiter`, `authLimiter`, `loginLimiter`, `actionLimiter`).
- [x] Refactor `src/services/cloudinaryService.ts` to use `new URL(url).hostname` verification (`isCloudinaryHost`).
- [x] Apply `DOMPurify.sanitize` to all `dangerouslySetInnerHTML` bindings in `src/components/AdminDashboard.tsx`, `src/components/GmailHub.tsx`, and `src/components/ChatBot.tsx`.

### Phase 2: Client Storage & Sensitive Data Protection
- [x] Strip all `plainPassword` properties from `src/App.tsx`, `src/auth/AuthProvider.tsx`, and `src/components/AdminDashboard.tsx`.
- [x] Remove `sunshine_supabase_anon_key` plaintext writing from `AdminDashboard.tsx` and prioritize `sessionStorage`.
- [x] Ensure all local credential caches utilize salted SHA-256 hashes only (`sha256_salted_...`).

### Phase 3: Dependency Updates & Verification
- [x] Run targeted package updates for vulnerable dependencies (`compression`, `nodemailer`, `qs`, `proxy-addr`, `source-map-js`, `browserslist`).
- [x] Run `npm audit` to verify resolution of critical and high severity CVEs.
- [x] Run `npm run lint` and `compile_applet` to confirm zero regression or TypeScript errors.
- [x] Document credential rotation steps for GitHub Secret Scanning alerts in Google Cloud Console.
