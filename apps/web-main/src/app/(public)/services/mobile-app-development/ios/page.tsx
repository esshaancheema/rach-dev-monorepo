import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, DevicePhoneMobileIcon, ShieldCheckIcon, RocketLaunchIcon, CogIcon, StarIcon, ChartBarIcon, UserGroupIcon, CheckIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { keywordsByCategory } from '@/lib/seo/keywords';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'iOS App Development Services | iPhone & iPad Development | Zoptal',
  description: 'Professional iOS app development services for iPhone and iPad. Native Swift development, App Store optimization, and enterprise iOS solutions.',
  keywords: [
    ...keywordsByCategory.services,
    'iOS app development',
    'iPhone app development',
    'iPad app development',
    'Swift development',
    'iOS native apps',
    'Apple app development',
    'iOS mobile apps',
    'iPhone applications',
    'iOS enterprise apps',
    'App Store optimization',
    'iOS UI/UX design',
    'Core Data development',
    'ARKit development',
    'iOS security',
    'Objective-C development'
  ],
  openGraph: {
    title: 'iOS App Development Services | Zoptal',
    description: 'Professional iOS app development services for iPhone and iPad. Native Swift development with App Store optimization.',
    type: 'website',
    url: 'https://zoptal.com/services/mobile-app-development/ios',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iOS App Development Services | Zoptal',
    description: 'Professional iOS app development services for iPhone and iPad. Native Swift development with App Store optimization.',
  },
  alternates: {
    canonical: 'https://zoptal.com/services/mobile-app-development/ios',
  },
};

