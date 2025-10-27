import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCRMManager } from '@/lib/crm/manager';
import { emailAutomation } from '@/lib/email/automation';
import { EmailRecipient } from '@/lib/email/types';

// Contact form schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  source: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  urgency: z.enum(['immediate', 'within_month', 'within_quarter', 'exploring']).optional(),
  // Anti-spam fields
  honeypot: z.string().optional(),
  timestamp: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the form data
    const validatedData = contactFormSchema.parse(body);
    
    // Anti-spam checks
    if (validatedData.honeypot) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }
    
    // Check timestamp to prevent rapid submissions
    if (validatedData.timestamp) {
      const submissionTime = Date.now() - validatedData.timestamp;
      if (submissionTime < 3000) { // Less than 3 seconds
        return NextResponse.json({ error: 'Submission too fast' }, { status: 400 });
      }
    }
    
    // Get client information
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || 'direct';
    
    // Create lead data
    const leadData = {
      ...validatedData,
      id: generateLeadId(),
      status: 'new',
      score: calculateLeadScore(validatedData),
      metadata: {
        ip: clientIP,
        userAgent,
        referer,
        submittedAt: new Date().toISOString(),
        source: validatedData.source || 'website',
      },
    };
    
    // Store lead in database (implement your database logic here)
    await storeLead(leadData);
    
    // Process through CRM
    const crmManager = getCRMManager();
    const crmResult = await crmManager.processContactForm(leadData);
    
    // Create email recipient for automation
    const emailRecipient: EmailRecipient = {
      id: leadData.id,
      email: leadData.email,
      firstName: leadData.name.split(' ')[0],
      lastName: leadData.name.split(' ').slice(1).join(' ') || undefined,
      company: leadData.company,
      phone: leadData.phone,
      source: 'contact_form',
      status: 'active',
      tags: ['contact_form', 'new_lead'],
      customFields: {
        projectType: leadData.service,
        industry: leadData.industry,
        budget: leadData.budget,
        urgency: leadData.urgency,
        leadScore: leadData.score,
        message: leadData.message
      },
      segments: determineEmailSegments(leadData),
      emailActivity: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Subscribe to welcome sequence for consultation requests
    const emailVariables = {
      firstName: emailRecipient.firstName || 'there',
      requestId: `REQ-${Date.now().toString().slice(-6)}`,
      submissionDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      projectType: leadData.service || 'Custom Development',
      industry: leadData.industry || 'Not specified',
      timeline: getTimelineFromUrgency(leadData.urgency),
      budgetRange: getBudgetRangeDisplay(leadData.budget),
      specialRequirements: getSpecialRequirements(leadData)
    };

    // Send notifications and start email automation
    await Promise.all([
      sendSlackNotification(leadData),
      sendEmailNotification(leadData),
      emailAutomation.subscribeToSequence(
        emailRecipient, 
        getEmailSequenceForLead(leadData), 
        emailVariables
      )
    ]);
    
    // Track conversion event
    await trackConversionEvent({
      event: 'lead_submitted',
      leadId: leadData.id,
      source: leadData.metadata.source,
      value: estimateLeadValue(leadData),
    });
    
    return NextResponse.json({
      success: true,
      leadId: leadData.id,
      contactId: crmResult.contactId,
      dealId: crmResult.dealId,
      message: 'Thank you for your inquiry! We\'ll get back to you within 24 hours.',
      crmErrors: crmResult.errors.length > 0 ? crmResult.errors : undefined,
    });
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Unable to process your request. Please try again later.',
    }, { status: 500 });
  }
}

