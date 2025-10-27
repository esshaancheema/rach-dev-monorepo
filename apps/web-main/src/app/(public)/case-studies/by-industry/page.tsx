import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, BuildingOffice2Icon, ChartBarIcon, StarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { keywordsByCategory } from '@/lib/seo/keywords';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Case Studies by Industry | Industry-Specific Success Stories | Zoptal',
  description: 'Explore our software development case studies organized by industry. Real success stories from FinTech, Healthcare, E-commerce, Manufacturing, and more.',
  keywords: [
    ...keywordsByCategory.services,
    'case studies by industry',
    'industry success stories',
    'fintech case studies',
    'healthcare software case studies',
    'ecommerce development case studies',
    'manufacturing software solutions',
    'education technology case studies',
    'logistics software case studies',
    'energy software solutions',
    'media technology case studies',
    'government software projects',
    'real estate technology solutions'
  ],
  openGraph: {
    title: 'Industry-Specific Software Development Case Studies | Zoptal',
    description: 'Discover how we have transformed businesses across industries with custom software solutions.',
    type: 'website',
    url: 'https://zoptal.com/case-studies/by-industry',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industry-Specific Software Development Case Studies | Zoptal',
    description: 'Discover how we have transformed businesses across industries with custom software solutions.',
  },
  alternates: {
    canonical: 'https://zoptal.com/case-studies/by-industry',
  },
};

