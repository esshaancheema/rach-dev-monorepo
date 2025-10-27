// Locations data and constants for location-based features
// This module provides comprehensive location data for the application

export interface Location {
  id: string;
  name: string;
  displayName: string;
  country: string;
  countryCode: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone: string;
  currency: string;
  language: string;
  businessHours: {
    start: number; // 24-hour format
    end: number;
    timezone: string;
  };
  isServiceArea: boolean;
  priority: number; // 1-10, higher = more important
  marketTier: 'primary' | 'secondary' | 'emerging';
  demographics?: {
    population?: number;
    gdpPerCapita?: number;
    techAdoptionRate?: number;
  };
  localInfo?: {
    dialCode: string;
    postalCodeFormat?: string;
    addressFormat?: string;
  };
}

export interface ServiceArea {
  id: string;
  name: string;
  description: string;
  locations: string[]; // Location IDs
  leadTimes: {
    consultation: string;
    development: string;
    support: string;
  };
  specialties: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
}

// Major global locations where Zoptal provides services
export const LOCATIONS: Location[] = [
  // North America - Primary Markets
  {
    id: 'san-francisco',
    name: 'San Francisco',
    displayName: 'San Francisco, CA',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    language: 'en-US',
    businessHours: { start: 9, end: 18, timezone: 'America/Los_Angeles' },
    isServiceArea: true,
    priority: 10,
    marketTier: 'primary',
    demographics: {
      population: 875000,
      gdpPerCapita: 120000,
      techAdoptionRate: 95,
    },
    localInfo: {
      dialCode: '+1',
      postalCodeFormat: '94###',
      addressFormat: 'US',
    },
  },
  {
    id: 'new-york',
    name: 'New York',
    displayName: 'New York, NY',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'en-US',
    businessHours: { start: 9, end: 18, timezone: 'America/New_York' },
    isServiceArea: true,
    priority: 10,
    marketTier: 'primary',
    demographics: {
      population: 8400000,
      gdpPerCapita: 85000,
      techAdoptionRate: 92,
    },
    localInfo: {
      dialCode: '+1',
      postalCodeFormat: '10###',
      addressFormat: 'US',
    },
  },
  {
    id: 'toronto',
    name: 'Toronto',
    displayName: 'Toronto, ON',
    country: 'Canada',
    countryCode: 'CA',
    region: 'North America',
    coordinates: { lat: 43.6532, lng: -79.3832 },
    timezone: 'America/Toronto',
    currency: 'CAD',
    language: 'en-CA',
    businessHours: { start: 9, end: 18, timezone: 'America/Toronto' },
    isServiceArea: true,
    priority: 8,
    marketTier: 'primary',
    demographics: {
      population: 2930000,
      gdpPerCapita: 65000,
      techAdoptionRate: 88,
    },
    localInfo: {
      dialCode: '+1',
      postalCodeFormat: 'M#A #B#',
      addressFormat: 'CA',
    },
  },

  // Europe - Primary Markets
  {
    id: 'london',
    name: 'London',
    displayName: 'London, UK',
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    timezone: 'Europe/London',
    currency: 'GBP',
    language: 'en-GB',
    businessHours: { start: 9, end: 17, timezone: 'Europe/London' },
    isServiceArea: true,
    priority: 9,
    marketTier: 'primary',
    demographics: {
      population: 9000000,
      gdpPerCapita: 55000,
      techAdoptionRate: 90,
    },
    localInfo: {
      dialCode: '+44',
      postalCodeFormat: 'SW1A 1AA',
      addressFormat: 'GB',
    },
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    displayName: 'Amsterdam, Netherlands',
    country: 'Netherlands',
    countryCode: 'NL',
    region: 'Europe',
    coordinates: { lat: 52.3676, lng: 4.9041 },
    timezone: 'Europe/Amsterdam',
    currency: 'EUR',
    language: 'nl-NL',
    businessHours: { start: 9, end: 17, timezone: 'Europe/Amsterdam' },
    isServiceArea: true,
    priority: 7,
    marketTier: 'primary',
    demographics: {
      population: 870000,
      gdpPerCapita: 58000,
      techAdoptionRate: 93,
    },
    localInfo: {
      dialCode: '+31',
      postalCodeFormat: '1012 AB',
      addressFormat: 'NL',
    },
  },
  {
    id: 'berlin',
    name: 'Berlin',
    displayName: 'Berlin, Germany',
    country: 'Germany',
    countryCode: 'DE',
    region: 'Europe',
    coordinates: { lat: 52.5200, lng: 13.4050 },
    timezone: 'Europe/Berlin',
    currency: 'EUR',
    language: 'de-DE',
    businessHours: { start: 9, end: 17, timezone: 'Europe/Berlin' },
    isServiceArea: true,
    priority: 8,
    marketTier: 'primary',
    demographics: {
      population: 3700000,
      gdpPerCapita: 48000,
      techAdoptionRate: 87,
    },
    localInfo: {
      dialCode: '+49',
      postalCodeFormat: '10115',
      addressFormat: 'DE',
    },
  },

  // Asia-Pacific - Primary Markets
  {
    id: 'singapore',
    name: 'Singapore',
    displayName: 'Singapore',
    country: 'Singapore',
    countryCode: 'SG',
    region: 'Asia-Pacific',
    coordinates: { lat: 1.3521, lng: 103.8198 },
    timezone: 'Asia/Singapore',
    currency: 'SGD',
    language: 'en-SG',
    businessHours: { start: 9, end: 18, timezone: 'Asia/Singapore' },
    isServiceArea: true,
    priority: 9,
    marketTier: 'primary',
    demographics: {
      population: 5850000,
      gdpPerCapita: 72000,
      techAdoptionRate: 94,
    },
    localInfo: {
      dialCode: '+65',
      postalCodeFormat: '######',
      addressFormat: 'SG',
    },
  },
  {
    id: 'sydney',
    name: 'Sydney',
    displayName: 'Sydney, Australia',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Asia-Pacific',
    coordinates: { lat: -33.8688, lng: 151.2093 },
    timezone: 'Australia/Sydney',
    currency: 'AUD',
    language: 'en-AU',
    businessHours: { start: 9, end: 17, timezone: 'Australia/Sydney' },
    isServiceArea: true,
    priority: 7,
    marketTier: 'primary',
    demographics: {
      population: 5300000,
      gdpPerCapita: 62000,
      techAdoptionRate: 89,
    },
    localInfo: {
      dialCode: '+61',
      postalCodeFormat: '####',
      addressFormat: 'AU',
    },
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    displayName: 'Tokyo, Japan',
    country: 'Japan',
    countryCode: 'JP',
    region: 'Asia-Pacific',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    timezone: 'Asia/Tokyo',
    currency: 'JPY',
    language: 'ja-JP',
    businessHours: { start: 9, end: 18, timezone: 'Asia/Tokyo' },
    isServiceArea: true,
    priority: 8,
    marketTier: 'primary',
    demographics: {
      population: 14000000,
      gdpPerCapita: 42000,
      techAdoptionRate: 85,
    },
    localInfo: {
      dialCode: '+81',
      postalCodeFormat: '###-####',
      addressFormat: 'JP',
    },
  },

  // Secondary Markets
  {
    id: 'dubai',
    name: 'Dubai',
    displayName: 'Dubai, UAE',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    region: 'Middle East',
    coordinates: { lat: 25.2048, lng: 55.2708 },
    timezone: 'Asia/Dubai',
    currency: 'AED',
    language: 'ar-AE',
    businessHours: { start: 9, end: 18, timezone: 'Asia/Dubai' },
    isServiceArea: true,
    priority: 6,
    marketTier: 'secondary',
    demographics: {
      population: 3400000,
      gdpPerCapita: 50000,
      techAdoptionRate: 82,
    },
    localInfo: {
      dialCode: '+971',
      postalCodeFormat: '#####',
      addressFormat: 'AE',
    },
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    displayName: 'Mumbai, India',
    country: 'India',
    countryCode: 'IN',
    region: 'Asia-Pacific',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'hi-IN',
    businessHours: { start: 9, end: 18, timezone: 'Asia/Kolkata' },
    isServiceArea: true,
    priority: 7,
    marketTier: 'secondary',
    demographics: {
      population: 20000000,
      gdpPerCapita: 8000,
      techAdoptionRate: 75,
    },
    localInfo: {
      dialCode: '+91',
      postalCodeFormat: '######',
      addressFormat: 'IN',
    },
  },
  {
    id: 'sao-paulo',
    name: 'São Paulo',
    displayName: 'São Paulo, Brazil',
    country: 'Brazil',
    countryCode: 'BR',
    region: 'South America',
    coordinates: { lat: -23.5505, lng: -46.6333 },
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    language: 'pt-BR',
    businessHours: { start: 9, end: 18, timezone: 'America/Sao_Paulo' },
    isServiceArea: true,
    priority: 5,
    marketTier: 'secondary',
    demographics: {
      population: 12300000,
      gdpPerCapita: 15000,
      techAdoptionRate: 68,
    },
    localInfo: {
      dialCode: '+55',
      postalCodeFormat: '#####-###',
      addressFormat: 'BR',
    },
  },

  // Emerging Markets
  {
    id: 'cape-town',
    name: 'Cape Town',
    displayName: 'Cape Town, South Africa',
    country: 'South Africa',
    countryCode: 'ZA',
    region: 'Africa',
    coordinates: { lat: -33.9249, lng: 18.4241 },
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR',
    language: 'en-ZA',
    businessHours: { start: 8, end: 17, timezone: 'Africa/Johannesburg' },
    isServiceArea: true,
    priority: 4,
    marketTier: 'emerging',
    demographics: {
      population: 4600000,
      gdpPerCapita: 13000,
      techAdoptionRate: 62,
    },
    localInfo: {
      dialCode: '+27',
      postalCodeFormat: '####',
      addressFormat: 'ZA',
    },
  },
  {
    id: 'mexico-city',
    name: 'Mexico City',
    displayName: 'Mexico City, Mexico',
    country: 'Mexico',
    countryCode: 'MX',
    region: 'North America',
    coordinates: { lat: 19.4326, lng: -99.1332 },
    timezone: 'America/Mexico_City',
    currency: 'MXN',
    language: 'es-MX',
    businessHours: { start: 9, end: 18, timezone: 'America/Mexico_City' },
    isServiceArea: true,
    priority: 5,
    marketTier: 'emerging',
    demographics: {
      population: 9200000,
      gdpPerCapita: 18000,
      techAdoptionRate: 70,
    },
    localInfo: {
      dialCode: '+52',
      postalCodeFormat: '#####',
      addressFormat: 'MX',
    },
  },
];

