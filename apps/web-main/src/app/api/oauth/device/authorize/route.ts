import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/enterprise/auth-service';

export async function POST(request: NextRequest) {
  try {
    const { client_id, scope } = await request.json();

    if (!client_id) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      );
    }

    // Call auth service device authorization endpoint
    const response = await authService.request('POST', '/api/v1/oauth/device_authorization', {
      client_id,
      scope: scope || 'openid profile email',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: errorData.error || 'device_authorization_failed',
          error_description: errorData.error_description || 'Failed to initiate device authorization'
        },
        { status: response.status }
      );
    }

    const authData = await response.json();
    
    return NextResponse.json({
      device_code: authData.device_code,
      user_code: authData.user_code,
      verification_uri: authData.verification_uri,
      verification_uri_complete: authData.verification_uri_complete,
      expires_in: authData.expires_in || 600,
      interval: authData.interval || 5,
    });

  } catch (error) {
    console.error('Device authorization failed:', error);
    return NextResponse.json(
      { 
        error: 'server_error',
        error_description: 'Failed to process device authorization request'
      },
      { status: 500 }
    );
  }
}