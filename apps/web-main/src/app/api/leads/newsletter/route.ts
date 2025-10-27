import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCRMManager } from '@/lib/crm/manager';
import { emailAutomation } from '@/lib/email/automation';
import { EmailRecipient } from '@/lib/email/types';
import { getWelcomeTemplateByType } from '@/lib/email/welcome-templates';

// Newsletter subscription schema
const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  interests: z.array(z.string()).optional(),
  source: z.string().optional(),
  // Anti-spam fields
  honeypot: z.string().optional(),
  timestamp: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the form data
    const validatedData = newsletterSchema.parse(body);
    
    // Anti-spam checks
    if (validatedData.honeypot) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }
    
    // Check timestamp to prevent rapid submissions
    if (validatedData.timestamp) {
      const submissionTime = Date.now() - validatedData.timestamp;
      if (submissionTime < 2000) { // Less than 2 seconds
        return NextResponse.json({ error: 'Submission too fast' }, { status: 400 });
      }
    }
    
    // Check if email already exists
    const existingSubscriber = await checkExistingSubscriber(validatedData.email);
    if (existingSubscriber) {
      return NextResponse.json({
        success: true,
        message: 'You\'re already subscribed to our newsletter!',
        status: 'existing',
      });
    }
    
    // Get client information
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || 'direct';
    
    // Create subscriber data
    const subscriberData = {
      ...validatedData,
      id: generateSubscriberId(),
      status: 'pending', // Email confirmation required
      subscribedAt: new Date().toISOString(),
      metadata: {
        ip: clientIP,
        userAgent,
        referer,
        source: validatedData.source || 'website',
      },
      interests: validatedData.interests || ['general'],
    };
    
    // Store subscriber in database
    await storeSubscriber(subscriberData);
    
    // Create email recipient for automation
    const emailRecipient: EmailRecipient = {
      id: subscriberData.id,
      email: validatedData.email,
      firstName: validatedData.name?.split(' ')[0],
      lastName: validatedData.name?.split(' ').slice(1).join(' ') || undefined,
      source: 'newsletter_signup',
      status: 'active',
      tags: ['newsletter', 'subscriber', ...(validatedData.interests || [])],
      customFields: {
        interests: validatedData.interests || ['general'],
        subscriptionSource: subscriberData.metadata.source
      },
      segments: ['new-leads'],
      emailActivity: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Send confirmation email
    await sendConfirmationEmail(subscriberData);
    
    // Process through CRM
    const crmManager = getCRMManager();
    const crmResult = await crmManager.processNewsletterSubscription(subscriberData);
    
    // Add to email marketing platform (legacy)
    await addToEmailPlatform(subscriberData);

    // Subscribe to newsletter welcome sequence (will be sent after confirmation)
    const emailVariables = {
      firstName: emailRecipient.firstName || 'there',
      subscriberCount: '5000',
      interests: validatedData.interests?.join(', ') || 'Software Development'
    };

    // Store recipient for later activation after email confirmation
    await storeEmailRecipientForConfirmation(emailRecipient, emailVariables);
    
    // Track subscription event
    await trackSubscriptionEvent({
      event: 'newsletter_signup',
      email: subscriberData.email,
      source: subscriberData.metadata.source,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing! Please check your email to confirm your subscription.',
      subscriberId: subscriberData.id,
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Unable to process your subscription. Please try again later.',
    }, { status: 500 });
  }
}

// Unsubscribe endpoint
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    
    if (!email || !token) {
      return NextResponse.json({
        error: 'Missing email or token',
      }, { status: 400 });
    }
    
    // Verify unsubscribe token
    const isValidToken = await verifyUnsubscribeToken(email, token);
    if (!isValidToken) {
      return NextResponse.json({
        error: 'Invalid unsubscribe token',
      }, { status: 400 });
    }
    
    // Update subscriber status
    await updateSubscriberStatus(email, 'unsubscribed');
    
    // Remove from email marketing platform
    await removeFromEmailPlatform(email);
    
    // Track unsubscribe event
    await trackSubscriptionEvent({
      event: 'newsletter_unsubscribe',
      email,
      source: 'unsubscribe_link',
    });
    
    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter.',
    });
    
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Unable to process unsubscribe request. Please try again later.',
    }, { status: 500 });
  }
}

