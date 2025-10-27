import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, DevicePhoneMobileIcon, ShieldCheckIcon, RocketLaunchIcon, CogIcon, StarIcon, ChartBarIcon, UserGroupIcon, CheckIcon, PhoneIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import { keywordsByCategory } from '@/lib/seo/keywords';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Android App Development Services | Native Android Development | Zoptal',
  description: 'Professional Android app development services using Kotlin and Java. Native Android development, Google Play optimization, and enterprise solutions.',
  keywords: [
    ...keywordsByCategory.services,
    'Android app development',
    'Android mobile apps',
    'Kotlin development',
    'Java Android development',
    'native Android apps',
    'Google Play Store',
    'Android SDK',
    'Android enterprise apps',
    'material design',
    'Android UI development',
    'Firebase integration',
    'Android testing',
    'Android security',
    'Android performance optimization'
  ],
  openGraph: {
    title: 'Android App Development Services | Zoptal',
    description: 'Professional Android app development services using Kotlin and Java. Native Android development with Google Play optimization.',
    type: 'website',
    url: 'https://zoptal.com/services/mobile-app-development/android',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Android App Development Services | Zoptal',
    description: 'Professional Android app development services using Kotlin and Java. Native Android development with Google Play optimization.',
  },
  alternates: {
    canonical: 'https://zoptal.com/services/mobile-app-development/android',
  },
};

