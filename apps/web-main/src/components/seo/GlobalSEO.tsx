'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface GlobalSEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  alternateUrls?: {
    [locale: string]: string;
  };
}

const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'ar', 'hi', 'zh'];
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com';

export default function GlobalSEO({ 
  title, 
  description, 
  canonicalUrl,
  noIndex = false,
  alternateUrls 
}: GlobalSEOProps) {
  const pathname = usePathname();
  
  // Generate canonical URL
  const canonical = canonicalUrl || `${BASE_URL}${pathname}`;
  
  // Generate hreflang URLs
  const generateHreflangUrls = () => {
    if (alternateUrls) {
      return alternateUrls;
    }
    
    // Auto-generate hreflang URLs based on current path
    const hreflangUrls: { [locale: string]: string } = {};
    
    SUPPORTED_LOCALES.forEach(locale => {
      if (locale === 'en') {
        // English is default locale, no prefix
        hreflangUrls[locale] = `${BASE_URL}${pathname}`;
      } else {
        // Add locale prefix for other languages
        hreflangUrls[locale] = `${BASE_URL}/${locale}${pathname}`;
      }
    });
    
    return hreflangUrls;
  };
  
  const hreflangUrls = generateHreflangUrls();
  
  // Optimize title length (max 60 characters)
  const optimizedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  
  // Optimize description length (max 160 characters)
  const optimizedDescription = description.length > 160 ? description.substring(0, 157) + '...' : description;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{optimizedTitle}</title>
      <meta name="description" content={optimizedDescription} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Hreflang Tags */}
      {Object.entries(hreflangUrls).map(([locale, url]) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={url}
        />
      ))}
      
      {/* x-default for international targeting */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={hreflangUrls.en}
      />
      
      {/* Robots Meta */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={optimizedTitle} />
      <meta property="og:description" content={optimizedDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="Zoptal" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={optimizedTitle} />
      <meta name="twitter:description" content={optimizedDescription} />
      <meta name="twitter:site" content="@zoptal" />
      <meta name="twitter:creator" content="@zoptal" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#2563eb" />
      
      {/* DNS Prefetch for better performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//cdn.sanity.io" />
      <link rel="dns-prefetch" href="//images.ctfassets.net" />
      
      {/* Preconnect for critical resources */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Structured Data for Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Zoptal",
            "url": BASE_URL,
            "logo": `${BASE_URL}/images/logo.png`,
            "sameAs": [
              "https://twitter.com/zoptal",
              "https://linkedin.com/company/zoptal",
              "https://github.com/zoptal"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-800-ZOPTAL",
              "contactType": "customer service",
              "availableLanguage": SUPPORTED_LOCALES
            }
          })
        }}
      />
    </Head>
  );
}

// Hook for easy SEO management
export function useSEO(seoData: GlobalSEOProps) {
  return {
    ...seoData,
    // Auto-generate optimized title if not provided
    title: seoData.title || 'Zoptal - AI-Accelerated Development Platform',
    // Auto-generate optimized description if not provided
    description: seoData.description || 'Transform your software development with AI-powered tools, custom solutions, and expert development services. Build faster, smarter, and more efficiently with Zoptal.'
  };
}