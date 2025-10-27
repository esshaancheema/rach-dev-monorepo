import { CaseStudy, CaseStudyCategory } from './types';

export const caseStudyCategories: CaseStudyCategory[] = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    slug: 'ai-machine-learning',
    description: 'Intelligent systems and automation solutions',
    color: 'blue',
    icon: '🤖'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Platforms',
    slug: 'enterprise-platforms',
    description: 'Large-scale business applications',
    color: 'purple',
    icon: '🏢'
  },
  {
    id: 'fintech',
    name: 'FinTech Solutions',
    slug: 'fintech',
    description: 'Financial technology and banking platforms',
    color: 'green',
    icon: '💰'
  },
  {
    id: 'healthcare',
    name: 'Healthcare & MedTech',
    slug: 'healthcare',
    description: 'Medical technology and healthcare systems',
    color: 'red',
    icon: '🏥'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce & Retail',
    slug: 'ecommerce',
    description: 'Online stores and retail platforms',
    color: 'orange',
    icon: '🛒'
  },
  {
    id: 'mobile',
    name: 'Mobile Applications',
    slug: 'mobile',
    description: 'iOS and Android mobile solutions',
    color: 'indigo',
    icon: '📱'
  }
];

export const caseStudies: CaseStudy[] = [
  {
    id: '1',
    slug: 'ai-powered-banking-transformation',
    title: 'AI-Powered Digital Banking Transformation',
    subtitle: 'Revolutionary mobile banking platform serving 5M+ customers',
    description: 'Complete digital transformation of a traditional bank with AI-powered features, real-time analytics, and seamless user experience.',
    client: {
      name: 'Metro Financial Bank',
      industry: 'Financial Services',
      size: '10,000+ employees',
      location: 'New York, USA',
      logo: '/images/case-studies/clients/metro-bank.svg'
    },
    project: {
      duration: '18 months',
      teamSize: '25 developers',
      budget: '$2.5M',
      status: 'completed'
    },
    challenge: 'Metro Financial Bank was losing customers to digital-first competitors. Their legacy systems were outdated, slow, and couldn\'t support modern banking features. They needed a complete digital transformation to stay competitive while maintaining security and regulatory compliance.',
    solution: 'We built a comprehensive digital banking platform with AI-powered features including smart budgeting, fraud detection, personalized financial insights, and seamless mobile experience. The solution included microservices architecture, real-time processing, and advanced security measures.',
    results: [
      {
        metric: '300%',
        value: 'increase in mobile transactions',
        description: 'Daily mobile banking transactions increased from 50K to 200K'
      },
      {
        metric: '85%',
        value: 'reduction in customer complaints',
        description: 'Significant improvement in customer satisfaction scores'
      },
      {
        metric: '$50M',
        value: 'annual cost savings',
        description: 'Operational efficiency improvements and reduced manual processes'
      },
      {
        metric: '2.1M',
        value: 'new digital customers',
        description: 'Customer base grew by 40% within 12 months of launch'
      }
    ],
    technologies: ['React Native', 'Node.js', 'Python', 'TensorFlow', 'AWS', 'PostgreSQL', 'Redis', 'Kubernetes'],
    services: ['Mobile App Development', 'AI/ML Development', 'Cloud Architecture', 'Security Implementation'],
    images: {
      hero: '/images/case-studies/banking-hero.jpg',
      gallery: [
        '/images/case-studies/banking-app-1.jpg',
        '/images/case-studies/banking-app-2.jpg',
        '/images/case-studies/banking-dashboard.jpg',
        '/images/case-studies/banking-analytics.jpg'
      ],
      mockups: [
        '/images/case-studies/banking-mobile-1.png',
        '/images/case-studies/banking-mobile-2.png',
        '/images/case-studies/banking-web.png'
      ]
    },
    testimonial: {
      quote: 'Zoptal transformed our entire banking experience. The AI-powered features have revolutionized how our customers interact with their finances. We\'ve seen unprecedented growth in digital adoption.',
      author: 'Sarah Johnson',
      title: 'Chief Digital Officer, Metro Financial Bank',
      avatar: '/images/testimonials/sarah-johnson-bank.jpg'
    },
    seo: {
      metaTitle: 'AI Banking Platform Case Study - Digital Transformation Success',
      metaDescription: 'See how we transformed a traditional bank with AI-powered digital banking platform, serving 5M+ customers with 300% transaction growth.',
      keywords: ['AI banking', 'digital transformation', 'mobile banking', 'fintech case study', 'banking platform development']
    },
    featured: true,
    publishedAt: '2024-01-15T00:00:00Z',
    category: caseStudyCategories[2] // FinTech
  },
  {
    id: '2',
    slug: 'healthcare-ai-patient-management',
    title: 'AI-Powered Patient Management System',
    subtitle: 'Intelligent healthcare platform serving 200+ hospitals',
    description: 'Revolutionary patient management system with AI diagnostics, predictive analytics, and streamlined workflows for healthcare providers.',
    client: {
      name: 'HealthCare Solutions Inc.',
      industry: 'Healthcare',
      size: '5,000+ employees',
      location: 'California, USA',
      logo: '/images/case-studies/clients/healthcare-solutions.svg'
    },
    project: {
      duration: '24 months',
      teamSize: '30 developers',
      budget: '$3.2M',
      status: 'completed'
    },
    challenge: 'HealthCare Solutions needed to modernize their patient management across 200+ hospitals. Manual processes, disconnected systems, and lack of real-time data were causing delays in patient care and operational inefficiencies.',
    solution: 'We developed an AI-powered patient management platform with predictive analytics, automated diagnosis assistance, real-time monitoring, and integrated workflows. The system includes HIPAA compliance, advanced security, and seamless EHR integration.',
    results: [
      {
        metric: '40%',
        value: 'faster patient processing',
        description: 'Average patient check-in and processing time reduced significantly'
      },
      {
        metric: '95%',
        value: 'diagnostic accuracy',
        description: 'AI-assisted diagnostics improved accuracy and reduced errors'
      },
      {
        metric: '2M+',
        value: 'patients served',
        description: 'Successfully managing over 2 million patient records'
      },
      {
        metric: '60%',
        value: 'reduction in paperwork',
        description: 'Digital workflows eliminated most manual documentation'
      }
    ],
    technologies: ['React', 'Python', 'Django', 'TensorFlow', 'PostgreSQL', 'Docker', 'AWS', 'Apache Kafka'],
    services: ['AI/ML Development', 'Healthcare Software', 'Cloud Infrastructure', 'Compliance & Security'],
    images: {
      hero: '/images/case-studies/healthcare-hero.jpg',
      gallery: [
        '/images/case-studies/healthcare-dashboard.jpg',
        '/images/case-studies/healthcare-ai.jpg',
        '/images/case-studies/healthcare-mobile.jpg',
        '/images/case-studies/healthcare-analytics.jpg'
      ],
      mockups: [
        '/images/case-studies/healthcare-web-1.png',
        '/images/case-studies/healthcare-web-2.png',
        '/images/case-studies/healthcare-tablet.png'
      ]
    },
    testimonial: {
      quote: 'The AI-powered system has transformed how we deliver patient care. Our staff can now focus on patients instead of paperwork, and the diagnostic assistance has been invaluable.',
      author: 'Dr. Michael Chen',
      title: 'Chief Medical Officer, HealthCare Solutions Inc.',
      avatar: '/images/testimonials/dr-michael-chen.jpg'
    },
    seo: {
      metaTitle: 'Healthcare AI System Case Study - Patient Management Platform',
      metaDescription: 'AI-powered patient management system serving 200+ hospitals with 40% faster processing and 95% diagnostic accuracy.',
      keywords: ['healthcare AI', 'patient management system', 'medical software', 'healthcare technology', 'AI diagnostics']
    },
    featured: true,
    publishedAt: '2024-01-10T00:00:00Z',
    category: caseStudyCategories[3] // Healthcare
  },
  {
    id: '3',
    slug: 'smart-factory-iot-platform',
    title: 'Smart Factory IoT Platform',
    subtitle: 'Industrial IoT solution connecting 1000+ manufacturing facilities',
    description: 'Comprehensive IoT platform for smart manufacturing with real-time monitoring, predictive maintenance, and operational optimization.',
    client: {
      name: 'Industrial Manufacturing Corp',
      industry: 'Manufacturing',
      size: '25,000+ employees',
      location: 'Global Operations',
      logo: '/images/case-studies/clients/industrial-corp.svg'
    },
    project: {
      duration: '30 months',
      teamSize: '35 developers',
      budget: '$4.5M',
      status: 'ongoing'
    },
    challenge: 'Industrial Manufacturing Corp operated 1000+ facilities globally with disconnected systems, manual monitoring, and reactive maintenance. They needed real-time visibility, predictive analytics, and centralized control to optimize operations.',
    solution: 'We built a comprehensive IoT platform with edge computing, real-time data processing, predictive maintenance algorithms, and centralized dashboard. The solution includes sensor integration, machine learning models, and automated alert systems.',
    results: [
      {
        metric: '25%',
        value: 'production increase',
        description: 'Overall production efficiency improved across all facilities'
      },
      {
        metric: '60%',
        value: 'downtime reduction',
        description: 'Predictive maintenance reduced unexpected equipment failures'
      },
      {
        metric: '1000+',
        value: 'facilities connected',
        description: 'Global manufacturing network fully integrated'
      },
      {
        metric: '$75M',
        value: 'annual savings',
        description: 'Cost savings from efficiency improvements and reduced downtime'
      }
    ],
    technologies: ['React', 'Node.js', 'Python', 'Apache Kafka', 'InfluxDB', 'Docker', 'Kubernetes', 'AWS IoT'],
    services: ['IoT Development', 'Real-time Analytics', 'Cloud Architecture', 'Predictive Maintenance'],
    images: {
      hero: '/images/case-studies/iot-hero.jpg',
      gallery: [
        '/images/case-studies/iot-dashboard.jpg',
        '/images/case-studies/iot-factory.jpg',
        '/images/case-studies/iot-sensors.jpg',
        '/images/case-studies/iot-analytics.jpg'
      ],
      mockups: [
        '/images/case-studies/iot-web-dashboard.png',
        '/images/case-studies/iot-mobile-app.png',
        '/images/case-studies/iot-control-panel.png'
      ]
    },
    testimonial: {
      quote: 'The IoT platform has given us unprecedented visibility into our global operations. We can now predict and prevent issues before they impact production.',
      author: 'Robert Martinez',
      title: 'VP of Operations, Industrial Manufacturing Corp',
      avatar: '/images/testimonials/robert-martinez.jpg'
    },
    seo: {
      metaTitle: 'Smart Factory IoT Platform Case Study - Manufacturing Innovation',
      metaDescription: 'Industrial IoT platform connecting 1000+ facilities with 25% production increase and 60% downtime reduction.',
      keywords: ['IoT platform', 'smart factory', 'industrial IoT', 'manufacturing technology', 'predictive maintenance']
    },
    featured: true,
    publishedAt: '2024-01-05T00:00:00Z',
    category: caseStudyCategories[1] // Enterprise
  },
  {
    id: '4',
    slug: 'ecommerce-marketplace-platform',
    title: 'Multi-Vendor E-commerce Marketplace',
    subtitle: 'Scalable marketplace platform handling $100M+ in transactions',
    description: 'Complete e-commerce marketplace with multi-vendor support, AI recommendations, and advanced analytics for global retail operations.',
    client: {
      name: 'Global Retail Marketplace',
      industry: 'E-commerce',
      size: '1,000+ employees',
      location: 'International',
      logo: '/images/case-studies/clients/global-retail.svg'
    },
    project: {
      duration: '15 months',
      teamSize: '20 developers',
      budget: '$1.8M',
      status: 'completed'
    },
    challenge: 'Global Retail Marketplace needed a scalable platform to support thousands of vendors and millions of customers. Their existing platform couldn\'t handle the traffic, lacked modern features, and had poor vendor management tools.',
    solution: 'We developed a comprehensive marketplace platform with vendor onboarding, inventory management, AI-powered recommendations, payment processing, and advanced analytics. The solution includes mobile apps, admin dashboards, and seller tools.',
    results: [
      {
        metric: '500%',
        value: 'increase in transactions',
        description: 'Monthly transaction volume grew from $5M to $30M'
      },
      {
        metric: '10,000+',
        value: 'active vendors',
        description: 'Vendor base expanded significantly with new onboarding tools'
      },
      {
        metric: '2.5M',
        value: 'registered customers',
        description: 'Customer base doubled within first year of launch'
      },
      {
        metric: '35%',
        value: 'increase in conversion',
        description: 'AI recommendations improved customer purchase behavior'
      }
    ],
    technologies: ['React', 'Node.js', 'MongoDB', 'Redis', 'Elasticsearch', 'Docker', 'AWS', 'Stripe'],
    services: ['E-commerce Development', 'Mobile App Development', 'AI Implementation', 'Payment Integration'],
    images: {
      hero: '/images/case-studies/ecommerce-hero.jpg',
      gallery: [
        '/images/case-studies/ecommerce-homepage.jpg',
        '/images/case-studies/ecommerce-product.jpg',
        '/images/case-studies/ecommerce-vendor.jpg',
        '/images/case-studies/ecommerce-mobile.jpg'
      ],
      mockups: [
        '/images/case-studies/ecommerce-web-1.png',
        '/images/case-studies/ecommerce-web-2.png',
        '/images/case-studies/ecommerce-mobile-app.png'
      ]
    },
    testimonial: {
      quote: 'The new marketplace platform exceeded all our expectations. The vendor tools and AI recommendations have driven incredible growth in both sales and user engagement.',
      author: 'Jennifer Park',
      title: 'Chief Technology Officer, Global Retail Marketplace',
      avatar: '/images/testimonials/jennifer-park.jpg'
    },
    seo: {
      metaTitle: 'E-commerce Marketplace Case Study - Multi-Vendor Platform Success',
      metaDescription: 'Scalable e-commerce marketplace handling $100M+ transactions with 500% growth and 10,000+ vendors.',
      keywords: ['e-commerce marketplace', 'multi-vendor platform', 'online marketplace development', 'e-commerce case study']
    },
    featured: false,
    publishedAt: '2023-12-20T00:00:00Z',
    category: caseStudyCategories[4] // E-commerce
  },
  {
    id: '5',
    slug: 'fitness-tracking-mobile-app',
    title: 'AI-Powered Fitness Tracking App',
    subtitle: 'Personalized fitness platform with 1M+ active users',
    description: 'Comprehensive fitness tracking app with AI personal trainer, social features, and integration with wearable devices.',
    client: {
      name: 'FitLife Technologies',
      industry: 'Health & Fitness',
      size: '500+ employees',
      location: 'Austin, USA',
      logo: '/images/case-studies/clients/fitlife-tech.svg'
    },
    project: {
      duration: '12 months',
      teamSize: '15 developers',
      budget: '$1.2M',
      status: 'completed'
    },
    challenge: 'FitLife Technologies wanted to create a differentiated fitness app in a crowded market. They needed AI-powered personalization, social features, and seamless wearable integration to compete with established players.',
    solution: 'We built a comprehensive fitness app with AI personal trainer, workout recommendations, social challenges, nutrition tracking, and wearable device integration. The app includes real-time coaching, progress analytics, and community features.',
    results: [
      {
        metric: '1M+',
        value: 'active users',
        description: 'User base grew to over 1 million within 8 months of launch'
      },
      {
        metric: '4.8/5',
        value: 'app store rating',
        description: 'Consistently high ratings across iOS and Android platforms'
      },
      {
        metric: '75%',
        value: 'user retention',
        description: '30-day user retention rate significantly above industry average'
      },
      {
        metric: '$5M',
        value: 'annual revenue',
        description: 'Premium subscriptions and in-app purchases generated strong revenue'
      }
    ],
    technologies: ['React Native', 'Node.js', 'Python', 'TensorFlow', 'MongoDB', 'AWS', 'Firebase', 'HealthKit'],
    services: ['Mobile App Development', 'AI/ML Development', 'Wearable Integration', 'Social Features'],
    images: {
      hero: '/images/case-studies/fitness-hero.jpg',
      gallery: [
        '/images/case-studies/fitness-app-1.jpg',
        '/images/case-studies/fitness-app-2.jpg',
        '/images/case-studies/fitness-wearable.jpg',
        '/images/case-studies/fitness-social.jpg'
      ],
      mockups: [
        '/images/case-studies/fitness-mobile-1.png',
        '/images/case-studies/fitness-mobile-2.png',
        '/images/case-studies/fitness-tablet.png'
      ]
    },
    testimonial: {
      quote: 'Zoptal created an amazing fitness app that our users absolutely love. The AI personal trainer feature is revolutionary and has helped us stand out in a competitive market.',
      author: 'Mark Thompson',
      title: 'CEO, FitLife Technologies',
      avatar: '/images/testimonials/mark-thompson.jpg'
    },
    seo: {
      metaTitle: 'Fitness App Case Study - AI-Powered Mobile Application Success',
      metaDescription: 'AI-powered fitness tracking app with 1M+ users, 4.8/5 rating, and 75% retention rate.',
      keywords: ['fitness app development', 'AI fitness app', 'mobile app case study', 'wearable integration', 'health app']
    },
    featured: false,
    publishedAt: '2023-12-15T00:00:00Z',
    category: caseStudyCategories[5] // Mobile
  },
  {
    id: '6',
    slug: 'ai-powered-logistics-optimization',
    title: 'AI-Powered Logistics Optimization Platform',
    subtitle: 'Smart logistics system reducing costs by 30% for global shipping',
    description: 'Intelligent logistics platform with route optimization, demand forecasting, and automated warehouse management for international shipping company.',
    client: {
      name: 'Global Shipping Solutions',
      industry: 'Logistics & Transportation',
      size: '15,000+ employees',
      location: 'Worldwide',
      logo: '/images/case-studies/clients/global-shipping.svg'
    },
    project: {
      duration: '20 months',
      teamSize: '28 developers',
      budget: '$3.8M',
      status: 'completed'
    },
    challenge: 'Global Shipping Solutions struggled with inefficient routes, poor demand forecasting, and manual warehouse operations. Rising fuel costs and customer demands for faster delivery required AI-powered optimization.',
    solution: 'We developed an AI-powered logistics platform with machine learning algorithms for route optimization, demand forecasting, inventory management, and automated warehouse operations. The system includes real-time tracking and predictive analytics.',
    results: [
      {
        metric: '30%',
        value: 'cost reduction',
        description: 'Overall logistics costs reduced through AI optimization'
      },
      {
        metric: '45%',
        value: 'faster delivery',
        description: 'Average delivery time improved significantly'
      },
      {
        metric: '90%',
        value: 'forecast accuracy',
        description: 'AI-powered demand forecasting improved planning'
      },
      {
        metric: '50M+',
        value: 'packages optimized',
        description: 'Monthly package volume processed through the system'
      }
    ],
    technologies: ['Python', 'TensorFlow', 'React', 'PostgreSQL', 'Apache Spark', 'Kubernetes', 'Google Cloud', 'Apache Airflow'],
    services: ['AI/ML Development', 'Data Analytics', 'Cloud Architecture', 'System Integration'],
    images: {
      hero: '/images/case-studies/logistics-hero.jpg',
      gallery: [
        '/images/case-studies/logistics-dashboard.jpg',
        '/images/case-studies/logistics-warehouse.jpg',
        '/images/case-studies/logistics-tracking.jpg',
        '/images/case-studies/logistics-analytics.jpg'
      ],
      mockups: [
        '/images/case-studies/logistics-web-1.png',
        '/images/case-studies/logistics-web-2.png',
        '/images/case-studies/logistics-mobile.png'
      ]
    },
    testimonial: {
      quote: 'The AI optimization platform has transformed our logistics operations. We\'ve achieved cost savings we never thought possible while improving delivery times.',
      author: 'Lisa Wang',
      title: 'Chief Operations Officer, Global Shipping Solutions',
      avatar: '/images/testimonials/lisa-wang.jpg'
    },
    seo: {
      metaTitle: 'Logistics AI Platform Case Study - Supply Chain Optimization',
      metaDescription: 'AI-powered logistics platform reducing costs by 30% and improving delivery times by 45% for global shipping operations.',
      keywords: ['logistics AI', 'supply chain optimization', 'route optimization', 'logistics platform', 'AI logistics case study']
    },
    featured: false,
    publishedAt: '2023-12-10T00:00:00Z',
    category: caseStudyCategories[0] // AI & ML
  }
];

export function getCaseStudies(filters: {
  category?: string;
  industry?: string;
  featured?: boolean;
  limit?: number;
} = {}) {
  let filteredStudies = [...caseStudies];

  if (filters.category) {
    filteredStudies = filteredStudies.filter(study => 
      study.category.slug === filters.category
    );
  }

  if (filters.industry) {
    filteredStudies = filteredStudies.filter(study => 
      study.client.industry.toLowerCase().includes(filters.industry.toLowerCase())
    );
  }

  if (filters.featured !== undefined) {
    filteredStudies = filteredStudies.filter(study => study.featured === filters.featured);
  }

  // Sort by publishedAt (newest first)
  filteredStudies.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  if (filters.limit) {
    filteredStudies = filteredStudies.slice(0, filters.limit);
  }

  return filteredStudies;
}

export function getCaseStudyBySlug(slug: string): CaseStudy | null {
  return caseStudies.find(study => study.slug === slug) || null;
}

export function getRelatedCaseStudies(study: CaseStudy, limit: number = 3): CaseStudy[] {
  return caseStudies
    .filter(s => s.id !== study.id && s.category.id === study.category.id)
    .slice(0, limit);
}

export function getCaseStudyCategories() {
  return caseStudyCategories;
}