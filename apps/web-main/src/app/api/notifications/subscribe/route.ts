// Push Notification Subscription API Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { PushSubscriptionData } from '@/lib/notifications/push-notifications';

// In production, this would use a database
// For now, we'll use in-memory storage (will reset on server restart)
const subscriptions = new Map<string, PushSubscriptionData & { id: string; tags: string[] }>();

export async function POST(request: NextRequest) {
  try {
    const body: PushSubscriptionData & { userId?: string; tags?: string[] } = await request.json();

    // Validate required fields
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Generate subscription ID
    const subscriptionId = generateSubscriptionId(body.endpoint);
    
    // Store subscription
    const subscription = {
      id: subscriptionId,
      endpoint: body.endpoint,
      keys: body.keys,
      userId: body.userId,
      userAgent: body.userAgent,
      subscribedAt: body.subscribedAt || new Date().toISOString(),
      tags: body.tags || ['general'],
      lastUsed: new Date().toISOString()
    };

    subscriptions.set(subscriptionId, subscription);

    console.info(`New push subscription: ${subscriptionId}`);

    return NextResponse.json({
      success: true,
      subscriptionId,
      message: 'Subscription saved successfully'
    });

  } catch (error) {
    console.error('Error saving push subscription:', error);
    
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tag = searchParams.get('tag');

    let filteredSubscriptions = Array.from(subscriptions.values());

    // Filter by userId if provided
    if (userId) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.userId === userId);
    }

    // Filter by tag if provided
    if (tag) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => 
        sub.tags.includes(tag)
      );
    }

    return NextResponse.json({
      success: true,
      subscriptions: filteredSubscriptions.map(sub => ({
        id: sub.id,
        userId: sub.userId,
        subscribedAt: sub.subscribedAt,
        lastUsed: sub.lastUsed,
        tags: sub.tags,
        userAgent: sub.userAgent
      })),
      total: filteredSubscriptions.length
    });

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// Helper function to generate subscription ID
function generateSubscriptionId(endpoint: string): string {
  // Create a hash of the endpoint for consistent ID generation
  return btoa(endpoint).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

// Export subscriptions for use in other API routes
export { subscriptions };