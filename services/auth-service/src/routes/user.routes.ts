import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  getUsersQuerySchema,
  getUserByIdSchema,
  updateUserProfileSchema,
  suspendUserSchema,
  unsuspendUserSchema,
  deleteUserSchema,
  changeUserRoleSchema,
  resetUserPasswordSchema,
  getUserActivityQuerySchema,
  updateUserPreferencesSchema,
  bulkUpdateUsersSchema,
  bulkDeleteUsersSchema,
  exportUsersSchema,
  logAdminActionSchema,
  GetUsersQuery,
  GetUserByIdRequest,
  UpdateUserProfileRequest,
  SuspendUserRequest,
  UnsuspendUserRequest,
  DeleteUserRequest,
  ChangeUserRoleRequest,
  ResetUserPasswordRequest,
  GetUserActivityQuery,
  UpdateUserPreferencesRequest,
  BulkUpdateUsersRequest,
  BulkDeleteUsersRequest,
  ExportUsersRequest,
  LogAdminActionRequest,
  UserResponse,
  UserDetailResponse,
  UsersResponse,
  UserActivityResponse,
  UserStats,
  UserPreferences,
} from '../schemas/user.schema';
import { validate } from '../middleware/validate';
import { logger } from '../utils/logger';
import { createNotFoundError, createForbiddenError } from '../middleware/error-handler';
import { authenticateToken } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rate-limit';
import { requestLogger } from '../middleware/request-logger';

