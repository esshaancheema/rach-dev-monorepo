import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service-client';

export async function POST(request: NextRequest) {
  try {
    const { redirectUri, state } = await request.json();

    if (!redirectUri) {
      return NextResponse.json(
        { error: 'redirectUri is required' },
        { status: 400 }
      );
    }

    // Call auth service to initiate Google OAuth flow
    const authServiceUrl = `${process.env.AUTH_SERVICE_URL || 'http://localhost:4000'}/api/oauth/google?redirect_uri=${encodeURIComponent(redirectUri)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
    
    // Instead of making a request, return the auth service URL that will handle the OAuth initiation
    return NextResponse.json({
      authUrl: authServiceUrl,
      state: state,
    });


  } catch (error) {
    console.error('Google OAuth authorization failed:', error);
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Failed to process Google OAuth request'
      },
      { status: 500 }
    );
  }
}