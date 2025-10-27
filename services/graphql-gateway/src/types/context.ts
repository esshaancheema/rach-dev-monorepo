import { Request, Response } from 'express';
import { PubSub } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { Logger } from 'winston';
import { DataLoaders } from '../dataloaders';

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  tenantId?: string;
  token?: string;
}

export interface Context {
  // User authentication
  user: User | null;
  
  // Data access layer
  dataloaders: DataLoaders;
  
  // Infrastructure
  redis: Redis;
  pubsub: RedisPubSub;
  
  // HTTP context
  req: Request;
  res: Response;
  
  // Logging
  logger: Logger;
  
  // Helper methods
  requireAuth(): User;
  requireAdmin(): User;
  requireOwnership(resourceUserId: string): User;
}

// Extend the Context interface with helper methods
export const createContextHelpers = (context: Omit<Context, 'requireAuth' | 'requireAdmin' | 'requireOwnership'>): Context => {
  return {
    ...context,
    
    requireAuth(): User {
      if (!context.user) {
        throw new Error('Authentication required');
      }
      return context.user;
    },
    
    requireAdmin(): User {
      const user = context.user;
      if (!user) {
        throw new Error('Authentication required');
      }
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        throw new Error('Admin privileges required');
      }
      return user;
    },
    
    requireOwnership(resourceUserId: string): User {
      const user = context.user;
      if (!user) {
        throw new Error('Authentication required');
      }
      
      // Super admins can access any resource
      if (user.role === 'SUPER_ADMIN') {
        return user;
      }
      
      // Admins can access resources in their tenant
      if (user.role === 'ADMIN' && user.tenantId) {
        // This would need to be validated against the resource's tenant
        return user;
      }
      
      // Users can only access their own resources
      if (user.id !== resourceUserId) {
        throw new Error('Access denied');
      }
      
      return user;
    },
  };
};