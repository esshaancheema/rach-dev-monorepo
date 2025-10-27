import { PrismaClient } from '@zoptal/database';
import { cacheManager, RedisClient } from '../utils/redis';
import { logger } from '../utils/logger';
import { createServiceError } from '../middleware/error-handler';

export interface SessionServiceDependencies {
  prisma: PrismaClient;
  redis?: RedisClient;
}

export interface SessionData {
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivityAt: Date;
  isActive: boolean;
}

export interface TokenBlacklistEntry {
  jti: string; // JWT ID
  token: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date;
  reason?: string;
}

export class SessionService {
  private readonly TOKEN_BLACKLIST_PREFIX = 'blacklist:token:';
  private readonly TOKEN_BLACKLIST_JTI_PREFIX = 'blacklist:jti:';
  private readonly SESSION_PREFIX = 'session:';
  private readonly USER_SESSIONS_PREFIX = 'user_sessions:';

  constructor(private deps: SessionServiceDependencies) {}

  /**
   * Create a new session
   */
  async createSession(sessionData: Omit<SessionData, 'createdAt' | 'lastActivityAt' | 'isActive'>): Promise<string> {
    const sessionId = `${sessionData.userId}:${sessionData.deviceId}:${Date.now()}`;
    
    const session: SessionData = {
      ...sessionData,
      createdAt: new Date(),
      lastActivityAt: new Date(),
      isActive: true,
    };

    // Store session in Redis with expiration (7 days)
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    await cacheManager.setex(sessionKey, 7 * 24 * 60 * 60, JSON.stringify(session));

    // Add to user's active sessions list
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${sessionData.userId}`;
    await RedisClient.getInstance().sadd(userSessionsKey, sessionId);
    await RedisClient.getInstance().expire(userSessionsKey, 7 * 24 * 60 * 60);

    logger.info('Session created:', {
      sessionId,
      userId: sessionData.userId,
      deviceId: sessionData.deviceId,
      ipAddress: sessionData.ipAddress,
    });

    return sessionId;
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    const sessionData = await cacheManager.get(sessionKey);
    
    if (!sessionData) {
      return null;
    }

    try {
      return JSON.parse(sessionData);
    } catch (error) {
      logger.error('Failed to parse session data:', { sessionId, error });
      return null;
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return false;
    }

    session.lastActivityAt = new Date();
    
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    await cacheManager.setex(sessionKey, 7 * 24 * 60 * 60, JSON.stringify(session));
    
    return true;
  }

  /**
   * Delete a specific session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return false;
    }

    // Remove from Redis
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    await cacheManager.del(sessionKey);

    // Remove from user's sessions list
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${session.userId}`;
    await RedisClient.getInstance().srem(userSessionsKey, sessionId);

    logger.info('Session deleted:', {
      sessionId,
      userId: session.userId,
    });

    return true;
  }

