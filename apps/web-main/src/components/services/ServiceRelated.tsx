import React from 'react';
import RelatedLinks from '@/components/seo/RelatedLinks';

interface ServiceRelatedProps {
  relatedServices: string[];
  title: string;
}

export default function ServiceRelated({ relatedServices, title }: ServiceRelatedProps) {
  if (relatedServices.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Related Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our other services that complement your {title.toLowerCase()} project.
          </p>
        </div>
        
        <RelatedLinks 
          category="service"
          maxLinks={4}
          variant="cards"
          currentPath={`/services/${title.toLowerCase().replace(/\s+/g, '-')}`}
        />
      </div>
    </section>
  );
}