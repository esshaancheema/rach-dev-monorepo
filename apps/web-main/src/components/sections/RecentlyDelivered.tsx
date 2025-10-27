'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  client: string;
  industry: string;
  description: string;
  shortDescription: string;
  image: string;
  liveUrl?: string;
  caseStudyUrl?: string;
  technologies: string[];
  deliveryTime: string;
  projectType: 'web-app' | 'mobile-app' | 'ai-integration' | 'enterprise' | 'saas' | 'custom';
  metrics: {
    label: string;
    value: string;
  }[];
  completedDate: string;
  featured?: boolean;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
}

interface RecentlyDeliveredProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'grid' | 'carousel' | 'timeline' | 'featured';
  showMetrics?: boolean;
  showTestimonials?: boolean;
  maxProjects?: number;
  filterByType?: string;
  className?: string;
}

const PROJECT_TYPES = [
  { id: 'all', label: 'All Projects', icon: '🚀' },
  { id: 'web-app', label: 'Web Applications', icon: '💻' },
  { id: 'mobile-app', label: 'Mobile Apps', icon: '📱' },
  { id: 'ai-integration', label: 'AI Integration', icon: '🤖' },
  { id: 'enterprise', label: 'Enterprise Solutions', icon: '🏢' },
  { id: 'saas', label: 'SaaS Platforms', icon: '☁️' },
  { id: 'custom', label: 'Custom Solutions', icon: '⚙️' },
];

