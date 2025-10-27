import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, MapPinIcon, CogIcon, BuildingOfficeIcon, PhoneIcon, ClockIcon, StarIcon, CheckIcon, UsersIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { keywordsByCategory } from '@/lib/seo/keywords';
import { generateServiceSchema, generateBreadcrumbSchema, generateLocalBusinessSchema } from '@/lib/seo/schemas';
import { generateLocationHreflangLinks } from '@/lib/seo/hreflang';
import { notFound } from 'next/navigation';

interface Props {
  params: {
    country: string;
    city: string;
    service: string;
  };
}

// Define supported combinations
const LOCATION_SERVICE_DATA = {
  'united-states': {
    'san-francisco': {
      name: 'San Francisco',
      state: 'California',
      timezone: 'PST (UTC-8)',
      phone: '+1 (415) 555-0123',
      teamSize: '125+',
      established: '2015',
      services: {
        'custom-software-development': {
          name: 'Custom Software Development',
          description: 'Professional custom software development services in San Francisco, California. Enterprise-grade solutions for Silicon Valley startups and Fortune 500 companies.',
          specialties: ['Enterprise Applications', 'SaaS Platforms', 'API Development', 'Cloud Migration'],
          industries: ['FinTech', 'HealthTech', 'EdTech', 'Enterprise Software'],
          technologies: ['React', 'Node.js', 'Python', 'AWS', 'Kubernetes'],
          pricing: 'Starting from $15,000',
          timeline: '8-16 weeks'
        },
        'mobile-app-development': {
          name: 'Mobile App Development',
          description: 'Expert mobile app development services in San Francisco. Native iOS and Android apps for Silicon Valley innovators.',
          specialties: ['iOS Development', 'Android Development', 'React Native', 'Flutter'],
          industries: ['Consumer Apps', 'Enterprise Mobile', 'FinTech', 'HealthTech'],
          technologies: ['Swift', 'Kotlin', 'React Native', 'Flutter', 'Firebase'],
          pricing: 'Starting from $25,000',
          timeline: '12-20 weeks'
        },
        'ai-development': {
          name: 'AI Development',
          description: 'Cutting-edge AI and machine learning development services in San Francisco. Custom AI solutions for Silicon Valley companies.',
          specialties: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
          industries: ['AI Startups', 'FinTech', 'HealthTech', 'Autonomous Systems'],
          technologies: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI', 'AWS SageMaker'],
          pricing: 'Starting from $35,000',
          timeline: '16-24 weeks'
        }
      }
    },
    'new-york': {
      name: 'New York',
      state: 'New York',
      timezone: 'EST (UTC-5)',
      phone: '+1 (212) 555-0123',
      teamSize: '85+',
      established: '2016',
      services: {
        'fintech-development': {
          name: 'FinTech Development',
          description: 'Specialized FinTech software development services in New York City. Secure, compliant financial solutions for Wall Street and beyond.',
          specialties: ['Trading Platforms', 'Payment Systems', 'Blockchain', 'RegTech'],
          industries: ['Banking', 'Investment', 'Insurance', 'Cryptocurrency'],
          technologies: ['Java', 'C#', 'Blockchain', 'PostgreSQL', 'Redis'],
          pricing: 'Starting from $50,000',
          timeline: '16-28 weeks'
        },
        'enterprise-software': {
          name: 'Enterprise Software',
          description: 'Enterprise software development services in New York. Scalable solutions for large corporations and institutions.',
          specialties: ['ERP Systems', 'CRM Solutions', 'Workflow Automation', 'Integration'],
          industries: ['Finance', 'Media', 'Real Estate', 'Healthcare'],
          technologies: ['.NET', 'Java', 'SAP', 'Salesforce', 'Azure'],
          pricing: 'Starting from $75,000',
          timeline: '20-36 weeks'
        }
      }
    }
  },
  'united-kingdom': {
    'london': {
      name: 'London',
      state: 'England',
      timezone: 'GMT (UTC+0)',
      phone: '+44 20 7946 0958',
      teamSize: '95+',
      established: '2017',
      services: {
        'fintech-development': {
          name: 'FinTech Development',
          description: 'Premier FinTech development services in London. Regulatory-compliant financial solutions for the City of London.',
          specialties: ['Digital Banking', 'Payment Processing', 'RegTech', 'Open Banking'],
          industries: ['Banking', 'Insurance', 'Investment', 'Fintech Startups'],
          technologies: ['Java', 'Python', 'React', 'PostgreSQL', 'AWS'],
          pricing: 'Starting from £40,000',
          timeline: '16-24 weeks'
        },
        'blockchain-development': {
          name: 'Blockchain Development',
          description: 'Expert blockchain development services in London. Secure, scalable blockchain solutions for UK businesses.',
          specialties: ['Smart Contracts', 'DeFi', 'NFT Platforms', 'Cryptocurrency'],
          industries: ['Finance', 'Supply Chain', 'Real Estate', 'Gaming'],
          technologies: ['Solidity', 'Ethereum', 'Hyperledger', 'Web3.js', 'IPFS'],
          pricing: 'Starting from £60,000',
          timeline: '20-32 weeks'
        }
      }
    }
  },
  'india': {
    'bangalore': {
      name: 'Bangalore',
      state: 'Karnataka',
      timezone: 'IST (UTC+5:30)',
      phone: '+91 80 4717 4000',
      teamSize: '200+',
      established: '2012',
      services: {
        'mobile-app-development': {
          name: 'Mobile App Development',
          description: 'Professional mobile app development services in Bangalore, India. Cost-effective, high-quality mobile solutions.',
          specialties: ['Native Apps', 'Cross-Platform', 'Progressive Web Apps', 'App Maintenance'],
          industries: ['Healthcare', 'E-commerce', 'Education', 'Fintech'],
          technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
          pricing: 'Starting from $8,000',
          timeline: '8-16 weeks'
        },
        'web-development': {
          name: 'Web Development',
          description: 'Expert web development services in Bangalore. Modern, responsive websites and web applications.',
          specialties: ['Full-Stack Development', 'E-commerce', 'SaaS', 'CMS'],
          industries: ['E-commerce', 'Healthcare', 'Education', 'Startups'],
          technologies: ['React', 'Node.js', 'Python', 'PHP', 'AWS'],
          pricing: 'Starting from $5,000',
          timeline: '6-12 weeks'
        }
      }
    }
  }
};

