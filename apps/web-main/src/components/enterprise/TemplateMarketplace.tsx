'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  TagIcon,
  StarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  HeartIcon,
  ClockIcon,
  CubeIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ListBulletIcon,
  Squares2X2Icon,
  FireIcon,
  ArrowUpIcon,
  UserIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  PhotoIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import {
  TemplateMarketplaceService,
  ProjectTemplate,
  TemplateCategory,
  TemplateFilter,
  TemplateSearchResult
} from '@/lib/enterprise/template-marketplace';

interface TemplateMarketplaceProps {
  organizationId?: string;
  onTemplateSelect?: (template: ProjectTemplate) => void;
  onTemplateUse?: (templateId: string, variables: Record<string, any>) => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'popular' | 'recent' | 'rating' | 'downloads' | 'name';

export default function TemplateMarketplace({
  organizationId,
  onTemplateSelect,
  onTemplateUse,
  className
}: TemplateMarketplaceProps) {
  const [marketplaceService] = useState(() => new TemplateMarketplaceService());
  
  // State
  const [searchResult, setSearchResult] = useState<TemplateSearchResult>({
    templates: [],
    totalCount: 0,
    facets: {
      categories: [],
      frameworks: [],
      languages: [],
      tags: [],
      pricing: []
    }
  });
  const [featuredTemplates, setFeaturedTemplates] = useState<ProjectTemplate[]>([]);
  const [trendingTemplates, setTrendingTemplates] = useState<ProjectTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<TemplateFilter>({
    sortBy: 'popular',
    sortOrder: 'desc'
  });

  const categories: { id: TemplateCategory; label: string; icon: any; color: string }[] = [
    { id: 'web-app', label: 'Web Apps', icon: CubeIcon, color: 'text-blue-600 bg-blue-100' },
    { id: 'mobile-app', label: 'Mobile Apps', icon: CodeBracketIcon, color: 'text-green-600 bg-green-100' },
    { id: 'dashboard', label: 'Dashboards', icon: Squares2X2Icon, color: 'text-purple-600 bg-purple-100' },
    { id: 'e-commerce', label: 'E-commerce', icon: ShoppingCartIcon, color: 'text-pink-600 bg-pink-100' },
    { id: 'landing-page', label: 'Landing Pages', icon: RocketLaunchIcon, color: 'text-indigo-600 bg-indigo-100' },
    { id: 'api', label: 'APIs', icon: CubeIcon, color: 'text-gray-600 bg-gray-100' },
    { id: 'component-library', label: 'Components', icon: CodeBracketIcon, color: 'text-yellow-600 bg-yellow-100' },
    { id: 'ai-ml', label: 'AI/ML', icon: FireIcon, color: 'text-red-600 bg-red-100' }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    searchTemplates();
  }, [searchQuery, filters, currentPage, selectedCategory]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [featured, trending] = await Promise.all([
        marketplaceService.getFeaturedTemplates(8),
        marketplaceService.getTrendingTemplates(8)
      ]);
      
      setFeaturedTemplates(featured);
      setTrendingTemplates(trending);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchTemplates = async () => {
    try {
      const searchFilters = {
        ...filters,
        category: selectedCategory ? [selectedCategory] : undefined
      };
      
      const result = await marketplaceService.searchTemplates(
        searchQuery,
        searchFilters,
        currentPage,
        12
      );
      
      setSearchResult(result);
    } catch (error) {
      console.error('Failed to search templates:', error);
    }
  };

  const handleCategorySelect = (category: TemplateCategory | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof TemplateFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleTemplateClick = async (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    onTemplateSelect?.(template);
    
    // Track view
    await marketplaceService.getTemplate(template.id);
  };

  const handleUseTemplate = async (template: ProjectTemplate) => {
    // For now, use template with empty variables
    // In a real implementation, this would open a variable configuration modal
    try {
      await marketplaceService.useTemplate(template.id, {});
      onTemplateUse?.(template.id, {});
    } catch (error) {
      console.error('Failed to use template:', error);
    }
  };

  const getPricingDisplay = (template: ProjectTemplate) => {
    switch (template.pricing.type) {
      case 'free':
        return <span className="text-green-600 font-medium">Free</span>;
      case 'paid':
        return (
          <span className="text-blue-600 font-medium">
            ${template.pricing.price} {template.pricing.billingPeriod === 'one-time' ? '' : `/${template.pricing.billingPeriod}`}
          </span>
        );
      case 'freemium':
        return <span className="text-purple-600 font-medium">Freemium</span>;
      case 'enterprise':
        return <span className="text-gray-600 font-medium">Enterprise</span>;
      default:
        return <span className="text-gray-400">-</span>;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-orange-600 bg-orange-100';
      case 'expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderTemplateCard = (template: ProjectTemplate) => (
    <motion.div
      key={template.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={() => handleTemplateClick(template)}
    >
      {/* Template Image/Preview */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
        {template.screenshots.length > 0 ? (
          <img 
            src={template.screenshots[0]} 
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CubeIcon className="h-16 w-16 text-white/70" />
          </div>
        )}
        
        {/* Template badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {template.statistics.featured && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center">
              <StarIcon className="h-3 w-3 mr-1" />
              Featured
            </span>
          )}
          {template.statistics.trending && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center">
              <ArrowUpIcon className="h-3 w-3 mr-1" />
              Trending
            </span>
          )}
        </div>
        
        {/* Pricing */}
        <div className="absolute top-3 right-3">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-sm font-medium">
            {getPricingDisplay(template)}
          </div>
        </div>
        
        {/* Quick preview button */}
        <div className="absolute bottom-3 right-3">
          {template.demoUrl && (
            <button 
              className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                window.open(template.demoUrl, '_blank');
              }}
            >
              <PlayIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Template Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{template.description}</p>
          </div>
        </div>

        {/* Author & Framework */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <UserIcon className="h-4 w-4" />
            <span>{template.author.name}</span>
            {template.author.organization && (
              <>
                <span>•</span>
                <BuildingOfficeIcon className="h-4 w-4" />
                <span>{template.author.organization}</span>
              </>
            )}
          </div>
        </div>

        {/* Framework & Complexity */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
            {template.framework}
          </span>
          <span className={cn('px-2 py-1 text-xs rounded-full capitalize', getComplexityColor(template.complexity))}>
            {template.complexity}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{template.rating.average.toFixed(1)}</span>
              <span>({template.rating.count})</span>
            </div>
            <div className="flex items-center space-x-1">
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>{template.statistics.downloads.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-4 w-4" />
            <span>{template.updatedAt.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-1 text-xs text-gray-500">
              +{template.tags.length - 3}
            </span>
          )}
        </div>

        {/* Security & Compliance */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {template.security.status === 'clean' && (
              <div className="flex items-center space-x-1 text-green-600">
                <ShieldCheckIcon className="h-4 w-4" />
                <span className="text-xs">Secure</span>
              </div>
            )}
            {template.compliance.securityScan === 'passed' && (
              <div className="flex items-center space-x-1 text-blue-600">
                <CheckCircleIcon className="h-4 w-4" />
                <span className="text-xs">Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleUseTemplate(template);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
        >
          Use Template
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className={cn("bg-gray-50 min-h-screen", className)}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Template Marketplace</h1>
              <p className="text-gray-600">Discover and use professional project templates</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <DocumentTextIcon className="h-4 w-4" />
                <span>Create Template</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <CubeIcon className="h-4 w-4" />
                <span>Publish Template</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <button
              onClick={() => handleCategorySelect(null)}
              className={cn(
                "flex flex-col items-center p-4 rounded-lg border-2 transition-all",
                !selectedCategory 
                  ? "border-blue-500 bg-blue-50 text-blue-600" 
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              )}
            >
              <Squares2X2Icon className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">All</span>
            </button>
            
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={cn(
                  "flex flex-col items-center p-4 rounded-lg border-2 transition-all",
                  selectedCategory === category.id
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                )}
              >
                <category.icon className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Templates */}
        {!searchQuery && !selectedCategory && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Featured Templates</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredTemplates.slice(0, 4).map(renderTemplateCard)}
            </div>
          </div>
        )}

        {/* Trending Templates */}
        {!searchQuery && !selectedCategory && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FireIcon className="h-5 w-5 text-red-500 mr-2" />
                Trending This Week
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingTemplates.slice(0, 4).map(renderTemplateCard)}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value as SortBy)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Updated</option>
              <option value="rating">Highest Rated</option>
              <option value="downloads">Most Downloaded</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* View Mode */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'grid' ? "bg-white shadow-sm" : "hover:bg-gray-200"
              )}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'list' ? "bg-white shadow-sm" : "hover:bg-gray-200"
              )}
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Framework</label>
                  <div className="space-y-2">
                    {searchResult.facets.frameworks.slice(0, 5).map(framework => (
                      <label key={framework.name} className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-600">{framework.name} ({framework.count})</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pricing</label>
                  <div className="space-y-2">
                    {searchResult.facets.pricing.map(pricing => (
                      <label key={pricing.name} className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-600 capitalize">{pricing.name} ({pricing.count})</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <div className="space-y-2">
                    {searchResult.facets.languages.slice(0, 5).map(language => (
                      <label key={language.name} className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-600">{language.name} ({language.count})</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Complexity</label>
                  <div className="space-y-2">
                    {['beginner', 'intermediate', 'advanced', 'expert'].map(complexity => (
                      <label key={complexity} className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-600 capitalize">{complexity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.label} Templates` : 'All Templates'}
              </h2>
              <p className="text-sm text-gray-600">
                {searchResult.totalCount.toLocaleString()} templates found
              </p>
            </div>
          </div>

          {/* Templates Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResult.templates.map(renderTemplateCard)}
            </div>
          ) : (
            <div className="space-y-4">
              {searchResult.templates.map(template => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      {template.screenshots.length > 0 ? (
                        <img 
                          src={template.screenshots[0]} 
                          alt={template.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <CubeIcon className="h-12 w-12 text-white/70" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.description}</p>
                          
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{template.rating.average.toFixed(1)} ({template.rating.count})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              <span>{template.statistics.downloads.toLocaleString()}</span>
                            </div>
                            <span>{template.framework}</span>
                            <span className="capitalize">{template.complexity}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 ml-4">
                          <div className="text-right">
                            {getPricingDisplay(template)}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUseTemplate(template);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Use Template
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {searchResult.totalCount > 12 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {[...Array(Math.min(5, Math.ceil(searchResult.totalCount / 12)))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "px-3 py-2 border rounded-lg",
                    currentPage === page
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= Math.ceil(searchResult.totalCount / 12)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}