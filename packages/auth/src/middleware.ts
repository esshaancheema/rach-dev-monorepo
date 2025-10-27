import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, type JWTPayload } from 'jose';

export interface AuthMiddlewareConfig {
  jwtSecret: string;
  publicPaths?: string[];
  protectedPaths?: string[];
  loginPath?: string;
  afterLoginPath?: string;
  roleBasedRedirects?: Record<string, string>;
}

export interface AuthUser extends JWTPayload {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  organizationId?: string;
}

export function createAuthMiddleware(config: AuthMiddlewareConfig) {
  const {
    jwtSecret,
    publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'],
    protectedPaths = [],
    loginPath = '/login',
    afterLoginPath = '/dashboard',
    roleBasedRedirects = {}
  } = config;

  return async function authMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Check if path is public
    const isPublicPath = publicPaths.some(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    );
    
    // Check if path requires protection
    const isProtectedPath = protectedPaths.length === 0 
      ? !isPublicPath 
      : protectedPaths.some(path => 
          pathname === path || pathname.startsWith(`${path}/`)
        );

    // Get token from cookies or Authorization header
    let token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    let user: AuthUser | null = null;

    // Verify token if present
    if (token) {
      try {
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);
        user = payload as AuthUser;
      } catch (error) {
        console.error('JWT verification failed:', error);
        // Clear invalid token
        const response = NextResponse.next();
        response.cookies.delete('auth-token');
        
        if (isProtectedPath) {
          return NextResponse.redirect(new URL(loginPath, request.url));
        }
        
        return response;
      }
    }

    // Handle protected paths
    if (isProtectedPath && !user) {
      // Store the attempted URL for redirect after login
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Handle authenticated user on public paths
    if (user && isPublicPath && pathname === loginPath) {
      // Check for role-based redirect
      const roleRedirect = roleBasedRedirects[user.role];
      const redirectPath = roleRedirect || afterLoginPath;
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Add user info to request headers for server components
    const response = NextResponse.next();
    
    if (user) {
      response.headers.set('x-user-id', user.id);
      response.headers.set('x-user-email', user.email);
      response.headers.set('x-user-role', user.role);
      response.headers.set('x-user-permissions', JSON.stringify(user.permissions));
      if (user.organizationId) {
        response.headers.set('x-user-organization', user.organizationId);
      }
    }

    return response;
  };
}

// Server-side auth helpers
export function getServerAuthUser(request: NextRequest): AuthUser | null {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  const userRole = request.headers.get('x-user-role');
  const userPermissions = request.headers.get('x-user-permissions');
  const userOrganization = request.headers.get('x-user-organization');

  if (!userId || !userEmail || !userRole) {
    return null;
  }

  return {
    id: userId,
    email: userEmail,
    role: userRole,
    permissions: userPermissions ? JSON.parse(userPermissions) : [],
    organizationId: userOrganization || undefined,
  };
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = getServerAuthUser(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export function requireRole(request: NextRequest, roles: string | string[]): AuthUser {
  const user = requireAuth(request);
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
  }
  
  return user;
}

export function requirePermission(request: NextRequest, permissions: string | string[]): AuthUser {
  const user = requireAuth(request);
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  
  const hasPermission = requiredPermissions.some(permission => 
    user.permissions.includes(permission) || user.role === 'admin'
  );
  
  if (!hasPermission) {
    throw new Error(`Access denied. Required permission: ${requiredPermissions.join(' or ')}`);
  }
  
  return user;
}

// API route helpers
export function withAuth<T = any>(
  handler: (request: NextRequest, context: { user: AuthUser; params?: T }) => Promise<Response>
) {
  return async (request: NextRequest, context: { params?: T }) => {
    try {
      const user = requireAuth(request);
      return await handler(request, { ...context, user });
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: error instanceof Error ? error.message : 'Authentication failed' 
        },
        { status: 401 }
      );
    }
  };
}

export function withRole<T = any>(
  roles: string | string[],
  handler: (request: NextRequest, context: { user: AuthUser; params?: T }) => Promise<Response>
) {
  return async (request: NextRequest, context: { params?: T }) => {
    try {
      const user = requireRole(request, roles);
      return await handler(request, { ...context, user });
    } catch (error) {
      const status = error instanceof Error && error.message.includes('Authentication') ? 401 : 403;
      return NextResponse.json(
        { 
          success: false, 
          message: error instanceof Error ? error.message : 'Access denied' 
        },
        { status }
      );
    }
  };
}

export function withPermission<T = any>(
  permissions: string | string[],
  handler: (request: NextRequest, context: { user: AuthUser; params?: T }) => Promise<Response>
) {
  return async (request: NextRequest, context: { params?: T }) => {
    try {
      const user = requirePermission(request, permissions);
      return await handler(request, { ...context, user });
    } catch (error) {
      const status = error instanceof Error && error.message.includes('Authentication') ? 401 : 403;
      return NextResponse.json(
        { 
          success: false, 
          message: error instanceof Error ? error.message : 'Access denied' 
        },
        { status }
      );
    }
  };
}