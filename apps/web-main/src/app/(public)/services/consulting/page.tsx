import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  UserGroupIcon,
  LightBulbIcon,
  ChartBarIcon,
  CogIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Technical Consulting Services - Expert Technology Guidance | Zoptal',
  description: 'Get expert technical consulting from Zoptal. Strategic technology guidance, architecture review, and implementation consulting for your business.',
  keywords: [
    'technical consulting',
    'technology consulting',
    'IT consulting',
    'software architecture',
    'digital transformation',
    'technology strategy',
    'expert consulting',
    'business consulting'
  ],
  alternates: {
    canonical: 'https://zoptal.com/services/consulting',
  },
  openGraph: {
    title: 'Technical Consulting Services - Zoptal',
    description: 'Expert technical consulting and strategic technology guidance',
    type: 'website',
  },
};

const consultingServices = [
  {
    title: 'Technology Strategy',
    description: 'Develop comprehensive technology roadmaps aligned with your business goals',
    icon: ChartBarIcon,
    features: [
      'Technology roadmap development',
      'Digital transformation strategy',
      'Technology stack evaluation',
      'ROI analysis and planning'
    ]
  },
  {
    title: 'Architecture Review',
    description: 'Expert review of your software architecture for scalability and performance',
    icon: CogIcon,
    features: [
      'System architecture analysis',
      'Performance optimization',
      'Scalability planning',
      'Security assessment'
    ]
  },
  {
    title: 'Implementation Consulting',
    description: 'Hands-on guidance for technology implementation and integration',
    icon: LightBulbIcon,
    features: [
      'Project planning and execution',
      'Technical implementation guidance',
      'Team training and support',
      'Quality assurance processes'
    ]
  },
  {
    title: 'Digital Transformation',
    description: 'Complete digital transformation consulting for modern businesses',
    icon: UserGroupIcon,
    features: [
      'Process digitization',
      'Cloud migration strategy',
      'Automation implementation',
      'Change management'
    ]
  }
];

const benefits = [
  {
    title: 'Expert Knowledge',
    description: 'Access to senior consultants with 10+ years of experience'
  },
  {
    title: 'Proven Methodologies',
    description: 'Battle-tested frameworks and best practices'
  },
  {
    title: 'Objective Analysis',
    description: 'Unbiased assessment and recommendations'
  },
  {
    title: 'Rapid Results',
    description: 'Quick insights and actionable recommendations'
  }
];

const process = [
  {
    step: 1,
    title: 'Discovery & Assessment',
    description: 'We analyze your current technology landscape and business needs'
  },
  {
    step: 2,
    title: 'Strategy Development',
    description: 'Create a comprehensive strategy and roadmap for your goals'
  },
  {
    step: 3,
    title: 'Implementation Planning',
    description: 'Develop detailed implementation plans with timelines and milestones'
  },
  {
    step: 4,
    title: 'Execution Support',
    description: 'Provide ongoing support and guidance throughout implementation'
  }
];

const packages = [
  {
    name: 'Strategy Session',
    price: '$2,500',
    duration: '1-2 weeks',
    description: 'Focused strategy session with actionable recommendations',
    features: [
      'Technology assessment',
      'Strategic recommendations',
      'Implementation roadmap',
      'Executive summary report'
    ],
    popular: false
  },
  {
    name: 'Comprehensive Review',
    price: '$7,500',
    duration: '3-4 weeks',
    description: 'Deep-dive analysis with detailed implementation plan',
    features: [
      'Complete technology audit',
      'Architecture review',
      'Detailed implementation plan',
      'Risk assessment',
      'ROI analysis',
      '3 months follow-up support'
    ],
    popular: true
  },
  {
    name: 'Transformation Program',
    price: 'Custom',
    duration: '2-6 months',
    description: 'End-to-end digital transformation consulting',
    features: [
      'Complete transformation strategy',
      'Implementation management',
      'Team training',
      'Change management',
      'Ongoing support',
      'Success metrics tracking'
    ],
    popular: false
  }
];

const testimonials = [
  {
    name: 'Michael Chen',
    role: 'CTO',
    company: 'TechCorp',
    content: 'Zoptal\'s consulting team helped us modernize our entire technology stack. Their strategic insights saved us months of development time.',
    rating: 5
  },
  {
    name: 'Sarah Johnson',
    role: 'VP Engineering',
    company: 'GrowthCo',
    content: 'The architecture review was incredibly thorough. They identified performance bottlenecks we didn\'t even know existed.',
    rating: 5
  }
];

export default function ConsultingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <Badge className="bg-blue-500 text-white mb-4">Expert Consulting</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Technical Consulting Services
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Get strategic technology guidance from our expert consultants. We help businesses 
              make informed technology decisions and execute successful digital transformations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Schedule Consultation
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                View Case Studies
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Consulting Services
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive technology consulting to accelerate your business growth
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {consultingServices.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Consulting?
            </h2>
            <p className="text-xl text-gray-600">
              The advantages of working with our expert consulting team
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Consulting Process
            </h2>
            <p className="text-xl text-gray-600">
              A proven methodology for successful technology consulting
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <ArrowRightIcon className="w-6 h-6 text-gray-300 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Consulting Packages
            </h2>
            <p className="text-xl text-gray-600">
              Choose the right level of consulting support for your needs
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <Card key={pkg.name} className={`p-6 ${pkg.popular ? 'border-2 border-blue-500' : ''}`}>
                {pkg.popular && (
                  <Badge className="bg-blue-500 text-white mb-4">Most Popular</Badge>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {pkg.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-blue-600">{pkg.price}</span>
                  <span className="text-gray-500">/ project</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <ClockIcon className="w-4 h-4" />
                  {pkg.duration}
                </div>
                <p className="text-gray-600 mb-6">
                  {pkg.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={pkg.popular ? 'default' : 'outline'}>
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Success stories from our consulting engagements
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4">
                  "{testimonial.content}"
                </blockquote>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Expert Guidance?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Schedule a consultation with our expert team and take your technology 
            strategy to the next level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Schedule Free Consultation
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Contact Sales Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}