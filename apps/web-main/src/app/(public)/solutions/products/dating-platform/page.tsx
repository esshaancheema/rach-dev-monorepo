import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  HeartIcon,
  VideoCameraIcon,
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
  ChatBubbleLeftRightIcon,
  BellAlertIcon,
  EyeSlashIcon,
  DocumentCheckIcon,
  RocketLaunchIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  UserIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  LockClosedIcon,
  FaceSmileIcon,
  LanguageIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import DatingPlatformHeroImage from '@/components/DatingPlatformHeroImage';

export const metadata: Metadata = {
  title: 'Dating App Development | Tinder & Bumble Clone Platform | Zoptal',
  description: 'Launch your dating empire in 60 days. Complete dating platform with AI matching, video chat, and safety features. Investment from $25K-90K+.',
  keywords: [
    'dating app development',
    'tinder clone',
    'bumble clone',
    'dating platform',
    'matchmaking app',
    'dating app builder',
    'swipe dating app',
    'video dating platform',
    'mobile dating app',
    'dating software',
    'relationship app',
    'social dating platform',
    'niche dating app',
    'dating app solution',
    'custom dating app'
  ],
  openGraph: {
    title: 'Dating App Development Platform | Zoptal',
    description: 'Launch your dating empire in 60 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: CpuChipIcon,
    title: 'Advanced Matching Algorithm',
    description: 'AI-powered compatibility analysis with behavioral learning and predictive analytics.'
  },
  {
    icon: VideoCameraIcon,
    title: 'Video Chat & Voice Calls',
    description: 'Secure in-app video calling and voice messaging for virtual dates and introductions.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'AI-Powered Safety Features',
    description: 'Identity verification, background checks, and comprehensive reporting systems.'
  },
  {
    icon: ClockIcon,
    title: '60-Day Launch Timeline',
    description: 'Complete dating platform deployment in 45-90 days depending on features.'
  }
];

const platformTypes = [
  {
    title: 'Swipe-Based Dating',
    description: 'Tinder-style matching system',
    features: [
      'Intuitive swipe gestures for matching',
      'Smart algorithm learns preferences',
      'Super likes and profile boosts',
      'Location-based user discovery',
      'Interest and hobby matching',
      'Mutual friends display',
      'Icebreaker message suggestions',
      'Age and distance filtering'
    ]
  },
  {
    title: 'Compatibility Dating',
    description: 'Algorithm-based matching like eHarmony',
    features: [
      'Comprehensive personality assessment',
      'Multi-factor compatibility scoring',
      'Behavioral analysis and learning',
      'Long-term relationship focus',
      'Deal breaker filtering system',
      'Lifestyle and values matching',
      'Relationship goal alignment',
      'Detailed compatibility reports'
    ]
  },
  {
    title: 'Video-First Dating',
    description: 'Face-to-face interaction platform',
    features: [
      'Video profile introductions',
      'Live video chat capabilities',
      'Virtual date experiences',
      'Video call scheduling system',
      'Screen-free connection emphasis',
      'Authentic interaction focus',
      'Safety-verified video calls',
      'Group video date options'
    ]
  }
];

const coreFeatures = [
  {
    icon: MagnifyingGlassIcon,
    title: 'Smart Discovery',
    description: 'AI-powered user discovery and compatibility matching',
    features: ['Location-based matching', 'Interest alignment', 'Behavioral analysis', 'Preference learning']
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Communication Tools',
    description: 'Complete messaging and interaction suite',
    features: ['Real-time messaging', 'Video & voice calls', 'Photo sharing', 'Disappearing messages']
  },
  {
    icon: ShieldCheckIcon,
    title: 'Safety & Security',
    description: 'Industry-leading safety and verification',
    features: ['Identity verification', 'Background checks', 'Block & report system', 'Content moderation']
  },
  {
    icon: StarIcon,
    title: 'Premium Features',
    description: 'Monetization and engagement tools',
    features: ['Unlimited swipes', 'Profile boosts', 'Read receipts', 'Advanced filters']
  }
];

const communicationFeatures = [
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Real-Time Messaging',
    description: 'Instant chat with match notifications and delivery receipts'
  },
  {
    icon: VideoCameraIcon,
    title: 'Video Calling',
    description: 'In-app video chat for safe virtual dates and deeper connections'
  },
  {
    icon: SpeakerWaveIcon,
    title: 'Voice Messages',
    description: 'Audio notes and voice introductions for authentic communication'
  },
  {
    icon: PhotoIcon,
    title: 'Media Sharing',
    description: 'Secure photo and video sharing with privacy controls'
  },
  {
    icon: FaceSmileIcon,
    title: 'Expressive Communication',
    description: 'Emoji, GIF support, and interactive stickers'
  },
  {
    icon: LanguageIcon,
    title: 'Translation Services',
    description: 'Multi-language support for international connections'
  }
];

