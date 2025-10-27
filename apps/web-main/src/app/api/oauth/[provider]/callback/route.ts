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
    const url = `${process.env.AUTH_SERVICE_URL}/api/oauth/${provider}/callback${queryString ? `?${queryString}` : ''}`;

    // Forward request to auth service
    const authServiceResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        'x-real-ip': request.headers.get('x-real-ip') || '',
        'user-agent': request.headers.get('user-agent') || '',
      },
    });

    const result = await authServiceResponse.json();

    if (!authServiceResponse.ok) {
      // Redirect to frontend with error
      const frontendUrl = new URL('/auth/oauth/error', process.env.FRONTEND_URL || 'http://localhost:3000');
      frontendUrl.searchParams.set('error', result.error || 'oauth_failed');
      frontendUrl.searchParams.set('message', result.message || 'OAuth authentication failed');
      frontendUrl.searchParams.set('provider', provider);
      
      return NextResponse.redirect(frontendUrl.toString());
    }

    // OAuth callback successful - redirect to frontend with tokens
    const frontendUrl = new URL('/auth/oauth/success', process.env.FRONTEND_URL || 'http://localhost:3000');
    
    // Add success parameters
    frontendUrl.searchParams.set('provider', provider);
    if (result.data?.isNewUser) {
      frontendUrl.searchParams.set('new_user', 'true');
    }
    
    // Create the response with redirect
    const response = NextResponse.redirect(frontendUrl.toString());
    
    // Set the refresh token as HTTP-only cookie (if present)
    if (result.data?.refreshToken) {
      // Note: The auth service should have already set this cookie, 
      // but we can set it here as a backup
      response.cookies.set('refresh_token', result.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
      });
    }
    
    // Set access token as a temporary cookie that the frontend can read
    if (result.data?.accessToken) {
      response.cookies.set('temp_access_token', result.data.accessToken, {
        httpOnly: false, // Frontend needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 5 * 60 * 1000, // 5 minutes - just enough for frontend to grab it
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('OAuth callback API error:', error);

    // Redirect to frontend with error
    const frontendUrl = new URL('/auth/oauth/error', process.env.FRONTEND_URL || 'http://localhost:3000');
    frontendUrl.searchParams.set('error', 'internal_error');
    frontendUrl.searchParams.set('message', 'An unexpected error occurred during OAuth authentication');
    frontendUrl.searchParams.set('provider', params.provider);
    
    return NextResponse.redirect(frontendUrl.toString());
  }
}