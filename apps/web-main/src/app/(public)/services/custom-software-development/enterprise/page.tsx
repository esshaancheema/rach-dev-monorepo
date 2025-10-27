import { Metadata } from 'next';
import { motion } from 'framer-motion';
import { 
  BuildingOffice2Icon,
  ShieldCheckIcon,
  CpuChipIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  CheckIcon,
  StarIcon,
  ClockIcon,
  BoltIcon,
  CubeIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  SparklesIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { SEOHead } from '@/components/seo';
import { generateServiceSchema, combineSchemas, ZOPTAL_ORGANIZATION_SCHEMA } from '@/lib/seo/schemas';
import { getKeywordsForService } from '@/lib/seo/keywords';

export const metadata: Metadata = {
  title: 'Enterprise Software Development Services | Custom Solutions | Zoptal',
  description: 'Professional enterprise software development services. Scalable, secure, and compliant custom solutions for large organizations. ERP, CRM, workflow automation, and digital transformation.',
  keywords: [
    'enterprise software development',
    'custom enterprise solutions',
    'enterprise application development',
    'scalable software architecture',
    'enterprise digital transformation',
    'custom ERP development',
    'enterprise CRM solutions',
    'business process automation',
    'enterprise integration',
    'large-scale software development'
  ]
};

const enterpriseFeatures = [
  {
    icon: BuildingOffice2Icon,
    title: 'Enterprise-Grade Architecture',
    description: 'Scalable, resilient architectures designed for mission-critical operations',
    benefits: ['High Availability', 'Load Balancing', 'Disaster Recovery', 'Performance Optimization']
  },
  {
    icon: ShieldCheckIcon,
    title: 'Advanced Security & Compliance',
    description: 'Built-in security features and compliance with industry regulations',
    benefits: ['SOX Compliance', 'GDPR Ready', 'ISO 27001', 'Advanced Encryption']
  },
  {
    icon: CpuChipIcon,
    title: 'AI-Powered Intelligence',
    description: 'Integrate AI and machine learning for intelligent automation',
    benefits: ['Predictive Analytics', 'Process Automation', 'Smart Insights', 'Decision Support']
  },
  {
    icon: CloudArrowUpIcon,
    title: 'Cloud-Native Solutions',
    description: 'Modern cloud architecture for scalability and cost efficiency',
    benefits: ['Auto-scaling', 'Global Deployment', 'Cost Optimization', 'High Performance']
  },
  {
    icon: Cog6ToothIcon,
    title: 'Seamless Integration',
    description: 'Connect with existing enterprise systems and third-party services',
    benefits: ['API Integration', 'Legacy System Support', 'Data Migration', 'Workflow Automation']
  },
  {
    icon: ChartBarIcon,
    title: 'Advanced Analytics',
    description: 'Comprehensive reporting and business intelligence capabilities',
    benefits: ['Real-time Dashboards', 'Custom Reports', 'Data Visualization', 'Performance Metrics']
  }
];

const solutionTypes = [
  {
    id: 'erp-systems',
    title: 'Enterprise Resource Planning (ERP)',
    description: 'Comprehensive ERP solutions that unify your business processes',
    icon: BuildingOffice2Icon,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Financial Management',
      'Supply Chain Management',
      'Human Resources',
      'Manufacturing Planning',
      'Customer Relationship',
      'Business Intelligence'
    ],
    benefits: [
      'Streamlined Operations',
      'Real-time Visibility',
      'Cost Reduction',
      'Improved Compliance',
      'Better Decision Making',
      'Enhanced Collaboration'
    ],
    industries: ['Manufacturing', 'Distribution', 'Healthcare', 'Government'],
    timeline: '6-18 months',
    investment: '$150,000 - $2M+'
  },
  {
    id: 'crm-solutions',
    title: 'Customer Relationship Management (CRM)',
    description: 'Custom CRM systems tailored to your customer management needs',
    icon: UserGroupIcon,
    color: 'from-green-500 to-emerald-500',
    features: [
      'Contact Management',
      'Sales Pipeline',
      'Marketing Automation',
      'Customer Service',
      'Analytics & Reporting',
      'Mobile Access'
    ],
    benefits: [
      'Improved Customer Satisfaction',
      'Increased Sales Revenue',
      'Better Lead Management',
      'Enhanced Communication',
      'Data-Driven Insights',
      'Process Automation'
    ],
    industries: ['Sales Organizations', 'Professional Services', 'Healthcare', 'Real Estate'],
    timeline: '3-12 months',
    investment: '$75,000 - $500K+'
  },
  {
    id: 'workflow-automation',
    title: 'Business Process Automation',
    description: 'Automate complex business workflows and approval processes',
    icon: Cog6ToothIcon,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Workflow Designer',
      'Approval Workflows',
      'Document Management',
      'Task Automation',
      'Integration Capabilities',
      'Audit Trail'
    ],
    benefits: [
      'Reduced Manual Work',
      'Faster Processing',
      'Improved Accuracy',
      'Better Compliance',
      'Cost Savings',
      'Enhanced Visibility'
    ],
    industries: ['Finance', 'Healthcare', 'Manufacturing', 'Government'],
    timeline: '2-8 months',
    investment: '$50,000 - $300K+'
  },
  {
    id: 'digital-transformation',
    title: 'Digital Transformation Platform',
    description: 'Comprehensive platforms for enterprise digital transformation',
    icon: RocketLaunchIcon,
    color: 'from-orange-500 to-red-500',
    features: [
      'Legacy System Integration',
      'Modern UI/UX',
      'Cloud Migration',
      'Data Analytics',
      'Mobile Solutions',
      'AI Integration'
    ],
    benefits: [
      'Modernized Operations',
      'Improved Efficiency',
      'Better User Experience',
      'Scalable Infrastructure',
      'Competitive Advantage',
      'Future-Ready Platform'
    ],
    industries: ['Traditional Industries', 'Government', 'Healthcare', 'Education'],
    timeline: '8-24 months',
    investment: '$200,000 - $5M+'
  }
];

