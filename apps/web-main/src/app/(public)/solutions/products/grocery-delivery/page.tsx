import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShoppingBagIcon,
  ClockIcon,
  UserIcon,
  TruckIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ArchiveBoxIcon,
  FireIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import GroceryDeliveryHeroImage from '@/components/GroceryDeliveryHeroImage';

export const metadata: Metadata = {
  title: 'Grocery & Hyperlocal Delivery Platform | On-Demand Grocery Shopping | Zoptal',
  description: 'Launch your own Instacart-style grocery delivery platform in 45-90 days. On-demand grocery ordering with real-time inventory, cold chain logistics, personal shopping, and subscription boxes. Investment from $25K-75K.',
  keywords: [
    'grocery delivery platform',
    'hyperlocal delivery system',
    'on-demand grocery app',
    'instacart clone',
    'grocery marketplace',
    'fresh delivery platform',
    'subscription grocery service',
    'multi-store grocery platform',
    'personal shopping app',
    'cold chain logistics',
    'grocery ordering system',
    'hyperlocal marketplace'
  ],
  openGraph: {
    title: 'Grocery & Hyperlocal Delivery Platform | Zoptal',
    description: 'Launch your own Instacart-style grocery delivery platform in 45-90 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: ArchiveBoxIcon,
    title: 'Real-Time Inventory Management',
    description: 'Live stock tracking across multiple stores with automatic updates, low-stock alerts, and seamless inventory synchronization.'
  },
  {
    icon: FireIcon,
    title: 'Cold Chain & Fresh Delivery',
    description: 'Temperature-controlled logistics for perishables with quality assurance and specialized handling for fresh produce.'
  },
  {
    icon: UserIcon,
    title: 'Personal Shopping Service',
    description: 'Professional personal shoppers with quality guarantee, item substitution approval, and direct customer communication.'
  },
  {
    icon: ClockIcon,
    title: 'Subscription & Recurring Orders',
    description: 'Weekly/monthly grocery subscriptions with smart reordering, customizable delivery schedules, and family meal planning.'
  }
];

const platformComponents = [
  {
    title: 'Customer Mobile App',
    description: 'iOS & Android apps for grocery shopping',
    features: [
      'Category-based product browsing',
      'Real-time price & availability',
      'Scheduled delivery slots',
      'Subscription management',
      'Personal shopper chat',
      'Order tracking & notifications'
    ]
  },
  {
    title: 'Store Partner Dashboard',
    description: 'Web portal for grocery store partners',
    features: [
      'Real-time inventory management',
      'Order processing & fulfillment',
      'Analytics & sales reports',
      'Promotional campaign tools',
      'Staff & shopper coordination',
      'Revenue tracking & payouts'
    ]
  },
  {
    title: 'Personal Shopper App',
    description: 'Dedicated app for personal shoppers',
    features: [
      'Order assignment & picking',
      'Quality control guidelines',
      'Customer communication tools',
      'Substitution approval system',
      'Earnings & performance tracking',
      'Route optimization'
    ]
  },
  {
    title: 'Admin Management Panel',
    description: 'Central platform administration',
    features: [
      'Multi-store management',
      'Shopper onboarding & training',
      'Logistics coordination',
      'Customer support tools',
      'Platform analytics & insights',
      'Commission management'
    ]
  }
];

const comprehensiveFeatures = [
  'Multi-store marketplace',
  'Category-based browsing',
  'Real-time inventory sync',
  'Scheduled delivery slots',
  'Fresh produce guarantee',
  'Subscription management',
  'Personal shopper assignment',
  'Cold chain tracking',
  'Multi-payment options',
  'Loyalty & rewards program',
  'Promotional campaigns',
  'Advanced search & filters',
  'Order history & reordering',
  'Family sharing accounts',
  'Nutritional information',
  'Recipe recommendations'
];

const technologies = [
  'React Native', 'Node.js', 'MongoDB', 'Redis', 'Socket.io', 'Google Maps API',
  'Stripe/PayPal', 'Firebase', 'AWS/Azure', 'Elasticsearch', 'Docker', 'GraphQL'
];

