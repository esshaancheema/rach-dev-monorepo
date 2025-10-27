import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth/middleware';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale, extractLocaleFromPath } from '@/lib/seo/hreflang';
import { SecurityHeaders } from '@/lib/security/security-headers';
import { RateLimiter } from '@/lib/security/rate-limiter';
import { ThreatDetection } from '@/lib/security/threat-detection';
import { GeoBlocking } from '@/lib/security/geo-blocking';

// Initialize security modules
const securityHeaders = new SecurityHeaders();
const rateLimiter = new RateLimiter();
const threatDetection = new ThreatDetection();
const geoBlocking = new GeoBlocking();

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Skip middleware for static files, but apply security to API routes
  const isStaticFile = pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    (pathname.includes('.') && !pathname.startsWith('/api/'));
  
  if (isStaticFile) {
    return NextResponse.next();
  }

  // Apply security checks for all non-static requests
  try {
    // 1. THREAT DETECTION - Analyze request for suspicious patterns
    const threatAnalysis = await threatDetection.analyzeRequest({
      ip: clientIP,
      userAgent,
      pathname,
      searchParams: Object.fromEntries(searchParams.entries()),
      referer: request.headers.get('referer') || '',
      method: request.method,
      headers: Object.fromEntries(request.headers.entries())
    });

    if (threatAnalysis.isThreat && threatAnalysis.riskScore >= 8) {
      return new NextResponse('Request blocked for security reasons', { 
        status: 403,
        headers: {
          'X-Blocked-Reason': 'Security-threat',
          'X-Risk-Score': threatAnalysis.riskScore.toString()
        }
      });
    }

    // 2. RATE LIMITING - Check request limits
    const rateLimitResult = await rateLimiter.checkLimit({
      identifier: clientIP,
      pathname,
      userAgent
    });

    if (!rateLimitResult.allowed) {
      return new NextResponse('Rate limit exceeded', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      });
    }

    // 3. GEO BLOCKING - Check location-based restrictions
    const geoCheck = await geoBlocking.checkCountry(clientIP);
    if (geoCheck.blocked) {
      return new NextResponse('Access denied from your location', { 
        status: 403,
        headers: {
          'X-Blocked-Reason': 'Geo-blocked',
          'X-Block-Country': geoCheck.country || 'Unknown'
        }
      });
    }

  } catch (error) {
    console.error('Security middleware error:', error);
    // Continue with request on security check failure
  }
  
  // Handle locale routing
  const locale = extractLocaleFromPath(pathname);
  const pathnameHasLocale = pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`;
  
  // If no locale in pathname and it's not the default locale path
  if (!pathnameHasLocale && !isSupportedLocale(pathname.split('/')[1])) {
    // Check if user has a preferred locale from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    let preferredLocale = DEFAULT_LOCALE;
    
    if (acceptLanguage) {
      const supportedLocaleCodes = SUPPORTED_LOCALES.map(l => l.code);
      const browserLanguages = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].split('-')[0].trim().toLowerCase());
      
      for (const lang of browserLanguages) {
        if (supportedLocaleCodes.includes(lang)) {
          preferredLocale = lang;
          break;
        }
      }
    }
    
    // Only redirect if preferred locale is not the default
    if (preferredLocale !== DEFAULT_LOCALE) {
      const redirectUrl = new URL(`/${preferredLocale}${pathname}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // Apply authentication middleware and add security headers
  const response = await authMiddleware(request);
  
  // Add security headers to response
  const headers = securityHeaders.getHeaders({
    pathname,
    isAPIRoute: pathname.startsWith('/api/'),
    isDevelopment: process.env.NODE_ENV === 'development'
  });

  Object.entries(headers).forEach(([key, value]) => {
    if (value) response.headers.set(key, value);
  });

  return response;
}

// Helper function to extract client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return request.ip || '127.0.0.1';
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};