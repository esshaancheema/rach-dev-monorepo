import { AuthSession, User, SessionInfo, ActivityLog, SecuritySettings } from './types';
import { authConfig } from './config';
import { jwtManager } from './jwt';

export class SessionManager {
  private static instance: SessionManager;
  private activeSessions: Map<string, AuthSession> = new Map();
  private userSessions: Map<string, Set<string>> = new Map(); // userId -> sessionIds

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Create a new user session
   */
  async createSession(
    user: User,
    ipAddress: string,
    userAgent: string,
    rememberMe: boolean = false
  ): Promise<AuthSession> {
    // Check concurrent session limits
    await this.enforceSessionLimits(user.id);

    const sessionId = jwtManager.generateSessionId();
    const tokens = jwtManager.generateTokenPair(user, sessionId);
    
    const expiresAt = rememberMe 
      ? new Date(Date.now() + authConfig.session.rememberMeExpiry * 24 * 60 * 60 * 1000)
      : tokens.expiresAt;

    const session: AuthSession = {
      user: { ...user, lastLoginAt: new Date().toISOString() },
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      ipAddress,
      userAgent,
      lastAccessedAt: new Date().toISOString(),
    };

    // Store session in memory (in production, use Redis or database)
    this.activeSessions.set(sessionId, session);
    
    // Track user sessions
    if (!this.userSessions.has(user.id)) {
      this.userSessions.set(user.id, new Set());
    }
    this.userSessions.get(user.id)!.add(sessionId);

    // Log session creation
    await this.logActivity(user.id, 'login', 'User logged in', {
      sessionId,
      ipAddress,
      userAgent,
      rememberMe,
    }, ipAddress, userAgent);

    return session;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<AuthSession | null> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      await this.destroySession(sessionId);
      return null;
    }

    // Update last accessed time
    session.lastAccessedAt = new Date().toISOString();
    
