import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
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
      `${process.env.AUTH_SERVICE_URL}/api/2fa/setup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorization,
          'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
          'x-real-ip': request.headers.get('x-real-ip') || '',
          'user-agent': request.headers.get('user-agent') || '',
        },
      }
    );

    const result = await authServiceResponse.json();

    if (!authServiceResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || '2FA_SETUP_FAILED',
          message: result.message || 'Failed to setup 2FA',
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
    console.error('2FA setup API error:', error);

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