const safetyFeatures = [
  {
    icon: DocumentCheckIcon,
    title: 'Identity Verification',
    description: 'Photo verification and government ID checking for authentic profiles'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Background Checks',
    description: 'Optional criminal history screening for enhanced safety'
  },
  {
    icon: ExclamationTriangleIcon,
    title: 'Block & Report System',
    description: 'Comprehensive reporting tools and harassment protection'
  },
  {
    icon: EyeSlashIcon,
    title: 'Incognito Mode',
    description: 'Private browsing options and granular privacy controls'
  },
  {
    icon: LockClosedIcon,
    title: 'Data Encryption',
    description: 'End-to-end message encryption and secure data storage'
  },
  {
    icon: BellAlertIcon,
    title: 'Emergency Features',
    description: 'Quick access to safety contacts and emergency services'
  }
];

const monetizationStrategies = [
  { model: 'Premium Monthly', price: '$29.99/month', features: 'Advanced matching, unlimited swipes' },
  { model: 'Super Likes', price: '$0.99 each', features: 'Stand out to preferred matches' },
  { model: 'Profile Boosts', price: '$4.99 each', features: '30-minute visibility increase' },
  { model: 'Background Checks', price: '$25-75', features: 'Safety verification upgrades' }
];

const targetDemographics = [
  {
    icon: UserIcon,
    title: '18-25 College Students',
    description: 'Campus-focused dating experiences',
    features: ['University matching', 'Student verification', 'Campus events', 'Study buddy connections']
  },
  {
    icon: UserGroupIcon,
    title: '25-35 Young Professionals',
    description: 'Career-oriented relationship building',
    features: ['Professional matching', 'Industry networking', 'Work-life balance', 'Career compatibility']
  },
  {
    icon: HeartIcon,
    title: '35-50 Established Adults',
    description: 'Serious relationship focus',
    features: ['Marriage-minded matching', 'Family planning alignment', 'Life goal compatibility', 'Mature communication']
  },
  {
    icon: GlobeAltIcon,
    title: 'Niche Communities',
    description: 'Specialized interests and cultures',
    features: ['Religious communities', 'LGBTQ+ safe spaces', 'Cultural matching', 'Interest-based groups']
  }
];

const pricingTiers = [
  {
    name: 'Starter Package',
    price: '$25,000',
    timeline: '45-60 days',
    description: 'Perfect for niche dating communities',
    features: [
      'Mobile apps (iOS & Android)',
      'Basic matching and messaging',
      'Profile creation and photo upload',
      'Location-based discovery',
      'Basic admin panel and analytics',
      '30 days support and maintenance'
    ],
    highlighted: false
  },
  {
    name: 'Professional Package',
    price: '$40,000',
    timeline: '60-75 days',
    description: 'Complete dating platform solution',
    features: [
      'Everything in Starter package',
      'Video calling and voice chat',
      'Advanced matching algorithm',
      'Premium subscription system',
      'In-app purchase integration',
      'Safety and verification features',
      '90 days support and maintenance'
    ],
    highlighted: true
  },
  {
    name: 'Premium Package',
    price: '$60,000',
    timeline: '75-90 days',
    description: 'Advanced dating ecosystem',
    features: [
      'Everything in Professional package',
      'AI-powered matching and recommendations',
      'Advanced safety and verification',
      'Social media integration',
      'Analytics and reporting dashboard',
      'White-label customization options',
      '6 months support and maintenance'
    ],
    highlighted: false
  },
  {
    name: 'Enterprise Package',
    price: '$90,000+',
    timeline: '90+ days',
    description: 'Custom dating platform with unique features',
    features: [
      'Everything in Premium package',
      'Custom feature development',
      'Advanced AI and machine learning',
      'Multiple niche platform support',
      'Dedicated development team',
      'Priority support and maintenance'
    ],
    highlighted: false
  }
];

const successMetrics = [
  { metric: '10K+', description: 'App downloads in first month' },
  { metric: '50K+', description: 'Registered users within 6 months' },
  { metric: '25%+', description: 'Successful match conversion rate' },
  { metric: '$100K+', description: 'Monthly recurring revenue potential' }
];

const technologyStack = [
  { tech: 'Native iOS & Android', description: 'High-performance native mobile applications' },
  { tech: 'Real-Time Processing', description: 'Instant matching and messaging capabilities' },
  { tech: 'Scalable Cloud Architecture', description: 'Handle millions of users and interactions' },
  { tech: 'AI & Machine Learning', description: 'Advanced matching algorithms and user analysis' },
  { tech: 'End-to-End Encryption', description: 'Secure communication and data protection' },
  { tech: 'GDPR Compliance', description: 'Privacy regulation adherence and user controls' }
];

