import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '4007', 10),
    host: process.env.HOST || '0.0.0.0',
    baseUrl: process.env.BASE_URL || 'http://localhost:4007',
  },
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://abtestuser:abtestpassword@localhost:5432/zoptal_abtest',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379/3',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '3', 10),
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'abtest-jwt-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://zoptal.com',
      'https://*.zoptal.com',
      'https://app.zoptal.com',
    ],
  },
  
  analytics: {
    clickhouseUrl: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
    analyticsServiceUrl: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4006',
  },
  
  email: {
    service: process.env.EMAIL_SERVICE || 'sendgrid',
    apiKey: process.env.EMAIL_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@zoptal.com',
    fromName: process.env.FROM_NAME || 'Zoptal A/B Testing',
  },
  
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    botToken: process.env.SLACK_BOT_TOKEN || '',
  },
  
  // A/B Testing specific configuration
  abTesting: {
    minSampleSize: parseInt(process.env.MIN_SAMPLE_SIZE || '100', 10),
    maxExperiments: parseInt(process.env.MAX_EXPERIMENTS || '50', 10),
    defaultSignificanceLevel: parseFloat(process.env.DEFAULT_SIGNIFICANCE_LEVEL || '0.05'),
    defaultPower: parseFloat(process.env.DEFAULT_POWER || '0.8'),
    defaultMde: parseFloat(process.env.DEFAULT_MDE || '0.05'), // Minimum Detectable Effect
    autoStopEnabled: process.env.AUTO_STOP_ENABLED === 'true',
    autoStopThreshold: parseFloat(process.env.AUTO_STOP_THRESHOLD || '0.99'),
    maxExperimentDuration: parseInt(process.env.MAX_EXPERIMENT_DURATION || '90', 10), // days
    segmentationEnabled: process.env.SEGMENTATION_ENABLED !== 'false',
    cacheExperimentsTtl: parseInt(process.env.CACHE_EXPERIMENTS_TTL || '300', 10), // seconds
    batchProcessingInterval: parseInt(process.env.BATCH_PROCESSING_INTERVAL || '60', 10), // seconds
  },
  
  // Feature flags configuration
  featureFlags: {
    defaultRolloutPercentage: parseFloat(process.env.DEFAULT_ROLLOUT_PERCENTAGE || '0'),
    gradualRolloutEnabled: process.env.GRADUAL_ROLLOUT_ENABLED === 'true',
    killSwitchEnabled: process.env.KILL_SWITCH_ENABLED !== 'false',
    cacheFeatureFlagsTtl: parseInt(process.env.CACHE_FEATURE_FLAGS_TTL || '60', 10), // seconds
    maxFlags: parseInt(process.env.MAX_FLAGS || '1000', 10),
  },
  
  // Statistical analysis configuration
  statistics: {
    confidenceIntervals: [0.90, 0.95, 0.99],
    bayesianEnabled: process.env.BAYESIAN_ENABLED === 'true',
    sequentialTestingEnabled: process.env.SEQUENTIAL_TESTING_ENABLED === 'true',
    bonferroniCorrection: process.env.BONFERRONI_CORRECTION === 'true',
    multipleTestingCorrection: process.env.MULTIPLE_TESTING_CORRECTION || 'bonferroni',
  },
  
  // Performance and scaling
  performance: {
    maxConcurrentExperiments: parseInt(process.env.MAX_CONCURRENT_EXPERIMENTS || '20', 10),
    cacheBatchSize: parseInt(process.env.CACHE_BATCH_SIZE || '1000', 10),
    metricsRetentionDays: parseInt(process.env.METRICS_RETENTION_DAYS || '365', 10),
    cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL || '24', 10), // hours
  },
  
  // Monitoring and logging
  monitoring: {
    metricsEnabled: process.env.METRICS_ENABLED !== 'false',
    metricsPort: parseInt(process.env.METRICS_PORT || '9091', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
    enableQueryLogging: process.env.ENABLE_QUERY_LOGGING === 'true',
    enablePerformanceMetrics: process.env.ENABLE_PERFORMANCE_METRICS !== 'false',
  },
  
  // Security
  security: {
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
    apiKeyRequired: process.env.API_KEY_REQUIRED === 'true',
    encryptionKey: process.env.ENCRYPTION_KEY || 'abtest-encryption-key-change-in-production',
    hashingSalt: process.env.HASHING_SALT || 'abtest-salt-rounds-12',
  },
  
  // Integration settings
  integrations: {
    googleAnalyticsEnabled: process.env.GOOGLE_ANALYTICS_ENABLED === 'true',
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
    mixpanelEnabled: process.env.MIXPANEL_ENABLED === 'true',
    mixpanelToken: process.env.MIXPANEL_TOKEN || '',
    segmentEnabled: process.env.SEGMENT_ENABLED === 'true',
    segmentWriteKey: process.env.SEGMENT_WRITE_KEY || '',
    webhookUrl: process.env.WEBHOOK_URL || '',
    webhookSecret: process.env.WEBHOOK_SECRET || '',
  },
};