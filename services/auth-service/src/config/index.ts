import { z } from 'zod';

// Helper function to parse time strings to milliseconds
const parseTimeToMs = (timeStr: string): number => {
  const unit = timeStr.slice(-1);
  const value = parseInt(timeStr.slice(0, -1));
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return parseInt(timeStr);
  }
};

const configSchema = z.object({
  // Server Configuration
  PORT: z.coerce.number().min(1000).max(65535).default(4001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  TRUST_PROXY: z.coerce.boolean().default(true),
  
  // Database Configuration
  DATABASE_URL: z.string().url(),
  DB_POOL_SIZE: z.coerce.number().min(1).max(100).default(10),
  DB_CONNECTION_LIMIT: z.coerce.number().min(1).max(200).default(20),
  DB_POOL_TIMEOUT: z.coerce.number().min(1000).max(60000).default(5000), // 5 seconds
  DB_STATEMENT_TIMEOUT: z.coerce.number().min(1000).max(300000).default(30000), // 30 seconds
  DB_QUERY_TIMEOUT: z.coerce.number().min(1000).max(300000).default(60000), // 60 seconds
  DB_TRANSACTION_TIMEOUT: z.coerce.number().min(1000).max(600000).default(120000), // 2 minutes
  DB_CONNECT_TIMEOUT: z.coerce.number().min(1000).max(30000).default(10000), // 10 seconds
  DB_IDLE_TIMEOUT: z.coerce.number().min(10000).max(600000).default(600000), // 10 minutes
  DB_ACQUIRE_TIMEOUT: z.coerce.number().min(1000).max(60000).default(20000), // 20 seconds
  DB_ENABLE_LOGGING: z.coerce.boolean().default(false),
  DB_LOG_SLOW_QUERIES: z.coerce.boolean().default(true),
  DB_SLOW_QUERY_THRESHOLD: z.coerce.number().min(100).max(10000).default(1000), // 1 second
  
  // Redis Configuration
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_MAX_RETRIES: z.coerce.number().min(0).max(10).default(3),
  REDIS_RETRY_DELAY_MS: z.coerce.number().default(1000),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  JWT_ALGORITHM: z.enum(['HS256', 'HS384', 'HS512']).default('HS256'),
  
  // Email Service (SendGrid)
  SENDGRID_API_KEY: z.string().startsWith('SG.'),
  EMAIL_FROM: z.string().email().default('noreply@zoptal.com'),
  SENDGRID_FROM_EMAIL: z.string().email().default('noreply@zoptal.com'),
  EMAIL_REPLY_TO: z.string().email().optional(),
  
  // SMS Service (Twilio)
  TWILIO_ACCOUNT_SID: z.string().startsWith('AC'),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string().regex(/^\+\d{10,15}$/, 'Phone number must be in E.164 format'),
  
  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Application URLs
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:4001'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW: z.string().default('15m'),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().min(1).max(10000).default(100),
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().min(1).max(50).default(5),
  RATE_LIMIT_LOGIN_WINDOW: z.string().default('15m'),
  RATE_LIMIT_REGISTER_MAX: z.coerce.number().min(1).max(20).default(3),
  RATE_LIMIT_REGISTER_WINDOW: z.string().default('1h'),
  
  // Security Configuration
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(12),
  OTP_SECRET: z.string().min(32, 'OTP secret must be at least 32 characters'),
  OTP_EXPIRY_MINUTES: z.coerce.number().min(1).max(60).default(10),
  PASSWORD_MIN_LENGTH: z.coerce.number().min(6).max(128).default(8),
  
  // Session Configuration
  SESSION_SECRET: z.string().min(32).optional(),
  SESSION_MAX_AGE_MS: z.coerce.number().default(24 * 60 * 60 * 1000), // 24 hours
  MAX_CONCURRENT_SESSIONS: z.coerce.number().min(1).max(50).default(5),
  
  // Account Security
  MAX_LOGIN_ATTEMPTS: z.coerce.number().min(3).max(20).default(5),
  ACCOUNT_LOCKOUT_DURATION: z.string().default('15m'),
  PASSWORD_RESET_EXPIRY: z.string().default('1h'),
  EMAIL_VERIFICATION_EXPIRY: z.string().default('24h'),
  
  // Logging Configuration
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  ENABLE_REQUEST_LOGGING: z.coerce.boolean().default(true),
  
  // Monitoring (Optional)
  SENTRY_DSN: z.string().url().optional(),
  HEALTH_CHECK_ENDPOINT: z.string().default('/health'),
  
  // Feature Flags
  ENABLE_2FA: z.coerce.boolean().default(true),
  ENABLE_OAUTH: z.coerce.boolean().default(true),
  ENABLE_EMAIL_VERIFICATION: z.coerce.boolean().default(true),
  ENABLE_PHONE_VERIFICATION: z.coerce.boolean().default(true),
  ENABLE_SAML: z.coerce.boolean().default(false),
});

type RawConfig = z.infer<typeof configSchema>;

interface ProcessedConfig extends RawConfig {
  // Computed/processed values
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_LOGIN_WINDOW_MS: number;
  RATE_LIMIT_REGISTER_WINDOW_MS: number;
  ACCOUNT_LOCKOUT_DURATION_MS: number;
  PASSWORD_RESET_EXPIRY_MS: number;
  EMAIL_VERIFICATION_EXPIRY_MS: number;
  OTP_EXPIRY_MS: number;
  
  // Environment checks
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  
  // OAuth availability
  hasGoogleOAuth: boolean;
  hasGitHubOAuth: boolean;
}

const parseConfig = (): ProcessedConfig => {
  const result = configSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  
  const rawConfig = result.data;
  
  // Process time strings to milliseconds
  const processedConfig: ProcessedConfig = {
    ...rawConfig,
    
    // Convert time strings to milliseconds
    RATE_LIMIT_WINDOW_MS: parseTimeToMs(rawConfig.RATE_LIMIT_WINDOW),
    RATE_LIMIT_LOGIN_WINDOW_MS: parseTimeToMs(rawConfig.RATE_LIMIT_LOGIN_WINDOW),
    RATE_LIMIT_REGISTER_WINDOW_MS: parseTimeToMs(rawConfig.RATE_LIMIT_REGISTER_WINDOW),
    ACCOUNT_LOCKOUT_DURATION_MS: parseTimeToMs(rawConfig.ACCOUNT_LOCKOUT_DURATION),
    PASSWORD_RESET_EXPIRY_MS: parseTimeToMs(rawConfig.PASSWORD_RESET_EXPIRY),
    EMAIL_VERIFICATION_EXPIRY_MS: parseTimeToMs(rawConfig.EMAIL_VERIFICATION_EXPIRY),
    OTP_EXPIRY_MS: rawConfig.OTP_EXPIRY_MINUTES * 60 * 1000,
    
    // Environment flags
    isDevelopment: rawConfig.NODE_ENV === 'development',
    isProduction: rawConfig.NODE_ENV === 'production',
    isTest: rawConfig.NODE_ENV === 'test',
    
    // OAuth availability
    hasGoogleOAuth: !!(rawConfig.GOOGLE_CLIENT_ID && rawConfig.GOOGLE_CLIENT_SECRET),
    hasGitHubOAuth: !!(rawConfig.GITHUB_CLIENT_ID && rawConfig.GITHUB_CLIENT_SECRET),
  };
  
  // Validate OAuth configuration if enabled
  if (processedConfig.ENABLE_OAUTH) {
    if (!processedConfig.hasGoogleOAuth && !processedConfig.hasGitHubOAuth) {
      console.warn('⚠️  OAuth is enabled but no OAuth providers are configured');
    }
  }
  
  // Development warnings
  if (processedConfig.isDevelopment) {
    if (processedConfig.JWT_SECRET.length < 64) {
      console.warn('⚠️  JWT secret is shorter than recommended 64 characters for development');
    }
    if (processedConfig.BCRYPT_ROUNDS < 12) {
      console.warn('⚠️  BCrypt rounds are lower than recommended 12 for development');
    }
  }
  
  // Production validation
  if (processedConfig.isProduction) {
    const requiredSecrets = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'OTP_SECRET',
      'SENDGRID_API_KEY',
    ];
    
    for (const secret of requiredSecrets) {
      if (!process.env[secret] || process.env[secret]?.includes('your-') || process.env[secret]?.includes('example')) {
        console.error(`❌ Production requires a proper ${secret}`);
        process.exit(1);
      }
    }
    
    if (processedConfig.JWT_SECRET.length < 64) {
      console.error('❌ Production JWT secret must be at least 64 characters');
      process.exit(1);
    }
  }
  
  return processedConfig;
};

