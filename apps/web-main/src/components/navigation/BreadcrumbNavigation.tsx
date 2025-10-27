'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbNavigationProps {
  className?: string;
  customBreadcrumbs?: BreadcrumbItem[];
  showHome?: boolean;
  maxItems?: number;
  separator?: React.ReactNode;
}

// Route mappings for better breadcrumb labels
const routeMappings: Record<string, string> = {
  // Services
  'services': 'Services',
  'web-development': 'Web Development',
  'mobile-development': 'Mobile Development',
  'custom-software-development': 'Custom Software Development',
  'ai-development': 'AI Development',
  'ai-integration': 'AI Integration',
  'api-development': 'API Development',
  'devops-automation': 'DevOps Automation',
  'ui-ux-design': 'UI/UX Design',
  'quality-assurance': 'Quality Assurance',
  'software-development': 'Software Development',
  'enterprise-solutions': 'Enterprise Solutions',

  // Solutions
  'solutions': 'Solutions',
  'products': 'Product Solutions',
  'technology-stack': 'Technology Stack',
  'enterprise': 'Enterprise',

  // AI Agents
  'ai-agents': 'AI Agents',
  'customer-support': 'Customer Support',
  'sales-lead-generation': 'Sales & Lead Generation',
  'content-marketing': 'Content Marketing',
  'data-analysis': 'Data Analysis',
  'virtual-assistants': 'Virtual Assistants',
  'workflow-automation': 'Workflow Automation',

  // Industry Solutions
  'e-commerce': 'E-commerce',
  'food-delivery': 'Food Delivery',
  'telemedicine': 'Healthcare & Telemedicine',
  'financial-services': 'Financial Services',
  'real-estate': 'Real Estate',
  'ride-hailing': 'Transportation & Logistics',
  'automobile-services': 'Automobile Services',
  'dating-platform': 'Dating Platform',
  'event-booking': 'Event Booking',
  'fantasy-sports': 'Fantasy Sports',
  'fitness-wellness': 'Fitness & Wellness',
  'home-services': 'Home Services',
  'hotel-booking': 'Hotel Booking',
  'movers-packers': 'Movers & Packers',
  'news-media': 'News & Media',
  'parking-solutions': 'Parking Solutions',
  'trucking-logistics': 'Trucking & Logistics',

  // Resources
  'resources': 'Resources',
  'blog': 'Blog',
  'case-studies': 'Case Studies',
  'guides': 'Guides & Tutorials',
  'whitepapers': 'Whitepapers',
  'help-center': 'Help Center',
  'api-reference': 'API Reference',
  'documentation': 'Documentation',

  // Other
  'contact': 'Contact',
  'about': 'About',
  'pricing': 'Pricing',
  'legal': 'Legal',
  'privacy': 'Privacy Policy',
  'terms': 'Terms of Service',
  'cookies': 'Cookie Policy',
  'gdpr': 'GDPR Compliance',
  'security': 'Security',
  'compliance': 'Compliance'
};

const BreadcrumbNavigation = ({
  className = '',
  customBreadcrumbs,
  showHome = true,
  maxItems = 5,
  separator
}: BreadcrumbNavigationProps) => {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Use custom breadcrumbs if provided
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    // Don't show breadcrumbs on homepage
    if (pathname === '/') {
      return [];
    }

    // Parse pathname into segments
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [];

    // Add home if requested
    if (showHome) {
      breadcrumbItems.push({
        label: 'Home',
        href: '/'
      });
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Get human-readable label
      const label = routeMappings[segment] || 
                   segment.split('-').map(word => 
                     word.charAt(0).toUpperCase() + word.slice(1)
                   ).join(' ');

      breadcrumbItems.push({
        label,
        href: currentPath,
        isCurrentPage: isLast
      });
    });

    return breadcrumbItems;
  }, [pathname, customBreadcrumbs, showHome]);

  // Don't render if no breadcrumbs or only home
  if (breadcrumbs.length <= 1 && showHome) {
    return null;
  }

  // Truncate breadcrumbs if too many
  const displayBreadcrumbs = breadcrumbs.length > maxItems 
    ? [
        ...breadcrumbs.slice(0, 1), // Always show first (home)
        { label: '...', href: '', isEllipsis: true },
        ...breadcrumbs.slice(-2) // Show last 2
      ]
    : breadcrumbs;

  // Default separator
  const defaultSeparator = <ChevronRightIcon className="w-4 h-4 text-gray-400" />;

  return (
    <nav 
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {displayBreadcrumbs.map((item, index) => {
          const isLast = index === displayBreadcrumbs.length - 1;
          const isEllipsis = 'isEllipsis' in item && item.isEllipsis;

          return (
            <li key={item.href || index} className="flex items-center">
              {/* Breadcrumb Item */}
              {isEllipsis ? (
                <span className="text-gray-500">...</span>
              ) : item.isCurrentPage || isLast ? (
                <span 
                  className="text-gray-900 font-medium"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {index === 0 && showHome && item.label === 'Home' ? (
                    <HomeIcon className="w-4 h-4" />
                  ) : (
                    item.label
                  )}
                </Link>
              )}

              {/* Separator */}
              {!isLast && (
                <span className="ml-2 mr-2 flex-shrink-0">
                  {separator || defaultSeparator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Utility function to generate structured data for SEO
export const generateBreadcrumbStructuredData = (breadcrumbs: BreadcrumbItem[]) => {
  if (!breadcrumbs.length) return null;

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}`
    }))
  };
};

// Hook for generating breadcrumbs in pages
export const useBreadcrumbs = (customBreadcrumbs?: BreadcrumbItem[]) => {
  const pathname = usePathname();
  
  return useMemo(() => {
    if (customBreadcrumbs) return customBreadcrumbs;
    
    if (pathname === '/') return [];

    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [{
      label: 'Home',
      href: '/'
    }];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      const label = routeMappings[segment] || 
                   segment.split('-').map(word => 
                     word.charAt(0).toUpperCase() + word.slice(1)
                   ).join(' ');

      breadcrumbItems.push({
        label,
        href: currentPath,
        isCurrentPage: isLast
      });
    });

    return breadcrumbItems;
  }, [pathname, customBreadcrumbs]);
};

export default BreadcrumbNavigation;