import { FastifyRequest, FastifyReply } from 'fastify';
import { OAuthService } from '../services/oauth.service';
import { TokenService } from '../services/token.service';
import { EmailService } from '../services/email.service';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface OAuthControllerDependencies {
  oauthService: OAuthService;
  tokenService: TokenService;
  emailService: EmailService;
}

export class OAuthController {
  constructor(private deps: OAuthControllerDependencies) {}

  /**
   * Get available OAuth providers
   */
  async getProviders(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const providers = this.deps.oauthService.getAvailableProviders();
      
      reply.send({
        success: true,
        data: {
          providers: providers.map(provider => ({
            id: provider,
            name: provider.charAt(0).toUpperCase() + provider.slice(1),
          })),
        },
      });
    } catch (error) {
      this.handleError(error, reply, 'Failed to get OAuth providers');
    }
  }

  /**
   * Initiate OAuth flow
   */
  async initiateOAuth(
    request: FastifyRequest<{ 
      Params: { provider: string };
      Querystring: { redirect_uri?: string; link_account?: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { provider } = request.params;
      const { redirect_uri, link_account } = request.query;

      // Default redirect URI
      const redirectUri = redirect_uri || `${config.FRONTEND_URL}/auth/oauth/callback/${provider}`;

      // Get user ID if linking account
      let userId: string | undefined;
      if (link_account === 'true') {
        userId = (request.user as any)?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'UNAUTHORIZED',
            message: 'Authentication required for linking OAuth account',
          });
        }
      }

      const authResult = await this.deps.oauthService.generateAuthorizationUrl(
        provider,
        redirectUri,
        userId
      );

      reply.send({
        success: true,
        data: {
          authUrl: authResult.authUrl,
          state: authResult.state,
        },
      });

      logger.info('OAuth flow initiated:', {
        provider,
        userId,
        state: authResult.state,
      });
    } catch (error) {
      this.handleError(error, reply, 'Failed to initiate OAuth flow');
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(
    request: FastifyRequest<{ 
      Params: { provider: string };
      Querystring: { code?: string; state?: string; error?: string; error_description?: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { provider } = request.params;
      const { code, state, error, error_description } = request.query;

      // Handle OAuth errors
      if (error) {
        logger.error('OAuth provider error:', {
          provider,
          error,
          error_description,
        });

        return reply.status(400).send({
          success: false,
          error: 'OAUTH_ERROR',
          message: error_description || `OAuth authentication failed: ${error}`,
        });
      }

      if (!code || !state) {
        return reply.status(400).send({
          success: false,
          error: 'MISSING_PARAMETERS',
          message: 'Authorization code and state are required',
        });
      }

      // Default redirect URI for callback
      const redirectUri = `${config.FRONTEND_URL}/auth/oauth/callback/${provider}`;

      // Handle OAuth callback
      const callbackResult = await this.deps.oauthService.handleCallback(
        provider,
        code,
        state,
        redirectUri
      );

      const { user, isNewUser } = callbackResult;

      // Generate authentication tokens
      const sessionInfo = {
        deviceId: `oauth_${provider}_${Date.now()}`,
        userAgent: request.headers['user-agent'] || 'OAuth',
        ipAddress: this.getClientIp(request),
        rememberMe: true, // OAuth logins are typically remembered
      };

      const tokenResult = await this.deps.tokenService.generateTokenPair(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        sessionInfo
      );

      // Update user last login
      await request.server.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Log successful OAuth login
      await request.server.prisma.loginAttempt.create({
        data: {
          userId: user.id,
          email: user.email,
          ipAddress: sessionInfo.ipAddress,
          userAgent: sessionInfo.userAgent,
          success: true,
          metadata: {
            provider,
            isNewUser,
            oauthFlow: true,
          },
        },
      });

      // Send welcome email for new users
      if (isNewUser) {
        try {
          await this.deps.emailService.sendWelcomeEmail({
            to: user.email,
            name: user.name || `${user.firstName} ${user.lastName}`,
            loginUrl: `${config.FRONTEND_URL}/login`,
          });
        } catch (error) {
          logger.error('Failed to send welcome email for OAuth user:', error);
        }
      }

      // Set refresh token as HTTP-only cookie
      reply.setCookie('refresh_token', tokenResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for OAuth
        path: '/',
      });

      reply.send({
        success: true,
        message: isNewUser ? 'Account created and logged in successfully' : 'Logged in successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.name,
            image: user.image,
            emailVerified: user.emailVerified,
            status: user.status,
            role: user.role,
            createdAt: user.createdAt,
          },
          accessToken: tokenResult.accessToken,
          expiresAt: tokenResult.expiresAt,
          isNewUser,
          provider,
        },
      });

      logger.info('OAuth callback processed successfully:', {
        provider,
        userId: user.id,
        email: user.email,
        isNewUser,
        ip: sessionInfo.ipAddress,
      });
    } catch (error) {
      this.handleError(error, reply, 'OAuth callback failed');
    }
  }

  /**
   * Get user's OAuth accounts
   */
  async getUserOAuthAccounts(
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

      const oauthAccounts = await this.deps.oauthService.getUserOAuthAccounts(userId);

      reply.send({
        success: true,
        data: {
          oauthAccounts,
        },
      });
    } catch (error) {
      this.handleError(error, reply, 'Failed to get OAuth accounts');
    }
  }

  /**
   * Unlink OAuth account
   */
  async unlinkOAuthAccount(
    request: FastifyRequest<{ 
      Params: { provider: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any)?.id;
      const { provider } = request.params;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      // Check if user has a password or other OAuth accounts
      const user = await request.server.prisma.user.findUnique({
        where: { id: userId },
        include: {
          oauthAccounts: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      // Prevent unlinking if it's the only authentication method
      const otherOAuthAccounts = user.oauthAccounts.filter(acc => acc.provider !== provider);
      if (!user.password && otherOAuthAccounts.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'CANNOT_UNLINK_ONLY_AUTH',
          message: 'Cannot unlink the only authentication method. Please set a password first.',
        });
      }

      await this.deps.oauthService.unlinkOAuthAccount(userId, provider);

      reply.send({
        success: true,
        message: `${provider} account unlinked successfully`,
      });

      logger.info('OAuth account unlinked:', {
        userId,
        provider,
      });
    } catch (error) {
      this.handleError(error, reply, 'Failed to unlink OAuth account');
    }
  }

  /**
   * Get client IP address
   */
  private getClientIp(request: FastifyRequest): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Handle controller errors
   */
  private handleError(error: any, reply: FastifyReply, defaultMessage: string): void {
    logger.error('OAuth controller error:', error);

    if (error.message?.includes('Unsupported OAuth provider')) {
      return reply.status(400).send({
        success: false,
        error: 'UNSUPPORTED_PROVIDER',
        message: error.message,
      });
    }

    if (error.message?.includes('Invalid OAuth state')) {
      return reply.status(400).send({
        success: false,
        error: 'INVALID_STATE',
        message: 'Invalid or expired OAuth state',
      });
    }

    if (error.message?.includes('OAuth state expired')) {
      return reply.status(400).send({
        success: false,
        error: 'STATE_EXPIRED',
        message: 'OAuth state has expired. Please try again.',
      });
    }

    if (error.message?.includes('Failed to exchange authorization code')) {
      return reply.status(400).send({
        success: false,
        error: 'TOKEN_EXCHANGE_FAILED',
        message: 'Failed to exchange authorization code for tokens',
      });
    }

    if (error.message?.includes('Failed to retrieve user information')) {
      return reply.status(400).send({
        success: false,
        error: 'USER_INFO_FAILED',
        message: 'Failed to retrieve user information from OAuth provider',
      });
    }

    if (error.message?.includes('OAuth account not found')) {
      return reply.status(404).send({
        success: false,
        error: 'OAUTH_ACCOUNT_NOT_FOUND',
        message: 'OAuth account not found',
      });
    }

    reply.status(500).send({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: defaultMessage,
    });
  }
}

export const createOAuthController = (deps: OAuthControllerDependencies): OAuthController => {
  return new OAuthController(deps);
};