// Export the parsed and processed configuration
export const config = parseConfig();
export type Config = typeof config;

// Export individual configuration groups for easier imports
export const serverConfig = {
  port: config.PORT,
  host: config.HOST,
  nodeEnv: config.NODE_ENV,
  trustProxy: config.TRUST_PROXY,
  isDevelopment: config.isDevelopment,
  isProduction: config.isProduction,
  isTest: config.isTest,
};

export const databaseConfig = {
  url: config.DATABASE_URL,
  poolSize: config.DB_POOL_SIZE,
  connectionLimit: config.DB_CONNECTION_LIMIT,
  poolTimeout: config.DB_POOL_TIMEOUT,
  statementTimeout: config.DB_STATEMENT_TIMEOUT,
  queryTimeout: config.DB_QUERY_TIMEOUT,
  transactionTimeout: config.DB_TRANSACTION_TIMEOUT,
  connectTimeout: config.DB_CONNECT_TIMEOUT,
  idleTimeout: config.DB_IDLE_TIMEOUT,
  acquireTimeout: config.DB_ACQUIRE_TIMEOUT,
  enableLogging: config.DB_ENABLE_LOGGING,
  logSlowQueries: config.DB_LOG_SLOW_QUERIES,
  slowQueryThreshold: config.DB_SLOW_QUERY_THRESHOLD,
};

