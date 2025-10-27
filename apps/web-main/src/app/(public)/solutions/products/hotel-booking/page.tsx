import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ChartBarIcon,
  BellAlertIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  RocketLaunchIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  DocumentCheckIcon,
  VideoCameraIcon,
  KeyIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  PresentationChartLineIcon,
  TagIcon,
  ServerStackIcon,
  CloudIcon,
  HomeModernIcon,
  IdentificationIcon,
  PhotoIcon,
  PhoneIcon,
  EnvelopeIcon,
  BanknotesIcon,
  HandRaisedIcon,
  TrophyIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  QrCodeIcon,
  WifiIcon,
  SwatchIcon,
  HeartIcon,
  FireIcon,
  SunIcon,
  SnowflakeIcon,
  ChartPieIcon,
  LinkIcon,
  ShareIcon,
  BellIcon,
  CogIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  CommandLineIcon,
  WindowIcon,
  LanguageIcon,
  CubeTransparentIcon,
  BookOpenIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import HotelBookingHeroImage from '@/components/HotelBookingHeroImage';

export const metadata: Metadata = {
  title: 'Hotel & Accommodation Booking Platform Development | Booking.com Clone | Zoptal',
  description: 'Build your hotel booking platform in 60 days. Complete hospitality solution with dynamic pricing and property management. Investment from $30K-80K+.',
  keywords: [
    'hotel booking platform',
    'booking.com clone',
    'hotel management system',
    'vacation rental platform',
    'property management software',
    'hotel reservation system',
    'accommodation booking app',
    'hospitality software',
    'travel booking platform',
    'hotel channel manager',
    'revenue management system',
    'property booking software',
    'hotel technology platform',
    'travel technology solution',
    'hospitality management system'
  ],
  openGraph: {
    title: 'Hotel & Accommodation Booking Platform Development | Zoptal',
    description: 'Build your hotel booking platform in 60 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: BuildingOfficeIcon,
    title: 'Real-Time Room Availability',
    description: 'Live inventory management with instant booking confirmation and dynamic room allocation across multiple properties.'
  },
  {
    icon: UsersIcon,
    title: 'Multi-Property Management',
    description: 'Comprehensive management system for multiple hotels, resorts, and accommodation properties from one platform.'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Dynamic Pricing Engine',
    description: 'AI-powered pricing optimization with demand-based rates and revenue management algorithms.'
  },
  {
    icon: ClockIcon,
    title: '60-Day Launch Timeline',
    description: 'Complete hotel booking platform deployment in 45-90 days depending on feature complexity.'
  }
];

const platformTypes = [
  {
    title: 'Hotel Booking Platform',
    description: 'Booking.com-style accommodation search',
    icon: BuildingOfficeIcon,
    features: [
      'Advanced search and filtering system',
      'Real-time availability and instant booking',
      'Interactive maps and location-based search',
      'User reviews and rating system',
      'Price comparison and deals showcase',
      'Mobile-optimized booking experience',
      'Multi-language and multi-currency support',
      'Loyalty program integration and rewards'
    ]
  },
  {
    title: 'Property Management System',
    description: 'Complete hotel operations management',
    icon: CogIcon,
    features: [
      'Room inventory and allocation management',
      'Reservation management and guest profiles',
      'Housekeeping and maintenance scheduling',
      'Staff coordination and task management',
      'Financial reporting and accounting integration',
      'Guest communication and service requests',
      'Revenue analytics and performance metrics',
      'Integration with existing hotel systems'
    ]
  },
  {
    title: 'Vacation Rental Platform',
    description: 'Airbnb-style short-term rentals',
    icon: HomeModernIcon,
    features: [
      'Property listing and photo management',
      'Calendar synchronization and availability',
      'Guest screening and verification system',
      'Automated pricing and rate optimization',
      'Cleaning and maintenance coordination',
      'Guest communication and check-in process',
      'Payment processing and payout management',
      'Property performance analytics'
    ]
  },
  {
    title: 'Corporate Travel',
    description: 'Business travel and group booking management',
    icon: IdentificationIcon,
    features: [
      'Corporate account management and billing',
      'Group booking and event coordination',
      'Travel policy compliance and approval workflows',
      'Expense management and reporting',
      'Preferred rates and contract management',
      'Travel itinerary and booking management',
      'Integration with corporate travel systems',
      'Advanced reporting and analytics'
    ]
  },
  {
    title: 'Resort & Package Deals',
    description: 'Complete vacation package booking',
    icon: SunIcon,
    features: [
      'Package creation and bundle management',
      'Activity and excursion booking integration',
      'Dining and spa service reservations',
      'Transportation and transfer coordination',
      'All-inclusive pricing and package customization',
      'Guest experience and itinerary planning',
      'Resort amenities and facilities booking',
      'Seasonal and promotional package management'
    ]
  }
];

