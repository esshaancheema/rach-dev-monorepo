export interface ServiceFeature {
  title: string;
  description: string;
  icon: string;
  highlight?: boolean;
}

export interface ServiceProcess {
  step: number;
  title: string;
  description: string;
  duration: string;
  deliverables: string[];
}

export interface ServiceTier {
  name: string;
  price: {
    from: number;
    to?: number;
    unit: string;
  };
  features: string[];
  ideal: string;
  popular?: boolean;
}

export interface ServiceTestimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  project: string;
  result: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  longDescription: string;
  icon: string;
  category: 'development' | 'ai' | 'consulting' | 'support';
  featured?: boolean;
  
  // Key features
  features: ServiceFeature[];
  
  // Service process
  process: ServiceProcess[];
  
  // Pricing tiers
  tiers: ServiceTier[];
  
  // Technologies used
  technologies: string[];
  
  // Testimonials
  testimonials: ServiceTestimonial[];
  
  // Deliverables
  deliverables: string[];
  
  // Timeline
  timeline: {
    typical: string;
    rush: string;
  };
  
  // FAQ
  faq: Array<{
    question: string;
    answer: string;
  }>;
  
  // Related services
  relatedServices?: string[];
  
  // CTA
  cta: {
    primary: string;
    secondary: string;
  };
}

