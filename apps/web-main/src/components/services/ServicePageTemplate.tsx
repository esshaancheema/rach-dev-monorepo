'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { 
  CheckIcon, 
  ArrowRightIcon, 
  StarIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { cn } from '@/lib/utils';

interface ServiceBenefit {
  title: string;
  description: string;
  icon: React.ElementType;
}

interface ServiceFeature {
  name: string;
  description: string;
  included: boolean;
}

interface ServicePackage {
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: {
    text: string;
    href: string;
  };
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
  duration: string;
}

interface ServiceTestimonial {
  name: string;
  title: string;
  company: string;
  content: string;
  avatar: string;
  results: Array<{
    metric: string;
    value: string;
  }>;
}

interface TechnologyStack {
  category: string;
  technologies: Array<{
    name: string;
    logo: string;
    description: string;
  }>;
}

interface ServicePageData {
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  benefits: ServiceBenefit[];
  features: ServiceFeature[];
  packages: ServicePackage[];
  process: ProcessStep[];
  testimonials: ServiceTestimonial[];
  techStack: TechnologyStack[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
  relatedServices: string[];
}

interface ServicePageTemplateProps {
  data: ServicePageData;
  children?: ReactNode;
  className?: string;
}

export default function ServicePageTemplate({ 
  data, 
  children, 
  className 
}: ServicePageTemplateProps) {
  const {
    title,
    subtitle,
    description,
    heroImage,
    benefits,
    features,
    packages,
    process,
    testimonials,
    techStack,
    faq,
    relatedServices
  } = data;

  return (
    <div className={cn('min-h-screen', className)}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
                <StarIcon className="h-4 w-4 mr-2" />
                {subtitle}
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg"
                >
                  Get Started Today
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View Pricing
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Projects Delivered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Client Satisfaction</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Support Available</div>
                </div>
              </div>
            </div>

            <div className="relative lg:ml-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 rounded-2xl rotate-3 scale-105" />
                <OptimizedImage
                  src={heroImage}
                  alt={title}
                  width={600}
                  height={400}
                  className="relative rounded-2xl shadow-2xl w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our {title}?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We deliver exceptional results through proven methodologies, cutting-edge technology, and expert craftsmanship.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <benefit.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What's Included
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive features and services designed to deliver maximum value for your investment.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={cn(
                    'p-6 border-b border-gray-200',
                    index % 2 === 1 && 'md:border-l md:border-b-0',
                    index >= features.length - 2 && 'border-b-0'
                  )}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      {feature.included ? (
                        <CheckIcon className="h-6 w-6 text-green-500" />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-gray-200" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.name}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Package
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible packages designed to meet different budgets and requirements.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={cn(
                  'relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden',
                  pkg.popular && 'ring-2 ring-blue-500 scale-105'
                )}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-6">{pkg.description}</p>
                  
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-1">{pkg.price}</div>
                    <div className="text-sm text-gray-500">{pkg.duration}</div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={pkg.cta.href}
                    className={cn(
                      'w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors',
                      pkg.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                    )}
                  >
                    {pkg.cta.text}
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Development Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A proven methodology that ensures successful project delivery on time and within budget.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-2">{step.description}</p>
                <div className="flex items-center justify-center text-sm text-blue-600">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {step.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We use the latest and most reliable technologies to build scalable, secure solutions.
            </p>
          </div>

          {techStack.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">{category.category}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.technologies.map((tech, techIndex) => (
                  <div key={techIndex} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                    <OptimizedImage
                      src={tech.logo}
                      alt={tech.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 mx-auto mb-4"
                    />
                    <h4 className="font-semibold text-gray-900 mb-2">{tech.name}</h4>
                    <p className="text-sm text-gray-600">{tech.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Client Success Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See how we've helped businesses like yours achieve their goals.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {testimonials.slice(0, 2).map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                  <blockquote className="text-lg text-gray-700 mb-6">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <OptimizedImage
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.title}, {testimonial.company}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    {testimonial.results.map((result, resultIndex) => (
                      <div key={resultIndex}>
                        <div className="text-xl font-bold text-blue-600">{result.value}</div>
                        <div className="text-xs text-gray-600">{result.metric}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Get answers to common questions about our {title.toLowerCase()} services.
            </p>
          </div>

          <div className="space-y-8">
            {faq.map((item, index) => (
              <details key={index} className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <summary className="flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900">{item.question}</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-gray-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Related Services
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore our other services that complement your {title.toLowerCase()} project.
              </p>
            </div>
            
            <RelatedLinks 
              category="service"
              maxLinks={4}
              variant="cards"
              currentPath={`/services/${title.toLowerCase().replace(/\s+/g, '-')}`}
            />
          </div>
        </section>
      )}

      {/* Custom Content */}
      {children}

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Let's discuss your project requirements and provide you with a detailed proposal and timeline.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-lg"
            >
              <UserGroupIcon className="mr-2 h-5 w-5" />
              Get Free Consultation
            </Link>
            
            <Link
              href="tel:+1-555-012-3456"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-blue-600 rounded-lg transition-colors"
            >
              Call Now: +1-555-012-3456
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center pt-8 border-t border-blue-500">
            <div>
              <div className="text-2xl font-bold text-white">24h</div>
              <div className="text-sm text-blue-200">Response Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm text-blue-200">Projects Delivered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-sm text-blue-200">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-sm text-blue-200">Uptime SLA</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}