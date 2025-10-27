import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { config } from '../config';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role: string;
      permissions: string[];
      organizationId?: string;
    };
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  organizationId?: string;
}

const authMiddleware = fp(async (fastify: FastifyInstance) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header',
          statusCode: 401,
        });
      }

      const token = authHeader.slice(7); // Remove 'Bearer ' prefix

      // Verify JWT token
      const decoded = await request.jwtVerify<AuthUser>();
      
      // Validate required user properties
      if (!decoded.id || !decoded.email || !decoded.role) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Invalid token payload',
          statusCode: 401,
        });
      }

      // Attach user to request
      request.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || [],
        organizationId: decoded.organizationId,
      };

      // Log authentication for debugging
      fastify.log.debug({
        userId: request.user.id,
        userRole: request.user.role,
        route: request.url,
        method: request.method,
      }, 'User authenticated');

    } catch (error) {
      fastify.log.warn({ error, url: request.url }, 'Authentication failed');

      return reply.status(401).send({
        error: 'Unauthorized',
        message: error instanceof Error ? error.message : 'Token verification failed',
        statusCode: 401,
      });
    }
  });

  // Helper function to check permissions
  fastify.decorate('hasPermission', (request: FastifyRequest, permission: string): boolean => {
    if (!request.user) return false;
    
    // Admin role has all permissions
    if (request.user.role === 'admin') return true;
    
    return request.user.permissions.includes(permission);
  });

  // Helper function to check if user owns resource
  fastify.decorate('ownsResource', (request: FastifyRequest, resourceUserId: string): boolean => {
    if (!request.user) return false;
    
    // Admin can access any resource
    if (request.user.role === 'admin') return true;
    
    return request.user.id === resourceUserId;
  });

  // Helper function to check organization access
  fastify.decorate('hasOrganizationAccess', (request: FastifyRequest, organizationId: string): boolean => {
    if (!request.user) return false;
    
    // Admin can access any organization
    if (request.user.role === 'admin') return true;
    
    return request.user.organizationId === organizationId;
  });
});

// Permission checking middleware
export const requirePermission = (permission: string) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        statusCode: 401,
      });
    }

    if (!request.server.hasPermission(request, permission)) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: `Permission '${permission}' required`,
        statusCode: 403,
      });
    }
  };
};

// Role checking middleware
export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        statusCode: 401,
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: `Role must be one of: ${allowedRoles.join(', ')}`,
        statusCode: 403,
      });
    }
  };
};

// Organization access middleware
export const requireOrganizationAccess = (organizationIdParam = 'organizationId') => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        statusCode: 401,
      });
    }

    const organizationId = (request.params as any)[organizationIdParam];
    
    if (!organizationId) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Organization ID required',
        statusCode: 400,
      });
    }

    if (!request.server.hasOrganizationAccess(request, organizationId)) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Access to this organization denied',
        statusCode: 403,
      });
    }
  };
};

export default authMiddleware;