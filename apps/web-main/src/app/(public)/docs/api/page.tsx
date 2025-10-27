import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'API Reference - Complete REST & GraphQL Documentation | Zoptal',
  description: 'Complete API documentation for Zoptal platform. REST endpoints, GraphQL schema, authentication, rate limits, and code examples.',
  keywords: [
    'API documentation',
    'REST API',
    'GraphQL',
    'API reference',
    'authentication',
    'endpoints',
    'rate limiting',
    'webhooks',
    'developer API',
  ],
  alternates: {
    canonical: 'https://zoptal.com/docs/api',
  },
};

const apiEndpoints = [
  {
    category: 'Authentication',
    description: 'Manage authentication and access tokens',
    icon: '🔐',
    color: 'from-blue-500 to-blue-600',
    endpoints: [
      { method: 'POST', path: '/auth/login', description: 'Login with credentials' },
      { method: 'POST', path: '/auth/refresh', description: 'Refresh access token' },
      { method: 'POST', path: '/auth/logout', description: 'Logout and invalidate token' },
      { method: 'GET', path: '/auth/me', description: 'Get current user info' },
    ],
  },
  {
    category: 'Projects',
    description: 'Create and manage development projects',
    icon: '📁',
    color: 'from-green-500 to-green-600',
    endpoints: [
      { method: 'GET', path: '/projects', description: 'List all projects' },
      { method: 'POST', path: '/projects', description: 'Create new project' },
      { method: 'GET', path: '/projects/{id}', description: 'Get project details' },
      { method: 'PUT', path: '/projects/{id}', description: 'Update project' },
      { method: 'DELETE', path: '/projects/{id}', description: 'Delete project' },
    ],
  },
  {
    category: 'Deployments',
    description: 'Deploy and manage application deployments',
    icon: '🚀',
    color: 'from-purple-500 to-purple-600',
    endpoints: [
      { method: 'GET', path: '/deployments', description: 'List deployments' },
      { method: 'POST', path: '/deployments', description: 'Create deployment' },
      { method: 'GET', path: '/deployments/{id}', description: 'Get deployment status' },
      { method: 'POST', path: '/deployments/{id}/rollback', description: 'Rollback deployment' },
    ],
  },
  {
    category: 'AI Agents',
    description: 'Build and manage AI agents',
    icon: '🤖',
    color: 'from-orange-500 to-orange-600',
    endpoints: [
      { method: 'GET', path: '/agents', description: 'List AI agents' },
      { method: 'POST', path: '/agents', description: 'Create new agent' },
      { method: 'POST', path: '/agents/{id}/train', description: 'Train agent model' },
      { method: 'POST', path: '/agents/{id}/chat', description: 'Chat with agent' },
    ],
  },
  {
    category: 'Analytics',
    description: 'Access application analytics and metrics',
    icon: '📊',
    color: 'from-teal-500 to-teal-600',
    endpoints: [
      { method: 'GET', path: '/analytics/overview', description: 'Get analytics overview' },
      { method: 'GET', path: '/analytics/metrics', description: 'Get detailed metrics' },
      { method: 'GET', path: '/analytics/events', description: 'Query event data' },
    ],
  },
  {
    category: 'Webhooks',
    description: 'Configure and manage webhook endpoints',
    icon: '🔗',
    color: 'from-red-500 to-red-600',
    endpoints: [
      { method: 'GET', path: '/webhooks', description: 'List webhooks' },
      { method: 'POST', path: '/webhooks', description: 'Create webhook' },
      { method: 'PUT', path: '/webhooks/{id}', description: 'Update webhook' },
      { method: 'DELETE', path: '/webhooks/{id}', description: 'Delete webhook' },
    ],
  },
];

const quickStartSteps = [
  {
    step: '1',
    title: 'Get Your API Key',
    description: 'Generate an API key from your dashboard settings',
    code: 'Dashboard → Settings → API Keys → Generate New Key',
  },
  {
    step: '2',
    title: 'Make Your First Request',
    description: 'Test the API with a simple authentication request',
    code: `curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.zoptal.com/auth/me`,
  },
  {
    step: '3',
    title: 'Create a Project',
    description: 'Create your first project via the API',
    code: `curl -X POST https://api.zoptal.com/projects \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My Project", "type": "web"}'`,
  },
];

