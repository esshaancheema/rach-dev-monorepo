import { Metadata } from 'next';
import Link from 'next/link';
import { 
  ChevronLeftIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { faqs, helpCategories } from '@/lib/help/data';
import FAQCard from '@/components/help/FAQCard';
import SearchBox from '@/components/help/SearchBox';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Zoptal Help Center',
  description: 'Find answers to the most commonly asked questions about Zoptal\'s software development services, pricing, process, and more.',
  keywords: [
    'FAQ',
    'frequently asked questions',
    'software development FAQ',
    'Zoptal questions',
    'development process',
    'pricing questions',
    'technical support'
  ],
  openGraph: {
    title: 'Frequently Asked Questions | Zoptal Help Center',
    description: 'Find answers to the most commonly asked questions about Zoptal\'s software development services.',
    url: 'https://zoptal.com/help/faq',
    siteName: 'Zoptal',
    images: [
      {
        url: '/images/help/faq-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Zoptal FAQ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions | Zoptal Help Center',
    description: 'Find answers to the most commonly asked questions about Zoptal\'s software development services.',
    images: ['/images/help/faq-og.jpg'],
    creator: '@ZoptalTech',
  },
};

export default function FAQPage() {
  const featuredFAQs = faqs.filter(faq => faq.featured).sort((a, b) => a.order - b.order);
  const categoryFAQs = helpCategories.map(category => ({
    category,
    faqs: faqs.filter(faq => faq.categoryId === category.id && !faq.featured)
  })).filter(item => item.faqs.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/help"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-2" />
              Back to Help Center
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-green-200 mr-4" />
            <h1 className="text-4xl lg:text-5xl font-bold">
              Frequently Asked Questions
            </h1>
          </div>
          
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Quick answers to the most common questions about our software development 
            services, process, pricing, and support.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <SearchBox />
          </div>

          {/* FAQ Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{faqs.length}</div>
              <div className="text-green-200 text-sm">Total FAQs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{featuredFAQs.length}</div>
              <div className="text-green-200 text-sm">Popular Questions</div>
            </div>
            <div className="text-center md:col-span-1 col-span-2">
              <div className="text-2xl font-bold text-white">
                {Math.round(faqs.reduce((acc, faq) => acc + (faq.helpful / (faq.helpful + faq.notHelpful)), 0) / faqs.length * 100)}%
              </div>
              <div className="text-green-200 text-sm">Helpful Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Popular FAQs */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Most Popular Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These are the questions our customers ask most frequently. Find quick answers to common concerns.
            </p>
          </div>

          <div className="space-y-4">
            {featuredFAQs.map((faq) => (
              <FAQCard key={faq.id} faq={faq} showCategory={true} />
            ))}
          </div>
        </section>

        {/* FAQs by Category */}
        {categoryFAQs.map(({ category, faqs: categoryFaqList }) => (
          <section key={category.id} className="mb-16">
            <div className="flex items-center mb-8">
              <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center text-white text-xl mr-4`}>
                {category.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {category.name}
                </h2>
                <p className="text-gray-600">{categoryFaqList.length} question{categoryFaqList.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="space-y-4">
              {categoryFaqList.map((faq) => (
                <FAQCard key={faq.id} faq={faq} showCategory={false} />
              ))}
            </div>
          </section>
        ))}

        {/* Still Need Help */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <QuestionMarkCircleIcon className="h-12 w-12 text-blue-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-900">
                Didn't find your answer?
              </h2>
            </div>
            
            <p className="text-lg text-gray-600 mb-8">
              Can't find the answer you're looking for? Our support team is ready to help 
              with any specific questions about your project or our services.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/demos/ai-chatbot-live"
                className="inline-flex items-center px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
              >
                Try AI Assistant
              </Link>
            </div>

            {/* Alternative Help Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Browse Articles</h3>
                <p className="text-sm text-gray-600">
                  <Link href="/help/articles" className="text-blue-600 hover:underline">
                    Search our knowledge base
                  </Link>
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">📧</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                <p className="text-sm text-gray-600">
                  <a href="mailto:hello@zoptal.com" className="text-green-600 hover:underline">
                    hello@zoptal.com
                  </a>
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">📞</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                <p className="text-sm text-gray-600">
                  <a href="tel:+15551234567" className="text-purple-600 hover:underline">
                    +1 (555) 123-4567
                  </a>
                </p>
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
            name: 'Zoptal Frequently Asked Questions',
            description: 'Comprehensive FAQ page covering software development services, pricing, process, and support',
            url: 'https://zoptal.com/help/faq',
            mainEntity: faqs.map(faq => ({
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