import { FastifyRequest, FastifyReply } from 'fastify';
import { createServiceError } from './error-handler';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // For now, just implement a basic token check
    // This would normally verify JWT tokens
    const authorization = request.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw createServiceError(
        'AUTHENTICATION_REQUIRED',
        'Authentication token is required',
        401
      );
    }

    const token = authorization.substring(7);
    
    // TODO: Implement actual JWT verification
    // For development, just pass through
    if (token === 'development-bypass') {
      (request as AuthenticatedRequest).user = {
        id: 'dev-user-123',
        email: 'dev@zoptal.com',
        role: 'admin'
      };
      return;
    }

    throw createServiceError(
      'INVALID_TOKEN',
      'Invalid or expired token',
      401
    );
  } catch (error) {
    throw error;
  }
}

export async function requireRole(allowedRoles: string[]) {
  return async function(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as AuthenticatedRequest).user;
    
    if (!user) {
      throw createServiceError(
        'AUTHENTICATION_REQUIRED',
        'Authentication required',
        401
      );
    }

    if (!allowedRoles.includes(user.role)) {
      throw createServiceError(
        'INSUFFICIENT_PERMISSIONS',
        'Insufficient permissions',
        403
      );
    }
  };
}