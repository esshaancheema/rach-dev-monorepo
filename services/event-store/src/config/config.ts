import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3100),
  
  // MongoDB Configuration
  MONGODB_URL: Joi.string().required().description('MongoDB connection URL'),
  MONGODB_DATABASE: Joi.string().default('zoptal_eventstore'),
  
  // Redis Configuration
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  
  // CORS Configuration
  CORS_ORIGINS: Joi.string().default('http://localhost:3000,https://zoptal.com,https://*.zoptal.com'),
  
  // Event Store Configuration
  EVENT_BATCH_SIZE: Joi.number().default(1000),
  SNAPSHOT_FREQUENCY: Joi.number().default(10),
  
  // Projection Configuration
  PROJECTION_CATCHUP_INTERVAL: Joi.number().default(10000), // ms
  PROJECTION_BATCH_SIZE: Joi.number().default(100),
  
  // Command Bus Configuration
  COMMAND_QUEUE_CONCURRENCY: Joi.number().default(10),
  COMMAND_RETRY_ATTEMPTS: Joi.number().default(3),
  COMMAND_RETRY_DELAY: Joi.number().default(2000), // ms
  
  // Logging Configuration
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  
  // Security Configuration
  ENABLE_ADMIN_ENDPOINTS: Joi.boolean().default(false),
  
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  environment: envVars.NODE_ENV,
  port: envVars.PORT,
  
  mongodb: {
    url: envVars.MONGODB_URL,
    database: envVars.MONGODB_DATABASE,
  },
  
  redis: {
    url: envVars.REDIS_URL,
  },
  
  cors: {
    origins: envVars.CORS_ORIGINS.split(','),
  },
  
  eventStore: {
    batchSize: envVars.EVENT_BATCH_SIZE,
    snapshotFrequency: envVars.SNAPSHOT_FREQUENCY,
  },
  
  projections: {
    catchupInterval: envVars.PROJECTION_CATCHUP_INTERVAL,
    batchSize: envVars.PROJECTION_BATCH_SIZE,
  },
  
  commandBus: {
    concurrency: envVars.COMMAND_QUEUE_CONCURRENCY,
    retryAttempts: envVars.COMMAND_RETRY_ATTEMPTS,
    retryDelay: envVars.COMMAND_RETRY_DELAY,
  },
  
  logging: {
    level: envVars.LOG_LEVEL,
  },
  
  security: {
    enableAdminEndpoints: envVars.ENABLE_ADMIN_ENDPOINTS,
  },
};