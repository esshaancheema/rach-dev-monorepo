# GraphQL Gateway Dockerfile

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1000 -S nodejs && \
    adduser -S nodejs -u 1000

# Set working directory
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy additional files
COPY --from=builder /app/package.json ./

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Create tmp directory for uploads
RUN mkdir -p tmp && chown -R nodejs:nodejs tmp

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000 4001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "dist/server.js"]

# Labels
LABEL maintainer="Zoptal Platform Team"
LABEL version="1.0.0"
LABEL description="GraphQL Gateway for Zoptal Platform"
LABEL org.opencontainers.image.title="GraphQL Gateway"
LABEL org.opencontainers.image.description="Unified GraphQL API gateway for the Zoptal platform"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Zoptal"
LABEL org.opencontainers.image.licenses="MIT"