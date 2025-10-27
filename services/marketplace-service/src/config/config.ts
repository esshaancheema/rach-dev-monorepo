import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3005', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/zoptal_marketplace',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    ssl: process.env.NODE_ENV === 'production',
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '3', 10),
    keyPrefix: 'marketplace:',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-marketplace',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // CORS Configuration
  cors: {
    origins: process.env.CORS_ORIGINS ? 
      process.env.CORS_ORIGINS.split(',') : 
      ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB
    allowedMimeTypes: [
      'application/zip',
      'application/x-zip-compressed',
      'application/tar+gzip',
      'application/gzip',
      'application/json',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/svg+xml',
    ],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    tempPath: process.env.TEMP_PATH || './temp',
  },

  // Integration Configuration
  integrations: {
    maxIntegrationsPerDeveloper: parseInt(process.env.MAX_INTEGRATIONS_PER_DEVELOPER || '50', 10),
    maxInstallationsPerIntegration: parseInt(process.env.MAX_INSTALLATIONS_PER_INTEGRATION || '10000', 10),
    reviewTimeout: parseInt(process.env.REVIEW_TIMEOUT_HOURS || '72', 10), // hours
    sandboxTimeout: parseInt(process.env.SANDBOX_TIMEOUT_MINUTES || '30', 10), // minutes
  },

  // Plugin System
  plugins: {
    allowedHooks: [
      'before_project_create',
      'after_project_create',
      'before_project_update',
      'after_project_update',
      'before_project_delete',
      'after_project_delete',
      'before_user_login',
      'after_user_login',
      'before_user_logout',
      'after_user_logout',
      'dashboard_widget',
      'settings_panel',
      'toolbar_button',
      'context_menu',
    ],
    executionTimeout: parseInt(process.env.PLUGIN_EXECUTION_TIMEOUT || '5000', 10), // ms
    memoryLimit: parseInt(process.env.PLUGIN_MEMORY_LIMIT || '128', 10), // MB
    maxConcurrentExecutions: parseInt(process.env.MAX_CONCURRENT_PLUGIN_EXECUTIONS || '10', 10),
  },

  // Webhook Configuration
  webhooks: {
    maxEndpoints: parseInt(process.env.MAX_WEBHOOK_ENDPOINTS || '10', 10),
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT || '30000', 10), // ms
    retryAttempts: parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.WEBHOOK_RETRY_DELAY || '1000', 10), // ms
    maxPayloadSize: parseInt(process.env.WEBHOOK_MAX_PAYLOAD_SIZE || '1048576', 10), // 1MB
  },

  // OAuth Configuration
  oauth: {
    authorizationCodeExpiry: parseInt(process.env.OAUTH_AUTH_CODE_EXPIRY || '600', 10), // seconds
    accessTokenExpiry: parseInt(process.env.OAUTH_ACCESS_TOKEN_EXPIRY || '3600', 10), // seconds
    refreshTokenExpiry: parseInt(process.env.OAUTH_REFRESH_TOKEN_EXPIRY || '2592000', 10), // 30 days
    allowedRedirectUris: process.env.OAUTH_ALLOWED_REDIRECT_URIS ?
      process.env.OAUTH_ALLOWED_REDIRECT_URIS.split(',') :
      ['http://localhost:8080/callback'],
  },

  // Security Configuration
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here',
    hashSaltRounds: parseInt(process.env.HASH_SALT_ROUNDS || '12', 10),
    csrfSecret: process.env.CSRF_SECRET || 'your-csrf-secret-key',
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900000', 10), // 15 minutes
  },

  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@zoptal.com',
  },

  // Stripe Configuration (for paid integrations)
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: process.env.STRIPE_CURRENCY || 'usd',
  },

  // Analytics Configuration
  analytics: {
    trackInstalls: process.env.TRACK_INSTALLS !== 'false',
    trackUsage: process.env.TRACK_USAGE !== 'false',
    trackErrors: process.env.TRACK_ERRORS !== 'false',
    retentionDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '90', 10),
  },

  // Content Delivery Network
  cdn: {
    baseUrl: process.env.CDN_BASE_URL || 'https://cdn.zoptal.com',
    bucketName: process.env.CDN_BUCKET_NAME || 'zoptal-marketplace',
    region: process.env.CDN_REGION || 'us-east-1',
    accessKeyId: process.env.CDN_ACCESS_KEY_ID,
    secretAccessKey: process.env.CDN_SECRET_ACCESS_KEY,
  },

  // Monitoring Configuration
  monitoring: {
    enabled: process.env.MONITORING_ENABLED !== 'false',
    metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10), // ms
    alertThresholds: {
      errorRate: parseFloat(process.env.ALERT_ERROR_RATE || '0.05'), // 5%
      responseTime: parseInt(process.env.ALERT_RESPONSE_TIME || '1000', 10), // ms
      memoryUsage: parseFloat(process.env.ALERT_MEMORY_USAGE || '0.8'), // 80%
      cpuUsage: parseFloat(process.env.ALERT_CPU_USAGE || '0.8'), // 80%
    },
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
  },

  // Development Configuration
  development: {
    mockExternalServices: process.env.MOCK_EXTERNAL_SERVICES === 'true',
    enableDebugRoutes: process.env.ENABLE_DEBUG_ROUTES === 'true',
    skipAuthentication: process.env.SKIP_AUTHENTICATION === 'true',
    verboseLogging: process.env.VERBOSE_LOGGING === 'true',
  },
};