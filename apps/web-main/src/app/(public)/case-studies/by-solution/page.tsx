import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getCaseStudies } from '@/lib/cms/server';

export const metadata: Metadata = {
  title: 'Case Studies by Solution | Zoptal',
  description: 'Explore our successful projects organized by solution type. See how we\'ve helped businesses transform with custom software, mobile apps, AI agents, and SaaS solutions.',
  keywords: [
    'case studies by solution',
    'software development case studies',
    'mobile app case studies',
    'AI implementation case studies',
    'SaaS development case studies',
    'enterprise solution case studies',
  ],
};

const solutions = [
  {
    id: 'custom-software',
    name: 'Custom Software Development',
    description: 'Enterprise-grade applications tailored to unique business needs',
    count: 45,
    icon: '💻',
    color: 'blue',
  },
  {
    id: 'mobile-apps',
    name: 'Mobile App Development',
    description: 'Native and cross-platform mobile applications',
    count: 38,
    icon: '📱',
    color: 'green',
  },
  {
    id: 'ai-agents',
    name: 'AI Agents & Automation',
    description: 'Intelligent automation and AI-powered solutions',
    count: 22,
    icon: '🤖',
    color: 'purple',
  },
  {
    id: 'saas-products',
    name: 'SaaS Products',
    description: 'Scalable software-as-a-service platforms',
    count: 31,
    icon: '☁️',
    color: 'indigo',
  },
  {
    id: 'enterprise-solutions',
    name: 'Enterprise Solutions',
    description: 'Large-scale digital transformation projects',
    count: 18,
    icon: '🏢',
    color: 'gray',
  },
  {
    id: 'e-commerce',
    name: 'E-commerce Platforms',
    description: 'Online stores and marketplace solutions',
    count: 27,
    icon: '🛒',
    color: 'orange',
  },
  {
    id: 'fintech',
    name: 'FinTech Solutions',
    description: 'Financial technology and banking applications',
    count: 19,
    icon: '💳',
    color: 'yellow',
  },
  {
    id: 'healthcare',
    name: 'Healthcare Systems',
    description: 'Medical and healthcare management platforms',
    count: 16,
    icon: '🏥',
    color: 'red',
  },
];

async function FeaturedCaseStudies({ solutionId }: { solutionId: string }) {
  const allCaseStudies = await getCaseStudies();
  const caseStudies = allCaseStudies.filter(study => {
    const transformedStudy = study.fields || study;
    return transformedStudy.solutionType === solutionId;
  }).slice(0, 3);
  
  return (
    <div className="grid md:grid-cols-3 gap-6 mt-6">
      {caseStudies.map((study) => (
        <Card key={study.slug} className="hover:shadow-lg transition-shadow">
          <div className="aspect-video bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
            {study.thumbnail && (
              <img
                src={study.thumbnail}
                alt={study.title}
                className="w-full h-full object-cover"
              />
            )}
            {study.featured && (
              <Badge className="absolute top-2 right-2" variant="secondary">
                Featured
              </Badge>
            )}
          </div>
          <h4 className="font-semibold mb-2">{study.title}</h4>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {study.summary}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {study.technologies.slice(0, 2).map((tech) => (
                <Badge key={tech} variant="outline" size="sm">
                  {tech}
                </Badge>
              ))}
              {study.technologies.length > 2 && (
                <Badge variant="outline" size="sm">
                  +{study.technologies.length - 2}
                </Badge>
              )}
            </div>
            <Link
              href={`/case-studies/${study.slug}`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Read More →
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function CaseStudiesBySolutionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Case Studies by Solution
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Explore our portfolio of successful projects organized by solution type. 
              See how we've helped businesses across industries achieve their goals.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/case-studies">
                <Button variant="white" size="lg">
                  All Case Studies
                </Button>
              </Link>
              <Link href="/case-studies/by-industry">
                <Button variant="outline-white" size="lg">
                  By Industry
                </Button>
              </Link>
              <Link href="/case-studies/by-technology">
                <Button variant="outline-white" size="lg">
                  By Technology
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">200+</div>
              <div className="text-gray-600">Projects Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">95%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">50+</div>
              <div className="text-gray-600">Enterprise Clients</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">15+</div>
              <div className="text-gray-600">Industries Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {solutions.map((solution, index) => (
              <div key={solution.id} className={`mb-16 ${index !== 0 ? 'pt-16 border-t' : ''}`}>
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{solution.icon}</div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">
                        {solution.name}
                      </h2>
                      <p className="text-gray-600 text-lg">
                        {solution.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {solution.count}
                    </div>
                    <div className="text-sm text-gray-600">Projects</div>
                  </div>
                </div>
                
                {/* Featured Case Studies for this Solution */}
                <FeaturedCaseStudies solutionId={solution.id} />
                
                <div className="mt-8 text-center">
                  <Link
                    href={`/case-studies?solution=${solution.id}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All {solution.name} Case Studies
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Build Your Success Story?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of businesses that have transformed their operations with our solutions.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/contact">
                <Button variant="white" size="lg">
                  Start Your Project
                </Button>
              </Link>
              <Link href="/solutions">
                <Button variant="outline-white" size="lg">
                  Explore Solutions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}