import type { Metadata } from 'next';
import { 
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  CpuChipIcon,
  CloudIcon,
  Cog6ToothIcon,
  CubeIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { generateServiceSchema, combineSchemas, ZOPTAL_ORGANIZATION_SCHEMA } from '@/lib/seo/schemas';
import AnimatedServiceHero from '@/components/services/AnimatedServiceHero';

export const metadata: Metadata = {
  title: 'Software Development Services | AI-Powered | Zoptal',
  description: 'AI-powered software development services. Custom web apps, mobile apps, enterprise solutions, AI agents & SaaS development by expert teams.',
  keywords: [
    'software development services',
    'custom software development',
    'web application development',
    'mobile app development',
    'AI development services',
    'enterprise software solutions',
    'SaaS development',
    'API development'
  ]
};

const serviceCategories = [
  {
    id: 'custom-software-development',
    title: 'Custom Software Development',
    description: 'Tailored software solutions built to your exact specifications',
    icon: CodeBracketIcon,
    color: 'from-blue-500 to-cyan-500',
    services: [
      {
        name: 'Enterprise Solutions',
        href: '/services/custom-software-development/enterprise',
        description: 'Scalable enterprise applications with advanced features'
      },
      {
        name: 'Startup MVP',
        href: '/services/custom-software-development/startup',
        description: 'Rapid prototyping and MVP development for startups'
      },
      {
        name: 'Legacy Modernization',
        href: '/services/custom-software-development/legacy',
        description: 'Transform outdated systems with modern technologies'
      }
    ],
    features: ['Custom Architecture', 'Scalable Design', 'Security First', 'Performance Optimized'],
    pricing: 'Starting from $15,000',
    timeline: '8-16 weeks',
    industries: ['Healthcare', 'Finance', 'Manufacturing', 'Retail']
  },
  {
    id: 'mobile-app-development',
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile applications',
    icon: DevicePhoneMobileIcon,
    color: 'from-purple-500 to-pink-500',
    services: [
      {
        name: 'iOS Development',
        href: '/services/mobile-app-development/ios',
        description: 'Native iOS apps with cutting-edge features'
      },
      {
        name: 'Android Development',
        href: '/services/mobile-app-development/android',
        description: 'High-performance Android applications'
      },
      {
        name: 'Cross-Platform',
        href: '/services/mobile-app-development/cross-platform',
        description: 'React Native and Flutter applications'
      }
    ],
    features: ['Native Performance', 'App Store Ready', 'Push Notifications', 'Offline Support'],
    pricing: 'Starting from $25,000',
    timeline: '12-20 weeks',
    industries: ['E-commerce', 'Social Media', 'Healthcare', 'Education']
  },
  {
    id: 'ai-agents-development',
    title: 'AI Agents Development',
    description: 'Intelligent AI agents that automate and enhance business processes',
    icon: CpuChipIcon,
    color: 'from-orange-500 to-red-500',
    services: [
      {
        name: 'Customer Support Bots',
        href: '/services/ai-agents-development#customer-support',
        description: '24/7 intelligent customer service automation'
      },
      {
        name: 'Sales Automation',
        href: '/services/ai-agents-development#sales',
        description: 'AI-powered lead qualification and nurturing'
      },
      {
        name: 'Process Automation',
        href: '/services/ai-agents-development#process',
        description: 'Workflow automation with intelligent decision making'
      }
    ],
    features: ['Natural Language Processing', 'Machine Learning', 'Integration Ready', 'Continuous Learning'],
    pricing: 'Starting from $8,000',
    timeline: '4-8 weeks',
    industries: ['Customer Service', 'Sales', 'Marketing', 'Operations']
  },
  {
    id: 'saas-development',
    title: 'SaaS Development',
    description: 'Scalable Software-as-a-Service platforms',
    icon: CloudIcon,
    color: 'from-green-500 to-emerald-500',
    services: [
      {
        name: 'Micro SaaS',
        href: '/services/saas-development/micro-saas',
        description: 'Focused, niche SaaS solutions'
      },
      {
        name: 'Enterprise SaaS',
        href: '/services/saas-development/enterprise-saas',
        description: 'Large-scale, multi-tenant platforms'
      },
      {
        name: 'API-First SaaS',
        href: '/services/saas-development/api-first',
        description: 'Headless SaaS with robust API infrastructure'
      }
    ],
    features: ['Multi-tenancy', 'Subscription Billing', 'Auto-scaling', 'Analytics Dashboard'],
    pricing: 'Starting from $30,000',
    timeline: '16-24 weeks',
    industries: ['B2B Tools', 'Productivity', 'Analytics', 'Communication']
  },
  {
    id: 'api-development',
    title: 'API Development',
    description: 'Robust APIs and microservices architecture',
    icon: Cog6ToothIcon,
    color: 'from-indigo-500 to-purple-500',
    services: [
      {
        name: 'REST API Development',
        href: '/services/api-development/rest',
        description: 'RESTful APIs with comprehensive documentation'
      },
      {
        name: 'GraphQL APIs',
        href: '/services/api-development/graphql',
        description: 'Flexible GraphQL APIs for modern applications'
      },
      {
        name: 'Microservices',
        href: '/services/api-development/microservices',
        description: 'Scalable microservices architecture'
      }
    ],
    features: ['OpenAPI Spec', 'Rate Limiting', 'Authentication', 'Real-time Updates'],
    pricing: 'Starting from $12,000',
    timeline: '6-12 weeks',
    industries: ['Fintech', 'E-commerce', 'IoT', 'Digital Platforms']
  },
  {
    id: 'enterprise-solutions',
    title: 'Enterprise Solutions',
    description: 'Large-scale enterprise software and digital transformation',
    icon: BuildingOffice2Icon,
    color: 'from-teal-500 to-blue-500',
    services: [
      {
        name: 'ERP Systems',
        href: '/services/enterprise-solutions/erp',
        description: 'Comprehensive enterprise resource planning'
      },
      {
        name: 'CRM Solutions',
        href: '/services/enterprise-solutions/crm',
        description: 'Customer relationship management systems'
      },
      {
        name: 'Digital Transformation',
        href: '/services/enterprise-solutions/transformation',
        description: 'End-to-end digital transformation consulting'
      }
    ],
    features: ['Enterprise Integration', 'Advanced Security', 'Compliance Ready', 'Scalable Architecture'],
    pricing: 'Starting from $50,000',
    timeline: '20-36 weeks',
    industries: ['Manufacturing', 'Healthcare', 'Government', 'Financial Services']
  }
];

const whyChooseUs = [
  {
    icon: CpuChipIcon,
    title: 'AI-Powered Development',
    description: 'Leverage cutting-edge AI to accelerate development and enhance code quality.'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Rapid Deployment',
    description: 'Get to market faster with our streamlined development processes and proven methodologies.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise Security',
    description: 'Built-in security best practices and compliance with industry standards.'
  },
  {
    icon: UserGroupIcon,
    title: 'Expert Teams',
    description: 'Work with experienced developers, architects, and project managers.'
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Reach',
    description: 'Serving clients worldwide with 24/7 support and flexible engagement models.'
  },
  {
    icon: HeartIcon,
    title: 'Client Success Focus',
    description: 'Your success is our priority. We provide ongoing support and maintenance.'
  }
];

const processSteps = [
  {
    step: 1,
    title: 'Discovery & Planning',
    description: 'Understanding your requirements and defining project scope',
    icon: ClockIcon,
    activities: ['Requirements Analysis', 'Technology Selection', 'Project Planning', 'Resource Allocation']
  },
  {
    step: 2,
    title: 'Design & Architecture',
    description: 'Creating detailed designs and system architecture',
    icon: CubeIcon,
    activities: ['UI/UX Design', 'System Architecture', 'Database Design', 'API Specification']
  },
  {
    step: 3,
    title: 'Development & Testing',
    description: 'Agile development with continuous testing and quality assurance',
    icon: CodeBracketIcon,
    activities: ['Sprint Development', 'Automated Testing', 'Code Reviews', 'Quality Assurance']
  },
  {
    step: 4,
    title: 'Deployment & Launch',
    description: 'Seamless deployment and go-live support',
    icon: RocketLaunchIcon,
    activities: ['Production Deployment', 'Performance Monitoring', 'User Training', 'Go-Live Support']
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CTO, TechCorp',
    company: 'TechCorp',
    rating: 5,
    comment: 'Zoptal delivered our enterprise platform ahead of schedule. Their AI-powered development approach saved us months of work.',
    avatar: '/images/testimonials/sarah.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'Founder, StartupXYZ',
    company: 'StartupXYZ',
    rating: 5,
    comment: 'From MVP to Series A, Zoptal has been our trusted development partner. Exceptional quality and support.',
    avatar: '/images/testimonials/michael.jpg'
  },
  {
    name: 'Emily Rodriguez',
    role: 'VP Engineering, FinanceFlow',
    company: 'FinanceFlow',
    rating: 5,
    comment: 'Their expertise in fintech and compliance helped us launch our platform with confidence. Highly recommended.',
    avatar: '/images/testimonials/emily.jpg'
  }
];

export default function ServicesPage() {
  const structuredData = combineSchemas(
    ZOPTAL_ORGANIZATION_SCHEMA,
    generateServiceSchema({
      name: 'Software Development Services',
      description: 'Comprehensive software development services including custom applications, mobile apps, AI agents, and enterprise solutions.',
      url: 'https://zoptal.com/services',
      serviceType: 'Software Development',
      provider: {
        name: 'Zoptal',
        url: 'https://zoptal.com'
      },
      areaServed: ['United States', 'Canada', 'United Kingdom', 'Australia'],
      offers: {
        price: '15000',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      aggregateRating: {
        ratingValue: 4.9,
        reviewCount: 247
      }
    })
  );

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedServiceHero
            title="Software Development Services"
            subtitle="Powered by AI"
            description="From custom applications to AI agents, we deliver comprehensive software solutions that accelerate your business growth and digital transformation."
          />
        </div>
      </section>

      {/* Service Categories */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comprehensive Development Services
              </h2>
              <p
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Choose from our full spectrum of software development services, 
                each powered by AI and delivered by expert teams.
              </p>
            </div>

            <div className="space-y-16">
              {serviceCategories.map((category, index) => (
                <div
                  key={category.id}
                  className="bg-white rounded-3xl border border-gray-200 p-8 lg:p-12 hover:shadow-lg transition-all duration-300"
                >
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Service Info */}
                    <div>
                      <div className="flex items-center space-x-4 mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center`}>
                          <category.icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {category.title}
                          </h3>
                          <p className="text-gray-600">
                            {category.description}
                          </p>
                        </div>
                      </div>

                      {/* Service Details */}
                      <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                          <ul className="space-y-2">
                            {category.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center text-sm text-gray-600">
                                <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Industries:</h4>
                          <div className="flex flex-wrap gap-2">
                            {category.industries.map((industry, idx) => (
                              <span
                                key={idx}
                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                              >
                                {industry}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Timeline */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="text-2xl font-bold text-primary-600">{category.pricing}</div>
                          <div className="text-sm text-gray-600">Starting price</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">{category.timeline}</div>
                          <div className="text-sm text-gray-600">Typical timeline</div>
                        </div>
                      </div>

                      <Link
                        href={`/services/${category.id}`}
                        className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                      >
                        <span>Learn More</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Service Types */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-6">Service Options:</h4>
                      <div className="space-y-4">
                        {category.services.map((service, idx) => (
                          <Link
                            key={idx}
                            href={service.href}
                            className="block bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                                  {service.name}
                                </h5>
                                <p className="text-gray-600 text-sm">
                                  {service.description}
                                </p>
                              </div>
                              <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors ml-4" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Zoptal?
              </h2>
              <p
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                We combine cutting-edge technology with proven expertise to deliver 
                exceptional software solutions that drive business growth.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whyChooseUs.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

      {/* Development Process */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Development Process
              </h2>
              <p
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                A proven methodology that ensures quality, transparency, and timely delivery.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div
                  key={step.step}
                  className="text-center"
                >
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                      {step.step}
                    </div>
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                      <step.icon className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {step.description}
                  </p>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900 mb-2">Key Activities:</h4>
                    <ul className="space-y-1">
                      {step.activities.map((activity, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What Our Clients Say
              </h2>
              <p
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Don't just take our word for it. Here's what our clients have to say about our services.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-8"
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
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.comment}"
                  </p>
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
                </div>
              ))}
            </div>
          </div>
        </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Let's discuss your project and how our AI-powered development services 
                can accelerate your success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <span>Start Your Project</span>
                  <SparklesIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center justify-center space-x-2 bg-primary-700 text-white px-8 py-4 rounded-lg hover:bg-primary-800 transition-all font-semibold border border-primary-500"
                >
                  <span>View Case Studies</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}