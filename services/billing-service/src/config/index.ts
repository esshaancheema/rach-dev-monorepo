import { z } from 'zod';

const configSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4004),
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
  NOTIFICATION_SERVICE_URL: z.string().url().default('http://localhost:4005'),
  
  // Stripe Configuration
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_WEBHOOK_ENDPOINT_SECRET: z.string().optional(),
  
  // Business Configuration
  COMPANY_NAME: z.string().default('Zoptal'),
  SUPPORT_EMAIL: z.string().email().default('support@zoptal.com'),
  BUSINESS_ADDRESS: z.string().default('123 Business St, Tech City, TC 12345'),
  TAX_RATE: z.coerce.number().min(0).max(1).default(0.0825), // 8.25% default tax rate
  
  // Subscription Plans
  FREE_PLAN_STRIPE_PRICE_ID: z.string().optional(),
  STARTER_PLAN_STRIPE_PRICE_ID: z.string().optional(),
  PRO_PLAN_STRIPE_PRICE_ID: z.string().optional(),
  ENTERPRISE_PLAN_STRIPE_PRICE_ID: z.string().optional(),
  
  // Usage Limits
  FREE_PLAN_API_CALLS: z.coerce.number().default(1000),
  STARTER_PLAN_API_CALLS: z.coerce.number().default(10000),
  PRO_PLAN_API_CALLS: z.coerce.number().default(100000),
  ENTERPRISE_PLAN_API_CALLS: z.coerce.number().default(-1), // Unlimited
  
  // Billing Configuration
  TRIAL_PERIOD_DAYS: z.coerce.number().default(14),
  GRACE_PERIOD_DAYS: z.coerce.number().default(3),
  PAYMENT_METHOD_COLLECTION: z.enum(['if_required', 'always']).default('if_required'),
  
  // Invoice Configuration
  INVOICE_DUE_DAYS: z.coerce.number().default(30),
  LATE_FEE_PERCENTAGE: z.coerce.number().min(0).max(1).default(0.015), // 1.5% late fee
  DUNNING_PERIOD_DAYS: z.coerce.number().default(7),
  
  // File Storage
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().default('zoptal-billing-docs'),
  
  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  
  // Feature Flags
  ENABLE_USAGE_BASED_BILLING: z.coerce.boolean().default(true),
  ENABLE_AUTOMATIC_TAX: z.coerce.boolean().default(true),
  ENABLE_PRORATION: z.coerce.boolean().default(true),
  ENABLE_DUNNING_MANAGEMENT: z.coerce.boolean().default(true),
  ENABLE_REVENUE_RECOGNITION: z.coerce.boolean().default(false),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().default('15m'),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  // Currency and Localization
  DEFAULT_CURRENCY: z.string().default('USD'),
  SUPPORTED_CURRENCIES: z.string().default('USD,EUR,GBP,CAD,AUD'),
  DEFAULT_LOCALE: z.string().default('en-US'),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  DATADOG_API_KEY: z.string().optional(),
  
  // Compliance
  GDPR_ENABLED: z.coerce.boolean().default(true),
  PCI_COMPLIANCE_LEVEL: z.enum(['1', '2', '3', '4']).default('1'),
  SOX_COMPLIANCE: z.coerce.boolean().default(false),
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
  issuer: 'zoptal-billing-service',
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: parseTimeString(config.RATE_LIMIT_WINDOW),
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
};

// Stripe configuration
export const stripeConfig = {
  secretKey: config.STRIPE_SECRET_KEY,
  publishableKey: config.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: config.STRIPE_WEBHOOK_SECRET,
  webhookEndpointSecret: config.STRIPE_WEBHOOK_ENDPOINT_SECRET,
  apiVersion: '2023-10-16' as const,
};

// Business configuration
export const businessConfig = {
  name: config.COMPANY_NAME,
  supportEmail: config.SUPPORT_EMAIL,
  address: config.BUSINESS_ADDRESS,
  taxRate: config.TAX_RATE,
  defaultCurrency: config.DEFAULT_CURRENCY,
  supportedCurrencies: config.SUPPORTED_CURRENCIES.split(','),
  defaultLocale: config.DEFAULT_LOCALE,
};

// Subscription plans configuration
export const plansConfig = {
  free: {
    stripeId: config.FREE_PLAN_STRIPE_PRICE_ID,
    apiCalls: config.FREE_PLAN_API_CALLS,
    price: 0,
    features: ['Basic API Access', 'Community Support'],
  },
  starter: {
    stripeId: config.STARTER_PLAN_STRIPE_PRICE_ID,
    apiCalls: config.STARTER_PLAN_API_CALLS,
    price: 29,
    features: ['Enhanced API Access', 'Email Support', 'Analytics Dashboard'],
  },
  pro: {
    stripeId: config.PRO_PLAN_STRIPE_PRICE_ID,
    apiCalls: config.PRO_PLAN_API_CALLS,
    price: 99,
    features: ['Premium API Access', 'Priority Support', 'Advanced Analytics', 'Custom Integrations'],
  },
  enterprise: {
    stripeId: config.ENTERPRISE_PLAN_STRIPE_PRICE_ID,
    apiCalls: config.ENTERPRISE_PLAN_API_CALLS,
    price: 499,
    features: ['Unlimited API Access', '24/7 Support', 'Custom Solutions', 'Dedicated Account Manager'],
  },
};

// Billing configuration
export const billingConfig = {
  trialPeriodDays: config.TRIAL_PERIOD_DAYS,
  gracePeriodDays: config.GRACE_PERIOD_DAYS,
  paymentMethodCollection: config.PAYMENT_METHOD_COLLECTION,
  invoiceDueDays: config.INVOICE_DUE_DAYS,
  lateFeePercentage: config.LATE_FEE_PERCENTAGE,
  dunningPeriodDays: config.DUNNING_PERIOD_DAYS,
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
  usageBasedBilling: config.ENABLE_USAGE_BASED_BILLING,
  automaticTax: config.ENABLE_AUTOMATIC_TAX,
  proration: config.ENABLE_PRORATION,
  dunningManagement: config.ENABLE_DUNNING_MANAGEMENT,
  revenueRecognition: config.ENABLE_REVENUE_RECOGNITION,
};

// Compliance configuration
export const complianceConfig = {
  gdprEnabled: config.GDPR_ENABLED,
  pciLevel: config.PCI_COMPLIANCE_LEVEL,
  soxCompliance: config.SOX_COMPLIANCE,
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