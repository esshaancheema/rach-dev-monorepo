'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Solution {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: 'saas' | 'ecommerce' | 'mobile' | 'ai' | 'enterprise' | 'custom';
  image: string;
  demoUrl?: string;
  features: string[];
  techStack: string[];
  pricing: {
    from: number;
    customization: boolean;
  };
  deliveryTime: string;
  popular?: boolean;
  new?: boolean;
  tags: string[];
}

interface ReadyBuiltSolutionsProps {
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  maxSolutions?: number;
  variant?: 'default' | 'grid' | 'carousel' | 'featured';
  className?: string;
}

const SOLUTION_CATEGORIES = [
  { id: 'all', label: 'All Solutions', icon: '🚀' },
  { id: 'saas', label: 'SaaS Platforms', icon: '☁️' },
  { id: 'ecommerce', label: 'E-commerce', icon: '🛒' },
  { id: 'mobile', label: 'Mobile Apps', icon: '📱' },
  { id: 'ai', label: 'AI-Powered', icon: '🤖' },
  { id: 'enterprise', label: 'Enterprise', icon: '🏢' },
  { id: 'custom', label: 'Custom Solutions', icon: '⚙️' },
];

const READY_BUILT_SOLUTIONS: Solution[] = [
  {
    id: 'project-management-saas',
    title: 'AI-Powered Project Management Platform',
    description: 'Complete project management solution with AI task automation, team collaboration, and advanced analytics. Built with Next.js, includes real-time updates, Gantt charts, and intelligent resource allocation.',
    shortDescription: 'AI-enhanced project management with automation and analytics',
    category: 'saas',
    image: '/solutions/project-management.jpg',
    demoUrl: 'https://demo.zoptal.com/project-management',
    features: [
      'AI task prioritization and scheduling',
      'Real-time team collaboration',
      'Advanced project analytics',
      'Gantt charts and timeline views',
      'Resource management',
      'Time tracking and reporting',
      'Integration with 50+ tools',
      'Mobile responsive design',
    ],
    techStack: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'Socket.io', 'OpenAI API'],
    pricing: {
      from: 2999,
      customization: true,
    },
    deliveryTime: '1-2 weeks',
    popular: true,
    tags: ['AI', 'Collaboration', 'Analytics', 'Real-time'],
  },
  {
    id: 'ecommerce-marketplace',
    title: 'Multi-Vendor E-commerce Marketplace',
    description: 'Full-featured e-commerce marketplace with vendor management, payment processing, inventory tracking, and AI-powered recommendations. Includes admin dashboard, vendor portals, and customer mobile app.',
    shortDescription: 'Complete marketplace solution with AI recommendations',
    category: 'ecommerce',
    image: '/solutions/ecommerce-marketplace.jpg',
    demoUrl: 'https://demo.zoptal.com/marketplace',
    features: [
      'Multi-vendor management',
      'AI product recommendations',
      'Payment gateway integration',
      'Inventory management',
      'Order tracking system',
      'Review and rating system',
      'Mobile app included',
      'SEO optimized',
    ],
    techStack: ['Next.js', 'Stripe', 'PostgreSQL', 'Redis', 'React Native', 'AWS S3'],
    pricing: {
      from: 4999,
      customization: true,
    },
    deliveryTime: '2-3 weeks',
    popular: true,
    tags: ['Multi-vendor', 'Payments', 'Mobile', 'AI'],
  },
  {
    id: 'crm-system',
    title: 'AI-Enhanced CRM System',
    description: 'Comprehensive CRM with AI lead scoring, automated workflows, email marketing, and advanced reporting. Perfect for sales teams looking to increase conversion rates and streamline processes.',
    shortDescription: 'Smart CRM with AI lead scoring and automation',
    category: 'enterprise',
    image: '/solutions/crm-system.jpg',
    features: [
      'AI lead scoring and insights',
      'Automated email sequences',
      'Pipeline management',
      'Contact management',
      'Sales forecasting',
      'Integration with marketing tools',
      'Custom reporting dashboard',
      'Team collaboration features',
    ],
    techStack: ['React', 'Node.js', 'MongoDB', 'ElasticSearch', 'Bull Queue', 'SendGrid'],
    pricing: {
      from: 3499,
      customization: true,
    },
    deliveryTime: '1-3 weeks',
    tags: ['CRM', 'AI', 'Sales', 'Automation'],
  },
  {
    id: 'learning-management-system',
    title: 'Interactive Learning Management System',
    description: 'Modern LMS with video streaming, interactive assignments, progress tracking, and AI-powered personalized learning paths. Includes student and instructor portals with advanced analytics.',
    shortDescription: 'AI-powered LMS with personalized learning paths',
    category: 'saas',
    image: '/solutions/lms-platform.jpg',
    demoUrl: 'https://demo.zoptal.com/lms',
    features: [
      'AI-powered learning paths',
      'Video streaming platform',
      'Interactive assignments',
      'Progress tracking',
      'Certificate generation',
      'Discussion forums',
      'Live virtual classrooms',
      'Mobile learning app',
    ],
    techStack: ['Next.js', 'AWS Amplify', 'DynamoDB', 'AWS Media Services', 'React Native'],
    pricing: {
      from: 3999,
      customization: true,
    },
    deliveryTime: '2-4 weeks',
    new: true,
    tags: ['Education', 'Video', 'AI', 'Mobile'],
  },
  {
    id: 'healthcare-management',
    title: 'Healthcare Practice Management',
    description: 'HIPAA-compliant healthcare management system with patient records, appointment scheduling, billing, telemedicine integration, and AI-powered diagnostic assistance.',
    shortDescription: 'HIPAA-compliant practice management with telemedicine',
    category: 'enterprise',
    image: '/solutions/healthcare-system.jpg',
    features: [
      'HIPAA compliance built-in',
      'Electronic health records',
      'Appointment scheduling',
      'Billing and insurance',
      'Telemedicine integration',
      'AI diagnostic assistance',
      'Patient portal',
      'Prescription management',
    ],
    techStack: ['React', 'Node.js', 'PostgreSQL', 'AWS HIPAA', 'Stripe', 'Twilio Video'],
    pricing: {
      from: 5999,
      customization: true,
    },
    deliveryTime: '3-5 weeks',
    tags: ['Healthcare', 'HIPAA', 'Telemedicine', 'AI'],
  },
  {
    id: 'food-delivery-app',
    title: 'Food Delivery Mobile App',
    description: 'Complete food delivery ecosystem with customer app, restaurant dashboard, and delivery driver app. Includes real-time tracking, payment processing, and AI-powered recommendation engine.',
    shortDescription: 'Complete food delivery ecosystem with 3 apps',
    category: 'mobile',
    image: '/solutions/food-delivery.jpg',
    demoUrl: 'https://demo.zoptal.com/food-delivery',
    features: [
      'Customer mobile app',
      'Restaurant dashboard',
      'Driver tracking app',
      'Real-time GPS tracking',
      'In-app payments',
      'AI meal recommendations',
      'Order management system',
      'Review and rating system',
    ],
    techStack: ['React Native', 'Node.js', 'MongoDB', 'Socket.io', 'Stripe', 'Google Maps API'],
    pricing: {
      from: 4499,
      customization: true,
    },
    deliveryTime: '2-4 weeks',
    popular: true,
    tags: ['Mobile', 'GPS', 'Payments', 'Real-time'],
  },
  {
    id: 'ai-chatbot-platform',
    title: 'AI Customer Support Chatbot',
    description: 'Advanced AI chatbot platform with natural language processing, multi-language support, and seamless human handoff. Includes analytics dashboard and integration with major CRM systems.',
    shortDescription: 'Advanced AI chatbot with multi-language support',
    category: 'ai',
    image: '/solutions/ai-chatbot.jpg',
    demoUrl: 'https://demo.zoptal.com/chatbot',
    features: [
      'GPT-4 powered conversations',
      'Multi-language support',
      'Human handoff system',
      'CRM integrations',
      'Analytics dashboard',
      'Custom knowledge base',
      'Voice message support',
      'Widget customization',
    ],
    techStack: ['React', 'Node.js', 'OpenAI API', 'MongoDB', 'Socket.io', 'Dialogflow'],
    pricing: {
      from: 2499,
      customization: true,
    },
    deliveryTime: '1-2 weeks',
    new: true,
    tags: ['AI', 'ChatGPT', 'Multi-language', 'Support'],
  },
  {
    id: 'real-estate-platform',
    title: 'Real Estate Management Platform',
    description: 'Comprehensive real estate platform with property listings, virtual tours, CRM for agents, lead management, and AI-powered property valuation. Includes mobile app and admin dashboard.',
    shortDescription: 'Complete real estate platform with AI valuations',
    category: 'custom',
    image: '/solutions/real-estate.jpg',
    features: [
      'Property listing management',
      'Virtual tour integration',
      'Agent CRM system',
      'Lead management',
      'AI property valuation',
      'Mortgage calculator',
      'Mobile app for buyers',
      'Advanced search filters',
    ],
    techStack: ['Next.js', 'PostgreSQL', 'AWS S3', 'Mapbox', 'React Native', 'ML Models'],
    pricing: {
      from: 5499,
      customization: true,
    },
    deliveryTime: '3-6 weeks',
    tags: ['Real Estate', 'CRM', 'Mobile', 'AI'],
  },
];

