import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  WrenchScrewdriverIcon,
  HomeIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  UserGroupIcon,
  ChartBarIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  TruckIcon,
  FireIcon,
  SparklesIcon,
  ScissorsIcon,
  PaintBrushIcon,
  CogIcon,
  DocumentCheckIcon,
  BanknotesIcon,
  HandThumbUpIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  BellAlertIcon,
  ServerStackIcon,
  CloudIcon,
  ChartPieIcon,
  UserIcon,
  IdentificationIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  PresentationChartLineIcon,
  TagIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import HomeServicesHeroImage from '@/components/HomeServicesHeroImage';

export const metadata: Metadata = {
  title: 'Home Services Marketplace Development | TaskRabbit & Handy Clone | Zoptal',
  description: 'Build your home services marketplace in 60 days. Connect homeowners with verified professionals. Complete TaskRabbit & Handy-style platform from $25K-65K+.',
  keywords: [
    'home services marketplace',
    'taskrabbit clone',
    'handy clone',
    'service provider platform',
    'home maintenance app',
    'cleaning service platform',
    'handyman booking app',
    'home repair marketplace',
    'local services platform',
    'professional services app',
    'home improvement platform',
    'landscaping service app',
    'moving services platform',
    'on-demand services',
    'service booking system'
  ],
  openGraph: {
    title: 'Home Services Marketplace Development | Zoptal',
    description: 'Build your home services marketplace in 60 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Verified Service Professionals',
    description: 'Comprehensive background checks, insurance verification, and skill validation for trusted service providers.'
  },
  {
    icon: CalendarDaysIcon,
    title: 'Real-Time Booking & Scheduling',
    description: 'Instant availability tracking with advanced calendar integration and automated scheduling systems.'
  },
  {
    icon: CreditCardIcon,
    title: 'Integrated Payment System',
    description: 'Secure escrow payments with automatic release upon job completion and satisfaction guarantee.'
  },
  {
    icon: ClockIcon,
    title: '60-Day Launch Timeline',
    description: 'Complete home services marketplace deployment in 45-90 days depending on feature requirements.'
  }
];

const serviceCategories = [
  {
    title: 'Home Maintenance',
    description: 'Plumbing, electrical, HVAC, handyman services',
    icon: WrenchScrewdriverIcon,
    features: [
      'Licensed plumber and electrician network',
      'Emergency repair services available 24/7',
      'HVAC maintenance and installation specialists',
      'General handyman for multiple repair needs',
      'Appliance repair and maintenance services',
      'Preventive maintenance scheduling',
      'Quality guarantee with insurance coverage',
      'Real-time service tracking and updates'
    ]
  },
  {
    title: 'Cleaning Services',
    description: 'House cleaning, deep cleaning, move-in/out cleaning',
    icon: SparklesIcon,
    features: [
      'Regular house cleaning scheduling',
      'Deep cleaning for special occasions',
      'Move-in and move-out cleaning services',
      'Post-construction cleanup specialists',
      'Eco-friendly cleaning options available',
      'Customizable cleaning checklists',
      'Same-day cleaning service availability',
      'Satisfaction guarantee with re-cleaning option'
    ]
  },
  {
    title: 'Landscaping & Lawn Care',
    description: 'Gardening, lawn maintenance, tree services',
    icon: ScissorsIcon,
    features: [
      'Weekly and monthly lawn maintenance',
      'Seasonal garden design and planting',
      'Tree trimming and removal services',
      'Irrigation system installation and repair',
      'Landscape design and hardscaping',
      'Snow removal and winter services',
      'Organic lawn care options',
      'Property maintenance for all seasons'
    ]
  },
  {
    title: 'Home Improvement',
    description: 'Painting, flooring, kitchen/bathroom renovation',
    icon: PaintBrushIcon,
    features: [
      'Interior and exterior painting services',
      'Flooring installation (hardwood, tile, carpet)',
      'Kitchen renovation and cabinet installation',
      'Bathroom remodeling and fixture installation',
      'Drywall repair and installation',
      'Custom carpentry and woodworking',
      'Home addition and remodeling projects',
      'Design consultation and material selection'
    ]
  },
  {
    title: 'Moving Services',
    description: 'Packing, moving, storage, furniture assembly',
    icon: TruckIcon,
    features: [
      'Full-service packing and unpacking',
      'Local and long-distance moving services',
      'Furniture disassembly and assembly',
      'Storage solutions and facility access',
      'Specialty item moving (piano, artwork)',
      'Moving supply delivery and setup',
      'Insurance coverage for belongings',
      'Real-time tracking during moves'
    ]
  }
];

