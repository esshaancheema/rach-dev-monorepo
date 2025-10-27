'use client';

import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CommandIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import SearchResults from './SearchResults';
import { useSearch } from '@/hooks/useSearch';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
}

const SearchBar = ({ 
  className = '', 
  placeholder = 'Search services, solutions, and resources...',
  onClose 
}: SearchBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    query,
    setQuery,
    results,
    isLoading,
    isResultsVisible,
    setIsResultsVisible,
    clearSearch
  } = useSearch();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isExpanded || isResultsVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, isResultsVisible]);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setIsFocused(false);
    setIsResultsVisible(false);
    clearSearch();
    onClose?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsResultsVisible(value.length > 0);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (query.length > 0) {
      setIsResultsVisible(true);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsResultsVisible(false);
      }
    }, 200);
  };

  const searchVariants = {
    collapsed: {
      width: '40px',
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    expanded: {
      width: '320px',
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { delay: 0.1, duration: 0.2 }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Desktop Search */}
      <motion.div
        className="hidden md:block relative"
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={searchVariants}
      >
        <div className={`relative flex items-center h-10 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors duration-200 ${
          isFocused ? 'ring-2 ring-primary-500 border-primary-500 bg-white' : 'border-gray-200'
        }`}>
          <button
            onClick={handleExpand}
            className="absolute left-0 flex items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.input
                ref={inputRef}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={inputVariants}
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="w-full pl-10 pr-16 py-2 text-sm bg-transparent border-none outline-none placeholder-gray-500"
                autoComplete="off"
                spellCheck={false}
              />
            )}
          </AnimatePresence>

          {isExpanded && (
            <div className="absolute right-2 flex items-center space-x-1">
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setIsResultsVisible(false);
                    inputRef.current?.focus();
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
              
              {!isExpanded && (
                <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-400">
                  <CommandIcon className="w-3 h-3" />
                  <span>K</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {isResultsVisible && (
            <SearchResults
              results={results}
              isLoading={isLoading}
              query={query}
              onResultClick={() => {
                handleClose();
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile Search Button */}
      <button
        onClick={handleExpand}
        className="md:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Search"
      >
        <MagnifyingGlassIcon className="w-5 h-5" />
      </button>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={handleClose}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-0 left-0 right-0 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center p-4 border-b">
                <div className="flex-1 flex items-center space-x-3">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    className="flex-1 text-base bg-transparent border-none outline-none placeholder-gray-500"
                    autoComplete="off"
                    spellCheck={false}
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close search"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Results */}
              {query.length > 0 && (
                <div className="max-h-96 overflow-y-auto">
                  <SearchResults
                    results={results}
                    isLoading={isLoading}
                    query={query}
                    onResultClick={handleClose}
                    isMobile
                  />
                </div>
              )}

              {/* Search Tips */}
              {query.length === 0 && (
                <div className="p-4 space-y-3">
                  <p className="text-sm text-gray-600 font-medium">Popular searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Web Development',
                      'AI Agents',
                      'Mobile Apps',
                      'E-commerce',
                      'Food Delivery'
                    ].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          setIsResultsVisible(true);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;