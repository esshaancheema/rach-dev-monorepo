import React from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface TechnologyStack {
  category: string;
  technologies: Array<{
    name: string;
    logo: string;
    description: string;
  }>;
}

interface ServiceTechStackProps {
  techStack: TechnologyStack[];
}

export default function ServiceTechStack({ techStack }: ServiceTechStackProps) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Technology Stack
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We use the latest and most reliable technologies to build scalable, secure solutions.
          </p>
        </div>

        {techStack.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">{category.category}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.technologies.map((tech, techIndex) => (
                <div key={techIndex} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                  <OptimizedImage
                    src={tech.logo}
                    alt={tech.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 mx-auto mb-4"
                  />
                  <h4 className="font-semibold text-gray-900 mb-2">{tech.name}</h4>
                  <p className="text-sm text-gray-600">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}