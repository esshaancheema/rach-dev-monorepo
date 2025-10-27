import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for lead capture
const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message too long'),
  source: z.string().optional(), // Where the lead came from
  campaign: z.string().optional(), // Marketing campaign ID
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    timezone: z.string().optional()
  }).optional(),
  metadata: z.object({
    url: z.string().optional(),
    referrer: z.string().optional(),
    userAgent: z.string().optional(),
    timestamp: z.string().optional()
  }).optional()
});

type LeadData = z.infer<typeof leadSchema>;

// Lead scoring algorithm
const calculateLeadScore = (lead: LeadData): number => {
  let score = 0;
  
  // Base score
  score += 10;
  
  // Company provided
  if (lead.company) score += 20;
  
  // Phone provided
  if (lead.phone) score += 15;
  
  // Message quality (longer = more interested)
  if (lead.message.length > 100) score += 10;
  if (lead.message.length > 200) score += 10;
  
  // Keywords in message that indicate high intent
  const highIntentKeywords = [
    'urgent', 'deadline', 'budget', 'contract', 'enterprise',
    'launch', 'startup', 'funding', 'investment', 'scale'
  ];
  
  const messageWords = lead.message.toLowerCase().split(' ');
  const keywordMatches = highIntentKeywords.filter(keyword => 
    messageWords.some(word => word.includes(keyword))
  );
  score += keywordMatches.length * 5;
  
  // Professional email domains
  const professionalDomains = [
    'gmail.com', 'outlook.com', 'company.com', 'inc.com', 
    'corp.com', 'business.com'
  ];
  const emailDomain = lead.email.split('@')[1];
  if (!professionalDomains.some(domain => emailDomain.includes(domain))) {
    score += 10; // Custom domain suggests business
  }
  
  return Math.min(score, 100); // Cap at 100
};

// Send notification emails (mock implementation)
const sendNotifications = async (lead: LeadData, score: number) => {
  // In production, integrate with:
  // - SendGrid/Mailgun for email notifications
  // - Slack webhook for team notifications
  // - CRM integration (HubSpot, Salesforce, etc.)
  
  console.info('Lead notification sent:', {
    email: lead.email,
    score,
    priority: score > 70 ? 'high' : score > 40 ? 'medium' : 'low'
  });
  
  // Mock email to sales team
  if (score > 70) {
    // High priority - immediate notification
    console.info('🚨 High priority lead notification sent to sales team');
  }
};

// Save lead to database (mock implementation)
const saveLead = async (lead: LeadData, score: number) => {
  // In production, save to:
  // - PostgreSQL database
  // - CRM system
  // - Analytics platform
  
  const leadRecord = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...lead,
    score,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  console.info('Lead saved:', leadRecord);
  return leadRecord;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = leadSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }
    
    const leadData = validationResult.data;
    
    // Rate limiting check (simple IP-based)
    const userIP = request.headers.get('x-forwarded-for') || 'unknown';
    // In production, implement proper rate limiting
    
    // Calculate lead score
    const leadScore = calculateLeadScore(leadData);
    
    // Save lead to database
    const savedLead = await saveLead(leadData, leadScore);
    
    // Send notifications
    await sendNotifications(leadData, leadScore);
    
    // Track analytics event
    console.info('Lead captured:', {
      source: leadData.source,
      score: leadScore,
      location: leadData.location?.city,
      timestamp: new Date().toISOString()
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Thank you for your interest! We\'ll get back to you within 24 hours.',
      leadId: savedLead.id,
      nextSteps: {
        immediate: 'You\'ll receive a confirmation email shortly',
        followUp: leadScore > 70 
          ? 'Our senior team will contact you within 2 hours'
          : 'We\'ll review your request and respond within 24 hours'
      }
    });
    
  } catch (error) {
    console.error('Lead capture error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process your request',
        message: 'Please try again or contact us directly at hello@zoptal.com'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Lead Capture API',
    version: '1.0.0',
    endpoints: {
      'POST /api/lead-capture': 'Submit a new lead/contact form'
    },
    requiredFields: ['name', 'email', 'message'],
    optionalFields: ['company', 'phone', 'source', 'campaign', 'location', 'metadata']
  });
}