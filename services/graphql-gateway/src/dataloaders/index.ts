import DataLoader from 'dataloader';
import Redis from 'ioredis';
import axios from 'axios';
import { logger } from '../utils/logger';
import { config } from '../config/config';

interface DataLoaderOptions {
  redis: Redis;
  services: Record<string, string>;
  user?: any;
}

export interface DataLoaders {
  // User loaders
  user: DataLoader<string, any>;
  usersByIds: DataLoader<string[], any[]>;
  
  // Project loaders
  project: DataLoader<string, any>;
  projectsByUser: DataLoader<string, any>;
  projectsByIds: DataLoader<string[], any[]>;
  
  // File loaders
  file: DataLoader<string, any>;
  filesByProject: DataLoader<string, any[]>;
  filesByFolder: DataLoader<string, any[]>;
  folder: DataLoader<string, any>;
  foldersByProject: DataLoader<string, any[]>;
  childFolders: DataLoader<string, any[]>;
  
  // Collaboration loaders
  collaboratorsByProject: DataLoader<string, any[]>;
  invitationsByProject: DataLoader<string, any[]>;
  
  // AI loaders
  aiSession: DataLoader<string, any>;
  aiSessionsByProject: DataLoader<string, any[]>;
  aiSessionsByUser: DataLoader<string, any[]>;
  messagesBySession: DataLoader<string, any[]>;
  
  // Notification loaders
  notification: DataLoader<string, any>;
  notificationsByUser: DataLoader<string, any>;
  
  // Billing loaders
  billingInfo: DataLoader<string, any>;
  subscription: DataLoader<string, any>;
  subscriptionPlan: DataLoader<string, any>;
  paymentMethod: DataLoader<string, any>;
  paymentMethodsByUser: DataLoader<string, any[]>;
  invoice: DataLoader<string, any>;
  invoicesByUser: DataLoader<string, any>;
  invoiceItemsByInvoice: DataLoader<string, any[]>;
  transaction: DataLoader<string, any>;
  transactionsByUser: DataLoader<string, any>;
  
  // Analytics loaders
  projectStats: DataLoader<string, any>;
  
  // Auth loaders
  auth: {
    login: (credentials: any) => Promise<any>;
    register: (data: any) => Promise<any>;
    logout: (userId: string) => Promise<boolean>;
    refreshToken: (token: string) => Promise<any>;
  };
}

// Base HTTP client with auth headers
function createHttpClient(baseURL: string, user?: any) {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth header if user is present
  if (user) {
    client.defaults.headers['Authorization'] = `Bearer ${user.token}`;
    client.defaults.headers['X-User-ID'] = user.id;
    client.defaults.headers['X-Tenant-ID'] = user.tenantId;
  }

  return client;
}

// Create cache key
function createCacheKey(prefix: string, key: string | string[]): string {
  const keyStr = Array.isArray(key) ? key.join(',') : key;
  return `graphql:${prefix}:${keyStr}`;
}

// Generic cached loader factory
function createCachedLoader<K, V>(
  redis: Redis,
  cachePrefix: string,
  batchFunction: (keys: readonly K[]) => Promise<(V | Error)[]>,
  options: {
    ttl?: number;
    maxBatchSize?: number;
    cacheKeyFn?: (key: K) => string;
  } = {}
): DataLoader<K, V> {
  const { ttl = config.cache.ttl, maxBatchSize = 100, cacheKeyFn } = options;

  return new DataLoader<K, V>(
    async (keys) => {
      const cacheKeys = keys.map(key => 
        createCacheKey(cachePrefix, cacheKeyFn ? cacheKeyFn(key) : String(key))
      );
      
      try {
        // Try to get from cache first
        const cachedResults = await redis.mget(...cacheKeys);
        const uncachedKeys: K[] = [];
        const keyIndexMap = new Map<string, number>();
        
        keys.forEach((key, index) => {
          if (cachedResults[index] === null) {
            uncachedKeys.push(key);
            keyIndexMap.set(String(key), index);
          }
        });

        let results: (V | Error)[] = cachedResults.map((cached, index) => {
          if (cached !== null) {
            try {
              return JSON.parse(cached);
            } catch (error) {
              logger.warn('Failed to parse cached result', { cacheKey: cacheKeys[index], error });
              uncachedKeys.push(keys[index]);
              keyIndexMap.set(String(keys[index]), index);
              return null;
            }
          }
          return null;
        });

        // Fetch uncached data
        if (uncachedKeys.length > 0) {
          const freshResults = await batchFunction(uncachedKeys);
          
          // Cache fresh results and merge with cached ones
          const pipeline = redis.pipeline();
          
          freshResults.forEach((result, index) => {
            const originalKey = uncachedKeys[index];
            const originalIndex = keyIndexMap.get(String(originalKey));
            
            if (originalIndex !== undefined && !(result instanceof Error)) {
              results[originalIndex] = result;
              const cacheKey = createCacheKey(cachePrefix, cacheKeyFn ? cacheKeyFn(originalKey) : String(originalKey));
              pipeline.setex(cacheKey, ttl, JSON.stringify(result));
            } else if (originalIndex !== undefined) {
              results[originalIndex] = result;
            }
          });
          
          await pipeline.exec();
        }

        return results.filter(result => result !== null) as (V | Error)[];
      } catch (error) {
        logger.error('DataLoader cache error, falling back to direct fetch', { error, cachePrefix });
        return batchFunction(keys);
      }
    },
    {
      maxBatchSize,
      cacheKeyFn: cacheKeyFn ? (key: K) => String(cacheKeyFn(key)) : undefined,
    }
  );
}

