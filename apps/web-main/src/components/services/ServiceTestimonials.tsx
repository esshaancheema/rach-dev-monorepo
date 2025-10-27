import React from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface ServiceTestimonial {
  name: string;
  title: string;
  company: string;
  content: string;
  avatar: string;
  results: Array<{
    metric: string;
    value: string;
  }>;
}

interface ServiceTestimonialsProps {
  testimonials: ServiceTestimonial[];
}

export default function ServiceTestimonials({ testimonials }: ServiceTestimonialsProps) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Client Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how we've helped businesses like yours achieve their goals.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {testimonials.slice(0, 2).map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8">
              <blockquote className="text-lg text-gray-700 mb-6">
                "{testimonial.content}"
              </blockquote>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <OptimizedImage
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.title}, {testimonial.company}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                {testimonial.results.map((result, resultIndex) => (
                  <div key={resultIndex}>
                    <div className="text-xl font-bold text-blue-600">{result.value}</div>
                    <div className="text-xs text-gray-600">{result.metric}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}