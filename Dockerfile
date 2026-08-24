# Multi-stage production build for Sunshine Classes ERP on Railway
# Stage 1: Build client and server bundles
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package dependency manifests
COPY package*.json ./

# Install dependencies (fallback to npm install --legacy-peer-deps if lockfile differences exist)
RUN npm ci || npm install --legacy-peer-deps

# Copy entire source tree
COPY . .

# Build Vite client assets + compiled backend (dist/server.cjs)
RUN npm run build

# Stage 2: Production runtime image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev --legacy-peer-deps

# Copy built distribution files from builder stage
COPY --from=builder /app/dist ./dist

# Expose default container port (Railway will dynamically bind PORT at runtime)
EXPOSE 3000

# Start compiled CommonJS full-stack server
CMD ["node", "dist/server.cjs"]
