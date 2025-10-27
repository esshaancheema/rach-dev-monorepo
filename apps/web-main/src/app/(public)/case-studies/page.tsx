import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, BuildingOffice2Icon, ChartBarIcon, StarIcon, CalendarIcon, UserGroupIcon, GlobeAltIcon, CheckIcon, TagIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { keywordsByCategory } from '@/lib/seo/keywords';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Case Studies | Real Software Development Success Stories | Zoptal',
  description: 'Explore our portfolio of successful software development projects. Real case studies showcasing custom solutions, enterprise applications, and transformative results.',
  keywords: [
    ...keywordsByCategory.services,
    'software development case studies',
    'portfolio projects',
    'success stories',
    'client testimonials',
    'project results',
    'software solutions',
    'development examples',
    'business impact',
    'transformation stories',
    'client work',
    'project showcase',
    'development portfolio',
    'technology implementations',
    'business solutions'
  ],
  openGraph: {
    title: 'Case Studies | Software Development Success Stories | Zoptal',
    description: 'Explore our portfolio of successful software development projects with real results and transformative business impact.',
    type: 'website',
    url: 'https://zoptal.com/case-studies',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Case Studies | Software Development Success Stories | Zoptal',
    description: 'Explore our portfolio of successful software development projects with real results and transformative business impact.',
  },
  alternates: {
    canonical: 'https://zoptal.com/case-studies',
  },
};

