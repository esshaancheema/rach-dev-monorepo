'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  CubeIcon,
  BookOpenIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useHotkeys } from 'react-hotkeys-hook';
import Fuse from 'fuse.js';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  href: string;
  type: 'documentation' | 'api' | 'guide' | 'example';
  category: string;
  content?: string;
}

// Mock search data - in a real app, this would come from an API or search index
const searchData: SearchResult[] = [
  {
    id: '1',
    title: 'Authentication',
    description: 'Learn how to authenticate with the Zoptal API using JWT tokens',
    href: '/docs/authentication',
    type: 'documentation',
    category: 'Getting Started',
    content: 'JWT tokens bearer authentication API key'
  },
  {
    id: '2',
    title: 'POST /auth/login',
    description: 'Authenticate user with email and password',
    href: '/docs/api/authentication#login',
    type: 'api',
    category: 'Authentication API',
    content: 'login endpoint email password authentication'
  },
  {
    id: '3',
    title: 'Quick Start Guide',
    description: 'Get up and running with the Zoptal API in minutes',
    href: '/docs/guides/quickstart',
    type: 'guide',
    category: 'Guides',
    content: 'getting started tutorial first request'
  },
  {
    id: '4',
    title: 'Rate Limiting',
    description: 'Understanding API rate limits and how to handle them',
    href: '/docs/rate-limiting',
    type: 'documentation',
    category: 'API Concepts',
    content: 'rate limit throttling requests per minute'
  },
  {
    id: '5',
    title: 'Projects API',
    description: 'Manage projects with the Projects API',
    href: '/docs/api/projects',
    type: 'api',
    category: 'API Reference',
    content: 'projects CRUD create read update delete'
  },
  {
    id: '6',
    title: 'Building a Chat App',
    description: 'Step-by-step guide to building a chat application',
    href: '/docs/guides/chat-app',
    type: 'guide',
    category: 'Guides',
    content: 'chat application AI integration websockets'
  },
  {
    id: '7',  
    title: 'JavaScript SDK',
    description: 'Official JavaScript/TypeScript SDK for the Zoptal API',
    href: '/docs/sdks/javascript',
    type: 'documentation',
    category: 'SDKs',
    content: 'javascript typescript npm package client library'
  },
  {
    id: '8',
    title: 'Error Handling',
    description: 'How to handle errors returned by the API',
    href: '/docs/errors',
    type: 'documentation',
    category: 'API Concepts',
    content: 'errors error codes HTTP status codes'
  },
  {
    id: '9',
    title: 'AI Services API',
    description: 'Use AI-powered features in your applications',
    href: '/docs/api/ai',
    type: 'api',
    category: 'API Reference',
    content: 'AI artificial intelligence completion chat GPT'
  },
  {
    id: '10',
    title: 'Webhooks',
    description: 'Set up webhooks to receive real-time notifications',
    href: '/docs/webhooks',
    type: 'documentation',
    category: 'API Concepts',
    content: 'webhooks events notifications real-time'
  }
];

const typeIcons = {
  documentation: DocumentTextIcon,
  api: CodeBracketIcon,
  guide: BookOpenIcon,
  example: CubeIcon
};

const typeColors = {
  documentation: 'text-blue-600 bg-blue-50',
  api: 'text-green-600 bg-green-50',
  guide: 'text-purple-600 bg-purple-50',
  example: 'text-orange-600 bg-orange-50'
};

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => new Fuse(searchData, {
    keys: ['title', 'description', 'content', 'category'],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true
  }), []);

  // Perform search
  const results = useMemo(() => {
    if (!query.trim()) {
      return searchData.slice(0, 8); // Show recent/popular results
    }
    return fuse.search(query, { limit: 8 }).map(result => result.item);
  }, [query, fuse]);

  // Keyboard shortcuts
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault();
    if (!isOpen) {
      // Open search modal logic would go here
    }
  }, { enableOnContentEditable: true });

  useHotkeys('escape', () => {
    if (isOpen) {
      onClose();
    }
  }, { enableOnContentEditable: true });

  useHotkeys('arrowdown', (e) => {
    if (isOpen) {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    }
  }, { enableOnContentEditable: true });

  useHotkeys('arrowup', (e) => {
    if (isOpen) {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    }
  }, { enableOnContentEditable: true });

  useHotkeys('enter', () => {
    if (isOpen && results[selectedIndex]) {
      handleResultClick(results[selectedIndex]);
    }
  }, { enableOnContentEditable: true });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleResultClick = (result: SearchResult) => {
    onClose();
    // Navigation would be handled by the Link component
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />

          <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mx-auto max-w-2xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all"
            >
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search documentation..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {results.length > 0 && (
                <div className="max-h-96 transform-gpu scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800">
                  {results.map((result, index) => {
                    const Icon = typeIcons[result.type];
                    return (
                      <Link key={result.id} href={result.href}>
                        <div
                          className={`
                            group flex cursor-pointer select-none items-center rounded-md px-4 py-3 transition-colors
                            ${index === selectedIndex ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                          `}
                          onMouseEnter={() => setSelectedIndex(index)}
                          onClick={() => handleResultClick(result)}
                        >
                          <div className={`
                            flex h-8 w-8 items-center justify-center rounded-lg mr-3
                            ${index === selectedIndex ? 'bg-white/20' : typeColors[result.type]}
                          `}>
                            <Icon className={`
                              h-5 w-5
                              ${index === selectedIndex ? 'text-white' : typeColors[result.type].split(' ')[0]}
                            `} />
                          </div>
                          <div className="flex-auto">
                            <p className={`
                              text-sm font-medium
                              ${index === selectedIndex ? 'text-white' : 'text-gray-900'}
                            `}>
                              {highlightMatch(result.title, query)}
                            </p>
                            <p className={`
                              text-sm
                              ${index === selectedIndex ? 'text-blue-100' : 'text-gray-500'}
                            `}>
                              {highlightMatch(result.description, query)}
                            </p>
                            <p className={`
                              text-xs mt-1
                              ${index === selectedIndex ? 'text-blue-200' : 'text-gray-400'}
                            `}>
                              {result.category}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {query && results.length === 0 && (
                <div className="px-6 py-14 text-center text-sm sm:px-14">
                  <DocumentTextIcon className="mx-auto h-6 w-6 text-gray-400" />
                  <p className="mt-4 font-semibold text-gray-900">No results found</p>
                  <p className="mt-2 text-gray-500">
                    No results found for "{query}". Try searching for something else.
                  </p>
                </div>
              )}

              {!query && (
                <div className="px-6 py-14 text-center text-sm sm:px-14">
                  <DocumentTextIcon className="mx-auto h-6 w-6 text-gray-400" />
                  <p className="mt-4 font-semibold text-gray-900">Search documentation</p>
                  <p className="mt-2 text-gray-500">
                    Find API endpoints, guides, examples, and more.
                  </p>
                </div>
              )}

              {/* Footer with keyboard shortcuts */}
              <div className="flex flex-wrap items-center bg-gray-50 px-4 py-2.5 text-xs text-gray-700">
                <div className="flex items-center">
                  <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2">
                    ↵
                  </kbd>
                  <span className="sm:hidden">to select</span>
                  <span className="hidden sm:inline">to navigate</span>
                </div>
                <div className="flex items-center">
                  <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2">
                    ↑
                  </kbd>
                  <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2">
                    ↓
                  </kbd>
                  <span className="sm:hidden">to navigate</span>
                  <span className="hidden sm:inline">to select</span>
                </div>
                <div className="flex items-center">
                  <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2">
                    esc
                  </kbd>
                  <span>to close</span>
                </div>
              </div>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};