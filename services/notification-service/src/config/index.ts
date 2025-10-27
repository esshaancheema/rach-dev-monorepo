import { z } from 'zod';

const configSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4005),
  HOST: z.string().default('0.0.0.0'),
  API_PREFIX: z.string().default('/api'),
  
  // Database
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  AUTH_SERVICE_URL: z.string().url().default('http://localhost:4001'),
  
  // External Services
  PROJECT_SERVICE_URL: z.string().url().default('http://localhost:4002'),
  BILLING_SERVICE_URL: z.string().url().default('http://localhost:4004'),
  
  // Email Configuration (SendGrid)
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_VERIFIED_SENDER: z.string().email().optional(),
  SENDGRID_WEBHOOK_SECRET: z.string().optional(),
  
  // Email Configuration (SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z.coerce.boolean().default(true),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // SMS Configuration (Twilio)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  TWILIO_MESSAGING_SERVICE_SID: z.string().optional(),
  
  // Push Notifications (Web Push)
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().email().default('mailto:support@zoptal.com'),
  
  // Real-time Notifications (Pusher)
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().default('us2'),
  
  // Default Settings
  DEFAULT_FROM_EMAIL: z.string().email().default('noreply@zoptal.com'),
  DEFAULT_FROM_NAME: z.string().default('Zoptal'),
  DEFAULT_REPLY_TO: z.string().email().default('support@zoptal.com'),
  
  // Template Configuration
  TEMPLATE_PATH: z.string().default('./templates'),
  DEFAULT_LOCALE: z.string().default('en'),
  SUPPORTED_LOCALES: z.string().default('en,es,fr,de'),
  
  // Queue Configuration
  QUEUE_CONCURRENCY: z.coerce.number().default(5),
  QUEUE_RETRY_ATTEMPTS: z.coerce.number().default(3),
  QUEUE_RETRY_DELAY: z.coerce.number().default(5000),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().default('15m'),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  // Email Rate Limits
  EMAIL_RATE_LIMIT_PER_USER: z.coerce.number().default(50), // per hour
  SMS_RATE_LIMIT_PER_USER: z.coerce.number().default(10), // per hour
  PUSH_RATE_LIMIT_PER_USER: z.coerce.number().default(20), // per hour
  
  // Notification Settings
  ENABLE_EMAIL_NOTIFICATIONS: z.coerce.boolean().default(true),
  ENABLE_SMS_NOTIFICATIONS: z.coerce.boolean().default(true),
  ENABLE_PUSH_NOTIFICATIONS: z.coerce.boolean().default(true),
  ENABLE_IN_APP_NOTIFICATIONS: z.coerce.boolean().default(true),
  
  // Delivery Settings
  MAX_DELIVERY_ATTEMPTS: z.coerce.number().default(3),
  DELIVERY_TIMEOUT: z.coerce.number().default(30000), // 30 seconds
  BATCH_SIZE: z.coerce.number().default(100),
  
  // Storage
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().default('zoptal-notification-attachments'),
  
  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  
  // Feature Flags
  ENABLE_TEMPLATE_PREVIEW: z.coerce.boolean().default(true),
  ENABLE_NOTIFICATION_HISTORY: z.coerce.boolean().default(true),
  ENABLE_DELIVERY_TRACKING: z.coerce.boolean().default(true),
  ENABLE_UNSUBSCRIBE_MANAGEMENT: z.coerce.boolean().default(true),
  ENABLE_NOTIFICATION_SCHEDULING: z.coerce.boolean().default(true),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  DATADOG_API_KEY: z.string().optional(),
  
  // Compliance
  GDPR_ENABLED: z.coerce.boolean().default(true),
  CAN_SPAM_COMPLIANT: z.coerce.boolean().default(true),
  RETENTION_DAYS: z.coerce.number().default(90),
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
  issuer: 'zoptal-notification-service',
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: parseTimeString(config.RATE_LIMIT_WINDOW),
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
};

// Email configuration
export const emailConfig = {
  sendgrid: {
    apiKey: config.SENDGRID_API_KEY,
    verifiedSender: config.SENDGRID_VERIFIED_SENDER,
    webhookSecret: config.SENDGRID_WEBHOOK_SECRET,
    enabled: !!config.SENDGRID_API_KEY,
  },
  smtp: {
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth: config.SMTP_USER && config.SMTP_PASS ? {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    } : undefined,
    enabled: !!config.SMTP_HOST,
  },
  defaults: {
    from: {
      email: config.DEFAULT_FROM_EMAIL,
      name: config.DEFAULT_FROM_NAME,
    },
    replyTo: config.DEFAULT_REPLY_TO,
  },
  rateLimitPerUser: config.EMAIL_RATE_LIMIT_PER_USER,
};

// SMS configuration
export const smsConfig = {
  accountSid: config.TWILIO_ACCOUNT_SID,
  authToken: config.TWILIO_AUTH_TOKEN,
  phoneNumber: config.TWILIO_PHONE_NUMBER,
  messagingServiceSid: config.TWILIO_MESSAGING_SERVICE_SID,
  enabled: !!config.TWILIO_ACCOUNT_SID && !!config.TWILIO_AUTH_TOKEN,
  rateLimitPerUser: config.SMS_RATE_LIMIT_PER_USER,
};

// Push notification configuration
export const pushConfig = {
  vapidKeys: {
    publicKey: config.VAPID_PUBLIC_KEY,
    privateKey: config.VAPID_PRIVATE_KEY,
  },
  subject: config.VAPID_SUBJECT,
  enabled: !!config.VAPID_PUBLIC_KEY && !!config.VAPID_PRIVATE_KEY,
  rateLimitPerUser: config.PUSH_RATE_LIMIT_PER_USER,
};

// Real-time notification configuration
export const pusherConfig = {
  appId: config.PUSHER_APP_ID,
  key: config.PUSHER_KEY,
  secret: config.PUSHER_SECRET,
  cluster: config.PUSHER_CLUSTER,
  useTLS: true,
  enabled: !!config.PUSHER_APP_ID && !!config.PUSHER_KEY && !!config.PUSHER_SECRET,
};

// Template configuration
export const templateConfig = {
  path: config.TEMPLATE_PATH,
  defaultLocale: config.DEFAULT_LOCALE,
  supportedLocales: config.SUPPORTED_LOCALES.split(','),
};

// Queue configuration
export const queueConfig = {
  concurrency: config.QUEUE_CONCURRENCY,
  retryAttempts: config.QUEUE_RETRY_ATTEMPTS,
  retryDelay: config.QUEUE_RETRY_DELAY,
};

// Delivery configuration
export const deliveryConfig = {
  maxAttempts: config.MAX_DELIVERY_ATTEMPTS,
  timeout: config.DELIVERY_TIMEOUT,
  batchSize: config.BATCH_SIZE,
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
  email: config.ENABLE_EMAIL_NOTIFICATIONS && emailConfig.sendgrid.enabled || emailConfig.smtp.enabled,
  sms: config.ENABLE_SMS_NOTIFICATIONS && smsConfig.enabled,
  push: config.ENABLE_PUSH_NOTIFICATIONS && pushConfig.enabled,
  inApp: config.ENABLE_IN_APP_NOTIFICATIONS && pusherConfig.enabled,
  templatePreview: config.ENABLE_TEMPLATE_PREVIEW,
  notificationHistory: config.ENABLE_NOTIFICATION_HISTORY,
  deliveryTracking: config.ENABLE_DELIVERY_TRACKING,
  unsubscribeManagement: config.ENABLE_UNSUBSCRIBE_MANAGEMENT,
  scheduling: config.ENABLE_NOTIFICATION_SCHEDULING,
};

// Compliance configuration
export const complianceConfig = {
  gdpr: config.GDPR_ENABLED,
  canSpam: config.CAN_SPAM_COMPLIANT,
  retentionDays: config.RETENTION_DAYS,
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