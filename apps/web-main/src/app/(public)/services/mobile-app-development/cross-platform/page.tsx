import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, DevicePhoneMobileIcon, ShieldCheckIcon, RocketLaunchIcon, CogIcon, StarIcon, ChartBarIcon, UserGroupIcon, CheckIcon, PhoneIcon, CommandLineIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { keywordsByCategory } from '@/lib/seo/keywords';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Cross-Platform App Development | React Native & Flutter | Zoptal',
  description: 'Professional cross-platform mobile app development services using React Native, Flutter, and Xamarin. Build once, deploy everywhere with native performance.',
  keywords: [
    ...keywordsByCategory.services,
    'cross-platform app development',
    'React Native development',
    'Flutter development',
    'Xamarin development',
    'hybrid mobile apps',
    'multi-platform development',
    'mobile app development',
    'iOS Android development',
    'cross-platform solutions',
    'native performance',
    'code sharing',
    'mobile framework',
    'app development services',
    'hybrid app development'
  ],
  openGraph: {
    title: 'Cross-Platform App Development Services | Zoptal',
    description: 'Professional cross-platform mobile app development using React Native, Flutter, and Xamarin. Build once, deploy everywhere.',
    type: 'website',
    url: 'https://zoptal.com/services/mobile-app-development/cross-platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cross-Platform App Development Services | Zoptal',
    description: 'Professional cross-platform mobile app development using React Native, Flutter, and Xamarin. Build once, deploy everywhere.',
  },
  alternates: {
    canonical: 'https://zoptal.com/services/mobile-app-development/cross-platform',
  },
};

