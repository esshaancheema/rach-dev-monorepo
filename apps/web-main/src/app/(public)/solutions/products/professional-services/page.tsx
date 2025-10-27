import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  UserGroupIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  StarIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  DocumentCheckIcon,
  CheckIcon,
  ArrowRightIcon,
  PlayIcon,
  ClockIcon,
  AcademicCapIcon,
  ChartBarIcon,
  TruckIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import ProfessionalServicesHeroImage from '@/components/ProfessionalServicesHeroImage';

export const metadata: Metadata = {
  title: 'Professional Services Marketplace | Upwork-Style Platform | Zoptal',
  description: 'Build your own Upwork & Fiverr-style professional services marketplace in 45-90 days. Connect businesses with expert professionals through comprehensive marketplace platform. Investment from $30K-85K.',
  keywords: [
    'professional services marketplace',
    'upwork clone',
    'fiverr alternative',
    'freelancer platform',
    'consultant marketplace',
    'professional service platform',
    'expert network platform',
    'business consulting marketplace',
    'legal services platform',
    'creative services marketplace',
    'technology services platform',
    'project-based marketplace'
  ],
  openGraph: {
    title: 'Professional Services Marketplace | Zoptal',
    description: 'Build your own Upwork & Fiverr-style professional services marketplace in 45-90 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: UserGroupIcon,
    title: 'Professional Matching & Discovery',
    description: 'Advanced search and AI-powered matching to connect businesses with the perfect professional experts for their projects.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Project Management',
    description: 'Complete project lifecycle management with milestone tracking, time logging, and secure communication tools.'
  },
  {
    icon: CreditCardIcon,
    title: 'Escrow Payment System',
    description: 'Secure escrow payments with milestone-based releases, automated invoicing, and multi-currency support.'
  },
  {
    icon: StarIcon,
    title: 'Quality Assurance & Reviews',
    description: 'Professional verification system with comprehensive reviews, ratings, and performance tracking.'
  }
];

const platformComponents = [
  {
    title: 'Client Platform',
    description: 'Comprehensive portal for businesses seeking professional services',
    features: [
      'Professional discovery and search',
      'Project posting with detailed requirements',
      'Proposal comparison and selection',
      'Milestone management and payments',
      'Real-time communication tools',
      'Project progress tracking'
    ]
  },
  {
    title: 'Professional Dashboard',
    description: 'Complete workspace for service providers and consultants',
    features: [
      'Professional profile and portfolio',
      'Lead management and bidding',
      'Project delivery and collaboration',
      'Time tracking and invoicing',
      'Client communication center',
      'Performance analytics and earnings'
    ]
  },
  {
    title: 'Admin Management Panel',
    description: 'Central platform administration and oversight',
    features: [
      'Professional verification and approval',
      'Quality control and monitoring',
      'Dispute resolution system',
      'Commission and payout management',
      'Platform analytics and insights',
      'Content moderation and compliance'
    ]
  }
];

const serviceCategories = [
  {
    name: 'Legal & Compliance',
    icon: DocumentCheckIcon,
    services: [
      'Corporate Law & Business Formation',
      'Intellectual Property Protection',
      'Employment Law & HR Policies',
      'Contract Review & Legal Consultation',
      'Regulatory Compliance & Risk Assessment'
    ]
  },
  {
    name: 'Business & Strategy',
    icon: ChartBarIcon,
    services: [
      'Management & Strategy Consulting',
      'Marketing & Brand Development',
      'Financial Planning & Analysis',
      'Operations Improvement',
      'Business Development & Growth Strategy'
    ]
  },
  {
    name: 'Technology & Digital',
    icon: DevicePhoneMobileIcon,
    services: [
      'Software Development & Engineering',
      'IT Consulting & System Integration',
      'Cybersecurity & Data Protection',
      'Digital Marketing & SEO',
      'Data Analytics & Business Intelligence'
    ]
  },
  {
    name: 'Creative & Content',
    icon: BriefcaseIcon,
    services: [
      'Graphic Design & Branding',
      'Content Creation & Copywriting',
      'Video Production & Photography',
      'UI/UX Design & Development',
      'Marketing Materials & Campaigns'
    ]
  }
];

