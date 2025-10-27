import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  BanknotesIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
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
  WrenchScrewdriverIcon,
  DocumentCheckIcon,
  RocketLaunchIcon,
  CogIcon,
  ServerStackIcon,
  LockClosedIcon,
  ScaleIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  CalculatorIcon,
  EyeIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import FinancialServicesHeroImage from '@/components/FinancialServicesHeroImage';

export const metadata: Metadata = {
  title: 'Financial Services Platform | Banking & Payment Solutions | Zoptal',
  description: 'Build your FinTech empire in 90 days. Complete financial platform with digital banking, payment processing, and investment tools. Investment from $50K-200K+.',
  keywords: [
    'financial services platform',
    'digital banking solution',
    'payment processing system',
    'fintech development',
    'investment platform',
    'banking software',
    'payment gateway',
    'financial technology',
    'regulatory compliance',
    'PCI DSS compliance',
    'mobile banking app',
    'trading platform',
    'lending platform',
    'financial API',
    'enterprise banking'
  ],
  openGraph: {
    title: 'Financial Services Platform | Zoptal',
    description: 'Build your FinTech empire in 90 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Bank-Grade Security',
    description: 'Enterprise-level security with PCI DSS Level 1 compliance and end-to-end encryption.'
  },
  {
    icon: ScaleIcon,
    title: 'Regulatory Compliance',
    description: 'Full compliance with SOX, KYC, AML, and all major financial regulations.'
  },
  {
    icon: CpuChipIcon,
    title: 'Real-Time Processing',
    description: '10,000+ transactions per second with 99.99% uptime guarantee.'
  },
  {
    icon: ClockIcon,
    title: '90-Day Launch Timeline',
    description: 'Complete financial platform deployment in 75-180 days depending on complexity.'
  }
];

const platformTypes = [
  {
    title: 'Digital Banking Platform',
    description: 'Complete online banking solution',
    features: [
      'Account management (checking, savings, business)',
      'Real-time transactions and transfers',
      'Mobile check deposit and processing',
      'ATM locator and fee-free network',
      'Automated bill pay system',
      'Personal budgeting and financial planning',
      'AI-powered fraud detection',
      'Multi-factor biometric authentication'
    ]
  },
  {
    title: 'Payment Processing System',
    description: 'Multi-channel payment gateway',
    features: [
      'Online, mobile, and in-store processing',
      'Digital wallet integration (Apple/Google Pay)',
      'Cryptocurrency support (Bitcoin, Ethereum)',
      'International and cross-border payments',
      'Recurring billing and subscriptions',
      'Split payments and group functionality',
      'Advanced payment analytics',
      'Chargeback and dispute management'
    ]
  },
  {
    title: 'Investment & Trading Platform',
    description: 'Complete investment management system',
    features: [
      'Portfolio management and tracking',
      'Real-time market data and analytics',
      'Automated trading algorithms',
      'Risk assessment and management',
      'Social trading and copy trading',
      'Investment research tools',
      'Tax optimization and reporting',
      'Robo-advisory services'
    ]
  }
];

const industryApplications = [
  {
    icon: BuildingLibraryIcon,
    title: 'Traditional Banking',
    description: 'Core banking systems for community banks and credit unions',
    features: ['Customer onboarding', 'Loan origination', 'Relationship management']
  },
  {
    icon: RocketLaunchIcon,
    title: 'FinTech Startups',
    description: 'Rapid MVP development for financial technology companies',
    features: ['API-first architecture', 'Scalable infrastructure', 'Regulatory guidance']
  },
  {
    icon: ShieldCheckIcon,
    title: 'Insurance Technology',
    description: 'Policy management and claims processing automation',
    features: ['Underwriting automation', 'Claims processing', 'Agent portals']
  },
  {
    icon: ChartBarIcon,
    title: 'Investment Firms',
    description: 'Client portals and performance analytics for investment companies',
    features: ['Portfolio reporting', 'Document management', 'Client communication']
  }
];

const securityFeatures = [
  {
    icon: ComputerDesktopIcon,
    title: 'Multi-Layer Security',
    description: 'Network, application, and data security with zero-trust architecture'
  },
  {
    icon: LockClosedIcon,
    title: 'End-to-End Encryption',
    description: 'Bank-grade encryption for all data in transit and at rest'
  },
  {
    icon: EyeIcon,
    title: 'Biometric Authentication',
    description: 'Fingerprint, face, and voice recognition for secure access'
  },
  {
    icon: DocumentCheckIcon,
    title: 'Complete Audit Trails',
    description: 'Full transaction logging and regulatory reporting capabilities'
  }
];

const complianceStandards = [
  { name: 'PCI DSS Level 1', description: 'Payment card industry security standards' },
  { name: 'SOC 2 Type II', description: 'Service organization security controls' },
  { name: 'ISO 27001', description: 'Information security management certification' },
  { name: 'GDPR Compliance', description: 'European data protection regulation' },
  { name: 'KYC/AML', description: 'Know Your Customer and Anti-Money Laundering' },
  { name: 'Basel III', description: 'International banking regulatory framework' }
];

const pricingTiers = [
  {
    name: 'Starter Package',
    price: '$50,000',
    timeline: '75-90 days',
    description: 'Essential financial services platform',
    features: [
      'Basic banking or payment processing system',
      'Mobile applications (iOS & Android)',
      'Essential security and compliance features',
      'Integration with major payment networks',
      'Basic reporting and analytics',
      '90 days support and compliance guidance'
    ],
    highlighted: false
  },
  {
    name: 'Professional Package',
    price: '$100,000',
    timeline: '90-120 days',
    description: 'Complete financial services solution',
    features: [
      'Everything in Starter package',
      'Advanced fraud detection and security',
      'Multi-channel payment processing',
      'Investment and trading capabilities',
      'Advanced analytics and reporting',
      'Regulatory compliance automation',
      '6 months support and maintenance'
    ],
    highlighted: true
  },
  {
    name: 'Enterprise Package',
    price: '$200,000+',
    timeline: '120-180 days',
    description: 'Full-scale financial institution platform',
    features: [
      'Everything in Professional package',
      'Core banking system integration',
      'Advanced risk management tools',
      'Custom compliance and regulatory features',
      'Dedicated development and compliance team',
      'Priority support and maintenance',
      'White-label branding options'
    ],
    highlighted: false
  }
];

