import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/service';

export async function GET(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Access token is required',
      }, { status: 401 });
    }

    // Get user profile from enterprise auth service
    const user = await authService.getUserById(accessToken);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired access token',
      }, { status: 401 });
    }

    const result = {
      success: true,
      data: { user },
    };

    return NextResponse.json(result, { 
      status: 200 
    });

  } catch (error) {
    console.error('Get profile API error:', error);

    // Handle token expired/invalid
    if (error instanceof Error && error.message.includes('UNAUTHORIZED')) {
      return NextResponse.json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired access token',
      }, { status: 401 });
    }

    // Generic server error
    return NextResponse.json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get user profile. Please try again later.',
    }, { status: 500 });
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed',
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed',
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed',
  }, { status: 405 });
}