const comprehensiveFeatures = [
  'Professional verification system',
  'AI-powered project matching',
  'Secure escrow payments',
  'Real-time messaging & video calls',
  'Project milestone management',
  'Time tracking & productivity tools',
  'Automated invoicing & billing',
  'Comprehensive review system',
  'Multi-currency support',
  'Mobile apps for professionals',
  'Advanced search & filtering',
  'Professional portfolio showcase',
  'Client relationship management',
  'Dispute resolution system',
  'Performance analytics',
  'Marketing & promotional tools'
];

const technologies = [
  'React Native', 'Node.js', 'PostgreSQL', 'Redis', 'Socket.io', 'Stripe API',
  'AWS/Azure', 'Elasticsearch', 'Docker', 'GraphQL', 'WebRTC', 'JWT Authentication'
];

const implementationPhases = [
  {
    phase: 1,
    title: 'Platform Foundation & User Management',
    description: 'Set up core platform infrastructure, user authentication, and basic professional/client management systems.',
    duration: '1-2 weeks',
    deliverables: ['Platform deployment', 'User registration system', 'Professional profiles', 'Basic admin dashboard']
  },
  {
    phase: 2,
    title: 'Project Management & Communication Tools',
    description: 'Develop project posting, bidding system, messaging, and video conferencing capabilities.',
    duration: '6-8 weeks',
    deliverables: ['Project management system', 'Bidding & proposal system', 'Communication tools', 'File sharing']
  },
  {
    phase: 3,
    title: 'Payment Integration & Quality Assurance',
    description: 'Implement secure payment processing, escrow system, and professional verification processes.',
    duration: '2-3 weeks',
    deliverables: ['Payment processing', 'Escrow system', 'Professional verification', 'Review & rating system']
  },
  {
    phase: 4,
    title: 'Launch & Growth Support',
    description: 'Platform launch with professional onboarding, client acquisition campaigns, and performance optimization.',
    duration: 'Ongoing',
    deliverables: ['Platform launch', 'Professional recruitment', 'Marketing campaigns', '6 months support']
  }
];

const pricingTiers = [
  {
    name: 'Startup Package',
    price: '$30,000',
    description: 'Perfect for launching a focused professional services marketplace',
    features: [
      'Client and professional portals',
      'Basic project management',
      'Secure messaging system',
      'Payment processing & escrow',
      'Review and rating system',
      'Basic admin dashboard',
      'Email support',
      '30 days maintenance'
    ],
    highlight: false,
    launch: '45-60 days'
  },
  {
    name: 'Professional Package',
    price: '$50,000',
    description: 'Complete marketplace solution with advanced features',
    features: [
      'Everything in Startup',
      'AI-powered matching system',
      'Video conferencing & collaboration',
      'Professional verification',
      'Advanced analytics & reporting',
      'Marketing & promotional tools',
      'Priority support',
      '90 days maintenance'
    ],
    highlight: true,
    launch: '60-75 days'
  },
  {
    name: 'Enterprise Package',
    price: '$85,000+',
    description: 'Full professional services ecosystem with custom features',
    features: [
      'Everything in Professional',
      'White-label customization',
      'API access & integrations',
      'Multi-language support',
      'Advanced dispute resolution',
      'Dedicated account manager',
      'Premium support',
      '6 months maintenance'
    ],
    highlight: false,
    launch: '75-90 days'
  }
];

const marketOpportunity = [
  {
    market: 'Global Professional Services',
    size: '$6.2T+',
    growth: '5% annual growth'
  },
  {
    market: 'Freelance Economy',
    size: '$400B+',
    growth: '15% annual growth'
  },
  {
    market: 'Digital Consulting',
    size: '$150B+',
    growth: '12% annual growth'
  }
];

const successMetrics = [
  {
    metric: 'Average Project Value',
    benchmark: '$500-5,000',
    description: 'Typical professional service projects'
  },
  {
    metric: 'Platform Commission',
    benchmark: '5-20%',
    description: 'Revenue per completed project'
  },
  {
    metric: 'Professional Retention',
    benchmark: '85%+',
    description: 'Annual active professional retention'
  },
  {
    metric: 'Client Satisfaction',
    benchmark: '4.5+ stars',
    description: 'Average project rating'
  }
];

