/**
 * Properly typed CMS interfaces to fix the type system breakdown
 */

import { Entry, Asset } from 'contentful';
import { 
  BlogPostFields, 
  CaseStudyFields, 
  ServiceFields, 
  AuthorFields, 
  CategoryFields, 
  TagFields 
} from './contentful';

// Enhanced transformed types with proper field definitions
export interface TransformedBlogPostFields extends BlogPostFields {
  // Computed fields added by transformation
  readingTime: number;
  excerpt: string;
  formattedDate: string;
  featuredImageUrl: string;
  authorName: string;
  categoryName: string;
  tagNames: string[];
  publishDate: string;
}

export interface TransformedBlogPost extends Entry<TransformedBlogPostFields> {}

export interface TransformedCaseStudyFields extends CaseStudyFields {
  formattedDate: string;
  featuredImageUrl: string;
  galleryUrls: string[];
  clientTestimonial: any;
  technologiesUsed: string[];
}

export interface TransformedCaseStudy extends Entry<TransformedCaseStudyFields> {}

export interface TransformedServiceFields extends ServiceFields {
  iconUrl: string;
  featuredImageUrl: string;
  categoryName: string;
  processSteps: any[];
  faqList: any[];
  relatedCaseStudies: TransformedCaseStudy[];
}

export interface TransformedService extends Entry<TransformedServiceFields> {}