import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Microservices Architecture Development | Scalable Microservices | Zoptal',
  description: 'Expert microservices architecture development services. Build scalable, maintainable microservices with containerization, service mesh, and modern DevOps practices.',
  keywords: [
    'microservices architecture',
    'microservices development',
    'container orchestration',
    'service mesh',
    'distributed systems',
    'scalable architecture'
  ]
};

export default function MicroservicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Build Scalable Microservices Architecture
            </h1>
            
            <p className="text-xl text-teal-100 mb-8 leading-relaxed">
              Transform monolithic applications into scalable, maintainable microservices. 
              Enable independent development, deployment, and scaling with modern container 
              orchestration and service mesh technologies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-teal-900 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-xl"
              >
                Start Your Microservices Journey
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Microservices Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Microservices Architecture?
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-8">
                Microservices architecture breaks down complex applications into smaller, 
                independent services that can be developed, deployed, and scaled independently.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Independent Scaling</h3>
                  <p className="text-gray-600">
                    Scale individual services based on demand, optimizing resource usage and costs
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Technology Diversity</h3>
                  <p className="text-gray-600">
                    Use the best technology stack for each service without being locked into one platform
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Fault Isolation</h3>
                  <p className="text-gray-600">
                    Service failures don't cascade, improving overall system reliability and uptime
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Architecture Components
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-teal-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Service Mesh</h4>
                  <p className="text-gray-700 mb-4">
                    Manage service-to-service communication with security, observability, and traffic management
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Traffic routing and load balancing</li>
                    <li>• Service discovery and health checks</li>
                    <li>• Security policies and mTLS</li>
                    <li>• Observability and monitoring</li>
                  </ul>
                </div>
                
                <div className="bg-teal-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Container Orchestration</h4>
                  <p className="text-gray-700 mb-4">
                    Deploy and manage containerized microservices with Kubernetes
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Automated deployment and scaling</li>
                    <li>• Service discovery and networking</li>
                    <li>• ConfigMaps and secret management</li>
                    <li>• Rolling updates and rollbacks</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Migration Strategy
              </h3>
              
              <div className="space-y-6 mb-8">
                <div className="border-l-4 border-teal-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">1. Strangler Fig Pattern</h4>
                  <p className="text-gray-700 mb-2">
                    Gradually replace monolith components with microservices
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Identify service boundaries</li>
                    <li>• Extract services incrementally</li>
                    <li>• Maintain data consistency</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-teal-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">2. Database Decomposition</h4>
                  <p className="text-gray-700 mb-2">
                    Split monolithic databases into service-specific data stores
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Database per service pattern</li>
                    <li>• Event-driven data synchronization</li>
                    <li>• SAGA pattern for transactions</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-teal-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">3. API Gateway Implementation</h4>
                  <p className="text-gray-700 mb-2">
                    Centralize API management and routing
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Request routing and aggregation</li>
                    <li>• Authentication and rate limiting</li>
                    <li>• Response transformation</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Use Cases
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border-l-4 border-teal-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">E-commerce Platform</h4>
                  <p className="text-gray-700 mb-2">
                    Separate services for catalog, inventory, orders, and payments
                  </p>
                  <p className="text-sm text-teal-600">
                    Independent scaling during sales events, technology choice per service
                  </p>
                </div>
                
                <div className="border-l-4 border-teal-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Financial Services</h4>
                  <p className="text-gray-700 mb-2">
                    Isolated services for compliance, risk management, and trading
                  </p>
                  <p className="text-sm text-teal-600">
                    Regulatory compliance isolation, high availability for critical services
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Technology Stack
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Docker</h4>
                  <p className="text-sm text-gray-600">Containerization platform</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Kubernetes</h4>
                  <p className="text-sm text-gray-600">Container orchestration</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Istio</h4>
                  <p className="text-sm text-gray-600">Service mesh platform</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Kong</h4>
                  <p className="text-sm text-gray-600">API gateway solution</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Modernize Your Architecture?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-3xl mx-auto">
            Transform your monolithic applications into scalable microservices architecture 
            that can grow with your business and adapt to changing requirements.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-teal-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-lg"
            >
              Start Your Migration
            </Link>
            
            <Link
              href="/services/api-development"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-teal-600 rounded-lg transition-colors"
            >
              View All API Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}