const travelerFeatures = [
  {
    icon: MagnifyingGlassIcon,
    title: 'Smart Search & Filters',
    description: 'Advanced search with location, price, amenities, ratings, and availability filters for perfect accommodation matching.'
  },
  {
    icon: CalendarDaysIcon,
    title: 'Real-Time Availability',
    description: 'Live room inventory with instant booking confirmation and immediate reservation processing.'
  },
  {
    icon: VideoCameraIcon,
    title: 'Virtual Tours',
    description: '360-degree room and property views with high-quality photos and immersive virtual experiences.'
  },
  {
    icon: ChartBarIcon,
    title: 'Price Comparison',
    description: 'Compare rates across different booking platforms and find the best deals and value propositions.'
  },
  {
    icon: TrophyIcon,
    title: 'Loyalty Programs',
    description: 'Points, rewards, exclusive member benefits, and personalized offers for frequent travelers.'
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Mobile Check-In',
    description: 'Contactless check-in process with digital room keys and seamless arrival experience.'
  },
  {
    icon: ClipboardDocumentListIcon,
    title: 'Trip Management',
    description: 'Complete itinerary planning, booking modifications, and travel assistance throughout the journey.'
  },
  {
    icon: StarIcon,
    title: 'Review System',
    description: 'Comprehensive guest reviews, property ratings, and authentic feedback from verified stays.'
  }
];

const hotelOwnerFeatures = [
  {
    icon: CurrencyDollarIcon,
    title: 'Revenue Management',
    description: 'Dynamic pricing optimization with yield management and demand-based rate adjustments.'
  },
  {
    icon: AdjustmentsHorizontalIcon,
    title: 'Inventory Control',
    description: 'Room type management, allocation strategies, and availability optimization across channels.'
  },
  {
    icon: PresentationChartLineIcon,
    title: 'Booking Analytics',
    description: 'Comprehensive occupancy rates, revenue metrics, forecasting, and performance analysis.'
  },
  {
    icon: ShareIcon,
    title: 'Channel Management',
    description: 'Multi-platform distribution with rate parity maintenance and booking synchronization.'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Guest Communications',
    description: 'Automated pre-arrival, during-stay, and post-checkout messaging and engagement.'
  },
  {
    icon: SparklesIcon,
    title: 'Housekeeping Management',
    description: 'Room status tracking, cleaning schedules, and maintenance coordination systems.'
  },
  {
    icon: UsersIcon,
    title: 'Staff Coordination',
    description: 'Employee scheduling, task management, and operational workflow optimization.'
  },
  {
    icon: DocumentCheckIcon,
    title: 'Financial Reporting',
    description: 'Revenue tracking, accounting integration, and comprehensive financial analytics.'
  }
];

