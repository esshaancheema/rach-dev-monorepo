import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  VideoCameraIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  HeartIcon,
  BeakerIcon,
  BuildingOffice2Icon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ClockIcon,
  UserGroupIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  LockClosedIcon,
  WifiIcon
} from '@heroicons/react/24/outline';
import TelemedicineHeroImage from '@/components/TelemedicineHeroImage';

export const metadata: Metadata = {
  title: 'Telemedicine & Healthcare Platform | HIPAA-Compliant Telehealth Solution | Zoptal',
  description: 'Launch your HIPAA-compliant telemedicine platform in 90-180 days. Complete healthcare solution with EHR integration, video consultations, and patient management. Investment from $75K-300K+.',
  keywords: [
    'telemedicine platform',
    'telehealth solution',
    'HIPAA compliant healthcare',
    'healthcare technology',
    'medical software development',
    'EHR integration',
    'patient management system',
    'healthcare app development',
    'medical platform',
    'clinical decision support',
    'remote patient monitoring',
    'healthcare compliance',
    'medical practice software',
    'telehealth app development'
  ],
  openGraph: {
    title: 'Telemedicine & Healthcare Platform | Zoptal',
    description: 'Launch your HIPAA-compliant telemedicine platform in 90-180 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: VideoCameraIcon,
    title: 'HIPAA-Compliant Video Consultations',
    description: 'Secure, HD video consultations with end-to-end encryption, meeting all healthcare privacy requirements.'
  },
  {
    icon: DocumentTextIcon,
    title: 'Electronic Health Records Integration',
    description: 'Seamless integration with major EHR systems including Epic, Cerner, and AllScripts for complete patient data access.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Patient Data Management',
    description: 'Advanced security protocols with multi-factor authentication, audit trails, and comprehensive privacy controls.'
  },
  {
    icon: AcademicCapIcon,
    title: 'Clinical Decision Support',
    description: 'Evidence-based treatment recommendations and clinical protocols to enhance care quality and outcomes.'
  }
];

const platformComponents = [
  {
    title: 'Patient Portal',
    description: 'Comprehensive patient-facing application for healthcare access',
    features: [
      'HD video consultations with providers',
      'Secure health records access',
      'Appointment scheduling & reminders',
      'Prescription management & refills',
      'Symptom checker & health tracking',
      'Insurance verification & billing'
    ]
  },
  {
    title: 'Provider Dashboard',
    description: 'Complete clinical workspace for healthcare professionals',
    features: [
      'Patient management & scheduling',
      'EHR integration & documentation',
      'Clinical decision support tools',
      'Billing & insurance claims processing',
      'Remote monitoring & diagnostics',
      'Performance analytics & reporting'
    ]
  },
  {
    title: 'Healthcare Organization Panel',
    description: 'Administrative control center for healthcare systems',
    features: [
      'Provider network management',
      'Quality assurance & compliance monitoring',
      'Resource allocation & scheduling',
      'Analytics & operational reporting',
      'Integration hub for medical systems',
      'Regulatory compliance tracking'
    ]
  }
];

const healthcareSolutions = [
  {
    name: 'Primary Care Telemedicine',
    icon: HeartIcon,
    services: [
      'General consultations & preventive care',
      'Chronic disease management (diabetes, hypertension)',
      'Mental health support & therapy',
      'Pediatric care & development tracking',
      'Geriatric care & medication management'
    ]
  },
  {
    name: 'Specialty Healthcare Platforms',
    icon: BeakerIcon,
    services: [
      'Dermatology & skin condition diagnosis',
      'Cardiology & heart health monitoring',
      'Psychiatry & behavioral therapy',
      'Oncology & cancer care coordination',
      'Endocrinology & hormone management'
    ]
  },
  {
    name: 'Healthcare Marketplace Features',
    icon: BuildingOffice2Icon,
    services: [
      'On-demand consultations & urgent care',
      'Specialist referrals & care coordination',
      'Lab test coordination & results',
      'Pharmacy integration & prescriptions',
      'Home health services & monitoring'
    ]
  },
  {
    name: 'Compliance & Security',
    icon: ShieldCheckIcon,
    services: [
      'HIPAA compliance & patient privacy',
      'FDA regulations & medical standards',
      'End-to-end encryption & security',
      'Audit trails & access monitoring',
      'Data backup & disaster recovery'
    ]
  }
];

