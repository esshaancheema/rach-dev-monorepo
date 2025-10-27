import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, MapPinIcon, GlobeAltIcon, BuildingOfficeIcon, PhoneIcon, ClockIcon, StarIcon, CheckIcon, UsersIcon } from '@heroicons/react/24/outline';
import { keywordsByCategory } from '@/lib/seo/keywords';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';
import { generateHreflangLinks } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'Global Software Development Locations | Zoptal Worldwide Offices',
  description: 'Discover Zoptal\'s global presence. Software development services across North America, Europe, Asia, and more. Local expertise, global reach.',
  keywords: [
    ...keywordsByCategory.services,
    'software development locations',
    'global software development',
    'nearshore development',
    'offshore development',
    'software development companies',
    'tech hubs',
    'development centers',
    'international software teams',
    'global tech services',
    'distributed development',
    'worldwide software solutions',
    'local software developers',
    'regional development services'
  ],
  openGraph: {
    title: 'Global Software Development Locations | Zoptal',
    description: 'Discover Zoptal\'s global presence. Software development services worldwide with local expertise.',
    type: 'website',
    url: 'https://zoptal.com/locations',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Software Development Locations | Zoptal',
    description: 'Discover Zoptal\'s global presence. Software development services worldwide with local expertise.',
  },
  alternates: {
    canonical: 'https://zoptal.com/locations',
    languages: generateHreflangLinks('locations').reduce((acc, link) => {
      acc[link.hreflang] = link.href;
      return acc;
    }, {} as Record<string, string>),
  },
};

