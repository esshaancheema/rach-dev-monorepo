import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for analytics events
const analyticsEventSchema = z.object({
  event: z.string().min(1, 'Event name is required'),
  properties: z.record(z.any()).optional(),
  session: z.object({
    id: z.string(),
    page: z.string(),
    timestamp: z.number()
  }).optional(),
  user: z.object({
    id: z.string().optional(),
    anonymousId: z.string().optional(),
    traits: z.record(z.any()).optional()
  }).optional()
});

type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;

// Event categories for organization
const EVENT_CATEGORIES = {
  USER: 'user',
  PAGE: 'page',
  INTERACTION: 'interaction',
  CONVERSION: 'conversion',
  ERROR: 'error',
  PERFORMANCE: 'performance'
};

// Common events we track
const TRACKED_EVENTS = {
  // User events
  'user_signed_up': EVENT_CATEGORIES.USER,
  'user_logged_in': EVENT_CATEGORIES.USER,
  'user_logged_out': EVENT_CATEGORIES.USER,
  
  // Page events
  'page_viewed': EVENT_CATEGORIES.PAGE,
  'session_started': EVENT_CATEGORIES.PAGE,
  'session_ended': EVENT_CATEGORIES.PAGE,
  
  // Interaction events
  'hero_prompt_submitted': EVENT_CATEGORIES.INTERACTION,
  'hero_preview_generated': EVENT_CATEGORIES.INTERACTION,
  'hero_cta_clicked': EVENT_CATEGORIES.INTERACTION,
  'newsletter_subscribed': EVENT_CATEGORIES.INTERACTION,
  'contact_form_submitted': EVENT_CATEGORIES.INTERACTION,
  
  // Conversion events
  'lead_captured': EVENT_CATEGORIES.CONVERSION,
  'demo_requested': EVENT_CATEGORIES.CONVERSION,
  'consultation_scheduled': EVENT_CATEGORIES.CONVERSION,
  
  // Error events
  'api_error': EVENT_CATEGORIES.ERROR,
  'javascript_error': EVENT_CATEGORIES.ERROR,
  
  // Performance events
  'page_load_time': EVENT_CATEGORIES.PERFORMANCE,
  'api_response_time': EVENT_CATEGORIES.PERFORMANCE
};

// Enrich event data with additional context
const enrichEventData = (
  event: AnalyticsEvent,
  request: NextRequest
): AnalyticsEvent & { enriched: any } => {
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  return {
    ...event,
    enriched: {
      timestamp: new Date().toISOString(),
      ip: ip.split(',')[0].trim(), // Get first IP if multiple
      userAgent,
      referer,
      category: TRACKED_EVENTS[event.event as keyof typeof TRACKED_EVENTS] || 'other',
      url: event.properties?.url || referer,
      device: detectDevice(userAgent),
      browser: detectBrowser(userAgent),
      os: detectOS(userAgent),
      country: 'unknown', // In production, use GeoIP service
      city: 'unknown'
    }
  };
};

// Device detection helper
const detectDevice = (userAgent: string): string => {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
};

// Browser detection helper
const detectBrowser = (userAgent: string): string => {
  if (userAgent.includes('Chrome')) return 'chrome';
  if (userAgent.includes('Firefox')) return 'firefox';
  if (userAgent.includes('Safari')) return 'safari';
  if (userAgent.includes('Edge')) return 'edge';
  return 'unknown';
};

// OS detection helper
const detectOS = (userAgent: string): string => {
  if (userAgent.includes('Windows')) return 'windows';
  if (userAgent.includes('Mac')) return 'macos';
  if (userAgent.includes('Linux')) return 'linux';
  if (userAgent.includes('Android')) return 'android';
  if (userAgent.includes('iOS')) return 'ios';
  return 'unknown';
};

// Save analytics event (mock implementation)
const saveAnalyticsEvent = async (enrichedEvent: any): Promise<void> => {
  // In production, save to:
  // - ClickHouse/PostgreSQL for analytics
  // - InfluxDB for time-series data
  // - BigQuery for data warehouse
  // - Real-time streaming to Kafka
  
  console.info('Analytics event saved:', {
    event: enrichedEvent.event,
    category: enrichedEvent.enriched.category,
    timestamp: enrichedEvent.enriched.timestamp,
    device: enrichedEvent.enriched.device,
    location: enrichedEvent.properties?.location
  });
  
  // Mock database insertion
  const eventRecord = {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...enrichedEvent,
    processed: true
  };
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 10));
};

// Real-time analytics processing
const processRealTimeAnalytics = async (enrichedEvent: any): Promise<void> => {
  // Update real-time counters, dashboards, etc.
  console.info('Real-time analytics updated for:', enrichedEvent.event);
  
  // Examples of real-time processing:
  // - Update live visitor count
  // - Track conversion funnels
  // - Alert on error spikes
  // - Update dashboard metrics
};

// Rate limiting helper
const checkRateLimit = (ip: string): boolean => {
  // In production, use Redis or similar for rate limiting
  // This is a simple in-memory implementation for demo
  
  const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // 100 requests per minute
  
  const current = rateLimitStore.get(ip);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = analyticsEventSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid event data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }
    
    const eventData = validationResult.data;
    
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // Enrich event with additional context
    const enrichedEvent = enrichEventData(eventData, request);
    
    // Save to analytics database
    await saveAnalyticsEvent(enrichedEvent);
    
    // Process for real-time analytics
    await processRealTimeAnalytics(enrichedEvent);
    
    // Forward to external analytics services (in production)
    // - Google Analytics
    // - Mixpanel
    // - Amplitude
    // - PostHog
    
    return NextResponse.json({
      success: true,
      eventId: `event_${Date.now()}`,
      timestamp: enrichedEvent.enriched.timestamp
    });
    
  } catch (error) {
    console.error('Analytics tracking error:', error);
    
    // Don't fail the user's request if analytics fails
    return NextResponse.json({
      success: false,
      error: 'Analytics tracking failed'
    }, { status: 200 }); // Return 200 to not break user experience
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if (action === 'events') {
    return NextResponse.json({
      trackedEvents: Object.keys(TRACKED_EVENTS),
      categories: Object.values(EVENT_CATEGORIES)
    });
  }
  
  if (action === 'stats') {
    // Return basic analytics stats (mock data)
    return NextResponse.json({
      stats: {
        totalEvents: 50000,
        uniqueUsers: 5000,
        sessionsToday: 1200,
        topEvents: [
          { event: 'page_viewed', count: 15000 },
          { event: 'hero_cta_clicked', count: 850 },
          { event: 'newsletter_subscribed', count: 320 },
          { event: 'lead_captured', count: 95 }
        ],
        topPages: [
          { page: '/', views: 8000 },
          { page: '/services/ai-development', views: 2400 },
          { page: '/pricing', views: 1800 },
          { page: '/about', views: 1200 }
        ]
      }
    });
  }
  
  return NextResponse.json({
    message: 'Analytics API',
    version: '1.0.0',
    endpoints: {
      'POST /api/analytics': 'Track analytics event',
      'GET /api/analytics?action=events': 'Get tracked event types',
      'GET /api/analytics?action=stats': 'Get analytics statistics'
    },
    rateLimit: {
      requests: 100,
      window: '1 minute'
    }
  });
}