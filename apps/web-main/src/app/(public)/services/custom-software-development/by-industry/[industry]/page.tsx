import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, ChartBarIcon, CogIcon, ShieldCheckIcon, RocketLaunchIcon, UserGroupIcon, DocumentCheckIcon, GlobeAltIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { keywordsByCategory } from '@/lib/seo/keywords';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';
import { notFound } from 'next/navigation';

interface Props {
  params: {
    industry: string;
  };
}

// Define supported industries
const SUPPORTED_INDUSTRIES = [
  'manufacturing',
  'logistics',
  'education',
  'real-estate',
  'hospitality',
  'agriculture',
  'energy',
  'telecommunications',
  'automotive',
  'aerospace',
  'media',
  'gaming',
  'nonprofit',
  'government',
  'legal',
  'construction',
  'transportation',
  'insurance',
  'consulting',
  'pharmaceuticals'
];

// Industry-specific data
const getIndustryData = (industry: string) => {
  const industryMap: Record<string, any> = {
    manufacturing: {
      title: 'Manufacturing Software Development',
      description: 'Custom manufacturing software development services to optimize production, streamline operations, and improve efficiency.',
      hero: {
        title: 'Manufacturing Software Development Solutions',
        subtitle: 'Transform your manufacturing operations with custom software that optimizes production, improves quality control, and streamlines supply chain management.',
        stats: [
          { label: 'Production Efficiency', value: '40%', description: 'Average increase' },
          { label: 'Quality Control', value: '99.5%', description: 'Accuracy rate' },
          { label: 'Cost Reduction', value: '25%', description: 'Operational savings' }
        ]
      },
      features: [
        {
          icon: CogIcon,
          title: 'Production Optimization',
          description: 'Smart scheduling and resource allocation to maximize manufacturing efficiency.'
        },
        {
          icon: ShieldCheckIcon,
          title: 'Quality Management',
          description: 'Comprehensive quality control systems with real-time monitoring and reporting.'
        },
        {
          icon: ChartBarIcon,
          title: 'Supply Chain Integration',
          description: 'End-to-end supply chain visibility and automated inventory management.'
        },
        {
          icon: DocumentCheckIcon,
          title: 'Compliance Tracking',
          description: 'Automated compliance monitoring and reporting for industry regulations.'
        }
      ],
      solutions: [
        {
          title: 'MES Systems',
          description: 'Manufacturing Execution Systems for real-time production monitoring and control.',
          benefits: ['Real-time visibility', 'Quality tracking', 'Performance analytics']
        },
        {
          title: 'ERP Integration',
          description: 'Enterprise Resource Planning solutions tailored for manufacturing operations.',
          benefits: ['Resource optimization', 'Cost control', 'Process automation']
        },
        {
          title: 'IoT Platforms',
          description: 'Internet of Things solutions for smart manufacturing and predictive maintenance.',
          benefits: ['Predictive analytics', 'Equipment monitoring', 'Automated alerts']
        },
        {
          title: 'Quality Control',
          description: 'Advanced quality management systems with automated testing and reporting.',
          benefits: ['Defect reduction', 'Compliance assurance', 'Process improvement']
        }
      ]
    },
    logistics: {
      title: 'Logistics Software Development',
      description: 'Custom logistics software development services to optimize supply chain, enhance delivery tracking, and improve operational efficiency.',
      hero: {
        title: 'Logistics & Supply Chain Software Solutions',
        subtitle: 'Streamline your logistics operations with custom software that optimizes routes, tracks shipments, and manages warehouse operations efficiently.',
        stats: [
          { label: 'Delivery Speed', value: '35%', description: 'Faster deliveries' },
          { label: 'Cost Savings', value: '30%', description: 'Logistics costs' },
          { label: 'Accuracy Rate', value: '99.8%', description: 'Order fulfillment' }
        ]
      },
      features: [
        {
          icon: GlobeAltIcon,
          title: 'Route Optimization',
          description: 'AI-powered route planning to minimize delivery time and fuel costs.'
        },
        {
          icon: ChartBarIcon,
          title: 'Real-time Tracking',
          description: 'Complete shipment visibility from origin to destination.'
        },
        {
          icon: CogIcon,
          title: 'Warehouse Management',
          description: 'Automated inventory management and warehouse optimization systems.'
        },
        {
          icon: DocumentCheckIcon,
          title: 'Fleet Management',
          description: 'Comprehensive fleet tracking and maintenance scheduling.'
        }
      ],
      solutions: [
        {
          title: 'TMS Platforms',
          description: 'Transportation Management Systems for end-to-end logistics control.',
          benefits: ['Route optimization', 'Cost reduction', 'Performance tracking']
        },
        {
          title: 'WMS Solutions',
          description: 'Warehouse Management Systems for inventory and operations optimization.',
          benefits: ['Inventory accuracy', 'Space utilization', 'Order fulfillment']
        },
        {
          title: 'Fleet Tracking',
          description: 'Real-time vehicle tracking and fleet management solutions.',
          benefits: ['GPS tracking', 'Fuel monitoring', 'Driver safety']
        },
        {
          title: 'Last-Mile Delivery',
          description: 'Specialized solutions for final delivery optimization and customer satisfaction.',
          benefits: ['Delivery optimization', 'Customer notifications', 'Proof of delivery']
        }
      ]
    },
    // Add more industries as needed...
  };

  return industryMap[industry] || {
    title: `${industry.charAt(0).toUpperCase() + industry.slice(1)} Software Development`,
    description: `Custom ${industry} software development services to transform your business operations and drive growth.`,
    hero: {
      title: `${industry.charAt(0).toUpperCase() + industry.slice(1)} Software Solutions`,
      subtitle: `Transform your ${industry} business with custom software solutions designed to optimize operations, improve efficiency, and drive growth.`,
      stats: [
        { label: 'Efficiency Gain', value: '45%', description: 'Average improvement' },
        { label: 'Cost Reduction', value: '30%', description: 'Operational savings' },
        { label: 'ROI Achievement', value: '6 months', description: 'Average timeline' }
      ]
    },
    features: [
      {
        icon: RocketLaunchIcon,
        title: 'Performance Optimization',
        description: 'Advanced solutions to optimize your business performance and efficiency.'
      },
      {
        icon: ShieldCheckIcon,
        title: 'Security & Compliance',
        description: 'Enterprise-grade security with industry-specific compliance requirements.'
      },
      {
        icon: ChartBarIcon,
        title: 'Analytics & Insights',
        description: 'Powerful analytics and reporting tools for data-driven decision making.'
      },
      {
        icon: UserGroupIcon,
        title: 'User Experience',
        description: 'Intuitive interfaces designed for your industry-specific workflows.'
      }
    ],
    solutions: [
      {
        title: 'Custom Applications',
        description: 'Tailored software applications built specifically for your industry needs.',
        benefits: ['Custom workflows', 'Scalable architecture', 'Integration ready']
      },
      {
        title: 'Process Automation',
        description: 'Automated solutions to streamline your business processes and reduce manual work.',
        benefits: ['Workflow automation', 'Error reduction', 'Time savings']
      },
      {
        title: 'Data Management',
        description: 'Comprehensive data management solutions for better insights and decision making.',
        benefits: ['Data integration', 'Real-time analytics', 'Reporting dashboards']
      },
      {
        title: 'Mobile Solutions',
        description: 'Mobile applications and responsive solutions for on-the-go business management.',
        benefits: ['Mobile accessibility', 'Offline capability', 'Real-time sync']
      }
    ]
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { industry } = params;
  
  if (!SUPPORTED_INDUSTRIES.includes(industry)) {
    return {
      title: 'Industry Not Found | Zoptal',
      description: 'The requested industry page could not be found.',
    };
  }

  const industryData = getIndustryData(industry);
  const keywords = keywordsByCategory.services.concat(keywordsByCategory.industries);

  return {
    title: `${industryData.title} | Custom Software Solutions | Zoptal`,
    description: industryData.description,
    keywords: keywords.concat([
      `${industry} software development`,
      `${industry} custom solutions`,
      `${industry} technology solutions`,
      `${industry} digital transformation`,
      `${industry} software consulting`
    ]),
    openGraph: {
      title: `${industryData.title} | Zoptal`,
      description: industryData.description,
      type: 'website',
      url: `https://zoptal.com/services/custom-software-development/by-industry/${industry}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${industryData.title} | Zoptal`,
      description: industryData.description,
    },
    alternates: {
      canonical: `https://zoptal.com/services/custom-software-development/by-industry/${industry}`,
    },
  };
}

export default function IndustryPage({ params }: Props) {
  const { industry } = params;
  
  if (!SUPPORTED_INDUSTRIES.includes(industry)) {
    notFound();
  }

  const industryData = getIndustryData(industry);

  const serviceSchema = generateServiceSchema({
    name: industryData.title,
    description: industryData.description,
    provider: 'Zoptal',
    areaServed: 'Global',
    serviceType: 'Software Development',
    url: `https://zoptal.com/services/custom-software-development/by-industry/${industry}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Services', url: 'https://zoptal.com/services' },
      { name: 'Custom Software Development', url: 'https://zoptal.com/services/custom-software-development' },
      { name: 'By Industry', url: 'https://zoptal.com/services/custom-software-development/by-industry' },
      { name: industryData.title, url: `https://zoptal.com/services/custom-software-development/by-industry/${industry}` },
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
                <Link href="/services/custom-software-development" className="text-gray-500 hover:text-gray-700">
                  Custom Software Development
                </Link>
              </li>
              <li>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li className="text-gray-900 font-medium">
                {industryData.title}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {industryData.hero.title}
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              {industryData.hero.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {industryData.hero.stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold text-blue-200 mb-2">{stat.value}</div>
                <div className="text-white font-semibold mb-1">{stat.label}</div>
                <div className="text-blue-200 text-sm">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Industry-Specific Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialized capabilities designed for {industry} industry requirements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {industryData.features.map((feature, index) => (
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

      {/* Solutions Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {industry.charAt(0).toUpperCase() + industry.slice(1)} Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive software solutions tailored for your industry needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {industryData.solutions.map((solution, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{solution.title}</h3>
                <p className="text-gray-600 mb-6">{solution.description}</p>
                <ul className="space-y-2">
                  {solution.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Development Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A proven methodology tailored for {industry} software development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Discovery & Analysis',
                description: `Deep dive into your ${industry} operations to understand specific requirements and challenges.`
              },
              {
                step: '02',
                title: 'Design & Planning',
                description: 'Create detailed technical specifications and user experience designs for your solution.'
              },
              {
                step: '03',
                title: 'Development & Testing',
                description: 'Agile development with continuous testing and quality assurance throughout the process.'
              },
              {
                step: '04',
                title: 'Deployment & Support',
                description: 'Seamless deployment with ongoing maintenance and support for optimal performance.'
              }
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {process.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{process.title}</h3>
                <p className="text-gray-600">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your {industry.charAt(0).toUpperCase() + industry.slice(1)} Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Let's discuss how our custom software solutions can optimize your {industry} operations and drive growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 flex items-center justify-center"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Schedule Consultation
            </Link>
            <Link
              href="/case-studies"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300"
            >
              View Case Studies
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export async function generateStaticParams() {
  return SUPPORTED_INDUSTRIES.map((industry) => ({
    industry,
  }));
}