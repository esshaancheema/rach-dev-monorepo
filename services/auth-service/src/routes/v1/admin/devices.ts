import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../../../middleware/auth';
import { PrismaClient, UserRole, TrustLevel } from '@zoptal/database';

interface DeviceFilters {
  search?: string;
  trustLevel?: TrustLevel;
  deviceType?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function adminDevicesRoutes(fastify: FastifyInstance) {
  // Get all trusted devices with filtering
  fastify.get('/devices', {
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

      const query = request.query as DeviceFilters;
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 20));
      const offset = (page - 1) * limit;

      // Build where clause
      const whereClause: any = {};

      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        whereClause.OR = [
          { deviceName: { contains: searchTerm, mode: 'insensitive' } },
          { ipAddress: { contains: searchTerm } },
          { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
          { user: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
          { user: { lastName: { contains: searchTerm, mode: 'insensitive' } } }
        ];
      }

      if (query.trustLevel) {
        whereClause.trustLevel = query.trustLevel;
      }

      if (query.deviceType) {
        // This would require proper device type parsing from deviceInfo JSON
        // For now, we'll do a simple contains search
        whereClause.deviceInfo = {
          path: ['device', 'type'],
          string_contains: query.deviceType
        };
      }

      if (query.status) {
        const now = new Date();
        switch (query.status) {
          case 'active':
            whereClause.expiresAt = { gt: now };
            break;
          case 'expiring':
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            whereClause.AND = [
              { expiresAt: { gt: now } },
              { expiresAt: { lte: sevenDaysFromNow } }
            ];
            break;
          case 'suspicious':
            // Add criteria for suspicious devices (this is a simplified example)
            const recentTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            whereClause.AND = [
              { createdAt: { gte: recentTime } },
              { lastUsedAt: { lt: recentTime } }
            ];
            break;
        }
      }

      // Execute queries
      const [devices, totalDevices] = await Promise.all([
        request.server.prisma.trustedDevice.findMany({
          where: whereClause,
          orderBy: { lastUsedAt: 'desc' },
          skip: offset,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }),
        request.server.prisma.trustedDevice.count({ where: whereClause })
      ]);

      const totalPages = Math.ceil(totalDevices / limit);

      // Format devices with additional information
      const formattedDevices = devices.map(device => {
        // Parse device info JSON
        let deviceInfo = {};
        try {
          deviceInfo = typeof device.deviceInfo === 'string' 
            ? JSON.parse(device.deviceInfo) 
            : device.deviceInfo;
        } catch {
          deviceInfo = {};
        }

        // Mock location data (in production, this would come from IP geolocation service)
        const mockLocations = [
          { country: 'United States', city: 'New York', flag: '🇺🇸' },
          { country: 'Canada', city: 'Toronto', flag: '🇨🇦' },
          { country: 'United Kingdom', city: 'London', flag: '🇬🇧' },
          { country: 'Germany', city: 'Berlin', flag: '🇩🇪' },
          { country: 'France', city: 'Paris', flag: '🇫🇷' }
        ];
        const location = mockLocations[Math.floor(Math.random() * mockLocations.length)];

        return {
          ...device,
          deviceInfo,
          userName: [device.user.firstName, device.user.lastName].filter(Boolean).join(' ') || 'Unknown',
          userEmail: device.user.email,
          location,
          // Check if this is a current session (simplified)
          isCurrentSession: device.lastUsedAt > new Date(Date.now() - 30 * 60 * 1000) // Active in last 30 minutes
        };
      });

      reply.send({
        success: true,
        devices: formattedDevices,
        totalDevices,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      });

    } catch (error) {
      fastify.log.error('Admin devices fetch error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to fetch devices'
      });
    }
  });

  // Get device statistics
  fastify.get('/devices/stats', {
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
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [
        totalDevices,
        activeDevices,
        expiringSoon,
        suspiciousDevices,
        trustLevelCounts
      ] = await Promise.all([
        request.server.prisma.trustedDevice.count(),
        request.server.prisma.trustedDevice.count({
          where: { expiresAt: { gt: now } }
        }),
        request.server.prisma.trustedDevice.count({
          where: {
            expiresAt: { gt: now, lte: sevenDaysFromNow }
          }
        }),
        // Simplified suspicious device detection
        request.server.prisma.trustedDevice.count({
          where: {
            AND: [
              { createdAt: { gte: oneDayAgo } },
              { lastUsedAt: { lt: oneDayAgo } }
            ]
          }
        }),
        // Get trust level breakdown
        request.server.prisma.trustedDevice.groupBy({
          by: ['trustLevel'],
          _count: true
        })
      ]);

      // Format trust level breakdown
      const trustLevelBreakdown = {
        BASIC: 0,
        HIGH: 0,
        BIOMETRIC: 0,
        ADMIN: 0
      };

      trustLevelCounts.forEach(item => {
        trustLevelBreakdown[item.trustLevel as keyof typeof trustLevelBreakdown] = item._count;
      });

      reply.send({
        success: true,
        stats: {
          totalDevices,
          activeDevices,
          expiringSoon,
          suspiciousDevices,
          trustLevelBreakdown
        }
      });

    } catch (error) {
      fastify.log.error('Admin device stats error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to fetch device statistics'
      });
    }
  });

  // Remove single device
  fastify.delete('/devices/:deviceId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const user = request.user;
      const { deviceId } = request.params as { deviceId: string };
      
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return reply.status(403).send({
          success: false,
          message: 'Admin access required'
        });
      }

      const device = await request.server.prisma.trustedDevice.findUnique({
        where: { id: deviceId },
        include: { user: { select: { email: true } } }
      });

      if (!device) {
        return reply.status(404).send({
          success: false,
          message: 'Device not found'
        });
      }

      await request.server.prisma.trustedDevice.delete({
        where: { id: deviceId }
      });

      reply.send({
        success: true,
        message: `Trusted device removed for ${device.user.email}`
      });

    } catch (error) {
      fastify.log.error('Admin device removal error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to remove device'
      });
    }
  });

  // Bulk remove devices
  fastify.post('/devices/bulk-remove', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const user = request.user;
      const { deviceIds } = request.body as { deviceIds: string[] };
      
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return reply.status(403).send({
          success: false,
          message: 'Admin access required'
        });
      }

      if (!deviceIds || !Array.isArray(deviceIds) || deviceIds.length === 0) {
        return reply.status(400).send({
          success: false,
          message: 'Device IDs array is required'
        });
      }

      const result = await request.server.prisma.trustedDevice.deleteMany({
        where: {
          id: { in: deviceIds }
        }
      });

      reply.send({
        success: true,
        message: `${result.count} trusted devices removed`,
        removedCount: result.count
      });

    } catch (error) {
      fastify.log.error('Admin bulk device removal error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to remove devices'
      });
    }
  });
}