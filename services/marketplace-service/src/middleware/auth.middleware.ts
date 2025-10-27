import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger, loggers } from '../utils/logger';
import { config } from '../config/config';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'developer' | 'user';
  organizationId?: string;
  permissions: string[];
  verified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip auth for public endpoints
    const publicPaths = ['/health', '/metrics', '/api/docs', '/', '/api/integrations'];
    const isPublicPath = publicPaths.some(path => {
      if (path === '/api/integrations') {
        return req.path === path && req.method === 'GET';
      }
      return req.path.startsWith(path);
    });

    if (isPublicPath) {
      return next();
    }

    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!authHeader && !apiKey) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authorization header or API key is required',
      });
      return;
    }

    let user: AuthenticatedUser;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // JWT Authentication
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Bearer token is required',
        });
        return;
      }

      try {
        const decoded = jwt.verify(token, config.jwt.secret) as any;
        
        user = {
          id: decoded.sub || decoded.userId,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role || 'user',
          organizationId: decoded.organizationId,
          permissions: decoded.permissions || [],
          verified: decoded.verified || false,
        };

        // Validate required fields
        if (!user.id || !user.email) {
          res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid token payload',
          });
          return;
        }

        loggers.security.authSuccess(user.id, 'jwt', req.ip);

      } catch (jwtError: any) {
        const reason = jwtError.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
        
        loggers.security.authFailure(
          authHeader.substring(0, 20) + '...',
          'jwt',
          req.ip,
          reason
        );

        if (jwtError.name === 'TokenExpiredError') {
          res.status(401).json({
            error: 'Token Expired',
            message: 'JWT token has expired',
          });
          return;
        }

        if (jwtError.name === 'JsonWebTokenError') {
          res.status(401).json({
            error: 'Invalid Token',
            message: 'JWT token is invalid',
          });
          return;
        }

        throw jwtError;
      }

    } else if (apiKey) {
      // API Key Authentication
      if (apiKey.length < 32) {
        loggers.security.authFailure(apiKey, 'api_key', req.ip, 'Invalid format');
        
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid API key format',
        });
        return;
      }

      // In production, validate API key against database
      // For now, accept any properly formatted API key
      user = {
        id: 'api-key-user',
        email: 'api@marketplace.local',
        name: 'API Key User',
        role: 'developer',
        permissions: [
          'integrations:read',
          'integrations:write',
          'installations:read',
          'installations:write',
        ],
        verified: true,
      };

      loggers.security.authSuccess(user.id, 'api_key', req.ip);

    } else {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication method',
      });
      return;
    }

    req.user = user;
    next();

  } catch (error) {
    logger.error('Authentication middleware error:', {
      error: error.message,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
};

// Role-based authorization middleware
export const requireRole = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
      return;
    }

    if (!requiredRoles.includes(req.user.role)) {
      loggers.security.authFailure(
        req.user.id,
        'role_check',
        req.ip,
        `Required role: ${requiredRoles.join(' or ')}, has: ${req.user.role}`
      );

      res.status(403).json({
        error: 'Forbidden',
        message: `Required role: ${requiredRoles.join(' or ')}`,
      });
      return;
    }

    next();
  };
};

// Permission-based authorization middleware
export const requirePermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
      return;
    }

    const hasPermission = req.user.permissions.includes(requiredPermission) || 
                         req.user.role === 'admin';

    if (!hasPermission) {
      loggers.security.authFailure(
        req.user.id,
        'permission_check',
        req.ip,
        `Required permission: ${requiredPermission}`
      );

      res.status(403).json({
        error: 'Forbidden',
        message: `Required permission: ${requiredPermission}`,
      });
      return;
    }

    next();
  };
};

// Developer verification middleware
export const requireVerifiedDeveloper = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'User not authenticated',
    });
    return;
  }

  if (req.user.role !== 'developer' && req.user.role !== 'admin') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Developer account required',
    });
    return;
  }

  if (!req.user.verified && req.user.role !== 'admin') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Verified developer account required',
    });
    return;
  }

  next();
};

// Organization-based authorization
export const requireOrganization = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'User not authenticated',
    });
    return;
  }

  if (!req.user.organizationId) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'User must be associated with an organization',
    });
    return;
  }

  next();
};

// Rate limiting override for specific users/roles
export const rateLimitBypass = (req: Request, res: Response, next: NextFunction): void => {
  // Admin users bypass rate limiting
  if (req.user?.role === 'admin') {
    req.rateLimit = {
      limit: Number.MAX_SAFE_INTEGER,
      current: 0,
      remaining: Number.MAX_SAFE_INTEGER,
      resetTime: new Date(Date.now() + 3600000),
    };
  }

  next();
};