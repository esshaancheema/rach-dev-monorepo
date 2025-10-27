import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service-client';

export async function POST(request: NextRequest) {
  try {
    const { providerId, domain, redirectTo } = await request.json();

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Generate unique RelayState for this request
    const relayState = Buffer.from(JSON.stringify({
      redirectTo: redirectTo || '/dashboard',
      timestamp: Date.now(),
      domain
    })).toString('base64');

    // Initiate SAML SSO flow via auth service
    const response = await authService.request('POST', '/api/v1/saml/initiate', {
      providerId,
      relayState,
      forceAuthn: false, // Set to true to force re-authentication
      isPassive: false,  // Set to true for passive authentication
      assertionConsumerServiceURL: `${request.nextUrl.origin}/api/saml/acs`,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('SAML initiation failed:', errorData);
      
      return NextResponse.json(
        { 
          error: errorData.error || 'saml_initiation_failed',
          message: errorData.message || 'Failed to initiate SAML authentication'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'SAML authentication initiated successfully',
      data: {
        redirectUrl: data.data?.redirectUrl,
        requestId: data.data?.requestId,
        relayState,
        providerId
      }
    });

  } catch (error) {
    console.error('SAML initiation API error:', error);
    
    // For development, return a mock redirect
    return NextResponse.json({
      success: false,
      error: 'initiation_unavailable',
      message: 'SAML authentication service is currently unavailable. Please try again later.',
      data: null
    }, { status: 503 });
  }
}