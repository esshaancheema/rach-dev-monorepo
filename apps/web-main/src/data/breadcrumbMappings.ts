import { BreadcrumbItem } from '@/components/navigation/BreadcrumbNavigation';

// Extended route mappings for complex paths and dynamic routes
export interface RouteMapping {
  path: string;
  label: string;
  parent?: string;
  icon?: string;
  category?: string;
}

export interface BreadcrumbConfig {
  customMappings: Record<string, BreadcrumbItem[]>;
  dynamicMappings: Record<string, (params: Record<string, string>) => BreadcrumbItem[]>;
  categoryMappings: Record<string, string>;
}

// Custom breadcrumb configurations for specific pages
export const customBreadcrumbMappings: Record<string, BreadcrumbItem[]> = {
  '/solutions/products': [
    { label: 'Home', href: '/' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Product Solutions', href: '/solutions/products', isCurrentPage: true }
  ],
  
  '/ai-agents': [
    { label: 'Home', href: '/' },
    { label: 'AI Agents', href: '/ai-agents', isCurrentPage: true }
  ],

  '/resources/blog': [
    { label: 'Home', href: '/' },
    { label: 'Resources', href: '/resources' },
    { label: 'Blog', href: '/resources/blog', isCurrentPage: true }
  ],

  '/case-studies': [
    { label: 'Home', href: '/' },
    { label: 'Case Studies', href: '/case-studies', isCurrentPage: true }
  ]
};

// Dynamic breadcrumb generators for parameterized routes
export const dynamicBreadcrumbMappings: Record<string, (params: Record<string, string>) => BreadcrumbItem[]> = {
  // Blog post pages: /resources/blog/[slug]
  '/resources/blog/[slug]': (params) => [
    { label: 'Home', href: '/' },
    { label: 'Resources', href: '/resources' },
    { label: 'Blog', href: '/resources/blog' },
    { 
      label: formatSlugToTitle(params.slug), 
      href: `/resources/blog/${params.slug}`,
      isCurrentPage: true 
    }
  ],

  // Case study pages: /case-studies/[slug]
  '/case-studies/[slug]': (params) => [
    { label: 'Home', href: '/' },
    { label: 'Case Studies', href: '/case-studies' },
    { 
      label: formatSlugToTitle(params.slug), 
      href: `/case-studies/${params.slug}`,
      isCurrentPage: true 
    }
  ],

  // Service pages: /services/[slug]
  '/services/[slug]': (params) => [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { 
      label: getServiceTitle(params.slug), 
      href: `/services/${params.slug}`,
      isCurrentPage: true 
    }
  ],

  // Solution category pages: /solutions/products/[category]
  '/solutions/products/[category]': (params) => [
    { label: 'Home', href: '/' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Product Solutions', href: '/solutions/products' },
    { 
      label: getSolutionCategoryTitle(params.category), 
      href: `/solutions/products/${params.category}`,
      isCurrentPage: true 
    }
  ],

  // Individual product pages: /solutions/products/[category]/[product]
  '/solutions/products/[category]/[product]': (params) => [
    { label: 'Home', href: '/' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Product Solutions', href: '/solutions/products' },
    { 
      label: getSolutionCategoryTitle(params.category), 
      href: `/solutions/products/${params.category}` 
    },
    { 
      label: formatSlugToTitle(params.product), 
      href: `/solutions/products/${params.category}/${params.product}`,
      isCurrentPage: true 
    }
  ],

  // AI Agent pages: /ai-agents/[slug]
  '/ai-agents/[slug]': (params) => [
    { label: 'Home', href: '/' },
    { label: 'AI Agents', href: '/ai-agents' },
    { 
      label: getAIAgentTitle(params.slug), 
      href: `/ai-agents/${params.slug}`,
      isCurrentPage: true 
    }
  ],

  // Location-based service pages: /locations/[country]/[city]/[service]
  '/locations/[country]/[city]/[service]': (params) => [
    { label: 'Home', href: '/' },
    { label: 'Locations', href: '/locations' },
    { 
      label: formatSlugToTitle(params.country), 
      href: `/locations/${params.country}` 
    },
    { 
      label: formatSlugToTitle(params.city), 
      href: `/locations/${params.country}/${params.city}` 
    },
    { 
      label: `${getServiceTitle(params.service)} in ${formatSlugToTitle(params.city)}`, 
      href: `/locations/${params.country}/${params.city}/${params.service}`,
      isCurrentPage: true 
    }
  ]
};

// Category-specific title mappings
export const solutionCategoryTitles: Record<string, string> = {
  'e-commerce': 'E-commerce Solutions',
  'food-delivery': 'Food Delivery Platforms',
  'telemedicine': 'Healthcare & Telemedicine',
  'financial-services': 'Financial Services',
  'real-estate': 'Real Estate Platforms',
  'ride-hailing': 'Transportation & Logistics',
  'automobile-services': 'Automobile Services',
  'dating-platform': 'Dating Platforms',
  'event-booking': 'Event Booking Systems',
  'fantasy-sports': 'Fantasy Sports Platforms',
  'fitness-wellness': 'Fitness & Wellness Apps',
  'home-services': 'Home Services Platforms',
  'hotel-booking': 'Hotel Booking Systems',
  'movers-packers': 'Movers & Packers Solutions',
  'news-media': 'News & Media Platforms',
  'parking-solutions': 'Smart Parking Solutions',
  'trucking-logistics': 'Trucking & Logistics'
};

export const serviceTitles: Record<string, string> = {
  'web-development': 'Web Development',
  'mobile-development': 'Mobile App Development',
  'custom-software-development': 'Custom Software Development',
  'ai-development': 'AI & Machine Learning Development',
  'ai-integration': 'AI Integration Services',
  'api-development': 'API Development & Integration',
  'devops-automation': 'DevOps & Automation',
  'ui-ux-design': 'UI/UX Design Services',
  'quality-assurance': 'Quality Assurance & Testing',
  'software-development': 'Software Development',
  'enterprise-solutions': 'Enterprise Solutions'
};

export const aiAgentTitles: Record<string, string> = {
  'customer-support': 'Customer Support Agents',
  'sales-lead-generation': 'Sales & Lead Generation Agents',
  'content-marketing': 'Content Marketing Agents',
  'data-analysis': 'Data Analysis Agents',
  'virtual-assistants': 'Virtual Personal Assistants',
  'workflow-automation': 'Workflow Automation Agents'
};

// Helper functions
export function formatSlugToTitle(slug: string): string {
  if (!slug) return '';
  
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getServiceTitle(slug: string): string {
  return serviceTitles[slug] || formatSlugToTitle(slug);
}

export function getSolutionCategoryTitle(slug: string): string {
  return solutionCategoryTitles[slug] || formatSlugToTitle(slug);
}

export function getAIAgentTitle(slug: string): string {
  return aiAgentTitles[slug] || formatSlugToTitle(slug);
}

// Main breadcrumb generator function
export function generateBreadcrumbs(
  pathname: string, 
  params: Record<string, string> = {}
): BreadcrumbItem[] {
  // Check for custom mappings first
  if (customBreadcrumbMappings[pathname]) {
    return customBreadcrumbMappings[pathname];
  }

  // Check for dynamic mappings
  const dynamicRoute = Object.keys(dynamicBreadcrumbMappings).find(route => {
    const routePattern = route.replace(/\[([^\]]+)\]/g, '([^/]+)');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(pathname);
  });

  if (dynamicRoute && dynamicBreadcrumbMappings[dynamicRoute]) {
    return dynamicBreadcrumbMappings[dynamicRoute](params);
  }

  // Fallback to automatic generation
  return generateAutomaticBreadcrumbs(pathname);
}

function generateAutomaticBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === '/') return [];

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    const label = getSegmentLabel(segment, segments, index);

    breadcrumbs.push({
      label,
      href: currentPath,
      isCurrentPage: isLast
    });
  });

  return breadcrumbs;
}

function getSegmentLabel(segment: string, allSegments: string[], index: number): string {
  // Context-aware labeling
  const parent = index > 0 ? allSegments[index - 1] : '';
  
  if (parent === 'solutions' && segment === 'products') {
    return 'Product Solutions';
  }
  
  if (parent === 'ai-agents') {
    return getAIAgentTitle(segment);
  }
  
  if (parent === 'services') {
    return getServiceTitle(segment);
  }
  
  if (parent === 'products') {
    return getSolutionCategoryTitle(segment);
  }
  
  // Default formatting
  return formatSlugToTitle(segment);
}

// Export all configurations
export const breadcrumbConfig: BreadcrumbConfig = {
  customMappings: customBreadcrumbMappings,
  dynamicMappings: dynamicBreadcrumbMappings,
  categoryMappings: {
    ...serviceTitles,
    ...solutionCategoryTitles,
    ...aiAgentTitles
  }
};