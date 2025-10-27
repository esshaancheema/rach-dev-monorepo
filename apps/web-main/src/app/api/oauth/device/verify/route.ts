import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/enterprise/auth-service';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', redirect: '/login' },
        { status: 401 }
      );
    }

    const { user_code, action } = await request.json();

    if (!user_code || !action) {
      return NextResponse.json(
        { error: 'user_code and action are required' },
        { status: 400 }
      );
    }

    if (!['authorize', 'deny'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be either "authorize" or "deny"' },
        { status: 400 }
      );
    }

    // Call auth service device verification endpoint
    const response = await authService.request('POST', '/api/v1/oauth/device/verify', {
      user_code,
      action,
      user_id: session.user.id, // Pass authenticated user ID
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Device verification failed' },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: action === 'authorize' 
        ? 'Device has been authorized successfully'
        : 'Device access has been denied',
      ...result
    });

  } catch (error) {
    console.error('Device verification failed:', error);
    return NextResponse.json(
      { error: 'Failed to verify device' },
      { status: 500 }
    );
  }
}