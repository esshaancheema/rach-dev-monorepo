import { NextRequest, NextResponse } from 'next/server';
import { emailAutomation } from '@/lib/email/automation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const provider = request.headers.get('x-email-provider') || 'unknown';
    
    console.info(`Email webhook received from ${provider}:`, body);

    // Handle different provider webhook formats
    switch (provider) {
      case 'sendgrid':
        await handleSendGridWebhook(body);
        break;
      case 'resend':
        await handleResendWebhook(body);
        break;
      case 'ses':
        await handleSESWebhook(body);
        break;
      default:
        await handleGenericWebhook(body);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Email webhook error:', error);
    return NextResponse.json({
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleSendGridWebhook(events: any[]) {
  for (const event of events) {
    const recipientId = extractRecipientId(event.email);
    if (!recipientId) continue;

    switch (event.event) {
      case 'delivered':
        console.info(`Email delivered to ${event.email}`);
        break;
      
      case 'open':
        await emailAutomation.handleEmailEvent(recipientId, 'opened', {
          timestamp: event.timestamp,
          userAgent: event.useragent,
          ip: event.ip
        });
        break;
      
      case 'click':
        await emailAutomation.handleEmailEvent(recipientId, 'clicked', {
          timestamp: event.timestamp,
          url: event.url,
          userAgent: event.useragent,
          ip: event.ip
        });
        break;
      
      case 'bounce':
        await emailAutomation.handleEmailEvent(recipientId, 'bounced', {
          timestamp: event.timestamp,
          reason: event.reason,
          type: event.type
        });
        break;
      
      case 'unsubscribe':
        await emailAutomation.handleEmailEvent(recipientId, 'unsubscribed', {
          timestamp: event.timestamp
        });
        break;
    }
  }
}

async function handleResendWebhook(event: any) {
  const recipientId = extractRecipientId(event.data?.to);
  if (!recipientId) return;

  switch (event.type) {
    case 'email.delivered':
      console.info(`Email delivered to ${event.data.to}`);
      break;
    
    case 'email.opened':
      await emailAutomation.handleEmailEvent(recipientId, 'opened', {
        timestamp: event.created_at,
        ...event.data
      });
      break;
    
    case 'email.clicked':
      await emailAutomation.handleEmailEvent(recipientId, 'clicked', {
        timestamp: event.created_at,
        url: event.data.url,
        ...event.data
      });
      break;
    
    case 'email.bounced':
      await emailAutomation.handleEmailEvent(recipientId, 'bounced', {
        timestamp: event.created_at,
        reason: event.data.reason,
        ...event.data
      });
      break;
  }
}

async function handleSESWebhook(message: any) {
  // AWS SES sends SNS notifications
  const eventType = message.eventType;
  const mail = message.mail;
  const recipientId = extractRecipientId(mail?.destination?.[0]);
  
  if (!recipientId) return;

  switch (eventType) {
    case 'delivery':
      console.info(`Email delivered via SES to ${mail.destination[0]}`);
      break;
    
    case 'open':
      await emailAutomation.handleEmailEvent(recipientId, 'opened', {
        timestamp: message.open?.timestamp,
        userAgent: message.open?.userAgent,
        ipAddress: message.open?.ipAddress
      });
      break;
    
    case 'click':
      await emailAutomation.handleEmailEvent(recipientId, 'clicked', {
        timestamp: message.click?.timestamp,
        url: message.click?.link,
        userAgent: message.click?.userAgent,
        ipAddress: message.click?.ipAddress
      });
      break;
    
    case 'bounce':
      await emailAutomation.handleEmailEvent(recipientId, 'bounced', {
        timestamp: message.bounce?.timestamp,
        bounceType: message.bounce?.bounceType,
        bounceSubType: message.bounce?.bounceSubType
      });
      break;
  }
}

async function handleGenericWebhook(data: any) {
  // Handle generic webhook format
  console.info('Generic webhook data:', data);
  
  // Try to extract common fields
  const email = data.email || data.to || data.recipient;
  const eventType = data.event || data.type || data.eventType;
  
  if (!email || !eventType) {
    console.warn('Missing required fields in webhook data');
    return;
  }

  const recipientId = extractRecipientId(email);
  if (!recipientId) return;

  // Map generic event types to our internal events
  const eventMap: Record<string, string> = {
    'delivered': 'delivered',
    'open': 'opened',
    'opened': 'opened',
    'click': 'clicked',
    'clicked': 'clicked',
    'bounce': 'bounced',
    'bounced': 'bounced',
    'unsubscribe': 'unsubscribed',
    'unsubscribed': 'unsubscribed'
  };

  const mappedEvent = eventMap[eventType.toLowerCase()];
  if (!mappedEvent || mappedEvent === 'delivered') return;

  await emailAutomation.handleEmailEvent(recipientId as any, mappedEvent as any, {
    timestamp: data.timestamp || new Date().toISOString(),
    ...data
  });
}

function extractRecipientId(email: string): string | null {
  if (!email) return null;
  
  // In a real implementation, you would:
  // 1. Query your database to find the recipient by email
  // 2. Return the recipient ID
  
  // For demo purposes, generate a mock ID based on email
  return `recipient_${Buffer.from(email).toString('base64').slice(0, 10)}`;
}

// Webhook validation (implement based on your provider)
function validateWebhookSignature(
  request: NextRequest,
  body: string,
  provider: string
): boolean {
  // Implement signature validation based on provider
  // This is crucial for security in production
  
  switch (provider) {
    case 'sendgrid':
      // Validate SendGrid signature
      return true; // Simplified for demo
    
    case 'resend':
      // Validate Resend signature
      return true; // Simplified for demo
    
    case 'ses':
      // Validate AWS SNS signature
      return true; // Simplified for demo
    
    default:
      return false;
  }
}