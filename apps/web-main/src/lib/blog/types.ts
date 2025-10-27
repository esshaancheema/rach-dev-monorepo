export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
    social: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
  category: BlogCategory;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
  featuredImage: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl?: string;
  };
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  postCount: number;
}

export interface BlogListingParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  featured?: boolean;
  search?: string;
  sortBy?: 'publishedAt' | 'title' | 'readingTime';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogMetrics {
  totalPosts: number;
  totalCategories: number;
  totalTags: number;
  totalViews: number;
  averageReadingTime: number;
}