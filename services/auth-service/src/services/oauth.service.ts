import { PrismaClient } from '@zoptal/database';
import { google } from 'googleapis';
import { Octokit } from '@octokit/rest';
import { nanoid } from 'nanoid';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface OAuthServiceDependencies {
  prisma: PrismaClient;
}

export interface OAuthProvider {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

export interface OAuthAuthorizationResult {
  authUrl: string;
  state: string;
  codeVerifier?: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified?: boolean;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType?: string;
  scope?: string;
}

export class OAuthService {
  private providers: Map<string, OAuthProvider>;

  constructor(private deps: OAuthServiceDependencies) {
    this.providers = new Map();
    this.initializeProviders();
  }

  private initializeProviders() {
    // Google OAuth Provider
    if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
      this.providers.set('google', {
        id: 'google',
        name: 'Google',
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        scope: ['openid', 'email', 'profile'],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      });
    }

    // GitHub OAuth Provider
    if (config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET) {
      this.providers.set('github', {
        id: 'github',
        name: 'GitHub',
        clientId: config.GITHUB_CLIENT_ID,
        clientSecret: config.GITHUB_CLIENT_SECRET,
        scope: ['user:email'],
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user',
      });
    }

    logger.info('OAuth providers initialized:', {
      providers: Array.from(this.providers.keys()),
    });
  }

  /**
   * Get available OAuth providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Generate OAuth authorization URL
   */
  async generateAuthorizationUrl(
    provider: string,
    redirectUri: string,
    userId?: string
  ): Promise<OAuthAuthorizationResult> {
    const providerConfig = this.providers.get(provider);
    if (!providerConfig) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    const state = nanoid(32);
    const codeVerifier = nanoid(128); // For PKCE (if needed)

    // Store OAuth state
    await this.deps.prisma.oAuthState.create({
      data: {
        state,
        provider,
        redirectUri,
        codeVerifier,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        userId,
      },
    });

    // Build authorization URL
    const authUrl = new URL(providerConfig.authUrl);
    authUrl.searchParams.set('client_id', providerConfig.clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', providerConfig.scope.join(' '));
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');

    // Add provider-specific parameters
    if (provider === 'google') {
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
    }

    logger.info('OAuth authorization URL generated:', {
      provider,
      state,
      userId,
    });

    return {
      authUrl: authUrl.toString(),
      state,
      codeVerifier,
    };
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleCallback(
    provider: string,
    code: string,
    state: string,
    redirectUri: string
  ): Promise<{
    tokens: OAuthTokens;
    userInfo: OAuthUserInfo;
    isNewUser: boolean;
    user: any;
  }> {
    const providerConfig = this.providers.get(provider);
    if (!providerConfig) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    // Verify state
    const oauthState = await this.deps.prisma.oAuthState.findUnique({
      where: { state },
    });

    if (!oauthState) {
      throw new Error('Invalid OAuth state');
    }

    if (oauthState.provider !== provider) {
      throw new Error('OAuth provider mismatch');
    }

    if (oauthState.expiresAt < new Date()) {
      throw new Error('OAuth state expired');
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(
      provider,
      code,
      redirectUri,
      providerConfig
    );

    // Get user info from provider
    const userInfo = await this.getUserInfo(provider, tokens.accessToken, providerConfig);

    // Find or create user
    const { user, isNewUser } = await this.findOrCreateUser(
      provider,
      userInfo,
      tokens,
      oauthState.userId
    );

    // Clean up OAuth state
    await this.deps.prisma.oAuthState.delete({
      where: { id: oauthState.id },
    });

    logger.info('OAuth callback processed:', {
      provider,
      userId: user.id,
      isNewUser,
      email: userInfo.email,
    });

    return {
      tokens,
      userInfo,
      isNewUser,
      user,
    };
  }

  /**
   * Exchange authorization code for access tokens
   */
  private async exchangeCodeForTokens(
    provider: string,
    code: string,
    redirectUri: string,
    providerConfig: OAuthProvider
  ): Promise<OAuthTokens> {
    try {
      const tokenResponse = await fetch(providerConfig.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: providerConfig.clientId,
          client_secret: providerConfig.clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : undefined,
        tokenType: tokenData.token_type || 'bearer',
        scope: tokenData.scope,
      };
    } catch (error) {
      logger.error('OAuth token exchange failed:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Get user information from OAuth provider
   */
  private async getUserInfo(
    provider: string,
    accessToken: string,
    providerConfig: OAuthProvider
  ): Promise<OAuthUserInfo> {
    try {
      if (provider === 'google') {
        return await this.getGoogleUserInfo(accessToken);
      } else if (provider === 'github') {
        return await this.getGitHubUserInfo(accessToken);
      } else {
        throw new Error(`User info retrieval not implemented for provider: ${provider}`);
      }
    } catch (error) {
      logger.error('Failed to get user info from OAuth provider:', error);
      throw new Error('Failed to retrieve user information from OAuth provider');
    }
  }

  /**
   * Get Google user information
   */
  private async getGoogleUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const response = await oauth2.userinfo.get();

    const user = response.data;
    
    return {
      id: user.id!,
      email: user.email!,
      name: user.name || `${user.given_name} ${user.family_name}`.trim(),
      avatarUrl: user.picture,
      emailVerified: user.verified_email,
    };
  }

  /**
   * Get GitHub user information
   */
  private async getGitHubUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const octokit = new Octokit({
      auth: accessToken,
    });

    // Get user profile
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // Get user emails
    const { data: emails } = await octokit.rest.users.listEmailsForAuthenticatedUser();
    const primaryEmail = emails.find(email => email.primary) || emails[0];

    return {
      id: user.id.toString(),
      email: primaryEmail.email,
      name: user.name || user.login,
      avatarUrl: user.avatar_url,
      emailVerified: primaryEmail.verified,
    };
  }

  /**
   * Find existing user or create new one
   */
  private async findOrCreateUser(
    provider: string,
    userInfo: OAuthUserInfo,
    tokens: OAuthTokens,
    linkUserId?: string
  ): Promise<{ user: any; isNewUser: boolean }> {
    // If linking to existing user
    if (linkUserId) {
      const existingUser = await this.deps.prisma.user.findUnique({
        where: { id: linkUserId },
      });

      if (!existingUser) {
        throw new Error('User to link OAuth account not found');
      }

      // Create or update OAuth account
      await this.deps.prisma.oAuthAccount.upsert({
        where: {
          userId_provider: {
            userId: linkUserId,
            provider,
          },
        },
        create: {
          userId: linkUserId,
          provider,
          providerAccountId: userInfo.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          tokenType: tokens.tokenType,
          scope: tokens.scope,
          providerData: userInfo,
          email: userInfo.email,
          name: userInfo.name,
          avatarUrl: userInfo.avatarUrl,
          lastUsedAt: new Date(),
        },
        update: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          tokenType: tokens.tokenType,
          scope: tokens.scope,
          providerData: userInfo,
          email: userInfo.email,
          name: userInfo.name,
          avatarUrl: userInfo.avatarUrl,
          lastUsedAt: new Date(),
        },
      });

      return { user: existingUser, isNewUser: false };
    }

    // Check if OAuth account already exists
    const existingOAuthAccount = await this.deps.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: userInfo.id,
        },
      },
      include: { user: true },
    });