const platformOperatorFeatures = [
  {
    icon: BuildingOfficeIcon,
    title: 'Multi-Property Support',
    description: 'Centralized management for multiple hotels and accommodations with unified operations.'
  },
  {
    icon: BanknotesIcon,
    title: 'Commission Management',
    description: 'Flexible pricing models, revenue sharing, and automated commission processing.'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Marketing Tools',
    description: 'Promotional campaigns, featured listings, and comprehensive marketing automation.'
  },
  {
    icon: PhoneIcon,
    title: 'Customer Support',
    description: '24/7 booking assistance, issue resolution, and comprehensive guest support services.'
  },
  {
    icon: CreditCardIcon,
    title: 'Payment Processing',
    description: 'Secure multi-currency payments with automated payouts and fraud protection.'
  },
  {
    icon: ChartPieIcon,
    title: 'Analytics Dashboard',
    description: 'Platform performance metrics, business intelligence, and comprehensive reporting.'
  }
];

const advancedFeatures = [
  {
    category: 'Dynamic Pricing',
    icon: CurrencyDollarIcon,
    features: [
      {
        icon: TrophyIcon,
        title: 'Demand-Based Pricing',
        description: 'Automatic rate adjustments based on occupancy levels and market demand patterns.'
      },
      {
        icon: SunIcon,
        title: 'Seasonal Pricing',
        description: 'Peak season, events, and holiday rate optimization with intelligent pricing models.'
      },
      {
        icon: ChartBarIcon,
        title: 'Competitor Analysis',
        description: 'Real-time market rate monitoring and competitive pricing intelligence.'
      },
      {
        icon: CpuChipIcon,
        title: 'Revenue Optimization',
        description: 'AI-powered pricing recommendations and yield management strategies.'
      }
    ]
  },
  {
    category: 'Integration Capabilities',
    icon: LinkIcon,
    features: [
      {
        icon: CogIcon,
        title: 'PMS Integration',
        description: 'Seamless connectivity with existing property management systems and hotel software.'
      },
      {
        icon: ShareIcon,
        title: 'Channel Manager',
        description: 'Synchronization with Booking.com, Expedia, Airbnb, and other booking platforms.'
      },
      {
        icon: CreditCardIcon,
        title: 'Payment Gateways',
        description: 'Multiple payment options, currency support, and secure transaction processing.'
      },
      {
        icon: EnvelopeIcon,
        title: 'Marketing Platforms',
        description: 'Email marketing integration, social media connectivity, and CRM synchronization.'
      }
    ]
  },
  {
    category: 'Mobile Technology',
    icon: DevicePhoneMobileIcon,
    features: [
      {
        icon: DevicePhoneMobileIcon,
        title: 'Native Mobile Apps',
        description: 'iOS and Android applications for guests and hotel staff with offline capabilities.'
      },
      {
        icon: QrCodeIcon,
        title: 'Mobile Check-In',
        description: 'Contactless arrival and departure processes with digital room key integration.'
      },
      {
        icon: ChatBubbleLeftRightIcon,
        title: 'Digital Concierge',
        description: 'AI-powered guest assistance, recommendations, and 24/7 support services.'
      },
      {
        icon: BellIcon,
        title: 'Push Notifications',
        description: 'Real-time updates, promotional messages, and personalized guest communications.'
      }
    ]
  }
];

const businessModels = [
  {
    title: 'Commission-Based',
    description: '10-15% of room revenue per reservation',
    icon: BanknotesIcon,
    details: [
      'Booking commission on completed reservations',
      'Payment processing fees (2.9% + $0.30 per transaction)',
      'Additional revenue from upsell services',
      'Cancellation and modification fees'
    ]
  },
  {
    title: 'Subscription Model',
    description: '$99-499 monthly platform access',
    icon: TagIcon,
    details: [
      'Tiered subscription plans for different property sizes',
      'Feature-based pricing with basic, professional, enterprise tiers',
      'Volume-based pricing for high-booking properties',
      'Premium features including advanced analytics and marketing tools'
    ]
  },
  {
    title: 'Advertising Revenue',
    description: 'Featured listings and sponsored content',
    icon: RocketLaunchIcon,
    details: [
      'Premium placement in search results',
      'Sponsored property promotions and special offers',
      'Local business advertising (restaurants, attractions, services)',
      'Banner advertising throughout the platform'
    ]
  }
];

