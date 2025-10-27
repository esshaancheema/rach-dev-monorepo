import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: string[];
  organizationId?: string;
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
    // Skip auth for health checks and documentation
    if (req.path === '/health' || req.path === '/metrics' || req.path.startsWith('/api/docs')) {
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authorization header is required',
      });
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Bearer token is required',
      });
      return;
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      // In production, you would validate the user exists and is active
      const user: AuthenticatedUser = {
        id: decoded.sub || decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role || 'user',
        permissions: decoded.permissions || [],
        organizationId: decoded.organizationId,
      };

      // Validate required fields
      if (!user.id || !user.email) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid token payload',
        });
        return;
      }

      req.user = user;
      next();

    } catch (jwtError) {
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

  } catch (error) {
    logger.error('Authentication middleware error:', {
      error: error.message,
      path: req.path,
      method: req.method,
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

    if (!req.user.permissions.includes(requiredPermission) && req.user.role !== 'admin') {
      res.status(403).json({
        error: 'Forbidden',
        message: `Required permission: ${requiredPermission}`,
      });
      return;
    }

    next();
  };
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

// API Key authentication for SDK/external integrations
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required',
    });
    return;
  }

  // In production, validate API key against database
  // For now, accept any non-empty API key
  if (apiKey.length < 32) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key format',
    });
    return;
  }

  // Set a basic user context for API key requests
  req.user = {
    id: 'api-key-user',
    email: 'api@system.local',
    name: 'API Key User',
    role: 'user',
    permissions: ['experiments:read', 'experiments:write', 'flags:read', 'flags:write'],
  };

  next();
};

// Dual authentication middleware (JWT or API Key)
export const dualAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Use JWT authentication
    authMiddleware(req, res, next);
  } else if (apiKey) {
    // Use API key authentication
    apiKeyAuth(req, res, next);
  } else {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Either Bearer token or API key is required',
    });
  }
};