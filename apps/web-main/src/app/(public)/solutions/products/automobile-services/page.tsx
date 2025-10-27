import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  WrenchScrewdriverIcon,
  MapPinIcon,
  TruckIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  UserGroupIcon,
  GlobeAltIcon,
  BellAlertIcon,
  DocumentCheckIcon,
  RocketLaunchIcon,
  DevicePhoneMobileIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  CubeTransparentIcon,
  SparklesIcon,
  WrenchIcon
} from '@heroicons/react/24/outline';
import AutomobileServicesHeroImage from '@/components/AutomobileServicesHeroImage';

export const metadata: Metadata = {
  title: 'On-Demand Automobile Services Platform | Roadside Assistance & Car Care | Zoptal',
  description: 'Launch your auto services platform in 60 days. Complete roadside assistance, mobile car repair, and automotive marketplace. Investment from $30K-80K.',
  keywords: [
    'automobile services platform',
    'roadside assistance app',
    'mobile car repair software',
    'auto services marketplace',
    'vehicle maintenance platform',
    'car care management system',
    'automotive service platform',
    'emergency roadside app',
    'mobile mechanic platform',
    'auto repair booking system',
    'vehicle services app',
    'car maintenance software',
    'automotive marketplace platform',
    'roadside emergency services',
    'on-demand auto services'
  ],
  openGraph: {
    title: 'On-Demand Automobile Services Platform | Zoptal',
    description: 'Launch your auto services platform in 60 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: ExclamationTriangleIcon,
    title: 'Emergency Dispatch System',
    description: 'GPS-based emergency response with real-time tracking and <30 minute average response times.'
  },
  {
    icon: MapPinIcon,
    title: 'Real-Time Service Tracking',
    description: 'Live technician location tracking with ETA updates and service progress notifications.'
  },
  {
    icon: WrenchScrewdriverIcon,
    title: 'Mobile Service Management',
    description: 'Complete mobile car care booking with scheduling, inventory, and payment processing.'
  },
  {
    icon: ClockIcon,
    title: '60-Day Launch Timeline',
    description: 'Complete automobile services platform ready to launch in 45-90 days with full feature set.'
  }
];

const platformTypes = [
  {
    title: 'Customer Service Platform',
    description: 'On-demand roadside assistance and car care',
    icon: DevicePhoneMobileIcon,
    features: [
      'Emergency roadside assistance booking',
      'Scheduled maintenance appointments', 
      'Real-time service tracking and updates',
      'Mobile car wash and detailing booking',
      'Vehicle diagnostic reports and history',
      'Insurance integration and claims support',
      'Multiple payment options and digital receipts',
      'Service provider ratings and reviews'
    ]
  },
  {
    title: 'Service Provider Management',
    description: 'Complete operations and fleet management',
    icon: TruckIcon,
    features: [
      'Technician dispatch and route optimization',
      'Fleet tracking and maintenance scheduling',
      'Inventory management and parts ordering',
      'Customer communication and service updates',
      'Emergency response coordination',
      'Performance analytics and reporting',
      'Insurance and certification tracking',
      'Financial management and invoicing'
    ]
  },
  {
    title: 'Automotive Marketplace',
    description: 'Multi-service automotive platform',
    icon: BuildingOffice2Icon,
    features: [
      'Multi-provider service coordination',
      'Service category management and pricing',
      'Quality control and certification verification',
      'Customer support and dispute resolution',
      'Commission and revenue management',
      'Marketing tools and promotional campaigns',
      'Analytics dashboard and business intelligence',
      'Integration with insurance and warranty providers'
    ]
  }
];

const pricingPlans = [
  {
    name: 'Starter Package',
    price: '$30,000',
    timeline: '45-60 days',
    description: 'Perfect for roadside assistance companies',
    features: [
      'Emergency dispatch platform',
      'Basic customer booking system',
      'GPS tracking and routing',
      'Payment processing integration',
      'Mobile app for customers',
      'Basic service provider tools',
      'Standard reporting dashboard',
      '6 months technical support'
    ],
    highlight: false
  },
  {
    name: 'Professional Package',
    price: '$55,000',
    timeline: '60-75 days',
    description: 'Complete automotive services solution',
    features: [
      'Advanced emergency dispatch system',
      'Multi-service booking and scheduling',
      'Vehicle diagnostics integration',
      'Insurance and claims integration',
      'Advanced customer communication tools',
      'Parts inventory management',
      'Comprehensive analytics dashboard',
      'API integrations and customizations',
      '12 months technical support'
    ],
    highlight: true
  },
  {
    name: 'Enterprise Package',
    price: '$80,000',
    timeline: '75-90 days',
    description: 'Full automotive services ecosystem',
    features: [
      'White-label platform customization',
      'Multi-location and franchise support',
      'Advanced AI-powered features',
      'Enterprise insurance integration',
      'Custom workflow automation',
      'Dedicated account management',
      'Priority technical support',
      'Training and certification program',
      '24 months technical support'
    ],
    highlight: false
  }
];