const successMetrics = [
  {
    metric: '3-5%',
    description: 'Visitor to Booking Conversion Rate',
    icon: ChartBarIcon
  },
  {
    metric: '$150-300',
    description: 'Average Booking Value',
    icon: BanknotesIcon
  },
  {
    metric: '70-90%',
    description: 'Average Hotel Occupancy Rates',
    icon: BuildingOfficeIcon
  },
  {
    metric: '500+',
    description: 'Hotels in Network First Year',
    icon: GlobeAltIcon
  }
];

const pricingTiers = [
  {
    name: 'Starter Package',
    price: '$30,000',
    description: 'Perfect for hotel booking platforms',
    timeline: '45-60 days',
    highlighted: false,
    features: [
      'Hotel search and booking website',
      'Mobile applications for guests',
      'Basic property management features',
      'Payment processing integration',
      'Guest review and rating system',
      'Basic analytics and reporting',
      '60 days of support and maintenance',
      'Standard hosting and deployment'
    ]
  },
  {
    name: 'Professional Package',
    price: '$50,000',
    description: 'Complete hospitality solution',
    timeline: '60-75 days',
    highlighted: true,
    features: [
      'Everything in Starter Package',
      'Advanced property management system',
      'Revenue management and dynamic pricing',
      'Multi-channel distribution management',
      'Guest communication automation',
      'Housekeeping and staff coordination',
      'Advanced analytics and business intelligence',
      '90 days of support and maintenance'
    ]
  },
  {
    name: 'Enterprise Package',
    price: '$80,000',
    description: 'Full hospitality ecosystem',
    timeline: '75-90 days',
    highlighted: false,
    features: [
      'Everything in Professional Package',
      'White-label platform customization',
      'Advanced API integrations',
      'Third-party connectivity and channel management',
      'Dedicated support and account management',
      'Custom branding and design',
      'Priority development and maintenance',
      '6 months of support and maintenance'
    ]
  }
];

