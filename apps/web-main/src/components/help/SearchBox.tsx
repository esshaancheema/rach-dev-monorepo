'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { searchHelpContent } from '@/lib/help/data';
import Link from 'next/link';

interface SearchResult {
  type: 'article' | 'faq';
  id: string;
  title: string;
  excerpt: string;
  url: string;
  category: string;
  relevanceScore: number;
  matchedTerms: string[];
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        const searchResults = searchHelpContent(query);
        setResults(searchResults.slice(0, 8)); // Limit to 8 results
        setIsLoading(false);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
  };

  const highlightText = (text: string, terms: string[]) => {
    if (!terms.length) return text;
    
    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (terms.some(term => part.toLowerCase() === term.toLowerCase())) {
        return <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">{part}</mark>;
      }
      return part;
    });
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search for help articles, FAQs, and more..."
          className="block w-full pl-12 pr-12 py-4 border border-white border-opacity-20 rounded-xl bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:border-transparent focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 transition-all duration-200"
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 text-sm mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">
                  Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                </p>
              </div>
              
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={result.url}
                  onClick={handleResultClick}
                  className="block p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                          result.type === 'article' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {result.type === 'article' ? '📄 Article' : '❓ FAQ'}
                        </span>
                        <span className="text-xs text-gray-500">{result.category}</span>
                      </div>
                      
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {highlightText(result.title, result.matchedTerms)}
                      </h3>
                      
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {highlightText(result.excerpt, result.matchedTerms)}
                      </p>
                    </div>
                    
                    <div className="ml-3 text-xs text-gray-400">
                      {Math.round(result.relevanceScore)}% match
                    </div>
                  </div>
                </Link>
              ))}
              
              {results.length >= 8 && (
                <div className="p-3 text-center border-t border-gray-100">
                  <Link
                    href={`/help/search?q=${encodeURIComponent(query)}`}
                    onClick={handleResultClick}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all results for "{query}"
                  </Link>
                </div>
              )}
            </>
          ) : query.length >= 2 ? (
            <div className="p-8 text-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No results found for "{query}"</p>
              <p className="text-sm text-gray-400">
                Try different keywords or browse our categories below
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Popular Searches */}
      {!isOpen && !query && (
        <div className="mt-6">
          <p className="text-blue-200 text-sm mb-3 text-center">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'pricing',
              'development process',
              'timeline',
              'technologies',
              'getting started',
              'support'
            ].map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 py-1 bg-white bg-opacity-10 text-blue-200 text-xs rounded-full hover:bg-opacity-20 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}