import { z } from 'zod';
import {
  emailSchema,
  phoneSchema,
  nameSchema,
  userRoleSchema,
  accountStatusSchema,
  paginationSchema,
  dateRangeSchema,
  ipAddressSchema,
} from './common.schema';

// Admin-specific validation schemas

// System health and monitoring schemas
export const systemHealthSchema = z.object({
  database: z.object({
    status: z.enum(['healthy', 'unhealthy', 'degraded']),
    responseTime: z.number(),
    connections: z.number(),
  }),
  redis: z.object({
    status: z.enum(['healthy', 'unhealthy', 'degraded']),
    responseTime: z.number(),
    memory: z.number(),
  }),
  services: z.object({
    authentication: z.enum(['healthy', 'unhealthy', 'degraded']),
    email: z.enum(['healthy', 'unhealthy', 'degraded']),
    sms: z.enum(['healthy', 'unhealthy', 'degraded']),
  }),
  metrics: z.object({
    activeUsers: z.number(),
    requestsPerMinute: z.number(),
    errorRate: z.number(),
    averageResponseTime: z.number(),
  }),
});

// Security event schemas
export const securityEventSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    'login_success',
    'login_failure',
    'account_locked',
    'password_changed',
    'email_changed',
    'phone_changed',
    'two_factor_enabled',
    'two_factor_disabled',
    'suspicious_login',
    'account_created',
    'account_deleted',
    'oauth_linked',
    'oauth_unlinked',
    'token_refresh',
    'session_expired',
    'admin_action',
    'privilege_escalation',
    'rate_limit_exceeded',
    'brute_force_detected',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  userId: z.string().uuid().optional(),
  description: z.string(),
  metadata: z.record(z.any()).optional(),
  ipAddress: ipAddressSchema.optional(),
  userAgent: z.string().optional(),
  resolved: z.boolean().default(false),
  resolvedAt: z.date().optional(),
  resolvedBy: z.string().uuid().optional(),
  createdAt: z.date(),
});

export const getSecurityEventsQuerySchema = paginationSchema.extend({
  type: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  userId: z.string().uuid().optional(),
  resolved: z.boolean().optional(),
  ...dateRangeSchema.shape,
});

export const resolveSecurityEventSchema = z.object({
  resolution: z.string().min(1, 'Resolution description is required'),
});

// Admin user management schemas
export const adminCreateUserSchema = z.object({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  role: userRoleSchema,
  status: accountStatusSchema.optional().default('active'),
  isEmailVerified: z.boolean().optional().default(true),
  isPhoneVerified: z.boolean().optional().default(false),
  sendWelcomeEmail: z.boolean().optional().default(true),
  temporaryPassword: z.boolean().optional().default(true),
});

export const adminUpdateUserSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema,
  role: userRoleSchema.optional(),
  status: accountStatusSchema.optional(),
  isEmailVerified: z.boolean().optional(),
  isPhoneVerified: z.boolean().optional(),
  reason: z.string().min(1, 'Update reason is required'),
});

export const forceLogoutUserSchema = z.object({
  allDevices: z.boolean().optional().default(false),
  reason: z.string().min(1, 'Logout reason is required'),
});

export const impersonateUserSchema = z.object({
  duration: z.number().int().min(1).max(60).optional().default(30), // minutes
  reason: z.string().min(1, 'Impersonation reason is required'),
});

// Rate limiting and security schemas
export const updateRateLimitSchema = z.object({
  endpoint: z.string().min(1, 'Endpoint is required'),
  maxRequests: z.number().int().min(1).max(10000),
  windowMs: z.number().int().min(1000).max(3600000), // 1 second to 1 hour
  enabled: z.boolean().optional().default(true),
});

export const blockIpSchema = z.object({
  ipAddress: ipAddressSchema,
  reason: z.string().min(1, 'Block reason is required'),
  duration: z.number().int().min(1).optional(), // minutes, undefined = permanent
});

export const unblockIpSchema = z.object({
  reason: z.string().min(1, 'Unblock reason is required'),
});

// Configuration management schemas
export const updateConfigSchema = z.object({
  key: z.string().min(1, 'Configuration key is required'),
  value: z.union([z.string(), z.number(), z.boolean()]),
  description: z.string().optional(),
});

export const configHistoryQuerySchema = paginationSchema.extend({
  key: z.string().optional(),
  ...dateRangeSchema.shape,
});

