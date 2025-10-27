import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service-client';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('GitHub OAuth error:', error);
      const errorDescription = searchParams.get('error_description') || 'OAuth authorization failed';
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=No authorization code received', request.url)
      );
    }

    // Exchange code for tokens
    const response = await authService.request('POST', '/api/oauth/github/callback', {
      code,
      redirect_uri: `${request.nextUrl.origin}/api/oauth/github/callback`,
      state,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('GitHub OAuth callback failed:', errorData);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Authentication failed')}`, request.url)
      );
    }

    const authData = await response.json();
    
    // Set authentication cookies
    const cookieStore = cookies();
    
    if (authData.access_token) {
      cookieStore.set('access_token', authData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: authData.expires_in || 3600, // 1 hour default
        path: '/',
      });
    }

    if (authData.refresh_token) {
      cookieStore.set('refresh_token', authData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    // Redirect to intended destination or dashboard
    const redirectTo = state && state !== 'undefined' ? state : '/dashboard';
    const successUrl = new URL(redirectTo, request.url);
    successUrl.searchParams.set('auth', 'success');
    successUrl.searchParams.set('provider', 'github');

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=Authentication failed', request.url)
    );
  }
}