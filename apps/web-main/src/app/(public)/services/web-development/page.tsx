import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  GlobeAltIcon,
  CodeBracketSquareIcon,
  DevicePhoneMobileIcon,
  ShoppingCartIcon,
  ServerIcon,
  CloudIcon,
  CheckIcon,
  ArrowRightIcon,
  BoltIcon,
  CubeTransparentIcon,
  ChartBarIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'Web Development Services | Full-Stack Web Applications | Zoptal',
  description: 'Professional web development services including responsive websites, progressive web apps, e-commerce platforms, and enterprise web applications. Modern tech stack with React, Next.js, and more.',
  keywords: ['web development', 'full-stack development', 'React development', 'Next.js', 'web applications', 'responsive websites', 'PWA development'],
  openGraph: {
    title: 'Web Development Services | Zoptal',
    description: 'Build modern, scalable web applications with our expert full-stack development team.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: DevicePhoneMobileIcon,
    title: 'Responsive Design',
    description: 'Mobile-first, responsive websites that look perfect on all devices and screen sizes.'
  },
  {
    icon: BoltIcon,
    title: 'Lightning Fast',
    description: 'Optimized for performance with fast load times and smooth user experiences.'
  },
  {
    icon: ShoppingCartIcon,
    title: 'E-commerce Ready',
    description: 'Full-featured online stores with secure payment processing and inventory management.'
  },
  {
    icon: CloudIcon,
    title: 'Cloud Native',
    description: 'Scalable cloud architecture built for growth and high availability.'
  }
];

const services = [
  {
    title: 'Corporate Websites',
    description: 'Professional websites that represent your brand and convert visitors',
    href: '/services/web-development/corporate',
    features: ['SEO Optimized', 'CMS Integration', 'Analytics Dashboard', 'Lead Generation Forms']
  },
  {
    title: 'Web Applications',
    description: 'Complex web apps with real-time features and interactive interfaces',
    href: '/services/web-development/applications',
    features: ['Single Page Apps', 'Real-time Updates', 'User Dashboards', 'API Integration']
  },
  {
    title: 'E-commerce Platforms',
    description: 'Complete online stores with payment, shipping, and inventory',
    href: '/services/web-development/ecommerce',
    features: ['Shopping Cart', 'Payment Gateway', 'Product Management', 'Order Tracking']
  }
];

const technologies = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'TypeScript', 'Node.js', 
  'Express', 'NestJS', 'GraphQL', 'PostgreSQL', 'MongoDB', 'Tailwind CSS'
];

const packages = [
  {
    name: 'Starter Website',
    price: '$2,500',
    duration: 'one-time',
    description: 'Perfect for small businesses and startups',
    features: [
      'Up to 10 Pages',
      'Responsive Design',
      'Contact Forms',
      'SEO Setup',
      'CMS Integration',
      '3 Months Support'
    ],
    cta: { text: 'Get Started', href: '/contact?package=web-starter' }
  },
  {
    name: 'Professional Web App',
    price: '$10,000',
    duration: 'starting at',
    description: 'Full-featured web applications',
    features: [
      'Custom Web Application',
      'User Authentication',
      'Database Integration',
      'API Development',
      'Admin Dashboard',
      'Real-time Features',
      '6 Months Support',
      'Monthly Maintenance'
    ],
    popular: true,
    cta: { text: 'Start Project', href: '/contact?package=web-professional' }
  },
  {
    name: 'Enterprise Platform',
    price: 'Custom',
    duration: 'pricing',
    description: 'Large-scale enterprise web solutions',
    features: [
      'Custom Architecture',
      'Microservices',
      'Load Balancing',
      'High Availability',
      'Security Compliance',
      'Dedicated Team',
      '24/7 Support',
      'SLA Guarantee'
    ],
    cta: { text: 'Contact Sales', href: '/contact?package=web-enterprise' }
  }
];

const process = [
  { step: 1, title: 'Requirements Analysis', description: 'Understanding your business goals and technical needs', duration: '1 week' },
  { step: 2, title: 'Design & Prototyping', description: 'Creating wireframes and interactive prototypes', duration: '2 weeks' },
  { step: 3, title: 'Development', description: 'Building your web solution with clean, maintainable code', duration: '4-8 weeks' },
  { step: 4, title: 'Testing & QA', description: 'Comprehensive testing across browsers and devices', duration: '1 week' },
  { step: 5, title: 'Deployment', description: 'Launching your website with proper hosting setup', duration: '3 days' },
  { step: 6, title: 'Support & Maintenance', description: 'Ongoing support and regular updates', duration: 'Ongoing' }
];

export default function WebDevelopmentPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 backdrop-blur-sm text-blue-200 text-sm font-medium mb-6">
                <GlobeAltIcon className="h-4 w-4 mr-2" />
                Web Development Services
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Build Stunning
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block">
                  Web Experiences
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Create powerful web applications and websites that engage users and drive results. 
                From responsive designs to complex web apps, we bring your digital vision to life 
                with modern technologies and best practices.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start Your Project
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white/20 transition-all duration-200 border border-white/20"
                >
                  View Portfolio
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <p className="text-3xl font-bold text-white">500+</p>
                  <p className="text-blue-200 text-sm">Projects Delivered</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">99%</p>
                  <p className="text-blue-200 text-sm">Client Satisfaction</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">3x</p>
                  <p className="text-blue-200 text-sm">Faster Development</p>
                </div>
              </div>
            </div>
            
            <div className="relative lg:pl-8">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-cyan-600/20" />
                <OptimizedImage
                  src="/images/services/web-development-hero.jpg"
                  alt="Web Development Services"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-4 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <CodeBracketSquareIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Modern Stack</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">React & Next.js</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Web Development Excellence
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Building web solutions that combine beautiful design with powerful functionality
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Web Solutions We Create
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              From simple websites to complex web applications, we've got you covered
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href={service.href}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Learn More
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Technologies We Use
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Modern tech stack for modern web solutions
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-700 dark:text-gray-300 hover:shadow-lg transition-shadow"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Development Process
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A proven methodology that ensures project success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {process.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {item.step}
                    </div>
                    <span className="text-sm text-blue-600 font-medium">{item.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRightIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Web Development Packages
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Transparent pricing for every budget and project size
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg ${
                  pkg.popular ? 'ring-2 ring-blue-600 scale-105' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{pkg.price}</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">{pkg.duration}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {pkg.description}
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href={pkg.cta.href}
                    className={`block text-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
                    }`}
                  >
                    {pkg.cta.text}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-indigo-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build Your Web Presence?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Let's create something amazing together. Start your web project today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-blue-900 font-semibold hover:bg-gray-100 transition-all duration-200"
            >
              Get Free Quote
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-blue-800 text-white font-semibold hover:bg-blue-700 transition-all duration-200"
            >
              View Our Work
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}