const homeownerFeatures = [
  {
    icon: MagnifyingGlassIcon,
    title: 'Service Discovery',
    description: 'Browse verified professionals by service type, location, availability, and customer ratings.'
  },
  {
    icon: CalendarDaysIcon,
    title: 'Instant Booking',
    description: 'Schedule services with real-time availability and receive immediate confirmation and updates.'
  },
  {
    icon: CreditCardIcon,
    title: 'Secure Payments',
    description: 'Protected escrow payments held until job completion with multiple payment method options.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Quality Assurance',
    description: 'Service guarantees, insurance coverage, and satisfaction monitoring for peace of mind.'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Direct Communication',
    description: 'In-app messaging, photo sharing, and real-time updates throughout the service process.'
  },
  {
    icon: StarIcon,
    title: 'Review System',
    description: 'Rate and review services to help other homeowners and maintain service quality standards.'
  }
];

const providerFeatures = [
  {
    icon: UserIcon,
    title: 'Profile Management',
    description: 'Comprehensive professional profiles with credentials, portfolio, and service area management.'
  },
  {
    icon: ClipboardDocumentListIcon,
    title: 'Booking Management',
    description: 'Advanced calendar system with availability control, recurring service scheduling, and job tracking.'
  },
  {
    icon: BanknotesIcon,
    title: 'Payment Processing',
    description: 'Automatic payment processing with weekly payouts and detailed financial reporting.'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Customer Communication',
    description: 'Professional communication tools with photo sharing, job updates, and feedback collection.'
  },
  {
    icon: ChartBarIcon,
    title: 'Business Analytics',
    description: 'Performance metrics, customer feedback analysis, and business growth insights.'
  },
  {
    icon: AdjustmentsHorizontalIcon,
    title: 'Service Customization',
    description: 'Flexible service offerings, custom pricing, and specialized service packages.'
  }
];

const platformFeatures = [
  {
    icon: ShieldCheckIcon,
    title: 'Service Provider Network',
    description: 'Comprehensive vetting process including background checks, insurance verification, and skill assessments.'
  },
  {
    icon: CalendarDaysIcon,
    title: 'Instant Booking',
    description: 'Real-time availability matching with automated scheduling and conflict prevention.'
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: 'Work Order Management',
    description: 'Complete job lifecycle tracking from initial request through completion and payment.'
  },
  {
    icon: CreditCardIcon,
    title: 'Secure Payments',
    description: 'Escrow payment system with automatic release upon job completion and customer satisfaction.'
  },
  {
    icon: HandThumbUpIcon,
    title: 'Quality Assurance',
    description: 'Service guarantees, satisfaction monitoring, and continuous quality improvement programs.'
  },
  {
    icon: ChartPieIcon,
    title: 'Business Intelligence',
    description: 'Advanced analytics for marketplace optimization, demand forecasting, and revenue maximization.'
  }
];

const technologyFeatures = [
  {
    icon: ServerStackIcon,
    title: 'Scalable Platform',
    description: 'Cloud-based infrastructure supporting thousands of concurrent bookings and real-time operations.'
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Mobile-First Design',
    description: 'Native iOS and Android apps with offline capabilities and push notification systems.'
  },
  {
    icon: IdentificationIcon,
    title: 'Verification System',
    description: 'Automated background checks, license verification, and insurance validation systems.'
  },
  {
    icon: CloudIcon,
    title: 'API Integration',
    description: 'Seamless integration with payment gateways, calendar systems, and communication platforms.'
  }
];

