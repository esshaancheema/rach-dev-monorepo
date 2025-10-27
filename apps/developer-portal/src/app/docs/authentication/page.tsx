'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  KeyIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Link from 'next/link';

const AuthenticationPage = () => {
  const [copiedSections, setCopiedSections] = useState<Record<string, boolean>>({});

  const copyToClipboard = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSections(prev => ({ ...prev, [sectionId]: true }));
      setTimeout(() => {
        setCopiedSections(prev => ({ ...prev, [sectionId]: false }));
      }, 2000);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const codeExamples = {
    getApiKey: `// 1. Get your API key from the Zoptal dashboard
const apiKey = 'zpl_live_1234567890abcdef'; // Replace with your actual API key`,

    basicAuth: `// JavaScript/TypeScript
import { ZoptalClient } from '@zoptal/sdk';

const client = new ZoptalClient({
  apiKey: 'your-api-key-here',
  baseURL: 'https://api.zoptal.com'
});

// The SDK automatically handles authentication for all requests
const user = await client.auth.getCurrentUser();`,

    curlAuth: `# Using cURL with Bearer token
curl -X GET "https://api.zoptal.com/auth/me" \\
  -H "Authorization: Bearer your-api-key-here" \\
  -H "Content-Type: application/json"`,

    userAuth: `// Authenticate a user (returns JWT tokens)
const authResult = await client.auth.login({
  email: 'user@example.com',
  password: 'securePassword123'
});

// Store the tokens securely
localStorage.setItem('accessToken', authResult.accessToken);
localStorage.setItem('refreshToken', authResult.refreshToken);

// Use the access token for subsequent requests
client.setAccessToken(authResult.accessToken);`,

    refreshToken: `// Refresh an expired access token
try {
  const newTokens = await client.auth.refreshToken({
    refreshToken: localStorage.getItem('refreshToken')
  });
  
  // Update stored tokens
  localStorage.setItem('accessToken', newTokens.accessToken);
  localStorage.setItem('refreshToken', newTokens.refreshToken);
  
  client.setAccessToken(newTokens.accessToken);
} catch (error) {
  // Refresh token expired - redirect to login
  window.location.href = '/login';
}`,

    errorHandling: `// Handle authentication errors
try {
  const result = await client.projects.list();
} catch (error) {
  if (error.status === 401) {
    // Unauthorized - token expired or invalid
    console.log('Authentication failed:', error.message);
    
    // Try to refresh token
    try {
      await refreshAccessToken();
      // Retry the original request
      const result = await client.projects.list();
    } catch (refreshError) {
      // Redirect to login
      window.location.href = '/login';
    }
  }
}`
  };

  const authFlow = [
    {
      step: 1,
      title: 'Get API Key',
      description: 'Obtain your API key from the Zoptal dashboard',
      icon: KeyIcon,
      color: 'blue'
    },
    {
      step: 2,
      title: 'Initialize Client',
      description: 'Create a client instance with your API key',
      icon: ShieldCheckIcon,
      color: 'green'
    },
    {
      step: 3,
      title: 'Authenticate Users',
      description: 'Login users to get JWT access tokens',
      icon: CheckCircleIcon,
      color: 'purple'
    },
    {
      step: 4,
      title: 'Handle Token Refresh',
      description: 'Automatically refresh expired tokens',
      icon: ClockIcon,
      color: 'orange'
    }
  ];

  const securityBestPractices = [
    {
      title: 'Store API Keys Securely',
      description: 'Never expose API keys in client-side code. Use environment variables on the server.',
      type: 'critical'
    },
    {
      title: 'Use HTTPS Only',
      description: 'Always use HTTPS in production to protect tokens in transit.',
      type: 'critical'
    },
    {
      title: 'Implement Token Rotation',
      description: 'Regularly refresh access tokens and implement proper token rotation.',
      type: 'important'
    },
    {
      title: 'Handle Token Expiration',
      description: 'Implement proper error handling for expired tokens.',
      type: 'important'
    },
    {
      title: 'Use Appropriate Scopes',
      description: 'Request only the minimum permissions your application needs.',
      type: 'recommended'
    },
    {
      title: 'Monitor API Usage',
      description: 'Track API usage and set up alerts for unusual activity.',
      type: 'recommended'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-6">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Learn how to authenticate with the Zoptal API using API keys and JWT tokens. 
            Follow our security best practices to keep your application secure.
          </p>
        </motion.div>

        {/* Authentication Flow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Authentication Flow
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {authFlow.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <div className={`
                  inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4
                  ${item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    item.color === 'green' ? 'bg-green-100 text-green-600' :
                    item.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'}
                `}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-gray-500 mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* API Key Authentication */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <KeyIcon className="w-6 h-6 text-blue-600" />
                API Key Authentication
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-gray-600 dark:text-gray-300">
                API keys are used for server-to-server authentication. They provide full access to your account, 
                so keep them secure and never expose them in client-side code.
              </p>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Getting Your API Key
                  </h3>
                  <button
                    onClick={() => copyToClipboard(codeExamples.getApiKey, 'api-key')}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {copiedSections['api-key'] ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    )}
                    {copiedSections['api-key'] ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <SyntaxHighlighter
                  language="javascript"
                  style={vscDarkPlus}
                  className="rounded-lg"
                  customStyle={{ background: '#1f2937', fontSize: '14px', padding: '16px' }}
                >
                  {codeExamples.getApiKey}
                </SyntaxHighlighter>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Using the SDK
                  </h3>
                  <button
                    onClick={() => copyToClipboard(codeExamples.basicAuth, 'basic-auth')}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {copiedSections['basic-auth'] ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    )}
                    {copiedSections['basic-auth'] ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <SyntaxHighlighter
                  language="javascript"
                  style={vscDarkPlus}
                  className="rounded-lg"
                  customStyle={{ background: '#1f2937', fontSize: '14px', padding: '16px' }}
                >
                  {codeExamples.basicAuth}
                </SyntaxHighlighter>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Using cURL
                  </h3>
                  <button
                    onClick={() => copyToClipboard(codeExamples.curlAuth, 'curl-auth')}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {copiedSections['curl-auth'] ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    )}
                    {copiedSections['curl-auth'] ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <SyntaxHighlighter
                  language="bash"
                  style={vscDarkPlus}
                  className="rounded-lg"
                  customStyle={{ background: '#1f2937', fontSize: '14px', padding: '16px' }}
                >
                  {codeExamples.curlAuth}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </motion.div>

        {/* JWT Token Authentication */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                JWT Token Authentication
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-gray-600 dark:text-gray-300">
                JWT tokens are used for user authentication in client applications. They have limited lifespans 
                and can be refreshed using refresh tokens.
              </p>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    User Login
                  </h3>
                  <button
                    onClick={() => copyToClipboard(codeExamples.userAuth, 'user-auth')}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {copiedSections['user-auth'] ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    )}
                    {copiedSections['user-auth'] ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <SyntaxHighlighter
                  language="javascript"
                  style={vscDarkPlus}
                  className="rounded-lg"
                  customStyle={{ background: '#1f2937', fontSize: '14px', padding: '16px' }}
                >
                  {codeExamples.userAuth}
                </SyntaxHighlighter>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Token Refresh
                  </h3>
                  <button
                    onClick={() => copyToClipboard(codeExamples.refreshToken, 'refresh-token')}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {copiedSections['refresh-token'] ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    )}
                    {copiedSections['refresh-token'] ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <SyntaxHighlighter
                  language="javascript"
                  style={vscDarkPlus}
                  className="rounded-lg"
                  customStyle={{ background: '#1f2937', fontSize: '14px', padding: '16px' }}
                >
                  {codeExamples.refreshToken}
                </SyntaxHighlighter>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Error Handling
                  </h3>
                  <button
                    onClick={() => copyToClipboard(codeExamples.errorHandling, 'error-handling')}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {copiedSections['error-handling'] ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    )}
                    {copiedSections['error-handling'] ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <SyntaxHighlighter
                  language="javascript"
                  style={vscDarkPlus}
                  className="rounded-lg"
                  customStyle={{ background: '#1f2937', fontSize: '14px', padding: '16px' }}
                >
                  {codeExamples.errorHandling}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Best Practices */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
                Security Best Practices
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid gap-4">
                {securityBestPractices.map((practice, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className={`
                      p-4 rounded-lg border-l-4 
                      ${practice.type === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                        practice.type === 'important' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                        'border-blue-500 bg-blue-50 dark:bg-blue-900/20'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                        ${practice.type === 'critical' ? 'bg-red-100 text-red-600' :
                          practice.type === 'important' ? 'bg-orange-100 text-orange-600' :
                          'bg-blue-100 text-blue-600'}
                      `}>
                        {practice.type === 'critical' ? '!' :
                         practice.type === 'important' ? '⚠' : 'ℹ'}
                      </div>
                      <div>
                        <h3 className={`
                          font-semibold mb-1
                          ${practice.type === 'critical' ? 'text-red-900 dark:text-red-100' :
                            practice.type === 'important' ? 'text-orange-900 dark:text-orange-100' :
                            'text-blue-900 dark:text-blue-100'}
                        `}>
                          {practice.title}
                        </h3>
                        <p className={`
                          text-sm
                          ${practice.type === 'critical' ? 'text-red-800 dark:text-red-200' :
                            practice.type === 'important' ? 'text-orange-800 dark:text-orange-200' :
                            'text-blue-800 dark:text-blue-200'}
                        `}>
                          {practice.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800"
        >
          <div className="text-center">
            <InformationCircleIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Now that you understand authentication, explore our API endpoints and start building amazing applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/docs/api">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Explore API Reference
                </motion.button>
              </Link>
              <Link href="/api-explorer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Try API Explorer
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthenticationPage;