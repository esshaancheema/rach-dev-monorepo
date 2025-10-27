import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { rateLimiters, dynamicRateLimitStore } from '../middleware/rate-limit';

interface RateLimitPluginOptions extends FastifyPluginOptions {
  // Plugin-specific options can be added here
}

async function rateLimitPlugin(
  fastify: FastifyInstance,
  options: RateLimitPluginOptions
) {
  // Register pre-configured rate limiters as hooks
  fastify.addHook('preHandler', async function (request, reply) {
    const route = request.routeOptions?.url || request.url;
    
    // Skip rate limiting if route is not available
    if (!route) return;
    
    // Apply specific rate limiters based on route patterns
    if (route.includes('/auth/login') || route.includes('/auth/verify-2fa')) {
      await rateLimiters.login(request, reply);
    } else if (route.includes('/auth/register')) {
      await rateLimiters.register(request, reply);
    } else if (route.includes('/auth/forgot-password') || route.includes('/auth/reset-password')) {
      await rateLimiters.passwordReset(request, reply);
    } else if (route.includes('/auth/verify') || route.includes('/auth/resend')) {
      await rateLimiters.verification(request, reply);
    } else if (route.includes('/auth/otp') || route.includes('/2fa/verify')) {
      await rateLimiters.otpVerification(request, reply);
    } else if (route.includes('/admin/')) {
      await rateLimiters.sensitive(request, reply);
    } else if (route.startsWith('/api/')) {
      await rateLimiters.api(request, reply);
    }
  });

  // Initialize default dynamic rate limit configurations
  await initializeDefaultRateLimits();

  // Add utility methods to fastify instance
  fastify.decorate('updateRateLimit', async (endpoint: string, config: any) => {
    await dynamicRateLimitStore.update({
      endpoint,
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      enabled: config.enabled ?? true,
    });
  });

  fastify.decorate('removeRateLimit', (endpoint: string) => {
    return dynamicRateLimitStore.remove(endpoint);
  });

  fastify.decorate('getRateLimitConfigs', () => {
    return dynamicRateLimitStore.getAllConfigs();
  });
}

async function initializeDefaultRateLimits() {
  // Initialize with some common endpoints that might need dynamic adjustment
  const defaultConfigs = [
    {
      endpoint: '/api/auth/login',
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      enabled: true,
    },
    {
      endpoint: '/api/auth/register',
      maxRequests: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
      enabled: true,
    },
    {
      endpoint: '/api/auth/forgot-password',
      maxRequests: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
      enabled: true,
    },
    {
      endpoint: '/api/admin/*',
      maxRequests: 50,
      windowMs: 60 * 60 * 1000, // 1 hour
      enabled: true,
    },
  ];

  for (const config of defaultConfigs) {
    await dynamicRateLimitStore.update(config);
  }
}

// Extend Fastify interface with rate limit methods
declare module 'fastify' {
  interface FastifyInstance {
    updateRateLimit: (endpoint: string, config: any) => Promise<void>;
    removeRateLimit: (endpoint: string) => boolean;
    getRateLimitConfigs: () => any[];
  }
}

export default fp(rateLimitPlugin, {
  name: 'rate-limit-plugin',
  dependencies: [],
});

export { rateLimitPlugin };