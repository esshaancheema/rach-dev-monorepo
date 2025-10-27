import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  UserGroupIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  UserGroupIcon as HandshakeIcon,
  BuildingOffice2Icon,
  BoltIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Partner Program - Grow Your Business with Zoptal',
  description: 'Join the Zoptal Partner Program. Access resources, training, and support to grow your business with our AI-powered development platform.',
  keywords: [
    'partner program',
    'technology partners',
    'reseller program',
    'channel partners',
    'strategic partnerships',
    'business partnerships',
    'partner benefits',
    'partner resources'
  ],
  alternates: {
    canonical: 'https://zoptal.com/partners',
  },
  openGraph: {
    title: 'Zoptal Partner Program',
    description: 'Grow your business with the Zoptal Partner Program',
    type: 'website',
  },
};

const partnerTypes = [
  {
    title: 'Technology Partners',
    description: 'Integrate your technology with our platform to create powerful combined solutions.',
    icon: BoltIcon,
    benefits: [
      'API access and technical support',
      'Co-marketing opportunities',
      'Joint solution development',
      'Technical certification'
    ],
    color: 'blue'
  },
  {
    title: 'Solution Partners',
    description: 'Deliver Zoptal solutions to your clients and expand your service offerings.',
    icon: RocketLaunchIcon,
    benefits: [
      'Sales and technical training',
      'Partner portal access',
      'Lead sharing program',
      'Revenue sharing model'
    ],
    color: 'purple'
  },
  {
    title: 'Consulting Partners',
    description: 'Provide implementation and consulting services to Zoptal customers.',
    icon: UserGroupIcon,
    benefits: [
      'Implementation training',
      'Certification programs',
      'Customer referrals',
      'Marketing support'
    ],
    color: 'green'
  }
];

const partnerBenefits = [
  {
    icon: CurrencyDollarIcon,
    title: 'Revenue Growth',
    description: 'Attractive revenue sharing and commission structures'
  },
  {
    icon: AcademicCapIcon,
    title: 'Training & Certification',
    description: 'Comprehensive training programs and certification paths'
  },
  {
    icon: ChartBarIcon,
    title: 'Marketing Support',
    description: 'Co-marketing opportunities and lead generation'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Technical Support',
    description: 'Dedicated partner support and technical resources'
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Reach',
    description: 'Access to global markets and customer base'
  },
  {
    icon: HandshakeIcon,
    title: 'Partner Portal',
    description: 'Exclusive access to partner resources and tools'
  }
];

const featuredPartners = [
  {
    name: 'TechCorp Solutions',
    logo: '/partners/techcorp.svg',
    description: 'Global technology consulting firm',
    type: 'Platinum Partner'
  },
  {
    name: 'CloudFirst',
    logo: '/partners/cloudfirst.svg',
    description: 'Cloud infrastructure specialists',
    type: 'Gold Partner'
  },
  {
    name: 'Digital Innovators',
    logo: '/partners/digital-innovators.svg',
    description: 'Digital transformation consultancy',
    type: 'Gold Partner'
  },
  {
    name: 'AI Systems Inc',
    logo: '/partners/ai-systems.svg',
    description: 'AI and machine learning experts',
    type: 'Technology Partner'
  },
  {
    name: 'SecureNet',
    logo: '/partners/securenet.svg',
    description: 'Cybersecurity solutions provider',
    type: 'Technology Partner'
  },
  {
    name: 'DataFlow',
    logo: '/partners/dataflow.svg',
    description: 'Data integration platform',
    type: 'Technology Partner'
  }
];

const partnerTiers = [
  {
    name: 'Authorized',
    requirements: [
      'Complete partner onboarding',
      'Basic product training',
      'Signed partner agreement'
    ],
    benefits: [
      'Partner portal access',
      'Basic marketing materials',
      'Standard support'
    ],
    commission: '10%'
  },
  {
    name: 'Silver',
    requirements: [
      'All Authorized requirements',
      '2+ certified professionals',
      '$50k annual revenue'
    ],
    benefits: [
      'All Authorized benefits',
      'Lead sharing program',
      'Co-marketing opportunities',
      'Priority support'
    ],
    commission: '15%'
  },
  {
    name: 'Gold',
    requirements: [
      'All Silver requirements',
      '5+ certified professionals',
      '$200k annual revenue'
    ],
    benefits: [
      'All Silver benefits',
      'Dedicated account manager',
      'Joint customer engagements',
      'Advanced training'
    ],
    commission: '20%'
  },
  {
    name: 'Platinum',
    requirements: [
      'All Gold requirements',
      '10+ certified professionals',
      '$500k annual revenue'
    ],
    benefits: [
      'All Gold benefits',
      'Strategic planning sessions',
      'Executive sponsorship',
      'Custom solutions'
    ],
    commission: '25%'
  }
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Grow with Zoptal Partners
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join our partner ecosystem and unlock new opportunities. Build, sell, and service 
              solutions powered by our AI development platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Become a Partner
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Partner Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Partnership Opportunities
            </h2>
            <p className="text-xl text-gray-600">
              Choose the partnership model that best fits your business
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {partnerTypes.map((type) => {
              const Icon = type.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                purple: 'bg-purple-100 text-purple-600',
                green: 'bg-green-100 text-green-600'
              };
              
              return (
                <Card key={type.title} className="p-6 hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 mb-4 rounded-lg flex items-center justify-center ${colorClasses[type.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {type.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {type.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {type.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partner Benefits */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Partner Benefits
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to succeed as a Zoptal partner
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partnerBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partner Tiers */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Partner Tiers
            </h2>
            <p className="text-xl text-gray-600">
              Grow your partnership and unlock more benefits
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnerTiers.map((tier) => (
              <Card key={tier.name} className={`p-6 ${tier.name === 'Gold' ? 'border-2 border-blue-500' : ''}`}>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {tier.name}
                  </h3>
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    {tier.commission} commission
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements</h4>
                  <ul className="space-y-1">
                    {tier.requirements.map((req) => (
                      <li key={req} className="text-sm text-gray-600">• {req}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Benefits</h4>
                  <ul className="space-y-1">
                    {tier.benefits.map((benefit) => (
                      <li key={benefit} className="text-sm text-gray-600">• {benefit}</li>
                    ))}
                  </ul>
                </div>
                
                {tier.name === 'Gold' && (
                  <Badge className="bg-blue-100 text-blue-700">Most Popular</Badge>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Partners */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Partners
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by industry leaders worldwide
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {featuredPartners.map((partner) => (
              <div key={partner.name} className="flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3">
                  <BuildingOffice2Icon className="w-12 h-12 text-gray-400" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900 text-sm">{partner.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{partner.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application CTA */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="text-white">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Ready to Become a Partner?
                </h2>
                <p className="text-blue-100 mb-6">
                  Join our growing partner ecosystem and start building success together. 
                  Get access to resources, training, and support to grow your business.
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Free to join</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Instant access to partner portal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Training and certification included</span>
                  </li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Apply Now
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    Contact Sales
                  </Button>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl" />
                  <UserGroupIcon className="w-64 h-64 text-white/20 relative" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}