    return session;
  }

  /**
   * Update session with new tokens
   */
  async refreshSession(sessionId: string, user: User): Promise<AuthSession | null> {
    const existingSession = this.activeSessions.get(sessionId);
    
    if (!existingSession) {
      return null;
    }

    const tokens = jwtManager.generateTokenPair(user, sessionId);
    
    const updatedSession: AuthSession = {
      ...existingSession,
      user,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt.toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };

    this.activeSessions.set(sessionId, updatedSession);
    
    return updatedSession;
  }

  /**
   * Destroy a specific session
   */
  async destroySession(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    // Remove from active sessions
    this.activeSessions.delete(sessionId);
    
    // Remove from user sessions tracking
    const userSessionIds = this.userSessions.get(session.user.id);
    if (userSessionIds) {
      userSessionIds.delete(sessionId);
      if (userSessionIds.size === 0) {
        this.userSessions.delete(session.user.id);
      }
    }

    // Log session destruction
    await this.logActivity(session.user.id, 'logout', 'Session ended', {
      sessionId,
      reason: 'explicit_logout',
    }, session.ipAddress, session.userAgent);

    return true;
  }

  /**
   * Destroy all sessions for a user
   */
  async destroyAllUserSessions(userId: string, exceptSessionId?: string): Promise<number> {
    const userSessionIds = this.userSessions.get(userId);
    
    if (!userSessionIds) {
      return 0;
    }

    let destroyedCount = 0;
    
    for (const sessionId of userSessionIds) {
      if (sessionId !== exceptSessionId) {
        const destroyed = await this.destroySession(sessionId);
        if (destroyed) {
          destroyedCount++;
        }
      }
    }

    return destroyedCount;
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionInfo[]> {
    const userSessionIds = this.userSessions.get(userId);
    
    if (!userSessionIds) {
      return [];
    }

    const sessions: SessionInfo[] = [];
    
    for (const sessionId of userSessionIds) {
      const session = this.activeSessions.get(sessionId);
      
      if (session) {
        sessions.push({
          id: sessionId,
          ipAddress: session.ipAddress,
          location: await this.getLocationFromIP(session.ipAddress),
          device: this.parseDevice(session.userAgent),
          browser: this.parseBrowser(session.userAgent),
          current: false, // This would be set by the calling code
          createdAt: session.createdAt,
          lastAccessedAt: session.lastAccessedAt,
        });
      }
    }

    return sessions.sort((a, b) => 
      new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
    );
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now > new Date(session.expiresAt)) {
        await this.destroySession(sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Check if user has reached session limits
   */
  private async enforceSessionLimits(userId: string): Promise<void> {
    const userSessionIds = this.userSessions.get(userId);
    
    if (!userSessionIds) {
      return;
    }

    if (userSessionIds.size >= authConfig.session.maxConcurrentSessions) {
      // Remove oldest session
      let oldestSession: AuthSession | null = null;
      let oldestSessionId: string | null = null;

      for (const sessionId of userSessionIds) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
          if (!oldestSession || 
              new Date(session.lastAccessedAt) < new Date(oldestSession.lastAccessedAt)) {
            oldestSession = session;
            oldestSessionId = sessionId;
          }
        }
      }

      if (oldestSessionId) {
        await this.destroySession(oldestSessionId);
      }
    }
  }

  /**
   * Validate session and user permissions
   */
  async validateSession(sessionId: string, requiredRole?: string[]): Promise<{
    valid: boolean;
    user?: User;
    error?: string;
  }> {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      return { valid: false, error: 'Session not found or expired' };
    }

    // Check if user is active
    if (session.user.status !== 'active') {
      await this.destroySession(sessionId);
      return { valid: false, error: 'User account is not active' };
    }

    // Check role permissions
    if (requiredRole && !requiredRole.includes(session.user.role)) {
      return { valid: false, error: 'Insufficient permissions' };
    }

    // Check session inactivity timeout
    const inactiveMs = Date.now() - new Date(session.lastAccessedAt).getTime();
    const timeoutMs = authConfig.session.inactiveTimeout * 60 * 1000;
    
    if (inactiveMs > timeoutMs) {
      await this.destroySession(sessionId);
      return { valid: false, error: 'Session timed out due to inactivity' };
    }

    return { valid: true, user: session.user };
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    totalActiveSessions: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    topUserAgents: Array<{ userAgent: string; count: number }>;
    topIpAddresses: Array<{ ip: string; count: number }>;
  }> {
    const userAgentCounts = new Map<string, number>();
    const ipCounts = new Map<string, number>();
    let totalDuration = 0;

    for (const session of this.activeSessions.values()) {
      // Count user agents
      const ua = this.parseBrowser(session.userAgent);
      userAgentCounts.set(ua, (userAgentCounts.get(ua) || 0) + 1);

      // Count IP addresses
      ipCounts.set(session.ipAddress, (ipCounts.get(session.ipAddress) || 0) + 1);

      // Calculate session duration
      const duration = new Date().getTime() - new Date(session.createdAt).getTime();
      totalDuration += duration;
    }

    const averageSessionDuration = this.activeSessions.size > 0 
      ? totalDuration / this.activeSessions.size 
      : 0;

    return {
      totalActiveSessions: this.activeSessions.size,
      uniqueUsers: this.userSessions.size,
      averageSessionDuration: Math.round(averageSessionDuration / 1000 / 60), // minutes
      topUserAgents: Array.from(userAgentCounts.entries())
        .map(([userAgent, count]) => ({ userAgent, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topIpAddresses: Array.from(ipCounts.entries())
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  }

  /**
   * Private helper methods
   */
  private async logActivity(
    userId: string,
    action: ActivityLog['action'],
    description: string,
    metadata: Record<string, any>,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    const activity: ActivityLog = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      description,
      metadata,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
    };

    // In production, save to database
    console.info('Activity logged:', activity);
  }

  private async getLocationFromIP(ipAddress: string): Promise<string | undefined> {
    // In production, use a geolocation service like MaxMind or IPGeolocation
    // For now, return undefined
    return undefined;
  }

  private parseDevice(userAgent: string): string {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'Mobile';
    } else if (/Tablet|iPad/.test(userAgent)) {
      return 'Tablet';
    } else {
      return 'Desktop';
    }
  }

  private parseBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();