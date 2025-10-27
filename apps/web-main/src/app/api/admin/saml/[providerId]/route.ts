import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  try {
    const { providerId } = params;

    // Get specific SAML provider from auth service
    const response = await authService.request('GET', `/api/v1/saml/providers/${providerId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to fetch SAML provider:', errorData);
      
      return NextResponse.json(
        { 
          error: errorData.error || 'saml_provider_fetch_failed',
          message: errorData.message || 'Failed to fetch SAML provider'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.data
    });

  } catch (error) {
    console.error('SAML provider fetch API error:', error);
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Failed to fetch SAML provider'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  try {
    const { providerId } = params;
    const updateData = await request.json();

    // Update SAML provider via auth service
    const response = await authService.request('PUT', `/api/v1/saml/providers/${providerId}`, updateData);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to update SAML provider:', errorData);
      
      return NextResponse.json(
        { 
          error: errorData.error || 'saml_provider_update_failed',
          message: errorData.message || 'Failed to update SAML provider'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'SAML provider updated successfully',
      data: data.data
    });

  } catch (error) {
    console.error('SAML provider update API error:', error);
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Failed to update SAML provider'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  try {
    const { providerId } = params;

    // Delete SAML provider via auth service
    const response = await authService.request('DELETE', `/api/v1/saml/providers/${providerId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to delete SAML provider:', errorData);
      
      return NextResponse.json(
        { 
          error: errorData.error || 'saml_provider_deletion_failed',
          message: errorData.message || 'Failed to delete SAML provider'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SAML provider deleted successfully'
    });

  } catch (error) {
    console.error('SAML provider deletion API error:', error);
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Failed to delete SAML provider'
      },
      { status: 500 }
    );
  }
}