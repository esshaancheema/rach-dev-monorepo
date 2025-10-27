import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  HomeIcon,
  MagnifyingGlassIcon,
  CameraIcon,
  MapIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CpuChipIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  UserGroupIcon,
  GlobeAltIcon,
  BellAlertIcon,
  WrenchScrewdriverIcon,
  DocumentCheckIcon,
  RocketLaunchIcon,
  CogIcon,
  ServerStackIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalculatorIcon,
  KeyIcon,
  BanknotesIcon,
  EyeIcon,
  DevicePhoneMobileIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import RealEstateHeroImage from '@/components/RealEstateHeroImage';

export const metadata: Metadata = {
  title: 'Real Estate Management Platform | Property Listings & CRM | Zoptal',
  description: 'Build your real estate empire in 60 days. Complete property platform with virtual tours, AI matching, and CRM. Investment from $25K-75K.',
  keywords: [
    'real estate platform',
    'property listings website',
    'real estate CRM',
    'property management system',
    'MLS integration',
    'virtual property tours',
    'real estate app development',
    'property search platform',
    'agent CRM system',
    'property management software',
    'real estate investment platform',
    'zillow clone',
    'property marketplace',
    'real estate technology',
    'property valuation system'
  ],
  openGraph: {
    title: 'Real Estate Management Platform | Zoptal',
    description: 'Build your real estate empire in 60 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: VideoCameraIcon,
    title: 'Virtual Property Tours',
    description: '360° immersive property viewing with VR and AR capabilities for enhanced buyer experience.'
  },
  {
    icon: CpuChipIcon,
    title: 'AI-Powered Matching',
    description: 'Intelligent property recommendations and buyer-seller matching using machine learning.'
  },
  {
    icon: UserGroupIcon,
    title: 'CRM & Lead Management',
    description: 'Complete client relationship management with automated lead tracking and nurturing.'
  },
  {
    icon: ClockIcon,
    title: '60-Day Launch Timeline',
    description: 'Complete real estate platform deployment in 30-90 days depending on complexity.'
  }
];

const platformTypes = [
  {
    title: 'Property Marketplace',
    description: 'Zillow-style property listings platform',
    features: [
      'Advanced property search with filters',
      'Virtual tours and 360° property views',
      'Neighborhood insights and school ratings',
      'Mortgage calculator and pre-qualification',
      'Saved searches and automated alerts',
      'Property comparison and market analytics',
      'Agent connection and appointment scheduling',
      'Mobile-first responsive design'
    ]
  },
  {
    title: 'Agent CRM System',
    description: 'Complete lead management and client tools',
    features: [
      'Lead management and client relationship tools',
      'Commission tracking and transaction management',
      'Marketing automation with email campaigns',
      'Client portal for document sharing',
      'MLS integration and synchronization',
      'Performance analytics and reporting',
      'Mobile app for on-the-go access',
      'Social media marketing integration'
    ]
  },
  {
    title: 'Property Management',
    description: 'Rental property and tenant management',
    features: [
      'Tenant management and lease agreements',
      'Rent collection and payment processing',
      'Maintenance requests and work orders',
      'Financial reporting and expense tracking',
      'Property marketing and tenant screening',
      'Automated workflows and reminders',
      'Multi-property portfolio support',
      'Owner reporting and communications'
    ]
  }
];

const userCategories = [
  {
    icon: UserIcon,
    title: 'Property Buyers',
    description: 'Advanced search and discovery tools',
    features: ['Property search & filters', 'Virtual tours & 360° views', 'Neighborhood insights', 'Mortgage calculator']
  },
  {
    icon: HomeIcon,
    title: 'Property Sellers',
    description: 'Marketing and valuation solutions',
    features: ['Instant property valuation', 'Professional photography', 'Marketing tools', 'Showing management']
  },
  {
    icon: BuildingOfficeIcon,
    title: 'Real Estate Agents',
    description: 'Complete CRM and business tools',
    features: ['Lead management CRM', 'Commission tracking', 'Marketing automation', 'Client portal access']
  },
  {
    icon: KeyIcon,
    title: 'Property Managers',
    description: 'Rental management and operations',
    features: ['Tenant management', 'Maintenance coordination', 'Financial reporting', 'Multi-property support']
  }
];

