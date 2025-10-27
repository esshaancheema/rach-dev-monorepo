export class SecurityHeaders {
  private static readonly CSP_SOURCES = {
    default: ["'self'"],
    script: [
      "'self'",
      "'unsafe-inline'", // Needed for Next.js
      "'unsafe-eval'", // Needed for development
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://static.hotjar.com",
      "https://www.clarity.ms",
      "blob:",
    ],
    style: [
      "'self'",
      "'unsafe-inline'", // Needed for styled-components and Tailwind
      "https://fonts.googleapis.com",
    ],
    font: [
      "'self'",
      "https://fonts.gstatic.com",
      "data:",
    ],
    img: [
      "'self'",
      "data:",
      "blob:",
      "https:",
      "https://www.google-analytics.com",
      "https://static.hotjar.com",
    ],
    connect: [
      "'self'",
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com",
      "https://api.github.com",
      "https://api.openai.com",
      "https://api.anthropic.com",
    ],
    frame: [
      "'self'",
      "https://www.youtube.com",
      "https://player.vimeo.com",
      "blob:",
    ],
    object: ["'none'"],
    base: ["'self'"],
    form: ["'self'"],
  };

  getHeaders(options: {
    pathname: string;
    isAPIRoute?: boolean;
    isDevelopment?: boolean;
  }): Record<string, string> {
    const { pathname, isAPIRoute = false, isDevelopment = false } = options;
    
    const headers: Record<string, string> = {
      // Basic security headers
      ...this.getBasicHeaders(),
      
      // Content Security Policy
      'Content-Security-Policy': this.buildCSP(isDevelopment),
      
      // Additional security headers
      'Permissions-Policy': this.getPermissionsPolicy(),
      'Cross-Origin-Embedder-Policy': 'unsafe-none', // Allow third-party embeds
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    };

    // API-specific headers
    if (isAPIRoute) {
      headers['X-Content-Type-Options'] = 'nosniff';
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      // Page-specific headers
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }

    // Remove development-only headers in production
    if (!isDevelopment) {
      headers['X-Powered-By'] = ''; // Remove X-Powered-By header
    }

    return headers;
  }

  getBasicHeaders(): Record<string, string> {
    return {
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Enable XSS protection
      'X-XSS-Protection': '1; mode=block',
      
      // Prevent clickjacking
      'X-Frame-Options': 'SAMEORIGIN',
      
      // Strict Transport Security (HTTPS only)
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Referrer Policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // DNS Prefetch Control
      'X-DNS-Prefetch-Control': 'on',
      
      // Server information hiding
      'Server': 'Zoptal/1.0',
    };
  }

  private buildCSP(isDevelopment: boolean): string {
    const sources = { ...SecurityHeaders.CSP_SOURCES };
    
    // Add development-specific sources
    if (isDevelopment) {
      sources.script.push('http://localhost:*', 'ws://localhost:*');
      sources.connect.push('http://localhost:*', 'ws://localhost:*');
    }

    const directives = [
      `default-src ${sources.default.join(' ')}`,
      `script-src ${sources.script.join(' ')}`,
      `style-src ${sources.style.join(' ')}`,
      `font-src ${sources.font.join(' ')}`,
      `img-src ${sources.img.join(' ')}`,
      `connect-src ${sources.connect.join(' ')}`,
      `frame-src ${sources.frame.join(' ')}`,
      `object-src ${sources.object.join(' ')}`,
      `base-uri ${sources.base.join(' ')}`,
      `form-action ${sources.form.join(' ')}`,
      `frame-ancestors 'self'`,
      `block-all-mixed-content`,
      `upgrade-insecure-requests`,
    ];

    return directives.join('; ');
  }

  private getPermissionsPolicy(): string {
    const permissions = [
      'accelerometer=()',
      'autoplay=(self)',
      'camera=()',
      'display-capture=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'sync-xhr=()',
      'usb=()',
      'web-share=()',
      'xr-spatial-tracking=()',
    ];

    return permissions.join(', ');
  }

  // Generate nonce for inline scripts (CSP Level 3)
  generateNonce(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('base64');
  }

  // Validate CSP report
  validateCSPReport(report: any): boolean {
    if (!report['csp-report']) return false;
    
    const cspReport = report['csp-report'];
    const requiredFields = ['document-uri', 'violated-directive', 'blocked-uri'];
    
    return requiredFields.every(field => field in cspReport);
  }

  // Security headers for different environments
  getEnvironmentHeaders(environment: 'development' | 'staging' | 'production'): Record<string, string> {
    const baseHeaders = this.getBasicHeaders();
    
    switch (environment) {
      case 'development':
        return {
          ...baseHeaders,
          'Strict-Transport-Security': '', // Disable HSTS in development
          'Content-Security-Policy-Report-Only': this.buildCSP(true), // Report-only mode
        };
        
      case 'staging':
        return {
          ...baseHeaders,
          'Content-Security-Policy': this.buildCSP(false),
          'X-Robots-Tag': 'noindex, nofollow', // Prevent indexing
        };
        
      case 'production':
      default:
        return {
          ...baseHeaders,
          'Content-Security-Policy': this.buildCSP(false),
          'Expect-CT': 'max-age=86400, enforce',
        };
    }
  }
}