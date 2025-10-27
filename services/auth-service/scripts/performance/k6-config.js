/**
 * K6 Performance Testing Configuration
 * 
 * This file contains configuration options and utilities for K6 performance tests.
 * It provides different test profiles and environment-specific settings.
 */

// Environment configurations
export const ENVIRONMENTS = {
  local: {
    baseUrl: 'http://localhost:3000',
    database: 'local',
    maxUsers: 50,
    testDuration: '2m'
  },
  
  development: {
    baseUrl: 'https://dev-auth.zoptal.com',
    database: 'development',
    maxUsers: 100,
    testDuration: '5m'
  },
  
  staging: {
    baseUrl: 'https://staging-auth.zoptal.com',
    database: 'staging',
    maxUsers: 200,
    testDuration: '10m'
  },
  
  production: {
    baseUrl: 'https://auth.zoptal.com',
    database: 'production',
    maxUsers: 500,
    testDuration: '15m'
  }
};

// Test profiles for different scenarios
export const TEST_PROFILES = {
  smoke: {
    description: 'Basic functionality test with minimal load',
    vus: 5,
    duration: '1m',
    thresholds: {
      http_req_duration: ['p(95)<500'],
      http_req_failed: ['rate<0.01'],
      http_reqs: ['rate>10']
    }
  },
  
  load: {
    description: 'Normal expected load testing',
    vus: 50,
    duration: '5m',
    thresholds: {
      http_req_duration: ['p(95)<1000'],
      http_req_failed: ['rate<0.05'],
      http_reqs: ['rate>50']
    }
  },
  
  stress: {
    description: 'Testing beyond normal capacity',
    vus: 100,
    duration: '10m',
    thresholds: {
      http_req_duration: ['p(95)<2000'],
      http_req_failed: ['rate<0.1'],
      system_stability: ['rate>0.8']
    }
  },
  
  spike: {
    description: 'Sudden load increases',
    stages: [
      { duration: '1m', target: 10 },
      { duration: '30s', target: 200 },
      { duration: '1m', target: 10 },
      { duration: '30s', target: 0 }
    ],
    thresholds: {
      http_req_duration: ['p(95)<3000'],
      http_req_failed: ['rate<0.15']
    }
  },
  
  volume: {
    description: 'Large data volume testing',
    vus: 30,
    duration: '15m',
    thresholds: {
      http_req_duration: ['p(95)<2000'],
      http_req_failed: ['rate<0.05'],
      memory_usage_mb: ['avg<1000']
    }
  },
  
  endurance: {
    description: 'Extended duration testing',
    vus: 20,
    duration: '30m',
    thresholds: {
      http_req_duration: ['p(95)<1500'],
      http_req_failed: ['rate<0.03'],
      memory_usage_mb: ['avg<800']
    }
  }
};

// Performance thresholds by endpoint category
export const ENDPOINT_THRESHOLDS = {
  authentication: {
    '/api/auth/login': {
      p95: 500,
      p99: 1000,
      errorRate: 0.01
    },
    '/api/auth/register': {
      p95: 800,
      p99: 1500,
      errorRate: 0.02
    },
    '/api/auth/refresh': {
      p95: 200,
      p99: 400,
      errorRate: 0.01
    },
    '/api/auth/logout': {
      p95: 100,
      p99: 200,
      errorRate: 0.005
    }
  },
  
  user_management: {
    '/api/users/profile': {
      p95: 300,
      p99: 600,
      errorRate: 0.02
    },
    '/api/users/export': {
      p95: 3000,
      p99: 5000,
      errorRate: 0.05
    },
    '/api/users/preferences': {
      p95: 400,
      p99: 800,
      errorRate: 0.02
    }
  },
  
  admin: {
    '/api/admin/users': {
      p95: 1000,
      p99: 2000,
      errorRate: 0.03
    },
    '/api/admin/metrics': {
      p95: 500,
      p99: 1000,
      errorRate: 0.01
    }
  },
  
  health: {
    '/health': {
      p95: 50,
      p99: 100,
      errorRate: 0.001
    },
    '/metrics': {
      p95: 100,
      p99: 200,
      errorRate: 0.001
    }
  }
};