// Audit log schemas
export const auditLogSchema = z.object({
  id: z.string().uuid(),
  adminId: z.string().uuid(),
  action: z.string(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  oldValues: z.record(z.any()).optional(),
  newValues: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  ipAddress: ipAddressSchema,
  userAgent: z.string(),
  timestamp: z.date(),
});

export const getAuditLogsQuerySchema = paginationSchema.extend({
  adminId: z.string().uuid().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  ...dateRangeSchema.shape,
});

// Analytics and reporting schemas
export const analyticsQuerySchema = z.object({
  metric: z.enum([
    'user_registrations',
    'login_attempts',
    'active_sessions',
    'password_resets',
    'two_factor_usage',
    'oauth_logins',
    'security_events',
    'api_usage',
  ]),
  period: z.enum(['hour', 'day', 'week', 'month']),
  ...dateRangeSchema.shape,
});

export const reportGenerationSchema = z.object({
  type: z.enum(['security', 'user_activity', 'system_health', 'compliance']),
  format: z.enum(['pdf', 'csv', 'json']),
  email: emailSchema.optional(),
  filters: z.record(z.any()).optional(),
  ...dateRangeSchema.shape,
});

// Notification and alert schemas
export const alertConfigSchema = z.object({
  name: z.string().min(1, 'Alert name is required'),
  type: z.enum(['security_event', 'system_health', 'user_activity']),
  condition: z.object({
    metric: z.string(),
    operator: z.enum(['gt', 'lt', 'eq', 'ne', 'gte', 'lte']),
    threshold: z.number(),
  }),
  channels: z.array(z.enum(['email', 'slack', 'webhook'])),
  recipients: z.array(emailSchema),
  enabled: z.boolean().default(true),
});

export const updateAlertConfigSchema = alertConfigSchema.partial().extend({
  id: z.string().uuid(),
});

// System maintenance schemas
export const maintenanceModeSchema = z.object({
  enabled: z.boolean(),
  message: z.string().optional(),
  estimatedDuration: z.number().int().min(1).optional(), // minutes
  allowedIps: z.array(ipAddressSchema).optional(),
});

export const systemBackupSchema = z.object({
  type: z.enum(['full', 'incremental']),
  includeLogs: z.boolean().optional().default(true),
  compression: z.boolean().optional().default(true),
});

// Feature flag schemas
export const featureFlagSchema = z.object({
  name: z.string().min(1, 'Feature flag name is required'),
  enabled: z.boolean(),
  rolloutPercentage: z.number().min(0).max(100).optional().default(100),
  conditions: z.object({
    userRoles: z.array(userRoleSchema).optional(),
    userIds: z.array(z.string().uuid()).optional(),
    ipRanges: z.array(z.string()).optional(),
  }).optional(),
  description: z.string().optional(),
});

export const updateFeatureFlagSchema = featureFlagSchema.partial().extend({
  id: z.string().uuid(),
});

// Response schemas
export const systemHealthResponseSchema = z.object({
  health: systemHealthSchema,
  timestamp: z.date(),
});

export const securityEventsResponseSchema = z.object({
  events: z.array(securityEventSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export const auditLogsResponseSchema = z.object({
  logs: z.array(auditLogSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export const analyticsResponseSchema = z.object({
  metric: z.string(),
  period: z.string(),
  data: z.array(z.object({
    timestamp: z.date(),
    value: z.number(),
  })),
});

// Export types
export type SystemHealth = z.infer<typeof systemHealthSchema>;
export type SecurityEvent = z.infer<typeof securityEventSchema>;
export type GetSecurityEventsQuery = z.infer<typeof getSecurityEventsQuerySchema>;
export type ResolveSecurityEventRequest = z.infer<typeof resolveSecurityEventSchema>;
export type AdminCreateUserRequest = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserRequest = z.infer<typeof adminUpdateUserSchema>;
export type ForceLogoutUserRequest = z.infer<typeof forceLogoutUserSchema>;
export type ImpersonateUserRequest = z.infer<typeof impersonateUserSchema>;
export type UpdateRateLimitRequest = z.infer<typeof updateRateLimitSchema>;
export type BlockIpRequest = z.infer<typeof blockIpSchema>;
export type UnblockIpRequest = z.infer<typeof unblockIpSchema>;
export type UpdateConfigRequest = z.infer<typeof updateConfigSchema>;
export type ConfigHistoryQuery = z.infer<typeof configHistoryQuerySchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type GetAuditLogsQuery = z.infer<typeof getAuditLogsQuerySchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type ReportGenerationRequest = z.infer<typeof reportGenerationSchema>;
export type AlertConfig = z.infer<typeof alertConfigSchema>;
export type UpdateAlertConfigRequest = z.infer<typeof updateAlertConfigSchema>;
export type MaintenanceModeRequest = z.infer<typeof maintenanceModeSchema>;
export type SystemBackupRequest = z.infer<typeof systemBackupSchema>;
export type FeatureFlag = z.infer<typeof featureFlagSchema>;
export type UpdateFeatureFlagRequest = z.infer<typeof updateFeatureFlagSchema>;
export type SystemHealthResponse = z.infer<typeof systemHealthResponseSchema>;
export type SecurityEventsResponse = z.infer<typeof securityEventsResponseSchema>;
export type AuditLogsResponse = z.infer<typeof auditLogsResponseSchema>;
export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;