export default function iOSAppDevelopmentPage() {
  const serviceSchema = generateServiceSchema({
    name: 'iOS App Development Services',
    description: 'Professional iOS app development services for iPhone and iPad applications using Swift and native iOS technologies.',
    provider: 'Zoptal',
    areaServed: 'Global',
    serviceType: 'Mobile App Development',
    url: 'https://zoptal.com/services/mobile-app-development/ios',
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Services', url: 'https://zoptal.com/services' },
      { name: 'Mobile App Development', url: 'https://zoptal.com/services/mobile-app-development' },
      { name: 'iOS Development', url: 'https://zoptal.com/services/mobile-app-development/ios' },
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
                <Link href="/services/mobile-app-development" className="text-gray-500 hover:text-gray-700">
                  Mobile App Development
                </Link>
              </li>
              <li>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li className="text-gray-900 font-medium">
                iOS Development
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                iOS App Development Services
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8 leading-relaxed">
                Build exceptional iPhone and iPad applications with our expert iOS development team. Native Swift development, seamless App Store deployment, and ongoing support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 text-center"
                >
                  Start Your iOS Project
                </Link>
                <Link
                  href="/portfolio"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300 text-center"
                >
                  View iOS Apps
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">500+</div>
                  <div className="text-white font-semibold mb-1">iOS Apps Built</div>
                  <div className="text-blue-200 text-sm">Across all industries</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">98%</div>
                  <div className="text-white font-semibold mb-1">App Store Approval</div>
                  <div className="text-blue-200 text-sm">First submission</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">4.8★</div>
                  <div className="text-white font-semibold mb-1">Average Rating</div>
                  <div className="text-blue-200 text-sm">Client satisfaction</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">24/7</div>
                  <div className="text-white font-semibold mb-1">Support</div>
                  <div className="text-blue-200 text-sm">Post-launch maintenance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* iOS Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              iOS Development Expertise
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leverage the full power of iOS ecosystem with our comprehensive development services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: DevicePhoneMobileIcon,
                title: 'Native iOS Development',
                description: 'Swift and Objective-C development for optimal performance and user experience.'
              },
              {
                icon: ShieldCheckIcon,
                title: 'App Store Optimization',
                description: 'Expert guidance through App Store submission and optimization process.'
              },
              {
                icon: RocketLaunchIcon,
                title: 'Performance Optimization',
                description: 'High-performance apps with smooth animations and fast loading times.'
              },
              {
                icon: CogIcon,
                title: 'iOS Integration',
                description: 'Deep integration with iOS features like Siri, Face ID, and Apple Pay.'
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

      {/* iOS Technologies Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              iOS Technologies We Master
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge iOS technologies and frameworks for modern app development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                category: 'Programming Languages',
                technologies: ['Swift 5.0+', 'Objective-C', 'SwiftUI', 'UIKit', 'Combine Framework']
              },
              {
                category: 'Development Tools',
                technologies: ['Xcode', 'Interface Builder', 'Instruments', 'TestFlight', 'Core Data']
              },
              {
                category: 'iOS Frameworks',
                technologies: ['Foundation', 'AVFoundation', 'CoreAnimation', 'MapKit', 'CloudKit']
              },
              {
                category: 'Advanced Features',
                technologies: ['ARKit', 'CoreML', 'Vision Framework', 'Natural Language', 'RealityKit']
              },
              {
                category: 'Integration APIs',
                technologies: ['Apple Pay', 'HealthKit', 'HomeKit', 'WatchKit', 'CarPlay']
              },
              {
                category: 'Backend Services',
                technologies: ['Firebase', 'AWS Mobile', 'Parse', 'Realm Database', 'GraphQL']
              }
            ].map((tech, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{tech.category}</h3>
                <ul className="space-y-2">
                  {tech.technologies.map((technology, techIndex) => (
                    <li key={techIndex} className="flex items-center text-gray-700">
                      <CheckIcon className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      {technology}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* iOS App Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              iOS App Development Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive iOS development solutions for every business need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Native iPhone Apps',
                description: 'Custom iPhone applications built with Swift for optimal performance and user experience.',
                features: [
                  'Swift 5.0+ development',
                  'iOS 14+ compatibility',
                  'App Store optimization',
                  'Performance optimization',
                  'Security implementation'
                ],
                icon: DevicePhoneMobileIcon
              },
              {
                title: 'iPad Applications',
                description: 'iPad-specific apps that leverage the larger screen and unique capabilities of iPad devices.',
                features: [
                  'iPad-optimized UI/UX',
                  'Split view support',
                  'Apple Pencil integration',
                  'Drag and drop features',
                  'Multi-window support'
                ],
                icon: DevicePhoneMobileIcon
              },
              {
                title: 'Apple Watch Apps',
                description: 'Companion Apple Watch applications that extend your iOS app functionality.',
                features: [
                  'WatchKit development',
                  'Complication support',
                  'Health data integration',
                  'Quick interactions',
                  'Standalone watch apps'
                ],
                icon: CogIcon
              },
              {
                title: 'Enterprise iOS Apps',
                description: 'Secure, scalable iOS applications for enterprise environments and business workflows.',
                features: [
                  'MDM compatibility',
                  'Enterprise security',
                  'Custom deployment',
                  'Integration APIs',
                  'User management'
                ],
                icon: ShieldCheckIcon
              },
              {
                title: 'AR/VR iOS Apps',
                description: 'Immersive augmented and virtual reality experiences using ARKit and RealityKit.',
                features: [
                  'ARKit development',
                  'RealityKit integration',
                  '3D object tracking',
                  'Face tracking',
                  'Spatial audio'
                ],
                icon: RocketLaunchIcon
              },
              {
                title: 'Machine Learning Apps',
                description: 'AI-powered iOS applications using Core ML and advanced machine learning frameworks.',
                features: [
                  'Core ML integration',
                  'Vision framework',
                  'Natural language processing',
                  'On-device ML',
                  'Custom model training'
                ],
                icon: ChartBarIcon
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

      {/* Development Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our iOS Development Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proven methodology for delivering exceptional iOS applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Discovery & Planning',
                description: 'Requirements analysis, market research, and technical architecture planning for your iOS app.',
                icon: UserGroupIcon
              },
              {
                step: '02',
                title: 'UI/UX Design',
                description: 'iOS Human Interface Guidelines compliant design with intuitive user experience.',
                icon: DevicePhoneMobileIcon
              },
              {
                step: '03',
                title: 'Development & Testing',
                description: 'Agile Swift development with continuous testing on real iOS devices.',
                icon: CogIcon
              },
              {
                step: '04',
                title: 'App Store Launch',
                description: 'App Store submission, optimization, and post-launch support and maintenance.',
                icon: RocketLaunchIcon
              }
            ].map((process, index) => (
              <div key={index} className="text-center bg-white rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {process.step}
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <process.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{process.title}</h3>
                <p className="text-gray-600">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              iOS App Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real results from our iOS app development projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'HealthTech iOS App',
                industry: 'Healthcare',
                description: 'HIPAA-compliant iOS app for patient management and telemedicine consultations.',
                results: [
                  '500K+ downloads',
                  '4.9★ App Store rating',
                  '50% patient engagement increase'
                ],
                technologies: ['Swift', 'HealthKit', 'Core Data', 'WebRTC']
              },
              {
                title: 'FinTech Mobile Banking',
                industry: 'Finance',
                description: 'Secure iOS banking app with biometric authentication and real-time transactions.',
                results: [
                  '1M+ active users',
                  '99.9% uptime',
                  '40% faster transactions'
                ],
                technologies: ['Swift', 'Face ID', 'Apple Pay', 'CloudKit']
              },
              {
                title: 'E-commerce iOS App',
                industry: 'Retail',
                description: 'Feature-rich shopping app with AR try-on and seamless checkout experience.',
                results: [
                  '300% sales increase',
                  '2M+ app installs',
                  '85% user retention'
                ],
                technologies: ['SwiftUI', 'ARKit', 'Core ML', 'Apple Pay']
              }
            ].map((study, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="text-sm text-blue-600 font-semibold mb-2">{study.industry}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{study.title}</h3>
                <p className="text-gray-600 mb-6">{study.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Results:</h4>
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Build Your iOS App?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Transform your idea into a successful iOS application with our expert development team. From concept to App Store success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 flex items-center justify-center"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Start Your iOS Project
            </Link>
            <Link
              href="/portfolio"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300"
            >
              View iOS Portfolio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}