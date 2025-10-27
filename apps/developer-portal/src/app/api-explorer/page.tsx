'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  PlayIcon, 
  DocumentDuplicateIcon, 
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

interface ApiRequest {
  method: string;
  endpoint: string;
  headers: Record<string, string>;
  body?: string;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
}

const ApiExplorerPage = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [request, setRequest] = useState<ApiRequest>({
    method: 'GET',
    endpoint: '/auth/me',
    headers: {
      'Authorization': 'Bearer your-token-here',
      'Content-Type': 'application/json'
    }
  });
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Mock API endpoints for demonstration
  const endpoints = [
    {
      method: 'POST',
      path: '/auth/login',
      description: 'Authenticate user with email and password',
      category: 'Authentication',
      example: {
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'password123'
        }, null, 2)
      }
    },
    {
      method: 'GET',
      path: '/auth/me',
      description: 'Get current user profile',
      category: 'Authentication',
      example: {}
    },
    {
      method: 'GET',
      path: '/projects',
      description: 'List user projects',
      category: 'Projects',
      example: {}
    },
    {
      method: 'POST',
      path: '/projects',
      description: 'Create a new project',
      category: 'Projects',
      example: {
        body: JSON.stringify({
          name: 'My New Project',
          description: 'A project for building something awesome',
          visibility: 'private'
        }, null, 2)
      }
    },
    {
      method: 'POST',
      path: '/ai/chat',
      description: 'Start an AI chat session',
      category: 'AI Services',
      example: {
        body: JSON.stringify({
          title: 'Help with React component',
          model: 'gpt-4'
        }, null, 2)
      }
    },
    {
      method: 'GET',
      path: '/billing/subscription',
      description: 'Get current subscription details',
      category: 'Billing',
      example: {}
    }
  ];

  const categories = [...new Set(endpoints.map(e => e.category))];

  const handleSendRequest = async () => {
    setLoading(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response based on endpoint
      const mockResponse: ApiResponse = {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '999',
          'X-Response-Time': '0.123s'
        },
        data: getMockResponseData(request.endpoint, request.method),
        time: 123
      };

      setResponse(mockResponse);
      toast.success('Request completed successfully!');
    } catch (error) {
      toast.error('Request failed');
      setResponse({
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        data: { error: 'Mock error for demonstration' },
        time: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getMockResponseData = (endpoint: string, method: string) => {
    if (endpoint === '/auth/login' && method === 'POST') {
      return {
        success: true,
        data: {
          user: {
            id: 'user_123456789',
            email: 'user@example.com',
            name: 'John Doe'
          },
          tokens: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            expiresIn: 3600
          }
        }
      };
    }

    if (endpoint === '/auth/me') {
      return {
        id: 'user_123456789',
        email: 'user@example.com',
        name: 'John Doe',
        avatar: 'https://avatar.vercel.sh/john',
        role: 'user',
        createdAt: '2023-01-01T00:00:00Z'
      };
    }

    if (endpoint === '/projects') {
      if (method === 'GET') {
        return {
          data: [
            {
              id: 'proj_123456789',
              name: 'My Awesome Project',
              description: 'A project for building something great',
              status: 'active',
              createdAt: '2023-01-01T00:00:00Z'
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            hasNext: false
          }
        };
      } else {
        return {
          id: 'proj_987654321',
          name: 'My New Project',
          description: 'A project for building something awesome',
          status: 'active',
          visibility: 'private',
          createdAt: new Date().toISOString()
        };
      }
    }

    return { message: 'Mock response data' };
  };

  const copyToClipboard = async (text: string, type: 'request' | 'response') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'request') {
        setCopiedRequest(true);
        setTimeout(() => setCopiedRequest(false), 2000);
      } else {
        setCopiedResponse(true);
        setTimeout(() => setCopiedResponse(false), 2000);
      }
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const generateCurlCommand = () => {
    let curl = `curl -X ${request.method} "https://api.zoptal.com${request.endpoint}"`;
    
    Object.entries(request.headers).forEach(([key, value]) => {
      curl += ` \\\n  -H "${key}: ${value}"`;
    });

    if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      curl += ` \\\n  -d '${request.body}'`;
    }

    return curl;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            API Explorer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Interactive API testing environment. Try out our endpoints with real-time responses.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Request Panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Request Configuration
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Method and Endpoint */}
                <div className="flex gap-4">
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Method
                    </label>
                    <select
                      value={request.method}
                      onChange={(e) => setRequest(prev => ({ ...prev, method: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Endpoint
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg">
                        https://api.zoptal.com
                      </span>
                      <input
                        type="text"
                        value={request.endpoint}
                        onChange={(e) => setRequest(prev => ({ ...prev, endpoint: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="/auth/me"
                      />
                    </div>
                  </div>
                </div>

                {/* Headers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Headers
                  </label>
                  <div className="space-y-2">
                    {Object.entries(request.headers).map(([key, value], index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newHeaders = { ...request.headers };
                            delete newHeaders[key];
                            newHeaders[e.target.value] = value;
                            setRequest(prev => ({ ...prev, headers: newHeaders }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Header name"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => {
                            setRequest(prev => ({
                              ...prev,
                              headers: { ...prev.headers, [key]: e.target.value }
                            }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Header value"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Request Body */}
                {['POST', 'PUT', 'PATCH'].includes(request.method) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Request Body (JSON)
                    </label>
                    <textarea
                      value={request.body || ''}
                      onChange={(e) => setRequest(prev => ({ ...prev, body: e.target.value }))}
                      className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                      placeholder='{\n  "key": "value"\n}'
                    />
                  </div>
                )}

                {/* Send Button */}
                <motion.button
                  onClick={handleSendRequest}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PlayIcon className="w-5 h-5" />
                  )}
                  {loading ? 'Sending...' : 'Send Request'}
                </motion.button>
              </div>
            </div>

            {/* Example Endpoints */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Example Endpoints
                </h3>
              </div>
              
              <div className="p-6">
                {categories.map(category => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {endpoints.filter(e => e.category === category).map((endpoint, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setRequest({
                              method: endpoint.method,
                              endpoint: endpoint.path,
                              headers: request.headers,
                              body: endpoint.example.body
                            });
                          }}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`
                              px-2 py-1 text-xs font-semibold rounded
                              ${endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                                endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                                endpoint.method === 'PUT' ? 'bg-orange-100 text-orange-800' :
                                endpoint.method === 'PATCH' ? 'bg-purple-100 text-purple-800' :
                                'bg-red-100 text-red-800'}
                            `}>
                              {endpoint.method}
                            </span>
                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                              {endpoint.path}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {endpoint.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Response Panel */}
          <div className="space-y-6">
            {/* cURL Command */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  cURL Command
                </h3>
                <button
                  onClick={() => copyToClipboard(generateCurlCommand(), 'request')}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {copiedRequest ? (
                    <CheckIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  )}
                  {copiedRequest ? 'Copied!' : 'Copy'}
                </button>
              </div>
              
              <div className="p-6">
                <SyntaxHighlighter
                  language="bash"
                  style={vscDarkPlus}
                  className="rounded-lg"
                  customStyle={{ 
                    background: '#1f2937',
                    fontSize: '14px',
                    padding: '16px'
                  }}
                >
                  {generateCurlCommand()}
                </SyntaxHighlighter>
              </div>
            </div>

            {/* Response */}
            {response && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Response
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`
                        px-2 py-1 text-xs font-semibold rounded
                        ${response.status >= 200 && response.status < 300 ? 'bg-green-100 text-green-800' :
                          response.status >= 400 ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}
                      `}>
                        {response.status} {response.statusText}
                      </span>
                      <span className="text-sm text-gray-500">
                        {response.time}ms
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2), 'response')}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {copiedResponse ? (
                      <CheckIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    )}
                    {copiedResponse ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Headers
                    </h4>
                    <div className="space-y-1">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="text-sm font-mono text-gray-600 dark:text-gray-400 w-48">
                            {key}:
                          </span>
                          <span className="text-sm font-mono text-gray-900 dark:text-white">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Body
                    </h4>
                    <SyntaxHighlighter
                      language="json"
                      style={vscDarkPlus}
                      className="rounded-lg"
                      customStyle={{ 
                        background: '#1f2937',
                        fontSize: '14px',
                        padding: '16px'
                      }}
                    >
                      {JSON.stringify(response.data, null, 2)}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>
            )}

            {/* Info Panel */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    API Explorer Demo
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This is a demonstration environment with mock responses. 
                    In production, you would need a valid API key and the responses 
                    would be real data from the Zoptal API.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiExplorerPage;