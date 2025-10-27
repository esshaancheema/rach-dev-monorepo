export interface HelpCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  articleCount: number;
}

export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: string;
  views: number;
  helpful: number;
  notHelpful: number;
  relatedArticles: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
  featured: boolean;
  order: number;
  relatedArticles: string[];
  lastUpdated: string;
}

export interface SearchResult {
  type: 'article' | 'faq';
  id: string;
  title: string;
  excerpt: string;
  url: string;
  category: string;
  relevanceScore: number;
  matchedTerms: string[];
}

export interface HelpMetrics {
  totalArticles: number;
  totalViews: number;
  avgHelpfulRating: number;
  topCategories: Array<{
    name: string;
    views: number;
    articles: number;
  }>;
  popularArticles: Array<{
    title: string;
    views: number;
    helpfulRating: number;
  }>;
  searchQueries: Array<{
    query: string;
    count: number;
    resultsFound: number;
  }>;
}