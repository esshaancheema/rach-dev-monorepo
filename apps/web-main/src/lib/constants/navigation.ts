export interface NavigationItem {
  label: string;
  href: string;
  description?: string;
  badge?: string;
  children?: NavigationItem[];
  external?: boolean;
  featured?: boolean;
}

export interface MegaMenuSection {
  title: string;
  items: NavigationItem[];
}

export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    label: 'Solutions',
    href: '/solutions',
    children: [
      {
        label: 'Products',
        href: '/solutions/products',
        description: 'Browse our ready-built solutions',
        children: [
          { label: 'All Products', href: '/solutions/products' },
          { label: 'Web Applications', href: '/solutions/products/web-apps' },
          { label: 'Mobile Apps', href: '/solutions/products/mobile-apps' },
          { label: 'AI Agents', href: '/solutions/products/ai-agents' },
          { label: 'SaaS Platforms', href: '/solutions/products/saas' },
          { label: 'E-commerce', href: '/solutions/products/ecommerce' },
        ],
      },
      {
        label: 'Technology Stack',
        href: '/solutions/technology-stack',
        description: 'Modern technologies we use',
      },
      {
        label: 'AI Agents',
        href: '/solutions/ai-agents',
        description: 'Intelligent automation solutions',
        badge: 'Popular',
      },
    ],
  },
  {
    label: 'Services',
    href: '/services',
    children: [
      {
        label: 'Custom Software Development',
        href: '/services/custom-software-development',
        description: 'Tailored software solutions',
        children: [
          { label: 'Enterprise Solutions', href: '/services/custom-software-development/enterprise' },
          { label: 'Startup Solutions', href: '/services/custom-software-development/startup' },
          { label: 'Healthcare', href: '/services/custom-software-development/by-industry/healthcare' },
          { label: 'Finance', href: '/services/custom-software-development/by-industry/finance' },
          { label: 'Retail', href: '/services/custom-software-development/by-industry/retail' },
        ],
      },
      {
        label: 'Mobile App Development',
        href: '/services/mobile-app-development',
        description: 'Native and cross-platform apps',
        children: [
          { label: 'iOS Development', href: '/services/mobile-app-development/ios' },
          { label: 'Android Development', href: '/services/mobile-app-development/android' },
          { label: 'Cross-Platform', href: '/services/mobile-app-development/cross-platform' },
        ],
      },
      {
        label: 'AI Agents Development',
        href: '/services/ai-agents-development',
        description: 'Build intelligent automation',
        badge: 'New',
      },
      {
        label: 'SaaS Development',
        href: '/services/saas-development',
        description: 'Scalable SaaS platforms',
        children: [
          { label: 'Micro SaaS', href: '/services/saas-development/micro-saas' },
          { label: 'Enterprise SaaS', href: '/services/saas-development/enterprise-saas' },
        ],
      },
      {
        label: 'Enterprise Solutions',
        href: '/services/enterprise-solutions',
        description: 'Large-scale digital transformation',
      },
    ],
  },
  {
    label: 'Case Studies',
    href: '/case-studies',
    children: [
      {
        label: 'All Case Studies',
        href: '/case-studies',
        description: 'Browse all success stories',
      },
      {
        label: 'By Industry',
        href: '/case-studies/by-industry',
        description: 'Industry-specific case studies',
      },
      {
        label: 'By Technology',
        href: '/case-studies/by-technology',
        description: 'Technology-focused case studies',
      },
      {
        label: 'By Solution Type',
        href: '/case-studies/by-solution',
        description: 'Solution-specific case studies',
      },
    ],
  },
  {
    label: 'Resources',
    href: '/resources',
    children: [
      {
        label: 'Documentation',
        href: '/resources/documentation',
        description: 'Complete developer guides',
        featured: true,
      },
      {
        label: 'API Reference',
        href: '/resources/api-reference',
        description: 'Complete API documentation',
        featured: true,
      },
      {
        label: 'Blog',
        href: '/resources/blog',
        description: 'Latest insights and tutorials',
      },
      {
        label: 'Whitepapers',
        href: '/resources/whitepapers',
        description: 'Industry research and reports',
      },
      {
        label: 'Help Center',
        href: '/resources/help-center',
        description: 'Get support and find answers',
      },
    ],
  },
  {
    label: 'Pricing',
    href: '/pricing',
  },
  {
    label: 'Enterprise',
    href: '/enterprise',
  },
];

