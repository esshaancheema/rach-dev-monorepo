import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, HomeIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface ComingSoonProps {
  title: string;
  description?: string;
  expectedDate?: string;
  showBackButton?: boolean;
  backUrl?: string;
  backText?: string;
}

export default function ComingSoon({
  title,
  description = "We're working hard to bring you this feature. Stay tuned for updates!",
  expectedDate,
  showBackButton = true,
  backUrl = "/",
  backText = "Go Home"
}: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-8">
            <div className="text-4xl">🚧</div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* Expected Date */}
          {expectedDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 inline-block">
              <p className="text-blue-800 font-medium">
                Expected Launch: {expectedDate}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {showBackButton && (
              <Link
                href={backUrl}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg"
              >
                <ArrowLeftIcon className="mr-2 h-5 w-5" />
                {backText}
              </Link>
            )}

            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-blue-600 bg-white hover:bg-gray-50 border border-blue-600 rounded-lg transition-colors"
            >
              <HomeIcon className="mr-2 h-5 w-5" />
              Home
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <EnvelopeIcon className="mr-2 h-5 w-5" />
              Contact Us
            </Link>
          </div>

          {/* Feature Preview */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              What's Coming
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Enhanced Experience</h3>
                  <p className="text-sm text-gray-600">Improved user interface and functionality</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Fast Performance</h3>
                  <p className="text-sm text-gray-600">Optimized for speed and reliability</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">New Features</h3>
                  <p className="text-sm text-gray-600">Advanced tools and capabilities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}