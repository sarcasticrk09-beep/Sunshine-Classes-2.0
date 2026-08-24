# Railway Environment Variables Setup Guide

This guide provides a comprehensive mapping of all environment variables required or supported by **Sunshine Classes ERP** when hosted on [Railway](https://railway.app).

---

## 1. How to Set Environment Variables in Railway

1. Open your project on [Railway.app](https://railway.app).
2. Click on your active service (e.g. `sunshine-classes-erp`).
3. Click the **Variables** tab.
4. Click **+ New Variable** (or **RAW Editor** to paste the `.env` block at once).
5. Paste your production credentials.
6. Railway will automatically trigger a zero-downtime redeploy with the updated variables.

---

## 2. Complete Environment Variable Reference Matrix

### ⚙️ Core System & Security (Required)
| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations, caching, and secure cookies. |
| `PORT` | *(Provided by Railway)* | The server dynamically binds to Railway's injected port. |
| `APP_URL` | `https://sunshine-erp.up.railway.app` | Public canonical URL for callback redirects and link generation. |
| `JWT_SECRET` | `a_super_strong_random_secret_32_chars` | Cryptographic secret used for signing and verifying user session JWT tokens. |

### 🗄️ Database & Supabase (PostgreSQL & Row-Level Security)
| Variable | Scope | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Client (Public) | Your Supabase project URL (`https://your-project.supabase.co`). |
| `VITE_SUPABASE_ANON_KEY` | Client (Public) | Supabase anonymous API public key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server (Private) | Privileged administrative key for server-side operations (Never exposed to client). |

### 🤖 Google Gemini AI (Smart Features & Assistant)
| Variable | Scope | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Server (Private) | Google Gemini API key used for automatic question paper generation, exam analysis, and instant doubt solver. |

### ☁️ Cloudinary CDN (Images, PDFs & Receipts)
| Variable | Scope | Description |
| :--- | :--- | :--- |
| `CLOUDINARY_CLOUD_NAME` | Server (Private) | Cloudinary cloud identifier for server-side signed uploads. |
| `CLOUDINARY_API_KEY` | Server (Private) | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | Server (Private) | Cloudinary API Secret. |
| `VITE_CLOUDINARY_CLOUD_NAME`| Client (Public) | Cloud identifier for client-side widgets. |
| `VITE_CLOUDINARY_UPLOAD_PRESET`| Client (Public)| Unsigned upload preset for direct browser uploads. |

### ✉️ SMTP Transactional Email (Receipts & Notifications)
| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `SMTP_HOST` | `smtp-relay.brevo.com` | SMTP server host. |
| `SMTP_PORT` | `587` | Port (`587` for STARTTLS, `465` for SSL). |
| `SMTP_USER` | `7a1b...` | SMTP username / login email. |
| `SMTP_PASS` | `xsmtpsib-...` | SMTP account password or API secret key. |
| `SMTP_FROM` | `Sunshine Classes <info@sunshineclasses.net>` | Verified sender address header. |

### 💬 Meta WhatsApp Cloud API (Automated Alerts)
| Variable | Scope | Description |
| :--- | :--- | :--- |
| `META_ACCESS_TOKEN` | Server (Private) | Meta System User Permanent Token. |
| `META_PHONE_NUMBER_ID`| Server (Private)| Business Phone Number ID from Meta Developer Portal. |
| `META_VERIFY_TOKEN` | Server (Private) | Verification secret string for inbound WhatsApp webhooks. |

---

## 3. Quick Copy-Paste Raw Template for Railway

Copy and paste this into Railway's **RAW Editor** under the **Variables** tab:

```env
NODE_ENV=production
APP_URL=https://your-railway-domain.up.railway.app
JWT_SECRET=replace_with_secure_random_string_min_32_characters

# Supabase Database
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Gemini AI
GEMINI_API_KEY=

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=

# SMTP Email Dispatch
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Sunshine Classes <info@sunshineclasses.net>

# Meta WhatsApp
META_ACCESS_TOKEN=
META_PHONE_NUMBER_ID=
META_VERIFY_TOKEN=sunshine_whatsapp_verify_token_2026
```

---

## 4. Validating Your Environment on Railway

You can run the built-in validator script at any time to verify your environment setup:

```bash
npm run validate:env
```
