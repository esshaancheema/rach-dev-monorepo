import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShoppingCartIcon,
  CreditCardIcon,
  ChartBarIcon,
  CogIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ClockIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'Multivendor E-Commerce Platform | Complete Marketplace Solution | Zoptal',
  description: 'Launch your own Amazon-style multivendor e-commerce marketplace in 30-90 days. Complete solution with vendor management, payments, analytics, and mobile apps. Investment from $20K-75K.',
  keywords: [
    'multivendor e-commerce platform',
    'marketplace solution',
    'e-commerce development',
    'online marketplace',
    'vendor management system',
    'multi-vendor store',
    'e-commerce marketplace',
    'amazon clone',
    'marketplace development',
    'turnkey e-commerce solution',
    'complete marketplace platform',
    'e-commerce enterprise solution'
  ],
  openGraph: {
    title: 'Multivendor E-Commerce Platform | Zoptal',
    description: 'Launch your own Amazon-style multivendor e-commerce marketplace in 30-90 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: ShoppingCartIcon,
    title: 'Complete Marketplace Engine',
    description: 'Full-featured multivendor marketplace with product catalog, inventory management, and order processing.'
  },
  {
    icon: CreditCardIcon,
    title: 'Integrated Payment Processing',
    description: 'Secure payment gateway with multi-vendor payouts, subscription billing, and fraud detection.'
  },
  {
    icon: ChartBarIcon,
    title: 'Advanced Analytics Dashboard',
    description: 'Comprehensive analytics for vendors and administrators with sales reports and performance metrics.'
  },
  {
    icon: CogIcon,
    title: 'Vendor Management System',
    description: 'Complete vendor onboarding, verification, commission management, and performance tracking.'
  }
];

const platformFeatures = [
  {
    category: 'Customer Experience',
    features: [
      'Advanced product search & filtering',
      'Personalized recommendations',
      'Wishlist & favorites',
      'Product reviews & ratings',
      'Multi-currency support',
      'Guest & registered checkout'
    ]
  },
  {
    category: 'Vendor Management',
    features: [
      'Vendor registration & onboarding',
      'Product catalog management',
      'Order management dashboard',
      'Inventory tracking',
      'Commission & payout management',
      'Vendor analytics & reports'
    ]
  },
  {
    category: 'Admin Controls',
    features: [
      'Centralized admin dashboard',
      'Vendor approval workflow',
      'Commission rate management',
      'Dispute resolution system',
      'Content management',
      'SEO optimization tools'
    ]
  },
  {
    category: 'Technical Features',
    features: [
      'Mobile-responsive design',
      'Native iOS & Android apps',
      'API-first architecture',
      'Cloud scalable infrastructure',
      'Multi-language support',
      'Third-party integrations'
    ]
  }
];

const technologies = [
  'React/Next.js', 'Node.js', 'MongoDB', 'Redis', 'AWS/Azure', 'Stripe/PayPal',
  'React Native', 'Elasticsearch', 'Docker', 'Kubernetes', 'GraphQL', 'REST API'
];

const implementationSteps = [
  {
    step: 1,
    title: 'Platform Setup & Customization',
    description: 'Deploy core marketplace infrastructure with your branding, domain setup, and basic configuration.',
    duration: '1-2 weeks',
    deliverables: ['Domain & hosting setup', 'Brand customization', 'Admin panel configuration', 'Basic vendor onboarding']
  },
  {
    step: 2,
    title: 'Feature Integration & Development',
    description: 'Integrate payment gateways, shipping providers, and develop custom features specific to your market.',
    duration: '4-6 weeks',
    deliverables: ['Payment gateway integration', 'Shipping configuration', 'Custom feature development', 'Mobile app development']
  },
  {
    step: 3,
    title: 'Testing & Vendor Onboarding',
    description: 'Comprehensive testing, security audits, and onboarding initial vendor partners.',
    duration: '2-3 weeks',
    deliverables: ['Full platform testing', 'Security audit', 'Vendor training', 'Documentation']
  },
  {
    step: 4,
    title: 'Launch & Growth Support',
    description: 'Platform launch with marketing support, performance monitoring, and ongoing optimization.',
    duration: 'Ongoing',
    deliverables: ['Platform launch', 'Marketing support', 'Performance monitoring', '3 months support']
  }
];

