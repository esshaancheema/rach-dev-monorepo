'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MAIN_NAVIGATION } from '@/lib/constants/navigation';

const POPULAR_PAGES = [
  {
    title: 'Solutions',
    description: 'Explore our AI-powered development solutions',
    href: '/solutions',
    icon: '🚀',
    badge: 'Popular',
  },
  {
    title: 'Pricing',
    description: 'Find the perfect plan for your needs',
    href: '/pricing',
    icon: '💰',
  },
  {
    title: 'AI Agents',
    description: 'Build intelligent automation with AI agents',
    href: '/ai-agents',
    icon: '🤖',
    badge: 'New',
  },
  {
    title: 'Case Studies',
    description: 'See how others are building with Zoptal',
    href: '/case-studies',
    icon: '📊',
  },
  {
    title: 'Documentation',
    description: 'Get started with our comprehensive guides',
    href: '/resources/documentation',
    icon: '📚',
  },
  {
    title: 'Blog',
    description: 'Latest insights on AI and development',
    href: '/resources/blog',
    icon: '✍️',
  },
];

const HELP_RESOURCES = [
  {
    title: 'Get Help',
    description: 'Search our help center for answers',
    href: '/resources/help-center',
    action: 'Browse Help Center',
  },
  {
    title: 'Contact Support',
    description: 'Reach out to our support team',
    href: '/contact',
    action: 'Contact Us',
  },
  {
    title: 'Community',
    description: 'Connect with other developers',
    href: '/community',
    action: 'Join Community',
  },
];

const SEARCH_SUGGESTIONS = [
  'How to build AI agents',
  'Custom software development',
  'Mobile app development',
  'AI integration services', 
  'Technical consulting',
  'Zoptal pricing',
  'Getting started guide',
  'API documentation',
];

function SearchBox() {
  return (
    <div className="max-w-md mx-auto mb-8">
      <form action="/search" method="GET" className="relative">
        <input
          type="text"
          name="q"
          placeholder="Search our site..."
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>
      
      {/* Search suggestions */}
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Popular searches:</p>
        <div className="flex flex-wrap gap-2">
          {SEARCH_SUGGESTIONS.slice(0, 4).map((suggestion, index) => (
            <Link
              key={index}
              href={`/search?q=${encodeURIComponent(suggestion)}`}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-full transition-colors"
            >
              {suggestion}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavigationSection() {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-center mb-8">Explore Our Platform</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {POPULAR_PAGES.map((page, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <Link href={page.href} className="block">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{page.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{page.title}</h3>
                    {page.badge && (
                      <Badge 
                        variant={page.badge === 'New' ? 'success' : 'primary'} 
                        size="sm"
                      >
                        {page.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{page.description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </Card>
        ))}
      </div>
      
      {/* Full navigation menu */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">All Sections</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MAIN_NAVIGATION.map((section) => (
            <div key={section.label}>
              <Link 
                href={section.href}
                className="block font-medium text-blue-600 hover:text-blue-800 mb-2"
              >
                {section.label}
              </Link>
              {section.children && (
                <ul className="space-y-1">
                  {section.children.slice(0, 4).map((child) => (
                    <li key={child.label}>
                      <Link 
                        href={child.href}
                        className="text-sm text-gray-600 hover:text-blue-600 block py-1"
                      >
                        × {child.label}
                      </Link>
                    </li>
                  ))}
                  {section.children.length > 4 && (
                    <li>
                      <Link 
                        href={section.href}
                        className="text-sm text-blue-600 hover:text-blue-800 block py-1"
                      >
                        + {section.children.length - 4} more
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function HelpSection() {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-center mb-8">Need Help?</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {HELP_RESOURCES.map((resource, index) => (
          <Card key={index} className="p-6 text-center">
            <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
            <p className="text-gray-600 mb-4">{resource.description}</p>
            <Link href={resource.href}>
              <Button variant="outline" size="sm">
                {resource.action}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorAnimation() {
  return (
    <div className="relative mb-8">
      <div className="text-center">
        <div className="inline-block relative">
          <div className="text-9xl font-bold text-gray-200 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl animate-bounce">🤖</div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-blue-700">Our AI is searching for this page...</span>
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Error Animation */}
          <ErrorAnimation />
          
          {/* Main Message */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track with our AI-accelerated development platform.
            </p>
            
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/">
                <Button size="lg" className="w-full sm:w-auto">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go Home
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => window.history.back()}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back
              </Button>
            </div>
            
            {/* Search Box */}
            <SearchBox />
          </div>

          {/* Navigation Section */}
          <NavigationSection />
          
          {/* Help Section */}
          <HelpSection />
          
          {/* Bottom CTA */}
          <div className="text-center">
            <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <h2 className="text-2xl font-bold mb-4">Ready to Build Something Amazing?</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Don't let a missing page stop your progress. Start building with AI-accelerated 
                development tools that help you ship faster and better.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Building Free
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Schedule Demo
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}