/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@headlessui/react', '@heroicons/react', 'lucide-react']
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  
  // Environment variables
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    API_BASE_URL: process.env.API_BASE_URL,
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Allow embedding for API docs
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Redirects for developer portal
  async redirects() {
    return [
      {
        source: '/',
        destination: '/docs',
        permanent: false,
      },
      {
        source: '/documentation',
        destination: '/docs',
        permanent: true,
      },
    ];
  },
  
  // Rewrites for API documentation
  async rewrites() {
    return [
      {
        source: '/api-docs/:path*',
        destination: '/docs/api/:path*',
      },
    ];
  },
  
  // Output configuration
  output: 'standalone',
  
  // Webpack configuration for handling markdown and code syntax
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });
    
    return config;
  },
};

module.exports = nextConfig;