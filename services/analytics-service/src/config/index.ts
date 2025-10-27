import { z } from 'zod';

const configSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4006),
  HOST: z.string().default('0.0.0.0'),
  API_PREFIX: z.string().default('/api'),
  
  // Database
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  
  // ClickHouse Configuration (for analytics data)
  CLICKHOUSE_HOST: z.string().default('localhost'),
  CLICKHOUSE_PORT: z.coerce.number().default(8123),
  CLICKHOUSE_DATABASE: z.string().default('zoptal_analytics'),
  CLICKHOUSE_USERNAME: z.string().optional(),
  CLICKHOUSE_PASSWORD: z.string().optional(),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  AUTH_SERVICE_URL: z.string().url().default('http://localhost:4001'),
  
  // External Services
  PROJECT_SERVICE_URL: z.string().url().default('http://localhost:4002'),
  BILLING_SERVICE_URL: z.string().url().default('http://localhost:4004'),
  
  // Data Collection
  ENABLE_SERVER_ANALYTICS: z.coerce.boolean().default(true),
  ENABLE_CLIENT_ANALYTICS: z.coerce.boolean().default(true),
  ENABLE_PERFORMANCE_TRACKING: z.coerce.boolean().default(true),
  ENABLE_ERROR_TRACKING: z.coerce.boolean().default(true),
  ENABLE_USER_SESSION_TRACKING: z.coerce.boolean().default(true),
  
  // Privacy & Compliance
  ANONYMIZE_IP: z.coerce.boolean().default(true),
  RESPECT_DO_NOT_TRACK: z.coerce.boolean().default(true),
  DATA_RETENTION_DAYS: z.coerce.number().default(365),
  GDPR_COMPLIANT: z.coerce.boolean().default(true),
  
  // Sampling
  SAMPLING_RATE: z.coerce.number().min(0).max(1).default(1), // 100% by default
  ERROR_SAMPLING_RATE: z.coerce.number().min(0).max(1).default(1),
  PERFORMANCE_SAMPLING_RATE: z.coerce.number().min(0).max(1).default(0.1), // 10%
  
  // Real-time Processing
  BATCH_SIZE: z.coerce.number().default(1000),
  BATCH_TIMEOUT: z.coerce.number().default(5000), // 5 seconds
  MAX_QUEUE_SIZE: z.coerce.number().default(10000),
  
  // Session Configuration
  SESSION_TIMEOUT: z.coerce.number().default(1800000), // 30 minutes
  SESSION_EXTEND_ON_ACTIVITY: z.coerce.boolean().default(true),
  
  // Custom Events
  MAX_CUSTOM_PROPERTIES: z.coerce.number().default(50),
  MAX_PROPERTY_VALUE_LENGTH: z.coerce.number().default(1000),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().default('1m'),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(1000),
  RATE_LIMIT_PER_USER: z.coerce.number().default(100),
  
  // Aggregation Jobs
  ENABLE_HOURLY_AGGREGATION: z.coerce.boolean().default(true),
  ENABLE_DAILY_AGGREGATION: z.coerce.boolean().default(true),
  ENABLE_MONTHLY_AGGREGATION: z.coerce.boolean().default(true),
  
  // Alerts & Monitoring
  ENABLE_ANOMALY_DETECTION: z.coerce.boolean().default(true),
  ANOMALY_THRESHOLD_MULTIPLIER: z.coerce.number().default(3),
  
  // Export Configuration
  ENABLE_DATA_EXPORT: z.coerce.boolean().default(true),
  MAX_EXPORT_ROWS: z.coerce.number().default(1000000),
  EXPORT_FORMATS: z.string().default('csv,json,parquet'),
  
  // Storage
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().default('zoptal-analytics-exports'),
  
  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  
  // Feature Flags
  ENABLE_COHORT_ANALYSIS: z.coerce.boolean().default(true),
  ENABLE_FUNNEL_ANALYSIS: z.coerce.boolean().default(true),
  ENABLE_RETENTION_ANALYSIS: z.coerce.boolean().default(true),
  ENABLE_PATH_ANALYSIS: z.coerce.boolean().default(true),
  ENABLE_HEATMAPS: z.coerce.boolean().default(true),
  ENABLE_A_B_TESTING: z.coerce.boolean().default(true),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  DATADOG_API_KEY: z.string().optional(),
});

export type Config = z.infer<typeof configSchema>;

const parseConfig = (): Config => {
  try {
    return configSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(
        `Invalid configuration:\n${errorMessages.join('\n')}`
      );
    }
    throw error;
  }
};

