import { Metadata } from 'next';
import { motion } from 'framer-motion';
import { 
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  CpuChipIcon,
  GlobeAltIcon,
  CheckIcon,
  StarIcon,
  BoltIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  SparklesIcon,
  ArrowRightIcon,
  BeakerIcon,
  DevicePhoneMobileIcon,
  CloudArrowUpIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { SEOHead } from '@/components/seo';
import { generateServiceSchema, combineSchemas, ZOPTAL_ORGANIZATION_SCHEMA } from '@/lib/seo/schemas';
import { getKeywordsForIndustry } from '@/lib/seo/keywords';

export const metadata: Metadata = {
  title: 'Healthcare Software Development | HIPAA Compliant Solutions | Zoptal',
  description: 'Specialized healthcare software development services. HIPAA compliant applications, EHR/EMR systems, telemedicine platforms, and medical device integration for healthcare organizations.',
  keywords: [
    'healthcare software development',
    'HIPAA compliant software',
    'medical software development',
    'healthcare IT solutions',
    'electronic health records',
    'telemedicine development',
    'clinical software development',
    'healthcare app development',
    'medical device software',
    'patient management systems'
  ]
};

const healthcareFeatures = [
  {
    icon: ShieldCheckIcon,
    title: 'HIPAA Compliance',
    description: 'Built-in security and compliance for protected health information',
    details: [
      'End-to-end encryption',
      'Access control and audit logs',
      'Data privacy safeguards',
      'Business Associate Agreements',
      'Regular security audits',
      'Compliance documentation'
    ]
  },
  {
    icon: HeartIcon,
    title: 'Patient-Centered Design',
    description: 'Intuitive interfaces designed for patients and healthcare providers',
    details: [
      'Accessibility compliance (WCAG)',
      'Multi-language support',
      'Mobile-first design',
      'User-friendly interfaces',
      'Patient portals',
      'Caregiver access'
    ]
  },
  {
    icon: DocumentTextIcon,
    title: 'Clinical Integration',
    description: 'Seamless integration with existing healthcare systems',
    details: [
      'HL7 FHIR compatibility',
      'EHR/EMR integration',
      'Medical device connectivity',
      'Laboratory systems',
      'Pharmacy systems',
      'Billing integration'
    ]
  },
  {
    icon: ChartBarIcon,
    title: 'Healthcare Analytics',
    description: 'Advanced analytics for better clinical and operational decisions',
    details: [
      'Clinical dashboards',
      'Population health analytics',
      'Quality metrics tracking',
      'Financial analytics',
      'Predictive modeling',
      'Real-time reporting'
    ]
  }
];

const solutionTypes = [
  {
    id: 'ehr-emr',
    title: 'Electronic Health Records (EHR/EMR)',
    description: 'Comprehensive digital health record systems for healthcare providers',
    icon: DocumentTextIcon,
    features: [
      'Patient record management',
      'Clinical documentation',
      'E-prescribing',
      'Lab integration',
      'Imaging integration',
      'Clinical decision support',
      'Interoperability',
      'Mobile access'
    ],
    benefits: [
      'Improved patient care',
      'Reduced medical errors',
      'Streamlined workflows',
      'Better care coordination',
      'Regulatory compliance',
      'Enhanced reporting'
    ],
    useCases: [
      'Hospitals',
      'Medical practices',
      'Specialty clinics',
      'Ambulatory centers',
      'Multi-facility networks'
    ]
  },
  {
    id: 'telemedicine',
    title: 'Telemedicine Platforms',
    description: 'Virtual care solutions for remote patient consultations',
    icon: DevicePhoneMobileIcon,
    features: [
      'HD video consultations',
      'Secure messaging',
      'Appointment scheduling',
      'E-prescriptions',
      'Payment processing',
      'EHR integration',
      'Multi-party calls',
      'Screen sharing'
    ],
    benefits: [
      'Expanded patient access',
      'Reduced no-shows',
      'Lower healthcare costs',
      'Improved convenience',
      'Better follow-up care',
      'Geographic reach'
    ],
    useCases: [
      'Primary care',
      'Mental health',
      'Specialty consultations',
      'Follow-up visits',
      'Chronic care management'
    ]
  },
  {
    id: 'patient-management',
    title: 'Patient Management Systems',
    description: 'Comprehensive platforms for patient engagement and care coordination',
    icon: UserGroupIcon,
    features: [
      'Patient portals',
      'Appointment booking',
      'Medical history access',
      'Medication management',
      'Care plan tracking',
      'Family access',
      'Health education',
      'Notifications'
    ],
    benefits: [
      'Increased engagement',
      'Better adherence',
      'Reduced readmissions',
      'Improved satisfaction',
      'Self-service options',
      'Care continuity'
    ],
    useCases: [
      'Chronic disease management',
      'Post-operative care',
      'Preventive care',
      'Patient education',
      'Care coordination'
    ]
  },
  {
    id: 'clinical-trials',
    title: 'Clinical Trial Management',
    description: 'Software solutions for managing clinical research and trials',
    icon: BeakerIcon,
    features: [
      'Patient recruitment',
      'Protocol management',
      'Data collection (EDC)',
      'Randomization',
      'Adverse event tracking',
      'Regulatory compliance',
      'Statistical analysis',
      'Document management'
    ],
    benefits: [
      'Faster trial completion',
      'Improved data quality',
      'Regulatory compliance',
      'Cost reduction',
      'Better patient retention',
      'Real-time monitoring'
    ],
    useCases: [
      'Pharmaceutical companies',
      'Research organizations',
      'Academic medical centers',
      'Contract research orgs',
      'Biotech companies'
    ]
  }
];

const complianceStandards = [
  {
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act compliance',
    requirements: ['Privacy Rule', 'Security Rule', 'Breach Notification', 'Enforcement Rule']
  },
  {
    name: 'HL7 FHIR',
    description: 'Fast Healthcare Interoperability Resources standard',
    requirements: ['Data Exchange', 'API Standards', 'Resource Formats', 'Security Protocols']
  },
  {
    name: 'FDA 21 CFR Part 11',
    description: 'Electronic records and signatures compliance',
    requirements: ['Validation', 'Audit Trails', 'Electronic Signatures', 'Data Integrity']
  },
  {
    name: 'GDPR',
    description: 'General Data Protection Regulation for EU patients',
    requirements: ['Data Protection', 'Patient Rights', 'Consent Management', 'Data Portability']
  }
];

const caseStudies = [
  {
    title: 'Regional Hospital Network EHR',
    client: 'MedCare Health System',
    type: 'Electronic Health Records',
    challenge: 'Replace legacy systems across 12 hospitals with unified EHR platform',
    solution: 'Cloud-based EHR with real-time synchronization and mobile access',
    results: {
      adoption: '95% physician adoption rate',
      efficiency: '40% reduction in documentation time',
      errors: '60% decrease in medical errors',
      satisfaction: '88% provider satisfaction'
    },
    technologies: ['React', 'Node.js', 'PostgreSQL', 'FHIR', 'AWS', 'Docker'],
    timeline: '18 months',
    testimonial: {
      quote: 'The new EHR system has transformed how we deliver care. The intuitive interface and mobile capabilities have made our physicians more efficient and our patients happier.',
      author: 'Dr. Sarah Mitchell',
      role: 'Chief Medical Officer'
    }
  },
  {
    title: 'Telehealth Platform for Mental Health',
    client: 'MindWell Behavioral Health',
    type: 'Telemedicine Platform',
    challenge: 'Create HIPAA-compliant teletherapy platform with group sessions',
    solution: 'Custom telemedicine platform with integrated billing and EHR',
    results: {
      growth: '300% patient growth',
      satisfaction: '94% patient satisfaction',
      noshows: '70% reduction in no-shows',
      revenue: '250% revenue increase'
    },
    technologies: ['Vue.js', 'Python', 'WebRTC', 'PostgreSQL', 'Stripe', 'AWS'],
    timeline: '6 months',
    testimonial: {
      quote: 'Zoptal built us a platform that not only meets all compliance requirements but has allowed us to scale our practice beyond what we imagined.',
      author: 'Dr. Michael Chen',
      role: 'Founder & CEO'
    }
  },
  {
    title: 'AI-Powered Diagnostic Assistant',
    client: 'Precision Diagnostics Lab',
    type: 'Clinical Decision Support',
    challenge: 'Develop AI system to assist radiologists with image analysis',
    solution: 'Machine learning platform integrated with PACS and reporting systems',
    results: {
      accuracy: '97% diagnostic accuracy',
      speed: '65% faster analysis',
      throughput: '2x radiology throughput',
      detection: '30% improvement in early detection'
    },
    technologies: ['Python', 'TensorFlow', 'React', 'DICOM', 'HL7', 'Google Cloud'],
    timeline: '12 months',
    testimonial: {
      quote: 'The AI assistant has become an invaluable tool for our radiologists, improving both speed and accuracy of diagnoses.',
      author: 'Dr. Lisa Rodriguez',
      role: 'Head of Radiology'
    }
  }
];

const developmentProcess = [
  {
    phase: 'Discovery & Compliance',
    duration: '2-4 weeks',
    description: 'Understanding clinical workflows and compliance requirements',
    activities: [
      'Clinical workflow analysis',
      'Compliance assessment',
      'Integration requirements',
      'Security planning',
      'User research',
      'Risk analysis'
    ]
  },
  {
    phase: 'Design & Architecture',
    duration: '3-6 weeks',
    description: 'Creating compliant system design and user experience',
    activities: [
      'HIPAA-compliant architecture',
      'Clinical UI/UX design',
      'Data model design',
      'Integration architecture',
      'Security framework',
      'Compliance documentation'
    ]
  },
  {
    phase: 'Development & Testing',
    duration: '12-24 weeks',
    description: 'Building and validating healthcare solution',
    activities: [
      'Agile development sprints',
      'Security implementation',
      'Integration development',
      'Clinical validation',
      'Compliance testing',
      'Performance optimization'
    ]
  },
  {
    phase: 'Deployment & Training',
    duration: '2-4 weeks',
    description: 'Secure deployment and comprehensive user training',
    activities: [
      'Production deployment',
      'Data migration',
      'User training',
      'Clinical staff onboarding',
      'Documentation delivery',
      'Go-live support'
    ]
  }
];

const testimonials = [
  {
    name: 'Dr. Jennifer Thompson',
    role: 'Chief of Staff',
    organization: 'Community Medical Center',
    rating: 5,
    comment: 'Zoptal understood our complex healthcare requirements and delivered a solution that has improved patient care while maintaining strict compliance.',
    results: 'Reduced patient wait times by 45%'
  },
  {
    name: 'Robert Martinez',
    role: 'VP of Technology',
    organization: 'HealthFirst Insurance',
    rating: 5,
    comment: 'Their expertise in healthcare IT and security compliance made them the perfect partner for our member portal modernization.',
    results: 'Member engagement increased 200%'
  },
  {
    name: 'Dr. Emily Chang',
    role: 'Medical Director',
    organization: 'Pediatric Care Associates',
    rating: 5,
    comment: 'The patient management system they built has transformed how we interact with families and coordinate care across our practices.',
    results: '90% patient portal adoption'
  }
];

export default function HealthcareServicesPage() {
  const industryKeywords = getKeywordsForIndustry('healthcare');
  
  const structuredData = combineSchemas(
    ZOPTAL_ORGANIZATION_SCHEMA,
    generateServiceSchema({
      name: 'Healthcare Software Development Services',
      description: 'HIPAA compliant healthcare software development including EHR/EMR systems, telemedicine platforms, and clinical applications.',
      url: 'https://zoptal.com/services/custom-software-development/by-industry/healthcare',
      serviceType: 'Healthcare Software Development',
      provider: {
        name: 'Zoptal',
        url: 'https://zoptal.com'
      },
      areaServed: ['United States', 'Canada', 'United Kingdom', 'Australia'],
      offers: {
        price: '50000',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      aggregateRating: {
        ratingValue: 4.9,
        reviewCount: 73
      }
    })
  );

  return (
    <>
      <SEOHead
        title="Healthcare Software Development | HIPAA Compliant Solutions | Zoptal"
        description="Specialized healthcare software development services. HIPAA compliant applications, EHR/EMR systems, telemedicine platforms, and medical device integration for healthcare organizations."
        canonicalUrl="https://zoptal.com/services/custom-software-development/by-industry/healthcare"
        keywords={metadata.keywords as string[]}
        type="website"
        structuredData={structuredData}
      />

      <MainLayout>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm">
              <ol className="flex items-center space-x-2 text-gray-500">
                <li><Link href="/services" className="hover:text-primary-600">Services</Link></li>
                <li>/</li>
                <li><Link href="/services/custom-software-development" className="hover:text-primary-600">Custom Software</Link></li>
                <li>/</li>
                <li><Link href="/services/custom-software-development/by-industry" className="hover:text-primary-600">By Industry</Link></li>
                <li>/</li>
                <li className="text-gray-900">Healthcare</li>
              </ol>
            </nav>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
                >
                  <HeartIcon className="w-4 h-4" />
                  <span>Healthcare Solutions</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
                >
                  Healthcare Software Development
                  <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    HIPAA Compliant & Secure
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl text-gray-600 mb-8"
                >
                  Specialized healthcare IT solutions that improve patient care, streamline clinical workflows, 
                  and ensure regulatory compliance. Trusted by hospitals, clinics, and healthcare organizations.
                </motion.p>

                {/* Key Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-3 gap-6 mb-8"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">100%</div>
                    <div className="text-gray-600 text-sm">HIPAA Compliant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">500+</div>
                    <div className="text-gray-600 text-sm">Healthcare Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">50M+</div>
                    <div className="text-gray-600 text-sm">Patient Records</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center space-x-2 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                  >
                    <span>Get HIPAA Compliant Solution</span>
                    <ShieldCheckIcon className="w-5 h-5" />
                  </Link>
                  <Link
                    href="#solutions"
                    className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg border border-primary-200 hover:bg-primary-50 transition-all font-semibold"
                  >
                    <span>View Solutions</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>

              {/* Visual Element */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-12">
                  <div className="text-center mb-8">
                    <HeartIcon className="w-20 h-20 text-primary-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900">Healthcare Excellence</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <ShieldCheckIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">HIPAA Compliant</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <DocumentTextIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">EHR/EMR Ready</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <DevicePhoneMobileIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Telemedicine</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <LockClosedIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Secure & Safe</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Healthcare Features */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Healthcare-Specific Features
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Built with deep understanding of healthcare requirements, compliance standards, 
                and the unique needs of patients and providers.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {healthcareFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.details.slice(0, 4).map((detail, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Healthcare Solutions */}
        <section id="solutions" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Healthcare Software Solutions
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Comprehensive healthcare IT solutions designed to improve patient outcomes, 
                streamline operations, and ensure regulatory compliance.
              </motion.p>
            </div>

            <div className="space-y-12">
              {solutionTypes.map((solution, index) => (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm"
                >
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div>
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                          <solution.icon className="w-8 h-8 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {solution.title}
                          </h3>
                          <p className="text-gray-600">
                            {solution.description}
                          </p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Use Cases:</h4>
                        <div className="space-y-2">
                          {solution.useCases.map((useCase, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-600">
                              <BoltIcon className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                              {useCase}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Key Features:</h4>
                      <ul className="space-y-2">
                        {solution.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Business Benefits:</h4>
                      <ul className="space-y-2 mb-6">
                        {solution.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <SparklesIcon className="w-4 h-4 text-secondary-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/contact"
                        className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                      >
                        <span>Get Started</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance Standards */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Compliance & Standards
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                We ensure your healthcare software meets all regulatory requirements 
                and industry standards for security and interoperability.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {complianceStandards.map((standard, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-8 text-center hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <ShieldCheckIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {standard.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {standard.description}
                  </p>
                  <ul className="space-y-2">
                    {standard.requirements.map((req, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        <CheckIcon className="w-4 h-4 text-green-500 inline mr-1" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Healthcare Success Stories
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Real healthcare organizations achieving real results with our 
                custom software solutions.
              </motion.p>
            </div>

            <div className="space-y-12">
              {caseStudies.map((study, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-sm"
                >
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                          {study.type}
                        </div>
                        <div className="text-sm text-gray-600">{study.timeline}</div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{study.title}</h3>
                      <div className="mb-4">
                        <div className="text-lg font-medium text-gray-700 mb-2">{study.client}</div>
                      </div>
                      <div className="space-y-4 mb-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Challenge:</h4>
                          <p className="text-gray-600">{study.challenge}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Solution:</h4>
                          <p className="text-gray-600">{study.solution}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <p className="text-gray-700 italic mb-4">"{study.testimonial.quote}"</p>
                        <div>
                          <div className="font-semibold text-gray-900">{study.testimonial.author}</div>
                          <div className="text-sm text-gray-600">{study.testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Results Achieved:</h4>
                      <div className="space-y-4 mb-6">
                        {Object.entries(study.results).map(([key, value], idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <div className="text-lg font-bold text-primary-600 mb-1">{value}</div>
                            <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Technologies:</h5>
                        <div className="flex flex-wrap gap-2">
                          {study.technologies.map((tech, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Development Process */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Healthcare Development Process
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                A specialized approach that ensures compliance, security, and clinical 
                effectiveness at every stage of development.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {developmentProcess.map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-8"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {phase.phase}
                    </h3>
                    <div className="text-sm text-gray-600 font-medium">
                      {phase.duration}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6">
                    {phase.description}
                  </p>
                  <ul className="space-y-2">
                    {phase.activities.slice(0, 4).map((activity, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                What Healthcare Leaders Say
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Trusted by healthcare organizations nationwide to deliver 
                compliant, effective software solutions.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-8"
                >
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    "{testimonial.comment}"
                  </p>
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-primary-600">
                      {testimonial.results}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                      <p className="text-gray-500 text-sm">{testimonial.organization}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready to Transform Healthcare Delivery?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Let's build HIPAA-compliant healthcare software that improves patient care 
                and streamlines your operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <span>Schedule Healthcare Consultation</span>
                  <PhoneIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/case-studies?industry=healthcare"
                  className="inline-flex items-center justify-center space-x-2 bg-primary-700 text-white px-8 py-4 rounded-lg hover:bg-primary-800 transition-all font-semibold border border-primary-500"
                >
                  <span>View Healthcare Case Studies</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </MainLayout>
    </>
  );
}