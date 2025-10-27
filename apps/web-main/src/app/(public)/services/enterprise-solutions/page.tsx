import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, BuildingOffice2Icon, ShieldCheckIcon, RocketLaunchIcon, CogIcon, StarIcon, ChartBarIcon, UserGroupIcon, CheckIcon, PhoneIcon, CloudIcon, LockClosedIcon, GlobeAltIcon, ServerIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { keywordsByCategory } from '@/lib/seo/keywords';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Enterprise Software Solutions | Custom Enterprise Development | Zoptal',
  description: 'Comprehensive enterprise software solutions. Custom development, legacy modernization, cloud migration, and digital transformation for large organizations.',
  keywords: [
    ...keywordsByCategory.services,
    'enterprise software solutions',
    'enterprise development',
    'custom enterprise software',
    'legacy modernization',
    'digital transformation',
    'enterprise applications',
    'cloud migration',
    'enterprise integration',
    'business process automation',
    'enterprise architecture',
    'scalable solutions',
    'enterprise consulting',
    'system integration',
    'enterprise technology'
  ],
  openGraph: {
    title: 'Enterprise Software Solutions | Zoptal',
    description: 'Comprehensive enterprise software solutions. Custom development, legacy modernization, and digital transformation.',
    type: 'website',
    url: 'https://zoptal.com/services/enterprise-solutions',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enterprise Software Solutions | Zoptal',
    description: 'Comprehensive enterprise software solutions. Custom development, legacy modernization, and digital transformation.',
  },
  alternates: {
    canonical: 'https://zoptal.com/services/enterprise-solutions',
  },
};

