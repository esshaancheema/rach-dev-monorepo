import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  alternateLanguages?: Array<{
    hrefLang: string;
    href: string;
  }>;
  type?: 'website' | 'article' | 'product';
  price?: {
    amount: string;
    currency: string;
  };
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  category?: string;
  location?: {
    city: string;
    region: string;
    country: string;
  };
}

const DEFAULT_CONFIG = {
  siteName: 'Zoptal',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com',
  defaultTitle: 'Zoptal - AI-Accelerated Development Platform',
  defaultDescription: 'Transform your development workflow with intelligent code generation, automated testing, and AI-powered optimization. Build software 10x faster with our AI development platform.',
  defaultImage: '/images/og-default.png',
  defaultAuthor: 'Zoptal Team',
  defaultLocale: 'en',
  twitterHandle: '@zoptal',
  facebookAppId: process.env.FACEBOOK_APP_ID,
  linkedInCompanyId: process.env.LINKEDIN_COMPANY_ID
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonicalUrl,
    ogImage,
    noIndex = false,
    author = DEFAULT_CONFIG.defaultAuthor,
    publishedTime,
    modifiedTime,
    section,
    tags = [],
    locale = DEFAULT_CONFIG.defaultLocale,
    alternateLanguages = [],
    type = 'website',
    price,
    availability,
    brand = DEFAULT_CONFIG.siteName,
    category,
    location
  } = config;

  // Construct full URLs
  const fullCanonicalUrl = canonicalUrl?.startsWith('http') 
    ? canonicalUrl 
    : `${DEFAULT_CONFIG.siteUrl}${canonicalUrl || ''}`;

  const fullOgImage = ogImage?.startsWith('http') 
    ? ogImage 
    : `${DEFAULT_CONFIG.siteUrl}${ogImage || DEFAULT_CONFIG.defaultImage}`;

  // Generate enhanced title with location and service context
  const enhancedTitle = generateEnhancedTitle(title, location, category);

  // Generate enhanced description with location context
  const enhancedDescription = generateEnhancedDescription(description, location, category);

  // Base metadata
  const metadata: Metadata = {
    title: enhancedTitle,
    description: enhancedDescription,
    authors: [{ name: author }],
    creator: author,
    publisher: DEFAULT_CONFIG.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    ...(keywords.length > 0 && {
      keywords: [...keywords, ...generateLocationKeywords(location), ...generateCategoryKeywords(category)]
    }),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      },
    }),
    alternates: {
      canonical: fullCanonicalUrl,
      ...(alternateLanguages.length > 0 && {
        languages: alternateLanguages.reduce((acc, lang) => {
          acc[lang.hrefLang] = lang.href;
          return acc;
        }, {} as Record<string, string>)
      })
    },
    openGraph: {
      type: type,
      title: enhancedTitle,
      description: enhancedDescription,
      url: fullCanonicalUrl,
      siteName: DEFAULT_CONFIG.siteName,
      images: [
        {
          url: fullOgImage,
          width: 1200,
          height: 630,
          alt: enhancedTitle,
        },
      ],
      locale: locale,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title: enhancedTitle,
      description: enhancedDescription,
      images: [fullOgImage],
      creator: DEFAULT_CONFIG.twitterHandle,
      site: DEFAULT_CONFIG.twitterHandle,
    },
    ...(type === 'article' && {
      other: {
        'article:author': author,
        ...(publishedTime && { 'article:published_time': publishedTime }),
        ...(modifiedTime && { 'article:modified_time': modifiedTime }),
        ...(section && { 'article:section': section }),
        ...(tags.length > 0 && { 'article:tag': tags.join(', ') }),
      },
    }),
  };

  // Add product-specific metadata
  if (type === 'product' && price) {
    metadata.other = {
      ...metadata.other,
      'product:price:amount': price.amount,
      'product:price:currency': price.currency,
      ...(availability && { 'product:availability': availability }),
      ...(brand && { 'product:brand': brand }),
      ...(category && { 'product:category': category }),
    };
  }

  // Add location-specific metadata
  if (location) {
    metadata.other = {
      ...metadata.other,
      'og:locality': location.city,
      'og:region': location.region,
      'og:country': location.country,
      'geo.placename': `${location.city}, ${location.region}`,
      'geo.region': location.country,
    };
  }

  return metadata;
}

