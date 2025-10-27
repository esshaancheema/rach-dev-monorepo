'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Internal linking structure for SEO
export const INTERNAL_LINKS = {
  // Service links
  services: {
    main: '/services',
    customSoftware: {
      main: '/services/custom-software-development',
      enterprise: '/services/custom-software-development/enterprise',
      startup: '/services/custom-software-development/startup',
      byIndustry: {
        healthcare: '/services/custom-software-development/by-industry/healthcare',
        finance: '/services/custom-software-development/by-industry/finance',
        retail: '/services/custom-software-development/by-industry/retail',
      },
    },
    mobileApp: {
      main: '/services/mobile-app-development',
      ios: '/services/mobile-app-development/ios',
      android: '/services/mobile-app-development/android',
      crossPlatform: '/services/mobile-app-development/cross-platform',
    },
    aiAgents: '/services/ai-agents-development',
    saas: {
      main: '/services/saas-development',
      microSaas: '/services/saas-development/micro-saas',
      enterprise: '/services/saas-development/enterprise-saas',
    },
    enterprise: '/services/enterprise-solutions',
  },
  
  // Location links
  locations: {
    main: '/locations',
    // Dynamic location pages will be generated programmatically
  },
  
  // Resource links
  resources: {
    main: '/resources',
    blog: '/resources/blog',
    documentation: '/resources/documentation',
    apiReference: '/resources/api-reference',
    whitepapers: '/resources/whitepapers',
    helpCenter: '/resources/help-center',
  },
  
  // Case study links
  caseStudies: {
    main: '/case-studies',
    byIndustry: '/case-studies/by-industry',
    byTechnology: '/case-studies/by-technology',
    bySolution: '/case-studies/by-solution',
  },
  
  // Solution links
  solutions: {
    main: '/solutions',
    products: '/solutions/products',
    technologyStack: '/solutions/technology-stack',
    aiAgents: '/solutions/ai-agents',
  },
  
  // Static page links
  static: {
    about: '/about',
    contact: '/contact',
    pricing: '/pricing',
    enterprise: '/enterprise',
    aiAgents: '/ai-agents',
  },
  
  // Legal links
  legal: {
    privacy: '/legal/privacy',
    terms: '/legal/terms',
    cookies: '/legal/cookies',
    gdpr: '/legal/gdpr',
  },
} as const;

// Related content suggestions based on current page
export const getRelatedLinks = (currentPath: string) => {
  const related: Array<{ title: string; href: string; description: string }> = [];
  
  // Service page relationships
  if (currentPath.includes('/services/custom-software-development')) {
    related.push(
      {
        title: 'Mobile App Development',
        href: INTERNAL_LINKS.services.mobileApp.main,
        description: 'Complement your custom software with mobile applications',
      },
      {
        title: 'Enterprise Solutions',
        href: INTERNAL_LINKS.services.enterprise,
        description: 'Scalable enterprise-grade software solutions',
      },
      {
        title: 'AI Agents Development',
        href: INTERNAL_LINKS.services.aiAgents,
        description: 'Integrate AI capabilities into your custom software',
      }
    );
  }
  
  if (currentPath.includes('/services/mobile-app-development')) {
    related.push(
      {
        title: 'Custom Software Development',
        href: INTERNAL_LINKS.services.customSoftware.main,
        description: 'Backend systems and web platforms for your mobile apps',
      },
      {
        title: 'SaaS Development',
        href: INTERNAL_LINKS.services.saas.main,
        description: 'Turn your mobile app idea into a SaaS platform',
      }
    );
  }
  
  if (currentPath.includes('/services/ai-agents-development')) {
    related.push(
      {
        title: 'Enterprise Solutions',
        href: INTERNAL_LINKS.services.enterprise,
        description: 'Integrate AI agents into enterprise workflows',
      },
      {
        title: 'Custom Software Development',
        href: INTERNAL_LINKS.services.customSoftware.main,
        description: 'Custom platforms for AI agent deployment',
      }
    );
  }
  
  // Resource page relationships
  if (currentPath.includes('/resources/blog')) {
    related.push(
      {
        title: 'Documentation',
        href: INTERNAL_LINKS.resources.documentation,
        description: 'Technical guides and API documentation',
      },
      {
        title: 'Case Studies',
        href: INTERNAL_LINKS.caseStudies.main,
        description: 'Real-world success stories and implementations',
      },
      {
        title: 'Whitepapers',
        href: INTERNAL_LINKS.resources.whitepapers,
        description: 'In-depth technical analysis and research',
      }
    );
  }
  
  // Case study relationships
  if (currentPath.includes('/case-studies')) {
    related.push(
      {
        title: 'Our Services',
        href: INTERNAL_LINKS.services.main,
        description: 'Explore the services behind these success stories',
      },
      {
        title: 'Technology Stack',
        href: INTERNAL_LINKS.solutions.technologyStack,
        description: 'Technologies used in our case studies',
      },
      {
        title: 'Get Started',
        href: INTERNAL_LINKS.static.contact,
        description: 'Start your own success story with Zoptal',
      }
    );
  }
  
  // Location page relationships
  if (currentPath.includes('/locations')) {
    related.push(
      {
        title: 'Our Services',
        href: INTERNAL_LINKS.services.main,
        description: 'Services available in all our locations',
      },
      {
        title: 'About Us',
        href: INTERNAL_LINKS.static.about,
        description: 'Learn about our global team and presence',
      },
      {
        title: 'Contact Us',
        href: INTERNAL_LINKS.static.contact,
        description: 'Get in touch with your local team',
      }
    );
  }
  
  return related.slice(0, 3); // Limit to 3 related links
};

