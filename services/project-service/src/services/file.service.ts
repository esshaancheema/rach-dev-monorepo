import { ProjectFile, Prisma } from '@zoptal/database';
import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';
import { nanoid } from 'nanoid';
import * as crypto from 'crypto';
import * as path from 'path';

// Simple mime type detection
const getMimeType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.ts': 'text/typescript',
    '.tsx': 'text/typescript',
    '.jsx': 'text/javascript',
    '.py': 'text/x-python',
    '.java': 'text/x-java',
    '.go': 'text/x-go',
    '.rs': 'text/x-rust',
    '.cpp': 'text/x-c++',
    '.c': 'text/x-c',
    '.h': 'text/x-c',
    '.hpp': 'text/x-c++',
    '.php': 'text/x-php',
    '.rb': 'text/x-ruby',
    '.sh': 'text/x-shellscript',
    '.yaml': 'text/yaml',
    '.yml': 'text/yaml',
    '.xml': 'application/xml',
    '.zip': 'application/zip',
    '.tar': 'application/x-tar',
    '.gz': 'application/gzip',
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

export interface FileUploadInput {
  projectId: string;
  filename: string;
  content: Buffer | string;
  mimeType?: string;
  path?: string;
}

export interface FileFilters {
  projectId: string;
  path?: string;
  mimeType?: string;
  search?: string;
}

export interface FilePaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FileWithSignedUrl extends ProjectFile {
  downloadUrl?: string;
}