function generateEnhancedTitle(baseTitle: string, location?: SEOConfig['location'], category?: string): string {
  let title = baseTitle;

  // Add location context
  if (location) {
    if (!title.includes(location.city)) {
      title = `${title} in ${location.city}, ${location.region}`;
    }
  }

  // Add category context
  if (category && !title.toLowerCase().includes(category.toLowerCase())) {
    title = `${category} | ${title}`;
  }

  // Ensure it doesn't exceed 60 characters for optimal SEO
  if (title.length > 60) {
    title = title.substring(0, 57) + '...';
  }

  return title;
}

function generateEnhancedDescription(baseDescription: string, location?: SEOConfig['location'], category?: string): string {
  let description = baseDescription;

  // Add location context
  if (location && !description.includes(location.city)) {
    description += ` Serving ${location.city}, ${location.region} and surrounding areas.`;
  }

  // Add category context
  if (category && !description.toLowerCase().includes(category.toLowerCase())) {
    description = `${category}: ${description}`;
  }

  // Ensure it doesn't exceed 160 characters for optimal SEO
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  return description;
}

function generateLocationKeywords(location?: SEOConfig['location']): string[] {
  if (!location) return [];

  return [
    `${location.city} AI development`,
    `${location.city} software development`,
    `${location.region} development services`,
    `AI development ${location.city}`,
    `custom software ${location.city}`,
    `development company ${location.city}`,
    `tech services ${location.city}`,
    `${location.city} technology solutions`,
  ];
}

function generateCategoryKeywords(category?: string): string[] {
  if (!category) return [];

  const categoryKeywords: Record<string, string[]> = {
    'web-development': [
      'web development',
      'website development',
      'web applications',
      'frontend development',
      'backend development',
      'full-stack development'
    ],
    'mobile-development': [
      'mobile app development',
      'iOS development',
      'Android development',
      'cross-platform apps',
      'mobile applications',
      'app development'
    ],
    'ai-development': [
      'AI development',
      'machine learning',
      'artificial intelligence',
      'ML solutions',
      'AI integration',
      'intelligent systems'
    ],
    'enterprise-solutions': [
      'enterprise software',
      'business solutions',
      'corporate applications',
      'enterprise development',
      'business automation',
      'enterprise systems'
    ]
  };

  return categoryKeywords[category] || [category];
}

// Utility function for generating JSON-LD structured data
export function generateStructuredData(config: SEOConfig & { structuredData?: any }): string {
  const { structuredData, ...seoConfig } = config;
  
  if (!structuredData) return '';

  // Add common organization data
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": DEFAULT_CONFIG.siteName,
    "url": DEFAULT_CONFIG.siteUrl,
    "logo": `${DEFAULT_CONFIG.siteUrl}/images/logo.png`,
    "description": DEFAULT_CONFIG.defaultDescription,
    "sameAs": [
      "https://linkedin.com/company/zoptal",
      "https://twitter.com/zoptal",
      "https://github.com/zoptal",
    ]
  };

  // Merge with provided structured data
  const combinedData = Array.isArray(structuredData) 
    ? [organizationData, ...structuredData]
    : [organizationData, structuredData];

  return JSON.stringify(combinedData);
}

// Pre-defined metadata configurations for common pages
export const COMMON_METADATA = {
  homepage: {
    title: DEFAULT_CONFIG.defaultTitle,
    description: DEFAULT_CONFIG.defaultDescription,
    keywords: [
      'AI development platform',
      'intelligent code generation',
      'automated software development',
      'AI-powered development tools',
      'custom software development',
      'development workflow optimization'
    ]
  },
  pricing: {
    title: 'Pricing Plans | AI Development Platform | Zoptal',
    description: 'Transparent pricing for our AI-accelerated development platform. Choose from flexible plans designed for startups to enterprise. No hidden fees.',
    keywords: [
      'AI development pricing',
      'software development costs',
      'development platform pricing',
      'custom software pricing',
      'enterprise development costs'
    ]
  },
  contact: {
    title: 'Contact Us | Get Your AI Development Quote | Zoptal',
    description: 'Ready to accelerate your development? Contact our AI experts for a free consultation and custom quote. Available 24/7.',
    keywords: [
      'contact AI developers',
      'development consultation',
      'software development quote',
      'AI development experts',
      'custom development inquiry'
    ]
  }
};

export default generateMetadata;