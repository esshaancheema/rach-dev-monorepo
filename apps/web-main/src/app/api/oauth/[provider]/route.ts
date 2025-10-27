import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider } = params;
    const { searchParams } = new URL(request.url);
    
    // Build query string
    const queryString = searchParams.toString();
    const url = `${process.env.AUTH_SERVICE_URL}/api/oauth/${provider}${queryString ? `?${queryString}` : ''}`;

    // Forward request to auth service
    const authServiceResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        'x-real-ip': request.headers.get('x-real-ip') || '',
        'user-agent': request.headers.get('user-agent') || '',
      },
      redirect: 'manual', // Don't follow redirects automatically
    });

    // If it's a redirect, return the redirect response
    if (authServiceResponse.status >= 300 && authServiceResponse.status < 400) {
      const location = authServiceResponse.headers.get('location');
      if (location) {
        return NextResponse.redirect(location);
      }
    }

    const result = await authServiceResponse.json();

    if (!authServiceResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'OAUTH_INITIATE_FAILED',
          message: result.message || 'Failed to initiate OAuth flow',
        },
        { status: authServiceResponse.status }
      );
    }

    // If we have an authUrl in the response, redirect to it
    if (result.data?.authUrl) {
      return NextResponse.redirect(result.data.authUrl);
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });

  } catch (error) {
    console.error('OAuth initiate API error:', error);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider } = params;

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
      `${process.env.AUTH_SERVICE_URL}/api/oauth/${provider}`,
      {
        method: 'DELETE',
        headers: {
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
          error: result.error || 'OAUTH_UNLINK_FAILED',
          message: result.message || 'Failed to unlink OAuth account',
        },
        { status: authServiceResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    console.error('OAuth unlink API error:', error);

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