import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  getUsersQuerySchema,
  getUserByIdSchema,
  updateUserSchema,
  suspendUserSchema,
  unsuspendUserSchema,
  deleteUserSchema,
  changeUserRoleSchema,
  resetUserPasswordSchema,
  getUserActivityQuerySchema,
  bulkUpdateUsersSchema,
  bulkDeleteUsersSchema,
  exportUsersSchema,
  logAdminActionSchema,
  GetUsersQuery,
  GetUserByIdRequest,
  UpdateUserRequest,
  SuspendUserRequest,
  UnsuspendUserRequest,
  DeleteUserRequest,
  ChangeUserRoleRequest,
  ResetUserPasswordRequest,
  GetUserActivityQuery,
  BulkUpdateUsersRequest,
  BulkDeleteUsersRequest,
  ExportUsersRequest,
  LogAdminActionRequest,
  UsersResponse,
  UserDetailResponse,
  UserActivityResponse,
  UserStats,
} from '../schemas/user.schema';
import { validate } from '../middleware/validate';
import { logger } from '../utils/logger';
import { createNotFoundError, createForbiddenError } from '../middleware/error-handler';
import { createAdminService } from '../services/admin.service';
import { createPasswordHistoryService } from '../services/password-history.service';
import { createDeviceFingerprintService } from '../services/device-fingerprint.service';

