import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@sinclair/typebox';
import { requirePermission } from '../middleware/auth.middleware';
import { fileService } from '../services/file.service';
import { Readable } from 'stream';
import * as path from 'path';

// Type definitions
const FileSchema = Type.Object({
  id: Type.String(),
  filename: Type.String(),
  path: Type.String(),
  size: Type.Number(),
  mimeType: Type.String(),
  projectId: Type.String(),
  content: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  downloadUrl: Type.Optional(Type.String()),
});

const FileUploadSchema = Type.Object({
  filename: Type.String({ minLength: 1, maxLength: 255 }),
  path: Type.Optional(Type.String()),
  content: Type.String(), // Base64 encoded content
  mimeType: Type.Optional(Type.String()),
});

const FileTreeNodeSchema: any = Type.Recursive((This) =>
  Type.Object({
    name: Type.String(),
    type: Type.Union([Type.Literal('file'), Type.Literal('directory')]),
    id: Type.Optional(Type.String()),
    size: Type.Optional(Type.Number()),
    mimeType: Type.Optional(Type.String()),
    updatedAt: Type.Optional(Type.String()),
    children: Type.Optional(Type.Array(This)),
  })
);

export default async function fileRoutes(fastify: FastifyInstance) {
  // Get files for a project
  fastify.get('/project/:projectId', {
    preHandler: [requirePermission('files:read')],
    schema: {
      params: Type.Object({
        projectId: Type.String(),
      }),
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
        limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 })),
        path: Type.Optional(Type.String()),
        mimeType: Type.Optional(Type.String()),
        search: Type.Optional(Type.String()),
        sortBy: Type.Optional(Type.String({ default: 'updatedAt' })),
        sortOrder: Type.Optional(Type.Union([Type.Literal('asc'), Type.Literal('desc')], { default: 'desc' })),
      }),
      response: {
        200: Type.Object({
          data: Type.Array(FileSchema),
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
    Params: { projectId: string };
    Querystring: {
      page?: number;
      limit?: number;
      path?: string;
      mimeType?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    };
  }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const { 
      page = 1, 
      limit = 20, 
      path: filePath,
      mimeType,
      search, 
      sortBy = 'updatedAt', 
      sortOrder = 'desc' 
    } = request.query;
    const userId = request.user!.id;

    request.logInfo('Fetching project files', {
      projectId,
      userId,
      filters: { path: filePath, mimeType, search },
      pagination: { page, limit },
    });

    try {
      const result = await fileService.getProjectFiles(
        {
          projectId,
          path: filePath,
          mimeType,
          search,
        },
        {
          page,
          limit,
          sortBy,
          sortOrder,
        },
        userId
      );

      return result;
    } catch (error) {
      request.logError('Failed to fetch files', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw fastify.throwNotFound('Project');
      }
      throw fastify.httpErrors.internalServerError('Failed to fetch files');
    }
  });

  // Get file tree structure
  fastify.get('/project/:projectId/tree', {
    preHandler: [requirePermission('files:read')],
    schema: {
      params: Type.Object({
        projectId: Type.String(),
      }),
      response: {
        200: FileTreeNodeSchema,
      },
    },
  }, async (request: FastifyRequest<{
    Params: { projectId: string };
  }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const userId = request.user!.id;

    request.logInfo('Fetching file tree', { projectId, userId });

    try {
      const tree = await fileService.getFileTree(projectId, userId);
      return tree;
    } catch (error) {
      request.logError('Failed to fetch file tree', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw fastify.throwNotFound('Project');
      }
      throw fastify.httpErrors.internalServerError('Failed to fetch file tree');
    }
  });

  // Get storage statistics
  fastify.get('/project/:projectId/stats', {
    preHandler: [requirePermission('files:read')],
    schema: {
      params: Type.Object({
        projectId: Type.String(),
      }),
      response: {
        200: Type.Object({
          totalFiles: Type.Number(),
          totalSize: Type.Number(),
          filesByType: Type.Record(Type.String(), Type.Object({
            count: Type.Number(),
            size: Type.Number(),
          })),
          largestFiles: Type.Array(Type.Object({
            id: Type.String(),
            filename: Type.String(),
            size: Type.Number(),
            mimeType: Type.String(),
          })),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Params: { projectId: string };
  }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const userId = request.user!.id;

    request.logInfo('Fetching storage stats', { projectId, userId });

    try {
      const stats = await fileService.getStorageStats(projectId, userId);
      return stats;
    } catch (error) {
      request.logError('Failed to fetch storage stats', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw fastify.throwNotFound('Project');
      }
      throw fastify.httpErrors.internalServerError('Failed to fetch storage stats');
    }
  });

  // Get a specific file
  fastify.get('/:fileId', {
    preHandler: [requirePermission('files:read')],
    schema: {
      params: Type.Object({
        fileId: Type.String(),
      }),
      response: {
        200: FileSchema,
        404: Type.Object({
          error: Type.String(),
          message: Type.String(),
          statusCode: Type.Number(),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Params: { fileId: string };
  }>, reply: FastifyReply) => {
    const { fileId } = request.params;
    const userId = request.user!.id;

    request.logInfo('Fetching file', { fileId, userId });

    try {
      const file = await fileService.getFileById(fileId, userId);
      
      if (!file) {
        return fastify.throwNotFound('File');
      }

      return file;
    } catch (error) {
      request.logError('Failed to fetch file', error);
      if (error instanceof Error && error.message.includes('permission')) {
        throw fastify.httpErrors.forbidden('No permission to access this file');
      }
      throw fastify.httpErrors.internalServerError('Failed to fetch file');
    }
  });

  // Upload a file
  fastify.post('/project/:projectId/upload', {
    preHandler: [requirePermission('files:write')],
    schema: {
      params: Type.Object({
        projectId: Type.String(),
      }),
      body: FileUploadSchema,
      response: {
        201: FileSchema,
        400: Type.Object({
          error: Type.String(),
          message: Type.String(),
          statusCode: Type.Number(),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Params: { projectId: string };
    Body: {
      filename: string;
      path?: string;
      content: string;
      mimeType?: string;
    };
  }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const { filename, path: filePath, content, mimeType } = request.body;
    const userId = request.user!.id;

    request.logInfo('Uploading file', { projectId, filename, userId });

    try {
      // Decode base64 content
      const contentBuffer = Buffer.from(content, 'base64');

      const file = await fileService.uploadFile(
        {
          projectId,
          filename,
          content: contentBuffer,
          mimeType,
          path: filePath,
        },
        userId
      );

      return reply.status(201).send(file);
    } catch (error) {
      request.logError('Failed to upload file', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw fastify.throwNotFound('Project');
      }
      if (error instanceof Error && error.message.includes('permission')) {
        throw fastify.httpErrors.forbidden('No permission to upload files');
      }
      throw fastify.httpErrors.internalServerError('Failed to upload file');
    }
  });

  // Get signed upload URL
  fastify.post('/project/:projectId/upload-url', {
    preHandler: [requirePermission('files:write')],
    schema: {
      params: Type.Object({
        projectId: Type.String(),
      }),
      body: Type.Object({
        filename: Type.String({ minLength: 1, maxLength: 255 }),
        mimeType: Type.String(),
      }),
      response: {
        200: Type.Object({
          uploadUrl: Type.String(),
          fileId: Type.String(),
          s3Key: Type.String(),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Params: { projectId: string };
    Body: {
      filename: string;
      mimeType: string;
    };
  }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const { filename, mimeType } = request.body;
    const userId = request.user!.id;

    request.logInfo('Generating upload URL', { projectId, filename, userId });

    try {
      const result = await fileService.getSignedUploadUrl(
        projectId,
        filename,
        mimeType,
        userId
      );

      return result;
    } catch (error) {
      request.logError('Failed to generate upload URL', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw fastify.throwNotFound('Project');
      }
      if (error instanceof Error && error.message.includes('permission')) {
        throw fastify.httpErrors.forbidden('No permission to upload files');
      }
      throw fastify.httpErrors.internalServerError('Failed to generate upload URL');
    }
  });

  // Update file content
  fastify.put('/:fileId/content', {
    preHandler: [requirePermission('files:write')],
    schema: {
      params: Type.Object({
        fileId: Type.String(),
      }),
      body: Type.Object({
        content: Type.String(), // Base64 encoded content
      }),
      response: {
        200: FileSchema,
        404: Type.Object({
          error: Type.String(),
          message: Type.String(),
          statusCode: Type.Number(),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Params: { fileId: string };
    Body: { content: string };
  }>, reply: FastifyReply) => {
    const { fileId } = request.params;
    const { content } = request.body;
    const userId = request.user!.id;

    request.logInfo('Updating file content', { fileId, userId });

    try {
      // Decode base64 content
      const contentBuffer = Buffer.from(content, 'base64');

      const file = await fileService.updateFileContent(fileId, contentBuffer, userId);
      return file;
    } catch (error) {
      request.logError('Failed to update file content', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw fastify.throwNotFound('File');
      }
      if (error instanceof Error && error.message.includes('permission')) {
        throw fastify.httpErrors.forbidden('No permission to update this file');
      }
      throw fastify.httpErrors.internalServerError('Failed to update file content');
    }
  });

  // Move/rename a file
  fastify.put('/:fileId/move', {
    preHandler: [requirePermission('files:write')],
    schema: {
      params: Type.Object({
        fileId: Type.String(),
      }),
      body: Type.Object({
        path: Type.String({ minLength: 1 }),
      }),
      response: {
        200: FileSchema,
        404: Type.Object({
          error: Type.String(),
          message: Type.String(),
          statusCode: Type.Number(),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Params: { fileId: string };
    Body: { path: string };
  }>, reply: FastifyReply) => {
    const { fileId } = request.params;
    const { path: newPath } = request.body;
    const userId = request.user!.id;

    request.logInfo('Moving file', { fileId, newPath, userId });

    try {
      const file = await fileService.moveFile(fileId, newPath, userId);
      return file;
    } catch (error) {
      request.logError('Failed to move file', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw fastify.throwNotFound('File');
      }
      if (error instanceof Error && error.message.includes('permission')) {
        throw fastify.httpErrors.forbidden('No permission to move this file');
      }
      throw fastify.httpErrors.internalServerError('Failed to move file');
    }
  });

  // Delete a file
  fastify.delete('/:fileId', {
    preHandler: [requirePermission('files:delete')],
    schema: {
      params: Type.Object({
        fileId: Type.String(),
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
    Params: { fileId: string };
  }>, reply: FastifyReply) => {
    const { fileId } = request.params;
    const userId = request.user!.id;

    request.logInfo('Deleting file', { fileId, userId });

    try {
      await fileService.deleteFile(fileId, userId);
      return reply.status(204).send();
    } catch (error) {
      request.logError('Failed to delete file', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw fastify.throwNotFound('File');
      }
      if (error instanceof Error && error.message.includes('permission')) {
        throw fastify.httpErrors.forbidden('No permission to delete this file');
      }
      throw fastify.httpErrors.internalServerError('Failed to delete file');
    }
  });

  // Download a file (redirect to signed URL)
  fastify.get('/:fileId/download', {
    preHandler: [requirePermission('files:read')],
    schema: {
      params: Type.Object({
        fileId: Type.String(),
      }),
    },
  }, async (request: FastifyRequest<{
    Params: { fileId: string };
  }>, reply: FastifyReply) => {
    const { fileId } = request.params;
    const userId = request.user!.id;

    request.logInfo('Downloading file', { fileId, userId });

    try {
      const file = await fileService.getFileById(fileId, userId);
      
      if (!file) {
        return fastify.throwNotFound('File');
      }

      if (file.downloadUrl) {
        // Redirect to signed URL
        return reply.redirect(302, file.downloadUrl);
      } else if (file.content) {
        // Send file content directly
        const buffer = Buffer.from(file.content, 'base64');
        return reply
          .header('Content-Type', file.mimeType)
          .header('Content-Disposition', `attachment; filename="${file.filename}"`)
          .send(buffer);
      } else {
        throw new Error('File content not available');
      }
    } catch (error) {
      request.logError('Failed to download file', error);
      if (error instanceof Error && error.message.includes('permission')) {
        throw fastify.httpErrors.forbidden('No permission to download this file');
      }
      throw fastify.httpErrors.internalServerError('Failed to download file');
    }
  });

  // Bulk file operations
  fastify.post('/bulk/delete', {
    preHandler: [requirePermission('files:delete')],
    schema: {
      body: Type.Object({
        fileIds: Type.Array(Type.String(), { minItems: 1, maxItems: 100 }),
      }),
      response: {
        200: Type.Object({
          deleted: Type.Number(),
          failed: Type.Array(Type.Object({
            fileId: Type.String(),
            error: Type.String(),
          })),
        }),
      },
    },
  }, async (request: FastifyRequest<{
    Body: { fileIds: string[] };
  }>, reply: FastifyReply) => {
    const { fileIds } = request.body;
    const userId = request.user!.id;

    request.logInfo('Bulk deleting files', { fileIds, userId });

    let deleted = 0;
    const failed: { fileId: string; error: string }[] = [];

    for (const fileId of fileIds) {
      try {
        await fileService.deleteFile(fileId, userId);
        deleted++;
      } catch (error) {
        failed.push({
          fileId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { deleted, failed };
  });
}