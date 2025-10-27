import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/service';
import { COOKIE_NAMES } from '@/lib/auth/config';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
  twoFactorCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Get client information
    const clientInfo = {
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Unknown',
    };

    // Login with auth service
    const result = await authService.login(
      validatedData,
      clientInfo.ip,
      clientInfo.userAgent
    );

    // Create response
    const response = NextResponse.json(result, { 
      status: result.success ? 200 : (result.error?.code === 'ACCOUNT_LOCKED' ? 423 : 401)
    });

    // Set refresh token as HTTP-only cookie if login successful
    if (result.success && result.data?.session?.refreshToken) {
      const maxAge = validatedData.rememberMe 
        ? 30 * 24 * 60 * 60 // 30 days
        : 7 * 24 * 60 * 60; // 7 days

      response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, result.data.session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge,
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('Login API error:', error);

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

    // Handle rate limiting
    if (error instanceof Error && error.message.includes('RATE_LIMIT_EXCEEDED')) {
      return NextResponse.json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts. Please try again later.',
      }, { status: 429 });
    }

    // Handle account locked
    if (error instanceof Error && error.message.includes('ACCOUNT_LOCKED')) {
      return NextResponse.json({
        success: false,
        error: 'ACCOUNT_LOCKED',
        message: 'Account temporarily locked due to too many failed attempts',
      }, { status: 423 });
    }

    // Generic server error
    return NextResponse.json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Login failed. Please try again later.',
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