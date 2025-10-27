import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com';
const BRAND_NAME = 'Zoptal';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  path: string;
  type?: 'website' | 'article' | 'product';
  image?: string;
  noIndex?: boolean;
  alternates?: {
    [locale: string]: string;
  };
}

// Optimized page titles (all under 60 characters)
export const PAGE_TITLES = {
  // Homepage
  home: 'Zoptal - AI-Accelerated Development Platform',
  
  // Services
  services: 'Software Development Services | Zoptal',
  customSoftwareEnterprise: 'Enterprise Software Development | Zoptal',
  customSoftwareStartup: 'Startup Software Development | Zoptal',
  customSoftwareHealthcare: 'Healthcare Software Development | Zoptal',
  customSoftwareFinance: 'Financial Software Development | Zoptal',
  customSoftwareRetail: 'Retail Software Development | Zoptal',
  mobileAppiOS: 'iOS App Development Services | Zoptal',
  mobileAppAndroid: 'Android App Development | Zoptal',
  mobileAppCrossPlatform: 'Cross-Platform App Development | Zoptal',
  aiAgentsDevelopment: 'AI Agents Development Services | Zoptal',
  saasMicroSaas: 'Micro SaaS Development | Zoptal',
  saasEnterprise: 'Enterprise SaaS Development | Zoptal',
  enterpriseSolutions: 'Enterprise Software Solutions | Zoptal',
  
  // Static Pages
  about: 'About Zoptal - AI Development Team',
  contact: 'Contact Zoptal - Get Started Today',
  pricing: 'Pricing Plans - Zoptal Development Services',
  enterprise: 'Enterprise Solutions | Zoptal',
  aiAgents: 'AI Agents & Automation | Zoptal',
  
  // Resources
  blog: 'Development Blog & Insights | Zoptal',
  documentation: 'Developer Documentation | Zoptal',
  apiReference: 'API Reference & Guides | Zoptal',
  whitepapers: 'Technical Whitepapers | Zoptal',
  helpCenter: 'Help Center & Support | Zoptal',
  
  // Case Studies
  caseStudies: 'Success Stories & Case Studies | Zoptal',
  caseStudiesByIndustry: 'Industry Case Studies | Zoptal',
  caseStudiesByTechnology: 'Technology Case Studies | Zoptal',
  caseStudiesBySolution: 'Solution Case Studies | Zoptal',
  
  // Locations
  locations: 'Global Development Centers | Zoptal',
  
  // Legal
  privacy: 'Privacy Policy | Zoptal',
  terms: 'Terms of Service | Zoptal',
  cookies: 'Cookie Policy | Zoptal',
  gdpr: 'GDPR Compliance | Zoptal',
  
  // Auth
  login: 'Login to Zoptal Platform',
  register: 'Sign Up for Zoptal',
  forgotPassword: 'Reset Password | Zoptal',
  
  // Solutions
  products: 'Development Products & Tools | Zoptal',
  technologyStack: 'Technology Stack & Tools | Zoptal',
  aiAgentsSolutions: 'AI Agents Solutions | Zoptal',
} as const;

// Optimized meta descriptions (all under 160 characters)
export const PAGE_DESCRIPTIONS = {
  // Homepage
  home: 'Transform software development with AI. Custom solutions, expert teams, and cutting-edge tools. Build faster, smarter, and scale efficiently.',
  
  // Services
  services: 'Professional software development services including custom apps, mobile development, AI solutions, and enterprise systems. Get started today.',
  customSoftwareEnterprise: 'Enterprise-grade custom software development. Scalable solutions, robust architecture, and seamless integration for large organizations.',
  customSoftwareStartup: 'Fast, cost-effective software development for startups. MVP to scale with agile development and modern technology stacks.',
  customSoftwareHealthcare: 'HIPAA-compliant healthcare software development. EMR systems, patient portals, and medical device integration solutions.',
  customSoftwareFinance: 'Secure financial software development. Banking apps, payment systems, and trading platforms with regulatory compliance.',
  customSoftwareRetail: 'E-commerce and retail software solutions. Online stores, inventory management, and customer experience platforms.',
  mobileAppiOS: 'Native iOS app development services. Swift and Objective-C expertise for App Store success and optimal user experience.',
  mobileAppAndroid: 'Native Android app development. Kotlin and Java solutions for Google Play Store with material design principles.',
  mobileAppCrossPlatform: 'Cross-platform mobile development with React Native and Flutter. One codebase, multiple platforms, faster time-to-market.',
  aiAgentsDevelopment: 'AI agents and automation development. Machine learning, NLP, and intelligent workflow automation for business efficiency.',
  saasMicroSaas: 'Micro SaaS development services. Niche software solutions with subscription models and rapid market validation.',
  saasEnterprise: 'Enterprise SaaS platform development. Multi-tenant architecture, scalability, and comprehensive feature sets.',
  enterpriseSolutions: 'Complete enterprise software solutions. Legacy modernization, system integration, and digital transformation services.',
  
  // Static Pages
  about: 'Meet the Zoptal team. Expert developers, designers, and AI specialists dedicated to transforming software development worldwide.',
  contact: 'Ready to start your project? Contact Zoptal for a free consultation. Get expert development services tailored to your needs.',
  pricing: 'Transparent pricing for development services. Flexible plans for startups to enterprises. Get custom quotes for your project.',
  enterprise: 'Enterprise-grade solutions for large organizations. Scalable architecture, security, and dedicated support teams.',
  aiAgents: 'AI agents and automation solutions. Intelligent workflows, process automation, and machine learning integration.',
  
  // Resources
  blog: 'Latest insights on software development, AI trends, and technology best practices. Stay updated with industry expertise.',
  documentation: 'Comprehensive developer documentation, API guides, and technical resources for seamless integration and development.',
  apiReference: 'Complete API reference with examples, authentication guides, and SDK documentation for developers.',
  whitepapers: 'In-depth technical whitepapers on software architecture, AI implementation, and development best practices.',
  helpCenter: 'Get help with Zoptal services. FAQs, tutorials, and support resources for developers and project managers.',
  
  // Case Studies
  caseStudies: 'Real success stories from our clients. See how Zoptal delivered exceptional software solutions across industries.',
  caseStudiesByIndustry: 'Industry-specific case studies showcasing successful software implementations and business outcomes.',
  caseStudiesByTechnology: 'Technology-focused case studies demonstrating expertise in various programming languages and frameworks.',
  caseStudiesBySolution: 'Solution-based case studies showing how we solve complex business challenges with custom software.',
  
  // Locations
  locations: 'Global development centers and offices. Local expertise with international reach for software development projects.',
  
  // Legal
  privacy: 'Zoptal privacy policy. How we collect, use, and protect your personal information and data security measures.',
  terms: 'Terms of service for Zoptal platform and development services. User agreements and service conditions.',
  cookies: 'Cookie policy explaining how we use cookies to improve user experience and website functionality.',
  gdpr: 'GDPR compliance information and data protection measures. Your rights and how we handle personal data.',
  
  // Auth
  login: 'Access your Zoptal account dashboard. Manage projects, view progress, and collaborate with development teams.',
  register: 'Create your Zoptal account to start your development journey. Access expert teams and AI-powered tools.',
  forgotPassword: 'Reset your Zoptal account password. Secure password recovery process to regain access to your account.',
  
  // Solutions
  products: 'Explore our development products and tools. Pre-built solutions and frameworks to accelerate your development process.',
  technologyStack: 'Our comprehensive technology stack. Modern frameworks, cloud platforms, and development tools we use.',
  aiAgentsSolutions: 'AI agents and automation solutions for businesses. Intelligent workflows and process optimization.',
} as const;

