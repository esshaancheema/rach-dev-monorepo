import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { CaseStudy } from '@/lib/case-studies/types';
import { 
  ArrowRightIcon,
  ClockIcon,
  BuildingOfficeIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface CaseStudiesGridProps {
  caseStudies: CaseStudy[];
}

export default function CaseStudiesGrid({ caseStudies }: CaseStudiesGridProps) {
  if (caseStudies.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">No case studies found</h3>
        <p className="text-gray-600 mb-8">
          No case studies match your current filters. Try adjusting your selection.
        </p>
        <Link
          href="/case-studies"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          View All Case Studies
        </Link>
      </div>
    );
  }

  return (
    <div id="case-studies-grid">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {caseStudies.map((study) => (
          <article 
            key={study.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Featured Image */}
            <div className="relative">
              <Link href={`/case-studies/${study.slug}`}>
                <OptimizedImage
                  src={study.images.hero}
                  alt={study.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: getCategoryColor(study.category.color) }}
                >
                  {study.category.icon} {study.category.name}
                </span>
              </div>

              {/* Featured Badge */}
              {study.featured && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                    <StarIcon className="h-3 w-3 mr-1" />
                    Featured
                  </span>
                </div>
              )}

              {/* Project Status */}
              <div className="absolute bottom-4 right-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                  study.project.status === 'completed' ? 'bg-green-100 text-green-800' :
                  study.project.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {study.project.status === 'completed' ? '✅ Completed' :
                   study.project.status === 'ongoing' ? '🔄 Ongoing' : '🔧 Maintenance'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Client Info */}
              <div className="flex items-center space-x-3 mb-4">
                <OptimizedImage
                  src={study.client.logo}
                  alt={study.client.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-900">{study.client.name}</div>
                  <div className="text-xs text-gray-600">{study.client.industry}</div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
                <Link href={`/case-studies/${study.slug}`}>
                  {study.title}
                </Link>
              </h2>
              
              <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                {study.description}
              </p>

              {/* Key Results */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {study.results.slice(0, 2).map((result, index) => (
                  <div key={index} className="text-center bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-blue-600">{result.metric}</div>
                    <div className="text-xs text-gray-600 line-clamp-1">{result.value}</div>
                  </div>
                ))}
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1 mb-4">
                {study.technologies.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {tech}
                  </span>
                ))}
                {study.technologies.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                    +{study.technologies.length - 3} more
                  </span>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {study.project.duration}
                </div>
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  {study.client.size}
                </div>
              </div>

              {/* Read More Link */}
              <Link
                href={`/case-studies/${study.slug}`}
                className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Read Case Study
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Load More Section (for future pagination) */}
      {caseStudies.length >= 9 && (
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Showing {caseStudies.length} case studies. More projects available upon request.
          </p>
          <Link
            href="/contact?interest=case-studies"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Request More Case Studies
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      )}
    </div>
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