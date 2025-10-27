import { LocationData, LocationPageData, LocationServiceType } from './types';

// Major US cities for programmatic SEO
export const majorCities: LocationData[] = [
  {
    id: 'nyc',
    slug: 'new-york',
    name: 'New York City',
    state: 'New York',
    stateCode: 'NY',
    country: 'United States',
    countryCode: 'US',
    population: 8336817,
    timezone: 'America/New_York',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    metro: 'New York-Newark-Jersey City',
    region: 'Northeast',
    businessHubs: ['Manhattan Financial District', 'Midtown', 'Brooklyn Tech Triangle', 'Long Island City'],
    industries: ['Finance', 'Technology', 'Media', 'Real Estate', 'Healthcare', 'Fashion'],
    majorCompanies: ['JPMorgan Chase', 'Goldman Sachs', 'IBM', 'Accenture', 'Google', 'Facebook'],
    techEcosystem: {
      startups: 9000,
      techCompanies: 1200,
      universities: ['Columbia University', 'NYU', 'Cornell Tech'],
      techParks: ['Brooklyn Navy Yard', 'NYC Tech Campus']
    },
    marketData: {
      gdp: '$1.7 trillion',
      businessFriendlyRank: 15,
      averageSalary: '$85,000',
      costOfLiving: 'high'
    },
    seo: {
      title: 'Software Development Company in New York City | Zoptal',
      description: 'Leading software development company in New York City. Custom web & mobile app development, AI solutions, and digital transformation services.',
      keywords: ['software development NYC', 'web development New York', 'mobile app development NYC', 'AI development New York'],
      localKeywords: ['Manhattan software company', 'Brooklyn web development', 'NYC tech consulting', 'New York AI solutions']
    }
  },
  {
    id: 'sf',
    slug: 'san-francisco',
    name: 'San Francisco',
    state: 'California',
    stateCode: 'CA',
    country: 'United States',
    countryCode: 'US',
    population: 873965,
    timezone: 'America/Los_Angeles',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    metro: 'San Francisco-Oakland-Berkeley',
    region: 'West Coast',
    businessHubs: ['SOMA', 'Financial District', 'Mission Bay', 'Palo Alto'],
    industries: ['Technology', 'Biotechnology', 'Finance', 'Tourism', 'Healthcare'],
    majorCompanies: ['Salesforce', 'Twitter', 'Uber', 'Airbnb', 'Stripe', 'OpenAI'],
    techEcosystem: {
      startups: 4500,
      techCompanies: 2800,
      universities: ['Stanford University', 'UC Berkeley', 'UCSF'],
      techParks: ['Mission Bay Tech Campus', 'Presidio Tech Hub']
    },
    marketData: {
      gdp: '$549 billion',
      businessFriendlyRank: 8,
      averageSalary: '$120,000',
      costOfLiving: 'high'
    },
    seo: {
      title: 'Software Development Company in San Francisco | Zoptal',
      description: 'Premier software development company in San Francisco. AI-powered solutions, web development, and cutting-edge technology services in Silicon Valley.',
      keywords: ['software development San Francisco', 'SF web development', 'Silicon Valley software company', 'AI development SF'],
      localKeywords: ['SOMA tech company', 'Bay Area software development', 'San Francisco AI solutions', 'Silicon Valley consulting']
    }
  },
  {
    id: 'la',
    slug: 'los-angeles',
    name: 'Los Angeles',
    state: 'California',
    stateCode: 'CA',
    country: 'United States',
    countryCode: 'US',
    population: 3898747,
    timezone: 'America/Los_Angeles',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    metro: 'Los Angeles-Long Beach-Anaheim',
    region: 'West Coast',
    businessHubs: ['Downtown LA', 'Century City', 'Santa Monica', 'Culver City', 'Hollywood'],
    industries: ['Entertainment', 'Technology', 'Aerospace', 'Fashion', 'Healthcare', 'Tourism'],
    majorCompanies: ['Disney', 'Netflix', 'Hulu', 'Snapchat', 'SpaceX', 'TikTok'],
    techEcosystem: {
      startups: 3200,
      techCompanies: 1800,
      universities: ['UCLA', 'USC', 'Caltech'],
      techParks: ['Silicon Beach', 'El Segundo Tech Hub']
    },
    marketData: {
      gdp: '$789 billion',
      businessFriendlyRank: 12,
      averageSalary: '$75,000',
      costOfLiving: 'high'
    },
    seo: {
      title: 'Software Development Company in Los Angeles | Zoptal',
      description: 'Top software development company in Los Angeles. Entertainment tech, mobile apps, AI solutions, and digital transformation services.',
      keywords: ['software development Los Angeles', 'LA web development', 'mobile app development LA', 'entertainment tech LA'],
      localKeywords: ['Silicon Beach development', 'Hollywood tech solutions', 'Santa Monica software company', 'LA AI development']
    }
  },
  {
    id: 'chicago',
    slug: 'chicago',
    name: 'Chicago',
    state: 'Illinois',
    stateCode: 'IL',
    country: 'United States',
    countryCode: 'US',
    population: 2693976,
    timezone: 'America/Chicago',
    coordinates: { lat: 41.8781, lng: -87.6298 },
    metro: 'Chicago-Naperville-Elgin',
    region: 'Midwest',
    businessHubs: ['Loop', 'River North', 'West Loop', 'Fulton Market'],
    industries: ['Finance', 'Technology', 'Manufacturing', 'Transportation', 'Healthcare'],
    majorCompanies: ['Boeing', 'McDonald\'s', 'Caterpillar', 'Groupon', 'Grubhub'],
    techEcosystem: {
      startups: 2100,
      techCompanies: 1200,
      universities: ['University of Chicago', 'Northwestern University', 'IIT'],
      techParks: ['1871 Chicago', 'mHUB Innovation Center']
    },
    marketData: {
      gdp: '$689 billion',
      businessFriendlyRank: 18,
      averageSalary: '$68,000',
      costOfLiving: 'medium'
    },
    seo: {
      title: 'Software Development Company in Chicago | Zoptal',
      description: 'Leading software development company in Chicago. FinTech solutions, enterprise software, web development, and digital innovation services.',
      keywords: ['software development Chicago', 'Chicago web development', 'FinTech development Chicago', 'enterprise software Chicago'],
      localKeywords: ['Loop tech company', 'River North development', 'Chicago AI solutions', 'Midwest software development']
    }
  },
  {
    id: 'miami',
    slug: 'miami',
    name: 'Miami',
    state: 'Florida',
    stateCode: 'FL',
    country: 'United States',
    countryCode: 'US',
    population: 442241,
    timezone: 'America/New_York',
    coordinates: { lat: 25.7617, lng: -80.1918 },
    metro: 'Miami-Fort Lauderdale-Pompano Beach',
    region: 'Southeast',
    businessHubs: ['Brickell', 'Downtown Miami', 'Wynwood', 'Coral Gables'],
    industries: ['Finance', 'Technology', 'Tourism', 'International Trade', 'Real Estate'],
    majorCompanies: ['Carnival Corporation', 'World Fuel Services', 'Lennar Corporation', 'Magic Leap'],
    techEcosystem: {
      startups: 1800,
      techCompanies: 900,
      universities: ['University of Miami', 'Florida International University'],
      techParks: ['eMerge Americas Hub', 'Wynwood Tech District']
    },
    marketData: {
      gdp: '$344 billion',
      businessFriendlyRank: 22,
      averageSalary: '$58,000',
      costOfLiving: 'medium'
    },
    seo: {
      title: 'Software Development Company in Miami | Zoptal',
      description: 'Premier software development company in Miami. FinTech, blockchain, web development, and international business solutions.',
      keywords: ['software development Miami', 'Miami web development', 'FinTech development Miami', 'blockchain development Miami'],
      localKeywords: ['Brickell tech company', 'South Beach development', 'Miami AI solutions', 'Latin America tech hub']
    }
  },
  {
    id: 'seattle',
    slug: 'seattle',
    name: 'Seattle',
    state: 'Washington',
    stateCode: 'WA',
    country: 'United States',
    countryCode: 'US',
    population: 749256,
    timezone: 'America/Los_Angeles',
    coordinates: { lat: 47.6062, lng: -122.3321 },
    metro: 'Seattle-Tacoma-Bellevue',
    region: 'Pacific Northwest',
    businessHubs: ['South Lake Union', 'Bellevue', 'Capitol Hill', 'Fremont'],
    industries: ['Technology', 'Aerospace', 'Healthcare', 'Maritime', 'Coffee'],
    majorCompanies: ['Amazon', 'Microsoft', 'Boeing', 'Starbucks', 'Expedia', 'T-Mobile'],
    techEcosystem: {
      startups: 2800,
      techCompanies: 1600,
      universities: ['University of Washington', 'Seattle University'],
      techParks: ['South Lake Union', 'Redmond Tech Campus']
    },
    marketData: {
      gdp: '$594 billion',
      businessFriendlyRank: 10,
      averageSalary: '$95,000',
      costOfLiving: 'high'
    },
    seo: {
      title: 'Software Development Company in Seattle | Zoptal',
      description: 'Top software development company in Seattle. Cloud solutions, enterprise software, AI development, and scalable web applications.',
      keywords: ['software development Seattle', 'Seattle web development', 'cloud development Seattle', 'enterprise software Seattle'],
      localKeywords: ['South Lake Union tech', 'Bellevue software company', 'Seattle AI development', 'Pacific Northwest tech']
    }
  },
  {
    id: 'boston',
    slug: 'boston',
    name: 'Boston',
    state: 'Massachusetts',
    stateCode: 'MA',
    country: 'United States',
    countryCode: 'US',
    population: 685094,
    timezone: 'America/New_York',
    coordinates: { lat: 42.3601, lng: -71.0589 },
    metro: 'Boston-Cambridge-Newton',
    region: 'Northeast',
    businessHubs: ['Back Bay', 'Financial District', 'Cambridge', 'Kendall Square'],
    industries: ['Technology', 'Biotechnology', 'Finance', 'Healthcare', 'Education'],
    majorCompanies: ['General Electric', 'Raytheon', 'Boston Scientific', 'Wayfair', 'HubSpot'],
    techEcosystem: {
      startups: 3100,
      techCompanies: 1400,
      universities: ['Harvard University', 'MIT', 'Boston University'],
      techParks: ['Kendall Square', 'Innovation District']
    },
    marketData: {
      gdp: '$418 billion',
      businessFriendlyRank: 14,
      averageSalary: '$78,000',
      costOfLiving: 'high'
    },
    seo: {
      title: 'Software Development Company in Boston | Zoptal',
      description: 'Leading software development company in Boston. Biotech solutions, FinTech, AI development, and enterprise software services.',
      keywords: ['software development Boston', 'Boston web development', 'biotech software Boston', 'FinTech development Boston'],
      localKeywords: ['Kendall Square tech', 'Cambridge software development', 'Boston AI solutions', 'Back Bay tech company']
    }
  },
  {
    id: 'denver',
    slug: 'denver',
    name: 'Denver',
    state: 'Colorado',
    stateCode: 'CO',
    country: 'United States',
    countryCode: 'US',
    population: 715522,
    timezone: 'America/Denver',
    coordinates: { lat: 39.7392, lng: -104.9903 },
    metro: 'Denver-Aurora-Lakewood',
    region: 'Mountain West',
    businessHubs: ['Downtown Denver', 'Tech Center', 'RiNo District', 'Boulder'],
    industries: ['Technology', 'Aerospace', 'Energy', 'Telecommunications', 'Healthcare'],
    majorCompanies: ['Lockheed Martin', 'Ball Corporation', 'DaVita', 'Liberty Media', 'Arrow Electronics'],
    techEcosystem: {
      startups: 1900,
      techCompanies: 1100,
      universities: ['University of Colorado', 'Colorado State University', 'University of Denver'],
      techParks: ['Denver Tech Center', 'Boulder Tech Hub']
    },
    marketData: {
      gdp: '$203 billion',
      businessFriendlyRank: 9,
      averageSalary: '$65,000',
      costOfLiving: 'medium'
    },
    seo: {
      title: 'Software Development Company in Denver | Zoptal',
      description: 'Premier software development company in Denver. Energy tech, aerospace software, web development, and digital transformation services.',
      keywords: ['software development Denver', 'Denver web development', 'energy tech Denver', 'aerospace software Denver'],
      localKeywords: ['Mile High tech', 'Boulder software development', 'Denver AI solutions', 'Colorado tech company']
    }
  }
];

