// Comprehensive Content Management Dashboard for Zoptal CMS
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Eye,
  Trash2,
  Calendar,
  Tag,
  User,
  Clock,
  TrendingUp,
  BarChart3,
  Users,
  CheckCircle,
  AlertCircle,
  Pause,
  Archive,
  RefreshCw,
  Download,
  Settings,
  Grid,
  List as ListIcon
} from 'lucide-react';
import { 
  ContentItem, 
  ContentFilter, 
  ContentStats,
  contentManager,
  useContentManager 
} from '@/lib/cms/content-manager';
import { analytics } from '@/lib/analytics/tracker';

interface ContentDashboardProps {
  defaultView?: 'overview' | 'content' | 'analytics';
  onCreateContent?: () => void;
  onEditContent?: (contentId: string) => void;
}

export function ContentDashboard({ 
  defaultView = 'overview',
  onCreateContent,
  onEditContent 
}: ContentDashboardProps) {
  const { 
    getAllContent, 
    deleteContent, 
    getContentStats, 
    getAllCategories, 
    getAllTags,
    searchContent 
  } = useContentManager();

  const [currentView, setCurrentView] = useState(defaultView);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState<ContentFilter>({
    type: undefined,
    status: undefined,
    author: undefined,
    category: undefined,
    tag: undefined
  });

  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'title' | 'viewCount'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [contentItems, filters, searchQuery, sortBy, sortOrder]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [content, contentStats] = await Promise.all([
        Promise.resolve(getAllContent()),
        Promise.resolve(getContentStats())
      ]);

      setContentItems(content);
      setStats(contentStats);

      analytics.track({
        name: 'content_dashboard_loaded',
        category: 'cms',
        properties: {
          view: currentView,
          total_items: content.length
        }
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSearch = async () => {
    let items = contentItems;

    // Apply search
    if (searchQuery.trim()) {
      const searchResults = await searchContent(searchQuery, { includeDrafts: true });
      const searchIds = new Set(searchResults.map(item => item.id));
      items = items.filter(item => searchIds.has(item.id));
    }

    // Apply filters
    if (filters.type) {
      items = items.filter(item => item.type === filters.type);
    }
    if (filters.status) {
      items = items.filter(item => item.status === filters.status);
    }
    if (filters.author) {
      items = items.filter(item => item.author.id === filters.author);
    }
    if (filters.category) {
      items = items.filter(item => item.categories.includes(filters.category!));
    }
    if (filters.tag) {
      items = items.filter(item => item.tags.includes(filters.tag!));
    }

    // Apply sorting
    items.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'viewCount':
          aValue = a.viewCount;
          bValue = b.viewCount;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredItems(items);
  };

  const handleFilterChange = (key: keyof ContentFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  const handleDeleteContent = async (contentId: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await deleteContent(contentId);
        await loadDashboardData();
        
        analytics.track({
          name: 'content_deleted_dashboard',
          category: 'cms',
          properties: { content_id: contentId }
        });
      } catch (error) {
        console.error('Failed to delete content:', error);
      }
    }
  };

  const handleBulkAction = async (action: 'delete' | 'publish' | 'archive') => {
    if (selectedItems.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${selectedItems.length} item(s)?`
    );
    
    if (!confirmed) return;

    try {
      switch (action) {
        case 'delete':
          await Promise.all(selectedItems.map(id => deleteContent(id)));
          break;
        case 'publish':
          // Implement bulk publish
          break;
        case 'archive':
          // Implement bulk archive
          break;
      }
      
      setSelectedItems([]);
      await loadDashboardData();
      
      analytics.track({
        name: 'content_bulk_action',
        category: 'cms',
        properties: {
          action,
          count: selectedItems.length
        }
      });
    } catch (error) {
      console.error(`Failed to ${action} content:`, error);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'draft':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'archived':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'blog':
        return <FileText className="w-4 h-4" />;
      case 'case-study':
        return <BarChart3 className="w-4 h-4" />;
      case 'portfolio':
        return <Grid className="w-4 h-4" />;
      case 'page':
        return <FileText className="w-4 h-4" />;
      case 'documentation':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Content</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalItems}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.publishedItems}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.draftItems}
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <Edit3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Popular Categories and Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Popular Categories
          </h3>
          <div className="space-y-3">
            {stats?.popularCategories.slice(0, 5).map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100">{category.name}</span>
                <span className="text-gray-500 dark:text-gray-400">{category.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Top Authors
          </h3>
          <div className="space-y-3">
            {stats?.topAuthors.slice(0, 5).map((author) => (
              <div key={author.id} className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100">{author.name}</span>
                <span className="text-gray-500 dark:text-gray-400">{author.itemCount} items</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Content
          </h3>
          <button
            onClick={() => setCurrentView('content')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {contentItems.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                  {getTypeIcon(item.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(item.updatedAt)} • {item.author.name}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderContentList = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Filters */}
          <select
            value={filters.type || 'all'}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Types</option>
            <option value="blog">Blog Posts</option>
            <option value="case-study">Case Studies</option>
            <option value="portfolio">Portfolio</option>
            <option value="page">Pages</option>
            <option value="documentation">Documentation</option>
          </select>

          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="updatedAt-desc">Latest Updated</option>
            <option value="createdAt-desc">Newest</option>
            <option value="title-asc">Title A-Z</option>
            <option value="viewCount-desc">Most Viewed</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedItems.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          )}

          {/* Create Button */}
          <button
            onClick={onCreateContent}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Content
          </button>
        </div>
      </div>

      {/* Content Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${
              viewMode === 'list' ? 'p-4' : 'p-6'
            }`}
          >
            {viewMode === 'grid' ? (
              // Grid View
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="rounded"
                    />
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                      {getTypeIcon(item.type)}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clmp-3">
                  {item.excerpt}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>{item.author.name}</span>
                  <span>{formatDate(item.updatedAt)}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {item.viewCount}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {item.readingTime}m
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditContent?.(item.id)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContent(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // List View
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="rounded"
                  />
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.author.name} • {formatDate(item.updatedAt)} • {item.viewCount} views
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditContent?.(item.id)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContent(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No content found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery || Object.values(filters).some(Boolean) 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first piece of content'
            }
          </p>
          {onCreateContent && (
            <button
              onClick={onCreateContent}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Content
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading content dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <FileText className="w-6 h-6 mr-2" />
                Content Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create, manage, and publish your content
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-6 mt-6">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'content', label: 'All Content', icon: FileText }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentView(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === key
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {currentView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderOverview()}
            </motion.div>
          )}

          {currentView === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderContentList()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}