const RECENT_PROJECTS: Project[] = [
  {
    id: 'healthtech-saas',
    title: 'AI-Powered Healthcare Management Platform',
    client: 'MedCare Solutions',
    industry: 'Healthcare',
    description: 'Comprehensive healthcare management platform with AI-powered diagnostic assistance, patient portal, appointment scheduling, and HIPAA-compliant data management. Reduced administrative overhead by 60% and improved patient satisfaction scores.',
    shortDescription: 'HIPAA-compliant healthcare platform with AI diagnostics',
    image: '/projects/healthcare-platform.jpg',
    liveUrl: 'https://medcare-demo.zoptal.com',
    caseStudyUrl: '/case-studies/medcare-healthcare-platform',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'OpenAI API', 'AWS HIPAA'],
    deliveryTime: '4 weeks',
    projectType: 'saas',
    metrics: [
      { label: 'Admin Time Saved', value: '60%' },
      { label: 'Patient Satisfaction', value: '4.8/5' },
      { label: 'Processing Speed', value: '3x faster' },
    ],
    completedDate: '2024-01-15',
    featured: true,
    testimonial: {
      quote: 'The AI diagnostic assistance has transformed our practice. We can now serve 3x more patients with the same staff.',
      author: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
    },
  },
  {
    id: 'fintech-mobile',
    title: 'Cross-Platform Banking Mobile App',
    client: 'SecureBank',
    industry: 'Financial Services',
    description: 'Modern mobile banking application with biometric authentication, real-time transactions, budget tracking, and AI-powered financial insights. Built for iOS and Android with React Native.',
    shortDescription: 'Secure mobile banking app with AI financial insights',
    image: '/projects/banking-mobile-app.jpg',
    liveUrl: 'https://securebank-demo.zoptal.com',
    technologies: ['React Native', 'Node.js', 'MongoDB', 'Plaid API', 'AWS'],
    deliveryTime: '6 weeks',
    projectType: 'mobile-app',
    metrics: [
      { label: 'User Adoption', value: '94%' },
      { label: 'Transaction Speed', value: '2s avg' },
      { label: 'Security Score', value: '99.9%' },
    ],
    completedDate: '2024-01-10',
    featured: true,
    testimonial: {
      quote: 'Our customers love the new app. Mobile transactions increased by 400% in just 2 months.',
      author: 'Mike Rodriguez',
      role: 'Digital Banking Director',
    },
  },
  {
    id: 'ecommerce-ai',
    title: 'AI-Enhanced E-commerce Platform',
    client: 'RetailPro Inc',
    industry: 'Retail',
    description: 'Next-generation e-commerce platform with AI-powered product recommendations, dynamic pricing, inventory management, and personalized shopping experiences.',
    shortDescription: 'Smart e-commerce platform with AI recommendations',
    image: '/projects/ecommerce-ai-platform.jpg',
    liveUrl: 'https://retailpro-demo.zoptal.com',
    caseStudyUrl: '/case-studies/retailpro-ai-ecommerce',
    technologies: ['Next.js', 'Python', 'PostgreSQL', 'TensorFlow', 'Stripe'],
    deliveryTime: '5 weeks',
    projectType: 'ai-integration',
    metrics: [
      { label: 'Sales Increase', value: '+180%' },
      { label: 'Conversion Rate', value: '+45%' },
      { label: 'Customer Retention', value: '+67%' },
    ],
    completedDate: '2024-01-05',
    testimonial: {
      quote: 'The AI recommendations alone increased our average order value by 45%. Incredible results!',
      author: 'Lisa Chen',
      role: 'E-commerce Manager',
    },
  },
  {
    id: 'logistics-enterprise',
    title: 'Enterprise Logistics Management System',
    client: 'GlobalShip Logistics',
    industry: 'Logistics',
    description: 'Comprehensive logistics management system with real-time tracking, route optimization, fleet management, and predictive analytics for delivery optimization.',
    shortDescription: 'Enterprise logistics platform with route optimization',
    image: '/projects/logistics-enterprise.jpg',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Google Maps API', 'Docker'],
    deliveryTime: '8 weeks',
    projectType: 'enterprise',
    metrics: [
      { label: 'Delivery Efficiency', value: '+35%' },
      { label: 'Fuel Savings', value: '22%' },
      { label: 'Customer Satisfaction', value: '4.9/5' },
    ],
    completedDate: '2023-12-20',
    testimonial: {
      quote: 'Route optimization saved us $50K monthly in fuel costs. The ROI was achieved in just 3 months.',
      author: 'David Kim',
      role: 'Operations Manager',
    },
  },
  {
    id: 'edtech-platform',
    title: 'Interactive Learning Management System',
    client: 'EduTech Solutions',
    industry: 'Education',
    description: 'Modern LMS with video streaming, interactive assignments, progress tracking, AI-powered personalized learning paths, and comprehensive analytics for educators.',
    shortDescription: 'AI-powered LMS with personalized learning',
    image: '/projects/edtech-lms.jpg',
    liveUrl: 'https://edutech-demo.zoptal.com',
    technologies: ['Next.js', 'AWS Amplify', 'DynamoDB', 'AWS Media Services'],
    deliveryTime: '6 weeks',
    projectType: 'saas',
    metrics: [
      { label: 'Student Engagement', value: '+85%' },
      { label: 'Completion Rate', value: '92%' },
      { label: 'Teacher Satisfaction', value: '4.8/5' },
    ],
    completedDate: '2023-12-15',
    testimonial: {
      quote: 'Our students are more engaged than ever. The personalized learning paths make a huge difference.',
      author: 'Prof. Emily Johnson',
      role: 'Academic Director',
    },
  },
  {
    id: 'real-estate-crm',
    title: 'Real Estate CRM & Management Platform',
    client: 'PropertyMax Realty',
    industry: 'Real Estate',
    description: 'Complete real estate management solution with property listings, CRM for agents, lead management, virtual tours, and AI-powered property valuation.',
    shortDescription: 'Complete real estate platform with AI valuations',
    image: '/projects/real-estate-crm.jpg',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Mapbox', 'AWS S3'],
    deliveryTime: '5 weeks',
    projectType: 'custom',
    metrics: [
      { label: 'Lead Conversion', value: '+120%' },
      { label: 'Agent Productivity', value: '+90%' },
      { label: 'Time to Sale', value: '-30%' },
    ],
    completedDate: '2023-12-10',
    testimonial: {
      quote: 'Our agents close deals 30% faster now. The lead management system is a game-changer.',
      author: 'James Wilson',
      role: 'Sales Director',
    },
  },
];