// Generate location page data
export function generateLocationPageData(location: LocationData): LocationPageData {
  return {
    ...location,
    hero: {
      title: `Software Development Company in ${location.name}`,
      subtitle: `Transforming ${location.name} businesses with cutting-edge technology solutions`,
      description: `Partner with Zoptal, the leading software development company in ${location.name}. We deliver custom web applications, mobile apps, AI solutions, and digital transformation services to help your business thrive in ${location.name}'s competitive market.`,
      stats: [
        { value: '500+', label: 'Projects Delivered' },
        { value: '98%', label: 'Client Satisfaction' },
        { value: '24/7', label: 'Support Available' },
        { value: '10+', label: 'Years Experience' }
      ]
    },
    services: {
      title: `Our Software Development Services in ${location.name}`,
      description: `Comprehensive technology solutions tailored for ${location.name} businesses`,
      featured: [
        {
          name: 'Custom Web Development',
          description: `Build responsive, scalable web applications that serve ${location.name}'s diverse market`,
          icon: '🌐',
          benefits: [
            'Mobile-first responsive design',
            'SEO-optimized architecture',
            'Scalable cloud deployment',
            'Advanced security features'
          ]
        },
        {
          name: 'Mobile App Development',
          description: `Native iOS and Android apps designed for ${location.name} users`,
          icon: '📱',
          benefits: [
            'Native iOS & Android development',
            'Cross-platform solutions',
            'App Store optimization',
            'Push notifications & analytics'
          ]
        },
        {
          name: 'AI & Machine Learning',
          description: `Leverage AI to automate processes and gain competitive advantages in ${location.name}`,
          icon: '🤖',
          benefits: [
            'Predictive analytics',
            'Process automation',
            'Natural language processing',
            'Computer vision solutions'
          ]
        },
        {
          name: 'Cloud Solutions',
          description: `Scalable cloud infrastructure and migration services for ${location.name} enterprises`,
          icon: '☁️',
          benefits: [
            'AWS, Azure, GCP expertise',
            'Serverless architecture',
            'DevOps & CI/CD',
            'Cost optimization'
          ]
        }
      ]
    },
    whyChooseUs: {
      title: `Why Choose Zoptal in ${location.name}?`,
      reasons: [
        {
          title: 'Local Market Expertise',
          description: `Deep understanding of ${location.name}'s business landscape and industry requirements`,
          icon: '🎯'
        },
        {
          title: 'Proven Track Record',
          description: `Successfully delivered 500+ projects for businesses across ${location.region}`,
          icon: '📈'
        },
        {
          title: 'Latest Technologies',
          description: 'Cutting-edge tech stack including AI, blockchain, and cloud-native solutions',
          icon: '⚡'
        },
        {
          title: 'Agile Development',
          description: 'Fast, iterative development process with regular updates and transparency',
          icon: '🔄'
        }
      ]
    },
    industries: {
      title: `Industries We Serve in ${location.name}`,
      description: `Specialized solutions for ${location.name}'s key industries`,
      list: location.industries.map(industry => ({
        name: industry,
        description: `Custom software solutions tailored for ${location.name}'s ${industry.toLowerCase()} sector`,
        icon: getIndustryIcon(industry),
        caseStudies: [`${industry} Case Study 1`, `${industry} Case Study 2`]
      }))
    },
    testimonials: [
      {
        id: '1',
        content: `Zoptal transformed our business with their innovative software solution. Their team's expertise in ${location.name}'s market was invaluable.`,
        author: 'John Smith',
        company: `${location.name} Tech Solutions`,
        location: location.name,
        rating: 5
      },
      {
        id: '2',
        content: `Outstanding web development services! They delivered exactly what we needed for our ${location.name} operations.`,
        author: 'Sarah Johnson',
        company: `${location.name} Enterprises`,
        location: location.name,
        rating: 5
      }
    ],
    faq: [
      {
        question: `What types of software development services do you offer in ${location.name}?`,
        answer: `We offer comprehensive software development services in ${location.name} including custom web applications, mobile app development, AI solutions, cloud services, and digital transformation consulting.`
      },
      {
        question: `How long does a typical software project take in ${location.name}?`,
        answer: `Project timelines vary based on complexity. Simple web applications typically take 4-8 weeks, while complex enterprise solutions may take 3-6 months. We provide detailed timelines during our initial consultation.`
      },
      {
        question: `Do you provide ongoing support for projects in ${location.name}?`,
        answer: `Yes, we offer comprehensive post-launch support including maintenance, updates, security patches, and feature enhancements. Our ${location.name} support team is available 24/7.`
      },
      {
        question: `What industries do you specialize in within ${location.name}?`,
        answer: `We have extensive experience serving ${location.industries.join(', ')} industries in ${location.name}, with deep understanding of local market requirements and regulations.`
      }
    ],
    cta: {
      title: `Ready to Transform Your ${location.name} Business?`,
      subtitle: `Let's discuss how our software development expertise can drive your success in ${location.name}`,
      primaryButton: 'Get Free Consultation',
      secondaryButton: 'View Our Portfolio'
    }
  };
}

