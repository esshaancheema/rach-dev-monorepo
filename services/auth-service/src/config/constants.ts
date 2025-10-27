export const AUTH_CONSTANTS = {
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },

  // Token expiry times
  TOKEN_EXPIRY: {
    ACCESS_TOKEN: '15m',
    REFRESH_TOKEN: '7d',
    EMAIL_VERIFICATION: '24h',
    PASSWORD_RESET: '1h',
    OTP: '5m',
  },

  // Rate limiting
  RATE_LIMITS: {
    LOGIN: {
      MAX_ATTEMPTS: 5,
      WINDOW: '15m',
    },
    REGISTRATION: {
      MAX_ATTEMPTS: 3,
      WINDOW: '1h',
    },
    PASSWORD_RESET: {
      MAX_ATTEMPTS: 3,
      WINDOW: '1h',
    },
    EMAIL_VERIFICATION: {
      MAX_ATTEMPTS: 5,
      WINDOW: '1h',
    },
    API_CALLS: {
      MAX_REQUESTS: 100,
      WINDOW: '15m',
    },
  },

  // Session management
  SESSION: {
    MAX_ACTIVE_SESSIONS: 5,
    CLEANUP_INTERVAL: '1h',
    ACTIVITY_TIMEOUT: '30d',
  },

  // OTP settings
  OTP: {
    LENGTH: 6,
    EXPIRY: 300, // 5 minutes in seconds
    MAX_ATTEMPTS: 3,
  },

  // Account lockout
  LOCKOUT: {
    MAX_FAILED_ATTEMPTS: 5,
    LOCKOUT_DURATION: '15m',
    PROGRESSIVE_DELAY: true,
  },

  // Email templates
  EMAIL_TEMPLATES: {
    WELCOME: 'welcome',
    EMAIL_VERIFICATION: 'email-verification',
    PASSWORD_RESET: 'password-reset',
    PASSWORD_CHANGED: 'password-changed',
    ACCOUNT_LOCKED: 'account-locked',
    LOGIN_ALERT: 'login-alert',
  },

  // User roles
  USER_ROLES: {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
  },

  // Account status
  ACCOUNT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING_VERIFICATION: 'pending_verification',
  },

  // 2FA settings
  TWO_FA: {
    SECRET_LENGTH: 32,
    BACKUP_CODES_COUNT: 10,
    WINDOW: 1, // Time window for TOTP validation
  },

  // Verification settings
  VERIFICATION: {
    EMAIL_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    PHONE_EXPIRY: 15 * 60 * 1000, // 15 minutes in milliseconds
  },

  // Cache keys
  CACHE_KEYS: {
    USER_SESSION: 'user:session:',
    RATE_LIMIT: 'rate_limit:',
    FAILED_ATTEMPTS: 'failed_attempts:',
    PASSWORD_RESET_TOKEN: 'password_reset:',
    EMAIL_VERIFICATION_TOKEN: 'email_verification:',
    OTP: 'otp:',
    BLACKLISTED_TOKEN: 'blacklisted:',
  },

  // Security headers
  SECURITY_HEADERS: {
    HSTS_MAX_AGE: 31536000, // 1 year
    CSP_DIRECTIVES: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
} as const;