import { IndustryData, IndustryPageData } from './types';

// Major industries for programmatic SEO
export const industries: IndustryData[] = [
  {
    id: 'healthcare',
    slug: 'healthcare',
    name: 'Healthcare',
    description: 'Digital transformation solutions for healthcare organizations, medical practices, and health tech companies',
    icon: '🏥',
    challenges: [
      'HIPAA compliance requirements',
      'Patient data security and privacy',
      'Interoperability between systems',
      'Legacy system integration',
      'Regulatory compliance',
      'Patient engagement and communication'
    ],
    solutions: [
      {
        name: 'Electronic Health Records (EHR)',
        description: 'Custom EHR systems for seamless patient data management',
        benefits: [
          'HIPAA compliant architecture',
          'Real-time patient data access',
          'Automated clinical workflows',
          'Integration with medical devices'
        ],
        technologies: ['React', 'Node.js', 'PostgreSQL', 'HL7 FHIR', 'AWS HIPAA', 'Docker']
      },
      {
        name: 'Telemedicine Platforms',
        description: 'Secure video consultation and remote patient monitoring',
        benefits: [
          'HD video consultations',
          'Prescription management',
          'Patient portal integration',
          'Insurance claim processing'
        ],
        technologies: ['WebRTC', 'React Native', 'Socket.io', 'Stripe', 'Twilio', 'MongoDB']
      },
      {
        name: 'Healthcare Analytics',
        description: 'AI-powered insights for better patient outcomes',
        benefits: [
          'Predictive health analytics',
          'Population health management',
          'Clinical decision support',
          'Cost optimization insights'
        ],
        technologies: ['Python', 'TensorFlow', 'Apache Spark', 'Tableau', 'R', 'ElasticSearch']
      }
    ],
    caseStudies: [
      {
        title: 'Regional Hospital EHR Modernization',
        company: 'Metro Health System',
        challenge: 'Replace legacy paper-based records with modern EHR system',
        solution: 'Custom cloud-based EHR with mobile access and AI-powered clinical decision support',
        results: [
          '40% reduction in documentation time',
          '95% physician adoption rate',
          '60% improvement in patient satisfaction',
          '100% HIPAA compliance achieved'
        ],
        testimonial: {
          quote: 'Zoptal transformed our healthcare delivery with their innovative EHR solution. Patient care has never been more efficient.',
          author: 'Dr. Sarah Chen',
          position: 'Chief Medical Officer'
        }
      }
    ],
    compliance: [
      {
        standard: 'HIPAA',
        description: 'Health Insurance Portability and Accountability Act compliance for patient data protection'
      },
      {
        standard: 'HITECH',
        description: 'Health Information Technology for Economic and Clinical Health Act'
      },
      {
        standard: 'FDA 21 CFR Part 11',
        description: 'Electronic records and signatures in healthcare applications'
      }
    ],
    trends: [
      {
        title: 'AI-Powered Diagnostics',
        description: 'Machine learning algorithms for medical imaging and diagnosis',
        impact: 'Improved accuracy and faster diagnosis'
      },
      {
        title: 'IoT Medical Devices',
        description: 'Connected devices for continuous patient monitoring',
        impact: 'Real-time health data and preventive care'
      }
    ],
    seo: {
      title: 'Healthcare Software Development | Medical Technology Solutions | Zoptal',
      description: 'Custom healthcare software development services. EHR systems, telemedicine platforms, medical apps, and HIPAA-compliant solutions for healthcare organizations.',
      keywords: [
        'healthcare software development',
        'medical app development',
        'EHR development',
        'telemedicine platform',
        'HIPAA compliant software',
        'healthcare IT solutions',
        'medical practice software',
        'healthcare technology'
      ]
    }
  },
  {
    id: 'fintech',
    slug: 'fintech',
    name: 'FinTech',
    description: 'Innovative financial technology solutions for banks, payment processors, and financial services companies',
    icon: '💰',
    challenges: [
      'PCI DSS compliance',
      'Fraud detection and prevention',
      'Real-time transaction processing',
      'Regulatory compliance (SOX, GDPR)',
      'Data security and encryption',
      'Legacy system modernization'
    ],
    solutions: [
      {
        name: 'Digital Banking Platforms',
        description: 'Modern online and mobile banking solutions',
        benefits: [
          'Real-time transaction processing',
          'Multi-factor authentication',
          'Personalized financial insights',
          'Seamless user experience'
        ],
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Kubernetes', 'AWS']
      },
      {
        name: 'Payment Processing Systems',
        description: 'Secure and scalable payment gateways',
        benefits: [
          'PCI DSS compliance',
          'Real-time fraud detection',
          'Multiple payment methods',
          'Global currency support'
        ],
        technologies: ['Java', 'Spring Boot', 'Apache Kafka', 'MongoDB', 'Docker', 'Stripe API']
      },
      {
        name: 'Robo-Advisory Platforms',
        description: 'AI-powered investment and wealth management',
        benefits: [
          'Automated portfolio management',
          'Risk assessment algorithms',
          'Tax optimization strategies',
          'Performance analytics'
        ],
        technologies: ['Python', 'Django', 'TensorFlow', 'PostgreSQL', 'Celery', 'Chart.js']
      }
    ],
    caseStudies: [
      {
        title: 'Digital-First Banking Platform',
        company: 'Community First Bank',
        challenge: 'Launch digital banking platform to compete with fintech startups',
        solution: 'Custom mobile-first banking app with AI-powered financial insights',
        results: [
          '300% increase in digital adoption',
          '50% reduction in operational costs',
          '95% customer satisfaction score',
          '99.9% platform uptime achieved'
        ],
        testimonial: {
          quote: 'Zoptal helped us transform from traditional banking to digital-first. Our customers love the new platform.',
          author: 'Michael Rodriguez',
          position: 'Chief Technology Officer'
        }
      }
    ],
    compliance: [
      {
        standard: 'PCI DSS',
        description: 'Payment Card Industry Data Security Standard for secure payment processing'
      },
      {
        standard: 'SOX',
        description: 'Sarbanes-Oxley Act compliance for financial reporting'
      },
      {
        standard: 'KYC/AML',
        description: 'Know Your Customer and Anti-Money Laundering regulations'
      }
    ],
    trends: [
      {
        title: 'Open Banking APIs',
        description: 'Standardized APIs for third-party financial service providers',
        impact: 'Enhanced customer choice and innovation'
      },
      {
        title: 'Blockchain Integration',
        description: 'Distributed ledger technology for secure transactions',
        impact: 'Improved transparency and reduced costs'
      }
    ],
    seo: {
      title: 'FinTech Software Development | Financial Technology Solutions | Zoptal',
      description: 'Custom FinTech software development services. Digital banking, payment processing, robo-advisory platforms, and financial technology solutions.',
      keywords: [
        'fintech software development',
        'financial app development',
        'digital banking platform',
        'payment gateway development',
        'robo advisor development',
        'financial technology solutions',
        'banking software development',
        'fintech consulting'
      ]
    }
  },
  {
    id: 'ecommerce',
    slug: 'ecommerce',
    name: 'E-commerce',
    description: 'Scalable e-commerce platforms and retail technology solutions for online businesses',
    icon: '🛍️',
    challenges: [
      'Scalability during peak traffic',
      'Multi-channel integration',
      'Inventory management',
      'Payment security',
      'Mobile commerce optimization',
      'Customer personalization'
    ],
    solutions: [
      {
        name: 'Custom E-commerce Platforms',
        description: 'Tailored online stores with advanced features',
        benefits: [
          'Custom checkout workflows',
          'Advanced inventory management',
          'Multi-currency support',
          'SEO optimization'
        ],
        technologies: ['Next.js', 'Node.js', 'MongoDB', 'Stripe', 'AWS', 'ElasticSearch']
      },
      {
        name: 'Mobile Commerce Apps',
        description: 'Native mobile shopping experiences',
        benefits: [
          'Push notifications',
          'Offline browsing',
          'One-touch payments',
          'AR product visualization'
        ],
        technologies: ['React Native', 'Swift', 'Kotlin', 'Firebase', 'Apple Pay', 'Google Pay']
      },
      {
        name: 'AI-Powered Personalization',
        description: 'Machine learning for product recommendations',
        benefits: [
          'Personalized product suggestions',
          'Dynamic pricing optimization',
          'Customer behavior analytics',
          'Abandoned cart recovery'
        ],
        technologies: ['Python', 'TensorFlow', 'Apache Spark', 'Redis', 'GraphQL', 'BigQuery']
      }
    ],
    caseStudies: [
      {
        title: 'Multi-Channel E-commerce Platform',
        company: 'Fashion Forward Retail',
        challenge: 'Integrate online store with physical locations and marketplaces',
        solution: 'Headless commerce platform with unified inventory and customer management',
        results: [
          '200% increase in online sales',
          '85% improvement in inventory accuracy',
          '40% reduction in operational costs',
          '99.5% platform uptime'
        ],
        testimonial: {
          quote: 'Our omnichannel strategy became reality with Zoptal\'s innovative e-commerce solution. Sales have never been stronger.',
          author: 'Jennifer Kim',
          position: 'VP of Digital Commerce'
        }
      }
    ],
    compliance: [
      {
        standard: 'PCI DSS',
        description: 'Payment Card Industry compliance for secure online transactions'
      },
      {
        standard: 'GDPR',
        description: 'General Data Protection Regulation for customer data privacy'
      },
      {
        standard: 'CCPA',
        description: 'California Consumer Privacy Act compliance'
      }
    ],
    trends: [
      {
        title: 'Headless Commerce',
        description: 'Decoupled frontend and backend for flexible user experiences',
        impact: 'Faster development and better performance'
      },
      {
        title: 'Social Commerce',
        description: 'Shopping directly through social media platforms',
        impact: 'Increased conversion rates and customer engagement'
      }
    ],
    seo: {
      title: 'E-commerce Software Development | Online Store Solutions | Zoptal',
      description: 'Custom e-commerce development services. Online stores, mobile commerce apps, B2B platforms, and retail technology solutions for growing businesses.',
      keywords: [
        'ecommerce development',
        'online store development',
        'ecommerce platform',
        'mobile commerce app',
        'retail software development',
        'shopping cart development',
        'ecommerce consulting',
        'headless commerce'
      ]
    }
  },
  {
    id: 'education',
    slug: 'education',
    name: 'Education',
    description: 'EdTech solutions for schools, universities, and online learning platforms',
    icon: '🎓',
    challenges: [
      'Student engagement and retention',
      'Scalable learning platforms',
      'Assessment and grading automation',
      'Multi-device accessibility',
      'Data privacy compliance',
      'Integration with existing systems'
    ],
    solutions: [
      {
        name: 'Learning Management Systems (LMS)',
        description: 'Comprehensive platforms for online education',
        benefits: [
          'Interactive course content',
          'Progress tracking and analytics',
          'Automated assessments',
          'Discussion forums and collaboration'
        ],
        technologies: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'AWS', 'WebRTC']
      },
      {
        name: 'Student Information Systems',
        description: 'Complete student lifecycle management',
        benefits: [
          'Enrollment and registration',
          'Grade management',
          'Attendance tracking',
          'Parent-teacher communication'
        ],
        technologies: ['Vue.js', 'Laravel', 'MySQL', 'Redis', 'Docker', 'Pusher']
      },
      {
        name: 'Virtual Classroom Platforms',
        description: 'Interactive online learning environments',
        benefits: [
          'Live video conferencing',
          'Screen sharing and whiteboards',
          'Breakout rooms',
          'Recording and playback'
        ],
        technologies: ['WebRTC', 'React', 'Node.js', 'Socket.io', 'FFmpeg', 'AWS Media Services']
      }
    ],
    caseStudies: [
      {
        title: 'University Online Learning Platform',
        company: 'State University System',
        challenge: 'Rapid transition to online learning during COVID-19',
        solution: 'Scalable LMS with virtual classrooms and mobile accessibility',
        results: [
          '500% increase in online enrollment',
          '92% student satisfaction rate',
          '99.9% platform availability',
          '40% reduction in administrative workload'
        ],
        testimonial: {
          quote: 'Zoptal\'s education platform enabled us to continue quality education remotely. Students and faculty adapted seamlessly.',
          author: 'Dr. Robert Thompson',
          position: 'VP of Academic Affairs'
        }
      }
    ],
    compliance: [
      {
        standard: 'FERPA',
        description: 'Family Educational Rights and Privacy Act for student data protection'
      },
      {
        standard: 'COPPA',
        description: 'Children\'s Online Privacy Protection Act for under-13 users'
      },
      {
        standard: 'ADA',
        description: 'Americans with Disabilities Act compliance for accessibility'
      }
    ],
    trends: [
      {
        title: 'AI-Powered Personalization',
        description: 'Adaptive learning paths based on student performance',
        impact: 'Improved learning outcomes and engagement'
      },
      {
        title: 'Microlearning',
        description: 'Bite-sized learning modules for better retention',
        impact: 'Higher completion rates and knowledge retention'
      }
    ],
    seo: {
      title: 'Education Software Development | EdTech Solutions | Zoptal',
      description: 'Custom education software development. Learning management systems, student portals, virtual classrooms, and EdTech solutions for educational institutions.',
      keywords: [
        'education software development',
        'edtech development',
        'LMS development',
        'learning management system',
        'student information system',
        'virtual classroom platform',
        'online learning platform',
        'education technology'
      ]
    }
  },
  {
    id: 'manufacturing',
    slug: 'manufacturing',
    name: 'Manufacturing',
    description: 'Industrial IoT, automation, and digital transformation solutions for manufacturing companies',
    icon: '🏭',
    challenges: [
      'Legacy system integration',
      'Real-time production monitoring',
      'Supply chain optimization',
      'Quality control automation',
      'Predictive maintenance',
      'Compliance and safety reporting'
    ],
    solutions: [
      {
        name: 'Manufacturing Execution Systems (MES)',
        description: 'Real-time production floor management',
        benefits: [
          'Production scheduling optimization',
          'Real-time quality monitoring',
          'Resource allocation tracking',
          'Compliance documentation'
        ],
        technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'Apache Kafka', 'Docker', 'Kubernetes']
      },
      {
        name: 'Industrial IoT Platforms',
        description: 'Connected manufacturing with smart sensors',
        benefits: [
          'Equipment monitoring',
          'Predictive maintenance alerts',
          'Energy consumption optimization',
          'Safety incident prevention'
        ],
        technologies: ['Python', 'MQTT', 'InfluxDB', 'Grafana', 'AWS IoT', 'Edge Computing']
      },
      {
        name: 'Supply Chain Management',
        description: 'End-to-end supply chain visibility',
        benefits: [
          'Inventory optimization',
          'Supplier relationship management',
          'Demand forecasting',
          'Logistics coordination'
        ],
        technologies: ['React', 'Node.js', 'MongoDB', 'Apache Spark', 'Blockchain', 'APIs']
      }
    ],
    caseStudies: [
      {
        title: 'Smart Factory Implementation',
        company: 'Advanced Manufacturing Corp',
        challenge: 'Modernize production line with IoT and predictive analytics',
        solution: 'Industrial IoT platform with real-time monitoring and AI-powered predictive maintenance',
        results: [
          '25% increase in production efficiency',
          '60% reduction in unplanned downtime',
          '30% decrease in maintenance costs',
          '99.2% equipment uptime achieved'
        ],
        testimonial: {
          quote: 'Zoptal\'s IoT solution transformed our manufacturing operations. We now have complete visibility and control over our production.',
          author: 'David Martinez',
          position: 'Director of Operations'
        }
      }
    ],
    compliance: [
      {
        standard: 'ISO 9001',
        description: 'Quality management systems for manufacturing processes'
      },
      {
        standard: 'ISO 27001',
        description: 'Information security management for industrial systems'
      },
      {
        standard: 'OSHA',
        description: 'Occupational Safety and Health Administration compliance'
      }
    ],
    trends: [
      {
        title: 'Industry 4.0',
        description: 'Smart manufacturing with cyber-physical systems',
        impact: 'Increased automation and data-driven decisions'
      },
      {
        title: 'Digital Twins',
        description: 'Virtual replicas of physical manufacturing processes',
        impact: 'Better planning and predictive maintenance'
      }
    ],
    seo: {
      title: 'Manufacturing Software Development | Industrial IoT Solutions | Zoptal',
      description: 'Custom manufacturing software development. MES systems, Industrial IoT, supply chain management, and Industry 4.0 solutions for manufacturers.',
      keywords: [
        'manufacturing software development',
        'industrial IoT development',
        'MES development',
        'manufacturing execution system',
        'supply chain software',
        'industry 4.0 solutions',
        'smart factory solutions',
        'manufacturing technology'
      ]
    }
  }
];

