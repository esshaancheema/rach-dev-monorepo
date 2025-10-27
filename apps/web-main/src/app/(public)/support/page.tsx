import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Support - Get Help & Contact Our Team | Zoptal',
  description: 'Get expert support from the Zoptal team. Find answers, contact support, schedule consultations, and access emergency assistance.',
  keywords: [
    'customer support',
    'technical support',
    'help desk',
    'contact support',
    'emergency support',
    'consultation',
    'support tickets',
    'live chat',
    'phone support',
  ],
  alternates: {
    canonical: 'https://zoptal.com/support',
  },
};

const supportChannels = [
  {
    title: 'Live Chat',
    description: 'Get instant help from our support team',
    icon: '💬',
    availability: '24/7',
    responseTime: '< 2 minutes',
    planAvailability: 'All Plans',
    action: 'Start Chat',
    href: '#chat',
    primary: true,
  },
  {
    title: 'Email Support',
    description: 'Send detailed questions and get comprehensive answers',
    icon: '📧',
    availability: 'Business Hours',
    responseTime: '< 4 hours',
    planAvailability: 'All Plans',
    action: 'Send Email',
    href: 'mailto:support@zoptal.com',
    primary: false,
  },
  {
    title: 'Phone Support',
    description: 'Speak directly with our technical experts',
    icon: '📞',
    availability: 'Business Hours',
    responseTime: '< 30 minutes',
    planAvailability: 'Pro & Enterprise',
    action: 'Schedule Call',
    href: '#phone',
    primary: false,
  },
  {
    title: 'Priority Support',
    description: 'Dedicated support with faster response times',
    icon: '⚡',
    availability: '24/7',
    responseTime: '< 1 hour',
    planAvailability: 'Enterprise Only',
    action: 'Contact Team',
    href: 'mailto:priority-support@zoptal.com',
    primary: false,
  },
];

const supportCategories = [
  {
    title: 'Getting Started',
    description: 'Account setup, onboarding, and first steps',
    icon: '🚀',
    topics: [
      'Account creation and setup',
      'Project initialization',
      'Platform walkthrough',
      'Integration setup',
    ],
  },
  {
    title: 'Technical Issues',
    description: 'Troubleshooting and technical problems',
    icon: '🔧',
    topics: [
      'Build and deployment errors',
      'API integration issues',
      'Performance problems',
      'Configuration troubleshooting',
    ],
  },
  {
    title: 'Billing & Plans',
    description: 'Subscription, billing, and plan changes',
    icon: '💳',
    topics: [
      'Plan upgrades and downgrades',
      'Billing questions',
      'Invoice and payment issues',
      'Usage and limits',
    ],
  },
  {
    title: 'Feature Requests',
    description: 'Product feedback and enhancement requests',
    icon: '💡',
    topics: [
      'New feature suggestions',
      'Integration requests',
      'API enhancements',
      'Platform improvements',
    ],
  },
];

const emergencySupport = {
  title: 'Emergency Support',
  description: 'Critical issues affecting production systems',
  phone: '+1 (555) 911-HELP',
  email: 'emergency@zoptal.com',
  criteria: [
    'Production systems down or unavailable',
    'Critical security incidents',
    'Data loss or corruption',
    'Service outages affecting business operations',
  ],
};

