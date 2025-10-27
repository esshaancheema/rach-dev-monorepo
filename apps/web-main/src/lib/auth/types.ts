export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  timezone?: string;
  preferences: UserPreferences;
  subscription?: UserSubscription;
  projects: ProjectSummary[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export type UserRole = 'client' | 'admin' | 'developer' | 'project_manager';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: {
    projectUpdates: boolean;
    marketing: boolean;
    security: boolean;
    invoices: boolean;
  };
  push: {
    projectUpdates: boolean;
    messages: boolean;
    deadlines: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface DashboardPreferences {
  defaultView: 'overview' | 'projects' | 'messages' | 'billing';
  projectsPerPage: number;
  showCompletedProjects: boolean;
  compactMode: boolean;
}

export interface UserSubscription {
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  expectedEndDate?: string;
  budget: number;
  spent: number;
  teamSize: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastActivity: string;
}

export type ProjectStatus = 
  | 'planning' 
  | 'in_progress' 
  | 'review' 
  | 'testing' 
  | 'deployment' 
  | 'completed' 
  | 'on_hold' 
  | 'cancelled';

export interface AuthSession {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
  ipAddress: string;
  userAgent: string;
  lastAccessedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  agreeToTerms: boolean;
  source?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AuthError;
  message?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export type ActivityAction = 
  | 'login'
  | 'logout' 
  | 'password_change'
  | 'email_change'
  | 'profile_update'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'project_created'
  | 'project_updated'
  | 'file_uploaded'
  | 'message_sent'
  | 'invoice_viewed'
  | 'subscription_changed';

export interface SecuritySettings {
  passwordLastChanged: string;
  failedLoginAttempts: number;
  lastFailedLogin?: string;
  accountLockedUntil?: string;
  trustedDevices: TrustedDevice[];
  activeSessions: SessionInfo[];
}

export interface TrustedDevice {
  id: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  lastUsed: string;
  addedAt: string;
}

export interface SessionInfo {
  id: string;
  ipAddress: string;
  location?: string;
  device: string;
  browser: string;
  current: boolean;
  createdAt: string;
  lastAccessedAt: string;
}

export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
  session: {
    maxConcurrentSessions: number;
    inactiveTimeout: number; // minutes
    rememberMeExpiry: number; // days
  };
  security: {
    maxFailedAttempts: number;
    lockoutDuration: number; // minutes
    requireEmailVerification: boolean;
    allowPasswordReset: boolean;
  };
  oauth: {
    google?: {
      clientId: string;
      clientSecret: string;
    };
    github?: {
      clientId: string;
      clientSecret: string;
    };
  };
}