// Breadcrumb generation
export const getBreadcrumbs = (currentPath: string) => {
  const segments = currentPath.split('/').filter(Boolean);
  const breadcrumbs = [{ title: 'Home', href: '/' }];
  
  let currentHref = '';
  
  segments.forEach((segment, index) => {
    currentHref += `/${segment}`;
    
    // Convert segment to readable title
    let title = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Special cases for better SEO titles
    if (segment === 'custom-software-development') title = 'Custom Software Development';
    if (segment === 'mobile-app-development') title = 'Mobile App Development';
    if (segment === 'ai-agents-development') title = 'AI Agents Development';
    if (segment === 'saas-development') title = 'SaaS Development';
    if (segment === 'case-studies') title = 'Case Studies';
    if (segment === 'by-industry') title = 'By Industry';
    if (segment === 'by-technology') title = 'By Technology';
    if (segment === 'by-solution') title = 'By Solution';
    if (segment === 'api-reference') title = 'API Reference';
    if (segment === 'help-center') title = 'Help Center';
    if (segment === 'technology-stack') title = 'Technology Stack';
    
    breadcrumbs.push({
      title,
      href: currentHref,
    });
  });
  
  return breadcrumbs;
};

// Component for displaying breadcrumbs
interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  
  if (breadcrumbs.length <= 1) return null;
  
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-500 font-medium">{crumb.title}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {crumb.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Component for displaying related links
interface RelatedLinksProps {
  title?: string;
  className?: string;
  limit?: number;
}

export function RelatedLinks({ 
  title = 'Related Services', 
  className = '', 
  limit = 3 
}: RelatedLinksProps) {
  const pathname = usePathname();
  const relatedLinks = getRelatedLinks(pathname).slice(0, limit);
  
  if (relatedLinks.length === 0) return null;
  
  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {relatedLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block group"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-primary-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                  {link.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{link.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Service navigation component
export function ServiceNavigation() {
  const pathname = usePathname();
  
  const serviceCategories = [
    {
      title: 'Custom Software Development',
      href: INTERNAL_LINKS.services.customSoftware.main,
      children: [
        { title: 'Enterprise', href: INTERNAL_LINKS.services.customSoftware.enterprise },
        { title: 'Startup', href: INTERNAL_LINKS.services.customSoftware.startup },
        { title: 'Healthcare', href: INTERNAL_LINKS.services.customSoftware.byIndustry.healthcare },
        { title: 'Finance', href: INTERNAL_LINKS.services.customSoftware.byIndustry.finance },
        { title: 'Retail', href: INTERNAL_LINKS.services.customSoftware.byIndustry.retail },
      ],
    },
    {
      title: 'Mobile Apps',
      href: INTERNAL_LINKS.services.mobileApp.main,
      children: [
        { title: 'iOS Development', href: INTERNAL_LINKS.services.mobileApp.ios },
        { title: 'Android Development', href: INTERNAL_LINKS.services.mobileApp.android },
        { title: 'Cross-Platform', href: INTERNAL_LINKS.services.mobileApp.crossPlatform },
      ],
    },
    {
      title: 'SaaS Development',
      href: INTERNAL_LINKS.services.saas.main,
      children: [
        { title: 'Micro SaaS', href: INTERNAL_LINKS.services.saas.microSaas },
        { title: 'Enterprise SaaS', href: INTERNAL_LINKS.services.saas.enterprise },
      ],
    },
    {
      title: 'AI Agents',
      href: INTERNAL_LINKS.services.aiAgents,
      children: [],
    },
    {
      title: 'Enterprise Solutions',
      href: INTERNAL_LINKS.services.enterprise,
      children: [],
    },
  ];
  
  return (
    <div className="bg-white border-l-4 border-primary-600 shadow-sm rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Services</h3>
      <nav className="space-y-3">
        {serviceCategories.map((category) => (
          <div key={category.href}>
            <Link
              href={category.href}
              className={`block font-medium transition-colors ${
                pathname === category.href
                  ? 'text-primary-600'
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              {category.title}
            </Link>
            {category.children.length > 0 && (
              <ul className="mt-2 ml-4 space-y-1">
                {category.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className={`block text-sm transition-colors ${
                        pathname === child.href
                          ? 'text-primary-600'
                          : 'text-gray-600 hover:text-primary-600'
                      }`}
                    >
                      {child.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}