const supportHours = [
  {
    region: 'Americas',
    timezone: 'PST/PDT',
    hours: 'Mon-Fri: 6:00 AM - 8:00 PM',
    weekend: 'Sat-Sun: 8:00 AM - 6:00 PM',
  },
  {
    region: 'Europe',
    timezone: 'CET/CEST',
    hours: 'Mon-Fri: 8:00 AM - 6:00 PM',
    weekend: 'Sat-Sun: Limited',
  },
  {
    region: 'Asia-Pacific',
    timezone: 'JST',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM',
    weekend: 'Sat-Sun: Limited',
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How can we help you today?
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Our expert support team is here to help you succeed with Zoptal. 
              Get assistance, find answers, or schedule a consultation.
            </p>
            
            {/* Quick Search */}
            <div className="max-w-2xl mx-auto">
              <form className="relative">
                <Input
                  type="search"
                  placeholder="Describe your issue or question..."
                  className="pl-12 pr-4 py-4 text-gray-900 bg-white text-lg"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      {/* Support Channels */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Choose Your Support Channel</h2>
              <p className="text-lg text-gray-600">
                Multiple ways to get the help you need, when you need it
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportChannels.map((channel) => (
                <Card 
                  key={channel.title} 
                  className={`p-6 text-center transition-all hover:shadow-lg ${
                    channel.primary ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <span className="text-4xl mb-4 block">{channel.icon}</span>
                  <h3 className="font-semibold mb-2">{channel.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{channel.description}</p>
                  
                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Availability:</span>
                      <span className="font-medium">{channel.availability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Response:</span>
                      <span className="font-medium">{channel.responseTime}</span>
                    </div>
                    <div className="mb-3">
                      <Badge 
                        variant="outline"
                        size="sm"
                        className={channel.planAvailability === 'All Plans' ? 'bg-green-50 text-green-700' : ''}
                      >
                        {channel.planAvailability}
                      </Badge>
                    </div>
                  </div>
                  
                  <Link href={channel.href}>
                    <Button 
                      variant={channel.primary ? 'primary' : 'outline'} 
                      size="sm" 
                      className="w-full"
                    >
                      {channel.action}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Support Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Common Support Topics</h2>
              <p className="text-lg text-gray-600">
                Browse common issues and questions organized by category
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {supportCategories.map((category) => (
                <Card key={category.title} className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{category.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-3">{category.title}</h3>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      <ul className="space-y-2">
                        {category.topics.map((topic, index) => (
                          <li key={index} className="text-sm text-gray-700">
                            <Link href="#" className="hover:text-blue-600 transition-colors">
                              → {topic}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Emergency Support */}
      <section className="py-16 bg-red-50 border-l-4 border-red-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4 text-red-800">{emergencySupport.title}</h2>
                <p className="text-red-700 mb-6">{emergencySupport.description}</p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2 text-red-800">Emergency Hotline</h3>
                    <a 
                      href={`tel:${emergencySupport.phone}`}
                      className="text-red-600 hover:text-red-700 font-mono text-lg"
                    >
                      {emergencySupport.phone}
                    </a>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-red-800">Emergency Email</h3>
                    <a 
                      href={`mailto:${emergencySupport.email}`}
                      className="text-red-600 hover:text-red-700"
                    >
                      {emergencySupport.email}
                    </a>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 text-red-800">Use emergency support for:</h3>
                  <ul className="space-y-2">
                    {emergencySupport.criteria.map((criterion, index) => (
                      <li key={index} className="flex items-center text-red-700">
                        <svg className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {criterion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Support Hours */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Support Hours</h2>
              <p className="text-lg text-gray-600">
                Our global support team provides assistance across multiple time zones
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {supportHours.map((region) => (
                <Card key={region.region} className="p-6 text-center">
                  <h3 className="font-semibold mb-2">{region.region}</h3>
                  <p className="text-sm text-gray-500 mb-4">{region.timezone}</p>
                  <div className="space-y-2">
                    <p className="font-medium">{region.hours}</p>
                    <p className="text-sm text-gray-600">{region.weekend}</p>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-600">
                <span className="font-medium">Emergency support:</span> Available 24/7 for critical issues
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Self-Service Resources */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Try Self-Service First
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Many questions can be answered quickly using our comprehensive resources
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <span className="text-4xl mb-4 block">📚</span>
                <h3 className="font-semibold mb-2">Documentation</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive guides and API reference
                </p>
                <Link href="/docs">
                  <Button variant="outline" size="sm" className="w-full">
                    Browse Docs
                  </Button>
                </Link>
              </Card>
              
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <span className="text-4xl mb-4 block">❓</span>
                <h3 className="font-semibold mb-2">Help Center</h3>
                <p className="text-sm text-gray-600 mb-4">
                  FAQs and common solutions
                </p>
                <Link href="/resources/help-center">
                  <Button variant="outline" size="sm" className="w-full">
                    Get Help
                  </Button>
                </Link>
              </Card>
              
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <span className="text-4xl mb-4 block">🎥</span>
                <h3 className="font-semibold mb-2">Video Tutorials</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Step-by-step video guides
                </p>
                <Link href="/resources/tutorials">
                  <Button variant="outline" size="sm" className="w-full">
                    Watch Videos
                  </Button>
                </Link>
              </Card>
              
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <span className="text-4xl mb-4 block">💬</span>
                <h3 className="font-semibold mb-2">Community</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect with other developers
                </p>
                <Link href="/community">
                  <Button variant="outline" size="sm" className="w-full">
                    Join Community
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Still Need Help?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Our support team is standing by to help you succeed with Zoptal.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="#chat">
                <Button variant="white" size="lg">
                  Start Live Chat
                </Button>
              </Link>
              <Link href="mailto:support@zoptal.com">
                <Button variant="outline-white" size="lg">
                  Send Email
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm text-blue-100">
                <strong>Average Response Times:</strong> Live Chat &lt; 2 min • Email &lt; 4 hours • Phone &lt; 30 min
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}