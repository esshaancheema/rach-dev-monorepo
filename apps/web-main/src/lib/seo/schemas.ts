export interface BaseSchemaProps {
  name: string;
  description: string;
  url: string;
  image?: string;
}

export interface OrganizationSchemaProps extends BaseSchemaProps {
  logo?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs?: string[];
  foundingDate?: string;
  numberOfEmployees?: string;
}

export interface ArticleSchemaProps extends BaseSchemaProps {
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  keywords?: string[];
  wordCount?: number;
  articleSection?: string;
}

export interface ProductSchemaProps extends BaseSchemaProps {
  brand: string;
  category: string;
  price: {
    amount: string;
    currency: string;
  };
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  sku?: string;
  mpn?: string;
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  reviews?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: {
      ratingValue: number;
      bestRating?: number;
      worstRating?: number;
    };
  }>;
}

export interface ServiceSchemaProps extends BaseSchemaProps {
  provider: {
    name: string;
    url: string;
  };
  areaServed?: string | string[];
  serviceType: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
    availability?: string;
    validFrom?: string;
    validThrough?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export interface LocalBusinessSchemaProps extends BaseSchemaProps {
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  email?: string;
  priceRange?: string;
  openingHours?: string[];
  services: string[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export interface FAQSchemaProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export interface WebsiteSchemaProps extends BaseSchemaProps {
  searchAction?: {
    target: string;
    queryInput: string;
  };
  potentialActions?: Array<{
    type: string;
    target: string;
    name: string;
  }>;
}

export interface SoftwareApplicationSchemaProps extends BaseSchemaProps {
  applicationCategory: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
    availability: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  screenshot?: string[];
  softwareVersion?: string;
  requirements?: string;
}

export interface ContactPageSchemaProps extends BaseSchemaProps {
  contactType: string;
  email?: string;
  telephone?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  openingHours?: string[];
}

export interface AboutPageSchemaProps extends BaseSchemaProps {
  foundingDate?: string;
  founders?: Array<{
    name: string;
    jobTitle: string;
  }>;
  numberOfEmployees?: string;
  awards?: string[];
  missions?: string[];
}

// Schema generators
export function generateOrganizationSchema(props: OrganizationSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${props.url}#organization`,
    "name": props.name,
    "description": props.description,
    "url": props.url,
    ...(props.logo && { "logo": props.logo }),
    ...(props.image && { "image": props.image }),
    ...(props.telephone && { "telephone": props.telephone }),
    ...(props.email && { "email": props.email }),
    ...(props.foundingDate && { "foundingDate": props.foundingDate }),
    ...(props.numberOfEmployees && { "numberOfEmployees": props.numberOfEmployees }),
    ...(props.address && {
      "address": {
        "@type": "PostalAddress",
        "streetAddress": props.address.streetAddress,
        "addressLocality": props.address.addressLocality,
        "addressRegion": props.address.addressRegion,
        "postalCode": props.address.postalCode,
        "addressCountry": props.address.addressCountry
      }
    }),
    ...(props.sameAs && props.sameAs.length > 0 && { "sameAs": props.sameAs })
  };
}

export function generateArticleSchema(props: ArticleSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": props.name,
    "description": props.description,
    "url": props.url,
    ...(props.image && { "image": props.image }),
    "author": {
      "@type": "Person",
      "name": props.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Zoptal",
      "url": "https://zoptal.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zoptal.com/images/logo.png"
      }
    },
    "datePublished": props.publishedTime,
    ...(props.modifiedTime && { "dateModified": props.modifiedTime }),
    ...(props.articleSection && { "articleSection": props.articleSection }),
    ...(props.keywords && props.keywords.length > 0 && { "keywords": props.keywords.join(", ") }),
    ...(props.wordCount && { "wordCount": props.wordCount }),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": props.url
    }
  };
}

