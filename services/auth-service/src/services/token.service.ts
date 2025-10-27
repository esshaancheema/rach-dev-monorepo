import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { jwtConfig } from '../config';
import { logger } from '../utils/logger';
import { cacheManager, redis } from '../utils/redis';
import { AUTH_CONSTANTS } from '../config/constants';
import { TokenPayload, RefreshTokenPayload } from '../types/auth.types';

// Error classes for better error handling
export class TokenError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'TokenError';
  }
}

export interface TokenPairResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
}

export interface RefreshTokenResult {
  accessToken: string;
  expiresAt: number;
}

export interface UserInfo {
  id: string;
  role: string;
  email?: string;
}

export interface SessionInfo {
  id: string;
  deviceId: string;
  userAgent?: string;
  ipAddress?: string;
}

export class TokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;
  private readonly algorithm: jwt.Algorithm;

  constructor() {
    this.accessTokenSecret = jwtConfig.secret;
    this.refreshTokenSecret = jwtConfig.refreshSecret;
    this.accessTokenExpiry = jwtConfig.accessTokenExpiry;
    this.refreshTokenExpiry = jwtConfig.refreshTokenExpiry;
    this.algorithm = jwtConfig.algorithm as jwt.Algorithm;
  }

  /**
   * Generate access and refresh token pair
   */
  async generateTokenPair(
    user: UserInfo,
    session: SessionInfo
  ): Promise<TokenPairResult> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const tokenVersion = await this.getTokenVersion(user.id);
      
      // Calculate expiry times
      const accessTokenExpirySeconds = this.parseExpiry(this.accessTokenExpiry);
      const refreshTokenExpirySeconds = this.parseExpiry(this.refreshTokenExpiry);
      
      // Create access token payload
      const accessTokenPayload: TokenPayload = {
        userId: user.id,
        sessionId: session.id,
        deviceId: session.deviceId,
        role: user.role,
        iat: now,
        exp: now + accessTokenExpirySeconds,
      };

      // Create refresh token payload
      const refreshTokenPayload: RefreshTokenPayload = {
        userId: user.id,
        sessionId: session.id,
        tokenVersion,
        iat: now,
        exp: now + refreshTokenExpirySeconds,
      };

      // Generate tokens
      const accessToken = jwt.sign(accessTokenPayload, this.accessTokenSecret, {
        algorithm: this.algorithm,
      });
      
      const refreshToken = jwt.sign(refreshTokenPayload, this.refreshTokenSecret, {
        algorithm: this.algorithm,
      });

      // Store refresh token metadata in Redis for tracking and revocation
      const refreshTokenId = nanoid();
      const refreshTokenKey = `${AUTH_CONSTANTS.CACHE_KEYS.USER_SESSION}${user.id}:${session.id}:refresh:${refreshTokenId}`;
      
      await cacheManager.setWithExpiry(
        refreshTokenKey,
        {
          tokenId: refreshTokenId,
          userId: user.id,
          sessionId: session.id,
          deviceId: session.deviceId,
          userAgent: session.userAgent,
          ipAddress: session.ipAddress,
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
        },
        refreshTokenExpirySeconds
      );

      // Track refresh token for user
      await this.addRefreshTokenToUser(user.id, refreshTokenId, refreshTokenExpirySeconds);

      logger.info('Token pair generated successfully', {
        userId: user.id,
        sessionId: session.id,
        deviceId: session.deviceId,
        accessTokenExpiry: accessTokenPayload.exp,
        refreshTokenExpiry: refreshTokenPayload.exp,
        tokenVersion,
      });

      return {
        accessToken,
        refreshToken,
        expiresAt: accessTokenPayload.exp * 1000, // Convert to milliseconds
        refreshExpiresAt: refreshTokenPayload.exp * 1000,
      };
    } catch (error) {
      logger.error('Failed to generate token pair', {
        error: error instanceof Error ? error.message : error,
        userId: user.id,
        sessionId: session.id,
      });
      throw new TokenError('Failed to generate authentication tokens', 'TOKEN_GENERATION_FAILED', 500);
    }
  }

  /**
   * Verify and decode access token
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new TokenError('Token has been revoked', 'TOKEN_REVOKED');
      }

      const payload = jwt.verify(token, this.accessTokenSecret, {
        algorithms: [this.algorithm],
      }) as TokenPayload;
      
      // Additional payload validation
      if (!payload.userId || !payload.sessionId || !payload.role) {
        throw new TokenError('Invalid token payload', 'INVALID_TOKEN_PAYLOAD');
      }

      // Check if session is still valid
      const sessionExists = await this.validateSession(payload.userId, payload.sessionId);
      if (!sessionExists) {
        throw new TokenError('Session no longer valid', 'SESSION_INVALID');
      }

      return payload;
    } catch (error) {
      if (error instanceof TokenError) {
        throw error;
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenError('Access token has expired', 'TOKEN_EXPIRED');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new TokenError('Invalid access token', 'INVALID_TOKEN');
      }
      
      logger.error('Unexpected error during token verification', { error });
      throw new TokenError('Token verification failed', 'TOKEN_VERIFICATION_FAILED', 500);
    }
  }

  /**
   * Verify and decode refresh token
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new TokenError('Refresh token has been revoked', 'REFRESH_TOKEN_REVOKED');
      }

      const payload = jwt.verify(token, this.refreshTokenSecret, {
        algorithms: [this.algorithm],
      }) as RefreshTokenPayload;
      
      // Additional payload validation
      if (!payload.userId || !payload.sessionId || typeof payload.tokenVersion !== 'number') {
        throw new TokenError('Invalid refresh token payload', 'INVALID_REFRESH_TOKEN_PAYLOAD');
      }

      // Check token version
      const currentVersion = await this.getTokenVersion(payload.userId);
      if (payload.tokenVersion !== currentVersion) {
        throw new TokenError('Refresh token version mismatch', 'TOKEN_VERSION_MISMATCH');
      }

      // Verify refresh token exists in our store
      const refreshTokenExists = await this.validateRefreshToken(payload.userId, payload.sessionId);
      if (!refreshTokenExists) {
        throw new TokenError('Refresh token not found in store', 'REFRESH_TOKEN_NOT_FOUND');
      }

      return payload;
    } catch (error) {
      if (error instanceof TokenError) {
        throw error;
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenError('Refresh token has expired', 'REFRESH_TOKEN_EXPIRED');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new TokenError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
      }
      
      logger.error('Unexpected error during refresh token verification', { error });
      throw new TokenError('Refresh token verification failed', 'REFRESH_TOKEN_VERIFICATION_FAILED', 500);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(
    refreshToken: string,
    user: UserInfo,
    sessionInfo?: Partial<SessionInfo>
  ): Promise<RefreshTokenResult> {
    try {
      const refreshPayload = await this.verifyRefreshToken(refreshToken);
      
      const now = Math.floor(Date.now() / 1000);
      const accessTokenExpirySeconds = this.parseExpiry(this.accessTokenExpiry);
      
      // Create new access token payload
      const accessTokenPayload: TokenPayload = {
        userId: refreshPayload.userId,
        sessionId: refreshPayload.sessionId,
        deviceId: sessionInfo?.deviceId || refreshPayload.sessionId, // Fallback to sessionId if no deviceId
        role: user.role, // Use current user role (might have changed)
        iat: now,
        exp: now + accessTokenExpirySeconds,
      };

      const accessToken = jwt.sign(accessTokenPayload, this.accessTokenSecret, {
        algorithm: this.algorithm,
      });

      // Update refresh token last used time
      await this.updateRefreshTokenUsage(refreshPayload.userId, refreshPayload.sessionId);
      
      logger.info('Access token refreshed successfully', {
        userId: refreshPayload.userId,
        sessionId: refreshPayload.sessionId,
        newExpiresAt: accessTokenPayload.exp,
      });

      return {
        accessToken,
        expiresAt: accessTokenPayload.exp * 1000,
      };
    } catch (error) {
      logger.error('Failed to refresh access token', { 
        error: error instanceof Error ? error.message : error 
      });
      
      if (error instanceof TokenError) {
        throw error;
      }
      
      throw new TokenError('Failed to refresh access token', 'TOKEN_REFRESH_FAILED', 500);
    }
  }

  /**
   * Revoke token (add to blacklist)
   */
  async revokeToken(token: string, type: 'access' | 'refresh' = 'access'): Promise<void> {
    try {
      const payload = jwt.decode(token) as any;
      
      if (!payload || !payload.exp) {
        throw new TokenError('Invalid token format', 'INVALID_TOKEN_FORMAT', 400);
      }

      const ttl = payload.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        const blacklistKey = `${AUTH_CONSTANTS.CACHE_KEYS.BLACKLISTED_TOKEN}${token}`;
        await cacheManager.setWithExpiry(blacklistKey, '1', ttl);
      }

      logger.info('Token revoked successfully', {
        tokenType: type,
        userId: payload.userId,
        sessionId: payload.sessionId,
        expiresAt: payload.exp,
      });
    } catch (error) {
      logger.error('Failed to revoke token', { 
        error: error instanceof Error ? error.message : error, 
        tokenType: type 
      });
      
      if (error instanceof TokenError) {
        throw error;
      }
      
      throw new TokenError('Failed to revoke token', 'TOKEN_REVOCATION_FAILED', 500);
    }
  }

  /**
   * Revoke all tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      // Increment token version to invalidate all refresh tokens
      await this.incrementTokenVersion(userId);
      
      // Remove all stored refresh tokens for the user
      const refreshTokensKey = `user_refresh_tokens:${userId}`;
      const refreshTokenIds = await cacheManager.get<string[]>(refreshTokensKey) || [];
      
      // Delete all individual refresh token records
      for (const tokenId of refreshTokenIds) {
        const pattern = `${AUTH_CONSTANTS.CACHE_KEYS.USER_SESSION}${userId}:*:refresh:${tokenId}`;
        await cacheManager.deletePattern(pattern);
      }
      
      // Clear the user's refresh token list
      await cacheManager.del(refreshTokensKey);

      logger.info('All user tokens revoked', { 
        userId, 
        revokedRefreshTokens: refreshTokenIds.length 
      });
    } catch (error) {
      logger.error('Failed to revoke all user tokens', { 
        error: error instanceof Error ? error.message : error, 
        userId 
      });
      throw new TokenError('Failed to revoke user tokens', 'USER_TOKEN_REVOCATION_FAILED', 500);
    }
  }

  /**
   * Revoke all tokens for a session
   */
  async revokeSessionTokens(userId: string, sessionId: string): Promise<void> {
    try {
      const pattern = `${AUTH_CONSTANTS.CACHE_KEYS.USER_SESSION}${userId}:${sessionId}:refresh:*`;
      await cacheManager.deletePattern(pattern);
      
      // Remove session tokens from user's refresh token list
      await this.removeSessionTokensFromUser(userId, sessionId);

      logger.info('Session tokens revoked', { userId, sessionId });
    } catch (error) {
      logger.error('Failed to revoke session tokens', { 
        error: error instanceof Error ? error.message : error, 
        userId, 
        sessionId 
      });
      throw new TokenError('Failed to revoke session tokens', 'SESSION_TOKEN_REVOCATION_FAILED', 500);
    }
  }

  /**
   * Get token information without verification
   */
  decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token expiry time
   */
  getTokenExpiry(token: string): number | null {
    try {
      const payload = jwt.decode(token) as any;
      return payload?.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const expiry = this.getTokenExpiry(token);
    return expiry ? Date.now() > expiry : true;
  }

  /**
   * Get user's active refresh tokens
   */
  async getUserRefreshTokens(userId: string): Promise<any[]> {
    try {
      const refreshTokensKey = `user_refresh_tokens:${userId}`;
      const refreshTokenIds = await cacheManager.get<string[]>(refreshTokensKey) || [];
      
      const refreshTokens = [];
      for (const tokenId of refreshTokenIds) {
        const pattern = `${AUTH_CONSTANTS.CACHE_KEYS.USER_SESSION}${userId}:*:refresh:${tokenId}`;
        const keys = await cacheManager.getPattern(pattern);
        
        for (const key of keys) {
          const tokenData = await cacheManager.get(key);
          if (tokenData) {
            refreshTokens.push(tokenData);
          }
        }
      }
      
      return refreshTokens;
    } catch (error) {
      logger.error('Failed to get user refresh tokens', { 
        error: error instanceof Error ? error.message : error, 
        userId 
      });
      return [];
    }
  }

  // Private helper methods

  private async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklistKey = `${AUTH_CONSTANTS.CACHE_KEYS.BLACKLISTED_TOKEN}${token}`;
      return await cacheManager.exists(blacklistKey);
    } catch (error) {
      logger.error('Failed to check token blacklist status', { error });
      return false; // Fail open for availability
    }
  }

  private async getTokenVersion(userId: string): Promise<number> {
    try {
      const version = await cacheManager.get<number>(`token_version:${userId}`);
      return version || 0;
    } catch (error) {
      logger.error('Failed to get token version', { error, userId });
      return 0;
    }
  }

  private async incrementTokenVersion(userId: string): Promise<number> {
    try {
      const newVersion = await redis.incr(`token_version:${userId}`);
      await redis.expire(`token_version:${userId}`, 86400 * 30); // 30 days
      return newVersion;
    } catch (error) {
      logger.error('Failed to increment token version', { error, userId });
      throw new TokenError('Failed to update token version', 'TOKEN_VERSION_UPDATE_FAILED', 500);
    }
  }

  private async validateSession(userId: string, sessionId: string): Promise<boolean> {
    try {
      // Check if session exists in our session manager
      const sessionKey = `${AUTH_CONSTANTS.CACHE_KEYS.USER_SESSION}${sessionId}`;
      const session = await cacheManager.get(sessionKey);
      return session && session.userId === userId;
    } catch (error) {
      logger.error('Failed to validate session', { error, userId, sessionId });
      return false;
    }
  }

  private async validateRefreshToken(userId: string, sessionId: string): Promise<boolean> {
    try {
      const pattern = `${AUTH_CONSTANTS.CACHE_KEYS.USER_SESSION}${userId}:${sessionId}:refresh:*`;
      const keys = await cacheManager.getPattern(pattern);
      return keys.length > 0;
    } catch (error) {
      logger.error('Failed to validate refresh token', { error, userId, sessionId });
      return false;
    }
  }

  private async addRefreshTokenToUser(userId: string, tokenId: string, ttl: number): Promise<void> {
    try {
      const refreshTokensKey = `user_refresh_tokens:${userId}`;
      const existingTokens = await cacheManager.get<string[]>(refreshTokensKey) || [];
      
      // Add new token and limit to reasonable number
      existingTokens.push(tokenId);
      if (existingTokens.length > 10) { // Limit to 10 refresh tokens per user
        existingTokens.shift(); // Remove oldest
      }
      
      await cacheManager.setWithExpiry(refreshTokensKey, existingTokens, ttl);
    } catch (error) {
      logger.error('Failed to add refresh token to user', { error, userId, tokenId });
    }
  }

  private async removeSessionTokensFromUser(userId: string, sessionId: string): Promise<void> {
    try {
      const refreshTokensKey = `user_refresh_tokens:${userId}`;
      const refreshTokenIds = await cacheManager.get<string[]>(refreshTokensKey) || [];
      
      // Filter out tokens for this session (this is a simplified approach)
      // In a production system, you'd want more precise tracking
      const pattern = `${AUTH_CONSTANTS.CACHE_KEYS.USER_SESSION}${userId}:${sessionId}:refresh:*`;
      const sessionTokenKeys = await cacheManager.getPattern(pattern);
      
      // Remove session-specific tokens
      for (const key of sessionTokenKeys) {
        await cacheManager.del(key);
      }
    } catch (error) {
      logger.error('Failed to remove session tokens from user', { error, userId, sessionId });
    }
  }

  private async updateRefreshTokenUsage(userId: string, sessionId: string): Promise<void> {
    try {
      const pattern = `${AUTH_CONSTANTS.CACHE_KEYS.USER_SESSION}${userId}:${sessionId}:refresh:*`;
      const keys = await cacheManager.getPattern(pattern);
      
      for (const key of keys) {
        const tokenData = await cacheManager.get(key);
        if (tokenData) {
          tokenData.lastUsed = new Date().toISOString();
          const ttl = await cacheManager.ttl(key);
          if (ttl > 0) {
            await cacheManager.setWithExpiry(key, tokenData, ttl);
          }
        }
      }
    } catch (error) {
      logger.error('Failed to update refresh token usage', { error, userId, sessionId });
    }
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiry format: ${expiry}`);
    }

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    switch (unit) {
      case 's': return num;
      case 'm': return num * 60;
      case 'h': return num * 60 * 60;
      case 'd': return num * 60 * 60 * 24;
      default: throw new Error(`Invalid expiry unit: ${unit}`);
    }
  }
}

// Export singleton instance
export const tokenService = new TokenService();