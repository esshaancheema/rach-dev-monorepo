import { NextRequest, NextResponse } from 'next/server';

export interface CORSConfig {
  origins?: string[];
  methods?: string[];
  headers?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const defaultConfig: CORSConfig = {
  origins: [
    'http://localhost:3001', // Dashboard dev
    'https://dashboard.zoptal.com', // Dashboard prod
    'http://localhost:3000', // Web-main dev (for local testing)
    'https://zoptal.com', // Web-main prod
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

export function getCORSHeaders(request: NextRequest, config: CORSConfig = {}): Record<string, string> {
  const mergedConfig = { ...defaultConfig, ...config };
  const origin = request.headers.get('origin');
  const requestMethod = request.headers.get('access-control-request-method');
  const requestHeaders = request.headers.get('access-control-request-headers');

  const headers: Record<string, string> = {};

  // Handle origin
  if (origin && mergedConfig.origins) {
    const allowedOrigin = mergedConfig.origins.find(allowedOrigin => {
      // Exact match
      if (allowedOrigin === origin) return true;
      
      // Wildcard support for development
      if (allowedOrigin.includes('*') && process.env.NODE_ENV === 'development') {
        const pattern = allowedOrigin.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      
      return false;
    });

    if (allowedOrigin) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
  }

  // Handle methods
  if (mergedConfig.methods) {
    headers['Access-Control-Allow-Methods'] = mergedConfig.methods.join(', ');
  }

  // Handle headers
  if (mergedConfig.headers) {
    headers['Access-Control-Allow-Headers'] = mergedConfig.headers.join(', ');
  }

  // Handle credentials
  if (mergedConfig.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  // Handle preflight max age
  if (mergedConfig.maxAge && (requestMethod || requestHeaders)) {
    headers['Access-Control-Max-Age'] = mergedConfig.maxAge.toString();
  }

  // Add Vary header for proper caching
  headers['Vary'] = 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers';

  return headers;
}

export function handleCORS(request: NextRequest, config: CORSConfig = {}): NextResponse | null {
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    const headers = getCORSHeaders(request, config);
    return new NextResponse(null, {
      status: 200,
      headers,
    });
  }

  return null;
}

export function withCORS(handler: (request: NextRequest) => Promise<NextResponse>, config: CORSConfig = {}) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight OPTIONS request
    const corsResponse = handleCORS(request, config);
    if (corsResponse) {
      return corsResponse;
    }

    // Execute the actual handler
    const response = await handler(request);

    // Add CORS headers to the response
    const corsHeaders = getCORSHeaders(request, config);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

export function addCORSHeaders(response: NextResponse, request: NextRequest, config: CORSConfig = {}): NextResponse {
  const corsHeaders = getCORSHeaders(request, config);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}