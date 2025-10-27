import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  BugAntIcon,
  ShieldCheckIcon,
  BoltIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'Quality Assurance & Testing Services | Zoptal - QA Automation & Testing',
  description: 'Professional QA and testing services including automated testing, performance testing, security testing, and manual testing for superior software quality.',
  keywords: ['quality assurance', 'software testing', 'QA automation', 'performance testing', 'security testing', 'manual testing'],
  openGraph: {
    title: 'Quality Assurance & Testing Services | Zoptal',
    description: 'Professional QA and testing services with automation, performance, and security testing.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: BugAntIcon,
    title: 'Automated Testing',
    description: 'Comprehensive automated test suites for regression, unit, and integration testing.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Security Testing',
    description: 'Vulnerability assessments, penetration testing, and security compliance validation.'
  },
  {
    icon: BoltIcon,
    title: 'Performance Testing',
    description: 'Load testing, stress testing, and performance optimization for scalable applications.'
  },
  {
    icon: MagnifyingGlassIcon,
    title: 'Manual Testing',
    description: 'Exploratory testing, usability testing, and comprehensive quality validation.'
  }
];

const services = [
  {
    title: 'Test Automation',
    description: 'Automated testing frameworks and continuous testing pipelines',
    href: '/services/quality-assurance/automation',
    features: ['Selenium/Cypress', 'API Testing', 'CI/CD Integration']
  },
  {
    title: 'Performance Testing',
    description: 'Load testing and performance optimization for high-traffic applications',
    href: '/services/quality-assurance/performance',
    features: ['Load Testing', 'Stress Testing', 'Performance Monitoring']
  },
  {
    title: 'Security Testing',
    description: 'Comprehensive security assessments and vulnerability testing',
    href: '/services/quality-assurance/security',
    features: ['Penetration Testing', 'OWASP Compliance', 'Security Audits']
  }
];

const technologies = [
  'Selenium', 'Cypress', 'Jest', 'Playwright', 'JMeter', 'LoadRunner', 'Postman', 'SoapUI',
  'TestNG', 'JUnit', 'Mocha', 'OWASP ZAP', 'Burp Suite', 'Jenkins', 'GitHub Actions', 'Docker'
];

const process = [
  {
    step: 1,
    title: 'Test Strategy Planning',
    description: 'Analyzing requirements, defining test scope, and creating comprehensive test strategy',
    duration: '1 week'
  },
  {
    step: 2,
    title: 'Test Design & Development',
    description: 'Creating test cases, automation scripts, and setting up testing environments',
    duration: '2-3 weeks'
  },
  {
    step: 3,
    title: 'Test Execution',
    description: 'Running automated and manual tests, performance testing, and security assessments',
    duration: '2-4 weeks'
  },
  {
    step: 4,
    title: 'Reporting & Optimization',
    description: 'Detailed reporting, defect tracking, and continuous improvement of test processes',
    duration: 'Ongoing'
  }
];

const packages = [
  {
    name: 'Basic QA',
    price: '$6,000',
    description: 'Essential QA testing for small applications and startups',
    features: [
      'Manual testing',
      'Basic automation setup',
      'Functional testing',
      'Bug reporting & tracking',
      'Test documentation',
      '3 months support'
    ],
    highlight: false
  },
  {
    name: 'Professional QA',
    price: '$18,000',
    description: 'Comprehensive QA solution for growing businesses',
    features: [
      'Automated testing suite',
      'Performance testing',
      'API testing',
      'Cross-browser testing',
      'Mobile testing',
      'Security testing basics',
      'CI/CD integration',
      '6 months support'
    ],
    highlight: true
  },
  {
    name: 'Enterprise QA',
    price: 'Custom Quote',
    description: 'Full-scale QA solution with advanced testing capabilities',
    features: [
      'Complete test automation framework',
      'Advanced performance testing',
      'Comprehensive security testing',
      'Accessibility testing',
      'Load balancing & scalability testing',
      'Custom testing tools',
      'Dedicated QA team',
      '12 months support'
    ],
    highlight: false
  }
];

export default function QualityAssurancePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-600/20 backdrop-blur-sm text-emerald-200 text-sm font-medium mb-6">
                <BugAntIcon className="h-4 w-4 mr-2" />
                Quality Assurance & Testing
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Ensure Perfect
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent block">
                  Software Quality
                </span>
              </h1>
              
              <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
                Deliver flawless software with our comprehensive QA and testing services. 
                From automated testing to security assessments, we ensure your applications 
                meet the highest quality standards and exceed user expectations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Start Quality Testing
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Test Results
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                <OptimizedImage
                  src="/images/services/quality-assurance.webp"
                  alt="Quality Assurance & Testing Services"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our QA & Testing Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive testing strategies that ensure your software performs flawlessly across all scenarios
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Quality Assurance Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete testing solutions covering all aspects of software quality and performance
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                
                <div className="space-y-3 mb-8">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-emerald-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href={service.href}
                  className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                >
                  Learn More
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Testing Tools & Technologies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced testing tools and frameworks for comprehensive quality assurance
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-full hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our QA Testing Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Systematic approach ensuring thorough testing and superior software quality
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="flex items-center text-sm text-emerald-600 font-medium">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {step.duration}
                  </div>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-emerald-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              QA Testing Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right testing solution for your quality assurance needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${pkg.highlight ? 'ring-2 ring-emerald-500 scale-105' : ''}`}>
                {pkg.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold text-emerald-600 mb-4">{pkg.price}</div>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    pkg.highlight 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
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
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Ensure Perfect Quality?
          </h2>
          
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join 700+ companies that trust Zoptal for comprehensive QA testing. 
            Reduce bugs by 95% and improve user satisfaction with our quality assurance expertise.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Quality Testing
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-8 py-4 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}