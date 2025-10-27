/**
 * Contentful API integration
 * This module provides functions to fetch content from Contentful CMS
 */

import { createClient, Entry } from 'contentful';

// Initialize Contentful client
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || 'demo_space_id',
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || 'demo_access_token',
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
});

// Content type definitions
export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: any;
  author: Author;
  publishedAt: string;
  featuredImage?: Asset;
  tags?: string[];
  category?: string;
  readingTime?: number;
}

export interface Author {
  name: string;
  bio?: string;
  avatar?: Asset;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface Asset {
  url: string;
  title: string;
  description?: string;
  width?: number;
  height?: number;
}

export interface CaseStudy {
  title: string;
  slug: string;
  client: string;
  industry: string;
  summary: string;
  challenge: any;
  solution: any;
  results: any;
  technologies: string[];
  featuredImage?: Asset;
  logo?: Asset;
  publishedAt: string;
}

export interface Service {
  title: string;
  slug: string;
  description: string;
  features: string[];
  benefits: string[];
  icon?: string;
  image?: Asset;
  order?: number;
}

// Helper function to transform Contentful entries
function transformAsset(asset: any): Asset | undefined {
  if (!asset?.fields?.file) return undefined;
  
  return {
    url: `https:${asset.fields.file.url}`,
    title: asset.fields.title || '',
    description: asset.fields.description,
    width: asset.fields.file.details?.image?.width,
    height: asset.fields.file.details?.image?.height,
  };
}

// Blog post functions
export async function getBlogPosts(limit = 10, skip = 0): Promise<BlogPost[]> {
  try {
    const entries = await client.getEntries({
      content_type: 'blogPost',
      limit,
      skip,
      order: '-fields.publishedAt',
    });

    return entries.items.map((entry: any) => ({
      title: entry.fields.title,
      slug: entry.fields.slug,
      excerpt: entry.fields.excerpt,
      content: entry.fields.content,
      author: entry.fields.author?.fields,
      publishedAt: entry.fields.publishedAt,
      featuredImage: transformAsset(entry.fields.featuredImage),
      tags: entry.fields.tags,
      category: entry.fields.category,
      readingTime: entry.fields.readingTime,
    }));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const entries = await client.getEntries({
      content_type: 'blogPost',
      'fields.slug': slug,
      limit: 1,
    });

    if (entries.items.length === 0) return null;

    const entry = entries.items[0] as any;
    return {
      title: entry.fields.title,
      slug: entry.fields.slug,
      excerpt: entry.fields.excerpt,
      content: entry.fields.content,
      author: entry.fields.author?.fields,
      publishedAt: entry.fields.publishedAt,
      featuredImage: transformAsset(entry.fields.featuredImage),
      tags: entry.fields.tags,
      category: entry.fields.category,
      readingTime: entry.fields.readingTime,
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Case study functions
export async function getCaseStudies(limit = 10, skip = 0): Promise<CaseStudy[]> {
  try {
    const entries = await client.getEntries({
      content_type: 'caseStudy',
      limit,
      skip,
      order: '-fields.publishedAt',
    });

    return entries.items.map((entry: any) => ({
      title: entry.fields.title,
      slug: entry.fields.slug,
      client: entry.fields.client,
      industry: entry.fields.industry,
      summary: entry.fields.summary,
      challenge: entry.fields.challenge,
      solution: entry.fields.solution,
      results: entry.fields.results,
      technologies: entry.fields.technologies || [],
      featuredImage: transformAsset(entry.fields.featuredImage),
      logo: transformAsset(entry.fields.logo),
      publishedAt: entry.fields.publishedAt,
    }));
  } catch (error) {
    console.error('Error fetching case studies:', error);
    return [];
  }
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  try {
    const entries = await client.getEntries({
      content_type: 'caseStudy',
      'fields.slug': slug,
      limit: 1,
    });

    if (entries.items.length === 0) return null;

    const entry = entries.items[0] as any;
    return {
      title: entry.fields.title,
      slug: entry.fields.slug,
      client: entry.fields.client,
      industry: entry.fields.industry,
      summary: entry.fields.summary,
      challenge: entry.fields.challenge,
      solution: entry.fields.solution,
      results: entry.fields.results,
      technologies: entry.fields.technologies || [],
      featuredImage: transformAsset(entry.fields.featuredImage),
      logo: transformAsset(entry.fields.logo),
      publishedAt: entry.fields.publishedAt,
    };
  } catch (error) {
    console.error('Error fetching case study:', error);
    return null;
  }
}

// Service functions
export async function getServices(): Promise<Service[]> {
  try {
    const entries = await client.getEntries({
      content_type: 'service',
      order: 'fields.order',
    });

    return entries.items.map((entry: any) => ({
      title: entry.fields.title,
      slug: entry.fields.slug,
      description: entry.fields.description,
      features: entry.fields.features || [],
      benefits: entry.fields.benefits || [],
      icon: entry.fields.icon,
      image: transformAsset(entry.fields.image),
      order: entry.fields.order,
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function getService(slug: string): Promise<Service | null> {
  try {
    const entries = await client.getEntries({
      content_type: 'service',
      'fields.slug': slug,
      limit: 1,
    });

    if (entries.items.length === 0) return null;

    const entry = entries.items[0] as any;
    return {
      title: entry.fields.title,
      slug: entry.fields.slug,
      description: entry.fields.description,
      features: entry.fields.features || [],
      benefits: entry.fields.benefits || [],
      icon: entry.fields.icon,
      image: transformAsset(entry.fields.image),
      order: entry.fields.order,
    };
  } catch (error) {
    console.error('Error fetching service:', error);
    return null;
  }
}

// Related content functions
export async function getRelatedPosts(slug: string, limit = 3): Promise<BlogPost[]> {
  try {
    // First get the current post to find its tags/category
    const currentPost = await getBlogPost(slug);
    if (!currentPost) return [];

    // Find posts with similar tags or category
    const entries = await client.getEntries({
      content_type: 'blogPost',
      'fields.slug[ne]': slug,
      'fields.category': currentPost.category,
      limit,
      order: '-fields.publishedAt',
    });

    return entries.items.map((entry: any) => ({
      title: entry.fields.title,
      slug: entry.fields.slug,
      excerpt: entry.fields.excerpt,
      content: entry.fields.content,
      author: entry.fields.author?.fields,
      publishedAt: entry.fields.publishedAt,
      featuredImage: transformAsset(entry.fields.featuredImage),
      tags: entry.fields.tags,
      category: entry.fields.category,
      readingTime: entry.fields.readingTime,
    }));
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

// Search function
export async function searchContent(query: string, contentType?: string): Promise<any[]> {
  try {
    const searchParams: any = {
      query,
      limit: 20,
    };

    if (contentType) {
      searchParams.content_type = contentType;
    }

    const entries = await client.getEntries(searchParams);
    return entries.items;
  } catch (error) {
    console.error('Error searching content:', error);
    return [];
  }
}

// Preview API for draft content
export async function getPreviewPost(id: string): Promise<BlogPost | null> {
  try {
    const previewClient = createClient({
      space: process.env.CONTENTFUL_SPACE_ID || 'demo_space_id',
      accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN || 'demo_preview_token',
      host: 'preview.contentful.com',
    });

    const entry = await previewClient.getEntry(id);
    const fields = entry.fields as any;

    return {
      title: fields.title,
      slug: fields.slug,
      excerpt: fields.excerpt,
      content: fields.content,
      author: fields.author?.fields,
      publishedAt: fields.publishedAt,
      featuredImage: transformAsset(fields.featuredImage),
      tags: fields.tags,
      category: fields.category,
      readingTime: fields.readingTime,
    };
  } catch (error) {
    console.error('Error fetching preview post:', error);
    return null;
  }
}