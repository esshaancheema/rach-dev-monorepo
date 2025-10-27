import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service-client';

export async function POST(request: NextRequest) {
  try {
    const { email, redirectTo } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Call auth service to generate magic link
    const response = await authService.request('POST', '/api/v1/magic-link/generate', {
      email,
      redirect_url: redirectTo || `${request.nextUrl.origin}/dashboard`,
      expires_in: 600 // 10 minutes
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Magic link generation failed:', errorData);
      
      return NextResponse.json(
        { 
          error: errorData.error || 'magic_link_failed',
          message: errorData.message || 'Failed to generate magic link'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Magic link sent successfully',
      data: {
        email,
        expires_in: data.data?.expires_in || 600
      }
    });

  } catch (error) {
    console.error('Magic link API error:', error);
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Failed to process magic link request'
      },
      { status: 500 }
    );
  }
}