// Service areas grouping multiple locations
export const SERVICE_AREAS: ServiceArea[] = [
  {
    id: 'north-america',
    name: 'North America',
    description: 'Comprehensive services across the United States and Canada',
    locations: ['san-francisco', 'new-york', 'toronto'],
    leadTimes: {
      consultation: '24-48 hours',
      development: '2-8 weeks',
      support: 'Same day',
    },
    specialties: [
      'Enterprise SaaS platforms',
      'Fintech solutions',
      'AI/ML integration',
      'Real-time applications',
    ],
    contactInfo: {
      phone: '+1 (555) 123-4567',
      email: 'na-sales@zoptal.com',
    },
  },
  {
    id: 'europe',
    name: 'Europe',
    description: 'Strategic technology consulting and development across Europe',
    locations: ['london', 'amsterdam', 'berlin'],
    leadTimes: {
      consultation: '24-48 hours',
      development: '2-8 weeks',
      support: 'Same day',
    },
    specialties: [
      'GDPR-compliant solutions',
      'Multi-language platforms',
      'European market expansion',
      'Compliance automation',
    ],
    contactInfo: {
      phone: '+44 20 7123 4567',
      email: 'eu-sales@zoptal.com',
    },
  },
  {
    id: 'asia-pacific',
    name: 'Asia-Pacific',
    description: 'Innovation-driven solutions for the fastest-growing tech markets',
    locations: ['singapore', 'sydney', 'tokyo', 'mumbai'],
    leadTimes: {
      consultation: '24-48 hours',
      development: '2-10 weeks',
      support: 'Same day',
    },
    specialties: [
      'Cross-cultural platforms',
      'Mobile-first solutions',
      'E-commerce and marketplace',
      'Localization services',
    ],
    contactInfo: {
      phone: '+65 6123 4567',
      email: 'apac-sales@zoptal.com',
    },
  },
  {
    id: 'emerging-markets',
    name: 'Emerging Markets',
    description: 'Cost-effective solutions for growing businesses in emerging economies',
    locations: ['dubai', 'sao-paulo', 'cape-town', 'mexico-city'],
    leadTimes: {
      consultation: '48-72 hours',
      development: '3-12 weeks',
      support: 'Next business day',
    },
    specialties: [
      'MVP development',
      'Cost-optimized solutions',
      'Local market adaptation',
      'Scalable architectures',
    ],
    contactInfo: {
      email: 'emerging-markets@zoptal.com',
    },
  },
];

