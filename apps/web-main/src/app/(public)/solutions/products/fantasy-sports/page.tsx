import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  TrophyIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  DocumentCheckIcon,
  RocketLaunchIcon,
  DevicePhoneMobileIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  UsersIcon,
  BeakerIcon,
  CubeTransparentIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  PuzzlePieceIcon,
  MagnifyingGlassIcon,
  WifiIcon,
  CloudIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/outline';
import FantasySportsHeroImage from '@/components/FantasySportsHeroImage';

export const metadata: Metadata = {
  title: 'Fantasy Sports & Gaming Platform | DraftKings-Style Solution | Zoptal',
  description: 'Launch your fantasy sports empire in 90 days. Complete DraftKings-style gaming platform with real-time contests, player drafts, and multi-sport coverage. Investment from $50K-200K+.',
  keywords: [
    'fantasy sports platform',
    'daily fantasy sports app',
    'DraftKings alternative',
    'sports betting software',
    'fantasy gaming platform',
    'contest management system',
    'player draft software',
    'sports analytics platform',
    'fantasy sports marketplace',
    'real-time scoring system',
    'multi-sport fantasy platform',
    'fantasy sports betting',
    'gaming platform development',
    'sports contest software',
    'fantasy league management'
  ],
  openGraph: {
    title: 'Fantasy Sports & Gaming Platform | Zoptal',
    description: 'Launch your fantasy sports empire in 90 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: TrophyIcon,
    title: 'Real-Time Contest Management',
    description: 'Live contest creation with dynamic prize pools, salary cap mechanics, and real-time leaderboard updates.'
  },
  {
    icon: ChartBarIcon,
    title: 'Advanced Sports Analytics',
    description: 'Comprehensive player statistics, predictive modeling, and performance analytics across all major sports.'
  },
  {
    icon: UserGroupIcon,
    title: 'Multi-Sport Platform Support',
    description: 'Complete coverage for NFL, NBA, MLB, NHL, Soccer, and more with sport-specific draft mechanics.'
  },
  {
    icon: ClockIcon,
    title: '90-Day Launch Timeline',
    description: 'Complete fantasy sports gaming platform ready to launch in 60-150 days with full regulatory compliance.'
  }
];

const platformTypes = [
  {
    title: 'Player Gaming Platform',
    description: 'Consumer-facing fantasy sports experience',
    icon: DevicePhoneMobileIcon,
    features: [
      'Contest entry and draft participation',
      'Real-time scoring and live leaderboards', 
      'Player research and analytics tools',
      'Social features and friend leagues',
      'Prize tracking and payout management',
      'Mobile-optimized gaming interface',
      'Multi-sport contest variety',
      'Beginner to expert skill levels'
    ]
  },
  {
    title: 'Operator Management Dashboard',
    description: 'Complete contest and business operations',
    icon: BuildingOffice2Icon,
    features: [
      'Contest creation and prize pool management',
      'Player acquisition and retention tools',
      'Revenue optimization and analytics',
      'Compliance and regulatory reporting',
      'Customer support integration',
      'Marketing campaign management',
      'Risk management and fraud detection',
      'Financial reporting and payouts'
    ]
  },
  {
    title: 'Analytics & Intelligence Suite',
    description: 'Advanced gaming insights and optimization',
    icon: ChartBarIcon,
    features: [
      'Player behavior analytics and segmentation',
      'Contest performance optimization',
      'Real-time fraud detection systems',
      'Predictive modeling for player outcomes',
      'Business intelligence dashboards',
      'Market trend analysis',
      'Automated reporting systems',
      'Performance benchmarking tools'
    ]
  }
];

