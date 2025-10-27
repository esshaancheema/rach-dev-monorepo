import { NextRequest, NextResponse } from 'next/server';

interface ConversionEvent {
  eventName: string;
  testId: string;
  variantId: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

interface EventStorageItem extends ConversionEvent {
  userAgent: string;
  ip: string;
  referrer?: string;
  pathname: string;
}

// In a production environment, you'd store this in a database
// For now, we'll use a simple in-memory storage with file backup
let eventStorage: EventStorageItem[] = [];

export async function POST(request: NextRequest) {
  try {
    const event: ConversionEvent = await request.json();

    // Validate required fields
    if (!event.eventName || !event.testId || !event.variantId || !event.sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get additional request metadata
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIP || request.ip || '127.0.0.1';
    const referrer = request.headers.get('referer');
    const pathname = new URL(referrer || 'https://example.com').pathname;

    // Create enhanced event record
    const enhancedEvent: EventStorageItem = {
      ...event,
      userAgent,
      ip,
      referrer,
      pathname,
      timestamp: new Date().toISOString() // Ensure server timestamp
    };

    // Store event (in production, this would go to a database)
    eventStorage.push(enhancedEvent);

    // Keep only last 10000 events to prevent memory issues
    if (eventStorage.length > 10000) {
      eventStorage = eventStorage.slice(-10000);
    }

    // In development, log the event
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 AB Test Event Tracked:', {
        event: event.eventName,
        test: event.testId,
        variant: event.variantId,
        value: event.value,
        session: event.sessionId.substring(0, 8) + '...'
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to track AB test event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventName = searchParams.get('eventName');

    // Filter events based on query parameters
    let filteredEvents = eventStorage;

    if (testId) {
      filteredEvents = filteredEvents.filter(event => event.testId === testId);
    }

    if (eventName) {
      filteredEvents = filteredEvents.filter(event => event.eventName === eventName);
    }

    if (startDate) {
      const start = new Date(startDate);
      filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) <= end);
    }

    // Calculate basic analytics
    const analytics = calculateAnalytics(filteredEvents);

    return NextResponse.json({
      events: filteredEvents.map(event => ({
        eventName: event.eventName,
        testId: event.testId,
        variantId: event.variantId,
        value: event.value,
        timestamp: event.timestamp,
        sessionId: event.sessionId,
        pathname: event.pathname
      })),
      analytics,
      totalEvents: filteredEvents.length
    });

  } catch (error) {
    console.error('Failed to fetch AB test events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

function calculateAnalytics(events: EventStorageItem[]) {
  const testAnalytics: Record<string, any> = {};

  // Group events by test and variant
  events.forEach(event => {
    if (!testAnalytics[event.testId]) {
      testAnalytics[event.testId] = {};
    }

    if (!testAnalytics[event.testId][event.variantId]) {
      testAnalytics[event.testId][event.variantId] = {
        totalEvents: 0,
        uniqueSessions: new Set(),
        eventTypes: {},
        totalValue: 0
      };
    }

    const variantData = testAnalytics[event.testId][event.variantId];
    variantData.totalEvents++;
    variantData.uniqueSessions.add(event.sessionId);
    
    if (!variantData.eventTypes[event.eventName]) {
      variantData.eventTypes[event.eventName] = 0;
    }
    variantData.eventTypes[event.eventName]++;
    
    if (event.value) {
      variantData.totalValue += event.value;
    }
  });

  // Convert Sets to counts and calculate conversion rates
  Object.keys(testAnalytics).forEach(testId => {
    Object.keys(testAnalytics[testId]).forEach(variantId => {
      const data = testAnalytics[testId][variantId];
      const uniqueSessionsCount = data.uniqueSessions.size;
      data.uniqueSessions = uniqueSessionsCount;
      
      // Calculate conversion rate (conversions / page views)
      const pageViews = data.eventTypes.page_view || 0;
      const conversions = Object.keys(data.eventTypes)
        .filter(eventName => eventName !== 'page_view' && eventName !== 'test_assignment')
        .reduce((sum, eventName) => sum + data.eventTypes[eventName], 0);
      
      data.conversionRate = pageViews > 0 ? (conversions / pageViews) * 100 : 0;
      data.averageValue = conversions > 0 ? data.totalValue / conversions : 0;
    });
  });

  return testAnalytics;
}