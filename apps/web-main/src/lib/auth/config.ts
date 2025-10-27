import { AuthConfig } from './types';

export const authConfig: AuthConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: '15m', // Short-lived access token
    refreshExpiresIn: '7d', // Longer-lived refresh token
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
  },
  session: {
    maxConcurrentSessions: 5,
    inactiveTimeout: 30, // 30 minutes
    rememberMeExpiry: 30, // 30 days
  },
  security: {
    maxFailedAttempts: 5,
    lockoutDuration: 15, // 15 minutes
    requireEmailVerification: true,
    allowPasswordReset: true,
  },
  oauth: {
    google: process.env.GOOGLE_CLIENT_ID ? {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    } : undefined,
    github: process.env.GITHUB_CLIENT_ID ? {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    } : undefined,
  },
};

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid email or password',
  },
  EMAIL_NOT_VERIFIED: {
    code: 'EMAIL_NOT_VERIFIED',
    message: 'Please verify your email address before logging in',
  },
  ACCOUNT_LOCKED: {
    code: 'ACCOUNT_LOCKED',
    message: 'Account locked due to too many failed login attempts',
  },
  ACCOUNT_SUSPENDED: {
    code: 'ACCOUNT_SUSPENDED',
    message: 'Your account has been suspended. Please contact support.',
  },
  EMAIL_ALREADY_EXISTS: {
    code: 'EMAIL_ALREADY_EXISTS',
    message: 'An account with this email already exists',
  },
  WEAK_PASSWORD: {
    code: 'WEAK_PASSWORD',
    message: 'Password does not meet security requirements',
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    message: 'Invalid or expired token',
  },
  SESSION_EXPIRED: {
    code: 'SESSION_EXPIRED',
    message: 'Your session has expired. Please log in again.',
  },
  TWO_FACTOR_REQUIRED: {
    code: 'TWO_FACTOR_REQUIRED',
    message: 'Two-factor authentication code required',
  },
  INVALID_TWO_FACTOR: {
    code: 'INVALID_TWO_FACTOR',
    message: 'Invalid two-factor authentication code',
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please try again later.',
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User not found',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'You are not authorized to perform this action',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'Access forbidden',
  },
} as const;

export const DEFAULT_USER_PREFERENCES = {
  theme: 'system' as const,
  language: 'en',
  notifications: {
    email: {
      projectUpdates: true,
      marketing: false,
      security: true,
      invoices: true,
    },
    push: {
      projectUpdates: true,
      messages: true,
      deadlines: true,
    },
    frequency: 'immediate' as const,
  },
  dashboard: {
    defaultView: 'overview' as const,
    projectsPerPage: 10,
    showCompletedProjects: false,
    compactMode: false,
  },
};

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'zoptal_access_token',
  REFRESH_TOKEN: 'zoptal_refresh_token',
  SESSION_ID: 'zoptal_session_id',
} as const;

export const ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  DASHBOARD: '/dashboard',
  PROFILE: '/dashboard/profile',
  SETTINGS: '/dashboard/settings',
} as const;