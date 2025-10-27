// Comprehensive schema markup generators for all page types

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com';

export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

// Organization schema (for all pages)
export const organizationSchema: SchemaMarkup = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Zoptal',
  url: BASE_URL,
  logo: `${BASE_URL}/images/logo.png`,
  description: 'AI-Accelerated Development Platform providing custom software development, mobile apps, and enterprise solutions.',
  foundingDate: '2020',
  sameAs: [
    'https://twitter.com/zoptal',
    'https://linkedin.com/company/zoptal',
    'https://github.com/zoptal',
    'https://facebook.com/zoptal'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-800-ZOPTAL',
    contactType: 'customer service',
    availableLanguage: ['English', 'Spanish', 'French', 'German', 'Arabic', 'Hindi', 'Chinese'],
    areaServed: 'Worldwide'
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Innovation Drive',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    postalCode: '94105',
    addressCountry: 'US'
  },
  founder: {
    '@type': 'Person',
    name: 'Zoptal Team'
  },
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    value: '50-100'
  },
  industry: 'Software Development',
  knowsAbout: [
    'Custom Software Development',
    'Mobile App Development',
    'AI Development',
    'Enterprise Solutions',
    'SaaS Development',
    'Web Development'
  ]
};

// Website schema
export const websiteSchema: SchemaMarkup = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Zoptal',
  url: BASE_URL,
  description: 'AI-Accelerated Development Platform for custom software, mobile apps, and enterprise solutions.',
  publisher: {
    '@type': 'Organization',
    name: 'Zoptal'
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  },
  inLanguage: ['en', 'es', 'fr', 'de', 'ar', 'hi', 'zh']
};

// Service schema generator
export function generateServiceSchema(service: {
  name: string;
  description: string;
  url: string;
  category: string;
  price?: {
    currency: string;
    minPrice: number;
    maxPrice?: number;
  };
  features?: string[];
  duration?: string;
}): SchemaMarkup {
  const schema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: service.url,
    provider: {
      '@type': 'Organization',
      name: 'Zoptal',
      url: BASE_URL
    },
    serviceType: service.category,
    areaServed: {
      '@type': 'Place',
      name: 'Worldwide'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.name} Options`,
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: service.name,
            description: service.description
          }
        }
      ]
    }
  };

  if (service.price) {
    schema.offers = {
      '@type': 'Offer',
      price: service.price.minPrice,
      priceCurrency: service.price.currency,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock'
    };

    if (service.price.maxPrice) {
      schema.offers.priceRange = `${service.price.minPrice}-${service.price.maxPrice} ${service.price.currency}`;
    }
  }

  if (service.features) {
    schema.additionalProperty = service.features.map(feature => ({
      '@type': 'PropertyValue',
      name: 'Feature',
      value: feature
    }));
  }

  if (service.duration) {
    schema.duration = service.duration;
  }

  return schema;
}

// Blog post schema generator
export function generateBlogPostSchema(post: {
  title: string;
  description: string;
  url: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  category: string;
  tags?: string[];
  wordCount?: number;
  readingTime?: string;
}): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: post.url,
    author: {
      '@type': 'Person',
      name: post.author,
      url: `${BASE_URL}/authors/${post.author.toLowerCase().replace(/\s+/g, '-')}`
    },
    publisher: {
      '@type': 'Organization',
      name: 'Zoptal',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logo.png`,
        width: 200,
        height: 60
      }
    },
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url
    },
    image: post.image ? {
      '@type': 'ImageObject',
      url: post.image,
      width: 1200,
      height: 630
    } : undefined,
    articleSection: post.category,
    keywords: post.tags?.join(', '),
    wordCount: post.wordCount,
    timeRequired: post.readingTime,
    inLanguage: 'en'
  };
}