const complianceFeatures = [
  'HIPAA compliance certification',
  'End-to-end encryption',
  'Multi-factor authentication',
  'Comprehensive audit trails',
  'Patient consent management',
  'Data minimization protocols',
  'Secure data backup & recovery',
  'Medical device integration',
  'EHR system connectivity',
  'Insurance verification',
  'Clinical decision support',
  'Remote patient monitoring',
  'Provider credentialing',
  'Quality assurance tracking',
  'Regulatory compliance reporting',
  'Medical billing & claims processing'
];

const technologies = [
  'React Native', 'Node.js', 'PostgreSQL', 'Redis', 'WebRTC', 'HL7 FHIR',
  'AWS Healthcare', 'DICOM Integration', 'Docker', 'GraphQL', 'OAuth 2.0', 'JWT Authentication'
];

const implementationPhases = [
  {
    phase: 1,
    title: 'Compliance Assessment & Platform Setup',
    description: 'Conduct HIPAA compliance review, set up secure infrastructure, and configure basic patient/provider systems.',
    duration: '2-3 weeks',
    deliverables: ['HIPAA compliance assessment', 'Secure platform deployment', 'User management system', 'Basic admin dashboard']
  },
  {
    phase: 2,
    title: 'Clinical Features & EHR Integration',
    description: 'Develop video consultation platform, integrate with EHR systems, and implement clinical decision support.',
    duration: '8-10 weeks',
    deliverables: ['Video consultation platform', 'EHR system integration', 'Clinical workflows', 'Patient data management']
  },
  {
    phase: 3,
    title: 'Security Validation & Testing',
    description: 'Comprehensive security testing, HIPAA compliance validation, and clinical workflow testing.',
    duration: '3-4 weeks',
    deliverables: ['Security penetration testing', 'HIPAA compliance validation', 'Clinical testing', 'Provider training materials']
  },
  {
    phase: 4,
    title: 'Launch & Clinical Support',
    description: 'Platform launch with provider onboarding, patient enrollment, and ongoing clinical support.',
    duration: 'Ongoing',
    deliverables: ['Platform launch', 'Provider onboarding', 'Patient enrollment', '6 months clinical support']
  }
];

const pricingTiers = [
  {
    name: 'Essential Package',
    price: '$75,000',
    description: 'Basic telemedicine platform for small practices',
    features: [
      'Patient and provider mobile apps',
      'Video consultation platform',
      'Basic EHR integration',
      'HIPAA-compliant infrastructure',
      'Appointment scheduling system',
      'Basic security & compliance',
      'Email support',
      '90 days support & guidance'
    ],
    highlight: false,
    launch: '90-120 days'
  },
  {
    name: 'Professional Package',
    price: '$150,000',
    description: 'Complete healthcare solution with advanced features',
    features: [
      'Everything in Essential',
      'Advanced EHR & practice management',
      'Insurance integration & billing',
      'Remote monitoring integration',
      'Clinical decision support',
      'Analytics & reporting dashboard',
      'Multi-location support',
      'Priority support',
      '6 months support & maintenance'
    ],
    highlight: true,
    launch: '120-150 days'
  },
  {
    name: 'Enterprise Package',
    price: '$300,000+',
    description: 'Full healthcare ecosystem for large organizations',
    features: [
      'Everything in Professional',
      'Custom clinical workflows',
      'Advanced AI & clinical decision support',
      'Multi-specialty provider network',
      'Custom integrations & development',
      'Dedicated compliance team',
      'White-label customization',
      'Enterprise support',
      '12 months maintenance & updates'
    ],
    highlight: false,
    launch: '150-180 days'
  }
];

const marketOpportunity = [
  {
    market: 'Global Telemedicine Market',
    size: '$350B+',
    growth: '25% annual growth'
  },
  {
    market: 'Healthcare IT Market',
    size: '$660B+',
    growth: '15% annual growth'
  },
  {
    market: 'Remote Patient Monitoring',
    size: '$71B+',
    growth: '20% annual growth'
  }
];

const successMetrics = [
  {
    metric: 'Patient Satisfaction',
    benchmark: '95%+',
    description: 'Average patient satisfaction scores'
  },
  {
    metric: 'Provider Adoption',
    benchmark: '80%+',
    description: 'Healthcare provider platform usage'
  },
  {
    metric: 'Clinical Quality',
    benchmark: '40% improvement',
    description: 'Health outcomes & care coordination'
  },
  {
    metric: 'Cost Reduction',
    benchmark: '30-50%',
    description: 'Healthcare delivery cost savings'
  }
];