// Helper function to get location and service data
const getLocationServiceData = (country: string, city: string, service: string) => {
  const countryData = LOCATION_SERVICE_DATA[country as keyof typeof LOCATION_SERVICE_DATA];
  if (!countryData) return null;
  
  const cityData = countryData[city as keyof typeof countryData] as any;
  if (!cityData || !cityData.services) return null;
  
  const serviceData = cityData.services[service as keyof typeof cityData.services];
  if (!serviceData) return null;
  
  return {
    country: country.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    city: cityData,
    service: serviceData
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, city, service } = params;
  
  const data = getLocationServiceData(country, city, service);
  if (!data) {
    return {
      title: 'Service Not Found | Zoptal',
      description: 'The requested service page could not be found.',
    };
  }

  const cityName = data.city.name;
  const serviceName = data.service.name;
  const countryName = data.country;
  
  const keywords = keywordsByCategory.services.concat([
    `${serviceName.toLowerCase()} ${cityName.toLowerCase()}`,
    `${serviceName.toLowerCase()} ${countryName.toLowerCase()}`,
    `software development ${cityName.toLowerCase()}`,
    `${cityName.toLowerCase()} software company`,
    `${cityName.toLowerCase()} developers`
  ]);

  return {
    title: `${serviceName} in ${cityName}, ${countryName} | Zoptal`,
    description: data.service.description,
    keywords: keywords,
    openGraph: {
      title: `${serviceName} in ${cityName} | Zoptal`,
      description: data.service.description,
      type: 'website',
      url: `https://zoptal.com/locations/${country}/${city}/${service}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${serviceName} in ${cityName} | Zoptal`,
      description: data.service.description,
    },
    alternates: {
      canonical: `https://zoptal.com/locations/${country}/${city}/${service}`,
      languages: generateLocationHreflangLinks(country, city, service).reduce((acc, link) => {
        acc[link.hreflang] = link.href;
        return acc;
      }, {} as Record<string, string>),
    },
  };
}

