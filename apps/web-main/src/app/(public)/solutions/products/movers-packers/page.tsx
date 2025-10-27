import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  TruckIcon,
  MapPinIcon,
  ChartBarIcon,
  DocumentTextIcon,
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
  WrenchScrewdriverIcon,
  DocumentCheckIcon,
  RocketLaunchIcon,
  DevicePhoneMobileIcon,
  CameraIcon,
  CalculatorIcon,
  HomeIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartLineIcon,
  TagIcon,
  ServerStackIcon,
  CloudIcon,
  CogIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  CommandLineIcon,
  WindowIcon,
  LanguageIcon,
  CubeTransparentIcon,
  BookOpenIcon,
  AcademicCapIcon,
  HandRaisedIcon,
  TrophyIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  QrCodeIcon,
  WifiIcon,
  SwatchIcon,
  HeartIcon,
  FireIcon,
  SunIcon,
  SnowflakeIcon,
  ChartPieIcon,
  LinkIcon,
  ShareIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import MoversPackersHeroImage from '@/components/MoversPackersHeroImage';

export const metadata: Metadata = {
  title: 'Movers & Packers Platform Development | Moving Services Management | Zoptal',
  description: 'Launch your moving services platform in 60 days. Complete relocation management system with booking, tracking, and fleet management. Investment from $30K-85K.',
  keywords: [
    'movers packers platform',
    'moving company software',
    'relocation management system',
    'moving services app',
    'packers movers booking platform',
    'household shifting software',
    'moving company management',
    'relocation services platform',
    'moving and packing software',
    'logistics management system',
    'moving business platform',
    'professional moving services',
    'household goods transportation',
    'interstate moving platform',
    'moving services marketplace'
  ],
  openGraph: {
    title: 'Movers & Packers Platform Development | Zoptal',
    description: 'Launch your moving services platform in 60 days.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: CalendarIcon,
    title: 'Smart Booking System',
    description: 'AI-powered booking platform with automated pricing, availability scheduling, and customer communication.'
  },
  {
    icon: MapPinIcon,
    title: 'Real-Time GPS Tracking',
    description: 'Live tracking of moving trucks and crews with estimated arrival times and route optimization.'
  },
  {
    icon: ArchiveBoxIcon,
    title: 'Inventory Management',
    description: 'Digital inventory system with photo documentation, condition reports, and insurance tracking.'
  },
  {
    icon: ClockIcon,
    title: '60-Day Launch Timeline',
    description: 'Complete moving services platform ready to launch in 45-90 days depending on features.'
  }
];

const platformTypes = [
  {
    title: 'Customer Booking Platform',
    description: 'Online moving service booking and management',
    icon: DevicePhoneMobileIcon,
    features: [
      'Instant online booking and cost estimation',
      'Service customization and add-on selection',
      'Real-time tracking and status updates',
      'Photo documentation and inventory access',
      'Customer reviews and rating system',
      'Insurance claims and damage reporting',
      'Payment processing and receipt management',
      'Moving tips and preparation guides'
    ]
  },
  {
    title: 'Moving Company Management',
    description: 'Complete operations and fleet management',
    icon: TruckIcon,
    features: [
      'Crew scheduling and task management',
      'Fleet tracking and maintenance scheduling',
      'Route optimization and fuel management',
      'Equipment and supplies inventory',
      'Customer communication tools',
      'Financial reporting and invoicing',
      'Performance analytics dashboard',
      'Integration with accounting systems'
    ]
  },
  {
    title: 'Corporate Relocation Services',
    description: 'Enterprise moving and relocation management',
    icon: BuildingOffice2Icon,
    features: [
      'Employee relocation management',
      'Policy compliance and approval workflows',
      'Expense tracking and reimbursement',
      'Vendor management and coordination',
      'Reporting and analytics dashboard',
      'Integration with HR systems',
      'Global relocation network',
      'Tax and legal compliance tools'
    ]
  }
];

const serviceFeatures = [
  {
    category: 'Customer Experience',
    icon: HeartIcon,
    items: [
      'Online booking with instant quotes',
      'Service customization and planning tools',
      'Real-time moving truck tracking',
      'Digital inventory with photos',
      'In-app communication with crew',
      'Post-move feedback and reviews',
      'Insurance and claims management',
      'Moving checklist and reminders'
    ]
  },
  {
    category: 'Operations Management',
    icon: CogIcon,
    items: [
      'Crew scheduling and dispatch',
      'Route optimization and planning',
      'Equipment and vehicle tracking',
      'Inventory and supplies management',
      'Quality control and inspections',
      'Customer service management',
      'Financial tracking and reporting',
      'Performance analytics dashboard'
    ]
  },
  {
    category: 'Business Intelligence',
    icon: ChartBarIcon,
    items: [
      'Revenue and profitability analysis',
      'Customer acquisition tracking',
      'Service performance metrics',
      'Fleet utilization reports',
      'Crew productivity analysis',
      'Market trend insights',
      'Predictive demand forecasting',
      'Competition analysis tools'
    ]
  }
];

