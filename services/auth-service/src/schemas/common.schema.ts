import { z } from 'zod';

// Common validation patterns
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const deviceIdSchema = z.string().min(1, 'Device ID is required');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const otpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits');

export const tokenSchema = z.string().min(1, 'Token is required');

export const userRoleSchema = z.enum(['user', 'admin', 'super_admin']);

export const accountStatusSchema = z.enum([
  'active',
  'inactive',
  'suspended',
  'pending_verification',
]);

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Query parameter schemas
export const searchSchema = z.object({
  q: z.string().min(1).optional(),
  ...paginationSchema.shape,
});

// Response schemas
export const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
  timestamp: z.string(),
});

export const successSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export const paginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

// Rate limit info schema
export const rateLimitInfoSchema = z.object({
  remaining: z.number(),
  resetTime: z.number(),
  total: z.number(),
});

// IP address schema
export const ipAddressSchema = z
  .string()
  .ip({ message: 'Invalid IP address format' });

// User agent schema
export const userAgentSchema = z.string().min(1, 'User agent is required');

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// File upload schema
export const fileUploadSchema = z.object({
  filename: z.string(),
  mimetype: z.string(),
  size: z.number().max(5 * 1024 * 1024, 'File size must not exceed 5MB'),
});

// Request headers schema
export const authHeaderSchema = z.object({
  authorization: z.string().regex(/^Bearer .+/, 'Invalid authorization header format'),
});

// Common response types
export type ErrorResponse = z.infer<typeof errorSchema>;
export type SuccessResponse = z.infer<typeof successSchema>;
export type PaginatedResponse<T> = {
  data: T[];
  pagination: z.infer<typeof paginatedResponseSchema>['pagination'];
};
export type RateLimitInfo = z.infer<typeof rateLimitInfoSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type SearchQuery = z.infer<typeof searchSchema>;