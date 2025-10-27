import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, BuildingOffice2Icon, ShieldCheckIcon, RocketLaunchIcon, CogIcon, StarIcon, ChartBarIcon, UserGroupIcon, CheckIcon, PhoneIcon, CloudIcon, LockClosedIcon, GlobeAltIcon, ServerIcon } from '@heroicons/react/24/outline';
import { keywordsByCategory } from '@/lib/seo/keywords';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Enterprise SaaS Development Services | Scalable Cloud Solutions | Zoptal',
  description: 'Professional enterprise SaaS development services. Build scalable, secure, and compliant SaaS platforms for large organizations with advanced features.',
  keywords: [
    ...keywordsByCategory.services,
    'enterprise SaaS development',
    'enterprise software development',
    'scalable SaaS solutions',
    'enterprise cloud platforms',
    'B2B SaaS development',
    'enterprise applications',
    'multi-tenant architecture',
    'SaaS security',
    'compliance software',
    'enterprise integration',
    'cloud-native development',
    'microservices architecture',
    'enterprise APIs',
    'SaaS consulting'
  ],
  openGraph: {
    title: 'Enterprise SaaS Development Services | Zoptal',
    description: 'Professional enterprise SaaS development services. Build scalable, secure, and compliant SaaS platforms for large organizations.',
    type: 'website',
    url: 'https://zoptal.com/services/saas-development/enterprise-saas',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enterprise SaaS Development Services | Zoptal',
    description: 'Professional enterprise SaaS development services. Build scalable, secure, and compliant SaaS platforms for large organizations.',
  },
  alternates: {
    canonical: 'https://zoptal.com/services/saas-development/enterprise-saas',
  },
};