const advancedFeatures = [
  {
    title: 'AI-Powered Estimation',
    description: 'Machine learning algorithms for accurate moving cost estimation based on inventory, distance, and service requirements.',
    icon: CpuChipIcon
  },
  {
    title: 'Smart Route Optimization',
    description: 'Advanced algorithms optimize routes for efficiency, considering traffic, fuel costs, and crew schedules.',
    icon: MapPinIcon
  },
  {
    title: 'Inventory Documentation',
    description: 'Digital photo inventory with condition reporting, damage claims, and insurance integration.',
    icon: CameraIcon
  },
  {
    title: 'Crew Communication Hub',
    description: 'Real-time messaging, task updates, and coordination tools for moving crews and customers.',
    icon: ChatBubbleLeftRightIcon
  },
  {
    title: 'Insurance Integration',
    description: 'Seamless integration with moving insurance providers for coverage selection and claims processing.',
    icon: ShieldCheckIcon
  },
  {
    title: 'Multi-Location Support',
    description: 'Support for interstate and international moves with regulatory compliance and documentation.',
    icon: GlobeAltIcon
  }
];

const businessModels = [
  {
    title: 'Commission-Based Revenue',
    items: [
      'Booking commission: 8-15% of service value',
      'Payment processing: 2.9% + $0.30 per transaction',
      'Premium listing fees for moving companies',
      'Lead generation charges for qualified leads'
    ]
  },
  {
    title: 'Subscription Model',
    items: [
      'Moving company subscriptions: $199-899 monthly',
      'Feature-based pricing tiers',
      'Volume-based pricing for large operations',
      'White-label platform licensing'
    ]
  },
  {
    title: 'Value-Added Services',
    items: [
      'Insurance product sales commissions',
      'Storage facility partnerships',
      'Packing supplies marketplace',
      'Professional photography services'
    ]
  }
];

const targetMarkets = [
  {
    category: 'Local Moving Companies',
    description: 'Residential and commercial local moving services',
    size: '$15B market'
  },
  {
    category: 'Interstate Carriers',
    description: 'Long-distance and cross-country moving services',
    size: '$12B market'
  },
  {
    category: 'Corporate Relocation',
    description: 'Employee relocation and corporate moving services',
    size: '$8B market'
  },
  {
    category: 'Specialty Movers',
    description: 'Piano, art, antique, and specialized item movers',
    size: '$3B market'
  }
];

const pricingPlans = [
  {
    name: 'Starter Package',
    price: '$30,000',
    timeline: '45-60 days',
    description: 'Perfect for local moving companies',
    features: [
      'Customer booking platform',
      'Basic inventory management',
      'GPS tracking and updates',
      'Payment processing integration',
      'Mobile app for customers',
      'Basic crew management tools',
      'Standard reporting dashboard',
      '6 months technical support'
    ],
    highlight: false
  },
  {
    name: 'Professional Package',
    price: '$55,000',
    timeline: '60-75 days',
    description: 'Complete moving services solution',
    features: [
      'Advanced booking and estimation system',
      'Complete inventory management with photos',
      'Route optimization and scheduling',
      'Crew management and dispatch',
      'Customer communication tools',
      'Insurance integration and claims',
      'Advanced analytics dashboard',
      'API integrations and customizations',
      '12 months technical support'
    ],
    highlight: true
  },
  {
    name: 'Enterprise Package',
    price: '$85,000',
    timeline: '75-90 days',
    description: 'Full moving services ecosystem',
    features: [
      'White-label platform customization',
      'Multi-location and franchise support',
      'Corporate relocation management',
      'Advanced AI-powered features',
      'Custom integrations and workflows',
      'Dedicated account management',
      'Priority technical support',
      'Training and onboarding program',
      '24 months technical support'
    ],
    highlight: false
  }
];

const successMetrics = [
  {
    metric: 'Booking Conversion',
    value: '4-7%',
    description: 'Website visitor to booking conversion rate'
  },
  {
    metric: 'Average Job Value',
    value: '$800-2,500',
    description: 'Typical moving service booking value'
  },
  {
    metric: 'Customer Satisfaction',
    value: '4.6+ stars',
    description: 'Average customer rating and reviews'
  },
  {
    metric: 'Repeat Business',
    value: '25-35%',
    description: 'Customers who book again or refer others'
  }
];

