import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';

export const metadata: Metadata = {
  title: 'Help Center - Support & Resources | Zoptal',
  description: 'Get help with Zoptal platform. Find answers to common questions, troubleshooting guides, video tutorials, and contact our support team.',
  keywords: [
    'help center',
    'customer support',
    'troubleshooting',
    'FAQ',
    'tutorials',
    'technical support',
    'documentation help',
    'contact support',
  ],
  alternates: {
    canonical: 'https://zoptal.com/resources/help-center',
  },
};

const helpCategories = [
  {
    title: 'Getting Started',
    icon: '🚀',
    description: 'New to Zoptal? Start here',
    articles: 45,
    topics: [
      'Account Setup',
      'First Project',
      'Platform Overview',
      'Quick Start Guide',
    ],
  },
  {
    title: 'Account & Billing',
    icon: '💳',
    description: 'Manage your account and payments',
    articles: 32,
    topics: [
      'Subscription Plans',
      'Payment Methods',
      'Invoices',
      'Account Settings',
    ],
  },
  {
    title: 'Projects & Deployments',
    icon: '🚢',
    description: 'Create and manage your projects',
    articles: 58,
    topics: [
      'Creating Projects',
      'Deployment Process',
      'Environment Variables',
      'Build Configuration',
    ],
  },
  {
    title: 'AI Agents',
    icon: '🤖',
    description: 'Build and train AI agents',
    articles: 41,
    topics: [
      'Agent Creation',
      'Training Data',
      'Integration',
      'Performance Tuning',
    ],
  },
  {
    title: 'API & Integration',
    icon: '🔌',
    description: 'Connect with external services',
    articles: 36,
    topics: [
      'API Authentication',
      'Webhooks',
      'Third-party Services',
      'SDK Usage',
    ],
  },
  {
    title: 'Troubleshooting',
    icon: '🔧',
    description: 'Common issues and solutions',
    articles: 29,
    topics: [
      'Build Errors',
      'Deployment Issues',
      'Performance',
      'Error Messages',
    ],
  },
];

const popularArticles = [
  {
    title: 'How to Deploy Your First Application',
    category: 'Getting Started',
    readTime: '5 min',
    helpful: 1247,
  },
  {
    title: 'Understanding Zoptal Pricing Plans',
    category: 'Account & Billing',
    readTime: '3 min',
    helpful: 892,
  },
  {
    title: 'Troubleshooting Build Failures',
    category: 'Troubleshooting',
    readTime: '8 min',
    helpful: 756,
  },
  {
    title: 'Setting Up Custom Domains',
    category: 'Projects & Deployments',
    readTime: '6 min',
    helpful: 623,
  },
  {
    title: 'Creating Your First AI Agent',
    category: 'AI Agents',
    readTime: '10 min',
    helpful: 589,
  },
];

const faqs = [
  {
    question: 'How do I get started with Zoptal?',
    answer: 'Getting started is easy! Sign up for a free account, create your first project using our templates or AI prompt builder, and deploy with a single click. Our Quick Start guide walks you through the entire process.',
  },
  {
    question: 'What programming languages does Zoptal support?',
    answer: 'Zoptal supports all major programming languages including JavaScript/TypeScript, Python, Java, Go, Ruby, PHP, and more. Our AI agents can work with any language and framework.',
  },
  {
    question: 'How does billing work?',
    answer: 'We offer flexible monthly and annual billing options. You\'re charged based on your plan tier and any additional usage. All plans include a free tier with generous limits. You can upgrade, downgrade, or cancel anytime.',
  },
  {
    question: 'Can I migrate my existing application to Zoptal?',
    answer: 'Yes! We provide migration tools and guides for popular platforms. Our support team can also assist with complex migrations. Most applications can be migrated with minimal changes.',
  },
  {
    question: 'What kind of support do you offer?',
    answer: 'We offer multiple support channels: community forum, documentation, email support (Pro plans), and priority support with dedicated account managers (Enterprise plans). Our average response time is under 2 hours.',
  },
  {
    question: 'Is my data secure on Zoptal?',
    answer: 'Security is our top priority. We use enterprise-grade encryption, regular security audits, SOC 2 compliance, and follow industry best practices. Your code and data are always encrypted at rest and in transit.',
  },
];

const contactOptions = [
  {
    title: 'Documentation',
    description: 'Browse our comprehensive docs',
    icon: '📚',
    action: 'View Docs',
    href: '/resources/documentation',
  },
  {
    title: 'Community Forum',
    description: 'Get help from the community',
    icon: '💬',
    action: 'Visit Forum',
    href: '/community',
  },
  {
    title: 'Email Support',
    description: 'Contact our support team',
    icon: '📧',
    action: 'Send Email',
    href: 'mailto:support@zoptal.com',
  },
  {
    title: 'Live Chat',
    description: 'Chat with us in real-time',
    icon: '💭',
    action: 'Start Chat',
    href: '#chat',
  },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How can we help you?
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Search our knowledge base or browse topics below
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form className="relative">
                <Input
                  type="search"
                  placeholder="Search for answers..."
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
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <span className="text-blue-100">Popular searches:</span>
                <Link href="#" className="text-white hover:underline">deployment</Link>
                <Link href="#" className="text-white hover:underline">billing</Link>
                <Link href="#" className="text-white hover:underline">custom domain</Link>
                <Link href="#" className="text-white hover:underline">API key</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Help Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Browse by Topic</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category) => (
                <Card key={category.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={`/resources/help-center/${category.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{category.icon}</span>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">
                            {category.title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {category.description}
                          </p>
                          <p className="text-sm text-gray-500 mb-3">
                            {category.articles} articles
                          </p>
                          <div className="space-y-1">
                            {category.topics.map((topic) => (
                              <div key={topic} className="text-sm text-blue-600 hover:text-blue-700">
                                {topic} →
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Articles */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Popular Articles</h2>
            
            <div className="space-y-4">
              {popularArticles.map((article, index) => (
                <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" size="sm">
                          {article.category}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {article.readTime} read
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">
                        <Link href="#" className="hover:text-blue-600 transition-colors">
                          {article.title}
                        </Link>
                      </h3>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-500">
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        {article.helpful} found helpful
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button variant="outline">
                View All Articles
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Frequently Asked Questions
            </h2>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <Card>
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <span className="text-left font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
      
      {/* Contact Options */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Still need help?
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              We're here to help. Choose your preferred support channel.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactOptions.map((option) => (
                <Card key={option.title} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <span className="text-4xl mb-4 block">{option.icon}</span>
                  <h3 className="font-semibold mb-2">{option.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {option.description}
                  </p>
                  <Link href={option.href}>
                    <Button variant="outline" size="sm" className="w-full">
                      {option.action}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
            
            {/* Support Hours */}
            <div className="mt-12 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Support Hours</h3>
              <p className="text-gray-600">
                Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                Saturday - Sunday: 10:00 AM - 4:00 PM EST
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Average response time: &lt; 2 hours
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Video Tutorials CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>Video Tutorials</span>
            </div>
            <h2 className="text-3xl font-bold mb-6">
              Learn with Video Tutorials
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Watch step-by-step video guides created by our team. 
              Perfect for visual learners.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/resources/tutorials">
                <Button variant="white" size="lg">
                  Browse Tutorials
                </Button>
              </Link>
              <Link href="https://youtube.com/zoptal">
                <Button variant="outline-white" size="lg">
                  YouTube Channel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}