const implementationPhases = [
  {
    phase: 1,
    title: 'Platform Setup & Store Integration',
    description: 'Deploy core platform, integrate with store inventory systems, and configure basic grocery categories.',
    duration: '1-2 weeks',
    deliverables: ['Platform deployment', 'Store integrations', 'Inventory sync setup', 'Category configuration']
  },
  {
    phase: 2,
    title: 'Mobile Apps & Logistics Development',
    description: 'Develop customer and shopper mobile apps, implement delivery logistics, and cold chain tracking.',
    duration: '6-8 weeks',
    deliverables: ['Mobile apps (iOS/Android)', 'Logistics system', 'Personal shopper features', 'Cold chain tracking']
  },
  {
    phase: 3,
    title: 'Testing & Partner Onboarding',
    description: 'Comprehensive testing of all features, onboard grocery store partners, and train personal shoppers.',
    duration: '2-3 weeks',
    deliverables: ['End-to-end testing', 'Store partner onboarding', 'Shopper training', 'Quality assurance']
  },
  {
    phase: 4,
    title: 'Launch & Growth Support',
    description: 'Platform launch with customer acquisition campaigns, performance monitoring, and continuous optimization.',
    duration: 'Ongoing',
    deliverables: ['Platform launch', 'Customer acquisition', 'Performance monitoring', '6 months support']
  }
];

const pricingTiers = [
  {
    name: 'Local Grocery Platform',
    price: '$25,000',
    description: 'Perfect for launching in a single city or region',
    features: [
      'Up to 10 store partners',
      'Basic grocery features',
      'Customer & shopper apps',
      'Standard delivery options',
      'Basic inventory sync',
      'Email support',
      '3 months maintenance'
    ],
    highlight: false,
    launch: '45-60 days'
  },
  {
    name: 'Multi-Store Platform',
    price: '$45,000',
    description: 'Complete solution with advanced features for scaling',
    features: [
      'Unlimited store partners',
      'Advanced inventory management',
      'Subscription services',
      'Personal shopper network',
      'Cold chain logistics',
      'Advanced analytics',
      'Priority support',
      '6 months maintenance'
    ],
    highlight: true,
    launch: '60-75 days'
  },
  {
    name: 'Enterprise Grocery Network',
    price: '$75,000+',
    description: 'Large-scale platform with custom integrations and multi-region support',
    features: [
      'Multi-region deployment',
      'Custom feature development',
      'Enterprise store integrations',
      'Advanced logistics optimization',
      'White-label solution',
      'Dedicated account manager',
      'Premium support',
      '12 months maintenance'
    ],
    highlight: false,
    launch: '75-90 days'
  }
];

const marketOpportunity = [
  {
    market: 'Global Grocery Market',
    size: '$300B+',
    growth: '8% annual growth'
  },
  {
    market: 'Online Grocery',
    size: '$75B+',
    growth: '25% annual growth'
  },
  {
    market: 'Hyperlocal Delivery',
    size: '$15B+',
    growth: '35% annual growth'
  }
];

const successMetrics = [
  {
    metric: 'Average Order Value',
    benchmark: '$45-85',
    description: 'Typical grocery order size'
  },
  {
    metric: 'Commission Rate',
    benchmark: '8-15%',
    description: 'Platform revenue per order'
  },
  {
    metric: 'Customer Retention',
    benchmark: '70-85%',
    description: 'Monthly repeat customers'
  },
  {
    metric: 'Shopper Efficiency',
    benchmark: '15-25 items/hour',
    description: 'Personal shopper productivity'
  }
];