const uniqueAdvantages = [
  {
    title: 'Professional Verification System',
    description: 'Comprehensive credential verification, background checks, and skill assessments ensure high-quality service providers'
  },
  {
    title: 'AI-Powered Matching',
    description: 'Advanced algorithms match clients with the perfect professionals based on expertise, availability, and project requirements'
  },
  {
    title: 'Secure Project Management',
    description: 'Complete project lifecycle tools with milestone tracking, secure payments, and collaborative workspaces'
  },
  {
    title: 'Multi-Category Expertise',
    description: 'Support for diverse professional services from legal and consulting to creative and technical specialties'
  }
];

export default function ProfessionalServicesMarketplacePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 backdrop-blur-sm text-blue-200 text-sm font-medium mb-6">
                <BriefcaseIcon className="h-4 w-4 mr-2" />
                Professional Services Marketplace
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Build Your Professional
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                  Services Empire
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Complete Upwork & Fiverr-style marketplace platform connecting businesses with 
                expert professionals. Verified network, secure escrow payments, and comprehensive 
                project management tools.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">45-90 days</div>
                  <div className="text-blue-200 text-sm">Launch Timeline</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">$30K-85K</div>
                  <div className="text-blue-200 text-sm">Investment Range</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Platform Demo
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="#demo"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Professional Portal
                </Link>
              </div>
            </div>
            
            <ProfessionalServicesHeroImage />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Professional Services Ecosystem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything needed to connect businesses with expert professionals in a secure, efficient marketplace
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
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

      {/* Platform Components */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Multi-Stakeholder Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three specialized applications serving clients, professionals, and administrators
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {platformComponents.map((component, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{component.title}</h3>
                <p className="text-gray-600 mb-6">{component.description}</p>
                <div className="grid grid-cols-1 gap-3">
                  {component.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Service Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Support for diverse professional services across all major business categories
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {serviceCategories.map((category, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
                </div>
                <div className="space-y-3">
                  {category.services.map((service, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Advantages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Professional Services Marketplaces Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialized features designed specifically for professional service delivery and quality assurance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {uniqueAdvantages.map((advantage, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{advantage.title}</h3>
                <p className="text-gray-600">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Feature Set
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything needed for a successful professional services marketplace
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {comprehensiveFeatures.map((feature, index) => (
              <div key={index} className="flex items-center bg-gray-50 rounded-lg p-4">
                <CheckIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Advanced Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with modern technologies optimized for professional service delivery and collaboration
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-white text-gray-800 font-medium rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Implementation Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Structured 4-phase approach to launch your professional services marketplace successfully
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {implementationPhases.map((phase, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {phase.phase}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{phase.title}</h3>
                  <div className="flex items-center text-sm text-blue-600 font-medium mb-4">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {phase.duration}
                  </div>
                  <p className="text-gray-600 mb-4">{phase.description}</p>
                  <div className="space-y-2">
                    {phase.deliverables.map((deliverable, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-500">
                        <CheckIcon className="h-3 w-3 text-blue-500 mr-2" />
                        {deliverable}
                      </div>
                    ))}
                  </div>
                </div>
                {index < implementationPhases.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Massive Market Opportunity
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tap into the rapidly growing professional services and freelance economy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {marketOpportunity.map((market, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{market.market}</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">{market.size}</div>
                <div className="text-blue-600 font-semibold">{market.growth}</div>
              </div>
            ))}
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {successMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{metric.benchmark}</div>
                <div className="font-semibold text-gray-900 mb-2">{metric.metric}</div>
                <div className="text-sm text-gray-600">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professional Services Platform Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right package for your professional services marketplace vision
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${tier.highlight ? 'ring-2 ring-blue-500 scale-105' : 'border border-gray-200'}`}>
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{tier.price}</div>
                  <div className="text-sm text-gray-500 mb-4">Launch in {tier.launch}</div>
                  <p className="text-gray-600">{tier.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    tier.highlight 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </Link>
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
            Ready to Build Your Professional Services Empire?
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join successful marketplace entrepreneurs who chose Zoptal for their professional services platform. 
            Complete ecosystem from expert verification to secure project delivery - we handle the technology, you focus on building your network.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Platform Demo
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/solutions/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
            >
              Explore Other Solutions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}