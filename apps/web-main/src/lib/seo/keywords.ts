// Keyword mapping and SEO optimization utilities for Zoptal

export interface KeywordSet {
  primary: string[];
  secondary: string[];
  longtail: string[];
  branded: string[];
  local?: string[];
}

export interface IndustryKeywords {
  [industry: string]: KeywordSet;
}

export interface ServiceKeywords {
  [service: string]: KeywordSet;
}

export interface LocationKeywords {
  [location: string]: {
    city: string[];
    region: string[];
    variants: string[];
  };
}

// Core Zoptal brand keywords
export const BRAND_KEYWORDS: KeywordSet = {
  primary: [
    'Zoptal',
    'AI development platform',
    'AI-accelerated development',
    'intelligent code generation',
    'automated software development'
  ],
  secondary: [
    'AI development tools',
    'machine learning development',
    'automated testing platform',
    'AI-powered optimization',
    'development workflow automation',
    'intelligent software solutions'
  ],
  longtail: [
    'AI-accelerated software development platform',
    'intelligent code generation for enterprises',
    'automated software development with machine learning',
    'AI-powered development workflow optimization',
    'custom software development using artificial intelligence',
    'enterprise AI development platform for businesses'
  ],
  branded: [
    'Zoptal AI platform',
    'Zoptal development tools',
    'Zoptal intelligent coding',
    'Zoptal automated development',
    'Zoptal AI solutions',
    'Zoptal machine learning platform'
  ]
};

// Service-specific keywords
export const SERVICE_KEYWORDS: ServiceKeywords = {
  'web-development': {
    primary: [
      'web development',
      'website development',
      'web application development',
      'frontend development',
      'backend development'
    ],
    secondary: [
      'full-stack development',
      'responsive web design',
      'progressive web apps',
      'single page applications',
      'web development services',
      'custom web development'
    ],
    longtail: [
      'custom web application development services',
      'responsive website development for businesses',
      'enterprise web development solutions',
      'modern web development with AI integration',
      'scalable web application development',
      'professional web development company'
    ],
    branded: [
      'Zoptal web development',
      'AI-powered web development',
      'intelligent web applications',
      'automated web development'
    ]
  },
  'mobile-development': {
    primary: [
      'mobile app development',
      'iOS development',
      'Android development',
      'cross-platform development',
      'mobile application development'
    ],
    secondary: [
      'React Native development',
      'Flutter development',
      'native app development',
      'mobile app design',
      'app development services',
      'custom mobile apps'
    ],
    longtail: [
      'custom mobile application development services',
      'enterprise mobile app development solutions',
      'cross-platform mobile app development',
      'native iOS and Android app development',
      'professional mobile app development company',
      'AI-powered mobile application development'
    ],
    branded: [
      'Zoptal mobile development',
      'AI-enhanced mobile apps',
      'intelligent mobile applications',
      'automated mobile development'
    ]
  },
  'ai-development': {
    primary: [
      'AI development',
      'machine learning development',
      'artificial intelligence solutions',
      'AI integration services',
      'custom AI development'
    ],
    secondary: [
      'ML model development',
      'neural network development',
      'natural language processing',
      'computer vision development',
      'AI consulting services',
      'machine learning consulting'
    ],
    longtail: [
      'custom artificial intelligence development services',
      'enterprise machine learning solution development',
      'AI integration for business applications',
      'professional AI development company',
      'machine learning model development and deployment',
      'artificial intelligence consulting and implementation'
    ],
    branded: [
      'Zoptal AI development',
      'Zoptal machine learning',
      'Zoptal AI solutions',
      'Zoptal intelligent systems'
    ]
  },
  'enterprise-solutions': {
    primary: [
      'enterprise software development',
      'business applications',
      'enterprise solutions',
      'corporate software development',
      'enterprise application development'
    ],
    secondary: [
      'ERP development',
      'CRM development',
      'business process automation',
      'enterprise integration',
      'scalable enterprise solutions',
      'custom business software'
    ],
    longtail: [
      'custom enterprise software development services',
      'scalable business application development',
      'enterprise-grade software solutions',
      'business process automation development',
      'enterprise application integration services',
      'professional enterprise software development company'
    ],
    branded: [
      'Zoptal enterprise solutions',
      'AI-powered enterprise software',
      'intelligent business applications',
      'automated enterprise development'
    ]
  },
  'api-development': {
    primary: [
      'API development',
      'REST API development',
      'GraphQL development',
      'backend API services',
      'custom API development'
    ],
    secondary: [
      'microservices development',
      'API integration services',
      'backend development',
      'API design and development',
      'scalable API solutions',
      'API architecture'
    ],
    longtail: [
      'custom REST API development services',
      'scalable microservices architecture development',
      'professional API development and integration',
      'enterprise API development solutions',
      'secure API development for businesses',
      'high-performance API development services'
    ],
    branded: [
      'Zoptal API development',
      'AI-powered API services',
      'intelligent API solutions',
      'automated API development'
    ]
  }
};

