'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IndustryPageData } from '@/lib/industry/types';
import { 
  ChevronRightIcon, 
  CheckIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  StarIcon as StarIconSolid,
  ClockIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface IndustryPageTemplateProps {
  data: IndustryPageData;
}

export default function IndustryPageTemplate({ data }: IndustryPageTemplateProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-700">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 mb-6 text-blue-200">
                <Link href="/" className="hover:text-white">Home</Link>
                <ChevronRightIcon className="h-4 w-4" />
                <Link href="/industries" className="hover:text-white">Industries</Link>
                <ChevronRightIcon className="h-4 w-4" />
                <span className="text-white">{data.name}</span>
              </nav>
              
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-5xl">{data.icon}</span>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold">
                    {data.hero.title}
                  </h1>
                </div>
              </div>
              
              <p className="text-xl text-blue-100 mb-6">
                {data.hero.subtitle}
              </p>
              
              <p className="text-lg text-blue-50 mb-8 leading-relaxed">
                {data.hero.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/contact"
                  className="inline-flex items-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Get Free Consultation
                  <ChevronRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href={`/case-studies?industry=${data.slug}`}
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-900 transition-colors"
                >
                  View Case Studies
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {data.hero.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Start Your {data.name} Project
                </h3>
                
                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option>Select Service</option>
                      {data.services.featured.map((service, index) => (
                        <option key={index}>{service.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <textarea
                      placeholder={`Tell us about your ${data.name.toLowerCase()} project`}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Get Free Quote
                  </button>
                </form>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="h-4 w-4 mr-1 text-green-500" />
                      Compliance Ready
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
                      Free Consultation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Challenges Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {data.name} Industry Challenges We Solve
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding the unique challenges facing {data.name.toLowerCase()} organizations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.challenges.map((challenge, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-red-600 font-semibold">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge}</h3>
                    <p className="text-gray-600">
                      Common challenge in {data.name.toLowerCase()} that requires specialized software solutions.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {data.services.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {data.services.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {data.services.featured.map((service, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.name}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-200">
                  <div>
                    <span className="text-sm text-gray-500">Starting from</span>
                    <div className="text-2xl font-bold text-indigo-600">{service.pricing.starting}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Typical project</span>
                    <div className="text-lg font-semibold text-gray-900">{service.pricing.typical}</div>
                  </div>
                </div>
                
                <Link
                  href="/contact"
                  className="inline-flex items-center w-full justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Get Quote
                  <ChevronRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {data.whyChooseUs.title}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.whyChooseUs.reasons.map((reason, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{reason.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{reason.title}</h3>
                <p className="text-gray-600">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      {data.caseStudies.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Success Stories in {data.name}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real results from our {data.name.toLowerCase()} software development projects
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {data.caseStudies.map((caseStudy, index) => (
                <div key={index} className="bg-gray-50 p-8 rounded-xl">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{caseStudy.title}</h3>
                  <p className="text-lg text-indigo-600 font-semibold mb-4">{caseStudy.company}</p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Challenge:</h4>
                      <p className="text-gray-600">{caseStudy.challenge}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Solution:</h4>
                      <p className="text-gray-600">{caseStudy.solution}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Results:</h4>
                    <ul className="space-y-2">
                      {caseStudy.results.map((result, idx) => (
                        <li key={idx} className="flex items-center text-gray-600">
                          <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {caseStudy.testimonial && (
                    <div className="bg-white p-6 rounded-lg border-l-4 border-indigo-500">
                      <blockquote className="text-gray-700 mb-4">
                        "{caseStudy.testimonial.quote}"
                      </blockquote>
                      <div className="font-semibold text-gray-900">{caseStudy.testimonial.author}</div>
                      <div className="text-sm text-gray-600">{caseStudy.testimonial.position}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Compliance Section */}
      <section className="py-20 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Compliance & Standards
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We ensure your {data.name.toLowerCase()} software meets all regulatory requirements
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.compliance.map((standard, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{standard.standard}</h3>
                <p className="text-gray-600">{standard.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Trends Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {data.name} Technology Trends
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay ahead with the latest innovations in {data.name.toLowerCase()} technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.trends.map((trend, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{trend.title}</h3>
                    <p className="text-gray-600 mb-4">{trend.description}</p>
                    <div className="bg-white p-3 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm font-semibold text-green-700">Impact: {trend.impact}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-6">
            {data.faq.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {item.question}
                </h3>
                <p className="text-gray-600">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {data.cta.title}
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            {data.cta.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              {data.cta.primaryButton}
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href={`/case-studies?industry=${data.slug}`}
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition-colors"
            >
              {data.cta.secondaryButton}
            </Link>
          </div>
          
          <div className="mt-12 pt-8 border-t border-indigo-500">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 text-indigo-100">
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                <span>hello@zoptal.com</span>
              </div>
              <div className="flex items-center">
                <CogIcon className="h-5 w-5 mr-2" />
                <span>Expert {data.name} Solutions</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}