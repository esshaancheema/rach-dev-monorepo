import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types for our global state
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'developer';
  subscription: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'development' | 'testing' | 'completed';
  technologies: string[];
  budget: number;
  timeline: string;
  assignedTeam: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es' | 'fr' | 'de' | 'ar' | 'hi' | 'zh';
  notifications: {
    email: boolean;
    push: boolean;
    projectUpdates: boolean;
    marketing: boolean;
  };
  preferences: {
    currency: 'USD' | 'EUR' | 'GBP';
    timezone: string;
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  };
}

// Store interfaces
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

interface ProjectActions {
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

interface SettingsState {
  settings: AppSettings;
}

interface SettingsActions {
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  searchQuery: string;
  currentPage: string;
  isLoading: boolean;
  modal: {
    isOpen: boolean;
    type: string | null;
    data: any;
  };
}

interface UIActions {
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: string) => void;
  setLoading: (loading: boolean) => void;
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
}

// Default settings
const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    projectUpdates: true,
    marketing: false,
  },
  preferences: {
    currency: 'USD',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
  },
};

// Auth Store
export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      immer((set) => ({
        // State
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: (user) =>
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
            state.error = null;
          }),

        logout: () =>
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
          }),

        updateUser: (updates) =>
          set((state) => {
            if (state.user) {
              Object.assign(state.user, updates);
            }
          }),

        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
          }),
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);

// Project Store
export const useProjectStore = create<ProjectState & ProjectActions>()(
  devtools(
    immer((set) => ({
      // State
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      // Actions
      setProjects: (projects) =>
        set((state) => {
          state.projects = projects;
        }),

      addProject: (project) =>
        set((state) => {
          state.projects.push(project);
        }),

      updateProject: (id, updates) =>
        set((state) => {
          const index = state.projects.findIndex((p) => p.id === id);
          if (index !== -1) {
            Object.assign(state.projects[index], updates, { updatedAt: new Date().toISOString() });
          }
          if (state.currentProject?.id === id) {
            Object.assign(state.currentProject, updates, { updatedAt: new Date().toISOString() });
          }
        }),

      deleteProject: (id) =>
        set((state) => {
          state.projects = state.projects.filter((p) => p.id !== id);
          if (state.currentProject?.id === id) {
            state.currentProject = null;
          }
        }),

      setCurrentProject: (project) =>
        set((state) => {
          state.currentProject = project;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),
    })),
    { name: 'project-store' }
  )
);

// Notification Store
export const useNotificationStore = create<NotificationState & NotificationActions>()(
  devtools(
    persist(
      immer((set) => ({
        // State
        notifications: [],
        unreadCount: 0,

        // Actions
        addNotification: (notification) =>
          set((state) => {
            const newNotification: Notification = {
              ...notification,
              id: Date.now().toString(),
              read: false,
              createdAt: new Date().toISOString(),
            };
            state.notifications.unshift(newNotification);
            state.unreadCount += 1;
          }),

        markAsRead: (id) =>
          set((state) => {
            const notification = state.notifications.find((n) => n.id === id);
            if (notification && !notification.read) {
              notification.read = true;
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
          }),

        markAllAsRead: () =>
          set((state) => {
            state.notifications.forEach((n) => {
              n.read = true;
            });
            state.unreadCount = 0;
          }),

        removeNotification: (id) =>
          set((state) => {
            const index = state.notifications.findIndex((n) => n.id === id);
            if (index !== -1) {
              const notification = state.notifications[index];
              if (!notification.read) {
                state.unreadCount = Math.max(0, state.unreadCount - 1);
              }
              state.notifications.splice(index, 1);
            }
          }),

        clearAll: () =>
          set((state) => {
            state.notifications = [];
            state.unreadCount = 0;
          }),
      })),
      {
        name: 'notification-storage',
        partialize: (state) => ({
          notifications: state.notifications.slice(0, 50), // Limit stored notifications
        }),
      }
    ),
    { name: 'notification-store' }
  )
);

// Settings Store
export const useSettingsStore = create<SettingsState & SettingsActions>()(
  devtools(
    persist(
      immer((set) => ({
        // State
        settings: defaultSettings,

        // Actions
        updateSettings: (updates) =>
          set((state) => {
            Object.assign(state.settings, updates);
          }),

        resetSettings: () =>
          set((state) => {
            state.settings = defaultSettings;
          }),
      })),
      {
        name: 'settings-storage',
      }
    ),
    { name: 'settings-store' }
  )
);

// UI Store
export const useUIStore = create<UIState & UIActions>()(
  devtools(
    immer((set) => ({
      // State
      sidebarOpen: true,
      mobileMenuOpen: false,
      searchQuery: '',
      currentPage: '',
      isLoading: false,
      modal: {
        isOpen: false,
        type: null,
        data: null,
      },

      // Actions
      setSidebarOpen: (open) =>
        set((state) => {
          state.sidebarOpen = open;
        }),

      setMobileMenuOpen: (open) =>
        set((state) => {
          state.mobileMenuOpen = open;
        }),

      setSearchQuery: (query) =>
        set((state) => {
          state.searchQuery = query;
        }),

      setCurrentPage: (page) =>
        set((state) => {
          state.currentPage = page;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      openModal: (type, data) =>
        set((state) => {
          state.modal = {
            isOpen: true,
            type,
            data: data || null,
          };
        }),

      closeModal: () =>
        set((state) => {
          state.modal = {
            isOpen: false,
            type: null,
            data: null,
          };
        }),
    })),
    { name: 'ui-store' }
  )
);

// Combined store hook for convenience
export const useAppStore = () => ({
  auth: useAuthStore(),
  projects: useProjectStore(),
  notifications: useNotificationStore(),
  settings: useSettingsStore(),
  ui: useUIStore(),
});

// Store actions for external use
export const storeActions = {
  auth: useAuthStore.getState(),
  projects: useProjectStore.getState(),
  notifications: useNotificationStore.getState(),
  settings: useSettingsStore.getState(),
  ui: useUIStore.getState(),
};

// Reset all stores (useful for logout)
export const resetAllStores = () => {
  useAuthStore.getState().logout();
  useProjectStore.setState({
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
  });
  useNotificationStore.getState().clearAll();
  useSettingsStore.getState().resetSettings();
  useUIStore.setState({
    sidebarOpen: true,
    mobileMenuOpen: false,
    searchQuery: '',
    currentPage: '',
    isLoading: false,
    modal: {
      isOpen: false,
      type: null,
      data: null,
    },
  });
};