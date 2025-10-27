import { FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from '../services/notification.service';
import { logger } from '../utils/logger';
import { NotificationRedisService } from '../utils/redis';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async sendNotification(
    request: FastifyRequest<{
      Body: {
        userId: string;
        channels: Array<'email' | 'sms' | 'push' | 'in-app'>;
        priority: 'high' | 'normal' | 'low';
        scheduledFor?: string;
        email?: any;
        sms?: any;
        push?: any;
        inApp?: any;
        metadata?: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.notificationService.sendNotification({
        ...request.body,
        scheduledFor: request.body.scheduledFor 
          ? new Date(request.body.scheduledFor) 
          : undefined,
      });

      return reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error({ error, userId: request.body.userId }, 'Failed to send notification');
      
      if (error instanceof Error && error.message.includes('rate limit')) {
        return reply.code(429).send({
          success: false,
          error: error.message,
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to send notification',
      });
    }
  }

  async sendBulkNotification(
    request: FastifyRequest<{
      Body: {
        userIds: string[];
        channels: Array<'email' | 'sms' | 'push' | 'in-app'>;
        priority: 'high' | 'normal' | 'low';
        scheduledFor?: string;
        email?: any;
        sms?: any;
        push?: any;
        inApp?: any;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.notificationService.sendBulkNotification({
        ...request.body,
        scheduledFor: request.body.scheduledFor 
          ? new Date(request.body.scheduledFor) 
          : undefined,
      });

      return reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error({ error, userCount: request.body.userIds.length }, 'Failed to send bulk notification');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to send bulk notification',
      });
    }
  }

  async broadcastNotification(
    request: FastifyRequest<{
      Body: {
        segment: {
          filter: 'all' | 'active' | 'inactive' | 'premium' | 'trial';
          customQuery?: {
            field: string;
            operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'nin';
            value: any;
          };
        };
        channels: Array<'email' | 'sms' | 'push' | 'in-app'>;
        priority: 'high' | 'normal' | 'low';
        scheduledFor?: string;
        email?: any;
        push?: any;
        inApp?: any;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.notificationService.broadcastNotification({
        ...request.body,
        scheduledFor: request.body.scheduledFor 
          ? new Date(request.body.scheduledFor) 
          : undefined,
      });

      return reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error({ error, segment: request.body.segment }, 'Failed to broadcast notification');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to broadcast notification',
      });
    }
  }

  async getNotificationStatus(
    request: FastifyRequest<{
      Params: {
        notificationId: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const status = await this.notificationService.getNotificationStatus(
        request.params.notificationId
      );

      if (!status) {
        return reply.code(404).send({
          success: false,
          error: 'Notification not found',
        });
      }

      return reply.code(200).send({
        success: true,
        data: status,
      });
    } catch (error) {
      logger.error({ error, notificationId: request.params.notificationId }, 'Failed to get notification status');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get notification status',
      });
    }
  }

  async cancelNotification(
    request: FastifyRequest<{
      Params: {
        notificationId: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const cancelled = await this.notificationService.cancelNotification(
        request.params.notificationId
      );

      if (!cancelled) {
        return reply.code(404).send({
          success: false,
          error: 'Notification not found or already sent',
        });
      }

      return reply.code(200).send({
        success: true,
        message: 'Notification cancelled successfully',
      });
    } catch (error) {
      logger.error({ error, notificationId: request.params.notificationId }, 'Failed to cancel notification');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to cancel notification',
      });
    }
  }

  async getMetrics(
    request: FastifyRequest<{
      Querystring: {
        period: 'hour' | 'day' | 'week' | 'month';
        channel?: 'email' | 'sms' | 'push' | 'in-app' | 'all';
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const metrics = await NotificationRedisService.getMetrics(
        request.query.period,
        request.query.channel
      );

      return reply.code(200).send({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error({ error, query: request.query }, 'Failed to get metrics');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get metrics',
      });
    }
  }
}