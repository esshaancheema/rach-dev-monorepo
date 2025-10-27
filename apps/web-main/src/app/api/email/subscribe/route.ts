import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailAutomation } from '@/lib/email/automation';
import { EmailRecipient } from '@/lib/email/types';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  source: z.string().default('api'),
  sequenceId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.any()).default({}),
  variables: z.record(z.any()).default({})
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = subscribeSchema.parse(body);

    // Check if recipient already exists (in real implementation, check database)
    const existingRecipient = await findRecipientByEmail(data.email);
    
    let recipient: EmailRecipient;
    
    if (existingRecipient) {
      // Update existing recipient
      recipient = {
        ...existingRecipient,
        firstName: data.firstName || existingRecipient.firstName,
        lastName: data.lastName || existingRecipient.lastName,
        company: data.company || existingRecipient.company,
        phone: data.phone || existingRecipient.phone,
        tags: Array.from(new Set([...existingRecipient.tags, ...data.tags])),
        customFields: { ...existingRecipient.customFields, ...data.customFields },
        updatedAt: new Date().toISOString()
      };
    } else {
      // Create new recipient
      recipient = {
        id: generateRecipientId(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        phone: data.phone,
        source: data.source,
        status: 'active',
        tags: data.tags,
        customFields: data.customFields,
        segments: determineSegments(data),
        emailActivity: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // Save recipient (in real implementation, save to database)
    await saveRecipient(recipient);

    // Subscribe to sequence if specified
    if (data.sequenceId) {
      const subscribed = await emailAutomation.subscribeToSequence(
        recipient,
        data.sequenceId,
        data.variables
      );

      if (!subscribed) {
        return NextResponse.json({
          error: 'Failed to subscribe to email sequence',
          details: `Sequence ${data.sequenceId} not found or recipient doesn't match criteria`
        }, { status: 400 });
      }
    } else {
      // Subscribe to default welcome sequence for new leads
      await emailAutomation.subscribeToSequence(
        recipient,
        'welcome-series',
        data.variables
      );
    }

    // Track the subscription event
    await trackSubscriptionEvent(recipient, data.sequenceId || 'welcome-series', data.source);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to email sequence',
      recipient: {
        id: recipient.id,
        email: recipient.email,
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        company: recipient.company
      },
      sequenceId: data.sequenceId || 'welcome-series'
    });

  } catch (error) {
    console.error('Email subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid input data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to process email subscription'
    }, { status: 500 });
  }
}

// Helper functions (in real implementation, these would interact with your database)

async function findRecipientByEmail(email: string): Promise<EmailRecipient | null> {
  // Mock implementation - in real app, query database
  console.info(`Searching for recipient with email: ${email}`);
  return null; // Assume new recipient for demo
}

async function saveRecipient(recipient: EmailRecipient): Promise<void> {
  // Mock implementation - in real app, save to database
  console.info('Saving recipient:', {
    id: recipient.id,
    email: recipient.email,
    firstName: recipient.firstName,
    company: recipient.company
  });
}

function generateRecipientId(): string {
  return `recipient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function determineSegments(data: any): string[] {
  const segments: string[] = ['new-leads'];
  
  // Auto-assign segments based on data
  if (data.company && data.customFields?.companySize && data.customFields.companySize > 500) {
    segments.push('enterprise-prospects');
  }
  
  if (data.customFields?.industry === 'fintech' || 
      data.customFields?.projectType?.includes('financial')) {
    segments.push('fintech-leads');
  }
  
  if (data.customFields?.companyStage === 'startup' || 
      data.tags?.includes('startup')) {
    segments.push('startup-founders');
  }
  
  return segments;
}

async function trackSubscriptionEvent(
  recipient: EmailRecipient,
  sequenceId: string,
  source: string
): Promise<void> {
  // Mock implementation - in real app, save to analytics
  console.info('Subscription event tracked:', {
    recipientId: recipient.id,
    sequenceId,
    source,
    timestamp: new Date().toISOString()
  });
}