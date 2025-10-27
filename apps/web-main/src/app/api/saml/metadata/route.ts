import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    // Get SAML metadata from auth service
    const response = await authService.request('GET', '/api/v1/saml/metadata', {
      ...(organizationId && { organizationId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to fetch SAML metadata:', errorData);
      
      return NextResponse.json(
        { 
          error: errorData.error || 'saml_metadata_fetch_failed',
          message: errorData.message || 'Failed to fetch SAML metadata'
        },
        { status: response.status }
      );
    }

    // Get the metadata as text (XML)
    const metadataXml = await response.text();
    
    // Return XML response with proper content type
    return new NextResponse(metadataXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/samlmetadata+xml',
        'Content-Disposition': 'attachment; filename="sp-metadata.xml"',
      },
    });

  } catch (error) {
    console.error('SAML metadata API error:', error);
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Failed to generate SAML metadata'
      },
      { status: 500 }
    );
  }
}