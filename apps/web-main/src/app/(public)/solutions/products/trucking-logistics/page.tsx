import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  TruckIcon,
  MapPinIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
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
  ServerStackIcon
} from '@heroicons/react/24/outline';
import TruckingLogisticsHeroImage from '@/components/TruckingLogisticsHeroImage';

export const metadata: Metadata = {
  title: 'Trucking & Logistics Management Platform | Fleet Management Solution | Zoptal',
  description: 'Launch your logistics empire in 45-90 days. Complete trucking platform with AI load matching, fleet tracking, and route optimization. Investment from $35K-100K.',
  keywords: [
    'trucking platform',
    'logistics management software',
    'fleet management system',
    'load board platform',
    'freight broker software',
    'transportation management system',
    'truck dispatch software',
    'cargo tracking solution',
    'DOT compliance platform',
    'route optimization software',
    'freight marketplace',
    'logistics technology',
    'supply chain platform',
    'trucking business software'
  ],
  openGraph: {
    title: 'Trucking & Logistics Management Platform | Zoptal',
    description: 'Launch your logistics empire in 45-90 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: CpuChipIcon,
    title: 'AI-Powered Load Matching',
    description: 'Intelligent algorithm matches loads with optimal carriers based on route, capacity, and price.'
  },
  {
    icon: MapPinIcon,
    title: 'Real-Time Fleet Tracking',
    description: 'GPS tracking of all vehicles with live status updates and estimated delivery times.'
  },
  {
    icon: ChartBarIcon,
    title: 'Route Optimization',
    description: 'Automated route planning for maximum efficiency and fuel savings.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'DOT Compliance',
    description: 'Complete regulatory compliance including ELD, hours of service, and safety management.'
  }
];

const platformComponents = [
  {
    title: 'Shipper & Broker Platform',
    description: 'Complete freight management solution',
    features: [
      'Load posting with detailed requirements',
      'Verified carrier selection & ratings',
      'Rate negotiation and management',
      'Real-time GPS shipment tracking',
      'Digital BOL and documentation',
      'Analytics and cost reporting',
      'Multi-modal freight coordination',
      'White-label customer portals'
    ]
  },
  {
    title: 'Carrier & Fleet Tools',
    description: 'Professional trucking management system',
    features: [
      'Load discovery and filtering',
      'Fleet tracking and management',
      'AI route optimization',
      'Driver communication tools',
      'DOT compliance monitoring',
      'Financial management & invoicing',
      'Performance analytics dashboard',
      'Maintenance scheduling & tracking'
    ]
  },
  {
    title: 'Driver Mobile App',
    description: 'Complete driver companion application',
    features: [
      'Load assignment management',
      'Commercial vehicle navigation',
      'Automatic HOS logging (ELD)',
      'Document capture & upload',
      'Direct dispatcher messaging',
      'Expense tracking & receipts',
      'Earnings & performance dashboard',
      'Emergency & breakdown assistance'
    ]
  }
];

const complianceFeatures = [
  {
    category: 'DOT Regulations',
    items: [
      'Electronic Logging Device (ELD) compliance',
      'Hours of Service (HOS) monitoring',
      'CSA scores and safety ratings',
      'Drug & alcohol testing records',
      'Vehicle inspection tracking'
    ]
  },
  {
    category: 'Interstate Commerce',
    items: [
      'MC Authority verification',
      'Insurance requirements validation',
      'Hazmat compliance management',
      'Cross-border documentation',
      'State permit tracking'
    ]
  }
];

const pricingPlans = [
  {
    name: 'Starter Package',
    price: '$35,000',
    timeline: '45-60 days',
    features: [
      'Load board platform',
      'Basic fleet tracking',
      'Driver mobile app',
      'Payment processing',
      'Basic analytics',
      'DOT compliance tools',
      'Single region deployment',
      '30 days support included'
    ],
    ideal: 'Small fleets and regional operators'
  },
  {
    name: 'Professional Package',
    price: '$60,000',
    timeline: '60-75 days',
    features: [
      'Advanced fleet management',
      'AI route optimization',
      'Fuel management system',
      'Compliance monitoring',
      'Customer portals',
      'White-label options',
      'Multi-region capabilities',
      '90 days support included'
    ],
    ideal: 'Growing logistics companies'
  },
  {
    name: 'Enterprise Package',
    price: '$100,000',
    timeline: '75-90 days',
    features: [
      'Complete logistics ecosystem',
      'AI-powered matching',
      'ERP/TMS integration',
      'Advanced analytics & BI',
      'IoT & telematics integration',
      'Custom feature development',
      'Unlimited regions',
      '6 months support included'
    ],
    ideal: 'Large-scale freight operations'
  }
];

const businessModels = [
  {
    title: 'Commission Model',
    description: '3-10% per load',
    details: 'Earn commission on every completed shipment',
    icon: CurrencyDollarIcon
  },
  {
    title: 'SaaS Subscription',
    description: '$149-999/month',
    details: 'Recurring revenue from fleet subscriptions',
    icon: ServerStackIcon
  },
  {
    title: 'Transaction Fees',
    description: '$25-100 per load',
    details: 'Flat fee for each booking transaction',
    icon: DocumentCheckIcon
  },
  {
    title: 'Value-Added Services',
    description: 'Multiple revenue streams',
    details: 'Factoring, insurance, fuel programs',
    icon: CogIcon
  }
];

const successMetrics = [
  { metric: '1K+', label: 'Monthly Loads' },
  { metric: '500+', label: 'Verified Carriers' },
  { metric: '98%', label: 'On-Time Delivery' },
  { metric: '70%', label: 'Fleet Utilization' }
];

