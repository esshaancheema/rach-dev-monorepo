'use client';

import { useState } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { BlogPost } from '@/lib/blog/types';
import { 
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface BlogHeroProps {
  featuredPosts: BlogPost[];
  searchParams: {
    search?: string;
  };
}

export default function BlogHero({ featuredPosts, searchParams }: BlogHeroProps) {
  const [searchQuery, setSearchQuery] = useState(searchParams.search || '');
  const mainPost = featuredPosts[0];
  const sidePosts = featuredPosts.slice(1, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/blog?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Latest Tech Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Stay ahead with expert insights on AI, web development, mobile apps, and emerging technologies. 
            Written by industry professionals for developers and tech leaders.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, tutorials, and insights..."
                className="w-full px-6 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-14"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Featured Posts Grid */}
        {featuredPosts.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Main Featured Post */}
            {mainPost && (
              <article className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                <div className="relative">
                  <OptimizedImage
                    src={mainPost.featuredImage}
                    alt={mainPost.title}
                    width={600}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span 
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getCategoryColor(mainPost.category.color) }}
                    >
                      {mainPost.category.icon} {mainPost.category.name}
                    </span>
                  </div>
                </div>
                
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                    <Link href={`/blog/${mainPost.slug}`}>
                      {mainPost.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {mainPost.excerpt}
                  </p>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {mainPost.author.name}
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDistanceToNow(new Date(mainPost.publishedAt), { addSuffix: true })}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {mainPost.readingTime} min read
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${mainPost.slug}`}
                    className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    Read Full Article
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </article>
            )}

            {/* Side Featured Posts */}
            <div className="space-y-6">
              {sidePosts.map((post) => (
                <article 
                  key={post.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <OptimizedImage
                        src={post.featuredImage}
                        alt={post.title}
                        width={120}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-white"
                          style={{ backgroundColor: getCategoryColor(post.category.color) }}
                        >
                          {post.category.icon} {post.category.name}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{post.author.name}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}</span>
                        <span>•</span>
                        <span>{post.readingTime} min</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {/* Blog Stats */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-4">Join Our Community</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">50+</div>
                    <div className="text-xs text-blue-200">Articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">10K+</div>
                    <div className="text-xs text-blue-200">Readers</div>
                  </div>
                </div>
                <Link
                  href="/newsletter"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Subscribe to Newsletter
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
    green: '#10b981', 
    purple: '#8b5cf6',
    orange: '#f97316',
    indigo: '#6366f1',
    teal: '#14b8a6'
  };
  return colorMap[color] || '#6b7280';
}