import { z } from 'zod';

const configSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4003),
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
  
  // OpenAI Configuration
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_ORGANIZATION: z.string().optional(),
  OPENAI_MAX_TOKENS: z.coerce.number().default(4000),
  OPENAI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  OPENAI_DEFAULT_MODEL: z.string().default('gpt-4'),
  
  // Anthropic Configuration  
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MAX_TOKENS: z.coerce.number().default(4000),
  ANTHROPIC_TEMPERATURE: z.coerce.number().min(0).max(1).default(0.7),
  ANTHROPIC_DEFAULT_MODEL: z.string().default('claude-3-sonnet-20240229'),
  
  // Google AI Configuration
  GOOGLE_AI_API_KEY: z.string().optional(),
  GOOGLE_AI_PROJECT_ID: z.string().optional(),
  GOOGLE_AI_MAX_TOKENS: z.coerce.number().default(4000),
  GOOGLE_AI_TEMPERATURE: z.coerce.number().min(0).max(1).default(0.7),
  GOOGLE_AI_DEFAULT_MODEL: z.string().default('gemini-pro'),
  
  // File Storage
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().default('zoptal-ai-files'),
  
  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  
  // Feature Flags
  ENABLE_OPENAI: z.coerce.boolean().default(true),
  ENABLE_ANTHROPIC: z.coerce.boolean().default(true),
  ENABLE_GOOGLE_AI: z.coerce.boolean().default(true),
  ENABLE_IMAGE_ANALYSIS: z.coerce.boolean().default(true),
  ENABLE_CODE_GENERATION: z.coerce.boolean().default(true),
  ENABLE_CONVERSATION_MEMORY: z.coerce.boolean().default(true),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().default('15m'),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(50),
  
  // AI Processing Limits
  MAX_CONCURRENT_REQUESTS: z.coerce.number().default(10),
  REQUEST_TIMEOUT: z.coerce.number().default(120000), // 2 minutes
  MAX_FILE_SIZE: z.coerce.number().default(10485760), // 10MB
  
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
  issuer: 'zoptal-ai-service',
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: parseTimeString(config.RATE_LIMIT_WINDOW),
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
};

// OpenAI configuration
export const openaiConfig = {
  apiKey: config.OPENAI_API_KEY,
  organization: config.OPENAI_ORGANIZATION,
  maxTokens: config.OPENAI_MAX_TOKENS,
  temperature: config.OPENAI_TEMPERATURE,
  defaultModel: config.OPENAI_DEFAULT_MODEL,
  enabled: config.ENABLE_OPENAI && !!config.OPENAI_API_KEY,
};

// Anthropic configuration
export const anthropicConfig = {
  apiKey: config.ANTHROPIC_API_KEY,
  maxTokens: config.ANTHROPIC_MAX_TOKENS,
  temperature: config.ANTHROPIC_TEMPERATURE,
  defaultModel: config.ANTHROPIC_DEFAULT_MODEL,
  enabled: config.ENABLE_ANTHROPIC && !!config.ANTHROPIC_API_KEY,
};

// Google AI configuration
export const googleAiConfig = {
  apiKey: config.GOOGLE_AI_API_KEY,
  projectId: config.GOOGLE_AI_PROJECT_ID,
  maxTokens: config.GOOGLE_AI_MAX_TOKENS,
  temperature: config.GOOGLE_AI_TEMPERATURE,
  defaultModel: config.GOOGLE_AI_DEFAULT_MODEL,
  enabled: config.ENABLE_GOOGLE_AI && !!config.GOOGLE_AI_API_KEY,
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

// Processing configuration
export const processingConfig = {
  maxConcurrentRequests: config.MAX_CONCURRENT_REQUESTS,
  requestTimeout: config.REQUEST_TIMEOUT,
  maxFileSize: config.MAX_FILE_SIZE,
};

// Feature flags
export const features = {
  openai: openaiConfig.enabled,
  anthropic: anthropicConfig.enabled,
  googleAi: googleAiConfig.enabled,
  imageAnalysis: config.ENABLE_IMAGE_ANALYSIS,
  codeGeneration: config.ENABLE_CODE_GENERATION,
  conversationMemory: config.ENABLE_CONVERSATION_MEMORY,
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