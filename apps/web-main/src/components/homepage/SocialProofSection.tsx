'use client';

import { useState, useEffect } from 'react';
import { 
  StarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  TrophyIcon,
  CheckBadgeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  StarIcon as QuoteIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { cn } from '@/lib/utils';

interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  companyLogo: string;
  avatar: string;
  content: string;
  rating: number;
  projectType: string;
  results: {
    metric: string;
    value: string;
  }[];
  featured?: boolean;
}

interface SocialProofSectionProps {
  className?: string;
  variant?: 'carousel' | 'grid' | 'featured';
  showLogos?: boolean;
  showStats?: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'CTO',
    company: 'TechFlow Solutions',
    companyLogo: '/images/clients/techflow.svg',
    avatar: '/images/avatars/sarah-chen.jpg',
    content: 'Zoptal transformed our development process with their AI-powered solutions. We saw a 300% increase in development speed while maintaining exceptional quality. Their team is truly exceptional.',
    rating: 5,
    projectType: 'AI Development',
    results: [
      { metric: 'Development Speed', value: '+300%' },
      { metric: 'Bug Reduction', value: '-85%' },
      { metric: 'Time to Market', value: '-60%' }
    ],
    featured: true
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    title: 'CEO',
    company: 'FinanceCore',
    companyLogo: '/images/clients/financecore.svg',
    avatar: '/images/avatars/marcus-johnson.jpg',
    content: 'The AI agents Zoptal built for us automated 80% of our manual processes. ROI was achieved in just 3 months. Outstanding work and support throughout the project.',
    rating: 5,
    projectType: 'AI Agents',
    results: [
      { metric: 'Process Automation', value: '80%' },
      { metric: 'ROI Timeline', value: '3 months' },
      { metric: 'Cost Savings', value: '$2M annually' }
    ]
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    title: 'Head of Digital',
    company: 'RetailMax',
    companyLogo: '/images/clients/retailmax.svg',
    avatar: '/images/avatars/elena-rodriguez.jpg',
    content: 'Our e-commerce platform built by Zoptal handles millions of transactions seamlessly. The performance and scalability exceeded all our expectations.',
    rating: 5,
    projectType: 'Web Development',
    results: [
      { metric: 'Transaction Volume', value: '10M+/month' },
      { metric: 'Uptime', value: '99.99%' },
      { metric: 'Load Time', value: '< 2s' }
    ]
  },
  {
    id: '4',
    name: 'David Kim',
    title: 'VP Engineering',
    company: 'HealthTech Pro',
    companyLogo: '/images/clients/healthtech.svg',
    avatar: '/images/avatars/david-kim.jpg',
    content: 'Zoptal delivered a HIPAA-compliant healthcare platform that revolutionized patient care. Their attention to security and compliance was exceptional.',
    rating: 5,
    projectType: 'Healthcare Solutions',
    results: [
      { metric: 'Patient Satisfaction', value: '+45%' },
      { metric: 'Compliance Score', value: '100%' },
      { metric: 'Processing Time', value: '-70%' }
    ]
  },
  {
    id: '5',
    name: 'Jennifer Walsh',
    title: 'COO',
    company: 'StartupLaunch',
    companyLogo: '/images/clients/startuplaunch.svg',
    avatar: '/images/avatars/jennifer-walsh.jpg',
    content: 'As a startup, we needed a reliable partner who could scale with us. Zoptal delivered beyond expectations and became an extension of our team.',
    rating: 5,
    projectType: 'Startup Solutions',
    results: [
      { metric: 'User Growth', value: '+500%' },
      { metric: 'Deployment Speed', value: '10x faster' },
      { metric: 'Server Costs', value: '-40%' }
    ]
  },
  {
    id: '6',
    name: 'Ahmed Hassan',
    title: 'CTO',
    company: 'Global Logistics',
    companyLogo: '/images/clients/globallogistics.svg',
    avatar: '/images/avatars/ahmed-hassan.jpg',
    content: 'The supply chain optimization AI built by Zoptal saved us millions in operational costs. Incredible technical expertise and business understanding.',
    rating: 5,
    projectType: 'Enterprise AI',
    results: [
      { metric: 'Cost Reduction', value: '$5M annually' },
      { metric: 'Efficiency Gain', value: '+65%' },
      { metric: 'Delivery Time', value: '-30%' }
    ]
  }
];

const clientLogos = [
  { name: 'TechFlow Solutions', logo: '/images/clients/techflow.svg' },
  { name: 'FinanceCore', logo: '/images/clients/financecore.svg' },
  { name: 'RetailMax', logo: '/images/clients/retailmax.svg' },
  { name: 'HealthTech Pro', logo: '/images/clients/healthtech.svg' },
  { name: 'StartupLaunch', logo: '/images/clients/startuplaunch.svg' },
  { name: 'Global Logistics', logo: '/images/clients/globallogistics.svg' },
  { name: 'EduTech Corp', logo: '/images/clients/edutech.svg' },
  { name: 'GreenEnergy', logo: '/images/clients/greenenergy.svg' },
];

