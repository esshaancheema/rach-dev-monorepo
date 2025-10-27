// Enhanced Structured Data Component for comprehensive SEO
'use client';

import { useEffect } from 'react';
import Head from 'next/head';
import { AdvancedSchemaGenerator, SchemaConfig } from '@/lib/seo/advanced-schema';

interface StructuredDataProps {
  pageType: 'home' | 'blog' | 'service' | 'case-study' | 'about';
  pageData?: any;
  config?: Partial<SchemaConfig>;
}

// Legacy interfaces for backward compatibility
interface OrganizationData {
  name: string;
  url: string;
  logo: string;
  description: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint?: {
    telephone: string;
    contactType: string;
    email?: string;
  }[];
  sameAs?: string[];
}

interface ServiceData {
  name: string;
  description: string;
  provider: OrganizationData;
  areaServed?: string[];
  serviceType: string;
  url: string;
}

interface LocationData {
  name: string;
  description: string;
  address: {
    addressLocality: string;
    addressCountry: string;
    addressRegion?: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
}

interface ArticleData {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image: string[];
  url: string;
  publisher: OrganizationData;
}

interface LegacyStructuredDataProps {
  type: 'organization' | 'service' | 'location' | 'article' | 'website' | 'breadcrumb';
  data: OrganizationData | ServiceData | LocationData | ArticleData | any;
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
}

// Default schema configuration
const defaultSchemaConfig: SchemaConfig = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com',
  siteName: 'Zoptal',
  companyName: 'Zoptal',
  companyDescription: 'Leading AI-powered software development company specializing in web development, mobile apps, cloud solutions, and digital transformation.',
  companyLogo: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
  companyAddress: {
    streetAddress: '123 Innovation Drive',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    postalCode: '94105',
    addressCountry: 'US'
  },
  companyContact: {
    telephone: '+1-555-ZOPTAL-1',
    email: 'hello@zoptal.com',
    url: 'https://zoptal.com'
  },
  socialProfiles: [
    'https://twitter.com/zoptal',
    'https://linkedin.com/company/zoptal',
    'https://github.com/zoptal',
    'https://youtube.com/@zoptal'
  ]
};

// Modern structured data component
export function StructuredData({ pageType, pageData, config }: StructuredDataProps) {
  useEffect(() => {
    const schemaConfig = { ...defaultSchemaConfig, ...config };
    const generator = new AdvancedSchemaGenerator(schemaConfig);
    
    // Generate schemas for the page
    const schemas = generator.generatePageSchema(pageType, pageData);
    
    // Create JSON-LD script tag
    const jsonLD = generator.generateJSONLD(schemas);
    
    // Remove existing structured data scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"][data-structured-data]');
    existingScripts.forEach(script => script.remove());
    
    // Add new structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'true');
    script.textContent = jsonLD.replace(/<script[^>]*>|<\/script>/gi, '');
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup on unmount
      const currentScript = document.querySelector('script[type="application/ld+json"][data-structured-data]');
      if (currentScript) {
        currentScript.remove();
      }
    };
  }, [pageType, pageData, config]);

  return null; // This component doesn't render anything visible
}

// Static method for server-side rendering
export function generateStructuredDataScript(
  pageType: 'home' | 'blog' | 'service' | 'case-study' | 'about',
  pageData?: any,
  config?: Partial<SchemaConfig>
): string {
  const schemaConfig = { ...defaultSchemaConfig, ...config };
  const generator = new AdvancedSchemaGenerator(schemaConfig);
  
  const schemas = generator.generatePageSchema(pageType, pageData);
  return generator.generateJSONLD(schemas);
}

// Component for server-side structured data injection
interface ServerStructuredDataProps extends StructuredDataProps {}

export function ServerStructuredData({ pageType, pageData, config }: ServerStructuredDataProps) {
  const structuredDataScript = generateStructuredDataScript(pageType, pageData, config);
  
  return (
    <script
      type="application/ld+json"
      data-structured-data="true"
      dangerouslySetInnerHTML={{
        __html: structuredDataScript.replace(/<script[^>]*>|<\/script>/gi, '')
      }}
    />
  );
}

// Legacy component for backward compatibility
export default function LegacyStructuredData({ type, data, breadcrumbs }: LegacyStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com';

  const generateOrganizationSchema = (orgData: OrganizationData) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: orgData.name,
    alternateName: 'Zoptal Technologies',
    url: orgData.url,
    logo: orgData.logo,
    description: orgData.description,
    foundingDate: '2024',
    industry: 'Software Development',
    numberOfEmployees: '50-200',
    address: orgData.address ? {
      '@type': 'PostalAddress',
      ...orgData.address,
    } : undefined,
    contactPoint: orgData.contactPoint?.map(contact => ({
      '@type': 'ContactPoint',
      ...contact,
    })),
    sameAs: orgData.sameAs || [
      'https://linkedin.com/company/zoptal',
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
            name: 'Custom Software Development',
            description: 'End-to-end custom software development services',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'AI Development',
            description: 'AI-powered application development and integration',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Mobile App Development',
            description: 'Native and cross-platform mobile application development',
          },
        },
      ],
    },
  });

  const generateServiceSchema = (serviceData: ServiceData) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceData.name,
    description: serviceData.description,
    provider: generateOrganizationSchema(serviceData.provider),
    areaServed: serviceData.areaServed?.map(area => ({
      '@type': 'Place',
      name: area,
    })),
    serviceType: serviceData.serviceType,
    url: serviceData.url,
    category: 'Software Development',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${serviceData.name} Portfolio`,
    },
  });

  const generateLocationSchema = (locationData: LocationData) => ({
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: locationData.name,
    description: locationData.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locationData.address.addressLocality,
      addressCountry: locationData.address.addressCountry,
      addressRegion: locationData.address.addressRegion,
    },
    geo: locationData.geo ? {
      '@type': 'GeoCoordinates',
      latitude: locationData.geo.latitude,
      longitude: locationData.geo.longitude,
    } : undefined,
  });

  const generateArticleSchema = (articleData: ArticleData) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: articleData.headline,
    description: articleData.description,
    author: {
      '@type': 'Person',
      name: articleData.author,
    },
    datePublished: articleData.datePublished,
    dateModified: articleData.dateModified || articleData.datePublished,
    image: articleData.image,
    url: articleData.url,
    publisher: generateOrganizationSchema(articleData.publisher),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleData.url,
    },
  });

  const generateWebsiteSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Zoptal',
    alternateName: 'Zoptal Technologies',
    url: baseUrl,
    description: 'AI-Accelerated Software Development Platform',
    publisher: generateOrganizationSchema({
      name: 'Zoptal',
      url: baseUrl,
      logo: `${baseUrl}/images/logo.png`,
      description: 'AI-Accelerated Software Development Platform',
    }),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  });

  const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  });

  const getSchemaData = () => {
    switch (type) {
      case 'organization':
        return generateOrganizationSchema(data as OrganizationData);
      case 'service':
        return generateServiceSchema(data as ServiceData);
      case 'location':
        return generateLocationSchema(data as LocationData);
      case 'article':
        return generateArticleSchema(data as ArticleData);
      case 'website':
        return generateWebsiteSchema();
      case 'breadcrumb':
        return generateBreadcrumbSchema(breadcrumbs || []);
      default:
        return null;
    }
  };

  const schemaData = getSchemaData();

  if (!schemaData) return null;

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData),
        }}
      />
    </Head>
  );
}