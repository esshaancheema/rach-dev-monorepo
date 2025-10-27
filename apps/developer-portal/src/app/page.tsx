'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  CodeBracketIcon, 
  CubeIcon, 
  BoltIcon,
  ArrowRightIcon,
  CommandLineIcon,
  BookOpenIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const features = [
    {
      icon: DocumentTextIcon,
      title: "API Documentation",
      description: "Comprehensive API documentation with interactive examples and code samples.",
      href: "/docs/api",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: CodeBracketIcon,
      title: "Interactive API Explorer",
      description: "Test API endpoints directly from your browser with our interactive explorer.",
      href: "/api-explorer",
      color: "from-green-500 to-green-600"
    },
    {
      icon: CubeIcon,
      title: "SDK & Libraries",
      description: "Official SDKs and client libraries for popular programming languages.",
      href: "/docs/sdks",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: BoltIcon,
      title: "Quick Start",
      description: "Get up and running with the Zoptal API in minutes with our quick start guide.",
      href: "/docs/quickstart",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: CommandLineIcon,
      title: "Code Examples",
      description: "Real-world code examples and tutorials for common use cases.",
      href: "/docs/examples",
      color: "from-red-500 to-red-600"
    },
    {
      icon: BookOpenIcon,
      title: "Guides & Tutorials",
      description: "Step-by-step guides to help you build amazing applications.",
      href: "/docs/guides",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const stats = [
    { label: "API Endpoints", value: "200+" },
    { label: "Code Examples", value: "500+" },
    { label: "Languages", value: "10+" },
    { label: "Response Time", value: "<100ms" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
              Zoptal{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Developer Portal
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
              Everything you need to build amazing applications with the Zoptal Platform. 
              Comprehensive APIs, interactive documentation, and developer tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/docs/quickstart">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  Get Started
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/api-explorer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
                >
                  Try the API
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Build
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful APIs, comprehensive documentation, and developer tools to help you 
            build the next generation of applications.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={feature.href}>
                <div className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 flex-grow">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all duration-300">
                    Learn more
                    <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-4">Getting Started</h3>
              <div className="space-y-3">
                <Link href="/docs/authentication" className="block text-gray-300 hover:text-white transition-colors">
                  Authentication
                </Link>
                <Link href="/docs/rate-limiting" className="block text-gray-300 hover:text-white transition-colors">
                  Rate Limiting
                </Link>  
                <Link href="/docs/errors" className="block text-gray-300 hover:text-white transition-colors">
                  Error Handling
                </Link>
                <Link href="/docs/webhooks" className="block text-gray-300 hover:text-white transition-colors">
                  Webhooks
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-4">API Reference</h3>
              <div className="space-y-3">
                <Link href="/docs/api/authentication" className="block text-gray-300 hover:text-white transition-colors">
                  Authentication API
                </Link>
                <Link href="/docs/api/projects" className="block text-gray-300 hover:text-white transition-colors">
                  Projects API
                </Link>
                <Link href="/docs/api/ai" className="block text-gray-300 hover:text-white transition-colors">
                  AI Services API
                </Link>
                <Link href="/docs/api/billing" className="block text-gray-300 hover:text-white transition-colors">
                  Billing API
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-4">Resources</h3>
              <div className="space-y-3">
                <Link href="/docs/changelog" className="block text-gray-300 hover:text-white transition-colors">
                  Changelog
                </Link>
                <Link href="/docs/status" className="block text-gray-300 hover:text-white transition-colors">
                  API Status
                </Link>
                <Link href="/support" className="block text-gray-300 hover:text-white transition-colors">
                  Support
                </Link>
                <Link href="/community" className="block text-gray-300 hover:text-white transition-colors">
                  Community
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of developers building amazing applications with the Zoptal Platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/docs/quickstart">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Building
                </motion.button>
              </Link>
              <Link href="/api-explorer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300"
                >
                  Explore APIs
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;