export default function LocationServicePage({ params }: Props) {
  const { country, city, service } = params;
  
  const data = getLocationServiceData(country, city, service);
  if (!data) {
    notFound();
  }

  const cityName = data.city.name;
  const serviceName = data.service.name;
  const countryName = data.country;

  const serviceSchema = generateServiceSchema({
    name: `${serviceName} in ${cityName}`,
    description: data.service.description,
    provider: {
      name: 'Zoptal',
      url: 'https://zoptal.com'
    },
    areaServed: `${cityName}, ${countryName}`,
    serviceType: serviceName,
    url: `https://zoptal.com/locations/${country}/${city}/${service}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Locations', url: 'https://zoptal.com/locations' },
      { name: countryName, url: `https://zoptal.com/locations/${country}` },
      { name: cityName, url: `https://zoptal.com/locations/${country}/${city}` },
      { name: serviceName, url: `https://zoptal.com/locations/${country}/${city}/${service}` },
    ]
  });

  const localBusinessSchema = generateLocalBusinessSchema({
    name: `Zoptal ${cityName}`,
    description: data.service.description,
    address: {
      streetAddress: "123 Tech Street",
      addressLocality: cityName,
      addressRegion: data.city.state,
      postalCode: "12345",
      addressCountry: countryName,
    },
    telephone: data.city.phone,
    url: `https://zoptal.com/locations/${country}/${city}/${service}`,
    services: [serviceName],
  });

  const hreflangLinks = generateLocationHreflangLinks(country, city, service);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      
      {/* Hreflang links */}
      {hreflangLinks.map((link) => (
        <link
          key={link.hreflang}
          rel="alternate"
          hrefLang={link.hreflang}
          href={link.href}
        />
      ))}

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
                <Link href="/locations" className="text-gray-500 hover:text-gray-700">
                  Locations
                </Link>
              </li>
              <li>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li>
                <Link href={`/locations/${country}`} className="text-gray-500 hover:text-gray-700">
                  {countryName}
                </Link>
              </li>
              <li>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li>
                <Link href={`/locations/${country}/${city}`} className="text-gray-500 hover:text-gray-700">
                  {cityName}
                </Link>
              </li>
              <li>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li className="text-gray-900 font-medium">
                {serviceName}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <MapPinIcon className="w-8 h-8 text-blue-300 mr-3" />
                <span className="text-blue-200 text-lg">{cityName}, {countryName}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                {serviceName} in {cityName}
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {data.service.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 text-center"
                >
                  Get Started in {cityName}
                </Link>
                <Link
                  href={`/locations/${country}/${city}`}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300 text-center"
                >
                  View All {cityName} Services
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">{data.city.teamSize}</div>
                  <div className="text-white font-semibold mb-1">Local Developers</div>
                  <div className="text-blue-200 text-sm">In {cityName}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">{data.city.established}</div>
                  <div className="text-white font-semibold mb-1">Established</div>
                  <div className="text-blue-200 text-sm">Local presence</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">{data.service.timeline}</div>
                  <div className="text-white font-semibold mb-1">Project Timeline</div>
                  <div className="text-blue-200 text-sm">Typical delivery</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">24/7</div>
                  <div className="text-white font-semibold mb-1">Support</div>
                  <div className="text-blue-200 text-sm">Local timezone</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local Office Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <MapPinIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600">{cityName}, {data.city.state}</p>
            </div>
            <div className="p-6">
              <PhoneIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">{data.city.phone}</p>
            </div>
            <div className="p-6">
              <ClockIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Timezone</h3>
              <p className="text-gray-600">{data.city.timezone}</p>
            </div>
            <div className="p-6">
              <UsersIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Team Size</h3>
              <p className="text-gray-600">{data.city.teamSize} developers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {serviceName} Specialties
              </h2>
              <p className="text-gray-600 mb-8">
                Our {cityName} team specializes in cutting-edge {serviceName.toLowerCase()} solutions.
              </p>
              <ul className="space-y-4">
                {data.service.specialties.map((specialty: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{specialty}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Industries We Serve
              </h2>
              <p className="text-gray-600 mb-8">
                Deep expertise across key industries in {cityName}.
              </p>
              <ul className="space-y-4">
                {data.service.industries.map((industry: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{industry}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Technologies We Use
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Modern technology stack for {serviceName.toLowerCase()} in {cityName}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {data.service.technologies.map((tech: string, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg px-6 py-3 text-center">
                <span className="text-gray-800 font-medium">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Project Investment & Timeline
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent pricing for {serviceName.toLowerCase()} projects in {cityName}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-8 shadow-md text-center">
              <CogIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Investment</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">{data.service.pricing}</div>
              <p className="text-gray-600">Competitive {cityName} rates</p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md text-center">
              <ClockIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Timeline</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">{data.service.timeline}</div>
              <p className="text-gray-600">Typical project duration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Local */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our {cityName} Team?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Local expertise with global standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: MapPinIcon,
                title: 'Local Presence',
                description: `Established ${cityName} office with local developers who understand the market.`
              },
              {
                icon: ClockIcon,
                title: 'Timezone Advantage',
                description: `Work in ${data.city.timezone} for real-time collaboration and immediate support.`
              },
              {
                icon: UsersIcon,
                title: 'Expert Team',
                description: `${data.city.teamSize} experienced developers specializing in ${serviceName.toLowerCase()}.`
              },
              {
                icon: StarIcon,
                title: 'Proven Results',
                description: `Successful ${serviceName.toLowerCase()} projects delivered in ${cityName} since ${data.city.established}.`
              }
            ].map((advantage, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <advantage.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{advantage.title}</h3>
                <p className="text-gray-600">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Start Your {serviceName} Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Connect with our expert {serviceName.toLowerCase()} team in {cityName} and bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 flex items-center justify-center"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Contact {cityName} Team
            </Link>
            <Link
              href={`/services/${service}`}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300"
            >
              Learn More About {serviceName}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export async function generateStaticParams() {
  // Generate static params for supported location-service combinations
  const params = [];
  
  for (const [country, countryData] of Object.entries(LOCATION_SERVICE_DATA)) {
    for (const [city, cityData] of Object.entries(countryData)) {
      for (const service of Object.keys(cityData.services)) {
        params.push({
          country,
          city,
          service,
        });
      }
    }
  }
  
  return params;
}