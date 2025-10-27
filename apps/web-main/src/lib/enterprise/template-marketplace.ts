'use client';

import { ProjectFile } from '@/lib/ai/enhanced-code-generator';

export interface ProjectTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  version: string;
  author: {
    userId: string;
    name: string;
    avatar?: string;
    organization?: string;
  };
  category: TemplateCategory;
  tags: string[];
  framework: string;
  language: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Template Structure
  files: ProjectFile[];
  structure: TemplateStructure;
  variables: TemplateVariable[];
  requirements: TemplateRequirement[];
  
  // Marketplace Info
  visibility: 'public' | 'organization' | 'team' | 'private';
  pricing: TemplatePricing;
  rating: TemplateRating;
  statistics: TemplateStatistics;
  
  // Metadata
  organizationId?: string;
  teamId?: string;
  license: string;
  repository?: string;
  documentation?: string;
  changelog?: TemplateVersion[];
  screenshots: string[];
  demoUrl?: string;
  
  // Compliance
  compliance: TemplateCompliance;
  security: SecurityScan;
  
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export type TemplateCategory = 
  | 'web-app'
  | 'mobile-app'
  | 'api'
  | 'microservice'
  | 'dashboard'
  | 'landing-page'
  | 'e-commerce'
  | 'blog'
  | 'documentation'
  | 'component-library'
  | 'monorepo'
  | 'starter-kit'
  | 'plugin'
  | 'theme'
  | 'workflow'
  | 'devops'
  | 'ai-ml'
  | 'blockchain'
  | 'game'
  | 'desktop-app';

export interface TemplateStructure {
  rootFiles: string[];
  directories: {
    [key: string]: {
      description: string;
      files: string[];
      optional: boolean;
    };
  };
  dependencies: {
    production: Record<string, string>;
    development: Record<string, string>;
    peer?: Record<string, string>;
  };
  scripts: Record<string, string>;
  configuration: {
    [key: string]: any;
  };
}

export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'file' | 'color';
  required: boolean;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  placeholder?: string;
  group?: string;
}

export interface TemplateRequirement {
  type: 'node' | 'npm' | 'yarn' | 'python' | 'docker' | 'git' | 'tool' | 'service';
  name: string;
  version?: string;
  description: string;
  optional: boolean;
  installInstructions?: string;
}

export interface TemplatePricing {
  type: 'free' | 'paid' | 'freemium' | 'enterprise';
  price?: number;
  currency?: string;
  billingPeriod?: 'one-time' | 'monthly' | 'yearly';
  freeUsageLimit?: number;
  enterpriseContact?: boolean;
}

export interface TemplateRating {
  average: number;
  count: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  reviews: TemplateReview[];
}

export interface TemplateReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  usageContext?: string;
  helpful: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateStatistics {
  downloads: number;
  uses: number;
  forks: number;
  stars: number;
  views: number;
  weeklyDownloads: number;
  monthlyDownloads: number;
  lastDownload: Date;
  trending: boolean;
  featured: boolean;
}

export interface TemplateVersion {
  version: string;
  releaseDate: Date;
  changes: string[];
  breaking: boolean;
  deprecated: boolean;
  downloadUrl?: string;
}

export interface TemplateCompliance {
  securityScan: 'passed' | 'warning' | 'failed';
  codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
  licenses: string[];
  vulnerabilities: number;
  lastScanned: Date;
  compliance: {
    gdpr: boolean;
    hipaa: boolean;
    sox: boolean;
    iso27001: boolean;
  };
}

export interface SecurityScan {
  status: 'clean' | 'warning' | 'vulnerable';
  issues: SecurityIssue[];
  lastScanned: Date;
  scanVersion: string;
}

export interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  title: string;
  description: string;
  file: string;
  line?: number;
  cwe?: string;
  fix?: string;
  falsePositive: boolean;
}

