import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@sinclair/typebox';
import { requirePermission } from '../middleware/auth.middleware';
import { projectService } from '../services/project.service';
import { ProjectStatus, ProjectType, Visibility } from '@zoptal/database';

// Type definitions for project routes
const ProjectSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  type: Type.Enum(ProjectType),
  status: Type.Enum(ProjectStatus),
  visibility: Type.Enum(Visibility),
  framework: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  deploymentUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  githubUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  aiModel: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  promptCount: Type.Number(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  deployedAt: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  userId: Type.String(),
  user: Type.Optional(Type.Object({
    id: Type.String(),
    name: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    email: Type.String(),
    image: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  })),
  _count: Type.Optional(Type.Object({
    files: Type.Number(),
    deployments: Type.Number(),
    collaborators: Type.Number(),
  })),
});

const CreateProjectSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
  description: Type.Optional(Type.String({ maxLength: 1000 })),
  type: Type.Enum(ProjectType),
  status: Type.Optional(Type.Enum(ProjectStatus)),
  visibility: Type.Optional(Type.Enum(Visibility)),
  framework: Type.Optional(Type.String()),
  githubUrl: Type.Optional(Type.String()),
});

const UpdateProjectSchema = Type.Partial(CreateProjectSchema);

export default async function projectRoutes(fastify: FastifyInstance) {
  // Get all projects for the user
  fastify.get('/', {
    preHandler: [requirePermission('projects:read')],
    schema: {
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
        limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 })),
        status: Type.Optional(Type.Enum(ProjectStatus)),
        type: Type.Optional(Type.Enum(ProjectType)),
        visibility: Type.Optional(Type.Enum(Visibility)),
        search: Type.Optional(Type.String()),
        sortBy: Type.Optional(Type.String({ default: 'updatedAt' })),
        sortOrder: Type.Optional(Type.Union([Type.Literal('asc'), Type.Literal('desc')], { default: 'desc' })),
      }),
      response: {
        200: Type.Object({
          data: Type.Array(ProjectSchema),
          pagination: Type.Object({
            page: Type.Number(),
            limit: Type.Number(),
            total: Type.Number(),
            totalPages: Type.Number(),
          }),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Querystring: {
      page?: number;
      limit?: number;
      status?: ProjectStatus;
      type?: ProjectType;
      visibility?: Visibility;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    };
  }>, reply: FastifyReply) => {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type,
      visibility,
      search, 
      sortBy = 'updatedAt', 
      sortOrder = 'desc' 
    } = request.query;

    const userId = request.user!.id;

    request.logInfo('Fetching projects', {
      userId,
      filters: { status, type, visibility, search },
      pagination: { page, limit },
      sort: { sortBy, sortOrder },
    });

    try {
      const result = await projectService.getProjects(
        {
          userId,
          status,
          type,
          visibility,
          search,
        },
        {
          page,
          limit,
          sortBy,
          sortOrder,
        }
      );

      return result;
    } catch (error) {
      request.logError('Failed to fetch projects', error);
      throw fastify.httpErrors.internalServerError('Failed to fetch projects');
    }
  });

  // Get a specific project
  fastify.get('/:projectId', {
    preHandler: [requirePermission('projects:read')],
    schema: {
      params: Type.Object({
        projectId: Type.String(),
      }),
      response: {
        200: ProjectSchema,
        404: Type.Object({
          error: Type.String(),
          message: Type.String(),
          statusCode: Type.Number(),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Params: { projectId: string };
  }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const userId = request.user!.id;

    request.logInfo('Fetching project', { projectId, userId });

    try {
      const project = await projectService.getProjectById(projectId, userId);
      
      if (!project) {
        return fastify.throwNotFound('Project');
      }

      return project;
    } catch (error) {
      request.logError('Failed to fetch project', error);
      throw fastify.httpErrors.internalServerError('Failed to fetch project');
    }
  });

  // Create a new project
  fastify.post('/', {
    preHandler: [requirePermission('projects:create')],
    schema: {
      body: CreateProjectSchema,
      response: {
        201: ProjectSchema,
        400: Type.Object({
          error: Type.String(),
          message: Type.String(),
          statusCode: Type.Number(),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Body: {
      name: string;
      description?: string;
      type: ProjectType;
      status?: ProjectStatus;
      visibility?: Visibility;
      framework?: string;
      githubUrl?: string;
    };
  }>, reply: FastifyReply) => {
    const projectData = request.body;
    const userId = request.user!.id;

    request.logInfo('Creating project', { projectData, userId });

    try {
      const project = await projectService.createProject({
        ...projectData,
        userId,
      });

      return reply.status(201).send(project);
    } catch (error) {
      request.logError('Failed to create project', error);
      throw fastify.httpErrors.internalServerError('Failed to create project');
    }
  });

  // Update a project
  fastify.put('/:projectId', {
    preHandler: [requirePermission('projects:update')],
    schema: {
      params: Type.Object({
        projectId: Type.String(),
      }),
      body: UpdateProjectSchema,
      response: {
        200: ProjectSchema,
        404: Type.Object({
          error: Type.String(),
          message: Type.String(),
          statusCode: Type.Number(),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Params: { projectId: string };
    Body: Partial<{
      name: string;
      description?: string;
      type?: ProjectType;
      status?: ProjectStatus;
      visibility?: Visibility;
      framework?: string;
      deploymentUrl?: string;
      githubUrl?: string;
    }>;
  }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const updateData = request.body;
    const userId = request.user!.id;

    request.logInfo('Updating project', { projectId, updateData, userId });

    try {
      const project = await projectService.updateProject(projectId, userId, updateData);
      return project;
    } catch (error) {
      request.logError('Failed to update project', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw fastify.throwNotFound('Project');
      }
      throw fastify.httpErrors.internalServerError('Failed to update project');
    }
  });

  // Delete a project
  fastify.delete('/:projectId', {
    preHandler: [requirePermission('projects:delete')],
    schema: {
      params: Type.Object({
        projectId: Type.String(),
      }),
      response: {
        204: Type.Null(),
        404: Type.Object({
          error: Type.String(),
          message: Type.String(),
          statusCode: Type.Number(),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Params: { projectId: string };
  }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const userId = request.user!.id;

    request.logInfo('Deleting project', { projectId, userId });

    try {
      await projectService.deleteProject(projectId, userId);
      return reply.status(204).send();
    } catch (error) {
      request.logError('Failed to delete project', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw fastify.throwNotFound('Project');
      }
      throw fastify.httpErrors.internalServerError('Failed to delete project');
    }
  });

  // Get project statistics
  fastify.get('/stats/overview', {
    preHandler: [requirePermission('projects:read')],
    schema: {
      response: {
        200: Type.Object({
          totalProjects: Type.Number(),
          projectsByStatus: Type.Record(Type.String(), Type.Number()),
          projectsByType: Type.Record(Type.String(), Type.Number()),
          recentActivity: Type.Array(Type.Object({
            id: Type.String(),
            name: Type.String(),
            status: Type.Enum(ProjectStatus),
            updatedAt: Type.String(),
          })),
        }),
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.id;

    request.logInfo('Fetching project statistics', { userId });

    try {
      const stats = await projectService.getProjectStats(userId);
      return stats;
    } catch (error) {
      request.logError('Failed to fetch project statistics', error);
      throw fastify.httpErrors.internalServerError('Failed to fetch statistics');
    }
  });

  // Clone a project
  fastify.post('/:projectId/clone', {
    preHandler: [requirePermission('projects:create')],
    schema: {
      params: Type.Object({
        projectId: Type.String(),
      }),
      body: Type.Object({
        name: Type.String({ minLength: 1, maxLength: 100 }),
      }),
      response: {
        201: ProjectSchema,
        404: Type.Object({
          error: Type.String(),
          message: Type.String(),
          statusCode: Type.Number(),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Params: { projectId: string };
    Body: { name: string };
  }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const { name } = request.body;
    const userId = request.user!.id;

    request.logInfo('Cloning project', { projectId, newName: name, userId });

    try {
      const clonedProject = await projectService.cloneProject(projectId, userId, name);
      return reply.status(201).send(clonedProject);
    } catch (error) {
      request.logError('Failed to clone project', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw fastify.throwNotFound('Project');
      }
      throw fastify.httpErrors.internalServerError('Failed to clone project');
    }
  });

  // Add a collaborator
  fastify.post('/:projectId/collaborators', {
    preHandler: [requirePermission('projects:update')],
    schema: {
      params: Type.Object({
        projectId: Type.String(),
      }),
      body: Type.Object({
        email: Type.String({ format: 'email' }),
        role: Type.Union([
          Type.Literal('ADMIN'),
          Type.Literal('EDITOR'),
          Type.Literal('VIEWER'),
        ]),
      }),
      response: {
        201: Type.Object({
          message: Type.String(),
        }),
        404: Type.Object({
          error: Type.String(),
          message: Type.String(),
          statusCode: Type.Number(),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Params: { projectId: string };
    Body: { email: string; role: 'ADMIN' | 'EDITOR' | 'VIEWER' };
  }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const { email, role } = request.body;
    const userId = request.user!.id;

    request.logInfo('Adding collaborator', { projectId, email, role, userId });

    try {
      await projectService.addCollaborator(projectId, userId, email, role);
      return reply.status(201).send({ message: 'Collaborator added successfully' });
    } catch (error) {
      request.logError('Failed to add collaborator', error);
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw fastify.throwNotFound(error.message);
        }
        if (error.message.includes('permission')) {
          throw fastify.httpErrors.forbidden(error.message);
        }
      }
      throw fastify.httpErrors.internalServerError('Failed to add collaborator');
    }
  });

  // Remove a collaborator
  fastify.delete('/:projectId/collaborators/:collaboratorId', {
    preHandler: [requirePermission('projects:update')],
    schema: {
      params: Type.Object({
        projectId: Type.String(),
        collaboratorId: Type.String(),
      }),
      response: {
        204: Type.Null(),
        404: Type.Object({
          error: Type.String(),
          message: Type.String(),
          statusCode: Type.Number(),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Params: { projectId: string; collaboratorId: string };
  }>, reply: FastifyReply) => {
    const { projectId, collaboratorId } = request.params;
    const userId = request.user!.id;

    request.logInfo('Removing collaborator', { projectId, collaboratorId, userId });

    try {
      await projectService.removeCollaborator(projectId, userId, collaboratorId);
      return reply.status(204).send();
    } catch (error) {
      request.logError('Failed to remove collaborator', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw fastify.throwNotFound('Project or collaborator');
      }
      throw fastify.httpErrors.internalServerError('Failed to remove collaborator');
    }
  });
}