export default function AutomobileServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <WrenchScrewdriverIcon className="h-8 w-8 text-purple-300" />
                <span className="text-purple-300 font-semibold text-lg">On-Demand Auto Services Platform</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Launch Your Auto Services Platform in 
                <span className="text-purple-300 block">60 Days</span>
              </h1>
              
              <p className="text-xl mb-8 text-purple-100 leading-relaxed">
                Complete roadside assistance and car care management platform. Connect vehicle owners with professional auto services through emergency dispatch, mobile maintenance, and seamless service delivery.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <feature.icon className="h-5 w-5 text-purple-300 flex-shrink-0" />
                    <span className="text-purple-100 font-medium">{feature.title}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#pricing" className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-colors text-center">
                  View Pricing Plans
                </Link>
                <Link href="#demo" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center space-x-2">
                  <PlayIcon className="h-5 w-5" />
                  <span>Emergency Demo</span>
                </Link>
              </div>
            </div>
            
            <div>
              <AutomobileServicesHeroImage />
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl"></div>
      </section>

      {/* Platform Types */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Automotive Services Ecosystem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three integrated platforms that work together to create a comprehensive automobile services and emergency response solution.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {platformTypes.map((platform, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <platform.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{platform.title}</h3>
                <p className="text-gray-600 mb-6">{platform.description}</p>
                
                <ul className="space-y-3">
                  {platform.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <CheckIcon className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Advanced Automotive Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge technology for emergency response, vehicle diagnostics, and service optimization.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full hover:shadow-lg transition-all group-hover:border-purple-300">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MapPinIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">GPS Emergency Dispatch</h3>
                <p className="text-gray-600">Advanced GPS routing and dispatch system for emergency services with priority response and real-time tracking.</p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full hover:shadow-lg transition-all group-hover:border-purple-300">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BeakerIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Vehicle Diagnostics Integration</h3>
                <p className="text-gray-600">OBD-II diagnostic integration for real-time vehicle health monitoring and predictive maintenance alerts.</p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full hover:shadow-lg transition-all group-hover:border-purple-300">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CpuChipIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Service Recommendations</h3>
                <p className="text-gray-600">Machine learning algorithms recommend services based on vehicle history, usage patterns, and maintenance needs.</p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full hover:shadow-lg transition-all group-hover:border-purple-300">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheckIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Insurance Integration Hub</h3>
                <p className="text-gray-600">Seamless integration with major insurance providers for coverage verification, claims processing, and direct billing.</p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full hover:shadow-lg transition-all group-hover:border-purple-300">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CubeTransparentIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Parts Inventory Management</h3>
                <p className="text-gray-600">Real-time parts tracking, supplier integration, and automated ordering for service providers and mobile techs.</p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full hover:shadow-lg transition-all group-hover:border-purple-300">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <DocumentCheckIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Certification Tracking</h3>
                <p className="text-gray-600">Comprehensive tracking of technician certifications, licenses, insurance, and background verification.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Investment & Timeline</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the perfect package to launch your automobile services platform. All packages include emergency dispatch capabilities and technical support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative rounded-2xl p-8 ${
                plan.highlight 
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-2xl transform scale-105' 
                  : 'bg-white/10 backdrop-blur border border-white/20'
              }`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-300 mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold mb-2">{plan.price}</div>
                  <div className="text-gray-300">Launch in {plan.timeline}</div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <CheckIcon className="h-5 w-5 text-purple-300 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                  plan.highlight
                    ? 'bg-white text-purple-600 hover:bg-gray-100'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-400 hover:to-indigo-400'
                }`}>
                  Get Started Today
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Automotive Services?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Join the digital transformation of automobile services with Zoptal's proven emergency response and car care platform technology. 
            The automotive services industry continues to grow with increasing demand for on-demand and mobile services.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-purple-300 mb-3" />
              <h3 className="text-lg font-bold mb-2">Emergency Response</h3>
              <p className="text-purple-100 text-sm">GPS dispatch and less than 30 minute response times</p>
            </div>
            <div className="flex flex-col items-center">
              <DevicePhoneMobileIcon className="h-12 w-12 text-purple-300 mb-3" />
              <h3 className="text-lg font-bold mb-2">Mobile-First Design</h3>
              <p className="text-purple-100 text-sm">Optimized for emergency and on-the-go services</p>
            </div>
            <div className="flex flex-col items-center">
              <WrenchScrewdriverIcon className="h-12 w-12 text-purple-300 mb-3" />
              <h3 className="text-lg font-bold mb-2">Complete Auto Services</h3>
              <p className="text-purple-100 text-sm">Emergency, maintenance, and convenience services</p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheckIcon className="h-12 w-12 text-purple-300 mb-3" />
              <h3 className="text-lg font-bold mb-2">Insurance Integration</h3>
              <p className="text-purple-100 text-sm">Seamless claims and coverage verification</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
            <Link href="/contact" className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-colors">
              Get Emergency Demo
            </Link>
            <Link href="#pricing" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors">
              View Pricing
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-5 w-5 text-purple-300" />
                <span>Emergency Hotline: [Zoptal Phone Number]</span>
              </div>
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-5 w-5 text-purple-300" />
                <span>Email: [Zoptal Email]</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}