export function createDataLoaders({ redis, services, user }: DataLoaderOptions): DataLoaders {
  // HTTP clients for each service
  const authClient = createHttpClient(services.auth, user);
  const projectClient = createHttpClient(services.project, user);
  const aiClient = createHttpClient(services.ai, user);
  const notificationClient = createHttpClient(services.notification, user);
  const billingClient = createHttpClient(services.billing, user);

  return {
    // User loaders
    user: createCachedLoader(
      redis,
      'user',
      async (ids) => {
        try {
          const response = await authClient.post('/api/auth/users/batch', { ids });
          return response.data.users || [];
        } catch (error) {
          logger.error('Failed to batch load users', { error, ids });
          return ids.map(() => new Error('Failed to load user'));
        }
      },
      { ttl: 300 } // 5 minutes cache for user data
    ),

    usersByIds: createCachedLoader(
      redis,
      'users_batch',
      async (idArrays) => {
        try {
          const allIds = [...new Set(idArrays.flat())];
          const response = await authClient.post('/api/auth/users/batch', { ids: allIds });
          const usersMap = new Map(response.data.users.map((user: any) => [user.id, user]));
          
          return idArrays.map(ids => ids.map(id => usersMap.get(id)).filter(Boolean));
        } catch (error) {
          logger.error('Failed to batch load user arrays', { error });
          return idArrays.map(() => []);
        }
      }
    ),

    // Project loaders
    project: createCachedLoader(
      redis,
      'project',
      async (ids) => {
        try {
          const response = await projectClient.post('/api/projects/batch', { ids });
          return response.data.projects || [];
        } catch (error) {
          logger.error('Failed to batch load projects', { error, ids });
          return ids.map(() => new Error('Failed to load project'));
        }
      }
    ),

    projectsByUser: createCachedLoader(
      redis,
      'projects_by_user',
      async (userIds) => {
        try {
          const promises = userIds.map(userId => 
            projectClient.get(`/api/projects?userId=${userId}&limit=100`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => {
            if (result.status === 'fulfilled') {
              return {
                edges: result.value.data.projects.map((project: any) => ({
                  node: project,
                  cursor: project.id,
                })),
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                },
                totalCount: result.value.data.projects.length,
              };
            }
            return { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 };
          });
        } catch (error) {
          logger.error('Failed to batch load projects by user', { error });
          return userIds.map(() => ({ edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 }));
        }
      },
      { ttl: 60 } // 1 minute cache for project lists
    ),

    projectsByIds: createCachedLoader(
      redis,
      'projects_batch',
      async (idArrays) => {
        try {
          const allIds = [...new Set(idArrays.flat())];
          const response = await projectClient.post('/api/projects/batch', { ids: allIds });
          const projectsMap = new Map(response.data.projects.map((project: any) => [project.id, project]));
          
          return idArrays.map(ids => ids.map(id => projectsMap.get(id)).filter(Boolean));
        } catch (error) {
          logger.error('Failed to batch load project arrays', { error });
          return idArrays.map(() => []);
        }
      }
    ),

    // File loaders
    file: createCachedLoader(
      redis,
      'file',
      async (ids) => {
        try {
          const response = await projectClient.post('/api/files/batch', { ids });
          return response.data.files || [];
        } catch (error) {
          logger.error('Failed to batch load files', { error, ids });
          return ids.map(() => new Error('Failed to load file'));
        }
      }
    ),

    filesByProject: createCachedLoader(
      redis,
      'files_by_project',
      async (projectIds) => {
        try {
          const promises = projectIds.map(projectId => 
            projectClient.get(`/api/projects/${projectId}/files`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => 
            result.status === 'fulfilled' ? result.value.data.files || [] : []
          );
        } catch (error) {
          logger.error('Failed to batch load files by project', { error });
          return projectIds.map(() => []);
        }
      },
      { ttl: 30 } // 30 seconds cache for file lists
    ),

    filesByFolder: createCachedLoader(
      redis,
      'files_by_folder',
      async (folderIds) => {
        try {
          const promises = folderIds.map(folderId => 
            projectClient.get(`/api/folders/${folderId}/files`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => 
            result.status === 'fulfilled' ? result.value.data.files || [] : []
          );
        } catch (error) {
          logger.error('Failed to batch load files by folder', { error });
          return folderIds.map(() => []);
        }
      }
    ),

    folder: createCachedLoader(
      redis,
      'folder',
      async (ids) => {
        try {
          const response = await projectClient.post('/api/folders/batch', { ids });
          return response.data.folders || [];
        } catch (error) {
          logger.error('Failed to batch load folders', { error, ids });
          return ids.map(() => new Error('Failed to load folder'));
        }
      }
    ),

    foldersByProject: createCachedLoader(
      redis,
      'folders_by_project',
      async (projectIds) => {
        try {
          const promises = projectIds.map(projectId => 
            projectClient.get(`/api/projects/${projectId}/folders`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => 
            result.status === 'fulfilled' ? result.value.data.folders || [] : []
          );
        } catch (error) {
          logger.error('Failed to batch load folders by project', { error });
          return projectIds.map(() => []);
        }
      }
    ),

    childFolders: createCachedLoader(
      redis,
      'child_folders',
      async (parentIds) => {
        try {
          const promises = parentIds.map(parentId => 
            projectClient.get(`/api/folders/${parentId}/children`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => 
            result.status === 'fulfilled' ? result.value.data.folders || [] : []
          );
        } catch (error) {
          logger.error('Failed to batch load child folders', { error });
          return parentIds.map(() => []);
        }
      }
    ),

    // Collaboration loaders
    collaboratorsByProject: createCachedLoader(
      redis,
      'collaborators_by_project',
      async (projectIds) => {
        try {
          const promises = projectIds.map(projectId => 
            projectClient.get(`/api/projects/${projectId}/collaborators`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => 
            result.status === 'fulfilled' ? result.value.data.collaborators || [] : []
          );
        } catch (error) {
          logger.error('Failed to batch load collaborators by project', { error });
          return projectIds.map(() => []);
        }
      },
      { ttl: 60 } // 1 minute cache for collaboration data
    ),

    invitationsByProject: createCachedLoader(
      redis,
      'invitations_by_project',
      async (projectIds) => {
        try {
          const promises = projectIds.map(projectId => 
            projectClient.get(`/api/projects/${projectId}/invitations`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => 
            result.status === 'fulfilled' ? result.value.data.invitations || [] : []
          );
        } catch (error) {
          logger.error('Failed to batch load invitations by project', { error });
          return projectIds.map(() => []);
        }
      }
    ),

    // AI loaders
    aiSession: createCachedLoader(
      redis,
      'ai_session',
      async (ids) => {
        try {
          const response = await aiClient.post('/api/ai/sessions/batch', { ids });
          return response.data.sessions || [];
        } catch (error) {
          logger.error('Failed to batch load AI sessions', { error, ids });
          return ids.map(() => new Error('Failed to load AI session'));
        }
      }
    ),

    aiSessionsByProject: createCachedLoader(
      redis,
      'ai_sessions_by_project',
      async (projectIds) => {
        try {
          const promises = projectIds.map(projectId => 
            aiClient.get(`/api/ai/sessions?projectId=${projectId}`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => 
            result.status === 'fulfilled' ? result.value.data.sessions || [] : []
          );
        } catch (error) {
          logger.error('Failed to batch load AI sessions by project', { error });
          return projectIds.map(() => []);
        }
      },
      { ttl: 30 } // 30 seconds cache for AI session lists
    ),

    aiSessionsByUser: createCachedLoader(
      redis,
      'ai_sessions_by_user',
      async (userIds) => {
        try {
          const promises = userIds.map(userId => 
            aiClient.get(`/api/ai/sessions?userId=${userId}`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => 
            result.status === 'fulfilled' ? result.value.data.sessions || [] : []
          );
        } catch (error) {
          logger.error('Failed to batch load AI sessions by user', { error });
          return userIds.map(() => []);
        }
      }
    ),

    messagesBySession: createCachedLoader(
      redis,
      'messages_by_session',
      async (sessionIds) => {
        try {
          const promises = sessionIds.map(sessionId => 
            aiClient.get(`/api/ai/sessions/${sessionId}/messages`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => 
            result.status === 'fulfilled' ? result.value.data.messages || [] : []
          );
        } catch (error) {
          logger.error('Failed to batch load messages by session', { error });
          return sessionIds.map(() => []);
        }
      },
      { ttl: 10 } // 10 seconds cache for messages (frequently updated)
    ),

    // Notification loaders
    notification: createCachedLoader(
      redis,
      'notification',
      async (ids) => {
        try {
          const response = await notificationClient.post('/api/notifications/batch', { ids });
          return response.data.notifications || [];
        } catch (error) {
          logger.error('Failed to batch load notifications', { error, ids });
          return ids.map(() => new Error('Failed to load notification'));
        }
      }
    ),

    notificationsByUser: createCachedLoader(
      redis,
      'notifications_by_user',
      async (userIds) => {
        try {
          const promises = userIds.map(userId => 
            notificationClient.get(`/api/notifications?userId=${userId}&limit=50`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => {
            if (result.status === 'fulfilled') {
              const notifications = result.value.data.notifications || [];
              return {
                edges: notifications.map((notification: any) => ({
                  node: notification,
                  cursor: notification.id,
                })),
                pageInfo: {
                  hasNextPage: notifications.length === 50,
                  hasPreviousPage: false,
                },
                totalCount: result.value.data.totalCount || notifications.length,
                unreadCount: result.value.data.unreadCount || 0,
              };
            }
            return { 
              edges: [], 
              pageInfo: { hasNextPage: false, hasPreviousPage: false }, 
              totalCount: 0, 
              unreadCount: 0 
            };
          });
        } catch (error) {
          logger.error('Failed to batch load notifications by user', { error });
          return userIds.map(() => ({ 
            edges: [], 
            pageInfo: { hasNextPage: false, hasPreviousPage: false }, 
            totalCount: 0, 
            unreadCount: 0 
          }));
        }
      },
      { ttl: 10 } // 10 seconds cache for notifications
    ),

    // Billing loaders
    billingInfo: createCachedLoader(
      redis,
      'billing_info',
      async (userIds) => {
        try {
          const promises = userIds.map(userId => 
            billingClient.get(`/api/billing/users/${userId}`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => 
            result.status === 'fulfilled' ? result.value.data || null : null
          );
        } catch (error) {
          logger.error('Failed to batch load billing info', { error });
          return userIds.map(() => null);
        }
      },
      { ttl: 300 } // 5 minutes cache for billing data
    ),

    subscription: createCachedLoader(
      redis,
      'subscription',
      async (userIds) => {
        try {
          const promises = userIds.map(userId => 
            billingClient.get(`/api/billing/users/${userId}/subscription`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => 
            result.status === 'fulfilled' ? result.value.data || null : null
          );
        } catch (error) {
          logger.error('Failed to batch load subscriptions', { error });
          return userIds.map(() => null);
        }
      }
    ),

    subscriptionPlan: createCachedLoader(
      redis,
      'subscription_plan',
      async (planIds) => {
        try {
          const response = await billingClient.post('/api/billing/plans/batch', { ids: planIds });
          return response.data.plans || [];
        } catch (error) {
          logger.error('Failed to batch load subscription plans', { error });
          return planIds.map(() => new Error('Failed to load subscription plan'));
        }
      },
      { ttl: 3600 } // 1 hour cache for subscription plans
    ),

    paymentMethod: createCachedLoader(
      redis,
      'payment_method',
      async (ids) => {
        try {
          const response = await billingClient.post('/api/billing/payment-methods/batch', { ids });
          return response.data.paymentMethods || [];
        } catch (error) {
          logger.error('Failed to batch load payment methods', { error });
          return ids.map(() => new Error('Failed to load payment method'));
        }
      }
    ),

    paymentMethodsByUser: createCachedLoader(
      redis,
      'payment_methods_by_user',
      async (userIds) => {
        try {
          const promises = userIds.map(userId => 
            billingClient.get(`/api/billing/users/${userId}/payment-methods`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => 
            result.status === 'fulfilled' ? result.value.data.paymentMethods || [] : []
          );
        } catch (error) {
          logger.error('Failed to batch load payment methods by user', { error });
          return userIds.map(() => []);
        }
      }
    ),

    invoice: createCachedLoader(
      redis,
      'invoice',
      async (ids) => {
        try {
          const response = await billingClient.post('/api/billing/invoices/batch', { ids });
          return response.data.invoices || [];
        } catch (error) {
          logger.error('Failed to batch load invoices', { error });
          return ids.map(() => new Error('Failed to load invoice'));
        }
      }
    ),

    invoicesByUser: createCachedLoader(
      redis,
      'invoices_by_user',
      async (userIds) => {
        try {
          const promises = userIds.map(userId => 
            billingClient.get(`/api/billing/users/${userId}/invoices`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => {
            if (result.status === 'fulfilled') {
              const invoices = result.value.data.invoices || [];
              return {
                edges: invoices.map((invoice: any) => ({
                  node: invoice,
                  cursor: invoice.id,
                })),
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                },
                totalCount: invoices.length,
              };
            }
            return { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 };
          });
        } catch (error) {
          logger.error('Failed to batch load invoices by user', { error });
          return userIds.map(() => ({ edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 }));
        }
      }
    ),

    invoiceItemsByInvoice: createCachedLoader(
      redis,
      'invoice_items_by_invoice',
      async (invoiceIds) => {
        try {
          const promises = invoiceIds.map(invoiceId => 
            billingClient.get(`/api/billing/invoices/${invoiceId}/items`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => 
            result.status === 'fulfilled' ? result.value.data.items || [] : []
          );
        } catch (error) {
          logger.error('Failed to batch load invoice items by invoice', { error });
          return invoiceIds.map(() => []);
        }
      }
    ),

    transaction: createCachedLoader(
      redis,
      'transaction',
      async (ids) => {
        try {
          const response = await billingClient.post('/api/billing/transactions/batch', { ids });
          return response.data.transactions || [];
        } catch (error) {
          logger.error('Failed to batch load transactions', { error });
          return ids.map(() => new Error('Failed to load transaction'));
        }
      }
    ),

    transactionsByUser: createCachedLoader(
      redis,
      'transactions_by_user',
      async (userIds) => {
        try {
          const promises = userIds.map(userId => 
            billingClient.get(`/api/billing/users/${userId}/transactions`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => {
            if (result.status === 'fulfilled') {
              const transactions = result.value.data.transactions || [];
              return {
                edges: transactions.map((transaction: any) => ({
                  node: transaction,
                  cursor: transaction.id,
                })),
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                },
                totalCount: transactions.length,
              };
            }
            return { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 };
          });
        } catch (error) {
          logger.error('Failed to batch load transactions by user', { error });
          return userIds.map(() => ({ edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 }));
        }
      }
    ),

    // Analytics loaders
    projectStats: createCachedLoader(
      redis,
      'project_stats',
      async (projectIds) => {
        try {
          const promises = projectIds.map(projectId => 
            projectClient.get(`/api/projects/${projectId}/stats`)
          );
          const responses = await Promise.allSettled(promises);
          
          return responses.map(result => 
            result.status === 'fulfilled' ? result.value.data || null : null
          );
        } catch (error) {
          logger.error('Failed to batch load project stats', { error });
          return projectIds.map(() => null);
        }
      },
      { ttl: 300 } // 5 minutes cache for stats
    ),

    // Auth operations (not cached)
    auth: {
      login: async (credentials) => {
        try {
          const response = await authClient.post('/api/auth/login', credentials);
          return response.data;
        } catch (error) {
          logger.error('Login failed', { error });
          throw new Error('Invalid credentials');
        }
      },

      register: async (data) => {
        try {
          const response = await authClient.post('/api/auth/register', data);
          return response.data;
        } catch (error) {
          logger.error('Registration failed', { error });
          throw new Error('Registration failed');
        }
      },

      logout: async (userId) => {
        try {
          await authClient.post('/api/auth/logout', { userId });
          
          // Clear user-related cache
          const pattern = `graphql:*${userId}*`;
          const keys = await redis.keys(pattern);
          if (keys.length > 0) {
            await redis.del(...keys);
          }
          
          return true;
        } catch (error) {
          logger.error('Logout failed', { error });
          return false;
        }
      },

      refreshToken: async (token) => {
        try {
          const response = await authClient.post('/api/auth/refresh', { refreshToken: token });
          return response.data;
        } catch (error) {
          logger.error('Token refresh failed', { error });
          throw new Error('Invalid refresh token');
        }
      },
    },
  };
}