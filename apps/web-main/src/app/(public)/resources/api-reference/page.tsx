import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export const metadata: Metadata = {
  title: 'API Reference | Complete Documentation | Zoptal',
  description: 'Complete API reference documentation for Zoptal platform. RESTful APIs, GraphQL endpoints, webhooks, SDKs, and integration guides for developers.',
  keywords: [
    'API documentation',
    'REST API',
    'GraphQL API',
    'API reference',
    'developer API',
    'API integration',
    'webhook documentation',
    'SDK reference',
  ],
};

const apiEndpoints = [
  {
    category: 'Authentication',
    description: 'Secure authentication and authorization endpoints',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/auth/login',
        description: 'Authenticate user and obtain access token',
      },
      {
        method: 'POST',
        path: '/api/v1/auth/refresh',
        description: 'Refresh access token using refresh token',
      },
      {
        method: 'POST',
        path: '/api/v1/auth/logout',
        description: 'Invalidate current session',
      },
      {
        method: 'GET',
        path: '/api/v1/auth/user',
        description: 'Get current authenticated user details',
      },
    ],
  },
  {
    category: 'Projects',
    description: 'Manage projects and applications',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/projects',
        description: 'List all projects',
      },
      {
        method: 'POST',
        path: '/api/v1/projects',
        description: 'Create a new project',
      },
      {
        method: 'GET',
        path: '/api/v1/projects/{id}',
        description: 'Get project details',
      },
      {
        method: 'PUT',
        path: '/api/v1/projects/{id}',
        description: 'Update project configuration',
      },
      {
        method: 'DELETE',
        path: '/api/v1/projects/{id}',
        description: 'Delete a project',
      },
    ],
  },
  {
    category: 'Deployments',
    description: 'Deploy and manage application instances',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/deployments',
        description: 'Create new deployment',
      },
      {
        method: 'GET',
        path: '/api/v1/deployments/{id}',
        description: 'Get deployment status',
      },
      {
        method: 'POST',
        path: '/api/v1/deployments/{id}/rollback',
        description: 'Rollback to previous version',
      },
      {
        method: 'GET',
        path: '/api/v1/deployments/{id}/logs',
        description: 'Stream deployment logs',
      },
    ],
  },
  {
    category: 'AI Agents',
    description: 'Create and manage AI agents',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/ai/agents',
        description: 'Create new AI agent',
      },
      {
        method: 'POST',
        path: '/api/v1/ai/agents/{id}/chat',
        description: 'Send message to AI agent',
      },
      {
        method: 'GET',
        path: '/api/v1/ai/agents/{id}/history',
        description: 'Get conversation history',
      },
      {
        method: 'POST',
        path: '/api/v1/ai/agents/{id}/train',
        description: 'Train agent with custom data',
      },
    ],
  },
];

const sdkLanguages = [
  { name: 'JavaScript/TypeScript', icon: '🟨', version: '2.5.0' },
  { name: 'Python', icon: '🐍', version: '1.8.2' },
  { name: 'Go', icon: '🐹', version: '1.3.0' },
  { name: 'Java', icon: '☕', version: '3.1.4' },
  { name: 'PHP', icon: '🐘', version: '2.0.1' },
  { name: 'Ruby', icon: '💎', version: '1.5.3' },
];

const codeExamples = {
  curl: `curl -X POST https://api.zoptal.com/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'`,
  
  javascript: `import { ZoptalClient } from '@zoptal/sdk';

const client = new ZoptalClient({
  apiKey: process.env.ZOPTAL_API_KEY,
});

// Authenticate
const { token } = await client.auth.login({
  email: 'user@example.com',
  password: 'your-password',
});

// Create a project
const project = await client.projects.create({
  name: 'My Awesome App',
  type: 'web',
  framework: 'nextjs',
});`,
  
  python: `from zoptal import Client

client = Client(api_key=os.environ['ZOPTAL_API_KEY'])

# Authenticate
response = client.auth.login(
    email='user@example.com',
    password='your-password'
)

# Create a project
project = client.projects.create(
    name='My Awesome App',
    type='web',
    framework='django'
)`,
};

