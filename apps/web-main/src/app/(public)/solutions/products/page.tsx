import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  GlobeAltIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'Industry-Specific Turnkey Solutions | 21 Complete Business Platforms | Zoptal',
  description: 'Transform any industry with Zoptal\'s complete turnkey solutions. 21 proven business platforms ready to launch in 60-90 days. From e-commerce to healthcare, transportation to fintech.',
  keywords: [
    'turnkey solutions',
    'industry-specific platforms',
    'complete business solutions',
    'e-commerce platform',
    'food delivery system',
    'healthcare solutions',
    'transportation platform',
    'fintech solutions',
    'ready-to-launch platforms',
    'business ecosystems',
    'marketplace solutions',
    'enterprise platforms'
  ],
  openGraph: {
    title: 'Industry-Specific Turnkey Solutions | Zoptal',
    description: 'Transform any industry with 21 complete business platforms ready to launch in 60-90 days.',
    images: ['/images/og-image.png'],
  },
};

const solutionCategories = [
  {
    id: 'food-delivery',
    title: 'Food & Delivery Services',
    icon: '🍕',
    color: 'from-orange-500 to-red-500',
    count: 2,
    description: 'Complete restaurant ecosystems and delivery management platforms',
    solutions: [
      {
        name: 'Food Delivery & Restaurant Management',
        description: 'Complete restaurant ecosystem with multi-vendor marketplace',
        launch: '45-90 days',
        investment: '$15K-40K',
        slug: 'food-delivery'
      },
      {
        name: 'Grocery & Hyperlocal Delivery',
        description: 'On-demand grocery ordering with real-time inventory',
        launch: '45-90 days',
        investment: '$25K-75K',
        slug: 'grocery-delivery'
      }
    ]
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce & Marketplaces',
    icon: '🏪',
    color: 'from-blue-500 to-purple-500',
    count: 2,
    description: 'Complete marketplace solutions and e-commerce platforms',
    solutions: [
      {
        name: 'Multivendor E-Commerce Platform',
        description: 'Complete marketplace solution rivaling Amazon and eBay',
        launch: '30-90 days',
        investment: '$20K-75K+',
        slug: 'e-commerce'
      },
      {
        name: 'Professional Services Marketplace',
        description: 'Upwork-style platform connecting businesses with experts',
        launch: '45-90 days',
        investment: '$30K-85K',
        slug: 'professional-services'
      }
    ]
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Wellness',
    icon: '🏥',
    color: 'from-green-500 to-teal-500',
    count: 3,
    description: 'HIPAA-compliant healthcare platforms and wellness solutions',
    solutions: [
      {
        name: 'Telemedicine & Healthcare Platform',
        description: 'HIPAA-compliant telemedicine with EHR integration',
        launch: '90-180 days',
        investment: '$75K-300K+',
        slug: 'telemedicine'
      },
      {
        name: 'Pet Healthcare & Veterinary Services',
        description: 'Comprehensive veterinary telemedicine platform',
        launch: '60-150 days',
        investment: '$40K-120K',
        slug: 'pet-healthcare'
      },
      {
        name: 'Fitness & Wellness Applications',
        description: 'Complete fitness ecosystem with personal training',
        launch: '30-75 days',
        investment: '$20K-55K',
        slug: 'fitness-wellness'
      }
    ]
  },
  {
    id: 'transportation',
    title: 'Transportation & Logistics',
    icon: '🚗',
    color: 'from-indigo-500 to-blue-500',
    count: 3,
    description: 'Complete transportation and logistics management solutions',
    solutions: [
      {
        name: 'Ride-Hailing & Taxi Platform',
        description: 'Complete Uber-style transportation solution',
        launch: '45-90 days',
        investment: '$30K-80K',
        slug: 'ride-hailing'
      },
      {
        name: 'Trucking & Logistics Management',
        description: 'Comprehensive freight and logistics platform',
        launch: '45-90 days',
        investment: '$35K-100K',
        slug: 'trucking-logistics'
      },
      {
        name: 'Urban Parking Solutions',
        description: 'Smart parking reservations and management',
        launch: '30-90 days',
        investment: '$25K-75K',
        slug: 'parking-solutions'
      }
    ]
  },
  {
    id: 'financial',
    title: 'Financial & Professional Services',
    icon: '💰',
    color: 'from-yellow-500 to-orange-500',
    count: 2,
    description: 'FinTech solutions and professional service platforms',
    solutions: [
      {
        name: 'Financial Services Platform',
        description: 'Complete FinTech solution with banking and payments',
        launch: '75-180 days',
        investment: '$50K-200K+',
        slug: 'financial-services'
      },
      {
        name: 'Real Estate Management Platform',
        description: 'Complete property marketplace and management',
        launch: '30-90 days',
        investment: '$25K-75K',
        slug: 'real-estate'
      }
    ]
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle & Social',
    icon: '💝',
    color: 'from-pink-500 to-rose-500',
    count: 2,
    description: 'Social platforms and lifestyle service applications',
    solutions: [
      {
        name: 'Dating Application Platform',
        description: 'Advanced matching with video chat and safety features',
        launch: '45-90 days',
        investment: '$25K-90K+',
        slug: 'dating-platform'
      },
      {
        name: 'Event & Venue Booking',
        description: 'Complete event discovery and venue management',
        launch: '30-75 days',
        investment: '$20K-55K',
        slug: 'event-booking'
      }
    ]
  },
  {
    id: 'home-services',
    title: 'Home & Lifestyle Services',
    icon: '🏠',
    color: 'from-cyan-500 to-blue-500',
    count: 3,
    description: 'Home service marketplaces and accommodation platforms',
    solutions: [
      {
        name: 'Home Services Marketplace',
        description: 'TaskRabbit-style home services platform',
        launch: '45-90 days',
        investment: '$25K-65K',
        slug: 'home-services'
      },
      {
        name: 'Hotel & Accommodation Booking',
        description: 'Complete hospitality booking and management',
        launch: '45-90 days',
        investment: '$30K-80K',
        slug: 'hotel-booking'
      },
      {
        name: 'Movers & Packers Services',
        description: 'Complete moving and relocation management',
        launch: '45-90 days',
        investment: '$30K-85K',
        slug: 'movers-packers'
      }
    ]
  },
  {
    id: 'specialized',
    title: 'Specialized Services',
    icon: '🚧',
    color: 'from-purple-500 to-indigo-500',
    count: 3,
    description: 'Specialized industry solutions and niche platforms',
    solutions: [
      {
        name: 'On-Demand Automobile Services',
        description: 'Complete roadside assistance and car care',
        launch: '45-90 days',
        investment: '$30K-80K',
        slug: 'automobile-services'
      },
      {
        name: 'Fantasy Sports & Gaming Platform',
        description: 'Complete DraftKings-style gaming solution',
        launch: '60-150 days',
        investment: '$50K-200K+',
        slug: 'fantasy-sports'
      },
      {
        name: 'News & Media Platform',
        description: 'Complete news publishing and distribution',
        launch: '30-90 days',
        investment: '$25K-75K',
        slug: 'news-media'
      }
    ]
  }
];

