import { Metadata } from 'next';
import Link from 'next/link';
import { 
  CheckIcon, 
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Get Custom Quote | AI-Powered Software Development | Zoptal',
  description: 'Get a custom quote for your software development project. AI-powered solutions, custom applications, and expert development services. Free consultation available.',
  keywords: [
    'custom quote',
    'software development pricing',
    'AI development quote',
    'custom application cost',
    'development consultation',
    'project estimate'
  ],
  openGraph: {
    title: 'Get Custom Quote - AI-Powered Software Development | Zoptal',
    description: 'Get a personalized quote for your software development project. Expert consultation and competitive pricing.',
    type: 'website'
  }
};

export default function GetQuotePage() {
  const services = [
    {
      title: 'AI Application Development',
      description: 'Custom AI-powered applications tailored to your business needs',
      features: ['Machine Learning Integration', 'Natural Language Processing', 'Predictive Analytics', 'Computer Vision'],
      priceRange: '$15,000 - $150,000',
      timeline: '8-24 weeks'
    },
    {
      title: 'Web Application Development',
      description: 'Modern, scalable web applications with cutting-edge technologies',
      features: ['React/Next.js', 'Node.js Backend', 'Cloud Integration', 'Responsive Design'],
      priceRange: '$10,000 - $80,000',
      timeline: '6-16 weeks'
    },
    {
      title: 'Mobile App Development',
      description: 'Native and cross-platform mobile applications',
      features: ['iOS/Android Native', 'React Native', 'Flutter', 'App Store Deployment'],
      priceRange: '$20,000 - $120,000',
      timeline: '10-20 weeks'
    },
    {
      title: 'Enterprise Solutions',
      description: 'Large-scale enterprise software and system integrations',
      features: ['CRM/ERP Systems', 'API Development', 'Database Design', 'Security Implementation'],
      priceRange: '$50,000 - $500,000',
      timeline: '12-36 weeks'
    }
  ];

  const pricingFactors = [
    {
      factor: 'Project Complexity',
      description: 'Simple applications start lower, complex AI systems require more investment'
    },
    {
      factor: 'Technology Stack',
      description: 'Modern frameworks and AI integration affect development time and cost'
    },
    {
      factor: 'Team Size',
      description: 'Dedicated teams for faster delivery vs. shared resources for cost efficiency'
    },
    {
      factor: 'Timeline Requirements',
      description: 'Expedited delivery may require additional resources and premium pricing'
    },
    {
      factor: 'Ongoing Support',
      description: 'Maintenance, updates, and support packages available post-launch'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get Your Custom Development Quote
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Professional software development with transparent pricing. 
              Get a detailed quote tailored to your specific requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact-form"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Get Instant Quote
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </a>
              <a
                href="#pricing-guide"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-lg transition-colors duration-200"
              >
                View Pricing Guide
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Projects Delivered</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">24h</div>
              <div className="text-gray-600">Quote Response Time</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">5★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Pricing Guide */}
      <section id="pricing-guide" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Development Services & Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent pricing for professional software development. All quotes include detailed project planning and post-launch support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Includes:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{service.priceRange}</div>
                      <div className="text-sm text-gray-500">Starting price range</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {service.timeline}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Factors */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              What Affects Project Pricing?
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingFactors.map((item, index) => (
                <div key={index} className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">{item.factor}</h4>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Your Custom Quote
            </h2>
            <p className="text-xl text-gray-600">
              Fill out the form below and we'll send you a detailed quote within 24 hours
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a service</option>
                  <option value="ai-development">AI Application Development</option>
                  <option value="web-development">Web Application Development</option>
                  <option value="mobile-development">Mobile App Development</option>
                  <option value="enterprise-solutions">Enterprise Solutions</option>
                  <option value="custom-software">Custom Software Development</option>
                  <option value="consulting">Development Consulting</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Budget Range *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select budget range</option>
                  <option value="under-10k">Under $10,000</option>
                  <option value="10k-25k">$10,000 - $25,000</option>
                  <option value="25k-50k">$25,000 - $50,000</option>
                  <option value="50k-100k">$50,000 - $100,000</option>
                  <option value="100k-250k">$100,000 - $250,000</option>
                  <option value="250k-plus">$250,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Timeline
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select timeline</option>
                  <option value="asap">ASAP (Rush job)</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="6-12-months">6-12 months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Please describe your project requirements, goals, target audience, and any specific features or integrations you need..."
                ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="subscribe"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="subscribe" className="ml-2 text-sm text-gray-600">
                  Subscribe to our newsletter for development tips and industry insights
                </label>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Send Quote Request
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  We'll respond within 24 hours with a detailed quote and project timeline
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Alternative Contact Methods */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Prefer to Talk Directly?
            </h3>
            <p className="text-gray-600">
              Choose your preferred way to get in touch with our development team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Phone Consultation</h4>
              <p className="text-gray-600 text-sm mb-4">
                Schedule a 15-minute call to discuss your project requirements
              </p>
              <a
                href="tel:+1-555-012-3456"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                +1 (555) 012-3456
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Email Quote</h4>
              <p className="text-gray-600 text-sm mb-4">
                Send us your requirements via email for a detailed written quote
              </p>
              <a
                href="mailto:quotes@zoptal.com"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
              >
                quotes@zoptal.com
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Live Chat</h4>
              <p className="text-gray-600 text-sm mb-4">
                Start a live chat with our development consultants right now
              </p>
              <button className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium">
                Start Chat
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <div className="text-sm text-gray-600">5.0 Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">ISO 27001</div>
              <div className="text-sm text-gray-600">Certified</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">GDPR</div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">99.9%</div>
              <div className="text-sm text-gray-600">Uptime SLA</div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              All quotes include detailed project planning, development timeline, and post-launch support options
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}