import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(4000),
  
  // JWT Configuration
  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  
  // Redis Configuration
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  
  // Service URLs
  AUTH_SERVICE_URL: Joi.string().default('http://auth-service:3001'),
  PROJECT_SERVICE_URL: Joi.string().default('http://project-service:3002'),
  AI_SERVICE_URL: Joi.string().default('http://ai-service:3003'),
  NOTIFICATION_SERVICE_URL: Joi.string().default('http://notification-service:3004'),
  BILLING_SERVICE_URL: Joi.string().default('http://billing-service:3005'),
  
  // CORS Configuration
  CORS_ORIGINS: Joi.string().default('http://localhost:3000,https://zoptal.com,https://*.zoptal.com'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(1000),
  
  // Query Limits
  MAX_QUERY_DEPTH: Joi.number().default(10),
  MAX_QUERY_COMPLEXITY: Joi.number().default(1000),
  
  // Cache Configuration
  CACHE_TTL: Joi.number().default(300), // 5 minutes
  
  // Monitoring
  ENABLE_METRICS: Joi.boolean().default(true),
  ENABLE_TRACING: Joi.boolean().default(true),
  
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  environment: envVars.NODE_ENV,
  port: envVars.PORT,
  
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },
  
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
  },
  
  services: {
    auth: envVars.AUTH_SERVICE_URL,
    project: envVars.PROJECT_SERVICE_URL,
    ai: envVars.AI_SERVICE_URL,
    notification: envVars.NOTIFICATION_SERVICE_URL,
    billing: envVars.BILLING_SERVICE_URL,
  },
  
  cors: {
    origins: envVars.CORS_ORIGINS.split(','),
  },
  
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
  },
  
  query: {
    maxDepth: envVars.MAX_QUERY_DEPTH,
    maxComplexity: envVars.MAX_QUERY_COMPLEXITY,
  },
  
  cache: {
    ttl: envVars.CACHE_TTL,
  },
  
  monitoring: {
    enableMetrics: envVars.ENABLE_METRICS,
    enableTracing: envVars.ENABLE_TRACING,
  },
};