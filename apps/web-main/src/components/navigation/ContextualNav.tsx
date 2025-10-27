'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { getBreadcrumbLinks, getRelatedLinks } from '@/lib/seo/internal-links';

interface ContextualNavProps {
  category?: 'service' | 'solution' | 'resource' | 'location' | 'company';
  showBreadcrumbs?: boolean;
  showRelatedLinks?: boolean;
  maxRelatedLinks?: number;
  className?: string;
}

export default function ContextualNav({
  category,
  showBreadcrumbs = true,
  showRelatedLinks = true,
  maxRelatedLinks = 4,
  className = ''
}: ContextualNavProps) {
  const pathname = usePathname();
  
  const breadcrumbs = showBreadcrumbs ? getBreadcrumbLinks(pathname) : [];
  const relatedLinks = (showRelatedLinks && category) 
    ? getRelatedLinks({
        currentPath: pathname,
        currentCategory: category,
        maxLinks: maxRelatedLinks,
        includeCrossSelling: false
      })
    : [];

  return (
    <nav className={`bg-gray-50 border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {showBreadcrumbs && breadcrumbs.length > 1 && (
          <div className="py-4">
            <ol className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center">
                  {index === 0 && (
                    <HomeIcon className="w-4 h-4 text-gray-400 mr-1" />
                  )}
                  
                  {index < breadcrumbs.length - 1 ? (
                    <>
                      <Link
                        href={crumb.href}
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        {crumb.name}
                      </Link>
                      <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
                    </>
                  ) : (
                    <span className="text-gray-900 font-medium">
                      {crumb.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Related Links */}
        {showRelatedLinks && relatedLinks.length > 0 && (
          <div className="py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Related:
              </span>
              <div className="flex flex-wrap gap-2">
                {relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}