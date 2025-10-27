import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceFeature {
  name: string;
  description: string;
  included: boolean;
}

interface ServiceFeaturesProps {
  features: ServiceFeature[];
}

export default function ServiceFeatures({ features }: ServiceFeaturesProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What's Included
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive features and services designed to deliver maximum value for your investment.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={cn(
                  'p-6 border-b border-gray-200',
                  index % 2 === 1 && 'md:border-l md:border-b-0',
                  index >= features.length - 2 && 'border-b-0'
                )}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    {feature.included ? (
                      <CheckIcon className="h-6 w-6 text-green-500" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-200" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.name}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}