const pricingTiers = [
  {
    name: 'Starter Gaming Platform',
    price: '$50,000',
    timeline: '60-90 days',
    description: 'Essential fantasy sports platform with core gaming features',
    features: [
      'Basic contest management system',
      'Single sport support (NFL or NBA)',
      'Standard player draft interface',
      'Simple scoring and leaderboards',
      'Basic mobile app (iOS/Android)',
      'Payment processing integration',
      'Essential analytics dashboard',
      '1-year technical support'
    ],
    highlighted: false
  },
  {
    name: 'Professional Gaming Suite',
    price: '$100,000',
    timeline: '75-120 days',
    description: 'Advanced multi-sport platform with comprehensive features',
    features: [
      'Multi-sport contest management',
      'Advanced draft and auction systems',
      'Real-time scoring and statistics',
      'Social features and friend leagues',
      'Advanced analytics and insights',
      'Custom branding and white-labeling',
      'Regulatory compliance tools',
      'Marketing automation features',
      'Admin panel and operator tools',
      '2-year technical support'
    ],
    highlighted: true
  },
  {
    name: 'Enterprise Gaming Platform',
    price: '$200,000+',
    timeline: '90-150 days',
    description: 'Complete fantasy sports ecosystem with custom development',
    features: [
      'Full multi-sport gaming platform',
      'Custom features and integrations',
      'Advanced fraud detection and security',
      'Comprehensive regulatory compliance',
      'Custom mobile and web applications',
      'Third-party API integrations',
      'Advanced business intelligence',
      'Custom reporting and analytics',
      'Dedicated development team',
      '24/7 priority support',
      'Revenue sharing opportunities'
    ],
    highlighted: false
  }
];

const complianceFeatures = [
  {
    icon: LockClosedIcon,
    title: 'Multi-State Compliance',
    description: 'Full compliance with fantasy sports regulations across all legal jurisdictions'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Age Verification System',
    description: 'Robust identity verification and responsible gaming safeguards'
  },
  {
    icon: ExclamationTriangleIcon,
    title: 'Fraud Detection & Prevention',
    description: 'Advanced algorithms to detect suspicious activity and ensure fair play'
  },
  {
    icon: BanknotesIcon,
    title: 'Secure Payment Processing',
    description: 'PCI-compliant payment systems with instant prize distribution'
  }
];

const gamingFeatures = [
  {
    icon: FireIcon,
    title: 'Live Scoring Engine',
    description: 'Real-time player performance tracking with instant leaderboard updates'
  },
  {
    icon: BoltIcon,
    title: 'Dynamic Prize Pools',
    description: 'Flexible contest structures with guaranteed and variable prize distributions'
  },
  {
    icon: PuzzlePieceIcon,
    title: 'Draft Optimization Tools',
    description: 'Advanced player selection tools with salary cap optimization'
  },
  {
    icon: MagnifyingGlassIcon,
    title: 'Player Research Hub',
    description: 'Comprehensive statistics, projections, and expert analysis integration'
  }
];

const technicalFeatures = [
  {
    icon: CloudIcon,
    title: 'Cloud-Native Architecture',
    description: 'Scalable infrastructure handling millions of concurrent users and real-time updates'
  },
  {
    icon: WifiIcon,
    title: 'Real-Time Data Integration',
    description: 'Live sports data feeds with sub-second latency for instant scoring updates'
  },
  {
    icon: CpuChipIcon,
    title: 'AI-Powered Insights',
    description: 'Machine learning algorithms for player projections and contest optimization'
  },
  {
    icon: CubeTransparentIcon,
    title: 'Blockchain Integration',
    description: 'Optional cryptocurrency payments and transparent prize distribution systems'
  }
];

const sportsCoverage = [
  { name: 'NFL Football', season: 'Sep-Feb', contests: '50,000+' },
  { name: 'NBA Basketball', season: 'Oct-Jun', contests: '40,000+' },
  { name: 'MLB Baseball', season: 'Mar-Oct', contests: '35,000+' },
  { name: 'NHL Hockey', season: 'Oct-Jun', contests: '25,000+' },
  { name: 'Soccer/MLS', season: 'Year-round', contests: '20,000+' },
  { name: 'PGA Golf', season: 'Year-round', contests: '15,000+' }
];

const testimonials = [
  {
    quote: "Zoptal delivered a world-class fantasy sports platform that rivals DraftKings. Our user engagement increased 300% in the first month.",
    author: "Alex Chen",
    role: "CEO, GameTime Sports",
    rating: 5
  },
  {
    quote: "The real-time scoring and fraud detection features are exceptional. We've processed over $2M in contests with zero security issues.",
    author: "Maria Rodriguez",
    role: "CTO, FantasyPro",
    rating: 5
  }
];