function SolutionCard({ solution, variant = 'default' }: { solution: Solution; variant?: 'default' | 'featured' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">{SOLUTION_CATEGORIES.find(cat => cat.id === solution.category)?.icon}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg leading-tight">{solution.title}</h3>
              {solution.popular && <Badge variant="primary" size="sm">Popular</Badge>}
              {solution.new && <Badge variant="success" size="sm">New</Badge>}
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{solution.shortDescription}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">From ${solution.pricing.from.toLocaleString()}</span>
              <Link href={`/solutions/ready-built/${solution.id}`}>
                <Button size="sm" variant="outline">View Details</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className="p-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-xl transition-all">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="primary">Featured</Badge>
          {solution.popular && <Badge variant="success">Popular</Badge>}
          {solution.new && <Badge variant="outline">New</Badge>}
        </div>
        
        <div className="aspect-video bg-gray-100 rounded-lg mb-6 relative overflow-hidden">
          <Image
            src={solution.image}
            alt={solution.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {solution.demoUrl && (
            <div className="absolute top-4 right-4">
              <a href={solution.demoUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="white">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  </svg>
                  Live Demo
                </Button>
              </a>
            </div>
          )}
        </div>
        
        <h3 className="text-2xl font-bold mb-3">{solution.title}</h3>
        <p className="text-gray-600 mb-6">{solution.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Key Features</h4>
            <ul className="space-y-1">
              {solution.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Tech Stack</h4>
            <div className="flex flex-wrap gap-1">
              {solution.techStack.slice(0, 6).map((tech, index) => (
                <Badge key={index} variant="outline" size="sm">{tech}</Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-600">
              ${solution.pricing.from.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Ready in {solution.deliveryTime}
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/solutions/ready-built/${solution.id}`}>
              <Button variant="outline">Learn More</Button>
            </Link>
            <Link href="/contact">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gray-100 relative">
        <Image
          src={solution.image}
          alt={solution.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {solution.popular && <Badge variant="primary" size="sm">Popular</Badge>}
          {solution.new && <Badge variant="success" size="sm">New</Badge>}
        </div>
        {solution.demoUrl && (
          <div className="absolute top-4 right-4">
            <a href={solution.demoUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="white">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Demo
              </Button>
            </a>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{solution.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{solution.shortDescription}</p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {solution.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" size="sm">{tag}</Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-green-600">
              From ${solution.pricing.from.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              {solution.deliveryTime} delivery
            </div>
          </div>
          <Link href={`/solutions/ready-built/${solution.id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export function ReadyBuiltSolutions({
  title = 'Ready-Built Solutions',
  subtitle = 'Skip the development time with our pre-built, customizable solutions. Deploy in days, not months.',
  showFilters = true,
  maxSolutions,
  variant = 'default',
  className,
}: ReadyBuiltSolutionsProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);

  const filteredSolutions = selectedCategory === 'all' 
    ? READY_BUILT_SOLUTIONS 
    : READY_BUILT_SOLUTIONS.filter(solution => solution.category === selectedCategory);

  const displaySolutions = maxSolutions 
    ? filteredSolutions.slice(0, maxSolutions)
    : filteredSolutions;

  const featuredSolutions = READY_BUILT_SOLUTIONS.filter(solution => solution.popular || solution.new);

  if (variant === 'featured') {
    return (
      <section className={cn('py-16', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredSolutions.slice(0, 2).map((solution) => (
                <SolutionCard
                  key={solution.id}
                  solution={solution}
                  variant="featured"
                />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/solutions/ready-built">
                <Button size="lg">
                  View All Solutions
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'carousel') {
    return (
      <section className={cn('py-16', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-xl text-gray-600">{subtitle}</p>
            </div>
            
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {displaySolutions.map((solution) => (
                    <div key={solution.id} className="w-full flex-shrink-0">
                      <div className="max-w-4xl mx-auto">
                        <SolutionCard solution={solution} variant="featured" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center mt-8 gap-2">
                {displaySolutions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      'w-3 h-3 rounded-full transition-colors',
                      index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                    )}
                  />
                ))}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentSlide(Math.min(displaySolutions.length - 1, currentSlide + 1))}
                  disabled={currentSlide === displaySolutions.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('py-16', className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
          </div>
          
          {showFilters && (
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {SOLUTION_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </Button>
              ))}
            </div>
          )}
          
          <div className={cn(
            'grid gap-6',
            variant === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'
          )}>
            {displaySolutions.map((solution) => (
              <SolutionCard
                key={solution.id}
                solution={solution}
                variant={variant === 'grid' ? 'compact' : 'default'}
              />
            ))}
          </div>
          
          {!maxSolutions && (
            <div className="text-center mt-12">
              <div className="bg-blue-50 rounded-lg p-8">
                <h3 className="text-xl font-bold mb-2">Need Something Custom?</h3>
                <p className="text-gray-600 mb-4">
                  Don't see what you're looking for? We can build a custom solution tailored to your specific needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/contact">
                    <Button>Request Custom Solution</Button>
                  </Link>
                  <Link href="/solutions">
                    <Button variant="outline">View All Services</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}