const successMetrics = [
  { metric: '10,000+', description: 'Transactions per second capability' },
  { metric: '99.99%', description: 'System uptime guarantee' },
  { metric: '100%', description: 'Regulatory examination pass rate' },
  { metric: '95%+', description: 'Client retention rate' }
];

export default function FinancialServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-amber-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-blue-100/20 px-4 py-2 text-sm font-medium text-blue-100">
                  <BanknotesIcon className="mr-2 h-4 w-4" />
                  Financial Technology Solutions
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Build Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-100">
                  FinTech Empire
                </span>
                in 90 Days
              </h1>
              <p className="mt-6 text-xl text-blue-100 sm:text-2xl">
                Complete Financial Services Platform - Banking, Payments & Investment Solutions with Enterprise-Grade Security
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {features.map((feature, index) => (
                  <div key={index} className="text-center">
                    <feature.icon className="mx-auto h-8 w-8 text-amber-300" />
                    <p className="mt-2 text-sm font-medium">{feature.title}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact?service=financial-services"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-amber-500 hover:shadow-2xl hover:scale-105"
                >
                  Schedule Compliance Demo
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-blue-300 bg-blue-800/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-blue-700/50"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Security Features
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <FinancialServicesHeroImage className="w-full max-w-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Enterprise Financial Platform
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Complete infrastructure for digital banking, payment processing, investment management, 
              and regulatory compliance with enterprise-grade security.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {platformTypes.map((platform, index) => (
              <div key={index} className="relative bg-gradient-to-br from-blue-50 to-amber-50 rounded-2xl p-8 shadow-lg border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{platform.title}</h3>
                <p className="text-gray-600 mb-6">{platform.description}</p>
                <ul className="space-y-3">
                  {platform.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Applications */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Industry-Specific Solutions
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Tailored financial platforms for every sector
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {industryApplications.map((application, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-amber-500 rounded-lg flex items-center justify-center mb-4">
                  <application.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{application.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{application.description}</p>
                <ul className="space-y-1">
                  {application.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-sm text-gray-500 flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Bank-Grade Security & Compliance
            </h2>
            <p className="mt-6 text-xl text-blue-100">
              Enterprise security architecture with complete regulatory compliance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold mb-8">Security Features</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-amber-500 rounded-lg flex items-center justify-center mr-4">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                      <p className="text-sm text-blue-100">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-8">Compliance Standards</h3>
              <div className="space-y-4">
                {complianceStandards.map((standard, index) => (
                  <div key={index} className="bg-blue-800/30 rounded-lg p-4 border border-blue-700">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">{standard.name}</h4>
                      <CheckIcon className="h-5 w-5 text-green-400" />
                    </div>
                    <p className="text-sm text-blue-100 mt-1">{standard.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-amber-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {successMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white md:text-4xl">{metric.metric}</div>
                <div className="text-blue-100 mt-2">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Investment Packages
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Choose the perfect financial platform solution for your business
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative bg-white rounded-2xl shadow-xl border-2 p-8 ${
                tier.highlighted 
                  ? 'border-blue-500 ring-4 ring-blue-500/10' 
                  : 'border-gray-200'
              }`}>
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-amber-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{tier.description}</p>
                  <div className="mt-4 text-sm text-blue-600 font-medium">
                    Launch Time: {tier.timeline}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact?service=financial-services"
                  className={`block w-full text-center py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-blue-600 to-amber-600 text-white hover:from-blue-700 hover:to-amber-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started Today
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-amber-700 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Ready to Transform Financial Services?
          </h2>
          <p className="mt-6 text-xl text-blue-100">
            Build the future of finance with Zoptal's enterprise-grade platform. 
            Secure, compliant, and scalable technology for financial innovation.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-amber-300" />
              <h3 className="mt-4 text-lg font-semibold">Enterprise Security</h3>
              <p className="mt-2 text-sm text-blue-100">Bank-grade security and encryption</p>
            </div>
            <div className="text-center">
              <ScaleIcon className="mx-auto h-12 w-12 text-amber-300" />
              <h3 className="mt-4 text-lg font-semibold">Full Compliance</h3>
              <p className="mt-2 text-sm text-blue-100">All major financial regulations covered</p>
            </div>
            <div className="text-center">
              <ServerStackIcon className="mx-auto h-12 w-12 text-amber-300" />
              <h3 className="mt-4 text-lg font-semibold">Proven Technology</h3>
              <p className="mt-2 text-sm text-blue-100">Trusted by financial institutions worldwide</p>
            </div>
            <div className="text-center">
              <UserGroupIcon className="mx-auto h-12 w-12 text-amber-300" />
              <h3 className="mt-4 text-lg font-semibold">Expert Support</h3>
              <p className="mt-2 text-sm text-blue-100">Dedicated compliance and technical teams</p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact?service=financial-services"
              className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-amber-500 hover:shadow-2xl hover:scale-105"
            >
              Schedule Compliance Demo
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact?service=quote"
              className="inline-flex items-center justify-center rounded-xl border-2 border-blue-300 bg-blue-800/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-blue-700/50"
            >
              Get Custom Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}