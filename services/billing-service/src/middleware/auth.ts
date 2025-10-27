import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

interface JWTPayload {
  userId: string;
  organizationId: string;
  email: string;
  role: string;
  permissions?: string[];
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.code(401).send({
        success: false,
        error: 'No authorization token provided',
        code: 'UNAUTHORIZED',
      });
    }

    // Verify JWT token
    const decoded = await request.server.jwt.verify<JWTPayload>(token);
    
    // Attach user info to request
    request.user = {
      id: decoded.userId,
      organizationId: decoded.organizationId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
    };

    logger.debug({ userId: decoded.userId }, 'User authenticated successfully');

  } catch (error) {
    logger.error({ error }, 'Authentication failed');
    
    return reply.code(401).send({
      success: false,
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    });
  }
}

export async function requirePermission(permission: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
    }

    const userPermissions = request.user.permissions || [];
    const hasPermission = userPermissions.includes(permission) || 
                         userPermissions.includes('*') ||
                         request.user.role === 'admin';

    if (!hasPermission) {
      logger.warn({
        userId: request.user.id,
        requiredPermission: permission,
        userPermissions,
      }, 'Permission denied');

      return reply.code(403).send({
        success: false,
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
      });
    }
  };
}

export async function requireRole(role: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
    }

    if (request.user.role !== role && request.user.role !== 'admin') {
      logger.warn({
        userId: request.user.id,
        requiredRole: role,
        userRole: request.user.role,
      }, 'Role access denied');

      return reply.code(403).send({
        success: false,
        error: 'Insufficient role privileges',
        code: 'FORBIDDEN',
      });
    }
  };
}

export async function requireOrganizationAccess(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.user) {
    return reply.code(401).send({
      success: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    });
  }

  // Extract organization ID from request params or body
  const requestedOrgId = (request.params as any)?.organizationId || 
                        (request.body as any)?.organizationId;

  if (requestedOrgId && requestedOrgId !== request.user.organizationId) {
    // Admin users can access any organization
    if (request.user.role !== 'admin') {
      logger.warn({
        userId: request.user.id,
        userOrgId: request.user.organizationId,
        requestedOrgId,
      }, 'Organization access denied');

      return reply.code(403).send({
        success: false,
        error: 'Access to this organization is not allowed',
        code: 'ORGANIZATION_ACCESS_DENIED',
      });
    }
  }
}

// Extend FastifyRequest type
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      organizationId: string;
      email: string;
      role: string;
      permissions: string[];
    };
  }
}