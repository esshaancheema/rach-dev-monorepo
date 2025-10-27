import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, JWTPayload } from 'jose';

// Types
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthContext {
  user: AuthUser;
  isAuthenticated: true;
}

export interface UnauthenticatedContext {
  user: null;
  isAuthenticated: false;
}

export type AuthContextType = AuthContext | UnauthenticatedContext;

// Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

/**
 * Verify JWT token
 */
async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return {
      id: payload.sub!,
      email: payload.email as string,
      firstName: payload.firstName as string || undefined,
      lastName: payload.lastName as string || undefined,
      name: payload.name as string || undefined,
      role: payload.role as string,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract access token from request
 */
function extractToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie as fallback (for SSR)
  const cookieToken = request.cookies.get('access_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Get authentication context from request
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContextType> {
  const token = extractToken(request);
  
  if (!token) {
    return { user: null, isAuthenticated: false };
  }

  const user = await verifyToken(token);
  
  if (!user) {
    return { user: null, isAuthenticated: false };
  }

  return { user, isAuthenticated: true };
}

/**
 * Middleware to protect API routes
 */
export function withAuth(
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse> | NextResponse,
  options: {
    roles?: string[];
    optional?: boolean;
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authContext = await getAuthContext(request);

    // Handle unauthenticated requests
    if (!authContext.isAuthenticated) {
      if (options.optional) {
        // For optional auth, call handler with null user
        return handler(request, { user: null, isAuthenticated: false } as any);
      }

      return NextResponse.json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
      }, { status: 401 });
    }

    // Check role-based authorization
    if (options.roles && !options.roles.includes(authContext.user.role)) {
      return NextResponse.json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Insufficient permissions',
      }, { status: 403 });
    }

    // Call the handler with authenticated context
    return handler(request, authContext);
  };
}

/**
 * Middleware to protect pages (for middleware.ts)
 */
export async function authMiddleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/admin',
  ];

  // Define public routes that authenticated users shouldn't access
  const authOnlyRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
  ];

  // Check if route needs protection
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isAuthOnlyRoute = authOnlyRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute || isAuthOnlyRoute) {
    const authContext = await getAuthContext(request);

    if (isProtectedRoute && !authContext.isAuthenticated) {
      // Redirect to login with return URL
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthOnlyRoute && authContext.isAuthenticated) {
      // Redirect authenticated users away from auth pages
      const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/dashboard';
      return NextResponse.redirect(new URL(returnUrl, request.url));
    }

    // Check admin routes
    if (pathname.startsWith('/admin') && authContext.isAuthenticated) {
      if (!['admin', 'super_admin'].includes(authContext.user.role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

/**
 * Client-side authentication hook
 */
export class AuthManager {
  private static instance: AuthManager;
  private token: string | null = null;
  private user: AuthUser | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
      this.initializeRefreshTimer();
    }
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /**
   * Set authentication token
   */
  setToken(token: string, expiresAt: number): void {
    this.token = token;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
      localStorage.setItem('token_expires_at', expiresAt.toString());
    }

    this.initializeRefreshTimer();
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.token = null;
    this.user = null;
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_expires_at');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.token) return false;

    // Check if token is expired
    if (typeof window !== 'undefined') {
      const expiresAt = localStorage.getItem('token_expires_at');
      if (expiresAt && Date.now() > parseInt(expiresAt)) {
        this.clearAuth();
        return false;
      }
    }

    return true;
  }

  /**
   * Get current user
   */
  getUser(): AuthUser | null {
    return this.user;
  }

  /**
   * Set current user
   */
  setUser(user: AuthUser): void {
    this.user = user;
  }

  /**
   * Initialize automatic token refresh
   */
  private initializeRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (typeof window === 'undefined') return;

    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return;

    const expirationTime = parseInt(expiresAt);
    const refreshTime = expirationTime - (5 * 60 * 1000); // Refresh 5 minutes before expiry
    const timeUntilRefresh = refreshTime - Date.now();

    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, timeUntilRefresh);
    }
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<void> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          this.setToken(data.data.accessToken, data.data.expiresAt);
        }
      } else {
        // Refresh failed, redirect to login
        this.clearAuth();
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuth();
      window.location.href = '/auth/login';
    }
  }

  /**
   * Make authenticated API request
   */
  async request(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, requestOptions);

    // Handle token expiration
    if (response.status === 401) {
      await this.refreshToken();
      
      // Retry with new token
      const newToken = this.getToken();
      if (newToken) {
        requestOptions.headers = {
          ...requestOptions.headers,
          'Authorization': `Bearer ${newToken}`,
        };
        return fetch(url, requestOptions);
      }
    }

    return response;
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance();