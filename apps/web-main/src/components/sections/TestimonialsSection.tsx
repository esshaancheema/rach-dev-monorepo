'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  quote: string;
  rating: number;
  category: string;
  featured?: boolean;
  metrics?: {
    label: string;
    value: string;
  }[];
  projectDetails?: {
    type: string;
    duration: string;
    teamSize: string;
  };
}

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  variant?: 'default' | 'grid' | 'carousel' | 'featured';
  showCategories?: boolean;
  showMetrics?: boolean;
  className?: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'CTO',
    company: 'TechStart Inc',
    avatar: '/testimonials/sarah-chen.jpg',
    quote: 'Zoptal transformed our development process completely. What used to take our team months now takes weeks. The AI-powered features are incredible, and the quality of generated code is production-ready.',
    rating: 5,
    category: 'Startup',
    featured: true,
    metrics: [
      { label: 'Development Speed', value: '10x faster' },
      { label: 'Code Quality', value: '95% clean' },
      { label: 'Time Saved', value: '80% reduction' },
    ],
    projectDetails: {
      type: 'SaaS Platform',
      duration: '3 weeks',
      teamSize: '4 developers',
    },
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'Lead Developer',
    company: 'Enterprise Corp',
    avatar: '/testimonials/michael-rodriguez.jpg',
    quote: 'The enterprise features and security compliance made Zoptal the perfect choice for our large-scale projects. The support team is exceptional, and the platform scales beautifully.',
    rating: 5,
    category: 'Enterprise',
    metrics: [
      { label: 'Projects Delivered', value: '50+' },
      { label: 'Team Productivity', value: '300% increase' },
      { label: 'Bug Reduction', value: '70% fewer' },
    ],
    projectDetails: {
      type: 'Enterprise Application',
      duration: '2 months',
      teamSize: '12 developers',
    },
  },
  {
    id: '3',
    name: 'Emily Johnson',
    role: 'Product Manager',
    company: 'InnovateLab',
    avatar: '/testimonials/emily-johnson.jpg',
    quote: 'Our product development cycle is now incredibly fast. We can validate ideas and build MVPs in days instead of months. Zoptal\'s AI agents handle repetitive tasks perfectly.',
    rating: 5,
    category: 'Product',
    metrics: [
      { label: 'MVP Speed', value: '5x faster' },
      { label: 'Feature Velocity', value: '400% increase' },
      { label: 'User Satisfaction', value: '98% positive' },
    ],
    projectDetails: {
      type: 'Mobile Application',
      duration: '1 month',
      teamSize: '6 developers',
    },
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Founder',
    company: 'AI Startup',
    avatar: '/testimonials/david-kim.jpg',
    quote: 'As a solo founder, Zoptal gave me the power of an entire development team. I built and launched my SaaS product in record time without compromising on quality.',
    rating: 5,
    category: 'Solo',
    featured: true,
    metrics: [
      { label: 'Launch Time', value: '3 weeks' },
      { label: 'Development Cost', value: '90% savings' },
      { label: 'Feature Coverage', value: '100% complete' },
    ],
    projectDetails: {
      type: 'AI-Powered SaaS',
      duration: '3 weeks',
      teamSize: '1 founder',
    },
  },
  {
    id: '5',
    name: 'Lisa Wang',
    role: 'Engineering Manager',
    company: 'Scale Corp',
    avatar: '/testimonials/lisa-wang.jpg',
    quote: 'Managing multiple development projects became effortless with Zoptal. The automated testing and deployment features saved us countless hours and reduced our error rate significantly.',
    rating: 5,
    category: 'Management',
    metrics: [
      { label: 'Error Reduction', value: '85% fewer' },
      { label: 'Deploy Frequency', value: '10x more' },
      { label: 'Team Satisfaction', value: '95% rating' },
    ],
    projectDetails: {
      type: 'Multi-Platform System',
      duration: '6 weeks',
      teamSize: '15 developers',
    },
  },
  {
    id: '6',
    name: 'James Thompson',
    role: 'Technical Director',
    company: 'FinTech Solutions',
    avatar: '/testimonials/james-thompson.jpg',
    quote: 'Security and compliance are critical in fintech. Zoptal\'s enterprise-grade security features and audit trails gave us the confidence to deploy our trading platform.',
    rating: 5,
    category: 'FinTech',
    metrics: [
      { label: 'Security Score', value: '100% compliant' },
      { label: 'Audit Success', value: '0 issues' },
      { label: 'Performance', value: '99.9% uptime' },
    ],
    projectDetails: {
      type: 'Trading Platform',
      duration: '4 months',
      teamSize: '20 developers',
    },
  },
];

