import { Metadata } from 'next';
import { motion } from 'framer-motion';
import { 
  RocketLaunchIcon,
  BoltIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  ChartBarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  CpuChipIcon,
  CheckIcon,
  StarIcon,
  SparklesIcon,
  ArrowRightIcon,
  PhoneIcon,
  Cog6ToothIcon,
  BuildingOffice2Icon,
  DevicePhoneMobileIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { SEOHead } from '@/components/seo';
import { generateServiceSchema, combineSchemas, ZOPTAL_ORGANIZATION_SCHEMA } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Startup Software Development | MVP Development Services | Zoptal',
  description: 'Fast, affordable software development for startups. MVP development, rapid prototyping, and scalable solutions to bring your startup idea to market quickly.',
  keywords: [
    'startup software development',
    'MVP development',
    'startup app development',
    'rapid prototyping',
    'lean development',
    'startup technology solutions',
    'minimum viable product',
    'startup web development',
    'early stage development',
    'startup mobile apps'
  ]
};

const startupAdvantages = [
  {
    icon: BoltIcon,
    title: 'Rapid Development',
    description: 'Get your MVP to market in weeks, not months',
    benefit: '70% faster time-to-market',
    features: ['Agile Methodology', 'Quick Iterations', 'Fast Deployment', 'Immediate Feedback']
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Cost-Effective Solutions',
    description: 'Startup-friendly pricing with flexible payment options',
    benefit: '50% lower development costs',
    features: ['Flexible Pricing', 'Equity Options', 'Phased Development', 'Budget Control']
  },
  {
    icon: ChartBarIcon,
    title: 'Scalable Architecture',
    description: 'Built to grow with your startup from day one',
    benefit: 'Scale from 100 to 100k users',
    features: ['Cloud-Native', 'Microservices', 'Auto-scaling', 'Performance Optimized']
  },
  {
    icon: TrophyIcon,
    title: 'Proven Success',
    description: 'We\'ve helped 200+ startups raise funding and scale',
    benefit: '85% funding success rate',
    features: ['Investor-Ready', 'Demo Preparation', 'Pitch Support', 'Technical Due Diligence']
  }
];

const mvpPackages = [
  {
    name: 'Lean MVP',
    price: '$15,000',
    timeline: '4-6 weeks',
    description: 'Perfect for validating your core idea with essential features',
    features: [
      'Core feature development',
      'Basic user authentication',
      'Simple admin panel',
      'Responsive web design',
      'Basic analytics integration',
      'Cloud deployment',
      '3 months support'
    ],
    ideal: 'Pre-seed startups, idea validation',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Vercel'],
    cta: 'Start Lean MVP'
  },
  {
    name: 'Growth MVP',
    price: '$35,000',
    timeline: '6-10 weeks',
    description: 'Comprehensive MVP with advanced features for market entry',
    features: [
      'Full feature set',
      'Advanced user management',
      'Payment integration',
      'Mobile-responsive design',
      'Advanced analytics',
      'API development',
      'Performance optimization',
      '6 months support'
    ],
    ideal: 'Seed-stage startups, market launch',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'AWS'],
    cta: 'Launch Growth MVP',
    popular: true
  },
  {
    name: 'Scale MVP',
    price: '$75,000',
    timeline: '10-16 weeks',
    description: 'Enterprise-ready MVP with advanced features and integrations',
    features: [
      'Complex feature development',
      'Multi-tenant architecture',
      'Advanced integrations',
      'Mobile app (iOS/Android)',
      'Real-time features',
      'Advanced security',
      'Load testing',
      '12 months support'
    ],
    ideal: 'Series A startups, rapid scaling',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'React Native', 'AWS', 'Redis'],
    cta: 'Build Scale MVP'
  }
];

