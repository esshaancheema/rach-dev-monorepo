'use client';

import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { CaseStudy } from '@/lib/case-studies/types';
import { 
  ArrowRightIcon,
  ChartBarIcon,
  ClockIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface CaseStudiesHeroProps {
  featuredCaseStudies: CaseStudy[];
}

export default function CaseStudiesHero({ featuredCaseStudies }: CaseStudiesHeroProps) {
  const mainStudy = featuredCaseStudies[0];
  const sideStudies = featuredCaseStudies.slice(1, 3);

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Success Stories That Inspire
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover how we've helped organizations across industries achieve remarkable 
            results with custom software solutions, AI platforms, and digital transformation.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-gray-600">Projects Delivered</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-green-600">50+</div>
              <div className="text-sm text-gray-600">Fortune 500 Clients</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-purple-600">$500M+</div>
              <div className="text-sm text-gray-600">Client Value Created</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-orange-600">15+</div>
              <div className="text-sm text-gray-600">Industries Served</div>
            </div>
          </div>
        </div>

        {/* Featured Case Studies */}
        {featuredCaseStudies.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Featured Study */}
            {mainStudy && (
              <div className="lg:col-span-2">
                <article className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                  <div className="relative">
                    <OptimizedImage
                      src={mainStudy.images.hero}
                      alt={mainStudy.title}
                      width={800}
                      height={400}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span 
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getCategoryColor(mainStudy.category.color) }}
                      >
                        {mainStudy.category.icon} {mainStudy.category.name}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⭐ Featured
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-center space-x-4 mb-4">
                      <OptimizedImage
                        src={mainStudy.client.logo}
                        alt={mainStudy.client.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{mainStudy.client.name}</div>
                        <div className="text-sm text-gray-600">{mainStudy.client.industry}</div>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                      <Link href={`/case-studies/${mainStudy.slug}`}>
                        {mainStudy.title}
                      </Link>
                    </h2>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {mainStudy.description}
                    </p>

                    {/* Key Results */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {mainStudy.results.slice(0, 4).map((result, index) => (
                        <div key={index} className="text-center bg-gray-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-blue-600">{result.metric}</div>
                          <div className="text-xs text-gray-600">{result.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Project Details */}
                    <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {mainStudy.project.duration}
                      </div>
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                        {mainStudy.client.size}
                      </div>
                      <div className="flex items-center">
                        <ChartBarIcon className="h-4 w-4 mr-1" />
                        {mainStudy.project.status}
                      </div>
                    </div>

                    <Link
                      href={`/case-studies/${mainStudy.slug}`}
                      className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                    >
                      Read Full Case Study
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </article>
              </div>
            )}

            {/* Side Featured Studies */}
            <div className="space-y-6">
              {sideStudies.map((study) => (
                <article 
                  key={study.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex space-x-4 mb-4">
                    <OptimizedImage
                      src={study.images.hero}
                      alt={study.title}
                      width={80}
                      height={60}
                      className="w-20 h-15 rounded-lg object-cover flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-white"
                          style={{ backgroundColor: getCategoryColor(study.category.color) }}
                        >
                          {study.category.icon} {study.category.name}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                        <Link href={`/case-studies/${study.slug}`}>
                          {study.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {study.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {study.client.name} • {study.client.industry}
                        </div>
                        <Link
                          href={`/case-studies/${study.slug}`}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Mini Results */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-200">
                    {study.results.slice(0, 3).map((result, index) => (
                      <div key={index} className="text-center">
                        <div className="text-sm font-bold text-blue-600">{result.metric}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{result.value}</div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}

              {/* View All CTA */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white text-center">
                <h3 className="text-lg font-bold mb-2">Explore All Case Studies</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Discover more success stories across industries and technologies
                </p>
                <Link
                  href="#case-studies-grid"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  View All Projects
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function getCategoryColor(color: string): string {
  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    green: '#10b981',
    red: '#ef4444',
    orange: '#f97316',
    indigo: '#6366f1'
  };
  return colorMap[color] || '#6b7280';
}