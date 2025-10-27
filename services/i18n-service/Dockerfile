# Multi-stage build for I18n Service
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S i18nservice -u 1001

# Set working directory
WORKDIR /app

# Copy node_modules from builder stage
COPY --from=builder --chown=i18nservice:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=i18nservice:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown i18nservice:nodejs logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3007

# Expose port
EXPOSE 3007

# Switch to non-root user
USER i18nservice

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]