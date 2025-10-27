// Advanced Content Management System for Zoptal Platform
import { analytics } from '@/lib/analytics/tracker';

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  type: 'blog' | 'case-study' | 'page' | 'portfolio' | 'documentation';
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  categories: string[];
  tags: string[];
  featuredImage?: string;
  images: string[];
  seoData: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl?: string;
    noIndex?: boolean;
    socialImage?: string;
  };
  publishedAt?: string;
  scheduledAt?: string;
  updatedAt: string;
  createdAt: string;
  viewCount: number;
  readingTime: number;
  version: number;
  customFields: Record<string, any>;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  content: string;
  title: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  changeLog: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  type: ContentItem['type'];
  description: string;
  fields: ContentField[];
  defaultContent: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'richtext' | 'image' | 'gallery' | 'select' | 'multiselect' | 'date' | 'boolean' | 'number' | 'url';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface ContentFilter {
  type?: ContentItem['type'];
  status?: ContentItem['status'];
  author?: string;
  category?: string;
  tag?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ContentStats {
  totalItems: number;
  publishedItems: number;
  draftItems: number;
  scheduledItems: number;
  totalViews: number;
  averageReadingTime: number;
  popularCategories: Array<{
    name: string;
    count: number;
  }>;
  popularTags: Array<{
    name: string;
    count: number;
  }>;
  topAuthors: Array<{
    id: string;
    name: string;
    itemCount: number;
  }>;
}

export class ContentManager {
  private static instance: ContentManager;
  private contentItems: Map<string, ContentItem> = new Map();
  private contentVersions: Map<string, ContentVersion[]> = new Map();
  private templates: Map<string, ContentTemplate> = new Map();
  private categories: Set<string> = new Set();
  private tags: Set<string> = new Set();

  static getInstance(): ContentManager {
    if (!ContentManager.instance) {
      ContentManager.instance = new ContentManager();
    }
    return ContentManager.instance;
  }

  private constructor() {
    this.initializeDefaultTemplates();
    this.initializeSampleContent();
  }

  /**
   * Create new content item
   */
  async createContent(data: Partial<ContentItem>): Promise<ContentItem> {
    const id = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const slug = this.generateSlug(data.title || 'untitled');
    
    const contentItem: ContentItem = {
      id,
      title: data.title || 'Untitled',
      slug,
      content: data.content || '',
      excerpt: data.excerpt || this.generateExcerpt(data.content || ''),
      type: data.type || 'blog',
      status: data.status || 'draft',
      author: data.author || {
        id: 'system',
        name: 'System',
        email: 'system@zoptal.com'
      },
      categories: data.categories || [],
      tags: data.tags || [],
      featuredImage: data.featuredImage,
      images: data.images || [],
      seoData: {
        metaTitle: data.seoData?.metaTitle || data.title || 'Untitled',
        metaDescription: data.seoData?.metaDescription || this.generateExcerpt(data.content || ''),
        keywords: data.seoData?.keywords || [],
        canonicalUrl: data.seoData?.canonicalUrl,
        noIndex: data.seoData?.noIndex || false,
        socialImage: data.seoData?.socialImage || data.featuredImage
      },
      publishedAt: data.status === 'published' ? new Date().toISOString() : undefined,
      scheduledAt: data.scheduledAt,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      viewCount: 0,
      readingTime: this.calculateReadingTime(data.content || ''),
      version: 1,
      customFields: data.customFields || {}
    };

    this.contentItems.set(id, contentItem);
    
    // Update categories and tags
    contentItem.categories.forEach(cat => this.categories.add(cat));
    contentItem.tags.forEach(tag => this.tags.add(tag));

    // Create initial version
    await this.createVersion(id, contentItem.content, contentItem.title, contentItem.author, 'Initial version');

    analytics.track({
      name: 'content_created',
      category: 'cms',
      properties: {
        content_id: id,
        type: contentItem.type,
        status: contentItem.status,
        author_id: contentItem.author.id
      }
    });

    return contentItem;
  }

  /**
   * Update existing content item
   */
  async updateContent(id: string, updates: Partial<ContentItem>, changeLog?: string): Promise<ContentItem | null> {
    const existingItem = this.contentItems.get(id);
    if (!existingItem) {
      return null;
    }

    const updatedItem: ContentItem = {
      ...existingItem,
      ...updates,
      id: existingItem.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
      version: existingItem.version + 1,
      readingTime: updates.content ? this.calculateReadingTime(updates.content) : existingItem.readingTime,
      excerpt: updates.excerpt || (updates.content ? this.generateExcerpt(updates.content) : existingItem.excerpt)
    };

    // Update slug if title changed
    if (updates.title && updates.title !== existingItem.title) {
      updatedItem.slug = this.generateSlug(updates.title);
    }

    // Update publish date if status changed to published
    if (updates.status === 'published' && existingItem.status !== 'published') {
      updatedItem.publishedAt = new Date().toISOString();
    }

    this.contentItems.set(id, updatedItem);

    // Update categories and tags
    if (updates.categories) {
      updates.categories.forEach(cat => this.categories.add(cat));
    }
    if (updates.tags) {
      updates.tags.forEach(tag => this.tags.add(tag));
    }

    // Create version if content changed
    if (updates.content && updates.content !== existingItem.content) {
      await this.createVersion(
        id, 
        updates.content, 
        updatedItem.title, 
        updatedItem.author, 
        changeLog || 'Content updated'
      );
    }

    analytics.track({
      name: 'content_updated',
      category: 'cms',
      properties: {
        content_id: id,
        type: updatedItem.type,
        status: updatedItem.status,
        version: updatedItem.version
      }
    });

    return updatedItem;
  }

  /**
   * Get content item by ID
   */
  getContent(id: string): ContentItem | null {
    return this.contentItems.get(id) || null;
  }

  /**
   * Get content item by slug
   */
  getContentBySlug(slug: string): ContentItem | null {
    for (const item of this.contentItems.values()) {
      if (item.slug === slug) {
        return item;
      }
    }
    return null;
  }

  /**
   * Get all content items with optional filtering
   */
  getAllContent(filter?: ContentFilter): ContentItem[] {
    let items = Array.from(this.contentItems.values());

    if (filter) {
      if (filter.type) {
        items = items.filter(item => item.type === filter.type);
      }
      if (filter.status) {
        items = items.filter(item => item.status === filter.status);
      }
      if (filter.author) {
        items = items.filter(item => item.author.id === filter.author);
      }
      if (filter.category) {
        items = items.filter(item => item.categories.includes(filter.category!));
      }
      if (filter.tag) {
        items = items.filter(item => item.tags.includes(filter.tag!));
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        items = items.filter(item => 
          item.title.toLowerCase().includes(searchLower) ||
          item.content.toLowerCase().includes(searchLower) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      if (filter.dateRange) {
        const start = new Date(filter.dateRange.start);
        const end = new Date(filter.dateRange.end);
        items = items.filter(item => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= start && itemDate <= end;
        });
      }
    }

    return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Delete content item
   */
  async deleteContent(id: string): Promise<boolean> {
    const item = this.contentItems.get(id);
    if (!item) {
      return false;
    }

    this.contentItems.delete(id);
    this.contentVersions.delete(id);

    analytics.track({
      name: 'content_deleted',
      category: 'cms',
      properties: {
        content_id: id,
        type: item.type,
        status: item.status
      }
    });

    return true;
  }

  /**
   * Bulk operations
   */
  async bulkUpdateStatus(ids: string[], status: ContentItem['status']): Promise<number> {
    let updated = 0;
    
    for (const id of ids) {
      const result = await this.updateContent(id, { status });
      if (result) updated++;
    }

    analytics.track({
      name: 'content_bulk_status_update',
      category: 'cms',
      properties: {
        count: updated,
        new_status: status
      }
    });

    return updated;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    let deleted = 0;
    
    for (const id of ids) {
      const result = await this.deleteContent(id);
      if (result) deleted++;
    }

    analytics.track({
      name: 'content_bulk_delete',
      category: 'cms',
      properties: {
        count: deleted
      }
    });

    return deleted;
  }

  /**
   * Version management
   */
  private async createVersion(
    contentId: string, 
    content: string, 
    title: string, 
    author: ContentItem['author'], 
    changeLog: string
  ): Promise<void> {
    const versions = this.contentVersions.get(contentId) || [];
    const version: ContentVersion = {
      id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId,
      version: versions.length + 1,
      content,
      title,
      author,
      createdAt: new Date().toISOString(),
      changeLog
    };

    versions.push(version);
    
    // Keep only last 10 versions
    if (versions.length > 10) {
      versions.shift();
    }

    this.contentVersions.set(contentId, versions);
  }

  getContentVersions(contentId: string): ContentVersion[] {
    return this.contentVersions.get(contentId) || [];
  }

  async restoreVersion(contentId: string, versionId: string): Promise<ContentItem | null> {
    const versions = this.contentVersions.get(contentId) || [];
    const version = versions.find(v => v.id === versionId);
    
    if (!version) {
      return null;
    }

    return await this.updateContent(contentId, {
      content: version.content,
      title: version.title
    }, `Restored from version ${version.version}`);
  }

  /**
   * Template management
   */
  createTemplate(data: Omit<ContentTemplate, 'id' | 'createdAt' | 'updatedAt'>): ContentTemplate {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const template: ContentTemplate = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.templates.set(id, template);

    analytics.track({
      name: 'content_template_created',
      category: 'cms',
      properties: {
        template_id: id,
        type: template.type,
        field_count: template.fields.length
      }
    });

    return template;
  }

  getTemplate(id: string): ContentTemplate | null {
    return this.templates.get(id) || null;
  }

  getAllTemplates(): ContentTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByType(type: ContentItem['type']): ContentTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.type === type);
  }

  /**
   * Statistics and analytics
   */
  getContentStats(): ContentStats {
    const items = Array.from(this.contentItems.values());
    
    const stats: ContentStats = {
      totalItems: items.length,
      publishedItems: items.filter(item => item.status === 'published').length,
      draftItems: items.filter(item => item.status === 'draft').length,
      scheduledItems: items.filter(item => item.status === 'scheduled').length,
      totalViews: items.reduce((sum, item) => sum + item.viewCount, 0),
      averageReadingTime: items.length > 0 ? items.reduce((sum, item) => sum + item.readingTime, 0) / items.length : 0,
      popularCategories: this.getPopularCategories(items),
      popularTags: this.getPopularTags(items),
      topAuthors: this.getTopAuthors(items)
    };

    return stats;
  }

  /**
   * Search and discovery
   */
  async searchContent(query: string, options?: {
    type?: ContentItem['type'];
    limit?: number;
    includeDrafts?: boolean;
  }): Promise<ContentItem[]> {
    const searchLower = query.toLowerCase();
    let items = Array.from(this.contentItems.values());

    // Filter by type if specified
    if (options?.type) {
      items = items.filter(item => item.type === options.type);
    }

    // Filter out drafts unless explicitly included
    if (!options?.includeDrafts) {
      items = items.filter(item => item.status === 'published');
    }

    // Search in title, content, tags, and categories
    const searchResults = items.filter(item => {
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.content.toLowerCase().includes(searchLower) ||
        item.excerpt.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        item.categories.some(cat => cat.toLowerCase().includes(searchLower))
      );
    });

    // Sort by relevance (title matches first, then content matches)
    searchResults.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(searchLower) ? 1 : 0;
      const bTitle = b.title.toLowerCase().includes(searchLower) ? 1 : 0;
      if (aTitle !== bTitle) return bTitle - aTitle;
      
      return new Date(b.publishedAt || b.updatedAt).getTime() - new Date(a.publishedAt || a.updatedAt).getTime();
    });

    const results = options?.limit ? searchResults.slice(0, options.limit) : searchResults;

    analytics.track({
      name: 'content_searched',
      category: 'cms',
      properties: {
        query,
        results_count: results.length,
        type: options?.type
      }
    });

    return results;
  }

  getRelatedContent(contentId: string, limit: number = 5): ContentItem[] {
    const content = this.getContent(contentId);
    if (!content) return [];

    const allItems = this.getAllContent({ status: 'published' })
      .filter(item => item.id !== contentId);

    // Score items based on shared tags, categories, and type
    const scoredItems = allItems.map(item => {
      let score = 0;
      
      // Same type bonus
      if (item.type === content.type) score += 3;
      
      // Shared categories
      const sharedCategories = item.categories.filter(cat => content.categories.includes(cat));
      score += sharedCategories.length * 2;
      
      // Shared tags
      const sharedTags = item.tags.filter(tag => content.tags.includes(tag));
      score += sharedTags.length;

      return { item, score };
    });

    return scoredItems
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ item }) => item);
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    const item = this.contentItems.get(id);
    if (item) {
      item.viewCount++;
      this.contentItems.set(id, item);

      analytics.track({
        name: 'content_viewed',
        category: 'cms',
        properties: {
          content_id: id,
          type: item.type,
          view_count: item.viewCount
        }
      });
    }
  }

  /**
   * Get categories and tags
   */
  getAllCategories(): string[] {
    return Array.from(this.categories).sort();
  }

  getAllTags(): string[] {
    return Array.from(this.tags).sort();
  }

  /**
   * Scheduled content management
   */
  async publishScheduledContent(): Promise<number> {
    const now = new Date();
    const scheduledItems = this.getAllContent({ status: 'scheduled' })
      .filter(item => item.scheduledAt && new Date(item.scheduledAt) <= now);

    let published = 0;
    for (const item of scheduledItems) {
      await this.updateContent(item.id, { 
        status: 'published',
        publishedAt: now.toISOString(),
        scheduledAt: undefined
      });
      published++;
    }

    if (published > 0) {
      analytics.track({
        name: 'scheduled_content_published',
        category: 'cms',
        properties: {
          count: published
        }
      });
    }

    return published;
  }

  /**
   * Private helper methods
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }

  private generateExcerpt(content: string, maxLength: number = 160): string {
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    
    if (plainText.length <= maxLength) {
      return plainText;
    }

    // Find the last complete word within the limit
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  private getPopularCategories(items: ContentItem[]): Array<{ name: string; count: number }> {
    const categoryCount = new Map<string, number>();
    
    items.forEach(item => {
      item.categories.forEach(category => {
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
      });
    });

    return Array.from(categoryCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getPopularTags(items: ContentItem[]): Array<{ name: string; count: number }> {
    const tagCount = new Map<string, number>();
    
    items.forEach(item => {
      item.tags.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  private getTopAuthors(items: ContentItem[]): Array<{ id: string; name: string; itemCount: number }> {
    const authorCount = new Map<string, { name: string; count: number }>();
    
    items.forEach(item => {
      const authorData = authorCount.get(item.author.id) || { name: item.author.name, count: 0 };
      authorData.count++;
      authorCount.set(item.author.id, authorData);
    });

    return Array.from(authorCount.entries())
      .map(([id, data]) => ({ id, name: data.name, itemCount: data.count }))
      .sort((a, b) => b.itemCount - a.itemCount)
      .slice(0, 10);
  }

  private initializeDefaultTemplates(): void {
    // Blog Post Template
    this.createTemplate({
      name: 'Blog Post',
      type: 'blog',
      description: 'Standard blog post template with featured image and categories',
      isActive: true,
      fields: [
        { id: 'title', name: 'title', label: 'Title', type: 'text', required: true },
        { id: 'excerpt', name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true },
        { id: 'content', name: 'content', label: 'Content', type: 'richtext', required: true },
        { id: 'featured_image', name: 'featuredImage', label: 'Featured Image', type: 'image', required: false },
        { id: 'categories', name: 'categories', label: 'Categories', type: 'multiselect', required: false, options: ['Technology', 'Business', 'Design', 'Development'] },
        { id: 'tags', name: 'tags', label: 'Tags', type: 'multiselect', required: false }
      ],
      defaultContent: '<h2>Introduction</h2>\n<p>Start writing your blog post here...</p>\n\n<h2>Main Content</h2>\n<p>Add your main content here...</p>\n\n<h2>Conclusion</h2>\n<p>Wrap up your thoughts...</p>'
    });

    // Case Study Template
    this.createTemplate({
      name: 'Case Study',
      type: 'case-study',
      description: 'Detailed case study template with client information and results',
      isActive: true,
      fields: [
        { id: 'title', name: 'title', label: 'Project Title', type: 'text', required: true },
        { id: 'client_name', name: 'clientName', label: 'Client Name', type: 'text', required: true },
        { id: 'project_duration', name: 'projectDuration', label: 'Project Duration', type: 'text', required: false },
        { id: 'technologies', name: 'technologies', label: 'Technologies Used', type: 'multiselect', required: false },
        { id: 'challenge', name: 'challenge', label: 'Challenge', type: 'richtext', required: true },
        { id: 'solution', name: 'solution', label: 'Solution', type: 'richtext', required: true },
        { id: 'results', name: 'results', label: 'Results', type: 'richtext', required: true },
        { id: 'featured_image', name: 'featuredImage', label: 'Featured Image', type: 'image', required: false },
        { id: 'gallery', name: 'images', label: 'Project Gallery', type: 'gallery', required: false }
      ],
      defaultContent: '<h2>Challenge</h2>\n<p>Describe the challenge faced by the client...</p>\n\n<h2>Solution</h2>\n<p>Explain the solution you provided...</p>\n\n<h2>Results</h2>\n<p>Share the results and impact...</p>'
    });

    // Portfolio Template
    this.createTemplate({
      name: 'Portfolio Item',
      type: 'portfolio',
      description: 'Portfolio showcase template for projects and work samples',
      isActive: true,
      fields: [
        { id: 'title', name: 'title', label: 'Project Title', type: 'text', required: true },
        { id: 'description', name: 'excerpt', label: 'Short Description', type: 'textarea', required: true },
        { id: 'content', name: 'content', label: 'Detailed Description', type: 'richtext', required: true },
        { id: 'project_url', name: 'projectUrl', label: 'Project URL', type: 'url', required: false },
        { id: 'technologies', name: 'technologies', label: 'Technologies', type: 'multiselect', required: false },
        { id: 'featured_image', name: 'featuredImage', label: 'Featured Image', type: 'image', required: true },
        { id: 'gallery', name: 'images', label: 'Project Gallery', type: 'gallery', required: false }
      ],
      defaultContent: '<h2>Project Overview</h2>\n<p>Provide an overview of the project...</p>\n\n<h2>Key Features</h2>\n<ul>\n<li>Feature 1</li>\n<li>Feature 2</li>\n<li>Feature 3</li>\n</ul>\n\n<h2>Technical Implementation</h2>\n<p>Describe the technical aspects...</p>'
    });
  }

  private initializeSampleContent(): void {
    // Sample blog posts
    this.createContent({
      title: 'The Future of Web Development: Trends to Watch in 2024',
      content: '<h2>Introduction</h2>\n<p>Web development continues to evolve at a rapid pace, with new technologies and methodologies emerging regularly. As we look ahead to 2024, several key trends are shaping the future of how we build and interact with web applications.</p>\n\n<h2>AI-Powered Development Tools</h2>\n<p>Artificial intelligence is revolutionizing the development process, from code generation to automated testing. Tools like GitHub Copilot and ChatGPT are helping developers write code faster and more efficiently.</p>\n\n<h2>Progressive Web Apps (PWAs)</h2>\n<p>PWAs continue to gain traction as they offer native app-like experiences through web browsers. With improved offline capabilities and better performance, PWAs are becoming the go-to solution for many businesses.</p>\n\n<h2>Conclusion</h2>\n<p>The web development landscape is more exciting than ever. By staying informed about these trends and continuously learning, developers can build better, more efficient applications that meet the evolving needs of users.</p>',
      type: 'blog',
      status: 'published',
      categories: ['Technology', 'Web Development'],
      tags: ['AI', 'PWA', 'Frontend', 'Trends'],
      author: {
        id: 'author1',
        name: 'John Smith',
        email: 'john@zoptal.com'
      }
    });

    this.createContent({
      title: 'Building Scalable Applications with Microservices Architecture',
      content: '<h2>What are Microservices?</h2>\n<p>Microservices architecture is a method of developing software systems that structures an application as a collection of loosely coupled services.</p>\n\n<h2>Benefits of Microservices</h2>\n<ul>\n<li>Scalability</li>\n<li>Flexibility</li>\n<li>Technology diversity</li>\n<li>Fault isolation</li>\n</ul>\n\n<h2>Implementation Best Practices</h2>\n<p>When implementing microservices, consider the following best practices...</p>',
      type: 'blog',
      status: 'published',
      categories: ['Architecture', 'Backend'],
      tags: ['Microservices', 'Scalability', 'Architecture'],
      author: {
        id: 'author2',
        name: 'Sarah Johnson',
        email: 'sarah@zoptal.com'
      }
    });

    // Sample case study
    this.createContent({
      title: 'E-commerce Platform Redesign: Increasing Conversion by 45%',
      content: '<h2>Challenge</h2>\n<p>Our client, a growing e-commerce company, was experiencing low conversion rates and high cart abandonment. Their existing platform was outdated and provided a poor user experience.</p>\n\n<h2>Solution</h2>\n<p>We implemented a complete redesign of their e-commerce platform, focusing on:</p>\n<ul>\n<li>Improved user interface design</li>\n<li>Streamlined checkout process</li>\n<li>Mobile-first responsive design</li>\n<li>Performance optimization</li>\n</ul>\n\n<h2>Results</h2>\n<p>The redesigned platform delivered impressive results:</p>\n<ul>\n<li>45% increase in conversion rate</li>\n<li>30% reduction in cart abandonment</li>\n<li>60% improvement in page load times</li>\n<li>25% increase in mobile sales</li>\n</ul>',
      type: 'case-study',
      status: 'published',
      categories: ['E-commerce', 'UX Design'],
      tags: ['Conversion Optimization', 'UX', 'Performance'],
      customFields: {
        clientName: 'TechStore Inc.',
        projectDuration: '4 months',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe']
      },
      author: {
        id: 'author1',
        name: 'John Smith',
        email: 'john@zoptal.com'
      }
    });
  }
}

// Export singleton instance
export const contentManager = ContentManager.getInstance();

// React hooks for content management
export function useContentManager() {
  const createContent = async (data: Partial<ContentItem>) => {
    return await contentManager.createContent(data);
  };

  const updateContent = async (id: string, updates: Partial<ContentItem>, changeLog?: string) => {
    return await contentManager.updateContent(id, updates, changeLog);
  };

  const deleteContent = async (id: string) => {
    return await contentManager.deleteContent(id);
  };

  const getContent = (id: string) => {
    return contentManager.getContent(id);
  };

  const getAllContent = (filter?: ContentFilter) => {
    return contentManager.getAllContent(filter);
  };

  const searchContent = async (query: string, options?: any) => {
    return await contentManager.searchContent(query, options);
  };

  return {
    createContent,
    updateContent,
    deleteContent,
    getContent,
    getAllContent,
    searchContent,
    getContentStats: () => contentManager.getContentStats(),
    getAllCategories: () => contentManager.getAllCategories(),
    getAllTags: () => contentManager.getAllTags(),
    getRelatedContent: (id: string, limit?: number) => contentManager.getRelatedContent(id, limit),
    incrementViewCount: (id: string) => contentManager.incrementViewCount(id)
  };
}