// Helper functions
function generateLeadId(): string {
  return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateLeadScore(data: any): number {
  let score = 0;
  
  // Company provided
  if (data.company) score += 20;
  
  // Phone provided
  if (data.phone) score += 15;
  
  // Budget information
  if (data.budget) {
    const budgetScore = {
      'under_10k': 10,
      '10k_25k': 20,
      '25k_50k': 30,
      '50k_100k': 40,
      '100k_plus': 50,
    }[data.budget] || 0;
    score += budgetScore;
  }
  
  // Service specified
  if (data.service) score += 10;
  
  // Location provided
  if (data.location) score += 5;
  
  // Industry provided
  if (data.industry) score += 10;
  
  // Urgency
  if (data.urgency) {
    const urgencyScore = {
      'immediate': 30,
      'within_month': 20,
      'within_quarter': 10,
      'exploring': 5,
    }[data.urgency] || 0;
    score += urgencyScore;
  }
  
  // Message quality (longer messages get higher scores)
  if (data.message) {
    const messageLength = data.message.length;
    if (messageLength > 100) score += 10;
    if (messageLength > 200) score += 5;
  }
  
  return Math.min(score, 100);
}

async function storeLead(leadData: any): Promise<void> {
  // Implement database storage logic
  // This could be MongoDB, PostgreSQL, or any other database
  console.info('Storing lead:', leadData.id);
  
  // Example with a hypothetical database client
  // await db.leads.create(leadData);
}

async function sendSlackNotification(leadData: any): Promise<void> {
  if (!process.env.SLACK_WEBHOOK_URL) return;
  
  const slackMessage = {
    text: `🎯 New Lead Submission!`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎯 New Lead Submission!'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Name:* ${leadData.name}`
          },
          {
            type: 'mrkdwn',
            text: `*Email:* ${leadData.email}`
          },
          {
            type: 'mrkdwn',
            text: `*Company:* ${leadData.company || 'Not provided'}`
          },
          {
            type: 'mrkdwn',
            text: `*Lead Score:* ${leadData.score}/100`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Message:* ${leadData.message}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Lead ID: ${leadData.id} | Source: ${leadData.metadata.source} | IP: ${leadData.metadata.ip}`
          }
        ]
      }
    ]
  };
  
  try {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    });
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

async function sendEmailNotification(leadData: any): Promise<void> {
  // Implement email notification logic
  // This could use SendGrid, AWS SES, or any other email service
  console.info('Sending email notification for lead:', leadData.id);
  
  // Example email template
  const emailTemplate = `
    New lead submission from ${leadData.name}
    
    Email: ${leadData.email}
    Company: ${leadData.company || 'Not provided'}
    Phone: ${leadData.phone || 'Not provided'}
    Service: ${leadData.service || 'Not specified'}
    Budget: ${leadData.budget || 'Not specified'}
    
    Message:
    ${leadData.message}
    
    Lead Score: ${leadData.score}/100
    Source: ${leadData.metadata.source}
    Submitted: ${leadData.metadata.submittedAt}
  `;
  
  // Send email to sales team
  // await emailService.send({
  //   to: process.env.SALES_EMAIL,
  //   subject: `New Lead: ${leadData.name} (Score: ${leadData.score})`,
  //   text: emailTemplate,
  // });
}

async function addToCRM(leadData: any): Promise<void> {
  // Implement CRM integration (HubSpot, Salesforce, etc.)
  console.info('Adding lead to CRM:', leadData.id);
  
  // Example HubSpot integration
  if (process.env.HUBSPOT_API_KEY) {
    try {
      await fetch('https://api.hubapi.com/contacts/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify({
          properties: [
            { property: 'email', value: leadData.email },
            { property: 'firstname', value: leadData.name.split(' ')[0] },
            { property: 'lastname', value: leadData.name.split(' ').slice(1).join(' ') },
            { property: 'company', value: leadData.company || '' },
            { property: 'phone', value: leadData.phone || '' },
            { property: 'message', value: leadData.message },
            { property: 'lead_score', value: leadData.score },
            { property: 'lead_source', value: leadData.metadata.source },
          ],
        }),
      });
    } catch (error) {
      console.error('Failed to add lead to HubSpot:', error);
    }
  }
}

async function trackConversionEvent(event: any): Promise<void> {
  // Implement analytics tracking
  console.info('Tracking conversion event:', event);
  
  // Example Google Analytics 4 event tracking
  if (process.env.GA_MEASUREMENT_ID) {
    try {
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: event.leadId,
          events: [
            {
              name: event.event,
              parameters: {
                lead_id: event.leadId,
                lead_source: event.source,
                lead_value: event.value,
                currency: 'USD',
              },
            },
          ],
        }),
      });
    } catch (error) {
      console.error('Failed to track conversion event:', error);
    }
  }
}

function estimateLeadValue(leadData: any): number {
  // Estimate potential lead value based on budget and other factors
  const budgetValues = {
    'under_10k': 7500,
    '10k_25k': 17500,
    '25k_50k': 37500,
    '50k_100k': 75000,
    '100k_plus': 150000,
  };
  
  const baseValue = budgetValues[leadData.budget as keyof typeof budgetValues] || 25000;
  
  // Adjust based on lead score
  const scoreMultiplier = leadData.score / 100;
  
  return Math.round(baseValue * scoreMultiplier);
}

// Email automation helper functions
function determineEmailSegments(leadData: any): string[] {
  const segments: string[] = ['new-leads'];
  
  // Enterprise prospects
  if (leadData.budget === '100k_plus' || 
      (leadData.company && leadData.customFields?.companySize > 500)) {
    segments.push('enterprise-prospects');
  }
  
  // Startup founders
  if (leadData.customFields?.companyStage === 'startup' || 
      leadData.message?.toLowerCase().includes('startup') ||
      leadData.message?.toLowerCase().includes('mvp')) {
    segments.push('startup-founders');
  }
  
  // FinTech leads
  if (leadData.industry === 'fintech' || 
      leadData.service?.includes('fintech') ||
      leadData.message?.toLowerCase().includes('payment') ||
      leadData.message?.toLowerCase().includes('banking')) {
    segments.push('fintech-leads');
  }
  
  return segments;
}

function getEmailSequenceForLead(leadData: any): string {
  // High-value enterprise leads get specialized sequence
  if (leadData.budget === '100k_plus' || leadData.score > 80) {
    return 'enterprise-nurture';
  }
  
  // FinTech industry gets specialized sequence
  if (leadData.industry === 'fintech' || 
      leadData.service?.includes('fintech')) {
    return 'fintech-specialized';
  }
  
  // Startup founders get specialized sequence
  if (leadData.message?.toLowerCase().includes('startup') ||
      leadData.message?.toLowerCase().includes('mvp')) {
    return 'startup-nurture';
  }
  
  // Default welcome series for all other leads
  return 'welcome-series';
}

function getTimelineFromUrgency(urgency?: string): string {
  const timelineMap = {
    'immediate': 'ASAP',
    'within_month': '2-4 weeks',
    'within_quarter': '2-3 months',
    'exploring': '3-6 months'
  };
  
  return timelineMap[urgency as keyof typeof timelineMap] || 'To be discussed';
}

function getBudgetRangeDisplay(budget?: string): string {
  const budgetMap = {
    'under_10k': 'Under $10,000',
    '10k_25k': '$10,000 - $25,000',
    '25k_50k': '$25,000 - $50,000',
    '50k_100k': '$50,000 - $100,000',
    '100k_plus': '$100,000+'
  };
  
  return budgetMap[budget as keyof typeof budgetMap] || 'To be discussed';
}

function getSpecialRequirements(leadData: any): string | undefined {
  const requirements: string[] = [];
  
  if (leadData.urgency === 'immediate') {
    requirements.push('Urgent timeline required');
  }
  
  if (leadData.industry === 'healthcare') {
    requirements.push('HIPAA compliance required');
  }
  
  if (leadData.industry === 'fintech') {
    requirements.push('Financial regulations compliance');
  }
  
  if (leadData.location && leadData.location !== 'remote') {
    requirements.push(`Local presence in ${leadData.location} preferred`);
  }
  
  // Extract special requirements from message
  const message = leadData.message?.toLowerCase() || '';
  if (message.includes('compliance') || message.includes('regulation')) {
    requirements.push('Regulatory compliance considerations');
  }
  
  if (message.includes('security') || message.includes('encrypted')) {
    requirements.push('Enhanced security requirements');
  }
  
  if (message.includes('scale') || message.includes('million users')) {
    requirements.push('High scalability requirements');
  }
  
  return requirements.length > 0 ? requirements.join(', ') : undefined;
}