const whyChooseZoptal = [
  {
    icon: ShieldCheckIcon,
    title: 'Proven Technology Stack',
    description: 'Battle-tested platforms used by successful businesses worldwide with scalable cloud architecture handling millions of users.'
  },
  {
    icon: BuildingOffice2Icon,
    title: 'Complete Business Ecosystems',
    description: 'Not just apps - complete business solutions with all stakeholders, payment processing, analytics, and revenue models built-in.'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Rapid Time-to-Market',
    description: '60-90 day average launch timeline across all solutions with pre-built features and experienced development teams.'
  },
  {
    icon: UsersIcon,
    title: 'Industry Expertise',
    description: 'Deep understanding of each industry\'s unique requirements, compliance needs, and best practices from successful launches.'
  }
];

const investmentTiers = [
  {
    name: 'Basic Platforms',
    range: '$15K-30K',
    description: 'Simple booking and marketplace solutions',
    examples: ['Event Booking', 'Basic E-commerce', 'Service Marketplace']
  },
  {
    name: 'Professional Solutions',
    range: '$30K-60K',
    description: 'Advanced features and integrations',
    examples: ['Multi-vendor Platforms', 'Transportation Systems', 'Real Estate Platforms']
  },
  {
    name: 'Enterprise Platforms',
    range: '$60K-100K+',
    description: 'Complex, regulated industries',
    examples: ['Healthcare Systems', 'Financial Services', 'Gaming Platforms']
  },
  {
    name: 'Custom Development',
    range: '$100K+',
    description: 'Unique requirements and features',
    examples: ['Specialized Industries', 'Complex Integrations', 'Multi-platform Ecosystems']
  }
];

const successMetrics = [
  { label: 'Successful Launches', value: '500+' },
  { label: 'Industries Covered', value: '21' },
  { label: 'Gross Marketplace Value', value: '$2B+' },
  { label: 'End Users Served', value: '50M+' },
  { label: 'Platform Uptime', value: '99.9%' }
];

