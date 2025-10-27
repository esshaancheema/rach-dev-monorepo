import React from 'react';
import Link from 'next/link';
import { 
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface ServiceHeroProps {
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
}

export default function ServiceHero({ 
  title, 
  subtitle, 
  description, 
  heroImage 
}: ServiceHeroProps) {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
              <StarIcon className="h-4 w-4 mr-2" />
              {subtitle}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg"
              >
                Get Started Today
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                View Pricing
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Projects Delivered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">98%</div>
                <div className="text-sm text-gray-600">Client Satisfaction</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Support Available</div>
              </div>
            </div>
          </div>

          <div className="relative lg:ml-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 rounded-2xl rotate-3 scale-105" />
              <OptimizedImage
                src={heroImage}
                alt={title}
                width={600}
                height={400}
                className="relative rounded-2xl shadow-2xl w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}