import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, CubeIcon, ShieldCheckIcon, RocketLaunchIcon, CogIcon, StarIcon, ChartBarIcon, UserGroupIcon, CheckIcon, PhoneIcon, CloudIcon, BoltIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { keywordsByCategory } from '@/lib/seo/keywords';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Micro-SaaS Development Services | Small-Scale SaaS Solutions | Zoptal',
  description: 'Professional micro-SaaS development services. Build profitable, focused SaaS applications with rapid deployment and minimal complexity.',
  keywords: [
    ...keywordsByCategory.services,
    'micro-SaaS development',
    'small SaaS development',
    'SaaS MVP development',
    'lean SaaS solutions',
    'micro SaaS applications',
    'SaaS startup development',
    'cloud-based solutions',
    'subscription software',
    'minimal viable product',
    'SaaS consulting',
    'rapid prototyping',
    'indie SaaS development',
    'niche SaaS solutions',
    'SaaS architecture'
  ],
  openGraph: {
    title: 'Micro-SaaS Development Services | Zoptal',
    description: 'Professional micro-SaaS development services. Build profitable, focused SaaS applications with rapid deployment.',
    type: 'website',
    url: 'https://zoptal.com/services/saas-development/micro-saas',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Micro-SaaS Development Services | Zoptal',
    description: 'Professional micro-SaaS development services. Build profitable, focused SaaS applications with rapid deployment.',
  },
  alternates: {
    canonical: 'https://zoptal.com/services/saas-development/micro-saas',
  },
};

