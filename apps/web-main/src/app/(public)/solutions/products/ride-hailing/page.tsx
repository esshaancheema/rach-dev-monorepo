import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  MapPinIcon,
  DevicePhoneMobileIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  TruckIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellAlertIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ClockIcon,
  MapIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  RocketLaunchIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import RideHailingHeroImage from '@/components/RideHailingHeroImage';

export const metadata: Metadata = {
  title: 'Ride-Hailing & Taxi Platform | Transportation Solution | Zoptal',
  description: 'Launch your ride-hailing empire in 45-90 days. Complete taxi platform with real-time GPS tracking, dynamic pricing, and fleet management. Investment from $30K-80K.',
  keywords: [
    'ride hailing platform',
    'taxi booking app',
    'uber clone development',
    'transportation platform',
    'taxi dispatch system',
    'ride sharing app',
    'fleet management software',
    'driver app development',
    'passenger booking system',
    'GPS tracking solution',
    'dynamic pricing engine',
    'taxi business software',
    'transportation technology',
    'mobility platform'
  ],
  openGraph: {
    title: 'Ride-Hailing & Taxi Platform | Zoptal',
    description: 'Launch your ride-hailing empire in 45-90 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: MapPinIcon,
    title: 'Real-Time GPS Tracking',
    description: 'Live tracking of drivers and rides with accurate ETAs and route optimization.'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Dynamic Pricing Engine',
    description: 'Smart surge pricing based on demand, time, and location for maximum revenue.'
  },
  {
    icon: UserGroupIcon,
    title: 'Fleet Management',
    description: 'Complete tools for managing drivers, vehicles, and operations at scale.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Safety & Security',
    description: 'Comprehensive safety features including emergency buttons and driver verification.'
  }
];

const platformComponents = [
  {
    title: 'Rider App',
    description: 'Intuitive mobile app for passengers',
    features: [
      'One-tap ride booking with location detection',
      'Real-time driver tracking on map',
      'Multiple payment options (cards, wallets, cash)',
      'Ride scheduling for future trips',
      'Fare estimation with surge pricing',
      'Driver ratings and reviews',
      'Complete ride history and receipts',
      'Emergency safety features and contacts'
    ]
  },
  {
    title: 'Driver App',
    description: 'Professional tools for drivers',
    features: [
      'Earnings dashboard and performance metrics',
      'Turn-by-turn navigation with traffic',
      'Flexible scheduling and availability',
      'Instant payment processing',
      'In-app rider communication',
      'Multi-vehicle management',
      'Expense tracking for taxes',
      '24/7 driver support system'
    ]
  },
  {
    title: 'Admin Dashboard',
    description: 'Complete fleet management platform',
    features: [
      'Real-time fleet tracking and monitoring',
      'Driver onboarding and verification',
      'Revenue analytics and reporting',
      'Manual dispatch capabilities',
      'Performance monitoring metrics',
      'Marketing and promotional tools',
      'Regulatory compliance management',
      'Insurance and claims handling'
    ]
  }
];

const pricingPlans = [
  {
    name: 'Startup Package',
    price: '$30,000',
    timeline: '45-60 days',
    features: [
      'Rider and driver mobile apps',
      'Basic dispatch system',
      'GPS tracking and navigation',
      'Payment processing integration',
      'Admin dashboard',
      'Basic analytics',
      'Single city deployment',
      '30 days support included'
    ],
    ideal: 'Single-city launch and small fleets'
  },
  {
    name: 'Professional Package',
    price: '$50,000',
    timeline: '60-75 days',
    features: [
      'Advanced dispatch algorithm',
      'Dynamic pricing engine',
      'Fleet management tools',
      'Multi-language support',
      'Driver onboarding system',
      'Advanced analytics & reporting',
      'Multi-city capabilities',
      '90 days support included'
    ],
    ideal: 'Growing transportation businesses'
  },
  {
    name: 'Enterprise Package',
    price: '$80,000',
    timeline: '75-90 days',
    features: [
      'Complete transportation ecosystem',
      'White-label branding',
      'Advanced safety features',
      'API integrations',
      'AI-powered matching',
      'Custom feature development',
      'Unlimited cities',
      '6 months support included'
    ],
    ideal: 'Large-scale ride-hailing operations'
  }
];

const businessModels = [
  {
    title: 'Commission Model',
    description: '15-25% commission per ride',
    icon: CurrencyDollarIcon
  },
  {
    title: 'Subscription Model',
    description: 'Monthly driver subscriptions',
    icon: CreditCardIcon
  },
  {
    title: 'Fleet Licensing',
    description: 'License to taxi companies',
    icon: TruckIcon
  },
  {
    title: 'Marketplace Model',
    description: 'Connect multiple fleets',
    icon: GlobeAltIcon
  }
];

const successMetrics = [
  { metric: '95%+', label: 'Ride Completion Rate' },
  { metric: '<5min', label: 'Average Wait Time' },
  { metric: '4.5★', label: 'Customer Rating' },
  { metric: '70%+', label: 'Driver Utilization' }
];

const safetyFeatures = [
  'Driver background checks and verification',
  'Vehicle inspection and maintenance tracking',
  'Real-time trip monitoring and anomaly detection',
  'Emergency panic button with instant response',
  'Comprehensive insurance coverage',
  'Two-way ratings and feedback system',
  'In-app masked calling for privacy',
  '24/7 safety support team'
];