// Industry-specific keywords
export const INDUSTRY_KEYWORDS: IndustryKeywords = {
  healthcare: {
    primary: [
      'healthcare software development',
      'medical app development',
      'healthcare technology solutions',
      'clinical software development',
      'healthcare IT services'
    ],
    secondary: [
      'HIPAA compliant development',
      'electronic health records',
      'telemedicine development',
      'medical device software',
      'healthcare data analytics',
      'patient management systems'
    ],
    longtail: [
      'custom healthcare software development services',
      'HIPAA compliant medical application development',
      'electronic health record system development',
      'telemedicine platform development solutions',
      'healthcare AI and machine learning development',
      'medical practice management software development'
    ],
    branded: [
      'Zoptal healthcare solutions',
      'AI-powered medical software',
      'intelligent healthcare applications',
      'automated healthcare development'
    ]
  },
  finance: {
    primary: [
      'fintech development',
      'financial software development',
      'banking application development',
      'payment system development',
      'financial technology solutions'
    ],
    secondary: [
      'blockchain development',
      'cryptocurrency development',
      'trading platform development',
      'financial data analytics',
      'regulatory compliance software',
      'risk management systems'
    ],
    longtail: [
      'custom fintech application development services',
      'secure banking software development solutions',
      'regulatory compliant financial software development',
      'blockchain and cryptocurrency development services',
      'trading platform and financial analytics development',
      'professional fintech development company'
    ],
    branded: [
      'Zoptal fintech solutions',
      'AI-powered financial software',
      'intelligent banking applications',
      'automated fintech development'
    ]
  },
  retail: {
    primary: [
      'e-commerce development',
      'retail software development',
      'online store development',
      'shopping cart development',
      'retail technology solutions'
    ],
    secondary: [
      'inventory management systems',
      'POS system development',
      'retail analytics platform',
      'omnichannel retail solutions',
      'customer loyalty programs',
      'retail mobile apps'
    ],
    longtail: [
      'custom e-commerce platform development services',
      'retail inventory management system development',
      'omnichannel retail solution development',
      'professional retail software development company',
      'e-commerce website and mobile app development',
      'retail analytics and business intelligence development'
    ],
    branded: [
      'Zoptal retail solutions',
      'AI-powered e-commerce platforms',
      'intelligent retail applications',
      'automated retail development'
    ]
  },
  education: {
    primary: [
      'education software development',
      'e-learning platform development',
      'educational app development',
      'school management systems',
      'learning management systems'
    ],
    secondary: [
      'student information systems',
      'online course platforms',
      'virtual classroom development',
      'educational content management',
      'assessment and grading systems',
      'educational analytics'
    ],
    longtail: [
      'custom e-learning platform development services',
      'school management system development solutions',
      'educational mobile app development for students',
      'learning management system development and implementation',
      'virtual classroom and online education platform development',
      'professional education technology development company'
    ],
    branded: [
      'Zoptal education solutions',
      'AI-powered learning platforms',
      'intelligent educational applications',
      'automated education development'
    ]
  }
};

