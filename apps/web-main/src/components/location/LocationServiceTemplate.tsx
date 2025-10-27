'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LocationData } from '@/lib/location/types';
import { 
  ChevronRightIcon, 
  CheckIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  StarIcon as StarIconSolid,
  ClockIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface LocationServiceTemplateProps {
  location: LocationData;
  service: string;
  serviceTitle: string;
}

// Service-specific data
const serviceData: Record<string, any> = {
  'web-development': {
    icon: '🌐',
    description: 'Custom web applications and responsive websites that drive business growth',
    benefits: [
      'Responsive design for all devices',
      'SEO optimization included', 
      'Fast loading speeds',
      'Secure and scalable architecture',
      'CMS integration',
      'E-commerce capabilities'
    ],
    process: [
      { step: 1, title: 'Discovery & Planning', description: 'Understanding your business needs and target audience' },
      { step: 2, title: 'Design & Prototyping', description: 'Creating wireframes and visual designs' },
      { step: 3, title: 'Development', description: 'Building your website with latest technologies' },
      { step: 4, title: 'Testing & Launch', description: 'Quality assurance and deployment' },
      { step: 5, title: 'Maintenance', description: 'Ongoing support and updates' }
    ],
    technologies: [
      'React', 'Next.js', 'Vue.js', 'Node.js', 'Python', 'PHP', 'WordPress', 'Shopify'
    ],
    startingPrice: '$5,000',
    timeline: '4-12 weeks'
  },
  'mobile-development': {
    icon: '📱',
    description: 'Native iOS and Android applications that engage users and drive conversions',
    benefits: [
      'Native iOS & Android development',
      'Cross-platform solutions',
      'App Store optimization',
      'Push notifications',
      'Analytics integration',
      'Offline functionality'
    ],
    process: [
      { step: 1, title: 'Strategy & Planning', description: 'Defining app features and user experience' },
      { step: 2, title: 'UI/UX Design', description: 'Creating intuitive mobile interfaces' },
      { step: 3, title: 'Development', description: 'Building native or cross-platform apps' },
      { step: 4, title: 'Testing', description: 'Comprehensive testing on multiple devices' },
      { step: 5, title: 'App Store Launch', description: 'Publishing and marketing your app' }
    ],
    technologies: [
      'Swift', 'Kotlin', 'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Firebase', 'AWS'
    ],
    startingPrice: '$15,000',
    timeline: '8-20 weeks'
  },
  'ai-development': {
    icon: '🤖',
    description: 'Artificial intelligence and machine learning solutions for business automation',
    benefits: [
      'Process automation',
      'Predictive analytics',
      'Natural language processing',
      'Computer vision',
      'Chatbots and virtual assistants',
      'Data insights and reporting'
    ],
    process: [
      { step: 1, title: 'Use Case Analysis', description: 'Identifying AI opportunities in your business' },
      { step: 2, title: 'Data Preparation', description: 'Collecting and preparing training data' },
      { step: 3, title: 'Model Development', description: 'Building and training AI models' },
      { step: 4, title: 'Integration', description: 'Integrating AI into your existing systems' },
      { step: 5, title: 'Optimization', description: 'Continuous improvement and monitoring' }
    ],
    technologies: [
      'Python', 'TensorFlow', 'PyTorch', 'OpenAI', 'AWS AI', 'Google AI', 'Azure AI', 'Hugging Face'
    ],
    startingPrice: '$25,000',
    timeline: '12-24 weeks'
  },
  'software-development': {
    icon: '💻',
    description: 'Custom enterprise software solutions tailored to your business requirements',
    benefits: [
      'Custom business logic',
      'Scalable architecture',
      'Third-party integrations',
      'Database optimization',
      'API development',
      'Cloud deployment'
    ],
    process: [
      { step: 1, title: 'Requirements Analysis', description: 'Understanding your business processes' },
      { step: 2, title: 'System Architecture', description: 'Designing scalable software architecture' },
      { step: 3, title: 'Development', description: 'Building your custom software solution' },
      { step: 4, title: 'Testing & QA', description: 'Comprehensive testing and quality assurance' },
      { step: 5, title: 'Deployment', description: 'Launch and ongoing maintenance' }
    ],
    technologies: [
      'Java', 'C#', '.NET', 'Python', 'Node.js', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes'
    ],
    startingPrice: '$20,000',
    timeline: '12-32 weeks'
  }
};

export default function LocationServiceTemplate({ location, service, serviceTitle }: LocationServiceTemplateProps) {
  const data = serviceData[service] || serviceData['web-development'];
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 mb-6 text-blue-200">
                <Link href="/" className="hover:text-white">Home</Link>
                <ChevronRightIcon className="h-4 w-4" />
                <Link href="/locations" className="hover:text-white">Locations</Link>
                <ChevronRightIcon className="h-4 w-4" />
                <Link href={`/locations/${location.slug}`} className="hover:text-white">{location.name}</Link>
                <ChevronRightIcon className="h-4 w-4" />
                <span className="text-white">{serviceTitle}</span>
              </nav>
              
              <div className="flex items-center space-x-2 mb-4">
                <MapPinIcon className="h-5 w-5 text-blue-300" />
                <span className="text-blue-300">{location.name}, {location.state}</span>
                <span className="text-4xl ml-2">{data.icon}</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                {serviceTitle} in {location.name}
              </h1>
              
              <p className="text-xl text-blue-100 mb-6">
                Professional {serviceTitle.toLowerCase()} services for {location.name} businesses
              </p>
              
              <p className="text-lg text-blue-50 mb-8 leading-relaxed">
                {data.description}. Partner with Zoptal to transform your business with cutting-edge technology solutions tailored for the {location.name} market.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/contact"
                  className="inline-flex items-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Get Free Quote
                  <ChevronRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href={`/portfolio?service=${service}`}
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-colors"
                >
                  View Portfolio
                </Link>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-400 mr-1" />
                    <span className="text-2xl font-bold text-white">From {data.startingPrice}</span>
                  </div>
                  <div className="text-sm text-blue-200">Starting Price</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <ClockIcon className="h-6 w-6 text-yellow-400 mr-1" />
                    <span className="text-2xl font-bold text-white">{data.timeline}</span>
                  </div>
                  <div className="text-sm text-blue-200">Timeline</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <UsersIcon className="h-6 w-6 text-purple-400 mr-1" />
                    <span className="text-2xl font-bold text-white">500+</span>
                  </div>
                  <div className="text-sm text-blue-200">Projects</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Get Your {serviceTitle} Quote
                </h3>
                
                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Project Budget</option>
                      <option>Under $10,000</option>
                      <option>$10,000 - $25,000</option>
                      <option>$25,000 - $50,000</option>
                      <option>$50,000 - $100,000</option>
                      <option>$100,000+</option>
                    </select>
                  </div>
                  <div>
                    <textarea
                      placeholder={`Tell us about your ${serviceTitle.toLowerCase()} project`}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Get Free Consultation
                  </button>
                </form>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
                      Free Consultation
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
                      No Commitment
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our {serviceTitle} Services in {location.name}?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive {serviceTitle.toLowerCase()} solutions designed for {location.name} businesses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.benefits.map((benefit: string, index: number) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <CheckIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-900">{benefit}</h3>
                </div>
                <p className="text-gray-600">
                  Professional {benefit.toLowerCase()} services tailored for {location.name} market requirements.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our {serviceTitle} Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proven methodology for delivering successful {serviceTitle.toLowerCase()} projects in {location.name}
            </p>
          </div>
          
          <div className="relative">
            {/* Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {data.process.map((step: any, index: number) => (
                <div key={index} className="text-center relative">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                  
                  {/* Connector Line */}
                  {index < data.process.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-blue-200 transform -translate-y-1/2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Technologies We Use for {serviceTitle}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge technology stack for modern {serviceTitle.toLowerCase()} solutions
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8">
            {data.technologies.map((tech: string, index: number) => (
              <div key={index} className="bg-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <span className="text-gray-800 font-medium">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Focus Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                {serviceTitle} Experts Serving {location.name}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Our {location.name}-focused team understands the unique business landscape and requirements of the {location.region} region. We've delivered successful {serviceTitle.toLowerCase()} projects for businesses across {location.industries.join(', ')} industries.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span>Deep understanding of {location.name} market dynamics</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span>Experience with local business requirements and regulations</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span>Strong network of {location.name} business partnerships</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span>Proven track record in {location.region} region</span>
                </div>
              </div>
              
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Schedule Consultation
                <ChevronRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {location.name} Market Insights
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Population:</span>
                  <span className="font-semibold">{location.population.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">GDP:</span>
                  <span className="font-semibold">{location.marketData.gdp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tech Companies:</span>
                  <span className="font-semibold">{location.techEcosystem.techCompanies.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Startups:</span>
                  <span className="font-semibold">{location.techEcosystem.startups.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Business Rank:</span>
                  <span className="font-semibold">#{location.marketData.businessFriendlyRank}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Key Industries:</h4>
                <div className="flex flex-wrap gap-2">
                  {location.industries.map((industry, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Start Your {serviceTitle} Project in {location.name}?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Let's discuss how our {serviceTitle.toLowerCase()} expertise can transform your {location.name} business
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              Get Free Consultation
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href={`/portfolio?service=${service}&location=${location.slug}`}
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              View {location.name} Portfolio
            </Link>
          </div>
          
          <div className="mt-12 pt-8 border-t border-blue-500">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 text-blue-100">
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                <span>hello@zoptal.com</span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span>Serving {location.name} & {location.region}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}