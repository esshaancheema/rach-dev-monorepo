import { FastifyInstance } from 'fastify';
import { DeviceTrustService } from '../../services/device-trust.service';
import { PrismaClient, TrustLevel } from '@zoptal/database';
import { logger } from '../../utils/logger';
import { rateLimiters } from '../../middleware/rate-limit';
import { authenticateToken } from '../../middleware/auth';

const createDeviceTrustSchema = {
  body: {
    type: 'object',
    required: ['trustLevel'],
    properties: {
      trustLevel: {
        type: 'string',
        enum: ['BASIC', 'HIGH', 'BIOMETRIC', 'ADMIN']
      },
      trustDurationDays: {
        type: 'number',
        minimum: 1,
        maximum: 365
      },
      deviceName: {
        type: 'string',
        maxLength: 100
      }
    }
  }
};

const removeDeviceTrustSchema = {
  params: {
    type: 'object',
    required: ['deviceId'],
    properties: {
      deviceId: {
        type: 'string'
      }
    }
  }
};

const verifyDeviceTrustSchema = {
  body: {
    type: 'object',
    required: ['deviceFingerprint'],
    properties: {
      deviceFingerprint: {
        type: 'string'
      }
    }
  }
};

export default async function deviceTrustRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma as PrismaClient;
  const deviceTrustService = new DeviceTrustService({ prisma });

  // Create device trust
  fastify.post('/trust', {
    preHandler: authenticateToken,
    schema: createDeviceTrustSchema
  }, async (request, reply) => {
    try {
      const user = request.user;
      const { trustLevel, trustDurationDays, deviceName } = request.body as any;
      
      const ipAddress = request.ip || '127.0.0.1';
      const userAgent = request.headers['user-agent'] || 'Unknown';

      const result = await deviceTrustService.createDeviceTrust({
        userId: user.id,
        ipAddress,
        userAgent,
        trustLevel: trustLevel as TrustLevel,
        trustDurationDays,
        deviceName
      });

      if (!result.success) {
        return reply.status(400).send({
          success: false,
          message: result.message
        });
      }

      logger.info({
        userId: user.id,
        deviceId: result.deviceId?.substring(0, 8) + '***',
        trustLevel
      }, 'Device trust created via API');

      reply.send({
        success: true,
        message: result.message,
        trustToken: result.trustToken,
        deviceId: result.deviceId,
        expiresAt: result.expiresAt
      });

    } catch (error) {
      logger.error('Device trust creation failed:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to create device trust'
      });
    }
  });

  // Verify device trust
  fastify.post('/verify', {
    preHandler: authenticateToken,
    schema: verifyDeviceTrustSchema
  }, async (request, reply) => {
    try {
      const user = request.user;
      const { deviceFingerprint } = request.body as any;
      
      const ipAddress = request.ip || '127.0.0.1';
      const userAgent = request.headers['user-agent'] || 'Unknown';

      const verification = await deviceTrustService.verifyDeviceTrust({
        userId: user.id,
        deviceFingerprint,
        ipAddress,
        userAgent
      });

      reply.send({
        success: true,
        trusted: verification.trusted,
        trustLevel: verification.trustLevel,
        deviceInfo: verification.deviceInfo,
        lastUsed: verification.lastUsed,
        requiresReauth: verification.requiresReauth
      });

    } catch (error) {
      logger.error('Device trust verification failed:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to verify device trust'
      });
    }
  });

  // Get user's trusted devices
  fastify.get('/devices', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const user = request.user;
      
      const devices = await deviceTrustService.getUserTrustedDevices(user.id);

      reply.send({
        success: true,
        devices
      });

    } catch (error) {
      logger.error('Failed to get trusted devices:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to get trusted devices'
      });
    }
  });

  // Remove device trust
  fastify.delete('/devices/:deviceId', {
    preHandler: authenticateToken,
    schema: removeDeviceTrustSchema
  }, async (request, reply) => {
    try {
      const user = request.user;
      const { deviceId } = request.params as any;

      const removed = await deviceTrustService.removeDeviceTrust(user.id, deviceId);

      if (!removed) {
        return reply.status(404).send({
          success: false,
          message: 'Device not found or not authorized'
        });
      }

      logger.info({
        userId: user.id,
        deviceId: deviceId.substring(0, 8) + '***'
      }, 'Device trust removed via API');

      reply.send({
        success: true,
        message: 'Device trust removed successfully'
      });

    } catch (error) {
      logger.error('Failed to remove device trust:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to remove device trust'
      });
    }
  });

  // Generate device fingerprint (utility endpoint)
  fastify.post('/fingerprint', async (request, reply) => {
    try {
      const ipAddress = request.ip || '127.0.0.1';
      const userAgent = request.headers['user-agent'] || 'Unknown';

      const fingerprint = deviceTrustService.generateDeviceFingerprint(ipAddress, userAgent);

      reply.send({
        success: true,
        fingerprint
      });

    } catch (error) {
      logger.error('Failed to generate device fingerprint:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to generate device fingerprint'
      });
    }
  });

  // Get device trust statistics (admin only)
  fastify.get('/stats', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const stats = await deviceTrustService.getDeviceTrustStats();

      reply.send({
        success: true,
        stats
      });

    } catch (error) {
      logger.error('Failed to get device trust stats:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to get device trust statistics'
      });
    }
  });

  // Cleanup expired trusts (admin only)
  fastify.post('/cleanup', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const cleanedCount = await deviceTrustService.cleanupExpiredTrusts();

      reply.send({
        success: true,
        message: `Cleaned up ${cleanedCount} expired device trusts`,
        cleanedCount
      });

    } catch (error) {
      logger.error('Failed to cleanup expired device trusts:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to cleanup expired device trusts'
      });
    }
  });
}