// Location-based keywords
export const LOCATION_KEYWORDS: LocationKeywords = {
  'san-francisco': {
    city: ['San Francisco', 'SF', 'Bay Area'],
    region: ['California', 'CA', 'Northern California', 'Silicon Valley'],
    variants: [
      'San Francisco Bay Area',
      'SF Bay Area',
      'Silicon Valley',
      'South Bay',
      'Peninsula'
    ]
  },
  'new-york': {
    city: ['New York', 'NYC', 'Manhattan'],
    region: ['New York State', 'NY', 'Tri-State Area'],
    variants: [
      'New York City',
      'Manhattan',
      'Brooklyn',
      'Greater New York Area',
      'Metro New York'
    ]
  },
  'london': {
    city: ['London', 'Greater London'],
    region: ['England', 'UK', 'United Kingdom'],
    variants: [
      'Central London',
      'Greater London',
      'London Metropolitan Area',
      'City of London'
    ]
  },
  'toronto': {
    city: ['Toronto', 'GTA'],
    region: ['Ontario', 'Canada'],
    variants: [
      'Greater Toronto Area',
      'GTA',
      'Toronto Metropolitan Area',
      'Golden Horseshoe'
    ]
  }
};

// Keyword intent classification
export const KEYWORD_INTENT = {
  informational: [
    'what is',
    'how to',
    'guide to',
    'tutorial',
    'learn',
    'understand',
    'explained',
    'definition',
    'overview',
    'introduction'
  ],
  commercial: [
    'best',
    'top',
    'compare',
    'review',
    'vs',
    'alternatives',
    'options',
    'solution',
    'tool',
    'platform'
  ],
  transactional: [
    'buy',
    'price',
    'cost',
    'hire',
    'get',
    'order',
    'purchase',
    'quote',
    'contact',
    'consultation'
  ],
  navigational: [
    'Zoptal',
    'login',
    'dashboard',
    'account',
    'portal',
    'app',
    'website',
    'official'
  ]
};

// Utility functions for keyword operations
export function getKeywordsForService(service: string): KeywordSet | null {
  return SERVICE_KEYWORDS[service] || null;
}

export function getKeywordsForIndustry(industry: string): KeywordSet | null {
  return INDUSTRY_KEYWORDS[industry] || null;
}

export function getLocationVariants(location: string): LocationKeywords[string] | null {
  return LOCATION_KEYWORDS[location] || null;
}

export function generateLocationKeywords(
  service: string,
  city: string,
  region: string
): string[] {
  const serviceKeywords = getKeywordsForService(service);
  if (!serviceKeywords) return [];

  const locationVariants = [city, region];
  const keywords: string[] = [];

  // Generate service + location combinations
  serviceKeywords.primary.forEach(keyword => {
    locationVariants.forEach(location => {
      keywords.push(`${keyword} ${location}`);
      keywords.push(`${keyword} in ${location}`);
      keywords.push(`${location} ${keyword}`);
    });
  });

  // Add long-tail location keywords
  serviceKeywords.longtail.forEach(keyword => {
    locationVariants.forEach(location => {
      keywords.push(`${keyword} in ${location}`);
    });
  });

  return [...new Set(keywords)]; // Remove duplicates
}

export function generateIndustryServiceKeywords(
  service: string,
  industry: string
): string[] {
  const serviceKeywords = getKeywordsForService(service);
  const industryKeywords = getKeywordsForIndustry(industry);
  
  if (!serviceKeywords || !industryKeywords) return [];

  const keywords: string[] = [];

  // Combine service and industry keywords
  serviceKeywords.primary.forEach(serviceKeyword => {
    industryKeywords.primary.forEach(industryKeyword => {
      keywords.push(`${serviceKeyword} for ${industry}`);
      keywords.push(`${industry} ${serviceKeyword}`);
    });
  });

  return [...new Set(keywords)];
}

