/**
 * Contentful CMS Integration for Zoptal
 * 
 * This module provides a complete integration with Contentful CMS
 * including content fetching, caching, and type-safe content models.
 */

import { createClient, Entry, Asset, ContentfulApi } from 'contentful';

// Environment configuration
const CONTENTFUL_CONFIG = {
  space: process.env.CONTENTFUL_SPACE_ID || '',
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || '',
  previewAccessToken: process.env.CONTENTFUL_PREVIEW_TOKEN || '',
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
  host: process.env.NODE_ENV === 'development' ? 'preview.contentful.com' : 'cdn.contentful.com',
};

// Create Contentful clients
const client = createClient({
  space: CONTENTFUL_CONFIG.space,
  accessToken: CONTENTFUL_CONFIG.accessToken,
  environment: CONTENTFUL_CONFIG.environment,
});

const previewClient = createClient({
  space: CONTENTFUL_CONFIG.space,
  accessToken: CONTENTFUL_CONFIG.previewAccessToken,
  environment: CONTENTFUL_CONFIG.environment,
  host: 'preview.contentful.com',
});

// Content Model Interfaces
export interface BlogPostFields {
  title: string;
  slug: string;
  excerpt: string;
  content: any; // Rich text
  featuredImage: Asset;
  author: Entry<AuthorFields>;
  category: Entry<CategoryFields>;
  tags: Entry<TagFields>[];
  publishDate: string;
  readingTime: number;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
}