export async function userRoutes(fastify: FastifyInstance) {
  // Pre-handlers for all user routes - TEMPORARILY DISABLED
  // fastify.addHook('preHandler', requestLogger);
  /**
   * @route DELETE /user/account
   * @description Soft delete user account
   * @access Private
   */
  fastify.delete('/account', {
    preHandler: [
      authenticateToken,
      // TEMPORARILY DISABLED: rateLimitMiddleware('account_deletion', { max: 3, window: '1h' }),
    ],
    schema: {
      tags: ['User Management'],
      summary: 'Delete user account',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['password', 'reason'],
        properties: {
          password: { type: 'string', minLength: 1 },
          reason: { 
            type: 'string', 
            enum: ['privacy_concerns', 'not_useful', 'too_many_emails', 'found_alternative', 'other']
          },
          customReason: { type: 'string', maxLength: 500 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { password, reason, customReason } = request.body as any;
      const userId = (request as any).user.id;
      
      // Verify password before deletion
      const user = await fastify.authService.getProfile(userId);
      const isPasswordValid = await fastify.passwordUtils.verify(password, user.password);
      
      if (!isPasswordValid) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid password provided',
        });
      }
      
      const deletionReason = reason === 'other' ? customReason : reason;
      
      const result = await fastify.softDeleteService.softDeleteUser(userId, {
        reason: deletionReason,
        deletedBy: userId,
        notifyUser: true,
      });
      
      logger.info('User account deleted:', { userId, reason: deletionReason });
      
      return reply.send({
        success: true,
        message: 'Account deleted successfully. You have 30 days to restore it.',
        data: {
          deletedAt: result.deletedAt,
          gracePeriodEnds: result.gracePeriodEnds,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Account deletion failed');
      throw error;
    }
  });

  /**
   * @route POST /user/restore
   * @description Restore soft-deleted user account
   * @access Public
   */
  fastify.post('/restore', {
    preHandler: [
      // TEMPORARILY DISABLED: rateLimitMiddleware('account_restoration', { max: 5, window: '1h' }),
    ],
    schema: {
      tags: ['User Management'],
      summary: 'Restore deleted account',
      body: {
        type: 'object',
        required: ['email', 'token'],
        properties: {
          email: { type: 'string', format: 'email' },
          token: { type: 'string', minLength: 1 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, token } = request.body as any;
      
      // Find user by email (including soft-deleted)
      const user = await fastify.prisma.user.findFirst({
        where: { email, deletedAt: { not: null } },
      });
      
      if (!user) {
        return reply.code(404).send({
          success: false,
          message: 'No deleted account found with this email',
        });
      }
      
      // Verify restoration token (implement token validation logic)
      // For now, we'll use a simple approach
      const expectedToken = Buffer.from(`${user.id}:${user.deletedAt?.getTime()}`).toString('base64');
      
      if (token !== expectedToken) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid restoration token',
        });
      }
      
      const result = await fastify.softDeleteService.restoreUser(user.id);
      
      logger.info('User account restored:', { userId: user.id, email });
      
      return reply.send({
        success: true,
        message: 'Account restored successfully. You can now log in.',
        data: {
          restoredAt: result.restoredAt,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Account restoration failed');
      throw error;
    }
  });

  /**
   * @route GET /user/deletion-status/:email
   * @description Check deletion status and time remaining
   * @access Public
   */
  fastify.get('/deletion-status/:email', {
    preHandler: [
      // TEMPORARILY DISABLED: rateLimitMiddleware('check_deletion_status', { max: 10, window: '5m' }),
    ],
    schema: {
      tags: ['User Management'],
      summary: 'Check account deletion status',
      params: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email } = request.params as any;
      
      const user = await fastify.prisma.user.findFirst({
        where: { email, deletedAt: { not: null } },
        select: { id: true, deletedAt: true, deleteReason: true },
      });
      
      if (!user || !user.deletedAt) {
        return reply.code(404).send({
          success: false,
          message: 'No deleted account found with this email',
        });
      }
      
      const gracePeriodEnds = new Date(user.deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const daysRemaining = Math.ceil((gracePeriodEnds.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      
      const restorationToken = Buffer.from(`${user.id}:${user.deletedAt.getTime()}`).toString('base64');
      
      return reply.send({
        success: true,
        data: {
          deletedAt: user.deletedAt,
          gracePeriodEnds,
          daysRemaining: Math.max(0, daysRemaining),
          canRestore: daysRemaining > 0,
          deleteReason: user.deleteReason,
          restorationToken,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Check deletion status failed');
      throw error;
    }
  });

  /**
   * @route GET /user/force-reset-status
   * @description Check if user has force password reset requirement
   * @access Private
   */
  fastify.get('/force-reset-status', {
    preHandler: [authenticateToken],
    schema: {
      tags: ['User Management'],
      summary: 'Check force password reset status',
      security: [{ bearerAuth: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      
      const forcePasswordResetService = (fastify as any).forcePasswordResetService;
      
      if (!forcePasswordResetService) {
        return reply.code(503).send({
          success: false,
          message: 'Force password reset service not available',
        });
      }
      
      const resetStatus = await forcePasswordResetService.getPasswordResetStatus(userId);
      
      return reply.send({
        success: true,
        data: resetStatus,
      });
    } catch (error) {
      logger.error({ error }, 'Check force reset status failed');
      throw error;
    }
  });

  // Get current user profile
  fastify.get(
    '/profile',
    {
      preHandler: [authenticateToken],
      schema: {
        tags: ['User Management'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request as any).user.id;
        
        const userProfile = await fastify.authService.getProfile(userId);
        
        return reply.send({
          success: true,
          data: userProfile,
        });
      } catch (error) {
        logger.error({ error }, 'Get profile failed');
        throw error;
      }
    }
  );

  // Update current user profile
  fastify.put<{ Body: UpdateUserProfileRequest }>(
    '/profile',
    {
      preHandler: validate({ body: updateUserProfileSchema }),
      schema: {
        tags: ['User Management'],
        summary: 'Update current user profile',
        body: updateUserProfileSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ Body: UpdateUserProfileRequest }>, reply: FastifyReply) => {
      try {
        const { firstName, lastName, phone } = request.body;
        
        logger.info({ firstName, lastName }, 'Update user profile request');
        
        // TODO: Implement update profile logic
        // 1. Get user ID from token
        // 2. Validate phone number if provided
        // 3. Update user data in database
        // 4. Return updated profile
        
        return reply.send({
          success: true,
          message: 'Profile updated successfully',
        });
      } catch (error) {
        logger.error({ error }, 'Update profile failed');
        throw error;
      }
    }
  );

  // Get user preferences
  fastify.get(
    '/preferences',
    {
      schema: {
        tags: ['User Management'],
        summary: 'Get user preferences',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        logger.info('Get user preferences request');
        
        // TODO: Implement get preferences logic
        // 1. Get user ID from token
        // 2. Fetch user preferences from database
        // 3. Return preferences with defaults
        
        // Placeholder implementation
        const preferences: UserPreferences = {
          language: 'en',
          timezone: 'UTC',
          emailNotifications: {
            marketing: false,
            security: true,
            updates: true,
          },
          smsNotifications: {
            security: false,
            marketing: false,
          },
          twoFactorEnabled: false,
          sessionTimeout: 30,
        };
        
        return reply.send({
          success: true,
          data: preferences,
        });
      } catch (error) {
        logger.error({ error }, 'Get preferences failed');
        throw error;
      }
    }
  );

  // Update user preferences
  fastify.put<{ Body: UpdateUserPreferencesRequest }>(
    '/preferences',
    {
      preHandler: validate({ body: updateUserPreferencesSchema }),
      schema: {
        tags: ['User Management'],
        summary: 'Update user preferences',
        body: updateUserPreferencesSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ Body: UpdateUserPreferencesRequest }>, reply: FastifyReply) => {
      try {
        logger.info('Update user preferences request');
        
        // TODO: Implement update preferences logic
        // 1. Get user ID from token
        // 2. Validate preference values
        // 3. Update preferences in database
        // 4. Return updated preferences
        
        return reply.send({
          success: true,
          message: 'Preferences updated successfully',
        });
      } catch (error) {
        logger.error({ error }, 'Update preferences failed');
        throw error;
      }
    }
  );

  // Get user activity
  fastify.get<{ Querystring: GetUserActivityQuery }>(
    '/activity',
    {
      preHandler: validate({ query: getUserActivityQuerySchema }),
      schema: {
        tags: ['User Management'],
        summary: 'Get user activity history',
        querystring: getUserActivityQuerySchema,
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ Querystring: GetUserActivityQuery }>, reply: FastifyReply) => {
      try {
        const { page, limit, action, startDate, endDate } = request.query;
        
        logger.info({ page, limit, action }, 'Get user activity request');
        
        // TODO: Implement get activity logic
        // 1. Get user ID from token
        // 2. Query activity logs with filters
        // 3. Return paginated results
        
        // Placeholder implementation
        const activityResponse: UserActivityResponse = {
          activities: [],
          pagination: {
            page: page || 1,
            limit: limit || 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
        
        return reply.send({
          success: true,
          data: activityResponse,
        });
      } catch (error) {
        logger.error({ error }, 'Get activity failed');
        throw error;
      }
    }
  );

  // Admin-only routes
  fastify.register(async function adminRoutes(fastify) {
    // Add admin authentication middleware here
    fastify.addHook('preHandler', async (request, reply) => {
      // TODO: Check if user has admin role
      // For now, just log the attempt
      logger.info('Admin route accessed');
    });

    // Get all users (admin only) - now includes soft-deleted users option
    fastify.get<{ Querystring: GetUsersQuery & { includeDeleted?: boolean } }>(
      '/admin/users',
      {
        preHandler: validate({ query: getUsersQuerySchema }),
        schema: {
          tags: ['Admin - User Management'],
          summary: 'Get all users (admin only)',
          querystring: {
            ...getUsersQuerySchema,
            properties: {
              ...getUsersQuerySchema.properties,
              includeDeleted: { type: 'boolean', default: false },
            },
          },
          security: [{ bearerAuth: [] }],
        },
      },
      async (request: FastifyRequest<{ Querystring: GetUsersQuery & { includeDeleted?: boolean } }>, reply: FastifyReply) => {
        try {
          const { page, limit, q, status, role, isEmailVerified, isPhoneVerified, includeDeleted } = request.query;
          
          logger.info({ page, limit, q, status, role, includeDeleted }, 'Admin get users request');
          
          const filters = {
            q, status, role, isEmailVerified, isPhoneVerified,
            includeDeleted: includeDeleted || false,
          };
          
          const pagination = { page: page || 1, limit: limit || 10 };
          
          const usersResponse = await fastify.adminService.searchUsers(filters, pagination);
          
          return reply.send({
            success: true,
            data: usersResponse,
          });
        } catch (error) {
          logger.error({ error }, 'Admin get users failed');
          throw error;
        }
      }
    );

    // Get soft-deleted users for admin recovery
    fastify.get('/admin/users/deleted', {
      schema: {
        tags: ['Admin - User Management'],
        summary: 'Get soft-deleted users (admin only)',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          },
        },
      },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { page = 1, limit = 50 } = request.query as any;
        
        const result = await fastify.softDeleteService.getSoftDeletedUsers(page, limit);
        
        return reply.send({
          success: true,
          data: result,
        });
      } catch (error) {
        logger.error({ error }, 'Get deleted users failed');
        throw error;
      }
    });

    // Admin restore user
    fastify.post('/admin/users/:id/restore', {
      schema: {
        tags: ['Admin - User Management'],
        summary: 'Restore deleted user (admin only)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;
        const adminId = (request as any).user.id;
        
        const result = await fastify.softDeleteService.restoreUser(id, adminId);
        
        logger.info('Admin restored user:', { userId: id, adminId });
        
        return reply.send({
          success: true,
          message: 'User restored successfully',
          data: result,
        });
      } catch (error) {
        logger.error({ error }, 'Admin restore user failed');
        throw error;
      }
    });

    // Admin permanently delete user
    fastify.delete('/admin/users/:id/permanent', {
      schema: {
        tags: ['Admin - User Management'],
        summary: 'Permanently delete user (admin only)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;
        const adminId = (request as any).user.id;
        
        const result = await fastify.softDeleteService.permanentlyDeleteUser(id, adminId);
        
        logger.warn('Admin permanently deleted user:', { userId: id, adminId });
        
        return reply.send({
          success: true,
          message: 'User permanently deleted',
          data: result,
        });
      } catch (error) {
        logger.error({ error }, 'Admin permanent delete failed');
        throw error;
      }
    });

    // Get user by ID (admin only)
    fastify.get<{ Params: GetUserByIdRequest }>(
      '/admin/users/:id',
      {
        preHandler: validate({ params: getUserByIdSchema }),
        schema: {
          tags: ['Admin - User Management'],
          summary: 'Get user by ID (admin only)',
          params: getUserByIdSchema,
          security: [{ bearerAuth: [] }],
        },
      },
      async (request: FastifyRequest<{ Params: GetUserByIdRequest }>, reply: FastifyReply) => {
        try {
          const { id } = request.params;
          
          logger.info({ userId: id }, 'Admin get user by ID request');
          
          // TODO: Implement get user by ID logic
          // 1. Find user by ID
          // 2. Return detailed user information
          
          // Placeholder implementation
          const userDetail: UserDetailResponse = {
            id,
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: null,
            isEmailVerified: true,
            isPhoneVerified: false,
            status: 'active',
            role: 'user',
            lastLoginAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            loginAttempts: 0,
            activeSessions: 1,
            twoFactorEnabled: false,
            accountLocked: false,
            lockoutExpiresAt: null,
          };
          
          return reply.send({
            success: true,
            data: userDetail,
          });
        } catch (error) {
          logger.error({ error, userId: request.params.id }, 'Admin get user failed');
          throw error;
        }
      }
    );

    // Suspend user (admin only)
    fastify.post<{ Params: GetUserByIdRequest; Body: SuspendUserRequest }>(
      '/admin/users/:id/suspend',
      {
        preHandler: validate({ params: getUserByIdSchema, body: suspendUserSchema }),
        schema: {
          tags: ['Admin - User Management'],
          summary: 'Suspend user account (admin only)',
          params: getUserByIdSchema,
          body: suspendUserSchema,
          security: [{ bearerAuth: [] }],
        },
      },
      async (request: FastifyRequest<{ Params: GetUserByIdRequest; Body: SuspendUserRequest }>, reply: FastifyReply) => {
        try {
          const { id } = request.params;
          const { reason, duration } = request.body;
          
          logger.info({ userId: id, reason, duration }, 'Admin suspend user request');
          
          // TODO: Implement suspend user logic
          // 1. Find user by ID
          // 2. Update user status to suspended
          // 3. Set suspension expiry if duration provided
          // 4. Revoke all user tokens
          // 5. Log admin action
          // 6. Send notification to user
          
          return reply.send({
            success: true,
            message: 'User suspended successfully',
          });
        } catch (error) {
          logger.error({ error, userId: request.params.id }, 'Admin suspend user failed');
          throw error;
        }
      }
    );

    // Get user statistics (admin only)
    fastify.get(
      '/admin/stats',
      {
        schema: {
          tags: ['Admin - User Management'],
          summary: 'Get user statistics (admin only)',
          security: [{ bearerAuth: [] }],
        },
      },
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          logger.info('Admin get stats request');
          
          // TODO: Implement get stats logic
          // 1. Query database for various user counts
          // 2. Calculate registration trends
          // 3. Return comprehensive stats
          
          // Placeholder implementation
          const stats: UserStats = {
            totalUsers: 1000,
            activeUsers: 800,
            suspendedUsers: 50,
            verifiedUsers: 900,
            usersRegisteredToday: 10,
            usersRegisteredThisWeek: 75,
            usersRegisteredThisMonth: 300,
          };
          
          return reply.send({
            success: true,
            data: stats,
          });
        } catch (error) {
          logger.error({ error }, 'Admin get stats failed');
          throw error;
        }
      }
    );

    // Cleanup expired deletions (admin only)
    fastify.post('/admin/cleanup/expired-deletions', {
      schema: {
        tags: ['Admin - User Management'],
        summary: 'Cleanup expired user deletions (admin only)',
        security: [{ bearerAuth: [] }],
      },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await fastify.softDeleteService.cleanupExpiredDeletions();
        
        logger.info('Cleanup expired deletions completed:', result);
        
        return reply.send({
          success: true,
          message: 'Cleanup completed successfully',
          data: result,
        });
      } catch (error) {
        logger.error({ error }, 'Cleanup expired deletions failed');
        throw error;
      }
    });

    // Additional admin endpoints would be implemented similarly...
    // (unsuspendUser, changeUserRole, resetUserPassword, etc.)
  });
}