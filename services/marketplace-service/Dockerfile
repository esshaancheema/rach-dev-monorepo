# Multi-stage build for Marketplace Service
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app directory and user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S app -u 1001

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache curl unzip

# Copy built application and dependencies
COPY --from=builder --chown=app:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=app:nodejs /app/dist ./dist
COPY --from=builder --chown=app:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chown -R app:nodejs /app/logs /app/uploads /app/temp

# Switch to non-root user
USER app

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3005/health || exit 1

# Set environment
ENV NODE_ENV=production
ENV PORT=3005

# Start the application
CMD ["node", "dist/server.js"]