import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'service';
  schemaType?: 'WebPage' | 'Article' | 'Product' | 'Service' | 'Organization';
  publishedTime?: string;
  updatedTime?: string;
  author?: {
    name: string;
    url?: string;
  };
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
}

export function generateOptimizedMetadata(config: SEOConfig): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com';
  
  // Title optimization
  const optimizedTitle = optimizeTitle(config.title);
  
  // Description optimization
  const optimizedDescription = optimizeDescription(config.description);
  
  // Keywords optimization
  const optimizedKeywords = config.keywords ? optimizeKeywords(config.keywords) : undefined;

  const metadata: Metadata = {
    title: optimizedTitle,
    description: optimizedDescription,
    keywords: optimizedKeywords,
    robots: {
      index: !config.noindex,
      follow: !config.nofollow,
      googleBot: {
        index: !config.noindex,
        follow: !config.nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: config.ogType || 'website',
      title: optimizedTitle,
      description: optimizedDescription,
      url: config.canonical || baseUrl,
      siteName: 'Zoptal - Enterprise Software Development',
      locale: 'en_US',
      images: [
        {
          url: config.ogImage || `${baseUrl}/images/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: optimizedTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: optimizedTitle,
      description: optimizedDescription,
      site: '@zoptal',
      creator: '@zoptal',
      images: [config.ogImage || `${baseUrl}/images/og-default.jpg`],
    },
    alternates: {
      canonical: config.canonical,
      languages: {
        'en-US': baseUrl,
        'de-DE': `${baseUrl}/de`,
        'fr-FR': `${baseUrl}/fr`,
        'es-ES': `${baseUrl}/es`,
        'it-IT': `${baseUrl}/it`,
        'pt-BR': `${baseUrl}/pt`,
        'ja-JP': `${baseUrl}/ja`,
      },
    },
    other: {
      'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
      'msvalidate.01': process.env.BING_SITE_VERIFICATION || '',
      'yandex-verification': process.env.YANDEX_VERIFICATION || '',
    },
  };

  // Add article-specific metadata
  if (config.ogType === 'article' && config.publishedTime) {
    metadata.openGraph = {
      ...metadata.openGraph,
      publishedTime: config.publishedTime,
      modifiedTime: config.updatedTime || config.publishedTime,
      authors: config.author ? [config.author.name] : undefined,
      tags: config.keywords,
    };
  }

  return metadata;
}

function optimizeTitle(title: string): string {
  // Ensure title is between 50-60 characters for optimal SEO
  if (title.length > 60) {
    const words = title.split(' ');
    let optimizedTitle = '';
    
    for (const word of words) {
      if ((optimizedTitle + word).length <= 57) {
        optimizedTitle += (optimizedTitle ? ' ' : '') + word;
      } else {
        break;
      }
    }
    
    return optimizedTitle + '...';
  }
  
  return title;
}

function optimizeDescription(description: string): string {
  // Ensure description is between 150-160 characters for optimal SEO
  if (description.length > 160) {
    const words = description.split(' ');
    let optimizedDescription = '';
    
    for (const word of words) {
      if ((optimizedDescription + word).length <= 157) {
        optimizedDescription += (optimizedDescription ? ' ' : '') + word;
      } else {
        break;
      }
    }
    
    return optimizedDescription + '...';
  }
  
  return description;
}

function optimizeKeywords(keywords: string[]): string[] {
  // Remove duplicates and optimize keyword list
  const uniqueKeywords = Array.from(new Set(keywords.map(k => k.toLowerCase())));
  
  // Limit to 10-15 keywords for optimal SEO
  return uniqueKeywords.slice(0, 15);
}

export function generateStructuredData(config: {
  type: 'WebPage' | 'Article' | 'Product' | 'Service' | 'Organization' | 'BreadcrumbList';
  data: any;
  breadcrumbs?: Array<{ name: string; url: string }>;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com';
  
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': config.type,
    ...config.data,
  };

  // Add breadcrumbs if provided
  if (config.breadcrumbs && config.breadcrumbs.length > 0) {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: config.breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`,
      })),
    };

    return [baseSchema, breadcrumbSchema];
  }

  return baseSchema;
}

export function generateLocalBusinessSchema(location: {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone?: string;
  email?: string;
  hours?: Array<{
    day: string;
    opens: string;
    closes: string;
  }>;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/#organization`,
    name: location.name,
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    image: `${baseUrl}/images/office-${location.address.city.toLowerCase()}.jpg`,
    description: 'Enterprise software development and AI solutions',
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.address.street,
      addressLocality: location.address.city,
      addressRegion: location.address.state,
      postalCode: location.address.postalCode,
      addressCountry: location.address.country,
    },
    telephone: location.phone,
    email: location.email,
    openingHours: location.hours?.map(h => `${h.day} ${h.opens}-${h.closes}`),
    sameAs: [
      'https://www.linkedin.com/company/zoptal',
      'https://twitter.com/zoptal',
      'https://github.com/zoptal',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Software Development Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'AI Development',
            description: 'Custom AI and machine learning solutions',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Web Development',
            description: 'Enterprise web applications and platforms',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Mobile Development',
            description: 'iOS and Android mobile applications',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Custom Software Development',
            description: 'Bespoke software solutions for enterprises',
          },
        },
      ],
    },
  };
}