export function generateProductSchema(props: ProductSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": props.name,
    "description": props.description,
    "url": props.url,
    ...(props.image && { "image": props.image }),
    "brand": {
      "@type": "Brand",
      "name": props.brand
    },
    "category": props.category,
    ...(props.sku && { "sku": props.sku }),
    ...(props.mpn && { "mpn": props.mpn }),
    ...(props.condition && { "itemCondition": `https://schema.org/${props.condition}` }),
    "offers": {
      "@type": "Offer",
      "price": props.price.amount,
      "priceCurrency": props.price.currency,
      "availability": `https://schema.org/${props.availability}`,
      "url": props.url,
      "seller": {
        "@type": "Organization",
        "name": props.brand
      }
    },
    ...(props.aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": props.aggregateRating.ratingValue,
        "reviewCount": props.aggregateRating.reviewCount,
        "bestRating": props.aggregateRating.bestRating || 5,
        "worstRating": props.aggregateRating.worstRating || 1
      }
    }),
    ...(props.reviews && props.reviews.length > 0 && {
      "review": props.reviews.map(review => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": review.author
        },
        "datePublished": review.datePublished,
        "reviewBody": review.reviewBody,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.reviewRating.ratingValue,
          "bestRating": review.reviewRating.bestRating || 5,
          "worstRating": review.reviewRating.worstRating || 1
        }
      }))
    })
  };
}

export function generateServiceSchema(props: ServiceSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": props.name,
    "description": props.description,
    "url": props.url,
    ...(props.image && { "image": props.image }),
    "serviceType": props.serviceType,
    "provider": {
      "@type": "Organization",
      "name": props.provider.name,
      "url": props.provider.url
    },
    ...(props.areaServed && {
      "areaServed": Array.isArray(props.areaServed) 
        ? props.areaServed.map(area => ({
            "@type": "City",
            "name": area
          }))
        : {
            "@type": "City", 
            "name": props.areaServed
          }
    }),
    ...(props.offers && {
      "offers": {
        "@type": "Offer",
        ...(props.offers.price && { "price": props.offers.price }),
        ...(props.offers.priceCurrency && { "priceCurrency": props.offers.priceCurrency }),
        ...(props.offers.availability && { "availability": props.offers.availability }),
        ...(props.offers.validFrom && { "validFrom": props.offers.validFrom }),
        ...(props.offers.validThrough && { "validThrough": props.offers.validThrough })
      }
    }),
    ...(props.aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": props.aggregateRating.ratingValue,
        "reviewCount": props.aggregateRating.reviewCount,
        "bestRating": props.aggregateRating.bestRating || 5,
        "worstRating": props.aggregateRating.worstRating || 1
      }
    })
  };
}

export function generateLocalBusinessSchema(props: LocalBusinessSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": props.name,
    "description": props.description,
    "url": props.url,
    ...(props.image && { "image": props.image }),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": props.address.streetAddress,
      "addressLocality": props.address.addressLocality,
      "addressRegion": props.address.addressRegion,
      "postalCode": props.address.postalCode,
      "addressCountry": props.address.addressCountry
    },
    ...(props.geo && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": props.geo.latitude,
        "longitude": props.geo.longitude
      }
    }),
    ...(props.telephone && { "telephone": props.telephone }),
    ...(props.email && { "email": props.email }),
    ...(props.priceRange && { "priceRange": props.priceRange }),
    ...(props.openingHours && props.openingHours.length > 0 && { "openingHours": props.openingHours }),
    "makesOffer": props.services.map(service => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": service
      }
    })),
    ...(props.aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": props.aggregateRating.ratingValue,
        "reviewCount": props.aggregateRating.reviewCount,
        "bestRating": props.aggregateRating.bestRating || 5,
        "worstRating": props.aggregateRating.worstRating || 1
      }
    })
  };
}

export function generateFAQSchema(props: FAQSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": props.questions.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function generateBreadcrumbSchema(props: BreadcrumbSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": props.items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function generateWebsiteSchema(props: WebsiteSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": props.name,
    "description": props.description,
    "url": props.url,
    ...(props.image && { "image": props.image }),
    ...(props.searchAction && {
      "potentialAction": {
        "@type": "SearchAction",
        "target": props.searchAction.target,
        "query-input": props.searchAction.queryInput
      }
    }),
    ...(props.potentialActions && props.potentialActions.length > 0 && {
      "potentialAction": props.potentialActions.map(action => ({
        "@type": action.type,
        "target": action.target,
        "name": action.name
      }))
    })
  };
}

