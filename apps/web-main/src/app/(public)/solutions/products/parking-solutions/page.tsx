import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  BellAlertIcon,
  CpuChipIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  EyeIcon,
  SignalIcon,
  CameraIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  CogIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import ParkingSolutionsHeroImage from '@/components/ParkingSolutionsHeroImage';

export const metadata: Metadata = {
  title: 'Urban Parking Solutions Platform | Smart Parking Management | Zoptal',
  description: 'Launch your smart parking platform in 30-90 days. Complete SpotHero-style solution with IoT sensors, real-time availability, and dynamic pricing. Investment from $25K-75K.',
  keywords: [
    'smart parking platform',
    'urban parking solutions',
    'parking reservation system',
    'parking management software',
    'real-time parking availability',
    'IoT parking sensors',
    'parking app development',
    'dynamic parking pricing',
    'parking space booking',
    'smart city parking',
    'parking lot management',
    'mobile parking payments',
    'parking technology platform',
    'valet parking management'
  ],
  openGraph: {
    title: 'Urban Parking Solutions Platform | Zoptal',
    description: 'Launch your smart parking platform in 30-90 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: EyeIcon,
    title: 'Real-Time Availability',
    description: 'Live parking space updates with IoT sensors and smart monitoring systems.'
  },
  {
    icon: ClockIcon,
    title: 'Advance Reservations',
    description: 'Book parking spots ahead of time with guaranteed availability.'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Dynamic Pricing',
    description: 'AI-powered pricing optimization based on demand, location, and time.'
  },
  {
    icon: CpuChipIcon,
    title: 'Smart Technology',
    description: 'IoT sensors, license plate recognition, and automated access control.'
  }
];

const platformComponents = [
  {
    title: 'Driver Mobile App',
    description: 'Complete parking solution for drivers',
    features: [
      'Parking space search & comparison',
      'Real-time availability updates',
      'Advance booking & reservations',
      'GPS navigation to reserved spots',
      'Contactless mobile payments',
      'Parking meter expiration alerts',
      'Loyalty rewards & discounts',
      'Multiple vehicle management'
    ]
  },
  {
    title: 'Parking Operator Dashboard',
    description: 'Professional management tools for operators',
    features: [
      'Real-time space inventory tracking',
      'Dynamic pricing management',
      'Revenue analytics & reporting',
      'Customer communication automation',
      'Violation & enforcement tools',
      'Maintenance scheduling system',
      'Multi-location facility support',
      'Staff coordination & tasks'
    ]
  },
  {
    title: 'Platform Admin Console',
    description: 'Complete ecosystem management',
    features: [
      'Parking operator network management',
      'Commission & revenue sharing',
      'Quality control monitoring',
      'Market analytics & insights',
      'Customer support & disputes',
      'Marketing campaign tools',
      'City system integrations',
      'Performance optimization'
    ]
  }
];

const smartTechFeatures = [
  {
    category: 'IoT Integration',
    items: [
      'Real-time occupancy sensors',
      'Smart payment meters',
      'License plate recognition',
      'Mobile access control systems',
      'Environmental monitoring'
    ]
  },
  {
    category: 'Advanced Analytics',
    items: [
      'AI occupancy prediction',
      'Dynamic price optimization',
      'Traffic flow analysis',
      'Customer behavior insights',
      'Revenue forecasting'
    ]
  }
];

const pricingPlans = [
  {
    name: 'Starter Package',
    price: '$25,000',
    timeline: '30-45 days',
    features: [
      'Driver mobile app & web platform',
      'Basic parking space booking',
      'Payment processing integration',
      'Simple operator dashboard',
      'Basic availability tracking',
      'Customer support portal',
      'Single city deployment',
      '30 days support included'
    ],
    ideal: 'Small parking operators and startups'
  },
  {
    name: 'Professional Package',
    price: '$45,000',
    timeline: '45-60 days',
    features: [
      'Real-time IoT integration',
      'Dynamic pricing engine',
      'Advanced operator tools',
      'Customer loyalty programs',
      'Analytics & reporting',
      'Multi-location support',
      'Navigation app integration',
      '90 days support included'
    ],
    ideal: 'Growing parking businesses'
  },
  {
    name: 'Enterprise Package',
    price: '$75,000',
    timeline: '60-90 days',
    features: [
      'City-wide parking management',
      'Advanced AI & machine learning',
      'Multi-stakeholder integration',
      'White-label customization',
      'Smart city system integration',
      'Custom feature development',
      'Unlimited locations',
      '6 months support included'
    ],
    ideal: 'Cities and large parking operators'
  }
];

const platformTypes = [
  {
    title: 'Smart Reservations',
    description: 'SpotHero-style advance booking',
    icon: ClockIcon
  },
  {
    title: 'Real-Time Finder',
    description: 'Live availability & pricing',
    icon: EyeIcon
  },
  {
    title: 'Lot Management',
    description: 'Complete facility operations',
    icon: BuildingOfficeIcon
  },
  {
    title: 'Valet Services',
    description: 'On-demand valet coordination',
    icon: UserGroupIcon
  },
  {
    title: 'Event Parking',
    description: 'Large-scale event management',
    icon: GlobeAltIcon
  },
  {
    title: 'Smart City Integration',
    description: 'Municipal parking systems',
    icon: CogIcon
  }
];

const revenueModels = [
  {
    title: 'Booking Commission',
    percentage: '10-20%',
    description: 'Commission on parking reservations',
    icon: CurrencyDollarIcon
  },
  {
    title: 'Transaction Fees',
    percentage: '$0.50-2.00',
    description: 'Per parking transaction',
    icon: DocumentChartBarIcon
  },
  {
    title: 'Operator Subscriptions',
    percentage: 'Monthly',
    description: 'Facility management fees',
    icon: BuildingOfficeIcon
  },
  {
    title: 'Premium Features',
    percentage: 'Tiered',
    description: 'Advanced analytics & tools',
    icon: ChartBarIcon
  }
];

