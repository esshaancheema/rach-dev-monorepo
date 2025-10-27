import { type Entry, type Asset } from 'contentful';
import { getAssetUrl, formatDate, calculateReadingTime } from './contentful';

// Enhanced utility functions for working with Contentful data

// Rich text content processing
export function extractTextFromRichText(richText: any): string {
  if (!richText || !richText.content) return '';
  
  const extractText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (node.nodeType === 'text') return node.value || '';
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join(' ');
    }
    return '';
  };
  
  return extractText(richText).trim();
}

export function generateExcerpt(richText: any, maxLength: number = 160): string {
  const text = extractTextFromRichText(richText);
  if (text.length <= maxLength) return text;
  
  // Find the last complete sentence within the limit
  const truncated = text.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSentence > maxLength * 0.7) {
    return text.substring(0, lastSentence + 1);
  } else if (lastSpace > 0) {
    return text.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

// Image optimization helpers
export interface ImageTransform {
  width?: number;
  height?: number;
  format?: 'jpg' | 'png' | 'webp';
  quality?: number;
  fit?: 'pad' | 'fill' | 'scale' | 'crop' | 'thumb';
  focus?: 'center' | 'top' | 'right' | 'left' | 'bottom' | 'top_right' | 'top_left' | 'bottom_right' | 'bottom_left' | 'face' | 'faces';
}

export function getOptimizedImageUrl(
  asset: Asset | undefined,
  transform: ImageTransform = {}
): string {
  if (!asset?.fields?.file?.url) return '';
  
  let url = `https:${asset.fields.file.url}`;
  const params = new URLSearchParams();
  
  if (transform.width) params.append('w', transform.width.toString());
  if (transform.height) params.append('h', transform.height.toString());
  if (transform.format) params.append('fm', transform.format);
  if (transform.quality) params.append('q', transform.quality.toString());
  if (transform.fit) params.append('fit', transform.fit);
  if (transform.focus) params.append('f', transform.focus);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  return url;
}

export function generateImageSrcSet(
  asset: Asset | undefined,
  sizes: number[] = [320, 640, 768, 1024, 1280],
  format: 'jpg' | 'png' | 'webp' = 'webp'
): string {
  if (!asset?.fields?.file?.url) return '';
  
  return sizes
    .map(size => `${getOptimizedImageUrl(asset, { width: size, format })} ${size}w`)
    .join(', ');
}

// SEO helpers
export function generateMetaTitle(title: string, suffix: string = 'Zoptal'): string {
  const maxLength = 60;
  const fullTitle = `${title} | ${suffix}`;
  
  if (fullTitle.length <= maxLength) return fullTitle;
  
  // Truncate the main title to fit
  const availableLength = maxLength - suffix.length - 3; // 3 for " | "
  const truncatedTitle = title.length > availableLength 
    ? title.substring(0, availableLength - 3) + '...'
    : title;
    
  return `${truncatedTitle} | ${suffix}`;
}

export function generateMetaDescription(
  description: string,
  maxLength: number = 160
): string {
  if (description.length <= maxLength) return description;
  
  const truncated = description.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

// Content validation
export function validateRequiredFields<T>(
  entry: Entry<T>,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  requiredFields.forEach(field => {
    const value = entry.fields[field];
    if (value === undefined || value === null || value === '') {
      missingFields.push(String(field));
    }
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

// Content sorting and filtering
export function sortContentByDate<T extends { fields: { publishDate?: string } }>(
  content: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...content].sort((a, b) => {
    const dateA = new Date(a.fields.publishDate || 0);
    const dateB = new Date(b.fields.publishDate || 0);
    return order === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });
}

export function filterContentByCategory<T extends { fields: { category?: Entry<any> } }>(
  content: T[],
  categorySlug: string
): T[] {
  return content.filter(item => 
    item.fields.category?.fields?.slug === categorySlug
  );
}

export function filterContentByTag<T extends { fields: { tags?: Entry<any>[] } }>(
  content: T[],
  tagSlug: string
): T[] {
  return content.filter(item =>
    item.fields.tags?.some(tag => tag.fields?.slug === tagSlug)
  );
}

// Pagination helpers
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
  itemsPerPage: number;
}

export function calculatePagination(
  totalItems: number,
  currentPage: number,
  itemsPerPage: number
): PaginationInfo {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return {
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    totalItems,
    itemsPerPage,
  };
}

export function paginateContent<T>(
  content: T[],
  page: number,
  itemsPerPage: number
): { items: T[]; pagination: PaginationInfo } {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const items = content.slice(startIndex, endIndex);
  
  return {
    items,
    pagination: calculatePagination(content.length, page, itemsPerPage),
  };
}

// Related content helpers
export function findRelatedContent<T extends { fields: { tags?: Entry<any>[]; category?: Entry<any> } }>(
  currentItem: T,
  allContent: T[],
  limit: number = 3
): T[] {
  const currentTags = currentItem.fields.tags?.map(tag => tag.fields?.slug) || [];
  const currentCategory = currentItem.fields.category?.fields?.slug;
  
  // Score items based on shared tags and category
  const scoredContent = allContent
    .filter(item => item.sys.id !== currentItem.sys.id) // Exclude current item
    .map(item => {
      let score = 0;
      
      // Add points for shared category
      if (currentCategory && item.fields.category?.fields?.slug === currentCategory) {
        score += 3;
      }
      
      // Add points for shared tags
      const itemTags = item.fields.tags?.map(tag => tag.fields?.slug) || [];
      const sharedTags = currentTags.filter(tag => itemTags.includes(tag));
      score += sharedTags.length;
      
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
  
  return scoredContent;
}

// Content statistics
export function calculateContentStats<T extends { fields: { publishDate?: string } }>(
  content: T[]
): {
  total: number;
  thisMonth: number;
  thisYear: number;
  averagePerMonth: number;
} {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  let thisMonth = 0;
  let thisYear = 0;
  const monthCounts: Record<string, number> = {};
  
  content.forEach(item => {
    if (!item.fields.publishDate) return;
    
    const publishDate = new Date(item.fields.publishDate);
    const publishYear = publishDate.getFullYear();
    const publishMonth = publishDate.getMonth();
    const monthKey = `${publishYear}-${publishMonth}`;
    
    if (publishYear === currentYear) {
      thisYear++;
      if (publishMonth === currentMonth) {
        thisMonth++;
      }
    }
    
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
  });
  
  const totalMonths = Object.keys(monthCounts).length;
  const averagePerMonth = totalMonths > 0 ? content.length / totalMonths : 0;
  
  return {
    total: content.length,
    thisMonth,
    thisYear,
    averagePerMonth: Math.round(averagePerMonth * 10) / 10,
  };
}

// URL helpers
export function generateContentUrl(
  type: 'blog' | 'case-study' | 'service',
  slug: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com';
  const paths = {
    blog: '/blog',
    'case-study': '/case-studies',
    service: '/services',
  };
  
  return `${baseUrl}${paths[type]}/${slug}`;
}

export function generateContentShareUrls(
  title: string,
  url: string,
  description?: string
): {
  twitter: string;
  facebook: string;
  linkedin: string;
  email: string;
} {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const encodedDescription = encodeURIComponent(description || title);
  
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };
}

// Content transformation helpers
export function transformBlogPost(post: Entry<any>) {
  return {
    ...post,
    fields: {
      ...post.fields,
      readingTime: post.fields.readingTime || calculateReadingTime(post.fields.content),
      excerpt: post.fields.excerpt || generateExcerpt(post.fields.content),
      formattedDate: formatDate(post.fields.publishDate),
      featuredImageUrl: getOptimizedImageUrl(post.fields.featuredImage, {
        width: 1200,
        height: 630,
        format: 'webp',
        quality: 85,
      }),
      authorName: post.fields.author?.fields?.name || 'Zoptal Team',
      categoryName: post.fields.category?.fields?.name || 'General',
      tagNames: post.fields.tags?.map((tag: any) => tag.fields?.name) || [],
    },
  };
}

export function transformCaseStudy(caseStudy: Entry<any>) {
  return {
    ...caseStudy,
    fields: {
      ...caseStudy.fields,
      formattedDate: formatDate(caseStudy.fields.publishDate),
      featuredImageUrl: getOptimizedImageUrl(caseStudy.fields.featuredImage, {
        width: 1200,
        height: 630,
        format: 'webp',
        quality: 85,
      }),
      galleryUrls: caseStudy.fields.gallery?.map((asset: Asset) =>
        getOptimizedImageUrl(asset, {
          width: 800,
          height: 600,
          format: 'webp',
          quality: 90,
        })
      ) || [],
      clientTestimonial: caseStudy.fields.testimonial?.fields || null,
      technologiesUsed: caseStudy.fields.technologies || [],
    },
  };
}

export function transformService(service: Entry<any>) {
  return {
    ...service,
    fields: {
      ...service.fields,
      iconUrl: getOptimizedImageUrl(service.fields.icon, {
        width: 64,
        height: 64,
        format: 'png',
        quality: 95,
      }),
      featuredImageUrl: getOptimizedImageUrl(service.fields.featuredImage, {
        width: 800,
        height: 600,
        format: 'webp',
        quality: 85,
      }),
      categoryName: service.fields.category?.fields?.name || 'General',
      processSteps: service.fields.process?.map((step: any) => step.fields) || [],
      faqList: service.fields.faqs?.map((faq: any) => faq.fields) || [],
      relatedCaseStudies: service.fields.caseStudies?.map((cs: any) => transformCaseStudy(cs)) || [],
    },
  };
}