const developmentProcess = [
  {
    phase: 1,
    title: 'Discovery & Strategy',
    duration: '2-4 weeks',
    description: 'Comprehensive analysis of your business requirements and strategic goals',
    deliverables: [
      'Business Requirements Analysis',
      'Technology Assessment',
      'Architecture Design',
      'Project Roadmap',
      'Risk Assessment',
      'Budget Planning'
    ]
  },
  {
    phase: 2,
    title: 'Design & Planning',
    duration: '3-6 weeks',
    description: 'Detailed system design and implementation planning',
    deliverables: [
      'System Architecture',
      'Database Design',
      'UI/UX Mockups',
      'API Specifications',
      'Security Framework',
      'Testing Strategy'
    ]
  },
  {
    phase: 3,
    title: 'Development & Integration',
    duration: '12-36 weeks',
    description: 'Agile development with continuous integration and testing',
    deliverables: [
      'Core System Development',
      'Third-party Integrations',
      'Security Implementation',
      'Performance Optimization',
      'Quality Assurance',
      'Documentation'
    ]
  },
  {
    phase: 4,
    title: 'Deployment & Support',
    duration: '2-4 weeks',
    description: 'Production deployment and ongoing support services',
    deliverables: [
      'Production Deployment',
      'User Training',
      'Performance Monitoring',
      'Maintenance Plan',
      'Support Documentation',
      'Knowledge Transfer'
    ]
  }
];