const successMetrics = [
  { metric: '10K+', label: 'Parking Spots' },
  { metric: '95%', label: 'Availability Accuracy' },
  { metric: '30sec', label: 'Avg Booking Time' },
  { metric: '85%', label: 'Customer Satisfaction' }
];

export default function ParkingSolutionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-500 to-teal-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur mb-6">
                <RocketLaunchIcon className="mr-2 h-4 w-4" />
                Smart City Revolution
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                Launch Your Smart Parking Platform in 60 Days
              </h1>
              <p className="text-xl text-teal-50 mb-8">
                Complete SpotHero & ParkWhiz-style solution with IoT sensors, real-time availability, advance reservations, and dynamic pricing. Transform urban parking into a seamless digital experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/get-quote"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-teal-600 shadow-lg hover:bg-teal-50 transition-all duration-200"
                >
                  Get Smart Demo
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-6 py-3 text-base font-semibold text-white hover:bg-teal-800 transition-all duration-200"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View IoT Demo
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {successMetrics.map((item, index) => (
                  <div key={index}>
                    <div className="text-2xl font-bold">{item.metric}</div>
                    <div className="text-sm text-teal-100">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <ParkingSolutionsHeroImage className="w-full" />
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
              Smart Parking Platform Types
            </h2>
            <p className="text-lg text-gray-600">
              Complete solutions for every parking scenario
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {platformTypes.map((type, index) => (
              <div key={index} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <type.icon className="h-8 w-8 text-teal-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h3>
                <p className="text-gray-600">{type.description}</p>
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
              Advanced Parking Technology
            </h2>
            <p className="text-lg text-gray-600">
              Revolutionary features that transform urban parking
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                  <feature.icon className="h-8 w-8 text-teal-600" />
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
              Complete Smart Parking Ecosystem
            </h2>
            <p className="text-lg text-gray-600">
              Three integrated platforms for seamless parking management
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {platformComponents.map((component, index) => (
              <div key={index} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{component.title}</h3>
                  <p className="text-teal-50">{component.description}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {component.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckIcon className="mr-3 h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
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

      {/* Smart Technology */}
      <section className="py-20 bg-teal-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <CpuChipIcon className="mx-auto h-16 w-16 text-teal-600 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Smart Technology Integration
            </h2>
            <p className="text-lg text-gray-600">
              Cutting-edge IoT and AI technology for intelligent parking
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {smartTechFeatures.map((section, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{section.category}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <SignalIcon className="mr-3 h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Models */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Multiple Revenue Streams
            </h2>
            <p className="text-lg text-gray-600">
              Diverse monetization strategies for sustainable growth
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {revenueModels.map((model, index) => (
              <div key={index} className="text-center rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
                <model.icon className="mx-auto h-12 w-12 text-teal-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{model.title}</h3>
                <p className="text-2xl font-bold text-teal-600 mb-2">{model.percentage}</p>
                <p className="text-sm text-gray-600">{model.description}</p>
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
              Choose the perfect package for your parking business
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`rounded-2xl border ${index === 1 ? 'border-teal-500 shadow-xl scale-105' : 'border-gray-200'} bg-white overflow-hidden`}>
                {index === 1 && (
                  <div className="bg-teal-500 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-teal-600">{plan.price}</span>
                    <span className="ml-2 text-gray-600">/ project</span>
                  </div>
                  <div className="flex items-center mb-6 text-gray-600">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>Launch in {plan.timeline}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckIcon className="mr-3 h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
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
                        ? 'bg-teal-500 text-white hover:bg-teal-600' 
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
          <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 p-12 text-white">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold mb-6">Smart City Integration</h2>
                <ul className="space-y-3">
                  {[
                    'Navigation app integration (Google Maps, Waze)',
                    'Event platform connections',
                    'Public transit & park-and-ride',
                    'Traffic management systems',
                    'Municipal payment integration',
                    'Smart city data sharing'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <GlobeAltIcon className="mr-3 h-5 w-5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">IoT & Hardware</h2>
                <ul className="space-y-3">
                  {[
                    'Occupancy detection sensors',
                    'License plate recognition cameras',
                    'Smart payment terminals',
                    'Mobile access control gates',
                    'Environmental monitoring',
                    'Predictive maintenance alerts'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CameraIcon className="mr-3 h-5 w-5" />
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
              Expected Platform Performance
            </h2>
            <p className="text-lg text-gray-600">
              What successful smart parking platforms achieve
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '50K+', label: 'Monthly Bookings' },
              { value: '200+', label: 'Parking Facilities' },
              { value: '95%', label: 'Availability Accuracy' },
              { value: '90%', label: 'User Satisfaction' }
            ].map((stat, index) => (
              <div key={index} className="text-center bg-white rounded-xl p-6 shadow-md">
                <div className="text-4xl font-bold text-teal-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl mb-6">
            Ready to Solve Urban Parking Challenges?
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-3xl mx-auto">
            Build the future of smart parking with Zoptal's intelligent platform. 
            Your complete parking solution is just 60 days away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-quote"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-teal-600 shadow-lg hover:bg-teal-50 transition-all duration-200"
            >
              Get Smart Demo
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold text-white hover:bg-white hover:text-teal-600 transition-all duration-200"
            >
              <MapPinIcon className="mr-2 h-5 w-5" />
              View Locations
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: 'Smart Platforms', value: '100+' },
              { label: 'Parking Spaces', value: '1M+' },
              { label: 'Cities Served', value: '50+' },
              { label: 'IoT Sensors', value: '500K+' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-teal-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}