export interface CaseStudyFields {
  title: string;
  slug: string;
  client: string;
  industry: string;
  description: string;
  challenge: any; // Rich text
  solution: any; // Rich text
  results: any; // Rich text
  technologies: string[];
  projectDuration: string;
  teamSize: number;
  budget: number;
  featuredImage: Asset;
  gallery: Asset[];
  testimonial: Entry<TestimonialFields>;
  publishDate: string;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface ServiceFields {
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: any; // Rich text
  icon: Asset;
  featuredImage: Asset;
  category: Entry<ServiceCategoryFields>;
  features: string[];
  benefits: string[];
  process: Entry<ProcessStepFields>[];
  technologies: string[];
  startingPrice: number;
  currency: string;
  deliveryTime: string;
  includes: string[];
  faqs: Entry<FAQFields>[];
  caseStudies: Entry<CaseStudyFields>[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  status: 'active' | 'inactive';
}

export interface TeamMemberFields {
  name: string;
  position: string;
  bio: any; // Rich text
  avatar: Asset;
  email: string;
  linkedin: string;
  github: string;
  twitter: string;
  skills: string[];
  experience: number;
  location: string;
  languages: string[];
  availability: 'available' | 'busy' | 'unavailable';
  hourlyRate: number;
  projects: Entry<CaseStudyFields>[];
  testimonials: Entry<TestimonialFields>[];
}

export interface AuthorFields {
  name: string;
  slug: string;
  bio: string;
  avatar: Asset;
  email: string;
  social: {
    twitter: string;
    linkedin: string;
    github: string;
  };
  expertise: string[];
}

export interface CategoryFields {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

export interface TagFields {
  name: string;
  slug: string;
  color: string;
}

export interface TestimonialFields {
  clientName: string;
  clientPosition: string;
  clientCompany: string;
  clientAvatar: Asset;
  content: string;
  rating: number;
  project: Entry<CaseStudyFields>;
  featured: boolean;
}

export interface ServiceCategoryFields {
  name: string;
  slug: string;
  description: string;
  icon: Asset;
  color: string;
  order: number;
}

export interface ProcessStepFields {
  title: string;
  description: string;
  duration: string;
  order: number;
  icon: string;
}

export interface FAQFields {
  question: string;
  answer: any; // Rich text
  category: string;
  order: number;
}

// Type aliases for entries
export type BlogPost = Entry<BlogPostFields>;
export type CaseStudy = Entry<CaseStudyFields>;
export type Service = Entry<ServiceFields>;
export type TeamMember = Entry<TeamMemberFields>;
export type Author = Entry<AuthorFields>;
export type Category = Entry<CategoryFields>;
export type Tag = Entry<TagFields>;
export type Testimonial = Entry<TestimonialFields>;
export type ServiceCategory = Entry<ServiceCategoryFields>;
export type ProcessStep = Entry<ProcessStepFields>;
export type FAQ = Entry<FAQFields>;

// Import the cache system
import { contentCache, CACHE_CONFIGS } from './cache';

// Content fetching utilities
export class ContentfulCMS {
  private client: ContentfulApi;

  constructor(preview = false) {
    this.client = preview ? previewClient : client;
  }

  // Generic content fetching with advanced caching
  private async fetchWithCache<T>(
    contentType: string,
    options: any = {},
    cacheKey?: string
  ): Promise<T[]> {
    const identifier = cacheKey || `list_${JSON.stringify(options)}`;
    
    return contentCache.get(
      contentType,
      identifier,
      options,
      async () => {
        const response = await this.client.getEntries({
          content_type: contentType,
          ...options,
        });
        return response.items as T[];
      }
    );
  }

  // Blog Posts
  async getBlogPosts(options: {
    limit?: number;
    skip?: number;
    featured?: boolean;
    category?: string;
    author?: string;
    tag?: string;
  } = {}): Promise<BlogPost[]> {
    const query: any = {
      limit: options.limit || 10,
      skip: options.skip || 0,
      order: '-fields.publishDate',
    };

    if (options.featured) query['fields.featured'] = true;
    if (options.category) query['fields.category.fields.slug'] = options.category;
    if (options.author) query['fields.author.fields.slug'] = options.author;
    if (options.tag) query['fields.tags.fields.slug[in]'] = options.tag;

    return this.fetchWithCache<BlogPost>('blogPost', query);
  }

  async getBlogPost(slug: string): Promise<BlogPost | null> {
    return contentCache.get(
      'blogPost',
      slug,
      { slug },
      async () => {
        const response = await this.client.getEntries({
          content_type: 'blogPost',
          'fields.slug': slug,
          limit: 1,
        });
        return response.items[0] as BlogPost || null;
      }
    );
  }

  // Case Studies
  async getCaseStudies(options: {
    limit?: number;
    skip?: number;
    featured?: boolean;
    industry?: string;
    technology?: string;
  } = {}): Promise<CaseStudy[]> {
    const query: any = {
      limit: options.limit || 10,
      skip: options.skip || 0,
      order: '-fields.publishDate',
    };

    if (options.featured) query['fields.featured'] = true;
    if (options.industry) query['fields.industry'] = options.industry;
    if (options.technology) query['fields.technologies[in]'] = options.technology;

    return this.fetchWithCache<CaseStudy>('caseStudy', query);
  }

  async getCaseStudy(slug: string): Promise<CaseStudy | null> {
    return contentCache.get(
      'caseStudy',
      slug,
      { slug },
      async () => {
        const response = await this.client.getEntries({
          content_type: 'caseStudy',
          'fields.slug': slug,
          limit: 1,
        });
        return response.items[0] as CaseStudy || null;
      }
    );
  }

  // Services
  async getServices(options: {
    limit?: number;
    featured?: boolean;
    category?: string;
    status?: 'active' | 'inactive';
  } = {}): Promise<Service[]> {
    const query: any = {
      limit: options.limit || 20,
      order: 'fields.name',
    };

    if (options.featured) query['fields.featured'] = true;
    if (options.category) query['fields.category.fields.slug'] = options.category;
    if (options.status) query['fields.status'] = options.status;

    return this.fetchWithCache<Service>('service', query);
  }

  async getService(slug: string): Promise<Service | null> {
    return contentCache.get(
      'service',
      slug,
      { slug },
      async () => {
        const response = await this.client.getEntries({
          content_type: 'service',
          'fields.slug': slug,
          limit: 1,
        });
        return response.items[0] as Service || null;
      }
    );
  }

  // Team Members
  async getTeamMembers(options: {
    limit?: number;
    availability?: 'available' | 'busy' | 'unavailable';
    skill?: string;
    location?: string;
  } = {}): Promise<TeamMember[]> {
    const query: any = {
      limit: options.limit || 20,
      order: 'fields.name',
    };

    if (options.availability) query['fields.availability'] = options.availability;
    if (options.skill) query['fields.skills[in]'] = options.skill;
    if (options.location) query['fields.location'] = options.location;

    return this.fetchWithCache<TeamMember>('teamMember', query);
  }

  // Testimonials
  async getTestimonials(options: {
    limit?: number;
    featured?: boolean;
    minRating?: number;
  } = {}): Promise<Testimonial[]> {
    const query: any = {
      limit: options.limit || 10,
      order: '-fields.rating',
    };

    if (options.featured) query['fields.featured'] = true;
    if (options.minRating) query['fields.rating[gte]'] = options.minRating;

    return this.fetchWithCache<Testimonial>('testimonial', query);
  }

  // Categories and Tags
  async getCategories(): Promise<Category[]> {
    return this.fetchWithCache<Category>('category', { order: 'fields.name' });
  }

  async getTags(): Promise<Tag[]> {
    return this.fetchWithCache<Tag>('tag', { order: 'fields.name' });
  }

  // Service Categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return this.fetchWithCache<ServiceCategory>('serviceCategory', { order: 'fields.order' });
  }

  // Clear cache
  clearCache(): void {
    contentCache.clear();
  }

  // Invalidate specific content types
  invalidateContentType(contentType: string): void {
    const config = CACHE_CONFIGS[contentType];
    if (config) {
      contentCache.invalidateByTags(config.tags);
    }
  }

  // Search functionality
  async searchContent(query: string, contentTypes: string[] = ['blogPost', 'caseStudy', 'service']): Promise<{
    blogPosts: BlogPost[];
    caseStudies: CaseStudy[];
    services: Service[];
  }> {
    const results = await Promise.all(
      contentTypes.map(async (contentType) => {
        try {
          const response = await this.client.getEntries({
            content_type: contentType,
            query,
            limit: 5,
          });
          return { contentType, items: response.items };
        } catch (error) {
          console.error(`Error searching ${contentType}:`, error);
          return { contentType, items: [] };
        }
      })
    );

    return {
      blogPosts: results.find(r => r.contentType === 'blogPost')?.items as BlogPost[] || [],
      caseStudies: results.find(r => r.contentType === 'caseStudy')?.items as CaseStudy[] || [],
      services: results.find(r => r.contentType === 'service')?.items as Service[] || [],
    };
  }
}

// Global CMS instance
export const cms = new ContentfulCMS(process.env.NODE_ENV === 'development');
export const previewCms = new ContentfulCMS(true);

// Utility functions
export function getAssetUrl(asset: Asset | undefined, transform?: {
  width?: number;
  height?: number;
  format?: 'jpg' | 'png' | 'webp';
  quality?: number;
}): string {
  if (!asset?.fields?.file?.url) return '';
  
  let url = `https:${asset.fields.file.url}`;
  
  if (transform) {
    const params = new URLSearchParams();
    if (transform.width) params.append('w', transform.width.toString());
    if (transform.height) params.append('h', transform.height.toString());
    if (transform.format) params.append('fm', transform.format);
    if (transform.quality) params.append('q', transform.quality.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  return url;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function calculateReadingTime(content: any): number {
  if (!content) return 0;
  
  // Extract text from rich text content
  const extractText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (node.nodeType === 'text') return node.value;
    if (node.content) {
      return node.content.map(extractText).join(' ');
    }
    return '';
  };
  
  const text = extractText(content);
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  
  return Math.ceil(wordCount / wordsPerMinute);
}

// Content validation
export function validateContentModel(entry: Entry<any>, requiredFields: string[]): boolean {
  if (!entry.fields) return false;
  
  return requiredFields.every(field => {
    const value = entry.fields[field];
    return value !== undefined && value !== null && value !== '';
  });
}

// Export types for use in components
export type * from 'contentful';