export default function AndroidAppDevelopmentPage() {
  const serviceSchema = generateServiceSchema({
    name: 'Android App Development Services',
    description: 'Professional Android app development services using Kotlin and Java for native Android applications.',
    provider: 'Zoptal',
    areaServed: 'Global',
    serviceType: 'Mobile App Development',
    url: 'https://zoptal.com/services/mobile-app-development/android',
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Services', url: 'https://zoptal.com/services' },
      { name: 'Mobile App Development', url: 'https://zoptal.com/services/mobile-app-development' },
      { name: 'Android Development', url: 'https://zoptal.com/services/mobile-app-development/android' },
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
                Android Development
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Android App Development Services
              </h1>
              <p className="text-xl sm:text-2xl text-green-100 mb-8 leading-relaxed">
                Build powerful Android applications with our expert development team. Native Kotlin development, Material Design implementation, and seamless Google Play Store deployment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-300 text-center"
                >
                  Start Your Android Project
                </Link>
                <Link
                  href="/portfolio"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors duration-300 text-center"
                >
                  View Android Apps
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-green-200 mb-2">750+</div>
                  <div className="text-white font-semibold mb-1">Android Apps</div>
                  <div className="text-green-200 text-sm">Successfully launched</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-green-200 mb-2">3.2B+</div>
                  <div className="text-white font-semibold mb-1">Market Reach</div>
                  <div className="text-green-200 text-sm">Android devices globally</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-green-200 mb-2">4.7★</div>
                  <div className="text-white font-semibold mb-1">Play Store Rating</div>
                  <div className="text-green-200 text-sm">Average app rating</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-green-200 mb-2">99%</div>
                  <div className="text-white font-semibold mb-1">Crash-Free Rate</div>
                  <div className="text-green-200 text-sm">App stability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Android Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Android Development Expertise
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Harness the power of Android ecosystem with our comprehensive development services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: CommandLineIcon,
                title: 'Native Android Development',
                description: 'Kotlin and Java development for optimal performance and platform integration.'
              },
              {
                icon: ShieldCheckIcon,
                title: 'Google Play Optimization',
                description: 'Expert guidance through Google Play Console and ASO optimization.'
              },
              {
                icon: RocketLaunchIcon,
                title: 'Performance Excellence',
                description: 'High-performance apps with smooth animations and efficient memory usage.'
              },
              {
                icon: CogIcon,
                title: 'Android Integration',
                description: 'Deep integration with Android services, notifications, and hardware features.'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Android Technologies Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Android Technologies We Master
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Latest Android technologies and frameworks for modern app development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                category: 'Programming Languages',
                technologies: ['Kotlin', 'Java 8+', 'Coroutines', 'Jetpack Compose', 'Android KTX']
              },
              {
                category: 'Development Tools',
                technologies: ['Android Studio', 'Gradle', 'ADB', 'Proguard', 'R8 Optimizer']
              },
              {
                category: 'Android Frameworks',
                technologies: ['Android SDK', 'Support Library', 'Architecture Components', 'Data Binding', 'View Binding']
              },
              {
                category: 'Advanced Features',
                technologies: ['ML Kit', 'CameraX', 'ARCore', 'Android Auto', 'Wear OS']
              },
              {
                category: 'Architecture Patterns',
                technologies: ['MVVM', 'MVP', 'Clean Architecture', 'Repository Pattern', 'Dependency Injection']
              },
              {
                category: 'Backend Integration',
                technologies: ['Firebase', 'Retrofit', 'OkHttp', 'Room Database', 'WorkManager']
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

      {/* Android App Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Android App Development Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive Android development solutions for every business requirement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Native Android Apps',
                description: 'Custom Android applications built with Kotlin for superior performance and native user experience.',
                features: [
                  'Kotlin development',
                  'Material Design 3',
                  'Android 14 compatibility',
                  'Performance optimization',
                  'Security best practices'
                ],
                icon: DevicePhoneMobileIcon
              },
              {
                title: 'Tablet Applications',
                description: 'Android tablet apps optimized for larger screens with enhanced UI/UX and productivity features.',
                features: [
                  'Adaptive layouts',
                  'Multi-window support',
                  'Enhanced navigation',
                  'Productivity features',
                  'ChromeOS compatibility'
                ],
                icon: DevicePhoneMobileIcon
              },
              {
                title: 'Wear OS Apps',
                description: 'Android smartwatch applications with health tracking and quick interactions.',
                features: [
                  'Wear OS development',
                  'Health sensors integration',
                  'Watch face design',
                  'Standalone functionality',
                  'Phone companion sync'
                ],
                icon: CogIcon
              },
              {
                title: 'Enterprise Android Apps',
                description: 'Secure, scalable Android applications for enterprise environments with MDM support.',
                features: [
                  'Enterprise mobility',
                  'MDM compatibility',
                  'Advanced security',
                  'Single sign-on',
                  'Custom distribution'
                ],
                icon: ShieldCheckIcon
              },
              {
                title: 'Android TV Apps',
                description: 'Entertainment and media applications for Android TV and streaming devices.',
                features: [
                  'Android TV SDK',
                  'Leanback UI',
                  'Remote control support',
                  'Media streaming',
                  'Voice commands'
                ],
                icon: RocketLaunchIcon
              },
              {
                title: 'AI-Powered Apps',
                description: 'Intelligent Android applications using machine learning and AI capabilities.',
                features: [
                  'ML Kit integration',
                  'TensorFlow Lite',
                  'Computer vision',
                  'Natural language processing',
                  'On-device AI'
                ],
                icon: ChartBarIcon
              }
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <service.icon className="w-6 h-6 text-green-600" />
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
              Our Android Development Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamlined methodology for delivering high-quality Android applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Requirements & Planning',
                description: 'Comprehensive analysis of your Android app requirements and target device strategy.',
                icon: UserGroupIcon
              },
              {
                step: '02',
                title: 'UI/UX Design',
                description: 'Material Design 3 compliant interfaces with intuitive Android user experience.',
                icon: DevicePhoneMobileIcon
              },
              {
                step: '03',
                title: 'Development & Testing',
                description: 'Agile Kotlin development with comprehensive testing on multiple Android devices.',
                icon: CogIcon
              },
              {
                step: '04',
                title: 'Play Store Launch',
                description: 'Google Play Store submission, ASO optimization, and ongoing maintenance support.',
                icon: RocketLaunchIcon
              }
            ].map((process, index) => (
              <div key={index} className="text-center bg-white rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {process.step}
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <process.icon className="w-6 h-6 text-green-600" />
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
              Android App Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real results from our Android app development projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Food Delivery Android App',
                industry: 'Food & Beverage',
                description: 'Feature-rich food delivery app with real-time tracking and payment integration.',
                results: [
                  '2M+ downloads',
                  '4.6★ Play Store rating',
                  '65% user retention rate'
                ],
                technologies: ['Kotlin', 'Google Maps', 'Firebase', 'Stripe']
              },
              {
                title: 'Fitness Tracking App',
                industry: 'Health & Fitness',
                description: 'Comprehensive fitness app with workout tracking, nutrition plans, and social features.',
                results: [
                  '800K+ active users',
                  '4.8★ user rating',
                  '40% improvement in user engagement'
                ],
                technologies: ['Kotlin', 'Room Database', 'Health Connect', 'ML Kit']
              },
              {
                title: 'Enterprise Communication',
                industry: 'Enterprise',
                description: 'Secure enterprise messaging app with file sharing and video conferencing.',
                results: [
                  '50K+ business users',
                  '99.9% uptime',
                  '80% reduction in email volume'
                ],
                technologies: ['Kotlin', 'WebRTC', 'Encryption', 'MDM']
              }
            ].map((study, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="text-sm text-green-600 font-semibold mb-2">{study.industry}</div>
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
                      <span key={techIndex} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
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

      {/* Android vs iOS Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Android Development?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Android offers unique advantages for mobile app development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Global Market Share',
                value: '71%',
                description: 'of worldwide mobile OS market',
                icon: ChartBarIcon
              },
              {
                title: 'Device Variety',
                value: '24K+',
                description: 'different Android device models',
                icon: DevicePhoneMobileIcon
              },
              {
                title: 'Google Play Store',
                value: '2.9M+',
                description: 'apps available for download',
                icon: RocketLaunchIcon
              },
              {
                title: 'Open Ecosystem',
                value: '100%',
                description: 'customizable and flexible platform',
                icon: CogIcon
              }
            ].map((advantage, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <advantage.icon className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">{advantage.value}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{advantage.title}</h3>
                <p className="text-gray-600 text-sm">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Build Your Android App?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Transform your app idea into a successful Android application with our expert development team. From concept to Google Play Store success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-300 flex items-center justify-center"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Start Your Android Project
            </Link>
            <Link
              href="/portfolio"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors duration-300"
            >
              View Android Portfolio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}