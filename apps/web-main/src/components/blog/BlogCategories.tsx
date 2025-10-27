'use client';

import Link from 'next/link';
import { BlogCategory } from '@/lib/blog/types';

interface BlogCategoriesProps {
  categories: BlogCategory[];
  activeCategory?: string;
}

export default function BlogCategories({ categories, activeCategory }: BlogCategoriesProps) {
  return (
    <section className="py-8 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Browse by Category</h2>
          <Link
            href="/blog"
            className={`text-sm font-medium transition-colors ${
              !activeCategory 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            All Articles
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const isActive = activeCategory === category.slug;
            
            return (
              <Link
                key={category.id}
                href={`/blog/category/${category.slug}`}
                className={`group relative bg-white rounded-xl border-2 p-4 text-center hover:shadow-lg transition-all duration-300 ${
                  isActive 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {/* Category Icon */}
                <div className={`text-3xl mb-3 transition-transform group-hover:scale-110 ${
                  isActive ? 'scale-110' : ''
                }`}>
                  {category.icon}
                </div>

                {/* Category Name */}
                <h3 className={`font-semibold text-sm mb-2 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'
                }`}>
                  {category.name}
                </h3>

                {/* Post Count */}
                <div className="text-xs text-gray-500">
                  {category.postCount} {category.postCount === 1 ? 'article' : 'articles'}
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}