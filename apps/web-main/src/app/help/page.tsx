import { Metadata } from 'next';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { helpCategories, getFeaturedArticles, getFeaturedFAQs } from '@/lib/help/data';
import SearchBox from '@/components/help/SearchBox';
import CategoryCard from '@/components/help/CategoryCard';
import ArticleCard from '@/components/help/ArticleCard';
import FAQCard from '@/components/help/FAQCard';

export const metadata: Metadata = {
  title: 'Help Center | Zoptal Support & Documentation',
  description: 'Find answers to your questions about Zoptal\'s software development services. Browse our comprehensive help center, FAQs, and documentation.',
  keywords: [
    'help center',
    'support documentation',
    'software development FAQ',
    'Zoptal help',
    'customer support',
    'development process',
    'pricing information',
    'project management'
  ],
  openGraph: {
    title: 'Help Center | Zoptal Support & Documentation',
    description: 'Find answers to your questions about Zoptal\'s software development services.',
    url: 'https://zoptal.com/help',
    siteName: 'Zoptal',
    images: [
      {
        url: '/images/help/help-center-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Zoptal Help Center',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Center | Zoptal Support & Documentation',
    description: 'Find answers to your questions about Zoptal\'s software development services.',
    images: ['/images/help/help-center-og.jpg'],
    creator: '@ZoptalTech',
  },
};

export default function HelpCenterPage() {
  const featuredArticles = getFeaturedArticles().slice(0, 3);
  const featuredFAQs = getFeaturedFAQs().slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <QuestionMarkCircleIcon className="h-12 w-12 text-blue-200 mr-4" />
            <h1 className="text-4xl lg:text-5xl font-bold">
              How can we help you?
            </h1>
          </div>
          
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Find answers to your questions about our software development services, 
            pricing, process, and more. We're here to help you succeed.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <SearchBox />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{helpCategories.length}</div>
              <div className="text-blue-200 text-sm">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-blue-200 text-sm">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">200+</div>
              <div className="text-blue-200 text-sm">FAQs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-blue-200 text-sm">Support</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Browse by Category */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the information you need organized by topic. Each category contains 
              detailed articles and frequently asked questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Featured Articles */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Articles
              </h2>
            </div>
            <Link
              href="/help/articles"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              View all articles
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        {/* Popular FAQs */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
            </div>
            <Link
              href="/help/faq"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              View all FAQs
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {featuredFAQs.map((faq) => (
              <FAQCard key={faq.id} faq={faq} />
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <SparklesIcon className="h-12 w-12 text-indigo-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-900">
                Still need help?
              </h2>
            </div>
            
            <p className="text-lg text-gray-600 mb-8">
              Can't find what you're looking for? Our support team is here to help you 
              with any questions about our services, pricing, or development process.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Contact Support
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Link>
              <Link
                href="/demos/ai-chatbot-live"
                className="inline-flex items-center px-8 py-4 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
              >
                Try AI Assistant
              </Link>
            </div>

            {/* Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
                <p className="text-sm text-gray-600">Available 24/7</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">📧</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
                <p className="text-sm text-gray-600">hello@zoptal.com</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">📞</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Phone Support</h3>
                <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            name: 'Zoptal Help Center',
            description: 'Comprehensive help center and documentation for Zoptal software development services',
            url: 'https://zoptal.com/help',
            mainEntity: featuredFAQs.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
              }
            })),
            provider: {
              '@type': 'Organization',
              name: 'Zoptal',
              url: 'https://zoptal.com',
            },
          }),
        }}
      />
    </div>
  );
}