const caseStudies = [
  {
    title: 'Global Manufacturing ERP',
    company: 'Fortune 500 Manufacturing',
    industry: 'Manufacturing',
    challenge: 'Unified global operations across 50+ locations with legacy system replacement',
    solution: 'Custom ERP with real-time inventory, production planning, and financial integration',
    results: {
      efficiency: '45% operational efficiency increase',
      cost: '$2.5M annual cost savings',
      time: '60% faster reporting cycles',
      roi: '300% ROI within 18 months'
    },
    technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'],
    timeline: '14 months'
  },
  {
    title: 'Healthcare CRM Platform',
    company: 'Regional Healthcare Network',
    industry: 'Healthcare',
    challenge: 'Patient management across multiple facilities with HIPAA compliance',
    solution: 'Custom CRM with patient portal, appointment scheduling, and care coordination',
    results: {
      satisfaction: '95% patient satisfaction score',
      efficiency: '40% reduction in administrative tasks',
      quality: '25% improvement in care coordination',
      compliance: '100% HIPAA compliance achieved'
    },
    technologies: ['Vue.js', 'Python', 'PostgreSQL', 'AWS', 'Redis', 'ElasticSearch'],
    timeline: '10 months'
  },
  {
    title: 'Financial Services Automation',
    company: 'Investment Management Firm',
    industry: 'Financial Services',
    challenge: 'Automate complex approval workflows with regulatory compliance',
    solution: 'Workflow automation platform with document management and audit trails',
    results: {
      processing: '80% faster processing times',
      accuracy: '99.5% accuracy in compliance checks',
      cost: '$1.2M annual operational savings',
      audit: '100% audit trail compliance'
    },
    technologies: ['Angular', 'Java', 'Oracle', 'Azure', 'Kafka', 'Elasticsearch'],
    timeline: '8 months'
  }
];

const testimonials = [
  {
    name: 'David Thompson',
    role: 'CTO',
    company: 'GlobalTech Manufacturing',
    rating: 5,
    comment: 'Zoptal transformed our entire operation with their enterprise ERP solution. The level of expertise and attention to our complex requirements was exceptional.',
    avatar: '/images/testimonials/david.jpg',
    results: '45% efficiency increase, $2.5M cost savings'
  },
  {
    name: 'Sarah Mitchell',
    role: 'VP of Operations',
    company: 'HealthCare Partners',
    rating: 5,
    comment: 'Their healthcare CRM solution not only met our HIPAA requirements but exceeded our expectations for patient care coordination. Outstanding support throughout.',
    avatar: '/images/testimonials/sarah-m.jpg',
    results: '95% patient satisfaction, 40% admin reduction'
  },
  {
    name: 'Robert Chen',
    role: 'Head of Digital Transformation',
    company: 'Financial Solutions Inc',
    rating: 5,
    comment: 'The workflow automation platform Zoptal delivered has revolutionized our compliance processes. ROI was achieved within the first year.',
    avatar: '/images/testimonials/robert.jpg',
    results: '80% faster processing, $1.2M savings'
  }
];