const technologyFeatures = [
  {
    icon: CpuChipIcon,
    title: 'AI & Machine Learning',
    description: 'Property valuation, buyer matching, and market trend analysis'
  },
  {
    icon: VideoCameraIcon,
    title: 'Virtual Reality & AR',
    description: '3D property tours, augmented reality visualization, and drone photography'
  },
  {
    icon: MapIcon,
    title: 'Location Intelligence',
    description: 'Interactive maps, walk scores, and local amenity information'
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Mobile-First Design',
    description: 'Responsive design optimized for real estate professionals on-the-go'
  }
];

const integrationCapabilities = [
  { name: 'MLS Integration', description: 'Regional multiple listing services with IDX compliance' },
  { name: 'Mortgage Lenders', description: 'Loan pre-qualification and rate comparison tools' },
  { name: 'Title Companies', description: 'Title search and escrow service integration' },
  { name: 'Payment Processing', description: 'Rent collection and transaction processing' },
  { name: 'Accounting Software', description: 'QuickBooks and Xero financial integration' },
  { name: 'Investment Analysis', description: 'ROI calculation and market analysis tools' }
];

const pricingTiers = [
  {
    name: 'Starter Package',
    price: '$25,000',
    timeline: '30-45 days',
    description: 'Perfect for individual agents and small brokerages',
    features: [
      'Property listing website and mobile app',
      'Basic CRM and lead management',
      'MLS integration and IDX compliance',
      'Virtual tour and photo management',
      'Basic analytics and reporting',
      '30 days support and maintenance'
    ],
    highlighted: false
  },
  {
    name: 'Professional Package',
    price: '$45,000',
    timeline: '45-60 days',
    description: 'Ideal for established brokerages and property managers',
    features: [
      'Everything in Starter package',
      'Advanced CRM with automation',
      'Agent and client mobile apps',
      'Property management features',
      'Marketing automation tools',
      'Commission and transaction tracking',
      '90 days support and maintenance'
    ],
    highlighted: true
  },
  {
    name: 'Enterprise Package',
    price: '$75,000',
    timeline: '60-90 days',
    description: 'Complete real estate ecosystem',
    features: [
      'Everything in Professional package',
      'White-label branding and customization',
      'Advanced analytics and reporting',
      'Multi-office and franchise support',
      'API access and custom integrations',
      'Dedicated account management',
      '6 months support and maintenance'
    ],
    highlighted: false
  }
];

const revenueModels = [
  { model: 'Agent Commission', range: '1-3% of property sale price' },
  { model: 'Premium Listings', range: '$25-100 for featured placements' },
  { model: 'Lead Generation', range: '$50-500 per qualified lead' },
  { model: 'SaaS Subscriptions', range: '$50-2000 monthly plans' }
];

const successMetrics = [
  { metric: '10K+', description: 'Active property listings' },
  { metric: '500+', description: 'Active real estate agents' },
  { metric: '100K+', description: 'Monthly website visitors' },
  { metric: '$50M+', description: 'Monthly transaction volume' }
];