export default function EnterpriseSolutionsPage() {
  const serviceSchema = generateServiceSchema({
    name: 'Enterprise Software Solutions',
    description: 'Comprehensive enterprise software solutions including custom development, legacy modernization, and digital transformation services.',
    provider: 'Zoptal',
    areaServed: 'Global',
    serviceType: 'Enterprise Solutions',
    url: 'https://zoptal.com/services/enterprise-solutions',
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Services', url: 'https://zoptal.com/services' },
      { name: 'Enterprise Solutions', url: 'https://zoptal.com/services/enterprise-solutions' },
    ]
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li>
                <Link href="/services" className="text-gray-500 hover:text-gray-700">
                  Services
                </Link>
              </li>
              <li>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li className="text-gray-900 font-medium">
                Enterprise Solutions
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Enterprise Software Solutions
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
                Transform your enterprise with cutting-edge software solutions. From legacy modernization to digital transformation, we deliver scalable, secure, and innovative enterprise applications.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 text-center"
                >
                  Start Your Transformation
                </Link>
                <Link
                  href="/portfolio"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors duration-300 text-center"
                >
                  View Enterprise Portfolio
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-300 mb-2">500+</div>
                  <div className="text-white font-semibold mb-1">Enterprises Served</div>
                  <div className="text-gray-300 text-sm">Global organizations</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-300 mb-2">$2.5B+</div>
                  <div className="text-white font-semibold mb-1">Value Created</div>
                  <div className="text-gray-300 text-sm">Business impact</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-300 mb-2">99.9%</div>
                  <div className="text-white font-semibold mb-1">Uptime Achieved</div>
                  <div className="text-gray-300 text-sm">Mission-critical systems</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-300 mb-2">15+</div>
                  <div className="text-white font-semibold mb-1">Years Experience</div>
                  <div className="text-gray-300 text-sm">Enterprise expertise</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Challenges */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Enterprise Challenges We Solve
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Address critical business challenges with innovative enterprise software solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ServerIcon,
                title: 'Legacy System Modernization',
                description: 'Transform outdated legacy systems into modern, scalable solutions.',
                challenges: ['Technical debt accumulation', 'Security vulnerabilities', 'Integration difficulties', 'Maintenance costs']
              },
              {
                icon: CloudIcon,
                title: 'Digital Transformation',
                description: 'Accelerate digital transformation with cloud-native enterprise solutions.',
                challenges: ['Outdated business processes', 'Siloed data systems', 'Manual workflows', 'Competitive disadvantage']
              },
              {
                icon: LockClosedIcon,
                title: 'Security & Compliance',
                description: 'Ensure enterprise-grade security and regulatory compliance.',
                challenges: ['Data security risks', 'Compliance requirements', 'Access control', 'Audit preparation']
              },
              {
                icon: CogIcon,
                title: 'Process Automation',
                description: 'Automate complex business processes and workflows.',
                challenges: ['Manual inefficiencies', 'Human error rates', 'Process bottlenecks', 'Resource constraints']
              },
              {
                icon: GlobeAltIcon,
                title: 'System Integration',
                description: 'Integrate disparate systems and create unified data flows.',
                challenges: ['Data silos', 'System incompatibility', 'Real-time sync needs', 'API limitations']
              },
              {
                icon: ChartBarIcon,
                title: 'Data & Analytics',
                description: 'Transform data into actionable business insights.',
                challenges: ['Data fragmentation', 'Poor data quality', 'Limited analytics', 'Reporting inefficiencies']
              }
            ].map((challenge, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <challenge.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{challenge.title}</h3>
                <p className="text-gray-600 mb-4">{challenge.description}</p>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">Common Issues:</h4>
                  <ul className="space-y-1">
                    {challenge.challenges.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-600 text-sm">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Solutions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Enterprise Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              End-to-end enterprise software solutions designed for scale and performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Custom Enterprise Applications',
                description: 'Bespoke enterprise software tailored to your unique business requirements and workflows.',
                features: [
                  'Requirements analysis & design',
                  'Scalable architecture planning',
                  'Custom development & testing',
                  'Deployment & training',
                  'Ongoing support & maintenance'
                ],
                technologies: ['Java/.NET', 'Microservices', 'Docker/Kubernetes', 'Cloud platforms'],
                icon: BuildingOffice2Icon
              },
              {
                title: 'Legacy System Modernization',
                description: 'Transform legacy systems while preserving business logic and ensuring zero downtime.',
                features: [
                  'Legacy system assessment',
                  'Migration strategy planning',
                  'Phased modernization approach',
                  'Data migration & validation',
                  'Performance optimization'
                ],
                technologies: ['API gateways', 'Database migration', 'Cloud modernization', 'Containerization'],
                icon: RocketLaunchIcon
              },
              {
                title: 'Cloud Migration & Optimization',
                description: 'Migrate enterprise applications to cloud with optimization for performance and cost.',
                features: [
                  'Cloud readiness assessment',
                  'Migration planning & execution',
                  'Architecture optimization',
                  'Security implementation',
                  'Cost optimization strategies'
                ],
                technologies: ['AWS/Azure/GCP', 'Terraform', 'CI/CD pipelines', 'Monitoring tools'],
                icon: CloudIcon
              },
              {
                title: 'Enterprise Integration Platform',
                description: 'Connect disparate systems and enable seamless data flow across your organization.',
                features: [
                  'System integration analysis',
                  'API development & management',
                  'ETL/ELT pipeline creation',
                  'Real-time data synchronization',
                  'Monitoring & error handling'
                ],
                technologies: ['Apache Kafka', 'REST/GraphQL APIs', 'Message queues', 'Data pipelines'],
                icon: GlobeAltIcon
              },
              {
                title: 'Business Process Automation',
                description: 'Automate complex business workflows and improve operational efficiency.',
                features: [
                  'Process mapping & analysis',
                  'Workflow automation design',
                  'RPA implementation',
                  'Decision engine development',
                  'Performance monitoring'
                ],
                technologies: ['BPM platforms', 'RPA tools', 'Workflow engines', 'AI/ML integration'],
                icon: CogIcon
              },
              {
                title: 'Enterprise Data Solutions',
                description: 'Comprehensive data management, analytics, and business intelligence solutions.',
                features: [
                  'Data architecture design',
                  'Data warehouse/lake setup',
                  'Analytics platform development',
                  'BI dashboard creation',
                  'Data governance implementation'
                ],
                technologies: ['Snowflake/BigQuery', 'Apache Spark', 'Tableau/Power BI', 'Machine learning'],
                icon: ChartBarIcon
              }
            ].map((solution, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <solution.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{solution.title}</h3>
                </div>
                <p className="text-gray-600 mb-6">{solution.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Services:</h4>
                  <ul className="space-y-2">
                    {solution.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-700">
                        <CheckIcon className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Technologies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {solution.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Technology Stack */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Enterprise Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-grade technologies for mission-critical applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                category: 'Backend Frameworks',
                technologies: ['Java Spring Boot', '.NET Core', 'Node.js Enterprise', 'Python Django', 'Go microservices']
              },
              {
                category: 'Cloud Platforms',
                technologies: ['AWS Enterprise', 'Microsoft Azure', 'Google Cloud', 'IBM Cloud', 'Oracle Cloud']
              },
              {
                category: 'Databases',
                technologies: ['Oracle Database', 'SQL Server', 'PostgreSQL', 'MongoDB', 'Redis Enterprise']
              },
              {
                category: 'Integration',
                technologies: ['Apache Kafka', 'MuleSoft', 'IBM Integration Bus', 'WSO2', 'API Gateways']
              },
              {
                category: 'DevOps & Monitoring',
                technologies: ['Jenkins', 'GitLab CI/CD', 'Prometheus', 'Splunk', 'New Relic']
              },
              {
                category: 'Security',
                technologies: ['OAuth 2.0/OIDC', 'LDAP/Active Directory', 'Vault', 'Kubernetes Security', 'SIEM tools']
              },
              {
                category: 'Data & Analytics',
                technologies: ['Apache Spark', 'Snowflake', 'Elasticsearch', 'Tableau', 'Power BI']
              },
              {
                category: 'Containerization',
                technologies: ['Docker Enterprise', 'Kubernetes', 'OpenShift', 'Rancher', 'Istio Service Mesh']
              }
            ].map((stack, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{stack.category}</h3>
                <ul className="space-y-2">
                  {stack.technologies.map((tech, techIndex) => (
                    <li key={techIndex} className="flex items-center text-gray-700">
                      <CheckIcon className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Expertise */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Industry Expertise
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deep domain knowledge across critical enterprise industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                industry: 'Financial Services',
                expertise: ['Core banking systems', 'Payment processing', 'Risk management', 'Regulatory compliance', 'Trading platforms'],
                regulations: ['PCI DSS', 'SOX', 'Basel III', 'GDPR']
              },
              {
                industry: 'Healthcare',
                expertise: ['Electronic Health Records', 'Medical imaging systems', 'Patient management', 'Telemedicine', 'Clinical workflows'],
                regulations: ['HIPAA', 'FDA 21 CFR Part 11', 'HL7 FHIR', 'HITECH']
              },
              {
                industry: 'Manufacturing',
                expertise: ['ERP systems', 'Supply chain management', 'Quality control', 'IoT integration', 'Predictive maintenance'],
                regulations: ['ISO 9001', 'AS9100', 'ISO 27001', 'OSHA']
              },
              {
                industry: 'Government',
                expertise: ['Citizen services', 'Case management', 'Document management', 'Workflow automation', 'Public safety'],
                regulations: ['FedRAMP', 'FISMA', 'Section 508', 'FIPS 140-2']
              },
              {
                industry: 'Energy & Utilities',
                expertise: ['Grid management', 'Asset management', 'Billing systems', 'Smart meters', 'Environmental monitoring'],
                regulations: ['NERC CIP', 'FERC', 'EPA compliance', 'ISO 50001']
              },
              {
                industry: 'Retail & E-commerce',
                expertise: ['Omnichannel platforms', 'Inventory management', 'Customer analytics', 'Supply chain', 'Point of sale'],
                regulations: ['PCI DSS', 'GDPR', 'CCPA', 'Accessibility standards']
              }
            ].map((industry, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{industry.industry}</h3>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Core Expertise:</h4>
                  <ul className="space-y-1">
                    {industry.expertise.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-600 text-sm">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Compliance:</h4>
                  <div className="flex flex-wrap gap-1">
                    {industry.regulations.map((reg, regIndex) => (
                      <span key={regIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Enterprise Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transformative enterprise solutions with measurable business impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: 'Global Banking Platform Modernization',
                industry: 'Financial Services',
                description: 'Modernized legacy core banking system for a multinational bank serving 15M+ customers.',
                challenge: 'Legacy mainframe system with high maintenance costs, security vulnerabilities, and limited scalability.',
                solution: 'Microservices-based architecture with API-first design, cloud deployment, and real-time processing capabilities.',
                results: [
                  '15M+ customers migrated',
                  '99.99% system uptime',
                  '60% reduction in processing time',
                  '40% lower operational costs',
                  'SOC 2 Type II compliant'
                ],
                technologies: ['Java Spring Boot', 'Kubernetes', 'PostgreSQL', 'Redis', 'AWS'],
                timeline: '18 months'
              },
              {
                title: 'Healthcare Data Integration Platform',
                industry: 'Healthcare',
                description: 'Unified patient data platform integrating 50+ healthcare systems across a hospital network.',
                challenge: 'Siloed patient data across multiple systems, manual processes, and poor care coordination.',
                solution: 'HL7 FHIR-compliant integration platform with real-time data synchronization and analytics.',
                results: [
                  '50+ systems integrated',
                  '2M+ patient records unified',
                  '75% faster care coordination',
                  'HIPAA compliant',
                  '30% improvement in patient outcomes'
                ],
                technologies: ['Node.js', 'MongoDB', 'Apache Kafka', 'Docker', 'Azure'],
                timeline: '12 months'
              }
            ].map((study, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="text-sm text-blue-600 font-semibold mb-2">{study.industry}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{study.title}</h3>
                <p className="text-gray-600 mb-6">{study.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Challenge:</h4>
                  <p className="text-gray-600 text-sm">{study.challenge}</p>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Solution:</h4>
                  <p className="text-gray-600 text-sm">{study.solution}</p>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Results:</h4>
                  <ul className="space-y-2">
                    {study.results.map((result, resultIndex) => (
                      <li key={resultIndex} className="flex items-center text-gray-700">
                        <StarIcon className="w-4 h-4 text-yellow-500 mr-3 flex-shrink-0" />
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Technologies:</h4>
                    <div className="flex flex-wrap gap-1">
                      {study.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Timeline:</h4>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {study.timeline}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Development Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Enterprise Development Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proven methodology for delivering complex enterprise solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {[
              {
                step: '01',
                title: 'Enterprise Assessment',
                description: 'Comprehensive analysis of current systems, processes, and business requirements.',
                duration: '4-6 weeks'
              },
              {
                step: '02',
                title: 'Solution Architecture',
                description: 'Design scalable, secure architecture with detailed technical specifications.',
                duration: '6-8 weeks'
              },
              {
                step: '03',
                title: 'Proof of Concept',
                description: 'Validate technical approach and demonstrate core functionality.',
                duration: '4-6 weeks'
              },
              {
                step: '04',
                title: 'Agile Development',
                description: 'Iterative development with continuous testing and stakeholder feedback.',
                duration: '12-24 weeks'
              },
              {
                step: '05',
                title: 'Integration & Testing',
                description: 'System integration, performance testing, and security validation.',
                duration: '6-8 weeks'
              },
              {
                step: '06',
                title: 'Deployment & Support',
                description: 'Production deployment with training and ongoing enterprise support.',
                duration: 'Ongoing'
              }
            ].map((process, index) => (
              <div key={index} className="text-center bg-white rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {process.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{process.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{process.description}</p>
                <div className="text-blue-600 font-semibold text-sm">{process.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Enterprise?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Partner with us to modernize your enterprise systems, accelerate digital transformation, and achieve your business objectives with cutting-edge technology solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Start Your Enterprise Project
            </Link>
            <Link
              href="/portfolio"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors duration-300"
            >
              View Enterprise Portfolio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}