export class FileService {
  /**
   * Upload a file and create database record
   */
  async uploadFile(
    input: FileUploadInput,
    userId: string
  ): Promise<ProjectFile> {
    const { projectId, filename, content, mimeType, path: filePath } = input;

    // Verify user has access to the project
    const project = await prisma.project.findFirst({
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

    if (!project) {
      throw new Error('Project not found or no permission to upload files');
    }

    // Prepare file data
    const fileId = `file_${nanoid()}`;
    const fullPath = filePath || filename;
    const contentBuffer = typeof content === 'string' ? Buffer.from(content) : content;
    const fileSize = contentBuffer.length;
    const detectedMimeType = mimeType || getMimeType(filename);

    try {
      // Create database record with content stored as base64
      const file = await prisma.projectFile.create({
        data: {
          id: fileId,
          filename,
          path: fullPath,
          size: fileSize,
          mimeType: detectedMimeType,
          projectId,
          content: contentBuffer.toString('base64'),
        },
      });

      logger.info('File uploaded successfully', {
        fileId,
        projectId,
        filename,
        size: fileSize,
      });

      return file;
    } catch (error) {
      logger.error('Failed to upload file', { error, projectId, filename });
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Get files for a project with pagination
   */
  async getProjectFiles(
    filters: FileFilters,
    options: FilePaginationOptions,
    userId: string
  ): Promise<{
    data: FileWithSignedUrl[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { projectId, path: filePath, mimeType, search } = filters;
    const { page, limit, sortBy = 'updatedAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    // Verify user has access to the project
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
    });

    if (!project) {
      throw new Error('Project not found or no permission');
    }

    // Build where clause
    const where: Prisma.ProjectFileWhereInput = {
      projectId,
    };

    if (filePath) {
      where.path = { startsWith: filePath };
    }

    if (mimeType) {
      where.mimeType = mimeType;
    }

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { path: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Execute queries
    const [files, total] = await Promise.all([
      prisma.projectFile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          filename: true,
          path: true,
          size: true,
          mimeType: true,
          projectId: true,
          createdAt: true,
          updatedAt: true,
          // Don't include content in list view to save bandwidth
        },
      }),
      prisma.projectFile.count({ where }),
    ]);

    // Add download URL (just the file ID for now)
    const filesWithUrls = files.map(file => ({
      ...file,
      content: null, // Don't send content in list view
      downloadUrl: `/api/files/${file.id}/download`,
    }));

    return {
      data: filesWithUrls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single file by ID
   */
  async getFileById(
    fileId: string,
    userId: string
  ): Promise<FileWithSignedUrl | null> {
    const file = await prisma.projectFile.findFirst({
      where: {
        id: fileId,
      },
      include: {
        project: {
          select: {
            id: true,
            userId: true,
            visibility: true,
            collaborators: {
              where: { userId },
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!file) {
      return null;
    }

    // Check permissions
    const hasAccess = 
      file.project.userId === userId ||
      file.project.visibility === 'PUBLIC' ||
      file.project.collaborators.length > 0;

    if (!hasAccess) {
      throw new Error('No permission to access this file');
    }

    return {
      ...file,
      downloadUrl: `/api/files/${file.id}/download`,
    };
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string, userId: string): Promise<void> {
    // Get file with project info
    const file = await prisma.projectFile.findFirst({
      where: { id: fileId },
      include: {
        project: {
          select: {
            id: true,
            userId: true,
            collaborators: {
              where: {
                userId,
                role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
              },
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!file) {
      throw new Error('File not found');
    }

    // Check permissions
    const hasPermission = 
      file.project.userId === userId ||
      file.project.collaborators.length > 0;

    if (!hasPermission) {
      throw new Error('No permission to delete this file');
    }

    try {
      // Delete from database
      await prisma.projectFile.delete({
        where: { id: fileId },
      });

      logger.info('File deleted successfully', { fileId, projectId: file.projectId });
    } catch (error) {
      logger.error('Failed to delete file', { error, fileId });
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Update file content
   */
  async updateFileContent(
    fileId: string,
    content: Buffer | string,
    userId: string
  ): Promise<ProjectFile> {
    // Get file with project info
    const file = await prisma.projectFile.findFirst({
      where: { id: fileId },
      include: {
        project: {
          select: {
            id: true,
            userId: true,
            collaborators: {
              where: {
                userId,
                role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
              },
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!file) {
      throw new Error('File not found');
    }

    // Check permissions
    const hasPermission = 
      file.project.userId === userId ||
      file.project.collaborators.length > 0;

    if (!hasPermission) {
      throw new Error('No permission to update this file');
    }

    const contentBuffer = typeof content === 'string' ? Buffer.from(content) : content;
    const newSize = contentBuffer.length;

    try {
      // Update in database
      const updatedFile = await prisma.projectFile.update({
        where: { id: fileId },
        data: {
          size: newSize,
          content: contentBuffer.toString('base64'),
          updatedAt: new Date(),
        },
      });

      logger.info('File content updated', { fileId, newSize });
      return updatedFile;
    } catch (error) {
      logger.error('Failed to update file content', { error, fileId });
      throw new Error('Failed to update file content');
    }
  }

  /**
   * Move/rename a file
   */
  async moveFile(
    fileId: string,
    newPath: string,
    userId: string
  ): Promise<ProjectFile> {
    // Get file with project info
    const file = await prisma.projectFile.findFirst({
      where: { id: fileId },
      include: {
        project: {
          select: {
            id: true,
            userId: true,
            collaborators: {
              where: {
                userId,
                role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
              },
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!file) {
      throw new Error('File not found');
    }

    // Check permissions
    const hasPermission = 
      file.project.userId === userId ||
      file.project.collaborators.length > 0;

    if (!hasPermission) {
      throw new Error('No permission to move this file');
    }

    const newFilename = path.basename(newPath);

    // Update in database
    const updatedFile = await prisma.projectFile.update({
      where: { id: fileId },
      data: {
        path: newPath,
        filename: newFilename,
        mimeType: getMimeType(newFilename),
        updatedAt: new Date(),
      },
    });

    logger.info('File moved/renamed', { fileId, oldPath: file.path, newPath });
    return updatedFile;
  }

  /**
   * Get file tree structure for a project
   */
  async getFileTree(projectId: string, userId: string): Promise<any> {
    // Verify access
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
    });

    if (!project) {
      throw new Error('Project not found or no permission');
    }

    // Get all files
    const files = await prisma.projectFile.findMany({
      where: { projectId },
      orderBy: { path: 'asc' },
      select: {
        id: true,
        filename: true,
        path: true,
        size: true,
        mimeType: true,
        updatedAt: true,
      },
    });

    // Build tree structure
    const tree = this.buildFileTree(files);
    return tree;
  }

  /**
   * Build hierarchical file tree from flat file list
   */
  private buildFileTree(files: any[]): any {
    const root: any = {
      name: 'root',
      type: 'directory',
      children: [],
    };

    for (const file of files) {
      const parts = file.path.split('/');
      let current = root;

      // Navigate/create directories
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        let child = current.children.find((c: any) => c.name === part && c.type === 'directory');
        
        if (!child) {
          child = {
            name: part,
            type: 'directory',
            children: [],
          };
          current.children.push(child);
        }
        
        current = child;
      }

      // Add file
      current.children.push({
        id: file.id,
        name: file.filename,
        type: 'file',
        size: file.size,
        mimeType: file.mimeType,
        updatedAt: file.updatedAt,
      });
    }

    return root;
  }

  /**
   * Generate signed URL for file upload (placeholder for now)
   */
  async getSignedUploadUrl(
    projectId: string,
    filename: string,
    mimeType: string,
    userId: string
  ): Promise<{ uploadUrl: string; fileId: string; s3Key: string }> {
    // Verify user has access to the project
    const project = await prisma.project.findFirst({
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

    if (!project) {
      throw new Error('Project not found or no permission');
    }

    const fileId = `file_${nanoid()}`;
    // For now, return a placeholder URL
    const uploadUrl = `/api/files/project/${projectId}/upload`;
    const s3Key = `projects/${projectId}/files/${fileId}/${filename}`;

    return { uploadUrl, fileId, s3Key };
  }

  /**
   * Get project storage statistics
   */
  async getStorageStats(projectId: string, userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, { count: number; size: number }>;
    largestFiles: any[];
  }> {
    // Verify access
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
    });

    if (!project) {
      throw new Error('Project not found or no permission');
    }

    // Get all files
    const files = await prisma.projectFile.findMany({
      where: { projectId },
      select: {
        id: true,
        filename: true,
        size: true,
        mimeType: true,
      },
    });

    // Calculate statistics
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    // Group by type
    const filesByType: Record<string, { count: number; size: number }> = {};
    for (const file of files) {
      const ext = path.extname(file.filename).toLowerCase() || 'unknown';
      if (!filesByType[ext]) {
        filesByType[ext] = { count: 0, size: 0 };
      }
      filesByType[ext].count++;
      filesByType[ext].size += file.size;
    }

    // Get largest files
    const largestFiles = files
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .map(file => ({
        id: file.id,
        filename: file.filename,
        size: file.size,
        mimeType: file.mimeType,
      }));

    return {
      totalFiles,
      totalSize,
      filesByType,
      largestFiles,
    };
  }
}

// Export singleton instance
export const fileService = new FileService();