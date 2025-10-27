import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/enterprise/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grant_type, device_code, client_id } = body;

    // Validate required fields for device code grant
    if (grant_type === 'urn:ietf:params:oauth:grant-type:device_code') {
      if (!device_code || !client_id) {
        return NextResponse.json(
          { 
            error: 'invalid_request',
            error_description: 'device_code and client_id are required for device code grant'
          },
          { status: 400 }
        );
      }
    }

    // Call auth service token endpoint
    const response = await authService.request('POST', '/api/v1/oauth/token', body);

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(responseData, { status: response.status });
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Token request failed:', error);
    return NextResponse.json(
      { 
        error: 'server_error',
        error_description: 'Failed to process token request'
      },
      { status: 500 }
    );
  }
}