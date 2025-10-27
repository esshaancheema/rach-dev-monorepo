export interface InternalLink {
  href: string;
  title: string;
  description?: string;
  category: 'service' | 'solution' | 'resource' | 'location' | 'company';
  priority: 'high' | 'medium' | 'low';
  keywords: string[];
}

export interface RelatedLinksConfig {
  currentPath: string;
  currentCategory: string;
  maxLinks?: number;
  includeCrossSelling?: boolean;
}

// Comprehensive internal link database
export const INTERNAL_LINKS: InternalLink[] = [
  // Service pages
  {
    href: '/services',
    title: 'Software Development Services',
    description: 'AI-powered software development services',
    category: 'service',
    priority: 'high',
    keywords: ['software development', 'custom development', 'AI development']
  },
  {
    href: '/services/custom-software-development',
    title: 'Custom Software Development',
    description: 'Tailored software solutions for your business',
    category: 'service',
    priority: 'high',
    keywords: ['custom software', 'bespoke development', 'enterprise software']
  },
  {
    href: '/services/mobile-app-development',
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile applications',
    category: 'service',
    priority: 'high',
    keywords: ['mobile app', 'iOS development', 'Android development']
  },
  {
    href: '/services/ai-agents-development',
    title: 'AI Agents Development',
    description: 'Intelligent automation and AI chatbots',
    category: 'service',
    priority: 'high',
    keywords: ['AI agents', 'chatbots', 'automation', 'artificial intelligence']
  },
  {
    href: '/services/enterprise-solutions',
    title: 'Enterprise Solutions',
    description: 'Scalable enterprise software solutions',
    category: 'service',
    priority: 'high',
    keywords: ['enterprise', 'scalable solutions', 'business software']
  },

  // Solution pages
  {
    href: '/solutions/ai-agents',
    title: 'AI Agents Platform', 
    description: 'Build intelligent AI agents without code',
    category: 'solution',
    priority: 'high',
    keywords: ['AI platform', 'no-code AI', 'intelligent agents']
  },
  {
    href: '/solutions/technology-stack',
    title: 'Technology Stack',
    description: 'Modern technologies powering our platform',
    category: 'solution',
    priority: 'medium',
    keywords: ['technology stack', 'modern tech', 'development tools']
  },
  {
    href: '/solutions/products',
    title: 'Product Solutions',
    description: 'Ready-to-use product solutions',
    category: 'solution',
    priority: 'medium',
    keywords: ['product solutions', 'ready-made solutions', 'templates']
  },

  // Resource pages
  {
    href: '/resources/blog',
    title: 'Tech Blog',
    description: 'Latest insights on AI and development',
    category: 'resource',
    priority: 'medium',
    keywords: ['blog', 'tech insights', 'development tips', 'AI news']
  },
  {
    href: '/resources/documentation',
    title: 'Developer Documentation',
    description: 'Complete guides and API reference',
    category: 'resource',
    priority: 'high',
    keywords: ['documentation', 'developer guides', 'API reference']
  },
  {
    href: '/resources/help-center',
    title: 'Help Center',
    description: 'Support and troubleshooting guides',
    category: 'resource',
    priority: 'medium',
    keywords: ['help', 'support', 'troubleshooting', 'FAQ']
  },
  {
    href: '/resources/whitepapers',
    title: 'Whitepapers & Research',
    description: 'Industry insights and research reports',
    category: 'resource',
    priority: 'medium',
    keywords: ['whitepapers', 'research', 'industry insights']
  },
  {
    href: '/resources/api-reference',
    title: 'API Reference',
    description: 'Complete API documentation',
    category: 'resource',
    priority: 'high',
    keywords: ['API', 'reference', 'integration', 'endpoints']
  },

  // Location pages
  {
    href: '/locations',
    title: 'Global Development Centers',
    description: 'Our worldwide software development locations',
    category: 'location',
    priority: 'medium',
    keywords: ['global offices', 'development centers', 'locations']
  },
  {
    href: '/locations/united-states',
    title: 'Software Development in USA',
    description: 'US-based development teams and services',
    category: 'location',
    priority: 'high',
    keywords: ['USA development', 'US software development', 'American developers']
  },
  {
    href: '/locations/united-kingdom',
    title: 'Software Development in UK',
    description: 'UK-based development teams and services',
    category: 'location',
    priority: 'high',
    keywords: ['UK development', 'British developers', 'London tech']
  },
  {
    href: '/locations/india',
    title: 'Software Development in India',
    description: 'Indian development teams and services',
    category: 'location',
    priority: 'high',
    keywords: ['India development', 'Bangalore developers', 'offshore development']
  },

  // Company pages
  {
    href: '/about',
    title: 'About Zoptal',
    description: 'Our story and mission in AI development',
    category: 'company',
    priority: 'medium',
    keywords: ['about us', 'company story', 'mission', 'team']
  },
  {
    href: '/contact',
    title: 'Contact Us',
    description: 'Get in touch with our team',
    category: 'company',
    priority: 'high',
    keywords: ['contact', 'get in touch', 'support', 'sales']
  },
  {
    href: '/pricing',
    title: 'Pricing Plans',
    description: 'Transparent pricing for all plans',
    category: 'company',
    priority: 'high',
    keywords: ['pricing', 'plans', 'cost', 'subscription']
  },
  {
    href: '/enterprise',
    title: 'Enterprise Solutions',
    description: 'Enterprise-grade AI development platform',
    category: 'company',
    priority: 'high',
    keywords: ['enterprise', 'business solutions', 'large organizations']
  },
  {
    href: '/ai-agents',
    title: 'AI Agents Builder',
    description: 'No-code AI agent development platform',
    category: 'company',
    priority: 'high',
    keywords: ['AI agents', 'no-code', 'chatbot builder']
  }
];