const stats = [
  {
    value: '500+',
    label: 'Projects Delivered',
    icon: TrophyIcon,
  },
  {
    value: '50+',
    label: 'Enterprise Clients',
    icon: BuildingOfficeIcon,
  },
  {
    value: '98%',
    label: 'Client Satisfaction',
    icon: CheckBadgeIcon,
  },
  {
    value: '10,000+',
    label: 'Users Impacted',
    icon: UserGroupIcon,
  },
];

export default function SocialProofSection({ 
  className, 
  variant = 'carousel',
  showLogos = true,
  showStats = true 
}: SocialProofSectionProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarSolidIcon
        key={i}
        className={cn(
          'h-5 w-5',
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        )}
      />
    ));
  };

  const renderTestimonialCard = (testimonial: Testimonial, index: number, isActive = false) => (
    <div
      key={testimonial.id}
      className={cn(
        'bg-white rounded-2xl shadow-lg p-8 transition-all duration-300',
        isActive && 'ring-2 ring-blue-500 shadow-2xl scale-105',
        'hover:shadow-xl'
      )}
    >
      {/* Quote Icon */}
      <div className="mb-6">
        <QuoteIcon className="h-8 w-8 text-blue-600" />
      </div>

      {/* Content */}
      <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed">
        "{testimonial.content}"
      </blockquote>

      {/* Rating */}
      <div className="flex items-center mb-4">
        {renderStars(testimonial.rating)}
        <span className="ml-2 text-sm text-gray-600">
          {testimonial.rating}.0
        </span>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {testimonial.results.map((result, idx) => (
          <div key={idx} className="text-center">
            <div className="text-xl font-bold text-blue-600">{result.value}</div>
            <div className="text-xs text-gray-600">{result.metric}</div>
          </div>
        ))}
      </div>

      {/* Author */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <OptimizedImage
            src={testimonial.avatar}
            alt={testimonial.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold text-gray-900">{testimonial.name}</div>
            <div className="text-sm text-gray-600">{testimonial.title}</div>
            <div className="text-sm text-gray-500">{testimonial.company}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <OptimizedImage
            src={testimonial.companyLogo}
            alt={testimonial.company}
            width={40}
            height={40}
            className="w-10 h-auto object-contain"
            style={{ height: 'auto' }}
          />
          <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
            {testimonial.projectType}
          </span>
        </div>
      </div>
    </div>
  );

  if (variant === 'featured') {
    const featuredTestimonial = testimonials.find(t => t.featured) || testimonials[0];
    
    return (
      <section className={cn('py-16 bg-blue-50', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {renderTestimonialCard(featuredTestimonial, 0, true)}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'grid') {
    return (
      <section className={cn('py-16 bg-gray-50', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it - hear from the companies who've transformed their business with Zoptal
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {testimonials.slice(0, 6).map((testimonial, index) => 
              renderTestimonialCard(testimonial, index)
            )}
          </div>

          {/* Stats */}
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Default carousel variant
  return (
    <section className={cn('py-16 bg-white', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
            <StarIcon className="h-4 w-4 mr-2" />
            Client Success Stories
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Trusted by 500+ Companies Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From startups to Fortune 500 companies, see how we've helped businesses 
            accelerate growth with innovative technology solutions.
          </p>
        </div>

        {/* Client Logos */}
        {showLogos && (
          <div className="mb-16">
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {clientLogos.map((client, index) => (
                <div key={index} className="flex-shrink-0">
                  <OptimizedImage
                    src={client.logo}
                    alt={client.name}
                    width={120}
                    height={40}
                    className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Testimonial Carousel */}
        <div className="relative max-w-5xl mx-auto mb-16">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  {renderTestimonialCard(testimonial, index, index === currentTestimonial)}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center mt-8 space-x-4">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentTestimonial(index);
                    setIsAutoPlaying(false);
                  }}
                  className={cn(
                    'w-3 h-3 rounded-full transition-colors',
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  )}
                />
              ))}
            </div>
            
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              <ArrowRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="bg-gray-50 rounded-2xl p-8 group-hover:bg-blue-50 transition-colors">
                  <stat.icon className="h-10 w-10 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Pre-configured variants
export function TestimonialCarousel(props: Omit<SocialProofSectionProps, 'variant'>) {
  return <SocialProofSection {...props} variant="carousel" />;
}

export function TestimonialGrid(props: Omit<SocialProofSectionProps, 'variant'>) {
  return <SocialProofSection {...props} variant="grid" />;
}

export function FeaturedTestimonial(props: Omit<SocialProofSectionProps, 'variant'>) {
  return <SocialProofSection {...props} variant="featured" />;
}