// Load patterns for different user behaviors
export const LOAD_PATTERNS = {
  // Regular business hours pattern
  business_hours: {
    stages: [
      { duration: '30s', target: 5 },   // Early morning
      { duration: '2m', target: 20 },   // Morning ramp-up
      { duration: '3m', target: 50 },   // Peak morning
      { duration: '2m', target: 30 },   // Mid-day drop
      { duration: '3m', target: 60 },   // Afternoon peak
      { duration: '2m', target: 20 },   // Evening drop
      { duration: '30s', target: 5 },   // Night
      { duration: '30s', target: 0 }    // Cleanup
    ]
  },
  
  // Weekend traffic pattern
  weekend: {
    stages: [
      { duration: '1m', target: 10 },
      { duration: '5m', target: 25 },
      { duration: '5m', target: 15 },
      { duration: '1m', target: 0 }
    ]
  },
  
  // Black Friday / high traffic event
  high_traffic_event: {
    stages: [
      { duration: '2m', target: 50 },
      { duration: '5m', target: 200 },
      { duration: '10m', target: 300 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 0 }
    ]
  },
  
  // Gradual scaling pattern
  gradual_scale: {
    stages: [
      { duration: '2m', target: 20 },
      { duration: '2m', target: 40 },
      { duration: '2m', target: 60 },
      { duration: '2m', target: 80 },
      { duration: '2m', target: 100 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 0 }
    ]
  }
};

// User behavior patterns
export const USER_BEHAVIORS = {
  // New user registration flow
  new_user: {
    actions: [
      { endpoint: '/api/auth/register', weight: 1, pause: 2 },
      { endpoint: '/api/auth/verify-email', weight: 0.8, pause: 5 },
      { endpoint: '/api/users/profile', weight: 0.9, pause: 1 },
      { endpoint: '/api/users/preferences', weight: 0.7, pause: 2 }
    ]
  },
  
  // Regular user session
  regular_user: {
    actions: [
      { endpoint: '/api/auth/login', weight: 1, pause: 1 },
      { endpoint: '/api/users/profile', weight: 0.8, pause: 2 },
      { endpoint: '/api/users/preferences', weight: 0.5, pause: 3 },
      { endpoint: '/api/auth/logout', weight: 0.9, pause: 1 }
    ]
  },
  
  // Power user (heavy usage)
  power_user: {
    actions: [
      { endpoint: '/api/auth/login', weight: 1, pause: 0.5 },
      { endpoint: '/api/users/profile', weight: 1, pause: 1 },
      { endpoint: '/api/users/export', weight: 0.3, pause: 10 },
      { endpoint: '/api/users/preferences', weight: 0.8, pause: 2 },
      { endpoint: '/api/auth/refresh', weight: 0.9, pause: 1 },
      { endpoint: '/api/auth/logout', weight: 0.7, pause: 1 }
    ]
  },
  
  // Admin user behavior
  admin_user: {
    actions: [
      { endpoint: '/api/auth/login', weight: 1, pause: 1 },
      { endpoint: '/api/admin/users', weight: 0.8, pause: 3 },
      { endpoint: '/api/admin/metrics', weight: 0.9, pause: 2 },
      { endpoint: '/api/admin/dashboard/stats', weight: 0.7, pause: 2 },
      { endpoint: '/api/auth/logout', weight: 0.8, pause: 1 }
    ]
  },
  
  // API client behavior
  api_client: {
    actions: [
      { endpoint: '/api/auth/login', weight: 1, pause: 0.1 },
      { endpoint: '/api/users/profile', weight: 0.9, pause: 0.2 },
      { endpoint: '/api/auth/refresh', weight: 0.8, pause: 0.1 },
      { endpoint: '/api/auth/logout', weight: 0.3, pause: 0.1 }
    ]
  }
};

