import { Metadata } from 'next';
import { motion } from 'framer-motion';
import { 
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  LockClosedIcon,
  BoltIcon,
  DocumentTextIcon,
  CpuChipIcon,
  GlobeAltIcon,
  CheckIcon,
  StarIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  SparklesIcon,
  ArrowRightIcon,
  ClockIcon,
  UserGroupIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { SEOHead } from '@/components/seo';
import { generateServiceSchema, combineSchemas, ZOPTAL_ORGANIZATION_SCHEMA } from '@/lib/seo/schemas';
import { getKeywordsForIndustry } from '@/lib/seo/keywords';

export const metadata: Metadata = {
  title: 'Financial Software Development | Fintech Solutions | Zoptal',
  description: 'Expert financial software development services. Build secure banking apps, payment systems, trading platforms, and fintech solutions with regulatory compliance and enterprise security.',
  keywords: [
    'financial software development',
    'fintech development',
    'banking software development',
    'payment system development',
    'trading platform development',
    'financial services software',
    'blockchain development',
    'cryptocurrency development',
    'regulatory compliance software',
    'financial data security'
  ]
};

const financeFeatures = [
  {
    icon: ShieldCheckIcon,
    title: 'Bank-Grade Security',
    description: 'Enterprise-level security with encryption and fraud prevention',
    details: [
      'AES-256 encryption',
      'Multi-factor authentication',
      'Fraud detection systems',
      'PCI DSS compliance',
      'SOC 2 certification',
      'Zero-trust architecture'
    ]
  },
  {
    icon: DocumentTextIcon,
    title: 'Regulatory Compliance',
    description: 'Built-in compliance for global financial regulations',
    details: [
      'KYC/AML compliance',
      'GDPR & CCPA ready',
      'SOX compliance',
      'Basel III standards',
      'MiFID II compliance',
      'Audit trail systems'
    ]
  },
  {
    icon: BoltIcon,
    title: 'Real-Time Processing',
    description: 'High-performance systems for instant financial transactions',
    details: [
      'Microsecond latency',
      'Real-time settlements',
      'High-frequency trading',
      'Stream processing',
      'Event-driven architecture',
      '99.999% uptime'
    ]
  },
  {
    icon: ChartBarIcon,
    title: 'Advanced Analytics',
    description: 'AI-powered insights for better financial decisions',
    details: [
      'Risk analytics',
      'Predictive modeling',
      'Portfolio optimization',
      'Market analysis',
      'Fraud pattern detection',
      'Customer insights'
    ]
  }
];

const solutionTypes = [
  {
    id: 'digital-banking',
    title: 'Digital Banking Platforms',
    description: 'Next-generation online and mobile banking solutions',
    icon: BanknotesIcon,
    features: [
      'Account management',
      'Mobile check deposit',
      'Bill payment systems',
      'P2P transfers',
      'Digital wallets',
      'Open banking APIs',
      'Biometric authentication',
      'Personal finance management'
    ],
    benefits: [
      'Enhanced customer experience',
      'Reduced operational costs',
      'Increased customer retention',
      'New revenue streams',
      'Competitive advantage',
      'Regulatory compliance'
    ],
    useCases: [
      'Retail banks',
      'Digital-only banks',
      'Credit unions',
      'Community banks',
      'Financial institutions'
    ]
  },
  {
    id: 'payment-systems',
    title: 'Payment Processing Systems',
    description: 'Secure, scalable payment infrastructure for modern commerce',
    icon: CreditCardIcon,
    features: [
      'Payment gateway integration',
      'Multi-currency support',
      'Recurring billing',
      'Tokenization',
      'Fraud prevention',
      'PCI DSS compliance',
      'Mobile payments',
      'Cryptocurrency support'
    ],
    benefits: [
      'Increased transaction security',
      'Global payment acceptance',
      'Reduced fraud losses',
      'Faster settlements',
      'Better conversion rates',
      'Scalable infrastructure'
    ],
    useCases: [
      'E-commerce platforms',
      'Payment processors',
      'Merchant services',
      'FinTech startups',
      'Marketplace platforms'
    ]
  },
  {
    id: 'trading-platforms',
    title: 'Trading & Investment Platforms',
    description: 'Professional trading systems for stocks, forex, and crypto',
    icon: ArrowTrendingUpIcon,
    features: [
      'Real-time market data',
      'Order management system',
      'Risk management tools',
      'Algorithmic trading',
      'Portfolio management',
      'Technical analysis',
      'Mobile trading apps',
      'Social trading features'
    ],
    benefits: [
      'Ultra-low latency',
      'Advanced order types',
      'Risk mitigation',
      'Regulatory compliance',
      'Multi-asset support',
      'Scalable architecture'
    ],
    useCases: [
      'Investment banks',
      'Hedge funds',
      'Retail brokers',
      'Crypto exchanges',
      'Asset managers'
    ]
  },
  {
    id: 'lending-platforms',
    title: 'Lending & Credit Solutions',
    description: 'Automated lending platforms with AI-powered decisioning',
    icon: BuildingOffice2Icon,
    features: [
      'Loan origination system',
      'Credit scoring engine',
      'Underwriting automation',
      'Document verification',
      'Collections management',
      'Regulatory reporting',
      'API integrations',
      'Mobile applications'
    ],
    benefits: [
      'Faster loan processing',
      'Reduced default rates',
      'Improved customer experience',
      'Lower operational costs',
      'Better risk assessment',
      'Regulatory compliance'
    ],
    useCases: [
      'Banks & credit unions',
      'Online lenders',
      'P2P lending platforms',
      'Mortgage companies',
      'Auto finance'
    ]
  }
];

const complianceStandards = [
  {
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
    requirements: ['Secure Networks', 'Data Protection', 'Access Control', 'Regular Testing']
  },
  {
    name: 'SOX',
    description: 'Sarbanes-Oxley Act compliance for financial reporting',
    requirements: ['Internal Controls', 'Audit Trails', 'Data Integrity', 'Access Management']
  },
  {
    name: 'KYC/AML',
    description: 'Know Your Customer and Anti-Money Laundering',
    requirements: ['Identity Verification', 'Transaction Monitoring', 'Risk Assessment', 'Reporting']
  },
  {
    name: 'GDPR/CCPA',
    description: 'Data privacy regulations for customer protection',
    requirements: ['Data Encryption', 'Right to Delete', 'Consent Management', 'Data Portability']
  }
];

const caseStudies = [
  {
    title: 'Global Payment Gateway Platform',
    client: 'PaymentTech Solutions',
    type: 'Payment Processing',
    challenge: 'Build a scalable payment gateway handling 100M+ transactions daily',
    solution: 'Microservices architecture with real-time fraud detection and global compliance',
    results: {
      volume: '150M transactions/day',
      uptime: '99.99% availability',
      fraud: '75% fraud reduction',
      growth: '300% revenue growth'
    },
    technologies: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Redis', 'AWS'],
    timeline: '12 months',
    testimonial: {
      quote: 'Zoptal built us a world-class payment platform that handles our massive scale while maintaining security and compliance standards.',
      author: 'James Wilson',
      role: 'CTO, PaymentTech Solutions'
    }
  },
  {
    title: 'AI-Powered Trading Platform',
    client: 'AlphaTrading Inc',
    type: 'Trading Platform',
    challenge: 'Develop low-latency trading platform with AI-driven analytics',
    solution: 'High-performance trading engine with machine learning models for prediction',
    results: {
      latency: '<100μs order execution',
      accuracy: '87% prediction accuracy',
      volume: '$5B daily volume',
      users: '50K+ active traders'
    },
    technologies: ['C++', 'Python', 'TensorFlow', 'Redis', 'Kubernetes', 'AWS'],
    timeline: '18 months',
    testimonial: {
      quote: 'The platform Zoptal delivered gave us a significant edge in the market with its speed and AI capabilities.',
      author: 'Sarah Chen',
      role: 'Head of Trading, AlphaTrading'
    }
  },
  {
    title: 'Digital Banking Transformation',
    client: 'NextGen Bank',
    type: 'Digital Banking',
    challenge: 'Transform traditional bank into digital-first institution',
    solution: 'Complete digital banking platform with mobile apps and open banking APIs',
    results: {
      adoption: '2M+ digital users',
      satisfaction: '4.8/5 app rating',
      cost: '60% cost reduction',
      revenue: '40% new revenue streams'
    },
    technologies: ['React Native', 'Node.js', 'MongoDB', 'Kubernetes', 'Azure', 'Plaid'],
    timeline: '24 months',
    testimonial: {
      quote: 'Zoptal helped us compete with digital-only banks by creating an exceptional digital experience for our customers.',
      author: 'Michael Roberts',
      role: 'Chief Digital Officer'
    }
  }
];

const developmentProcess = [
  {
    phase: 'Compliance & Security Planning',
    duration: '2-3 weeks',
    description: 'Comprehensive security and regulatory requirement analysis',
    activities: [
      'Regulatory assessment',
      'Security architecture',
      'Compliance roadmap',
      'Risk analysis',
      'Integration planning',
      'Performance requirements'
    ]
  },
  {
    phase: 'Architecture & Design',
    duration: '3-5 weeks',
    description: 'Designing secure, scalable financial systems',
    activities: [
      'System architecture',
      'Security framework',
      'API design',
      'Database modeling',
      'UI/UX design',
      'Compliance documentation'
    ]
  },
  {
    phase: 'Secure Development',
    duration: '16-32 weeks',
    description: 'Building with security and compliance at every step',
    activities: [
      'Secure coding practices',
      'Continuous security testing',
      'Integration development',
      'Performance optimization',
      'Compliance validation',
      'Penetration testing'
    ]
  },
  {
    phase: 'Deployment & Certification',
    duration: '2-4 weeks',
    description: 'Secure deployment with compliance certification',
    activities: [
      'Production deployment',
      'Security hardening',
      'Compliance certification',
      'Performance tuning',
      'Monitoring setup',
      'Disaster recovery'
    ]
  }
];

const technologies = [
  { name: 'Java/Spring', category: 'Backend', icon: '☕' },
  { name: 'Python', category: 'Analytics', icon: '🐍' },
  { name: 'React/Angular', category: 'Frontend', icon: '⚛️' },
  { name: 'Blockchain', category: 'DLT', icon: '⛓️' },
  { name: 'Kubernetes', category: 'Infrastructure', icon: '⚓' },
  { name: 'Apache Kafka', category: 'Streaming', icon: '📊' },
  { name: 'PostgreSQL', category: 'Database', icon: '🐘' },
  { name: 'Redis', category: 'Cache', icon: '🔴' }
];

const testimonials = [
  {
    name: 'David Martinez',
    role: 'CEO',
    organization: 'FinTech Innovations',
    rating: 5,
    comment: 'Zoptal\'s expertise in financial regulations and security made them the perfect partner for our payment platform.',
    results: 'Processing $10B+ annually'
  },
  {
    name: 'Lisa Thompson',
    role: 'VP Technology',
    organization: 'Global Investment Bank',
    rating: 5,
    comment: 'Their trading platform handles our massive volume with ultra-low latency. Exceptional technical execution.',
    results: '99.99% uptime achieved'
  },
  {
    name: 'Robert Kim',
    role: 'CTO',
    organization: 'Digital Lending Corp',
    rating: 5,
    comment: 'The lending platform they built automated 80% of our processes while maintaining full compliance.',
    results: '10x faster loan processing'
  }
];

export default function FinanceServicesPage() {
  const industryKeywords = getKeywordsForIndustry('finance');
  
  const structuredData = combineSchemas(
    ZOPTAL_ORGANIZATION_SCHEMA,
    generateServiceSchema({
      name: 'Financial Software Development Services',
      description: 'Expert fintech development including banking software, payment systems, trading platforms, and regulatory compliant financial solutions.',
      url: 'https://zoptal.com/services/custom-software-development/by-industry/finance',
      serviceType: 'Financial Software Development',
      provider: {
        name: 'Zoptal',
        url: 'https://zoptal.com'
      },
      areaServed: ['United States', 'Canada', 'United Kingdom', 'European Union'],
      offers: {
        price: '75000',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      aggregateRating: {
        ratingValue: 4.9,
        reviewCount: 92
      }
    })
  );

  return (
    <>
      <SEOHead
        title="Financial Software Development | Fintech Solutions | Zoptal"
        description="Expert financial software development services. Build secure banking apps, payment systems, trading platforms, and fintech solutions with regulatory compliance and enterprise security."
        canonicalUrl="https://zoptal.com/services/custom-software-development/by-industry/finance"
        keywords={metadata.keywords as string[]}
        type="website"
        structuredData={structuredData}
      />

      <MainLayout>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm">
              <ol className="flex items-center space-x-2 text-gray-500">
                <li><Link href="/services" className="hover:text-primary-600">Services</Link></li>
                <li>/</li>
                <li><Link href="/services/custom-software-development" className="hover:text-primary-600">Custom Software</Link></li>
                <li>/</li>
                <li><Link href="/services/custom-software-development/by-industry" className="hover:text-primary-600">By Industry</Link></li>
                <li>/</li>
                <li className="text-gray-900">Finance</li>
              </ol>
            </nav>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
                >
                  <CurrencyDollarIcon className="w-4 h-4" />
                  <span>Financial Solutions</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
                >
                  Financial Software Development
                  <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    Secure & Compliant
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl text-gray-600 mb-8"
                >
                  Build cutting-edge financial technology with bank-grade security, regulatory compliance, 
                  and performance that scales. Trusted by banks, fintechs, and financial institutions.
                </motion.p>

                {/* Key Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-3 gap-6 mb-8"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">$50B+</div>
                    <div className="text-gray-600 text-sm">Processed Annually</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">99.99%</div>
                    <div className="text-gray-600 text-sm">Uptime SLA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">100%</div>
                    <div className="text-gray-600 text-sm">PCI Compliant</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center space-x-2 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                  >
                    <span>Build Secure Fintech</span>
                    <ShieldCheckIcon className="w-5 h-5" />
                  </Link>
                  <Link
                    href="#solutions"
                    className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg border border-primary-200 hover:bg-primary-50 transition-all font-semibold"
                  >
                    <span>View Solutions</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>

              {/* Visual Element */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-12">
                  <div className="text-center mb-8">
                    <CurrencyDollarIcon className="w-20 h-20 text-primary-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900">Financial Excellence</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <LockClosedIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Bank-Grade Security</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <ShieldCheckIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Compliance Ready</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <BoltIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Real-Time</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <ChartBarIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">AI Analytics</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Financial Features */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Enterprise Financial Features
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Built with the security, compliance, and performance standards 
                required by modern financial institutions.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {financeFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.details.slice(0, 4).map((detail, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Financial Solutions */}
        <section id="solutions" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Financial Software Solutions
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Comprehensive fintech solutions designed to innovate, secure, 
                and scale your financial services.
              </motion.p>
            </div>

            <div className="space-y-12">
              {solutionTypes.map((solution, index) => (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm"
                >
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div>
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                          <solution.icon className="w-8 h-8 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {solution.title}
                          </h3>
                          <p className="text-gray-600">
                            {solution.description}
                          </p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Use Cases:</h4>
                        <div className="space-y-2">
                          {solution.useCases.map((useCase, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-600">
                              <BoltIcon className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                              {useCase}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Key Features:</h4>
                      <ul className="space-y-2">
                        {solution.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Business Benefits:</h4>
                      <ul className="space-y-2 mb-6">
                        {solution.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <SparklesIcon className="w-4 h-4 text-secondary-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/contact"
                        className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                      >
                        <span>Get Started</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance Standards */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Compliance & Security Standards
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                We ensure your financial software meets all regulatory requirements 
                and industry security standards.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {complianceStandards.map((standard, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-8 text-center hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <ShieldCheckIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {standard.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {standard.description}
                  </p>
                  <ul className="space-y-2">
                    {standard.requirements.map((req, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        <CheckIcon className="w-4 h-4 text-green-500 inline mr-1" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Financial Success Stories
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Real financial institutions achieving exceptional results 
                with our custom fintech solutions.
              </motion.p>
            </div>

            <div className="space-y-12">
              {caseStudies.map((study, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-sm"
                >
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                          {study.type}
                        </div>
                        <div className="text-sm text-gray-600">{study.timeline}</div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{study.title}</h3>
                      <div className="mb-4">
                        <div className="text-lg font-medium text-gray-700 mb-2">{study.client}</div>
                      </div>
                      <div className="space-y-4 mb-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Challenge:</h4>
                          <p className="text-gray-600">{study.challenge}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Solution:</h4>
                          <p className="text-gray-600">{study.solution}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <p className="text-gray-700 italic mb-4">"{study.testimonial.quote}"</p>
                        <div>
                          <div className="font-semibold text-gray-900">{study.testimonial.author}</div>
                          <div className="text-sm text-gray-600">{study.testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Results Achieved:</h4>
                      <div className="space-y-4 mb-6">
                        {Object.entries(study.results).map(([key, value], idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <div className="text-lg font-bold text-primary-600 mb-1">{value}</div>
                            <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Technologies:</h5>
                        <div className="flex flex-wrap gap-2">
                          {study.technologies.map((tech, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Development Process */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Financial Development Process
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                A security-first approach that ensures compliance and performance 
                at every stage of financial software development.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {developmentProcess.map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-8"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {phase.phase}
                    </h3>
                    <div className="text-sm text-gray-600 font-medium">
                      {phase.duration}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6">
                    {phase.description}
                  </p>
                  <ul className="space-y-2">
                    {phase.activities.slice(0, 4).map((activity, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technologies */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Financial Technology Stack
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Enterprise-grade technologies trusted by financial institutions worldwide.
              </motion.p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
              {technologies.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-3xl mb-2">{tech.icon}</div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{tech.name}</h4>
                  <p className="text-xs text-gray-600">{tech.category}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                What Financial Leaders Say
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Trusted by financial institutions to deliver secure, 
                compliant, and innovative fintech solutions.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-8"
                >
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    "{testimonial.comment}"
                  </p>
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-primary-600">
                      {testimonial.results}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                      <p className="text-gray-500 text-sm">{testimonial.organization}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready to Build Your Financial Solution?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Let's create secure, compliant financial technology that transforms 
                your business and delights your customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <span>Schedule Fintech Consultation</span>
                  <PhoneIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/case-studies?industry=finance"
                  className="inline-flex items-center justify-center space-x-2 bg-primary-700 text-white px-8 py-4 rounded-lg hover:bg-primary-800 transition-all font-semibold border border-primary-500"
                >
                  <span>View Finance Case Studies</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </MainLayout>
    </>
  );
}