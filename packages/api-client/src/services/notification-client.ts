import { BaseApiClient } from '../base-client';
import { 
  ApiClientConfig, 
  NotificationTemplate,
  PaginatedResponse,
  PaginationParams 
} from '../types';

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    frequency: 'immediately' | 'hourly' | 'daily' | 'weekly';
    types: string[];
  };
  sms: {
    enabled: boolean;
    types: string[];
  };
  push: {
    enabled: boolean;
    types: string[];
  };
  inApp: {
    enabled: boolean;
    types: string[];
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  readAt?: string;
  createdAt: string;
  scheduledFor?: string;
}

export interface EmailRequest {
  to: string | string[];
  subject: string;
  content: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string;
    encoding?: string;
  }>;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  tags?: string[];
  headers?: Record<string, string>;
}

export interface SMSRequest {
  to: string | string[];
  message: string;
  templateId?: string;
  templateData?: Record<string, any>;
  mediaUrls?: string[];
  tags?: string[];
}

export interface PushNotificationRequest {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  image?: string;
  badge?: number;
  sound?: string;
  clickAction?: string;
  tags?: string[];
}

export interface BulkNotificationRequest {
  type: string;
  title: string;
  message: string;
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  recipients: {
    userIds?: string[];
    segments?: string[];
    filters?: Record<string, any>;
  };
  templateId?: string;
  templateData?: Record<string, any>;
  scheduledFor?: string;
  tags?: string[];
}

export interface DeliveryStatus {
  id: string;
  notificationId: string;
  channel: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'complained';
  recipient: string;
  error?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  createdAt: string;
}

export class NotificationClient extends BaseApiClient {
  constructor(config: ApiClientConfig = {}) {
    super({
      baseURL: process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:4005',
      ...config,
    });
  }

  // User notifications
  async getNotifications(params: PaginationParams & {
    type?: string;
    status?: string;
    channel?: string;
    unreadOnly?: boolean;
  } = {}) {
    return this.get<PaginatedResponse<Notification>>('/notifications', params);
  }

  async getNotification(notificationId: string) {
    return this.get<Notification>(`/notifications/${notificationId}`);
  }

