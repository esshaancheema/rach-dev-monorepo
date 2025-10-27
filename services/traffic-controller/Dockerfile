FROM node:18-alpine

WORKDIR /app

# Install nginx for configuration reloading
RUN apk add --no-cache nginx

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY index.js ./

# Create nginx directories
RUN mkdir -p /etc/nginx

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set permissions
RUN chown -R nodejs:nodejs /app /etc/nginx

USER nodejs

EXPOSE 8080

CMD ["node", "index.js"]