# Multi-stage production build for Vite + React application on Nginx (Railway optimized)
# Stage 1: Build Vite React static assets
FROM node:22-alpine AS builder

WORKDIR /app

# Leverage Docker layer caching for dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production Vite static bundle
COPY . .
RUN npm run build:client

# Stage 2: Serve static files with high-performance Nginx
FROM nginx:alpine AS runner

# Install envsubst (included in gettext) for dynamic PORT injection
RUN apk add --no-cache gettext

# Remove default nginx static assets and configuration
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy Vite production output from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Default fallback PORT (Railway dynamically injects $PORT at container runtime)
ENV PORT=80

# Expose HTTP port
EXPOSE 80

# Substitute $PORT into default.conf and start Nginx in foreground
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