// Location-based pricing tiers
export const PRICING_TIERS = {
  primary: {
    multiplier: 1.0,
    currency: 'USD',
    description: 'Premium markets with full-service offerings',
  },
  secondary: {
    multiplier: 0.8,
    currency: 'USD',
    description: 'Established markets with competitive pricing',
  },
  emerging: {
    multiplier: 0.6,
    currency: 'USD',
    description: 'Growing markets with value-focused solutions',
  },
} as const;

// Time zone mappings for business hours
export const TIMEZONE_GROUPS = {
  'Americas': [
    'America/Los_Angeles',
    'America/New_York',
    'America/Toronto',
    'America/Mexico_City',
    'America/Sao_Paulo',
  ],
  'Europe/Africa': [
    'Europe/London',
    'Europe/Amsterdam',
    'Europe/Berlin',
    'Africa/Johannesburg',
  ],
  'Asia-Pacific': [
    'Asia/Singapore',
    'Asia/Tokyo',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Australia/Sydney',
  ],
} as const;

// Supported languages by location
export const LOCATION_LANGUAGES = {
  'en-US': ['san-francisco', 'new-york'],
  'en-CA': ['toronto'],
  'en-GB': ['london'],
  'nl-NL': ['amsterdam'],
  'de-DE': ['berlin'],
  'en-SG': ['singapore'],
  'en-AU': ['sydney'],
  'ja-JP': ['tokyo'],
  'ar-AE': ['dubai'],
  'hi-IN': ['mumbai'],
  'pt-BR': ['sao-paulo'],
  'en-ZA': ['cape-town'],
  'es-MX': ['mexico-city'],
} as const;

