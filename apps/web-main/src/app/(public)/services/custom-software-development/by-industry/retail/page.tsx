import { Metadata } from 'next';
import { motion } from 'framer-motion';
import { 
  ShoppingBagIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  TruckIcon,
  CheckIcon,
  StarIcon,
  BoltIcon,
  UserGroupIcon,
  PhoneIcon,
  SparklesIcon,
  ArrowRightIcon,
  EyeIcon,
  ClockIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { SEOHead } from '@/components/seo';
import { generateServiceSchema, combineSchemas, ZOPTAL_ORGANIZATION_SCHEMA } from '@/lib/seo/schemas';
import { getKeywordsForIndustry } from '@/lib/seo/keywords';

export const metadata: Metadata = {
  title: 'Retail Software Development | E-commerce Solutions | Zoptal',
  description: 'Custom retail software development services. Build e-commerce platforms, POS systems, inventory management, and omnichannel retail solutions that drive sales and customer engagement.',
  keywords: [
    'retail software development',
    'e-commerce development',
    'online store development',
    'POS system development',
    'inventory management software',
    'retail technology solutions',
    'omnichannel retail',
    'shopping cart development',
    'retail analytics platform',
    'customer loyalty software'
  ]
};

const retailFeatures = [
  {
    icon: ShoppingCartIcon,
    title: 'E-commerce Excellence',
    description: 'Advanced online shopping experiences that convert visitors to customers',
    details: [
      'Product catalog management',
      'Advanced search & filtering',
      'Personalized recommendations',
      'Shopping cart optimization',
      'Checkout flow optimization',
      'Mobile commerce ready'
    ]
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Omnichannel Integration',
    description: 'Seamless experience across all customer touchpoints',
    details: [
      'Online-to-offline integration',
      'Mobile app connectivity',
      'Social commerce integration',
      'In-store pickup options',
      'Cross-channel inventory',
      'Unified customer profiles'
    ]
  },
  {
    icon: ChartBarIcon,
    title: 'Retail Analytics',
    description: 'Data-driven insights for better business decisions',
    details: [
      'Sales performance tracking',
      'Customer behavior analysis',
      'Inventory optimization',
      'Demand forecasting',
      'Price optimization',
      'ROI measurement'
    ]
  },
  {
    icon: CpuChipIcon,
    title: 'AI-Powered Features',
    description: 'Intelligent automation for enhanced retail operations',
    details: [
      'Personalized product recommendations',
      'Dynamic pricing algorithms',
      'Inventory demand prediction',
      'Customer sentiment analysis',
      'Fraud detection systems',
      'Chatbot customer service'
    ]
  }
];

const solutionTypes = [
  {
    id: 'ecommerce-platforms',
    title: 'E-commerce Platforms',
    description: 'Complete online retail solutions for digital commerce',
    icon: GlobeAltIcon,
    features: [
      'Responsive web design',
      'Product catalog management',
      'Shopping cart & checkout',
      'Payment gateway integration',
      'Order management system',
      'Customer account portal',
      'SEO optimization',
      'Analytics integration'
    ],
    benefits: [
      'Increased online sales',
      'Better customer experience',
      'Reduced cart abandonment',
      'Improved search rankings',
      'Scalable infrastructure',
      'Mobile optimization'
    ],
    useCases: [
      'Fashion retailers',
      'Electronics stores',
      'Home & garden',
      'Beauty & cosmetics',
      'Sports & outdoors'
    ]
  },
  {
    id: 'pos-systems',
    title: 'Point of Sale (POS) Systems',
    description: 'Modern POS solutions for in-store retail operations',
    icon: BuildingStorefrontIcon,
    features: [
      'Touch screen interface',
      'Barcode scanning',
      'Payment processing',
      'Inventory tracking',
      'Staff management',
      'Receipt customization',
      'Offline mode capability',
      'Multi-store support'
    ],
    benefits: [
      'Faster checkout process',
      'Real-time inventory updates',
      'Improved accuracy',
      'Better staff productivity',
      'Enhanced reporting',
      'Customer satisfaction'
    ],
    useCases: [
      'Retail stores',
      'Restaurants',
      'Grocery stores',
      'Specialty shops',
      'Pop-up stores'
    ]
  },
  {
    id: 'inventory-management',
    title: 'Inventory Management Systems',
    description: 'Smart inventory tracking and optimization solutions',
    icon: TruckIcon,
    features: [
      'Real-time stock tracking',
      'Automated reordering',
      'Warehouse management',
      'Supplier integration',
      'Barcode/RFID support',
      'Multi-location inventory',
      'Demand forecasting',
      'Low stock alerts'
    ],
    benefits: [
      'Reduced stockouts',
      'Optimized inventory levels',
      'Lower carrying costs',
      'Improved cash flow',
      'Better supplier relationships',
      'Accurate reporting'
    ],
    useCases: [
      'Multi-location retailers',
      'Wholesalers',
      'Distributors',
      'Manufacturing',
      'E-commerce businesses'
    ]
  },
  {
    id: 'customer-loyalty',
    title: 'Customer Loyalty Programs',
    description: 'Comprehensive loyalty and rewards management systems',
    icon: UserGroupIcon,
    features: [
      'Points-based rewards',
      'Tiered membership levels',
      'Personalized offers',
      'Mobile app integration',
      'Social sharing features',
      'Referral programs',
      'Analytics dashboard',
      'Email automation'
    ],
    benefits: [
      'Increased customer retention',
      'Higher average order value',
      'Better customer data',
      'Improved engagement',
      'Word-of-mouth marketing',
      'Competitive advantage'
    ],
    useCases: [
      'Retail chains',
      'Restaurants',
      'Beauty salons',
      'Fitness centers',
      'Online stores'
    ]
  }
];

const caseStudies = [
  {
    title: 'Omnichannel Fashion Platform',
    client: 'StyleHub Retail',
    type: 'E-commerce & Mobile',
    challenge: 'Create unified shopping experience across web, mobile, and 50+ physical stores',
    solution: 'Omnichannel platform with real-time inventory, mobile app, and in-store integration',
    results: {
      sales: '180% online sales increase',
      conversion: '45% mobile conversion boost',
      satisfaction: '92% customer satisfaction',
      integration: '100% store integration'
    },
    technologies: ['React', 'React Native', 'Node.js', 'MongoDB', 'Stripe', 'AWS'],
    timeline: '8 months',
    testimonial: {
      quote: 'Zoptal transformed our retail operations. Customers can now seamlessly shop across all our channels with a unified experience.',
      author: 'Emma Davis',
      role: 'Chief Digital Officer'
    }
  },
  {
    title: 'AI-Powered Grocery Platform',
    client: 'FreshMart Supermarkets',
    type: 'E-commerce & AI',
    challenge: 'Build online grocery platform with AI recommendations and delivery optimization',
    solution: 'Smart e-commerce platform with AI-driven recommendations and route optimization',
    results: {
      orders: '500K+ monthly orders',
      accuracy: '98% recommendation accuracy',
      delivery: '30% faster deliveries',
      retention: '75% customer retention'
    },
    technologies: ['Vue.js', 'Python', 'TensorFlow', 'PostgreSQL', 'Redis', 'Google Cloud'],
    timeline: '12 months',
    testimonial: {
      quote: 'The AI recommendations have significantly improved our customer experience and increased basket sizes.',
      author: 'Marcus Johnson',
      role: 'VP of Technology'
    }
  },
  {
    title: 'Multi-Store POS System',
    client: 'RetailMax Chain',
    type: 'POS & Inventory',
    challenge: 'Modernize POS systems across 200+ stores with real-time inventory sync',
    solution: 'Cloud-based POS system with centralized inventory management and analytics',
    results: {
      efficiency: '60% faster checkout',
      accuracy: '99.5% inventory accuracy',
      insights: 'Real-time business insights',
      deployment: '200+ stores deployed'
    },
    technologies: ['Angular', 'Java', 'Spring Boot', 'MySQL', 'Azure', 'Docker'],
    timeline: '10 months',
    testimonial: {
      quote: 'The new POS system has revolutionized our operations and given us unprecedented visibility into our business.',
      author: 'Sarah Kim',
      role: 'Operations Director'
    }
  }
];

const developmentProcess = [
  {
    phase: 'Retail Strategy & Analysis',
    duration: '1-2 weeks',
    description: 'Understanding retail business model and customer journey',
    activities: [
      'Business model analysis',
      'Customer journey mapping',
      'Competitive research',
      'Technology assessment',
      'Integration planning',
      'Success metrics definition'
    ]
  },
  {
    phase: 'UX Design & Architecture',
    duration: '2-4 weeks',
    description: 'Creating optimal shopping experiences and system design',
    activities: [
      'User experience design',
      'Customer flow optimization',
      'System architecture',
      'Database design',
      'API planning',
      'Mobile-first approach'
    ]
  },
  {
    phase: 'Development & Integration',
    duration: '8-20 weeks',
    description: 'Building and integrating retail systems',
    activities: [
      'Frontend development',
      'Backend development',
      'Payment integration',
      'Inventory system integration',
      'Third-party API integration',
      'Testing & optimization'
    ]
  },
  {
    phase: 'Launch & Optimization',
    duration: '1-2 weeks',
    description: 'Going live and continuous improvement',
    activities: [
      'Production deployment',
      'Staff training',
      'Performance monitoring',
      'A/B testing setup',
      'Analytics configuration',
      'Ongoing optimization'
    ]
  }
];

const integrations = [
  { name: 'Shopify', category: 'E-commerce', icon: '🛍️' },
  { name: 'Stripe', category: 'Payments', icon: '💳' },
  { name: 'Salesforce', category: 'CRM', icon: '👥' },
  { name: 'Mailchimp', category: 'Marketing', icon: '📧' },
  { name: 'Square', category: 'POS', icon: '📱' },
  { name: 'QuickBooks', category: 'Accounting', icon: '📊' },
  { name: 'Zendesk', category: 'Support', icon: '🎧' },
  { name: 'Google Analytics', category: 'Analytics', icon: '📈' }
];

const testimonials = [
  {
    name: 'Jennifer Rodriguez',
    role: 'CEO',
    organization: 'Urban Fashion Co',
    rating: 5,
    comment: 'Zoptal built us an amazing e-commerce platform that increased our online sales by 200%. The mobile experience is exceptional.',
    results: '200% online sales increase'
  },
  {
    name: 'Michael Thompson',
    role: 'IT Director',
    organization: 'TechGear Retail',
    rating: 5,
    comment: 'Their inventory management system gave us real-time visibility across all our locations. Game-changing technology.',
    results: '99% inventory accuracy achieved'
  },
  {
    name: 'Lisa Chen',
    role: 'Digital Marketing Manager',
    organization: 'Beauty Boutique',
    rating: 5,
    comment: 'The customer loyalty program they developed has significantly improved our customer retention and engagement.',
    results: '85% customer retention rate'
  }
];

export default function RetailServicesPage() {
  const industryKeywords = getKeywordsForIndustry('retail');
  
  const structuredData = combineSchemas(
    ZOPTAL_ORGANIZATION_SCHEMA,
    generateServiceSchema({
      name: 'Retail Software Development Services',
      description: 'Custom retail software development including e-commerce platforms, POS systems, inventory management, and omnichannel retail solutions.',
      url: 'https://zoptal.com/services/custom-software-development/by-industry/retail',
      serviceType: 'Retail Software Development',
      provider: {
        name: 'Zoptal',
        url: 'https://zoptal.com'
      },
      areaServed: ['United States', 'Canada', 'United Kingdom', 'Australia'],
      offers: {
        price: '40000',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      aggregateRating: {
        ratingValue: 4.9,
        reviewCount: 124
      }
    })
  );

  return (
    <>
      <SEOHead
        title="Retail Software Development | E-commerce Solutions | Zoptal"
        description="Custom retail software development services. Build e-commerce platforms, POS systems, inventory management, and omnichannel retail solutions that drive sales and customer engagement."
        canonicalUrl="https://zoptal.com/services/custom-software-development/by-industry/retail"
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
                <li className="text-gray-900">Retail</li>
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
                  <ShoppingBagIcon className="w-4 h-4" />
                  <span>Retail Solutions</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
                >
                  Retail Software Development
                  <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    Omnichannel Excellence
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl text-gray-600 mb-8"
                >
                  Transform your retail business with cutting-edge e-commerce platforms, POS systems, 
                  and omnichannel solutions that drive sales and enhance customer experience.
                </motion.p>

                {/* Key Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-3 gap-6 mb-8"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">300+</div>
                    <div className="text-gray-600 text-sm">Retail Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">180%</div>
                    <div className="text-gray-600 text-sm">Avg Sales Increase</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">98%</div>
                    <div className="text-gray-600 text-sm">Customer Satisfaction</div>
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
                    <span>Build Retail Solution</span>
                    <ShoppingCartIcon className="w-5 h-5" />
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
                    <ShoppingBagIcon className="w-20 h-20 text-primary-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900">Retail Innovation</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <GlobeAltIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">E-commerce</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <BuildingStorefrontIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">POS Systems</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <TruckIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Inventory</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <DevicePhoneMobileIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Mobile Apps</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Retail Features */}
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
                Advanced Retail Features
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Built with modern retail best practices to maximize sales, 
                improve customer experience, and streamline operations.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {retailFeatures.map((feature, index) => (
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

        {/* Retail Solutions */}
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
                Retail Software Solutions
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Comprehensive retail technology solutions designed to boost sales, 
                improve efficiency, and create exceptional customer experiences.
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

        {/* Integrations */}
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
                Retail Technology Integrations
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Seamlessly integrate with your existing retail tools and platforms.
              </motion.p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
              {integrations.map((integration, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-3xl mb-2">{integration.icon}</div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{integration.name}</h4>
                  <p className="text-xs text-gray-600">{integration.category}</p>
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
                Retail Success Stories
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Real retail businesses achieving exceptional results 
                with our custom software solutions.
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
                Retail Development Process
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                A customer-focused approach that ensures your retail solution 
                drives sales and delivers exceptional user experiences.
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

        {/* Testimonials */}
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
                What Retail Leaders Say
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Trusted by retail businesses to deliver solutions that drive growth and customer satisfaction.
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
                Ready to Transform Your Retail Business?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Let's build retail technology that drives sales, improves customer experience, 
                and gives you a competitive edge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <span>Schedule Retail Consultation</span>
                  <PhoneIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/case-studies?industry=retail"
                  className="inline-flex items-center justify-center space-x-2 bg-primary-700 text-white px-8 py-4 rounded-lg hover:bg-primary-800 transition-all font-semibold border border-primary-500"
                >
                  <span>View Retail Case Studies</span>
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