export default function CaseStudiesPage() {
  const serviceSchema = generateServiceSchema({
    name: 'Software Development Case Studies',
    description: 'Portfolio of successful software development projects showcasing real business results and transformative solutions.',
    provider: {
      name: 'Zoptal',
      url: 'https://zoptal.com'
    },
    areaServed: 'Global',
    serviceType: 'Software Development Portfolio',
    url: 'https://zoptal.com/case-studies',
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Case Studies', url: 'https://zoptal.com/case-studies' },
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
              <li className="text-gray-900 font-medium">
                Case Studies
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
              Real Success Stories
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Discover how we've transformed businesses with custom software solutions. Real projects, real results, real impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 text-center"
              >
                Start Your Success Story
              </Link>
              <Link
                href="/services"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300 text-center"
              >
                View Our Services
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-200 mb-2">250+</div>
              <div className="text-white font-semibold mb-1">Projects Delivered</div>
              <div className="text-blue-200 text-sm">Successful implementations</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-200 mb-2">$2.5B+</div>
              <div className="text-white font-semibold mb-1">Value Created</div>
              <div className="text-blue-200 text-sm">Business impact</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-200 mb-2">98%</div>
              <div className="text-white font-semibold mb-1">Client Satisfaction</div>
              <div className="text-blue-200 text-sm">Success rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-200 mb-2">15+</div>
              <div className="text-white font-semibold mb-1">Industries Served</div>
              <div className="text-blue-200 text-sm">Diverse expertise</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Navigation */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Explore Case Studies
            </h2>
            <p className="text-gray-600">
              Filter by industry, technology, or solution type to find relevant success stories
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/case-studies/by-industry"
              className="bg-blue-50 text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors duration-300 flex items-center"
            >
              <BuildingOffice2Icon className="w-5 h-5 mr-2" />
              By Industry
            </Link>
            <Link
              href="/case-studies/by-technology"
              className="bg-green-50 text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-green-100 transition-colors duration-300 flex items-center"
            >
              <GlobeAltIcon className="w-5 h-5 mr-2" />
              By Technology
            </Link>
            <Link
              href="/case-studies/by-solution"
              className="bg-purple-50 text-purple-700 px-6 py-3 rounded-lg font-medium hover:bg-purple-100 transition-colors duration-300 flex items-center"
            >
              <ChartBarIcon className="w-5 h-5 mr-2" />
              By Solution Type
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Featured Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our most impactful projects that transformed businesses and delivered exceptional results
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {[
              {
                id: 'fintech-platform-transformation',
                title: 'FinTech Platform Transformation',
                industry: 'Financial Services',
                client: 'Global Investment Bank',
                description: 'Complete modernization of legacy trading platform serving 50,000+ daily active traders with real-time data processing.',
                challenge: 'Outdated legacy system causing performance bottlenecks, security vulnerabilities, and maintenance challenges.',
                solution: 'Microservices architecture with real-time data streaming, advanced security, and cloud-native deployment.',
                results: [
                  '$500M+ daily trading volume',
                  '99.99% uptime achieved',
                  '75% faster transaction processing',
                  '50,000+ active traders',
                  'SOC 2 Type II compliant'
                ],
                technologies: ['React', 'Node.js', 'Kafka', 'PostgreSQL', 'AWS', 'Docker'],
                duration: '18 months',
                image: '/images/case-studies/fintech-platform.jpg',
                featured: true
              },
              {
                id: 'healthcare-data-integration',
                title: 'Healthcare Data Integration Platform',
                industry: 'Healthcare',
                client: 'Regional Hospital Network',
                description: 'Unified patient data platform integrating 25+ healthcare systems across 15 hospitals with 2M+ patient records.',
                challenge: 'Fragmented patient data across multiple systems leading to inefficient care coordination and medical errors.',
                solution: 'HL7 FHIR-compliant integration platform with real-time synchronization and advanced analytics.',
                results: [
                  '25+ systems integrated',
                  '2M+ patient records unified',
                  '60% faster care coordination',
                  'HIPAA compliant',
                  '40% reduction in medical errors'
                ],
                technologies: ['Python', 'MongoDB', 'Apache Kafka', 'Docker', 'Azure', 'HL7 FHIR'],
                duration: '14 months',
                image: '/images/case-studies/healthcare-integration.jpg',
                featured: true
              }
            ].map((study, index) => (
              <div key={study.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {study.industry}
                    </span>
                    <span className="text-gray-500 text-sm">{study.duration}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{study.title}</h3>
                  <p className="text-gray-600 mb-4">{study.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Challenge:</h4>
                    <p className="text-gray-600 text-sm">{study.challenge}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Solution:</h4>
                    <p className="text-gray-600 text-sm">{study.solution}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Results:</h4>
                    <ul className="space-y-2">
                      {study.results.map((result, resultIndex) => (
                        <li key={resultIndex} className="flex items-center text-gray-700">
                          <StarIcon className="w-4 h-4 text-yellow-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {study.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      href={`/case-studies/${study.id}`}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center"
                    >
                      Read Full Case Study
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More Case Studies Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              More Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our diverse portfolio of successful projects across industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 'ecommerce-platform-scaling',
                title: 'E-commerce Platform Scaling',
                industry: 'Retail',
                description: 'Scaled e-commerce platform to handle 1M+ concurrent users during peak shopping events.',
                impact: '300% traffic increase handled',
                technologies: ['Node.js', 'Redis', 'AWS'],
                duration: '8 months'
              },
              {
                id: 'manufacturing-iot-solution',
                title: 'Manufacturing IoT Solution',
                industry: 'Manufacturing',
                description: 'IoT-enabled predictive maintenance system reducing equipment downtime by 40%.',
                impact: '40% downtime reduction',
                technologies: ['Python', 'IoT', 'Machine Learning'],
                duration: '12 months'
              },
              {
                id: 'education-learning-platform',
                title: 'Education Learning Platform',
                industry: 'Education',
                description: 'Comprehensive learning management system serving 100,000+ students and educators.',
                impact: '100K+ users onboarded',
                technologies: ['React', 'Node.js', 'MongoDB'],
                duration: '10 months'
              },
              {
                id: 'logistics-optimization-system',
                title: 'Logistics Optimization System',
                industry: 'Logistics',
                description: 'AI-powered route optimization system reducing delivery costs by 25%.',
                impact: '25% cost reduction',
                technologies: ['Python', 'AI/ML', 'PostgreSQL'],
                duration: '6 months'
              },
              {
                id: 'energy-management-platform',
                title: 'Energy Management Platform',
                industry: 'Energy',
                description: 'Smart grid management system optimizing energy distribution for 500K+ households.',
                impact: '20% energy savings',
                technologies: ['Java', 'Apache Kafka', 'Time-series DB'],
                duration: '16 months'
              },
              {
                id: 'media-content-delivery',
                title: 'Media Content Delivery Network',
                industry: 'Media',
                description: 'Global CDN solution delivering video content to 10M+ users with 99.9% uptime.',
                impact: '10M+ users served',
                technologies: ['CDN', 'Video Streaming', 'Cloud'],
                duration: '14 months'
              }
            ].map((study, index) => (
              <div key={study.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                    {study.industry}
                  </span>
                  <span className="text-gray-500 text-xs">{study.duration}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{study.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{study.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-green-600 font-semibold text-sm">{study.impact}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {study.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <Link
                    href={`/case-studies/${study.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                  >
                    Read Case Study
                    <ArrowRightIcon className="w-3 h-3 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Industries We Transform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deep expertise across critical industries with proven success stories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: 'FinTech', count: '25+ projects', icon: '💰' },
              { name: 'Healthcare', count: '18+ projects', icon: '🏥' },
              { name: 'E-commerce', count: '22+ projects', icon: '🛒' },
              { name: 'Manufacturing', count: '15+ projects', icon: '🏭' },
              { name: 'Education', count: '12+ projects', icon: '📚' },
              { name: 'Energy', count: '10+ projects', icon: '⚡' },
              { name: 'Logistics', count: '14+ projects', icon: '🚛' },
              { name: 'Media', count: '8+ projects', icon: '📺' },
              { name: 'Government', count: '6+ projects', icon: '🏛️' },
              { name: 'Real Estate', count: '9+ projects', icon: '🏢' }
            ].map((industry, index) => (
              <Link
                key={industry.name}
                href="/case-studies/by-industry"
                className="text-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow duration-300"
              >
                <div className="text-3xl mb-2">{industry.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{industry.name}</h3>
                <p className="text-gray-600 text-sm">{industry.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real feedback from satisfied clients across our successful projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "Zoptal transformed our legacy trading platform into a modern, high-performance system that handles millions of transactions daily. Their expertise in financial technology is unmatched.",
                author: "Sarah Chen",
                title: "CTO, Global Investment Bank",
                company: "Fortune 500 Financial Institution"
              },
              {
                quote: "The healthcare integration platform they built has revolutionized how we manage patient data. Care coordination is now seamless across all our facilities.",
                author: "Dr. Michael Rodriguez",
                title: "Chief Medical Officer",
                company: "Regional Hospital Network"
              },
              {
                quote: "Our e-commerce platform now handles 10x the traffic with zero downtime. The scalability and performance improvements exceeded all expectations.",
                author: "Jennifer Walsh",
                title: "VP of Technology",
                company: "Leading Retail Brand"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
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
            Ready to Create Your Success Story?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join hundreds of satisfied clients who have transformed their businesses with our custom software solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 flex items-center justify-center"
            >
              <UserGroupIcon className="w-5 h-5 mr-2" />
              Start Your Project
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