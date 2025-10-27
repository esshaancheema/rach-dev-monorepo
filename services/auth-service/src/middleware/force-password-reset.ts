import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

/**
 * Middleware to check if user has a forced password reset requirement
 * This should be used on protected routes to ensure users reset their passwords when required
 */
export async function checkForcePasswordReset(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Only apply to authenticated requests
    if (!(request as any).user) {
      return; // Not authenticated, skip check
    }

    const userId = (request as any).user.id;
    
    // Get force password reset service from Fastify instance
    const forcePasswordResetService = (request.server as any).forcePasswordResetService;
    
    if (!forcePasswordResetService) {
      logger.warn('Force password reset service not available');
      return;
    }

    // Check if user has force password reset requirement
    const resetStatus = await forcePasswordResetService.getPasswordResetStatus(userId);
    
    if (!resetStatus.isForced) {
      return; // No force reset required
    }

    // Check if grace period has expired
    if (resetStatus.isExpired) {
      logger.warn('User accessing with expired force password reset:', { userId });
      
      return reply.code(423).send({
        error: 'ACCOUNT_LOCKED',
        message: 'Your account has been locked due to failure to reset your password within the required timeframe. Please contact support.',
        code: 'FORCE_PASSWORD_RESET_EXPIRED',
        data: {
          resetAt: resetStatus.resetAt,
          reason: resetStatus.reason,
          gracePeriodEnds: resetStatus.gracePeriodEnds,
        },
      });
    }

    // Check if this is a password reset or change password request
    const isPasswordResetRequest = 
      request.url.includes('/auth/reset-password') ||
      request.url.includes('/auth/change-password') ||
      request.url.includes('/auth/forgot-password') ||
      request.url.includes('/users/force-reset');

    if (isPasswordResetRequest) {
      return; // Allow password reset operations
    }

    // For all other requests, require password reset
    logger.info('Blocking user request due to force password reset requirement:', {
      userId,
      url: request.url,
      method: request.method,
      daysRemaining: resetStatus.daysRemaining,
    });

    return reply.code(428).send({
      error: 'PASSWORD_RESET_REQUIRED',
      message: 'You must reset your password before continuing.',
      code: 'FORCE_PASSWORD_RESET_REQUIRED',
      data: {
        resetAt: resetStatus.resetAt,
        resetBy: resetStatus.resetBy,
        reason: resetStatus.reason,
        gracePeriodEnds: resetStatus.gracePeriodEnds,
        daysRemaining: resetStatus.daysRemaining,
        resetUrl: '/auth/change-password',
      },
    });
  } catch (error) {
    logger.error('Error in force password reset middleware:', { error });
    // Don't block the request if middleware fails - log and continue
    return;
  }
}

/**
 * Optional middleware that can be applied to specific routes
 * Returns a middleware function for use with Fastify preHandler
 */
export function requirePasswordResetIfForced() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    return checkForcePasswordReset(request, reply);
  };
}

/**
 * Middleware specifically for login flow to handle force password reset
 */
export async function checkForcePasswordResetOnLogin(
  request: FastifyRequest,
  reply: FastifyReply,
  userId: string
) {
  try {
    const forcePasswordResetService = (request.server as any).forcePasswordResetService;
    
    if (!forcePasswordResetService) {
      return null; // Service not available, continue normal login
    }

    const resetStatus = await forcePasswordResetService.getPasswordResetStatus(userId);
    
    if (!resetStatus.isForced) {
      return null; // No force reset required
    }

    // Check if grace period has expired
    if (resetStatus.isExpired) {
      logger.warn('Login attempt by user with expired force password reset:', { userId });
      
      // Suspend the user account
      await (request.server as any).prisma.user.update({
        where: { id: userId },
        data: { status: 'SUSPENDED' },
      });

      return {
        error: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended due to failure to reset your password within the required timeframe. Please contact support.',
        code: 'FORCE_PASSWORD_RESET_EXPIRED',
        data: resetStatus,
      };
    }

    // Return force reset information for client handling
    return {
      error: 'PASSWORD_RESET_REQUIRED',
      message: 'You must reset your password before continuing.',
      code: 'FORCE_PASSWORD_RESET_REQUIRED',
      data: {
        ...resetStatus,
        resetUrl: '/auth/change-password',
        allowLogin: false, // Don't allow normal login flow
      },
    };
  } catch (error) {
    logger.error('Error checking force password reset on login:', { userId, error });
    return null; // Don't block login if check fails
  }
}

/**
 * Utility function to check if a route should be exempt from force password reset
 */
export function isExemptRoute(url: string): boolean {
  const exemptPaths = [
    '/auth/logout',
    '/auth/refresh',
    '/auth/change-password',
    '/auth/reset-password',
    '/auth/forgot-password',
    '/users/force-reset',
    '/health',
    '/ready',
    '/metrics',
  ];

  return exemptPaths.some(path => url.includes(path));
}

/**
 * Get force password reset status for a user (utility function)
 */
export async function getUserForceResetStatus(
  fastifyInstance: any,
  userId: string
): Promise<any> {
  try {
    const forcePasswordResetService = fastifyInstance.forcePasswordResetService;
    
    if (!forcePasswordResetService) {
      return { isForced: false, isExpired: false };
    }

    return await forcePasswordResetService.getPasswordResetStatus(userId);
  } catch (error) {
    logger.error('Error getting user force reset status:', { userId, error });
    return { isForced: false, isExpired: false };
  }
}