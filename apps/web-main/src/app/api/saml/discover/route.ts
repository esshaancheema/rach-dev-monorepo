import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service-client';

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Discover SAML provider for domain via auth service
    const response = await authService.request('POST', '/api/v1/saml/discover', {
      domain: domain.toLowerCase().trim()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific case where no provider is found
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: 'no_provider_found',
          message: `No SAML provider configured for domain "${domain}"`
        }, { status: 404 });
      }
      
      console.error('SAML discovery failed:', errorData);
      return NextResponse.json(
        { 
          error: errorData.error || 'saml_discovery_failed',
          message: errorData.message || 'Failed to discover SAML provider'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'SAML provider discovered successfully',
      data: {
        id: data.data?.id,
        name: data.data?.name,
        domain: data.data?.domain,
        entityId: data.data?.entityId,
        organizationId: data.data?.organizationId,
        logoUrl: data.data?.logoUrl
      }
    });

  } catch (error) {
    console.error('SAML discovery API error:', error);
    
    // For development, return a mock response
    const domain = request.json().then(body => body.domain).catch(() => 'unknown');
    
    return NextResponse.json({
      success: false,
      error: 'discovery_unavailable',
      message: 'SAML discovery service is currently unavailable. Please try again later.',
      data: null
    }, { status: 503 });
  }
}