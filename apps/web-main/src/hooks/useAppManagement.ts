'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SavedApp {
  id: string;
  title: string;
  description: string;
  prompt: string;
  code: string;
  framework: 'react' | 'vue' | 'vanilla';
  features: string[];
  complexity: 'simple' | 'moderate' | 'advanced';
  tags: string[];
  createdAt: Date;
  lastModified: Date;
  isFavorite: boolean;
  downloadCount: number;
  size: number; // in KB
  status: 'generated' | 'modified' | 'deployed';
  version: number;
  thumbnail?: string; // Base64 encoded thumbnail
  metadata?: {
    originalPrompt?: string;
    generationTime?: number;
    aiModel?: string;
    customizations?: string[];
  };
}

interface AppManagementState {
  apps: SavedApp[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: 'created' | 'modified' | 'name' | 'downloads';
  viewMode: 'grid' | 'list';
}

const STORAGE_KEY = 'zoptal_saved_apps';
const MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB limit

export function useAppManagement() {
  const [state, setState] = useState<AppManagementState>({
    apps: [],
    isLoading: true,
    error: null,
    searchQuery: '',
    selectedCategory: null,
    sortBy: 'created',
    viewMode: 'grid'
  });

  // Load apps from localStorage on mount
  useEffect(() => {
    loadApps();
  }, []);

  // Save to localStorage whenever apps change
  useEffect(() => {
    if (state.apps.length > 0) {
      saveAppsToStorage(state.apps);
    }
  }, [state.apps]);

  const loadApps = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const apps = parsed.map((app: any) => ({
          ...app,
          createdAt: new Date(app.createdAt),
          lastModified: new Date(app.lastModified)
        }));
        
        setState(prev => ({
          ...prev,
          apps,
          isLoading: false
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load apps:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load saved apps',
        isLoading: false
      }));
    }
  }, []);

  const saveAppsToStorage = (apps: SavedApp[]) => {
    try {
      const serialized = JSON.stringify(apps);
      
      // Check storage size
      if (serialized.length > MAX_STORAGE_SIZE) {
        // Remove oldest apps if storage is full
        const sortedApps = [...apps].sort((a, b) => 
          new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
        );
        
        // Remove apps until under size limit
        while (JSON.stringify(sortedApps).length > MAX_STORAGE_SIZE && sortedApps.length > 0) {
          sortedApps.shift();
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedApps));
        
        setState(prev => ({
          ...prev,
          apps: sortedApps,
          error: 'Storage full. Some older apps were removed.'
        }));
      } else {
        localStorage.setItem(STORAGE_KEY, serialized);
      }
    } catch (error) {
      console.error('Failed to save apps:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to save apps to storage'
      }));
    }
  };

  const saveApp = useCallback(async (appData: {
    title: string;
    description: string;
    prompt: string;
    code: string;
    framework: 'react' | 'vue' | 'vanilla';
    features: string[];
    complexity: 'simple' | 'moderate' | 'advanced';
    tags?: string[];
    metadata?: SavedApp['metadata'];
  }): Promise<SavedApp> => {
    const now = new Date();
    const newApp: SavedApp = {
      id: generateId(),
      title: appData.title,
      description: appData.description,
      prompt: appData.prompt,
      code: appData.code,
      framework: appData.framework,
      features: appData.features,
      complexity: appData.complexity,
      tags: appData.tags || [],
      createdAt: now,
      lastModified: now,
      isFavorite: false,
      downloadCount: 0,
      size: calculateAppSize(appData.code),
      status: 'generated',
      version: 1,
      metadata: appData.metadata
    };

    setState(prev => ({
      ...prev,
      apps: [newApp, ...prev.apps]
    }));

    return newApp;
  }, []);

  const updateApp = useCallback(async (appId: string, updates: Partial<SavedApp>): Promise<SavedApp | null> => {
    setState(prev => ({
      ...prev,
      apps: prev.apps.map(app => 
        app.id === appId 
          ? { 
              ...app, 
              ...updates, 
              lastModified: new Date(),
              version: app.version + 1,
              status: updates.code && updates.code !== app.code ? 'modified' : app.status
            }
          : app
      )
    }));

    const updatedApp = state.apps.find(app => app.id === appId);
    return updatedApp || null;
  }, [state.apps]);

  const deleteApp = useCallback(async (appId: string): Promise<boolean> => {
    try {
      setState(prev => ({
        ...prev,
        apps: prev.apps.filter(app => app.id !== appId)
      }));
      return true;
    } catch (error) {
      console.error('Failed to delete app:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to delete app'
      }));
      return false;
    }
  }, []);

  const duplicateApp = useCallback(async (appId: string): Promise<SavedApp | null> => {
    const originalApp = state.apps.find(app => app.id === appId);
    if (!originalApp) return null;

    const duplicatedApp = await saveApp({
      title: `${originalApp.title} (Copy)`,
      description: originalApp.description,
      prompt: originalApp.prompt,
      code: originalApp.code,
      framework: originalApp.framework,
      features: originalApp.features,
      complexity: originalApp.complexity,
      tags: originalApp.tags,
      metadata: {
        ...originalApp.metadata,
        originalPrompt: originalApp.metadata?.originalPrompt || originalApp.prompt
      }
    });

    return duplicatedApp;
  }, [state.apps, saveApp]);

  const toggleFavorite = useCallback(async (appId: string): Promise<void> => {
    await updateApp(appId, {
      isFavorite: !state.apps.find(app => app.id === appId)?.isFavorite
    });
  }, [state.apps, updateApp]);

  const incrementDownloadCount = useCallback(async (appId: string): Promise<void> => {
    const app = state.apps.find(app => app.id === appId);
    if (app) {
      await updateApp(appId, {
        downloadCount: app.downloadCount + 1
      });
    }
  }, [state.apps, updateApp]);

  const addTags = useCallback(async (appId: string, newTags: string[]): Promise<void> => {
    const app = state.apps.find(app => app.id === appId);
    if (app) {
      const uniqueTags = [...new Set([...app.tags, ...newTags])];
      await updateApp(appId, { tags: uniqueTags });
    }
  }, [state.apps, updateApp]);

  const removeTags = useCallback(async (appId: string, tagsToRemove: string[]): Promise<void> => {
    const app = state.apps.find(app => app.id === appId);
    if (app) {
      const filteredTags = app.tags.filter(tag => !tagsToRemove.includes(tag));
      await updateApp(appId, { tags: filteredTags });
    }
  }, [state.apps, updateApp]);

  const exportApp = useCallback((appId: string): string | null => {
    const app = state.apps.find(app => app.id === appId);
    if (!app) return null;

    try {
      return JSON.stringify(app, null, 2);
    } catch (error) {
      console.error('Failed to export app:', error);
      return null;
    }
  }, [state.apps]);

  const importApp = useCallback(async (appData: string): Promise<SavedApp | null> => {
    try {
      const parsed = JSON.parse(appData) as SavedApp;
      
      // Validate required fields
      if (!parsed.title || !parsed.code || !parsed.framework) {
        throw new Error('Invalid app data');
      }

      return await saveApp({
        title: `${parsed.title} (Imported)`,
        description: parsed.description || '',
        prompt: parsed.prompt || '',
        code: parsed.code,
        framework: parsed.framework,
        features: parsed.features || [],
        complexity: parsed.complexity || 'simple',
        tags: parsed.tags || [],
        metadata: {
          ...parsed.metadata,
          originalPrompt: parsed.metadata?.originalPrompt || parsed.prompt
        }
      });
    } catch (error) {
      console.error('Failed to import app:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to import app. Please check the file format.'
      }));
      return null;
    }
  }, [saveApp]);

  const getFilteredApps = useCallback(() => {
    let filtered = [...state.apps];

    // Search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.title.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.tags.some(tag => tag.toLowerCase().includes(query)) ||
        app.framework.toLowerCase().includes(query)
      );
    }

    // Category filter (by framework or complexity)
    if (state.selectedCategory) {
      if (['react', 'vue', 'vanilla'].includes(state.selectedCategory)) {
        filtered = filtered.filter(app => app.framework === state.selectedCategory);
      } else if (['simple', 'moderate', 'advanced'].includes(state.selectedCategory)) {
        filtered = filtered.filter(app => app.complexity === state.selectedCategory);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (state.sortBy) {
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

    return filtered;
  }, [state]);

  const getAppStats = useCallback(() => {
    const totalApps = state.apps.length;
    const favoriteApps = state.apps.filter(app => app.isFavorite).length;
    const totalDownloads = state.apps.reduce((sum, app) => sum + app.downloadCount, 0);
    const frameworkCounts = state.apps.reduce((acc, app) => {
      acc[app.framework] = (acc[app.framework] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const storageUsed = JSON.stringify(state.apps).length;
    const storagePercentage = (storageUsed / MAX_STORAGE_SIZE) * 100;

    return {
      totalApps,
      favoriteApps,
      totalDownloads,
      frameworkCounts,
      storageUsed,
      storagePercentage: Math.min(storagePercentage, 100)
    };
  }, [state.apps]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setSelectedCategory = useCallback((category: string | null) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  const setSortBy = useCallback((sortBy: AppManagementState['sortBy']) => {
    setState(prev => ({ ...prev, sortBy }));
  }, []);

  const setViewMode = useCallback((viewMode: AppManagementState['viewMode']) => {
    setState(prev => ({ ...prev, viewMode }));
  }, []);

  return {
    // State
    apps: state.apps,
    filteredApps: getFilteredApps(),
    isLoading: state.isLoading,
    error: state.error,
    searchQuery: state.searchQuery,
    selectedCategory: state.selectedCategory,
    sortBy: state.sortBy,
    viewMode: state.viewMode,
    stats: getAppStats(),

    // Actions
    saveApp,
    updateApp,
    deleteApp,
    duplicateApp,
    toggleFavorite,
    incrementDownloadCount,
    addTags,
    removeTags,
    exportApp,
    importApp,
    loadApps,
    clearError,

    // Filters and UI
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    setViewMode
  };
}

// Helper functions
function generateId(): string {
  return 'app_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function calculateAppSize(code: string): number {
  // Calculate approximate size in KB
  const sizeInBytes = new Blob([code]).size;
  return Math.round(sizeInBytes / 1024 * 10) / 10; // Round to 1 decimal place
}