const implementationProcess = [
  {
    phase: 1,
    title: 'Strategy & Planning',
    duration: 'Week 1-2',
    description: 'Market analysis, requirements gathering, business model design, and technical architecture planning.'
  },
  {
    phase: 2,
    title: 'Development & Customization',
    duration: 'Week 3-10',
    description: 'Core platform development, custom feature integration, design & branding, and third-party integrations.'
  },
  {
    phase: 3,
    title: 'Testing & Launch',
    duration: 'Week 11-12',
    description: 'Quality assurance, performance optimization, security validation, and launch preparation.'
  },
  {
    phase: 4,
    title: 'Growth & Optimization',
    duration: 'Ongoing',
    description: 'User acquisition, performance monitoring, feature enhancement, and scale management.'
  }
];

export default function IndustrySolutionsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 backdrop-blur-sm text-blue-200 text-sm font-medium mb-6">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Industry-Specific Turnkey Solutions
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
              Transform Any Industry with
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                Zoptal's Technology
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl font-semibold text-blue-100 mb-4">
              21 Complete Solutions Ready to Launch in 60-90 Days
            </p>
            
            <p className="text-xl text-blue-200 mb-8 max-w-4xl mx-auto leading-relaxed">
              From healthcare to e-commerce, transportation to entertainment - Zoptal delivers 
              industry-specific platforms that accelerate your business growth. Choose from our 
              comprehensive portfolio of proven solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="#solutions"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore All Solutions
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
              >
                Schedule Strategy Call
              </Link>
            </div>
            
            {/* Success Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
              {successMetrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{metric.value}</div>
                  <div className="text-sm text-blue-200">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Portfolio Overview */}
      <section id="solutions" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Complete Solutions Portfolio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              21 industry-specific solutions designed to launch complete business ecosystems 
              with all stakeholders, payment processing, and analytics included
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {solutionCategories.map((category, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-6">
                  <span className="text-4xl mr-4">{category.icon}</span>
                  <div>
                    <h3 className={`text-2xl font-bold text-gray-900 mb-2 bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                      {category.title}
                    </h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {category.solutions.map((solution, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">{solution.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {solution.launch}
                          </div>
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            {solution.investment}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{solution.description}</p>
                      <Link
                        href={`/solutions/products/${solution.slug}`}
                        className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                      >
                        View Details
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Zoptal */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Choose Zoptal's Industry Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proven technology stack with complete business ecosystems designed for rapid deployment
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseZoptal.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment & ROI Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Investment & ROI Overview
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible investment tiers with proven returns and rapid break-even timelines
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {investmentTiers.map((tier, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="text-2xl font-bold text-blue-600 mb-4">{tier.range}</div>
                <p className="text-gray-600 mb-6">{tier.description}</p>
                <div className="space-y-2">
                  {tier.examples.map((example, idx) => (
                    <div key={idx} className="text-sm text-gray-500">• {example}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Typical Return on Investment</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-2">6-18 months</div>
                <div className="text-sm text-gray-600">Break-Even Timeline</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-2">200%+</div>
                <div className="text-sm text-gray-600">Annual Growth</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 mb-2">20-40%</div>
                <div className="text-sm text-gray-600">Market Penetration</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 mb-2">5-10x</div>
                <div className="text-sm text-gray-600">Valuation Multiple</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Implementation Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proven 4-phase process ensuring successful delivery of your industry platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {implementationProcess.map((phase, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {phase.phase}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{phase.title}</h3>
                  <div className="text-sm text-blue-600 font-medium mb-4">{phase.duration}</div>
                  <p className="text-gray-600">{phase.description}</p>
                </div>
                {index < implementationProcess.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Industry?
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Choose from 21 proven solutions or let us build something custom for your vision. 
            Every successful business starts with the right technology foundation.
          </p>
          
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <div className="text-center">
              <CheckIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-white font-medium">Complete Solutions</div>
              <div className="text-blue-200 text-sm">Not just development, but complete business ecosystems</div>
            </div>
            <div className="text-center">
              <ChartBarIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-white font-medium">Proven Results</div>
              <div className="text-blue-200 text-sm">500+ successful launches with documented ROI</div>
            </div>
            <div className="text-center">
              <UsersIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-white font-medium">Industry Expertise</div>
              <div className="text-blue-200 text-sm">Deep understanding of each vertical's unique needs</div>
            </div>
            <div className="text-center">
              <RocketLaunchIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-white font-medium">Rapid Launch</div>
              <div className="text-blue-200 text-sm">60-90 day average time-to-market across all solutions</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Schedule Strategy Call
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="#solutions"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
            >
              Explore All Solutions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}