const rateLimits = [
  {
    plan: 'Free',
    requestsPerHour: '1,000',
    concurrent: '5',
    burstLimit: '100',
  },
  {
    plan: 'Pro',
    requestsPerHour: '10,000',
    concurrent: '20',
    burstLimit: '500',
  },
  {
    plan: 'Enterprise',
    requestsPerHour: 'Custom',
    concurrent: 'Custom',
    burstLimit: 'Custom',
  },
];

const sdkExamples = [
  {
    language: 'JavaScript',
    code: `import { ZoptalAPI } from '@zoptal/sdk';

const api = new ZoptalAPI('your-api-key');

// List projects
const projects = await api.projects.list();

// Create a new project
const project = await api.projects.create({
  name: 'My App',
  type: 'web'
});`,
  },
  {
    language: 'Python',
    code: `from zoptal import ZoptalAPI

api = ZoptalAPI('your-api-key')

# List projects
projects = api.projects.list()

# Create a new project
project = api.projects.create(
    name='My App',
    type='web'
)`,
  },
  {
    language: 'cURL',
    code: `# List projects
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.zoptal.com/projects

# Create project
curl -X POST https://api.zoptal.com/projects \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My App", "type": "web"}'`,
  },
];

export default function APIDocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
              <Link href="/docs" className="hover:text-white">
                Documentation
              </Link>
              <span>/</span>
              <span className="text-white">API Reference</span>
            </nav>
            
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                🔌
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">API Reference</h1>
                <p className="text-xl text-gray-300 mb-6">
                  Complete REST API and GraphQL documentation with examples, authentication guides, 
                  and best practices for integrating with Zoptal platform.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Badge className="bg-green-100 text-green-700">
                    REST API v2.1
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700">
                    GraphQL v1.0
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700">
                    OpenAPI 3.0
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link href="#quick-start">
                <Button variant="white" size="lg">
                  Quick Start
                </Button>
              </Link>
              <Link href="#endpoints">
                <Button variant="outline-white" size="lg">
                  Browse Endpoints
                </Button>
              </Link>
              <Link href="https://api.zoptal.com/docs" className="external-link">
                <Button variant="outline-white" size="lg">
                  Interactive API Explorer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Start */}
      <section id="quick-start" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Quick Start Guide</h2>
              <p className="text-lg text-gray-600">
                Get up and running with the Zoptal API in minutes
              </p>
            </div>
            
            <div className="space-y-8">
              {quickStartSteps.map((step, index) => (
                <div key={step.step} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      {step.code}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* API Endpoints */}
      <section id="endpoints" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">API Endpoints</h2>
              <p className="text-lg text-gray-600">
                Comprehensive list of all available API endpoints organized by category
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {apiEndpoints.map((category) => (
                <Card key={category.category} className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{category.category}</h3>
                      <p className="text-gray-600 text-sm">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {category.endpoints.map((endpoint, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Badge 
                          variant="outline" 
                          size="sm"
                          className={
                            endpoint.method === 'GET' ? 'bg-green-50 text-green-700' :
                            endpoint.method === 'POST' ? 'bg-blue-50 text-blue-700' :
                            endpoint.method === 'PUT' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-700'
                          }
                        >
                          {endpoint.method}
                        </Badge>
                        <div className="flex-1">
                          <code className="text-sm font-mono text-gray-800">{endpoint.path}</code>
                          <p className="text-xs text-gray-600 mt-1">{endpoint.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Authentication */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Authentication</h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                The Zoptal API uses API keys for authentication. Include your API key in the 
                Authorization header of every request.
              </p>
              
              <div className="bg-gray-900 text-gray-300 p-6 rounded-lg mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-green-400">●</span>
                  <span className="font-semibold">Request Headers</span>
                </div>
                <code className="text-sm">
                  Authorization: Bearer YOUR_API_KEY<br/>
                  Content-Type: application/json
                </code>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">API Key Types</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Badge className="bg-blue-100 text-blue-700 mt-1">Public</Badge>
                      <div>
                        <p className="font-medium">Public API Keys</p>
                        <p className="text-sm text-gray-600">For client-side applications, limited permissions</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge className="bg-orange-100 text-orange-700 mt-1">Secret</Badge>
                      <div>
                        <p className="font-medium">Secret API Keys</p>
                        <p className="text-sm text-gray-600">For server-side applications, full permissions</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">Security Best Practices</h3>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                    <li>Never expose secret keys in client-side code</li>
                    <li>Rotate API keys regularly</li>
                    <li>Use environment variables for key storage</li>
                    <li>Implement proper key scoping and permissions</li>
                    <li>Monitor API key usage for anomalies</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Rate Limiting */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Rate Limiting</h2>
            
            <p className="text-lg text-gray-600 mb-8">
              API requests are rate-limited to ensure fair usage and optimal performance for all users.
            </p>
            
            <div className="overflow-x-auto mb-8">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Plan</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Requests/Hour</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Concurrent</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Burst Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rateLimits.map((limit) => (
                    <tr key={limit.plan}>
                      <td className="px-6 py-4">
                        <Badge 
                          variant="outline"
                          className={
                            limit.plan === 'Free' ? 'bg-gray-50 text-gray-700' :
                            limit.plan === 'Pro' ? 'bg-blue-50 text-blue-700' :
                            'bg-purple-50 text-purple-700'
                          }
                        >
                          {limit.plan}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">{limit.requestsPerHour}</td>
                      <td className="px-6 py-4 text-sm">{limit.concurrent}</td>
                      <td className="px-6 py-4 text-sm">{limit.burstLimit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Rate Limit Headers</h3>
              <p className="text-sm text-gray-700 mb-3">
                Every API response includes headers with your current rate limit status:
              </p>
              <code className="text-sm bg-white p-3 block rounded">
                X-RateLimit-Limit: 1000<br/>
                X-RateLimit-Remaining: 999<br/>
                X-RateLimit-Reset: 1609459200
              </code>
            </div>
          </div>
        </div>
      </section>
      
      {/* SDK Examples */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Code Examples</h2>
              <p className="text-lg text-gray-600">
                Example code for common operations using our official SDKs
              </p>
            </div>
            
            <div className="space-y-8">
              {sdkExamples.map((example) => (
                <div key={example.language}>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-semibold">{example.language}</h3>
                    <Badge variant="outline" size="sm">
                      {example.language === 'JavaScript' ? 'npm install @zoptal/sdk' :
                       example.language === 'Python' ? 'pip install zoptal' :
                       'Built-in'}
                    </Badge>
                  </div>
                  <div className="bg-gray-900 text-gray-300 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{example.code}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Resources */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Additional Resources
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Explore more tools and resources to help you integrate with Zoptal
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20 text-center">
                <span className="text-4xl mb-4 block">🔍</span>
                <h3 className="font-semibold mb-3">API Explorer</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Interactive API documentation
                </p>
                <Link href="https://api.zoptal.com/docs">
                  <Button variant="white" size="sm" className="w-full">
                    Explore APIs
                  </Button>
                </Link>
              </Card>
              
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20 text-center">
                <span className="text-4xl mb-4 block">📦</span>
                <h3 className="font-semibold mb-3">SDKs</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Official client libraries
                </p>
                <Link href="/docs/sdks">
                  <Button variant="white" size="sm" className="w-full">
                    View SDKs
                  </Button>
                </Link>
              </Card>
              
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20 text-center">
                <span className="text-4xl mb-4 block">🧪</span>
                <h3 className="font-semibold mb-3">Postman</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Collection for testing
                </p>
                <Link href="/docs/postman">
                  <Button variant="white" size="sm" className="w-full">
                    Download
                  </Button>
                </Link>
              </Card>
            </div>
            
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm text-blue-100">
                <strong>Need Help?</strong> Our support team is available to help with API integration.
                <Link href="/support" className="text-white hover:underline ml-1">
                  Contact Support →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Related Links */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Related Documentation</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/docs/getting-started" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Getting Started</h3>
                <p className="text-sm text-gray-600">Platform overview and setup</p>
              </Link>
              <Link href="/docs/ai-agents" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">AI Agents</h3>
                <p className="text-sm text-gray-600">Build intelligent agents</p>
              </Link>
              <Link href="/docs/webhooks" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Webhooks</h3>
                <p className="text-sm text-gray-600">Real-time event notifications</p>
              </Link>
              <Link href="/support" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Support</h3>
                <p className="text-sm text-gray-600">Get help from our team</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}