export default function APIReferencePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-green-500 text-white">
                API v1
              </Badge>
              <Badge variant="secondary" className="bg-blue-500 text-white">
                REST & GraphQL
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              API Reference
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Build powerful applications with Zoptal's comprehensive API. 
              Access all platform features programmatically with our RESTful and GraphQL APIs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="lg">
                Get API Key
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-gray-900">
                View Postman Collection
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-gray-900">
                OpenAPI Spec
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Base URL and Authentication */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">Base URL</h3>
                <code className="block p-3 bg-gray-900 text-green-400 rounded text-sm font-mono">
                  https://api.zoptal.com/v1
                </code>
                <p className="mt-3 text-sm text-gray-600">
                  All API endpoints are relative to this base URL. 
                  Use HTTPS for all requests.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">Authentication</h3>
                <code className="block p-3 bg-gray-900 text-green-400 rounded text-sm font-mono">
                  Authorization: Bearer YOUR_API_KEY
                </code>
                <p className="mt-3 text-sm text-gray-600">
                  Include your API key in the Authorization header for all requests.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Start */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Quick Start</h2>
            
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>
              
              <TabsContent value="curl">
                <Card className="p-6 bg-gray-900">
                  <pre className="text-green-400 overflow-x-auto">
                    <code>{codeExamples.curl}</code>
                  </pre>
                </Card>
              </TabsContent>
              
              <TabsContent value="javascript">
                <Card className="p-6 bg-gray-900">
                  <pre className="text-green-400 overflow-x-auto">
                    <code>{codeExamples.javascript}</code>
                  </pre>
                </Card>
              </TabsContent>
              
              <TabsContent value="python">
                <Card className="p-6 bg-gray-900">
                  <pre className="text-green-400 overflow-x-auto">
                    <code>{codeExamples.python}</code>
                  </pre>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
      
      {/* API Endpoints */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">API Endpoints</h2>
            
            <div className="space-y-12">
              {apiEndpoints.map((category) => (
                <div key={category.category}>
                  <h3 className="text-2xl font-semibold mb-3">{category.category}</h3>
                  <p className="text-gray-600 mb-6">{category.description}</p>
                  
                  <div className="space-y-3">
                    {category.endpoints.map((endpoint) => (
                      <Card
                        key={`${endpoint.method}-${endpoint.path}`}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Badge
                              variant={
                                endpoint.method === 'GET' ? 'success' :
                                endpoint.method === 'POST' ? 'primary' :
                                endpoint.method === 'PUT' ? 'warning' :
                                endpoint.method === 'DELETE' ? 'danger' :
                                'secondary'
                              }
                              className="font-mono min-w-[60px] text-center"
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm font-mono">{endpoint.path}</code>
                          </div>
                          <span className="text-sm text-gray-600">
                            {endpoint.description}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/resources/documentation/api">
                <Button variant="outline" size="lg">
                  View Full API Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* SDKs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Official SDKs</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sdkLanguages.map((sdk) => (
                <Card key={sdk.name} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{sdk.icon}</span>
                      <h3 className="text-lg font-semibold">{sdk.name}</h3>
                    </div>
                    <Badge variant="outline" size="sm">
                      v{sdk.version}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <Link
                      href={`/resources/documentation/sdks/${sdk.name.toLowerCase().replace(/[^a-z]/g, '')}`}
                      className="block text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Documentation →
                    </Link>
                    <Link
                      href={`https://github.com/zoptal/sdk-${sdk.name.toLowerCase().replace(/[^a-z]/g, '')}`}
                      className="block text-blue-600 hover:text-blue-700 text-sm"
                    >
                      GitHub Repository →
                    </Link>
                    <Link
                      href={`/resources/documentation/sdks/${sdk.name.toLowerCase().replace(/[^a-z]/g, '')}/quickstart`}
                      className="block text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Quick Start Guide →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* GraphQL */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">GraphQL API</h2>
                <p className="text-lg text-gray-600 mb-6">
                  For complex queries and real-time subscriptions, use our GraphQL API. 
                  Get exactly the data you need with a single request.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Strongly typed schema</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Real-time subscriptions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Interactive playground</span>
                  </div>
                </div>
                <div className="mt-8 space-x-4">
                  <Link href="/graphql">
                    <Button variant="primary">
                      Open GraphQL Playground
                    </Button>
                  </Link>
                  <Link href="/resources/documentation/graphql">
                    <Button variant="outline">
                      GraphQL Docs
                    </Button>
                  </Link>
                </div>
              </div>
              
              <Card className="p-6 bg-gray-900">
                <pre className="text-green-400 overflow-x-auto text-sm">
                  <code>{`query GetProject($id: ID!) {
  project(id: $id) {
    id
    name
    status
    deployments(last: 5) {
      edges {
        node {
          id
          version
          status
          createdAt
        }
      }
    }
  }
}`}</code>
                </pre>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Webhooks */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Webhooks</h2>
            <p className="text-lg text-gray-600 mb-8">
              Receive real-time notifications when events occur in your Zoptal account.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-3">Project Events</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• project.created</li>
                  <li>• project.updated</li>
                  <li>• project.deleted</li>
                  <li>• project.deployed</li>
                </ul>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold mb-3">Deployment Events</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• deployment.started</li>
                  <li>• deployment.completed</li>
                  <li>• deployment.failed</li>
                  <li>• deployment.rolled_back</li>
                </ul>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold mb-3">AI Agent Events</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• agent.created</li>
                  <li>• agent.message_received</li>
                  <li>• agent.training_completed</li>
                  <li>• agent.error</li>
                </ul>
              </Card>
            </div>
            
            <div className="mt-8 text-center">
              <Link href="/resources/documentation/webhooks">
                <Button variant="outline">
                  Webhook Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Rate Limits */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Rate Limits</h2>
            <p className="text-lg text-gray-600 mb-8">
              API rate limits vary by plan. Monitor your usage with response headers.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-2">Free</h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">1,000</div>
                <div className="text-gray-600">requests/hour</div>
              </Card>
              
              <Card className="p-6 border-blue-500 border-2">
                <h3 className="font-semibold text-lg mb-2">Pro</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000</div>
                <div className="text-gray-600">requests/hour</div>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">Custom</div>
                <div className="text-gray-600">Contact sales</div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}