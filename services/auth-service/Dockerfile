# Multi-stage Dockerfile for Auth Service
FROM node:18-alpine AS base

# Install dumb-init and curl for proper signal handling and health checks
RUN apk add --no-cache dumb-init curl

# Create app directory
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy package files for better caching
COPY services/auth-service/package.json services/auth-service/pnpm-lock.yaml* ./
COPY packages/database/package.json ./packages/database/

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY services/auth-service/ .
COPY packages/database/ ./packages/database/

# Generate Prisma client
RUN cd packages/database && pnpm run generate

# Expose port
EXPOSE 4001

# Start development server
CMD ["dumb-init", "pnpm", "run", "dev"]

# Production build stage
FROM base AS build

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY services/auth-service/ .
COPY packages/database/ ./packages/database/

# Generate Prisma client
RUN cd packages/database && pnpm run generate

# Build the application
RUN pnpm run build

# Remove dev dependencies
RUN pnpm prune --prod

# Production stage
FROM node:18-alpine AS production

# Install dumb-init and curl for proper signal handling and health checks
RUN apk add --no-cache dumb-init curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S authservice -u 1001

# Create app directory
WORKDIR /app

# Copy built application from build stage
COPY --from=build --chown=authservice:nodejs /app/dist ./dist
COPY --from=build --chown=authservice:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=authservice:nodejs /app/packages ./packages
COPY --from=build --chown=authservice:nodejs /app/package.json ./

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs && chown -R authservice:nodejs /app/logs

# Health check with proper endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4001/health || exit 1

# Switch to non-root user
USER authservice

# Expose port
EXPOSE 4001

# Set production environment
ENV NODE_ENV=production
ENV PORT=4001

# Start the application with proper signal handling
CMD ["dumb-init", "node", "dist/app.js"]