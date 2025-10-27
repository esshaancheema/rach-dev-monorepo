import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/service';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = verifyEmailSchema.parse(body);

    // Verify email with auth service
    const result = await authService.verifyEmail(validatedData.token);

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });

  } catch (error) {
    console.error('Email verification API error:', error);

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
      message: 'Email verification failed. Please try again later.',
    }, { status: 500 });
  }
}

// Handle GET request for email verification links
export async function GET(request: NextRequest) {
  try {
    // Get token from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_TOKEN',
        message: 'Verification token is required',
      }, { status: 400 });
    }

    // Verify email with auth service
    const result = await authService.verifyEmail(token);

    // Redirect to appropriate page based on result
    if (result.success) {
      return NextResponse.redirect(
        new URL('/auth/verification-success', request.url)
      );
    } else {
      return NextResponse.redirect(
        new URL('/auth/verification-failed', request.url)
      );
    }

  } catch (error) {
    console.error('Email verification GET API error:', error);
    
    // Redirect to error page
    return NextResponse.redirect(
      new URL('/auth/verification-failed', request.url)
    );
  }
}

// Handle unsupported methods
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