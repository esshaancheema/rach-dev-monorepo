/**
 * Utility functions for soft delete filtering in Prisma queries
 */

/**
 * Standard filter to exclude soft-deleted users
 */
export const excludeDeleted = {
  deletedAt: null,
};

/**
 * Filter to include only soft-deleted users
 */
export const onlyDeleted = {
  deletedAt: { not: null },
};

/**
 * Create a filter for users deleted before a specific date
 */
export const deletedBefore = (date: Date) => ({
  deletedAt: {
    not: null,
    lt: date,
  },
});

/**
 * Create a filter for users deleted after a specific date
 */
export const deletedAfter = (date: Date) => ({
  deletedAt: {
    not: null,
    gt: date,
  },
});

/**
 * Create a comprehensive user filter that excludes deleted users
 * and optionally filters by other criteria
 */
export const createUserFilter = (additionalFilters: any = {}) => ({
  ...excludeDeleted,
  ...additionalFilters,
});

/**
 * Create a filter for admin queries that can include deleted users
 */
export const createAdminUserFilter = (
  includeDeleted: boolean = false,
  additionalFilters: any = {}
) => {
  const baseFilter = includeDeleted ? {} : excludeDeleted;
  return {
    ...baseFilter,
    ...additionalFilters,
  };
};

/**
 * Soft delete aware user count
 */
export const getUserCount = (includeDeleted: boolean = false) => {
  return includeDeleted ? {} : excludeDeleted;
};

/**
 * Get active users filter (not deleted and status is active)
 */
export const getActiveUsersFilter = () => ({
  ...excludeDeleted,
  status: 'ACTIVE',
});

/**
 * Filter for user restoration eligibility
 * (deleted within grace period)
 */
export const getRestorableUsersFilter = (gracePeriodDays: number = 30) => {
  const cutoffDate = new Date(Date.now() - gracePeriodDays * 24 * 60 * 60 * 1000);
  return {
    deletedAt: {
      not: null,
      gt: cutoffDate,
    },
  };
};

/**
 * Filter for users that need permanent deletion
 * (deleted beyond grace period)
 */
export const getPermanentDeletionFilter = (gracePeriodDays: number = 30) => {
  const cutoffDate = new Date(Date.now() - gracePeriodDays * 24 * 60 * 60 * 1000);
  return {
    deletedAt: {
      not: null,
      lt: cutoffDate,
    },
  };
};

/**
 * Standard user selection fields that are safe to expose
 */
export const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true,
  isEmailVerified: true,
  isPhoneVerified: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  // Exclude sensitive fields like password, deletedAt, etc.
};

/**
 * Admin user selection fields (includes soft delete info)
 */
export const adminUserSelect = {
  ...safeUserSelect,
  deletedAt: true,
  deletedBy: true,
  deleteReason: true,
  phone: true,
  twoFactorEnabled: true,
};

/**
 * Create a where clause that respects soft delete for user relationships
 */
export const createRelationFilter = (relationField: string, includeDeleted: boolean = false) => {
  return {
    [relationField]: includeDeleted ? {} : excludeDeleted,
  };
};

/**
 * Middleware function to automatically add soft delete filters to Prisma queries
 */
export class SoftDeleteMiddleware {
  /**
   * Apply soft delete filtering to Prisma queries
   */
  static apply() {
    return async (params: any, next: any) => {
      // Only apply to User model queries
      if (params.model === 'User') {
        // For create, update, delete operations, don't modify
        if (['create', 'update', 'upsert', 'delete'].includes(params.action)) {
          return next(params);
        }

        // For read operations, add soft delete filter
        if (['findFirst', 'findMany', 'count', 'aggregate'].includes(params.action)) {
          if (!params.args) {
            params.args = {};
          }
          
          if (!params.args.where) {
            params.args.where = {};
          }
          
          // Only add filter if not already specified
          if (params.args.where.deletedAt === undefined) {
            params.args.where.deletedAt = null;
          }
        }
      }

      return next(params);
    };
  }
}

/**
 * Helper function to check if a user is soft deleted
 */
export const isUserDeleted = (user: { deletedAt?: Date | null }): boolean => {
  return user.deletedAt !== null && user.deletedAt !== undefined;
};

/**
 * Helper function to check if a user can be restored
 */
export const canUserBeRestored = (
  user: { deletedAt?: Date | null },
  gracePeriodDays: number = 30
): boolean => {
  if (!isUserDeleted(user) || !user.deletedAt) {
    return false;
  }

  const cutoffDate = new Date(Date.now() - gracePeriodDays * 24 * 60 * 60 * 1000);
  return user.deletedAt > cutoffDate;
};

/**
 * Helper function to calculate days remaining in grace period
 */
export const getDaysRemainingInGracePeriod = (
  user: { deletedAt?: Date | null },
  gracePeriodDays: number = 30
): number => {
  if (!isUserDeleted(user) || !user.deletedAt) {
    return 0;
  }

  const gracePeriodEnds = new Date(user.deletedAt.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysRemaining = Math.ceil((gracePeriodEnds.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  
  return Math.max(0, daysRemaining);
};