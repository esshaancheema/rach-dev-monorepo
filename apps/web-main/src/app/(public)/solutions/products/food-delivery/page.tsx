import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  BuildingStorefrontIcon,
  TruckIcon,
  CreditCardIcon,
  MapPinIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'Food Delivery & Restaurant Management Platform | Complete Multi-Vendor Solution | Zoptal',
  description: 'Launch your own Uber Eats-style food delivery platform in 45-90 days. Complete restaurant ecosystem with multi-vendor marketplace, real-time tracking, and driver management. Investment from $15K-40K.',
  keywords: [
    'food delivery platform',
    'restaurant management system',
    'multi-vendor food delivery',
    'online food ordering',
    'delivery app development',
    'restaurant marketplace',
    'food delivery app',
    'uber eats clone',
    'grubhub alternative',
    'restaurant ecosystem',
    'delivery management system',
    'food ordering platform'
  ],
  openGraph: {
    title: 'Food Delivery & Restaurant Management Platform | Zoptal',
    description: 'Launch your own Uber Eats-style food delivery platform in 45-90 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: BuildingStorefrontIcon,
    title: 'Multi-Vendor Restaurant Management',
    description: 'Complete restaurant onboarding, menu management, order processing, and performance analytics for unlimited restaurants.'
  },
  {
    icon: TruckIcon,
    title: 'Real-Time Order Tracking',
    description: 'Live GPS tracking for customers and restaurants with automated notifications and delivery status updates.'
  },
  {
    icon: CreditCardIcon,
    title: 'Integrated Payment Processing',
    description: 'Secure payment gateway with automatic commission splits, driver payouts, and multi-currency support.'
  },
  {
    icon: MapPinIcon,
    title: 'Smart Delivery Management',
    description: 'Intelligent driver assignment, route optimization, and delivery zone management for efficient operations.'
  }
];

const platformComponents = [
  {
    title: 'Customer Mobile App',
    description: 'iOS & Android apps for food ordering',
    features: [
      'Restaurant discovery & search',
      'Menu browsing with images',
      'Real-time order tracking',
      'Multiple payment methods',
      'Reviews & ratings',
      'Order history & favorites'
    ]
  },
  {
    title: 'Restaurant Dashboard',
    description: 'Web portal for restaurant partners',
    features: [
      'Menu & pricing management',
      'Order management system',
      'Analytics & reports',
      'Promotional tools',
      'Staff management',
      'Revenue tracking'
    ]
  },
  {
    title: 'Driver Mobile App',
    description: 'Dedicated app for delivery drivers',
    features: [
      'Order acceptance & management',
      'GPS navigation & routing',
      'Earnings tracking',
      'Delivery proof capture',
      'Customer communication',
      'Performance metrics'
    ]
  },
  {
    title: 'Admin Panel',
    description: 'Central management dashboard',
    features: [
      'Restaurant approval & management',
      'Driver onboarding & tracking',
      'Commission management',
      'Dispute resolution',
      'Analytics & insights',
      'Content management'
    ]
  }
];

const keyFeatures = [
  'Multi-restaurant marketplace',
  'Real-time GPS tracking',
  'Automated order dispatch',
  'Dynamic pricing & promotions',
  'Customer loyalty programs',
  'Restaurant analytics dashboard',
  'Driver performance tracking',
  'Multi-language support',
  'Push notifications',
  'Payment gateway integration',
  'Review & rating system',
  'Order scheduling'
];

const technologies = [
  'React Native', 'Node.js', 'MongoDB', 'Redis', 'Socket.io', 'Google Maps API',
  'Stripe/PayPal', 'Firebase', 'AWS/Azure', 'Docker', 'Kubernetes', 'GraphQL'
];

const implementationPhases = [
  {
    phase: 1,
    title: 'Platform Setup & Branding',
    description: 'Deploy core platform infrastructure, configure branding, and set up basic restaurant onboarding.',
    duration: '1-2 weeks',
    deliverables: ['Platform deployment', 'Brand customization', 'Admin panel setup', 'Basic configuration']
  },
  {
    phase: 2,
    title: 'Feature Development & Integration',
    description: 'Develop mobile apps, integrate payment systems, and implement advanced delivery features.',
    duration: '6-8 weeks',
    deliverables: ['Mobile apps (iOS/Android)', 'Payment integration', 'GPS tracking system', 'Notification system']
  },
  {
    phase: 3,
    title: 'Testing & Partner Onboarding',
    description: 'Comprehensive testing, restaurant partner onboarding, and driver recruitment.',
    duration: '2-3 weeks',
    deliverables: ['Platform testing', 'Restaurant onboarding', 'Driver training', 'Quality assurance']
  },
  {
    phase: 4,
    title: 'Launch & Growth Support',
    description: 'Platform launch with marketing campaigns, performance monitoring, and ongoing optimization.',
    duration: 'Ongoing',
    deliverables: ['Platform launch', 'Marketing support', 'Performance monitoring', '6 months support']
  }
];

