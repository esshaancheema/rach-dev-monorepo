import { Context } from '../types/context';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { DateTimeResolver, EmailAddressResolver, JSONResolver, UUIDResolver } from 'graphql-scalars';
import { userResolvers } from './user';
import { projectResolvers } from './project';
import { aiResolvers } from './ai';
import { notificationResolvers } from './notification';
import { billingResolvers } from './billing';
import { searchResolvers } from './search';
import { analyticsResolvers } from './analytics';

// Custom Upload scalar for file uploads
const Upload = new GraphQLScalarType({
  name: 'Upload',
  description: 'The `Upload` special type, represents a file upload promise.',
  parseValue: (value) => value,
  parseLiteral: (ast) => {
    throw new Error('Upload scalar literal unsupported');
  },
  serialize: (value) => {
    throw new Error('Upload scalar serialization unsupported');
  },
});

export const resolvers = {
  // Scalars
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
  JSON: JSONResolver,
  UUID: UUIDResolver,
  Upload,

  // Interfaces
  Node: {
    __resolveType: (obj: any) => {
      if (obj.email) return 'User';
      if (obj.name && obj.ownerId) return 'Project';
      if (obj.type && obj.messages) return 'AISession';
      if (obj.title && obj.userId) return 'Notification';
      if (obj.path && obj.projectId) return 'ProjectFile';
      return null;
    },
  },

  Error: {
    __resolveType: (obj: any) => {
      if (obj.field) return 'ValidationError';
      if (obj.code === 'UNAUTHORIZED') return 'UnauthorizedError';
      if (obj.resource) return 'NotFoundError';
      return null;
    },
  },

  // Union Types
  SearchResult: {
    __resolveType: (obj: any) => {
      if (obj.email) return 'User';
      if (obj.name && obj.ownerId) return 'Project';
      if (obj.type && obj.messages) return 'AISession';
      return null;
    },
  },

  // Root Queries
  Query: {
    // Authentication
    me: async (parent: any, args: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return context.dataloaders.user.load(context.user.id);
    },

    // Users
    user: userResolvers.Query.user,
    users: userResolvers.Query.users,

    // Projects
    project: projectResolvers.Query.project,
    projects: projectResolvers.Query.projects,
    myProjects: projectResolvers.Query.myProjects,

    // AI
    aiSession: aiResolvers.Query.aiSession,
    aiSessions: aiResolvers.Query.aiSessions,

    // Notifications
    notifications: notificationResolvers.Query.notifications,
    unreadNotificationCount: notificationResolvers.Query.unreadNotificationCount,

    // Billing
    billingInfo: billingResolvers.Query.billingInfo,
    subscriptionPlans: billingResolvers.Query.subscriptionPlans,
    invoice: billingResolvers.Query.invoice,

    // Search
    search: searchResolvers.Query.search,

    // Analytics
    analyticsOverview: analyticsResolvers.Query.analyticsOverview,
    projectAnalytics: analyticsResolvers.Query.projectAnalytics,
  },

  // Root Mutations
  Mutation: {
    // Authentication
    login: async (parent: any, args: { email: string; password: string }, context: Context) => {
      const response = await context.dataloaders.auth.login({
        email: args.email,
        password: args.password,
      });
      return response;
    },

    register: async (parent: any, args: { input: any }, context: Context) => {
      const response = await context.dataloaders.auth.register(args.input);
      return response;
    },

    logout: async (parent: any, args: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      await context.dataloaders.auth.logout(context.user.id);
      return true;
    },

    refreshToken: async (parent: any, args: any, context: Context) => {
      const refreshToken = context.req.headers['x-refresh-token'];
      if (!refreshToken) {
        throw new Error('Refresh token required');
      }
      
      const response = await context.dataloaders.auth.refreshToken(refreshToken);
      return response;
    },

    // User Management
    updateProfile: userResolvers.Mutation.updateProfile,
    updatePreferences: userResolvers.Mutation.updatePreferences,
    changePassword: userResolvers.Mutation.changePassword,

    // Project Management
    createProject: projectResolvers.Mutation.createProject,
    updateProject: projectResolvers.Mutation.updateProject,
    deleteProject: projectResolvers.Mutation.deleteProject,

    // File Management
    uploadFile: projectResolvers.Mutation.uploadFile,
    updateFile: projectResolvers.Mutation.updateFile,
    deleteFile: projectResolvers.Mutation.deleteFile,

    // Collaboration
    inviteCollaborator: projectResolvers.Mutation.inviteCollaborator,
    respondToInvitation: projectResolvers.Mutation.respondToInvitation,
    updateCollaboratorRole: projectResolvers.Mutation.updateCollaboratorRole,
    removeCollaborator: projectResolvers.Mutation.removeCollaborator,

    // AI Integration
    createAISession: aiResolvers.Mutation.createAISession,
    sendAIMessage: aiResolvers.Mutation.sendAIMessage,
    cancelAISession: aiResolvers.Mutation.cancelAISession,

    // Notifications
    markNotificationRead: notificationResolvers.Mutation.markNotificationRead,
    markAllNotificationsRead: notificationResolvers.Mutation.markAllNotificationsRead,
    deleteNotification: notificationResolvers.Mutation.deleteNotification,

    // Billing
    updateSubscription: billingResolvers.Mutation.updateSubscription,
    cancelSubscription: billingResolvers.Mutation.cancelSubscription,
    addPaymentMethod: billingResolvers.Mutation.addPaymentMethod,
    updateDefaultPaymentMethod: billingResolvers.Mutation.updateDefaultPaymentMethod,
    removePaymentMethod: billingResolvers.Mutation.removePaymentMethod,

    // Admin Operations
    adminDeleteUser: userResolvers.Mutation.adminDeleteUser,
    adminUpdateUserStatus: userResolvers.Mutation.adminUpdateUserStatus,
    adminCreateSubscriptionPlan: billingResolvers.Mutation.adminCreateSubscriptionPlan,
  },

  // Root Subscriptions
  Subscription: {
    // Project Updates
    projectUpdates: {
      subscribe: async (parent: any, args: { projectId: string }, context: Context) => {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        // Verify user has access to the project
        const project = await context.dataloaders.project.load(args.projectId);
        if (!project || (project.ownerId !== context.user.id && !project.collaborators.some((c: any) => c.userId === context.user.id))) {
          throw new Error('Access denied');
        }

        return context.pubsub.asyncIterator(`PROJECT_UPDATES_${args.projectId}`);
      },
    },

    fileChanges: {
      subscribe: async (parent: any, args: { projectId: string }, context: Context) => {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const project = await context.dataloaders.project.load(args.projectId);
        if (!project || (project.ownerId !== context.user.id && !project.collaborators.some((c: any) => c.userId === context.user.id))) {
          throw new Error('Access denied');
        }

        return context.pubsub.asyncIterator(`FILE_CHANGES_${args.projectId}`);
      },
    },

    collaboratorUpdates: {
      subscribe: async (parent: any, args: { projectId: string }, context: Context) => {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const project = await context.dataloaders.project.load(args.projectId);
        if (!project || (project.ownerId !== context.user.id && !project.collaborators.some((c: any) => c.userId === context.user.id))) {
          throw new Error('Access denied');
        }

        return context.pubsub.asyncIterator(`COLLABORATOR_UPDATES_${args.projectId}`);
      },
    },

    // Notifications
    notifications: {
      subscribe: async (parent: any, args: any, context: Context) => {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        return context.pubsub.asyncIterator(`NOTIFICATIONS_${context.user.id}`);
      },
    },

    // AI Sessions
    aiMessageUpdates: {
      subscribe: async (parent: any, args: { sessionId: string }, context: Context) => {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const session = await context.dataloaders.aiSession.load(args.sessionId);
        if (!session || session.userId !== context.user.id) {
          throw new Error('Access denied');
        }

        return context.pubsub.asyncIterator(`AI_MESSAGE_UPDATES_${args.sessionId}`);
      },
    },

    aiSessionStatusUpdates: {
      subscribe: async (parent: any, args: { sessionId: string }, context: Context) => {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const session = await context.dataloaders.aiSession.load(args.sessionId);
        if (!session || session.userId !== context.user.id) {
          throw new Error('Access denied');
        }

        return context.pubsub.asyncIterator(`AI_SESSION_STATUS_${args.sessionId}`);
      },
    },
  },

  // Field Resolvers
  User: {
    projects: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.projectsByUser.load(parent.id);
    },
    notifications: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.notificationsByUser.load(parent.id);
    },
    billing: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.billingInfo.load(parent.id);
    },
  },

  Project: {
    owner: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.user.load(parent.ownerId);
    },
    files: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.filesByProject.load(parent.id);
    },
    folders: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.foldersByProject.load(parent.id);
    },
    collaborators: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.collaboratorsByProject.load(parent.id);
    },
    invitations: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.invitationsByProject.load(parent.id);
    },
    aiSessions: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.aiSessionsByProject.load(parent.id);
    },
    stats: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.projectStats.load(parent.id);
    },
  },

  ProjectFile: {
    project: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.project.load(parent.projectId);
    },
  },

  ProjectFolder: {
    project: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.project.load(parent.projectId);
    },
    parent: async (parent: any, args: any, context: Context) => {
      return parent.parentId ? context.dataloaders.folder.load(parent.parentId) : null;
    },
    children: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.childFolders.load(parent.id);
    },
    files: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.filesByFolder.load(parent.id);
    },
  },

  ProjectCollaborator: {
    user: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.user.load(parent.userId);
    },
    project: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.project.load(parent.projectId);
    },
  },

  ProjectInvitation: {
    project: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.project.load(parent.projectId);
    },
    inviter: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.user.load(parent.inviterId);
    },
  },

  AISession: {
    project: async (parent: any, args: any, context: Context) => {
      return parent.projectId ? context.dataloaders.project.load(parent.projectId) : null;
    },
    user: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.user.load(parent.userId);
    },
    messages: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.messagesBySession.load(parent.id);
    },
  },

  Notification: {
    user: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.user.load(parent.userId);
    },
  },

  BillingInfo: {
    user: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.user.load(parent.userId);
    },
    subscription: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.subscription.load(parent.userId);
    },
    paymentMethods: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.paymentMethodsByUser.load(parent.userId);
    },
    defaultPaymentMethod: async (parent: any, args: any, context: Context) => {
      return parent.defaultPaymentMethodId ? context.dataloaders.paymentMethod.load(parent.defaultPaymentMethodId) : null;
    },
    invoices: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.invoicesByUser.load(parent.userId);
    },
    transactions: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.transactionsByUser.load(parent.userId);
    },
  },

  Subscription: {
    plan: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.subscriptionPlan.load(parent.planId);
    },
  },

  Invoice: {
    items: async (parent: any, args: any, context: Context) => {
      return context.dataloaders.invoiceItemsByInvoice.load(parent.id);
    },
  },

  Transaction: {
    invoice: async (parent: any, args: any, context: Context) => {
      return parent.invoiceId ? context.dataloaders.invoice.load(parent.invoiceId) : null;
    },
    paymentMethod: async (parent: any, args: any, context: Context) => {
      return parent.paymentMethodId ? context.dataloaders.paymentMethod.load(parent.paymentMethodId) : null;
    },
  },
};