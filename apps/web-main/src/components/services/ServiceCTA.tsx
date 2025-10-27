import React from 'react';
import Link from 'next/link';
import { UserGroupIcon } from '@heroicons/react/24/outline';

export default function ServiceCTA() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Let's discuss your project requirements and provide you with a detailed proposal and timeline.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-lg"
          >
            <UserGroupIcon className="mr-2 h-5 w-5" />
            Get Free Consultation
          </Link>
          
          <Link
            href="tel:+1-555-012-3456"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-blue-600 rounded-lg transition-colors"
          >
            Call Now: +1-555-012-3456
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center pt-8 border-t border-blue-500">
          <div>
            <div className="text-2xl font-bold text-white">24h</div>
            <div className="text-sm text-blue-200">Response Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">500+</div>
            <div className="text-sm text-blue-200">Projects Delivered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">98%</div>
            <div className="text-sm text-blue-200">Client Satisfaction</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">99.9%</div>
            <div className="text-sm text-blue-200">Uptime SLA</div>
          </div>
        </div>
      </div>
    </section>
  );
}