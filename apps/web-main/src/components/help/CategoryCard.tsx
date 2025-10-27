import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { HelpCategory } from '@/lib/help/types';

interface CategoryCardProps {
  category: HelpCategory;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/help/categories/${category.slug}`}
      className="group block p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center text-white text-xl mr-4`}>
              {category.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500">
                {category.articleCount} article{category.articleCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {category.description}
          </p>
        </div>
        
        <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">Browse articles</span>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < Math.min(5, Math.ceil(category.articleCount / 3))
                  ? category.color.replace('bg-', 'bg-').replace('-500', '-200')
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}