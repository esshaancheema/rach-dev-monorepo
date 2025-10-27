'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  CodeBracketIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PencilIcon,
  FolderOpenIcon,
  StarIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

interface GeneratedApp {
  id: string;
  title: string;
  description: string;
  framework: 'react' | 'vue' | 'vanilla';
  createdAt: Date;
  lastModified: Date;
  code: string;
  features: string[];
  complexity: 'simple' | 'moderate' | 'advanced';
  isFavorite: boolean;
  tags: string[];
  previewUrl?: string;
  downloadCount: number;
  size: number; // in KB
  status: 'generated' | 'modified' | 'deployed';
}

interface AppHistoryDashboardProps {
  className?: string;
  onAppSelect?: (app: GeneratedApp) => void;
  onAppEdit?: (app: GeneratedApp) => void;
  onAppDelete?: (appId: string) => void;
}

const MOCK_APPS: GeneratedApp[] = [
  {
    id: '1',
    title: 'Todo List App',
    description: 'A simple todo list with drag and drop functionality',
    framework: 'react',
    createdAt: new Date('2024-01-15'),
    lastModified: new Date('2024-01-16'),
    code: 'function App() { return <div>Todo App</div>; }',
    features: ['drag and drop', 'localStorage', 'responsive design'],
    complexity: 'simple',
    isFavorite: true,
    tags: ['productivity', 'tasks'],
    downloadCount: 5,
    size: 12.5,
    status: 'generated'
  },
  {
    id: '2',
    title: 'Weather Dashboard',
    description: 'Real-time weather dashboard with charts and forecasts',
    framework: 'vue',
    createdAt: new Date('2024-01-10'),
    lastModified: new Date('2024-01-12'),
    code: 'const AppConfig = { template: `<div>Weather App</div>` };',
    features: ['api integration', 'charts', 'geolocation', 'responsive design'],
    complexity: 'moderate',
    isFavorite: false,
    tags: ['weather', 'api', 'dashboard'],
    downloadCount: 12,
    size: 28.3,
    status: 'modified'
  },
  {
    id: '3',
    title: 'Calculator App',
    description: 'Scientific calculator with advanced operations',
    framework: 'vanilla',
    createdAt: new Date('2024-01-08'),
    lastModified: new Date('2024-01-08'),
    code: '<div>Calculator App</div>',
    features: ['scientific functions', 'history', 'keyboard support'],
    complexity: 'simple',
    isFavorite: false,
    tags: ['calculator', 'math'],
    downloadCount: 3,
    size: 8.7,
    status: 'generated'
  }
];

export default function AppHistoryDashboard({
  className,
  onAppSelect,
  onAppEdit,
  onAppDelete
}: AppHistoryDashboardProps) {
  const [apps, setApps] = useState<GeneratedApp[]>(MOCK_APPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<'all' | 'react' | 'vue' | 'vanilla'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'modified' | 'name' | 'downloads'>('created');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFramework = selectedFramework === 'all' || app.framework === selectedFramework;
    
    return matchesSearch && matchesFramework;
  });

  const sortedApps = [...filteredApps].sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'modified':
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      case 'downloads':
        return b.downloadCount - a.downloadCount;
      default:
        return 0;
    }
  });

  const toggleFavorite = (appId: string) => {
    setApps(prevApps =>
      prevApps.map(app =>
        app.id === appId ? { ...app, isFavorite: !app.isFavorite } : app
      )
    );
  };

  const handleDelete = (appId: string) => {
    setApps(prevApps => prevApps.filter(app => app.id !== appId));
    onAppDelete?.(appId);
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'react': return 'bg-blue-100 text-blue-800';
      case 'vue': return 'bg-green-100 text-green-800';
      case 'vanilla': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated': return <CodeBracketIcon className="h-4 w-4" />;
      case 'modified': return <PencilIcon className="h-4 w-4" />;
      case 'deployed': return <RocketLaunchIcon className="h-4 w-4" />;
      default: return <CodeBracketIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">App History</h2>
          <p className="text-gray-600 mt-1">
            Manage and revisit your AI-generated applications
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{apps.length}</div>
            <div className="text-xs text-gray-500">Total Apps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{apps.filter(a => a.isFavorite).length}</div>
            <div className="text-xs text-gray-500">Favorites</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{apps.reduce((sum, app) => sum + app.downloadCount, 0)}</div>
            <div className="text-xs text-gray-500">Downloads</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search apps by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Framework Filter */}
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Frameworks</option>
            <option value="react">React</option>
            <option value="vue">Vue</option>
            <option value="vanilla">Vanilla JS</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="created">Sort by Created</option>
            <option value="modified">Sort by Modified</option>
            <option value="name">Sort by Name</option>
            <option value="downloads">Sort by Downloads</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                viewMode === 'grid' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
              )}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                viewMode === 'list' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
              )}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Apps Grid/List */}
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      )}>
        <AnimatePresence>
          {sortedApps.map(app => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200",
                viewMode === 'list' && "flex items-center space-x-4 p-4"
              )}
            >
              {viewMode === 'grid' ? (
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{app.title}</h3>
                        <button
                          onClick={() => toggleFavorite(app.id)}
                          className="text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                          {app.isFavorite ? (
                            <StarSolidIcon className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <StarIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">{app.description}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={cn("px-2 py-1 text-xs font-medium rounded", getFrameworkColor(app.framework))}>
                      {app.framework}
                    </span>
                    <span className={cn("px-2 py-1 text-xs font-medium rounded", getComplexityColor(app.complexity))}>
                      {app.complexity}
                    </span>
                    {app.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center text-xs text-gray-500">
                    <div>
                      <div className="font-semibold text-gray-900">{app.downloadCount}</div>
                      <div>Downloads</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{app.size} KB</div>
                      <div>Size</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{app.features.length}</div>
                      <div>Features</div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    <div className="flex items-center space-x-2">
                      <CalendarDaysIcon className="h-4 w-4" />
                      <span>Created {app.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>Modified {app.lastModified.toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onAppSelect?.(app)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => onAppEdit?.(app)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* List View */}
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={cn("p-2 rounded-lg", getFrameworkColor(app.framework))}>
                      {getStatusIcon(app.status)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{app.title}</h3>
                        {app.isFavorite && <StarSolidIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                      </div>
                      <p className="text-gray-600 text-sm truncate">{app.description}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{app.framework}</span>
                        <span>{app.complexity}</span>
                        <span>{app.downloadCount} downloads</span>
                        <span>Modified {app.lastModified.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => onAppSelect?.(app)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => onAppEdit?.(app)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {sortedApps.length === 0 && (
        <div className="text-center py-12">
          <FolderOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No apps found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedFramework !== 'all'
              ? "No apps match your current filters. Try adjusting your search or filters."
              : "You haven't generated any apps yet. Create your first app to get started!"}
          </p>
          {(searchQuery || selectedFramework !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFramework('all');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}