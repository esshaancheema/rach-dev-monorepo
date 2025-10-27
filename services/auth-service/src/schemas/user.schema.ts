import { z } from 'zod';
import {
  emailSchema,
  phoneSchema,
  passwordSchema,
  nameSchema,
  userRoleSchema,
  accountStatusSchema,
  paginationSchema,
  searchSchema,
  dateRangeSchema,
} from './common.schema';

// User creation and update schemas
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  role: userRoleSchema.optional().default('user'),
  status: accountStatusSchema.optional().default('pending_verification'),
  isEmailVerified: z.boolean().optional().default(false),
  isPhoneVerified: z.boolean().optional().default(false),
});

export const updateUserSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema,
  status: accountStatusSchema.optional(),
  role: userRoleSchema.optional(),
  isEmailVerified: z.boolean().optional(),
  isPhoneVerified: z.boolean().optional(),
});

export const updateUserProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema,
});

// User query schemas
export const getUsersQuerySchema = searchSchema.extend({
  status: accountStatusSchema.optional(),
  role: userRoleSchema.optional(),
  isEmailVerified: z.boolean().optional(),
  isPhoneVerified: z.boolean().optional(),
  ...dateRangeSchema.shape,
});

export const getUserByIdSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export const getUserByEmailSchema = z.object({
  email: emailSchema,
});

// User management schemas
export const suspendUserSchema = z.object({
  reason: z.string().min(1, 'Suspension reason is required'),
  duration: z.number().int().min(1).optional(), // Duration in days
});

export const unsuspendUserSchema = z.object({
  reason: z.string().min(1, 'Unsuspension reason is required'),
});

export const deleteUserSchema = z.object({
  reason: z.string().min(1, 'Deletion reason is required'),
  softDelete: z.boolean().optional().default(true),
});

export const changeUserRoleSchema = z.object({
  role: userRoleSchema,
  reason: z.string().min(1, 'Role change reason is required'),
});

export const resetUserPasswordSchema = z.object({
  newPassword: passwordSchema,
  forcePasswordChange: z.boolean().optional().default(true),
  notifyUser: z.boolean().optional().default(true),
});

// User activity schemas
export const userActivitySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string(),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().ip(),
  userAgent: z.string(),
  timestamp: z.date(),
});

export const getUserActivityQuerySchema = paginationSchema.extend({
  action: z.string().optional(),
  ...dateRangeSchema.shape,
});

// User preferences schemas
export const userPreferencesSchema = z.object({
  language: z.string().min(2).max(5).optional().default('en'),
  timezone: z.string().optional().default('UTC'),
  emailNotifications: z.object({
    marketing: z.boolean().default(false),
    security: z.boolean().default(true),
    updates: z.boolean().default(true),
  }).optional(),
  smsNotifications: z.object({
    security: z.boolean().default(false),
    marketing: z.boolean().default(false),
  }).optional(),
  twoFactorEnabled: z.boolean().default(false),
  sessionTimeout: z.number().int().min(15).max(1440).optional().default(30), // minutes
});

export const updateUserPreferencesSchema = userPreferencesSchema.partial();

// User statistics schemas
export const userStatsSchema = z.object({
  totalUsers: z.number(),
  activeUsers: z.number(),
  suspendedUsers: z.number(),
  verifiedUsers: z.number(),
  usersRegisteredToday: z.number(),
  usersRegisteredThisWeek: z.number(),
  usersRegisteredThisMonth: z.number(),
});

// Bulk operations schemas
export const bulkUpdateUsersSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, 'At least one user ID is required'),
  updates: updateUserSchema,
  reason: z.string().min(1, 'Bulk update reason is required'),
});

export const bulkDeleteUsersSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, 'At least one user ID is required'),
  reason: z.string().min(1, 'Bulk deletion reason is required'),
  softDelete: z.boolean().optional().default(true),
});

// User export/import schemas
export const exportUsersSchema = z.object({
  format: z.enum(['csv', 'json']).default('csv'),
  fields: z.array(z.string()).optional(),
  filters: getUsersQuerySchema.omit({ page: true, limit: true }).optional(),
});

export const importUsersSchema = z.object({
  users: z.array(createUserSchema),
  skipDuplicates: z.boolean().optional().default(true),
  sendWelcomeEmail: z.boolean().optional().default(false),
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
  preferences: userPreferencesSchema.optional(),
});

export const userDetailResponseSchema = userResponseSchema.extend({
  loginAttempts: z.number(),
  activeSessions: z.number(),
  twoFactorEnabled: z.boolean(),
  accountLocked: z.boolean(),
  lockoutExpiresAt: z.date().nullable(),
});

export const usersResponseSchema = z.object({
  users: z.array(userResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export const userActivityResponseSchema = z.object({
  activities: z.array(userActivitySchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

// Admin action schemas
export const adminActionSchema = z.object({
  adminId: z.string().uuid(),
  action: z.string(),
  targetUserId: z.string().uuid().optional(),
  details: z.record(z.any()).optional(),
  timestamp: z.date(),
});

export const logAdminActionSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  targetUserId: z.string().uuid().optional(),
  details: z.record(z.any()).optional(),
});

// Export types
export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
export type UpdateUserProfileRequest = z.infer<typeof updateUserProfileSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type GetUserByIdRequest = z.infer<typeof getUserByIdSchema>;
export type GetUserByEmailRequest = z.infer<typeof getUserByEmailSchema>;
export type SuspendUserRequest = z.infer<typeof suspendUserSchema>;
export type UnsuspendUserRequest = z.infer<typeof unsuspendUserSchema>;
export type DeleteUserRequest = z.infer<typeof deleteUserSchema>;
export type ChangeUserRoleRequest = z.infer<typeof changeUserRoleSchema>;
export type ResetUserPasswordRequest = z.infer<typeof resetUserPasswordSchema>;
export type UserActivity = z.infer<typeof userActivitySchema>;
export type GetUserActivityQuery = z.infer<typeof getUserActivityQuerySchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UpdateUserPreferencesRequest = z.infer<typeof updateUserPreferencesSchema>;
export type UserStats = z.infer<typeof userStatsSchema>;
export type BulkUpdateUsersRequest = z.infer<typeof bulkUpdateUsersSchema>;
export type BulkDeleteUsersRequest = z.infer<typeof bulkDeleteUsersSchema>;
export type ExportUsersRequest = z.infer<typeof exportUsersSchema>;
export type ImportUsersRequest = z.infer<typeof importUsersSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserDetailResponse = z.infer<typeof userDetailResponseSchema>;
export type UsersResponse = z.infer<typeof usersResponseSchema>;
export type UserActivityResponse = z.infer<typeof userActivityResponseSchema>;
export type AdminAction = z.infer<typeof adminActionSchema>;
export type LogAdminActionRequest = z.infer<typeof logAdminActionSchema>;