const revenueModels = [
  {
    title: 'Commission Per Service',
    description: '10-20% of service booking value',
    icon: CurrencyDollarIcon,
    details: [
      'Percentage-based revenue on all completed services',
      'Tiered commission rates for high-volume providers',
      'Automatic deduction from provider payments',
      'Transparent fee structure for all parties'
    ]
  },
  {
    title: 'Subscription Plans',
    description: 'Monthly fees for service providers',
    icon: TagIcon,
    details: [
      'Premium membership with enhanced visibility',
      'Advanced booking management features',
      'Priority customer support access',
      'Detailed business analytics and insights'
    ]
  },
  {
    title: 'Lead Generation',
    description: 'Pay-per-lead for service professionals',
    icon: PresentationChartLineIcon,
    details: [
      'Quality leads matched to provider expertise',
      'Geographic and service-type targeting',
      'Lead quality scoring and filtering',
      'Performance tracking and optimization'
    ]
  },
  {
    title: 'Advertising Revenue',
    description: 'Promoted listings and featured services',
    icon: StarIcon,
    details: [
      'Featured placement in search results',
      'Sponsored service category promotions',
      'Banner advertising opportunities',
      'Local business partnership programs'
    ]
  }
];

const successMetrics = [
  {
    metric: '50K+',
    description: 'Service Requests Monthly',
    icon: ClipboardDocumentListIcon
  },
  {
    metric: '95%',
    description: 'Customer Satisfaction Rate',
    icon: HandThumbUpIcon
  },
  {
    metric: '$500K+',
    description: 'Monthly Revenue Potential',
    icon: BanknotesIcon
  },
  {
    metric: '48 Hours',
    description: 'Average Service Response Time',
    icon: ClockIcon
  }
];

const pricingTiers = [
  {
    name: 'Starter Package',
    price: '$25,000',
    description: 'Perfect for local service marketplaces',
    timeline: '45-60 days',
    highlighted: false,
    features: [
      'Customer and service provider mobile apps',
      'Basic booking and payment processing',
      'Rating and review system',
      'Admin dashboard for marketplace management',
      'Standard customer support',
      'Basic analytics and reporting',
      '30 days of support and maintenance',
      'Standard hosting and deployment setup'
    ]
  },
  {
    name: 'Professional Package',
    price: '$40,000',
    description: 'Complete home services platform',
    timeline: '60-75 days',
    highlighted: true,
    features: [
      'Everything in Starter Package',
      'Advanced scheduling and calendar management',
      'Multi-service provider support',
      'Marketing and promotional tools',
      'Advanced analytics and business intelligence',
      'Customer relationship management (CRM)',
      'Provider verification and background check system',
      '90 days of support and maintenance'
    ]
  },
  {
    name: 'Enterprise Package',
    price: '$65,000',
    description: 'Full marketplace ecosystem',
    timeline: '75-90 days',
    highlighted: false,
    features: [
      'Everything in Professional Package',
      'White-label customization options',
      'Advanced API integrations',
      'Multi-city expansion support',
      'Dedicated account management',
      'Priority development and support',
      'Custom branding and design',
      '6 months of support and maintenance'
    ]
  }
];

