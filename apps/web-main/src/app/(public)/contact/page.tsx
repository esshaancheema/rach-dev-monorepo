import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
// import { generateContactPageSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Contact Zoptal | Support & Sales Inquiries',
  description: 'Contact Zoptal for sales, technical support & partnerships. Multiple ways to reach us: live chat, email & phone support available.',
  keywords: [
    'contact zoptal',
    'customer support',
    'sales inquiries',
    'technical support',
    'contact form',
    'get help',
    'customer service',
    'business inquiries',
  ],
  alternates: {
    canonical: 'https://zoptal.com/contact',
  },
};

const contactMethods = [
  {
    title: 'Sales Inquiries',
    description: 'Ready to get started? Our sales team will help you find the perfect plan.',
    icon: '💼',
    contact: 'sales@zoptal.com',
    phone: '+1 (555) 123-4567',
    hours: 'Mon - Fri, 9AM - 6PM EST',
    cta: 'Schedule Demo',
    href: '/demo',
  },
  {
    title: 'Technical Support',
    description: 'Need help with your account or have technical questions?',
    icon: '🛠️',
    contact: 'support@zoptal.com',
    phone: '+1 (555) 123-4568',
    hours: '24/7 Support Available',
    cta: 'Get Support',
    href: '/resources/help-center',
  },
  {
    title: 'Partnerships',
    description: 'Interested in partnering with us or integrating your service?',
    icon: '🤝',
    contact: 'partnerships@zoptal.com',
    phone: '+1 (555) 123-4569',
    hours: 'Mon - Fri, 10AM - 5PM EST',
    cta: 'Partner With Us',
    href: '/partnerships',
  },
  {
    title: 'Media & Press',
    description: 'Press inquiries, media kits, and interview requests.',
    icon: '📰',
    contact: 'press@zoptal.com',
    phone: '+1 (555) 123-4570',
    hours: 'Mon - Fri, 9AM - 5PM EST',
    cta: 'Media Kit',
    href: '/press',
  },
];

const offices = [
  {
    city: 'San Francisco',
    country: 'USA',
    address: '123 Market Street, Suite 400\nSan Francisco, CA 94105',
    phone: '+1 (555) 123-4567',
    email: 'sf@zoptal.com',
    timezone: 'PST (UTC-8)',
    isHeadquarters: true,
  },
  {
    city: 'London',
    country: 'UK',
    address: '456 Oxford Street, Floor 5\nLondon, W1C 1AP',
    phone: '+44 20 7123 4567',
    email: 'london@zoptal.com',
    timezone: 'GMT (UTC+0)',
    isHeadquarters: false,
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    address: '789 Marina Bay Sands\nSingapore 018956',
    phone: '+65 6123 4567',
    email: 'singapore@zoptal.com',
    timezone: 'SGT (UTC+8)',
    isHeadquarters: false,
  },
];

const faqs = [
  {
    question: 'How quickly can I get started?',
    answer: 'You can sign up and start building in under 5 minutes. Our free tier gives you immediate access to core features.',
  },
  {
    question: 'Do you offer custom enterprise solutions?',
    answer: 'Yes! We work closely with enterprise customers to create custom solutions that fit their specific needs and compliance requirements.',
  },
  {
    question: 'What kind of support do you provide?',
    answer: 'We offer multiple support channels including documentation, community forum, email support, and dedicated customer success managers for enterprise customers.',
  },
  {
    question: 'Can I migrate my existing applications?',
    answer: 'Absolutely! We provide migration tools and dedicated support to help you move your existing applications to our platform.',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              We're here to help you build amazing applications. Reach out through any channel 
              that works best for you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Live chat available</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm">Average response: &lt; 2 hours</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">
                How Can We Help You?
              </h2>
              <p className="text-xl text-gray-600">
                Choose the best way to reach us based on your needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {contactMethods.map((method) => (
                <Card key={method.title} className="p-8 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="text-4xl">{method.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3">{method.title}</h3>
                      <p className="text-gray-600 mb-4">{method.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{method.contact}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm">{method.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">{method.hours}</span>
                    </div>
                  </div>
                  
                  <Link href={method.href}>
                    <Button variant="primary" className="w-full">
                      {method.cta}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Send Us a Message
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Have a specific question or want to discuss your project? 
                  Fill out the form and we'll get back to you within 24 hours.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Response within 24 hours</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Free consultation included</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>No spam, ever</span>
                  </div>
                </div>
              </div>
              
              <Card className="p-8">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        First Name *
                      </label>
                      <Input placeholder="John" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Last Name *
                      </label>
                      <Input placeholder="Doe" required />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <Input type="email" placeholder="john@company.com" required />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Company
                      </label>
                      <Input placeholder="Acme Corp" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Job Title
                      </label>
                      <Input placeholder="CTO" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Inquiry Type *
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales Inquiry</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="media">Media/Press</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      How did you hear about us?
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google Search</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="conference">Conference/Event</SelectItem>
                        <SelectItem value="blog">Blog/Article</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <Textarea 
                      placeholder="Tell us about your project or question..."
                      rows={4}
                      required 
                    />
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Checkbox id="consent" />
                    <label htmlFor="consent" className="text-sm text-gray-600">
                      I agree to receive communications from Zoptal and understand 
                      I can unsubscribe at any time. Read our{' '}
                      <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>
                  
                  <Button type="submit" variant="primary" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Office Locations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">
                Our Global Offices
              </h2>
              <p className="text-xl text-gray-600">
                Visit us at one of our offices around the world
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {offices.map((office) => (
                <Card key={office.city} className="p-6 relative">
                  {office.isHeadquarters && (
                    <Badge variant="primary" className="absolute top-4 right-4">
                      Headquarters
                    </Badge>
                  )}
                  <h3 className="text-xl font-bold mb-2">
                    {office.city}, {office.country}
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start gap-3">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        {office.address.split('\n').map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{office.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{office.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{office.timezone}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQs */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Quick answers to common questions
              </p>
            </div>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">
                Can't find what you're looking for?
              </p>
              <Link href="/resources/help-center">
                <Button variant="outline">
                  Visit Help Center
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}