export default function EnterpriseServicesPage() {
  const serviceKeywords = getKeywordsForService('enterprise-solutions');
  
  const structuredData = combineSchemas(
    ZOPTAL_ORGANIZATION_SCHEMA,
    generateServiceSchema({
      name: 'Enterprise Software Development Services',
      description: 'Custom enterprise software development including ERP, CRM, workflow automation, and digital transformation solutions for large organizations.',
      url: 'https://zoptal.com/services/custom-software-development/enterprise',
      serviceType: 'Enterprise Software Development',
      provider: {
        name: 'Zoptal',
        url: 'https://zoptal.com'
      },
      areaServed: ['United States', 'Canada', 'United Kingdom', 'Australia'],
      offers: {
        price: '150000',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      aggregateRating: {
        ratingValue: 4.9,
        reviewCount: 89
      }
    })
  );

  return (
    <>
      <SEOHead
        title="Enterprise Software Development Services | Custom Solutions | Zoptal"
        description="Professional enterprise software development services. Scalable, secure, and compliant custom solutions for large organizations. ERP, CRM, workflow automation, and digital transformation."
        canonicalUrl="https://zoptal.com/services/custom-software-development/enterprise"
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
                <li className="text-gray-900">Enterprise Solutions</li>
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
                  <BuildingOffice2Icon className="w-4 h-4" />
                  <span>Enterprise Solutions</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
                >
                  Enterprise Software Development
                  <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    Built for Scale
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl text-gray-600 mb-8"
                >
                  Transform your enterprise with custom software solutions designed for large-scale operations. 
                  Scalable, secure, and compliant systems that drive business growth.
                </motion.p>

                {/* Key Metrics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-3 gap-6 mb-8"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">500+</div>
                    <div className="text-gray-600 text-sm">Enterprise Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">99.9%</div>
                    <div className="text-gray-600 text-sm">Uptime SLA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">24/7</div>
                    <div className="text-gray-600 text-sm">Support</div>
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
                    <span>Start Your Project</span>
                    <RocketLaunchIcon className="w-5 h-5" />
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
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-12 text-center">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <BuildingOffice2Icon className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                      <div className="font-semibold text-gray-900">ERP Systems</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <UserGroupIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <div className="font-semibold text-gray-900">CRM Solutions</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <Cog6ToothIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                      <div className="font-semibold text-gray-900">Automation</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <RocketLaunchIcon className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                      <div className="font-semibold text-gray-900">Transformation</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Enterprise Features */}
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
                Enterprise-Grade Features
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Built with the robust features and capabilities that large organizations require 
                for mission-critical operations.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enterpriseFeatures.map((feature, index) => (
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
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution Types */}
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
                Enterprise Solution Types
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Comprehensive software solutions designed to address the complex needs 
                of enterprise operations across all departments.
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
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <div className="flex items-center space-x-4 mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-r ${solution.color} rounded-xl flex items-center justify-center`}>
                          <solution.icon className="w-8 h-8 text-white" />
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

                      <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
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
                          <h4 className="font-semibold text-gray-900 mb-3">Business Benefits:</h4>
                          <ul className="space-y-2">
                            {solution.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-center text-sm text-gray-600">
                                <BoltIcon className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-primary-600">{solution.investment}</div>
                          <div className="text-sm text-gray-600">Investment range</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">{solution.timeline}</div>
                          <div className="text-sm text-gray-600">Typical timeline</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-6">Target Industries:</h4>
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        {solution.industries.map((industry, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="font-medium text-gray-900">{industry}</div>
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/contact"
                        className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-center block"
                      >
                        Get Custom Quote
                      </Link>
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
                Our Enterprise Development Process
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                A structured approach that ensures successful delivery of complex enterprise projects 
                with predictable outcomes.
              </motion.p>
            </div>

            <div className="space-y-8">
              {developmentProcess.map((phase, index) => (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                      {phase.phase}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {phase.title}
                        </h3>
                        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                          {phase.duration}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-6">
                        {phase.description}
                      </p>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Key Deliverables:</h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {phase.deliverables.map((deliverable, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-600">
                              <DocumentTextIcon className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                              {deliverable}
                            </div>
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
                Enterprise Success Stories
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Real results from our enterprise software development projects 
                across various industries.
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
                          {study.industry}
                        </div>
                        <div className="text-sm text-gray-600">{study.timeline}</div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{study.title}</h3>
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
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Technologies Used:</h4>
                        <div className="flex flex-wrap gap-2">
                          {study.technologies.map((tech, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Results Achieved:</h4>
                      <div className="space-y-4">
                        {Object.entries(study.results).map(([key, value], idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <div className="text-lg font-bold text-primary-600 mb-1">{value}</div>
                            <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Client Testimonials */}
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
                What Enterprise Clients Say
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Trusted by Fortune 500 companies and large organizations worldwide.
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
                      <p className="text-gray-500 text-sm">{testimonial.company}</p>
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
                Ready to Transform Your Enterprise?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Let's discuss your enterprise software requirements and create a solution 
                that drives your business forward.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <span>Schedule Consultation</span>
                  <PhoneIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center justify-center space-x-2 bg-primary-700 text-white px-8 py-4 rounded-lg hover:bg-primary-800 transition-all font-semibold border border-primary-500"
                >
                  <span>View More Case Studies</span>
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