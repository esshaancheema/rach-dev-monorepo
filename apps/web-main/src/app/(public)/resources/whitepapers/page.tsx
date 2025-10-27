import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const metadata: Metadata = {
  title: 'Whitepapers | AI & Tech Research | Zoptal',
  description: 'Download free whitepapers, research reports, and industry guides. Deep insights on AI, software development, digital transformation, and emerging technologies.',
  keywords: [
    'technology whitepapers',
    'AI research papers',
    'software development guides',
    'digital transformation reports',
    'industry insights',
    'technical whitepapers',
    'business strategy guides',
    'free whitepapers',
  ],
};

const whitepapers = [
  {
    id: 'ai-accelerated-development-2024',
    title: 'The Future of AI-Accelerated Software Development',
    subtitle: 'How AI is Revolutionizing the Development Lifecycle in 2024',
    description: 'Comprehensive analysis of AI\'s impact on software development, featuring case studies, ROI metrics, and implementation strategies for enterprises.',
    category: 'AI & Machine Learning',
    pages: 48,
    readTime: '25 min',
    downloads: 12500,
    publishedDate: '2024-03-15',
    featured: true,
    coverImage: '/images/whitepapers/ai-development.jpg',
    topics: ['AI Integration', 'Development Automation', 'ROI Analysis', 'Case Studies'],
  },
  {
    id: 'microservices-architecture-guide',
    title: 'Enterprise Microservices Architecture Guide',
    subtitle: 'Building Scalable Systems with Modern Architecture Patterns',
    description: 'Deep dive into microservices design patterns, implementation strategies, and real-world examples from Fortune 500 companies.',
    category: 'Architecture',
    pages: 62,
    readTime: '30 min',
    downloads: 8900,
    publishedDate: '2024-02-28',
    featured: true,
    coverImage: '/images/whitepapers/microservices.jpg',
    topics: ['Microservices', 'System Design', 'Scalability', 'Best Practices'],
  },
  {
    id: 'digital-transformation-playbook',
    title: 'Digital Transformation Playbook 2024',
    subtitle: 'A Strategic Guide for Business Leaders',
    description: 'Step-by-step framework for implementing digital transformation initiatives, with focus on change management and technology adoption.',
    category: 'Digital Transformation',
    pages: 55,
    readTime: '28 min',
    downloads: 15200,
    publishedDate: '2024-01-20',
    featured: false,
    coverImage: '/images/whitepapers/digital-transformation.jpg',
    topics: ['Strategy', 'Change Management', 'Technology Adoption', 'ROI'],
  },
  {
    id: 'cloud-native-development',
    title: 'Cloud-Native Development: Best Practices',
    subtitle: 'Building Applications for AWS, Azure, and Google Cloud',
    description: 'Comprehensive guide to cloud-native development, including containerization, serverless architectures, and multi-cloud strategies.',
    category: 'Cloud Computing',
    pages: 45,
    readTime: '22 min',
    downloads: 7600,
    publishedDate: '2024-02-10',
    featured: false,
    coverImage: '/images/whitepapers/cloud-native.jpg',
    topics: ['Cloud Architecture', 'Containers', 'Serverless', 'DevOps'],
  },
  {
    id: 'cybersecurity-enterprise',
    title: 'Enterprise Cybersecurity in the AI Era',
    subtitle: 'Protecting Your Digital Assets in 2024',
    description: 'Advanced cybersecurity strategies for modern enterprises, covering AI-powered threats and defense mechanisms.',
    category: 'Security',
    pages: 38,
    readTime: '20 min',
    downloads: 9800,
    publishedDate: '2024-03-01',
    featured: false,
    coverImage: '/images/whitepapers/cybersecurity.jpg',
    topics: ['Security', 'AI Threats', 'Data Protection', 'Compliance'],
  },
  {
    id: 'mobile-app-trends-2024',
    title: 'Mobile App Development Trends 2024',
    subtitle: 'What\'s Next in Mobile Technology',
    description: 'Analysis of emerging mobile technologies, development frameworks, and user experience trends shaping the mobile landscape.',
    category: 'Mobile Development',
    pages: 42,
    readTime: '21 min',
    downloads: 6300,
    publishedDate: '2024-01-15',
    featured: false,
    coverImage: '/images/whitepapers/mobile-trends.jpg',
    topics: ['Mobile Tech', 'UX Trends', 'Frameworks', 'Market Analysis'],
  },
];