const developmentProcess = [
  {
    week: '1-2',
    phase: 'Discovery & Planning',
    description: 'Deep dive into your startup vision and market requirements',
    activities: [
      'Startup workshop and ideation',
      'Market research and competitor analysis',
      'Feature prioritization (MoSCoW method)',
      'Technical architecture planning',
      'UI/UX wireframing',
      'Development roadmap creation'
    ],
    deliverables: ['Product Requirements Document', 'Technical Specification', 'UI/UX Mockups', 'Project Timeline']
  },
  {
    week: '3-8',
    phase: 'MVP Development',
    description: 'Agile development with weekly sprints and demos',
    activities: [
      'Core feature development',
      'Database design and setup',
      'API development',
      'Frontend implementation',
      'Basic testing and QA',
      'Weekly progress demos'
    ],
    deliverables: ['Working MVP', 'API Documentation', 'Admin Dashboard', 'Test Results']
  },
  {
    week: '9-10',
    phase: 'Launch Preparation',
    description: 'Final testing, deployment, and launch readiness',
    activities: [
      'Comprehensive testing',
      'Performance optimization',
      'Security audit',
      'Production deployment',
      'Analytics setup',
      'Launch strategy planning'
    ],
    deliverables: ['Production Application', 'Deployment Guide', 'Analytics Dashboard', 'Launch Checklist']
  },
  {
    week: 'Ongoing',
    phase: 'Growth Support',
    description: 'Continuous support and feature enhancements',
    activities: [
      'Performance monitoring',
      'Bug fixes and maintenance',
      'Feature enhancements',
      'Scaling recommendations',
      'Technical consultation',
      'Funding round support'
    ],
    deliverables: ['Monthly Reports', 'Performance Metrics', 'Enhancement Roadmap', 'Technical Documentation']
  }
];

const successStories = [
  {
    startup: 'FinanceFlow',
    industry: 'Fintech',
    stage: 'Seed → Series A',
    challenge: 'Needed an MVP for personal finance management with bank integrations',
    solution: 'Built a secure fintech MVP with Plaid integration and AI-powered insights',
    results: {
      timeline: '8 weeks to MVP',
      funding: '$2.5M Series A raised',
      users: '50K+ active users',
      growth: '300% month-over-month'
    },
    founder: {
      name: 'Sarah Kim',
      role: 'CEO & Founder',
      quote: 'Zoptal helped us build and launch our MVP in record time. We raised our Series A just 6 months after launch.',
      image: '/images/founders/sarah-kim.jpg'
    },
    technologies: ['React', 'Node.js', 'Plaid API', 'PostgreSQL', 'AWS']
  },
  {
    startup: 'HealthTrack',
    industry: 'HealthTech',
    stage: 'Pre-seed → Seed',
    challenge: 'Required HIPAA-compliant health tracking app with wearable integrations',
    solution: 'Developed a compliant health platform with device integrations and data analytics',
    results: {
      timeline: '12 weeks to MVP',
      funding: '$1.2M Seed round',
      users: '25K+ registered users',
      growth: '200% quarterly growth'
    },
    founder: {
      name: 'Dr. Michael Chen',
      role: 'Founder & CTO',
      quote: 'The team understood our complex compliance requirements and delivered a robust, scalable solution.',
      image: '/images/founders/michael-chen.jpg'
    },
    technologies: ['Vue.js', 'Python', 'FHIR', 'PostgreSQL', 'Google Cloud']
  },
  {
    startup: 'EduTech Pro',
    industry: 'EdTech',
    stage: 'Idea → Pre-seed',
    challenge: 'Online learning platform with interactive content and progress tracking',
    solution: 'Built an engaging e-learning platform with video streaming and analytics',
    results: {
      timeline: '6 weeks to MVP',
      funding: '$800K Pre-seed',
      users: '15K+ students',
      growth: '150% monthly growth'
    },
    founder: {
      name: 'Lisa Rodriguez',
      role: 'Co-founder',
      quote: 'From idea to funded startup in 4 months. Zoptal made our vision a reality.',
      image: '/images/founders/lisa-rodriguez.jpg'
    },
    technologies: ['Next.js', 'Node.js', 'MongoDB', 'Stripe', 'Vercel']
  }
];

const startupServices = [
  {
    title: 'MVP Development',
    icon: RocketLaunchIcon,
    description: 'Rapid prototyping and minimum viable product development',
    features: ['Core Feature Focus', 'Rapid Iteration', 'User Feedback Integration', 'Market Validation']
  },
  {
    title: 'Technical Consulting',
    icon: CpuChipIcon,
    description: 'Strategic technology guidance for startup founders',
    features: ['Technology Stack Selection', 'Architecture Planning', 'Scalability Strategy', 'Technical Due Diligence']
  },
  {
    title: 'Funding Support',
    icon: TrophyIcon,
    description: 'Prepare your startup for investor presentations and due diligence',
    features: ['Investor Demo Preparation', 'Technical Documentation', 'Pitch Deck Support', 'Due Diligence Ready']
  },
  {
    title: 'Scaling Solutions',
    icon: ChartBarIcon,
    description: 'Scale your application as your startup grows',
    features: ['Performance Optimization', 'Infrastructure Scaling', 'Team Augmentation', 'Feature Enhancement']
  }
];

