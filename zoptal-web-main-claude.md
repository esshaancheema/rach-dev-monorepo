# CLAUDE.md - Zoptal Main Website (web-main)

## Project Overview
The main website is the public-facing, SEO-optimized front door to Zoptal. It must rank for 150+ target keywords, handle AI crawler indexing, support 50,000+ concurrent users, and convert visitors into customers. This is a Next.js 14+ application using App Router with aggressive SEO optimization and performance tuning.

## Technical Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **UI Components**: @zoptal/ui (shared components)
- **Database**: PostgreSQL (via @zoptal/database)
- **CMS**: Contentful/Sanity (for blog/dynamic content)
- **Analytics**: Google Analytics 4 + Posthog
- **SEO Tools**: Next-SEO + Custom Schema Generator
- **Performance**: Vercel Edge Functions + ISR
- **AI Integration**: Claude API, OpenAI, Google AI
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand (minimal)
- **Animations**: Framer Motion
- **Monitoring**: Sentry + Vercel Analytics

## Project Structure

```
apps/web-main/
├── app/                                    # Next.js App Router
│   ├── (public)/                          # Public routes group
│   │   ├── layout.tsx                     # Main layout with header/footer
│   │   ├── page.tsx                       # Homepage
│   │   ├── solutions/
│   │   │   ├── products/
│   │   │   │   ├── page.tsx              # All products listing
│   │   │   │   ├── [category]/
│   │   │   │   │   └── page.tsx          # Category listing
│   │   │   │   └── [category]/[product]/
│   │   │   │       └── page.tsx          # Product detail
│   │   │   ├── technology-stack/
│   │   │   │   └── page.tsx
│   │   │   └── ai-agents/
│   │   │       └── page.tsx
│   │   ├── services/                      # Service pages (SEO-critical)
│   │   │   ├── page.tsx                   # Services overview
│   │   │   ├── custom-software-development/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── enterprise/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── startup/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── by-industry/
│   │   │   │       ├── healthcare/
│   │   │   │       ├── finance/
│   │   │   │       ├── retail/
│   │   │   │       └── [industry]/
│   │   │   │           └── page.tsx
│   │   │   ├── mobile-app-development/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── ios/
│   │   │   │   ├── android/
│   │   │   │   └── cross-platform/
│   │   │   ├── ai-agents-development/
│   │   │   ├── saas-development/
│   │   │   │   ├── micro-saas/
│   │   │   │   └── enterprise-saas/
│   │   │   └── enterprise-solutions/
│   │   ├── locations/                     # Location pages (Programmatic SEO)
│   │   │   ├── page.tsx                   # All locations
│   │   │   └── [country]/
│   │   │       ├── page.tsx               # Country overview
│   │   │       └── [city]/
│   │   │           ├── page.tsx           # City + all services
│   │   │           └── [service]/
│   │   │               └── page.tsx       # City + specific service
│   │   ├── case-studies/
│   │   │   ├── page.tsx
│   │   │   ├── by-industry/
│   │   │   ├── by-technology/
│   │   │   ├── by-solution/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── resources/
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── documentation/
│   │   │   ├── api-reference/
│   │   │   ├── whitepapers/
│   │   │   └── help-center/
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── enterprise/
│   │   │   └── page.tsx
│   │   ├── ai-agents/
│   │   │   └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   └── legal/
│   │       ├── privacy/
│   │       ├── terms/
│   │       ├── cookies/
│   │       └── gdpr/
│   ├── (auth)/                            # Auth routes (client-side)
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── api/                               # API routes
│   │   ├── ai-demo/                       # AI demo endpoint
│   │   ├── lead-capture/                  # Form submissions
│   │   ├── newsletter/                    # Email subscription
│   │   └── revalidate/                    # ISR revalidation
│   ├── robots.ts                          # Dynamic robots.txt
│   ├── sitemap.ts                         # Dynamic sitemap
│   ├── manifest.ts                        # PWA manifest
│   └── opengraph-image.tsx                # OG image generation
├── components/
│   ├── seo/
│   │   ├── SEOHead.tsx                    # Meta tags manager
│   │   ├── StructuredData.tsx             # JSON-LD schemas
│   │   ├── AIMetaTags.tsx                 # AI crawler optimization
│   │   └── LocalBusinessSchema.tsx        # Location schemas
│   ├── sections/
│   │   ├── HeroSection/
│   │   │   ├── index.tsx
│   │   │   ├── AIPromptBuilder.tsx        # Lovable.dev-style prompt
│   │   │   ├── LivePreview.tsx            # Real-time preview
│   │   │   └── TrustIndicators.tsx       # Social proof
│   │   ├── WhyChooseZoptal.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── ReadyBuiltSolutions.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── PoweredBySection.tsx
│   │   ├── RecentlyDelivered.tsx
│   │   └── CTASection.tsx
│   ├── layout/
│   │   ├── Header/
│   │   │   ├── index.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   └── LanguageSelector.tsx
│   │   └── Footer/
│   │       ├── index.tsx
│   │       └── Newsletter.tsx
│   └── ui/                                # Local UI components
├── lib/
│   ├── seo/
│   │   ├── generateMetadata.ts            # Dynamic metadata
│   │   ├── schemas.ts                     # Schema generators
│   │   └── keywords.ts                    # Keyword mapping
│   ├── api/
│   │   ├── client.ts                      # API client
│   │   └── endpoints.ts                   # API endpoints
│   ├── utils/
│   │   ├── analytics.ts                   # Analytics helpers
│   │   ├── performance.ts                 # Performance monitoring
│   │   └── location.ts                    # Location detection
│   └── constants/
│       ├── navigation.ts                  # Nav structure
│       ├── services.ts                    # Services data
│       └── locations.ts                   # Locations data
├── hooks/
│   ├── useAnalytics.ts
│   ├── useLocation.ts
│   └── useAIDemo.ts
├── styles/
│   ├── globals.css
│   └── variables.css
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── tests/
│   ├── seo/                               # SEO tests
│   ├── performance/                       # Performance tests
│   └── e2e/                              # E2E tests
├── scripts/
│   ├── generate-sitemap.ts
│   ├── check-seo.ts
│   └── analyze-bundle.ts
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

## Implementation Details

### 1. Package.json Configuration

```json
{
  "name": "@zoptal/web-main",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "analyze": "ANALYZE=true next build",
    "seo:check": "tsx scripts/check-seo.ts",
    "sitemap:generate": "tsx scripts/generate-sitemap.ts"
  },
  "dependencies": {
    "@zoptal/ui": "workspace:*",
    "@zoptal/database": "workspace:*",
    "next": "14.2.3",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "framer-motion": "^11.0.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "next-seo": "^6.4.0",
    "@vercel/analytics": "^1.2.0",
    "@vercel/speed-insights": "^1.0.0",
    "posthog-js": "^1.100.0",
    "@sentry/nextjs": "^7.100.0",
    "axios": "^1.6.0",
    "swr": "^2.2.0",
    "react-intersection-observer": "^9.8.0",
    "react-lazy-load-image-component": "^1.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@zoptal/eslint-config": "workspace:*",
    "@zoptal/tsconfig": "workspace:*",
    "@next/bundle-analyzer": "^14.1.0",
    "@playwright/test": "^1.41.0",
    "vitest": "^1.2.0",
    "typescript": "^5.4.0"
  }
}
```

### 2. Next.js Configuration (next.config.js)

```javascript
const { withSentryConfig } = require('@sentry/nextjs');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['images.ctfassets.net', 'cdn.sanity.io'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Internationalization
  i18n: {
    locales: ['en', 'es', 'fr', 'de', 'ar', 'hi', 'zh'],
    defaultLocale: 'en',
    localeDetection: true,
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
  
  // Rewrites for API proxy
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: `${process.env.AUTH_SERVICE_URL}/api/auth/:path*`,
      },
      {
        source: '/api/ai/:path*',
        destination: `${process.env.AI_SERVICE_URL}/api/ai/:path*`,
      },
    ];
  },
  
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