// Helper function to get industry icons
function getIndustryIcon(industry: string): string {
  const icons: Record<string, string> = {
    'Finance': '💰',
    'Technology': '💻',
    'Healthcare': '🏥',
    'Education': '🎓',
    'Retail': '🛍️',
    'Manufacturing': '🏭',
    'Real Estate': '🏢',
    'Entertainment': '🎬',
    'Media': '📺',
    'Biotechnology': '🧬',
    'Aerospace': '✈️',
    'Energy': '⚡',
    'Tourism': '🏖️',
    'Transportation': '🚛',
    'Fashion': '👗',
    'Food': '🍕',
    'Automotive': '🚗',
    'Insurance': '🛡️',
    'Government': '🏛️',
    'Non-profit': '🤝'
  };
  return icons[industry] || '🏢';
}

// Generate location service combinations
export function generateLocationServices(): Array<{
  location: string;
  service: LocationServiceType;
  slug: string;
}> {
  const services: LocationServiceType[] = [
    'web-development',
    'mobile-development',
    'software-development',
    'ai-development',
    'ecommerce-development',
    'cloud-services',
    'ui-ux-design',
    'digital-marketing'
  ];

  const combinations: Array<{
    location: string;
    service: LocationServiceType;
    slug: string;
  }> = [];

  majorCities.forEach(city => {
    services.forEach(service => {
      combinations.push({
        location: city.slug,
        service,
        slug: `${service}-${city.slug}`
      });
    });
  });

  return combinations;
}

// Get location by slug
export function getLocationBySlug(slug: string): LocationData | undefined {
  return majorCities.find(city => city.slug === slug);
}

// Get all location slugs for static generation
export function getAllLocationSlugs(): string[] {
  return majorCities.map(city => city.slug);
}