import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

interface ProcessStep {
  step: number;
  title: string;
  description: string;
  duration: string;
}

interface ServiceProcessProps {
  process: ProcessStep[];
}

export default function ServiceProcess({ process }: ServiceProcessProps) {
  return (
    <section className="py-16 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Development Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A proven methodology that ensures successful project delivery on time and within budget.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {process.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                {step.step}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 mb-2">{step.description}</p>
              <div className="flex items-center justify-center text-sm text-blue-600">
                <ClockIcon className="h-4 w-4 mr-1" />
                {step.duration}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}