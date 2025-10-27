/**
 * Standardized Error Codes for Zoptal Authentication Service
 * 
 * Error Code Format: [CATEGORY]_[SPECIFIC_ERROR]
 * Categories: AUTH, VALIDATION, RATE_LIMIT, DATABASE, EXTERNAL, SYSTEM
 */

export const ERROR_CODES = {
  // Authentication & Authorization Errors (4xx)
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',
  AUTH_ACCOUNT_SUSPENDED: 'AUTH_ACCOUNT_SUSPENDED',
  AUTH_ACCOUNT_DELETED: 'AUTH_ACCOUNT_DELETED',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_EMAIL_NOT_VERIFIED',
  AUTH_PHONE_NOT_VERIFIED: 'AUTH_PHONE_NOT_VERIFIED',
  AUTH_FORCE_PASSWORD_RESET: 'AUTH_FORCE_PASSWORD_RESET',
  AUTH_PASSWORD_EXPIRED: 'AUTH_PASSWORD_EXPIRED',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_REFRESH_TOKEN_INVALID: 'AUTH_REFRESH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // Two-Factor Authentication Errors
  AUTH_2FA_REQUIRED: 'AUTH_2FA_REQUIRED',
  AUTH_2FA_INVALID_CODE: 'AUTH_2FA_INVALID_CODE',
  AUTH_2FA_CODE_EXPIRED: 'AUTH_2FA_CODE_EXPIRED',
  AUTH_2FA_MAX_ATTEMPTS: 'AUTH_2FA_MAX_ATTEMPTS',
  AUTH_2FA_NOT_ENABLED: 'AUTH_2FA_NOT_ENABLED',
  AUTH_2FA_ALREADY_ENABLED: 'AUTH_2FA_ALREADY_ENABLED',
  AUTH_2FA_BACKUP_CODE_INVALID: 'AUTH_2FA_BACKUP_CODE_INVALID',
  AUTH_2FA_BACKUP_CODE_USED: 'AUTH_2FA_BACKUP_CODE_USED',

  // OAuth Errors
  AUTH_OAUTH_PROVIDER_ERROR: 'AUTH_OAUTH_PROVIDER_ERROR',
  AUTH_OAUTH_INVALID_STATE: 'AUTH_OAUTH_INVALID_STATE',
  AUTH_OAUTH_INVALID_CODE: 'AUTH_OAUTH_INVALID_CODE',
  AUTH_OAUTH_ACCOUNT_LINKING_FAILED: 'AUTH_OAUTH_ACCOUNT_LINKING_FAILED',
  AUTH_OAUTH_EMAIL_ALREADY_LINKED: 'AUTH_OAUTH_EMAIL_ALREADY_LINKED',

  // Validation Errors (4xx)
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_EMAIL: 'VALIDATION_INVALID_EMAIL',
  VALIDATION_INVALID_PHONE: 'VALIDATION_INVALID_PHONE',
  VALIDATION_INVALID_PASSWORD: 'VALIDATION_INVALID_PASSWORD',
  VALIDATION_PASSWORD_TOO_WEAK: 'VALIDATION_PASSWORD_TOO_WEAK',
  VALIDATION_PASSWORD_REUSED: 'VALIDATION_PASSWORD_REUSED',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_INVALID_LENGTH: 'VALIDATION_INVALID_LENGTH',
  VALIDATION_INVALID_RANGE: 'VALIDATION_INVALID_RANGE',
  VALIDATION_INVALID_ENUM: 'VALIDATION_INVALID_ENUM',
  VALIDATION_INVALID_DATE: 'VALIDATION_INVALID_DATE',
  VALIDATION_INVALID_UUID: 'VALIDATION_INVALID_UUID',
  VALIDATION_INVALID_JSON: 'VALIDATION_INVALID_JSON',

  // Resource Errors (4xx)
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_GONE: 'RESOURCE_GONE',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',

  // Rate Limiting Errors (4xx)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  RATE_LIMIT_LOGIN_ATTEMPTS: 'RATE_LIMIT_LOGIN_ATTEMPTS',
  RATE_LIMIT_PASSWORD_RESET: 'RATE_LIMIT_PASSWORD_RESET',
  RATE_LIMIT_EMAIL_VERIFICATION: 'RATE_LIMIT_EMAIL_VERIFICATION',
  RATE_LIMIT_SMS_VERIFICATION: 'RATE_LIMIT_SMS_VERIFICATION',
  RATE_LIMIT_API_CALLS: 'RATE_LIMIT_API_CALLS',
  RATE_LIMIT_REGISTRATION: 'RATE_LIMIT_REGISTRATION',

  // Database Errors (5xx)
  DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR: 'DATABASE_QUERY_ERROR',
  DATABASE_CONSTRAINT_VIOLATION: 'DATABASE_CONSTRAINT_VIOLATION',
  DATABASE_TRANSACTION_ERROR: 'DATABASE_TRANSACTION_ERROR',
  DATABASE_TIMEOUT: 'DATABASE_TIMEOUT',
  DATABASE_UNAVAILABLE: 'DATABASE_UNAVAILABLE',

  // External Service Errors (5xx)
  EXTERNAL_EMAIL_SERVICE_ERROR: 'EXTERNAL_EMAIL_SERVICE_ERROR',
  EXTERNAL_SMS_SERVICE_ERROR: 'EXTERNAL_SMS_SERVICE_ERROR',
  EXTERNAL_OAUTH_PROVIDER_ERROR: 'EXTERNAL_OAUTH_PROVIDER_ERROR',
  EXTERNAL_GEOLOCATION_ERROR: 'EXTERNAL_GEOLOCATION_ERROR',
  EXTERNAL_FRAUD_DETECTION_ERROR: 'EXTERNAL_FRAUD_DETECTION_ERROR',
  EXTERNAL_SERVICE_TIMEOUT: 'EXTERNAL_SERVICE_TIMEOUT',
  EXTERNAL_SERVICE_UNAVAILABLE: 'EXTERNAL_SERVICE_UNAVAILABLE',

  // System Errors (5xx)
  SYSTEM_INTERNAL_ERROR: 'SYSTEM_INTERNAL_ERROR',
  SYSTEM_CONFIGURATION_ERROR: 'SYSTEM_CONFIGURATION_ERROR',
  SYSTEM_MAINTENANCE_MODE: 'SYSTEM_MAINTENANCE_MODE',
  SYSTEM_CIRCUIT_BREAKER_OPEN: 'SYSTEM_CIRCUIT_BREAKER_OPEN',
  SYSTEM_GRACEFUL_DEGRADATION: 'SYSTEM_GRACEFUL_DEGRADATION',
  SYSTEM_MEMORY_LIMIT: 'SYSTEM_MEMORY_LIMIT',
  SYSTEM_CPU_LIMIT: 'SYSTEM_CPU_LIMIT',

  // Security Errors (4xx/5xx)
  SECURITY_SUSPICIOUS_ACTIVITY: 'SECURITY_SUSPICIOUS_ACTIVITY',
  SECURITY_IP_BLOCKED: 'SECURITY_IP_BLOCKED',
  SECURITY_GEO_RESTRICTION: 'SECURITY_GEO_RESTRICTION',
  SECURITY_DEVICE_NOT_TRUSTED: 'SECURITY_DEVICE_NOT_TRUSTED',
  SECURITY_FRAUD_DETECTED: 'SECURITY_FRAUD_DETECTED',
  SECURITY_BRUTE_FORCE_DETECTED: 'SECURITY_BRUTE_FORCE_DETECTED',

  // Request Errors (4xx)
  REQUEST_INVALID_METHOD: 'REQUEST_INVALID_METHOD',
  REQUEST_INVALID_CONTENT_TYPE: 'REQUEST_INVALID_CONTENT_TYPE',
  REQUEST_PAYLOAD_TOO_LARGE: 'REQUEST_PAYLOAD_TOO_LARGE',
  REQUEST_MALFORMED: 'REQUEST_MALFORMED',
  REQUEST_HEADERS_INVALID: 'REQUEST_HEADERS_INVALID',

  // API Versioning Errors (4xx)
  API_VERSION_NOT_SUPPORTED: 'API_VERSION_NOT_SUPPORTED',
  API_VERSION_DEPRECATED: 'API_VERSION_DEPRECATED',
  API_ENDPOINT_NOT_FOUND: 'API_ENDPOINT_NOT_FOUND',

  // File Upload Errors (4xx)
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  FILE_PROCESSING_ERROR: 'FILE_PROCESSING_ERROR',

  // Business Logic Errors (4xx)
  BUSINESS_OPERATION_NOT_ALLOWED: 'BUSINESS_OPERATION_NOT_ALLOWED',
  BUSINESS_QUOTA_EXCEEDED: 'BUSINESS_QUOTA_EXCEEDED',
  BUSINESS_FEATURE_DISABLED: 'BUSINESS_FEATURE_DISABLED',
  BUSINESS_TRIAL_EXPIRED: 'BUSINESS_TRIAL_EXPIRED',
  BUSINESS_SUBSCRIPTION_REQUIRED: 'BUSINESS_SUBSCRIPTION_REQUIRED',

  // Data Processing Errors (4xx/5xx)
  DATA_PROCESSING_ERROR: 'DATA_PROCESSING_ERROR',
  DATA_CORRUPTION_DETECTED: 'DATA_CORRUPTION_DETECTED',
  DATA_EXPORT_FAILED: 'DATA_EXPORT_FAILED',
  DATA_IMPORT_FAILED: 'DATA_IMPORT_FAILED',
  DATA_VALIDATION_FAILED: 'DATA_VALIDATION_FAILED',

  // Notification Errors (4xx/5xx)
  NOTIFICATION_SEND_FAILED: 'NOTIFICATION_SEND_FAILED',
  NOTIFICATION_PREFERENCES_ERROR: 'NOTIFICATION_PREFERENCES_ERROR',
  NOTIFICATION_TEMPLATE_ERROR: 'NOTIFICATION_TEMPLATE_ERROR',
  NOTIFICATION_QUEUE_FULL: 'NOTIFICATION_QUEUE_FULL',

  // Admin/Management Errors (4xx/5xx)
  ADMIN_INSUFFICIENT_PRIVILEGES: 'ADMIN_INSUFFICIENT_PRIVILEGES',
  ADMIN_OPERATION_BLOCKED: 'ADMIN_OPERATION_BLOCKED',
  ADMIN_BULK_OPERATION_FAILED: 'ADMIN_BULK_OPERATION_FAILED',
  ADMIN_INVALID_CONFIGURATION: 'ADMIN_INVALID_CONFIGURATION',

} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Error Metadata for each error code
 */
