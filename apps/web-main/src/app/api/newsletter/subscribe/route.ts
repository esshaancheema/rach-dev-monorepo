import { NextRequest, NextResponse } from 'next/server';

interface SubscriptionRequest {
  email: string;
  source?: string;
  tags?: string[];
  firstName?: string;
  lastName?: string;
  company?: string;
}

interface MailchimpResponse {
  id: string;
  email_address: string;
  status: string;
}

interface ConvertKitResponse {
  subscription: {
    id: number;
    state: string;
    email_address: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscriptionRequest = await request.json();
    const { email, source = 'website', tags = [], firstName, lastName, company } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Rate limiting check (simple IP-based)
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `newsletter_signup_${ip}`;
    
    // In a production environment, you'd use Redis or similar for rate limiting
    // For now, we'll just log the attempt
    console.info(`Newsletter signup attempt from IP: ${ip}, Email: ${email}`);

    // Subscribe to email service(s)
    const results = await Promise.allSettled([
      subscribeToMailchimp(email, { firstName, lastName, company, source, tags }),
      subscribeToConvertKit(email, { firstName, lastName, tags }),
      subscribeToCustomService(email, { firstName, lastName, company, source, tags }),
    ]);

    // Check if at least one subscription succeeded
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    
    if (successCount === 0) {
      // All services failed
      const errors = results
        .filter(result => result.status === 'rejected')
        .map(result => (result as PromiseRejectedResult).reason.message)
        .join(', ');
      
      console.error('All newsletter services failed:', errors);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again later.' },
        { status: 500 }
      );
    }

    // Log successful subscription
    console.info(`Newsletter subscription successful: ${email}, Services: ${successCount}/3`);

    // Track the event (if analytics service is configured)
    await trackSubscriptionEvent(email, source);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed! Please check your email to confirm your subscription.',
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

async function subscribeToMailchimp(
  email: string,
  metadata: { firstName?: string; lastName?: string; company?: string; source?: string; tags?: string[] }
): Promise<MailchimpResponse> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  
  if (!apiKey || !listId) {
    throw new Error('Mailchimp configuration missing');
  }

  const datacenter = apiKey.split('-')[1];
  const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${listId}/members`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      status: 'pending', // Double opt-in
      merge_fields: {
        FNAME: metadata.firstName || '',
        LNAME: metadata.lastName || '',
        COMPANY: metadata.company || '',
        SOURCE: metadata.source || 'website',
      },
      tags: metadata.tags || [],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    if (error.title === 'Member Exists') {
      // Already subscribed, return success
      return {
        id: 'existing',
        email_address: email,
        status: 'subscribed',
      };
    }
    throw new Error(`Mailchimp error: ${error.detail || error.title}`);
  }

  return response.json();
}

async function subscribeToConvertKit(
  email: string,
  metadata: { firstName?: string; lastName?: string; tags?: string[] }
): Promise<ConvertKitResponse> {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  const formId = process.env.CONVERTKIT_FORM_ID;
  
  if (!apiKey || !formId) {
    throw new Error('ConvertKit configuration missing');
  }

  const url = `https://api.convertkit.com/v3/forms/${formId}/subscribe`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      email,
      first_name: metadata.firstName || '',
      tags: metadata.tags || [],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`ConvertKit error: ${error.message || 'Unknown error'}`);
  }

  return response.json();
}

async function subscribeToCustomService(
  email: string,
  metadata: { firstName?: string; lastName?: string; company?: string; source?: string; tags?: string[] }
): Promise<any> {
  const endpoint = process.env.CUSTOM_NEWSLETTER_ENDPOINT;
  const apiKey = process.env.CUSTOM_NEWSLETTER_API_KEY;
  
  if (!endpoint) {
    throw new Error('Custom service not configured');
  }

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
      email,
      first_name: metadata.firstName,
      last_name: metadata.lastName,
      company: metadata.company,
      source: metadata.source,
      tags: metadata.tags,
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Custom service error: ${error}`);
  }

  return response.json();
}

async function trackSubscriptionEvent(email: string, source: string) {
  try {
    // Send to Google Analytics 4 if configured
    if (process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) {
      await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}&api_secret=${process.env.GA4_API_SECRET}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: Buffer.from(email).toString('base64').slice(0, 32),
            events: [
              {
                name: 'newsletter_signup',
                params: {
                  event_category: 'engagement',
                  event_label: source,
                  value: 1,
                },
              },
            ],
          }),
        }
      );
    }

    // Send to custom analytics endpoint if configured
    if (process.env.CUSTOM_ANALYTICS_ENDPOINT) {
      await fetch(process.env.CUSTOM_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CUSTOM_ANALYTICS_API_KEY || ''}`,
        },
        body: JSON.stringify({
          event: 'newsletter_signup',
          properties: {
            email: email,
            source: source,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    }
  } catch (error) {
    console.error('Failed to track subscription event:', error);
    // Don't fail the whole request if tracking fails
  }
}

// Unsubscribe endpoint
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and token are required' },
        { status: 400 }
      );
    }

    // Verify token (implement your own token verification logic)
    const isValidToken = verifyUnsubscribeToken(email, token);
    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 400 }
      );
    }

    // Unsubscribe from services
    await Promise.allSettled([
      unsubscribeFromMailchimp(email),
      unsubscribeFromConvertKit(email),
      unsubscribeFromCustomService(email),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from all newsletters.',
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe. Please try again.' },
      { status: 500 }
    );
  }
}

function verifyUnsubscribeToken(email: string, token: string): boolean {
  // Implement your token verification logic
  // This could be a JWT token, HMAC signature, or database lookup
  const expectedToken = Buffer.from(`${email}:${process.env.UNSUBSCRIBE_SECRET}`).toString('base64');
  return token === expectedToken;
}

async function unsubscribeFromMailchimp(email: string): Promise<void> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  
  if (!apiKey || !listId) return;

  const datacenter = apiKey.split('-')[1];
  const subscriberHash = Buffer.from(email.toLowerCase()).toString('base64');
  const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`;

  await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'unsubscribed',
    }),
  });
}

async function unsubscribeFromConvertKit(email: string): Promise<void> {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  
  if (!apiKey) return;

  const url = `https://api.convertkit.com/v3/unsubscribe`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      email,
    }),
  });
}

async function unsubscribeFromCustomService(email: string): Promise<void> {
  const endpoint = process.env.CUSTOM_NEWSLETTER_UNSUBSCRIBE_ENDPOINT;
  const apiKey = process.env.CUSTOM_NEWSLETTER_API_KEY;
  
  if (!endpoint) return;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email }),
  });
}