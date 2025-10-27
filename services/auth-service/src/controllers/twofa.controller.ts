import { FastifyRequest, FastifyReply } from 'fastify';
import { TwoFAService } from '../services/twofa.service';
import { 
  Enable2FARequest,
  Disable2FARequest,
  Verify2FARequest,
  RegenerateBackupCodesRequest,
} from '../schemas/auth.schema';
import { 
  enable2FASchema,
  disable2FASchema,
  verify2FASchema,
  regenerateBackupCodesSchema,
} from '../schemas/auth.schema';
import { 
  validateSchema,
} from '../schemas';
import { logger } from '../utils/logger';

export interface TwoFAControllerDependencies {
  twoFAService: TwoFAService;
}

export class TwoFAController {
  constructor(private deps: TwoFAControllerDependencies) {}

  /**
   * Setup 2FA - generate secret, QR code, and backup codes
   */
  async setup2FA(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any)?.id;
      const userEmail = (request.user as any)?.email;
      
      if (!userId || !userEmail) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const result = await this.deps.twoFAService.setup2FA(userId, userEmail);

      reply.send({
        success: true,
        message: '2FA setup initiated. Please save your backup codes and scan the QR code.',
        data: {
          qrCodeUrl: result.qrCodeUrl,
          backupCodes: result.backupCodes,
          manualEntryKey: result.manualEntryKey,
        },
      });

      logger.info('2FA setup initiated:', { userId, email: userEmail });
    } catch (error) {
      this.handleError(error, reply, 'Failed to setup 2FA');
    }
  }

  /**
   * Enable 2FA after verification
   */
  async enable2FA(
    request: FastifyRequest<{ Body: Enable2FARequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any)?.id;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const validatedData = validateSchema(enable2FASchema, request.body);
      const { verificationCode } = validatedData;

      const result = await this.deps.twoFAService.enable2FA(userId, verificationCode);

      if (result.success) {
        reply.send({
          success: true,
          message: result.message,
        });

        logger.info('2FA enabled:', { userId });
      } else {
        reply.status(400).send({
          success: false,
          error: 'VERIFICATION_FAILED',
          message: result.message,
        });
      }
    } catch (error) {
      this.handleError(error, reply, 'Failed to enable 2FA');
    }
  }

  /**
   * Disable 2FA
   */
  async disable2FA(
    request: FastifyRequest<{ Body: Disable2FARequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any)?.id;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const validatedData = validateSchema(disable2FASchema, request.body);
      const { verificationCode } = validatedData;

      const result = await this.deps.twoFAService.disable2FA(userId, verificationCode);

      if (result.success) {
        reply.send({
          success: true,
          message: result.message,
        });

        logger.info('2FA disabled:', { userId });
      } else {
        reply.status(400).send({
          success: false,
          error: 'VERIFICATION_FAILED',
          message: result.message,
        });
      }
    } catch (error) {
      this.handleError(error, reply, 'Failed to disable 2FA');
    }
  }

  /**
   * Verify 2FA code (for general verification)
   */
  async verify2FA(
    request: FastifyRequest<{ Body: Verify2FARequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any)?.id;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const validatedData = validateSchema(verify2FASchema, request.body);
      const { code } = validatedData;

      const result = await this.deps.twoFAService.verify2FA(userId, code);

      if (result.success) {
        reply.send({
          success: true,
          message: result.message,
          data: {
            backupCodeUsed: result.backupCodeUsed,
          },
        });
      } else {
        reply.status(400).send({
          success: false,
          error: 'VERIFICATION_FAILED',
          message: result.message,
        });
      }
    } catch (error) {
      this.handleError(error, reply, 'Failed to verify 2FA code');
    }
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(
    request: FastifyRequest<{ Body: RegenerateBackupCodesRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any)?.id;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const validatedData = validateSchema(regenerateBackupCodesSchema, request.body);
      const { verificationCode } = validatedData;

      const result = await this.deps.twoFAService.regenerateBackupCodes(userId, verificationCode);

      if (result.success) {
        reply.send({
          success: true,
          message: result.message,
          data: {
            backupCodes: result.backupCodes,
          },
        });

        logger.info('Backup codes regenerated:', { userId });
      } else {
        reply.status(400).send({
          success: false,
          error: 'VERIFICATION_FAILED',
          message: result.message,
        });
      }
    } catch (error) {
      this.handleError(error, reply, 'Failed to regenerate backup codes');
    }
  }

  /**
   * Get 2FA status
   */
  async get2FAStatus(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any)?.id;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const status = await this.deps.twoFAService.get2FAStatus(userId);

      reply.send({
        success: true,
        data: status,
      });
    } catch (error) {
      this.handleError(error, reply, 'Failed to get 2FA status');
    }
  }

  /**
   * Handle controller errors
   */
  private handleError(error: any, reply: FastifyReply, defaultMessage: string): void {
    logger.error('2FA controller error:', error);

    if (error.name === 'SchemaValidationError') {
      return reply.status(400).send({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.errors,
      });
    }

    reply.status(500).send({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: defaultMessage,
    });
  }
}

export const createTwoFAController = (deps: TwoFAControllerDependencies): TwoFAController => {
  return new TwoFAController(deps);
};