// Generate optimized metadata for any page
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    path,
    type = 'website',
    image,
    noIndex = false,
    alternates
  } = config;
  
  const url = `${BASE_URL}${path}`;
  const optimizedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  const optimizedDescription = description.length > 160 ? description.substring(0, 157) + '...' : description;
  
  // Generate hreflang alternates
  const hreflangAlternates = alternates || generateHreflangAlternates(path);
  
  return {
    title: optimizedTitle,
    description: optimizedDescription,
    keywords: keywords.join(', '),
    
    // Basic meta
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    
    // Open Graph
    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      url,
      siteName: BRAND_NAME,
      type,
      images: image ? [{ url: image }] : [{ url: `${BASE_URL}/images/og-default.png` }],
      locale: 'en_US',
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: optimizedTitle,
      description: optimizedDescription,
      site: '@zoptal',
      creator: '@zoptal',
      images: image ? [image] : [`${BASE_URL}/images/og-default.png`],
    },
    
    // Canonical and alternates
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
      languages: hreflangAlternates,
    },
    
    // Additional meta
    other: {
      'format-detection': 'telephone=no',
    },
  };
}

// Helper function to generate hreflang alternates
function generateHreflangAlternates(path: string) {
  const locales = ['en', 'es', 'fr', 'de', 'ar', 'hi', 'zh'];
  const alternates: { [locale: string]: string } = {};
  
  locales.forEach(locale => {
    if (locale === 'en') {
      alternates[locale] = `${BASE_URL}${path}`;
    } else {
      alternates[locale] = `${BASE_URL}/${locale}${path}`;
    }
  });
  
  return alternates;
}

// Quick generators for common page types
export const seoMetadata = {
  homepage: () => generateMetadata({
    title: PAGE_TITLES.home,
    description: PAGE_DESCRIPTIONS.home,
    path: '/',
    keywords: ['AI development', 'custom software', 'mobile apps', 'enterprise solutions', 'software development services'],
  }),
  
  servicePage: (service: keyof typeof PAGE_TITLES, path: string) => generateMetadata({
    title: PAGE_TITLES[service] || `${service} | ${BRAND_NAME}`,
    description: PAGE_DESCRIPTIONS[service] || `Professional ${service} services by ${BRAND_NAME}`,
    path,
    type: 'website' as const,
    keywords: ['software development', 'custom development', 'enterprise solutions'],
  }),
  
  blogPost: (title: string, description: string, path: string, image?: string) => generateMetadata({
    title: `${title} | ${BRAND_NAME} Blog`,
    description,
    path,
    type: 'article',
    image,
    keywords: ['software development', 'programming', 'technology', 'AI'],
  }),
  
  caseStudy: (title: string, description: string, path: string, image?: string) => generateMetadata({
    title: `${title} | ${BRAND_NAME} Case Studies`,
    description,
    path,
    type: 'article',
    image,
    keywords: ['case study', 'success story', 'software development', 'client results'],
  }),
  
  locationPage: (location: string, service: string, path: string) => generateMetadata({
    title: `${service} in ${location} | ${BRAND_NAME}`,
    description: `Professional ${service} services in ${location}. Local expertise with global standards for your software development needs.`,
    path,
    type: 'website' as const,
    keywords: [service.toLowerCase(), location.toLowerCase(), 'software development', 'local services'],
  }),
};

// Alias for backward compatibility
export const createMetadata = generateMetadata;