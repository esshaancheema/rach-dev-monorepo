export interface LocationData {
  id: string;
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  country: string;
  countryCode: string;
  population: number;
  timezone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  metro?: string;
  region: string;
  businessHubs: string[];
  industries: string[];
  majorCompanies: string[];
  techEcosystem: {
    startups: number;
    techCompanies: number;
    universities: string[];
    techParks: string[];
  };
  marketData: {
    gdp: string;
    businessFriendlyRank: number;
    averageSalary: string;
    costOfLiving: 'low' | 'medium' | 'high';
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    localKeywords: string[];
  };
}

export interface LocationPageData extends LocationData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
  services: {
    title: string;
    description: string;
    featured: Array<{
      name: string;
      description: string;
      icon: string;
      benefits: string[];
    }>;
  };
  whyChooseUs: {
    title: string;
    reasons: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  industries: {
    title: string;
    description: string;
    list: Array<{
      name: string;
      description: string;
      icon: string;
      caseStudies?: string[];
    }>;
  };
  testimonials: Array<{
    id: string;
    content: string;
    author: string;
    company: string;
    location: string;
    rating: number;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  cta: {
    title: string;
    subtitle: string;
    primaryButton: string;
    secondaryButton: string;
  };
}

export interface LocationServiceData {
  location: LocationData;
  service: {
    name: string;
    slug: string;
    title: string;
    description: string;
    benefits: string[];
    features: string[];
    process: Array<{
      step: number;
      title: string;
      description: string;
    }>;
    pricing: {
      starting: string;
      factors: string[];
    };
    portfolio: Array<{
      title: string;
      description: string;
      industry: string;
      results: string[];
    }>;
  };
}

export type LocationServiceType = 
  | 'web-development'
  | 'mobile-development'
  | 'software-development'
  | 'ai-development'
  | 'ecommerce-development'
  | 'cloud-services'
  | 'ui-ux-design'
  | 'digital-marketing';