import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  VideoCameraIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  BuildingOffice2Icon,
  HeartIcon,
  UserGroupIcon,
  ClockIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  BellIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import PetHealthcareHeroImage from '@/components/PetHealthcareHeroImage';

export const metadata: Metadata = {
  title: 'Pet Healthcare & Veterinary Services Platform | Veterinary Telemedicine Solution | Zoptal',
  description: 'Launch your comprehensive pet healthcare platform in 60-150 days. Veterinary telemedicine, digital pet health records, emergency care, and practice management. Investment from $40K-120K.',
  keywords: [
    'pet healthcare platform',
    'veterinary telemedicine',
    'pet care software',
    'veterinary practice management',
    'pet health records',
    'animal healthcare technology',
    'vet clinic software',
    'pet emergency care',
    'veterinary app development',
    'pet insurance platform',
    'animal health management',
    'veterinary consultation app',
    'pet wellness platform',
    'digital pet care solution'
  ],
  openGraph: {
    title: 'Pet Healthcare & Veterinary Services Platform | Zoptal',
    description: 'Launch your comprehensive pet healthcare platform in 60-150 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: VideoCameraIcon,
    title: 'Veterinary Telemedicine',
    description: 'HD video consultations between pet owners and licensed veterinarians with visual examination capabilities.'
  },
  {
    icon: DocumentTextIcon,
    title: 'Digital Pet Health Records',
    description: 'Comprehensive electronic health records for pets including vaccination history, medical records, and treatment plans.'
  },
  {
    icon: ExclamationTriangleIcon,
    title: '24/7 Emergency Pet Care',
    description: 'Urgent care triage, emergency clinic network, and critical care coordination for pet emergencies.'
  },
  {
    icon: BuildingOffice2Icon,
    title: 'Pet Care Practice Management',
    description: 'Complete veterinary practice operations including scheduling, billing, inventory, and staff management.'
  }
];

const platformComponents = [
  {
    title: 'Pet Owner App',
    description: 'Comprehensive mobile app for pet owners and caregivers',
    features: [
      'Virtual consultations with veterinarians',
      'Digital pet health records & history',
      'AI-powered symptom checker',
      'Appointment booking & scheduling',
      'Medication reminders & tracking',
      'Emergency care access & triage',
      'Multi-pet household management',
      'Pet insurance claims & coverage'
    ]
  },
  {
    title: 'Veterinarian Dashboard',
    description: 'Professional workspace for licensed veterinarians',
    features: [
      'Patient management & medical records',
      'Telemedicine consultation tools',
      'Digital prescription management',
      'Insurance billing & claims processing',
      'Continuing education & certification',
      'Mobile access for iOS & Android',
      'Specialist referral network',
      'Practice analytics & insights'
    ]
  },
  {
    title: 'Veterinary Clinic Management',
    description: 'Complete practice operations and administration',
    features: [
      'Appointment scheduling & calendar',
      'Electronic health record system',
      'Inventory & supply management',
      'Staff scheduling & performance',
      'Financial reporting & analysis',
      'Automated client communications',
      'Multi-location clinic support',
      'Laboratory & system integrations'
    ]
  }
];

const petCareSolutions = [
  {
    name: 'Telemedicine Capabilities',
    icon: VideoCameraIcon,
    services: [
      'HD video consultations with veterinarians',
      'Photo & video sharing for visual assessment',
      'Specialist referrals & consultations',
      'Follow-up care & post-treatment monitoring',
      'Remote patient monitoring integration'
    ]
  },
  {
    name: 'Emergency Services',
    icon: ExclamationTriangleIcon,
    services: [
      '24/7 urgent care triage & assessment',
      'Emergency clinic network directory',
      'Critical care specialist coordination',
      'Pet insurance emergency claims',
      'After-hours veterinary support'
    ]
  },
  {
    name: 'Pet Health Monitoring',
    icon: HeartIcon,
    services: [
      'Vaccination tracking & automated reminders',
      'Wellness plans & preventive care programs',
      'Chronic disease management (diabetes, cardiac)',
      'Pet behavioral health & training consultation',
      'Nutrition & dietary management'
    ]
  },
  {
    name: 'Practice Management',
    icon: BuildingOffice2Icon,
    services: [
      'Complete appointment scheduling system',
      'Billing & payment processing',
      'Insurance verification & claims',
      'Medical supply inventory management',
      'Staff management & scheduling'
    ]
  }
];

const comprehensiveFeatures = [
  'Veterinary telemedicine platform',
  'Digital pet health records',
  'AI-powered pet symptom checker',
  'Emergency triage & routing',
  'Multi-pet household management',
  'Vaccination tracking & reminders',
  'Prescription management',
  'Pet insurance integration',
  'Appointment scheduling',
  'Practice management system',
  'Inventory management',
  'Staff scheduling & payroll',
  'Financial reporting',
  'Client communication tools',
  'Laboratory integrations',
  'Specialist referral network'
];

const technologies = [
  'React Native', 'Node.js', 'PostgreSQL', 'Redis', 'WebRTC', 'AWS',
  'Stripe API', 'Twilio', 'Socket.io', 'Docker', 'GraphQL', 'JWT Authentication'
];

const implementationPhases = [
  {
    phase: 1,
    title: 'Platform Foundation & Pet Records',
    description: 'Set up core infrastructure, pet owner and veterinarian registration, and basic digital health records system.',
    duration: '2-3 weeks',
    deliverables: ['Platform deployment', 'User registration system', 'Pet health records', 'Basic admin dashboard']
  },
  {
    phase: 2,
    title: 'Telemedicine & Practice Management',
    description: 'Develop video consultation platform, appointment booking, and veterinary practice management tools.',
    duration: '6-8 weeks',
    deliverables: ['Telemedicine platform', 'Appointment scheduling', 'Practice management system', 'Billing integration']
  },
  {
    phase: 3,
    title: 'Emergency Care & Advanced Features',
    description: 'Implement emergency triage system, specialist referrals, and advanced pet care features.',
    duration: '3-4 weeks',
    deliverables: ['Emergency care system', 'Specialist network', 'Advanced pet monitoring', 'Insurance integration']
  },
  {
    phase: 4,
    title: 'Launch & Veterinary Support',
    description: 'Platform launch with veterinarian onboarding, pet owner acquisition, and ongoing care support.',
    duration: 'Ongoing',
    deliverables: ['Platform launch', 'Veterinarian onboarding', 'Pet owner acquisition', '6 months support']
  }
];

const pricingTiers = [
  {
    name: 'Starter Package',
    price: '$40,000',
    description: 'Basic pet healthcare platform for small veterinary practices',
    features: [
      'Pet owner and veterinarian apps',
      'Basic telemedicine capabilities',
      'Simple appointment booking',
      'Pet health record management',
      'Basic emergency care features',
      'Email support',
      '60 days support & guidance'
    ],
    highlight: false,
    launch: '60-90 days'
  },
  {
    name: 'Professional Package',
    price: '$70,000',
    description: 'Complete veterinary solution with advanced pet care features',
    features: [
      'Everything in Starter',
      'Advanced telemedicine features',
      'Complete practice management',
      'Emergency care coordination',
      'Pet insurance integration',
      'Multi-location support',
      'Priority support',
      '90 days support & maintenance'
    ],
    highlight: true,
    launch: '90-120 days'
  },
  {
    name: 'Enterprise Package',
    price: '$120,000+',
    description: 'Full pet healthcare ecosystem for large veterinary organizations',
    features: [
      'Everything in Professional',
      'Multi-clinic network management',
      'Advanced analytics & reporting',
      'Custom integrations & development',
      'White-label customization',
      'Dedicated veterinary support team',
      'Enterprise features',
      '6 months maintenance & updates'
    ],
    highlight: false,
    launch: '120-150 days'
  }
];

const marketOpportunity = [
  {
    market: 'Global Pet Healthcare Market',
    size: '$261B+',
    growth: '6.1% annual growth'
  },
  {
    market: 'Pet Telemedicine Market',
    size: '$2.4B+',
    growth: '22% annual growth'
  },
  {
    market: 'Veterinary Software Market',
    size: '$1.8B+',
    growth: '8.2% annual growth'
  }
];

const successMetrics = [
  {
    metric: 'Pet Owner Satisfaction',
    benchmark: '92%+',
    description: 'Average pet care satisfaction scores'
  },
  {
    metric: 'Veterinarian Adoption',
    benchmark: '85%+',
    description: 'Veterinary professional usage rate'
  },
  {
    metric: 'Emergency Response',
    benchmark: '< 15 min',
    description: 'Average emergency triage time'
  },
  {
    metric: 'Practice Efficiency',
    benchmark: '40% improvement',
    description: 'Veterinary practice productivity'
  }
];

const uniqueAdvantages = [
  {
    title: 'Complete Pet Care Solution',
    description: 'Comprehensive platform covering telemedicine, health records, emergency care, and practice management for all aspects of pet healthcare'
  },
  {
    title: 'Veterinary Expertise Built-In',
    description: 'Designed specifically for licensed veterinary professionals with clinical workflows and industry-standard practice management'
  },
  {
    title: '24/7 Emergency Ready',
    description: 'Dedicated emergency care capabilities with triage, urgent care routing, and critical care specialist coordination'
  },
  {
    title: 'Scalable Pet Care Platform',
    description: 'Flexible architecture supporting individual veterinarians to large clinic chains and multi-location practices'
  }
];

export default function PetHealthcareVeterinaryServicesPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-800 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-600/20 backdrop-blur-sm text-orange-200 text-sm font-medium mb-6">
                <HeartIcon className="h-4 w-4 mr-2" />
                Pet Healthcare & Veterinary Services
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Launch Your
                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent block">
                  Pet Healthcare Platform
                </span>
                in 90 Days
              </h1>
              
              <p className="text-xl text-orange-100 mb-8 leading-relaxed">
                Complete Veterinary Telemedicine & Pet Care Solution. Connect pet owners, 
                veterinarians, and pet service providers through comprehensive telemedicine, 
                digital health records, and emergency care coordination.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">60-150 days</div>
                  <div className="text-orange-200 text-sm">Launch Timeline</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">$40K-120K</div>
                  <div className="text-orange-200 text-sm">Investment Range</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Schedule Vet Demo
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Pet Care Features
                </Link>
              </div>
            </div>
            
            <PetHealthcareHeroImage />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Pet Healthcare Technology Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive veterinary telemedicine solution with practice management and emergency care coordination
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-orange-600 group-hover:text-white transition-colors" />
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
              Multi-Stakeholder Pet Care Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three specialized applications serving pet owners, veterinarians, and veterinary clinics
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
                      <CheckIcon className="h-4 w-4 text-orange-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pet Care Solutions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Specialized Pet Care Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive pet healthcare capabilities across all aspects of veterinary care
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {petCareSolutions.map((solution, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                    <solution.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{solution.name}</h3>
                </div>
                <div className="space-y-3">
                  {solution.services.map((service, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-orange-500 mr-3 flex-shrink-0" />
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
              Why Veterinary Professionals Choose Zoptal
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialized platform designed specifically for pet healthcare and veterinary practice management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {uniqueAdvantages.map((advantage, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8">
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
              Comprehensive Pet Care Feature Set
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything needed for a successful pet healthcare and veterinary services platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {comprehensiveFeatures.map((feature, index) => (
              <div key={index} className="flex items-center bg-gray-50 rounded-lg p-4">
                <CheckIcon className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
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
              Pet Care Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with reliable technologies optimized for pet healthcare and veterinary practice management
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-white text-gray-800 font-medium rounded-full hover:bg-orange-100 hover:text-orange-800 transition-colors"
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
              Pet Healthcare Implementation Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Structured 4-phase approach to launch your pet healthcare platform successfully
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {implementationPhases.map((phase, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {phase.phase}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{phase.title}</h3>
                  <div className="flex items-center text-sm text-orange-600 font-medium mb-4">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {phase.duration}
                  </div>
                  <p className="text-gray-600 mb-4">{phase.description}</p>
                  <div className="space-y-2">
                    {phase.deliverables.map((deliverable, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-500">
                        <CheckIcon className="h-3 w-3 text-orange-500 mr-2" />
                        {deliverable}
                      </div>
                    ))}
                  </div>
                </div>
                {index < implementationPhases.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-orange-200" />
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
              Pet Healthcare Market Opportunity
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Growing pet ownership and healthcare spending creating massive market opportunities
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {marketOpportunity.map((market, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{market.market}</h3>
                <div className="text-3xl font-bold text-orange-600 mb-2">{market.size}</div>
                <div className="text-orange-600 font-semibold">{market.growth}</div>
              </div>
            ))}
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {successMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">{metric.benchmark}</div>
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
              Pet Healthcare Platform Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right solution for your veterinary practice or pet care organization
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${tier.highlight ? 'ring-2 ring-orange-500 scale-105' : 'border border-gray-200'}`}>
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-orange-600 mb-2">{tier.price}</div>
                  <div className="text-sm text-gray-500 mb-4">Launch in {tier.launch}</div>
                  <p className="text-gray-600">{tier.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    tier.highlight 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
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
      <section className="py-20 bg-gradient-to-r from-orange-600 to-amber-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Pet Healthcare?
          </h2>
          
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join veterinary professionals who chose Zoptal for their pet healthcare platform. 
            Complete solution from telemedicine to practice management - we handle the technology, you focus on caring for pets and their families.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Schedule Vet Demo
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/solutions/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-orange-700 text-white font-semibold rounded-lg hover:bg-orange-800 transition-colors"
            >
              Explore Other Solutions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}