const pricingTiers = [
  {
    name: 'Starter Platform',
    price: '$15,000',
    description: 'Perfect for launching in a single city or region',
    features: [
      'Up to 50 restaurants',
      'Basic delivery features',
      'Customer & driver apps',
      'Standard payment gateway',
      'Basic analytics',
      'Email support',
      '3 months maintenance'
    ],
    highlight: false,
    launch: '45-60 days'
  },
  {
    name: 'Professional Platform',
    price: '$25,000',
    description: 'Complete solution with advanced features for scaling',
    features: [
      'Unlimited restaurants',
      'Advanced delivery management',
      'Multi-city support',
      'Advanced analytics & reports',
      'Marketing tools',
      'Priority support',
      '6 months maintenance'
    ],
    highlight: true,
    launch: '60-75 days'
  },
  {
    name: 'Enterprise Platform',
    price: '$40,000+',
    description: 'Large-scale platform with custom integrations and white-label options',
    features: [
      'Multi-country support',
      'Custom feature development',
      'Enterprise integrations',
      'White-label solution',
      'Dedicated account manager',
      'Premium support',
      '12 months maintenance'
    ],
    highlight: false,
    launch: '75-90 days'
  }
];

const marketOpportunities = [
  {
    market: 'Local Food Delivery',
    opportunity: '$50B+ global market',
    growth: '15% annual growth rate'
  },
  {
    market: 'Ghost Kitchens',
    opportunity: '$1B+ emerging market',
    growth: '50% annual growth rate'
  },
  {
    market: 'Corporate Catering',
    opportunity: '$20B+ market segment',
    growth: '20% annual growth rate'
  }
];

const successMetrics = [
  {
    metric: 'Average Order Value',
    benchmark: '$25-45',
    description: 'Typical customer order size'
  },
  {
    metric: 'Commission Rate',
    benchmark: '15-30%',
    description: 'Platform revenue per order'
  },
  {
    metric: 'Customer Retention',
    benchmark: '60-80%',
    description: 'Monthly active users'
  },
  {
    metric: 'Break-even Timeline',
    benchmark: '8-18 months',
    description: 'Time to profitability'
  }
];

export default function FoodDeliveryPlatformPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-600/20 backdrop-blur-sm text-orange-200 text-sm font-medium mb-6">
                <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
                Food Delivery & Restaurant Management
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Launch Your Own
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent block">
                  Food Delivery Empire
                </span>
              </h1>
              
              <p className="text-xl text-orange-100 mb-8 leading-relaxed">
                Complete restaurant ecosystem with multi-vendor marketplace, real-time order 
                tracking, payment processing, and driver management. Build the next Uber Eats 
                for your market in just 45-90 days.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">45-90 days</div>
                  <div className="text-orange-200 text-sm">Launch Timeline</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">$15K-40K</div>
                  <div className="text-orange-200 text-sm">Investment Range</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
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
            
            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                <OptimizedImage
                  src="/images/solutions/food-delivery-platform.webp"
                  alt="Food Delivery & Restaurant Management Platform"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Restaurant Ecosystem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything needed to connect restaurants, customers, and drivers in a seamless platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-orange-600 group-hover:text-white transition-colors" />
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
              Complete Platform Components
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four interconnected applications serving all stakeholders
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
                      <CheckIcon className="h-4 w-4 text-orange-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Feature Set
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              All essential features for running a successful food delivery platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="flex items-center bg-gray-50 rounded-lg p-4">
                <CheckIcon className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Modern Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with proven technologies for scalability and performance
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-full hover:bg-orange-100 hover:text-orange-800 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Implementation Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proven 4-phase approach to launch your food delivery platform successfully
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {implementationPhases.map((phase, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {phase.phase}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{phase.title}</h3>
                  <div className="flex items-center text-sm text-orange-600 font-medium mb-4">
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
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-orange-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Massive Market Opportunity
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tap into the rapidly growing food delivery and restaurant technology market
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {marketOpportunities.map((market, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{market.market}</h3>
                <div className="text-3xl font-bold text-orange-600 mb-2">{market.opportunity}</div>
                <div className="text-green-600 font-semibold">{market.growth}</div>
              </div>
            ))}
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {successMetrics.map((metric, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">{metric.benchmark}</div>
                <div className="font-semibold text-gray-900 mb-2">{metric.metric}</div>
                <div className="text-sm text-gray-600">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Platform Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right package for your food delivery platform vision
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${tier.highlight ? 'ring-2 ring-orange-500 scale-105' : ''}`}>
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-orange-600 mb-2">{tier.price}</div>
                  <div className="text-sm text-gray-500 mb-4">Launch in {tier.launch}</div>
                  <p className="text-gray-600">{tier.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    tier.highlight 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
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
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Dominate Food Delivery?
          </h2>
          
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join successful food delivery entrepreneurs who chose Zoptal for their platform. 
            Complete restaurant ecosystem from setup to success - we handle the technology, you focus on growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Platform Project
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/solutions/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-orange-700 text-white font-semibold rounded-lg hover:bg-orange-800 transition-colors"
            >
              Explore Other Solutions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}