export default function DatingPlatformPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-900 via-rose-800 to-amber-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-pink-100/20 px-4 py-2 text-sm font-medium text-pink-100">
                  <HeartIcon className="mr-2 h-4 w-4" />
                  Dating App Development Solutions
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Launch Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-200">
                  Dating Empire
                </span>
                in 60 Days
              </h1>
              <p className="mt-6 text-xl text-pink-100 sm:text-2xl">
                Complete Dating Platform - Advanced Matching, Video Chat, AI Safety Features & Premium Monetization
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
                  href="/contact?service=dating-platform"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-amber-500 hover:shadow-2xl hover:scale-105"
                >
                  Get Free Demo
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-pink-300 bg-pink-800/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-pink-700/50"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Live App
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <DatingPlatformHeroImage className="w-full max-w-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Complete Dating Platform Solutions
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Create authentic connections through innovative features, advanced matching algorithms, 
              and safety-first design that prioritizes user experience and security.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {platformTypes.map((platform, index) => (
              <div key={index} className="relative bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 shadow-lg border border-pink-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{platform.title}</h3>
                <p className="text-gray-600 mb-6">{platform.description}</p>
                <ul className="space-y-3">
                  {platform.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-pink-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24 bg-gradient-to-br from-pink-50 to-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Essential Dating App Features
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Everything needed to create meaningful connections and build a successful dating platform
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {coreFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-pink-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{feature.description}</p>
                <ul className="space-y-1">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-gray-500 flex items-center">
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-2"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Communication Tools */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Advanced Communication Tools
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Comprehensive suite of communication features for authentic connections
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {communicationFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Security */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-pink-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Industry-Leading Safety & Security
            </h2>
            <p className="mt-6 text-xl text-pink-100">
              Comprehensive safety features that prioritize user protection and authentic connections
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {safetyFeatures.map((feature, index) => (
              <div key={index} className="bg-pink-800/30 rounded-xl p-6 border border-pink-700">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-pink-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Demographics */}
      <section className="py-24 bg-gradient-to-br from-pink-50 to-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Diverse Target Demographics
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Customizable platforms for every age group and community
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {targetDemographics.map((demographic, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-pink-100">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-4">
                  <demographic.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{demographic.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{demographic.description}</p>
                <ul className="space-y-1">
                  {demographic.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-sm text-gray-500 flex items-center">
                      <HeartIcon className="w-3 h-3 text-pink-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-rose-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Advanced Technology Stack</h2>
            <p className="text-pink-100 text-lg">Cutting-edge technology for scalable and secure dating platforms</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {technologyStack.map((tech, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-pink-400/20">
                <h3 className="font-bold text-white text-lg mb-2">{tech.tech}</h3>
                <p className="text-pink-100">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-16 bg-gradient-to-r from-rose-700 to-pink-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {successMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white md:text-4xl">{metric.metric}</div>
                <div className="text-pink-100 mt-2">{metric.description}</div>
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
              Choose the perfect dating app solution for your business goals
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-4">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative bg-white rounded-2xl shadow-xl border-2 p-6 ${
                tier.highlighted 
                  ? 'border-pink-500 ring-4 ring-pink-500/10 scale-105' 
                  : 'border-gray-200'
              }`}>
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
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
                  <div className="mt-3 text-sm text-pink-600 font-medium">
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
                  href="/contact?service=dating-platform"
                  className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-700 hover:to-rose-700 shadow-lg hover:shadow-xl'
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
      <section className="py-24 bg-gradient-to-br from-pink-900 via-rose-800 to-amber-700 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Ready to Launch the Next Big Dating App?
          </h2>
          <p className="mt-6 text-xl text-pink-100">
            Join the billion-dollar dating industry with Zoptal's proven technology. 
            Comprehensive platform for building authentic connections and successful dating businesses.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <CpuChipIcon className="mx-auto h-12 w-12 text-amber-300" />
              <h3 className="mt-4 text-lg font-semibold">Proven Technology</h3>
              <p className="mt-2 text-sm text-pink-100">Battle-tested platform used by successful apps</p>
            </div>
            <div className="text-center">
              <HeartIcon className="mx-auto h-12 w-12 text-amber-300" />
              <h3 className="mt-4 text-lg font-semibold">Advanced Matching</h3>
              <p className="mt-2 text-sm text-pink-100">AI-powered algorithms for better compatibility</p>
            </div>
            <div className="text-center">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-amber-300" />
              <h3 className="mt-4 text-lg font-semibold">Complete Security</h3>
              <p className="mt-2 text-sm text-pink-100">Industry-leading safety and verification</p>
            </div>
            <div className="text-center">
              <RocketLaunchIcon className="mx-auto h-12 w-12 text-amber-300" />
              <h3 className="mt-4 text-lg font-semibold">Scalable Solution</h3>
              <p className="mt-2 text-sm text-pink-100">Grows from startup to millions of users</p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact?service=dating-platform"
              className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-amber-500 hover:shadow-2xl hover:scale-105"
            >
              Schedule Strategy Call
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact?service=quote"
              className="inline-flex items-center justify-center rounded-xl border-2 border-pink-300 bg-pink-800/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-pink-700/50"
            >
              Get Custom Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}