export const SERVICES: Service[] = [
  {
    id: 'custom-software-development',
    title: 'Custom Software Development',
    slug: 'custom-software-development',
    tagline: 'Tailored solutions built with AI acceleration',
    description: 'Full-stack custom software development powered by AI to deliver robust, scalable applications faster than traditional methods.',
    longDescription: 'Our custom software development service combines human expertise with AI acceleration to build enterprise-grade applications. We use cutting-edge AI tools to speed up development while ensuring code quality, security, and maintainability.',
    icon: '💻',
    category: 'development',
    featured: true,
    
    features: [
      {
        title: 'AI-Accelerated Development',
        description: 'Leverage AI to write, test, and optimize code 10x faster',
        icon: '🚀',
        highlight: true,
      },
      {
        title: 'Full-Stack Solutions',
        description: 'Complete frontend, backend, and database development',
        icon: '🔧',
      },
      {
        title: 'Scalable Architecture',
        description: 'Built for growth with modern, cloud-native patterns',
        icon: '📈',
      },
      {
        title: 'Enterprise Security',
        description: 'Security-first approach with comprehensive testing',
        icon: '🔒',
        highlight: true,
      },
      {
        title: 'API Integration',
        description: 'Seamless integration with third-party services',
        icon: '🔗',
      },
      {
        title: 'Real-time Features',
        description: 'Live updates, notifications, and collaboration',
        icon: '⚡',
      },
    ],
    
    process: [
      {
        step: 1,
        title: 'Discovery & Planning',
        description: 'We analyze your requirements and create a detailed technical specification using AI-powered analysis.',
        duration: '1-2 weeks',
        deliverables: ['Technical specification', 'Architecture diagram', 'Project timeline', 'Risk assessment'],
      },
      {
        step: 2,
        title: 'Design & Prototyping',
        description: 'AI-assisted UI/UX design and rapid prototyping to validate concepts early.',
        duration: '1-2 weeks',
        deliverables: ['UI/UX designs', 'Interactive prototype', 'User flow diagrams', 'Design system'],
      },
      {
        step: 3,
        title: 'Development Sprint',
        description: 'Agile development with AI code generation, automated testing, and continuous integration.',
        duration: '4-12 weeks',
        deliverables: ['Working application', 'Automated tests', 'Documentation', 'CI/CD pipeline'],
      },
      {
        step: 4,
        title: 'Testing & Optimization',
        description: 'Comprehensive testing with AI-powered test generation and performance optimization.',
        duration: '1-2 weeks',
        deliverables: ['Test reports', 'Performance analysis', 'Security audit', 'Bug fixes'],
      },
      {
        step: 5,
        title: 'Deployment & Support',
        description: 'Production deployment with monitoring setup and post-launch support.',
        duration: '1 week',
        deliverables: ['Live application', 'Monitoring setup', 'Support documentation', '30-day support'],
      },
    ],
    
    tiers: [
      {
        name: 'MVP Development',
        price: { from: 15000, to: 50000, unit: 'project' },
        features: [
          'Core feature development',
          'Basic UI/UX design',
          'Database setup',
          'API development',
          'Basic testing',
          'Deployment assistance',
        ],
        ideal: 'Startups and small businesses',
      },
      {
        name: 'Full Application',
        price: { from: 50000, to: 150000, unit: 'project' },
        features: [
          'Complete feature set',
          'Advanced UI/UX design',
          'Complex integrations',
          'Comprehensive testing',
          'Performance optimization',
          'Security implementation',
          '3 months support',
        ],
        ideal: 'Growing companies',
        popular: true,
      },
      {
        name: 'Enterprise Solution',
        price: { from: 150000, unit: 'project' },
        features: [
          'Enterprise-grade features',
          'Custom architecture',
          'Advanced security',
          'Scalability planning',
          'Compliance adherence',
          'Team training',
          '6 months support',
        ],
        ideal: 'Large enterprises',
      },
    ],
    
    technologies: [
      'React', 'Next.js', 'Node.js', 'Python', 'TypeScript', 'PostgreSQL', 
      'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'REST APIs'
    ],
    
    testimonials: [
      {
        quote: 'Zoptal delivered our custom CRM system in half the time we expected. The AI-accelerated development approach is incredible.',
        author: 'Sarah Chen',
        role: 'CTO',
        company: 'TechStart Inc',
        project: 'Custom CRM System',
        result: '50% faster delivery',
      },
      {
        quote: 'The enterprise-grade security and scalability built into our platform exceeded our expectations. Highly recommended.',
        author: 'Michael Rodriguez',
        role: 'Lead Developer',
        company: 'Enterprise Corp',
        project: 'Enterprise Application',
        result: '99.9% uptime achieved',
      },
    ],
    
    deliverables: [
      'Complete source code with documentation',
      'Deployment-ready application',
      'Database schema and migrations',
      'API documentation',
      'User manual and admin guide',
      'Test suite and coverage report',
      'Performance and security audit',
      'Post-launch support (30-90 days)',
    ],
    
    timeline: {
      typical: '8-16 weeks',
      rush: '4-8 weeks (with additional resources)',
    },
    
    faq: [
      {
        question: 'How does AI acceleration work in development?',
        answer: 'We use AI tools to generate boilerplate code, automate testing, optimize performance, and catch bugs early. This speeds up development by 3-10x while maintaining high quality.',
      },
      {
        question: 'What technologies do you specialize in?',
        answer: 'We work with modern web technologies including React, Next.js, Node.js, Python, and cloud platforms like AWS. We choose the best tech stack for your specific needs.',
      },
      {
        question: 'Do you provide ongoing maintenance?',
        answer: 'Yes, we offer various support packages including bug fixes, feature updates, security patches, and performance monitoring.',
      },
      {
        question: 'Can you work with our existing team?',
        answer: 'Absolutely. We can integrate with your development team, provide training, and ensure smooth knowledge transfer.',
      },
      {
        question: 'What about intellectual property rights?',
        answer: 'You own all the code and intellectual property. We provide full source code and documentation upon project completion.',
      },
    ],
    
    relatedServices: ['mobile-app-development', 'ai-integration', 'technical-consulting'],
    
    cta: {
      primary: 'Start Your Project',
      secondary: 'Schedule Consultation',
    },
  },
  
  {
    id: 'mobile-app-development',
    title: 'Mobile App Development',
    slug: 'mobile-app-development',
    tagline: 'Native and cross-platform mobile solutions',
    description: 'Build high-performance mobile applications for iOS and Android with AI-powered development tools and modern frameworks.',
    longDescription: 'Our mobile app development service creates native and cross-platform applications that deliver exceptional user experiences. We use React Native, Flutter, and native development with AI assistance for rapid development.',
    icon: '📱',
    category: 'development',
    featured: true,
    
    features: [
      {
        title: 'Cross-Platform Development',
        description: 'Single codebase for iOS and Android with React Native/Flutter',
        icon: '🔄',
        highlight: true,
      },
      {
        title: 'Native Performance',
        description: 'Optimized performance with native modules and components',
        icon: '⚡',
      },
      {
        title: 'Offline Capabilities',
        description: 'Apps that work seamlessly without internet connection',
        icon: '📴',
      },
      {
        title: 'Push Notifications',
        description: 'Engage users with intelligent push notification systems',
        icon: '🔔',
        highlight: true,
      },
      {
        title: 'App Store Optimization',
        description: 'Complete app store submission and optimization',
        icon: '🏪',
      },
      {
        title: 'Analytics Integration',
        description: 'Built-in analytics and user behavior tracking',
        icon: '📊',
      },
    ],
    
    process: [
      {
        step: 1,
        title: 'App Strategy & Planning',
        description: 'Define app strategy, target audience, and feature requirements with market research.',
        duration: '1-2 weeks',
        deliverables: ['App strategy document', 'Feature specification', 'Target audience analysis', 'Competitive analysis'],
      },
      {
        step: 2,
        title: 'UI/UX Design',
        description: 'Create intuitive and engaging mobile app designs following platform guidelines.',
        duration: '2-3 weeks',
        deliverables: ['Wireframes', 'UI designs', 'Interactive prototype', 'Design guidelines'],
      },
      {
        step: 3,
        title: 'Development & Integration',
        description: 'Build the app with AI-accelerated development and integrate necessary services.',
        duration: '6-12 weeks',
        deliverables: ['Beta app build', 'Backend integration', 'Third-party integrations', 'Testing builds'],
      },
      {
        step: 4,
        title: 'Testing & Quality Assurance',
        description: 'Comprehensive testing across devices and platforms with automated testing.',
        duration: '2-3 weeks',
        deliverables: ['Test reports', 'Bug fixes', 'Performance optimization', 'Security testing'],
      },
      {
        step: 5,
        title: 'Launch & App Store Submission',
        description: 'App store submission, launch strategy, and post-launch monitoring.',
        duration: '1-2 weeks',
        deliverables: ['App store listings', 'Launch strategy', 'Analytics setup', 'Support documentation'],
      },
    ],
    
    tiers: [
      {
        name: 'Simple App',
        price: { from: 20000, to: 40000, unit: 'project' },
        features: [
          'Single platform (iOS or Android)',
          'Basic features (5-10 screens)',
          'Standard UI components',
          'API integration',
          'App store submission',
          'Basic analytics',
        ],
        ideal: 'Small businesses and startups',
      },
      {
        name: 'Advanced App',
        price: { from: 40000, to: 80000, unit: 'project' },
        features: [
          'Cross-platform (iOS & Android)',
          'Advanced features (15-25 screens)',
          'Custom UI/UX design',
          'Complex integrations',
          'Push notifications',
          'Offline functionality',
          'Advanced analytics',
        ],
        ideal: 'Growing businesses',
        popular: true,
      },
      {
        name: 'Enterprise App',
        price: { from: 80000, unit: 'project' },
        features: [
          'Full cross-platform solution',
          'Enterprise features',
          'Advanced security',
          'Backend development',
          'Admin dashboard',
          'Team collaboration features',
          '6 months support',
        ],
        ideal: 'Large enterprises',
      },
    ],
    
    technologies: [
      'React Native', 'Flutter', 'Swift', 'Kotlin', 'Expo', 'Firebase',
      'AWS Mobile', 'GraphQL', 'REST APIs', 'Redux', 'MobX'
    ],
    
    testimonials: [
      {
        quote: 'Our mobile app launched on time and exceeded our user engagement goals. The cross-platform approach saved us significant costs.',
        author: 'Emily Johnson',
        role: 'Product Manager',
        company: 'InnovateLab',
        project: 'Consumer Mobile App',
        result: '300% user engagement increase',
      },
      {
        quote: 'The offline functionality and performance optimization made our field service app incredibly reliable for our technicians.',
        author: 'David Kim',
        role: 'Operations Director',
        company: 'FieldTech Solutions',
        project: 'Field Service App',
        result: '95% user satisfaction',
      },
    ],
    
    deliverables: [
      'iOS and Android app builds',
      'Complete source code',
      'App store listings and assets',
      'Backend API (if required)',
      'Admin dashboard (if applicable)',
      'User documentation',
      'Developer documentation',
      'App store optimization',
    ],
    
    timeline: {
      typical: '12-20 weeks',
      rush: '8-12 weeks (with additional resources)',
    },
    
    faq: [
      {
        question: 'Should I choose native or cross-platform development?',
        answer: 'Cross-platform (React Native/Flutter) is ideal for most projects as it reduces costs and development time while maintaining good performance. Native development is recommended for apps requiring maximum performance or platform-specific features.',
      },
      {
        question: 'Do you handle app store submissions?',
        answer: 'Yes, we handle the complete app store submission process for both iOS App Store and Google Play Store, including app store optimization.',
      },
      {
        question: 'Can you integrate with existing backend systems?',
        answer: 'Absolutely. We can integrate with any existing APIs, databases, or backend systems. We can also develop a new backend if needed.',
      },
      {
        question: 'What about app maintenance and updates?',
        answer: 'We provide ongoing maintenance packages including bug fixes, OS updates, feature enhancements, and performance monitoring.',
      },
      {
        question: 'How do you ensure app security?',
        answer: 'We implement industry-standard security practices including data encryption, secure API communication, authentication, and regular security audits.',
      },
    ],
    
    relatedServices: ['custom-software-development', 'ai-integration', 'ux-ui-design'],
    
    cta: {
      primary: 'Build Your App',
      secondary: 'Get App Consultation',
    },
  },
  
  {
    id: 'ai-integration',
    title: 'AI Integration & Development',
    slug: 'ai-integration',
    tagline: 'Intelligent features powered by cutting-edge AI',
    description: 'Integrate advanced AI capabilities into your applications including machine learning, natural language processing, and computer vision.',
    longDescription: 'Transform your applications with AI-powered features. We specialize in integrating modern AI technologies including GPT models, computer vision, machine learning, and custom AI solutions tailored to your business needs.',
    icon: '🤖',
    category: 'ai',
    featured: true,
    
    features: [
      {
        title: 'Large Language Models',
        description: 'Integrate GPT, Claude, and custom language models',
        icon: '🧠',
        highlight: true,
      },
      {
        title: 'Computer Vision',
        description: 'Image recognition, object detection, and visual AI',
        icon: '👁️',
      },
      {
        title: 'Natural Language Processing',
        description: 'Text analysis, sentiment analysis, and language understanding',
        icon: '💬',
      },
      {
        title: 'Machine Learning Models',
        description: 'Custom ML models trained on your specific data',
        icon: '📈',
        highlight: true,
      },
      {
        title: 'AI Agents & Automation',
        description: 'Intelligent agents that can perform complex tasks',
        icon: '🤖',
      },
      {
        title: 'Real-time AI Processing',
        description: 'Fast, scalable AI processing for real-time applications',
        icon: '⚡',
      },
    ],
    
    process: [
      {
        step: 1,
        title: 'AI Strategy & Assessment',
        description: 'Analyze your business needs and identify AI opportunities with ROI analysis.',
        duration: '1-2 weeks',
        deliverables: ['AI strategy document', 'Use case identification', 'ROI analysis', 'Technical feasibility study'],
      },
      {
        step: 2,
        title: 'Data Analysis & Preparation',
        description: 'Analyze existing data and prepare datasets for AI model training and integration.',
        duration: '1-3 weeks',
        deliverables: ['Data audit report', 'Data preparation pipeline', 'Quality assessment', 'Privacy compliance review'],
      },
      {
        step: 3,
        title: 'AI Model Development',
        description: 'Develop or fine-tune AI models specific to your use case and requirements.',
        duration: '3-8 weeks',
        deliverables: ['Trained AI models', 'Model evaluation reports', 'Performance benchmarks', 'Model documentation'],
      },
      {
        step: 4,
        title: 'Integration & Implementation',
        description: 'Integrate AI models into your existing systems with proper APIs and infrastructure.',
        duration: '2-4 weeks',
        deliverables: ['AI-powered features', 'API integration', 'Monitoring setup', 'Performance optimization'],
      },
      {
        step: 5,
        title: 'Testing & Optimization',
        description: 'Comprehensive testing and optimization for accuracy, speed, and reliability.',
        duration: '1-2 weeks',
        deliverables: ['Test results', 'Performance optimization', 'Accuracy improvements', 'Production deployment'],
      },
    ],
    
    tiers: [
      {
        name: 'AI Feature Integration',
        price: { from: 10000, to: 25000, unit: 'project' },
        features: [
          'Single AI feature integration',
          'Pre-trained model implementation',
          'Basic customization',
          'API integration',
          'Performance optimization',
          'Documentation',
        ],
        ideal: 'Small to medium projects',
      },
      {
        name: 'Custom AI Solution',
        price: { from: 25000, to: 75000, unit: 'project' },
        features: [
          'Multiple AI features',
          'Custom model training',
          'Advanced integration',
          'Real-time processing',
          'Advanced analytics',
          'Ongoing optimization',
          '3 months support',
        ],
        ideal: 'Advanced AI applications',
        popular: true,
      },
      {
        name: 'Enterprise AI Platform',
        price: { from: 75000, unit: 'project' },
        features: [
          'Complete AI platform',
          'Multiple custom models',
          'Enterprise integration',
          'Scalable infrastructure',
          'Advanced security',
          'Team training',
          '6 months support',
        ],
        ideal: 'Large enterprises',
      },
    ],
    
    technologies: [
      'OpenAI GPT', 'Anthropic Claude', 'TensorFlow', 'PyTorch', 'Hugging Face',
      'LangChain', 'Vector Databases', 'AWS AI Services', 'Google AI', 'Azure AI'
    ],
    
    testimonials: [
      {
        quote: 'The AI chatbot integration transformed our customer support. Response times improved by 80% while maintaining high satisfaction.',
        author: 'Lisa Wang',
        role: 'Customer Success Manager',
        company: 'SupportTech Inc',
        project: 'AI Customer Support',
        result: '80% faster response times',
      },
      {
        quote: 'The custom machine learning model for our inventory management increased accuracy by 95% and reduced costs significantly.',
        author: 'James Thompson',
        role: 'Operations Manager',
        company: 'LogisticsPro',
        project: 'Inventory ML Model',
        result: '95% accuracy improvement',
      },
    ],
    
    deliverables: [
      'Trained AI models and weights',
      'Integration code and APIs',
      'Model documentation',
      'Performance benchmarks',
      'Monitoring and logging setup',
      'Usage guidelines',
      'Training data (if applicable)',
      'Maintenance recommendations',
    ],
    
    timeline: {
      typical: '8-16 weeks',
      rush: '4-8 weeks (for simpler integrations)',
    },
    
    faq: [
      {
        question: 'What AI technologies do you work with?',
        answer: 'We work with all major AI platforms including OpenAI GPT, Anthropic Claude, Google AI, AWS AI services, and can develop custom models using TensorFlow and PyTorch.',
      },
      {
        question: 'Do I need my own data to train AI models?',
        answer: 'Not always. We can use pre-trained models for many use cases. For custom models, your data improves performance, but we can also work with synthetic or publicly available datasets.',
      },
      {
        question: 'How do you ensure AI model accuracy?',
        answer: 'We use rigorous testing methodologies, cross-validation, performance benchmarking, and continuous monitoring to ensure high accuracy and reliability.',
      },
      {
        question: 'What about AI ethics and bias?',
        answer: 'We follow AI ethics best practices, including bias detection and mitigation, fairness testing, transparency in AI decisions, and compliance with AI regulations.',
      },
      {
        question: 'Can AI features scale with my business growth?',
        answer: 'Yes, we design AI solutions with scalability in mind, using cloud infrastructure and optimized architectures that can handle increased load and data volume.',
      },
    ],
    
    relatedServices: ['custom-software-development', 'data-analytics', 'technical-consulting'],
    
    cta: {
      primary: 'Start AI Integration',
      secondary: 'Explore AI Possibilities',
    },
  },
  
  {
    id: 'technical-consulting',
    title: 'Technical Consulting',
    slug: 'technical-consulting',
    tagline: 'Expert guidance for your technology decisions',
    description: 'Strategic technical consulting to help you make informed decisions about technology architecture, team scaling, and digital transformation.',
    longDescription: 'Our technical consulting service provides expert guidance on technology strategy, architecture design, team scaling, and digital transformation. We help organizations make informed decisions and avoid costly mistakes.',
    icon: '🎯',
    category: 'consulting',
    
    features: [
      {
        title: 'Architecture Review',
        description: 'Comprehensive analysis of your current technical architecture',
        icon: '🏗️',
        highlight: true,
      },
      {
        title: 'Technology Strategy',
        description: 'Long-term technology roadmap aligned with business goals',
        icon: '🗺️',
      },
      {
        title: 'Team Scaling Guidance',
        description: 'Strategies for building and scaling development teams',
        icon: '👥',
      },
      {
        title: 'Security Assessment',
        description: 'Security audits and compliance recommendations',
        icon: '🔒',
        highlight: true,
      },
      {
        title: 'Performance Optimization',
        description: 'Identify and resolve performance bottlenecks',
        icon: '⚡',
      },
      {
        title: 'Digital Transformation',
        description: 'Guide your organization through digital modernization',
        icon: '🔄',
      },
    ],
    
    process: [
      {
        step: 1,
        title: 'Current State Assessment',
        description: 'Comprehensive evaluation of your current technology stack, processes, and team.',
        duration: '1-2 weeks',
        deliverables: ['Technical assessment report', 'Gap analysis', 'Risk assessment', 'Quick wins identification'],
      },
      {
        step: 2,
        title: 'Strategy Development',
        description: 'Develop comprehensive technology strategy aligned with business objectives.',
        duration: '1-3 weeks',
        deliverables: ['Technology roadmap', 'Architecture recommendations', 'Investment priorities', 'Risk mitigation plan'],
      },
      {
        step: 3,
        title: 'Implementation Planning',
        description: 'Create detailed implementation plan with timelines, resources, and milestones.',
        duration: '1-2 weeks',
        deliverables: ['Implementation roadmap', 'Resource requirements', 'Timeline and milestones', 'Success metrics'],
      },
      {
        step: 4,
        title: 'Ongoing Advisory',
        description: 'Provide ongoing guidance and support during implementation phase.',
        duration: 'Ongoing',
        deliverables: ['Regular check-ins', 'Progress reviews', 'Course corrections', 'Additional recommendations'],
      },
    ],
    
    tiers: [
      {
        name: 'Technical Audit',
        price: { from: 5000, to: 15000, unit: 'project' },
        features: [
          'Architecture review',
          'Security assessment',
          'Performance analysis',
          'Recommendations report',
          'Implementation guidance',
          '2 weeks support',
        ],
        ideal: 'Small to medium businesses',
      },
      {
        name: 'Strategic Consulting',
        price: { from: 15000, to: 40000, unit: 'project' },
        features: [
          'Comprehensive technology strategy',
          'Architecture redesign',
          'Team scaling plan',
          'Digital transformation roadmap',
          'Monthly advisory sessions',
          '3 months support',
        ],
        ideal: 'Growing companies',
        popular: true,
      },
      {
        name: 'Enterprise Advisory',
        price: { from: 40000, unit: 'project' },
        features: [
          'Enterprise architecture design',
          'Long-term technology roadmap',
          'Organizational transformation',
          'Vendor selection guidance',
          'Weekly advisory sessions',
          '6+ months engagement',
        ],
        ideal: 'Large enterprises',
      },
    ],
    
    technologies: [
      'Cloud Platforms', 'Microservices', 'DevOps', 'Security Frameworks',
      'Data Architecture', 'AI/ML Platforms', 'Modern Web Technologies'
    ],
    
    testimonials: [
      {
        quote: 'The technical consulting helped us avoid a costly architecture mistake and saved us months of development time.',
        author: 'Robert Chen',
        role: 'CTO',
        company: 'ScaleTech',
        project: 'Architecture Review',
        result: '6 months development time saved',
      },
      {
        quote: 'Their strategic guidance was instrumental in our successful digital transformation and team scaling.',
        author: 'Maria Rodriguez',
        role: 'VP Engineering',
        company: 'TransformCorp',
        project: 'Digital Transformation',
        result: 'Successful team scale from 5 to 25 developers',
      },
    ],
    
    deliverables: [
      'Comprehensive assessment report',
      'Technology strategy document',
      'Architecture recommendations',
      'Implementation roadmap',
      'Risk mitigation strategies',
      'Performance optimization plan',
      'Team scaling recommendations',
      'Ongoing advisory support',
    ],
    
    timeline: {
      typical: '4-12 weeks',
      rush: '2-4 weeks (for focused assessments)',
    },
    
    faq: [
      {
        question: 'What areas do you provide consulting for?',
        answer: 'We cover technology strategy, software architecture, team scaling, security, performance optimization, digital transformation, and technology vendor selection.',
      },
      {
        question: 'Do you work with existing development teams?',
        answer: 'Yes, we collaborate closely with your existing teams, providing guidance and knowledge transfer to ensure sustainable improvements.',
      },
      {
        question: 'How do you measure consulting success?',
        answer: 'We establish clear success metrics upfront, including technical KPIs, timeline achievements, cost savings, and team productivity improvements.',
      },
      {
        question: 'Can you help with technology vendor selection?',
        answer: 'Absolutely. We provide unbiased vendor evaluation, comparison analysis, and recommendations based on your specific requirements and constraints.',
      },
      {
        question: 'Do you provide implementation services as well?',
        answer: 'While we focus on consulting and strategy, we can also provide implementation services through our development teams when needed.',
      },
    ],
    
    relatedServices: ['custom-software-development', 'ai-integration', 'team-augmentation'],
    
    cta: {
      primary: 'Get Expert Advice',
      secondary: 'Schedule Strategy Session',
    },
  },
];

// Service categories
export const SERVICE_CATEGORIES = [
  {
    id: 'development',
    title: 'Development Services',
    description: 'Custom software and mobile app development',
    icon: '💻',
  },
  {
    id: 'ai',
    title: 'AI Solutions',
    description: 'Artificial intelligence integration and development',
    icon: '🤖',
  },
  {
    id: 'consulting',
    title: 'Technical Consulting',
    description: 'Strategic guidance and technical expertise',
    icon: '🎯',
  },
  {
    id: 'support',
    title: 'Support Services',
    description: 'Ongoing maintenance and technical support',
    icon: '🛠️',
  },
];

// Helper functions
export const getServiceBySlug = (slug: string): Service | undefined => {
  return SERVICES.find(service => service.slug === slug);
};

export const getServicesByCategory = (category: string): Service[] => {
  return SERVICES.filter(service => service.category === category);
};

export const getFeaturedServices = (): Service[] => {
  return SERVICES.filter(service => service.featured);
};

export const getRelatedServices = (serviceId: string): Service[] => {
  const service = SERVICES.find(s => s.id === serviceId);
  if (!service?.relatedServices) return [];
  
  return service.relatedServices
    .map(id => SERVICES.find(s => s.id === id))
    .filter(Boolean) as Service[];
};