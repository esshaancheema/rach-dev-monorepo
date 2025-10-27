import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const metadata: Metadata = {
  title: 'Enterprise AI Development | Zoptal Solutions',
  description: 'Enterprise-grade AI-accelerated development platform. Advanced security, compliance, dedicated support, and custom solutions for large organizations.',
  keywords: [
    'enterprise software development',
    'enterprise AI platform',
    'enterprise development solutions',
    'custom enterprise software',
    'enterprise compliance',
    'dedicated support',
    'on-premise deployment',
  ],
  alternates: {
    canonical: 'https://zoptal.com/enterprise',
  },
};

const enterpriseFeatures = [
  {
    icon: '🔒',
    title: 'Advanced Security',
    description: 'SOC 2 Type II, GDPR compliance, enterprise SSO, and advanced access controls',
    features: [
      'SOC 2 Type II certified',
      'GDPR & CCPA compliant',
      'Advanced encryption at rest and in transit',
      'Regular security audits and penetration testing',
      'Role-based access control (RBAC)',
      'Single Sign-On (SSO) with SAML 2.0',
      'Multi-factor authentication (MFA)',
      'IP allowlisting and VPN support',
    ],
  },
  {
    icon: '🏗️',
    title: 'Custom Infrastructure',
    description: 'Dedicated environments, on-premise deployment, and isolated compute resources',
    features: [
      'Dedicated cloud environments',
      'On-premise deployment options',
      'Hybrid cloud architectures',
      'Custom resource allocation',
      'Geographic data residency',
      'Private network connectivity',
      'Custom backup and disaster recovery',
      'Performance SLA guarantees',
    ],
  },
  {
    icon: '🤝',
    title: 'Dedicated Support',
    description: '24/7 premium support with dedicated account managers and SLA guarantees',
    features: [
      'Dedicated customer success manager',
      '24/7 priority support channels',
      'Custom SLA agreements',
      'Direct access to engineering team',
      'Onboarding and training programs',
      'Regular business reviews',
      'Custom feature development',
      'Migration assistance and consulting',
    ],
  },
  {
    icon: '🎛️',
    title: 'Advanced Controls',
    description: 'Granular permissions, audit logs, and comprehensive administration tools',
    features: [
      'Advanced user management',
      'Detailed audit logs and reporting',
      'Custom approval workflows',
      'API rate limiting controls',
      'Advanced analytics and insights',
      'Custom integrations and webhooks',
      'Automated compliance reporting',
      'Advanced monitoring and alerting',
    ],
  },
];

const integrations = [
  {
    category: 'Identity Providers',
    items: ['Azure AD', 'Okta', 'Auth0', 'LDAP', 'Active Directory'],
  },
  {
    category: 'DevOps Tools',
    items: ['Jenkins', 'GitLab CI', 'Azure DevOps', 'CircleCI', 'GitHub Actions'],
  },
  {
    category: 'Monitoring',
    items: ['Datadog', 'New Relic', 'Splunk', 'Prometheus', 'Grafana'],
  },
  {
    category: 'Security',
    items: ['Snyk', 'SonarQube', 'Veracode', 'Checkmarx', 'OWASP ZAP'],
  },
];

const testimonials = [
  {
    quote: "Zoptal has transformed our development process. We're shipping features 10x faster while maintaining enterprise-grade security and compliance.",
    author: "Sarah Chen",
    role: "CTO",
    company: "TechCorp Global",
    logo: "/logos/techcorp.png",
  },
  {
    quote: "The AI-powered development tools have enabled our team to focus on innovation rather than repetitive tasks. Our velocity has increased dramatically.",
    author: "Michael Rodriguez",
    role: "VP of Engineering",
    company: "InnovateLabs",
    logo: "/logos/innovatelabs.png",
  },
  {
    quote: "Working with Zoptal's enterprise team has been exceptional. They understood our complex requirements and delivered a solution that exceeded expectations.",
    author: "Jennifer Park",
    role: "Chief Digital Officer",
    company: "Enterprise Solutions Inc",
    logo: "/logos/enterprise-solutions.png",
  },
];