export function getKeywordsByIntent(intent: keyof typeof KEYWORD_INTENT): string[] {
  return KEYWORD_INTENT[intent] || [];
}

export function classifyKeywordIntent(keyword: string): keyof typeof KEYWORD_INTENT | 'unknown' {
  const lowerKeyword = keyword.toLowerCase();
  
  for (const [intent, indicators] of Object.entries(KEYWORD_INTENT)) {
    if (indicators.some(indicator => lowerKeyword.includes(indicator))) {
      return intent as keyof typeof KEYWORD_INTENT;
    }
  }
  
  return 'unknown';
}

export function generateKeywordVariations(baseKeyword: string): string[] {
  const variations: string[] = [baseKeyword];
  
  // Add common variations
  const modifiers = [
    'custom',
    'professional',
    'enterprise',
    'affordable',
    'best',
    'top',
    'expert',
    'reliable',
    'quality',
    'experienced'
  ];
  
  const suffixes = [
    'services',
    'solutions',
    'company',
    'agency',
    'firm',
    'experts',
    'team',
    'specialists'
  ];
  
  modifiers.forEach(modifier => {
    variations.push(`${modifier} ${baseKeyword}`);
  });
  
  suffixes.forEach(suffix => {
    variations.push(`${baseKeyword} ${suffix}`);
  });
  
  return [...new Set(variations)];
}

export function optimizeKeywordDensity(
  content: string,
  targetKeywords: string[],
  targetDensity: number = 0.02
): { keyword: string; currentDensity: number; recommended: number }[] {
  const words = content.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  
  return targetKeywords.map(keyword => {
    const keywordWords = keyword.toLowerCase().split(/\s+/);
    const keywordLength = keywordWords.length;
    
    let occurrences = 0;
    for (let i = 0; i <= words.length - keywordLength; i++) {
      const phrase = words.slice(i, i + keywordLength).join(' ');
      if (phrase === keyword.toLowerCase()) {
        occurrences++;
      }
    }
    
    const currentDensity = occurrences / totalWords;
    const recommended = Math.max(1, Math.round(totalWords * targetDensity));
    
    return {
      keyword,
      currentDensity,
      recommended
    };
  });
}

// Export all keyword sets for easy access
export const ALL_KEYWORDS = {
  brand: BRAND_KEYWORDS,
  services: SERVICE_KEYWORDS,
  industries: INDUSTRY_KEYWORDS,
  locations: LOCATION_KEYWORDS,
  intent: KEYWORD_INTENT
};

// Convenient export for use in metadata
export const keywordsByCategory = {
  services: [
    'custom software development',
    'web development services',
    'mobile app development',
    'enterprise software solutions',
    'API development services',
    'AI development solutions',
    'software consulting',
    'application development',
    'digital transformation',
    'technology solutions',
    'software engineering',
    'system integration'
  ],
  industries: [
    'healthcare software',
    'fintech solutions',
    'retail technology',
    'education software',
    'enterprise solutions',
    'business applications',
    'industry software',
    'vertical solutions'
  ],
  locations: [
    'software development company',
    'local developers',
    'nearshore development',
    'global software team',
    'distributed development',
    'international software services'
  ]
};

export default {
  BRAND_KEYWORDS,
  SERVICE_KEYWORDS,
  INDUSTRY_KEYWORDS,
  LOCATION_KEYWORDS,
  KEYWORD_INTENT,
  getKeywordsForService,
  getKeywordsForIndustry,
  getLocationVariants,
  generateLocationKeywords,
  generateIndustryServiceKeywords,
  getKeywordsByIntent,
  classifyKeywordIntent,
  generateKeywordVariations,
  optimizeKeywordDensity,
  ALL_KEYWORDS
};