import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { BlogPost } from '@/lib/blog/types';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow, format } from 'date-fns';

interface BlogPostHeaderProps {
  post: BlogPost;
}

export default function BlogPostHeader({ post }: BlogPostHeaderProps) {
  return (
    <header className="relative">
      {/* Featured Image */}
      <div className="relative h-96 bg-gray-900 overflow-hidden">
        <OptimizedImage
          src={post.featuredImage}
          alt={post.title}
          width={1200}
          height={400}
          className="w-full h-full object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        
        {/* Breadcrumb */}
        <div className="absolute top-8 left-8">
          <nav className="flex items-center space-x-2 text-white text-sm">
            <Link href="/blog" className="hover:text-blue-300 transition-colors">
              Blog
            </Link>
            <span>/</span>
            <Link 
              href={`/blog/category/${post.category.slug}`}
              className="hover:text-blue-300 transition-colors"
            >
              {post.category.name}
            </Link>
          </nav>
        </div>

        {/* Category Badge */}
        <div className="absolute top-8 right-8">
          <span 
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: getCategoryColor(post.category.color) }}
          >
            {post.category.icon} {post.category.name}
          </span>
        </div>

        {/* Article Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              {/* Author & Meta Info */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <OptimizedImage
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full border-2 border-white"
                  />
                  <div>
                    <div className="font-semibold text-white">{post.author.name}</div>
                    <div className="text-sm text-gray-300">{post.author.bio.split('.')[0]}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-300">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Published </span>
                    {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                  </div>
                  
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    {post.readingTime} min read
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors">
                  <BookmarkIcon className="h-4 w-4 mr-2" />
                  Save
                </button>
                
                <button className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors">
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800 transition-colors"
              >
                #{tag.toLowerCase().replace(/\s+/g, '')}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
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