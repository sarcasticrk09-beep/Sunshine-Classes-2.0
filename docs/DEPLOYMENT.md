# Deployment Manual: Sunshine ERP

This document outlines the container deployment, environment settings, and build systems used for launching **Sunshine ERP** in staging or production.

---

## 🏗️ Production Build and Start Command

Sunshine ERP runs on a unified, container-optimized Node.js server. The production deployment workflow consists of two parts:

### 1. Build Phase
This compiles the React frontend assets and bundles the backend server:
```bash
npm run build
```
This script triggers:
1. Vite compilation to bundle all React components into HTML, CSS, and JS under `/dist`.
2. `esbuild` compilation of `server.ts` to bundle the backend into a single self-contained CJS bundle at `dist/server.cjs`.

### 2. Start Command
Runs the compiled full-stack server:
```json
"scripts": {
  "start": "node dist/server.cjs"
}
```

---

## 🐳 Containerization (Google Cloud Run / Docker)

The application is deployed using Docker. This ensures environment consistency and simple horizontal scaling:

```dockerfile
# 1. Build Environment
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000

CMD ["npm", "start"]
```

---

## 🔒 Production Environment Secrets

The following environment secrets must be configured in your container runtime:

| Variable | Type | Purpose | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | Active ingress port | `3000` |
| `GEMINI_API_KEY` | String | Server Gemini Flash key | `AIzaSy...` |
| `CLOUDINARY_URL` | String | Media uploads connection | `cloudinary://key:secret...` |
| `TWILIO_ACCOUNT_SID`| String | Twilio client account | `AC...` |
| `TWILIO_AUTH_TOKEN` | String | Twilio security token | `token_here` |
| `SMTP_HOST` | String | Transactional email server | `smtp.gmail.com` |
| `SMTP_USER` | String | Sender address credentials | `office@sunshine.com` |
| `SMTP_PASS` | String | Sender app passcode | `pass_here` |

---

## 🚀 Step-by-Step Production Launch

1. **Verify Environment Variables**: Confirm your `.env` contains all required secrets.
2. **Execute Local Build**: Run `npm run build` to confirm compilation is successful.
3. **Deploy Container**: Push your docker image and deploy to Google Cloud Run:
   ```bash
   gcloud run deploy sunshine-erp --source . --port 3000 --allow-unauthenticated
   ```
4. **Deploy Database Rules**: Update cloud access control rules:
   - For Firestore: `npm run deploy-firestore` (rules deployed to project namespace).
   - For Supabase: Apply migrations via Supabase dashboard or CLI.