/**
 * Get related internal links based on current page context
 */
export function getRelatedLinks(config: RelatedLinksConfig): InternalLink[] {
  const { currentPath, currentCategory, maxLinks = 6, includeCrossSelling = true } = config;
  
  // Filter out current page
  const availableLinks = INTERNAL_LINKS.filter(link => link.href !== currentPath);
  
  // Prioritize same category links
  const sameCategoryLinks = availableLinks.filter(link => link.category === currentCategory);
  const otherCategoryLinks = availableLinks.filter(link => link.category !== currentCategory);
  
  // Sort by priority (high > medium > low)
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const sortByPriority = (a: InternalLink, b: InternalLink) => 
    priorityOrder[b.priority] - priorityOrder[a.priority];
  
  sameCategoryLinks.sort(sortByPriority);
  otherCategoryLinks.sort(sortByPriority);
  
  const selectedLinks: InternalLink[] = [];
  
  // Add same category links first (up to 60% of max)
  const sameCategoryLimit = Math.ceil(maxLinks * 0.6);
  selectedLinks.push(...sameCategoryLinks.slice(0, sameCategoryLimit));
  
  // Fill remaining slots with cross-selling links if enabled
  if (includeCrossSelling && selectedLinks.length < maxLinks) {
    const remainingSlots = maxLinks - selectedLinks.length;
    selectedLinks.push(...otherCategoryLinks.slice(0, remainingSlots));
  }
  
  return selectedLinks.slice(0, maxLinks);
}

/**
 * Get contextual links based on page content keywords
 */
export function getContextualLinks(
  pageKeywords: string[],
  currentPath: string,
  maxLinks: number = 4
): InternalLink[] {
  const availableLinks = INTERNAL_LINKS.filter(link => link.href !== currentPath);
  
  // Score links based on keyword overlap
  const scoredLinks = availableLinks.map(link => {
    const keywordOverlap = link.keywords.filter(keyword =>
      pageKeywords.some(pageKeyword => 
        keyword.toLowerCase().includes(pageKeyword.toLowerCase()) ||
        pageKeyword.toLowerCase().includes(keyword.toLowerCase())
      )
    ).length;
    
    const priorityScore = { high: 3, medium: 2, low: 1 }[link.priority];
    const totalScore = keywordOverlap * 2 + priorityScore;
    
    return { ...link, score: totalScore };
  });
  
  // Sort by score and return top links
  return scoredLinks
    .sort((a, b) => b.score - a.score)
    .filter(link => link.score > 0)
    .slice(0, maxLinks);
}

/**
 * Get breadcrumb links for navigation
 */
export function getBreadcrumbLinks(pathname: string): Array<{ name: string; href: string }> {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', href: '/' }];
  
  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const link = INTERNAL_LINKS.find(l => l.href === currentPath);
    
    if (link) {
      breadcrumbs.push({ name: link.title, href: link.href });
    } else {
      // Create breadcrumb from segment
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      breadcrumbs.push({ name, href: currentPath });
    }
  }
  
  return breadcrumbs;
}

/**
 * Get footer navigation links organized by category
 */
export function getFooterLinks(): Record<string, InternalLink[]> {
  const categories = {
    Services: INTERNAL_LINKS.filter(link => link.category === 'service' && link.priority === 'high'),
    Solutions: INTERNAL_LINKS.filter(link => link.category === 'solution'),
    Resources: INTERNAL_LINKS.filter(link => link.category === 'resource'),
    Company: INTERNAL_LINKS.filter(link => link.category === 'company'),
  };
  
  return categories;
}

/**
 * Get sitemap structure for SEO
 */
export function getSitemapLinks(): InternalLink[] {
  return INTERNAL_LINKS.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

const internalLinksUtils = {
  getRelatedLinks,
  getContextualLinks,
  getBreadcrumbLinks,
  getFooterLinks,
  getSitemapLinks,
  INTERNAL_LINKS
};

export default internalLinksUtils;