    if (existingOAuthAccount) {
      // Update OAuth account tokens
      await this.deps.prisma.oAuthAccount.update({
        where: { id: existingOAuthAccount.id },
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          lastUsedAt: new Date(),
        },
      });

      return { user: existingOAuthAccount.user, isNewUser: false };
    }

    // Check if user exists by email
    const existingUser = await this.deps.prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (existingUser) {
      // Link OAuth account to existing user
      await this.deps.prisma.oAuthAccount.create({
        data: {
          userId: existingUser.id,
          provider,
          providerAccountId: userInfo.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          tokenType: tokens.tokenType,
          scope: tokens.scope,
          providerData: userInfo,
          email: userInfo.email,
          name: userInfo.name,
          avatarUrl: userInfo.avatarUrl,
          lastUsedAt: new Date(),
        },
      });

      // Update user profile if missing information
      const updateData: any = {};
      if (!existingUser.name && userInfo.name) {
        const [firstName, ...lastNameParts] = userInfo.name.split(' ');
        updateData.firstName = firstName;
        updateData.lastName = lastNameParts.join(' ') || firstName;
      }
      if (!existingUser.image && userInfo.avatarUrl) {
        updateData.image = userInfo.avatarUrl;
      }
      if (userInfo.emailVerified && !existingUser.emailVerified) {
        updateData.emailVerified = new Date();
        updateData.status = 'ACTIVE';
      }

      if (Object.keys(updateData).length > 0) {
        await this.deps.prisma.user.update({
          where: { id: existingUser.id },
          data: updateData,
        });
      }

      return { user: existingUser, isNewUser: false };
    }

    // Create new user
    const [firstName, ...lastNameParts] = userInfo.name.split(' ');
    const newUser = await this.deps.prisma.user.create({
      data: {
        email: userInfo.email,
        firstName: firstName,
        lastName: lastNameParts.join(' ') || firstName,
        name: userInfo.name,
        image: userInfo.avatarUrl,
        emailVerified: userInfo.emailVerified ? new Date() : null,
        status: userInfo.emailVerified ? 'ACTIVE' : 'PENDING',
        role: 'USER',
      },
    });

    // Create OAuth account
    await this.deps.prisma.oAuthAccount.create({
      data: {
        userId: newUser.id,
        provider,
        providerAccountId: userInfo.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        tokenType: tokens.tokenType,
        scope: tokens.scope,
        providerData: userInfo,
        email: userInfo.email,
        name: userInfo.name,
        avatarUrl: userInfo.avatarUrl,
        lastUsedAt: new Date(),
      },
    });

    return { user: newUser, isNewUser: true };
  }

  /**
   * Get user's OAuth accounts
   */
  async getUserOAuthAccounts(userId: string): Promise<any[]> {
    return await this.deps.prisma.oAuthAccount.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
  }

  /**
   * Unlink OAuth account
   */
  async unlinkOAuthAccount(userId: string, provider: string): Promise<void> {
    const deleted = await this.deps.prisma.oAuthAccount.deleteMany({
      where: {
        userId,
        provider,
      },
    });

    if (deleted.count === 0) {
      throw new Error('OAuth account not found');
    }

    logger.info('OAuth account unlinked:', { userId, provider });
  }
}

export const createOAuthService = (deps: OAuthServiceDependencies): OAuthService => {
  return new OAuthService(deps);
};