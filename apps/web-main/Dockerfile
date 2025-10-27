# Multi-stage Dockerfile for Web Main Application
FROM node:18-alpine AS base

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat dumb-init curl

# Enable pnpm
RUN corepack enable pnpm

WORKDIR /app

# Install dependencies based on lockfile
COPY apps/web-main/package.json apps/web-main/pnpm-lock.yaml* ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/auth/package.json ./packages/auth/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/config/package.json ./packages/config/

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web-main/ .
COPY packages/ ./packages/

# Build shared packages
RUN pnpm run build --filter=@zoptal/ui
RUN pnpm run build --filter=@zoptal/auth
RUN pnpm run build --filter=@zoptal/api-client

# Expose port
EXPOSE 3000

# Start development server
CMD ["dumb-init", "pnpm", "run", "dev"]

# Production build stage
FROM base AS build

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web-main/ .
COPY packages/ ./packages/

# Build shared packages first
RUN pnpm run build --filter=@zoptal/ui
RUN pnpm run build --filter=@zoptal/auth
RUN pnpm run build --filter=@zoptal/api-client

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
RUN pnpm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init and curl for proper signal handling and health checks
RUN apk add --no-cache dumb-init curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy built application from build stage
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the application with proper signal handling
CMD ["dumb-init", "node", "server.js"]