function ProjectCard({ project, variant = 'default', showMetrics = true, showTestimonials = true }: {
  project: Project;
  variant?: 'default' | 'featured' | 'compact' | 'timeline';
  showMetrics?: boolean;
  showTestimonials?: boolean;
}) {
  if (variant === 'compact') {
    return (
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" size="sm">{project.industry}</Badge>
              {project.featured && <Badge variant="success" size="sm">Featured</Badge>}
            </div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">{project.title}</h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.shortDescription}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Delivered in {project.deliveryTime}</span>
              <div className="flex gap-2">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">Demo</Button>
                  </a>
                )}
                {project.caseStudyUrl && (
                  <Link href={project.caseStudyUrl}>
                    <Button size="sm">Case Study</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className="relative">
        <div className="absolute left-6 top-20 bottom-0 w-0.5 bg-gray-200" />
        
        <div className="flex items-start gap-6">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 relative z-10">
            <span className="text-xs">{new Date(project.completedDate).getMonth() + 1}</span>
          </div>
          
          <Card className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">{project.industry}</Badge>
                <Badge variant="outline" size="sm">{project.deliveryTime}</Badge>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(project.completedDate).toLocaleDateString()}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
            <p className="text-gray-600 mb-4">{project.shortDescription}</p>
            
            {showMetrics && project.metrics.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {project.metrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="text-lg font-bold text-blue-600">{metric.value}</div>
                    <div className="text-xs text-gray-600">{metric.label}</div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {project.technologies.slice(0, 3).map((tech, index) => (
                  <Badge key={index} variant="outline" size="sm">{tech}</Badge>
                ))}
              </div>
              <div className="flex gap-2">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">View Demo</Button>
                  </a>
                )}
                {project.caseStudyUrl && (
                  <Link href={project.caseStudyUrl}>
                    <Button size="sm">Read Case Study</Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className="overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="aspect-video relative">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="primary">Featured</Badge>
            <Badge variant="outline">{project.industry}</Badge>
          </div>
          {project.liveUrl && (
            <div className="absolute top-4 right-4">
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="white">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Live Demo
                </Button>
              </a>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
          <p className="text-gray-600 mb-4">{project.description}</p>
          
          {showMetrics && project.metrics.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white/60 rounded-lg">
              {project.metrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </div>
              ))}
            </div>
          )}
          
          {showTestimonials && project.testimonial && (
            <div className="bg-white/60 rounded-lg p-4 mb-6">
              <blockquote className="text-gray-700 italic mb-3">
                "{project.testimonial.quote}"
              </blockquote>
              <cite className="text-sm font-medium">
                — {project.testimonial.author}, {project.testimonial.role}
              </cite>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap gap-1">
              {project.technologies.map((tech, index) => (
                <Badge key={index} variant="outline" size="sm">{tech}</Badge>
              ))}
            </div>
            <Badge variant="success">{project.deliveryTime}</Badge>
          </div>
          
          <div className="flex gap-3">
            {project.caseStudyUrl && (
              <Link href={project.caseStudyUrl} className="flex-1">
                <Button className="w-full">Read Full Case Study</Button>
              </Link>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">View Demo</Button>
              </a>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="outline">{project.industry}</Badge>
          {project.featured && <Badge variant="success" size="sm">Featured</Badge>}
        </div>
        {project.liveUrl && (
          <div className="absolute top-4 right-4">
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="white">Demo</Button>
            </a>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{project.shortDescription}</p>
        
        {showMetrics && project.metrics.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {project.metrics.map((metric, index) => (
              <div key={index} className="text-center bg-gray-50 rounded p-2">
                <div className="text-lg font-bold text-blue-600">{metric.value}</div>
                <div className="text-xs text-gray-600">{metric.label}</div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap gap-1">
            {project.technologies.slice(0, 3).map((tech, index) => (
              <Badge key={index} variant="outline" size="sm">{tech}</Badge>
            ))}
          </div>
          <Badge variant="success" size="sm">{project.deliveryTime}</Badge>
        </div>
        
        <div className="flex gap-2">
          {project.caseStudyUrl && (
            <Link href={project.caseStudyUrl} className="flex-1">
              <Button size="sm" className="w-full">Case Study</Button>
            </Link>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">Demo</Button>
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}

export function RecentlyDelivered({
  title = 'Recently Delivered Projects',
  subtitle = 'See how we\'ve helped businesses transform their operations with custom software solutions and AI integration.',
  variant = 'default',
  showMetrics = true,
  showTestimonials = true,
  maxProjects,
  filterByType,
  className,
}: RecentlyDeliveredProps) {
  const [selectedType, setSelectedType] = useState(filterByType || 'all');
  const [currentSlide, setCurrentSlide] = useState(0);

  const filteredProjects = selectedType === 'all' 
    ? RECENT_PROJECTS 
    : RECENT_PROJECTS.filter(project => project.projectType === selectedType);

  const displayProjects = maxProjects 
    ? filteredProjects.slice(0, maxProjects)
    : filteredProjects;

  const featuredProjects = RECENT_PROJECTS.filter(project => project.featured);

  // Auto-rotate carousel
  useEffect(() => {
    if (variant === 'carousel') {
      const interval = setInterval(() => {
        setCurrentSlide(current => 
          current >= displayProjects.length - 1 ? 0 : current + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [variant, displayProjects.length]);

  if (variant === 'timeline') {
    return (
      <section className={cn('py-16', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-xl text-gray-600">{subtitle}</p>
            </div>
            
            <div className="space-y-8">
              {displayProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  variant="timeline"
                  showMetrics={showMetrics}
                  showTestimonials={showTestimonials}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'carousel') {
    return (
      <section className={cn('py-16 bg-gray-50', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-xl text-gray-600">{subtitle}</p>
            </div>
            
            <div className="relative">
              <div className="overflow-hidden rounded-lg">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {displayProjects.map((project) => (
                    <div key={project.id} className="w-full flex-shrink-0">
                      <div className="max-w-4xl mx-auto">
                        <ProjectCard
                          project={project}
                          variant="featured"
                          showMetrics={showMetrics}
                          showTestimonials={showTestimonials}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center mt-8 gap-2">
                {displayProjects.map((_, index) => (
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
                  onClick={() => setCurrentSlide(Math.min(displayProjects.length - 1, currentSlide + 1))}
                  disabled={currentSlide === displayProjects.length - 1}
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
          
          {/* Project Type Filter */}
          {!filterByType && (
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {PROJECT_TYPES.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type.id)}
                  className="flex items-center gap-2"
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </Button>
              ))}
            </div>
          )}
          
          {/* Featured Projects */}
          {selectedType === 'all' && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-center mb-8">Featured Success Stories</h3>
              <div className="grid lg:grid-cols-2 gap-8">
                {featuredProjects.slice(0, 2).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    variant="featured"
                    showMetrics={showMetrics}
                    showTestimonials={showTestimonials}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* All Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProjects
              .filter(project => selectedType === 'all' ? !project.featured : true)
              .map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  showMetrics={showMetrics}
                  showTestimonials={false}
                />
              ))}
          </div>
          
          {/* Bottom CTA */}
          <div className="text-center mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Join Our Success Stories?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Let's discuss your project and create a custom solution that delivers measurable results for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Start Your Project
              </Button>
              <Link href="/case-studies">
                <Button size="lg" variant="outline">
                  View All Case Studies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}