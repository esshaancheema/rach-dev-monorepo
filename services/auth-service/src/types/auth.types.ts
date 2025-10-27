export interface User {
  id: string;
  email: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  role: 'user' | 'admin' | 'super_admin';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  userAgent: string;
  ipAddress: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
}

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  timestamp: Date;
}

export interface TokenPayload {
  userId: string;
  sessionId: string;
  deviceId: string;
  role: string;
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

export interface PasswordResetToken {
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}

export interface EmailVerificationToken {
  userId: string;
  token: string;
  email: string;
  expiresAt: Date;
  used: boolean;
}

export interface TwoFactorAuth {
  userId: string;
  secret: string;
  isEnabled: boolean;
  backupCodes: string[];
  createdAt: Date;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface Enable2FARequest {
  password: string;
}

export interface Verify2FARequest {
  token: string;
  code: string;
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  total: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}