module.exports = withSentryConfig(
  withBundleAnalyzer(nextConfig),
  {
    silent: true,
    org: 'zoptal',
    project: 'web-main',
  }
);
```

### 3. SEO Implementation

#### app/robots.ts (Dynamic Robots.txt)
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://zoptal.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/'],
      },
      // Specific rules for AI crawlers
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'CCBot',
        allow: '/',
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
```

#### app/sitemap.ts (Dynamic Sitemap Generation)
```typescript
import { MetadataRoute } from 'next';
import { LOCATIONS, SERVICES, INDUSTRIES } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zoptal.com';
  const currentDate = new Date();
  
  // Static pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/pricing',
    '/enterprise',
    '/ai-agents',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
  
  // Service pages
  const servicePages = SERVICES.flatMap(service => [
    {
      url: `${baseUrl}/services/${service.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    // Service + Industry combinations
    ...INDUSTRIES.map(industry => ({
      url: `${baseUrl}/services/${service.slug}/by-industry/${industry.slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]);
  
  // Location pages (Programmatic SEO)
  const locationPages = LOCATIONS.flatMap(location => [
    // Country page
    {
      url: `${baseUrl}/locations/${location.country}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    // City page
    {
      url: `${baseUrl}/locations/${location.country}/${location.city}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    // City + Service combinations
    ...SERVICES.map(service => ({
      url: `${baseUrl}/locations/${location.country}/${location.city}/${service.slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]);
  
  // Blog posts (fetch from CMS)
  const blogPosts = await fetchBlogPosts();
  const blogPages = blogPosts.map(post => ({
    url: `${baseUrl}/resources/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));
  
  // Case studies
  const caseStudies = await fetchCaseStudies();
  const caseStudyPages = caseStudies.map(study => ({
    url: `${baseUrl}/case-studies/${study.slug}`,
    lastModified: new Date(study.updatedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));
  
  return [
    ...staticPages,
    ...servicePages,
    ...locationPages,
    ...blogPages,
    ...caseStudyPages,
  ];
}
```

### 4. Core Components Implementation

#### components/seo/SEOHead.tsx
```typescript
import { NextSeo, NextSeoProps } from 'next-seo';
import { useRouter } from 'next/navigation';

interface SEOHeadProps extends NextSeoProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
  structuredData?: any[];
}

export function SEOHead({
  title,
  description,
  keywords,
  image,
  noindex = false,
  structuredData,
  ...props
}: SEOHeadProps) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com';
  const url = `${baseUrl}${router.pathname}`;
  
  const fullTitle = `${title} | Zoptal - AI-Accelerated Development Platform`;
  
  return (
    <>
      <NextSeo
        title={fullTitle}
        description={description}
        canonical={url}
        noindex={noindex}
        openGraph={{
          url,
          title: fullTitle,
          description,
          images: image ? [
            {
              url: `${baseUrl}${image}`,
              width: 1200,
              height: 630,
              alt: title,
            }
          ] : undefined,
          siteName: 'Zoptal',
          type: 'website',
        }}
        twitter={{
          handle: '@zoptal',
          site: '@zoptal',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: keywords?.join(', ') || '',
          },
          {
            name: 'author',
            content: 'Zoptal',
          },
          // AI Crawler optimization
          {
            name: 'ai-content-type',
            content: 'software-development-platform',
          },
          {
            name: 'ai-content-category',
            content: 'technology,software,development,ai',
          },
          {
            name: 'ai-content-language',
            content: 'en',
          },
        ]}
        {...props}
      />
      
      {/* Structured Data */}
      {structuredData?.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </>
  );
}
```

#### components/sections/HeroSection/index.tsx
```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AIPromptBuilder } from './AIPromptBuilder';
import { LivePreview } from './LivePreview';
import { TrustIndicators } from './TrustIndicators';
import { Button } from '@zoptal/ui';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useLocation } from '@/hooks/useLocation';

export function HeroSection() {
  const [prompt, setPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [preview, setPreview] = useState(null);
  const { track } = useAnalytics();
  const { location, loading: locationLoading } = useLocation();
  
  // Personalized title based on location
  const getTitle = () => {
    if (locationLoading) return 'Build Your App In Hours, Not Months';
    
    const cityName = location?.city || 'Your City';
    return `Best Software Development Company in ${cityName} - Build Apps In Hours`;
  };
  
  const handlePromptSubmit = async (userPrompt: string) => {
    setPrompt(userPrompt);
    setIsBuilding(true);
    
    track('hero_prompt_submitted', {
      prompt: userPrompt,
      location: location?.city,
    });
    
    try {
      const response = await fetch('/api/ai-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt }),
      });
      
      const data = await response.json();
      setPreview(data);
    } catch (error) {
      console.error('Error building preview:', error);
    } finally {
      setIsBuilding(false);
    }
  };
  
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Dynamic Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            {getTitle()}
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-2xl text-center text-gray-600 mb-12 max-w-3xl mx-auto"
          >
            The World's First AI+Human Accelerated Application Development Platform 
            that combines the Power Of Artificial Intelligence with Human Software 
            Engineers to Deliver Production-Ready Applications at God Speed
          </motion.p>
          
          {/* AI Prompt Builder */}
          <div className="grid lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2">
              <AIPromptBuilder
                onSubmit={handlePromptSubmit}
                isBuilding={isBuilding}
                freeTrialLimit={3}
              />
            </div>
            <div className="lg:col-span-3">
              <LivePreview
                preview={preview}
                isLoading={isBuilding}
              />
            </div>
          </div>
          
          {/* Trust Indicators */}
          <TrustIndicators />
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button size="lg" variant="gradient" className="text-lg px-8">
              Start Building Now
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Schedule Free Consultation
            </Button>
          </div>
          
          {/* Live Stats Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>1,247 developers building right now</span>
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

### 5. Programmatic SEO Pages

#### app/(public)/locations/[country]/[city]/page.tsx
```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOHead } from '@/components/seo/SEOHead';
import { generateLocalBusinessSchema } from '@/lib/seo/schemas';
import { LOCATIONS, SERVICES } from '@/lib/constants';

interface PageProps {
  params: {
    country: string;
    city: string;
  };
}

// Generate static params for all location combinations
export async function generateStaticParams() {
  return LOCATIONS.map((location) => ({
    country: location.country,
    city: location.city,
  }));
}

// Dynamic metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const location = LOCATIONS.find(
    (loc) => loc.country === params.country && loc.city === params.city
  );
  
  if (!location) return notFound();
  
  const cityName = location.displayName;
  const countryName = location.countryName;
  
  return {
    title: `Best Software Development Company in ${cityName} | Zoptal`,
    description: `Looking for the #1 software development company in ${cityName}? Zoptal offers AI-accelerated custom software, mobile app, and SaaS development services in ${cityName}, ${countryName}. Get a free consultation today!`,
    keywords: [
      `software development ${cityName}`,
      `app development ${cityName}`,
      `AI development ${cityName}`,
      `custom software ${cityName}`,
      `SaaS development ${cityName}`,
      `best developers ${cityName}`,
    ],
  };
}

export default function LocationPage({ params }: PageProps) {
  const location = LOCATIONS.find(
    (loc) => loc.country === params.country && loc.city === params.city
  );
  
  if (!location) notFound();
  
  const structuredData = [
    generateLocalBusinessSchema({
      name: `Zoptal ${location.displayName}`,
      address: location.address,
      geo: location.coordinates,
      url: `https://zoptal.com/locations/${params.country}/${params.city}`,
    }),
  ];
  
  return (
    <>
      <SEOHead
        title={`Best Software Development Company in ${location.displayName}`}
        description={`Looking for the #1 software development company in ${location.displayName}? Zoptal offers AI-accelerated custom software, mobile app, and SaaS development services.`}
        structuredData={structuredData}
      />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-bold text-center mb-6">
              #1 Software Development Company in {location.displayName}
            </h1>
            <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
              Transform your business with AI-accelerated development. 
              From startups to enterprises, we deliver production-ready 
              applications in hours, not months.
            </p>
          </div>
        </section>
        
        {/* Services Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Our Services in {location.displayName}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {SERVICES.map((service) => (
                <ServiceCard
                  key={service.slug}
                  service={service}
                  location={location}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Local Statistics */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <StatCard
                title="Local Projects"
                value={location.stats.projects}
                suffix="+"
              />
              <StatCard
                title="Happy Clients"
                value={location.stats.clients}
                suffix="+"
              />
              <StatCard
                title="Team Members"
                value={location.stats.teamSize}
              />
              <StatCard
                title="Years Active"
                value={location.stats.yearsActive}
              />
            </div>
          </div>
        </section>
        
        {/* Local Case Studies */}
        <section className="py-20">
          <LocalCaseStudies location={location} />
        </section>
        
        {/* Contact CTA */}
        <section className="bg-blue-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Start Your Project in {location.displayName}?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Get a free consultation with our local team and receive 
              a detailed project estimate within 24 hours.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="white">
                Schedule Consultation
              </Button>
              <Button size="lg" variant="outline-white">
                Call {location.phone}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
```

### 6. Performance Optimization

#### lib/utils/performance.ts
```typescript
// Image optimization helper
export function getOptimizedImageUrl(
  src: string,
  width: number,
  quality = 75
): string {
  // If using Cloudinary or similar
  return `${src}?w=${width}&q=${quality}&fm=webp`;
}

// Lazy loading with Intersection Observer
export function lazyLoad(
  selector: string,
  callback: (element: Element) => void
) {
  const elements = document.querySelectorAll(selector);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  });
  
  elements.forEach((el) => observer.observe(el));
}

// Prefetch critical resources
export function prefetchCriticalResources() {
  const links = [
    '/api/auth/session',
    '/api/locations',
    '/fonts/inter-var.woff2',
  ];
  
  links.forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  });
}
```

### 7. Analytics Implementation

#### lib/utils/analytics.ts
```typescript
import { Analytics } from '@vercel/analytics/react';
import posthog from 'posthog-js';

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.opt_out_capturing();
    },
  });
}

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, properties);
    }
    
    // PostHog
    posthog.capture(event, properties);
    
    // Custom tracking endpoint
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties }),
    });
  },
  
  identify: (userId: string, traits?: Record<string, any>) => {
    posthog.identify(userId, traits);
  },
  
  page: (name?: string, properties?: Record<string, any>) => {
    posthog.capture('$pageview', { name, ...properties });
  },
};
```

### 8. Testing Strategy

#### tests/seo/metadata.test.ts
```typescript
import { test, expect } from '@playwright/test';

