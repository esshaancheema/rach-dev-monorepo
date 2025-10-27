/** @type {import('next').NextConfig} */
let nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'zoptal.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.zoptal.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
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
  
  // Security and performance headers
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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? "default-src 'self' 'unsafe-inline' 'unsafe-eval'; font-src 'self' data: https://fonts.gstatic.com https://rsms.me; img-src 'self' data: blob: https:; connect-src 'self' http://localhost:* ws://localhost:* https:;"
              : "default-src 'self'; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Auth API routes - no caching for security
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // OAuth API routes
      {
        source: '/api/oauth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
        ],
      },
      // SAML API routes
      {
        source: '/api/saml/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
        ],
      },
      // AI API routes - CORS support for cross-origin requests
      {
        source: '/api/ai/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://dashboard.zoptal.com' 
              : 'http://localhost:3001',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
        ],
      },
      // Static assets caching
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Auth chunk caching (using proper Next.js parameter syntax)
      {
        source: '/_next/static/chunks/auth-:name.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // SEO redirects
  async redirects() {
    return [
      {
        source: '/services/custom-software',
        destination: '/services/custom-software-development',
        permanent: true,
      },
      {
        source: '/blog/page/:page',
        destination: '/blog?page=:page',
        permanent: false,
      },
      {
        source: '/case-studies/page/:page',
        destination: '/case-studies?page=:page',
        permanent: false,
      },
    ];
  },
  
  // API proxy rewrites
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
  
  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    serverComponentsExternalPackages: ['sharp', '@prisma/client'],
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  
  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Auth components chunk for better caching
          auth: {
            name: 'auth',
            test: /[\\/](auth|components[\\/]auth)[\\/]/,
            priority: 35,
            reuseExistingChunk: true,
          },
          // OAuth and external auth providers
          oauth: {
            name: 'oauth',
            test: /[\\/](oauth|saml|magic-link)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          // React Query chunk
          query: {
            name: 'query',
            test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query/,
            priority: 25,
            reuseExistingChunk: true,
          },
          // Animation library chunk (lazy loaded)
          animation: {
            name: 'animation',
            test: /[\\/]node_modules[\\/]framer-motion/,
            priority: 20,
            reuseExistingChunk: true,
          },
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'all',
            reuseExistingChunk: true,
          },
        },
      };

      // Optimize bundle size
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    return config;
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};

// Conditional configurations
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Apply bundle analyzer if enabled
if (process.env.ANALYZE === 'true') {
  nextConfig = withBundleAnalyzer(nextConfig);
}

module.exports = nextConfig;