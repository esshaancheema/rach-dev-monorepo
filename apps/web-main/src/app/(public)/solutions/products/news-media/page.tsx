import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  NewspaperIcon,
  MicrophoneIcon,
  CameraIcon,
  DocumentTextIcon,
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
  BookOpenIcon,
  PencilIcon,
  ShareIcon,
  EyeIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  SignalIcon,
  AtSymbolIcon,
  MegaphoneIcon,
  TagIcon,
  FolderIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import NewsMediaHeroImage from '@/components/NewsMediaHeroImage';

export const metadata: Metadata = {
  title: 'News & Media Platform | Complete Publishing & Distribution | Zoptal',
  description: 'Launch your news empire in 60 days. Complete digital publishing platform with editorial workflow, multi-channel distribution, and monetization. Investment from $25K-75K.',
  keywords: [
    'news publishing platform',
    'digital news website',
    'content management system',
    'editorial workflow software',
    'news distribution platform',
    'media publishing solution',
    'online news platform',
    'journalism software',
    'newspaper website builder',
    'news content management',
    'media platform development',
    'publishing system',
    'editorial collaboration tools',
    'news monetization platform',
    'digital journalism platform'
  ],
  openGraph: {
    title: 'News & Media Platform | Zoptal',
    description: 'Launch your news empire in 60 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: DocumentTextIcon,
    title: 'Advanced Editorial Workflow',
    description: 'Complete content management with multi-author collaboration, editorial calendar, and approval processes.'
  },
  {
    icon: GlobeAltIcon,
    title: 'Multi-Channel Distribution',
    description: 'Publish simultaneously to web, mobile apps, social media, and email newsletters with automated formatting.'
  },
  {
    icon: ChartBarIcon,
    title: 'Reader Analytics & Engagement',
    description: 'Comprehensive insights on reader behavior, content performance, and engagement metrics.'
  },
  {
    icon: ClockIcon,
    title: '60-Day Launch Timeline',
    description: 'Complete news and media platform ready to launch in 30-90 days with full editorial features.'
  }
];

const platformTypes = [
  {
    title: 'Editorial Management Platform',
    description: 'Complete newsroom and content creation tools',
    icon: NewspaperIcon,
    features: [
      'Visual editor with multimedia support',
      'Editorial calendar and workflow management',
      'Multi-author collaboration and assignments',
      'Content versioning and approval process',
      'Breaking news alerts and push notifications',
      'Image and video asset management',
      'SEO optimization and content tagging',
      'Social media integration and scheduling'
    ]
  },
  {
    title: 'Reader Experience Platform',
    description: 'Modern news website and mobile applications',
    icon: DevicePhoneMobileIcon,
    features: [
      'Responsive news website with modern design',
      'Native mobile apps for iOS and Android',
      'Personalized content recommendations',
      'Comment system with moderation tools',
      'Newsletter subscription management',
      'Dark mode and accessibility features',
      'Offline reading capabilities',
      'Search and content discovery tools'
    ]
  },
  {
    title: 'Analytics & Revenue Dashboard',
    description: 'Business intelligence and monetization tools',
    icon: ChartBarIcon,
    features: [
      'Real-time readership and engagement analytics',
      'Content performance and trending topics',
      'Advertisement management and tracking',
      'Subscription and paywall management',
      'Revenue reporting and forecasting',
      'A/B testing for headlines and content',
      'Social media performance tracking',
      'Audience segmentation and insights'
    ]
  }
];

const pricingTiers = [
  {
    name: 'Starter News Platform',
    price: '$25,000',
    timeline: '30-60 days',
    description: 'Essential news website with basic editorial tools',
    features: [
      'Basic content management system',
      'Simple editorial workflow',
      'Responsive news website template',
      'Basic mobile-friendly design',
      'Comment system and reader engagement',
      'Email newsletter integration',
      'Social media sharing tools',
      'Basic analytics dashboard',
      'SEO optimization features',
      '1-year technical support'
    ],
    highlighted: false
  },
  {
    name: 'Professional Media Suite',
    price: '$50,000',
    timeline: '45-75 days',
    description: 'Advanced publishing platform with monetization features',
    features: [
      'Advanced editorial workflow management',
      'Multi-author collaboration tools',
      'Native mobile apps (iOS/Android)',
      'Subscription paywall system',
      'Advertisement management platform',
      'Advanced analytics and insights',
      'Breaking news alert system',
      'Content personalization engine',
      'Multi-channel distribution tools',
      'Custom branding and themes',
      '2-year technical support'
    ],
    highlighted: true
  },
  {
    name: 'Enterprise Publishing Platform',
    price: '$75,000+',
    timeline: '60-90 days',
    description: 'Complete white-label news platform with custom features',
    features: [
      'Full white-label customization',
      'Advanced editorial collaboration suite',
      'Custom mobile app development',
      'Enterprise-grade analytics platform',
      'Multi-language and localization support',
      'API integrations and custom development',
      'Advanced revenue optimization tools',
      'Dedicated account management',
      'Live chat and premium support',
      '24/7 priority technical support',
      'Training and onboarding program'
    ],
    highlighted: false
  }
];

const contentFeatures = [
  {
    icon: PencilIcon,
    title: 'Rich Content Editor',
    description: 'WYSIWYG editor with multimedia embedding, formatting tools, and real-time collaboration'
  },
  {
    icon: CameraIcon,
    title: 'Media Asset Management',
    description: 'Organize photos, videos, and documents with tagging, search, and rights management'
  },
  {
    icon: CalendarDaysIcon,
    title: 'Editorial Calendar',
    description: 'Plan content schedules, manage deadlines, and coordinate publishing across teams'
  },
  {
    icon: TagIcon,
    title: 'Content Organization',
    description: 'Categories, tags, and custom taxonomies for easy content discovery and navigation'
  }
];