test.describe('SEO Metadata Tests', () => {
  test('Homepage has correct meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Title
    const title = await page.title();
    expect(title).toContain('Zoptal - AI-Accelerated Development Platform');
    
    // Description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('AI-accelerated development platform');
    
    // Open Graph
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
    
    // Structured Data
    const structuredData = await page.locator('script[type="application/ld+json"]').count();
    expect(structuredData).toBeGreaterThan(0);
  });
  
  test('Location pages have unique titles', async ({ page }) => {
    const locations = [
      { path: '/locations/usa/new-york', expected: 'New York' },
      { path: '/locations/uae/dubai', expected: 'Dubai' },
    ];
    
    for (const location of locations) {
      await page.goto(location.path);
      const title = await page.title();
      expect(title).toContain(location.expected);
    }
  });
});
```

### 9. Environment Variables (.env.local)

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# API Services
AUTH_SERVICE_URL=http://localhost:4001
PROJECT_SERVICE_URL=http://localhost:4002
AI_SERVICE_URL=http://localhost:4003

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# CMS
CONTENTFUL_SPACE_ID=xxxxx
CONTENTFUL_ACCESS_TOKEN=xxxxx
CONTENTFUL_PREVIEW_TOKEN=xxxxx

# AI Services
OPENAI_API_KEY=sk-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Email
SENDGRID_API_KEY=SG.xxxxx

# Maps (for location pages)
NEXT_PUBLIC_GOOGLE_MAPS_KEY=xxxxx
```

