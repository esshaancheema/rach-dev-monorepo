import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  CalendarDaysIcon,
  MapPinIcon,
  TicketIcon,
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
  QrCodeIcon,
  BuildingOfficeIcon,
  RocketLaunchIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  VideoCameraIcon,
  FilmIcon,
  GiftIcon,
  BuildingLibraryIcon,
  ServerStackIcon,
  CloudIcon,
  PresentationChartLineIcon,
  BanknotesIcon,
  TagIcon,
  SpeakerWaveIcon,
  PhotoIcon,
  CameraIcon,
  MicrophoneIcon,
  EnvelopeIcon,
  AtSymbolIcon
} from '@heroicons/react/24/outline';
import EventBookingHeroImage from '@/components/EventBookingHeroImage';

export const metadata: Metadata = {
  title: 'Event & Venue Booking Platform Development | Eventbrite Clone | Zoptal',
  description: 'Launch your event booking platform in 60 days. Complete venue management with real-time availability, ticket booking, and payment processing. Investment from $20K-55K+.',
  keywords: [
    'event booking platform',
    'venue management system',
    'ticket booking software',
    'eventbrite clone',
    'party planning platform',
    'movie theater booking',
    'corporate event management',
    'event planning software',
    'venue booking system',
    'event ticketing platform',
    'booking management system',
    'event organizer platform',
    'real-time booking',
    'event discovery platform',
    'venue rental software'
  ],
  openGraph: {
    title: 'Event & Venue Booking Platform Development | Zoptal',
    description: 'Launch your event booking platform in 60 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: CalendarDaysIcon,
    title: 'Real-Time Availability',
    description: 'Live availability tracking with instant booking confirmations and calendar synchronization.'
  },
  {
    icon: CreditCardIcon,
    title: 'Integrated Payment Processing',
    description: 'Secure PCI-compliant payment gateway with multiple payment options and automated refunds.'
  },
  {
    icon: ChartBarIcon,
    title: 'Multi-Event Management',
    description: 'Comprehensive dashboard for managing multiple events, venues, and booking workflows simultaneously.'
  },
  {
    icon: ClockIcon,
    title: '60-Day Launch Timeline',
    description: 'Complete event booking platform deployment in 30-75 days depending on feature requirements.'
  }
];

const platformTypes = [
  {
    title: 'Event Booking Platform',
    description: 'Eventbrite-style event discovery and ticketing',
    icon: TicketIcon,
    features: [
      'Event discovery and search functionality',
      'Ticket booking with seat selection',
      'Multi-tier pricing and discounts',
      'Social sharing and invitations',
      'Mobile-optimized booking flow',
      'QR code tickets and check-in',
      'Waitlist management for sold-out events',
      'Group booking and bulk discounts'
    ]
  },
  {
    title: 'Venue Booking System',
    description: 'Space rental and availability management',
    icon: BuildingOfficeIcon,
    features: [
      'Real-time availability calendar',
      'Multi-space and room management',
      'Dynamic pricing and seasonal rates',
      'Resource allocation and equipment booking',
      'Contract management and digital agreements',
      'Venue showcase with photo galleries',
      'Capacity management and layout tools',
      'Booking confirmation workflows'
    ]
  },
  {
    title: 'Movie Theater Booking',
    description: 'Cinema ticket reservations and seat selection',
    icon: FilmIcon,
    features: [
      'Interactive seating charts',
      'Showtimes and movie listings',
      'Concession stand pre-ordering',
      'Loyalty programs and memberships',
      'Age restriction enforcement',
      'Group booking for theaters',
      'Premium seating upgrades',
      'Mobile ticket scanning'
    ]
  },
  {
    title: 'Party Planning Platform',
    description: 'Complete party and celebration management',
    icon: GiftIcon,
    features: [
      'Event theme and package selection',
      'Vendor marketplace integration',
      'Guest list management and invitations',
      'Catering and menu coordination',
      'Entertainment booking and scheduling',
      'Decoration and setup planning',
      'Photography and videography booking',
      'Party timeline and coordination tools'
    ]
  },
  {
    title: 'Corporate Event Management',
    description: 'Business meeting and conference booking',
    icon: BuildingLibraryIcon,
    features: [
      'Meeting room availability and booking',
      'Conference and seminar management',
      'Speaker and presenter coordination',
      'Corporate catering integration',
      'AV equipment booking and setup',
      'Attendee registration and badges',
      'Expense tracking and reporting',
      'Multi-location event coordination'
    ]
  }
];

const attendeeFeatures = [
  {
    icon: MagnifyingGlassIcon,
    title: 'Event Discovery',
    description: 'Browse events by category, location, date, and interests with intelligent recommendations.'
  },
  {
    icon: TicketIcon,
    title: 'Ticket Booking',
    description: 'Secure payment processing with instant confirmation and digital ticket delivery.'
  },
  {
    icon: MapPinIcon,
    title: 'Seat Selection',
    description: 'Interactive seating charts with real-time availability and preference-based suggestions.'
  },
  {
    icon: CalendarDaysIcon,
    title: 'Calendar Integration',
    description: 'Automatic calendar synchronization with reminders and event updates.'
  },
  {
    icon: ShareIcon,
    title: 'Social Sharing',
    description: 'Share events with friends, create group bookings, and social media integration.'
  },
  {
    icon: QrCodeIcon,
    title: 'Mobile Tickets',
    description: 'Digital tickets with QR codes for contactless entry and mobile wallet integration.'
  }
];

const organizerFeatures = [
  {
    icon: RocketLaunchIcon,
    title: 'Event Creation',
    description: 'Complete event setup with multimedia, scheduling, and comprehensive event details.'
  },
  {
    icon: TagIcon,
    title: 'Ticket Management',
    description: 'Flexible pricing tiers, early bird discounts, promotional codes, and group rates.'
  },
  {
    icon: PresentationChartLineIcon,
    title: 'Revenue Analytics',
    description: 'Real-time sales tracking, revenue reporting, and detailed financial analytics.'
  },
  {
    icon: UserGroupIcon,
    title: 'Attendee Management',
    description: 'Guest list management, check-in systems, and attendee communication tools.'
  },
  {
    icon: SpeakerWaveIcon,
    title: 'Marketing Tools',
    description: 'Email campaigns, social media promotion, and integrated marketing automation.'
  },
  {
    icon: ChartBarIcon,
    title: 'Real-Time Sales',
    description: 'Live ticket sales monitoring, inventory tracking, and automated notifications.'
  }
];

const venueFeatures = [
  {
    icon: CalendarDaysIcon,
    title: 'Availability Management',
    description: 'Real-time booking calendar with conflict prevention and automated scheduling.'
  },
  {
    icon: BanknotesIcon,
    title: 'Pricing Controls',
    description: 'Dynamic pricing models, seasonal rates, and demand-based pricing optimization.'
  },
  {
    icon: CpuChipIcon,
    title: 'Resource Management',
    description: 'Equipment, catering, staff coordination with availability and booking integration.'
  },
  {
    icon: DocumentCheckIcon,
    title: 'Contract Management',
    description: 'Digital booking agreements, terms management, and automated contract workflows.'
  },
  {
    icon: BuildingOfficeIcon,
    title: 'Multi-Space Support',
    description: 'Manage multiple rooms, areas, and venues from a single comprehensive dashboard.'
  },
  {
    icon: ChartBarIcon,
    title: 'Performance Analytics',
    description: 'Booking rates, revenue tracking, utilization reports, and performance insights.'
  }
];

const technologyFeatures = [
  {
    icon: ServerStackIcon,
    title: 'Scalable Architecture',
    description: 'Cloud-based infrastructure handling thousands of concurrent bookings with high performance.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Security & Compliance',
    description: 'PCI-DSS compliant payment processing with data encryption and privacy protection.'
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Mobile-First Design',
    description: 'Optimized mobile experience with progressive web app capabilities and offline functionality.'
  },
  {
    icon: CloudIcon,
    title: 'API Integration',
    description: 'Comprehensive APIs for third-party integrations, payment gateways, and calendar systems.'
  }
];

const successMetrics = [
  {
    metric: '500K+',
    description: 'Monthly Bookings Processed',
    icon: TicketIcon
  },
  {
    metric: '$2M+',
    description: 'Monthly Revenue Potential',
    icon: BanknotesIcon
  },
  {
    metric: '85%',
    description: 'Average Booking Conversion',
    icon: ChartBarIcon
  },
  {
    metric: '30 Sec',
    description: 'Average Booking Time',
    icon: ClockIcon
  }
];

const pricingTiers = [
  {
    name: 'Starter Package',
    price: '$20,000',
    description: 'Perfect for basic event booking needs',
    timeline: '30-45 days',
    highlighted: false,
    features: [
      'Event booking website and mobile app',
      'Basic payment processing integration',
      'Simple event creation and management',
      'Attendee registration and ticketing',
      'Basic analytics and reporting',
      'Email notifications and confirmations',
      '30 days of support and maintenance',
      'Standard hosting and deployment'
    ]
  },
  {
    name: 'Professional Package',
    price: '$35,000',
    description: 'Complete event management solution',
    timeline: '45-60 days',
    highlighted: true,
    features: [
      'Everything in Starter Package',
      'Advanced venue management portal',
      'Multi-event and multi-venue support',
      'Marketing automation and campaigns',
      'Advanced analytics and insights',
      'Payment gateway customization',
      'Social media integration',
      '90 days of support and maintenance'
    ]
  },
  {
    name: 'Enterprise Package',
    price: '$55,000',
    description: 'Complete event ecosystem with customization',
    timeline: '60-75 days',
    highlighted: false,
    features: [
      'Everything in Professional Package',
      'White-label customization options',
      'Advanced API integrations',
      'Custom branding and theming',
      'Priority support and development',
      'Advanced security features',
      'Dedicated account management',
      '6 months of support and maintenance'
    ]
  }
];

export default function EventBookingPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Launch Your Event Booking Platform in
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400"> 60 Days</span>
              </h1>
              <p className="mt-6 text-xl text-blue-100">
                Revolutionize event planning with Zoptal's comprehensive booking platform. 
                Connect event organizers, venues, and attendees through intelligent booking, 
                payment processing, and event management tools.
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {features.map((feature, index) => (
                  <div key={index} className="text-center">
                    <feature.icon className="mx-auto h-8 w-8 text-orange-400" />
                    <p className="mt-2 text-sm font-medium text-blue-100">{feature.title}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact?service=event-booking&demo=true"
                  className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-orange-500 hover:shadow-2xl hover:scale-105"
                >
                  View Booking Demo
                  <PlayIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/contact?service=event-booking&portal=venue"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-blue-300 bg-blue-800/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-blue-700/50"
                >
                  See Venue Portal
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>

            <div>
              <EventBookingHeroImage className="lg:ml-8" />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Types */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Complete Event Booking Solutions
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive platforms for every type of event booking need, from simple ticket sales to complex venue management systems.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {platformTypes.map((platform, index) => (
              <div key={index} className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-blue-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
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

      {/* For Event Attendees */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Seamless Experience for Event Attendees
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Intuitive booking experience that makes discovering and attending events effortless
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {attendeeFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Event Organizers */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Powerful Tools for Event Organizers
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Complete event management suite with marketing, analytics, and revenue optimization
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {organizerFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-indigo-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Venues */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Advanced Management for Venues
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Comprehensive venue management with pricing optimization and resource coordination
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {venueFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
      <section className="py-24 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Enterprise-Grade Technology Stack
            </h2>
            <p className="mt-6 text-xl text-blue-100">
              Robust, scalable infrastructure designed for high-volume booking operations
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {technologyFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-blue-200 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-24 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Proven Results & Industry Impact
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Our event booking platforms deliver measurable results across key performance metrics
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {successMetrics.map((metric, index) => (
              <div key={index} className="text-center p-8 bg-white rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg flex items-center justify-center mx-auto mb-4">
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
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Choose Your Event Booking Solution
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Flexible pricing options designed to scale with your business growth and booking volume
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
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
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
                  href="/contact?service=event-booking"
                  className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
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
      <section className="py-24 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Ready to Transform Event Booking?
          </h2>
          <p className="mt-6 text-xl text-blue-100">
            Build the next generation of event and venue booking with Zoptal's comprehensive platform. 
            Complete solution for events, venues, and ticketing in one powerful system.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <ServerStackIcon className="mx-auto h-12 w-12 text-orange-400" />
              <h3 className="mt-4 text-lg font-semibold">Complete Solution</h3>
              <p className="mt-2 text-sm text-blue-100">Events, venues, and ticketing in one platform</p>
            </div>
            <div className="text-center">
              <DevicePhoneMobileIcon className="mx-auto h-12 w-12 text-orange-400" />
              <h3 className="mt-4 text-lg font-semibold">Mobile-First Design</h3>
              <p className="mt-2 text-sm text-blue-100">Optimized for mobile booking experience</p>
            </div>
            <div className="text-center">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-orange-400" />
              <h3 className="mt-4 text-lg font-semibold">Secure Payments</h3>
              <p className="mt-2 text-sm text-blue-100">PCI-compliant payment processing</p>
            </div>
            <div className="text-center">
              <RocketLaunchIcon className="mx-auto h-12 w-12 text-orange-400" />
              <h3 className="mt-4 text-lg font-semibold">Scalable Technology</h3>
              <p className="mt-2 text-sm text-blue-100">Handle thousands of concurrent bookings</p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact?service=event-booking"
              className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-orange-500 hover:shadow-2xl hover:scale-105"
            >
              Schedule Strategy Call
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact?service=quote"
              className="inline-flex items-center justify-center rounded-xl border-2 border-blue-300 bg-blue-800/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-blue-700/50"
            >
              Get Custom Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}