import { Prisma, Project, ProjectStatus, ProjectType, Visibility } from '@zoptal/database';
import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';
import { nanoid } from 'nanoid';

export interface CreateProjectInput {
  name: string;
  description?: string;
  type: ProjectType;
  status?: ProjectStatus;
  visibility?: Visibility;
  framework?: string;
  githubUrl?: string;
  userId: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  type?: ProjectType;
  status?: ProjectStatus;
  visibility?: Visibility;
  framework?: string;
  deploymentUrl?: string;
  githubUrl?: string;
}

export interface ProjectFilters {
  userId?: string;
  status?: ProjectStatus;
  type?: ProjectType;
  visibility?: Visibility;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ProjectService {
  /**
   * Get all projects with filters and pagination
   */
  async getProjects(
    filters: ProjectFilters,
    options: PaginationOptions
  ): Promise<PaginatedResponse<Project>> {
    const { page, limit, sortBy = 'updatedAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProjectWhereInput = {};
    
    if (filters.userId) {
      where.userId = filters.userId;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.visibility) {
      where.visibility = filters.visibility;
    }
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Execute queries in parallel
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              files: true,
              deployments: true,
              collaborators: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single project by ID
   */
  async getProjectById(projectId: string, userId: string): Promise<Project | null> {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { visibility: 'PUBLIC' },
          {
            collaborators: {
              some: { userId },
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        files: {
          orderBy: { updatedAt: 'desc' },
          take: 10,
        },
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        collaborators: {
          select: {
            id: true,
            userId: true,
            role: true,
            invitedAt: true,
            joinedAt: true,
          },
        },
        _count: {
          select: {
            files: true,
            deployments: true,
            collaborators: true,
            aiConversations: true,
          },
        },
      },
    });

    return project;
  }

  /**
   * Create a new project
   */
  async createProject(input: CreateProjectInput): Promise<Project> {
    const project = await prisma.project.create({
      data: {
        id: `proj_${nanoid()}`,
        name: input.name,
        description: input.description,
        type: input.type,
        status: input.status || 'PLANNING',
        visibility: input.visibility || 'PRIVATE',
        framework: input.framework,
        githubUrl: input.githubUrl,
        userId: input.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    logger.info('Project created', { projectId: project.id, userId: input.userId });
    return project;
  }

  /**
   * Update a project
   */
  async updateProject(
    projectId: string,
    userId: string,
    input: UpdateProjectInput
  ): Promise<Project> {
    // Check if user has permission to update
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          {
            collaborators: {
              some: {
                userId,
                role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
              },
            },
          },
        ],
      },
    });

    if (!existingProject) {
      throw new Error('Project not found or no permission to update');
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...input,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    logger.info('Project updated', { projectId, userId });
    return project;
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    // Check if user has permission to delete
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          {
            collaborators: {
              some: {
                userId,
                role: 'OWNER',
              },
            },
          },
        ],
      },
    });

    if (!project) {
      throw new Error('Project not found or no permission to delete');
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    logger.info('Project deleted', { projectId, userId });
  }

  /**
   * Add a collaborator to a project
   */
  async addCollaborator(
    projectId: string,
    ownerId: string,
    collaboratorEmail: string,
    role: 'ADMIN' | 'EDITOR' | 'VIEWER'
  ): Promise<void> {
    // Check if user owns the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: ownerId,
      },
    });

    if (!project) {
      throw new Error('Project not found or no permission');
    }

    // Find collaborator user
    const collaboratorUser = await prisma.user.findUnique({
      where: { email: collaboratorEmail },
    });

    if (!collaboratorUser) {
      throw new Error('User not found');
    }

    // Add collaborator
    await prisma.projectCollaborator.create({
      data: {
        id: `collab_${nanoid()}`,
        projectId,
        userId: collaboratorUser.id,
        role,
      },
    });

    logger.info('Collaborator added', {
      projectId,
      collaboratorId: collaboratorUser.id,
      role,
    });
  }

  /**
   * Remove a collaborator from a project
   */
  async removeCollaborator(
    projectId: string,
    ownerId: string,
    collaboratorUserId: string
  ): Promise<void> {
    // Check if user owns the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: ownerId,
      },
    });

    if (!project) {
      throw new Error('Project not found or no permission');
    }

    await prisma.projectCollaborator.deleteMany({
      where: {
        projectId,
        userId: collaboratorUserId,
      },
    });

    logger.info('Collaborator removed', {
      projectId,
      collaboratorId: collaboratorUserId,
    });
  }

  /**
   * Get project statistics
   */
  async getProjectStats(userId: string): Promise<any> {
    const [totalProjects, projectsByStatus, projectsByType, recentActivity] = await Promise.all([
      // Total projects
      prisma.project.count({
        where: { userId },
      }),
      
      // Projects by status
      prisma.project.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      
      // Projects by type
      prisma.project.groupBy({
        by: ['type'],
        where: { userId },
        _count: true,
      }),
      
      // Recent activity
      prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          status: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      totalProjects,
      projectsByStatus: projectsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      projectsByType: projectsByType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recentActivity,
    };
  }

  /**
   * Clone a project
   */
  async cloneProject(
    projectId: string,
    userId: string,
    newName: string
  ): Promise<Project> {
    // Get original project
    const originalProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { visibility: 'PUBLIC' },
          {
            collaborators: {
              some: { userId },
            },
          },
        ],
      },
      include: {
        files: true,
      },
    });

    if (!originalProject) {
      throw new Error('Project not found or no permission to clone');
    }

    // Create new project
    const newProject = await prisma.project.create({
      data: {
        id: `proj_${nanoid()}`,
        name: newName,
        description: originalProject.description,
        type: originalProject.type,
        status: 'PLANNING',
        visibility: 'PRIVATE',
        framework: originalProject.framework,
        userId,
      },
    });

    // Clone files
    if (originalProject.files.length > 0) {
      await prisma.projectFile.createMany({
        data: originalProject.files.map(file => ({
          id: `file_${nanoid()}`,
          filename: file.filename,
          path: file.path,
          content: file.content,
          size: file.size,
          mimeType: file.mimeType,
          projectId: newProject.id,
        })),
      });
    }

    logger.info('Project cloned', {
      originalProjectId: projectId,
      newProjectId: newProject.id,
      userId,
    });

    return newProject;
  }
}

// Export singleton instance
export const projectService = new ProjectService();