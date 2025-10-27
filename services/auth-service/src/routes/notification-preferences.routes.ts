import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { enhancedNotificationService } from '../services/enhanced-notification.service';
import { createUserPreferencesService } from '../services/user-preferences.service';
import { logger } from '../utils/logger';

// Schema definitions
const notificationPreferencesUpdateSchema = z.object({
  notifications: z.object({
    email: z.object({
      marketing: z.boolean().optional(),
      updates: z.boolean().optional(),
      security: z.boolean().optional(),
      newsletter: z.boolean().optional(),
      productAnnouncements: z.boolean().optional(),
      tipsAndTricks: z.boolean().optional()
    }).optional(),
    sms: z.object({
      marketing: z.boolean().optional(),
      security: z.boolean().optional(),
      reminders: z.boolean().optional(),
      twoFactor: z.boolean().optional()
    }).optional(),
    push: z.object({
      enabled: z.boolean().optional(),
      desktop: z.boolean().optional(),
      mobile: z.boolean().optional(),
      sound: z.boolean().optional(),
      vibration: z.boolean().optional()
    }).optional(),
    frequency: z.object({
      instant: z.array(z.string()).optional(),
      daily: z.array(z.string()).optional(),
      weekly: z.array(z.string()).optional(),
      never: z.array(z.string()).optional()
    }).optional()
  }).optional()
});

const sendTestNotificationSchema = z.object({
  type: z.enum(['email', 'sms', 'push', 'in_app']),
  template: z.enum([
    'welcome',
    'email_verification', 
    'security_alert',
    'password_reset',
    'newsletter'
  ]).optional(),
  customMessage: z.object({
    subject: z.string().optional(),
    content: z.string()
  }).optional()
});

const notificationStatsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.string().optional(),
  channel: z.enum(['email', 'sms', 'push', 'in_app']).optional()
});

const notificationHistoryQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  type: z.string().optional(),
  channel: z.enum(['email', 'sms', 'push', 'in_app']).optional(),
  status: z.enum(['sent', 'failed', 'pending', 'skipped']).optional()
});

