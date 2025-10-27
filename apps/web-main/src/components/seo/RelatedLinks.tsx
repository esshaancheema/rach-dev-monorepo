'use client';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { getRelatedLinks, getContextualLinks, type InternalLink } from '@/lib/seo/internal-links';

interface RelatedLinksProps {
  currentPath: string;
  currentCategory: 'service' | 'solution' | 'resource' | 'location' | 'company';
  pageKeywords?: string[];
  maxLinks?: number;
  title?: string;
  showDescriptions?: boolean;
  variant?: 'cards' | 'list' | 'grid';
  className?: string;
}

const categoryIcons = {
  service: '⚙️',
  solution: '💡',
  resource: '📚',
  location: '🌍',
  company: '🏢'
};

const categoryColors = {
  service: 'from-blue-500 to-cyan-500',
  solution: 'from-purple-500 to-indigo-500',
  resource: 'from-green-500 to-emerald-500',
  location: 'from-orange-500 to-red-500',
  company: 'from-gray-500 to-slate-500'
};

export default function RelatedLinks({
  currentPath,
  currentCategory,
  pageKeywords = [],
  maxLinks = 6,
  title = 'Related Pages',
  showDescriptions = true,
  variant = 'cards',
  className = ''
}: RelatedLinksProps) {
  // Get both related and contextual links
  const relatedLinks = getRelatedLinks({
    currentPath,
    currentCategory,
    maxLinks: Math.ceil(maxLinks * 0.7),
    includeCrossSelling: true
  });

  const contextualLinks = pageKeywords.length > 0 
    ? getContextualLinks(pageKeywords, currentPath, Math.floor(maxLinks * 0.3))
    : [];

  // Combine and deduplicate links
  const allLinks = [...relatedLinks, ...contextualLinks];
  const uniqueLinks = allLinks.filter((link, index, self) =>
    index === self.findIndex(l => l.href === link.href)
  ).slice(0, maxLinks);

  if (uniqueLinks.length === 0) {
    return null;
  }

  const renderLinkCard = (link: InternalLink, index: number) => (
    <Link
      key={link.href}
      href={link.href}
      className="group block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{categoryIcons[link.category]}</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${categoryColors[link.category]} text-white`}>
            {link.category}
          </span>
        </div>
        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
      </div>
      
      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-2">
        {link.title}
      </h3>
      
      {showDescriptions && link.description && (
        <p className="text-sm text-gray-600 line-clamp-2">
          {link.description}
        </p>
      )}
      
      <div className="mt-3 flex flex-wrap gap-1">
        {link.keywords.slice(0, 3).map((keyword, keyIndex) => (
          <span key={keyIndex} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
            {keyword}
          </span>
        ))}
      </div>
    </Link>
  );

  const renderListItem = (link: InternalLink, index: number) => (
    <li key={link.href}>
      <Link
        href={link.href}
        className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm">{categoryIcons[link.category]}</span>
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              {link.title}
            </h3>
          </div>
          {showDescriptions && link.description && (
            <p className="text-sm text-gray-600 line-clamp-1">
              {link.description}
            </p>
          )}
        </div>
        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 ml-2" />
      </Link>
    </li>
  );

  const renderGridItem = (link: InternalLink, index: number) => (
    <Link
      key={link.href}
      href={link.href}
      className="group block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-300"
    >
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-lg">{categoryIcons[link.category]}</span>
        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
          {link.title}
        </h3>
      </div>
      {showDescriptions && link.description && (
        <p className="text-xs text-gray-600 line-clamp-2">
          {link.description}
        </p>
      )}
    </Link>
  );

  return (
    <section className={`py-8 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">
          {uniqueLinks.length} page{uniqueLinks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {variant === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueLinks.map(renderLinkCard)}
        </div>
      )}

      {variant === 'list' && (
        <ul className="space-y-2">
          {uniqueLinks.map(renderListItem)}
        </ul>
      )}

      {variant === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uniqueLinks.map(renderGridItem)}
        </div>
      )}
    </section>
  );
}