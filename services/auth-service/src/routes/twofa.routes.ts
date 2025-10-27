import { FastifyInstance } from 'fastify';
import {
  setup2FASchema,
  enable2FASchema,
  disable2FASchema,
  verify2FASchema,
  regenerateBackupCodesSchema,
  Setup2FARequest,
  Enable2FARequest,
  Disable2FARequest,
  Verify2FARequest,
  RegenerateBackupCodesRequest,
} from '../schemas/auth.schema';
import { validate } from '../middleware/validate';
import { logger } from '../utils/logger';
import { 
  TwoFAController,
  createTwoFAController 
} from '../controllers/twofa.controller';
import { 
  createTwoFAService,
} from '../services/twofa.service';

export async function twoFARoutes(fastify: FastifyInstance) {
  // Initialize services
  const twoFAService = createTwoFAService({
    prisma: fastify.prisma,
  });

  // Initialize controller
  const twoFAController = createTwoFAController({
    twoFAService,
  });

  // Setup 2FA - generate secret and QR code
  fastify.post<{ Body: Setup2FARequest }>(
    '/setup',
    {
      preHandler: [],
      schema: {
        tags: ['Two-Factor Authentication'],
        summary: 'Setup 2FA - generate secret and QR code',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  qrCodeUrl: { type: 'string' },
                  backupCodes: { 
                    type: 'array',
                    items: { type: 'string' }
                  },
                  manualEntryKey: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    twoFAController.setup2FA.bind(twoFAController)
  );

  // Enable 2FA after verification - TEMPORARILY DISABLED
  /*
  fastify.post<{ Body: Enable2FARequest }>(
    '/enable',
    {
      preHandler: [validate({ body: enable2FASchema })],
      schema: {
        tags: ['Two-Factor Authentication'],
        summary: 'Enable 2FA after verification',
        security: [{ bearerAuth: [] }],
        body: enable2FASchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    twoFAController.enable2FA.bind(twoFAController)
  );
  */

  // Disable 2FA
  fastify.post<{ Body: Disable2FARequest }>(
    '/disable',
    {
      preHandler: [validate({ body: disable2FASchema })],
      schema: {
        tags: ['Two-Factor Authentication'],
        summary: 'Disable 2FA',
        security: [{ bearerAuth: [] }],
        body: disable2FASchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    twoFAController.disable2FA.bind(twoFAController)
  );

  // Verify 2FA code
  fastify.post<{ Body: Verify2FARequest }>(
    '/verify',
    {
      preHandler: [validate({ body: verify2FASchema })],
      schema: {
        tags: ['Two-Factor Authentication'],
        summary: 'Verify 2FA code',
        security: [{ bearerAuth: [] }],
        body: verify2FASchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  backupCodeUsed: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    twoFAController.verify2FA.bind(twoFAController)
  );

  // Regenerate backup codes
  fastify.post<{ Body: RegenerateBackupCodesRequest }>(
    '/regenerate-backup-codes',
    {
      preHandler: [validate({ body: regenerateBackupCodesSchema })],
      schema: {
        tags: ['Two-Factor Authentication'],
        summary: 'Regenerate backup codes',
        security: [{ bearerAuth: [] }],
        body: regenerateBackupCodesSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  backupCodes: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                },
              },
            },
          },
        },
      },
    },
    twoFAController.regenerateBackupCodes.bind(twoFAController)
  );

  // Get 2FA status
  fastify.get(
    '/status',
    {
      preHandler: [],
      schema: {
        tags: ['Two-Factor Authentication'],
        summary: 'Get 2FA status',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                  setupAt: { type: 'string', format: 'date-time' },
                  enabledAt: { type: 'string', format: 'date-time' },
                  backupCodesCount: { type: 'number' },
                  lastUsedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    twoFAController.get2FAStatus.bind(twoFAController)
  );
}