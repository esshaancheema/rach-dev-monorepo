// Send Push Notification API Endpoint
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { subscriptions } from '../subscribe/route';
import { NotificationPayload } from '@/lib/notifications/push-notifications';

// Configure web-push with VAPID keys
// In production, these should be proper environment variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BHxVgYnvxMGWQF1CQAG5GHzWZNqWp9JZ1ZOdnXsf7PQU7lNQkYJ1yBVK8a1ZZ9uRhZzZzZzZzZzZzZzZzZzZzZ';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'your-vapid-private-key';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'hello@zoptal.com';

webpush.setVapidDetails(
  `mailto:${VAPID_EMAIL}`,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export async function POST(request: NextRequest) {
  try {
    const body: {
      userId?: string;
      subscriptionId?: string;
      payload: NotificationPayload;
    } = await request.json();

    if (!body.payload) {
      return NextResponse.json(
        { error: 'Notification payload is required' },
        { status: 400 }
      );
    }

    let targetSubscriptions = [];

    // Find target subscriptions
    if (body.subscriptionId) {
      const subscription = subscriptions.get(body.subscriptionId);
      if (subscription) {
        targetSubscriptions.push(subscription);
      }
    } else if (body.userId) {
      // Find all subscriptions for the user
      targetSubscriptions = Array.from(subscriptions.values())
        .filter(sub => sub.userId === body.userId);
    } else {
      return NextResponse.json(
        { error: 'Either userId or subscriptionId is required' },
        { status: 400 }
      );
    }

    if (targetSubscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No subscriptions found for the specified criteria' },
        { status: 404 }
      );
    }

    // Send notifications
    const results = await Promise.allSettled(
      targetSubscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys
            },
            JSON.stringify(body.payload)
          );

          // Update last used timestamp
          subscription.lastUsed = new Date().toISOString();
          subscriptions.set(subscription.id, subscription);

          return { success: true, subscriptionId: subscription.id };
        } catch (error) {
          console.error(`Failed to send notification to ${subscription.id}:`, error);
          
          // Remove invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            subscriptions.delete(subscription.id);
            console.info(`Removed invalid subscription: ${subscription.id}`);
          }

          return { 
            success: false, 
            subscriptionId: subscription.id, 
            error: error.message 
          };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.info(`Push notification sent: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${successful} devices`,
      results: {
        successful,
        failed,
        total: results.length,
        details: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'Promise rejected' })
      }
    });

  } catch (error) {
    console.error('Error sending push notification:', error);
    
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// Test endpoint for development
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test');
    
    if (test === 'true') {
      // Send test notification to all subscriptions
      const testPayload: NotificationPayload = {
        title: 'Test Notification',
        body: 'This is a test notification from Zoptal!',
        icon: '/images/icons/icon-192x192.png',
        badge: '/images/icons/badge-72x72.png',
        tag: 'test',
        url: '/',
        actions: [
          { action: 'open', title: 'Open App' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      };

      const allSubscriptions = Array.from(subscriptions.values());
      
      if (allSubscriptions.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'No subscriptions found'
        });
      }

      const results = await Promise.allSettled(
        allSubscriptions.map(async (subscription) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: subscription.endpoint,
                keys: subscription.keys
              },
              JSON.stringify(testPayload)
            );
            return { success: true, subscriptionId: subscription.id };
          } catch (error) {
            return { success: false, subscriptionId: subscription.id, error: error.message };
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

      return NextResponse.json({
        success: true,
        message: `Test notification sent to ${successful} devices`,
        totalSubscriptions: allSubscriptions.length
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Push notification send endpoint',
      usage: 'POST with userId/subscriptionId and payload, or GET with ?test=true for testing'
    });

  } catch (error) {
    console.error('Error in push notification endpoint:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}