import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { BlogPost } from '@/lib/blog/types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface BlogPostNavigationProps {
  prevPost: BlogPost | null;
  nextPost: BlogPost | null;
}

export default function BlogPostNavigation({ prevPost, nextPost }: BlogPostNavigationProps) {
  if (!prevPost && !nextPost) {
    return null;
  }

  return (
    <nav className="mt-12 pt-8 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous Post */}
        <div className={`${!prevPost ? 'md:col-start-2' : ''}`}>
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="group block p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous Article
              </div>
              
              <div className="flex items-start space-x-4">
                <OptimizedImage
                  src={prevPost.featuredImage}
                  alt={prevPost.title}
                  width={80}
                  height={60}
                  className="w-20 h-15 rounded-lg object-cover flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {prevPost.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {prevPost.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="hidden md:block"></div>
          )}
        </div>

        {/* Next Post */}
        <div>
          {nextPost && (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group block p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-end text-sm text-gray-500 mb-3">
                Next Article
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-1 min-w-0 text-right">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {nextPost.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {nextPost.excerpt}
                  </p>
                </div>
                
                <OptimizedImage
                  src={nextPost.featuredImage}
                  alt={nextPost.title}
                  width={80}
                  height={60}
                  className="w-20 h-15 rounded-lg object-cover flex-shrink-0"
                />
              </div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}