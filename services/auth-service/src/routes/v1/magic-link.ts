import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import { prisma } from '@zoptal/database';
import { 
  generateMagicLinkSchema,
  verifyMagicLinkSchema,
  getMagicLinkStatusSchema,
  GenerateMagicLinkRequest,
  VerifyMagicLinkRequest,
  GetMagicLinkStatusRequest
} from '../../schemas/auth.schema';
import { createMagicLinkService } from '../../services/magic-link.service';
import { createEmailService, createAuthService, tokenService } from '../../services';
import { validate } from '../../middleware/validate';

export async function magicLinkRoutes(fastify: FastifyInstance) {
  // Initialize services
  const magicLinkService = createMagicLinkService({ prisma });
  const emailService = createEmailService();

  // Generate magic link endpoint
  fastify.post('/generate', {
    schema: {
      description: 'Generate a magic link for passwordless authentication',
      tags: ['Magic Link'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          purpose: { 
            type: 'string', 
            enum: ['LOGIN', 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGE'],
            default: 'LOGIN' 
          },
          callbackUrl: { type: 'string', format: 'uri' },
        },
        required: ['email'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        429: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            retryAfter: { type: 'number' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: GenerateMagicLinkRequest }>, reply: FastifyReply) => {
    try {
      const { email, purpose = 'LOGIN', callbackUrl } = generateMagicLinkSchema.parse(request.body);
      const ipAddress = request.ip;
      const userAgent = request.headers['user-agent'] || 'Unknown';

      // For LOGIN purpose, check if user exists
      if (purpose === 'LOGIN') {
        const existingUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!existingUser) {
          return reply.code(404).send({
            error: 'No account found with this email address',
          });
        }
      }

      // Generate the magic link
      const result = await magicLinkService.generateMagicLink({
        email,
        purpose,
        callbackUrl,
        ipAddress,
        userAgent,
      });

      if (!result.success) {
        if (result.message.includes('Too many requests')) {
          return reply.code(429).send({
            error: result.message,
            retryAfter: 3600, // 1 hour
          });
        }
        return reply.code(400).send({ error: result.message });
      }

      // Send magic link email
      try {
        const emailSubject = `Your ${purpose === 'LOGIN' ? 'login' : 'verification'} link`;
        const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${emailSubject}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .button:hover { background: #1d4ed8; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        .warning { background: #fef3cd; border: 1px solid #facc15; border-radius: 4px; padding: 12px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Zoptal</div>
        </div>
        
        <h2>Your ${purpose === 'LOGIN' ? 'Login' : 'Verification'} Link</h2>
        
        <p>Click the button below to ${purpose === 'LOGIN' ? 'sign in to your account' : 'complete your verification'}:</p>
        
        <div style="text-align: center;">
            <a href="${result.magicLink}" class="button">
                ${purpose === 'LOGIN' ? 'Sign In' : 'Verify'}
            </a>
        </div>
        
        <div class="warning">
            <strong>Security Notice:</strong>
            <ul>
                <li>This link expires in 15 minutes</li>
                <li>The link can only be used once</li>
                <li>If you didn't request this, please ignore this email</li>
            </ul>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #f8f9fa; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 14px;">
            ${result.magicLink}
        </p>
        
        <div class="footer">
            <p>This email was sent from IP address: ${ipAddress}</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`;

        await emailService.sendEmail({
          to: email,
          subject: emailSubject,
          html: emailTemplate,
        });

        logger.info({
          email: email.replace(/(.{2}).*@/, '$1***@'),
          purpose,
          ipAddress,
        }, 'Magic link sent successfully');

      } catch (emailError) {
        logger.error('Failed to send magic link email', { error: emailError, email });
        // Don't fail the API call if email sending fails
      }

      return reply.send({
        success: true,
        message: 'Magic link sent to your email address',
        expiresAt: result.expiresAt?.toISOString(),
      });

    } catch (error) {
      logger.error('Magic link generation failed', { error });
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Verify magic link endpoint
  fastify.post('/verify', {
    schema: {
      description: 'Verify a magic link and authenticate user',
      tags: ['Magic Link'],
      body: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
        required: ['token'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                role: { type: 'string' },
              },
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresAt: { type: 'number' },
            canResend: { type: 'boolean' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            canResend: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: VerifyMagicLinkRequest }>, reply: FastifyReply) => {
    try {
      const { token } = verifyMagicLinkSchema.parse(request.body);
      const ipAddress = request.ip;
      const userAgent = request.headers['user-agent'] || 'Unknown';

      // Verify the magic link
      const verification = await magicLinkService.verifyMagicLink({
        token,
        ipAddress,
        userAgent,
      });

      if (!verification.valid) {
        return reply.code(400).send({
          error: verification.message,
          canResend: verification.canResend || false,
        });
      }

      // For LOGIN purpose, authenticate the user
      if (verification.purpose === 'LOGIN' && verification.email) {
        const user = await prisma.user.findUnique({
          where: { email: verification.email },
        });

        if (!user) {
          return reply.code(404).send({
            error: 'User not found',
            canResend: false,
          });
        }

        // Generate JWT tokens
        const accessToken = tokenService.generateAccessToken({
          userId: user.id,
          email: user.email,
          role: user.role,
        });

        const refreshToken = tokenService.generateRefreshToken({
          userId: user.id,
        });

        // Update user's last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        logger.info({
          userId: user.id,
          email: user.email.replace(/(.{2}).*@/, '$1***@'),
          ipAddress,
        }, 'User authenticated via magic link');

        return reply.send({
          valid: true,
          message: verification.message,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          accessToken,
          refreshToken,
          expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes
        });
      }

      // For other purposes (EMAIL_VERIFICATION, etc.)
      return reply.send({
        valid: true,
        message: verification.message,
        canResend: false,
      });

    } catch (error) {
      logger.error('Magic link verification failed', { error });
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Check magic link status endpoint
  fastify.get('/status/:token', {
    schema: {
      description: 'Check magic link status without consuming it',
      tags: ['Magic Link'],
      params: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
        required: ['token'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            email: { type: 'string' },
            purpose: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) => {
    try {
      const { token } = request.params;

      const magicLink = await magicLinkService.getMagicLink(token);

      if (!magicLink.valid) {
        return reply.code(404).send({
          error: 'Magic link not found or expired',
        });
      }

      return reply.send({
        valid: true,
        email: magicLink.email?.replace(/(.{2}).*@/, '$1***@'), // Mask email
        purpose: magicLink.purpose,
        expiresAt: magicLink.expiresAt?.toISOString(),
      });

    } catch (error) {
      logger.error('Magic link status check failed', { error });
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Magic link statistics endpoint (admin only)
  fastify.get('/stats', {
    preHandler: [
      // Add admin authentication middleware here when available
    ],
    schema: {
      description: 'Get magic link usage statistics',
      tags: ['Magic Link', 'Admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            totalGenerated: { type: 'number' },
            totalUsed: { type: 'number' },
            totalExpired: { type: 'number' },
            usageByPurpose: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  purpose: { type: 'string' },
                  count: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await magicLinkService.getMagicLinkStats();
      return reply.send(stats);
    } catch (error) {
      logger.error('Failed to get magic link statistics', { error });
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}