// Generate industry page data
export function generateIndustryPageData(industry: IndustryData): IndustryPageData {
  return {
    ...industry,
    hero: {
      title: `${industry.name} Software Development Solutions`,
      subtitle: `Innovative technology solutions designed specifically for the ${industry.name.toLowerCase()} industry`,
      description: `Transform your ${industry.name.toLowerCase()} business with custom software development, mobile apps, AI solutions, and digital transformation services. Zoptal delivers industry-specific solutions that address your unique challenges and drive growth.`,
      backgroundImage: `/images/industries/${industry.slug}-hero.jpg`,
      stats: [
        { value: '150+', label: `${industry.name} Projects` },
        { value: '98%', label: 'Client Satisfaction' },
        { value: '24/7', label: 'Support Available' },
        { value: '10+', label: 'Years Experience' }
      ]
    },
    services: {
      title: `Our ${industry.name} Software Development Services`,
      description: `Comprehensive technology solutions tailored for ${industry.name.toLowerCase()} organizations`,
      featured: industry.solutions.map(solution => ({
        name: solution.name,
        description: solution.description,
        icon: getServiceIcon(solution.name),
        features: solution.benefits,
        pricing: {
          starting: '$15,000',
          typical: '$50,000'
        }
      }))
    },
    whyChooseUs: {
      title: `Why Choose Zoptal for ${industry.name} Software Development?`,
      reasons: [
        {
          title: 'Industry Expertise',
          description: `Deep understanding of ${industry.name.toLowerCase()} workflows, regulations, and best practices`,
          icon: '🎯'
        },
        {
          title: 'Compliance Focus',
          description: `Built-in compliance for industry standards and regulations specific to ${industry.name.toLowerCase()}`,
          icon: '🛡️'
        },
        {
          title: 'Scalable Solutions',
          description: 'Enterprise-grade architecture that grows with your business needs',
          icon: '📈'
        },
        {
          title: 'Proven Results',
          description: `Track record of successful ${industry.name.toLowerCase()} software implementations`,
          icon: '✅'
        }
      ]
    },
    faq: [
      {
        question: `What types of software solutions do you develop for ${industry.name.toLowerCase()}?`,
        answer: `We develop comprehensive software solutions for ${industry.name.toLowerCase()} including ${industry.solutions.map(s => s.name.toLowerCase()).join(', ')}, and custom applications tailored to your specific business needs.`
      },
      {
        question: `How do you ensure compliance with ${industry.name.toLowerCase()} regulations?`,
        answer: `Our team has extensive experience with ${industry.name.toLowerCase()} compliance requirements including ${industry.compliance.slice(0, 2).map(c => c.standard).join(' and ')}. We build compliance into every aspect of the software architecture and development process.`
      },
      {
        question: `What is the typical timeline for ${industry.name.toLowerCase()} software development projects?`,
        answer: `Project timelines vary based on complexity and scope. Simple applications typically take 8-12 weeks, while complex enterprise solutions may take 6-12 months. We provide detailed timelines during our initial consultation.`
      },
      {
        question: `Do you provide ongoing support and maintenance for ${industry.name.toLowerCase()} software?`,
        answer: `Yes, we offer comprehensive post-launch support including maintenance, updates, security patches, and feature enhancements. Our support team understands ${industry.name.toLowerCase()} operations and provides 24/7 assistance when needed.`
      }
    ],
    cta: {
      title: `Ready to Transform Your ${industry.name} Business?`,
      subtitle: `Let's discuss how our ${industry.name.toLowerCase()} software expertise can drive your success`,
      primaryButton: 'Get Free Consultation',
      secondaryButton: 'View Case Studies'
    }
  };
}

// Helper function to get service icons
function getServiceIcon(serviceName: string): string {
  const icons: Record<string, string> = {
    'Electronic Health Records (EHR)': '📋',
    'Telemedicine Platforms': '💻',
    'Healthcare Analytics': '📊',
    'Digital Banking Platforms': '🏛️',
    'Payment Processing Systems': '💳',
    'Robo-Advisory Platforms': '🤖',
    'Custom E-commerce Platforms': '🛒',
    'Mobile Commerce Apps': '📱',
    'AI-Powered Personalization': '🎯',
    'Learning Management Systems (LMS)': '📚',
    'Student Information Systems': '🎓',
    'Virtual Classroom Platforms': '💻',
    'Manufacturing Execution Systems (MES)': '⚙️',
    'Industrial IoT Platforms': '🔗',
    'Supply Chain Management': '📦'
  };
  return icons[serviceName] || '💻';
}

// Get industry by slug
export function getIndustryBySlug(slug: string): IndustryData | undefined {
  return industries.find(industry => industry.slug === slug);
}

// Get all industry slugs for static generation
export function getAllIndustrySlugs(): string[] {
  return industries.map(industry => industry.slug);
}