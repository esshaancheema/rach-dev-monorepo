import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Forward request to auth service
    const authServiceResponse = await fetch(
      `${process.env.AUTH_SERVICE_URL}/api/oauth/providers`,
      {
        method: 'GET',
        headers: {
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
          error: result.error || 'OAUTH_PROVIDERS_FAILED',
          message: result.message || 'Failed to get OAuth providers',
        },
        { status: authServiceResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });

  } catch (error) {
    console.error('OAuth providers API error:', error);

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