export default function CaseStudiesByIndustryPage() {
  const serviceSchema = generateServiceSchema({
    name: 'Industry-Specific Software Development Case Studies',
    description: 'Comprehensive portfolio of successful software development projects organized by industry sectors.',
    provider: {
      name: 'Zoptal',
      url: 'https://zoptal.com'
    },
    areaServed: 'Global',
    serviceType: 'Industry Software Solutions',
    url: 'https://zoptal.com/case-studies/by-industry',
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Case Studies', url: 'https://zoptal.com/case-studies' },
      { name: 'By Industry', url: 'https://zoptal.com/case-studies/by-industry' },
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
                <Link href="/case-studies" className="text-gray-500 hover:text-gray-700">
                  Case Studies
                </Link>
              </li>
              <li>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li className="text-gray-900 font-medium">
                By Industry
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Industry Success Stories
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Discover how we've transformed businesses across different industries with tailored software solutions that drive real results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 text-center"
              >
                Discuss Your Industry Needs
              </Link>
              <Link
                href="/case-studies"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300 text-center"
              >
                View All Case Studies
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-200 mb-2">15+</div>
              <div className="text-white font-semibold mb-1">Industries Served</div>
              <div className="text-blue-200 text-sm">Diverse expertise</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-200 mb-2">250+</div>
              <div className="text-white font-semibold mb-1">Industry Projects</div>
              <div className="text-blue-200 text-sm">Successful deliveries</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-200 mb-2">98%</div>
              <div className="text-white font-semibold mb-1">Client Satisfaction</div>
              <div className="text-blue-200 text-sm">Across all industries</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-200 mb-2">12+</div>
              <div className="text-white font-semibold mb-1">Years Experience</div>
              <div className="text-blue-200 text-sm">Industry expertise</div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Industries We Transform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deep domain expertise across critical industries with proven success stories and measurable results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Financial Technology',
                icon: '💰',
                projects: '25+ projects',
                description: 'Banking platforms, payment systems, trading applications, and fintech solutions.',
                highlights: ['$500M+ daily transactions', 'SOC 2 compliance', '99.99% uptime'],
                caseStudies: [
                  'Global Banking Platform Modernization',
                  'High-Frequency Trading System',
                  'Digital Payment Gateway'
                ]
              },
              {
                name: 'Healthcare & Medical',
                icon: '🏥',
                projects: '18+ projects',
                description: 'Electronic health records, medical imaging, patient management, and telemedicine.',
                highlights: ['2M+ patient records', 'HIPAA compliant', '60% faster care coordination'],
                caseStudies: [
                  'Healthcare Data Integration Platform',
                  'Telemedicine Solution',
                  'Medical Imaging System'
                ]
              },
              {
                name: 'E-commerce & Retail',
                icon: '🛒',
                projects: '22+ projects',
                description: 'Online marketplaces, inventory management, customer analytics, and omnichannel solutions.',
                highlights: ['1M+ concurrent users', '300% traffic scaling', '25% conversion increase'],
                caseStudies: [
                  'E-commerce Platform Scaling',
                  'Omnichannel Retail Solution',
                  'Inventory Management System'
                ]
              },
              {
                name: 'Manufacturing & Industrial',
                icon: '🏭',
                projects: '15+ projects',
                description: 'IoT solutions, predictive maintenance, supply chain management, and quality control.',
                highlights: ['40% downtime reduction', 'Real-time monitoring', 'Smart factory integration'],
                caseStudies: [
                  'Manufacturing IoT Solution',
                  'Predictive Maintenance Platform',
                  'Supply Chain Optimization'
                ]
              },
              {
                name: 'Education & EdTech',
                icon: '📚',
                projects: '12+ projects',
                description: 'Learning management systems, student information systems, and educational platforms.',
                highlights: ['100K+ students served', 'Interactive learning', 'Progress tracking'],
                caseStudies: [
                  'Education Learning Platform',
                  'Student Management System',
                  'Online Assessment Tool'
                ]
              },
              {
                name: 'Logistics & Transportation',
                icon: '🚛',
                projects: '14+ projects',
                description: 'Route optimization, fleet management, warehouse management, and delivery tracking.',
                highlights: ['25% cost reduction', 'Real-time tracking', 'Route optimization'],
                caseStudies: [
                  'Logistics Optimization System',
                  'Fleet Management Platform',
                  'Warehouse Management System'
                ]
              },
              {
                name: 'Energy & Utilities',
                icon: '⚡',
                projects: '10+ projects',
                description: 'Smart grid management, energy monitoring, asset management, and environmental tracking.',
                highlights: ['500K+ households served', '20% energy savings', 'Smart grid integration'],
                caseStudies: [
                  'Energy Management Platform',
                  'Smart Grid Solution',
                  'Renewable Energy Monitoring'
                ]
              },
              {
                name: 'Media & Entertainment',
                icon: '📺',
                projects: '8+ projects',
                description: 'Content delivery networks, streaming platforms, digital asset management, and analytics.',
                highlights: ['10M+ users served', '99.9% uptime', 'Global CDN deployment'],
                caseStudies: [
                  'Media Content Delivery Network',
                  'Video Streaming Platform',
                  'Digital Asset Management'
                ]
              },
              {
                name: 'Government & Public Sector',
                icon: '🏛️',
                projects: '6+ projects',
                description: 'Citizen services, case management, document management, and compliance systems.',
                highlights: ['Citizens services digitized', 'Compliance achieved', 'Workflow automation'],
                caseStudies: [
                  'Citizen Services Portal',
                  'Government Case Management',
                  'Public Safety System'
                ]
              }
            ].map((industry, index) => (
              <div key={industry.name} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">{industry.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{industry.name}</h3>
                    <p className="text-blue-600 font-semibold">{industry.projects}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">{industry.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Achievements:</h4>
                  <ul className="space-y-2">
                    {industry.highlights.map((highlight, highlightIndex) => (
                      <li key={highlightIndex} className="flex items-center text-gray-700">
                        <StarIcon className="w-4 h-4 text-yellow-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Notable Case Studies:</h4>
                  <ul className="space-y-2">
                    {industry.caseStudies.map((study, studyIndex) => (
                      <li key={studyIndex} className="text-gray-600 text-sm">
                        • {study}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Link
                    href={`/case-studies/by-industry/${industry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center"
                  >
                    View {industry.name} Case Studies
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Expertise Highlights */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Industry-Specific Expertise?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deep domain knowledge means better solutions, faster delivery, and superior results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Regulatory Compliance',
                description: 'Deep understanding of industry regulations and compliance requirements.',
                icon: '📋'
              },
              {
                title: 'Domain Knowledge',
                description: 'Extensive experience with industry-specific challenges and best practices.',
                icon: '🎯'
              },
              {
                title: 'Faster Time-to-Market',
                description: 'Pre-built components and proven architectures accelerate development.',
                icon: '⚡'
              },
              {
                title: 'Risk Mitigation',
                description: 'Industry expertise reduces project risks and ensures successful outcomes.',
                icon: '🛡️'
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cross-Industry Projects */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Cross-Industry Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              How our solutions create value across multiple industry sectors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: 'AI-Powered Analytics Platform',
                industries: ['Healthcare', 'Finance', 'Manufacturing'],
                description: 'Machine learning platform that provides predictive insights across different industry verticals.',
                impact: 'Used by 50+ organizations across 3 industries',
                features: [
                  'Predictive modeling for patient outcomes (Healthcare)',
                  'Risk assessment for loan portfolios (Finance)',
                  'Predictive maintenance scheduling (Manufacturing)'
                ]
              },
              {
                title: 'Blockchain Identity Verification',
                industries: ['FinTech', 'Government', 'Healthcare'],
                description: 'Secure identity verification system using blockchain technology for multiple regulated industries.',
                impact: 'Processed 1M+ identity verifications',
                features: [
                  'KYC/AML compliance for financial institutions',
                  'Secure citizen identity management',
                  'Patient identity verification and consent'
                ]
              }
            ].map((project, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{project.title}</h3>
                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {project.industries.map((industry, industryIndex) => (
                      <span key={industryIndex} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{project.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <ChartBarIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-green-600 font-semibold">{project.impact}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Industry Applications:</h4>
                  <ul className="space-y-2">
                    {project.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-gray-700 text-sm">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Industry Leaders Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Testimonials from satisfied clients across different industry sectors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Zoptal's deep understanding of financial regulations and compliance requirements made them the perfect partner for our banking platform modernization.",
                author: "Sarah Chen",
                title: "CTO",
                company: "Global Investment Bank",
                industry: "FinTech"
              },
              {
                quote: "Their healthcare domain expertise was evident from day one. They understood our HIPAA requirements and delivered a solution that exceeded expectations.",
                author: "Dr. Michael Rodriguez",
                title: "Chief Medical Officer",
                company: "Regional Hospital Network",
                industry: "Healthcare"
              },
              {
                quote: "The manufacturing IoT solution has transformed our operations. Their understanding of industrial processes made all the difference.",
                author: "Jennifer Walsh",
                title: "VP of Operations",
                company: "Manufacturing Corp",
                industry: "Manufacturing"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {testimonial.industry}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 italic">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-gray-600 text-sm">{testimonial.title}</div>
                  <div className="text-gray-500 text-sm">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Industry?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Leverage our deep industry expertise to build software solutions that drive real business impact in your sector.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 flex items-center justify-center"
            >
              <BuildingOffice2Icon className="w-5 h-5 mr-2" />
              Discuss Your Industry Needs
            </Link>
            <Link
              href="/services"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300"
            >
              Explore Our Services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}