// Case study schema generator
export function generateCaseStudySchema(caseStudy: {
  title: string;
  description: string;
  url: string;
  client: string;
  industry: string;
  technologies: string[];
  results: string[];
  datePublished: string;
  projectDuration: string;
  teamSize: number;
  budget?: {
    currency: string;
    amount: number;
  };
}): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': caseStudy.url,
    headline: caseStudy.title,
    description: caseStudy.description,
    url: caseStudy.url,
    author: {
      '@type': 'Organization',
      name: 'Zoptal'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Zoptal',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logo.png`
      }
    },
    datePublished: caseStudy.datePublished,
    articleSection: 'Case Studies',
    about: {
      '@type': 'Thing',
      name: caseStudy.industry,
      description: `Software development project in ${caseStudy.industry} industry`
    },
    mentions: caseStudy.technologies.map(tech => ({
      '@type': 'SoftwareApplication',
      name: tech,
      applicationCategory: 'DeveloperApplication'
    })),
    mainEntity: {
      '@type': 'CreativeWork',
      name: caseStudy.title,
      creator: {
        '@type': 'Organization',
        name: 'Zoptal'
      },
      about: {
        '@type': 'Organization',
        name: caseStudy.client,
        industry: caseStudy.industry
      },
      dateCreated: caseStudy.datePublished,
      timeRequired: caseStudy.projectDuration,
      contributor: {
        '@type': 'QuantitativeValue',
        value: caseStudy.teamSize,
        unitText: 'team members'
      }
    }
  };
}

// Product schema generator
export function generateProductSchema(product: {
  name: string;
  description: string;
  url: string;
  image?: string;
  brand: string;
  category: string;
  features: string[];
  price?: {
    currency: string;
    amount: number;
  };
  rating?: {
    ratingValue: number;
    reviewCount: number;
  };
}): SchemaMarkup {
  const schema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.description,
    url: product.url,
    applicationCategory: product.category,
    operatingSystem: 'Web-based',
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    creator: {
      '@type': 'Organization',
      name: 'Zoptal'
    },
    featureList: product.features,
    softwareRequirements: 'Modern web browser'
  };

  if (product.image) {
    schema.image = {
      '@type': 'ImageObject',
      url: product.image
    };
  }

  if (product.price) {
    schema.offers = {
      '@type': 'Offer',
      price: product.price.amount,
      priceCurrency: product.price.currency,
      availability: 'https://schema.org/InStock'
    };
  }

  if (product.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.ratingValue,
      reviewCount: product.rating.reviewCount,
      bestRating: 5,
      worstRating: 1
    };
  }

  return schema;
}

// FAQ schema generator
export function generateFAQSchema(faqs: Array<{
  question: string;
  answer: string;
}>): SchemaMarkup {
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

// Location schema generator
export function generateLocationSchema(location: {
  name: string;
  city: string;
  country: string;
  address?: {
    street: string;
    postalCode: string;
    region: string;
  };
  services: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}): SchemaMarkup {
  const schema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `Zoptal ${location.city}`,
    description: `Software development services in ${location.city}, ${location.country}`,
    url: `${BASE_URL}/locations/${location.country.toLowerCase()}/${location.city.toLowerCase()}`,
    parentOrganization: {
      '@type': 'Organization',
      name: 'Zoptal'
    },
    areaServed: {
      '@type': 'City',
      name: location.city,
      containedInPlace: {
        '@type': 'Country',
        name: location.country
      }
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Software Development Services',
      itemListElement: location.services.map(service => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service,
          provider: {
            '@type': 'Organization',
            name: 'Zoptal'
          }
        }
      }))
    }
  };

  if (location.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: location.address.street,
      addressLocality: location.city,
      addressRegion: location.address.region,
      postalCode: location.address.postalCode,
      addressCountry: location.country
    };
  }

  if (location.coordinates) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude
    };
  }

  return schema;
}

// Breadcrumb schema generator
export function generateBreadcrumbSchema(breadcrumbs: Array<{
  name: string;
  url: string;
}>): SchemaMarkup {
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

// How-to schema generator
export function generateHowToSchema(howTo: {
  name: string;
  description: string;
  steps: Array<{
    name: string;
    text: string;
    image?: string;
  }>;
  totalTime?: string;
  estimatedCost?: {
    currency: string;
    value: number;
  };
  tool?: string[];
  supply?: string[];
}): SchemaMarkup {
  const schema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description,
    step: howTo.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image ? {
        '@type': 'ImageObject',
        url: step.image
      } : undefined
    }))
  };

  if (howTo.totalTime) {
    schema.totalTime = howTo.totalTime;
  }

  if (howTo.estimatedCost) {
    schema.estimatedCost = {
      '@type': 'MonetaryAmount',
      currency: howTo.estimatedCost.currency,
      value: howTo.estimatedCost.value
    };
  }

  if (howTo.tool) {
    schema.tool = howTo.tool.map(tool => ({
      '@type': 'HowToTool',
      name: tool
    }));
  }

  if (howTo.supply) {
    schema.supply = howTo.supply.map(supply => ({
      '@type': 'HowToSupply',
      name: supply
    }));
  }

  return schema;
}

