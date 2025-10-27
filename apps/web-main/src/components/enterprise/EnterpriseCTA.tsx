import Link from 'next/link';
import {
  CalendarIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ctaOptions = [
  {
    icon: CalendarIcon,
    title: 'Schedule Enterprise Consultation',
    description: 'Book a 60-minute strategy session with our enterprise architects',
    action: 'Schedule Now',
    href: '/contact?type=enterprise-consultation',
    primary: true,
    benefits: [
      'Free technical assessment',
      'Custom solution roadmap',
      'ROI projections',
      'No obligation consultation'
    ]
  },
  {
    icon: PhoneIcon,
    title: 'Speak with Enterprise Sales',
    description: 'Get immediate answers to your enterprise requirements',
    action: 'Call +1-555-012-3456',
    href: 'tel:+1-555-012-3456',
    primary: false,
    benefits: [
      'Immediate response',
      'Custom pricing discussion',
      'Technical Q&A',
      'Project timeline planning'
    ]
  },
  {
    icon: DocumentTextIcon,
    title: 'Request Detailed Proposal',
    description: 'Get a comprehensive proposal with technical specifications',
    action: 'Request Proposal',
    href: '/contact?type=enterprise-proposal',
    primary: false,
    benefits: [
      'Detailed technical specs',
      'Resource allocation plan',
      'Timeline & milestones',
      'Investment breakdown'
    ]
  }
];

const urgencyIndicators = [
  {
    icon: '⚡',
    text: 'Fast-tracked for enterprise clients'
  },
  {
    icon: '🔒',
    text: 'SOC 2 & enterprise security ready'
  },
  {
    icon: '📞',
    text: '24-hour response guarantee'
  },
  {
    icon: '🎯',
    text: 'Dedicated enterprise team assigned'
  }
];

export default function EnterpriseCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Enterprise?
          </h2>
          <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join Fortune 500 companies who trust Zoptal for their digital transformation. 
            Let's discuss how we can accelerate your enterprise growth.
          </p>

          {/* Urgency Indicators */}
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {urgencyIndicators.map((indicator, index) => (
              <div key={index} className="flex items-center justify-center space-x-2 text-blue-200">
                <span className="text-lg">{indicator.icon}</span>
                <span className="text-sm font-medium">{indicator.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Options */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {ctaOptions.map((option, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                option.primary
                  ? 'bg-white border-blue-500 shadow-2xl'
                  : 'bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20'
              }`}
            >
              {option.primary && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${
                option.primary ? 'bg-blue-100' : 'bg-white/20'
              }`}>
                <option.icon className={`h-8 w-8 ${
                  option.primary ? 'text-blue-600' : 'text-white'
                }`} />
              </div>

              <h3 className={`text-xl font-bold mb-4 ${
                option.primary ? 'text-gray-900' : 'text-white'
              }`}>
                {option.title}
              </h3>

              <p className={`mb-6 leading-relaxed ${
                option.primary ? 'text-gray-600' : 'text-gray-300'
              }`}>
                {option.description}
              </p>

              {/* Benefits */}
              <ul className="space-y-2 mb-8">
                {option.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className={`flex items-center text-sm ${
                    option.primary ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    <CheckCircleIcon className={`h-4 w-4 mr-3 flex-shrink-0 ${
                      option.primary ? 'text-green-500' : 'text-green-400'
                    }`} />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Link
                href={option.href}
                className={`w-full inline-flex items-center justify-center px-6 py-4 font-semibold rounded-lg transition-all duration-200 ${
                  option.primary
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-white text-gray-900 hover:bg-gray-100 border border-white'
                }`}
              >
                {option.action}
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Alternative Contact Methods */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Prefer a Different Approach?
              </h3>
              <p className="text-gray-300 mb-6">
                We understand every enterprise has unique preferences for initial contact. 
                Choose the method that works best for your organization.
              </p>

              <div className="space-y-4">
                <a
                  href="mailto:enterprise@zoptal.com"
                  className="flex items-center text-blue-300 hover:text-blue-200 transition-colors"
                >
                  <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  enterprise@zoptal.com
                </a>

                <a
                  href="/contact?type=chat"
                  className="flex items-center text-blue-300 hover:text-blue-200 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3" />
                  Start Live Chat
                </a>

                <a
                  href="/resources/enterprise-guide"
                  className="flex items-center text-blue-300 hover:text-blue-200 transition-colors"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-3" />
                  Download Enterprise Guide
                </a>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-2">Enterprise Hotline</h4>
                <div className="text-3xl font-bold text-blue-300 mb-2">+1-555-012-3456</div>
                <p className="text-sm text-gray-300 mb-4">Available 24/7 for enterprise clients</p>
                
                <div className="text-center space-y-2">
                  <div className="text-sm text-gray-400">
                    🕒 <strong>US:</strong> 9 AM - 6 PM EST
                  </div>
                  <div className="text-sm text-gray-400">
                    🌏 <strong>Global:</strong> 24/7 Support Available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-8">Trusted by industry leaders worldwide</p>
          <div className="flex flex-wrap justify-center items-center space-x-8 text-gray-500">
            <span className="text-lg font-semibold">Microsoft</span>
            <span>•</span>
            <span className="text-lg font-semibold">Google</span>
            <span>•</span>
            <span className="text-lg font-semibold">Amazon</span>
            <span>•</span>
            <span className="text-lg font-semibold">IBM</span>
            <span>•</span>
            <span className="text-lg font-semibold">Oracle</span>
          </div>
        </div>
      </div>
    </section>
  );
}