const uniqueAdvantages = [
  {
    title: 'Complete HIPAA Compliance',
    description: 'Built specifically for healthcare with end-to-end encryption, audit trails, and comprehensive privacy controls meeting all HIPAA requirements'
  },
  {
    title: 'Clinical Integration Excellence',
    description: 'Seamless integration with major EHR systems, clinical decision support tools, and medical device connectivity for comprehensive care'
  },
  {
    title: 'Proven Healthcare Results',
    description: 'Demonstrated improvements in patient outcomes, provider efficiency, and healthcare accessibility with measurable clinical benefits'
  },
  {
    title: 'Expert Healthcare Support',
    description: 'Dedicated healthcare technology and compliance expertise ensuring successful implementation and ongoing regulatory adherence'
  }
];

export default function TelemedicineHealthcarePlatformPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-600/20 backdrop-blur-sm text-green-200 text-sm font-medium mb-6">
                <HeartIcon className="h-4 w-4 mr-2" />
                HIPAA-Compliant Telemedicine Platform
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Launch Your
                <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent block">
                  Telehealth Platform
                </span>
                in 90 Days
              </h1>
              
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Complete Healthcare Solution with HIPAA-compliant telemedicine, EHR integration, 
                and comprehensive patient management. Transform healthcare delivery with secure 
                video consultations and clinical decision support.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">90-180 days</div>
                  <div className="text-green-200 text-sm">Launch Timeline</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">$75K-300K+</div>
                  <div className="text-green-200 text-sm">Investment Range</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Schedule HIPAA Demo
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="#compliance"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Compliance Features
                </Link>
              </div>
            </div>
            
            <TelemedicineHeroImage />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Healthcare Technology Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              HIPAA-compliant telemedicine solution with comprehensive clinical integration and patient management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-green-600 group-hover:text-white transition-colors" />
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
              Multi-Stakeholder Healthcare Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three specialized applications serving patients, providers, and healthcare organizations
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
                      <CheckIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Healthcare Solutions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Specialized Healthcare Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive telemedicine capabilities across all major healthcare specialties
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {healthcareSolutions.map((solution, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                    <solution.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{solution.name}</h3>
                </div>
                <div className="space-y-3">
                  {solution.services.map((service, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance & Security */}
      <section id="compliance" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6">
              <LockClosedIcon className="h-4 w-4 mr-2" />
              HIPAA Certified & FDA Compliant
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Healthcare Compliance & Security
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for healthcare with comprehensive compliance and security features
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {complianceFeatures.map((feature, index) => (
              <div key={index} className="flex items-center bg-white rounded-lg p-4">
                <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Advantages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Healthcare Organizations Choose Zoptal
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proven expertise in healthcare technology with focus on compliance, integration, and clinical outcomes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {uniqueAdvantages.map((advantage, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{advantage.title}</h3>
                <p className="text-gray-600">{advantage.description}</p>
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
              Healthcare-Grade Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with healthcare-specific technologies and medical industry standards
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-white text-gray-800 font-medium rounded-full hover:bg-green-100 hover:text-green-800 transition-colors"
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
              Healthcare Implementation Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Structured 4-phase approach ensuring HIPAA compliance and clinical integration
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {implementationPhases.map((phase, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {phase.phase}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{phase.title}</h3>
                  <div className="flex items-center text-sm text-green-600 font-medium mb-4">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {phase.duration}
                  </div>
                  <p className="text-gray-600 mb-4">{phase.description}</p>
                  <div className="space-y-2">
                    {phase.deliverables.map((deliverable, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-500">
                        <CheckIcon className="h-3 w-3 text-green-500 mr-2" />
                        {deliverable}
                      </div>
                    ))}
                  </div>
                </div>
                {index < implementationPhases.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-green-200" />
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
              Healthcare Technology Market Opportunity
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Massive growth in telemedicine and healthcare IT creating unprecedented opportunities
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {marketOpportunity.map((market, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{market.market}</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">{market.size}</div>
                <div className="text-green-600 font-semibold">{market.growth}</div>
              </div>
            ))}
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {successMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">{metric.benchmark}</div>
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
              Healthcare Platform Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right HIPAA-compliant solution for your healthcare organization
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${tier.highlight ? 'ring-2 ring-green-500 scale-105' : 'border border-gray-200'}`}>
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-green-600 mb-2">{tier.price}</div>
                  <div className="text-sm text-gray-500 mb-4">Launch in {tier.launch}</div>
                  <p className="text-gray-600">{tier.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    tier.highlight 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
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
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Healthcare Delivery?
          </h2>
          
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join healthcare organizations who chose Zoptal for their telemedicine platform. 
            Complete HIPAA-compliant solution from patient consultations to clinical integration - we handle the technology, you focus on patient care.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Schedule HIPAA Demo
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/solutions/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors"
            >
              Explore Other Solutions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}