export default function TruckingLogisticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur mb-6">
                <TruckIcon className="mr-2 h-4 w-4" />
                Digital Freight Revolution
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                Build Your Logistics Empire in 60 Days
              </h1>
              <p className="text-xl text-indigo-50 mb-8">
                Complete trucking & fleet management platform with AI-powered load matching, real-time tracking, and route optimization. Connect shippers, carriers, and drivers in one powerful ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/get-quote"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-600 shadow-lg hover:bg-indigo-50 transition-all duration-200"
                >
                  Get Fleet Demo
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-700 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-800 transition-all duration-200"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Driver App
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {successMetrics.map((item, index) => (
                  <div key={index}>
                    <div className="text-2xl font-bold">{item.metric}</div>
                    <div className="text-sm text-indigo-100">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <TruckingLogisticsHeroImage className="w-full" />
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
              Logistics Platform Types
            </h2>
            <p className="text-lg text-gray-600">
              Complete solutions for every logistics business model
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Load Board Platform', desc: 'FreightBroker-style load matching', icon: DocumentTextIcon },
              { title: 'Fleet Management', desc: 'Complete trucking operations', icon: TruckIcon },
              { title: 'Last-Mile Delivery', desc: 'Urban package delivery', icon: MapPinIcon },
              { title: 'LTL/FTL Marketplace', desc: 'Less & full truckload services', icon: GlobeAltIcon },
              { title: 'Specialized Transport', desc: 'Heavy haul, refrigerated, hazmat', icon: ShieldCheckIcon },
              { title: '3PL Platform', desc: 'Third-party logistics services', icon: UserGroupIcon }
            ].map((type, index) => (
              <div key={index} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <type.icon className="h-8 w-8 text-indigo-600 mb-3" />
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
              Advanced Logistics Technology
            </h2>
            <p className="text-lg text-gray-600">
              Industry-leading features for modern freight management
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                  <feature.icon className="h-8 w-8 text-indigo-600" />
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
              Complete Logistics Ecosystem
            </h2>
            <p className="text-lg text-gray-600">
              Three powerful platforms working seamlessly together
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {platformComponents.map((component, index) => (
              <div key={index} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{component.title}</h3>
                  <p className="text-indigo-50">{component.description}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {component.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckIcon className="mr-3 h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
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

      {/* Compliance & Regulations */}
      <section className="py-20 bg-indigo-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <ShieldCheckIcon className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Complete Regulatory Compliance
            </h2>
            <p className="text-lg text-gray-600">
              Stay compliant with all DOT and interstate commerce regulations
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {complianceFeatures.map((section, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{section.category}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <DocumentCheckIcon className="mr-3 h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
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
              Multiple Revenue Streams
            </h2>
            <p className="text-lg text-gray-600">
              Flexible business models for sustainable growth
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {businessModels.map((model, index) => (
              <div key={index} className="text-center rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
                <model.icon className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{model.title}</h3>
                <p className="text-2xl font-bold text-indigo-600 mb-2">{model.description}</p>
                <p className="text-sm text-gray-600">{model.details}</p>
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
              Choose the perfect package for your logistics business
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`rounded-2xl border ${index === 1 ? 'border-indigo-500 shadow-xl scale-105' : 'border-gray-200'} bg-white overflow-hidden`}>
                {index === 1 && (
                  <div className="bg-indigo-500 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-indigo-600">{plan.price}</span>
                    <span className="ml-2 text-gray-600">/ project</span>
                  </div>
                  <div className="flex items-center mb-6 text-gray-600">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>Launch in {plan.timeline}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckIcon className="mr-3 h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
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
                        ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
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
          <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 p-12 text-white">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold mb-6">AI & Machine Learning</h2>
                <ul className="space-y-3">
                  {[
                    'Load matching algorithm',
                    'Predictive demand analytics',
                    'Dynamic route intelligence',
                    'Risk assessment scoring',
                    'Capacity planning optimization',
                    'Price optimization engine'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CpuChipIcon className="mr-3 h-5 w-5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">IoT & Telematics</h2>
                <ul className="space-y-3">
                  {[
                    'Real-time vehicle tracking',
                    'Cargo temperature monitoring',
                    'Driver behavior analytics',
                    'Predictive maintenance alerts',
                    'Fuel efficiency tracking',
                    'Asset utilization metrics'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <WrenchScrewdriverIcon className="mr-3 h-5 w-5" />
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
              Expected Business Outcomes
            </h2>
            <p className="text-lg text-gray-600">
              What successful platforms achieve in their first year
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '$10M+', label: 'Annual Freight Value' },
              { value: '$500K+', label: 'Recurring Revenue' },
              { value: '25%', label: 'Market Penetration' },
              { value: '85%', label: 'Customer Retention' }
            ].map((stat, index) => (
              <div key={index} className="text-center bg-white rounded-xl p-6 shadow-md">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl mb-6">
            Ready to Transform Logistics & Transportation?
          </h2>
          <p className="text-xl text-indigo-50 mb-8 max-w-3xl mx-auto">
            Build the future of freight with Zoptal's comprehensive logistics platform. 
            Your complete transportation solution is just 60 days away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-quote"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-indigo-600 shadow-lg hover:bg-indigo-50 transition-all duration-200"
            >
              Get Fleet Demo
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold text-white hover:bg-white hover:text-indigo-600 transition-all duration-200"
            >
              <ChartBarIcon className="mr-2 h-5 w-5" />
              View ROI Calculator
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: 'Platforms Launched', value: '150+' },
              { label: 'Loads Processed', value: '10M+' },
              { label: 'Countries', value: '25+' },
              { label: 'Success Rate', value: '92%' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-indigo-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}