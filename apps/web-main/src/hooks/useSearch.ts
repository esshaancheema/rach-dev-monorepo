'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { searchIndex } from '@/data/navigation';
import type { SearchResult } from '@/components/navigation/SearchResults';

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  isResultsVisible: boolean;
  setIsResultsVisible: (visible: boolean) => void;
  clearSearch: () => void;
}

interface SearchOptions {
  debounceMs?: number;
  maxResults?: number;
  includeDescription?: boolean;
}

export function useSearch(options: SearchOptions = {}): UseSearchReturn {
  const {
    debounceMs = 300,
    maxResults = 20,
    includeDescription = true
  } = options;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);

  // Debounce the search query
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsLoading(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Search algorithm with fuzzy matching and relevance scoring
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const normalizeString = (str: string) => 
      str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    const searchTerms = normalizeString(debouncedQuery).split(/\s+/);
    
    const scoredResults = searchIndex.map(item => {
      const itemName = normalizeString(item.name);
      const itemDescription = normalizeString(item.description || '');
      const itemCategory = normalizeString(item.category || '');
      const itemSection = normalizeString(item.section || '');
      
      let score = 0;
      let hasMatch = false;

      searchTerms.forEach(term => {
        // Exact name match (highest priority)
        if (itemName.includes(term)) {
          score += itemName === term ? 100 : 50;
          hasMatch = true;
        }
        
        // Category match (high priority)
        if (itemCategory.includes(term)) {
          score += 30;
          hasMatch = true;
        }
        
        // Section match (medium priority) 
        if (itemSection.includes(term)) {
          score += 20;
          hasMatch = true;
        }
        
        // Description match (lower priority)
        if (includeDescription && itemDescription.includes(term)) {
          score += 10;
          hasMatch = true;
        }

        // Fuzzy matching for typos (basic Levenshtein-like)
        const fuzzyMatch = (str: string, target: string) => {
          if (str.length < 3 || target.length < 3) return false;
          
          let matches = 0;
          for (let i = 0; i < Math.min(str.length, target.length); i++) {
            if (str[i] === target[i]) matches++;
          }
          
          return matches / Math.max(str.length, target.length) > 0.6;
        };

        // Apply fuzzy matching with lower score
        if (!hasMatch && term.length >= 3) {
          if (fuzzyMatch(term, itemName)) {
            score += 15;
            hasMatch = true;
          } else if (includeDescription && fuzzyMatch(term, itemDescription)) {
            score += 5;
            hasMatch = true;
          }
        }
      });

      // Boost popular and new items
      if (item.isPopular) score += 5;
      if (item.isNew) score += 3;

      // Penalize longer names (prefer more specific matches)
      score -= itemName.length * 0.1;

      return {
        ...item,
        score,
        hasMatch
      };
    });

    return scoredResults
      .filter(item => item.hasMatch && item.score > 0)
      .sort((a, b) => {
        // Sort by score, then by category priority, then alphabetically
        if (b.score !== a.score) return b.score - a.score;
        
        const categoryPriority = {
          'Services': 1,
          'Solutions': 2, 
          'AI Agents': 3,
          'Resources': 4
        };
        
        const aPriority = categoryPriority[a.category as keyof typeof categoryPriority] || 999;
        const bPriority = categoryPriority[b.category as keyof typeof categoryPriority] || 999;
        
        if (aPriority !== bPriority) return aPriority - bPriority;
        
        return a.name.localeCompare(b.name);
      })
      .slice(0, maxResults) as SearchResult[];
  }, [debouncedQuery, maxResults, includeDescription]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setIsResultsVisible(false);
  }, []);

  // Analytics tracking (optional)
  useEffect(() => {
    if (debouncedQuery && searchResults.length > 0) {
      // Track successful searches
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('Search Performed', {
          query: debouncedQuery,
          results_count: searchResults.length,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [debouncedQuery, searchResults.length]);

  return {
    query,
    setQuery,
    results: searchResults,
    isLoading,
    isResultsVisible,
    setIsResultsVisible,
    clearSearch
  };
}

// Specialized hooks for different use cases
export function useQuickSearch() {
  return useSearch({
    debounceMs: 150,
    maxResults: 8,
    includeDescription: false
  });
}

export function useFullSearch() {
  return useSearch({
    debounceMs: 300,
    maxResults: 50,
    includeDescription: true
  });
}

export function useMobileSearch() {
  return useSearch({
    debounceMs: 200,
    maxResults: 30,
    includeDescription: true
  });
}