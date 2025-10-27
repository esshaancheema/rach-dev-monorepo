// Case Studies CMS integration - Mock implementation for AMP support
// In production, this would integrate with your actual CMS

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  client: {
    name: string;
    logo?: string;
    industry: string;
    website?: string;
  };
  results: Array<{
    metric: string;
    value: string;
    description: string;
  }>;
  technologies: string[];
  gallery: Array<{
    url: string;
    alt: string;
    width?: number;
    height?: number;
    caption?: string;
  }>;
  publishedAt: string;
  updatedAt: string;
  category: {
    name: string;
    slug: string;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
  featuredImage: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  duration: string;
  teamSize: number;
  isPublished: boolean;
  isFeatured: boolean;
}

// Mock case studies data for demonstration
const mockCaseStudies: CaseStudy[] = [
  {
    id: '1',
    slug: 'fintech-mobile-banking-platform',
    title: 'Revolutionary Mobile Banking Platform for FinTech Startup',
    description: 'Built a secure, scalable mobile banking platform that processed over $10M in transactions within the first quarter.',
    content: `
      <h2>Project Overview</h2>
      <p>Our client, a promising FinTech startup, approached us with a vision to revolutionize mobile banking for the younger generation. They needed a platform that was not only secure and compliant but also intuitive and engaging.</p>
      
      <h3>The Challenge</h3>
      <p>The client faced several critical challenges:</p>
      <ul>
        <li>Strict regulatory compliance requirements (PCI DSS, SOC 2)</li>
        <li>Need for real-time transaction processing</li>
        <li>Integration with multiple banking APIs</li>
        <li>Scalable architecture to handle rapid user growth</li>
        <li>Intuitive UX that would appeal to digital natives</li>
      </ul>
      
      <h3>Our Solution</h3>
      <p>We designed and developed a comprehensive mobile banking platform with the following key features:</p>
      
      <h4>Security-First Architecture</h4>
      <p>Implemented multiple layers of security including:</p>
      <ul>
        <li>End-to-end encryption for all transactions</li>
        <li>Biometric authentication (fingerprint, Face ID)</li>
        <li>Advanced fraud detection using machine learning</li>
        <li>Zero-trust security model</li>
      </ul>
      
      <h4>Real-Time Transaction Engine</h4>
      <p>Built a high-performance transaction processing system capable of:</p>
      <ul>
        <li>Processing 10,000+ transactions per second</li>
        <li>Sub-second transaction confirmation</li>
        <li>Automatic reconciliation and settlement</li>
        <li>Real-time balance updates</li>
      </ul>
      
      <h4>Modern User Experience</h4>
      <p>Designed an intuitive interface featuring:</p>
      <ul>
        <li>Personalized financial insights</li>
        <li>Smart spending categorization</li>
        <li>Goal-based savings tools</li>
        <li>Social payment features</li>
      </ul>
      
      <h3>Technical Implementation</h3>
      <p>The platform was built using cutting-edge technologies:</p>
      
      <h4>Backend Infrastructure</h4>
      <ul>
        <li><strong>Microservices Architecture:</strong> Built on Node.js and Go</li>
        <li><strong>Database:</strong> PostgreSQL with Redis for caching</li>
        <li><strong>Message Queue:</strong> Apache Kafka for event streaming</li>
        <li><strong>API Gateway:</strong> Kong for API management</li>
      </ul>
      
      <h4>Mobile Applications</h4>
      <ul>
        <li><strong>Framework:</strong> React Native for cross-platform development</li>
        <li><strong>State Management:</strong> Redux with Redux Toolkit</li>
        <li><strong>Security:</strong> React Native Keychain and biometric libraries</li>
        <li><strong>Analytics:</strong> Custom analytics with privacy-first approach</li>
      </ul>
      
      <h4>Cloud Infrastructure</h4>
      <ul>
        <li><strong>Platform:</strong> AWS with multi-region deployment</li>
        <li><strong>Containers:</strong> Docker with Kubernetes orchestration</li>
        <li><strong>Monitoring:</strong> Prometheus, Grafana, and ELK stack</li>
        <li><strong>CI/CD:</strong> GitLab CI with automated security scanning</li>
      </ul>
      
      <h3>Results and Impact</h3>
      <p>The platform's launch exceeded all expectations:</p>
      
      <blockquote>
        "Zoptal delivered a world-class mobile banking platform that not only met our technical requirements but exceeded our user experience expectations. The platform's performance and security have been outstanding."
        <cite>— Sarah Johnson, CTO, SecureBank</cite>
      </blockquote>
      
      <h3>Post-Launch Success</h3>
      <p>Following the successful launch, we continued to support the client with:</p>
      <ul>
        <li>24/7 monitoring and support</li>
        <li>Regular security audits and updates</li>
        <li>Performance optimization</li>
        <li>New feature development</li>
      </ul>
      
      <p>This project showcases our expertise in building secure, scalable financial applications that deliver exceptional user experiences while meeting strict regulatory requirements.</p>
    `,
    client: {
      name: 'SecureBank',
      logo: '/images/clients/securebank-logo.png',
      industry: 'Financial Technology',
      website: 'https://securebank.com'
    },
    results: [
      {
        metric: 'Transaction Volume',
        value: '$10M+',
        description: 'Processed in first quarter'
      },
      {
        metric: 'User Growth',
        value: '300%',
        description: 'Monthly active users increase'
      },
      {
        metric: 'App Store Rating',
        value: '4.8/5',
        description: 'Average user rating'
      },
      {
        metric: 'Transaction Speed',
        value: '<1sec',
        description: 'Average processing time'
      }
    ],
    technologies: [
      'React Native',
      'Node.js',
      'Go',
      'PostgreSQL',
      'Redis',
      'Apache Kafka',
      'AWS',
      'Kubernetes',
      'Docker'
    ],
    gallery: [
      {
        url: '/images/case-studies/fintech-app-dashboard.jpg',
        alt: 'Mobile banking app dashboard',
        width: 800,
        height: 600,
        caption: 'Intuitive dashboard with personalized financial insights'
      },
      {
        url: '/images/case-studies/fintech-app-transactions.jpg',
        alt: 'Transaction history screen',
        width: 800,
        height: 600,
        caption: 'Real-time transaction processing with smart categorization'
      },
      {
        url: '/images/case-studies/fintech-app-security.jpg',
        alt: 'Biometric authentication',
        width: 800,
        height: 600,
        caption: 'Advanced biometric security features'
      }
    ],
    publishedAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    category: {
      name: 'Mobile Development',
      slug: 'mobile-development'
    },
    tags: [
      { name: 'FinTech', slug: 'fintech' },
      { name: 'Mobile Banking', slug: 'mobile-banking' },
      { name: 'React Native', slug: 'react-native' },
      { name: 'Security', slug: 'security' }
    ],
    featuredImage: {
      url: '/images/case-studies/fintech-mobile-banking-hero.jpg',
      alt: 'Mobile banking application interface',
      width: 1200,
      height: 630
    },
    duration: '6 months',
    teamSize: 8,
    isPublished: true,
    isFeatured: true
  },
  {
    id: '2',
    slug: 'ecommerce-ai-personalization-platform',
    title: 'AI-Powered E-commerce Personalization Platform',
    description: 'Developed an intelligent e-commerce platform that increased conversion rates by 45% through AI-driven personalization.',
    content: `
      <h2>Transforming E-commerce with AI</h2>
      <p>Our client, a major retail brand, was struggling with declining conversion rates and increasing customer acquisition costs. They needed a solution that could deliver personalized shopping experiences at scale.</p>
      
      <h3>The Business Challenge</h3>
      <p>The client faced several critical issues:</p>
      <ul>
        <li>Generic product recommendations leading to low engagement</li>
        <li>High cart abandonment rates (70%+)</li>
        <li>Inability to personalize content for millions of users</li>
        <li>Limited insights into customer behavior and preferences</li>
        <li>Competitive pressure from AI-native e-commerce platforms</li>
      </ul>
      
      <h3>Our AI-Driven Solution</h3>
      <p>We developed a comprehensive personalization platform powered by machine learning:</p>
      
      <h4>Intelligent Product Recommendations</h4>
      <p>Built a multi-algorithm recommendation engine featuring:</p>
      <ul>
        <li>Collaborative filtering for user behavior analysis</li>
        <li>Content-based filtering for product similarity</li>
        <li>Deep learning models for complex pattern recognition</li>
        <li>Real-time recommendation updates</li>
      </ul>
      
      <h4>Dynamic Content Personalization</h4>
      <p>Implemented dynamic content delivery system:</p>
      <ul>
        <li>Personalized homepage layouts</li>
        <li>Custom product category ordering</li>
        <li>Targeted promotional banners</li>
        <li>Adaptive search results ranking</li>
      </ul>
      
      <h4>Predictive Analytics Dashboard</h4>
      <p>Created comprehensive analytics platform:</p>
      <ul>
        <li>Customer lifetime value prediction</li>
        <li>Churn risk assessment</li>
        <li>Inventory demand forecasting</li>
        <li>Price optimization recommendations</li>
      </ul>
      
      <h3>Technical Architecture</h3>
      <p>The platform leveraged cutting-edge AI and cloud technologies:</p>
      
      <h4>Machine Learning Infrastructure</h4>
      <ul>
        <li><strong>ML Framework:</strong> TensorFlow and PyTorch</li>
        <li><strong>Data Pipeline:</strong> Apache Airflow for workflow orchestration</li>
        <li><strong>Feature Store:</strong> Custom-built with Redis and PostgreSQL</li>
        <li><strong>Model Serving:</strong> TensorFlow Serving with Kubernetes</li>
      </ul>
      
      <h4>Real-Time Processing</h4>
      <ul>
        <li><strong>Stream Processing:</strong> Apache Kafka and Apache Flink</li>
        <li><strong>Caching Layer:</strong> Redis Cluster for sub-millisecond responses</li>
        <li><strong>API Gateway:</strong> GraphQL with Apollo Federation</li>
        <li><strong>Event Tracking:</strong> Custom analytics with privacy compliance</li>
      </ul>
      
      <h4>Frontend Experience</h4>
      <ul>
        <li><strong>Framework:</strong> Next.js with TypeScript</li>
        <li><strong>State Management:</strong> Zustand with optimistic updates</li>
        <li><strong>Testing:</strong> A/B testing framework with statistical significance</li>
        <li><strong>Performance:</strong> Edge caching and lazy loading</li>
      </ul>
      
      <h3>Implementation Phases</h3>
      <p>We executed the project in carefully planned phases:</p>
      
      <h4>Phase 1: Data Foundation (Months 1-2)</h4>
      <ul>
        <li>Data architecture design and implementation</li>
        <li>Customer data platform integration</li>
        <li>Privacy-compliant data collection setup</li>
      </ul>
      
      <h4>Phase 2: Core ML Models (Months 3-4)</h4>
      <ul>
        <li>Recommendation algorithm development</li>
        <li>Model training and validation</li>
        <li>A/B testing framework implementation</li>
      </ul>
      
      <h4>Phase 3: Personalization Engine (Months 5-6)</h4>
      <ul>
        <li>Real-time personalization system</li>
        <li>Dynamic content delivery</li>
        <li>Performance optimization</li>
      </ul>
      
      <h4>Phase 4: Analytics & Optimization (Months 7-8)</h4>
      <ul>
        <li>Predictive analytics dashboard</li>
        <li>Advanced reporting capabilities</li>
        <li>Continuous model improvement pipeline</li>
      </ul>
      
      <h3>Measurable Business Impact</h3>
      <p>The results spoke for themselves:</p>
      
      <blockquote>
        "The personalization platform transformed our business. Not only did we see immediate improvements in conversion rates, but we also gained invaluable insights into our customers' behavior."
        <cite>— David Chen, VP of Digital Commerce, RetailPro</cite>
      </blockquote>
      
      <h3>Ongoing Partnership</h3>
      <p>Our relationship with the client continues to evolve:</p>
      <ul>
        <li>Monthly model retraining and optimization</li>
        <li>New feature development and testing</li>
        <li>Advanced analytics and reporting</li>
        <li>Strategic AI roadmap planning</li>
      </ul>
      
      <p>This project demonstrates our ability to leverage AI and machine learning to solve complex business problems and deliver measurable results.</p>
    `,
    client: {
      name: 'RetailPro',
      logo: '/images/clients/retailpro-logo.png',
      industry: 'E-commerce',
      website: 'https://retailpro.com'
    },
    results: [
      {
        metric: 'Conversion Rate',
        value: '+45%',
        description: 'Increase in overall conversion'
      },
      {
        metric: 'Cart Abandonment',
        value: '-35%',
        description: 'Reduction in abandonment rate'
      },
      {
        metric: 'Average Order Value',
        value: '+28%',
        description: 'Increase through smart recommendations'
      },
      {
        metric: 'Customer Engagement',
        value: '+60%',
        description: 'Increase in time spent on site'
      }
    ],
    technologies: [
      'Python',
      'TensorFlow',
      'PyTorch',
      'Apache Kafka',
      'Apache Flink',
      'Redis',
      'PostgreSQL',
      'Next.js',
      'AWS'
    ],
    gallery: [
      {
        url: '/images/case-studies/ecommerce-personalized-homepage.jpg',
        alt: 'Personalized e-commerce homepage',
        width: 1200,
        height: 800,
        caption: 'AI-powered personalized homepage with dynamic content'
      },
      {
        url: '/images/case-studies/ecommerce-recommendations.jpg',
        alt: 'Product recommendation engine',
        width: 1200,
        height: 800,
        caption: 'Intelligent product recommendations based on user behavior'
      },
      {
        url: '/images/case-studies/ecommerce-analytics-dashboard.jpg',
        alt: 'Analytics dashboard',
        width: 1200,
        height: 800,
        caption: 'Comprehensive analytics dashboard with predictive insights'
      }
    ],
    publishedAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
    category: {
      name: 'Artificial Intelligence',
      slug: 'artificial-intelligence'
    },
    tags: [
      { name: 'E-commerce', slug: 'ecommerce' },
      { name: 'Machine Learning', slug: 'machine-learning' },
      { name: 'Personalization', slug: 'personalization' },
      { name: 'AI', slug: 'ai' }
    ],
    featuredImage: {
      url: '/images/case-studies/ecommerce-ai-personalization-hero.jpg',
      alt: 'AI-powered e-commerce personalization interface',
      width: 1200,
      height: 630
    },
    duration: '8 months',
    teamSize: 12,
    isPublished: true,
    isFeatured: true
  }
];

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  // In production, this would query your actual CMS/database
  const caseStudy = mockCaseStudies.find(cs => cs.slug === slug && cs.isPublished);
  return caseStudy || null;
}

export async function getCaseStudies(limit?: number): Promise<CaseStudy[]> {
  // In production, this would query your actual CMS/database
  const publishedCaseStudies = mockCaseStudies.filter(cs => cs.isPublished);
  return limit ? publishedCaseStudies.slice(0, limit) : publishedCaseStudies;
}

export async function getFeaturedCaseStudies(): Promise<CaseStudy[]> {
  // In production, this would query your actual CMS/database
  return mockCaseStudies.filter(cs => cs.isPublished && cs.isFeatured);
}

export async function getCaseStudiesByCategory(categorySlug: string): Promise<CaseStudy[]> {
  // In production, this would query your actual CMS/database
  return mockCaseStudies.filter(cs => 
    cs.isPublished && cs.category.slug === categorySlug
  );
}

export async function getCaseStudiesByTechnology(technology: string): Promise<CaseStudy[]> {
  // In production, this would query your actual CMS/database
  return mockCaseStudies.filter(cs => 
    cs.isPublished && cs.technologies.some(tech => 
      tech.toLowerCase().includes(technology.toLowerCase())
    )
  );
}