import { NextRequest, NextResponse } from 'next/server';
import { getCRMManager } from '@/lib/crm/manager';

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json();
    
    // Basic authentication check (you may want to implement more robust auth)
    const authHeader = request.headers.get('authorization');
    if (process.env.SALESFORCE_WEBHOOK_SECRET && authHeader !== `Bearer ${process.env.SALESFORCE_WEBHOOK_SECRET}`) {
      console.error('Invalid Salesforce webhook authorization');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process the webhook
    const crmManager = getCRMManager();
    const result = await crmManager.processWebhook(webhookData, 'salesforce');

    if (result.success) {
      return NextResponse.json({ status: 'processed' });
    } else {
      console.error('Salesforce webhook processing failed:', result.error);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }

  } catch (error) {
    console.error('Salesforce webhook error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Salesforce webhook endpoint' });
}