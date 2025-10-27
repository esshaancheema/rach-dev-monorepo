import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  DevicePhoneMobileIcon,
  CommandLineIcon,
  PaintBrushIcon,
  CloudIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'Mobile App Development | Zoptal - iOS & Android Solutions',
  description: 'Expert mobile app development for iOS and Android. React Native, Flutter, and native development with cutting-edge features and seamless user experiences.',
  keywords: ['mobile app development', 'iOS development', 'Android development', 'React Native', 'Flutter', 'cross-platform'],
  openGraph: {
    title: 'Mobile App Development | Zoptal',
    description: 'Expert mobile app development for iOS and Android with cutting-edge features and seamless user experiences.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: DevicePhoneMobileIcon,
    title: 'Cross-Platform Development',
    description: 'Build once, deploy everywhere with React Native and Flutter for iOS and Android.'
  },
  {
    icon: CommandLineIcon,
    title: 'Native Performance',
    description: 'Optimized code and native modules for lightning-fast app performance.'
  },
  {
    icon: PaintBrushIcon,
    title: 'UI/UX Excellence',
    description: 'Beautiful, intuitive interfaces following platform-specific design guidelines.'
  },
  {
    icon: CloudIcon,
    title: 'Cloud Integration',
    description: 'Seamless backend integration with real-time sync and offline capabilities.'
  }
];

const services = [
  {
    title: 'iOS App Development',
    description: 'Native iOS apps using Swift and SwiftUI for optimal performance',
    href: '/services/mobile-development/ios',
    features: ['Native Swift Development', 'App Store Optimization', 'iOS Design Guidelines']
  },
  {
    title: 'Android App Development',
    description: 'High-performance Android apps with Kotlin and modern architecture',
    href: '/services/mobile-development/android',
    features: ['Kotlin Development', 'Material Design', 'Google Play Store']
  },
  {
    title: 'Cross-Platform Apps',
    description: 'React Native and Flutter apps for maximum reach and efficiency',
    href: '/services/mobile-development/cross-platform',
    features: ['React Native', 'Flutter Framework', 'Code Reusability']
  }
];

const technologies = [
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Dart', 'TypeScript', 'Firebase', 'AWS Mobile',
  'GraphQL', 'Redux', 'MobX', 'Expo', 'Xcode', 'Android Studio', 'TestFlight', 'Google Play'
];

const process = [
  {
    step: 1,
    title: 'Discovery & Planning',
    description: 'Understanding your app requirements, target audience, and technical specifications',
    duration: '1-2 weeks'
  },
  {
    step: 2,
    title: 'Design & Prototyping',
    description: 'Creating wireframes, UI/UX designs, and interactive prototypes',
    duration: '2-3 weeks'
  },
  {
    step: 3,
    title: 'Development & Testing',
    description: 'Building the app with continuous testing and quality assurance',
    duration: '8-12 weeks'
  },
  {
    step: 4,
    title: 'Launch & Support',
    description: 'App store deployment, monitoring, and ongoing maintenance',
    duration: 'Ongoing'
  }
];

const packages = [
  {
    name: 'MVP Package',
    price: '$15,000',
    description: 'Perfect for startups and initial product validation',
    features: [
      'Cross-platform development (iOS & Android)',
      'Core features implementation',
      'Basic UI/UX design',
      'App store submission',
      '3 months support',
      'Analytics integration'
    ],
    highlight: false
  },
  {
    name: 'Business Package',
    price: '$35,000',
    description: 'Comprehensive solution for growing businesses',
    features: [
      'Native iOS & Android development',
      'Advanced features & integrations',
      'Custom UI/UX design',
      'Backend API development',
      'Push notifications',
      'Payment integration',
      'Admin dashboard',
      '6 months support'
    ],
    highlight: true
  },
  {
    name: 'Enterprise Package',
    price: 'Custom Quote',
    description: 'Full-scale solution with enterprise features',
    features: [
      'Multi-platform deployment',
      'Enterprise security features',
      'Advanced analytics & reporting',
      'Third-party integrations',
      'White-label solutions',
      'Dedicated team',
      '12 months support',
      'Priority maintenance'
    ],
    highlight: false
  }
];

export default function MobileDevelopmentPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-teal-800 to-blue-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-600/20 backdrop-blur-sm text-green-200 text-sm font-medium mb-6">
                <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
                Mobile App Development
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Mobile Apps That
                <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent block">
                  Users Love
                </span>
              </h1>
              
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Create stunning mobile experiences for iOS and Android. Our expert team 
                delivers high-performance apps with beautiful designs, seamless functionality, 
                and cutting-edge features that engage users and drive growth.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Your App Project
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View App Demos
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                <OptimizedImage
                  src="/images/services/mobile-development.webp"
                  alt="Mobile App Development"
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
              Why Choose Our Mobile Development Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We create mobile apps that deliver exceptional user experiences and drive business results
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-green-600 group-hover:text-white transition-colors" />
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
              Our Mobile Development Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive mobile solutions for every platform and business need
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
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href={service.href}
                  className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors"
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
              Mobile Technologies We Use
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Latest frameworks and tools for cutting-edge mobile app development
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-full hover:bg-green-100 hover:text-green-800 transition-colors"
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
              Our Mobile Development Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A proven methodology that ensures successful app delivery from concept to launch
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {step.duration}
                  </div>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-green-200" />
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
              Mobile Development Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect package for your mobile app project
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${pkg.highlight ? 'ring-2 ring-green-500 scale-105' : ''}`}>
                {pkg.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold text-green-600 mb-4">{pkg.price}</div>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    pkg.highlight 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
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
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Launch Your Mobile App?
          </h2>
          
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join 1000+ businesses that chose Zoptal for their mobile app development. 
            Let's bring your app idea to life and reach millions of users.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Project
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}