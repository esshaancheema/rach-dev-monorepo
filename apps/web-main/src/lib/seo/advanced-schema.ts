// Advanced Schema Markup Generator for Maximum SEO Impact

export interface SchemaConfig {
  baseUrl: string;
  siteName: string;
  companyName: string;
  companyDescription: string;
  companyLogo: string;
  companyAddress: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  companyContact: {
    telephone: string;
    email: string;
    url: string;
  };
  socialProfiles: string[];
}

export interface BlogPostSchema {
  title: string;
  description: string;
  content: string;
  author: {
    name: string;
    url?: string;
    image?: string;
  };
  publishDate: string;
  modifiedDate?: string;
  image: string;
  url: string;
  category: string;
  tags: string[];
  readingTime?: number;
  wordCount?: number;
}

export interface ServiceSchema {
  name: string;
  description: string;
  url: string;
  image?: string;
  serviceType: string;
  provider: {
    name: string;
    url: string;
  };
  areaServed: string[];
  hasOfferCatalog?: {
    name: string;
    itemListElement: Array<{
      name: string;
      description: string;
      price?: string;
      priceCurrency?: string;
    }>;
  };
}

export interface CaseStudySchema {
  name: string;
  description: string;
  url: string;
  image: string;
  client: {
    name: string;
    industry: string;
  };
  results: Array<{
    metric: string;
    value: string;
    description: string;
  }>;
  technologies: string[];
  datePublished: string;
  author: {
    name: string;
    url: string;
  };
}

export interface LocalBusinessSchema {
  name: string;
  description: string;
  url: string;
  logo: string;
  image: string[];
  telephone: string;
  email: string;
  address: SchemaConfig['companyAddress'];
  geo: {
    latitude: number;
    longitude: number;
  };
  openingHours: string[];
  priceRange: string;
  paymentAccepted: string[];
  currenciesAccepted: string[];
  areaServed: string[];
  serviceArea: {
    type: 'Country' | 'State' | 'City';
    name: string;
  }[];
}

export class AdvancedSchemaGenerator {
  private config: SchemaConfig;

  constructor(config: SchemaConfig) {
    this.config = config;
  }

