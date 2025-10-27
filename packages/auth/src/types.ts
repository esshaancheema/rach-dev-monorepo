export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'developer' | 'editor';
  permissions: string[];
  organizationId?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  is2FAEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
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
  phone?: string;
  organizationName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface AuthConfig {
  authServiceUrl: string;
  tokenStorageKey?: string;
  userStorageKey?: string;
  autoRefresh?: boolean;
  refreshThreshold?: number; // Refresh token when this many minutes before expiry
}

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface OAuthProvider {
  id: string;
  name: string;
  enabled: boolean;
}

export interface TwoFactorSetup {
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface TwoFactorStatus {
  enabled: boolean;
  setupAt?: string;
  enabledAt?: string;
  backupCodesCount: number;
  lastUsedAt?: string;
}

export interface SessionInfo {
  id: string;
  deviceInfo: string;
  location?: string;
  isCurrentSession: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export type AuthEvent = 
  | 'login'
  | 'logout' 
  | 'register'
  | 'token-refresh'
  | 'session-expired'
  | 'profile-updated'
  | 'error';

export interface AuthEventListener {
  (event: AuthEvent, data?: any): void;
}

export interface ProtectedRouteOptions {
  roles?: string[];
  permissions?: string[];
  redirectTo?: string;
  fallback?: React.ComponentType;
}

export interface AuthContextType extends AuthState {
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: (allDevices?: boolean) => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // Profile management
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Email verification
  sendEmailVerification: (email?: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  
  // Phone verification
  sendPhoneVerification: (phone?: string) => Promise<void>;
  verifyPhone: (code: string) => Promise<void>;
  
  // Password reset
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  
  // Two-factor authentication
  setup2FA: () => Promise<TwoFactorSetup>;
  enable2FA: (code: string) => Promise<void>;
  disable2FA: (code: string) => Promise<void>;
  verify2FA: (code: string) => Promise<{ backupCodeUsed?: boolean }>;
  regenerateBackupCodes: (code: string) => Promise<{ backupCodes: string[] }>;
  get2FAStatus: () => Promise<TwoFactorStatus>;
  
  // OAuth
  getOAuthProviders: () => Promise<{ providers: OAuthProvider[] }>;
  connectOAuth: (provider: string) => void;
  disconnectOAuth: (provider: string) => Promise<void>;
  getConnectedAccounts: () => Promise<any[]>;
  
  // Session management
  getSessions: () => Promise<SessionInfo[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
  
  // Utilities
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  
  // Event listeners
  addEventListener: (listener: AuthEventListener) => () => void;
}