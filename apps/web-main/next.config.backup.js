const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
let nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: [
      'images.ctfassets.net', 
      'cdn.sanity.io',
      'res.cloudinary.com',
      'zoptal.com',
      'cdn.zoptal.com',
      'images.unsplash.com',
      'via.placeholder.com'
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Internationalization
  i18n: {
    locales: ['en', 'es', 'fr', 'de', 'ar', 'hi', 'zh'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  
  // Headers for security and SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/services/custom-software',
        destination: '/services/custom-software-development',
        permanent: true,
      },
      // Add more redirects as needed
    ];
  },
  
  // Rewrites for API proxy - only if environment variables exist
  async rewrites() {
    const rewrites = [];
    
    if (process.env.AUTH_SERVICE_URL) {
      rewrites.push({
        source: '/api/auth/:path*',
        destination: `${process.env.AUTH_SERVICE_URL}/api/auth/:path*`,
      });
    }
    
    if (process.env.AI_SERVICE_URL) {
      rewrites.push({
        source: '/api/ai/:path*',
        destination: `${process.env.AI_SERVICE_URL}/api/ai/:path*`,
      });
    }
    
    return rewrites;
  },
  
  experimental: {
    optimizeCss: false,
    scrollRestoration: true,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com',
  },
};

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Sentry configuration
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

// Apply configurations conditionally
if (process.env.SENTRY_DSN) {
  nextConfig = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
}

if (process.env.ANALYZE === 'true') {
  nextConfig = withBundleAnalyzer(nextConfig);
}

module.exports = nextConfig;