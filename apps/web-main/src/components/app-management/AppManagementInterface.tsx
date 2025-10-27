'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  StarIcon,
  ShareIcon,
  TagIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  FolderOpenIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  CodeBracketIcon,
  ListBulletIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { useAppManagement, SavedApp } from '@/hooks/useAppManagement';

interface AppManagementInterfaceProps {
  className?: string;
  onAppSelect?: (app: SavedApp) => void;
  onAppEdit?: (app: SavedApp) => void;
  onCreateNew?: () => void;
}

interface ConfirmationModal {
  isOpen: boolean;
  type: 'delete' | 'clear-all';
  appId?: string;
  appTitle?: string;
}

export default function AppManagementInterface({
  className,
  onAppSelect,
  onAppEdit,
  onCreateNew
}: AppManagementInterfaceProps) {
  const {
    filteredApps,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    sortBy,
    viewMode,
    stats,
    deleteApp,
    duplicateApp,
    toggleFavorite,
    incrementDownloadCount,
    exportApp,
    importApp,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    setViewMode,
    clearError
  } = useAppManagement();

  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal>({
    isOpen: false,
    type: 'delete'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['all', 'react', 'vue', 'vanilla', 'simple', 'moderate', 'advanced', 'favorites'];

  const handleSelectApp = (appId: string) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(appId)) {
      newSelected.delete(appId);
    } else {
      newSelected.add(appId);
    }
    setSelectedApps(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedApps.size === filteredApps.length) {
      setSelectedApps(new Set());
    } else {
      setSelectedApps(new Set(filteredApps.map(app => app.id)));
    }
  };

  const handleDeleteApp = async (appId: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      appId,
      appTitle: filteredApps.find(app => app.id === appId)?.title
    });
  };

  const confirmDelete = async () => {
    if (confirmationModal.appId) {
      await deleteApp(confirmationModal.appId);
      setSelectedApps(prev => {
        const newSet = new Set(prev);
        newSet.delete(confirmationModal.appId!);
        return newSet;
      });
    }
    setConfirmationModal({ isOpen: false, type: 'delete' });
  };

  const handleBulkDelete = () => {
    if (selectedApps.size > 0) {
      setConfirmationModal({
        isOpen: true,
        type: 'clear-all'
      });
    }
  };

  const confirmBulkDelete = async () => {
    for (const appId of selectedApps) {
      await deleteApp(appId);
    }
    setSelectedApps(new Set());
    setConfirmationModal({ isOpen: false, type: 'delete' });
  };

  const handleDuplicateApp = async (appId: string) => {
    await duplicateApp(appId);
  };

  const handleDownloadApp = (appId: string) => {
    const exported = exportApp(appId);
    if (exported) {
      const blob = new Blob([exported], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `app-${appId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      incrementDownloadCount(appId);
    }
  };

  const handleImportApp = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        await importApp(text);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Failed to import app:', error);
      }
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading apps...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">App Management</h2>
            <p className="text-gray-600 mt-1">
              Organize, edit, and manage your AI-generated applications
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create New</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <CloudArrowUpIcon className="h-5 w-5" />
              <span>Import</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalApps}</div>
            <div className="text-sm text-blue-700">Total Apps</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.favoriteApps}</div>
            <div className="text-sm text-yellow-700">Favorites</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.totalDownloads}</div>
            <div className="text-sm text-green-700">Downloads</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{Math.round(stats.storagePercentage)}%</div>
            <div className="text-sm text-purple-700">Storage Used</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{Object.keys(stats.frameworkCounts).length}</div>
            <div className="text-sm text-gray-700">Frameworks</div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
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

          <select
            value={selectedCategory || 'all'}
            onChange={(e) => setSelectedCategory(e.target.value === 'all' ? null : e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

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

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'grid' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
              )}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'list' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
              )}
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedApps.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between"
          >
            <span className="text-sm text-gray-600">
              {selectedApps.size} app{selectedApps.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkDelete}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-sm flex items-center space-x-1"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete Selected</span>
              </button>
              <button
                onClick={() => setSelectedApps(new Set())}
                className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Apps Grid/List */}
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      )}>
        <AnimatePresence>
          {filteredApps.map(app => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200",
                selectedApps.has(app.id) && "ring-2 ring-blue-500 border-blue-500",
                viewMode === 'list' && "flex items-center space-x-4 p-4"
              )}
            >
              {viewMode === 'grid' ? (
                <div className="p-6">
                  {/* Selection Checkbox and Favorite */}
                  <div className="flex items-start justify-between mb-4">
                    <input
                      type="checkbox"
                      checked={selectedApps.has(app.id)}
                      onChange={() => handleSelectApp(app.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
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

                  {/* Title and Description */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{app.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{app.description}</p>

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

                  {/* Meta Info */}
                  <div className="text-xs text-gray-500 space-y-1 mb-4">
                    <div>Created: {app.createdAt.toLocaleDateString()}</div>
                    <div>Size: {app.size} KB • Downloads: {app.downloadCount}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onAppSelect?.(app)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
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
                      onClick={() => handleDuplicateApp(app.id)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadApp(app.id)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteApp(app.id)}
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
                  <input
                    type="checkbox"
                    checked={selectedApps.has(app.id)}
                    onChange={() => handleSelectApp(app.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={cn("p-2 rounded-lg", getFrameworkColor(app.framework))}>
                      <CodeBracketIcon className="h-4 w-4" />
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
                        <span>{app.size} KB</span>
                        <span>{app.downloadCount} downloads</span>
                        <span>Modified {app.lastModified.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => onAppSelect?.(app)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
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
                      onClick={() => handleDeleteApp(app.id)}
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
      {filteredApps.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FolderOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No apps found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedCategory
              ? "No apps match your current filters."
              : "You haven't created any apps yet."}
          </p>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Your First App
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmationModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {confirmationModal.type === 'delete' ? 'Delete App' : 'Delete Selected Apps'}
                  </h3>
                  <p className="text-gray-600 text-sm">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                {confirmationModal.type === 'delete' 
                  ? `Are you sure you want to delete "${confirmationModal.appTitle}"?`
                  : `Are you sure you want to delete ${selectedApps.size} selected app${selectedApps.size !== 1 ? 's' : ''}?`
                }
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmationModal({ isOpen: false, type: 'delete' })}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmationModal.type === 'delete' ? confirmDelete : confirmBulkDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportApp}
        className="hidden"
      />
    </div>
  );
}