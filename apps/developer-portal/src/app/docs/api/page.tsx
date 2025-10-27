'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  DocumentTextIcon, 
  CodeBracketIcon, 
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

// Dynamically import RedocStandalone to avoid SSR issues
const RedocStandalone = dynamic(
  () => import('redoc').then((mod) => mod.RedocStandalone),
  { ssr: false }
);

const ApiReferencePage = () => {
  const apiStats = [
    { label: 'Endpoints', value: '50+', icon: CodeBracketIcon },
    { label: 'Response Time', value: '<100ms', icon: ClockIcon },
    { label: 'Uptime', value: '99.9%', icon: ShieldCheckIcon },
    { label: 'Regions', value: '5', icon: GlobeAltIcon }
  ];

  const quickLinks = [
    {
      title: 'Authentication',
      description: 'Learn how to authenticate with the API',
      href: '#tag/Authentication',
      icon: '🔐'
    },
    {
      title: 'Projects API',
      description: 'Manage projects and collaborate with team members',
      href: '#tag/Projects',
      icon: '📁'
    },
    {
      title: 'AI Services',
      description: 'Integrate AI-powered features into your apps',
      href: '#tag/AI-Services',
      icon: '🤖'
    },
    {
      title: 'Billing',
      description: 'Handle subscriptions and payment processing',
      href: '#tag/Billing',
      icon: '💳'
    },
    {
      title: 'Webhooks',
      description: 'Set up real-time event notifications',
      href: '#tag/Webhooks',
      icon: '🔔'
    },
    {
      title: 'File Management',
      description: 'Upload, download, and manage files',
      href: '#tag/Files',
      icon: '📄'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              API Reference
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Complete reference documentation for the Zoptal Platform API. 
              Explore endpoints, request/response schemas, and interactive examples.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/api-explorer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  Try the API
                  <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/docs/quickstart">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  Quick Start Guide
                </motion.button>
              </Link>
            </div>

            {/* API Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {apiStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl mb-3">
                    <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Quick Navigation
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <a
                  href={link.href}
                  className="block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{link.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* API Documentation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Interactive API Documentation
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                API Status: Operational
              </div>
            </div>
          </div>
          
          <div className="api-docs-container">
            <RedocStandalone
              specUrl="/api/openapi.yaml"
              options={{
                theme: {
                  colors: {
                    primary: {
                      main: '#3B82F6'
                    }
                  },
                  typography: {
                    fontSize: '14px',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  },
                  sidebar: {
                    backgroundColor: '#F8FAFC',
                    width: '300px'
                  }
                },
                scrollYOffset: 80,
                hideDownloadButton: false,
                disableSearch: false,
                expandResponses: '200,201',
                pathInMiddlePanel: true,
                hideLoading: true,
                nativeScrollbars: false,
                requiredPropsFirst: true,
                sortPropsAlphabetically: true,
                showExtensions: true,
                hideSchemaPattern: false
              }}
            />
          </div>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid md:grid-cols-2 gap-8"
        >
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
              🚀 Need Help Getting Started?
            </h3>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              Check out our comprehensive guides and tutorials to get up and running quickly.
            </p>
            <Link href="/docs/quickstart">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Quick Start
              </motion.button>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-3">
              💬 Join Our Community
            </h3>
            <p className="text-purple-800 dark:text-purple-200 mb-4">
              Connect with other developers, share ideas, and get help from our community.
            </p>
            <Link href="/community">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Join Community
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .api-docs-container {
          min-height: 800px;
        }
        
        .redoc-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .redoc-container .menu-content {
          background-color: #f8fafc;
        }
        
        .dark .redoc-container .menu-content {
          background-color: #1f2937;
        }
        
        .redoc-container h1, 
        .redoc-container h2, 
        .redoc-container h3, 
        .redoc-container h4, 
        .redoc-container h5 {
          font-weight: 600;
        }
        
        .redoc-container .api-content {
          padding: 0;
        }
        
        @media (max-width: 768px) {
          .redoc-container {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default ApiReferencePage;