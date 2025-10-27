import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/service';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  company: z.string().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
  source: z.string().optional(),
  // Anti-spam fields
  honeypot: z.string().optional(),
  timestamp: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Anti-spam checks
    if (validatedData.honeypot) {
      return NextResponse.json({ 
        success: false,
        error: 'SPAM_DETECTED',
        message: 'Spam detected' 
      }, { status: 400 });
    }
    
    // Check timestamp to prevent rapid submissions
    if (validatedData.timestamp) {
      const submissionTime = Date.now() - validatedData.timestamp;
      if (submissionTime < 3000) { // Less than 3 seconds
        return NextResponse.json({ 
          success: false,
          error: 'SUBMISSION_TOO_FAST',
          message: 'Submission too fast' 
        }, { status: 400 });
      }
    }

    // Get client information
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Register user with our auth service
    const result = await authService.register(validatedData, clientIP, userAgent);

    if (!result.success) {
      return NextResponse.json(result, { 
        status: result.error?.code === 'EMAIL_ALREADY_EXISTS' ? 409 : 400 
      });
    }

    // Track registration event
    await trackRegistrationEvent({
      userId: result.data?.user.id,
      email: validatedData.email,
      source: validatedData.source || 'website',
      hasCompany: !!validatedData.company,
      clientIP,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: result.data?.user,
        requiresVerification: result.data?.requiresVerification,
      },
      message: result.message,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration API error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      }, { status: 400 });
    }

    // Generic server error
    return NextResponse.json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Registration failed. Please try again later.',
    }, { status: 500 });
  }
}

// Helper function to track registration events
async function trackRegistrationEvent(event: {
  userId?: string;
  email: string;
  source: string;
  hasCompany: boolean;
  clientIP: string;
  userAgent: string;
}): Promise<void> {
  try {
    // Track in analytics (Google Analytics, Mixpanel, etc.)
    console.info('Registration event tracked:', {
      event: 'user_registration',
      userId: event.userId,
      email: event.email,
      source: event.source,
      hasCompany: event.hasCompany,
      timestamp: new Date().toISOString(),
    });

    // Send to analytics service
    if (process.env.GA_MEASUREMENT_ID && process.env.GA_API_SECRET) {
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: event.userId || event.email,
          events: [
            {
              name: 'sign_up',
              parameters: {
                method: event.source,
                user_id: event.userId,
                user_email: event.email,
                has_company: event.hasCompany,
              },
            },
          ],
        }),
      });
    }

    // Send to internal analytics
    if (process.env.WEBHOOK_URL) {
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'user_registration',
          data: event,
          timestamp: new Date().toISOString(),
        }),
      });
    }

  } catch (error) {
    console.error('Failed to track registration event:', error);
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed',
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed',
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed',
  }, { status: 405 });
}