  async markAsRead(notificationId: string) {
    return this.post(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead() {
    return this.post('/notifications/mark-all-read');
  }

  async deleteNotification(notificationId: string) {
    return this.delete(`/notifications/${notificationId}`);
  }

  async getUnreadCount() {
    return this.get<{ count: number }>('/notifications/unread-count');
  }

  // Notification preferences
  async getPreferences() {
    return this.get<NotificationPreferences>('/notifications/preferences');
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>) {
    return this.put<NotificationPreferences>('/notifications/preferences', preferences);
  }

  // Device registration (for push notifications)
  async registerDevice(data: {
    token: string;
    platform: 'ios' | 'android' | 'web';
    deviceInfo?: {
      model?: string;
      version?: string;
      appVersion?: string;
    };
  }) {
    return this.post('/notifications/devices', data);
  }

  async unregisterDevice(token: string) {
    return this.delete(`/notifications/devices/${token}`);
  }

  async getRegisteredDevices() {
    return this.get<Array<{
      id: string;
      token: string;
      platform: string;
      deviceInfo: any;
      isActive: boolean;
      registeredAt: string;
    }>>('/notifications/devices');
  }

  // Send notifications (admin/system)
  async sendEmail(request: EmailRequest) {
    return this.post<{
      id: string;
      status: string;
      messageId?: string;
    }>('/notifications/send/email', request);
  }

  async sendSMS(request: SMSRequest) {
    return this.post<{
      id: string;
      status: string;
      messageId?: string;
    }>('/notifications/send/sms', request);
  }

  async sendPushNotification(request: PushNotificationRequest) {
    return this.post<{
      id: string;
      status: string;
      messageId?: string;
    }>('/notifications/send/push', request);
  }

  async sendBulkNotification(request: BulkNotificationRequest) {
    return this.post<{
      id: string;
      status: string;
      estimatedRecipients: number;
    }>('/notifications/send/bulk', request);
  }

  // Templates
  async getTemplates(params: PaginationParams & {
    type?: string;
    category?: string;
  } = {}) {
    return this.get<PaginatedResponse<NotificationTemplate>>('/notifications/templates', params);
  }

  async getTemplate(templateId: string) {
    return this.get<NotificationTemplate>(`/notifications/templates/${templateId}`);
  }

  async createTemplate(data: {
    name: string;
    type: 'email' | 'sms' | 'push';
    category?: string;
    subject?: string;
    content: string;
    variables: string[];
    isActive?: boolean;
  }) {
    return this.post<NotificationTemplate>('/notifications/templates', data);
  }

  async updateTemplate(templateId: string, data: Partial<{
    name: string;
    subject: string;
    content: string;
    variables: string[];
    isActive: boolean;
  }>) {
    return this.put<NotificationTemplate>(`/notifications/templates/${templateId}`, data);
  }

  async deleteTemplate(templateId: string) {
    return this.delete(`/notifications/templates/${templateId}`);
  }

  async previewTemplate(templateId: string, data: Record<string, any>) {
    return this.post<{
      subject?: string;
      content: string;
    }>(`/notifications/templates/${templateId}/preview`, data);
  }

  // Delivery tracking
  async getDeliveryStatus(notificationId: string) {
    return this.get<DeliveryStatus[]>(`/notifications/${notificationId}/delivery`);
  }

  async getDeliveryAnalytics(params: {
    startDate: string;
    endDate: string;
    channel?: string;
    type?: string;
  }) {
    return this.get<{
      sent: number;
      delivered: number;
      failed: number;
      opened: number;
      clicked: number;
      bounced: number;
      complained: number;
      deliveryRate: number;
      openRate: number;
      clickRate: number;
      bounceRate: number;
      complaintRate: number;
    }>('/notifications/analytics/delivery', params);
  }

  // Webhook management
  async getWebhooks() {
    return this.get<Array<{
      id: string;
      url: string;
      events: string[];
      isActive: boolean;
      secret: string;
      createdAt: string;
    }>>('/notifications/webhooks');
  }

  async createWebhook(data: {
    url: string;
    events: string[];
    secret?: string;
  }) {
    return this.post('/notifications/webhooks', data);
  }

  async updateWebhook(webhookId: string, data: {
    url?: string;
    events?: string[];
    isActive?: boolean;
  }) {
    return this.put(`/notifications/webhooks/${webhookId}`, data);
  }

  async deleteWebhook(webhookId: string) {
    return this.delete(`/notifications/webhooks/${webhookId}`);
  }

  async testWebhook(webhookId: string) {
    return this.post(`/notifications/webhooks/${webhookId}/test`);
  }

  // Segments (for targeted notifications)
  async getSegments() {
    return this.get<Array<{
      id: string;
      name: string;
      description: string;
      criteria: Record<string, any>;
      userCount: number;
      createdAt: string;
    }>>('/notifications/segments');
  }

  async createSegment(data: {
    name: string;
    description?: string;
    criteria: Record<string, any>;
  }) {
    return this.post('/notifications/segments', data);
  }

  async updateSegment(segmentId: string, data: {
    name?: string;
    description?: string;
    criteria?: Record<string, any>;
  }) {
    return this.put(`/notifications/segments/${segmentId}`, data);
  }

  async deleteSegment(segmentId: string) {
    return this.delete(`/notifications/segments/${segmentId}`);
  }

  async getSegmentUsers(segmentId: string, params: PaginationParams = {}) {
    return this.get<PaginatedResponse<{
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
    }>>(`/notifications/segments/${segmentId}/users`, params);
  }

  // Suppression list (unsubscribed users)
  async getSuppressionList(params: PaginationParams & {
    channel?: string;
    reason?: string;
  } = {}) {
    return this.get<PaginatedResponse<{
      id: string;
      email?: string;
      phone?: string;
      channel: string;
      reason: string;
      suppressedAt: string;
    }>>('/notifications/suppression', params);
  }

  async addToSuppressionList(data: {
    email?: string;
    phone?: string;
    channel: string;
    reason: string;
  }) {
    return this.post('/notifications/suppression', data);
  }

  async removeFromSuppressionList(suppressionId: string) {
    return this.delete(`/notifications/suppression/${suppressionId}`);
  }

  // Scheduled notifications
  async getScheduledNotifications(params: PaginationParams = {}) {
    return this.get<PaginatedResponse<{
      id: string;
      type: string;
      title: string;
      message: string;
      scheduledFor: string;
      status: 'scheduled' | 'sent' | 'canceled';
      createdAt: string;
    }>>('/notifications/scheduled', params);
  }

  async cancelScheduledNotification(notificationId: string) {
    return this.post(`/notifications/scheduled/${notificationId}/cancel`);
  }
}