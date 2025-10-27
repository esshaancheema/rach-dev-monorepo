import { Metadata } from 'next';
import Link from 'next/link';
import { demoScenarios } from '@/lib/demos/scenarios';
import { 
  PlayIcon, 
  ClockIcon, 
  StarIcon,
  ChevronRightIcon,
  CodeBracketIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Interactive Demos | Experience Zoptal\'s Development Capabilities',
  description: 'Try our interactive demos to see how Zoptal\'s AI-powered development tools and services can transform your business. Experience real code generation, chatbots, and more.',
  keywords: [
    'interactive demos',
    'AI development tools',
    'code generation demo',
    'chatbot demo',
    'software development showcase',
    'live demonstrations',
    'developer tools',
    'technology preview'
  ],
  openGraph: {
    title: 'Interactive Demos | Experience Zoptal\'s Development Capabilities',
    description: 'Try our interactive demos to see how Zoptal\'s AI-powered development tools can transform your business.',
    url: 'https://zoptal.com/demos',
    siteName: 'Zoptal',
    images: [
      {
        url: '/images/og/demos.jpg',
        width: 1200,
        height: 630,
        alt: 'Zoptal Interactive Demos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Demos | Experience Zoptal\'s Development Capabilities',
    description: 'Try our interactive demos to see how Zoptal\'s AI-powered development tools can transform your business.',
    images: ['/images/og/demos.jpg'],
    creator: '@ZoptalTech',
  },
};

const categoryColors = {
  ai: 'from-purple-500 to-pink-500',
  web: 'from-blue-500 to-cyan-500',
  mobile: 'from-green-500 to-teal-500',
  automation: 'from-orange-500 to-red-500',
  api: 'from-indigo-500 to-purple-500',
};

const categoryIcons = {
  ai: '🤖',
  web: '🌐',
  mobile: '📱',
  automation: '⚡',
  api: '🔗',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

export default function DemosPage() {
  const featuredDemos = demoScenarios.slice(0, 3);
  const categorizedDemos = demoScenarios.reduce((acc, demo) => {
    if (!acc[demo.category]) {
      acc[demo.category] = [];
    }
    acc[demo.category].push(demo);
    return acc;
  }, {} as Record<string, typeof demoScenarios>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Experience Our Technology
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Live & Interactive
            </span>
          </h1>
          
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Don't just read about our capabilities—experience them firsthand. 
            Our interactive demos let you explore real AI-powered tools, 
            code generation, and development workflows.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="#featured-demos"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all transform hover:scale-105"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Start Exploring
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-gray-900 transition-colors"
            >
              Request Custom Demo
              <ChevronRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{demoScenarios.length}+</div>
              <div className="text-gray-300">Interactive Demos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">5min</div>
              <div className="text-gray-300">Average Demo Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">100%</div>
              <div className="text-gray-300">Hands-On Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Demos */}
      <section id="featured-demos" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              🌟 Featured Demos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with our most popular and impactful demonstrations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredDemos.map((demo) => (
              <div key={demo.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow group">
                <div className={`h-32 bg-gradient-to-r ${categoryColors[demo.category]} relative`}>
                  <div className="absolute inset-0 bg-black opacity-20"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <span className="text-6xl">{demo.icon}</span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[demo.difficulty]}`}>
                      {demo.difficulty}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {demo.title}
                    </h3>
                    <div className="flex items-center text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">{demo.estimatedTime}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {demo.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {demo.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                      {demo.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{demo.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {demo.benefits.slice(0, 2).map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/demos/${demo.id}`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Try Demo
                    </Link>
                    {demo.githubUrl && (
                      <a
                        href={demo.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <CodeBracketIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Demos by Category */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              All Interactive Demos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our complete collection of hands-on demonstrations
            </p>
          </div>

          {Object.entries(categorizedDemos).map(([category, demos]) => (
            <div key={category} className="mb-16">
              <div className="flex items-center mb-8">
                <span className="text-3xl mr-3">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                <h3 className="text-2xl font-bold text-gray-900 capitalize">
                  {category} Demonstrations
                </h3>
                <div className="ml-4 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {demos.length} demos
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demos.map((demo) => (
                  <div key={demo.id} className="bg-gray-50 rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{demo.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{demo.title}</h4>
                          <div className="flex items-center mt-1">
                            <ClockIcon className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">{demo.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColors[demo.difficulty]}`}>
                        {demo.difficulty}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {demo.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {demo.technologies.slice(0, 3).map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/demos/${demo.id}`}
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                    >
                      Try this demo
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            These demos showcase just a fraction of what we can build for your business. 
            Let's discuss your specific needs and create something extraordinary together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              <RocketLaunchIcon className="h-5 w-5 mr-2" />
              Start Your Project
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Explore Our Services
              <ChevronRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Zoptal Interactive Demos',
            description: 'Interactive demonstrations of Zoptal\'s development capabilities',
            itemListElement: demoScenarios.map((demo, index) => ({
              '@type': 'SoftwareDemo',
              position: index + 1,
              name: demo.title,
              description: demo.description,
              url: `https://zoptal.com/demos/${demo.id}`,
              applicationCategory: demo.category,
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            })),
          }),
        }}
      />
    </div>
  );
}