export const config = parseConfig();

// Environment helpers
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

// Database configuration
export const databaseConfig = {
  url: config.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  poolSize: isProduction ? 20 : 5,
  timeout: 30000,
};

// Redis configuration
export const redisConfig = {
  url: config.REDIS_URL,
  retryDelayOnClusterDown: 300,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

// ClickHouse configuration
export const clickhouseConfig = {
  host: `http://${config.CLICKHOUSE_HOST}:${config.CLICKHOUSE_PORT}`,
  database: config.CLICKHOUSE_DATABASE,
  username: config.CLICKHOUSE_USERNAME,
  password: config.CLICKHOUSE_PASSWORD,
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 0,
    async_insert_busy_timeout_ms: 10000,
    async_insert_max_data_size: 10485760, // 10MB
  },
};

// JWT configuration
export const jwtConfig = {
  secret: config.JWT_SECRET,
  algorithm: 'HS256' as const,
  expiresIn: '24h',
  issuer: 'zoptal-analytics-service',
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: parseTimeString(config.RATE_LIMIT_WINDOW),
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  maxRequestsPerUser: config.RATE_LIMIT_PER_USER,
  standardHeaders: true,
  legacyHeaders: false,
};

// Data collection configuration
export const collectionConfig = {
  serverAnalytics: config.ENABLE_SERVER_ANALYTICS,
  clientAnalytics: config.ENABLE_CLIENT_ANALYTICS,
  performanceTracking: config.ENABLE_PERFORMANCE_TRACKING,
  errorTracking: config.ENABLE_ERROR_TRACKING,
  sessionTracking: config.ENABLE_USER_SESSION_TRACKING,
};

// Privacy configuration
export const privacyConfig = {
  anonymizeIp: config.ANONYMIZE_IP,
  respectDoNotTrack: config.RESPECT_DO_NOT_TRACK,
  dataRetentionDays: config.DATA_RETENTION_DAYS,
  gdprCompliant: config.GDPR_COMPLIANT,
};

// Sampling configuration
export const samplingConfig = {
  events: config.SAMPLING_RATE,
  errors: config.ERROR_SAMPLING_RATE,
  performance: config.PERFORMANCE_SAMPLING_RATE,
};

// Processing configuration
export const processingConfig = {
  batchSize: config.BATCH_SIZE,
  batchTimeout: config.BATCH_TIMEOUT,
  maxQueueSize: config.MAX_QUEUE_SIZE,
};

// Session configuration
export const sessionConfig = {
  timeout: config.SESSION_TIMEOUT,
  extendOnActivity: config.SESSION_EXTEND_ON_ACTIVITY,
};

// Custom events configuration
export const customEventsConfig = {
  maxProperties: config.MAX_CUSTOM_PROPERTIES,
  maxPropertyValueLength: config.MAX_PROPERTY_VALUE_LENGTH,
};

// Aggregation configuration
export const aggregationConfig = {
  hourly: config.ENABLE_HOURLY_AGGREGATION,
  daily: config.ENABLE_DAILY_AGGREGATION,
  monthly: config.ENABLE_MONTHLY_AGGREGATION,
};

// Anomaly detection configuration
export const anomalyConfig = {
  enabled: config.ENABLE_ANOMALY_DETECTION,
  thresholdMultiplier: config.ANOMALY_THRESHOLD_MULTIPLIER,
};

// Export configuration
export const exportConfig = {
  enabled: config.ENABLE_DATA_EXPORT,
  maxRows: config.MAX_EXPORT_ROWS,
  formats: config.EXPORT_FORMATS.split(','),
};

// AWS configuration
export const awsConfig = {
  region: config.AWS_REGION,
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  s3: {
    bucketName: config.S3_BUCKET_NAME,
    signedUrlExpiration: 3600, // 1 hour
  },
};

// Feature flags
export const features = {
  cohortAnalysis: config.ENABLE_COHORT_ANALYSIS,
  funnelAnalysis: config.ENABLE_FUNNEL_ANALYSIS,
  retentionAnalysis: config.ENABLE_RETENTION_ANALYSIS,
  pathAnalysis: config.ENABLE_PATH_ANALYSIS,
  heatmaps: config.ENABLE_HEATMAPS,
  abTesting: config.ENABLE_A_B_TESTING,
};

// Helper function to parse time strings like "15m", "1h", "30s"
function parseTimeString(timeStr: string): number {
  const units: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  const [, value, unit] = match;
  return parseInt(value, 10) * units[unit];
}