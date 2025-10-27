import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Contact form schema for validation
const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().min(1, 'Company name is required').max(200),
  position: z.string().optional(),
  projectType: z.string().min(1, 'Project type is required'),
  budget: z.string().min(1, 'Budget range is required'),
  timeline: z.string().min(1, 'Timeline is required'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000),
  referralSource: z.string().optional(),
  newsletter: z.boolean().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the form data
    const validatedData = contactFormSchema.parse(body);
    
    // Here you would typically:
    // 1. Save to database
    // 2. Send notification emails
    // 3. Integrate with CRM
    // 4. Send confirmation email to user
    
    // Log the contact request for debugging (use proper logging service in production)
    console.info('New contact form submission:', {
      timestamp: new Date().toISOString(),
      ...validatedData,
    });

    // Simulate email sending
    const emailResult = await sendContactNotification(validatedData);
    const confirmationResult = await sendConfirmationEmail(validatedData);

    return NextResponse.json({
      success: true,
      message: 'Thank you for your inquiry! We\'ll get back to you within 24 hours.',
      data: {
        submissionId: generateSubmissionId(),
        estimatedResponse: '24 hours',
        emailSent: emailResult.success,
        confirmationSent: confirmationResult.success,
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error. Please try again later.',
    }, { status: 500 });
  }
}

// Simulate sending notification email to sales team
async function sendContactNotification(data: ContactFormData) {
  try {
    // In a real implementation, you would use a service like:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Postmark
    
    console.info('Sending notification email to sales team:', {
      to: 'sales@zoptal.com',
      subject: `New Contact Form Submission - ${data.projectType}`,
      data: {
        name: `${data.firstName} ${data.lastName}`,
        company: data.company,
        email: data.email,
        phone: data.phone,
        projectType: data.projectType,
        budget: data.budget,
        timeline: data.timeline,
        description: data.description,
        referralSource: data.referralSource,
      },
    });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return { success: true, messageId: `contact_notification_${Date.now()}` };
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return { success: false, error };
  }
}

// Simulate sending confirmation email to user
async function sendConfirmationEmail(data: ContactFormData) {
  try {
    console.info('Sending confirmation email to user:', {
      to: data.email,
      subject: 'Thank you for contacting Zoptal - We\'ll be in touch soon!',
      data: {
        firstName: data.firstName,
        projectType: data.projectType,
        submissionTime: new Date().toISOString(),
      },
    });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return { success: true, messageId: `user_confirmation_${Date.now()}` };
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return { success: false, error };
  }
}

// Generate a unique submission ID
function generateSubmissionId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `contact_${timestamp}_${randomStr}`;
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'operational',
    service: 'contact-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}