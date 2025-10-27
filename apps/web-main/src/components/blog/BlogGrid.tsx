'use client';

import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { BlogPost } from '@/lib/blog/types';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface BlogGridProps {
  posts: BlogPost[];
  currentPage: number;
  totalPosts: number;
  hasMore: boolean;
  searchParams: Record<string, string | undefined>;
}

export default function BlogGrid({ 
  posts, 
  currentPage, 
  totalPosts, 
  hasMore, 
  searchParams 
}: BlogGridProps) {
  const postsPerPage = 12;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value);
      }
    });
    if (page > 1) {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    return `/blog${queryString ? `?${queryString}` : ''}`;
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">No articles found</h3>
        <p className="text-gray-600 mb-8">
          {searchParams.search 
            ? `No articles found matching "${searchParams.search}"`
            : 'No articles available at the moment. Check back soon!'
          }
        </p>
        {searchParams.search && (
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            View All Articles
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {posts.map((post) => (
          <article 
            key={post.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Featured Image */}
            <div className="relative">
              <Link href={`/blog/${post.slug}`}>
                <OptimizedImage
                  src={post.featuredImage}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: getCategoryColor(post.category.color) }}
                >
                  {post.category.icon} {post.category.name}
                </span>
              </div>

              {/* Featured Badge */}
              {post.featured && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⭐ Featured
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    #{tag.toLowerCase().replace(/\s+/g, '')}
                  </Link>
                ))}
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    {post.author.name}
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {post.readingTime} min
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                </div>
              </div>

              {/* Read More Link */}
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Read Article
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * postsPerPage + 1} to{' '}
            {Math.min(currentPage * postsPerPage, totalPosts)} of {totalPosts} articles
          </div>

          <nav className="flex items-center space-x-2">
            {/* Previous Page */}
            {currentPage > 1 && (
              <Link
                href={buildUrl(currentPage - 1)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </Link>
            )}

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                const isActive = pageNum === currentPage;
                
                return (
                  <Link
                    key={pageNum}
                    href={buildUrl(pageNum)}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>

            {/* Next Page */}
            {hasMore && (
              <Link
                href={buildUrl(currentPage + 1)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700"
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}

function getCategoryColor(color: string): string {
  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    green: '#10b981', 
    purple: '#8b5cf6',
    orange: '#f97316',
    indigo: '#6366f1',
    teal: '#14b8a6'
  };
  return colorMap[color] || '#6b7280';
}