const pricingPackages = [
  {
    name: 'Startup Marketplace',
    price: '$20,000',
    description: 'Perfect for launching your first multivendor marketplace',
    features: [
      'Up to 100 vendors',
      'Basic marketplace features',
      'Web platform only',
      'Standard payment integration',
      'Basic analytics dashboard',
      'Email support',
      '3 months maintenance'
    ],
    highlight: false,
    launch: '30-45 days'
  },
  {
    name: 'Professional Marketplace',
    price: '$45,000',
    description: 'Complete marketplace solution with mobile apps and advanced features',
    features: [
      'Unlimited vendors',
      'Advanced marketplace features',
      'Web + Mobile apps (iOS/Android)',
      'Multiple payment gateways',
      'Advanced analytics & reports',
      'Vendor management tools',
      'Priority support',
      '6 months maintenance'
    ],
    highlight: true,
    launch: '45-60 days'
  },
  {
    name: 'Enterprise Marketplace',
    price: '$75,000+',
    description: 'Large-scale marketplace with custom integrations and enterprise features',
    features: [
      'Unlimited everything',
      'Custom feature development',
      'Enterprise integrations',
      'Advanced security features',
      'Custom mobile apps',
      'Dedicated account manager',
      'White-glove support',
      '12 months maintenance'
    ],
    highlight: false,
    launch: '60-90 days'
  }
];

const successStories = [
  {
    industry: 'Fashion & Apparel',
    result: '$5M annual GMV in 18 months',
    vendors: '500+ active vendors',
    growth: '300% year-over-year'
  },
  {
    industry: 'Home & Garden',
    result: '$2.5M annual revenue',
    vendors: '250+ vendors',
    growth: '250% year-over-year'
  },
  {
    industry: 'Electronics',
    result: '$8M annual GMV',
    vendors: '1000+ vendors',
    growth: '400% year-over-year'
  }
];

export default function ECommerceMarketplacePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 backdrop-blur-sm text-blue-200 text-sm font-medium mb-6">
                <ShoppingCartIcon className="h-4 w-4 mr-2" />
                Multivendor E-Commerce Platform
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Launch Your Own
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                  Amazon-Style Marketplace
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Complete multivendor e-commerce platform rivaling Amazon and eBay. Launch your 
                marketplace with unlimited vendors, mobile apps, and enterprise-grade features 
                in just 30-90 days.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">30-90 days</div>
                  <div className="text-blue-200 text-sm">Launch Timeline</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">$20K-75K</div>
                  <div className="text-blue-200 text-sm">Investment Range</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Your Marketplace
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
                  src="/images/solutions/e-commerce-marketplace.webp"
                  alt="Multivendor E-Commerce Marketplace Platform"
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
              Complete Marketplace Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to launch and scale a successful multivendor marketplace
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built-in features covering every aspect of marketplace operations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformFeatures.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{category.category}</h3>
                <div className="space-y-3">
                  {category.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
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
              Enterprise Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with modern, scalable technologies for enterprise-grade performance
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors"
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
              Structured 4-step process to launch your marketplace successfully
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {implementationSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <div className="flex items-center text-sm text-blue-600 font-medium mb-4">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {step.duration}
                  </div>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="space-y-2">
                    {step.deliverables.map((deliverable, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-500">
                        <CheckIcon className="h-3 w-3 text-green-500 mr-2" />
                        {deliverable}
                      </div>
                    ))}
                  </div>
                </div>
                {index < implementationSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real results from marketplace owners across different industries
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{story.result}</div>
                <div className="text-lg font-semibold text-gray-900 mb-4">{story.industry}</div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>{story.vendors}</div>
                  <div className="font-semibold text-green-600">{story.growth}</div>
                </div>
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
              Marketplace Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right package for your marketplace vision and scale
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPackages.map((pkg, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${pkg.highlight ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                {pkg.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{pkg.price}</div>
                  <div className="text-sm text-gray-500 mb-4">Launch in {pkg.launch}</div>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    pkg.highlight 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Launch Your Marketplace?
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join successful marketplace owners who chose Zoptal for their e-commerce platform. 
            Complete solution from setup to success - we handle the technology, you focus on growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Marketplace Project
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/solutions/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
            >
              Explore Other Solutions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}