// Popular location combinations for multi-region deployments
export const DEPLOYMENT_REGIONS = [
  {
    id: 'global-tier-1',
    name: 'Global Tier 1',
    description: 'Premium global coverage with optimal performance',
    locations: ['san-francisco', 'new-york', 'london', 'singapore'],
    estimatedCoverage: '80% of global internet users',
  },
  {
    id: 'north-america-eu',
    name: 'North America + Europe',
    description: 'Comprehensive coverage for Western markets',
    locations: ['san-francisco', 'new-york', 'london', 'amsterdam'],
    estimatedCoverage: '60% of global internet users',
  },
  {
    id: 'asia-pacific-focus',
    name: 'Asia-Pacific Focus',
    description: 'Optimized for Asian and Pacific markets',
    locations: ['singapore', 'tokyo', 'sydney', 'mumbai'],
    estimatedCoverage: '45% of global internet users',
  },
] as const;

// Utility functions
export function getLocationById(id: string): Location | undefined {
  return LOCATIONS.find(location => location.id === id);
}

export function getLocationsByRegion(region: string): Location[] {
  return LOCATIONS.filter(location => location.region === region);
}

export function getLocationsByMarketTier(tier: 'primary' | 'secondary' | 'emerging'): Location[] {
  return LOCATIONS.filter(location => location.marketTier === tier);
}

export function getServiceAreaByLocation(locationId: string): ServiceArea | undefined {
  return SERVICE_AREAS.find(area => area.locations.includes(locationId));
}

export function getLocationsByTimezone(timezone: string): Location[] {
  return LOCATIONS.filter(location => location.timezone === timezone);
}

export function getSupportedLanguages(): string[] {
  return [...new Set(LOCATIONS.map(location => location.language))];
}

export function getCurrenciesByRegion(region: string): string[] {
  const regionLocations = getLocationsByRegion(region);
  return [...new Set(regionLocations.map(location => location.currency))];
}

export function getBusinessHoursRange(locationId: string): { start: number; end: number; timezone: string } | null {
  const location = getLocationById(locationId);
  return location ? location.businessHours : null;
}

// Export types for use in other modules
export type LocationId = typeof LOCATIONS[number]['id'];
export type ServiceAreaId = typeof SERVICE_AREAS[number]['id'];
export type MarketTier = Location['marketTier'];
export type Region = Location['region'];