export interface TemplateFilter {
  category?: TemplateCategory[];
  framework?: string[];
  language?: string[];
  complexity?: string[];
  tags?: string[];
  pricing?: string[];
  rating?: number;
  author?: string;
  organization?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'popular' | 'recent' | 'rating' | 'downloads' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface TemplateSearchResult {
  templates: ProjectTemplate[];
  totalCount: number;
  facets: {
    categories: { name: string; count: number }[];
    frameworks: { name: string; count: number }[];
    languages: { name: string; count: number }[];
    tags: { name: string; count: number }[];
    pricing: { name: string; count: number }[];
  };
}

export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  teamId?: string;
  createdBy: string;
  config: TemplateConfig;
  files: ProjectFile[];
  variables: TemplateVariable[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateConfig {
  framework: string;
  styling: string;
  features: string[];
  integrations: string[];
  deployment: string[];
  testing: boolean;
  documentation: boolean;
  ci: boolean;
  monitoring: boolean;
}

export class TemplateMarketplaceService {
  private templates: Map<string, ProjectTemplate> = new Map();
  private customTemplates: Map<string, CustomTemplate> = new Map();
  private reviews: Map<string, TemplateReview[]> = new Map();

  constructor() {
    this.initializeMarketplace();
  }

  // Template Discovery
  async searchTemplates(
    query: string, 
    filters: TemplateFilter = {},
    page = 1,
    limit = 20
  ): Promise<TemplateSearchResult> {
    let filteredTemplates = Array.from(this.templates.values());

    // Text search
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      filteredTemplates = filteredTemplates.filter(template => {
        const searchText = `${template.name} ${template.description} ${template.tags.join(' ')}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
      });
    }

    // Apply filters
    if (filters.category?.length) {
      filteredTemplates = filteredTemplates.filter(t => filters.category!.includes(t.category));
    }

    if (filters.framework?.length) {
      filteredTemplates = filteredTemplates.filter(t => filters.framework!.includes(t.framework));
    }

    if (filters.language?.length) {
      filteredTemplates = filteredTemplates.filter(t => 
        t.language.some(lang => filters.language!.includes(lang))
      );
    }

    if (filters.complexity?.length) {
      filteredTemplates = filteredTemplates.filter(t => filters.complexity!.includes(t.complexity));
    }

    if (filters.tags?.length) {
      filteredTemplates = filteredTemplates.filter(t => 
        filters.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (filters.pricing?.length) {
      filteredTemplates = filteredTemplates.filter(t => filters.pricing!.includes(t.pricing.type));
    }

    if (filters.rating) {
      filteredTemplates = filteredTemplates.filter(t => t.rating.average >= filters.rating!);
    }

    // Sort results
    const sortBy = filters.sortBy || 'popular';
    filteredTemplates.sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'popular':
          return (b.statistics.downloads - a.statistics.downloads) * order;
        case 'recent':
          return (b.updatedAt.getTime() - a.updatedAt.getTime()) * order;
        case 'rating':
          return (b.rating.average - a.rating.average) * order;
        case 'downloads':
          return (b.statistics.downloads - a.statistics.downloads) * order;
        case 'name':
          return a.name.localeCompare(b.name) * order;
        default:
          return 0;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + limit);

    // Generate facets
    const facets = this.generateFacets(filteredTemplates);

    return {
      templates: paginatedTemplates,
      totalCount: filteredTemplates.length,
      facets
    };
  }

  async getTemplate(templateId: string): Promise<ProjectTemplate | null> {
    const template = this.templates.get(templateId);
    if (template) {
      // Increment view count
      template.statistics.views++;
      return template;
    }
    return null;
  }

  async getFeaturedTemplates(limit = 10): Promise<ProjectTemplate[]> {
    return Array.from(this.templates.values())
      .filter(t => t.statistics.featured)
      .sort((a, b) => b.statistics.downloads - a.statistics.downloads)
      .slice(0, limit);
  }

  async getTrendingTemplates(limit = 10): Promise<ProjectTemplate[]> {
    return Array.from(this.templates.values())
      .filter(t => t.statistics.trending)
      .sort((a, b) => b.statistics.weeklyDownloads - a.statistics.weeklyDownloads)
      .slice(0, limit);
  }

  async getTemplatesByCategory(category: TemplateCategory, limit = 10): Promise<ProjectTemplate[]> {
    return Array.from(this.templates.values())
      .filter(t => t.category === category)
      .sort((a, b) => b.rating.average - a.rating.average)
      .slice(0, limit);
  }

  async getTemplatesByAuthor(userId: string): Promise<ProjectTemplate[]> {
    return Array.from(this.templates.values())
      .filter(t => t.author.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Template Usage
  async useTemplate(templateId: string, variables: Record<string, any> = {}): Promise<{
    files: ProjectFile[];
    configuration: any;
  }> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Process template variables
    const processedFiles = this.processTemplateFiles(template.files, variables);
    const configuration = this.processTemplateConfiguration(template.structure.configuration, variables);

    // Update statistics
    template.statistics.uses++;
    template.statistics.downloads++;
    template.statistics.lastDownload = new Date();

    return {
      files: processedFiles,
      configuration
    };
  }

  private processTemplateFiles(files: ProjectFile[], variables: Record<string, any>): ProjectFile[] {
    return files.map(file => ({
      ...file,
      path: this.replaceVariables(file.path, variables),
      content: this.replaceVariables(file.content, variables)
    }));
  }

  private processTemplateConfiguration(config: any, variables: Record<string, any>): any {
    return JSON.parse(this.replaceVariables(JSON.stringify(config), variables));
  }

  private replaceVariables(text: string, variables: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  // Template Creation
  async createCustomTemplate(
    organizationId: string,
    templateData: Partial<CustomTemplate>
  ): Promise<CustomTemplate> {
    const template: CustomTemplate = {
      id: this.generateId(),
      name: templateData.name!,
      description: templateData.description!,
      organizationId,
      teamId: templateData.teamId,
      createdBy: templateData.createdBy!,
      config: templateData.config!,
      files: templateData.files || [],
      variables: templateData.variables || [],
      isPublic: templateData.isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.customTemplates.set(template.id, template);
    return template;
  }

  async publishTemplate(
    customTemplateId: string,
    publishData: {
      category: TemplateCategory;
      tags: string[];
      pricing: TemplatePricing;
      license: string;
      documentation?: string;
      screenshots: string[];
    }
  ): Promise<ProjectTemplate> {
    const customTemplate = this.customTemplates.get(customTemplateId);
    if (!customTemplate) {
      throw new Error('Custom template not found');
    }

    // Security scan
    const securityScan = await this.performSecurityScan(customTemplate.files);
    
    // Compliance check
    const compliance = await this.performComplianceCheck(customTemplate);

    const publishedTemplate: ProjectTemplate = {
      id: this.generateId(),
      name: customTemplate.name,
      slug: this.slugify(customTemplate.name),
      description: customTemplate.description,
      version: '1.0.0',
      author: {
        userId: customTemplate.createdBy,
        name: 'Template Author', // Would fetch from user service
        organization: 'Organization Name'
      },
      category: publishData.category,
      tags: publishData.tags,
      framework: customTemplate.config.framework,
      language: ['TypeScript', 'JavaScript'], // Would detect from files
      complexity: 'intermediate', // Would analyze complexity
      files: customTemplate.files,
      structure: this.analyzeTemplateStructure(customTemplate.files),
      variables: customTemplate.variables,
      requirements: this.generateRequirements(customTemplate.config),
      visibility: customTemplate.isPublic ? 'public' : 'organization',
      pricing: publishData.pricing,
      rating: {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        reviews: []
      },
      statistics: {
        downloads: 0,
        uses: 0,
        forks: 0,
        stars: 0,
        views: 0,
        weeklyDownloads: 0,
        monthlyDownloads: 0,
        lastDownload: new Date(),
        trending: false,
        featured: false
      },
      organizationId: customTemplate.organizationId,
      teamId: customTemplate.teamId,
      license: publishData.license,
      documentation: publishData.documentation,
      screenshots: publishData.screenshots,
      compliance,
      security: securityScan,
      createdAt: customTemplate.createdAt,
      updatedAt: new Date(),
      publishedAt: new Date()
    };

    this.templates.set(publishedTemplate.id, publishedTemplate);
    return publishedTemplate;
  }

  // Reviews and Ratings
  async addReview(
    templateId: string,
    userId: string,
    reviewData: {
      rating: number;
      title: string;
      content: string;
      pros?: string[];
      cons?: string[];
      usageContext?: string;
    }
  ): Promise<TemplateReview> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const review: TemplateReview = {
      id: this.generateId(),
      userId,
      userName: 'User Name', // Would fetch from user service
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      pros: reviewData.pros,
      cons: reviewData.cons,
      usageContext: reviewData.usageContext,
      helpful: 0,
      verified: false, // Would check if user actually used template
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Update template rating
    template.rating.count++;
    template.rating.distribution[review.rating as keyof typeof template.rating.distribution]++;
    template.rating.average = this.calculateAverageRating(template.rating.distribution);
    template.rating.reviews.push(review);

    // Store review
    const templateReviews = this.reviews.get(templateId) || [];
    templateReviews.push(review);
    this.reviews.set(templateId, templateReviews);

    return review;
  }

  async getTemplateReviews(templateId: string): Promise<TemplateReview[]> {
    return this.reviews.get(templateId) || [];
  }

  // Analytics
  async getMarketplaceAnalytics(): Promise<{
    totalTemplates: number;
    totalDownloads: number;
    avgRating: number;
    topCategories: { category: TemplateCategory; count: number }[];
    topFrameworks: { framework: string; count: number }[];
    recentActivity: { date: Date; downloads: number; uploads: number }[];
  }> {
    const templates = Array.from(this.templates.values());
    
    const totalTemplates = templates.length;
    const totalDownloads = templates.reduce((sum, t) => sum + t.statistics.downloads, 0);
    const avgRating = templates.reduce((sum, t) => sum + t.rating.average, 0) / templates.length;

    // Category distribution
    const categoryCount = new Map<TemplateCategory, number>();
    templates.forEach(t => {
      categoryCount.set(t.category, (categoryCount.get(t.category) || 0) + 1);
    });
    const topCategories = Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Framework distribution
    const frameworkCount = new Map<string, number>();
    templates.forEach(t => {
      frameworkCount.set(t.framework, (frameworkCount.get(t.framework) || 0) + 1);
    });
    const topFrameworks = Array.from(frameworkCount.entries())
      .map(([framework, count]) => ({ framework, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent activity (mock data)
    const recentActivity = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      downloads: Math.floor(Math.random() * 100),
      uploads: Math.floor(Math.random() * 10)
    }));

    return {
      totalTemplates,
      totalDownloads,
      avgRating,
      topCategories,
      topFrameworks,
      recentActivity
    };
  }

  // Utility Methods
  private generateFacets(templates: ProjectTemplate[]) {
    const categories = new Map<string, number>();
    const frameworks = new Map<string, number>();
    const languages = new Map<string, number>();
    const tags = new Map<string, number>();
    const pricing = new Map<string, number>();

    templates.forEach(template => {
      // Categories
      categories.set(template.category, (categories.get(template.category) || 0) + 1);
      
      // Frameworks
      frameworks.set(template.framework, (frameworks.get(template.framework) || 0) + 1);
      
      // Languages
      template.language.forEach(lang => {
        languages.set(lang, (languages.get(lang) || 0) + 1);
      });
      
      // Tags
      template.tags.forEach(tag => {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      });
      
      // Pricing
      pricing.set(template.pricing.type, (pricing.get(template.pricing.type) || 0) + 1);
    });

    return {
      categories: Array.from(categories.entries()).map(([name, count]) => ({ name, count })),
      frameworks: Array.from(frameworks.entries()).map(([name, count]) => ({ name, count })),
      languages: Array.from(languages.entries()).map(([name, count]) => ({ name, count })),
      tags: Array.from(tags.entries()).map(([name, count]) => ({ name, count })),
      pricing: Array.from(pricing.entries()).map(([name, count]) => ({ name, count }))
    };
  }

  private calculateAverageRating(distribution: { 1: number; 2: number; 3: number; 4: number; 5: number }): number {
    const totalRatings = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    if (totalRatings === 0) return 0;
    
    const weightedSum = Object.entries(distribution).reduce((sum, [rating, count]) => {
      return sum + (parseInt(rating) * count);
    }, 0);
    
    return Math.round((weightedSum / totalRatings) * 10) / 10;
  }

  private async performSecurityScan(files: ProjectFile[]): Promise<SecurityScan> {
    // Mock security scan - in real implementation would use actual security tools
    return {
      status: 'clean',
      issues: [],
      lastScanned: new Date(),
      scanVersion: '1.0.0'
    };
  }

  private async performComplianceCheck(template: CustomTemplate): Promise<TemplateCompliance> {
    // Mock compliance check
    return {
      securityScan: 'passed',
      codeQuality: 'good',
      licenses: ['MIT'],
      vulnerabilities: 0,
      lastScanned: new Date(),
      compliance: {
        gdpr: true,
        hipaa: false,
        sox: false,
        iso27001: true
      }
    };
  }

  private analyzeTemplateStructure(files: ProjectFile[]): TemplateStructure {
    // Analyze files to create structure
    const directories: { [key: string]: { description: string; files: string[]; optional: boolean } } = {};
    const rootFiles: string[] = [];

    files.forEach(file => {
      const pathParts = file.path.split('/');
      if (pathParts.length === 1) {
        rootFiles.push(file.path);
      } else {
        const dirName = pathParts[0];
        if (!directories[dirName]) {
          directories[dirName] = {
            description: `${dirName} directory`,
            files: [],
            optional: false
          };
        }
        directories[dirName].files.push(file.path);
      }
    });

    return {
      rootFiles,
      directories,
      dependencies: {
        production: {},
        development: {}
      },
      scripts: {},
      configuration: {}
    };
  }

  private generateRequirements(config: TemplateConfig): TemplateRequirement[] {
    const requirements: TemplateRequirement[] = [
      {
        type: 'node',
        name: 'Node.js',
        version: '>=18.0.0',
        description: 'JavaScript runtime',
        optional: false
      },
      {
        type: 'npm',
        name: 'npm',
        version: '>=8.0.0',
        description: 'Package manager',
        optional: false
      }
    ];

    if (config.framework === 'react') {
      requirements.push({
        type: 'tool',
        name: 'React Developer Tools',
        description: 'Browser extension for debugging React',
        optional: true
      });
    }

    return requirements;
  }

  private generateId(): string {
    return 'tpl_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private initializeMarketplace(): void {
    // Sample marketplace templates
    const sampleTemplates: ProjectTemplate[] = [
      {
        id: 'tpl_react_dashboard',
        name: 'Modern React Dashboard',
        slug: 'modern-react-dashboard',
        description: 'A comprehensive dashboard template with charts, tables, and real-time data',
        longDescription: 'Enterprise-ready React dashboard with TypeScript, Tailwind CSS, and comprehensive UI components including charts, data tables, forms, and authentication.',
        version: '2.1.0',
        author: {
          userId: 'user_alice',
          name: 'Alice Johnson',
          avatar: '/images/avatars/alice.jpg',
          organization: 'Acme Corporation'
        },
        category: 'dashboard',
        tags: ['react', 'typescript', 'tailwind', 'charts', 'admin', 'enterprise'],
        framework: 'react',
        language: ['TypeScript', 'JavaScript'],
        complexity: 'advanced',
        files: [], // Would contain actual template files
        structure: {
          rootFiles: ['package.json', 'README.md', 'tsconfig.json'],
          directories: {
            src: { description: 'Source code', files: [], optional: false },
            components: { description: 'React components', files: [], optional: false },
            pages: { description: 'Application pages', files: [], optional: false },
            utils: { description: 'Utility functions', files: [], optional: false }
          },
          dependencies: {
            production: {
              'react': '^18.0.0',
              'typescript': '^5.0.0',
              'tailwindcss': '^3.0.0'
            },
            development: {
              'vite': '^4.0.0',
              '@types/react': '^18.0.0'
            }
          },
          scripts: {
            'dev': 'vite',
            'build': 'vite build',
            'preview': 'vite preview'
          },
          configuration: {}
        },
        variables: [
          {
            key: 'projectName',
            label: 'Project Name',
            description: 'Name of your dashboard project',
            type: 'string',
            required: true,
            placeholder: 'My Dashboard'
          },
          {
            key: 'theme',
            label: 'Color Theme',
            description: 'Primary color theme',
            type: 'select',
            required: true,
            defaultValue: 'blue',
            options: [
              { label: 'Blue', value: 'blue' },
              { label: 'Green', value: 'green' },
              { label: 'Purple', value: 'purple' },
              { label: 'Red', value: 'red' }
            ]
          }
        ],
        requirements: [
          {
            type: 'node',
            name: 'Node.js',
            version: '>=18.0.0',
            description: 'JavaScript runtime',
            optional: false
          }
        ],
        visibility: 'public',
        pricing: {
          type: 'free'
        },
        rating: {
          average: 4.8,
          count: 156,
          distribution: { 1: 2, 2: 5, 3: 12, 4: 35, 5: 102 },
          reviews: []
        },
        statistics: {
          downloads: 12450,
          uses: 8932,
          forks: 245,
          stars: 892,
          views: 25678,
          weeklyDownloads: 234,
          monthlyDownloads: 1456,
          lastDownload: new Date(),
          trending: true,
          featured: true
        },
        organizationId: 'org_sample',
        license: 'MIT',
        repository: 'https://github.com/acme/react-dashboard',
        documentation: 'https://docs.acme.com/dashboard-template',
        screenshots: [
          '/images/templates/dashboard-1.png',
          '/images/templates/dashboard-2.png'
        ],
        demoUrl: 'https://dashboard-demo.acme.com',
        compliance: {
          securityScan: 'passed',
          codeQuality: 'excellent',
          licenses: ['MIT'],
          vulnerabilities: 0,
          lastScanned: new Date(),
          compliance: {
            gdpr: true,
            hipaa: false,
            sox: true,
            iso27001: true
          }
        },
        security: {
          status: 'clean',
          issues: [],
          lastScanned: new Date(),
          scanVersion: '1.0.0'
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-10'),
        publishedAt: new Date('2024-01-20')
      },
      {
        id: 'tpl_nextjs_ecommerce',
        name: 'Next.js E-commerce Starter',
        slug: 'nextjs-ecommerce-starter',
        description: 'Full-featured e-commerce template with Stripe integration and admin panel',
        version: '1.5.0',
        author: {
          userId: 'user_bob',
          name: 'Bob Smith',
          organization: 'E-commerce Solutions'
        },
        category: 'e-commerce',
        tags: ['nextjs', 'ecommerce', 'stripe', 'admin', 'seo'],
        framework: 'nextjs',
        language: ['TypeScript'],
        complexity: 'expert',
        files: [],
        structure: {
          rootFiles: ['package.json', 'next.config.js'],
          directories: {
            pages: { description: 'Next.js pages', files: [], optional: false },
            components: { description: 'React components', files: [], optional: false },
            lib: { description: 'Utilities and configurations', files: [], optional: false },
            styles: { description: 'CSS styles', files: [], optional: false }
          },
          dependencies: {
            production: {
              'next': '^14.0.0',
              'react': '^18.0.0',
              'stripe': '^12.0.0'
            },
            development: {}
          },
          scripts: {},
          configuration: {}
        },
        variables: [
          {
            key: 'storeName',
            label: 'Store Name',
            description: 'Name of your online store',
            type: 'string',
            required: true
          },
          {
            key: 'currency',
            label: 'Currency',
            description: 'Default store currency',
            type: 'select',
            required: true,
            defaultValue: 'USD',
            options: [
              { label: 'US Dollar', value: 'USD' },
              { label: 'Euro', value: 'EUR' },
              { label: 'British Pound', value: 'GBP' }
            ]
          }
        ],
        requirements: [],
        visibility: 'public',
        pricing: {
          type: 'paid',
          price: 49,
          currency: 'USD',
          billingPeriod: 'one-time'
        },
        rating: {
          average: 4.6,
          count: 89,
          distribution: { 1: 1, 2: 3, 3: 8, 4: 25, 5: 52 },
          reviews: []
        },
        statistics: {
          downloads: 3421,
          uses: 2156,
          forks: 89,
          stars: 334,
          views: 8923,
          weeklyDownloads: 45,
          monthlyDownloads: 234,
          lastDownload: new Date(),
          trending: false,
          featured: true
        },
        license: 'Commercial',
        screenshots: ['/images/templates/ecommerce-1.png'],
        compliance: {
          securityScan: 'passed',
          codeQuality: 'good',
          licenses: ['Commercial'],
          vulnerabilities: 0,
          lastScanned: new Date(),
          compliance: {
            gdpr: true,
            hipaa: false,
            sox: false,
            iso27001: false
          }
        },
        security: {
          status: 'clean',
          issues: [],
          lastScanned: new Date(),
          scanVersion: '1.0.0'
        },
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-03-15'),
        publishedAt: new Date('2024-02-05')
      }
    ];

    sampleTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }
}