'use client';
import Head from 'next/head';
import { NextSeo, NextSeoProps } from 'next-seo';
import { generateHreflangLinks, HreflangLink, DEFAULT_LOCALE } from '@/lib/seo/hreflang';

interface SEOHeadProps extends NextSeoProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  articleTags?: string[];
  type?: 'website' | 'article' | 'location';
  location?: {
    city: string;
    country: string;
    region?: string;
  };
  service?: string;
  noindex?: boolean;
  nofollow?: boolean;
  currentPath?: string;
  currentLocale?: string;
  hreflangLinks?: HreflangLink[];
}

export default function SEOHead({
  title,
  description,
  canonicalUrl,
  keywords = [],
  author = 'Zoptal Technologies',
  publishedTime,
  modifiedTime,
  articleTags = [],
  type = 'website',
  location,
  service,
  noindex = false,
  nofollow = false,
  currentPath,
  currentLocale = DEFAULT_LOCALE,
  hreflangLinks,
  ...nextSeoProps
}: SEOHeadProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com';
  const fullCanonicalUrl = canonicalUrl || baseUrl;
  
  // Generate hreflang links if not provided and we have currentPath
  const finalHreflangLinks = hreflangLinks || 
    (currentPath ? generateHreflangLinks(currentPath, currentLocale, baseUrl) : []);
  
  // Enhanced title based on type
  const enhancedTitle = (() => {
    if (type === 'location' && location) {
      return `${title} in ${location.city}, ${location.country} | Zoptal`;
    }
    if (service) {
      return `${title} - ${service} | Zoptal`;
    }
    return `${title} | Zoptal - AI-Accelerated Development Platform`;
  })();

  // Enhanced description with location/service context
  const enhancedDescription = (() => {
    if (type === 'location' && location) {
      return `${description} Professional services in ${location.city}, ${location.country}. Contact Zoptal for expert solutions.`;
    }
    if (service) {
      return `${description} Expert ${service} services by Zoptal's experienced development team.`;
    }
    return description;
  })();

  // Generate comprehensive keywords
  const seoKeywords = [
    ...keywords,
    'Custom Software Development',
    'AI Development',
    'Mobile App Development',
    'Web Development',
    'Zoptal',
    ...(location ? [
      `Software Development ${location.city}`,
      `AI Development ${location.city}`,
      `App Development ${location.country}`,
    ] : []),
    ...(service ? [service, `${service} Company`] : []),
    ...articleTags,
  ].join(', ');

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
    'max-snippet:-1',
    'max-image-preview:large',
    'max-video-preview:-1',
  ].join(', ');

  return (
    <>
      <NextSeo
        title={enhancedTitle}
        description={enhancedDescription}
        canonical={fullCanonicalUrl}
        robotsProps={{
          nosnippet: noindex,
          notranslate: false,
          noimageindex: noindex,
          noarchive: false,
          maxSnippet: noindex ? 0 : -1,
          maxImagePreview: noindex ? 'none' : 'large',
          maxVideoPreview: noindex ? 0 : -1,
        }}
        openGraph={{
          type: type === 'article' ? 'article' : 'website',
          title: enhancedTitle,
          description: enhancedDescription,
          url: fullCanonicalUrl,
          siteName: 'Zoptal',
          images: [
            {
              url: `${baseUrl}/images/og-image.jpg`,
              width: 1200,
              height: 630,
              alt: enhancedTitle,
              type: 'image/jpeg',
            },
            {
              url: `${baseUrl}/images/og-image-square.jpg`,
              width: 1200,
              height: 1200,
              alt: enhancedTitle,
              type: 'image/jpeg',
            },
          ],
          ...(type === 'article' && {
            article: {
              publishedTime,
              modifiedTime,
              authors: [author],
              tags: articleTags,
            },
          }),
        }}
        twitter={{
          handle: '@Zoptal',
          site: '@Zoptal',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: seoKeywords,
          },
          {
            name: 'author',
            content: author,
          },
          {
            name: 'robots',
            content: robotsContent,
          },
          {
            name: 'googlebot',
            content: robotsContent,
          },
          {
            name: 'bingbot',
            content: robotsContent,
          },
          // Geo tags for location-based pages
          ...(location ? [
            {
              name: 'geo.region',
              content: location.region || location.country,
            },
            {
              name: 'geo.placename',
              content: location.city,
            },
            {
              name: 'geo.position',
              content: '0;0', // Would be replaced with actual coordinates
            },
          ] : []),
          // Business/Service specific tags
          {
            name: 'application-name',
            content: 'Zoptal',
          },
          {
            name: 'msapplication-TileColor',
            content: '#0ea5e9',
          },
          {
            name: 'theme-color',
            content: '#0ea5e9',
          },
          // AI Crawler specific tags
          {
            name: 'ai:context',
            content: service 
              ? `Professional ${service || 'software development'} services by Zoptal`
              : 'Zoptal - AI-Accelerated Development Platform',
          },
          {
            name: 'ai:industry',
            content: 'Software Development, AI, Technology',
          },
          ...(location ? [{
            name: 'ai:location',
            content: `${location.city}, ${location.country}`,
          }] : []),
        ]}
        {...nextSeoProps}
      />
      
      <Head>
        {/* Additional meta tags that NextSeo doesn't handle */}
        <meta name="format-detection" content="telephone=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.zoptal.com" />
        
        {/* DNS prefetch for common external resources */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        
        {/* Hreflang links for internationalization */}
        {finalHreflangLinks.map((link) => (
          <link
            key={link.hreflang}
            rel="alternate"
            hrefLang={link.hreflang}
            href={link.href}
          />
        ))}
      </Head>
    </>
  );
}