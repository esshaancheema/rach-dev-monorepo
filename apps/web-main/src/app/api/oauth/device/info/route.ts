import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/enterprise/auth-service';

export async function POST(request: NextRequest) {
  try {
    const { user_code } = await request.json();

    if (!user_code) {
      return NextResponse.json(
        { error: 'user_code is required' },
        { status: 400 }
      );
    }

    // Call auth service to get device info
    const response = await authService.request('GET', `/api/v1/oauth/device/info/${user_code}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Invalid or expired device code' },
        { status: 400 }
      );
    }

    const deviceInfo = await response.json();
    
    // Return formatted device info
    return NextResponse.json({
      type: deviceInfo.deviceType || 'desktop',
      name: deviceInfo.deviceName || 'Unknown Device',
      clientName: deviceInfo.clientName,
      scopes: deviceInfo.scopes || ['openid', 'profile'],
    });

  } catch (error) {
    console.error('Device info fetch failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device information' },
      { status: 500 }
    );
  }
}