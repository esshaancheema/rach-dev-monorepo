import { FastifyInstance } from 'fastify';
import { notificationRoutes } from './notification.routes';
import { emailRoutes } from './email.routes';
import { smsRoutes } from './sms.routes';
import { pushRoutes } from './push.routes';
import { inAppRoutes } from './in-app.routes';
import { templateRoutes } from './template.routes';
import { preferenceRoutes } from './preference.routes';
import { historyRoutes } from './history.routes';
import { adminRoutes } from './admin.routes';
import { webhookRoutes } from './webhook.routes';

export async function registerRoutes(app: FastifyInstance) {
  // Health check route (no prefix)
  app.get('/health', async () => ({ status: 'healthy' }));

  // API routes
  await app.register(async (app) => {
    // Main notification routes
    await app.register(notificationRoutes, { prefix: '/notifications' });
    
    // Channel-specific routes
    await app.register(emailRoutes, { prefix: '/email' });
    await app.register(smsRoutes, { prefix: '/sms' });
    await app.register(pushRoutes, { prefix: '/push' });
    await app.register(inAppRoutes, { prefix: '/in-app' });
    
    // Template management
    await app.register(templateRoutes, { prefix: '/templates' });
    
    // User preferences
    await app.register(preferenceRoutes, { prefix: '/preferences' });
    
    // Notification history
    await app.register(historyRoutes, { prefix: '/history' });
    
    // Admin routes
    await app.register(adminRoutes, { prefix: '/admin' });
    
    // Webhook endpoints
    await app.register(webhookRoutes, { prefix: '/webhooks' });
  }, { prefix: '/api' });
}