export default function MoversPackersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <TruckIcon className="h-8 w-8 text-orange-300" />
                <span className="text-orange-300 font-semibold text-lg">Moving & Relocation Platform</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Launch Your Moving Services Platform in 
                <span className="text-orange-300 block">60 Days</span>
              </h1>
              
              <p className="text-xl mb-8 text-orange-100 leading-relaxed">
                Complete moving and relocation management platform. Connect customers with professional movers through intelligent booking, real-time tracking, and seamless service delivery.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <feature.icon className="h-5 w-5 text-orange-300 flex-shrink-0" />
                    <span className="text-orange-100 font-medium">{feature.title}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#pricing" className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors text-center">
                  View Pricing Plans
                </Link>
                <Link href="#demo" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center space-x-2">
                  <PlayIcon className="h-5 w-5" />
                  <span>Watch Demo</span>
                </Link>
              </div>
            </div>
            
            <div>
              <MoversPackersHeroImage />
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-orange-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
      </section>

      {/* Platform Types */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Moving Services Ecosystem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three integrated platforms that work together to create a comprehensive moving and relocation management solution.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {platformTypes.map((platform, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-orange-500 to-blue-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <platform.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{platform.title}</h3>
                <p className="text-gray-600 mb-6">{platform.description}</p>
                
                <ul className="space-y-3">
                  {platform.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <CheckIcon className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Feature Set
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything needed to run a successful moving and relocation business, from customer acquisition to service delivery.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {serviceFeatures.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-orange-500 to-blue-500 w-12 h-12 rounded-xl flex items-center justify-center">
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{category.category}</h3>
                </div>
                
                <ul className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Advanced Technology Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge technology to streamline operations and enhance customer experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 h-full hover:shadow-lg transition-all group-hover:border-orange-300">
                  <div className="bg-gradient-to-br from-orange-500 to-blue-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Models */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Proven Revenue Models
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Multiple revenue streams ensure sustainable growth and profitability for your moving services platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {businessModels.map((model, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{model.title}</h3>
                <ul className="space-y-4">
                  {model.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <CurrencyDollarIcon className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Markets */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Massive Market Opportunity
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tap into the $38+ billion moving and relocation industry with multiple target segments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {targetMarkets.map((market, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{market.category}</h3>
                  <span className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {market.size}
                  </span>
                </div>
                <p className="text-gray-600">{market.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Investment & Timeline</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the perfect package to launch your moving services platform. All packages include full source code and technical support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative rounded-2xl p-8 ${
                plan.highlight 
                  ? 'bg-gradient-to-br from-orange-600 to-blue-600 shadow-2xl transform scale-105' 
                  : 'bg-white/10 backdrop-blur border border-white/20'
              }`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
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
                      <CheckIcon className="h-5 w-5 text-orange-300 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                  plan.highlight
                    ? 'bg-white text-orange-600 hover:bg-gray-100'
                    : 'bg-gradient-to-r from-orange-500 to-blue-500 text-white hover:from-orange-400 hover:to-blue-400'
                }`}>
                  Get Started Today
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Platform Performance Metrics
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industry benchmarks and expected performance indicators for successful moving services platforms.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {successMetrics.map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-br from-orange-500 to-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="h-10 w-10 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{item.value}</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">{item.metric}</div>
                <div className="text-gray-600">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform the Moving Industry?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
            Join the digital transformation of moving and relocation services with Zoptal's proven platform technology. 
            The moving industry continues to grow with increasing demand for professional, technology-enabled services.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <CheckIcon className="h-12 w-12 text-orange-300 mb-3" />
              <h3 className="text-lg font-bold mb-2">Complete Solution</h3>
              <p className="text-orange-100 text-sm">Booking, management, and tracking in one platform</p>
            </div>
            <div className="flex flex-col items-center">
              <DevicePhoneMobileIcon className="h-12 w-12 text-orange-300 mb-3" />
              <h3 className="text-lg font-bold mb-2">Mobile-First Design</h3>
              <p className="text-orange-100 text-sm">Optimized for customers and crews on-the-go</p>
            </div>
            <div className="flex flex-col items-center">
              <CpuChipIcon className="h-12 w-12 text-orange-300 mb-3" />
              <h3 className="text-lg font-bold mb-2">AI-Powered Features</h3>
              <p className="text-orange-100 text-sm">Smart pricing, routing, and demand forecasting</p>
            </div>
            <div className="flex flex-col items-center">
              <GlobeAltIcon className="h-12 w-12 text-orange-300 mb-3" />
              <h3 className="text-lg font-bold mb-2">Scalable Platform</h3>
              <p className="text-orange-100 text-sm">Local to interstate moving operations</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Next Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-300 mb-1">1</div>
                <div className="font-semibold">Market Analysis</div>
                <div className="text-sm text-orange-100">Assess your moving services market opportunity</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-300 mb-1">2</div>
                <div className="font-semibold">Platform Demo</div>
                <div className="text-sm text-orange-100">Experience the complete moving platform</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-300 mb-1">3</div>
                <div className="font-semibold">Partner Network</div>
                <div className="text-sm text-orange-100">Plan moving company acquisition strategy</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-300 mb-1">4</div>
                <div className="font-semibold">Launch Strategy</div>
                <div className="text-sm text-orange-100">Create go-to-market and marketing plans</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
            <Link href="/contact" className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors">
              Get Custom Quote
            </Link>
            <Link href="#demo" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors">
              Schedule Demo
            </Link>
            <Link href="/resources/moving-platform-guide" className="bg-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors">
              Download Guide
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-5 w-5 text-orange-300" />
                <span>Call: [Zoptal Phone Number]</span>
              </div>
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-5 w-5 text-orange-300" />
                <span>Email: [Zoptal Email]</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}