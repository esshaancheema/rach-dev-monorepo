import { z } from 'zod';

const configSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4002),
  HOST: z.string().default('0.0.0.0'),
  API_PREFIX: z.string().default('/api'),
  
  // Database
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  AUTH_SERVICE_URL: z.string().url().default('http://localhost:4001'),
  
  // External Services
  AI_SERVICE_URL: z.string().url().default('http://localhost:4003'),
  NOTIFICATION_SERVICE_URL: z.string().url().default('http://localhost:4005'),
  
  // File Storage
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().default('zoptal-projects'),
  
  // GitHub Integration
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_WEBHOOK_SECRET: z.string().optional(),
  
  // GitLab Integration
  GITLAB_CLIENT_ID: z.string().optional(),
  GITLAB_CLIENT_SECRET: z.string().optional(),
  GITLAB_WEBHOOK_SECRET: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  
  // Feature Flags
  ENABLE_AI_FEATURES: z.coerce.boolean().default(true),
  ENABLE_GIT_INTEGRATION: z.coerce.boolean().default(true),
  ENABLE_REAL_TIME: z.coerce.boolean().default(true),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().default('15m'),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  // WebSocket
  WS_PORT: z.coerce.number().default(4102),
  
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

// JWT configuration
export const jwtConfig = {
  secret: config.JWT_SECRET,
  algorithm: 'HS256' as const,
  expiresIn: '24h',
  issuer: 'zoptal-project-service',
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: parseTimeString(config.RATE_LIMIT_WINDOW),
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
};

// WebSocket configuration
export const wsConfig = {
  port: config.WS_PORT,
  path: '/ws',
  cors: {
    origin: isDevelopment ? true : ['https://app.zoptal.com', 'https://dashboard.zoptal.com'],
    credentials: true,
  },
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