export default function RealEstatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-amber-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-emerald-100/20 px-4 py-2 text-sm font-medium text-emerald-100">
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Real Estate Technology Solutions
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Build Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-100">
                  Real Estate Empire
                </span>
                in 60 Days
              </h1>
              <p className="mt-6 text-xl text-emerald-100 sm:text-2xl">
                Complete Real Estate Platform - Property Listings, Virtual Tours, AI Matching & Comprehensive CRM
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {features.map((feature, index) => (
                  <div key={index} className="text-center">
                    <feature.icon className="mx-auto h-8 w-8 text-amber-300" />
                    <p className="mt-2 text-sm font-medium">{feature.title}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact?service=real-estate"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-amber-500 hover:shadow-2xl hover:scale-105"
                >
                  View Property Demo
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-emerald-300 bg-emerald-800/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-emerald-700/50"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  Get Agent Portal Access
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <RealEstateHeroImage className="w-full max-w-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Complete Real Estate Platform
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Transform the real estate market with comprehensive technology. Connect buyers, sellers, 
              agents, and property managers through advanced search, virtual tours, and intelligent matching.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {platformTypes.map((platform, index) => (
              <div key={index} className="relative bg-gradient-to-br from-emerald-50 to-amber-50 rounded-2xl p-8 shadow-lg border border-emerald-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{platform.title}</h3>
                <p className="text-gray-600 mb-6">{platform.description}</p>
                <ul className="space-y-3">
                  {platform.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Categories */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Solutions for Every Real Estate Professional
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Tailored features for buyers, sellers, agents, and property managers
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {userCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-lg flex items-center justify-center mb-4">
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{category.description}</p>
                <ul className="space-y-1">
                  {category.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-sm text-gray-500 flex items-center">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Technology */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-emerald-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Advanced Real Estate Technology
            </h2>
            <p className="mt-6 text-xl text-emerald-100">
              Cutting-edge features that set your platform apart from the competition
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {technologyFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-emerald-100">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-12">Integration Capabilities</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {integrationCapabilities.map((integration, index) => (
                <div key={index} className="bg-emerald-800/30 rounded-lg p-6 border border-emerald-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{integration.name}</h4>
                    <CheckIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <p className="text-sm text-emerald-100">{integration.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Models */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-amber-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Multiple Revenue Streams</h2>
            <p className="text-emerald-100 text-lg">Diversified monetization opportunities for sustainable growth</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {revenueModels.map((model, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <h3 className="font-bold text-white text-lg mb-2">{model.model}</h3>
                <p className="text-emerald-100">{model.range}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-16 bg-gradient-to-r from-emerald-700 to-amber-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {successMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white md:text-4xl">{metric.metric}</div>
                <div className="text-emerald-100 mt-2">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Investment Packages
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Choose the perfect real estate platform solution for your business
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative bg-white rounded-2xl shadow-xl border-2 p-8 ${
                tier.highlighted 
                  ? 'border-emerald-500 ring-4 ring-emerald-500/10' 
                  : 'border-gray-200'
              }`}>
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-emerald-600 to-amber-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{tier.description}</p>
                  <div className="mt-4 text-sm text-emerald-600 font-medium">
                    Launch Time: {tier.timeline}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact?service=real-estate"
                  className={`block w-full text-center py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-emerald-600 to-amber-600 text-white hover:from-emerald-700 hover:to-amber-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started Today
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-br from-emerald-900 via-emerald-800 to-amber-700 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Ready to Transform Real Estate?
          </h2>
          <p className="mt-6 text-xl text-emerald-100">
            Build the future of property commerce with Zoptal's comprehensive platform. 
            Advanced technology that modernizes property sales, management, and investment.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <HomeIcon className="mx-auto h-12 w-12 text-amber-300" />
              <h3 className="mt-4 text-lg font-semibold">Complete Solution</h3>
              <p className="mt-2 text-sm text-emerald-100">Listings, CRM, management in one platform</p>
            </div>
            <div className="text-center">
              <CpuChipIcon className="mx-auto h-12 w-12 text-amber-300" />
              <h3 className="mt-4 text-lg font-semibold">Advanced Technology</h3>
              <p className="mt-2 text-sm text-emerald-100">AI, VR, and mobile-first experience</p>
            </div>
            <div className="text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-amber-300" />
              <h3 className="mt-4 text-lg font-semibold">Proven Results</h3>
              <p className="mt-2 text-sm text-emerald-100">Increased sales and improved efficiency</p>
            </div>
            <div className="text-center">
              <UserGroupIcon className="mx-auto h-12 w-12 text-amber-300" />
              <h3 className="mt-4 text-lg font-semibold">Expert Support</h3>
              <p className="mt-2 text-sm text-emerald-100">Real estate industry expertise</p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact?service=real-estate"
              className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-amber-500 hover:shadow-2xl hover:scale-105"
            >
              View Property Demo
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact?service=quote"
              className="inline-flex items-center justify-center rounded-xl border-2 border-emerald-300 bg-emerald-800/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-emerald-700/50"
            >
              Get Custom Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}