export function generateSoftwareApplicationSchema(props: SoftwareApplicationSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": props.name,
    "description": props.description,
    "url": props.url,
    ...(props.image && { "image": props.image }),
    "applicationCategory": props.applicationCategory,
    ...(props.operatingSystem && { "operatingSystem": props.operatingSystem }),
    ...(props.softwareVersion && { "softwareVersion": props.softwareVersion }),
    ...(props.requirements && { "requirements": props.requirements }),
    ...(props.screenshot && props.screenshot.length > 0 && { "screenshot": props.screenshot }),
    ...(props.offers && {
      "offers": {
        "@type": "Offer",
        "price": props.offers.price,
        "priceCurrency": props.offers.priceCurrency,
        "availability": props.offers.availability
      }
    }),
    ...(props.aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": props.aggregateRating.ratingValue,
        "reviewCount": props.aggregateRating.reviewCount,
        "bestRating": props.aggregateRating.bestRating || 5,
        "worstRating": props.aggregateRating.worstRating || 1
      }
    })
  };
}

export function generateContactPageSchema(props: ContactPageSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": props.name,
    "description": props.description,
    "url": props.url,
    ...(props.image && { "image": props.image }),
    "mainEntity": {
      "@type": "Organization",
      "name": "Zoptal",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": props.contactType,
        ...(props.email && { "email": props.email }),
        ...(props.telephone && { "telephone": props.telephone }),
        "availableLanguage": ["English", "Spanish", "French", "German"]
      },
      ...(props.address && {
        "address": {
          "@type": "PostalAddress",
          "streetAddress": props.address.streetAddress,
          "addressLocality": props.address.addressLocality,
          "addressRegion": props.address.addressRegion,
          "postalCode": props.address.postalCode,
          "addressCountry": props.address.addressCountry
        }
      }),
      ...(props.openingHours && props.openingHours.length > 0 && { "openingHours": props.openingHours })
    }
  };
}

export function generateAboutPageSchema(props: AboutPageSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": props.name,
    "description": props.description,
    "url": props.url,
    ...(props.image && { "image": props.image }),
    "mainEntity": {
      "@type": "Organization",
      "name": "Zoptal",
      "description": props.description,
      "url": "https://zoptal.com",
      ...(props.foundingDate && { "foundingDate": props.foundingDate }),
      ...(props.numberOfEmployees && { "numberOfEmployees": props.numberOfEmployees }),
      ...(props.founders && props.founders.length > 0 && {
        "founder": props.founders.map(founder => ({
          "@type": "Person",
          "name": founder.name,
          "jobTitle": founder.jobTitle
        }))
      }),
      ...(props.awards && props.awards.length > 0 && { "award": props.awards }),
      ...(props.missions && props.missions.length > 0 && { "mission": props.missions.join(". ") })
    }
  };
}

// Utility function to combine multiple schemas
export function combineSchemas(...schemas: any[]) {
  return schemas.filter(Boolean);
}

// Common schema configurations for Zoptal
export const ZOPTAL_ORGANIZATION_SCHEMA = generateOrganizationSchema({
  name: "Zoptal",
  description: "AI-Accelerated Development Platform transforming how businesses build software with intelligent code generation, automated testing, and deployment optimization.",
  url: "https://zoptal.com",
  logo: "https://zoptal.com/images/logo.png",
  image: "https://zoptal.com/images/og-default.png",
  telephone: "+1-234-567-8900",
  email: "hello@zoptal.com",
  foundingDate: "2023",
  numberOfEmployees: "50-100",
  address: {
    streetAddress: "123 Tech Street",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    postalCode: "94105",
    addressCountry: "US"
  },
  sameAs: [
    "https://linkedin.com/company/zoptal",
    "https://twitter.com/zoptal",
    "https://github.com/zoptal"
  ]
});

export const ZOPTAL_WEBSITE_SCHEMA = generateWebsiteSchema({
  name: "Zoptal - AI-Accelerated Development Platform",
  description: "Transform your development workflow with intelligent code generation, automated testing, and AI-powered optimization.",
  url: "https://zoptal.com",
  image: "https://zoptal.com/images/og-default.png",
  searchAction: {
    target: "https://zoptal.com/search?q={search_term_string}",
    queryInput: "required name=search_term_string"
  }
});

export default {
  generateOrganizationSchema,
  generateArticleSchema,
  generateProductSchema,
  generateServiceSchema,
  generateLocalBusinessSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateWebsiteSchema,
  generateSoftwareApplicationSchema,
  generateContactPageSchema,
  generateAboutPageSchema,
  combineSchemas,
  ZOPTAL_ORGANIZATION_SCHEMA,
  ZOPTAL_WEBSITE_SCHEMA
};