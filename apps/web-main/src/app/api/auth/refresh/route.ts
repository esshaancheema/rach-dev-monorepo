import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/service';
import { COOKIE_NAMES } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Refresh token not found',
      }, { status: 401 });
    }

    // Refresh session with auth service
    const result = await authService.refreshSession(refreshToken);

    // Create response
    const response = NextResponse.json(result, { 
      status: result.success ? 200 : 401 
    });

    // Update refresh token cookie if a new one was provided
    if (result.success && result.data?.session?.refreshToken) {
      response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, result.data.session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('Token refresh API error:', error);

    // Handle invalid/expired refresh token
    if (error instanceof Error && error.message.includes('UNAUTHORIZED')) {
      const response = NextResponse.json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired refresh token',
      }, { status: 401 });

      // Clear invalid refresh token cookie
      response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      });

      return response;
    }

    // Generic server error
    return NextResponse.json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Token refresh failed. Please try again later.',
    }, { status: 500 });
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed',
  }, { status: 405 });
}