const CATEGORIES = ['All', 'Startup', 'Enterprise', 'Product', 'Solo', 'Management', 'FinTech'];

function TestimonialCard({ 
  testimonial, 
  variant = 'default',
  showMetrics = false 
}: { 
  testimonial: Testimonial;
  variant?: 'default' | 'featured' | 'compact';
  showMetrics?: boolean;
}) {
  if (variant === 'compact') {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {testimonial.avatar ? (
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-700">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(testimonial.rating)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-gray-700 mb-3 line-clamp-3">
              "{testimonial.quote}"
            </blockquote>
            <div>
              <cite className="font-semibold text-gray-900">
                {testimonial.name}
              </cite>
              <p className="text-sm text-gray-600">
                {testimonial.role}, {testimonial.company}
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className="p-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="primary">Featured</Badge>
          <Badge variant="outline">{testimonial.category}</Badge>
        </div>
        
        <div className="flex items-center gap-1 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        
        <blockquote className="text-lg text-gray-800 mb-6">
          "{testimonial.quote}"
        </blockquote>
        
        {showMetrics && testimonial.metrics && (
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white/60 rounded-lg">
            {testimonial.metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-600">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {testimonial.avatar ? (
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-semibold text-gray-700">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
          </div>
          <div>
            <cite className="text-lg font-semibold text-gray-900">
              {testimonial.name}
            </cite>
            <p className="text-gray-600">
              {testimonial.role}, {testimonial.company}
            </p>
            {testimonial.projectDetails && (
              <p className="text-sm text-gray-500 mt-1">
                {testimonial.projectDetails.type} • {testimonial.projectDetails.duration} • {testimonial.projectDetails.teamSize}
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 h-full">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <Badge variant="outline" size="sm" className="ml-2">
          {testimonial.category}
        </Badge>
      </div>
      
      <blockquote className="text-gray-700 mb-6 flex-1">
        "{testimonial.quote}"
      </blockquote>
      
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {testimonial.avatar ? (
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-700">
                {testimonial.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
        </div>
        <div>
          <cite className="font-semibold text-gray-900">
            {testimonial.name}
          </cite>
          <p className="text-sm text-gray-600">
            {testimonial.role}, {testimonial.company}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function TestimonialsSection({
  title = 'What Our Customers Say',
  subtitle = 'Join thousands of developers and companies who trust Zoptal to build their applications',
  testimonials = DEFAULT_TESTIMONIALS,
  variant = 'default',
  showCategories = true,
  showMetrics = true,
  className,
}: TestimonialsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);

  const filteredTestimonials = selectedCategory === 'All' 
    ? testimonials 
    : testimonials.filter(t => t.category === selectedCategory);

  const featuredTestimonials = testimonials.filter(t => t.featured);

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
              {featuredTestimonials.slice(0, 2).map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  variant="featured"
                  showMetrics={showMetrics}
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
      <section className={cn('py-16', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-xl text-gray-600">{subtitle}</p>
            </div>
            
            <div className="relative">
              <TestimonialCard
                testimonial={filteredTestimonials[currentSlide]}
                variant="featured"
                showMetrics={showMetrics}
              />
              
              <div className="flex justify-center mt-8 gap-2">
                {filteredTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                    )}
                  />
                ))}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide(Math.min(filteredTestimonials.length - 1, currentSlide + 1))}
                  disabled={currentSlide === filteredTestimonials.length - 1}
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
          
          {showCategories && (
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
          
          <div className={cn(
            'grid gap-6',
            variant === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'
          )}>
            {filteredTestimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                variant={testimonial.featured ? 'featured' : 'default'}
                showMetrics={showMetrics}
              />
            ))}
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 pt-12 border-t text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">4.9/5</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">500K+</div>
                <div className="text-gray-600">Apps Built</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}