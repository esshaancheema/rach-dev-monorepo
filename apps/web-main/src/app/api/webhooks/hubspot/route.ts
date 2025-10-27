import { NextRequest, NextResponse } from 'next/server';
import { getCRMManager } from '@/lib/crm/manager';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hubspot-signature-v3');
    
    // Verify webhook signature
    if (process.env.HUBSPOT_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.HUBSPOT_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (`sha256=${expectedSignature}` !== signature) {
        console.error('Invalid HubSpot webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const webhookData = JSON.parse(body);
    
    // Process the webhook
    const crmManager = getCRMManager();
    const result = await crmManager.processWebhook(webhookData, 'hubspot');

    if (result.success) {
      return NextResponse.json({ status: 'processed' });
    } else {
      console.error('HubSpot webhook processing failed:', result.error);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }

  } catch (error) {
    console.error('HubSpot webhook error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json({ status: 'HubSpot webhook endpoint' });
}