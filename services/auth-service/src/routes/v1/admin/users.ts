import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../../../middleware/auth';
import { rateLimiters } from '../../../middleware/rate-limit';
import { PrismaClient, UserRole, UserStatus } from '@zoptal/database';

interface UserFilters {
  search?: string;
  status?: UserStatus;
  verified?: 'true' | 'false';
  sortBy?: 'createdAt' | 'lastLoginAt' | 'email' | 'phone';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function adminUsersRoutes(fastify: FastifyInstance) {
  // Get users with pagination and filtering
  fastify.get('/users', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const user = request.user;
      
      // Check admin privileges
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return reply.status(403).send({
          success: false,
          message: 'Admin access required'
        });
      }

      const query = request.query as UserFilters;
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 20));
      const offset = (page - 1) * limit;

      // Build where clause
      const whereClause: any = {};

      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        whereClause.OR = [
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm } },
          { username: { contains: searchTerm, mode: 'insensitive' } },
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }

      if (query.status) {
        whereClause.status = query.status;
      }

      if (query.verified === 'true') {
        whereClause.AND = [
          { emailVerifiedAt: { not: null } },
          { phoneVerifiedAt: { not: null } }
        ];
      } else if (query.verified === 'false') {
        whereClause.OR = [
          { emailVerifiedAt: null },
          { phoneVerifiedAt: null }
        ];
      }

      // Build order by clause
      const orderBy: any = {};
      if (query.sortBy) {
        orderBy[query.sortBy] = query.sortOrder || 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      // Execute queries
      const [users, totalUsers] = await Promise.all([
        request.server.request.server.prisma.user.findMany({
          where: whereClause,
          orderBy,
          skip: offset,
          take: limit,
          select: {
            id: true,
            email: true,
            phone: true,
            username: true,
            firstName: true,
            lastName: true,
            status: true,
            role: true,
            emailVerifiedAt: true,
            phoneVerifiedAt: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                trustedDevices: true,
                sessions: { where: { expiresAt: { gt: new Date() } } }
              }
            }
          }
        }),
        request.server.request.server.prisma.user.count({ where: whereClause })
      ]);

      const totalPages = Math.ceil(totalUsers / limit);

      const formattedUsers = users.map(user => ({
        ...user,
        isEmailVerified: !!user.emailVerifiedAt,
        isPhoneVerified: !!user.phoneVerifiedAt,
        trustedDevicesCount: user._count.trustedDevices,
        activeSessionsCount: user._count.sessions,
        fullName: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A'
      }));

      reply.send({
        success: true,
        users: formattedUsers,
        totalUsers,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      });
    } catch (error) {
      fastify.log.error('Admin users fetch error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  });

  // Get user statistics
  fastify.get('/users/stats', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const user = request.user;
      
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return reply.status(403).send({
          success: false,
          message: 'Admin access required'
        });
      }

      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        activeUsers,
        pendingUsers,
        suspendedUsers,
        verifiedUsers,
        newUsers30Days,
        newUsers7Days,
        recentLoginUsers
      ] = await Promise.all([
        request.server.request.server.prisma.user.count(),
        request.server.request.server.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
        request.server.request.server.prisma.user.count({ where: { status: UserStatus.PENDING } }),
        request.server.request.server.prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
        request.server.request.server.prisma.user.count({ 
          where: { 
            AND: [
              { emailVerifiedAt: { not: null } },
              { phoneVerifiedAt: { not: null } }
            ]
          }
        }),
        request.server.request.server.prisma.user.count({ where: { createdAt: { gte: last30Days } } }),
        request.server.request.server.prisma.user.count({ where: { createdAt: { gte: last7Days } } }),
        request.server.request.server.prisma.user.count({ where: { lastLoginAt: { gte: last7Days } } })
      ]);

      const verificationRate = totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0;
      const growthRate30Days = totalUsers > 0 ? (newUsers30Days / totalUsers) * 100 : 0;
      const activeRate = totalUsers > 0 ? (recentLoginUsers / totalUsers) * 100 : 0;

      reply.send({
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          pendingUsers,
          suspendedUsers,
          verifiedUsers,
          newUsers30Days,
          newUsers7Days,
          recentLoginUsers,
          verificationRate: Math.round(verificationRate * 100) / 100,
          growthRate30Days: Math.round(growthRate30Days * 100) / 100,
          activeRate: Math.round(activeRate * 100) / 100
        }
      });
    } catch (error) {
      fastify.log.error('Admin user stats error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to fetch user statistics'
      });
    }
  });

  // Get single user details
  fastify.get('/users/:userId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const user = request.user;
      const { userId } = request.params as { userId: string };
      
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return reply.status(403).send({
          success: false,
          message: 'Admin access required'
        });
      }

      const targetUser = await request.server.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          username: true,
          firstName: true,
          lastName: true,
          status: true,
          role: true,
          emailVerifiedAt: true,
          phoneVerifiedAt: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          trustedDevices: {
            select: {
              id: true,
              deviceName: true,
              deviceInfo: true,
              trustLevel: true,
              lastUsedAt: true,
              expiresAt: true,
              ipAddress: true
            }
          },
          sessions: {
            where: { expiresAt: { gt: new Date() } },
            select: {
              id: true,
              createdAt: true,
              expiresAt: true,
              ipAddress: true,
              userAgent: true
            }
          }
        }
      });

      if (!targetUser) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        });
      }

      reply.send({
        success: true,
        user: {
          ...targetUser,
          isEmailVerified: !!targetUser.emailVerifiedAt,
          isPhoneVerified: !!targetUser.phoneVerifiedAt,
          fullName: [targetUser.firstName, targetUser.lastName].filter(Boolean).join(' ') || 'N/A',
          trustedDevicesCount: targetUser.trustedDevices.length,
          activeSessionsCount: targetUser.sessions.length
        }
      });
    } catch (error) {
      fastify.log.error('Admin user details error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to fetch user details'
      });
    }
  });

  // Update user
  fastify.patch('/users/:userId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const user = request.user;
      const { userId } = request.params as { userId: string };
      const updates = request.body as any;
      
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return reply.status(403).send({
          success: false,
          message: 'Admin access required'
        });
      }

      // Prevent non-super-admin from updating admin users
      const targetUser = await request.server.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!targetUser) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        });
      }

      if (targetUser.role === UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return reply.status(403).send({
          success: false,
          message: 'Super admin access required to modify admin users'
        });
      }

      // Validate allowed update fields
      const allowedFields = ['status', 'role', 'firstName', 'lastName'];
      const updateData: any = {};

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          updateData[field] = updates[field];
        }
      }

      // Prevent role escalation beyond current user's role
      if (updateData.role) {
        if (user.role === UserRole.ADMIN && updateData.role === UserRole.SUPER_ADMIN) {
          return reply.status(403).send({
            success: false,
            message: 'Cannot escalate role beyond your own privileges'
          });
        }
      }

      const updatedUser = await request.server.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          phone: true,
          username: true,
          firstName: true,
          lastName: true,
          status: true,
          role: true,
          emailVerifiedAt: true,
          phoneVerifiedAt: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true
        }
      });

      reply.send({
        success: true,
        user: {
          ...updatedUser,
          isEmailVerified: !!updatedUser.emailVerifiedAt,
          isPhoneVerified: !!updatedUser.phoneVerifiedAt,
          fullName: [updatedUser.firstName, updatedUser.lastName].filter(Boolean).join(' ') || 'N/A'
        },
        message: 'User updated successfully'
      });
    } catch (error) {
      fastify.log.error('Admin user update error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to update user'
      });
    }
  });

  // Delete user
  fastify.delete('/users/:userId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const user = request.user;
      const { userId } = request.params as { userId: string };
      
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return reply.status(403).send({
          success: false,
          message: 'Admin access required'
        });
      }

      // Prevent self-deletion
      if (user.id === userId) {
        return reply.status(400).send({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      // Check target user role
      const targetUser = await request.server.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, email: true }
      });

      if (!targetUser) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent non-super-admin from deleting admin users
      if (targetUser.role === UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return reply.status(403).send({
          success: false,
          message: 'Super admin access required to delete admin users'
        });
      }

      // Delete user and related data
      await request.server.prisma.$transaction(async (tx) => {
        // Delete related records first
        await tx.trustedDevice.deleteMany({ where: { userId } });
        await tx.session.deleteMany({ where: { userId } });
        await tx.otpCode.deleteMany({ where: { userId } });
        await tx.magicLink.deleteMany({ where: { userId } });
        
        // Delete the user
        await tx.user.delete({ where: { id: userId } });
      });

      reply.send({
        success: true,
        message: `User ${targetUser.email} deleted successfully`
      });
    } catch (error) {
      fastify.log.error('Admin user delete error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to delete user'
      });
    }
  });
}