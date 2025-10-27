import jwt from 'jsonwebtoken';
import { JWTPayload, RefreshTokenPayload, User } from './types';
import { authConfig } from './config';

export class JWTManager {
  private static instance: JWTManager;
  private accessTokenSecret: string;
  private refreshTokenSecret: string;

  constructor() {
    this.accessTokenSecret = authConfig.jwt.secret;
    this.refreshTokenSecret = authConfig.jwt.secret + '_refresh';
  }

  static getInstance(): JWTManager {
    if (!JWTManager.instance) {
      JWTManager.instance = new JWTManager();
    }
    return JWTManager.instance;
  }

  /**
   * Generate access token (short-lived)
   */
  generateAccessToken(user: User, sessionId: string): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    };

    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: authConfig.jwt.expiresIn,
      issuer: 'zoptal.com',
      audience: 'zoptal.com',
    });
  }

  /**
   * Generate refresh token (long-lived)
   */
  generateRefreshToken(userId: string, sessionId: string, tokenVersion: number = 1): string {
    const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
      userId,
      sessionId,
      tokenVersion,
    };

    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: authConfig.jwt.refreshExpiresIn,
      issuer: 'zoptal.com',
      audience: 'zoptal.com',
    });
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'zoptal.com',
        audience: 'zoptal.com',
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.warn('Invalid access token:', error.message);
      } else if (error instanceof jwt.TokenExpiredError) {
        console.info('Access token expired');
      }
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'zoptal.com',
        audience: 'zoptal.com',
      }) as RefreshTokenPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.warn('Invalid refresh token:', error.message);
      } else if (error instanceof jwt.TokenExpiredError) {
        console.info('Refresh token expired');
      }
      return null;
    }
  }

  /**
   * Generate token pair (access + refresh)
   */
  generateTokenPair(user: User, sessionId: string, tokenVersion: number = 1): {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  } {
    const accessToken = this.generateAccessToken(user, sessionId);
    const refreshToken = this.generateRefreshToken(user.id, sessionId, tokenVersion);
    
    // Calculate expiration time for access token
    const expiresAt = new Date();
    const expiresInMs = this.parseExpirationTime(authConfig.jwt.expiresIn);
    expiresAt.setTime(expiresAt.getTime() + expiresInMs);

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiry(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return null;
      }
      
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  /**
   * Parse expiration time string to milliseconds
   */
  private parseExpirationTime(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1), 10);

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 15 * 60 * 1000; // Default to 15 minutes
    }
  }

  /**
   * Generate a secure random session ID
   */
  generateSessionId(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate email verification token
   */
  generateEmailVerificationToken(userId: string, email: string): string {
    const payload = {
      userId,
      email,
      type: 'email_verification',
    };

    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: '24h', // Email verification tokens expire in 24 hours
      issuer: 'zoptal.com',
      audience: 'zoptal.com',
    });
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken(userId: string, email: string): string {
    const payload = {
      userId,
      email,
      type: 'password_reset',
    };

    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: '1h', // Password reset tokens expire in 1 hour
      issuer: 'zoptal.com',
      audience: 'zoptal.com',
    });
  }

  /**
   * Verify email verification token
   */
  verifyEmailVerificationToken(token: string): { userId: string; email: string } | null {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'zoptal.com',
        audience: 'zoptal.com',
      }) as any;

      if (decoded.type !== 'email_verification') {
        return null;
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch {
      return null;
    }
  }

  /**
   * Verify password reset token
   */
  verifyPasswordResetToken(token: string): { userId: string; email: string } | null {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'zoptal.com',
        audience: 'zoptal.com',
      }) as any;

      if (decoded.type !== 'password_reset') {
        return null;
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const jwtManager = JWTManager.getInstance();