const categories = [
  'All Topics',
  'AI & Machine Learning',
  'Architecture',
  'Digital Transformation',
  'Cloud Computing',
  'Security',
  'Mobile Development',
];

interface WhitepaperFormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  consent: boolean;
}

function WhitepaperCard({ whitepaper }: { whitepaper: typeof whitepapers[0] }) {
  return (
    <Card className="hover:shadow-xl transition-shadow duration-300">
      <div className="aspect-[3/4] relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg overflow-hidden">
        {whitepaper.coverImage && (
          <Image
            src={whitepaper.coverImage}
            alt={whitepaper.title}
            fill
            className="object-cover"
          />
        )}
        {whitepaper.featured && (
          <Badge className="absolute top-4 right-4 bg-orange-500 text-white">
            Featured
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <Badge variant="secondary" className="mb-2 bg-white/20 text-white backdrop-blur">
            {whitepaper.category}
          </Badge>
          <h3 className="text-xl font-bold mb-1">{whitepaper.title}</h3>
          <p className="text-sm text-white/90">{whitepaper.subtitle}</p>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-gray-600 mb-4 line-clamp-3">
          {whitepaper.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {whitepaper.topics.slice(0, 3).map((topic) => (
            <Badge key={topic} variant="outline" size="sm">
              {topic}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{whitepaper.pages} pages</span>
          <span>•</span>
          <span>{whitepaper.readTime} read</span>
          <span>•</span>
          <span>{whitepaper.downloads.toLocaleString()} downloads</span>
        </div>
        
        <Link href={`/resources/whitepapers/${whitepaper.id}`}>
          <Button variant="primary" className="w-full">
            Download Free Whitepaper
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function WhitepapersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white">
              Free Resources
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Whitepapers & Research Reports
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Gain deep insights into AI, software development, and digital transformation. 
              Download our comprehensive guides written by industry experts.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No Registration Required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Expert Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Actionable Strategies</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900">50K+</div>
                <div className="text-gray-600">Total Downloads</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">25+</div>
                <div className="text-gray-600">Research Papers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">15</div>
                <div className="text-gray-600">Industry Experts</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">4.8/5</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Filter Section */}
      <section className="py-8 bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-3 items-center justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === 'All Topics' ? 'primary' : 'outline'}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Whitepapers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Featured Whitepapers</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {whitepapers.filter(wp => wp.featured).map((whitepaper) => (
                <WhitepaperCard key={whitepaper.id} whitepaper={whitepaper} />
              ))}
            </div>
            
            <h2 className="text-3xl font-bold mb-12">All Resources</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whitepapers.filter(wp => !wp.featured).map((whitepaper) => (
                <WhitepaperCard key={whitepaper.id} whitepaper={whitepaper} />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Get New Research Delivered to Your Inbox
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Be the first to access our latest whitepapers and research reports. 
              Join 10,000+ technology leaders.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 bg-white text-gray-900"
              />
              <Button variant="white" type="submit">
                Subscribe
              </Button>
            </form>
            <p className="text-sm text-blue-100 mt-4">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
      
      {/* Related Resources */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">More Resources</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6">
                <svg className="w-12 h-12 text-blue-600 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-xl font-semibold mb-3">Case Studies</h3>
                <p className="text-gray-600 mb-4">
                  Real-world success stories from our clients
                </p>
                <Link href="/case-studies">
                  <Button variant="outline" className="w-full">
                    View Case Studies
                  </Button>
                </Link>
              </Card>
              
              <Card className="p-6">
                <svg className="w-12 h-12 text-blue-600 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="text-xl font-semibold mb-3">Blog Articles</h3>
                <p className="text-gray-600 mb-4">
                  Latest insights and technical tutorials
                </p>
                <Link href="/resources/blog">
                  <Button variant="outline" className="w-full">
                    Read Blog
                  </Button>
                </Link>
              </Card>
              
              <Card className="p-6">
                <svg className="w-12 h-12 text-blue-600 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-semibold mb-3">API Documentation</h3>
                <p className="text-gray-600 mb-4">
                  Complete developer documentation
                </p>
                <Link href="/resources/api-reference">
                  <Button variant="outline" className="w-full">
                    View API Docs
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}