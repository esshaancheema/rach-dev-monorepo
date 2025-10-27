import { NextRequest, NextResponse } from 'next/server';
import { searchIndex } from '@/data/navigation';

export interface SearchResult {
  name: string;
  href: string;
  description?: string;
  category: string;
  section: string;
  icon?: string;
  isNew?: boolean;
  isPopular?: boolean;
  keywords?: string[];
  score?: number;
}

interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: string;
  executionTime: number;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  
  const query = searchParams.get('q')?.trim() || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const category = searchParams.get('category') || '';
  const includeDescription = searchParams.get('includeDescription') !== 'false';

  // Handle empty query
  if (!query) {
    return NextResponse.json({
      results: [],
      totalCount: 0,
      query: '',
      executionTime: Date.now() - startTime
    } as SearchResponse);
  }

  try {
    // Search algorithm with fuzzy matching and relevance scoring
    const normalizeString = (str: string) => 
      str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    const searchTerms = normalizeString(query).split(/\s+/);
    
    let scoredResults = searchIndex.map(item => {
      const itemName = normalizeString(item.name);
      const itemDescription = normalizeString(item.description || '');
      const itemCategory = normalizeString(item.category || '');
      const itemSection = normalizeString(item.section || '');
      
      let score = 0;
      let hasMatch = false;
      const matchedTerms = new Set<string>();

      searchTerms.forEach(term => {
        // Exact name match (highest priority)
        if (itemName.includes(term)) {
          const exactMatch = itemName === term;
          const startsWith = itemName.startsWith(term);
          
          if (exactMatch) {
            score += 100;
          } else if (startsWith) {
            score += 75;
          } else {
            score += 50;
          }
          
          hasMatch = true;
          matchedTerms.add(term);
        }
        
        // Category match (high priority)
        if (itemCategory.includes(term)) {
          score += itemCategory === term ? 40 : 30;
          hasMatch = true;
          matchedTerms.add(term);
        }
        
        // Section match (medium priority) 
        if (itemSection.includes(term)) {
          score += itemSection === term ? 25 : 20;
          hasMatch = true;
          matchedTerms.add(term);
        }
        
        // Description match (lower priority)
        if (includeDescription && itemDescription.includes(term)) {
          score += 10;
          hasMatch = true;
          matchedTerms.add(term);
        }

        // Fuzzy matching for typos (basic Levenshtein-like)
        if (!hasMatch && term.length >= 3) {
          const fuzzyMatch = (str: string, target: string) => {
            if (str.length < 3 || target.length < 3) return false;
            
            let matches = 0;
            for (let i = 0; i < Math.min(str.length, target.length); i++) {
              if (str[i] === target[i]) matches++;
            }
            
            return matches / Math.max(str.length, target.length) > 0.6;
          };

          if (fuzzyMatch(term, itemName)) {
            score += 15;
            hasMatch = true;
            matchedTerms.add(term);
          } else if (includeDescription && fuzzyMatch(term, itemDescription)) {
            score += 5;
            hasMatch = true;
            matchedTerms.add(term);
          }
        }
      });

      // Boost for multiple term matches
      if (matchedTerms.size > 1) {
        score += matchedTerms.size * 5;
      }

      // Boost popular and new items
      if (item.isPopular) score += 8;
      if (item.isNew) score += 5;

      // Penalize longer names (prefer more specific matches)
      score -= itemName.length * 0.2;

      // Boost exact phrase matches
      if (itemName.includes(normalizeString(query))) {
        score += 25;
      }

      return {
        ...item,
        score,
        hasMatch
      };
    });

    // Filter by category if specified
    if (category) {
      scoredResults = scoredResults.filter(item => 
        item.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter results with matches and positive scores
    const filteredResults = scoredResults
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
      .slice(0, limit);

    const response: SearchResponse = {
      results: filteredResults.map(({ score, hasMatch, ...item }) => ({
        ...item,
        score // Include score for debugging if needed
      })),
      totalCount: scoredResults.filter(item => item.hasMatch && item.score > 0).length,
      query,
      executionTime: Date.now() - startTime
    };

    // Add search analytics (optional - could be sent to tracking service)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Search: "${query}" - ${response.totalCount} results in ${response.executionTime}ms`);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Search API error:', error);
    
    return NextResponse.json(
      {
        results: [],
        totalCount: 0,
        query,
        executionTime: Date.now() - startTime,
        error: 'Internal server error'
      } as SearchResponse & { error: string },
      { status: 500 }
    );
  }
}

// Handle POST requests for more complex search queries
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { 
      query = '', 
      filters = {}, 
      limit = 20, 
      includeDescription = true,
      sortBy = 'relevance'
    } = body;

    // Validate input
    if (typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Use similar logic as GET but with more advanced filtering
    const searchParams = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      includeDescription: includeDescription.toString(),
      ...(filters.category && { category: filters.category })
    });

    // Reuse GET logic
    const url = new URL(`${request.url}?${searchParams}`);
    const getRequest = new NextRequest(url);
    
    return GET(getRequest);

  } catch (error) {
    console.error('Search POST API error:', error);
    
    return NextResponse.json(
      {
        results: [],
        totalCount: 0,
        query: '',
        executionTime: Date.now() - startTime,
        error: 'Invalid request body'
      },
      { status: 400 }
    );
  }
}