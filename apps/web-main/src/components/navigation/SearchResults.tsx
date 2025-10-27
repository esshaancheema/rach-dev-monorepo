'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChevronRightIcon, 
  MagnifyingGlassIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline';

export interface SearchResult {
  name: string;
  href: string;
  description?: string;
  category: string;
  section: string;
  icon?: React.ComponentType<any>;
  isNew?: boolean;
  isPopular?: boolean;
  keywords?: string[];
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
  onResultClick: () => void;
  isMobile?: boolean;
}

interface GroupedResults {
  [category: string]: SearchResult[];
}

const SearchResults = ({ 
  results, 
  isLoading, 
  query, 
  onResultClick,
  isMobile = false 
}: SearchResultsProps) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
    setHoveredIndex(-1);
    resultRefs.current = [];
  }, [results]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && resultRefs.current[selectedIndex]) {
            resultRefs.current[selectedIndex]?.click();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultRefs.current[selectedIndex]) {
      resultRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Group results by category
  const groupedResults = results.reduce<GroupedResults>((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {});

  // Category order and styling
  const categoryConfig = {
    'Services': {
      color: 'blue',
      icon: SparklesIcon,
      priority: 1
    },
    'Solutions': {
      color: 'purple', 
      icon: FireIcon,
      priority: 2
    },
    'AI Agents': {
      color: 'green',
      icon: SparklesIcon,
      priority: 3
    },
    'Resources': {
      color: 'orange',
      icon: FireIcon,
      priority: 4
    }
  };

  const sortedCategories = Object.keys(groupedResults).sort((a, b) => {
    const priorityA = categoryConfig[a as keyof typeof categoryConfig]?.priority || 999;
    const priorityB = categoryConfig[b as keyof typeof categoryConfig]?.priority || 999;
    return priorityA - priorityB;
  });

  const highlightQuery = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.02,
        duration: 0.15
      }
    })
  };

  if (isLoading) {
    return (
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 ${
          isMobile ? 'border-none shadow-none' : ''
        }`}
      >
        <div className="p-4 flex items-center justify-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent" />
          <span className="text-sm">Searching...</span>
        </div>
      </motion.div>
    );
  }

  if (results.length === 0 && query.length > 0) {
    return (
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 ${
          isMobile ? 'border-none shadow-none' : ''
        }`}
      >
        <div className="p-6 text-center">
          <MagnifyingGlassIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium mb-1">No results found</p>
          <p className="text-xs text-gray-500">
            Try searching for "web development", "AI agents", or "mobile apps"
          </p>
        </div>
      </motion.div>
    );
  }

  if (results.length === 0) return null;

  let flatResultIndex = 0;

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto ${
        isMobile ? 'border-none shadow-none max-h-none' : ''
      }`}
    >
      <div className="p-2">
        {sortedCategories.map((category) => {
          const categoryResults = groupedResults[category];
          const config = categoryConfig[category as keyof typeof categoryConfig];
          const CategoryIcon = config?.icon || SparklesIcon;

          return (
            <div key={category} className="mb-4 last:mb-0">
              {/* Category Header */}
              <div className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <CategoryIcon className="w-3 h-3" />
                <span>{category}</span>
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {categoryResults.length}
                </span>
              </div>

              {/* Category Results */}
              <div className="space-y-1">
                {categoryResults.slice(0, isMobile ? 10 : 5).map((result) => {
                  const currentIndex = flatResultIndex++;
                  const isSelected = currentIndex === selectedIndex;
                  const isHovered = currentIndex === hoveredIndex;
                  const IconComponent = result.icon;

                  return (
                    <motion.div
                      key={result.href}
                      custom={currentIndex}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Link
                        ref={(el) => {
                          resultRefs.current[currentIndex] = el;
                        }}
                        href={result.href}
                        onClick={onResultClick}
                        onMouseEnter={() => setHoveredIndex(currentIndex)}
                        onMouseLeave={() => setHoveredIndex(-1)}
                        className={`group flex items-center p-3 rounded-lg transition-all duration-150 ${
                          isSelected || isHovered
                            ? 'bg-primary-50 border-primary-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center flex-1 min-w-0">
                          {/* Icon */}
                          {IconComponent && (
                            <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                              isSelected || isHovered
                                ? 'bg-primary-100 text-primary-600'
                                : 'bg-gray-100 text-gray-400 group-hover:text-primary-500'
                            }`}>
                              <IconComponent className="w-4 h-4" />
                            </span>
                          )}

                          <span className="flex-1 min-w-0">
                            <span className="flex items-center space-x-2 mb-1">
                              <span className={`text-sm font-medium truncate ${
                                isSelected || isHovered
                                  ? 'text-primary-700'
                                  : 'text-gray-900 group-hover:text-primary-600'
                              }`}>
                                {highlightQuery(result.name, query)}
                              </span>

                              {/* Badges */}
                              <span className="flex items-center space-x-1 flex-shrink-0">
                                {result.isNew && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    New
                                  </span>
                                )}
                                {result.isPopular && (
                                  <FireIcon className="w-3 h-3 text-orange-500" />
                                )}
                              </span>
                            </span>

                            {result.description && (
                              <span className={`text-xs truncate block ${
                                isSelected || isHovered
                                  ? 'text-primary-600'
                                  : 'text-gray-500'
                              }`}>
                                {highlightQuery(result.description, query)}
                              </span>
                            )}
                          </span>
                        </span>

                        <ChevronRightIcon
                          className={`w-4 h-4 flex-shrink-0 ml-2 transition-all duration-150 ${
                            isSelected || isHovered
                              ? 'text-primary-400 translate-x-1'
                              : 'text-gray-300 group-hover:text-primary-400'
                          }`}
                        />
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Show more link for truncated results */}
                {categoryResults.length > (isMobile ? 10 : 5) && (
                  <div className="px-3 py-2">
                    <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                      +{categoryResults.length - (isMobile ? 10 : 5)} more in {category}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="border-t border-gray-100 px-3 py-2 mt-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </span>
            <div className="hidden sm:flex items-center space-x-2">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>⌘K Open</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchResults;