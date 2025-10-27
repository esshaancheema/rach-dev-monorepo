// Service exports for better organization and easier imports
export { tokenService, TokenService } from './token.service';
export { AuthService, createAuthService } from './auth.service';
export { TwoFAService, createTwoFAService } from './twofa.service';
export { OAuthService, createOAuthService } from './oauth.service';

// Export enhanced services with circuit breaker pattern
export { enhancedEmailService as emailService, EnhancedEmailService as EmailService } from './email-with-circuit-breaker.service';
export { enhancedSmsService as smsService, EnhancedSmsService as SmsService } from './sms-with-circuit-breaker.service';
export { messageQueueProcessor, MessageQueueProcessor } from './message-queue-processor.service';

// Legacy exports for backward compatibility
export { EmailService as LegacyEmailService, createEmailService } from './email.service';
export { SmsService as LegacySmsService, createSmsService } from './sms.service';

export { AdminService, createAdminService } from './admin.service';
export { SessionService, createSessionService } from './session.service';
export { OTPService, createOTPService } from './otp.service';
export { UsernameService, createUsernameService } from './username.service';
export { ActivityService, createActivityService } from './activity.service';
export { PasswordHistoryService, createPasswordHistoryService } from './password-history.service';
export { DeviceFingerprintService, createDeviceFingerprintService } from './device-fingerprint.service';
export { MetricsService, createMetricsService } from './metrics.service';
export { SoftDeleteService, createSoftDeleteService } from './soft-delete.service';
export { ForcePasswordResetService, createForcePasswordResetService } from './force-password-reset.service';