  /**
   * Generate Organization Schema
   */
  generateOrganizationSchema(): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${this.config.baseUrl}/#organization`,
      name: this.config.companyName,
      description: this.config.companyDescription,
      url: this.config.baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: this.config.companyLogo,
        width: 600,
        height: 200
      },
      image: this.config.companyLogo,
      address: {
        '@type': 'PostalAddress',
        streetAddress: this.config.companyAddress.streetAddress,
        addressLocality: this.config.companyAddress.addressLocality,
        addressRegion: this.config.companyAddress.addressRegion,
        postalCode: this.config.companyAddress.postalCode,
        addressCountry: this.config.companyAddress.addressCountry
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: this.config.companyContact.telephone,
        email: this.config.companyContact.email,
        contactType: 'customer service',
        availableLanguage: ['English']
      },
      sameAs: this.config.socialProfiles,
      founder: {
        '@type': 'Person',
        name: 'Zoptal Team'
      },
      foundingDate: '2024',
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        minValue: 10,
        maxValue: 50
      },
      knowsAbout: [
        'Software Development',
        'Web Development',
        'Mobile App Development',
        'AI Development',
        'Machine Learning',
        'Cloud Computing',
        'DevOps',
        'UI/UX Design'
      ]
    };
  }

  /**
   * Generate Website Schema
   */
  generateWebsiteSchema(): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${this.config.baseUrl}/#website`,
      url: this.config.baseUrl,
      name: this.config.siteName,
      description: this.config.companyDescription,
      publisher: {
        '@id': `${this.config.baseUrl}/#organization`
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.config.baseUrl}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      },
      inLanguage: 'en-US'
    };
  }

  /**
   * Generate Blog Post Schema
   */
  generateBlogPostSchema(post: BlogPostSchema): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${post.url}#article`,
      headline: post.title,
      description: post.description,
      image: {
        '@type': 'ImageObject',
        url: post.image,
        width: 1200,
        height: 630
      },
      author: {
        '@type': 'Person',
        name: post.author.name,
        url: post.author.url,
        image: post.author.image
      },
      publisher: {
        '@id': `${this.config.baseUrl}/#organization`
      },
      datePublished: post.publishDate,
      dateModified: post.modifiedDate || post.publishDate,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': post.url
      },
      articleSection: post.category,
      keywords: post.tags.join(', '),
      wordCount: post.wordCount,
      timeRequired: post.readingTime ? `PT${post.readingTime}M` : undefined,
      inLanguage: 'en-US',
      about: post.tags.map(tag => ({
        '@type': 'Thing',
        name: tag
      })),
      mentions: post.tags.map(tag => ({
        '@type': 'Thing',
        name: tag
      }))
    };
  }

  /**
   * Generate Service Schema
   */
  generateServiceSchema(service: ServiceSchema): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${service.url}#service`,
      name: service.name,
      description: service.description,
      url: service.url,
      image: service.image,
      serviceType: service.serviceType,
      provider: {
        '@type': 'Organization',
        name: service.provider.name,
        url: service.provider.url,
        '@id': `${this.config.baseUrl}/#organization`  
      },
      areaServed: service.areaServed.map(area => ({
        '@type': 'Country',
        name: area
      })),
      hasOfferCatalog: service.hasOfferCatalog ? {
        '@type': 'OfferCatalog',
        name: service.hasOfferCatalog.name,
        itemListElement: service.hasOfferCatalog.itemListElement.map(item => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: item.name,
            description: item.description
          },
          price: item.price,
          priceCurrency: item.priceCurrency || 'USD'
        }))
      } : undefined,
      category: service.serviceType,
      termsOfService: `${this.config.baseUrl}/legal/terms`,
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00'
      }
    };
  }

  /**
   * Generate Case Study Schema (as CreativeWork)
   */
  generateCaseStudySchema(caseStudy: CaseStudySchema): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': `${caseStudy.url}#casestudy`,
      name: caseStudy.name,
      description: caseStudy.description,
      url: caseStudy.url,
      image: {
        '@type': 'ImageObject',
        url: caseStudy.image,
        width: 1200,
        height: 630
      },
      author: {
        '@type': 'Person',
        name: caseStudy.author.name,
        url: caseStudy.author.url
      },
      publisher: {
        '@id': `${this.config.baseUrl}/#organization`
      },
      datePublished: caseStudy.datePublished,
      genre: 'Case Study',
      keywords: caseStudy.technologies.join(', '),
      about: {
        '@type': 'Organization',
        name: caseStudy.client.name,
        industry: caseStudy.client.industry
      },
      mentions: [
        ...caseStudy.technologies.map(tech => ({
          '@type': 'SoftwareApplication',
          name: tech
        })),
        {
          '@type': 'Organization',
          name: caseStudy.client.name
        }
      ],
      mainEntity: {
        '@type': 'Project',
        name: caseStudy.name,
        description: caseStudy.description,
        result: caseStudy.results.map(result => ({
          '@type': 'Result',
          name: result.metric,
          value: result.value,
          description: result.description
        }))
      }
    };
  }

  /**
   * Generate Local Business Schema
   */
  generateLocalBusinessSchema(business: LocalBusinessSchema): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${business.url}/#localbusiness`,
      name: business.name,
      description: business.description,
      url: business.url,
      logo: business.logo,
      image: business.image,
      telephone: business.telephone,
      email: business.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address.streetAddress,
        addressLocality: business.address.addressLocality,
        addressRegion: business.address.addressRegion,
        postalCode: business.address.postalCode,
        addressCountry: business.address.addressCountry
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: business.geo.latitude,
        longitude: business.geo.longitude
      },
      openingHoursSpecification: business.openingHours.map(hours => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: hours.split(' ')[0],
        opens: hours.split(' ')[1],
        closes: hours.split(' ')[2]
      })),
      priceRange: business.priceRange,
      paymentAccepted: business.paymentAccepted,
      currenciesAccepted: business.currenciesAccepted,
      areaServed: business.areaServed.map(area => ({
        '@type': 'City',
        name: area
      })),
      serviceArea: business.serviceArea.map(area => ({
        '@type': area.type,
        name: area.name
      })),
      hasMap: `https://maps.google.com/?q=${business.geo.latitude},${business.geo.longitude}`
    };
  }

  /**
   * Generate FAQ Schema
   */
  generateFAQSchema(faqs: Array<{ question: string; answer: string }>): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
  }

  /**
   * Generate Breadcrumb Schema
   */
  generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url
      }))
    };
  }

  /**
   * Generate Review Schema
   */
  generateReviewSchema(reviews: Array<{
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: string;
  }>): Record<string, any> {
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${this.config.baseUrl}/#organization`,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: averageRating.toFixed(1),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1
      },
      review: reviews.map(review => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1
        },
        reviewBody: review.reviewBody,
        datePublished: review.datePublished
      }))
    };
  }

  /**
   * Generate complete schema bundle for a page
   */
  generatePageSchema(pageType: 'home' | 'blog' | 'service' | 'case-study' | 'about', pageData?: any): Record<string, any>[] {
    const schemas = [
      this.generateOrganizationSchema(),
      this.generateWebsiteSchema()
    ];

    switch (pageType) {
      case 'home':
        // Add local business schema for homepage
        if (pageData?.localBusiness) {
          schemas.push(this.generateLocalBusinessSchema(pageData.localBusiness));
        }
        break;
      
      case 'blog':
        if (pageData?.post) {
          schemas.push(this.generateBlogPostSchema(pageData.post));
        }
        break;
      
      case 'service':
        if (pageData?.service) {
          schemas.push(this.generateServiceSchema(pageData.service));
        }
        break;
      
      case 'case-study':
        if (pageData?.caseStudy) {
          schemas.push(this.generateCaseStudySchema(pageData.caseStudy));
        }
        break;
    }

    // Add common schemas
    if (pageData?.breadcrumbs) {
      schemas.push(this.generateBreadcrumbSchema(pageData.breadcrumbs));
    }

    if (pageData?.faqs) {
      schemas.push(this.generateFAQSchema(pageData.faqs));
    }

    if (pageData?.reviews) {
      schemas.push(this.generateReviewSchema(pageData.reviews));
    }

    return schemas;
  }

  /**
   * Generate JSON-LD script tag
   */
  generateJSONLD(schemas: Record<string, any>[]): string {
    const jsonLD = schemas.length === 1 ? schemas[0] : {
      '@context': 'https://schema.org',
      '@graph': schemas
    };

    return `<script type="application/ld+json">${JSON.stringify(jsonLD, null, 2)}</script>`;
  }
}