// Email confirmation endpoint
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    
    if (!email || !token) {
      return NextResponse.json({
        error: 'Missing email or token',
      }, { status: 400 });
    }
    
    // Verify confirmation token
    const isValidToken = await verifyConfirmationToken(email, token);
    if (!isValidToken) {
      return NextResponse.json({
        error: 'Invalid confirmation token',
      }, { status: 400 });
    }
    
    // Update subscriber status to confirmed
    await updateSubscriberStatus(email, 'confirmed');
    
    // Update email marketing platform
    await updateEmailPlatformStatus(email, 'confirmed');
    
    // Track confirmation event
    await trackSubscriptionEvent({
      event: 'newsletter_confirmed',
      email,
      source: 'confirmation_link',
    });
    
    // Activate email automation for confirmed subscriber
    await activateEmailAutomationForSubscriber(email);
    
    return NextResponse.json({
      success: true,
      message: 'Your email has been confirmed! Welcome to our newsletter.',
    });
    
  } catch (error) {
    console.error('Newsletter confirmation error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Unable to confirm subscription. Please try again later.',
    }, { status: 500 });
  }
}

// Helper functions
function generateSubscriberId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function checkExistingSubscriber(email: string): Promise<boolean> {
  // Implement database check for existing subscriber
  console.info('Checking existing subscriber:', email);
  
  // Example implementation
  // const subscriber = await db.subscribers.findOne({ email });
  // return !!subscriber;
  
  return false; // Placeholder
}

async function storeSubscriber(subscriberData: any): Promise<void> {
  // Implement database storage logic
  console.info('Storing subscriber:', subscriberData.id);
  
  // Example with a hypothetical database client
  // await db.subscribers.create(subscriberData);
}

async function sendConfirmationEmail(subscriberData: any): Promise<void> {
  // Generate confirmation token
  const confirmationToken = generateConfirmationToken(subscriberData.email);
  const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/leads/newsletter?email=${encodeURIComponent(subscriberData.email)}&token=${confirmationToken}`;
  
  const emailTemplate = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Zoptal!</h1>
        </div>
        
        <div style="padding: 40px 20px;">
          <h2>Confirm Your Subscription</h2>
          <p>Hi ${subscriberData.name || 'there'},</p>
          <p>Thank you for subscribing to the Zoptal newsletter! To complete your subscription, please click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Confirm Subscription
            </a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${confirmationUrl}</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="font-size: 14px; color: #666;">
            You're receiving this email because you signed up for our newsletter at zoptal.com.
            If you didn't sign up, you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;
  
  // Send email using your email service
  console.info('Sending confirmation email to:', subscriberData.email);
  
  // Example with hypothetical email service
  // await emailService.send({
  //   to: subscriberData.email,
  //   subject: 'Confirm your Zoptal newsletter subscription',
  //   html: emailTemplate,
  // });
}

async function sendWelcomeEmail(email: string): Promise<void> {
  const emailTemplate = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Zoptal!</h1>
        </div>
        
        <div style="padding: 40px 20px;">
          <h2>You're All Set!</h2>
          <p>Welcome to the Zoptal community! You'll now receive our latest updates on:</p>
          
          <ul style="padding-left: 20px;">
            <li>Software development best practices</li>
            <li>Technology trends and insights</li>
            <li>Case studies and success stories</li>
            <li>Product updates and new services</li>
            <li>Exclusive content and resources</li>
          </ul>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 30px 0;">
            <h3 style="margin-top: 0;">What's Next?</h3>
            <p>🚀 Check out our <a href="${process.env.NEXT_PUBLIC_BASE_URL}/blog">latest blog posts</a></p>
            <p>💼 Explore our <a href="${process.env.NEXT_PUBLIC_BASE_URL}/services">services</a></p>
            <p>📞 Schedule a <a href="${process.env.NEXT_PUBLIC_BASE_URL}/contact">free consultation</a></p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="font-size: 14px; color: #666;">
            You can <a href="${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}">unsubscribe</a> at any time.
          </p>
        </div>
      </body>
    </html>
  `;
  
  console.info('Sending welcome email to:', email);
  
  // Example with hypothetical email service
  // await emailService.send({
  //   to: email,
  //   subject: 'Welcome to Zoptal Newsletter!',
  //   html: emailTemplate,
  // });
}

