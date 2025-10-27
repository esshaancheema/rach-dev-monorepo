import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { BlogPost } from '@/lib/blog/types';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface RelatedPostsProps {
  posts: BlogPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                {post.excerpt}
              </p>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {post.readingTime} min read
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
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