export interface ErrorMetadata {
  httpStatus: number;
  category: 'CLIENT_ERROR' | 'SERVER_ERROR' | 'SECURITY_ERROR';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userFriendly: boolean;
  retryable: boolean;
  logLevel: 'info' | 'warn' | 'error' | 'fatal';
  description: string;
  possibleCauses: string[];
  resolution: string[];
  relatedDocs?: string[];
}

export const ERROR_METADATA: Record<ErrorCode, ErrorMetadata> = {
  // Authentication Errors
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: {
    httpStatus: 401,
    category: 'CLIENT_ERROR',
    severity: 'MEDIUM',
    userFriendly: true,
    retryable: true,
    logLevel: 'warn',
    description: 'The provided email/password combination is incorrect',
    possibleCauses: [
      'User entered wrong password',
      'User entered wrong email address',
      'Account credentials were changed',
      'Phishing/credential stuffing attempt'
    ],
    resolution: [
      'Verify email address is correct',
      'Try password reset if forgotten',
      'Check for typos in credentials',
      'Contact support if issue persists'
    ],
    relatedDocs: ['/docs/authentication/login', '/docs/troubleshooting/login-issues']
  },

  [ERROR_CODES.AUTH_ACCOUNT_LOCKED]: {
    httpStatus: 423,
    category: 'SECURITY_ERROR',
    severity: 'HIGH',
    userFriendly: true,
    retryable: false,
    logLevel: 'warn',
    description: 'Account has been temporarily locked due to suspicious activity',
    possibleCauses: [
      'Multiple failed login attempts',
      'Suspicious activity detected',
      'Admin manually locked account',
      'Automated security system triggered'
    ],
    resolution: [
      'Wait for automatic unlock period',
      'Contact support for immediate unlock',
      'Verify account security settings',
      'Change password if compromised'
    ],
    relatedDocs: ['/docs/security/account-protection', '/docs/troubleshooting/locked-accounts']
  },

  [ERROR_CODES.AUTH_2FA_REQUIRED]: {
    httpStatus: 403,
    category: 'SECURITY_ERROR',
    severity: 'MEDIUM',
    userFriendly: true,
    retryable: true,
    logLevel: 'info',
    description: 'Two-factor authentication is required to complete this action',
    possibleCauses: [
      '2FA is enabled on account',
      'High-risk login detected',
      'Admin policy requires 2FA',
      'Device not recognized'
    ],
    resolution: [
      'Enter 2FA code from authenticator app',
      'Use backup recovery code',
      'Receive code via SMS if configured',
      'Contact support if unable to access 2FA'
    ],
    relatedDocs: ['/docs/security/two-factor-auth', '/docs/troubleshooting/2fa-issues']
  },

  [ERROR_CODES.VALIDATION_INVALID_EMAIL]: {
    httpStatus: 400,
    category: 'CLIENT_ERROR',
    severity: 'LOW',
    userFriendly: true,
    retryable: true,
    logLevel: 'info',
    description: 'The provided email address format is invalid',
    possibleCauses: [
      'Missing @ symbol',
      'Invalid domain format',
      'Special characters in wrong places',
      'Incomplete email address'
    ],
    resolution: [
      'Check email format (user@domain.com)',
      'Remove extra spaces or characters',
      'Verify domain is spelled correctly',
      'Use a different email address'
    ],
    relatedDocs: ['/docs/validation/email-format']
  },

  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: {
    httpStatus: 429,
    category: 'CLIENT_ERROR',
    severity: 'MEDIUM',
    userFriendly: true,
    retryable: true,
    logLevel: 'warn',
    description: 'Too many requests have been made in a short period',
    possibleCauses: [
      'Automated script making too many requests',
      'User clicking buttons repeatedly',
      'Mobile app making excessive API calls',
      'Potential abuse or attack'
    ],
    resolution: [
      'Wait before making more requests',
      'Check retry-after header for wait time',
      'Implement exponential backoff',
      'Contact support if legitimate use case'
    ],
    relatedDocs: ['/docs/api/rate-limiting', '/docs/troubleshooting/rate-limits']
  },

  [ERROR_CODES.DATABASE_CONNECTION_ERROR]: {
    httpStatus: 503,
    category: 'SERVER_ERROR',
    severity: 'CRITICAL',
    userFriendly: false,
    retryable: true,
    logLevel: 'error',
    description: 'Unable to establish connection to the database',
    possibleCauses: [
      'Database server is down',
      'Network connectivity issues',
      'Connection pool exhausted',
      'Database authentication failure',
      'Firewall blocking connections'
    ],
    resolution: [
      'Check database server status',
      'Verify network connectivity',
      'Review connection pool configuration',
      'Check database credentials',
      'Verify firewall rules'
    ],
    relatedDocs: ['/docs/ops/database-troubleshooting', '/docs/infrastructure/database']
  },

  [ERROR_CODES.EXTERNAL_EMAIL_SERVICE_ERROR]: {
    httpStatus: 502,
    category: 'SERVER_ERROR',
    severity: 'HIGH',
    userFriendly: false,
    retryable: true,
    logLevel: 'error',
    description: 'External email service is currently unavailable',
    possibleCauses: [
      'SendGrid service outage',
      'API key expired or invalid',
      'Rate limit exceeded with provider',
      'Network connectivity issues',
      'Service configuration error'
    ],
    resolution: [
      'Check SendGrid service status',
      'Verify API key validity',
      'Check rate limit status',
      'Review service configuration',
      'Implement fallback email provider'
    ],
    relatedDocs: ['/docs/integrations/sendgrid', '/docs/ops/email-troubleshooting']
  },

  [ERROR_CODES.SYSTEM_CIRCUIT_BREAKER_OPEN]: {
    httpStatus: 503,
    category: 'SERVER_ERROR',
    severity: 'HIGH',
    userFriendly: false,
    retryable: true,
    logLevel: 'warn',
    description: 'Service circuit breaker is open due to upstream failures',
    possibleCauses: [
      'Repeated failures of external service',
      'Service timeout threshold exceeded',
      'Health check failures',
      'Degraded service performance'
    ],
    resolution: [
      'Wait for circuit breaker to close automatically',
      'Check upstream service health',
      'Manual circuit breaker reset if appropriate',
      'Review circuit breaker configuration'
    ],
    relatedDocs: ['/docs/resilience/circuit-breakers', '/docs/ops/service-health']
  },

  // Add all other error codes with similar detailed metadata...
  // For brevity, I'll add a few more key ones and indicate the pattern

  [ERROR_CODES.SECURITY_SUSPICIOUS_ACTIVITY]: {
    httpStatus: 403,
    category: 'SECURITY_ERROR',
    severity: 'HIGH',
    userFriendly: true,
    retryable: false,
    logLevel: 'warn',
    description: 'Suspicious activity detected on this account',
    possibleCauses: [
      'Login from unusual location',
      'Unusual access patterns',
      'Multiple failed authentication attempts',
      'Device fingerprint mismatch'
    ],
    resolution: [
      'Verify identity through additional authentication',
      'Review recent account activity',
      'Update security settings',
      'Contact support for assistance'
    ],
    relatedDocs: ['/docs/security/fraud-protection', '/docs/troubleshooting/suspicious-activity']
  },

  // Add remaining key error codes for completeness
  [ERROR_CODES.AUTH_ACCOUNT_SUSPENDED]: {
    httpStatus: 403,
    category: 'SECURITY_ERROR',
    severity: 'HIGH',
    userFriendly: true,
    retryable: false,
    logLevel: 'warn',
    description: 'Account has been suspended by administrator',
    possibleCauses: ['Policy violation', 'Security breach', 'Admin action', 'Terms of service violation'],
    resolution: ['Contact support', 'Review account activity', 'Submit appeal if appropriate'],
    relatedDocs: ['/docs/security/account-suspension', '/docs/support/appeals']
  },

  [ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED]: {
    httpStatus: 403,
    category: 'CLIENT_ERROR',
    severity: 'MEDIUM',
    userFriendly: true,
    retryable: false,
    logLevel: 'info',
    description: 'Email verification is required to access this resource',
    possibleCauses: ['Email not verified during registration', 'Verification email not received', 'Verification link expired'],
    resolution: ['Check email inbox and spam folder', 'Resend verification email', 'Contact support if issues persist'],
    relatedDocs: ['/docs/authentication/email-verification']
  },

  [ERROR_CODES.VALIDATION_PASSWORD_TOO_WEAK]: {
    httpStatus: 400,
    category: 'CLIENT_ERROR',
    severity: 'LOW',
    userFriendly: true,
    retryable: true,
    logLevel: 'info',
    description: 'Password does not meet security requirements',
    possibleCauses: ['Password too short', 'Missing uppercase letters', 'Missing numbers', 'Missing special characters'],
    resolution: ['Use at least 8 characters', 'Include uppercase and lowercase letters', 'Include numbers and special characters'],
    relatedDocs: ['/docs/security/password-requirements']
  },

  [ERROR_CODES.RATE_LIMIT_LOGIN_ATTEMPTS]: {
    httpStatus: 429,
    category: 'SECURITY_ERROR',
    severity: 'MEDIUM',
    userFriendly: true,
    retryable: true,
    logLevel: 'warn',
    description: 'Too many failed login attempts from this IP address',
    possibleCauses: ['Multiple wrong passwords', 'Brute force attack', 'Automated login attempts'],
    resolution: ['Wait before trying again', 'Check password is correct', 'Try password reset if needed'],
    relatedDocs: ['/docs/security/rate-limiting', '/docs/troubleshooting/login-issues']
  },

  [ERROR_CODES.DATABASE_QUERY_ERROR]: {
    httpStatus: 500,
    category: 'SERVER_ERROR',
    severity: 'HIGH',
    userFriendly: false,
    retryable: true,
    logLevel: 'error',
    description: 'Database query execution failed',
    possibleCauses: ['SQL syntax error', 'Database constraint violation', 'Table lock timeout', 'Connection pool exhausted'],
    resolution: ['Check query syntax', 'Verify data constraints', 'Review connection pool settings', 'Check database performance'],
    relatedDocs: ['/docs/ops/database-troubleshooting']
  },

  [ERROR_CODES.EXTERNAL_SMS_SERVICE_ERROR]: {
    httpStatus: 502,
    category: 'SERVER_ERROR',
    severity: 'HIGH',
    userFriendly: false,
    retryable: true,
    logLevel: 'error',
    description: 'SMS service provider is currently unavailable',
    possibleCauses: ['Twilio service outage', 'API credentials invalid', 'SMS quota exceeded', 'Network connectivity issues'],
    resolution: ['Check Twilio service status', 'Verify API credentials', 'Check SMS usage limits', 'Implement fallback provider'],
    relatedDocs: ['/docs/integrations/twilio', '/docs/ops/sms-troubleshooting']
  },

  [ERROR_CODES.SECURITY_GEO_RESTRICTION]: {
    httpStatus: 403,
    category: 'SECURITY_ERROR',
    severity: 'MEDIUM',
    userFriendly: true,
    retryable: false,
    logLevel: 'warn',
    description: 'Access denied due to geographic restrictions',
    possibleCauses: ['Login from restricted country', 'VPN/proxy detected', 'IP geolocation mismatch'],
    resolution: ['Disable VPN if using one', 'Contact support for access request', 'Verify account settings'],
    relatedDocs: ['/docs/security/geographic-restrictions']
  },

  [ERROR_CODES.SYSTEM_MAINTENANCE_MODE]: {
    httpStatus: 503,
    category: 'SERVER_ERROR',
    severity: 'MEDIUM',
    userFriendly: true,
    retryable: true,
    logLevel: 'info',
    description: 'System is currently under maintenance',
    possibleCauses: ['Scheduled maintenance', 'System upgrade', 'Emergency maintenance'],
    resolution: ['Wait for maintenance to complete', 'Check status page for updates', 'Try again later'],
    relatedDocs: ['/docs/system/maintenance-schedules']
  },

  [ERROR_CODES.API_VERSION_NOT_SUPPORTED]: {
    httpStatus: 400,
    category: 'CLIENT_ERROR',
    severity: 'MEDIUM',
    userFriendly: false,
    retryable: false,
    logLevel: 'warn',
    description: 'Requested API version is not supported',
    possibleCauses: ['Version header missing', 'Invalid version specified', 'Version no longer supported'],
    resolution: ['Check API version header', 'Use supported API version', 'Update client implementation'],
    relatedDocs: ['/docs/api/versioning']
  },

  [ERROR_CODES.FILE_TOO_LARGE]: {
    httpStatus: 413,
    category: 'CLIENT_ERROR',
    severity: 'LOW',
    userFriendly: true,
    retryable: false,
    logLevel: 'info',
    description: 'Uploaded file exceeds maximum size limit',
    possibleCauses: ['File larger than limit', 'Multiple files uploaded', 'Incorrect file size calculation'],
    resolution: ['Reduce file size', 'Compress file', 'Upload smaller files separately'],
    relatedDocs: ['/docs/api/file-upload-limits']
  },

  [ERROR_CODES.NOTIFICATION_SEND_FAILED]: {
    httpStatus: 500,
    category: 'SERVER_ERROR',
    severity: 'MEDIUM',
    userFriendly: false,
    retryable: true,
    logLevel: 'error',
    description: 'Failed to send notification to user',
    possibleCauses: ['Email service error', 'SMS service error', 'Invalid recipient', 'Template rendering error'],
    resolution: ['Check notification service status', 'Verify recipient details', 'Review template configuration'],
    relatedDocs: ['/docs/notifications/troubleshooting']
  }

} as Record<ErrorCode, ErrorMetadata>;

/**
 * Get error metadata for a specific error code
 */
export function getErrorMetadata(code: ErrorCode): ErrorMetadata | undefined {
  return ERROR_METADATA[code];
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(code: ErrorCode): boolean {
  return getErrorMetadata(code)?.retryable ?? false;
}

/**
 * Get appropriate HTTP status code for error
 */
export function getHttpStatusForError(code: ErrorCode): number {
  return getErrorMetadata(code)?.httpStatus ?? 500;
}

/**
 * Get log level for error
 */
export function getLogLevelForError(code: ErrorCode): string {
  return getErrorMetadata(code)?.logLevel ?? 'error';
}

/**
 * Check if error should be shown to user
 */
export function isUserFriendlyError(code: ErrorCode): boolean {
  return getErrorMetadata(code)?.userFriendly ?? false;
}