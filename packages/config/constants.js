module.exports = {
  // API Endpoints
  API_ENDPOINTS: {
    AUTH_SERVICE: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    PROJECT_SERVICE: process.env.PROJECT_SERVICE_URL || 'http://localhost:4002',
    AI_SERVICE: process.env.AI_SERVICE_URL || 'http://localhost:4003',
    BILLING_SERVICE: process.env.BILLING_SERVICE_URL || 'http://localhost:4004',
    NOTIFICATION_SERVICE: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005',
  },

  // SEO Keywords
  SEO_KEYWORDS: [
    'Custom Software Development Company',
    'Mobile Application Development Company',
    'AI-Agents Development Company',
    'Micro SaaS Application Development Company',
    'SAAS Applications Development Company',
    'Enterprise Application Development Company',
  ],

  // Supported Locations
  LOCATIONS: [
    // USA
    { country: 'usa', city: 'new-york', region: 'NY' },
    { country: 'usa', city: 'san-francisco', region: 'CA' },
    { country: 'usa', city: 'los-angeles', region: 'CA' },
    { country: 'usa', city: 'austin', region: 'TX' },
    { country: 'usa', city: 'chicago', region: 'IL' },
    { country: 'usa', city: 'san-diego', region: 'CA' },
    // UK
    { country: 'uk', city: 'london', region: 'England' },
    { country: 'uk', city: 'manchester', region: 'England' },
    { country: 'uk', city: 'birmingham', region: 'England' },
    // Germany
    { country: 'germany', city: 'berlin', region: 'Berlin' },
    { country: 'germany', city: 'munich', region: 'Bavaria' },
    { country: 'germany', city: 'hamburg', region: 'Hamburg' },
    // UAE
    { country: 'uae', city: 'dubai', region: 'Dubai' },
    { country: 'uae', city: 'abu-dhabi', region: 'Abu Dhabi' },
    // Singapore
    { country: 'singapore', city: 'singapore', region: 'Singapore' },
    // India
    { country: 'india', city: 'mumbai', region: 'Maharashtra' },
    { country: 'india', city: 'bangalore', region: 'Karnataka' },
    { country: 'india', city: 'delhi', region: 'Delhi' },
  ],

  // Services
  SERVICES: [
    { name: 'Custom Software Development', slug: 'custom-software-development' },
    { name: 'Mobile App Development', slug: 'mobile-app-development' },
    { name: 'AI Agents Development', slug: 'ai-agents-development' },
    { name: 'SaaS Development', slug: 'saas-development' },
    { name: 'Enterprise Solutions', slug: 'enterprise-solutions' },
  ],

  // Ready-Built Solutions
  READY_BUILT_SOLUTIONS: [
    { id: "ecommerce", name: "E-Commerce", category: "marketplace" },
    { id: "marketplace", name: "Marketplace", category: "marketplace" },
    { id: "hyper_local_delivery", name: "Hyper-Local Delivery", category: "logistics" },
    { id: "taxi", name: "Taxi Cab Service", category: "transportation" },
    { id: "m_health", name: "M-Health", category: "healthcare" },
    { id: "food_delivery", name: "Food Delivery", category: "marketplace" },
    { id: "dating_app", name: "Dating App", category: "social" },
    { id: "social_media_app", name: "Social Media App", category: "social" },
    { id: "hotel_booking", name: "Hotel Booking Solution", category: "travel" },
    { id: "financial_services", name: "Financial Services", category: "finance" },
    { id: "fitness_app", name: "Fitness App", category: "healthcare" },
    { id: "real_estate", name: "Real-Estate Application", category: "real-estate" },
  ],

  // Feature Flags
  FEATURE_FLAGS: {
    AI_BUILDER: true,
    REAL_TIME_COLLAB: true,
    ENTERPRISE_FEATURES: false,
    BETA_FEATURES: false,
  },
};