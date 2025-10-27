import { z } from 'zod';
import {
  emailSchema,
  phoneSchema,
  passwordSchema,
  deviceIdSchema,
  nameSchema,
  otpSchema,
  tokenSchema,
  userRoleSchema,
  accountStatusSchema,
} from './common.schema';

// Authentication request schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  deviceId: deviceIdSchema.optional(),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: tokenSchema,
  newPassword: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: tokenSchema,
});

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: tokenSchema,
});

export const revokeTokenSchema = z.object({
  token: tokenSchema.optional(),
  allDevices: z.boolean().optional().default(false),
});

// Two-factor authentication schemas
export const setup2FASchema = z.object({
  // No additional data needed - uses authenticated user ID
});

export const enable2FASchema = z.object({
  verificationCode: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
});

export const disable2FASchema = z.object({
  verificationCode: z.string().min(1, 'Verification code is required'),
});

export const verify2FASchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
});

export const regenerateBackupCodesSchema = z.object({
  verificationCode: z.string().min(1, 'Verification code is required'),
});

export const verify2FALoginSchema = z.object({
  email: emailSchema,
  code: z.string().min(1, 'Verification code is required'),
  rememberDevice: z.boolean().optional().default(false),
});

// Session management schemas
export const sessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  deviceId: z.string(),
  userAgent: z.string(),
  ipAddress: z.string().ip(),
  isActive: z.boolean(),
  expiresAt: z.date(),
  createdAt: z.date(),
  lastActivityAt: z.date(),
});

export const createSessionSchema = z.object({
  userId: z.string().uuid(),
  deviceId: deviceIdSchema,
  userAgent: z.string().min(1, 'User agent is required'),
  ipAddress: z.string().ip(),
  rememberMe: z.boolean().optional().default(false),
});

export const updateSessionSchema = z.object({
  lastActivityAt: z.date().optional(),
  ipAddress: z.string().ip().optional(),
});

// OAuth schemas
export const oauthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional(),
});

export const oauthLinkAccountSchema = z.object({
  provider: z.enum(['google', 'github']),
  code: z.string().min(1, 'Authorization code is required'),
});

export const oauthUnlinkAccountSchema = z.object({
  provider: z.enum(['google', 'github']),
  password: z.string().min(1, 'Password is required'),
});

// Magic Link schemas
export const generateMagicLinkSchema = z.object({
  email: emailSchema,
  purpose: z.enum(['LOGIN', 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGE']).default('LOGIN'),
  callbackUrl: z.string().url().optional(),
});

export const verifyMagicLinkSchema = z.object({
  token: tokenSchema,
});

export const getMagicLinkStatusSchema = z.object({
  token: tokenSchema,
});

export const magicLinkResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  expiresAt: z.date().optional(),
});

export const magicLinkVerifyResponseSchema = z.object({
  valid: z.boolean(),
  message: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.string(),
  }).optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.number().optional(),
  canResend: z.boolean().optional(),
});

// Response schemas
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  isEmailVerified: z.boolean(),
  isPhoneVerified: z.boolean(),
  status: accountStatusSchema,
  role: userRoleSchema,
  lastLoginAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const authResponseSchema = z.object({
  user: userResponseSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
});

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
});

export const twoFactorSecretResponseSchema = z.object({
  secret: z.string(),
  qrCode: z.string(),
  backupCodes: z.array(z.string()),
});

export const sessionsResponseSchema = z.object({
  sessions: z.array(sessionSchema),
});

// Login attempt schema
export const loginAttemptSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  ipAddress: z.string().ip(),
  userAgent: z.string(),
  success: z.boolean(),
  failureReason: z.string().optional(),
  timestamp: z.date(),
});

// Device management schemas
export const deviceSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.enum(['web', 'mobile', 'desktop']).optional(),
  trusted: z.boolean().default(false),
  lastUsedAt: z.date(),
  createdAt: z.date(),
});

export const updateDeviceSchema = z.object({
  name: z.string().min(1, 'Device name is required'),
  trusted: z.boolean().optional(),
});

// Account management schemas
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema,
});

export const deactivateAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  reason: z.string().min(1, 'Reason is required'),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'Please type DELETE to confirm' }),
  }),
});

// Export types
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationRequest = z.infer<typeof resendVerificationSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
export type RevokeTokenRequest = z.infer<typeof revokeTokenSchema>;
export type Setup2FARequest = z.infer<typeof setup2FASchema>;
export type Enable2FARequest = z.infer<typeof enable2FASchema>;
export type Disable2FARequest = z.infer<typeof disable2FASchema>;
export type Verify2FARequest = z.infer<typeof verify2FASchema>;
export type RegenerateBackupCodesRequest = z.infer<typeof regenerateBackupCodesSchema>;
export type Verify2FALoginRequest = z.infer<typeof verify2FALoginSchema>;
export type CreateSessionRequest = z.infer<typeof createSessionSchema>;
export type UpdateSessionRequest = z.infer<typeof updateSessionSchema>;
export type OAuthCallbackRequest = z.infer<typeof oauthCallbackSchema>;
export type OAuthLinkAccountRequest = z.infer<typeof oauthLinkAccountSchema>;
export type OAuthUnlinkAccountRequest = z.infer<typeof oauthUnlinkAccountSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type TwoFactorSecretResponse = z.infer<typeof twoFactorSecretResponseSchema>;
export type SessionsResponse = z.infer<typeof sessionsResponseSchema>;
export type LoginAttempt = z.infer<typeof loginAttemptSchema>;
export type Device = z.infer<typeof deviceSchema>;
export type UpdateDeviceRequest = z.infer<typeof updateDeviceSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
export type DeactivateAccountRequest = z.infer<typeof deactivateAccountSchema>;
export type DeleteAccountRequest = z.infer<typeof deleteAccountSchema>;
export type GenerateMagicLinkRequest = z.infer<typeof generateMagicLinkSchema>;
export type VerifyMagicLinkRequest = z.infer<typeof verifyMagicLinkSchema>;
export type GetMagicLinkStatusRequest = z.infer<typeof getMagicLinkStatusSchema>;
export type MagicLinkResponse = z.infer<typeof magicLinkResponseSchema>;
export type MagicLinkVerifyResponse = z.infer<typeof magicLinkVerifyResponseSchema>;