const testimonials = [
  {
    name: 'Alex Thompson',
    role: 'Founder',
    startup: 'TechFlow',
    rating: 5,
    comment: 'Zoptal understood our startup constraints and delivered an amazing MVP that helped us secure seed funding. Their speed and quality are unmatched.',
    results: '$1.5M seed round raised',
    image: '/images/testimonials/alex-thompson.jpg'
  },
  {
    name: 'Maria Garcia',
    role: 'CTO',
    startup: 'DataViz Solutions',
    rating: 5,
    comment: 'As a non-technical founder, I needed a team I could trust. Zoptal guided me through every decision and built exactly what we needed.',
    results: '10K+ users in 3 months',
    image: '/images/testimonials/maria-garcia.jpg'
  },
  {
    name: 'David Park',
    role: 'Co-founder',
    startup: 'GreenTech Innovations',
    rating: 5,
    comment: 'From MVP to Series A in 8 months. Zoptal\'s expertise in scalable architecture made all the difference when we experienced rapid growth.',
    results: '500% user growth',
    image: '/images/testimonials/david-park.jpg'
  }
];

export default function StartupServicesPage() {
  const structuredData = combineSchemas(
    ZOPTAL_ORGANIZATION_SCHEMA,
    generateServiceSchema({
      name: 'Startup Software Development Services',
      description: 'MVP development and software solutions for startups. Rapid prototyping, lean development, and scalable architecture to bring your startup idea to market quickly.',
      url: 'https://zoptal.com/services/custom-software-development/startup',
      serviceType: 'Startup Software Development',
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
        reviewCount: 156
      }
    })
  );

  return (
    <>
      <SEOHead
        title="Startup Software Development | MVP Development Services | Zoptal"
        description="Fast, affordable software development for startups. MVP development, rapid prototyping, and scalable solutions to bring your startup idea to market quickly."
        canonicalUrl="https://zoptal.com/services/custom-software-development/startup"
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
                <li className="text-gray-900">Startup Solutions</li>
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
                  <RocketLaunchIcon className="w-4 h-4" />
                  <span>Startup Solutions</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
                >
                  From Idea to Funded Startup
                  <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    In Record Time
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl text-gray-600 mb-8"
                >
                  Fast, affordable MVP development that gets your startup to market quickly. 
                  We've helped 200+ startups raise funding and scale successfully.
                </motion.p>

                {/* Key Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-3 gap-6 mb-8"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">4-6</div>
                    <div className="text-gray-600 text-sm">Weeks to MVP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">85%</div>
                    <div className="text-gray-600 text-sm">Funding Success</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">200+</div>
                    <div className="text-gray-600 text-sm">Startups Launched</div>
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
                    <span>Start Your MVP</span>
                    <RocketLaunchIcon className="w-5 h-5" />
                  </Link>
                  <Link
                    href="#packages"
                    className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg border border-primary-200 hover:bg-primary-50 transition-all font-semibold"
                  >
                    <span>View Packages</span>
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
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-8 text-center">
                  <div className="mb-8">
                    <RocketLaunchIcon className="w-20 h-20 text-primary-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Launch Your Startup</h3>
                    <p className="text-gray-600">From idea to market in weeks</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <BoltIcon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <div className="text-sm font-medium">Fast Development</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <CurrencyDollarIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-sm font-medium">Budget Friendly</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <ChartBarIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-sm font-medium">Scalable</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <TrophyIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-sm font-medium">Investor Ready</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Startup Advantages */}
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
                Why Startups Choose Zoptal
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                We understand startup challenges and have designed our services 
                specifically for fast-moving, resource-conscious teams.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {startupAdvantages.map((advantage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-8 text-center hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <advantage.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {advantage.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {advantage.description}
                  </p>
                  <div className="bg-primary-50 rounded-lg p-3 mb-4">
                    <div className="text-lg font-bold text-primary-600">{advantage.benefit}</div>
                  </div>
                  <div className="space-y-2">
                    {advantage.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* MVP Packages */}
        <section id="packages" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                MVP Development Packages
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Choose the perfect package for your startup stage and requirements. 
                All packages include source code, documentation, and ongoing support.
              </motion.p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {mvpPackages.map((pkg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`bg-white rounded-3xl p-8 ${
                    pkg.popular 
                      ? 'border-2 border-primary-500 shadow-lg relative' 
                      : 'border border-gray-200'
                  } hover:shadow-lg transition-all duration-300`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="text-4xl font-bold text-primary-600 mb-2">{pkg.price}</div>
                    <div className="text-gray-600 mb-4">{pkg.timeline}</div>
                    <p className="text-gray-600">{pkg.description}</p>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">What's Included:</h4>
                    <ul className="space-y-3">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-gray-700">
                          <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Ideal For:</h5>
                      <p className="text-sm text-gray-600">{pkg.ideal}</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Technologies:</h5>
                      <div className="flex flex-wrap gap-2">
                        {pkg.technologies.map((tech, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/contact"
                    className={`w-full block text-center py-4 rounded-lg font-semibold transition-colors ${
                      pkg.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pkg.cta}
                  </Link>
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
                Our Startup Development Process
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                A lean, agile process designed specifically for startups who need to move fast 
                without compromising quality.
              </motion.p>
            </div>

            <div className="space-y-8">
              {developmentProcess.map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start space-x-6">
                    <div className="bg-primary-600 text-white rounded-xl px-4 py-2 font-bold text-lg flex-shrink-0">
                      Week {phase.week}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {phase.phase}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {phase.description}
                      </p>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Key Activities:</h4>
                          <ul className="space-y-2">
                            {phase.activities.map((activity, idx) => (
                              <li key={idx} className="flex items-center text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 flex-shrink-0" />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Deliverables:</h4>
                          <ul className="space-y-2">
                            {phase.deliverables.map((deliverable, idx) => (
                              <li key={idx} className="flex items-center text-sm text-gray-600">
                                <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                {deliverable}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
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
                Startup Success Stories
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Real startups, real success stories. See how we've helped founders 
                go from idea to funded startup.
              </motion.p>
            </div>

            <div className="space-y-12">
              {successStories.map((story, index) => (
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
                          {story.industry}
                        </div>
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          {story.stage}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{story.startup}</h3>
                      <div className="space-y-4 mb-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Challenge:</h4>
                          <p className="text-gray-600">{story.challenge}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Solution:</h4>
                          <p className="text-gray-600">{story.solution}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <UserGroupIcon className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-gray-700 italic">"{story.founder.quote}"</p>
                          <div className="mt-2">
                            <div className="font-semibold text-gray-900">{story.founder.name}</div>
                            <div className="text-sm text-gray-600">{story.founder.role}, {story.startup}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Results Achieved:</h4>
                      <div className="space-y-4 mb-6">
                        {Object.entries(story.results).map(([key, value], idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <div className="text-lg font-bold text-primary-600 mb-1">{value}</div>
                            <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Tech Stack:</h5>
                        <div className="flex flex-wrap gap-2">
                          {story.technologies.map((tech, idx) => (
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

        {/* Startup Services */}
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
                Complete Startup Support
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Beyond development, we provide comprehensive support to help your startup succeed 
                at every stage of growth.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {startupServices.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-8 text-center hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <service.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {service.description}
                  </p>
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
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
                What Startup Founders Say
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Trusted by founders who've successfully raised funding and scaled their startups.
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
                      Result: {testimonial.results}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                      <p className="text-gray-500 text-sm">{testimonial.startup}</p>
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
                Ready to Launch Your Startup?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Join 200+ successful startups who chose Zoptal to bring their vision to life. 
                Let's build your MVP and get you funded.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <span>Start Your MVP Today</span>
                  <SparklesIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-primary-700 text-white px-8 py-4 rounded-lg hover:bg-primary-800 transition-all font-semibold border border-primary-500"
                >
                  <span>Schedule Free Consultation</span>
                  <PhoneIcon className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </MainLayout>
    </>
  );
}