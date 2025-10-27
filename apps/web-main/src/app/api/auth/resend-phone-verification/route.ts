import { NextRequest, NextResponse } from 'next/server';
import { AuthApiClient } from '@/lib/api/auth-client';
import { z } from 'zod';

const resendPhoneVerificationSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = resendPhoneVerificationSchema.parse(body);

    // Initialize auth client
    const authClient = new AuthApiClient();

    // Forward request to auth service
    const result = await authClient.resendPhoneVerification(validatedData);

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });

  } catch (error) {
    console.error('Resend phone verification API error:', error);

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

    // Handle rate limiting
    if (error instanceof Error && error.message.includes('RATE_LIMIT_EXCEEDED')) {
      return NextResponse.json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many verification requests. Please try again later.',
      }, { status: 429 });
    }

    // Generic server error
    return NextResponse.json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to resend phone verification. Please try again later.',
    }, { status: 500 });
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