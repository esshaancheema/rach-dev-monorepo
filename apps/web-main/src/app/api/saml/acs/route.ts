import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service-client';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const samlResponse = formData.get('SAMLResponse') as string;
    const relayState = formData.get('RelayState') as string;

    if (!samlResponse) {
      return NextResponse.redirect(
        new URL('/login?error=Invalid SAML response', request.url)
      );
    }

    // Process SAML response via auth service
    const response = await authService.request('POST', '/api/v1/saml/acs', {
      SAMLResponse: samlResponse,
      RelayState: relayState,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('SAML ACS processing failed:', errorData);
      
      const errorMessage = encodeURIComponent(
        errorData.message || 'SAML authentication failed'
      );
      return NextResponse.redirect(
        new URL(`/login?error=${errorMessage}`, request.url)
      );
    }

    const authData = await response.json();
    
    // Set authentication cookies
    const cookieStore = cookies();
    
    if (authData.data?.access_token) {
      cookieStore.set('access_token', authData.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: authData.data.expires_in || 3600, // 1 hour default
        path: '/',
      });
    }

    if (authData.data?.refresh_token) {
      cookieStore.set('refresh_token', authData.data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    // Parse RelayState to get redirect URL
    let redirectUrl = '/dashboard';
    if (relayState) {
      try {
        const relayData = JSON.parse(Buffer.from(relayState, 'base64').toString());
        redirectUrl = relayData.redirectTo || '/dashboard';
      } catch (error) {
        console.warn('Failed to parse RelayState, using default redirect');
      }
    }

    // Redirect to success URL with SAML success indicator
    const successUrl = new URL(redirectUrl, request.url);
    successUrl.searchParams.set('auth', 'success');
    successUrl.searchParams.set('provider', 'saml');
    if (authData.data?.user?.email) {
      successUrl.searchParams.set('email', authData.data.user.email);
    }

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('SAML ACS error:', error);
    return NextResponse.redirect(
      new URL('/login?error=SAML authentication processing failed', request.url)
    );
  }
}

// Also handle GET requests for SAML metadata or debugging
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'method_not_allowed',
    message: 'This endpoint only accepts POST requests with SAML responses'
  }, { status: 405 });
}