export default function LocationsPage() {
  const serviceSchema = generateServiceSchema({
    name: 'Global Software Development Services',
    description: 'Worldwide software development services with local expertise across multiple continents and time zones.',
    provider: 'Zoptal',
    areaServed: 'Global',
    serviceType: 'Software Development',
    url: 'https://zoptal.com/locations',
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Locations', url: 'https://zoptal.com/locations' },
    ]
  });

  const hreflangLinks = generateHreflangLinks('locations');

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
              <li className="text-gray-900 font-medium">
                Locations
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Global Software Development
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              World-class software development services across multiple continents. Local expertise, global reach, and round-the-clock support for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 text-center"
              >
                Find Your Local Team
              </Link>
              <Link
                href="/services"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300 text-center"
              >
                View Services
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-200 mb-2">25+</div>
              <div className="text-white font-semibold mb-1">Countries Served</div>
              <div className="text-blue-200 text-sm">Global presence</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-200 mb-2">24/7</div>
              <div className="text-white font-semibold mb-1">Development Support</div>
              <div className="text-blue-200 text-sm">Round-the-clock</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-200 mb-2">500+</div>
              <div className="text-white font-semibold mb-1">Expert Developers</div>
              <div className="text-blue-200 text-sm">Worldwide team</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-200 mb-2">15+</div>
              <div className="text-white font-semibold mb-1">Time Zones</div>
              <div className="text-blue-200 text-sm">Global coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence Map */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Global Presence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Strategic locations across major tech hubs to serve you better
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                region: 'North America',
                countries: ['United States', 'Canada', 'Mexico'],
                mainCities: ['New York', 'San Francisco', 'Toronto', 'Mexico City'],
                timeZones: 'EST, PST, CST',
                specialties: ['Enterprise Solutions', 'FinTech', 'HealthTech', 'AI/ML'],
                languages: ['English', 'Spanish', 'French']
              },
              {
                region: 'Europe',
                countries: ['United Kingdom', 'Germany', 'Netherlands', 'Poland'],
                mainCities: ['London', 'Berlin', 'Amsterdam', 'Warsaw'],
                timeZones: 'GMT, CET',
                specialties: ['SaaS Development', 'E-commerce', 'Blockchain', 'IoT'],
                languages: ['English', 'German', 'Dutch', 'Polish']
              },
              {
                region: 'Asia Pacific',
                countries: ['India', 'Singapore', 'Australia', 'Japan'],
                mainCities: ['Bangalore', 'Mumbai', 'Singapore', 'Sydney', 'Tokyo'],
                timeZones: 'IST, SGT, AEST, JST',
                specialties: ['Mobile Development', 'Cloud Solutions', 'DevOps', 'QA'],
                languages: ['English', 'Hindi', 'Japanese', 'Mandarin']
              }
            ].map((region, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <GlobeAltIcon className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">{region.region}</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Countries:</h4>
                    <p className="text-gray-600 text-sm">{region.countries.join(', ')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Major Cities:</h4>
                    <p className="text-gray-600 text-sm">{region.mainCities.join(', ')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Time Zones:</h4>
                    <p className="text-gray-600 text-sm">{region.timeZones}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-1">
                      {region.specialties.map((specialty, specIndex) => (
                        <span key={specIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Languages:</h4>
                    <p className="text-gray-600 text-sm">{region.languages.join(', ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Locations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Featured Development Centers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our primary development centers in major tech hubs worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                city: 'San Francisco',
                country: 'United States',
                flag: '🇺🇸',
                teamSize: '125+ developers',
                timezone: 'PST (UTC-8)',
                specialties: ['AI/ML', 'Blockchain', 'Enterprise SaaS'],
                industries: ['FinTech', 'HealthTech', 'EdTech'],
                languages: ['English'],
                established: '2015',
                certifications: ['SOC 2', 'ISO 27001'],
                workingHours: '9 AM - 6 PM PST'
              },
              {
                city: 'London',
                country: 'United Kingdom',
                flag: '🇬🇧',
                teamSize: '95+ developers',
                timezone: 'GMT (UTC+0)',
                specialties: ['FinTech', 'E-commerce', 'RegTech'],
                industries: ['Banking', 'Insurance', 'Retail'],
                languages: ['English'],
                established: '2017',
                certifications: ['ISO 27001', 'GDPR Compliant'],
                workingHours: '9 AM - 6 PM GMT'
              },
              {
                city: 'Bangalore',
                country: 'India',
                flag: '🇮🇳',
                teamSize: '200+ developers',
                timezone: 'IST (UTC+5:30)',
                specialties: ['Mobile Apps', 'Cloud Solutions', 'DevOps'],
                industries: ['Healthcare', 'E-commerce', 'Education'],
                languages: ['English', 'Hindi'],
                established: '2012',
                certifications: ['CMMI Level 5', 'ISO 9001'],
                workingHours: '9 AM - 6 PM IST'
              },
              {
                city: 'Toronto',
                country: 'Canada',
                flag: '🇨🇦',
                teamSize: '75+ developers',
                timezone: 'EST (UTC-5)',
                specialties: ['Enterprise Software', 'Data Analytics'],
                industries: ['Manufacturing', 'Government', 'Energy'],
                languages: ['English', 'French'],
                established: '2019',
                certifications: ['SOC 2', 'Privacy Shield'],
                workingHours: '9 AM - 6 PM EST'
              },
              {
                city: 'Berlin',
                country: 'Germany',
                flag: '🇩🇪',
                teamSize: '85+ developers',
                timezone: 'CET (UTC+1)',
                specialties: ['IoT', 'Industry 4.0', 'Automotive Tech'],
                industries: ['Manufacturing', 'Automotive', 'Energy'],
                languages: ['German', 'English'],
                established: '2018',
                certifications: ['ISO 27001', 'GDPR Compliant'],
                workingHours: '9 AM - 6 PM CET'
              },
              {
                city: 'Singapore',
                country: 'Singapore',
                flag: '🇸🇬',
                teamSize: '65+ developers',
                timezone: 'SGT (UTC+8)',
                specialties: ['FinTech', 'Smart City Solutions'],
                industries: ['Banking', 'Logistics', 'Government'],
                languages: ['English', 'Mandarin'],
                established: '2020',
                certifications: ['MAS Compliant', 'ISO 27001'],
                workingHours: '9 AM - 6 PM SGT'
              }
            ].map((location, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{location.flag}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{location.city}</h3>
                    <p className="text-gray-600">{location.country}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <UsersIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{location.teamSize}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{location.timezone}</span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Specialties:</h4>
                    <div className="flex flex-wrap gap-1">
                      {location.specialties.map((specialty, specIndex) => (
                        <span key={specIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Industries:</h4>
                    <p className="text-gray-600 text-sm">{location.industries.join(', ')}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Certifications:</h4>
                    <div className="flex flex-wrap gap-1">
                      {location.certifications.map((cert, certIndex) => (
                        <span key={certIndex} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <Link
                      href={`/locations/${location.country.toLowerCase().replace(' ', '-')}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Learn more about {location.city} →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Advantages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Global Development Advantages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Benefits of working with our globally distributed development teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: ClockIcon,
                title: '24/7 Development Cycle',
                description: 'Continuous development across time zones ensures faster delivery and round-the-clock support.'
              },
              {
                icon: UsersIcon,
                title: 'Access to Global Talent',
                description: 'Tap into the world\'s best developers and specialists across different regions and expertise areas.'
              },
              {
                icon: GlobeAltIcon,
                title: 'Cultural & Market Insights',
                description: 'Local market knowledge and cultural understanding for better product localization and user experience.'
              },
              {
                icon: StarIcon,
                title: 'Cost Optimization',
                description: 'Optimal cost structure through strategic resource allocation across different cost-effective regions.'
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

      {/* How We Work Globally */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How We Work Across Borders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Seamless collaboration and project management across global teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Unified Communication',
                description: 'Single communication channels and project management tools across all locations.',
                features: ['Slack/Teams integration', 'Daily standups', 'Video conferencing', 'Real-time collaboration']
              },
              {
                title: 'Standardized Processes',
                description: 'Consistent development methodologies and quality standards across all teams.',
                features: ['Agile/Scrum methodology', 'Code review standards', 'CI/CD pipelines', 'Quality assurance']
              },
              {
                title: 'Knowledge Sharing',
                description: 'Continuous knowledge transfer and best practice sharing between teams.',
                features: ['Technical documentation', 'Code repositories', 'Training programs', 'Mentorship']
              },
              {
                title: 'Cultural Integration',
                description: 'Building cohesive teams that work effectively across cultural boundaries.',
                features: ['Cultural awareness training', 'Team building activities', 'Cross-location exchanges', 'Inclusive practices']
              },
              {
                title: 'Time Zone Management',
                description: 'Strategic overlap hours and handoff processes for continuous development.',
                features: ['Overlap scheduling', 'Async communication', 'Clear handoff protocols', 'Documentation standards']
              },
              {
                title: 'Local Compliance',
                description: 'Adherence to local regulations and international standards.',
                features: ['Data protection laws', 'Security certifications', 'Industry compliance', 'Legal requirements']
              }
            ].map((process, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{process.title}</h3>
                <p className="text-gray-600 mb-4">{process.description}</p>
                <ul className="space-y-2">
                  {process.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700">
                      <CheckIcon className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Country Links */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Explore Our Locations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn more about our services and teams in specific countries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { country: 'United States', flag: '🇺🇸', cities: ['New York', 'San Francisco', 'Austin'] },
              { country: 'United Kingdom', flag: '🇬🇧', cities: ['London', 'Manchester', 'Edinburgh'] },
              { country: 'Germany', flag: '🇩🇪', cities: ['Berlin', 'Munich', 'Hamburg'] },
              { country: 'Canada', flag: '🇨🇦', cities: ['Toronto', 'Vancouver', 'Montreal'] },
              { country: 'India', flag: '🇮🇳', cities: ['Bangalore', 'Mumbai', 'Hyderabad'] },
              { country: 'Australia', flag: '🇦🇺', cities: ['Sydney', 'Melbourne', 'Brisbane'] },
              { country: 'Netherlands', flag: '🇳🇱', cities: ['Amsterdam', 'Rotterdam', 'Utrecht'] },
              { country: 'Singapore', flag: '🇸🇬', cities: ['Singapore'] }
            ].map((country, index) => (
              <Link
                key={index}
                href={`/locations/${country.country.toLowerCase().replace(' ', '-')}`}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300 block"
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{country.flag}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{country.country}</h3>
                </div>
                <p className="text-gray-600 text-sm">{country.cities.join(', ')}</p>
                <div className="mt-3 text-blue-600 font-medium text-sm">
                  Explore {country.country} →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Start Your Global Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Connect with our global development teams and experience the power of distributed software development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 flex items-center justify-center"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Get Started Today
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