export default function EnterpriseSaaSDevelopmentPage() {
  const serviceSchema = generateServiceSchema({
    name: 'Enterprise SaaS Development Services',
    description: 'Professional enterprise SaaS development services for building scalable, secure, and compliant cloud platforms for large organizations.',
    provider: 'Zoptal',
    areaServed: 'Global',
    serviceType: 'Enterprise SaaS Development',
    url: 'https://zoptal.com/services/saas-development/enterprise-saas',
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Services', url: 'https://zoptal.com/services' },
      { name: 'SaaS Development', url: 'https://zoptal.com/services/saas-development' },
      { name: 'Enterprise SaaS Development', url: 'https://zoptal.com/services/saas-development/enterprise-saas' },
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
              <li>
                <Link href="/services/saas-development" className="text-gray-500 hover:text-gray-700">
                  SaaS Development
                </Link>
              </li>
              <li>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li className="text-gray-900 font-medium">
                Enterprise SaaS Development
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Enterprise SaaS Development
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8 leading-relaxed">
                Build enterprise-grade SaaS platforms that scale to millions of users. Secure, compliant, and feature-rich solutions designed for large organizations and complex business requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 text-center"
                >
                  Build Enterprise SaaS
                </Link>
                <Link
                  href="/portfolio"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300 text-center"
                >
                  View Enterprise Portfolio
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">99.9%</div>
                  <div className="text-white font-semibold mb-1">Uptime SLA</div>
                  <div className="text-blue-200 text-sm">Enterprise reliability</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">10M+</div>
                  <div className="text-white font-semibold mb-1">Users Supported</div>
                  <div className="text-blue-200 text-sm">Concurrent scale</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">SOC 2</div>
                  <div className="text-white font-semibold mb-1">Compliance</div>
                  <div className="text-blue-200 text-sm">Type II certified</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">25+</div>
                  <div className="text-white font-semibold mb-1">Enterprise SaaS</div>
                  <div className="text-blue-200 text-sm">Successfully delivered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise SaaS Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive features designed for enterprise requirements and scalability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: LockClosedIcon,
                title: 'Advanced Security',
                description: 'Enterprise-grade security with encryption, SSO, and compliance frameworks.'
              },
              {
                icon: ServerIcon,
                title: 'Scalable Architecture',
                description: 'Microservices architecture that scales to millions of users and transactions.'
              },
              {
                icon: ShieldCheckIcon,
                title: 'Compliance Ready',
                description: 'SOC 2, GDPR, HIPAA, and other compliance standards built-in.'
              },
              {
                icon: GlobeAltIcon,
                title: 'Multi-Region Support',
                description: 'Global deployment with CDN, load balancing, and disaster recovery.'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise vs Standard SaaS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Enterprise SaaS Requirements
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding the unique demands of enterprise-level SaaS applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Enterprise Requirements</h3>
              <div className="space-y-4">
                {[
                  {
                    category: 'Security',
                    requirements: ['SOC 2 Type II compliance', 'Advanced threat protection', 'Data encryption at rest/transit', 'Multi-factor authentication']
                  },
                  {
                    category: 'Scalability',
                    requirements: ['Support 10M+ concurrent users', 'Auto-scaling infrastructure', 'Global CDN deployment', 'Load balancing']
                  },
                  {
                    category: 'Integration',
                    requirements: ['Enterprise SSO (SAML, OIDC)', 'API-first architecture', 'Legacy system integration', 'Webhook support']
                  },
                  {
                    category: 'Governance',
                    requirements: ['Role-based access control', 'Audit logging', 'Data governance', 'Compliance reporting']
                  }
                ].map((req, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{req.category}</h4>
                    <ul className="space-y-1">
                      {req.requirements.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-gray-600 text-sm">• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Architecture</h3>
              <div className="space-y-6">
                {[
                  {
                    layer: 'Frontend',
                    technologies: ['React/Vue.js', 'Micro-frontends', 'Progressive Web Apps', 'Mobile responsiveness'],
                    description: 'Modern, scalable frontend architecture'
                  },
                  {
                    layer: 'API Gateway',
                    technologies: ['Kong/AWS API Gateway', 'Rate limiting', 'Authentication', 'Load balancing'],
                    description: 'Centralized API management and security'
                  },
                  {
                    layer: 'Microservices',
                    technologies: ['Docker containers', 'Kubernetes orchestration', 'Service mesh', 'Event-driven architecture'],
                    description: 'Scalable, maintainable service architecture'
                  },
                  {
                    layer: 'Data Layer',
                    technologies: ['PostgreSQL/MongoDB', 'Redis caching', 'Elasticsearch', 'Data warehousing'],
                    description: 'High-performance data storage and analytics'
                  }
                ].map((arch, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{arch.layer}</h4>
                    <p className="text-gray-600 text-sm mb-3">{arch.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {arch.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise SaaS Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Enterprise SaaS Development Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive development services for enterprise-grade SaaS platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Platform Architecture & Design',
                description: 'Comprehensive platform architecture designed for enterprise scale and requirements.',
                features: [
                  'Microservices architecture design',
                  'Multi-tenant data isolation',
                  'API-first development approach',
                  'Cloud-native infrastructure',
                  'Disaster recovery planning'
                ],
                icon: ServerIcon
              },
              {
                title: 'Security & Compliance',
                description: 'Enterprise-grade security implementation with industry compliance standards.',
                features: [
                  'SOC 2 Type II compliance',
                  'GDPR/HIPAA compliance',
                  'Penetration testing',
                  'Security audit preparation',
                  'Data encryption & privacy'
                ],
                icon: LockClosedIcon
              },
              {
                title: 'Enterprise Integration',
                description: 'Seamless integration with existing enterprise systems and third-party services.',
                features: [
                  'SSO implementation (SAML, OIDC)',
                  'Legacy system integration',
                  'API development & management',
                  'Webhook implementation',
                  'Enterprise data sync'
                ],
                icon: GlobeAltIcon
              },
              {
                title: 'User Management & Access Control',
                description: 'Sophisticated user management with role-based access and organizational hierarchies.',
                features: [
                  'Role-based access control (RBAC)',
                  'Organizational hierarchy management',
                  'Advanced user provisioning',
                  'Audit logging & compliance',
                  'Multi-factor authentication'
                ],
                icon: UserGroupIcon
              },
              {
                title: 'Analytics & Business Intelligence',
                description: 'Advanced analytics and reporting capabilities for enterprise decision making.',
                features: [
                  'Real-time analytics dashboards',
                  'Custom reporting engine',
                  'Data warehouse integration',
                  'Business intelligence tools',
                  'Performance monitoring'
                ],
                icon: ChartBarIcon
              },
              {
                title: 'DevOps & Infrastructure',
                description: 'Robust DevOps practices and infrastructure automation for enterprise operations.',
                features: [
                  'CI/CD pipeline setup',
                  'Infrastructure as Code',
                  'Monitoring & alerting',
                  'Auto-scaling configuration',
                  '24/7 support & maintenance'
                ],
                icon: CogIcon
              }
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <service.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                </div>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700">
                      <CheckIcon className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Technology Stack */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Enterprise Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-proven technologies for mission-critical SaaS applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                category: 'Cloud Platforms',
                technologies: ['AWS Enterprise', 'Microsoft Azure', 'Google Cloud Platform', 'Multi-cloud setup', 'Hybrid cloud']
              },
              {
                category: 'Container Orchestration',
                technologies: ['Kubernetes', 'Docker Enterprise', 'Service Mesh (Istio)', 'Helm Charts', 'Container Registry']
              },
              {
                category: 'Databases',
                technologies: ['PostgreSQL', 'MongoDB Atlas', 'Redis Enterprise', 'Elasticsearch', 'Time-series DBs']
              },
              {
                category: 'Security & Monitoring',
                technologies: ['Vault (HashiCorp)', 'Auth0/Okta', 'Splunk/ELK', 'Prometheus/Grafana', 'SIEM solutions']
              }
            ].map((stack, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
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

      {/* Case Studies */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Enterprise SaaS Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real enterprise implementations with measurable business impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: 'Global HR Management Platform',
                industry: 'Human Resources',
                description: 'Enterprise HR SaaS platform serving 500+ companies with 2M+ employees worldwide.',
                challenge: 'Complex multi-tenant architecture with varying compliance requirements across different countries.',
                solution: 'Microservices architecture with region-specific compliance modules and advanced role-based access control.',
                results: [
                  '500+ enterprise clients',
                  '2M+ active users',
                  '99.99% uptime achieved',
                  'SOC 2 Type II compliant',
                  '40% reduction in HR processing time'
                ],
                technologies: ['Kubernetes', 'PostgreSQL', 'Redis', 'Elasticsearch', 'Auth0']
              },
              {
                title: 'Financial Services Platform',
                industry: 'FinTech',
                description: 'Comprehensive financial management SaaS for enterprise clients with strict security requirements.',
                challenge: 'High-frequency transactions, real-time reporting, and stringent financial compliance.',
                solution: 'Event-driven architecture with real-time processing and comprehensive audit trails.',
                results: [
                  '100+ financial institutions',
                  '$50B+ transactions processed',
                  '<100ms response time',
                  'PCI DSS compliant',
                  '60% faster financial reporting'
                ],
                technologies: ['AWS', 'Kafka', 'TimescaleDB', 'GraphQL', 'Vault']
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

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Technologies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {study.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
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

      {/* Development Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Enterprise SaaS Development Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Structured approach for delivering enterprise-grade SaaS solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {[
              {
                step: '01',
                title: 'Enterprise Assessment',
                description: 'Comprehensive analysis of enterprise requirements, compliance needs, and integration points.',
                duration: '2-4 weeks'
              },
              {
                step: '02',
                title: 'Architecture Design',
                description: 'Design scalable, secure architecture with compliance and integration considerations.',
                duration: '3-6 weeks'
              },
              {
                step: '03',
                title: 'Security Planning',
                description: 'Detailed security assessment and compliance framework implementation planning.',
                duration: '2-3 weeks'
              },
              {
                step: '04',
                title: 'Development & Testing',
                description: 'Agile development with continuous security testing and compliance validation.',
                duration: '12-24 weeks'
              },
              {
                step: '05',
                title: 'Deployment & Migration',
                description: 'Staged deployment with data migration and enterprise system integration.',
                duration: '4-8 weeks'
              },
              {
                step: '06',
                title: 'Support & Scaling',
                description: 'Ongoing support, monitoring, and scaling based on enterprise needs.',
                duration: 'Ongoing'
              }
            ].map((process, index) => (
              <div key={index} className="text-center bg-white rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
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
      <section className="py-20 bg-gradient-to-r from-slate-800 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Build Your Enterprise SaaS?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Transform your enterprise vision into a scalable, secure SaaS platform. Let's build the future of enterprise software together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 flex items-center justify-center"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Start Your Enterprise Project
            </Link>
            <Link
              href="/portfolio"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300"
            >
              View Enterprise Portfolio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}