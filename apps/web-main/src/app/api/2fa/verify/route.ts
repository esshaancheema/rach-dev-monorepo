import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const verify2FASchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = verify2FASchema.parse(body);

    // Get authorization header
    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Forward request to auth service
    const authServiceResponse = await fetch(
      `${process.env.AUTH_SERVICE_URL}/api/2fa/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorization,
          'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
          'x-real-ip': request.headers.get('x-real-ip') || '',
          'user-agent': request.headers.get('user-agent') || '',
        },
        body: JSON.stringify(validatedData),
      }
    );

    const result = await authServiceResponse.json();

    if (!authServiceResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || '2FA_VERIFY_FAILED',
          message: result.message || 'Failed to verify 2FA code',
        },
        { status: authServiceResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
    });

  } catch (error) {
    console.error('2FA verify API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}