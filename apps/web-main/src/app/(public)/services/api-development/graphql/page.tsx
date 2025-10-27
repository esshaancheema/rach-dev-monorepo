import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'GraphQL API Development Services | Modern API Development | Zoptal',
  description: 'Professional GraphQL API development services. Build efficient, flexible GraphQL APIs with real-time subscriptions, strong typing, and optimal data fetching for modern applications.',
  keywords: [
    'GraphQL API development',
    'GraphQL services',
    'GraphQL schema design',
    'modern API development',
    'real-time GraphQL',
    'GraphQL subscriptions'
  ]
};

export default function GraphQLAPIPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Build Modern GraphQL APIs That Deliver
            </h1>
            
            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              Create efficient, flexible GraphQL APIs with strong typing, real-time subscriptions, 
              and optimal data fetching. Eliminate over-fetching and under-fetching with 
              precisely tailored queries.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-purple-900 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-xl"
              >
                Start Your GraphQL Project
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* GraphQL Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Choose GraphQL Over REST?
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-8">
                GraphQL offers a more efficient, flexible, and developer-friendly approach to API development, 
                allowing clients to request exactly the data they need.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Single Endpoint</h3>
                  <p className="text-gray-700 mb-4">
                    One URL for all your data needs, unlike REST's multiple endpoints
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Simplified API management</li>
                    <li>• Reduced network requests</li>
                    <li>• Better caching strategies</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Precise Data Fetching</h3>
                  <p className="text-gray-700 mb-4">
                    Request exactly what you need, nothing more, nothing less
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• No over-fetching or under-fetching</li>
                    <li>• Improved performance</li>
                    <li>• Reduced bandwidth usage</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                GraphQL Features We Implement
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Strong Typing</h4>
                  <p className="text-gray-600 text-sm">
                    Type-safe APIs with automatic validation and better developer experience
                  </p>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Real-time Subscriptions</h4>
                  <p className="text-gray-600 text-sm">
                    Live data updates for real-time applications and notifications
                  </p>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Introspection</h4>
                  <p className="text-gray-600 text-sm">
                    Self-documenting APIs with built-in schema exploration
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Development Process
              </h3>
              
              <div className="space-y-6 mb-8">
                <div className="border-l-4 border-purple-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">1. Schema Design</h4>
                  <p className="text-gray-700 mb-2">
                    Design comprehensive GraphQL schema with types, queries, mutations, and subscriptions
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Type definitions and relationships</li>
                    <li>• Query and mutation design</li>
                    <li>• Subscription planning</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">2. Resolver Implementation</h4>
                  <p className="text-gray-700 mb-2">
                    Build efficient resolvers with data loading optimization and caching
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• DataLoader for N+1 query prevention</li>
                    <li>• Caching strategies</li>
                    <li>• Error handling</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">3. Security & Performance</h4>
                  <p className="text-gray-700 mb-2">
                    Implement security measures and performance optimizations
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Query depth limiting</li>
                    <li>• Rate limiting</li>
                    <li>• Authentication integration</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Use Cases
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border-l-4 border-purple-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Social Media Platform</h4>
                  <p className="text-gray-700 mb-2">
                    Complex data relationships with real-time updates
                  </p>
                  <p className="text-sm text-purple-600">
                    User feeds, comments, likes, and real-time notifications with optimal data fetching
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">E-commerce Dashboard</h4>
                  <p className="text-gray-700 mb-2">
                    Admin interfaces with complex data visualization needs
                  </p>
                  <p className="text-sm text-purple-600">
                    Product management, order tracking, and analytics with flexible data queries
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Technology Stack
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Apollo Server</h4>
                  <p className="text-sm text-gray-600">Production-ready GraphQL server</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">GraphQL Yoga</h4>
                  <p className="text-sm text-gray-600">Fully-featured GraphQL server</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Hasura</h4>
                  <p className="text-sm text-gray-600">Instant GraphQL APIs</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Prisma</h4>
                  <p className="text-sm text-gray-600">Next-gen database toolkit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Your GraphQL API?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Let's create a modern, efficient GraphQL API that provides exactly the data 
            your applications need with optimal performance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-purple-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-lg"
            >
              Start Your GraphQL Project
            </Link>
            
            <Link
              href="/services/api-development"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-purple-600 rounded-lg transition-colors"
            >
              View All API Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}