const uniqueAdvantages = [
  {
    title: 'Fresh Produce Expertise',
    description: 'Specialized handling for fruits, vegetables, and perishables with quality guarantee'
  },
  {
    title: 'Family-Focused Features',
    description: 'Shared family accounts, meal planning, and nutritional tracking for healthier shopping'
  },
  {
    title: 'Hyperlocal Optimization',
    description: 'Neighborhood-specific inventory, local store partnerships, and community-focused features'
  },
  {
    title: 'Sustainable Delivery',
    description: 'Eco-friendly packaging options, carbon footprint tracking, and local sourcing priority'
  }
];

export default function GroceryDeliveryPlatformPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-teal-900 to-emerald-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-600/20 backdrop-blur-sm text-green-200 text-sm font-medium mb-6">
                <ShoppingBagIcon className="h-4 w-4 mr-2" />
                Grocery & Hyperlocal Delivery Platform
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Launch Your Own
                <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent block">
                  Instacart-Style Platform
                </span>
              </h1>
              
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                On-demand grocery ordering with real-time inventory, cold chain logistics, 
                personal shopping services, and subscription boxes. Connect customers with 
                fresh groceries from multiple stores in your area.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">45-90 days</div>
                  <div className="text-green-200 text-sm">Launch Timeline</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">$25K-75K</div>
                  <div className="text-green-200 text-sm">Investment Range</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Your Platform
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="#demo"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Live Demo
                </Link>
              </div>
            </div>
            
            <GroceryDeliveryHeroImage />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Grocery Ecosystem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything needed to connect customers, stores, and personal shoppers in a seamless grocery delivery experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Components */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Multi-Stakeholder Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four specialized applications serving customers, stores, shoppers, and administrators
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {platformComponents.map((component, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{component.title}</h3>
                <p className="text-gray-600 mb-6">{component.description}</p>
                <div className="grid grid-cols-1 gap-3">
                  {component.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Advantages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Grocery Delivery is Different
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialized features designed specifically for grocery shopping and fresh produce delivery
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {uniqueAdvantages.map((advantage, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{advantage.title}</h3>
                <p className="text-gray-600">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Feature Set
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything needed for a successful grocery delivery platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {comprehensiveFeatures.map((feature, index) => (
              <div key={index} className="flex items-center bg-white rounded-lg p-4">
                <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Advanced Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with modern technologies optimized for inventory management and real-time operations
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-full hover:bg-green-100 hover:text-green-800 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Implementation Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Structured 4-phase approach to launch your grocery delivery platform successfully
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {implementationPhases.map((phase, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {phase.phase}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{phase.title}</h3>
                  <div className="flex items-center text-sm text-green-600 font-medium mb-4">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {phase.duration}
                  </div>
                  <p className="text-gray-600 mb-4">{phase.description}</p>
                  <div className="space-y-2">
                    {phase.deliverables.map((deliverable, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-500">
                        <CheckIcon className="h-3 w-3 text-green-500 mr-2" />
                        {deliverable}
                      </div>
                    ))}
                  </div>
                </div>
                {index < implementationPhases.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-green-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Massive Market Opportunity
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tap into the rapidly growing grocery delivery and hyperlocal commerce market
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {marketOpportunity.map((market, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{market.market}</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">{market.size}</div>
                <div className="text-green-600 font-semibold">{market.growth}</div>
              </div>
            ))}
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {successMetrics.map((metric, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">{metric.benchmark}</div>
                <div className="font-semibold text-gray-900 mb-2">{metric.metric}</div>
                <div className="text-sm text-gray-600">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Grocery Platform Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right package for your grocery delivery platform vision
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${tier.highlight ? 'ring-2 ring-green-500 scale-105' : ''}`}>
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-green-600 mb-2">{tier.price}</div>
                  <div className="text-sm text-gray-500 mb-4">Launch in {tier.launch}</div>
                  <p className="text-gray-600">{tier.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    tier.highlight 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Grocery Shopping?
          </h2>
          
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join successful grocery delivery entrepreneurs who chose Zoptal for their platform. 
            Complete hyperlocal ecosystem from fresh produce to family subscriptions - we handle the technology, you focus on serving your community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Platform Project
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/solutions/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors"
            >
              Explore Other Solutions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}