// Review schema generator
export function generateReviewSchema(review: {
  name: string;
  reviewBody: string;
  rating: number;
  author: string;
  datePublished: string;
  itemReviewed: {
    name: string;
    type: string;
    url: string;
  };
}): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: review.name,
    reviewBody: review.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1
    },
    author: {
      '@type': 'Person',
      name: review.author
    },
    datePublished: review.datePublished,
    itemReviewed: {
      '@type': review.itemReviewed.type,
      name: review.itemReviewed.name,
      url: review.itemReviewed.url
    }
  };
}

// Event schema generator (for webinars, workshops)
export function generateEventSchema(event: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: {
    type: 'online' | 'physical';
    name?: string;
    address?: string;
    url?: string;
  };
  organizer: string;
  price?: {
    currency: string;
    amount: number;
  };
  image?: string;
}): SchemaMarkup {
  const schema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    organizer: {
      '@type': 'Organization',
      name: event.organizer,
      url: BASE_URL
    },
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: event.location.type === 'online' 
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode'
  };

  if (event.location.type === 'online') {
    schema.location = {
      '@type': 'VirtualLocation',
      url: event.location.url || BASE_URL
    };
  } else {
    schema.location = {
      '@type': 'Place',
      name: event.location.name,
      address: event.location.address
    };
  }

  if (event.price) {
    schema.offers = {
      '@type': 'Offer',
      price: event.price.amount,
      priceCurrency: event.price.currency,
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/events/${event.name.toLowerCase().replace(/\s+/g, '-')}`
    };
  }

  if (event.image) {
    schema.image = {
      '@type': 'ImageObject',
      url: event.image
    };
  }

  return schema;
}

// Job posting schema generator
export function generateJobPostingSchema(job: {
  title: string;
  description: string;
  location: string;
  employmentType: string;
  datePosted: string;
  validThrough: string;
  salary?: {
    currency: string;
    value: number;
    unitText: string;
  };
  requirements: string[];
  benefits: string[];
}): SchemaMarkup {
  const schema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Zoptal',
      sameAs: BASE_URL
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location
      }
    },
    employmentType: job.employmentType,
    datePosted: job.datePosted,
    validThrough: job.validThrough,
    workHours: 'Full-time',
    applicationContact: {
      '@type': 'ContactPoint',
      contactType: 'HR',
      email: 'careers@zoptal.com'
    }
  };

  if (job.salary) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.salary.currency,
      value: {
        '@type': 'QuantitativeValue',
        value: job.salary.value,
        unitText: job.salary.unitText
      }
    };
  }

  return schema;
}

// Aggregate all schemas for a page
export function getPageSchemas(pageType: string, data: any): SchemaMarkup[] {
  const schemas = [organizationSchema, websiteSchema];

  switch (pageType) {
    case 'service':
      schemas.push(generateServiceSchema(data));
      break;
    case 'blog':
      schemas.push(generateBlogPostSchema(data));
      break;
    case 'case-study':
      schemas.push(generateCaseStudySchema(data));
      break;
    case 'product':
      schemas.push(generateProductSchema(data));
      break;
    case 'location':
      schemas.push(generateLocationSchema(data));
      break;
    case 'faq':
      schemas.push(generateFAQSchema(data.faqs));
      break;
    case 'how-to':
      schemas.push(generateHowToSchema(data));
      break;
    case 'event':
      schemas.push(generateEventSchema(data));
      break;
    case 'job':
      schemas.push(generateJobPostingSchema(data));
      break;
  }

  // Add breadcrumb schema if breadcrumbs are provided
  if (data.breadcrumbs) {
    schemas.push(generateBreadcrumbSchema(data.breadcrumbs));
  }

  return schemas;
}