export default function RideHailingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur mb-6">
                <RocketLaunchIcon className="mr-2 h-4 w-4" />
                The Next Uber Starts Here
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                Launch Your Ride-Hailing Empire in 60 Days
              </h1>
              <p className="text-xl text-blue-50 mb-8">
                Build the complete transportation platform with real-time GPS tracking, dynamic pricing, and intelligent driver matching. Connect riders, drivers, and fleet operators in one powerful ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/get-quote"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-lg hover:bg-blue-50 transition-all duration-200"
                >
                  Get Live Demo
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-6 py-3 text-base font-semibold text-white hover:bg-blue-800 transition-all duration-200"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Driver App
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {successMetrics.map((item, index) => (
                  <div key={index}>
                    <div className="text-2xl font-bold">{item.metric}</div>
                    <div className="text-sm text-blue-100">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <RideHailingHeroImage className="w-full" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Platform Types */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Transportation Platform Types
            </h2>
            <p className="text-lg text-gray-600">
              Choose the perfect model for your market
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Ride-Hailing Platform', desc: 'Uber-style on-demand rides', icon: MapIcon },
              { title: 'Taxi Fleet Management', desc: 'Traditional taxi dispatch system', icon: TruckIcon },
              { title: 'Delivery & Logistics', desc: 'Package and goods transportation', icon: TruckIcon },
              { title: 'Corporate Transportation', desc: 'Business travel and shuttles', icon: UserGroupIcon },
              { title: 'Multi-Modal Transport', desc: 'Cars, bikes, scooters integration', icon: GlobeAltIcon },
              { title: 'Medical Transport', desc: 'Non-emergency medical rides', icon: ShieldCheckIcon }
            ].map((type, index) => (
              <div key={index} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <type.icon className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h3>
                <p className="text-gray-600">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Advanced Transportation Technology
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to compete with global ride-hailing giants
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Components */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Complete Transportation Ecosystem
            </h2>
            <p className="text-lg text-gray-600">
              Three powerful platforms working in perfect harmony
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {platformComponents.map((component, index) => (
              <div key={index} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{component.title}</h3>
                  <p className="text-blue-50">{component.description}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {component.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckIcon className="mr-3 h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Security */}
      <section className="py-20 bg-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <ShieldCheckIcon className="mx-auto h-16 w-16 text-blue-600 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Safety First Platform
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive safety features that protect riders and drivers
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
            {safetyFeatures.map((feature, index) => (
              <div key={index} className="flex items-start">
                <ExclamationTriangleIcon className="mr-3 h-6 w-6 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Models */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Flexible Business Models
            </h2>
            <p className="text-lg text-gray-600">
              Multiple revenue streams for sustainable growth
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {businessModels.map((model, index) => (
              <div key={index} className="text-center rounded-xl border border-gray-200 bg-white p-6">
                <model.icon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{model.title}</h3>
                <p className="text-gray-600">{model.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Investment Packages
            </h2>
            <p className="text-lg text-gray-600">
              Choose the perfect package for your transportation business
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`rounded-2xl border ${index === 1 ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200'} bg-white overflow-hidden`}>
                {index === 1 && (
                  <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-blue-600">{plan.price}</span>
                    <span className="ml-2 text-gray-600">/ project</span>
                  </div>
                  <div className="flex items-center mb-6 text-gray-600">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>Launch in {plan.timeline}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckIcon className="mr-3 h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 mb-6">
                    <span className="font-semibold">Ideal for:</span> {plan.ideal}
                  </p>
                  <Link
                    href="/get-quote"
                    className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                      index === 1 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 p-12 text-white">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold mb-6">Intelligent Matching System</h2>
                <ul className="space-y-3">
                  {[
                    'AI-powered driver-rider matching',
                    'Predictive demand analytics',
                    'Route optimization algorithms',
                    'Multi-stop trip support',
                    'Pool ride matching',
                    'Driver repositioning suggestions'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckIcon className="mr-3 h-5 w-5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">Dynamic Pricing Engine</h2>
                <ul className="space-y-3">
                  {[
                    'Surge pricing during high demand',
                    'Zone-based pricing strategies',
                    'Time-based fare adjustments',
                    'Distance and duration calculation',
                    'Special event pricing',
                    'Corporate account rates'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckIcon className="mr-3 h-5 w-5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Expected Growth Metrics
            </h2>
            <p className="text-lg text-gray-600">
              What successful platforms achieve in Year 1
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '50K+', label: 'Monthly Active Riders' },
              { value: '5K+', label: 'Active Drivers' },
              { value: '$1M+', label: 'Monthly GMV' },
              { value: '20%+', label: 'Market Share' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl mb-6">
            Ready to Launch Your Transportation Platform?
          </h2>
          <p className="text-xl text-blue-50 mb-8 max-w-3xl mx-auto">
            Join the mobility revolution with Zoptal's proven ride-hailing technology. 
            Your complete transportation solution is just 60 days away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-quote"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg hover:bg-blue-50 transition-all duration-200"
            >
              Get Live Demo
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold text-white hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              <ChatBubbleLeftRightIcon className="mr-2 h-5 w-5" />
              Talk to Expert
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: 'Platforms Launched', value: '200+' },
              { label: 'Total Rides', value: '50M+' },
              { label: 'Countries', value: '35+' },
              { label: 'Success Rate', value: '95%' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}