const useCases = [
  {
    title: 'Digital Transformation',
    description: 'Modernize legacy systems and accelerate digital initiatives',
    icon: '🔄',
    benefits: [
      'Rapid application modernization',
      'Legacy system integration',
      'Cloud migration support',
      'API-first architecture',
    ],
  },
  {
    title: 'Product Development',
    description: 'Build and launch products faster with AI-powered development',
    icon: '🚀',
    benefits: [
      'Accelerated time-to-market',
      'Automated testing and QA',
      'Scalable architecture',
      'Continuous deployment',
    ],
  },
  {
    title: 'Internal Tools',
    description: 'Create custom internal applications and automation workflows',
    icon: '🛠️',
    benefits: [
      'Custom business applications',
      'Workflow automation',
      'Data visualization dashboards',
      'Process optimization',
    ],
  },
  {
    title: 'Customer Solutions',
    description: 'Develop customer-facing applications and integrations',
    icon: '👥',
    benefits: [
      'Customer portal development',
      'Third-party integrations',
      'Mobile applications',
      'API ecosystem',
    ],
  },
];

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
              Enterprise Solutions
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-8">
              Scale Your Development
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                with Enterprise-Grade AI
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Empower your enterprise with AI-accelerated development, advanced security, 
              and dedicated support. Built for scale, designed for compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="white" size="lg" className="text-lg px-8 py-4">
                Schedule Demo
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Request Quote
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-gray-400">Enterprise Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">99.9%</div>
                <div className="text-gray-400">Uptime SLA</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">SOC 2</div>
                <div className="text-gray-400">Type II Certified</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-gray-400">Dedicated Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Enterprise Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Enterprise-Grade Capabilities
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to deploy, scale, and manage AI-powered development 
                across your organization with confidence.
              </p>
            </div>
            
            <div className="space-y-16">
              {enterpriseFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-4xl">{feature.icon}</span>
                      <h3 className="text-3xl font-bold">{feature.title}</h3>
                    </div>
                    <p className="text-lg text-gray-600 mb-8">
                      {feature.description}
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50">
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-6xl opacity-60">{feature.icon}</span>
                      </div>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Enterprise Use Cases
              </h2>
              <p className="text-xl text-gray-600">
                How enterprises use Zoptal to accelerate their development initiatives
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {useCases.map((useCase) => (
                <Card key={useCase.title} className="p-8 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="text-4xl">{useCase.icon}</span>
                    <div>
                      <h3 className="text-2xl font-bold mb-3">{useCase.title}</h3>
                      <p className="text-gray-600">{useCase.description}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {useCase.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Integrations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Seamless Integrations
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Connect with your existing enterprise tools and workflows
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {integrations.map((category) => (
                <Card key={category.category} className="p-6">
                  <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((item) => (
                      <Badge key={item} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="mt-8">
              <Link href="/resources/documentation/integrations">
                <Button variant="outline">
                  View All Integrations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Trusted by Enterprise Leaders
              </h2>
              <p className="text-xl text-gray-600">
                See what our enterprise customers are saying
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-8">
                  <svg className="w-8 h-8 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <blockquote className="text-lg text-gray-700 mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    {testimonial.logo && (
                      <Image
                        src={testimonial.logo}
                        alt={testimonial.company}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    )}
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Form */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  Ready to Transform Your Enterprise?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Schedule a personalized demo and see how Zoptal can accelerate 
                  your development initiatives.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Custom demo tailored to your needs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Dedicated enterprise specialist</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Custom pricing and terms</span>
                  </div>
                </div>
              </div>
              
              <Card className="p-8 bg-white text-gray-900">
                <h3 className="text-2xl font-bold mb-6">Schedule Your Demo</h3>
                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input placeholder="First Name" required />
                    <Input placeholder="Last Name" required />
                  </div>
                  <Input placeholder="Work Email" type="email" required />
                  <Input placeholder="Company" required />
                  <Input placeholder="Job Title" />
                  <Input placeholder="Company Size" />
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={4}
                    placeholder="Tell us about your development needs..."
                  />
                  <Button variant="primary" className="w-full">
                    Schedule Demo
                  </Button>
                </form>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  We'll respond within 24 hours
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Resources */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">
              Enterprise Resources
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6">
                <svg className="w-12 h-12 text-blue-600 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold mb-3">Security Whitepaper</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive security documentation and compliance certifications
                </p>
                <Link href="/resources/whitepapers/enterprise-security">
                  <Button variant="outline" className="w-full">
                    Download PDF
                  </Button>
                </Link>
              </Card>
              
              <Card className="p-6">
                <svg className="w-12 h-12 text-blue-600 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="text-xl font-semibold mb-3">Case Studies</h3>
                <p className="text-gray-600 mb-4">
                  See how enterprises are transforming with Zoptal
                </p>
                <Link href="/case-studies">
                  <Button variant="outline" className="w-full">
                    View Case Studies
                  </Button>
                </Link>
              </Card>
              
              <Card className="p-6">
                <svg className="w-12 h-12 text-blue-600 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-semibold mb-3">API Documentation</h3>
                <p className="text-gray-600 mb-4">
                  Complete technical documentation for enterprise integrations
                </p>
                <Link href="/resources/api-reference">
                  <Button variant="outline" className="w-full">
                    View API Docs
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}