const distributionFeatures = [
  {
    icon: GlobeAltIcon,
    title: 'Multi-Platform Publishing',
    description: 'Simultaneous distribution to web, mobile, social media, and email channels'
  },
  {
    icon: MegaphoneIcon,
    title: 'Breaking News Alerts',
    description: 'Push notifications and emergency broadcasting for urgent news updates'
  },
  {
    icon: AtSymbolIcon,
    title: 'Newsletter Integration',
    description: 'Automated newsletter creation and distribution with subscriber management'
  },
  {
    icon: ShareIcon,
    title: 'Social Media Automation',
    description: 'Auto-posting to social platforms with optimized formatting and scheduling'
  }
];

const revenueFeatures = [
  {
    icon: BanknotesIcon,
    title: 'Subscription Management',
    description: 'Flexible paywall systems with freemium, premium, and tiered subscription models'
  },
  {
    icon: SignalIcon,
    title: 'Advertisement Platform',
    description: 'Native advertising, banner management, and programmatic ad integration'
  },
  {
    icon: ChartBarIcon,
    title: 'Revenue Analytics',
    description: 'Track subscription growth, ad performance, and reader lifetime value'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Payment Processing',
    description: 'Secure payment gateway integration with multiple payment methods'
  }
];

const technicalFeatures = [
  {
    icon: CloudIcon,
    title: 'Cloud-Native Architecture',
    description: 'Scalable infrastructure supporting high-traffic news sites and real-time updates'
  },
  {
    icon: WifiIcon,
    title: 'Real-Time Publishing',
    description: 'Instant content updates across all channels with live editing and collaboration'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Security & Backup',
    description: 'Enterprise-grade security, automated backups, and disaster recovery systems'
  },
  {
    icon: CpuChipIcon,
    title: 'AI-Powered Features',
    description: 'Content recommendations, automated tagging, and performance optimization'
  }
];

const industryFocus = [
  { name: 'Local News Organizations', description: 'Community newspapers and regional news sites' },
  { name: 'Independent Journalism', description: 'Freelance journalists and independent media outlets' },
  { name: 'Corporate Communications', description: 'Internal news and employee communications' },
  { name: 'Niche Publications', description: 'Industry trade publications and specialized content' },
  { name: 'Educational Media', description: 'Student newspapers and academic publications' },
  { name: 'Digital Magazines', description: 'Online magazines and lifestyle publications' }
];

const testimonials = [
  {
    quote: "Zoptal's news platform transformed our local newspaper into a thriving digital publication. Our online readership grew 400% in six months.",
    author: "Sarah Johnson",
    role: "Editor-in-Chief, Metro Daily News",
    rating: 5
  },
  {
    quote: "The editorial workflow tools saved our newsroom countless hours. We can now coordinate between 20+ writers seamlessly and publish breaking news instantly.",
    author: "Michael Chen",
    role: "Managing Editor, TechReport Weekly",
    rating: 5
  }
];

export default function NewsMediaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full mb-6">
                <NewspaperIcon className="w-4 h-4 mr-2" />
                News & Media Platform
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Launch Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
                  News Empire
                </span>
                in 60 Days
              </h1>
              
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                Complete digital publishing platform with advanced editorial workflow, 
                multi-channel distribution, and revenue monetization. Build the next 
                generation of news and media websites with our proven technology.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/get-quote"
                  className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors group"
                >
                  Start Your Media Platform
                  <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="inline-flex items-center justify-center border-2 border-purple-300 text-purple-100 hover:bg-purple-800/50 font-semibold px-8 py-4 rounded-xl transition-colors">
                  <PlayIcon className="mr-2 w-5 h-5" />
                  Watch Publishing Demo
                </button>
              </div>
            </div>
            
            <div className="lg:pl-8">
              <NewsMediaHeroImage className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete News Publishing Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to launch and scale a modern digital news publication
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
              Three Complete Publishing Platforms
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive news ecosystem covering editorial, distribution, and revenue
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

      {/* Content Management Features */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Advanced Content Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional editorial tools for modern newsrooms and content creators
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contentFeatures.map((feature, index) => (
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

      {/* Distribution Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Multi-Channel Distribution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Reach your audience everywhere with automated content distribution
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {distributionFeatures.map((feature, index) => (
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

      {/* Revenue Features */}
      <section className="py-24 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Revenue & Monetization
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Multiple revenue streams to build a sustainable news business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {revenueFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Focus */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfect for Every News Organization
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From local newspapers to digital magazines, our platform scales to your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industryFocus.map((industry, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{industry.name}</h3>
                <p className="text-sm text-gray-600">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Reliable infrastructure and cutting-edge features for professional publishing
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technicalFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
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
              News Platform Investment
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the publishing platform that matches your editorial goals and business model
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
              See how news organizations are transforming their digital presence
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
              Ready to Launch Your News Platform?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join the digital publishing revolution with a platform that rivals major news organizations.
              Get started with a custom quote today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-quote"
                className="inline-flex items-center justify-center bg-white text-purple-600 font-semibold px-8 py-4 rounded-xl hover:bg-purple-50 transition-colors group"
              >
                <RocketLaunchIcon className="mr-2 w-5 h-5" />
                Start Your News Platform
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