// Push Notifications Service for Zoptal PWA
import { analytics } from '@/lib/analytics/tracker';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  url?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: any;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  userAgent: string;
  subscribedAt: string;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  
  private readonly VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BHxVgYnvxMGWQF1CQAG5GHzWZNqWp9JZ1ZOdnXsf7PQU7lNQkYJ1yBVK8a1ZZ9uRhZzZzZzZzZzZzZzZzZzZzZ';
  private readonly API_ENDPOINT = '/api/notifications';

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  /**
   * Initialize push notification service
   */
  async init(): Promise<void> {
    try {
      // Check if service worker and push notifications are supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications not supported');
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      this.registration = registration;

      // Get existing subscription
      this.subscription = await registration.pushManager.getSubscription();

      console.info('Push notification service initialized');
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    analytics.track({
      name: 'notification_permission_requested',
      category: 'user_interaction',
      properties: {
        permission,
        timestamp: new Date().toISOString()
      }
    });

    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        await this.init();
      }

      if (!this.registration) {
        throw new Error('Service worker not registered');
      }

      // Request permission first
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Subscribe to push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY)
      });

      this.subscription = subscription;

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);

      analytics.track({
        name: 'push_notification_subscribed',
        category: 'user_interaction',
        properties: {
          endpoint: subscription.endpoint,
          timestamp: new Date().toISOString()
        }
      });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      
      analytics.track({
        name: 'push_notification_subscribe_failed',
        category: 'user_interaction',
        properties: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
      
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.subscription) {
        return true;
      }

      // Unsubscribe from push service
      const success = await this.subscription.unsubscribe();
      
      if (success) {
        // Remove subscription from server
        await this.removeSubscriptionFromServer(this.subscription);
        this.subscription = null;

        analytics.track({
          name: 'push_notification_unsubscribed',
          category: 'user_interaction'
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Show local notification
   */
  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    try {
      if (!this.registration) {
        throw new Error('Service worker not registered');
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      const options: NotificationOptions = {
        body: payload.body,
        icon: payload.icon || '/images/icons/icon-192x192.png',
        badge: payload.badge || '/images/icons/badge-72x72.png',
        image: payload.image,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        data: {
          url: payload.url,
          ...payload.data
        },
        actions: payload.actions
      };

      await this.registration.showNotification(payload.title, options);

      analytics.track({
        name: 'local_notification_shown',
        category: 'user_interaction',
        properties: {
          title: payload.title,
          tag: payload.tag
        }
      });
    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  }

  /**
   * Send push notification to specific user
   */
  async sendPushNotification(
    userId: string, 
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          payload
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send push notification: ${response.statusText}`);
      }

      analytics.track({
        name: 'push_notification_sent',
        category: 'user_interaction',
        properties: {
          userId,
          title: payload.title
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  /**
   * Send broadcast notification to all subscribers
   */
  async sendBroadcastNotification(
    payload: NotificationPayload,
    filters?: {
      tags?: string[];
      userAgent?: string;
      subscribedAfter?: string;
    }
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload,
          filters
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send broadcast notification: ${response.statusText}`);
      }

      analytics.track({
        name: 'broadcast_notification_sent',
        category: 'user_interaction',
        properties: {
          title: payload.title,
          filters
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to send broadcast notification:', error);
      return false;
    }
  }

  /**
   * Schedule notification
   */
  async scheduleNotification(
    payload: NotificationPayload,
    scheduleTime: Date,
    userId?: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload,
          scheduleTime: scheduleTime.toISOString(),
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to schedule notification: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return false;
    }
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'default';
    }
    return Notification.permission;
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  /**
   * Check if user is subscribed
   */
  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  /**
   * Get current subscription
   */
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  /**
   * Test notification (for development)
   */
  async testNotification(): Promise<void> {
    await this.showLocalNotification({
      title: 'Test Notification',
      body: 'This is a test notification from Zoptal!',
      tag: 'test',
      url: '/',
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });
  }

  /**
   * Private helper methods
   */
  
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
      },
      userAgent: navigator.userAgent,
      subscribedAt: new Date().toISOString()
    };

    const response = await fetch(`${this.API_ENDPOINT}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData)
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription on server');
    }
  }

  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    const response = await fetch(`${this.API_ENDPOINT}/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint
      })
    });

    if (!response.ok) {
      console.warn('Failed to remove subscription from server');
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Export singleton instance
export const pushNotifications = PushNotificationService.getInstance();

// Notification templates for common use cases
export const NotificationTemplates = {
  welcome: (userName: string): NotificationPayload => ({
    title: 'Welcome to Zoptal!',
    body: `Hi ${userName}, thanks for joining us. Explore our AI-powered development services.`,
    tag: 'welcome',
    url: '/services',
    actions: [
      { action: 'explore', title: 'Explore Services' },
      { action: 'dismiss', title: 'Later' }
    ]
  }),

  projectUpdate: (projectName: string, status: string): NotificationPayload => ({
    title: 'Project Update',
    body: `${projectName} status: ${status}`,
    tag: 'project-update',
    url: '/dashboard',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }),

  blogPost: (title: string, excerpt: string): NotificationPayload => ({
    title: 'New Blog Post',
    body: `${title}: ${excerpt}`,
    tag: 'blog-post',
    url: '/blog',
    actions: [
      { action: 'read', title: 'Read Now' },
      { action: 'later', title: 'Read Later' }
    ]
  }),

  maintenance: (startTime: string): NotificationPayload => ({
    title: 'Scheduled Maintenance',
    body: `System maintenance starting at ${startTime}. Some features may be temporarily unavailable.`,
    tag: 'maintenance',
    requireInteraction: true,
    actions: [
      { action: 'acknowledge', title: 'Got it' }
    ]
  }),

  quote: (clientName: string): NotificationPayload => ({
    title: 'New Quote Request',
    body: `${clientName} has requested a project quote.`,
    tag: 'quote-request',
    url: '/admin/quotes',
    requireInteraction: true,
    actions: [
      { action: 'review', title: 'Review Quote' },
      { action: 'dismiss', title: 'Later' }
    ]
  })
};