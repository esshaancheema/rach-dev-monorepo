import Link from 'next/link';
import Image from 'next/image';
import { ClockIcon, EyeIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { HelpArticle } from '@/lib/help/types';
import { getHelpCategoryBySlug } from '@/lib/help/data';

interface ArticleCardProps {
  article: HelpArticle;
  showCategory?: boolean;
}

export default function ArticleCard({ article, showCategory = true }: ArticleCardProps) {
  const category = getHelpCategoryBySlug(article.categoryId);
  const helpfulPercentage = Math.round((article.helpful / (article.helpful + article.notHelpful)) * 100);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link
      href={`/help/articles/${article.slug}`}
      className="group block bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-200 overflow-hidden"
    >
      {/* Article Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            {showCategory && category && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.color.replace('bg-', 'bg-').replace('-500', '-100')} ${category.color.replace('bg-', 'text-').replace('-500', '-800')}`}>
                {category.icon} {category.name}
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(article.difficulty)}`}>
              {article.difficulty}
            </span>
          </div>
          
          {article.featured && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              ⭐ Featured
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2">
          {article.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {article.excerpt}
        </p>

        {/* Article Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              {article.estimatedReadTime}
            </div>
            <div className="flex items-center">
              <EyeIcon className="h-3 w-3 mr-1" />
              {article.views.toLocaleString()}
            </div>
            <div className="flex items-center">
              <HandThumbUpIcon className="h-3 w-3 mr-1" />
              {helpfulPercentage}%
            </div>
          </div>
          
          <time dateTime={article.publishedAt} className="text-gray-400">
            {new Date(article.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </time>
        </div>
      </div>

      {/* Author Info */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-xs font-medium">
              {article.author.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{article.author.name}</p>
            <p className="text-xs text-gray-500">{article.author.role}</p>
          </div>
        </div>
      </div>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600"
              >
                #{tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600">
                +{article.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}