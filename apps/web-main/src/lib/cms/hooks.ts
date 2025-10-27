'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { cms, previewCms, type BlogPost, type CaseStudy, type Service, type TeamMember } from './contentful';

// Blog post hooks
export function useBlogPosts(options: {
  limit?: number;
  featured?: boolean;
  category?: string;
  author?: string;
  tag?: string;
  preview?: boolean;
} = {}) {
  const client = options.preview ? previewCms : cms;
  
  return useQuery({
    queryKey: ['blogPosts', options],
    queryFn: () => client.getBlogPosts(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useBlogPost(slug: string, preview: boolean = false) {
  const client = preview ? previewCms : cms;
  
  return useQuery({
    queryKey: ['blogPost', slug, preview],
    queryFn: () => client.getBlogPost(slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!slug,
  });
}

export function useInfiniteBlogPosts(options: {
  limit?: number;
  featured?: boolean;
  category?: string;
  author?: string;
  tag?: string;
  preview?: boolean;
} = {}) {
  const client = options.preview ? previewCms : cms;
  const limit = options.limit || 10;
  
  return useInfiniteQuery({
    queryKey: ['infiniteBlogPosts', options],
    queryFn: ({ pageParam = 0 }) => client.getBlogPosts({
      ...options,
      limit,
      skip: pageParam * limit,
    }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Case study hooks
export function useCaseStudies(options: {
  limit?: number;
  featured?: boolean;
  industry?: string;
  technology?: string;
  preview?: boolean;
} = {}) {
  const client = options.preview ? previewCms : cms;
  
  return useQuery({
    queryKey: ['caseStudies', options],
    queryFn: () => client.getCaseStudies(options),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCaseStudy(slug: string, preview: boolean = false) {
  const client = preview ? previewCms : cms;
  
  return useQuery({
    queryKey: ['caseStudy', slug, preview],
    queryFn: () => client.getCaseStudy(slug),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: !!slug,
  });
}

// Service hooks
export function useServices(options: {
  limit?: number;
  featured?: boolean;
  category?: string;
  status?: 'active' | 'inactive';
  preview?: boolean;
} = {}) {
  const client = options.preview ? previewCms : cms;
  
  return useQuery({
    queryKey: ['services', options],
    queryFn: () => client.getServices(options),
    staleTime: 10 * 60 * 1000, // Services change less frequently
    gcTime: 60 * 60 * 1000,
  });
}

export function useService(slug: string, preview: boolean = false) {
  const client = preview ? previewCms : cms;
  
  return useQuery({
    queryKey: ['service', slug, preview],
    queryFn: () => client.getService(slug),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: !!slug,
  });
}

// Team member hooks
export function useTeamMembers(options: {
  limit?: number;
  availability?: 'available' | 'busy' | 'unavailable';
  skill?: string;
  location?: string;
  preview?: boolean;
} = {}) {
  const client = options.preview ? previewCms : cms;
  
  return useQuery({
    queryKey: ['teamMembers', options],
    queryFn: () => client.getTeamMembers(options),
    staleTime: 15 * 60 * 1000, // Team info changes infrequently
    gcTime: 60 * 60 * 1000,
  });
}

// Testimonial hooks
export function useTestimonials(options: {
  limit?: number;
  featured?: boolean;
  minRating?: number;
  preview?: boolean;
} = {}) {
  const client = options.preview ? previewCms : cms;
  
  return useQuery({
    queryKey: ['testimonials', options],
    queryFn: () => client.getTestimonials(options),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

// Category and tag hooks
export function useCategories(preview: boolean = false) {
  const client = preview ? previewCms : cms;
  
  return useQuery({
    queryKey: ['categories', preview],
    queryFn: () => client.getCategories(),
    staleTime: 30 * 60 * 1000, // Categories rarely change
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

export function useTags(preview: boolean = false) {
  const client = preview ? previewCms : cms;
  
  return useQuery({
    queryKey: ['tags', preview],
    queryFn: () => client.getTags(),
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });
}

export function useServiceCategories(preview: boolean = false) {
  const client = preview ? previewCms : cms;
  
  return useQuery({
    queryKey: ['serviceCategories', preview],
    queryFn: () => client.getServiceCategories(),
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });
}

// Search hook
export function useContentSearch(
  query: string,
  contentTypes: string[] = ['blogPost', 'caseStudy', 'service'],
  preview: boolean = false
) {
  const client = preview ? previewCms : cms;
  
  return useQuery({
    queryKey: ['contentSearch', query, contentTypes, preview],
    queryFn: () => client.searchContent(query, contentTypes),
    staleTime: 2 * 60 * 1000, // Search results stale quickly
    gcTime: 10 * 60 * 1000,
    enabled: query.length >= 2, // Only search with 2+ characters
  });
}

// Combined hooks for complex data needs
export function useFeaturedContent(preview: boolean = false) {
  const blogPostsQuery = useBlogPosts({ featured: true, limit: 3, preview });
  const caseStudiesQuery = useCaseStudies({ featured: true, limit: 3, preview });
  const servicesQuery = useServices({ featured: true, limit: 6, preview });
  
  return {
    blogPosts: blogPostsQuery.data || [],
    caseStudies: caseStudiesQuery.data || [],
    services: servicesQuery.data || [],
    isLoading: blogPostsQuery.isLoading || caseStudiesQuery.isLoading || servicesQuery.isLoading,
    isError: blogPostsQuery.isError || caseStudiesQuery.isError || servicesQuery.isError,
    error: blogPostsQuery.error || caseStudiesQuery.error || servicesQuery.error,
  };
}

export function useHomepageContent(preview: boolean = false) {
  const featuredContent = useFeaturedContent(preview);
  const testimonialsQuery = useTestimonials({ featured: true, limit: 5, preview });
  const teamQuery = useTeamMembers({ limit: 8, availability: 'available', preview });
  
  return {
    ...featuredContent,
    testimonials: testimonialsQuery.data || [],
    team: teamQuery.data || [],
    isLoading: featuredContent.isLoading || testimonialsQuery.isLoading || teamQuery.isLoading,
    isError: featuredContent.isError || testimonialsQuery.isError || teamQuery.isError,
  };
}

// Utility hooks
export function useClearCMSCache() {
  return () => {
    cms.clearCache();
    previewCms.clearCache();
  };
}

export function useContentfulPreview() {
  const [isPreview, setIsPreview] = React.useState(false);
  
  React.useEffect(() => {
    // Check if we're in preview mode based on URL params
    const urlParams = new URLSearchParams(window.location.search);
    const preview = urlParams.get('preview') === 'true';
    const secret = urlParams.get('secret');
    
    // Verify preview secret (you should set this in your environment)
    const validSecret = process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_SECRET;
    
    if (preview && (!validSecret || secret === validSecret)) {
      setIsPreview(true);
    }
  }, []);
  
  return isPreview;
}

// Type-safe content hooks with transforms
export function useBlogPostWithMeta(slug: string, preview: boolean = false) {
  const query = useBlogPost(slug, preview);
  
  return {
    ...query,
    data: query.data ? {
      ...query.data,
      readingTime: query.data.fields.readingTime || 5,
      formattedDate: new Date(query.data.fields.publishDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      excerpt: query.data.fields.excerpt || '',
      tags: query.data.fields.tags?.map(tag => tag.fields) || [],
      author: query.data.fields.author?.fields || null,
      category: query.data.fields.category?.fields || null,
    } : null,
  };
}

export function useCaseStudyWithMeta(slug: string, preview: boolean = false) {
  const query = useCaseStudy(slug, preview);
  
  return {
    ...query,
    data: query.data ? {
      ...query.data,
      formattedDate: new Date(query.data.fields.publishDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      testimonial: query.data.fields.testimonial?.fields || null,
      technologies: query.data.fields.technologies || [],
      results: typeof query.data.fields.results === 'string' 
        ? [query.data.fields.results] 
        : query.data.fields.results || [],
    } : null,
  };
}