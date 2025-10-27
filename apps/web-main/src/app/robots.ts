import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com';

  return {
    rules: [
      // Allow all crawlers for public content
      {
        userAgent: '*',
        allow: [
          '/',
          '/services/',
          '/locations/',
          '/resources/',
          '/blog/',
          '/case-studies/',
          '/ai-agents/',
          '/about',
          '/contact',
          '/pricing',
          '/enterprise',
          '/legal/',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/',
          '/_next/',
          '/private/',
          '*.json',
          '*.xml',
          '/tmp/',
          '/temp/',
        ],
      },
      // Specific rules for AI crawlers (GPT, Claude, Bard, etc.)
      {
        userAgent: [
          'GPTBot',
          'Google-Extended',
          'CCBot',
          'Claude-Web',
          'anthropic-ai',
          'ChatGPT-User',
        ],
        allow: [
          '/',
          '/services/',
          '/blog/',
          '/resources/guides/',
          '/about',
          '/contact',
          '/pricing',
          '/legal/privacy',
          '/legal/terms',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/',
          '/case-studies/',
          '/resources/whitepapers/',
          '/locations/',
        ],
        crawlDelay: 1,
      },
      // Specific optimization for OpenAI's crawler
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/',
          '/services/ai-development',
          '/services/ai-integration',
          '/services/custom-software-development',
          '/blog/',
          '/ai-agents/',
          '/about',
          '/contact',
        ],
        disallow: ['*'],
        crawlDelay: 2,
      },
      // Specific rules for search engines
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'Slurp',
          'DuckDuckBot',
          'Baiduspider',
          'YandexBot',
        ],
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/',
          '/_next/',
        ],
        crawlDelay: 0.1,
      },
      // Block aggressive crawlers
      {
        userAgent: [
          'SemrushBot',
          'AhrefsBot',
          'MJ12bot',
          'DotBot',
          'BLEXBot',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}