export async function notificationPreferencesRoutes(fastify: FastifyInstance) {
  const userPreferencesService = createUserPreferencesService({ 
    prisma: (fastify as any).prisma 
  });

  // Get user notification preferences
  fastify.get('/preferences', {
    preHandler: [],
    schema: {
      summary: 'Get notification preferences',
      description: 'Get current user notification preferences',
      tags: ['User Preferences'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                notifications: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'object',
                      properties: {
                        marketing: { type: 'boolean' },
                        updates: { type: 'boolean' },
                        security: { type: 'boolean' },
                        newsletter: { type: 'boolean' },
                        productAnnouncements: { type: 'boolean' },
                        tipsAndTricks: { type: 'boolean' }
                      }
                    },
                    sms: {
                      type: 'object',
                      properties: {
                        marketing: { type: 'boolean' },
                        security: { type: 'boolean' },
                        reminders: { type: 'boolean' },
                        twoFactor: { type: 'boolean' }
                      }
                    },
                    push: {
                      type: 'object',
                      properties: {
                        enabled: { type: 'boolean' },
                        desktop: { type: 'boolean' },
                        mobile: { type: 'boolean' },
                        sound: { type: 'boolean' },
                        vibration: { type: 'boolean' }
                      }
                    },
                    frequency: {
                      type: 'object',
                      properties: {
                        instant: { type: 'array', items: { type: 'string' } },
                        daily: { type: 'array', items: { type: 'string' } },
                        weekly: { type: 'array', items: { type: 'string' } },
                        never: { type: 'array', items: { type: 'string' } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const preferences = await userPreferencesService.getUserPreferences(user.id);

      return reply.send({
        success: true,
        data: {
          notifications: preferences.notifications
        }
      });
    } catch (error) {
      logger.error('Failed to get notification preferences:', error);
      return reply.status(500).send({
        success: false,
        error: 'GET_PREFERENCES_FAILED',
        message: 'Failed to retrieve notification preferences'
      });
    }
  });

  // Update user notification preferences
  fastify.put('/preferences', {
    preHandler: [],
    schema: {
      summary: 'Update notification preferences',
      description: 'Update user notification preferences',
      tags: ['User Preferences'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          notifications: {
            type: 'object',
            properties: {
              email: {
                type: 'object',
                properties: {
                  marketing: { type: 'boolean' },
                  updates: { type: 'boolean' },
                  security: { type: 'boolean' },
                  newsletter: { type: 'boolean' },
                  productAnnouncements: { type: 'boolean' },
                  tipsAndTricks: { type: 'boolean' }
                }
              },
              sms: {
                type: 'object',
                properties: {
                  marketing: { type: 'boolean' },
                  security: { type: 'boolean' },
                  reminders: { type: 'boolean' },
                  twoFactor: { type: 'boolean' }
                }
              },
              push: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                  desktop: { type: 'boolean' },
                  mobile: { type: 'boolean' },
                  sound: { type: 'boolean' },
                  vibration: { type: 'boolean' }
                }
              },
              frequency: {
                type: 'object',
                properties: {
                  instant: { type: 'array', items: { type: 'string' } },
                  daily: { type: 'array', items: { type: 'string' } },
                  weekly: { type: 'array', items: { type: 'string' } },
                  never: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                notifications: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const updateData = notificationPreferencesUpdateSchema.parse(request.body);

      const updatedPreferences = await userPreferencesService.updateUserPreferences(
        user.id,
        updateData
      );

      logger.info('Notification preferences updated', {
        userId: user.id,
        updates: updateData
      });

      return reply.send({
        success: true,
        message: 'Notification preferences updated successfully',
        data: {
          notifications: updatedPreferences.notifications
        }
      });
    } catch (error) {
      logger.error('Failed to update notification preferences:', error);
      return reply.status(400).send({
        success: false,
        error: 'UPDATE_PREFERENCES_FAILED',
        message: 'Failed to update notification preferences'
      });
    }
  });

  // Send test notification
  fastify.post('/test', {
    preHandler: [],
    schema: {
      summary: 'Send test notification',
      description: 'Send a test notification to verify settings',
      tags: ['User Preferences'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['email', 'sms', 'push', 'in_app'] },
          template: { 
            type: 'string', 
            enum: ['welcome', 'email_verification', 'security_alert', 'password_reset', 'newsletter'] 
          },
          customMessage: {
            type: 'object',
            properties: {
              subject: { type: 'string' },
              content: { type: 'string' }
            },
            required: ['content']
          }
        },
        required: ['type']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                notificationId: { type: 'string' },
                status: { type: 'string' },
                channels: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const testData = sendTestNotificationSchema.parse(request.body);

      const result = await enhancedNotificationService.sendNotification({
        userId: user.id,
        templateId: testData.template,
        type: 'custom',
        channels: [testData.type],
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          testMessage: testData.customMessage?.content || 'This is a test notification'
        },
        priority: 'normal',
        skipPreferenceCheck: true, // For test notifications
        trackingId: `test_${Date.now()}`,
        metadata: {
          isTest: true,
          requestedBy: user.id
        }
      });

      logger.info('Test notification sent', {
        userId: user.id,
        type: testData.type,
        notificationId: result.id,
        status: result.status
      });

      return reply.send({
        success: true,
        message: 'Test notification sent successfully',
        data: {
          notificationId: result.id,
          status: result.status,
          channels: result.channels
        }
      });
    } catch (error) {
      logger.error('Failed to send test notification:', error);
      return reply.status(400).send({
        success: false,
        error: 'TEST_NOTIFICATION_FAILED',
        message: 'Failed to send test notification'
      });
    }
  });

  // Get notification statistics
  fastify.get('/stats', {
    preHandler: [],
    schema: {
      summary: 'Get notification statistics',
      description: 'Get notification delivery statistics for the user',
      tags: ['User Preferences'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          type: { type: 'string' },
          channel: { type: 'string', enum: ['email', 'sms', 'push', 'in_app'] }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                sent: { type: 'number' },
                failed: { type: 'number' },
                pending: { type: 'number' },
                deliveryRate: { type: 'number' },
                averageDeliveryTime: { type: 'number' },
                byChannel: {
                  type: 'object',
                  additionalProperties: {
                    type: 'object',
                    properties: {
                      sent: { type: 'number' },
                      failed: { type: 'number' }
                    }
                  }
                },
                byType: {
                  type: 'object',
                  additionalProperties: {
                    type: 'object',
                    properties: {
                      sent: { type: 'number' },
                      failed: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const query = notificationStatsQuerySchema.parse(request.query);

      const stats = await enhancedNotificationService.getNotificationStats(
        user.id,
        query.startDate ? new Date(query.startDate) : undefined,
        query.endDate ? new Date(query.endDate) : undefined
      );

      return reply.send({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Failed to get notification statistics:', error);
      return reply.status(500).send({
        success: false,
        error: 'GET_STATS_FAILED',
        message: 'Failed to retrieve notification statistics'
      });
    }
  });

  // Get notification history
  fastify.get('/history', {
    preHandler: [],
    schema: {
      summary: 'Get notification history',
      description: 'Get user notification history with pagination',
      tags: ['User Preferences'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          type: { type: 'string' },
          channel: { type: 'string', enum: ['email', 'sms', 'push', 'in_app'] },
          status: { type: 'string', enum: ['sent', 'failed', 'pending', 'skipped'] }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                notifications: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      type: { type: 'string' },
                      channels: { type: 'object' },
                      status: { type: 'string' },
                      createdAt: { type: 'string' },
                      deliveredAt: { type: 'string', nullable: true },
                      failureReason: { type: 'string', nullable: true }
                    }
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'number' },
                    limit: { type: 'number' },
                    total: { type: 'number' },
                    totalPages: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const query = notificationHistoryQuerySchema.parse(request.query);

      const history = await enhancedNotificationService.getUserNotificationHistory(
        user.id,
        query.page,
        query.limit
      );

      return reply.send({
        success: true,
        data: {
          notifications: history.notifications,
          pagination: {
            page: history.page,
            limit: query.limit,
            total: history.total,
            totalPages: history.totalPages
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get notification history:', error);
      return reply.status(500).send({
        success: false,
        error: 'GET_HISTORY_FAILED',
        message: 'Failed to retrieve notification history'
      });
    }
  });

  // Unsubscribe from specific notification type
  fastify.post('/unsubscribe/:type', {
    preHandler: [],
    schema: {
      summary: 'Unsubscribe from notification type',
      description: 'Unsubscribe from a specific type of notification',
      tags: ['User Preferences'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          type: { 
            type: 'string',
            enum: ['marketing', 'newsletter', 'updates', 'tips', 'promotions']
          }
        },
        required: ['type']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { type } = request.params as { type: string };

      // Update preferences to disable the specific notification type
      const updateData = {
        notifications: {
          email: {
            [type]: false
          },
          sms: {
            [type]: false
          }
        }
      };

      await userPreferencesService.updateUserPreferences(user.id, updateData);

      logger.info('User unsubscribed from notification type', {
        userId: user.id,
        notificationType: type
      });

      return reply.send({
        success: true,
        message: `Successfully unsubscribed from ${type} notifications`
      });
    } catch (error) {
      logger.error('Failed to unsubscribe from notification:', error);
      return reply.status(400).send({
        success: false,
        error: 'UNSUBSCRIBE_FAILED',
        message: 'Failed to unsubscribe from notification'
      });
    }
  });

  // Get available notification templates
  fastify.get('/templates', {
    preHandler: [],
    schema: {
      summary: 'Get notification templates',
      description: 'Get list of available notification templates',
      tags: ['User Preferences'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                templates: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      type: { type: 'string' },
                      channels: { type: 'array', items: { type: 'string' } },
                      description: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Return available templates (in real implementation, this would come from the service)
      const templates = [
        {
          id: 'welcome',
          name: 'Welcome Email',
          type: 'welcome',
          channels: ['email'],
          description: 'Welcome message for new users'
        },
        {
          id: 'email_verification',
          name: 'Email Verification',
          type: 'email_verification',
          channels: ['email'],
          description: 'Email address verification'
        },
        {
          id: 'security_alert',
          name: 'Security Alert',
          type: 'security_alert',
          channels: ['email', 'sms'],
          description: 'Security-related alerts and warnings'
        },
        {
          id: 'newsletter',
          name: 'Newsletter',
          type: 'newsletter',
          channels: ['email'],
          description: 'Regular newsletter updates'
        }
      ];

      return reply.send({
        success: true,
        data: {
          templates
        }
      });
    } catch (error) {
      logger.error('Failed to get notification templates:', error);
      return reply.status(500).send({
        success: false,
        error: 'GET_TEMPLATES_FAILED',
        message: 'Failed to retrieve notification templates'
      });
    }
  });

  logger.info('Notification preferences routes registered');
}