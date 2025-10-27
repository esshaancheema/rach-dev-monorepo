import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/service';
import { COOKIE_NAMES } from '@/lib/auth/config';
import { z } from 'zod';

const logoutSchema = z.object({
  allDevices: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const validatedData = logoutSchema.parse(body);

    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    // Get refresh token from cookie
    const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

    // Call auth service logout with enterprise auth service
    const result = await authService.logout(
      accessToken,
      refreshToken,
      validatedData.allDevices
    );

    // Create response
    const response = NextResponse.json(result, { 
      status: result.success ? 200 : (result.error?.code === 'UNAUTHORIZED' ? 401 : 500)
    });

    // Always clear refresh token cookie on logout
    response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Logout API error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      }, { status: 400 });
    }

    // Generic server error - still clear cookie
    const response = NextResponse.json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Logout failed. Please try again later.',
    }, { status: 500 });

    // Clear refresh token cookie even on error
    response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
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