export default function MicroSaaSDevelopmentPage() {
  const serviceSchema = generateServiceSchema({
    name: 'Micro-SaaS Development Services',
    description: 'Professional micro-SaaS development services for building focused, profitable SaaS applications with rapid time-to-market.',
    provider: 'Zoptal',
    areaServed: 'Global',
    serviceType: 'SaaS Development',
    url: 'https://zoptal.com/services/saas-development/micro-saas',
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Services', url: 'https://zoptal.com/services' },
      { name: 'SaaS Development', url: 'https://zoptal.com/services/saas-development' },
      { name: 'Micro-SaaS Development', url: 'https://zoptal.com/services/saas-development/micro-saas' },
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
                Micro-SaaS Development
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Micro-SaaS Development Services
              </h1>
              <p className="text-xl sm:text-2xl text-emerald-100 mb-8 leading-relaxed">
                Build focused, profitable SaaS applications that solve specific problems. From MVP to market-ready product with lean development approach and rapid deployment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition-colors duration-300 text-center"
                >
                  Start Your Micro-SaaS
                </Link>
                <Link
                  href="/portfolio"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors duration-300 text-center"
                >
                  View SaaS Portfolio
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-emerald-200 mb-2">4-8 weeks</div>
                  <div className="text-white font-semibold mb-1">Time to Launch</div>
                  <div className="text-emerald-200 text-sm">MVP to market</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-emerald-200 mb-2">$15K-50K</div>
                  <div className="text-white font-semibold mb-1">Development Cost</div>
                  <div className="text-emerald-200 text-sm">Typical range</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-emerald-200 mb-2">95%</div>
                  <div className="text-white font-semibold mb-1">Success Rate</div>
                  <div className="text-emerald-200 text-sm">Successful launches</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-emerald-200 mb-2">50+</div>
                  <div className="text-white font-semibold mb-1">Micro-SaaS Built</div>
                  <div className="text-emerald-200 text-sm">Profitable solutions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Micro-SaaS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What is Micro-SaaS?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Focused, lightweight SaaS applications that solve specific problems for niche markets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: CubeIcon,
                title: 'Focused Solution',
                description: 'Solve one specific problem exceptionally well rather than trying to do everything.'
              },
              {
                icon: BoltIcon,
                title: 'Rapid Development',
                description: 'Quick to build, deploy, and iterate with minimal complexity and overhead.'
              },
              {
                icon: CurrencyDollarIcon,
                title: 'Low Investment',
                description: 'Minimal upfront costs with potential for high returns and profitability.'
              },
              {
                icon: UserGroupIcon,
                title: 'Niche Market',
                description: 'Target specific audience segments with tailored features and pricing.'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Micro-SaaS Advantages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Micro-SaaS?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Strategic advantages of micro-SaaS over traditional enterprise solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                {[
                  {
                    title: 'Lower Risk, Higher Speed',
                    description: 'Validate your idea quickly with minimal investment and faster time-to-market.',
                    icon: RocketLaunchIcon
                  },
                  {
                    title: 'Easier to Manage',
                    description: 'Simple architecture, fewer features, and focused scope make maintenance effortless.',
                    icon: CogIcon
                  },
                  {
                    title: 'Higher Profit Margins',
                    description: 'Lower development and operational costs lead to better profitability per customer.',
                    icon: ChartBarIcon
                  },
                  {
                    title: 'Rapid Iteration',
                    description: 'Quick feedback loops allow for faster improvements and feature additions.',
                    icon: BoltIcon
                  }
                ].map((advantage, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <advantage.icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{advantage.title}</h3>
                      <p className="text-gray-600">{advantage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Micro-SaaS vs Traditional SaaS</h3>
              <div className="space-y-4">
                {[
                  { aspect: 'Development Time', micro: '4-8 weeks', traditional: '6-18 months' },
                  { aspect: 'Initial Investment', micro: '$15K-50K', traditional: '$100K-1M+' },
                  { aspect: 'Team Size', micro: '2-5 people', traditional: '10-50+ people' },
                  { aspect: 'Feature Scope', micro: 'Single focused solution', traditional: 'Comprehensive platform' },
                  { aspect: 'Target Market', micro: 'Niche segment', traditional: 'Broad enterprise market' },
                  { aspect: 'Profitability Timeline', micro: '3-6 months', traditional: '12-24 months' }
                ].map((comparison, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">{comparison.aspect}</span>
                    <div className="text-right">
                      <div className="text-sm text-emerald-600 font-semibold">{comparison.micro}</div>
                      <div className="text-xs text-gray-500">{comparison.traditional}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Micro-SaaS Development Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Micro-SaaS Development Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete end-to-end development services for your micro-SaaS idea
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'MVP Development',
                description: 'Build a minimum viable product to validate your idea and get to market quickly.',
                features: [
                  'Core feature development',
                  'User authentication',
                  'Basic dashboard',
                  'Payment integration',
                  'Analytics setup'
                ],
                icon: RocketLaunchIcon
              },
              {
                title: 'SaaS Architecture Design',
                description: 'Scalable, secure architecture designed for growth and easy maintenance.',
                features: [
                  'Multi-tenant architecture',
                  'Database design',
                  'API architecture',
                  'Security implementation',
                  'Performance optimization'
                ],
                icon: CogIcon
              },
              {
                title: 'Subscription Management',
                description: 'Complete billing and subscription system with multiple pricing tiers.',
                features: [
                  'Stripe/PayPal integration',
                  'Subscription plans',
                  'Usage tracking',
                  'Invoicing system',
                  'Churn analytics'
                ],
                icon: CurrencyDollarIcon
              },
              {
                title: 'User Management',
                description: 'Comprehensive user management system with roles and permissions.',
                features: [
                  'User registration/login',
                  'Role-based access',
                  'Team management',
                  'User analytics',
                  'Support system'
                ],
                icon: UserGroupIcon
              },
              {
                title: 'Analytics & Reporting',
                description: 'Built-in analytics to track user behavior and business metrics.',
                features: [
                  'User behavior tracking',
                  'Business metrics',
                  'Custom dashboards',
                  'Export capabilities',
                  'Real-time monitoring'
                ],
                icon: ChartBarIcon
              },
              {
                title: 'Cloud Deployment',
                description: 'Reliable cloud hosting with auto-scaling and monitoring.',
                features: [
                  'AWS/Azure deployment',
                  'Auto-scaling setup',
                  'Monitoring alerts',
                  'Backup systems',
                  'CDN configuration'
                ],
                icon: CloudIcon
              }
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                    <service.icon className="w-6 h-6 text-emerald-600" />
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

      {/* Technology Stack */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Micro-SaaS Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Modern, proven technologies for rapid development and scalability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                category: 'Frontend',
                technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion']
              },
              {
                category: 'Backend',
                technologies: ['Node.js', 'Express', 'FastAPI', 'Supabase', 'Firebase']
              },
              {
                category: 'Database',
                technologies: ['PostgreSQL', 'MongoDB', 'Redis', 'Prisma', 'PlanetScale']
              },
              {
                category: 'Deployment',
                technologies: ['Vercel', 'Netlify', 'AWS', 'Docker', 'Railway']
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

      {/* Micro-SaaS Ideas & Examples */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Successful Micro-SaaS Examples
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Inspiration from profitable micro-SaaS applications we've built
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Email Signature Generator',
                description: 'Simple tool for creating professional email signatures with social links and branding.',
                metrics: [
                  '10K+ monthly users',
                  '$5K MRR in 6 months',
                  '95% customer satisfaction'
                ],
                features: ['Drag-drop builder', 'Template library', 'Brand customization', 'HTML export'],
                pricing: '$9-29/month'
              },
              {
                title: 'Social Media Scheduler',
                description: 'Focused social media scheduling tool for small businesses and solopreneurs.',
                metrics: [
                  '5K+ active users',
                  '$12K MRR',
                  '85% user retention'
                ],
                features: ['Multi-platform posting', 'Content calendar', 'Analytics dashboard', 'Team collaboration'],
                pricing: '$15-49/month'
              },
              {
                title: 'Invoice Generator',
                description: 'Simple invoicing solution for freelancers with payment tracking and reminders.',
                metrics: [
                  '15K+ invoices sent',
                  '$8K MRR',
                  '92% payment completion'
                ],
                features: ['Custom templates', 'Payment integration', 'Expense tracking', 'Client portal'],
                pricing: '$12-39/month'
              }
            ].map((example, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{example.title}</h3>
                <p className="text-gray-600 mb-6">{example.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Metrics:</h4>
                  <ul className="space-y-2">
                    {example.metrics.map((metric, metricIndex) => (
                      <li key={metricIndex} className="flex items-center text-gray-700">
                        <StarIcon className="w-4 h-4 text-yellow-500 mr-3 flex-shrink-0" />
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Core Features:</h4>
                  <ul className="space-y-1">
                    {example.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-gray-600 text-sm">• {feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-100 rounded-lg p-3">
                  <span className="text-emerald-800 font-semibold">Pricing: {example.pricing}</span>
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
              Micro-SaaS Development Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Lean development approach focused on speed and validation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {[
              {
                step: '01',
                title: 'Idea Validation',
                description: 'Research market demand and validate your micro-SaaS concept.',
                duration: '3-5 days'
              },
              {
                step: '02',
                title: 'MVP Planning',
                description: 'Define core features and technical requirements for MVP.',
                duration: '5-7 days'
              },
              {
                step: '03',
                title: 'Design & Prototype',
                description: 'Create user interface design and interactive prototype.',
                duration: '1-2 weeks'
              },
              {
                step: '04',
                title: 'Development',
                description: 'Build MVP with core functionality and integrations.',
                duration: '2-4 weeks'
              },
              {
                step: '05',
                title: 'Testing & Launch',
                description: 'Quality assurance testing and production deployment.',
                duration: '3-5 days'
              },
              {
                step: '06',
                title: 'Iterate & Scale',
                description: 'Gather feedback and continuously improve the product.',
                duration: 'Ongoing'
              }
            ].map((process, index) => (
              <div key={index} className="text-center bg-white rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {process.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{process.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{process.description}</p>
                <div className="text-emerald-600 font-semibold text-sm">{process.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Packages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Micro-SaaS Development Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible packages designed for different stages of your micro-SaaS journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'MVP Package',
                price: '$15,000',
                duration: '4-6 weeks',
                description: 'Perfect for validating your idea with a basic working product',
                features: [
                  'Core feature development',
                  'User authentication',
                  'Basic dashboard',
                  'Payment integration',
                  'Responsive design',
                  'Basic analytics',
                  'Cloud deployment',
                  '30 days support'
                ],
                popular: false
              },
              {
                name: 'Growth Package',
                price: '$35,000',
                duration: '6-8 weeks',
                description: 'Comprehensive solution ready for serious customer acquisition',
                features: [
                  'Everything in MVP',
                  'Advanced features',
                  'Admin dashboard',
                  'Email automation',
                  'Advanced analytics',
                  'API development',
                  'SEO optimization',
                  '90 days support'
                ],
                popular: true
              },
              {
                name: 'Scale Package',
                price: '$50,000',
                duration: '8-12 weeks',
                description: 'Enterprise-ready solution with advanced features and integrations',
                features: [
                  'Everything in Growth',
                  'Multi-tenant architecture',
                  'Advanced integrations',
                  'White-label options',
                  'Performance optimization',
                  'Security audit',
                  'Custom features',
                  '6 months support'
                ],
                popular: false
              }
            ].map((package_, index) => (
              <div key={index} className={`rounded-lg p-8 relative ${package_.popular ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-gray-50 border border-gray-200'}`}>
                {package_.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{package_.name}</h3>
                  <div className="text-4xl font-bold text-emerald-600 mb-2">{package_.price}</div>
                  <div className="text-gray-600 mb-4">{package_.duration}</div>
                  <p className="text-gray-600">{package_.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {package_.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700">
                      <CheckIcon className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-300 ${
                    package_.popular
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
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
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Launch Your Micro-SaaS?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            Turn your idea into a profitable micro-SaaS application with our proven development process. Fast, focused, and built for success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition-colors duration-300 flex items-center justify-center"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Start Your Micro-SaaS Project
            </Link>
            <Link
              href="/portfolio"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors duration-300"
            >
              View SaaS Portfolio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}