'use client';

import { cn } from '@/lib/utils';
import { CTAGroup, SignupCTA, ContactCTA } from './CTAManager';

interface FooterCTASectionProps {
  title?: string;
  description?: string;
  showNewsletter?: boolean;
  className?: string;
}

export default function FooterCTASection({
  title = "Start Building Better Software Today",
  description = "Join thousands of developers and companies using Zoptal to accelerate their development process.",
  showNewsletter = false,
  className,
}: FooterCTASectionProps) {
  return (
    <div className={cn('bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16', className)}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {title}
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          {description}
        </p>
        
        <CTAGroup spacing="normal" alignment="center">
          <SignupCTA 
            size="lg" 
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100"
          />
          <ContactCTA 
            size="lg" 
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-blue-600"
          />
        </CTAGroup>

        {showNewsletter && (
          <div className="mt-12 pt-8 border-t border-blue-500/30">
            <p className="text-blue-100 mb-4">Subscribe for updates and insights</p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}