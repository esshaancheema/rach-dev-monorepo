import { NextRequest, NextResponse } from 'next/server';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  url: string;
  userAgent: string;
  timestamp: number;
  analyticsId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalMetric = await request.json();

    // Validate required fields
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // In production, you would send this to your analytics service
    // For now, we'll log it and optionally send to external services
    
    console.info('Web Vital Metric:', {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: metric.url,
      timestamp: new Date(metric.timestamp).toISOString(),
    });

    // Send to Google Analytics 4 if GA4 measurement ID is configured
    if (process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID) {
      await sendToGA4(metric);
    }

    // Send to Vercel Analytics if available
    if (process.env.VERCEL_ANALYTICS_ID) {
      await sendToVercelAnalytics(metric);
    }

    // Send to custom analytics endpoint if configured
    if (process.env.CUSTOM_ANALYTICS_ENDPOINT) {
      await sendToCustomAnalytics(metric);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing web vital metric:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendToGA4(metric: WebVitalMetric) {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) {
    console.warn('GA4 configuration missing');
    return;
  }

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: metric.analyticsId || metric.id,
          events: [
            {
              name: 'web_vital',
              params: {
                metric_name: metric.name,
                metric_value: Math.round(metric.value),
                metric_rating: metric.rating,
                metric_delta: Math.round(metric.delta),
                page_location: metric.url,
                custom_parameter_1: metric.navigationType,
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to send to GA4:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending to GA4:', error);
  }
}

async function sendToVercelAnalytics(metric: WebVitalMetric) {
  try {
    // Vercel Analytics Web Vitals API
    const response = await fetch('https://vitals.vercel-analytics.com/v1/vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VERCEL_ANALYTICS_ID}`,
      },
      body: JSON.stringify({
        dsn: process.env.VERCEL_ANALYTICS_ID,
        id: metric.id,
        page: metric.url,
        href: metric.url,
        event_name: metric.name,
        value: metric.value,
        speed: metric.rating === 'good' ? 'fast' : metric.rating === 'needs-improvement' ? 'average' : 'slow',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send to Vercel Analytics:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending to Vercel Analytics:', error);
  }
}

async function sendToCustomAnalytics(metric: WebVitalMetric) {
  const endpoint = process.env.CUSTOM_ANALYTICS_ENDPOINT;
  const apiKey = process.env.CUSTOM_ANALYTICS_API_KEY;

  if (!endpoint) return;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event: 'web_vital',
        properties: {
          metric_name: metric.name,
          metric_value: metric.value,
          metric_rating: metric.rating,
          metric_delta: metric.delta,
          url: metric.url,
          user_agent: metric.userAgent,
          timestamp: metric.timestamp,
          navigation_type: metric.navigationType,
        },
      }),
    });

    if (!response.ok) {
      console.error('Failed to send to custom analytics:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending to custom analytics:', error);
  }
}