import { 
  CodeBracketIcon, 
  DevicePhoneMobileIcon, 
  GlobeAltIcon,
  CpuChipIcon,
  PaintBrushIcon,
  CloudIcon,
  ShieldCheckIcon,
  CogIcon,
  UserGroupIcon,
  ChartBarIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  BuildingOfficeIcon,
  TruckIcon,
  HeartIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  BookOpenIcon,
  NewspaperIcon,
  AcademicCapIcon,
  DocumentDuplicateIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { MegaMenuSection } from '@/components/navigation/MegaMenu';

// Enhanced Services Navigation Data
export const servicesMenuData: MegaMenuSection[] = [
  {
    title: 'Development Services',
    featured: true,
    color: 'blue',
    items: [
      {
        name: 'Web Development',
        href: '/services/web-development',
        description: 'Modern web applications with React, Next.js, and cutting-edge frameworks',
        icon: GlobeAltIcon,
        isPopular: true
      },
      {
        name: 'Mobile Development',
        href: '/services/mobile-development',
        description: 'Native iOS, Android, and cross-platform mobile applications',
        icon: DevicePhoneMobileIcon,
        isPopular: true
      },
      {
        name: 'Custom Software Development',
        href: '/services/custom-software-development',
        description: 'Tailored software solutions built for your specific business needs',
        icon: CodeBracketIcon
      },
      {
        name: 'AI Development',
        href: '/services/ai-development',
        description: 'Machine learning, AI agents, and intelligent automation solutions',
        icon: CpuChipIcon,
        isNew: true
      }
    ]
  },
  {
    title: 'Specialized Services',
    items: [
      {
        name: 'UI/UX Design',
        href: '/services/ui-ux-design',
        description: 'User-centered design for exceptional digital experiences',
        icon: PaintBrushIcon
      },
      {
        name: 'AI Integration',
        href: '/services/ai-integration',
        description: 'Seamlessly integrate AI capabilities into existing systems',
        icon: BoltIcon,
        isNew: true
      },
      {
        name: 'API Development',
        href: '/services/api-development',
        description: 'RESTful and GraphQL APIs for scalable integrations',
        icon: CloudIcon
      },
      {
        name: 'DevOps Automation',
        href: '/services/devops-automation',
        description: 'CI/CD pipelines, infrastructure as code, and deployment automation',
        icon: CogIcon
      }
    ]
  },
  {
    title: 'Support & Quality',
    items: [
      {
        name: 'Quality Assurance',
        href: '/services/quality-assurance',
        description: 'Comprehensive testing strategies for reliable software',
        icon: ShieldCheckIcon
      },
      {
        name: 'Software Development',
        href: '/services/software-development',
        description: 'Full-cycle software development from concept to deployment',
        icon: CodeBracketIcon
      },
      {
        name: 'Enterprise Solutions',
        href: '/services/enterprise-solutions',
        description: 'Scalable solutions for large organizations and enterprises',
        icon: BuildingOfficeIcon
      }
    ]
  }
];

// Enhanced Solutions Navigation Data  
export const solutionsMenuData: MegaMenuSection[] = [
  {
    title: 'AI Agents',
    featured: true,
    color: 'purple',
    items: [
      {
        name: 'Customer Support Agents',
        href: '/ai-agents/customer-support',
        description: '24/7 intelligent customer service automation',
        icon: UserGroupIcon,
        isPopular: true
      },
      {
        name: 'Sales Lead Generation',
        href: '/ai-agents/sales-lead-generation',
        description: 'AI-powered lead qualification and nurturing',
        icon: ChartBarIcon,
        isNew: true
      },
      {
        name: 'Content Marketing Agents',
        href: '/ai-agents/content-marketing',
        description: 'Automated content creation and marketing campaigns',
        icon: MegaphoneIcon
      },
      {
        name: 'Data Analysis Agents',
        href: '/ai-agents/data-analysis',
        description: 'Advanced analytics and business intelligence automation',
        icon: ChartBarIcon
      },
      {
        name: 'Virtual Assistants',
        href: '/ai-agents/virtual-assistants',
        description: 'Intelligent personal and business assistants',
        icon: BoltIcon
      },
      {
        name: 'Workflow Automation',
        href: '/ai-agents/workflow-automation',
        description: 'End-to-end business process automation',
        icon: CogIcon
      }
    ]
  },
  {
    title: 'Industry Solutions',
    items: [
      {
        name: 'E-commerce Platforms',
        href: '/solutions/products/e-commerce',
        description: 'Complete online store solutions with payment integration',
        icon: ShoppingCartIcon,
        isPopular: true
      },
      {
        name: 'Food Delivery Platforms',
        href: '/solutions/products/food-delivery',
        description: 'Multi-restaurant delivery platforms like UberEats',
        icon: TruckIcon,
        isPopular: true
      },
      {
        name: 'Healthcare & Telemedicine',
        href: '/solutions/products/telemedicine',
        description: 'Digital health platforms and telehealth solutions',
        icon: HeartIcon
      },
      {
        name: 'Financial Services',
        href: '/solutions/products/financial-services',
        description: 'Fintech solutions, banking apps, and payment systems',
        icon: CurrencyDollarIcon
      },
      {
        name: 'Real Estate Platforms',
        href: '/solutions/products/real-estate',
        description: 'Property management and real estate marketplaces',
        icon: HomeIcon
      },
      {
        name: 'Transportation & Logistics',
        href: '/solutions/products/ride-hailing',
        description: 'Ride-sharing, logistics, and fleet management',
        icon: TruckIcon
      }
    ]
  },
  {
    title: 'Enterprise & Tech',
    items: [
      {
        name: 'Technology Stack',
        href: '/solutions/technology-stack',
        description: 'Our comprehensive tech stack and frameworks',
        icon: CodeBracketIcon
      },
      {
        name: 'Enterprise Solutions',
        href: '/solutions/enterprise',
        description: 'Large-scale enterprise software and integrations',
        icon: BuildingOfficeIcon
      },
      {
        name: 'All Product Solutions',
        href: '/solutions/products',
        description: 'Browse all 21+ industry-specific solutions',
        icon: DocumentDuplicateIcon
      }
    ]
  }
];

// Resources Navigation Data
export const resourcesMenuData: MegaMenuSection[] = [
  {
    title: 'Learning Resources',
    featured: true,
    color: 'green',
    items: [
      {
        name: 'Blog',
        href: '/resources/blog',
        description: 'Latest insights on development trends and best practices',
        icon: NewspaperIcon,
        isPopular: true
      },
      {
        name: 'Case Studies',
        href: '/case-studies',
        description: 'Real success stories from our client projects',
        icon: DocumentTextIcon
      },
      {
        name: 'Guides & Tutorials',
        href: '/resources/guides',
        description: 'Step-by-step guides for developers and businesses',
        icon: BookOpenIcon
      },
      {
        name: 'Whitepapers',
        href: '/resources/whitepapers',
        description: 'In-depth technical analysis and industry reports',
        icon: AcademicCapIcon
      }
    ]
  }
];

// Main Navigation Items
export const mainNavigation = [
  {
    name: 'Services',
    href: '/services',
    megaMenu: servicesMenuData,
    hasDropdown: true
  },
  {
    name: 'Solutions',
    href: '/solutions',
    megaMenu: solutionsMenuData,
    hasDropdown: true
  },
  {
    name: 'AI Agents',
    href: '/ai-agents',
    hasDropdown: false
  },
  {
    name: 'Pricing',
    href: '/pricing',
    hasDropdown: false
  },
  {
    name: 'Resources',
    href: '/resources',
    megaMenu: resourcesMenuData,
    hasDropdown: true
  }
];

// Search Index Data (for search functionality)
export const searchIndex = [
  // Services
  ...servicesMenuData.flatMap(section => 
    section.items.map(item => ({
      ...item,
      category: 'Services',
      section: section.title
    }))
  ),
  // Solutions
  ...solutionsMenuData.flatMap(section => 
    section.items.map(item => ({
      ...item,
      category: 'Solutions',
      section: section.title
    }))
  ),
  // Resources
  ...resourcesMenuData.flatMap(section => 
    section.items.map(item => ({
      ...item,
      category: 'Resources',
      section: section.title
    }))
  )
];