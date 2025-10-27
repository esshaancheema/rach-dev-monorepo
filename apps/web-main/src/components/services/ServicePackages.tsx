import React from 'react';
import Link from 'next/link';
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServicePackage {
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: {
    text: string;
    href: string;
  };
}

interface ServicePackagesProps {
  packages: ServicePackage[];
}

export default function ServicePackages({ packages }: ServicePackagesProps) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Package
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Flexible packages designed to meet different budgets and requirements.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={cn(
                'relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden',
                pkg.popular && 'ring-2 ring-blue-500 scale-105'
              )}
            >
              {pkg.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                <p className="text-gray-600 mb-6">{pkg.description}</p>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-1">{pkg.price}</div>
                  <div className="text-sm text-gray-500">{pkg.duration}</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={pkg.cta.href}
                  className={cn(
                    'w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors',
                    pkg.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                  )}
                >
                  {pkg.cta.text}
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}