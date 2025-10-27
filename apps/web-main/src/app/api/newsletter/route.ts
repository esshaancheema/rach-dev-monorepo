import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for newsletter subscription
const subscriptionSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  interests: z.array(z.string()).optional(), // Topics they're interested in
  source: z.string().optional(), // Where they subscribed from
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  metadata: z.object({
    url: z.string().optional(),
    referrer: z.string().optional(),
    userAgent: z.string().optional(),
    timestamp: z.string().optional()
  }).optional()
});

type SubscriptionData = z.infer<typeof subscriptionSchema>;

// Available newsletter topics
const NEWSLETTER_TOPICS = [
  'ai-development',
  'web-development',
  'mobile-development',
  'startup-insights',
  'tech-trends',
  'case-studies',
  'product-updates',
  'industry-news'
];

// Check if email is already subscribed (mock implementation)
const checkExistingSubscription = async (email: string): Promise<{
  exists: boolean;
  subscriber?: any;
}> => {
  // In production, check against your database
  // This is a mock implementation
  console.info('Checking existing subscription for:', email);
  
  // Simulate some emails already being subscribed
  const existingEmails = [
    'test@example.com',
    'demo@zoptal.com'
  ];
  
  const exists = existingEmails.includes(email.toLowerCase());
  
  return {
    exists,
    subscriber: exists ? {
      email,
      subscribedAt: '2024-01-01T00:00:00Z',
      status: 'active'
    } : undefined
  };
};

// Add subscriber to newsletter service (mock implementation)
const addSubscriber = async (data: SubscriptionData): Promise<any> => {
  // In production, integrate with:
  // - Mailchimp
  // - ConvertKit
  // - SendGrid
  // - Your custom email service
  
  const subscriber = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: data.email,
    name: data.name || null,
    interests: data.interests || ['product-updates'],
    source: data.source || 'website',
    location: data.location,
    status: 'pending', // Requires email confirmation
    subscribedAt: new Date().toISOString(),
    confirmedAt: null,
    tags: generateTags(data),
    metadata: data.metadata
  };
  
  console.info('New subscriber added:', subscriber);
  
  // Send confirmation email
  await sendConfirmationEmail(subscriber);
  
  return subscriber;
};

// Generate tags based on subscription data
const generateTags = (data: SubscriptionData): string[] => {
  const tags: string[] = [];
  
  // Location-based tags
  if (data.location?.country) {
    tags.push(`country-${data.location.country.toLowerCase()}`);
  }
  if (data.location?.city) {
    tags.push(`city-${data.location.city.toLowerCase().replace(/\s+/g, '-')}`);
  }
  
  // Source-based tags
  if (data.source) {
    tags.push(`source-${data.source}`);
  }
  
  // Interest-based tags
  if (data.interests) {
    tags.push(...data.interests.map(interest => `interest-${interest}`));
  }
  
  // Default tags
  tags.push('new-subscriber', 'website-signup');
  
  return [...new Set(tags)]; // Remove duplicates
};

// Send confirmation email (mock implementation)
const sendConfirmationEmail = async (subscriber: any) => {
  // In production, send actual confirmation email
  console.info('Confirmation email sent to:', subscriber.email);
  
  const emailContent = {
    to: subscriber.email,
    subject: 'Welcome to Zoptal\'s Newsletter! Please confirm your subscription',
    template: 'newsletter-confirmation',
    data: {
      name: subscriber.name || 'there',
      confirmationUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/newsletter/confirm/${subscriber.id}`,
      interests: subscriber.interests,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/newsletter/unsubscribe/${subscriber.id}`
    }
  };
  
  // Mock sending
  console.info('Email content:', emailContent);
};

// Update existing subscriber preferences
const updateSubscriber = async (email: string, data: SubscriptionData): Promise<any> => {
  console.info('Updating subscriber preferences:', email, data);
  
  const updatedSubscriber = {
    email,
    name: data.name,
    interests: data.interests || ['product-updates'],
    updatedAt: new Date().toISOString(),
    tags: generateTags(data)
  };
  
  return updatedSubscriber;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = subscriptionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }
    
    const subscriptionData = validationResult.data;
    
    // Rate limiting check (simple IP-based)
    const userIP = request.headers.get('x-forwarded-for') || 'unknown';
    // In production, implement proper rate limiting
    
    // Check if email already exists
    const existingCheck = await checkExistingSubscription(subscriptionData.email);
    
    let subscriber;
    let message;
    
    if (existingCheck.exists) {
      // Update existing subscriber
      subscriber = await updateSubscriber(subscriptionData.email, subscriptionData);
      message = 'Your preferences have been updated successfully!';
    } else {
      // Add new subscriber
      subscriber = await addSubscriber(subscriptionData);
      message = 'Thank you for subscribing! Please check your email to confirm your subscription.';
    }
    
    // Track analytics event
    console.info('Newsletter subscription:', {
      email: subscriptionData.email,
      source: subscriptionData.source,
      location: subscriptionData.location?.city,
      interests: subscriptionData.interests,
      isNew: !existingCheck.exists,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message,
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        status: subscriber.status,
        interests: subscriber.interests
      },
      nextSteps: existingCheck.exists 
        ? ['Your preferences have been updated', 'You\'ll continue receiving our newsletter']
        : ['Check your email for confirmation', 'Click the confirmation link to complete subscription', 'Add hello@zoptal.com to your contacts']
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process subscription',
        message: 'Please try again or contact us at hello@zoptal.com'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const subscriberId = searchParams.get('id');
    
    if (!email && !subscriberId) {
      return NextResponse.json(
        { error: 'Email or subscriber ID required' },
        { status: 400 }
      );
    }
    
    // Unsubscribe user (mock implementation)
    console.info('Unsubscribing:', email || subscriberId);
    
    // In production, update database record
    const unsubscribeResult = {
      email: email || 'unknown',
      unsubscribedAt: new Date().toISOString(),
      status: 'unsubscribed'
    };
    
    // Send farewell email (optional)
    console.info('Farewell email sent');
    
    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter.',
      data: unsubscribeResult
    });
    
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if (action === 'topics') {
    return NextResponse.json({
      topics: NEWSLETTER_TOPICS.map(topic => ({
        id: topic,
        name: topic.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        description: `Stay updated on ${topic.replace('-', ' ')}`
      }))
    });
  }
  
  return NextResponse.json({
    message: 'Newsletter API',
    version: '1.0.0',
    endpoints: {
      'POST /api/newsletter': 'Subscribe to newsletter',
      'DELETE /api/newsletter?email=...': 'Unsubscribe from newsletter',
      'GET /api/newsletter?action=topics': 'Get available newsletter topics'
    },
    statistics: {
      totalSubscribers: '10,000+',
      openRate: '45%',
      clickRate: '12%'
    }
  });
}