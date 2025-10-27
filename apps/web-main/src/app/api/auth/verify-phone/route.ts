import { NextRequest, NextResponse } from 'next/server';
import { AuthApiClient } from '@/lib/api/auth-client';
import { z } from 'zod';

const verifyPhoneSchema = z.object({
  token: z.string().length(6, 'Verification code must be exactly 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = verifyPhoneSchema.parse(body);

    // Initialize auth client
    const authClient = new AuthApiClient();

    // Forward request to auth service
    const result = await authClient.verifyPhone(validatedData);

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });

  } catch (error) {
    console.error('Phone verification API error:', error);

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
      message: 'Phone verification failed. Please try again later.',
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