export default function HomeServicesPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-teal-800 to-emerald-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-teal-600/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Build Your Home Services Marketplace in
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400"> 60 Days</span>
              </h1>
              <p className="mt-6 text-xl text-green-100">
                Connect homeowners with trusted service professionals through Zoptal's comprehensive 
                home services platform. From plumbing to cleaning, manage bookings, payments, 
                and service delivery seamlessly.
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {features.map((feature, index) => (
                  <div key={index} className="text-center">
                    <feature.icon className="mx-auto h-8 w-8 text-orange-400" />
                    <p className="mt-2 text-sm font-medium text-green-100">{feature.title}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact?service=home-services&demo=true"
                  className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-orange-500 hover:shadow-2xl hover:scale-105"
                >
                  View Demo
                  <PlayIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/contact?service=home-services&portal=provider"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-green-300 bg-green-800/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-green-700/50"
                >
                  See Provider Portal
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>

            <div>
              <HomeServicesHeroImage className="lg:ml-8" />
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-green-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Complete Home Services Solutions
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive platform covering every home service need with verified professionals 
              and seamless booking experiences across all service categories.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {serviceCategories.map((category, index) => (
              <div key={index} className="relative bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 shadow-lg border border-green-100">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 mb-6">{category.description}</p>
                <ul className="space-y-3">
                  {category.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Homeowners */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Seamless Experience for Homeowners
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Effortless service discovery, booking, and management with trusted professional networks
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {homeownerFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Service Providers */}
      <section className="py-24 bg-gradient-to-br from-teal-50 to-green-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Powerful Tools for Service Providers
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Complete business management suite with booking, payment, and customer relationship tools
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {providerFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-teal-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Advanced Platform Features
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Comprehensive marketplace capabilities with quality assurance and business intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-green-50 to-slate-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology & Integration */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-green-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Enterprise-Grade Technology Stack
            </h2>
            <p className="mt-6 text-xl text-green-100">
              Robust, scalable infrastructure designed for high-volume service marketplace operations
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {technologyFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-green-200 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Models */}
      <section className="py-24 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Multiple Revenue Streams & Business Models
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Flexible monetization strategies designed to maximize platform profitability and growth
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {revenueModels.map((model, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg flex items-center justify-center mb-4">
                  <model.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{model.title}</h3>
                <p className="text-orange-600 font-medium mb-4">{model.description}</p>
                <ul className="space-y-2">
                  {model.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="text-sm text-gray-600 flex items-start">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 mt-2"></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Proven Results & Market Performance
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Our home services marketplaces deliver measurable results across key performance indicators
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {successMetrics.map((metric, index) => (
              <div key={index} className="text-center p-8 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border border-green-100">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <metric.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{metric.metric}</div>
                <div className="text-gray-600 font-medium">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-green-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Choose Your Home Services Platform
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Flexible pricing options designed to scale with your marketplace growth and service volume
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                tier.highlighted 
                  ? 'border-green-500 shadow-green-100' 
                  : 'border-gray-200'
              }`}>
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">{tier.description}</p>
                  <div className="mt-3 text-sm text-green-600 font-medium">
                    Launch Time: {tier.timeline}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm">
                      <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact?service=home-services"
                  className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl'
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
      <section className="py-24 bg-gradient-to-br from-green-900 via-teal-800 to-emerald-900 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Ready to Launch Your Home Services Platform?
          </h2>
          <p className="mt-6 text-xl text-green-100">
            Connect homeowners with trusted professionals through Zoptal's proven technology. 
            Complete TaskRabbit & Handy-style marketplace with comprehensive service management.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-orange-400" />
              <h3 className="mt-4 text-lg font-semibold">Trusted Network</h3>
              <p className="mt-2 text-sm text-green-100">Verified and insured service professionals</p>
            </div>
            <div className="text-center">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-orange-400" />
              <h3 className="mt-4 text-lg font-semibold">Seamless Experience</h3>
              <p className="mt-2 text-sm text-green-100">Easy booking and payment processing</p>
            </div>
            <div className="text-center">
              <HandThumbUpIcon className="mx-auto h-12 w-12 text-orange-400" />
              <h3 className="mt-4 text-lg font-semibold">Quality Guarantee</h3>
              <p className="mt-2 text-sm text-green-100">Service standards and customer protection</p>
            </div>
            <div className="text-center">
              <RocketLaunchIcon className="mx-auto h-12 w-12 text-orange-400" />
              <h3 className="mt-4 text-lg font-semibold">Scalable Platform</h3>
              <p className="mt-2 text-sm text-green-100">Grows with your service network</p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact?service=home-services"
              className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-orange-500 hover:shadow-2xl hover:scale-105"
            >
              Schedule Strategy Call
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact?service=quote"
              className="inline-flex items-center justify-center rounded-xl border-2 border-green-300 bg-green-800/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-green-700/50"
            >
              Get Custom Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}