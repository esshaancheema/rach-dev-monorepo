import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    // Get SAML providers from auth service
    const response = await authService.request('GET', '/api/v1/saml/providers', {
      ...(organizationId && { organizationId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to fetch SAML providers:', errorData);
      
      return NextResponse.json(
        { 
          error: errorData.error || 'saml_providers_fetch_failed',
          message: errorData.message || 'Failed to fetch SAML providers'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.data || []
    });

  } catch (error) {
    console.error('SAML providers API error:', error);
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Failed to process SAML providers request'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const samlProviderData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'entityId', 'ssoUrl', 'certificate', 'organizationId'];
    for (const field of requiredFields) {
      if (!samlProviderData[field]) {
        return NextResponse.json(
          { error: 'validation_error', message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create SAML provider via auth service
    const response = await authService.request('POST', '/api/v1/saml/providers', {
      ...samlProviderData,
      // Ensure security defaults
      wantResponseSigned: samlProviderData.wantResponseSigned ?? true,
      signatureAlgorithm: samlProviderData.signatureAlgorithm ?? 'SHA256',
      digestAlgorithm: samlProviderData.digestAlgorithm ?? 'SHA256',
      autoProvisionUsers: samlProviderData.autoProvisionUsers ?? true,
      defaultRole: samlProviderData.defaultRole ?? 'user',
      nameIdFormat: samlProviderData.nameIdFormat ?? 'urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to create SAML provider:', errorData);
      
      return NextResponse.json(
        { 
          error: errorData.error || 'saml_provider_creation_failed',
          message: errorData.message || 'Failed to create SAML provider'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'SAML provider created successfully',
      data: data.data
    }, { status: 201 });

  } catch (error) {
    console.error('SAML provider creation API error:', error);
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Failed to create SAML provider'
      },
      { status: 500 }
    );
  }
}