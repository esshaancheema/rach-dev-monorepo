import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Call auth service to initiate device authorization
    const response = await authService.request('POST', '/api/v1/device-authorization', {
      client_id: 'web-main-app', // Default client ID
      scope: 'openid profile email',
      ...body
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Device authorization failed:', errorData);
      
      return NextResponse.json(
        { 
          error: errorData.error || 'device_authorization_failed',
          message: errorData.message || 'Failed to initiate device authorization'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Device authorization initiated',
      data: {
        device_code: data.data?.device_code,
        user_code: data.data?.user_code,
        verification_uri: data.data?.verification_uri || `${request.nextUrl.origin}/device`,
        verification_uri_complete: data.data?.verification_uri_complete,
        expires_in: data.data?.expires_in || 600,
        interval: data.data?.interval || 5
      }
    });

  } catch (error) {
    console.error('Device authorization API error:', error);
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Failed to process device authorization request'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceCode = searchParams.get('device_code');

    if (!deviceCode) {
      return NextResponse.json(
        { error: 'device_code is required' },
        { status: 400 }
      );
    }

    // Poll auth service for token
    const response = await authService.request('POST', '/api/v1/device-token', {
      device_code: deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle expected polling responses
      if (response.status === 400) {
        return NextResponse.json({
          error: errorData.error || 'authorization_pending',
          message: errorData.message || 'Authorization pending'
        }, { status: 400 });
      }
      
      console.error('Device token exchange failed:', errorData);
      return NextResponse.json(
        { 
          error: errorData.error || 'token_exchange_failed',
          message: errorData.message || 'Failed to exchange device code for token'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Device authorization completed',
      data: {
        access_token: data.data?.access_token,
        token_type: data.data?.token_type || 'Bearer',
        expires_in: data.data?.expires_in,
        refresh_token: data.data?.refresh_token,
        scope: data.data?.scope
      }
    });

  } catch (error) {
    console.error('Device token API error:', error);
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Failed to process device token request'
      },
      { status: 500 }
    );
  }
}