export async function adminRoutes(fastify: FastifyInstance) {
  // Initialize services
  const adminService = createAdminService({
    prisma: fastify.prisma,
    forcePasswordResetService: (fastify as any).forcePasswordResetService,
  });
  const passwordHistoryService = createPasswordHistoryService({
    prisma: fastify.prisma,
  });
  const deviceFingerprintService = createDeviceFingerprintService({
    prisma: fastify.prisma,
  });

  // Admin authentication middleware
  fastify.addHook('preHandler', async (request, reply) => {
    // Verify JWT token first
    await fastify.authenticate(request, reply);
    
    // Check if user has admin or super_admin role
    const user = (request.user as any);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      throw createForbiddenError('Admin access required');
    }
    
    logger.info(
      {
        url: request.url,
        method: request.method,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
        userId: user.id,
        adminRole: user.role,
      },
      'Admin route access'
    );
  });

  // Dashboard statistics
  fastify.get(
    '/dashboard/stats',
    {
      schema: {
        tags: ['Admin - Dashboard'],
        summary: 'Get dashboard statistics',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                // UserStats schema would go here
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        logger.info('Admin dashboard stats request');
        
        const stats = await adminService.getDashboardStats();
        
        return reply.send({
          success: true,
          data: stats,
        });
      } catch (error) {
        logger.error({ error }, 'Admin dashboard stats failed');
        throw error;
      }
    }
  );

  // Advanced user search and management
  fastify.get<{ Querystring: GetUsersQuery }>(
    '/users/search',
    {
      preHandler: validate({ query: getUsersQuerySchema }),
      schema: {
        tags: ['Admin - User Management'],
        summary: 'Advanced user search',
        querystring: getUsersQuerySchema,
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ Querystring: GetUsersQuery }>, reply: FastifyReply) => {
      try {
        const { page = 1, limit = 10, q, status, role, isEmailVerified, isPhoneVerified, startDate, endDate } = request.query;
        
        logger.info(
          { page, limit, q, status, role, isEmailVerified, isPhoneVerified },
          'Admin user search request'
        );
        
        const filters = {
          q,
          status: status as any,
          role: role as any,
          isEmailVerified: isEmailVerified ? isEmailVerified === 'true' : undefined,
          isPhoneVerified: isPhoneVerified ? isPhoneVerified === 'true' : undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        };

        const result = await adminService.searchUsers(filters, { page: Number(page), limit: Number(limit) });
        
        return reply.send({
          success: true,
          data: {
            users: result.users,
            pagination: result.pagination,
          },
        });
      } catch (error) {
        logger.error({ error }, 'Admin user search failed');
        throw error;
      }
    }
  );

  // Bulk user operations
  fastify.post<{ Body: BulkUpdateUsersRequest }>(
    '/users/bulk-update',
    {
      preHandler: validate({ body: bulkUpdateUsersSchema }),
      schema: {
        tags: ['Admin - User Management'],
        summary: 'Bulk update users',
        body: bulkUpdateUsersSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ Body: BulkUpdateUsersRequest }>, reply: FastifyReply) => {
      try {
        const { userIds, updates, reason } = request.body;
        const adminId = (request.user as any).id;
        
        logger.info(
          { userCount: userIds.length, updates, reason, adminId },
          'Admin bulk update users request'
        );
        
        const result = await adminService.bulkUpdateUsers(userIds, updates, adminId, reason);
        
        return reply.send({
          success: result.success,
          message: `Successfully updated ${result.updatedCount} users${result.failedCount > 0 ? `, ${result.failedCount} failed` : ''}`,
          data: result,
        });
      } catch (error) {
        logger.error({ error }, 'Admin bulk update users failed');
        throw error;
      }
    }
  );

  // Update user status (suspend/activate)
  fastify.put<{ 
    Params: { id: string };
    Body: { status: string; reason?: string };
  }>(
    '/users/:id/status',
    {
      schema: {
        tags: ['Admin - User Management'],
        summary: 'Update user status (suspend/activate)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['active', 'suspended', 'pending'] },
            reason: { type: 'string' },
          },
          required: ['status'],
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ 
      Params: { id: string };
      Body: { status: string; reason?: string };
    }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const { status, reason } = request.body;
        const adminId = (request.user as any).id;
        
        logger.info({ userId: id, status, reason, adminId }, 'Admin update user status request');
        
        const result = await adminService.updateUserStatus(id, status as any, adminId, reason);
        
        return reply.send({
          success: result.success,
          message: `User status updated to ${status}`,
          data: {
            user: {
              id: result.user.id,
              email: result.user.email,
              status: result.user.status,
              firstName: result.user.firstName,
              lastName: result.user.lastName,
            },
          },
        });
      } catch (error) {
        logger.error({ error }, 'Admin update user status failed');
        throw error;
      }
    }
  );

  // Force logout user
  fastify.post<{ Params: { id: string } }>(
    '/users/:id/force-logout',
    {
      schema: {
        tags: ['Admin - User Management'],
        summary: 'Force logout user from all devices',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const adminId = (request.user as any).id;
        
        logger.info({ userId: id, adminId }, 'Admin force logout user request');
        
        const result = await adminService.forceLogoutUser(id, adminId);
        
        return reply.send({
          success: result.success,
          message: `User logged out from ${result.sessionsRevoked} sessions`,
          data: {
            sessionsRevoked: result.sessionsRevoked,
          },
        });
      } catch (error) {
        logger.error({ error }, 'Admin force logout user failed');
        throw error;
      }
    }
  );

  // User impersonation (super admin only)
  fastify.post<{ Params: GetUserByIdRequest }>(
    '/users/:id/impersonate',
    {
      preHandler: validate({ params: getUserByIdSchema }),
      schema: {
        tags: ['Admin - User Management'],
        summary: 'Impersonate user (super admin only)',
        params: getUserByIdSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ Params: GetUserByIdRequest }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        
        logger.info({ targetUserId: id }, 'Admin user impersonation request');
        
        // TODO: Implement user impersonation
        // 1. Check if current user is super admin
        // 2. Verify target user exists and is not another admin
        // 3. Generate impersonation token with special claims
        // 4. Log impersonation start
        // 5. Return impersonation token
        
        // This is a sensitive operation that should be heavily logged and audited
        
        return reply.send({
          success: true,
          message: 'Impersonation token generated',
          data: {
            impersonationToken: 'placeholder-impersonation-token',
            expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
            targetUser: {
              id,
              email: 'target@example.com',
              firstName: 'Target',
              lastName: 'User',
            },
          },
        });
      } catch (error) {
        logger.error({ error, targetUserId: request.params.id }, 'Admin user impersonation failed');
        throw error;
      }
    }
  );

  // System audit logs
  fastify.get(
    '/audit/logs',
    {
      schema: {
        tags: ['Admin - Audit'],
        summary: 'Get system audit logs',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
            action: { type: 'string' },
            userId: { type: 'string' },
            adminId: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
          },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{
      Querystring: {
        page?: number;
        limit?: number;
        action?: string;
        userId?: string;
        adminId?: string;
        startDate?: string;
        endDate?: string;
      };
    }>, reply: FastifyReply) => {
      try {
        const { page = 1, limit = 50, action, userId, adminId, startDate, endDate } = request.query;
        
        logger.info(
          { page, limit, action, userId, adminId },
          'Admin audit logs request'
        );
        
        const filters = {
          action,
          userId,
          adminId,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        };

        const result = await adminService.getAuditLogs(
          filters,
          { page: Number(page), limit: Number(limit) }
        );
        
        return reply.send({
          success: true,
          data: {
            logs: result.logs,
            pagination: result.pagination,
          },
        });
      } catch (error) {
        logger.error({ error }, 'Admin audit logs failed');
        throw error;
      }
    }
  );

  // Security events monitoring
  fastify.get(
    '/security/events',
    {
      schema: {
        tags: ['Admin - Security'],
        summary: 'Get security events',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            type: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
          },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{
      Querystring: {
        page?: number;
        limit?: number;
        severity?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
      };
    }>, reply: FastifyReply) => {
      try {
        const { page = 1, limit = 50, severity, type, startDate, endDate } = request.query;
        
        logger.info(
          { page, limit, severity, type },
          'Admin security events request'
        );
        
        const filters = {
          severity,
          type,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        };

        const result = await adminService.getSecurityEvents(
          filters,
          { page: Number(page), limit: Number(limit) }
        );
        
        return reply.send({
          success: true,
          data: {
            events: result.events,
            pagination: result.pagination,
            summary: result.summary,
          },
        });
      } catch (error) {
        logger.error({ error }, 'Admin security events failed');
        throw error;
      }
    }
  );

  // System configuration management
  fastify.get(
    '/system/config',
    {
      schema: {
        tags: ['Admin - System'],
        summary: 'Get system configuration',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        logger.info('Admin system config request');
        
        // TODO: Return non-sensitive system configuration
        // 1. Filter out secrets
        // 2. Include feature flags
        // 3. Include rate limits and security settings
        // 4. Include service health status
        
        const systemConfig = {
          features: {
            registrationEnabled: true,
            oauthEnabled: true,
            twoFactorEnabled: true,
            emailVerificationRequired: true,
          },
          security: {
            passwordMinLength: 8,
            maxLoginAttempts: 5,
            sessionTimeout: 30,
            tokenExpiry: '15m',
          },
          rateLimits: {
            loginAttempts: { max: 5, window: '15m' },
            registration: { max: 3, window: '1h' },
            apiCalls: { max: 100, window: '15m' },
          },
          services: {
            database: 'healthy',
            redis: 'healthy',
            email: 'healthy',
            sms: 'healthy',
          },
        };
        
        return reply.send({
          success: true,
          data: systemConfig,
        });
      } catch (error) {
        logger.error({ error }, 'Admin system config failed');
        throw error;
      }
    }
  );

  // Export user data
  fastify.post<{ Body: ExportUsersRequest }>(
    '/users/export',
    {
      preHandler: validate({ body: exportUsersSchema }),
      schema: {
        tags: ['Admin - Data Export'],
        summary: 'Export user data',
        body: exportUsersSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ Body: ExportUsersRequest }>, reply: FastifyReply) => {
      try {
        const { format, fields, filters } = request.body;
        
        logger.info({ format, fields, filters }, 'Admin user export request');
        
        // TODO: Implement user data export
        // 1. Apply filters to select users
        // 2. Select specified fields or all fields
        // 3. Generate export file (CSV/JSON)
        // 4. Store file temporarily or stream response
        // 5. Log export action for audit
        
        return reply.send({
          success: true,
          message: 'Export started successfully',
          data: {
            exportId: 'export-123',
            format,
            estimatedRecords: 0,
            downloadUrl: '/admin/exports/export-123/download',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });
      } catch (error) {
        logger.error({ error }, 'Admin user export failed');
        throw error;
      }
    }
  );

  // User password history analysis
  fastify.get<{ Params: { id: string } }>(
    '/users/:id/password-history',
    {
      schema: {
        tags: ['Admin - Security'],
        summary: 'Get user password history analysis',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        
        logger.info({ userId: id }, 'Admin password history analysis request');
        
        // Get password history summary and security score
        const [summary, securityScore, passwordAge] = await Promise.all([
          passwordHistoryService.getPasswordHistorySummary(id),
          passwordHistoryService.getPasswordSecurityScore(id),
          passwordHistoryService.checkPasswordAge(id, 90),
        ]);
        
        return reply.send({
          success: true,
          data: {
            summary,
            securityScore,
            passwordAge,
            recommendations: securityScore.recommendations,
          },
        });
      } catch (error) {
        logger.error({ error, userId: request.params.id }, 'Admin password history analysis failed');
        throw error;
      }
    }
  );

  // Force password history cleanup
  fastify.delete<{ Params: { id: string } }>(
    '/users/:id/password-history',
    {
      schema: {
        tags: ['Admin - Security'],
        summary: 'Clear user password history (for account deletion)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const adminId = (request.user as any).id;
        
        // Only super admins can clear password history
        const admin = (request.user as any);
        if (admin.role !== 'super_admin') {
          throw createForbiddenError('Super admin access required for this operation');
        }
        
        logger.info({ userId: id, adminId }, 'Admin clear password history request');
        
        const deletedCount = await passwordHistoryService.clearPasswordHistory(id);
        
        return reply.send({
          success: true,
          message: `Password history cleared for user`,
          data: {
            deletedEntries: deletedCount,
          },
        });
      } catch (error) {
        logger.error({ error, userId: request.params.id }, 'Admin clear password history failed');
        throw error;
      }
    }
  );

  // User device management
  fastify.get<{ Params: { id: string } }>(
    '/users/:id/devices',
    {
      schema: {
        tags: ['Admin - Device Management'],
        summary: 'Get user devices',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        
        logger.info({ userId: id }, 'Admin get user devices request');
        
        const [devices, analytics] = await Promise.all([
          deviceFingerprintService.getUserDevices(id),
          deviceFingerprintService.getDeviceAnalytics(id),
        ]);
        
        return reply.send({
          success: true,
          data: {
            devices,
            analytics,
          },
        });
      } catch (error) {
        logger.error({ error, userId: request.params.id }, 'Admin get user devices failed');
        throw error;
      }
    }
  );

  // Block device
  fastify.post<{ 
    Params: { deviceId: string };
    Body: { reason: string };
  }>(
    '/devices/:deviceId/block',
    {
      schema: {
        tags: ['Admin - Device Management'],
        summary: 'Block device',
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
          },
          required: ['deviceId'],
        },
        body: {
          type: 'object',
          properties: {
            reason: { type: 'string' },
          },
          required: ['reason'],
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ 
      Params: { deviceId: string };
      Body: { reason: string };
    }>, reply: FastifyReply) => {
      try {
        const { deviceId } = request.params;
        const { reason } = request.body;
        const adminId = (request.user as any).id;
        
        logger.info({ deviceId, reason, adminId }, 'Admin block device request');
        
        const success = await deviceFingerprintService.blockDevice(deviceId, reason);
        
        return reply.send({
          success,
          message: success ? 'Device blocked successfully' : 'Failed to block device',
        });
      } catch (error) {
        logger.error({ error, deviceId: request.params.deviceId }, 'Admin block device failed');
        throw error;
      }
    }
  );

  // Trust device
  fastify.post<{ Params: { deviceId: string } }>(
    '/devices/:deviceId/trust',
    {
      schema: {
        tags: ['Admin - Device Management'],
        summary: 'Trust device',
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
          },
          required: ['deviceId'],
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ Params: { deviceId: string } }>, reply: FastifyReply) => {
      try {
        const { deviceId } = request.params;
        const adminId = (request.user as any).id;
        
        logger.info({ deviceId, adminId }, 'Admin trust device request');
        
        const success = await deviceFingerprintService.trustDevice(deviceId, adminId);
        
        return reply.send({
          success,
          message: success ? 'Device trusted successfully' : 'Failed to trust device',
        });
      } catch (error) {
        logger.error({ error, deviceId: request.params.deviceId }, 'Admin trust device failed');
        throw error;
      }
    }
  );

  // Global device analytics
  fastify.get(
    '/devices/analytics',
    {
      schema: {
        tags: ['Admin - Device Management'],
        summary: 'Get global device analytics',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        logger.info('Admin global device analytics request');
        
        const analytics = await deviceFingerprintService.getDeviceAnalytics();
        
        return reply.send({
          success: true,
          data: analytics,
        });
      } catch (error) {
        logger.error({ error }, 'Admin global device analytics failed');
        throw error;
      }
    }
  );

  // Force Password Reset Management

  // Force password reset for specific user
  fastify.post(
    '/users/:id/force-password-reset',
    {
      schema: {
        tags: ['Admin - User Management'],
        summary: 'Force user to reset password',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            reason: { type: 'string', maxLength: 500 },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;
        const { reason } = request.body as any;
        const adminId = (request as any).user.id;
        
        logger.info({ userId: id, adminId, reason }, 'Admin force password reset request');
        
        const result = await adminService.forcePasswordReset(id, adminId, reason);
        
        return reply.send({
          success: true,
          message: 'Password reset forced successfully',
          data: result,
        });
      } catch (error) {
        logger.error({ error, userId: (request.params as any).id }, 'Admin force password reset failed');
        throw error;
      }
    }
  );

  // Clear force password reset requirement
  fastify.delete(
    '/users/:id/force-password-reset',
    {
      schema: {
        tags: ['Admin - User Management'],
        summary: 'Clear force password reset requirement',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;
        const adminId = (request as any).user.id;
        
        logger.info({ userId: id, adminId }, 'Admin clear force password reset request');
        
        const result = await adminService.clearForcePasswordReset(id, adminId);
        
        return reply.send({
          success: true,
          message: 'Force password reset requirement cleared',
          data: result,
        });
      } catch (error) {
        logger.error({ error, userId: (request.params as any).id }, 'Admin clear force password reset failed');
        throw error;
      }
    }
  );

  // Get all users with forced password reset
  fastify.get(
    '/users/force-password-reset',
    {
      schema: {
        tags: ['Admin - User Management'],
        summary: 'Get users with forced password reset requirement',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
            includeExpired: { type: 'boolean', default: false },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { page = 1, limit = 50, includeExpired = false } = request.query as any;
        
        logger.info({ page, limit, includeExpired }, 'Admin get forced reset users request');
        
        const result = await adminService.getForcedResetUsers(page, limit, includeExpired);
        
        return reply.send({
          success: true,
          data: result,
        });
      } catch (error) {
        logger.error({ error }, 'Admin get forced reset users failed');
        throw error;
      }
    }
  );

  // Bulk force password reset
  fastify.post(
    '/users/bulk-force-password-reset',
    {
      schema: {
        tags: ['Admin - User Management'],
        summary: 'Force password reset for multiple users',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['userIds'],
          properties: {
            userIds: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              maxItems: 100,
            },
            reason: { type: 'string', maxLength: 500 },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userIds, reason } = request.body as any;
        const adminId = (request as any).user.id;
        
        logger.info({ userIds: userIds.length, adminId, reason }, 'Admin bulk force password reset request');
        
        const result = await adminService.bulkForcePasswordReset(userIds, adminId, reason);
        
        return reply.send({
          success: true,
          message: `Processed ${result.processed} users, ${result.failed.length} failed`,
          data: result,
        });
      } catch (error) {
        logger.error({ error }, 'Admin bulk force password reset failed');
        throw error;
      }
    }
  );

  // Cleanup expired force password resets
  fastify.post(
    '/cleanup/expired-force-resets',
    {
      schema: {
        tags: ['Admin - System Management'],
        summary: 'Cleanup expired force password reset requirements',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const adminId = (request as any).user.id;
        
        logger.info({ adminId }, 'Admin cleanup expired force resets request');
        
        // Get force password reset service from fastify instance
        const forcePasswordResetService = (fastify as any).forcePasswordResetService;
        
        if (!forcePasswordResetService) {
          return reply.code(503).send({
            success: false,
            message: 'Force password reset service not available',
          });
        }
        
        const result = await forcePasswordResetService.cleanupExpiredForceResets();
        
        logger.info('Cleanup expired force resets completed:', result);
        
        return reply.send({
          success: true,
          message: 'Cleanup completed successfully',
          data: result,
        });
      } catch (error) {
        logger.error({ error }, 'Admin cleanup expired force resets failed');
        throw error;
      }
    }
  );
}