export const redisConfig = {
  url: config.REDIS_URL,
  maxRetries: config.REDIS_MAX_RETRIES,
  retryDelayMs: config.REDIS_RETRY_DELAY_MS,
};

export const jwtConfig = {
  secret: config.JWT_SECRET,
  refreshSecret: config.JWT_REFRESH_SECRET,
  accessTokenExpiry: config.JWT_ACCESS_TOKEN_EXPIRY,
  refreshTokenExpiry: config.JWT_REFRESH_TOKEN_EXPIRY,
  algorithm: config.JWT_ALGORITHM,
};

export const emailConfig = {
  apiKey: config.SENDGRID_API_KEY,
  from: config.EMAIL_FROM,
  fromEmail: config.SENDGRID_FROM_EMAIL,
  replyTo: config.EMAIL_REPLY_TO,
};

export const smsConfig = {
  accountSid: config.TWILIO_ACCOUNT_SID,
  authToken: config.TWILIO_AUTH_TOKEN,
  phoneNumber: config.TWILIO_PHONE_NUMBER,
};

export const oauthConfig = {
  enabled: config.ENABLE_OAUTH,
  google: {
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    enabled: config.hasGoogleOAuth,
  },
  github: {
    clientId: config.GITHUB_CLIENT_ID,
    clientSecret: config.GITHUB_CLIENT_SECRET,
    enabled: config.hasGitHubOAuth,
  },
};

export const securityConfig = {
  bcryptRounds: config.BCRYPT_ROUNDS,
  otpSecret: config.OTP_SECRET,
  otpExpiryMs: config.OTP_EXPIRY_MS,
  passwordMinLength: config.PASSWORD_MIN_LENGTH,
  maxLoginAttempts: config.MAX_LOGIN_ATTEMPTS,
  accountLockoutDurationMs: config.ACCOUNT_LOCKOUT_DURATION_MS,
  passwordResetExpiryMs: config.PASSWORD_RESET_EXPIRY_MS,
  emailVerificationExpiryMs: config.EMAIL_VERIFICATION_EXPIRY_MS,
};

export const rateLimitConfig = {
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  login: {
    max: config.RATE_LIMIT_LOGIN_MAX,
    windowMs: config.RATE_LIMIT_LOGIN_WINDOW_MS,
  },
  register: {
    max: config.RATE_LIMIT_REGISTER_MAX,
    windowMs: config.RATE_LIMIT_REGISTER_WINDOW_MS,
  },
};