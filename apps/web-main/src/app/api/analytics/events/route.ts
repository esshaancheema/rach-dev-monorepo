import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId: string;
  timestamp: string;
  pathname: string;
  searchParams?: string;
  metadata?: Record<string, any>;
}

interface EnhancedAnalyticsEvent extends AnalyticsEvent {
  userAgent: string;
  ip: string;
  referrer?: string;
  country?: string;
  device?: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
  };
}

// In-memory storage for analytics events (in production, use a database)
let analyticsStorage: EnhancedAnalyticsEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const event: AnalyticsEvent = await request.json();

    // Validate required fields
    if (!event.event || !event.category || !event.action || !event.sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: event, category, action, sessionId' },
        { status: 400 }
      );
    }

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIP || request.ip || '127.0.0.1';
    const referrer = request.headers.get('referer');
    
    // Parse device information from user agent
    const device = parseUserAgent(userAgent);
    
    // Get country from IP (simplified - in production, use a geolocation service)
    const country = await getCountryFromIP(ip);

    // Create enhanced event
    const enhancedEvent: EnhancedAnalyticsEvent = {
      ...event,
      userAgent,
      ip,
      referrer,
      country,
      device,
      timestamp: new Date().toISOString() // Ensure server timestamp
    };

    // Store event
    analyticsStorage.push(enhancedEvent);

    // Keep storage size manageable
    if (analyticsStorage.length > 50000) {
      analyticsStorage = analyticsStorage.slice(-50000);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Enhanced Analytics Event:', {
        event: event.event,
        category: event.category,
        action: event.action,
        label: event.label,
        path: event.pathname,
        device: device.type,
        country
      });
    }

    // Send to external analytics services if configured
    await forwardToExternalServices(enhancedEvent);

    return NextResponse.json({ 
      success: true,
      eventId: `${event.sessionId}_${Date.now()}`
    });

  } catch (error) {
    console.error('Analytics event processing failed:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const pathname = searchParams.get('pathname');
    const limit = parseInt(searchParams.get('limit') || '1000');

    // Filter events
    let filteredEvents = analyticsStorage;

    if (category) {
      filteredEvents = filteredEvents.filter(event => event.category === category);
    }

    if (action) {
      filteredEvents = filteredEvents.filter(event => event.action === action);
    }

    if (userId) {
      filteredEvents = filteredEvents.filter(event => event.userId === userId);
    }

    if (pathname) {
      filteredEvents = filteredEvents.filter(event => event.pathname.includes(pathname));
    }

    if (startDate) {
      const start = new Date(startDate);
      filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) <= end);
    }

    // Sort by timestamp (most recent first)
    filteredEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit results
    filteredEvents = filteredEvents.slice(0, limit);

    // Generate analytics summary
    const summary = generateEventSummary(filteredEvents);

    return NextResponse.json({
      events: filteredEvents.map(event => ({
        event: event.event,
        category: event.category,
        action: event.action,
        label: event.label,
        value: event.value,
        timestamp: event.timestamp,
        pathname: event.pathname,
        device: event.device,
        country: event.country
      })),
      summary,
      totalEvents: filteredEvents.length,
      hasMore: analyticsStorage.length > limit
    });

  } catch (error) {
    console.error('Analytics query failed:', error);
    return NextResponse.json(
      { error: 'Failed to query analytics events' },
      { status: 500 }
    );
  }
}

// Helper functions

function parseUserAgent(userAgent: string): {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
} {
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  
  let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (isMobile && !isTablet) type = 'mobile';
  else if (isTablet) type = 'tablet';

  // Simple OS detection
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Macintosh')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  // Simple browser detection
  let browser = 'Unknown';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  return { type, os, browser };
}

async function getCountryFromIP(ip: string): Promise<string> {
  // Skip for localhost/private IPs
  if (ip === '127.0.0.1' || ip === '::1' || ip?.startsWith('192.168.') || ip?.startsWith('10.')) {
    return 'US'; // Default for development
  }

  try {
    // Use a simple IP geolocation service
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
      signal: AbortSignal.timeout(2000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.countryCode || 'Unknown';
    }
  } catch (error) {
    console.warn('IP geolocation failed:', error);
  }
  
  return 'Unknown';
}

async function forwardToExternalServices(event: EnhancedAnalyticsEvent) {
  // Forward to Google Analytics, PostHog, etc. if configured
  // This would integrate with your existing analytics providers
  
  if (process.env.NEXT_PUBLIC_GA_ID) {
    // Could forward to GA4 Measurement Protocol
  }
  
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    // Could forward to PostHog API
  }
}

function generateEventSummary(events: EnhancedAnalyticsEvent[]) {
  const summary = {
    totalEvents: events.length,
    uniqueSessions: new Set(events.map(e => e.sessionId)).size,
    uniqueUsers: new Set(events.map(e => e.userId).filter(Boolean)).size,
    topCategories: {} as Record<string, number>,
    topActions: {} as Record<string, number>,
    topPages: {} as Record<string, number>,
    deviceBreakdown: {} as Record<string, number>,
    countryBreakdown: {} as Record<string, number>,
    timeRange: {
      start: events.length > 0 ? events[events.length - 1].timestamp : null,
      end: events.length > 0 ? events[0].timestamp : null
    }
  };

  events.forEach(event => {
    // Category breakdown
    summary.topCategories[event.category] = (summary.topCategories[event.category] || 0) + 1;
    
    // Action breakdown
    summary.topActions[event.action] = (summary.topActions[event.action] || 0) + 1;
    
    // Page breakdown
    summary.topPages[event.pathname] = (summary.topPages[event.pathname] || 0) + 1;
    
    // Device breakdown
    if (event.device) {
      summary.deviceBreakdown[event.device.type] = (summary.deviceBreakdown[event.device.type] || 0) + 1;
    }
    
    // Country breakdown
    if (event.country) {
      summary.countryBreakdown[event.country] = (summary.countryBreakdown[event.country] || 0) + 1;
    }
  });

  return summary;
}