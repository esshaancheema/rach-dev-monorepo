import { 
  CodeBracketIcon, 
  DocumentTextIcon, 
  RocketLaunchIcon,
  KeyIcon,
  CubeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DocsHomePage() {
  return (
    <div className="prose-docs">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Zoptal Developer Portal
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Build powerful AI-accelerated applications with our comprehensive APIs, 
          SDKs, and developer tools. Get started in minutes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/docs/quickstart" className="btn-primary inline-flex items-center">
            Get Started <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Link>
          <Link href="/docs/api" className="btn-secondary inline-flex items-center">
            API Reference <DocumentTextIcon className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Quick Start Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12 not-prose">
        <div className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
            <RocketLaunchIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Start</h3>
          <p className="text-gray-600 mb-4">
            Get up and running with the Zoptal API in under 5 minutes.
          </p>
          <Link href="/docs/quickstart" className="text-primary-600 hover:text-primary-700 font-medium">
            Start building →
          </Link>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <KeyIcon className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication</h3>
          <p className="text-gray-600 mb-4">
            Learn how to authenticate and secure your API requests.
          </p>
          <Link href="/docs/authentication" className="text-primary-600 hover:text-primary-700 font-medium">
            Learn more →
          </Link>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <CubeIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">SDKs & Libraries</h3>
          <p className="text-gray-600 mb-4">
            Official SDKs for popular programming languages and frameworks.
          </p>
          <Link href="/docs/sdks" className="text-primary-600 hover:text-primary-700 font-medium">
            Browse SDKs →
          </Link>
        </div>
      </div>

      {/* Popular Endpoints */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular API Endpoints</h2>
        
        <div className="space-y-4 not-prose">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="api-method api-method-post">POST</span>
                <code className="text-sm font-mono">/api/v1/generate/code</code>
              </div>
              <Link href="/docs/api/code-generation" className="text-primary-600 hover:text-primary-700 text-sm">
                View docs →
              </Link>
            </div>
            <p className="text-gray-600 text-sm">Generate code from natural language descriptions</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="api-method api-method-post">POST</span>
                <code className="text-sm font-mono">/api/v1/optimize/code</code>
              </div>
              <Link href="/docs/api/optimization" className="text-primary-600 hover:text-primary-700 text-sm">
                View docs →
              </Link>
            </div>
            <p className="text-gray-600 text-sm">Optimize existing code for performance and readability</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="api-method api-method-get">GET</span>
                <code className="text-sm font-mono">/api/v1/projects</code>
              </div>
              <Link href="/docs/api/projects" className="text-primary-600 hover:text-primary-700 text-sm">
                View docs →
              </Link>
            </div>
            <p className="text-gray-600 text-sm">List and manage your development projects</p>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Example Usage</h2>
        <p className="text-gray-600 mb-4">
          Here's a quick example of how to generate code using our API:
        </p>
        
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{`curl -X POST "https://api.zoptal.com/v1/generate/code" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "description": "Create a React component for a user profile card",
    "language": "javascript",
    "framework": "react"
  }'`}</code>
          </pre>
          <button className="copy-button">
            <DocumentTextIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}