export default function FantasySportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full mb-6">
                <TrophyIcon className="w-4 h-4 mr-2" />
                Fantasy Sports & Gaming Platform
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Launch Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
                  Fantasy Sports Empire
                </span>
                in 90 Days
              </h1>
              
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                Complete DraftKings-style gaming solution with real-time contests, advanced analytics, 
                and multi-sport coverage. Tap into the $8.2B daily fantasy sports market with our 
                proven platform technology.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/get-quote"
                  className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors group"
                >
                  Start Your Gaming Platform
                  <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="inline-flex items-center justify-center border-2 border-purple-300 text-purple-100 hover:bg-purple-800/50 font-semibold px-8 py-4 rounded-xl transition-colors">
                  <PlayIcon className="mr-2 w-5 h-5" />
                  Watch Platform Demo
                </button>
              </div>
            </div>
            
            <div className="lg:pl-8">
              <FantasySportsHeroImage className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Fantasy Sports Gaming Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to compete with DraftKings, FanDuel, and other major fantasy sports platforms
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="relative bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-purple-100">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Types */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Three Complete Gaming Platforms
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive fantasy sports ecosystem covering all stakeholders
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {platformTypes.map((platform, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 shadow-lg border border-purple-100">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <platform.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{platform.title}</h3>
                <p className="text-purple-600 font-medium mb-6">{platform.description}</p>
                <ul className="space-y-3">
                  {platform.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gaming Features */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Advanced Gaming Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional-grade features that power the world's leading fantasy sports platforms
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {gamingFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports Coverage */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Multi-Sport Coverage
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Support for all major sports leagues with year-round contest opportunities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sportsCoverage.map((sport, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{sport.name}</h3>
                  <span className="text-sm text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded">{sport.contests}</span>
                </div>
                <p className="text-sm text-gray-600">Season: {sport.season}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance & Security */}
      <section className="py-24 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Regulatory Compliance & Security
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built-in compliance features for legal fantasy sports operations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {complianceFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Scalable infrastructure and cutting-edge features for professional gaming operations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technicalFeatures.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg border border-blue-100">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fantasy Sports Platform Investment
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the gaming platform that matches your business goals and market entry strategy
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative rounded-2xl p-8 shadow-xl ${
                tier.highlighted 
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white' 
                  : 'bg-white border border-purple-100'
              }`}>
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {tier.name}
                  </h3>
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${tier.highlighted ? 'text-white' : 'text-purple-600'}`}>
                      {tier.price}
                    </span>
                  </div>
                  <p className={`text-sm ${tier.highlighted ? 'text-purple-100' : 'text-gray-600'}`}>
                    {tier.timeline}
                  </p>
                </div>
                
                <p className={`text-center mb-8 ${tier.highlighted ? 'text-purple-100' : 'text-gray-600'}`}>
                  {tier.description}
                </p>
                
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                        tier.highlighted ? 'text-purple-200' : 'text-purple-500'
                      }`} />
                      <span className={`text-sm ${tier.highlighted ? 'text-white' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-4 px-6 rounded-xl font-semibold transition-colors ${
                  tier.highlighted
                    ? 'bg-white text-purple-600 hover:bg-purple-50'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how gaming entrepreneurs are building successful fantasy sports businesses
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-purple-100">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-800 mb-6 text-lg leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Launch Your Fantasy Sports Platform?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join the $8.2B fantasy sports market with a proven platform that rivals DraftKings and FanDuel.
              Get started with a custom quote today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-quote"
                className="inline-flex items-center justify-center bg-white text-purple-600 font-semibold px-8 py-4 rounded-xl hover:bg-purple-50 transition-colors group"
              >
                <RocketLaunchIcon className="mr-2 w-5 h-5" />
                Start Your Gaming Platform
                <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-purple-700 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="mr-2 w-5 h-5" />
                Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}