// Performance monitoring configuration
export const MONITORING_CONFIG = {
  // Custom metrics to track
  customMetrics: [
    'auth_success_rate',
    'auth_duration',
    'registration_rate',
    'api_error_rate',
    'concurrent_users',
    'system_stability',
    'memory_usage_mb',
    'cpu_usage_percent',
    'active_connections',
    'error_recovery_time',
    'throughput_degradation'
  ],
  
  // Alert thresholds
  alerts: {
    critical: {
      error_rate: 0.1,
      response_time_p95: 5000,
      memory_usage: 2000, // MB
      cpu_usage: 90 // %
    },
    warning: {
      error_rate: 0.05,
      response_time_p95: 2000,
      memory_usage: 1000, // MB
      cpu_usage: 70 // %
    }
  },
  
  // Metrics collection intervals
  intervals: {
    system_metrics: '10s',
    performance_metrics: '5s',
    health_check: '30s'
  }
};

// Test data configuration
export const TEST_DATA_CONFIG = {
  users: {
    count: 100,
    emailDomain: 'perftest.zoptal.com',
    passwordPattern: 'PerfTest123!',
    userTypes: {
      regular: 0.7,
      power: 0.2,
      admin: 0.1
    }
  },
  
  payloads: {
    small: 100,    // bytes
    medium: 1000,  // bytes
    large: 10000,  // bytes
    xlarge: 100000 // bytes
  },
  
  sessions: {
    shortSession: '2m',
    mediumSession: '10m',
    longSession: '30m'
  }
};

// Utility functions for configuration
export function getEnvironmentConfig(env = 'local') {
  return ENVIRONMENTS[env] || ENVIRONMENTS.local;
}

export function getTestProfile(profile = 'load') {
  return TEST_PROFILES[profile] || TEST_PROFILES.load;
}

export function getEndpointThreshold(endpoint) {
  for (const category of Object.keys(ENDPOINT_THRESHOLDS)) {
    if (ENDPOINT_THRESHOLDS[category][endpoint]) {
      return ENDPOINT_THRESHOLDS[category][endpoint];
    }
  }
  return {
    p95: 1000,
    p99: 2000,
    errorRate: 0.05
  };
}

export function generateLoadPattern(pattern = 'business_hours') {
  return LOAD_PATTERNS[pattern] || LOAD_PATTERNS.business_hours;
}

export function getUserBehavior(type = 'regular_user') {
  return USER_BEHAVIORS[type] || USER_BEHAVIORS.regular_user;
}

// Configuration validation
export function validateConfig(config) {
  const errors = [];
  
  if (!config.baseUrl) {
    errors.push('baseUrl is required');
  }
  
  if (!config.scenarios && !config.vus) {
    errors.push('Either scenarios or vus must be defined');
  }
  
  if (config.thresholds) {
    for (const [metric, threshold] of Object.entries(config.thresholds)) {
      if (!Array.isArray(threshold)) {
        errors.push(`Threshold for ${metric} must be an array`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Generate test configuration based on environment and profile
export function generateTestConfig(env = 'local', profile = 'load', options = {}) {
  const envConfig = getEnvironmentConfig(env);
  const profileConfig = getTestProfile(profile);
  
  const config = {
    ...envConfig,
    ...profileConfig,
    ...options
  };
  
  const validation = validateConfig(config);
  if (!validation.valid) {
    throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
  }
  
  return config;
}

// Export default configuration
export default {
  ENVIRONMENTS,
  TEST_PROFILES,
  ENDPOINT_THRESHOLDS,
  LOAD_PATTERNS,
  USER_BEHAVIORS,
  MONITORING_CONFIG,
  TEST_DATA_CONFIG,
  getEnvironmentConfig,
  getTestProfile,
  getEndpointThreshold,
  generateLoadPattern,
  getUserBehavior,
  validateConfig,
  generateTestConfig
};