export default function HotelBookingPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-amber-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-amber-600/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Build Your Hotel Booking Platform in
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400"> 60 Days</span>
              </h1>
              <p className="mt-6 text-xl text-blue-100">
                Revolutionize hospitality with Zoptal's comprehensive hotel booking and management platform. 
                Connect travelers with accommodations through intelligent search, real-time availability, 
                and seamless reservation management.
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {features.map((feature, index) => (
                  <div key={index} className="text-center">
                    <feature.icon className="mx-auto h-8 w-8 text-amber-400" />
                    <p className="mt-2 text-sm font-medium text-blue-100">{feature.title}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact?service=hotel-booking&demo=true"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-amber-500 hover:shadow-2xl hover:scale-105"
                >
                  View Booking Demo
                  <PlayIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/contact?service=hotel-booking&quote=true"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-blue-300 bg-blue-800/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-blue-700/50"
                >
                  Get Custom Quote
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>

            <div>
              <HotelBookingHeroImage className="lg:ml-8" />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Types */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-amber-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Complete Hotel & Accommodation Solutions
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive hospitality platform covering every aspect of hotel booking, property management, 
              and guest experience across all accommodation types.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {platformTypes.map((platform, index) => (
              <div key={index} className="relative bg-gradient-to-br from-blue-50 to-amber-50 rounded-2xl p-8 shadow-lg border border-blue-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-amber-600 rounded-lg flex items-center justify-center mb-4">
                  <platform.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{platform.title}</h3>
                <p className="text-gray-600 mb-6">{platform.description}</p>
                <ul className="space-y-3">
                  {platform.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Travelers */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Seamless Experience for Travelers
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Intuitive booking experience with advanced search, virtual tours, and mobile-first design
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {travelerFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Hotel Owners */}
      <section className="py-24 bg-gradient-to-br from-amber-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Powerful Tools for Hotel Owners
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Complete property management with revenue optimization and guest relationship tools
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {hotelOwnerFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Platform Operators */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Advanced Platform Management
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Comprehensive tools for managing multiple properties and optimizing platform performance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {platformOperatorFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Advanced Hospitality Technology Features
            </h2>
            <p className="mt-6 text-xl text-blue-100">
              Cutting-edge technology stack designed for modern hospitality and travel industry demands
            </p>
          </div>

          {advancedFeatures.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-16 last:mb-0">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">{category.category}</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {category.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="text-center p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                    <p className="text-blue-200 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Business Models */}
      <section className="py-24 bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Flexible Business Models & Revenue Streams
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Multiple monetization strategies designed to maximize hospitality platform profitability
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {businessModels.map((model, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-lg flex items-center justify-center mb-6">
                  <model.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{model.title}</h3>
                <p className="text-amber-600 font-medium mb-6">{model.description}</p>
                <ul className="space-y-3">
                  {model.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="text-sm text-gray-600 flex items-start">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3 mt-2"></div>
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
              Proven Hospitality Industry Results
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Our hotel booking platforms deliver measurable results across key hospitality performance indicators
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {successMetrics.map((metric, index) => (
              <div key={index} className="text-center p-8 bg-gradient-to-br from-blue-50 to-amber-50 rounded-2xl border border-blue-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-amber-600 rounded-lg flex items-center justify-center mx-auto mb-4">
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
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Choose Your Hotel Booking Solution
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Comprehensive pricing options designed to scale with your hospitality business growth and booking volume
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                tier.highlighted 
                  ? 'border-blue-500 shadow-blue-100' 
                  : 'border-gray-200'
              }`}>
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-amber-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
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
                  <div className="mt-3 text-sm text-blue-600 font-medium">
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
                  href="/contact?service=hotel-booking"
                  className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-blue-600 to-amber-600 text-white hover:from-blue-700 hover:to-amber-700 shadow-lg hover:shadow-xl'
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
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-amber-900 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Ready to Transform Hospitality Booking?
          </h2>
          <p className="mt-6 text-xl text-blue-100">
            Join the digital hospitality revolution with Zoptal's proven hotel technology. 
            Complete Booking.com-style platform with property management and revenue optimization.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-amber-400" />
              <h3 className="mt-4 text-lg font-semibold">Complete Solution</h3>
              <p className="mt-2 text-sm text-blue-100">Booking, management, and analytics in one platform</p>
            </div>
            <div className="text-center">
              <DevicePhoneMobileIcon className="mx-auto h-12 w-12 text-amber-400" />
              <h3 className="mt-4 text-lg font-semibold">Mobile-First Design</h3>
              <p className="mt-2 text-sm text-blue-100">Optimized for mobile booking and management</p>
            </div>
            <div className="text-center">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-amber-400" />
              <h3 className="mt-4 text-lg font-semibold">Revenue Optimization</h3>
              <p className="mt-2 text-sm text-blue-100">Dynamic pricing and yield management tools</p>
            </div>
            <div className="text-center">
              <GlobeAltIcon className="mx-auto h-12 w-12 text-amber-400" />
              <h3 className="mt-4 text-lg font-semibold">Global Scalability</h3>
              <p className="mt-2 text-sm text-blue-100">Multi-currency, multi-language support</p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact?service=hotel-booking&demo=true"
              className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-amber-500 hover:shadow-2xl hover:scale-105"
            >
              View Booking Demo
              <PlayIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact?service=hotel-booking&quote=true"
              className="inline-flex items-center justify-center rounded-xl border-2 border-blue-300 bg-blue-800/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-blue-700/50"
            >
              Get Custom Quote
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact?service=hotel-booking&guide=true"
              className="inline-flex items-center justify-center rounded-xl border-2 border-amber-300 bg-amber-800/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-amber-700/50"
            >
              Download Hospitality Guide
              <BookOpenIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}