export const FOOTER_NAVIGATION = {
  'Product': [
    { label: 'AI Agents', href: '/ai-agents' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Enterprise', href: '/enterprise' },
    { label: 'What\'s New', href: '/changelog' },
  ],
  'Services': [
    { label: 'Custom Development', href: '/services/custom-software-development' },
    { label: 'Mobile Apps', href: '/services/mobile-app-development' },
    { label: 'AI Development', href: '/services/ai-agents-development' },
    { label: 'SaaS Development', href: '/services/saas-development' },
    { label: 'Consulting', href: '/services/consulting' },
  ],
  'Resources': [
    { label: 'Documentation', href: '/resources/documentation' },
    { label: 'API Reference', href: '/resources/api-reference' },
    { label: 'Blog', href: '/resources/blog' },
    { label: 'Case Studies', href: '/case-studies' },
    { label: 'Help Center', href: '/resources/help-center' },
  ],
  'Company': [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Partners', href: '/partners' },
  ],
  'Legal': [
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Terms of Service', href: '/legal/terms' },
    { label: 'Cookie Policy', href: '/legal/cookies' },
    { label: 'GDPR', href: '/legal/gdpr' },
    { label: 'Security', href: '/security' },
  ],
};

export const MOBILE_NAVIGATION: NavigationItem[] = [
  {
    label: 'Solutions',
    href: '/solutions',
    children: [
      { label: 'All Solutions', href: '/solutions' },
      { label: 'Products', href: '/solutions/products' },
      { label: 'Technology Stack', href: '/solutions/technology-stack' },
      { label: 'AI Agents', href: '/solutions/ai-agents', badge: 'Popular' },
    ],
  },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'All Services', href: '/services' },
      { label: 'Custom Development', href: '/services/custom-software-development' },
      { label: 'Mobile Apps', href: '/services/mobile-app-development' },
      { label: 'AI Development', href: '/services/ai-agents-development', badge: 'New' },
      { label: 'SaaS Development', href: '/services/saas-development' },
      { label: 'Enterprise', href: '/services/enterprise-solutions' },
    ],
  },
  {
    label: 'Case Studies',
    href: '/case-studies',
    children: [
      { label: 'All Case Studies', href: '/case-studies' },
      { label: 'By Industry', href: '/case-studies/by-industry' },
      { label: 'By Technology', href: '/case-studies/by-technology' },
      { label: 'By Solution', href: '/case-studies/by-solution' },
    ],
  },
  {
    label: 'Resources',
    href: '/resources',
    children: [
      { label: 'Documentation', href: '/resources/documentation' },
      { label: 'API Reference', href: '/resources/api-reference' },
      { label: 'Blog', href: '/resources/blog' },
      { label: 'Whitepapers', href: '/resources/whitepapers' },
      { label: 'Help Center', href: '/resources/help-center' },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Enterprise', href: '/enterprise' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const BREADCRUMB_LABELS: Record<string, string> = {
  solutions: 'Solutions',
  products: 'Products',
  'technology-stack': 'Technology Stack',
  'ai-agents': 'AI Agents',
  services: 'Services',
  'custom-software-development': 'Custom Software Development',
  'mobile-app-development': 'Mobile App Development',
  'ai-agents-development': 'AI Agents Development',
  'saas-development': 'SaaS Development',
  'enterprise-solutions': 'Enterprise Solutions',
  'case-studies': 'Case Studies',
  'by-industry': 'By Industry',
  'by-technology': 'By Technology',
  'by-solution': 'By Solution',
  resources: 'Resources',
  documentation: 'Documentation',
  'api-reference': 'API Reference',
  blog: 'Blog',
  whitepapers: 'Whitepapers',
  'help-center': 'Help Center',
  pricing: 'Pricing',
  enterprise: 'Enterprise',
  about: 'About',
  contact: 'Contact',
  locations: 'Locations',
  legal: 'Legal',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  cookies: 'Cookie Policy',
  gdpr: 'GDPR Compliance',
};

export const CTA_NAVIGATION = [
  {
    label: 'Start Building',
    href: '/signup',
    variant: 'primary' as const,
    description: 'Get started for free',
  },
  {
    label: 'Schedule Demo',
    href: '/demo',
    variant: 'outline' as const,
    description: 'See it in action',
  },
  {
    label: 'Contact Sales',
    href: '/contact',
    variant: 'ghost' as const,
    description: 'Talk to our team',
  },
];

// SEO-optimized navigation for search engines
export const SITEMAP_NAVIGATION = {
  priority: {
    high: ['/'], // Homepage
    medium: ['/solutions', '/services', '/pricing', '/enterprise', '/about', '/contact'],
    low: ['/case-studies', '/resources', '/legal/privacy', '/legal/terms'],
  },
  changeFreq: {
    daily: ['/'],
    weekly: ['/solutions', '/services', '/case-studies', '/resources/blog'],
    monthly: ['/pricing', '/enterprise', '/about', '/contact'],
    yearly: ['/legal/privacy', '/legal/terms', '/legal/cookies'],
  },
};