### 10. Deployment Optimizations

#### Vercel Configuration (vercel.json)
```json
{
  "functions": {
    "app/api/ai-demo/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/services/custom-software",
      "destination": "/services/custom-software-development",
      "permanent": true
    }
  ]
}
```

## SEO Checklist

- [ ] All pages have unique, keyword-rich titles (< 60 chars)
- [ ] Meta descriptions are compelling and unique (< 160 chars)
- [ ] Implement hreflang tags for internationalization
- [ ] Schema markup on all pages (Organization, LocalBusiness, Service, etc.)
- [ ] XML sitemap auto-generated and submitted
- [ ] Robots.txt optimized for AI crawlers
- [ ] Open Graph and Twitter cards implemented
- [ ] Canonical URLs set correctly
- [ ] Mobile-responsive design (Mobile-first)
- [ ] Core Web Vitals optimized (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Image optimization (WebP, lazy loading, proper dimensions)
- [ ] Internal linking structure optimized
- [ ] 404 page with helpful navigation
- [ ] SSL certificate installed
- [ ] Page speed > 90 on PageSpeed Insights

## Performance Targets

- **First Contentful Paint**: < 1.2s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.8s
- **Total Blocking Time**: < 200ms
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: < 200KB (First Load JS)

## Next Steps

1. Implement all static pages with SEO optimization
2. Set up CMS integration for dynamic content
3. Create location-specific landing pages
4. Implement A/B testing framework
5. Set up comprehensive analytics
6. Configure CDN and caching strategies
7. Implement progressive enhancement
8. Create AMP versions for blog posts
9. Set up structured data testing
10. Implement international SEO strategy
