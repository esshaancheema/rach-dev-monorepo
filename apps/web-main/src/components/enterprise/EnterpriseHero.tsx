'use client';

import { useState } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { 
  ShieldCheckIcon,
  BuildingOfficeIcon,
  UsersIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const enterpriseFeatures = [
  'Dedicated Development Team',
  '24/7 Priority Support',
  'Enterprise-Grade Security',
  '99.9% Uptime SLA',
  'White-Label Solutions',
  'Ongoing Strategic Partnership'
];

const enterpriseStats = [
  { metric: '500+', label: 'Enterprise Projects', icon: BuildingOfficeIcon },
  { metric: '50+', label: 'Fortune 500 Clients', icon: UsersIcon },
  { metric: '15+', label: 'Countries Served', icon: GlobeAltIcon },
  { metric: '99.9%', label: 'Uptime SLA', icon: ShieldCheckIcon }
];

export default function EnterpriseHero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-blue-900/80 to-indigo-900/90" />
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white/10" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="max-w-2xl">
            {/* Trust Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 border border-blue-400/30 text-blue-300 text-sm font-medium mb-6">
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Trusted by Fortune 500 Companies
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Enterprise Software
              <span className="block text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
                That Scales
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed">
              Transform your organization with custom enterprise platforms built for scale, 
              security, and performance. Partner with our dedicated team of experts.
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {enterpriseFeatures.map((feature, index) => (
                <div key={index} className="flex items-center text-gray-300">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/contact?type=enterprise"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-900 bg-white hover:bg-gray-100 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Schedule Enterprise Consultation
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>

              <button
                onClick={() => setIsVideoPlaying(true)}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-gray-900 rounded-lg transition-colors duration-200"
              >
                <PlayIcon className="mr-2 h-5 w-5" />
                Watch Case Study
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="text-sm text-gray-400">
              <p className="mb-2">Trusted by leading organizations:</p>
              <div className="flex items-center space-x-6 text-gray-500">
                <span>Microsoft</span>
                <span>•</span>
                <span>Google</span>
                <span>•</span>
                <span>Amazon</span>
                <span>•</span>
                <span>IBM</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative lg:ml-8">
            {/* Main Dashboard Mockup */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-cyan-600/20 rounded-3xl rotate-3 scale-105" />
              
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                {/* Dashboard Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full" />
                        <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                        <div className="w-3 h-3 bg-green-400 rounded-full" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Enterprise Dashboard</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-500">Live</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {enterpriseStats.map((stat, index) => (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <stat.icon className="h-6 w-6 text-blue-600" />
                          <div className="text-2xl font-bold text-gray-900">{stat.metric}</div>
                        </div>
                        <div className="text-xs text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Activity Feed */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Deployment Successful</div>
                        <div className="text-xs text-gray-500">Production environment updated</div>
                      </div>
                      <div className="text-xs text-gray-400">2 min ago</div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Security Scan Complete</div>
                        <div className="text-xs text-gray-500">No vulnerabilities detected</div>
                      </div>
                      <div className="text-xs text-gray-400">5 min ago</div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Performance Optimized</div>
                        <div className="text-xs text-gray-500">Response time improved by 40%</div>
                      </div>
                      <div className="text-xs text-gray-400">10 min ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200 animate-float">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">99.9% Uptime</div>
                  <div className="text-xs text-gray-500">Enterprise SLA</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200 animate-float" style={{animationDelay: '1s'}}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">SOC 2 Compliant</div>
                  <div className="text-xs text-gray-500">Enterprise Security</div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 -left-8 bg-white rounded-xl shadow-lg p-3 border border-gray-200 animate-float" style={{animationDelay: '2s'}}>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">24/7</div>
                <div className="text-xs text-gray-500">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 0L1440 0V120C1440 120 1200 60 720 60C240 60 0 120 0 120V0Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-4xl mx-4">
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl"
            >
              ✕
            </button>
            <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Enterprise Case Study"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}