async function addToEmailPlatform(subscriberData: any): Promise<void> {
  // Add subscriber to email marketing platform (Mailchimp, ConvertKit, etc.)
  console.info('Adding subscriber to email platform:', subscriberData.email);
  
  // Example Mailchimp integration
  if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
    try {
      const mailchimpData = {
        email_address: subscriberData.email,
        status: 'pending', // Will be confirmed via email
        merge_fields: {
          FNAME: subscriberData.name?.split(' ')[0] || '',
          LNAME: subscriberData.name?.split(' ').slice(1).join(' ') || '',
        },
        interests: subscriberData.interests.reduce((acc: any, interest: string) => {
          // Map interests to Mailchimp interest IDs
          const interestIds: Record<string, string> = {
            'general': 'interest_id_1',
            'development': 'interest_id_2',
            'ai': 'interest_id_3',
          };
          if (interestIds[interest]) {
            acc[interestIds[interest]] = true;
          }
          return acc;
        }, {}),
        tags: [subscriberData.metadata.source],
      };
      
      await fetch(`https://us1.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
        },
        body: JSON.stringify(mailchimpData),
      });
    } catch (error) {
      console.error('Failed to add subscriber to Mailchimp:', error);
    }
  }
}

async function updateSubscriberStatus(email: string, status: string): Promise<void> {
  // Update subscriber status in database
  console.info('Updating subscriber status:', email, status);
  
  // Example implementation
  // await db.subscribers.updateOne(
  //   { email },
  //   { $set: { status, updatedAt: new Date().toISOString() } }
  // );
}

async function removeFromEmailPlatform(email: string): Promise<void> {
  // Remove subscriber from email marketing platform
  console.info('Removing subscriber from email platform:', email);
  
  // Example Mailchimp unsubscribe
  if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
    try {
      const emailHash = await hashEmail(email);
      await fetch(`https://us1.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members/${emailHash}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
        },
        body: JSON.stringify({ status: 'unsubscribed' }),
      });
    } catch (error) {
      console.error('Failed to unsubscribe from Mailchimp:', error);
    }
  }
}

async function updateEmailPlatformStatus(email: string, status: string): Promise<void> {
  // Update subscriber status in email marketing platform
  console.info('Updating email platform status:', email, status);
  
  // Example Mailchimp confirmation
  if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
    try {
      const emailHash = await hashEmail(email);
      await fetch(`https://us1.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members/${emailHash}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
        },
        body: JSON.stringify({ status: 'subscribed' }),
      });
    } catch (error) {
      console.error('Failed to update Mailchimp status:', error);
    }
  }
}

function generateConfirmationToken(email: string): string {
  // Generate a secure token for email confirmation
  const crypto = require('crypto');
  return crypto.createHmac('sha256', process.env.EMAIL_SECRET || 'fallback-secret')
    .update(email + Date.now())
    .digest('hex');
}

async function verifyConfirmationToken(email: string, token: string): Promise<boolean> {
  // Verify confirmation token
  // In production, you'd want to store tokens with expiration times
  console.info('Verifying confirmation token for:', email);
  return true; // Placeholder - implement proper token verification
}

async function verifyUnsubscribeToken(email: string, token: string): Promise<boolean> {
  // Verify unsubscribe token
  console.info('Verifying unsubscribe token for:', email);
  return true; // Placeholder - implement proper token verification
}

async function hashEmail(email: string): Promise<string> {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
}

async function trackSubscriptionEvent(event: any): Promise<void> {
  // Track subscription events in analytics
  console.info('Tracking subscription event:', event);
  
  // Example Google Analytics 4 event tracking
  if (process.env.GA_MEASUREMENT_ID) {
    try {
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: event.email,
          events: [
            {
              name: event.event,
              parameters: {
                email: event.email,
                source: event.source,
              },
            },
          ],
        }),
      });
    } catch (error) {
      console.error('Failed to track subscription event:', error);
    }
  }
}

// Email automation helper functions
async function storeEmailRecipientForConfirmation(
  recipient: EmailRecipient, 
  variables: Record<string, any>
): Promise<void> {
  // Store recipient data for activation after email confirmation
  // In a real implementation, this would store in a database with pending status
  console.info('Storing email recipient for confirmation:', recipient.email);
  
  // Example database storage
  // await db.emailRecipients.create({
  //   ...recipient,
  //   status: 'pending_confirmation',
  //   automationVariables: variables
  // });
}

async function activateEmailAutomationForSubscriber(email: string): Promise<void> {
  // Retrieve stored recipient data and activate email automation
  console.info('Activating email automation for:', email);
  
  try {
    // In a real implementation, retrieve from database
    // const recipientData = await db.emailRecipients.findOne({ 
    //   email, 
    //   status: 'pending_confirmation' 
    // });
    
    // Mock recipient data for demonstration
    const recipientData = {
      id: `recipient_${Date.now()}`,
      email,
      firstName: 'Subscriber',
      source: 'newsletter_signup',
      status: 'active' as const,
      tags: ['newsletter', 'subscriber'],
      customFields: {},
      segments: ['new-leads'],
      emailActivity: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const emailVariables = {
      firstName: recipientData.firstName || 'there',
      subscriberCount: '5000',
      interests: 'Software Development'
    };

    // Subscribe to newsletter welcome email sequence
    await emailAutomation.subscribeToSequence(
      recipientData,
      'newsletter-welcome', // This sequence ID should be created
      emailVariables
    );

    // Update status to confirmed in database
    // await db.emailRecipients.updateOne(
    //   { email },
    //   { $set: { status: 'confirmed', confirmedAt: new Date().toISOString() } }
    // );

    console.info('Email automation activated for:', email);
  } catch (error) {
    console.error('Failed to activate email automation:', error);
  }
}