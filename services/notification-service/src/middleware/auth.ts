import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';
import { logger } from '../utils/logger';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
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
      });
    }

    // Verify token
    const decoded = await request.server.jwt.verify<JWTPayload>(token);
    
    // Attach user info to request
    request.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

  } catch (error) {
    logger.error({ error }, 'Authentication failed');
    
    return reply.code(401).send({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  await authenticate(request, reply);
  
  if (request.user?.role !== 'admin') {
    return reply.code(403).send({
      success: false,
      error: 'Admin access required',
    });
  }
}

// Extend FastifyRequest type
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
}