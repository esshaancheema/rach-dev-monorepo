import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, MapPinIcon, GlobeAltIcon, BuildingOfficeIcon, PhoneIcon, ClockIcon, StarIcon, CheckIcon, UsersIcon, CogIcon } from '@heroicons/react/24/outline';
import { keywordsByCategory } from '@/lib/seo/keywords';
import { generateServiceSchema, generateBreadcrumbSchema, generateLocalBusinessSchema } from '@/lib/seo/schemas';
import { generateLocationHreflangLinks } from '@/lib/seo/hreflang';
import { notFound } from 'next/navigation';

interface Props {
  params: {
    country: string;
  };
}

// Define supported countries
const SUPPORTED_COUNTRIES = [
  'united-states',
  'united-kingdom', 
  'germany',
  'canada',
  'india',
  'australia',
  'netherlands',
  'singapore',
  'france',
  'poland'
];

// Country-specific data
const getCountryData = (country: string) => {
  const countryMap: Record<string, any> = {
    'united-states': {
      name: 'United States',
      flag: '🇺🇸',
      capital: 'Washington, D.C.',
      timezone: 'EST/PST',
      currency: 'USD',
      language: 'English',
      description: 'Leading software development services across the United States with expertise in enterprise solutions, fintech, and healthcare technology.',
      majorCities: [
        {
          name: 'San Francisco',
          state: 'California',
          specialties: ['AI/ML', 'Blockchain', 'Enterprise SaaS'],
          teamSize: '125+ developers',
          timezone: 'PST (UTC-8)',
          industries: ['FinTech', 'HealthTech', 'EdTech']
        },
        {
          name: 'New York',
          state: 'New York',
          specialties: ['FinTech', 'E-commerce', 'Enterprise Solutions'],
          teamSize: '85+ developers',
          timezone: 'EST (UTC-5)',
          industries: ['Banking', 'Insurance', 'Media']
        },
        {
          name: 'Austin',
          state: 'Texas',
          specialties: ['Mobile Apps', 'SaaS', 'DevOps'],
          teamSize: '65+ developers',
          timezone: 'CST (UTC-6)',
          industries: ['Technology', 'Energy', 'Healthcare']
        }
      ],
      services: ['Custom Software Development', 'Enterprise Solutions', 'Mobile App Development', 'AI/ML Solutions'],
      industries: ['Financial Services', 'Healthcare', 'Technology', 'E-commerce', 'Manufacturing'],
      certifications: ['SOC 2 Type II', 'ISO 27001', 'HIPAA Compliant'],
      stats: {
        teamSize: '275+',
        projectsCompleted: '850+',
        yearsExperience: '12+',
        clientSatisfaction: '98%'
      }
    },
    'united-kingdom': {
      name: 'United Kingdom',
      flag: '🇬🇧',
      capital: 'London',
      timezone: 'GMT',
      currency: 'GBP',
      language: 'English',
      description: 'Premier software development services in the UK with deep expertise in financial technology, regulatory compliance, and enterprise solutions.',
      majorCities: [
        {
          name: 'London',
          state: 'England',
          specialties: ['FinTech', 'RegTech', 'Enterprise Solutions'],
          teamSize: '95+ developers',
          timezone: 'GMT (UTC+0)',
          industries: ['Banking', 'Insurance', 'Government']
        },
        {
          name: 'Manchester',
          state: 'England',
          specialties: ['E-commerce', 'SaaS', 'Cloud Solutions'],
          teamSize: '45+ developers',
          timezone: 'GMT (UTC+0)',
          industries: ['Retail', 'Manufacturing', 'Logistics']
        },
        {
          name: 'Edinburgh',
          state: 'Scotland',
          specialties: ['Data Analytics', 'AI/ML', 'Research Tech'],
          teamSize: '35+ developers',
          timezone: 'GMT (UTC+0)',
          industries: ['Research', 'Education', 'Energy']
        }
      ],
      services: ['FinTech Development', 'Regulatory Compliance', 'Enterprise Integration', 'Cloud Migration'],
      industries: ['Financial Services', 'Insurance', 'Government', 'Energy', 'Healthcare'],
      certifications: ['ISO 27001', 'GDPR Compliant', 'FCA Regulated'],
      stats: {
        teamSize: '175+',
        projectsCompleted: '650+',
        yearsExperience: '10+',
        clientSatisfaction: '97%'
      }
    },
    'germany': {
      name: 'Germany',
      flag: '🇩🇪',
      capital: 'Berlin',
      timezone: 'CET',
      currency: 'EUR',
      language: 'German/English',
      description: 'Advanced software development services in Germany focusing on Industry 4.0, automotive technology, and enterprise digitalization.',
      majorCities: [
        {
          name: 'Berlin',
          state: 'Berlin',
          specialties: ['IoT', 'Industry 4.0', 'Automotive Tech'],
          teamSize: '85+ developers',
          timezone: 'CET (UTC+1)',
          industries: ['Manufacturing', 'Automotive', 'Energy']
        },
        {
          name: 'Munich',
          state: 'Bavaria',
          specialties: ['Enterprise Software', 'SAP Solutions', 'Cloud Platforms'],
          teamSize: '55+ developers',
          timezone: 'CET (UTC+1)',
          industries: ['Manufacturing', 'Finance', 'Technology']
        },
        {
          name: 'Hamburg',
          state: 'Hamburg',
          specialties: ['Logistics Tech', 'Maritime Solutions', 'Supply Chain'],
          teamSize: '40+ developers',
          timezone: 'CET (UTC+1)',
          industries: ['Logistics', 'Maritime', 'Trade']
        }
      ],
      services: ['Industry 4.0 Solutions', 'Automotive Software', 'IoT Development', 'Enterprise Systems'],
      industries: ['Automotive', 'Manufacturing', 'Energy', 'Logistics', 'Finance'],
      certifications: ['ISO 27001', 'GDPR Compliant', 'BSI Certified'],
      stats: {
        teamSize: '180+',
        projectsCompleted: '550+',
        yearsExperience: '8+',
        clientSatisfaction: '96%'
      }
    },
    'india': {
      name: 'India',
      flag: '🇮🇳',
      capital: 'New Delhi',
      timezone: 'IST',
      currency: 'INR',
      language: 'English/Hindi',
      description: 'Comprehensive software development services across India with expertise in mobile applications, cloud solutions, and enterprise software.',
      majorCities: [
        {
          name: 'Bangalore',
          state: 'Karnataka',
          specialties: ['Mobile Apps', 'Cloud Solutions', 'DevOps'],
          teamSize: '200+ developers',
          timezone: 'IST (UTC+5:30)',
          industries: ['Healthcare', 'E-commerce', 'Education']
        },
        {
          name: 'Mumbai',
          state: 'Maharashtra',
          specialties: ['FinTech', 'Enterprise Solutions', 'Data Analytics'],
          teamSize: '125+ developers',
          timezone: 'IST (UTC+5:30)',
          industries: ['Finance', 'Media', 'Entertainment']
        },
        {
          name: 'Hyderabad',
          state: 'Telangana',
          specialties: ['AI/ML', 'Blockchain', 'Cloud Platforms'],
          teamSize: '95+ developers',
          timezone: 'IST (UTC+5:30)',
          industries: ['Technology', 'Pharmaceuticals', 'Biotechnology']
        }
      ],
      services: ['Mobile App Development', 'Cloud Migration', 'AI/ML Solutions', 'Quality Assurance'],
      industries: ['Healthcare', 'E-commerce', 'Education', 'Finance', 'Technology'],
      certifications: ['CMMI Level 5', 'ISO 9001', 'ISO 27001'],
      stats: {
        teamSize: '420+',
        projectsCompleted: '1200+',
        yearsExperience: '15+',
        clientSatisfaction: '99%'
      }
    }
  };

  return countryMap[country] || null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = params;
  
  if (!SUPPORTED_COUNTRIES.includes(country)) {
    return {
      title: 'Country Not Found | Zoptal',
      description: 'The requested country page could not be found.',
    };
  }

  const countryData = getCountryData(country);
  if (!countryData) {
    return {
      title: 'Country Not Found | Zoptal',
      description: 'The requested country page could not be found.',
    };
  }

  const keywords = keywordsByCategory.services.concat([
    `software development ${countryData.name.toLowerCase()}`,
    `${countryData.name.toLowerCase()} software company`,
    `app development ${countryData.name.toLowerCase()}`,
    `custom software ${countryData.name.toLowerCase()}`,
    `tech solutions ${countryData.name.toLowerCase()}`
  ]);

  return {
    title: `Software Development in ${countryData.name} | Zoptal ${countryData.name}`,
    description: countryData.description,
    keywords: keywords,
    openGraph: {
      title: `Software Development in ${countryData.name} | Zoptal`,
      description: countryData.description,
      type: 'website',
      url: `https://zoptal.com/locations/${country}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Software Development in ${countryData.name} | Zoptal`,
      description: countryData.description,
    },
    alternates: {
      canonical: `https://zoptal.com/locations/${country}`,
      languages: generateLocationHreflangLinks(country).reduce((acc, link) => {
        acc[link.hreflang] = link.href;
        return acc;
      }, {} as Record<string, string>),
    },
  };
}