export default function CrossPlatformAppDevelopmentPage() {
  const serviceSchema = generateServiceSchema({
    name: 'Cross-Platform App Development Services',
    description: 'Professional cross-platform mobile app development services using React Native, Flutter, and Xamarin frameworks.',
    provider: 'Zoptal',
    areaServed: 'Global',
    serviceType: 'Mobile App Development',
    url: 'https://zoptal.com/services/mobile-app-development/cross-platform',
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Services', url: 'https://zoptal.com/services' },
      { name: 'Mobile App Development', url: 'https://zoptal.com/services/mobile-app-development' },
      { name: 'Cross-Platform Development', url: 'https://zoptal.com/services/mobile-app-development/cross-platform' },
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
                Cross-Platform Development
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Cross-Platform App Development
              </h1>
              <p className="text-xl sm:text-2xl text-purple-100 mb-8 leading-relaxed">
                Build once, deploy everywhere. Create high-performance mobile applications for iOS and Android using React Native, Flutter, and other cutting-edge cross-platform frameworks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-purple-50 transition-colors duration-300 text-center"
                >
                  Start Your Cross-Platform Project
                </Link>
                <Link
                  href="/portfolio"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors duration-300 text-center"
                >
                  View Portfolio
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-purple-200 mb-2">60%</div>
                  <div className="text-white font-semibold mb-1">Cost Savings</div>
                  <div className="text-purple-200 text-sm">vs native development</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-purple-200 mb-2">50%</div>
                  <div className="text-white font-semibold mb-1">Faster Development</div>
                  <div className="text-purple-200 text-sm">Time to market</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-purple-200 mb-2">95%</div>
                  <div className="text-white font-semibold mb-1">Code Reusability</div>
                  <div className="text-purple-200 text-sm">Shared codebase</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-purple-200 mb-2">300+</div>
                  <div className="text-white font-semibold mb-1">Apps Delivered</div>
                  <div className="text-purple-200 text-sm">Cross-platform projects</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-Platform Advantages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Cross-Platform Development?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Maximize your reach while minimizing development costs and time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: GlobeAltIcon,
                title: 'Broader Market Reach',
                description: 'Deploy to both iOS and Android simultaneously, reaching maximum audience.'
              },
              {
                icon: ChartBarIcon,
                title: 'Cost Efficiency',
                description: 'Reduce development costs by up to 60% compared to native app development.'
              },
              {
                icon: RocketLaunchIcon,
                title: 'Faster Time-to-Market',
                description: 'Launch your app 50% faster with shared codebase and unified development.'
              },
              {
                icon: CogIcon,
                title: 'Easier Maintenance',
                description: 'Maintain one codebase instead of separate iOS and Android applications.'
              }
            ].map((advantage, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <advantage.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{advantage.title}</h3>
                <p className="text-gray-600">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Platform Frameworks */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Cross-Platform Frameworks We Master
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leading cross-platform technologies for modern mobile app development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'React Native',
                description: 'Facebook\'s popular framework for building native mobile apps using React and JavaScript.',
                features: [
                  'JavaScript/TypeScript',
                  'Hot reloading',
                  'Native performance',
                  'Large community',
                  'Rich ecosystem'
                ],
                useCases: ['Social media apps', 'E-commerce platforms', 'Entertainment apps'],
                companies: ['Facebook', 'Instagram', 'Uber Eats'],
                logo: '⚛️'
              },
              {
                name: 'Flutter',
                description: 'Google\'s UI toolkit for building beautiful, natively compiled applications from a single codebase.',
                features: [
                  'Dart programming',
                  'Hot reload',
                  'Custom widgets',
                  'High performance',
                  'Beautiful UI'
                ],
                useCases: ['Fintech apps', 'E-commerce', 'Productivity tools'],
                companies: ['Google Pay', 'Alibaba', 'BMW'],
                logo: '🦋'
              },
              {
                name: 'Xamarin',
                description: 'Microsoft\'s platform for building native mobile apps using C# and .NET framework.',
                features: [
                  'C# development',
                  'Native APIs',
                  '.NET ecosystem',
                  'Enterprise ready',
                  'Cloud integration'
                ],
                useCases: ['Enterprise apps', 'Business tools', 'Healthcare apps'],
                companies: ['Microsoft', 'JetBlue', 'Honeywell'],
                logo: '🔷'
              }
            ].map((framework, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">{framework.logo}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{framework.name}</h3>
                  <p className="text-gray-600">{framework.description}</p>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {framework.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-700">
                        <CheckIcon className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Best For:</h4>
                  <ul className="space-y-1">
                    {framework.useCases.map((useCase, caseIndex) => (
                      <li key={caseIndex} className="text-gray-600 text-sm">• {useCase}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Used By:</h4>
                  <div className="flex flex-wrap gap-2">
                    {framework.companies.map((company, companyIndex) => (
                      <span key={companyIndex} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Platform Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Cross-Platform Development Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive cross-platform solutions for every business need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'React Native Development',
                description: 'Build high-performance mobile apps using React Native with native look and feel.',
                features: [
                  'JavaScript/TypeScript development',
                  'Native module integration',
                  'Redux state management',
                  'GraphQL/REST API integration',
                  'Push notifications'
                ],
                icon: CommandLineIcon
              },
              {
                title: 'Flutter Development',
                description: 'Create beautiful, fast mobile applications with Google\'s Flutter framework.',
                features: [
                  'Dart programming language',
                  'Custom widget development',
                  'BLoC pattern implementation',
                  'Firebase integration',
                  'Material Design compliance'
                ],
                icon: DevicePhoneMobileIcon
              },
              {
                title: 'Xamarin Development',
                description: 'Enterprise-grade cross-platform apps using Microsoft\'s Xamarin platform.',
                features: [
                  'C# and .NET development',
                  'MVVM architecture',
                  'Azure cloud integration',
                  'Enterprise security',
                  'Offline data sync'
                ],
                icon: ShieldCheckIcon
              },
              {
                title: 'Progressive Web Apps (PWA)',
                description: 'Web applications that work like native mobile apps with offline capabilities.',
                features: [
                  'Service worker implementation',
                  'Offline functionality',
                  'Push notifications',
                  'App-like experience',
                  'Cross-platform compatibility'
                ],
                icon: GlobeAltIcon
              },
              {
                title: 'Hybrid App Migration',
                description: 'Migrate existing native apps to cross-platform frameworks for better maintainability.',
                features: [
                  'Code analysis and planning',
                  'Gradual migration strategy',
                  'Performance optimization',
                  'Feature parity maintenance',
                  'Testing and validation'
                ],
                icon: RocketLaunchIcon
              },
              {
                title: 'Cross-Platform Consulting',
                description: 'Expert guidance on choosing the right cross-platform strategy for your project.',
                features: [
                  'Technology assessment',
                  'Architecture planning',
                  'Performance analysis',
                  'Cost-benefit evaluation',
                  'Implementation roadmap'
                ],
                icon: UserGroupIcon
              }
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <service.icon className="w-6 h-6 text-purple-600" />
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
              Cross-Platform Development Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamlined approach to deliver high-quality cross-platform applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Platform Analysis',
                description: 'Evaluate requirements and choose the optimal cross-platform framework for your project.',
                icon: ChartBarIcon
              },
              {
                step: '02',
                title: 'Architecture Design',
                description: 'Design scalable architecture that maximizes code sharing while maintaining performance.',
                icon: CogIcon
              },
              {
                step: '03',
                title: 'Development & Testing',
                description: 'Agile development with continuous testing on both iOS and Android platforms.',
                icon: CommandLineIcon
              },
              {
                step: '04',
                title: 'Deployment & Support',
                description: 'Simultaneous deployment to both app stores with ongoing maintenance and updates.',
                icon: RocketLaunchIcon
              }
            ].map((process, index) => (
              <div key={index} className="text-center bg-white rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {process.step}
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <process.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{process.title}</h3>
                <p className="text-gray-600">{process.description}</p>
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
              Cross-Platform Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real results from our cross-platform development projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'E-Learning Platform',
                framework: 'React Native',
                description: 'Cross-platform educational app with video streaming, interactive quizzes, and offline content.',
                results: [
                  '1.5M+ students enrolled',
                  '4.7★ average rating',
                  '60% development cost savings'
                ],
                technologies: ['React Native', 'Redux', 'Video.js', 'Firebase']
              },
              {
                title: 'Fintech Mobile App',
                framework: 'Flutter',
                description: 'Secure financial application with biometric authentication and real-time transactions.',
                results: [
                  '500K+ active users',
                  '99.9% uptime',
                  '40% faster development'
                ],
                technologies: ['Flutter', 'Dart', 'Firebase Auth', 'Stripe']
              },
              {
                title: 'Enterprise CRM',
                framework: 'Xamarin',
                description: 'Enterprise customer relationship management app with offline sync and reporting.',
                results: [
                  '10K+ business users',
                  '95% user satisfaction',
                  '50% maintenance reduction'
                ],
                technologies: ['Xamarin', 'Azure', 'SQLite', 'Power BI']
              }
            ].map((study, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="text-sm text-purple-600 font-semibold mb-2">{study.framework}</div>
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
                      <span key={techIndex} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
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

      {/* Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Native vs Cross-Platform Comparison
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding the trade-offs to make the right choice for your project
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Factor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Native Development
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cross-Platform
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    {
                      factor: 'Development Cost',
                      native: 'Higher (2 separate codebases)',
                      crossPlatform: 'Lower (shared codebase)'
                    },
                    {
                      factor: 'Time to Market',
                      native: 'Slower (parallel development)',
                      crossPlatform: 'Faster (single development)'
                    },
                    {
                      factor: 'Performance',
                      native: 'Optimal (platform-specific)',
                      crossPlatform: 'Near-native (95-98%)'
                    },
                    {
                      factor: 'UI/UX',
                      native: 'Platform-native feel',
                      crossPlatform: 'Consistent across platforms'
                    },
                    {
                      factor: 'Maintenance',
                      native: 'Complex (2 codebases)',
                      crossPlatform: 'Simpler (1 codebase)'
                    },
                    {
                      factor: 'Access to APIs',
                      native: 'Full platform access',
                      crossPlatform: 'Most APIs + custom modules'
                    }
                  ].map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.factor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.native}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">
                        {row.crossPlatform}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Build Your Cross-Platform App?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Maximize your reach and minimize your costs with our expert cross-platform development services. Get your app on both iOS and Android faster than ever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-purple-50 transition-colors duration-300 flex items-center justify-center"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Start Your Project
            </Link>
            <Link
              href="/portfolio"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors duration-300"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}