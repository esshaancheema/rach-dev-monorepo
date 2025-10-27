import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service-client';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Call auth service to verify magic link
    const response = await authService.request('POST', '/api/v1/magic-link/verify', {
      token,
      email
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Magic link verification failed:', errorData);
      
      return NextResponse.json(
        { 
          error: errorData.error || 'magic_link_verification_failed',
          message: errorData.message || 'Magic link verification failed'
        },
        { status: response.status }
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
    
    return NextResponse.json({
      success: true,
      message: 'Magic link verified successfully',
      data: {
        user: authData.data?.user,
        access_token: authData.data?.access_token,
        expires_in: authData.data?.expires_in
      }
    });

  } catch (error) {
    console.error('Magic link verification API error:', error);
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Failed to verify magic link'
      },
      { status: 500 }
    );
  }
}