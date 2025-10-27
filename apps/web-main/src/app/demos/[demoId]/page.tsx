'use client';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InteractiveDemo from '@/components/demos/InteractiveDemo';
import { getDemoById, demoScenarios } from '@/lib/demos/scenarios';
import Link from 'next/link';
import { ChevronLeftIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline';

interface DemoPageProps {
  params: {
    demoId: string;
  };
}


export default function DemoPage({ params }: DemoPageProps) {
  const demo = getDemoById(params.demoId);
  
  if (!demo) {
    notFound();
  }

  const handleDemoComplete = (scenario: any, timeSpent: number) => {
    // Track demo completion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'demo_completed', {
        event_category: 'engagement',
        event_label: scenario.id,
        value: Math.round(timeSpent / 1000), // Time in seconds
      });
    }
  };

  const handleStepChange = (step: number) => {
    // Track demo progress
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'demo_progress', {
        event_category: 'engagement',
        event_label: demo.id,
        value: step + 1,
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: demo.title,
          text: demo.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/demos"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5 mr-2" />
                Back to Demos
              </Link>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{demo.icon}</span>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{demo.title}</h1>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="capitalize">{demo.category}</span>
                    <span className="mx-2">•</span>
                    <span>{demo.difficulty}</span>
                    <span className="mx-2">•</span>
                    <span>{demo.estimatedTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Share this demo"
              >
                <ShareIcon className="h-5 w-5" />
              </button>
              
              <button
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Bookmark this demo"
              >
                <BookmarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Demo */}
          <div className="lg:col-span-3">
            <InteractiveDemo 
              scenario={demo}
              onComplete={handleDemoComplete}
              onStepChange={handleStepChange}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Demo Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Demo Information</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <p className="text-gray-900 capitalize">{demo.category} Development</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Difficulty:</span>
                  <p className="text-gray-900 capitalize">{demo.difficulty}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Duration:</span>
                  <p className="text-gray-900">{demo.estimatedTime}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Steps:</span>
                  <p className="text-gray-900">{demo.steps.length} interactive steps</p>
                </div>
              </div>
            </div>

            {/* Technologies */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {demo.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {demo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Business Benefits */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Business Benefits</h3>
              <ul className="space-y-2">
                {demo.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-2">Ready to Build This?</h3>
              <p className="text-indigo-100 text-sm mb-4">
                Let's discuss how we can implement this solution for your business.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareDemo',
            name: demo.title,
            description: demo.description,
            url: `https://zoptal.com/demos/${params.demoId}`,
            applicationCategory: demo.category,
            operatingSystem: 'Web Browser',
            provider: {
              '@type': 'Organization',
              name: 'Zoptal',
              url: 'https://zoptal.com',
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              reviewCount: '127',
            },
            keywords: demo.tags.join(', '),
          }),
        }}
      />
    </div>
  );
}