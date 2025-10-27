import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const sendNotificationSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    channels: z.array(z.enum(['email', 'sms', 'push', 'in-app'])).min(1),
    priority: z.enum(['high', 'normal', 'low']).default('normal'),
    scheduledFor: z.string().datetime().optional(),
    email: z.object({
      subject: z.string(),
      templateId: z.string().optional(),
      content: z.object({
        html: z.string(),
        text: z.string().optional(),
      }).optional(),
      templateData: z.record(z.any()).optional(),
      attachments: z.array(z.object({
        filename: z.string(),
        content: z.string(),
        contentType: z.string().optional(),
      })).optional(),
    }).optional(),
    sms: z.object({
      message: z.string().max(160),
      phone: z.string().optional(),
    }).optional(),
    push: z.object({
      title: z.string(),
      body: z.string(),
      data: z.record(z.any()).optional(),
      action: z.string().optional(),
      icon: z.string().optional(),
      badge: z.number().optional(),
      sound: z.string().optional(),
    }).optional(),
    inApp: z.object({
      type: z.enum(['info', 'success', 'warning', 'error']),
      title: z.string(),
      message: z.string(),
      actions: z.array(z.object({
        label: z.string(),
        action: z.string(),
        style: z.enum(['primary', 'secondary', 'danger']).optional(),
      })).optional(),
      persistent: z.boolean().default(false),
      metadata: z.record(z.any()).optional(),
    }).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

const bulkNotificationSchema = z.object({
  body: z.object({
    userIds: z.array(z.string().uuid()).min(1).max(1000),
    channels: z.array(z.enum(['email', 'sms', 'push', 'in-app'])).min(1),
    priority: z.enum(['high', 'normal', 'low']).default('normal'),
    scheduledFor: z.string().datetime().optional(),
    // Same notification content fields as above
    email: z.object({
      subject: z.string(),
      templateId: z.string(),
      templateData: z.record(z.any()).optional(),
    }).optional(),
    sms: z.object({
      templateId: z.string(),
      templateData: z.record(z.any()).optional(),
    }).optional(),
    push: z.object({
      title: z.string(),
      body: z.string(),
      data: z.record(z.any()).optional(),
    }).optional(),
    inApp: z.object({
      type: z.enum(['info', 'success', 'warning', 'error']),
      title: z.string(),
      message: z.string(),
    }).optional(),
  }),
});

const broadcastNotificationSchema = z.object({
  body: z.object({
    segment: z.object({
      filter: z.enum(['all', 'active', 'inactive', 'premium', 'trial']),
      customQuery: z.object({
        field: z.string(),
        operator: z.enum(['eq', 'ne', 'gt', 'lt', 'in', 'nin']),
        value: z.any(),
      }).optional(),
    }),
    channels: z.array(z.enum(['email', 'sms', 'push', 'in-app'])).min(1),
    priority: z.enum(['high', 'normal', 'low']).default('normal'),
    scheduledFor: z.string().datetime().optional(),
    // Notification content
    email: z.object({
      subject: z.string(),
      templateId: z.string(),
    }).optional(),
    push: z.object({
      title: z.string(),
      body: z.string(),
    }).optional(),
    inApp: z.object({
      type: z.enum(['info', 'success', 'warning', 'error']),
      title: z.string(),
      message: z.string(),
    }).optional(),
  }),
});

export async function notificationRoutes(app: FastifyInstance) {
  const controller = new NotificationController();

  // Send notification to single user
  app.post(
    '/send',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Notifications'],
        summary: 'Send notification to a user',
        description: 'Send notification through one or more channels to a specific user',
        body: sendNotificationSchema.shape.body,
        response: {
          200: z.object({
            success: z.boolean(),
            data: z.object({
              notificationId: z.string(),
              channels: z.record(z.object({
                status: z.enum(['sent', 'scheduled', 'failed']),
                messageId: z.string().optional(),
                error: z.string().optional(),
              })),
            }),
          }),
        },
      },
    },
    validateRequest(sendNotificationSchema),
    controller.sendNotification.bind(controller)
  );

  // Send bulk notifications
  app.post(
    '/bulk',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Notifications'],
        summary: 'Send bulk notifications',
        description: 'Send notifications to multiple users',
        body: bulkNotificationSchema.shape.body,
        response: {
          200: z.object({
            success: z.boolean(),
            data: z.object({
              batchId: z.string(),
              totalUsers: z.number(),
              status: z.enum(['processing', 'scheduled']),
              scheduledFor: z.string().datetime().optional(),
            }),
          }),
        },
      },
    },
    validateRequest(bulkNotificationSchema),
    controller.sendBulkNotification.bind(controller)
  );

  // Broadcast notification to segment
  app.post(
    '/broadcast',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Notifications'],
        summary: 'Broadcast to user segment',
        description: 'Send notification to a segment of users',
        body: broadcastNotificationSchema.shape.body,
        response: {
          200: z.object({
            success: z.boolean(),
            data: z.object({
              broadcastId: z.string(),
              estimatedRecipients: z.number(),
              status: z.enum(['processing', 'scheduled']),
              scheduledFor: z.string().datetime().optional(),
            }),
          }),
        },
      },
    },
    validateRequest(broadcastNotificationSchema),
    controller.broadcastNotification.bind(controller)
  );

  // Get notification status
  app.get(
    '/:notificationId/status',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Notifications'],
        summary: 'Get notification status',
        description: 'Get the delivery status of a notification',
        params: z.object({
          notificationId: z.string(),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            data: z.object({
              notificationId: z.string(),
              status: z.enum(['pending', 'processing', 'sent', 'failed', 'partially_sent']),
              channels: z.record(z.object({
                status: z.enum(['pending', 'sent', 'failed']),
                sentAt: z.string().datetime().optional(),
                error: z.string().optional(),
                messageId: z.string().optional(),
              })),
              createdAt: z.string().datetime(),
              updatedAt: z.string().datetime(),
            }),
          }),
        },
      },
    },
    controller.getNotificationStatus.bind(controller)
  );

  // Cancel scheduled notification
  app.delete(
    '/:notificationId',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Notifications'],
        summary: 'Cancel scheduled notification',
        description: 'Cancel a scheduled notification',
        params: z.object({
          notificationId: z.string(),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    controller.cancelNotification.bind(controller)
  );

  // Get notification metrics
  app.get(
    '/metrics',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Notifications'],
        summary: 'Get notification metrics',
        description: 'Get notification delivery metrics',
        querystring: z.object({
          period: z.enum(['hour', 'day', 'week', 'month']).default('day'),
          channel: z.enum(['email', 'sms', 'push', 'in-app', 'all']).optional(),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            data: z.object({
              period: z.string(),
              metrics: z.object({
                sent: z.number(),
                failed: z.number(),
                pending: z.number(),
                clickRate: z.number(),
                openRate: z.number(),
              }),
              byChannel: z.record(z.object({
                sent: z.number(),
                failed: z.number(),
                pending: z.number(),
              })),
              timeline: z.array(z.object({
                timestamp: z.string().datetime(),
                sent: z.number(),
                failed: z.number(),
              })),
            }),
          }),
        },
      },
    },
    controller.getMetrics.bind(controller)
  );
}