export default function CountryPage({ params }: Props) {
  const { country } = params;
  
  if (!SUPPORTED_COUNTRIES.includes(country)) {
    notFound();
  }

  const countryData = getCountryData(country);
  if (!countryData) {
    notFound();
  }

  const serviceSchema = generateServiceSchema({
    name: `Software Development Services in ${countryData.name}`,
    description: countryData.description,
    provider: 'Zoptal',
    areaServed: countryData.name,
    serviceType: 'Software Development',
    url: `https://zoptal.com/locations/${country}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Locations', url: 'https://zoptal.com/locations' },
      { name: countryData.name, url: `https://zoptal.com/locations/${country}` },
    ]
  });

  const localBusinessSchema = generateLocalBusinessSchema({
    name: `Zoptal ${countryData.name}`,
    description: countryData.description,
    address: {
      country: countryData.name,
      locality: countryData.capital,
    },
    telephone: '+1-800-ZOPTAL-1',
    url: `https://zoptal.com/locations/${country}`,
    serviceArea: countryData.name,
  });

  const hreflangLinks = generateLocationHreflangLinks(country);

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
              <li className="text-gray-900 font-medium">
                {countryData.name}
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
                <span className="text-6xl mr-4">{countryData.flag}</span>
                <h1 className="text-4xl sm:text-5xl font-bold">
                  Software Development in {countryData.name}
                </h1>
              </div>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {countryData.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 text-center"
                >
                  Contact {countryData.name} Team
                </Link>
                <Link
                  href="/services"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300 text-center"
                >
                  View Services
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">{countryData.stats.teamSize}</div>
                  <div className="text-white font-semibold mb-1">Expert Developers</div>
                  <div className="text-blue-200 text-sm">Local team</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">{countryData.stats.projectsCompleted}</div>
                  <div className="text-white font-semibold mb-1">Projects Completed</div>
                  <div className="text-blue-200 text-sm">Successfully delivered</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">{countryData.stats.yearsExperience}</div>
                  <div className="text-white font-semibold mb-1">Years Experience</div>
                  <div className="text-blue-200 text-sm">In {countryData.name}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-200 mb-2">{countryData.stats.clientSatisfaction}</div>
                  <div className="text-white font-semibold mb-1">Client Satisfaction</div>
                  <div className="text-blue-200 text-sm">Success rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Country Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <MapPinIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Capital</h3>
              <p className="text-gray-600">{countryData.capital}</p>
            </div>
            <div className="p-6">
              <ClockIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Timezone</h3>
              <p className="text-gray-600">{countryData.timezone}</p>
            </div>
            <div className="p-6">
              <GlobeAltIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Language</h3>
              <p className="text-gray-600">{countryData.language}</p>
            </div>
            <div className="p-6">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Currency</h3>
              <p className="text-gray-600">{countryData.currency}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Major Cities */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Development Centers in {countryData.name}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Strategic locations across major tech hubs in {countryData.name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {countryData.majorCities.map((city: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <MapPinIcon className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{city.name}</h3>
                    <p className="text-gray-600">{city.state}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <UsersIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{city.teamSize}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{city.timezone}</span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Specialties:</h4>
                    <div className="flex flex-wrap gap-1">
                      {city.specialties.map((specialty: string, specIndex: number) => (
                        <span key={specIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Industries:</h4>
                    <p className="text-gray-600 text-sm">{city.industries.join(', ')}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <Link
                      href={`/locations/${country}/${city.name.toLowerCase().replace(' ', '-')}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Learn more about {city.name} →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services & Industries */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Services in {countryData.name}
              </h2>
              <p className="text-gray-600 mb-8">
                Comprehensive software development services tailored for the {countryData.name} market.
              </p>
              <ul className="space-y-4">
                {countryData.services.map((service: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Industries We Serve
              </h2>
              <p className="text-gray-600 mb-8">
                Deep expertise across key industries in {countryData.name}.
              </p>
              <ul className="space-y-4">
                {countryData.industries.map((industry: string, index: number) => (
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

      {/* Certifications & Compliance */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Certifications & Compliance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meeting the highest standards for security and quality in {countryData.name}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {countryData.certifications.map((cert: string, index: number) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md text-center min-w-[200px]">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <StarIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{cert}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Zoptal in {countryData.name}?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Local expertise with global standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: UsersIcon,
                title: 'Local Talent',
                description: `Expert developers based in ${countryData.name} who understand local market needs.`
              },
              {
                icon: ClockIcon,
                title: 'Timezone Advantage',
                description: `Work in ${countryData.timezone} timezone for real-time collaboration and support.`
              },
              {
                icon: GlobeAltIcon,
                title: 'Cultural Understanding',
                description: `Deep understanding of ${countryData.name} business culture and practices.`
              },
              {
                icon: CogIcon,
                title: 'Compliance Expertise',
                description: `Full compliance with ${countryData.name} regulations and industry standards.`
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
            Ready to Start Your Project in {countryData.name}?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Connect with our {countryData.name} team and experience world-class software development with local expertise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 flex items-center justify-center"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Contact {countryData.name} Team
            </Link>
            <Link
              href="/services"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300"
            >
              View Our Services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export async function generateStaticParams() {
  return SUPPORTED_COUNTRIES.map((country) => ({
    country,
  }));
}