  /**
   * Delete all sessions for a user
   */
  async deleteAllUserSessions(userId: string): Promise<number> {
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
    const sessionIds = await RedisClient.getInstance().smembers(userSessionsKey);

    if (sessionIds.length === 0) {
      return 0;
    }

    // Delete all session keys
    const sessionKeys = sessionIds.map(id => `${this.SESSION_PREFIX}${id}`);
    await cacheManager.del(...sessionKeys);

    // Clear user sessions list
    await RedisClient.getInstance().del(userSessionsKey);

    logger.info('All user sessions deleted:', {
      userId,
      sessionCount: sessionIds.length,
    });

    return sessionIds.length;
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
    const sessionIds = await RedisClient.getInstance().smembers(userSessionsKey);

    if (sessionIds.length === 0) {
      return [];
    }

    const sessions: SessionData[] = [];
    
    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session && session.isActive) {
        sessions.push(session);
      }
    }

    return sessions.sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
  }

  /**
   * Add token to blacklist
   */
  async blacklistToken(token: string, jti: string, userId: string, expiresAt: Date, reason?: string): Promise<void> {
    const entry: TokenBlacklistEntry = {
      jti,
      token: token.substring(0, 20) + '...', // Store partial token for logging
      userId,
      expiresAt,
      revokedAt: new Date(),
      reason,
    };

    // Calculate TTL (time until token expires)
    const ttlSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

    if (ttlSeconds > 0) {
      // Store by token hash for fast lookup
      const tokenKey = `${this.TOKEN_BLACKLIST_PREFIX}${this.hashToken(token)}`;
      await cacheManager.setex(tokenKey, ttlSeconds, JSON.stringify(entry));

      // Store by JTI for management
      const jtiKey = `${this.TOKEN_BLACKLIST_JTI_PREFIX}${jti}`;
      await cacheManager.setex(jtiKey, ttlSeconds, JSON.stringify(entry));

      logger.info('Token blacklisted:', {
        jti,
        userId,
        reason,
        expiresAt,
        ttlSeconds,
      });
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const tokenKey = `${this.TOKEN_BLACKLIST_PREFIX}${this.hashToken(token)}`;
    const entry = await cacheManager.get(tokenKey);
    return !!entry;
  }

  /**
   * Check if JTI is blacklisted
   */
  async isJTIBlacklisted(jti: string): Promise<boolean> {
    const jtiKey = `${this.TOKEN_BLACKLIST_JTI_PREFIX}${jti}`;
    const entry = await cacheManager.get(jtiKey);
    return !!entry;
  }

  /**
   * Blacklist all user tokens
   */
  async blacklistAllUserTokens(userId: string, reason: string = 'User logout'): Promise<void> {
    // Get all active refresh tokens for the user
    const refreshTokens = await this.deps.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    // Blacklist each token
    for (const refreshToken of refreshTokens) {
      await this.blacklistToken(
        refreshToken.token,
        refreshToken.id,
        userId,
        refreshToken.expiresAt,
        reason
      );
    }

    // Revoke all refresh tokens in database
    await this.deps.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    logger.info('All user tokens blacklisted:', {
      userId,
      tokenCount: refreshTokens.length,
      reason,
    });
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    totalActiveSessions: number;
    totalActiveUsers: number;
    averageSessionsPerUser: number;
  }> {
    // Get all user session keys
    const userSessionKeys = await RedisClient.getInstance().keys(`${this.USER_SESSIONS_PREFIX}*`);
    
    let totalActiveSessions = 0;
    let activeUsersCount = 0;

    for (const key of userSessionKeys) {
      const sessionIds = await RedisClient.getInstance().smembers(key);
      if (sessionIds.length > 0) {
        activeUsersCount++;
        totalActiveSessions += sessionIds.length;
      }
    }

    const averageSessionsPerUser = activeUsersCount > 0 
      ? Math.round((totalActiveSessions / activeUsersCount) * 100) / 100 
      : 0;

    return {
      totalActiveSessions,
      totalActiveUsers: activeUsersCount,
      averageSessionsPerUser,
    };
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const userSessionKeys = await RedisClient.getInstance().keys(`${this.USER_SESSIONS_PREFIX}*`);
    let cleanedCount = 0;

    for (const userKey of userSessionKeys) {
      const sessionIds = await RedisClient.getInstance().smembers(userKey);
      
      for (const sessionId of sessionIds) {
        const session = await this.getSession(sessionId);
        
        // Remove if session doesn't exist or is inactive
        if (!session || !session.isActive) {
          await RedisClient.getInstance().srem(userKey, sessionId);
          cleanedCount++;
        }
      }

      // Remove empty user session sets
      const remainingSessions = await RedisClient.getInstance().scard(userKey);
      if (remainingSessions === 0) {
        await RedisClient.getInstance().del(userKey);
      }
    }

    if (cleanedCount > 0) {
      logger.info('Expired sessions cleaned up:', { cleanedCount });
    }

    return cleanedCount;
  }

  /**
   * Hash token for storage key
   */
  private hashToken(token: string): string {
    // Simple hash function for token keys
    // In production, use a proper hash function like SHA-256
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }
}

export function createSessionService(deps: SessionServiceDependencies): SessionService {
  return new SessionService(deps);
}