# Railway Deployment Guide for Sunshine Classes ERP

This guide provides step-by-step instructions to deploy Sunshine Classes ERP to [Railway](https://railway.app).

---

## 1. Quick Deploy via Railway Dashboard

1. **Push your repository** to GitHub or GitLab.
2. Log in to [Railway.app](https://railway.app) and click **New Project**.
3. Select **Deploy from GitHub repo** and choose your `sunshine-classes-erp` repository.
4. Railway will automatically detect the project and build using Nixpacks or Dockerfile.

---

## 2. Environment Variables Configuration

In your Railway Project Dashboard, navigate to **Settings** → **Variables**, and add the following environment variables:

### Core Configuration
| Variable | Value / Description | Required |
| :--- | :--- | :---: |
| `NODE_ENV` | `production` | Yes |
| `PORT` | Auto-provided by Railway (defaults to 3000) | No |
| `APP_URL` | Your Railway public domain (e.g. `https://sunshine-erp.up.railway.app`) | Yes |
| `JWT_SECRET` | A secure random string for signing JWT session tokens | Yes |

### Gemini AI & Cloud Integrations (Optional / As Needed)
| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key for AI assistant features |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (backend only) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_HOST` | SMTP server host (e.g. `smtp-relay.brevo.com`) |
| `SMTP_PORT` | SMTP port (e.g. `587`) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password / API key |
| `SMTP_FROM` | Verified sender email address |

---

## 3. Custom Domain & Networking

1. In the Railway Service settings, go to **Settings** → **Networking**.
2. Click **Generate Domain** to get a free `.up.railway.app` subdomain (or click **Custom Domain** to connect your institute domain like `erp.sunshineclasses.net`).
3. Railway automatically provisions and renews SSL/TLS certificates for HTTPS.

---

## 4. Built-in Health Checks

The application includes built-in health check endpoints configured in `railway.json`:
- **Path:** `/health` or `/api/health`
- **Response:** `{"status": "ok", "uptime": ...}`
- Railway uses this to monitor deployment health and perform zero-downtime rolling deploys.
