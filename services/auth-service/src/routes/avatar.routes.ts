import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createRouteSchema, securitySchemes, standardResponses } from '../utils/swagger-schemas';
import { logger } from '../utils/logger';
import { createAvatarService } from '../services/avatar.service';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

// Request schemas
const setActiveAvatarSchema = z.object({
  avatarId: z.string().min(1)
});

const setGravatarSchema = z.object({
  email: z.string().email()
});

const cleanupAvatarsSchema = z.object({
  daysOld: z.number().min(1).max(365).default(30)
});

type SetActiveAvatarRequest = z.infer<typeof setActiveAvatarSchema>;
type SetGravatarRequest = z.infer<typeof setGravatarSchema>;
type CleanupAvatarsRequest = z.infer<typeof cleanupAvatarsSchema>;

/**
 * Avatar management routes
 */
export async function avatarRoutes(fastify: FastifyInstance) {
  const avatarService = createAvatarService({
    prisma: fastify.prisma
  });

  /**
   * Upload avatar
   */
  fastify.post('/avatar/upload', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Upload user avatar',
      description: `
Upload a new avatar image for the authenticated user.

**Features:**
- Automatic image resizing and optimization
- Multiple format variants (JPEG, WebP, PNG)
- Multiple size variants (32px to 512px)
- Secure file validation and processing
- Automatic old avatar deactivation

**Supported formats:** JPEG, PNG, WebP, GIF
**Maximum file size:** 5MB
**Generated variants:** 32px, 64px, 128px, 256px, 512px

**Processing:**
1. File validation and security checks
2. Image optimization and resizing
3. Generation of multiple size variants
4. Storage with unique filename
5. Database record creation
6. User profile update
      `,
      tags: ['Avatar Management'],
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          avatar: {
            type: 'string',
            format: 'binary',
            description: 'Avatar image file (JPEG, PNG, WebP, GIF)',
            maxLength: 5242880 // 5MB
          },
          source: {
            type: 'string',
            enum: ['upload', 'admin'],
            description: 'Source of the avatar upload',
            default: 'upload'
          }
        },
        required: ['avatar']
      },
      response: {
        201: {
          description: 'Avatar uploaded successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Avatar uploaded successfully' },
            data: {
              type: 'object',
              properties: {
                avatarId: { type: 'string', example: 'avatar_1642345678901_a1b2c3d4' },
                userId: { type: 'string', example: 'user_123' },
                filename: { type: 'string', example: 'user_123_1642345678901_a1b2c3d4.jpg' },
                url: { type: 'string', example: '/api/avatars/user_123_1642345678901_a1b2c3d4.jpg' },
                variants: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      size: { type: 'number', example: 128 },
                      url: { type: 'string', example: '/api/avatars/user_123_1642345678901_a1b2c3d4_128.jpg' },
                      format: { type: 'string', example: 'jpeg' },
                      fileSize: { type: 'number', example: 8192 }
                    }
                  }
                },
                uploadedAt: { type: 'string', format: 'date-time' },
                isActive: { type: 'boolean', example: true }
              }
            }
          }
        },
        400: standardResponses[400],
        401: standardResponses[401],
        413: {
          description: 'File too large',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'File Too Large' },
            message: { type: 'string', example: 'File size exceeds maximum allowed size' }
          }
        },
        415: {
          description: 'Unsupported media type',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Unsupported Media Type' },
            message: { type: 'string', example: 'File type not supported' }
          }
        },
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'No file provided'
        });
      }

      const avatar = await avatarService.uploadAvatar({
        userId: user.id,
        file: {
          filename: data.filename,
          mimetype: data.mimetype,
          encoding: data.encoding,
          file: data.file
        },
        metadata: {
          source: (data.fields as any)?.source?.value || 'upload',
          originalName: data.filename,
          uploadedBy: user.id
        }
      });

      reply.status(201).send({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          avatarId: avatar.id,
          userId: avatar.userId,
          filename: avatar.filename,
          url: avatar.url,
          variants: avatar.variants,
          uploadedAt: avatar.uploadedAt.toISOString(),
          isActive: avatar.isActive
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to upload avatar');
      
      if (error instanceof Error) {
        if (error.message.includes('Unsupported file type')) {
          return reply.status(415).send({
            success: false,
            error: 'Unsupported Media Type',
            message: error.message
          });
        }
        if (error.message.includes('exceeds maximum')) {
          return reply.status(413).send({
            success: false,
            error: 'File Too Large',
            message: error.message
          });
        }
        if (error.message.includes('Invalid image')) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid File',
            message: error.message
          });
        }
      }

      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to upload avatar'
      });
    }
  });

  /**
   * Get user avatar
   */
  fastify.get('/avatar', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get current user avatar',
      description: `
Get the current active avatar for the authenticated user.

**Response includes:**
- Avatar metadata and URLs
- All available size variants
- Upload information and source
- Processing status
      `,
      tags: ['Avatar Management'],
      response: {
        200: {
          description: 'Avatar retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              nullable: true,
              properties: {
                avatarId: { type: 'string', example: 'avatar_1642345678901_a1b2c3d4' },
                filename: { type: 'string', example: 'user_123_1642345678901_a1b2c3d4.jpg' },
                originalName: { type: 'string', example: 'profile-pic.jpg' },
                url: { type: 'string', example: '/api/avatars/user_123_1642345678901_a1b2c3d4.jpg' },
                variants: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      size: { type: 'number', example: 128 },
                      url: { type: 'string', example: '/api/avatars/user_123_1642345678901_a1b2c3d4_128.jpg' },
                      format: { type: 'string', example: 'jpeg' },
                      fileSize: { type: 'number', example: 8192 }
                    }
                  }
                },
                source: { type: 'string', example: 'upload' },
                uploadedAt: { type: 'string', format: 'date-time' },
                isActive: { type: 'boolean', example: true }
              }
            }
          }
        },
        401: standardResponses[401],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const avatar = await avatarService.getUserAvatar(user.id);

      reply.send({
        success: true,
        data: avatar ? {
          avatarId: avatar.id,
          filename: avatar.filename,
          originalName: avatar.originalName,
          url: avatar.url,
          variants: avatar.variants,
          source: avatar.source,
          uploadedAt: avatar.uploadedAt.toISOString(),
          isActive: avatar.isActive
        } : null
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to get user avatar');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve avatar'
      });
    }
  });

  /**
   * Get avatar history
   */
  fastify.get('/avatar/history', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get user avatar history',
      description: `
Get the complete avatar history for the authenticated user.

**Features:**
- Chronological avatar upload history
- Active and inactive avatars
- Source tracking (upload, gravatar, social)
- File size and variant information
      `,
      tags: ['Avatar Management'],
      response: {
        200: {
          description: 'Avatar history retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', example: 'user_123' },
                avatars: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      avatarId: { type: 'string', example: 'avatar_1642345678901_a1b2c3d4' },
                      filename: { type: 'string', example: 'user_123_1642345678901_a1b2c3d4.jpg' },
                      originalName: { type: 'string', example: 'profile-pic.jpg' },
                      url: { type: 'string', example: '/api/avatars/user_123_1642345678901_a1b2c3d4.jpg' },
                      source: { type: 'string', example: 'upload' },
                      uploadedAt: { type: 'string', format: 'date-time' },
                      isActive: { type: 'boolean', example: true },
                      variantCount: { type: 'number', example: 5 },
                      fileSize: { type: 'number', example: 65536 }
                    }
                  }
                },
                summary: {
                  type: 'object',
                  properties: {
                    totalAvatars: { type: 'number', example: 3 },
                    activeAvatar: { type: 'string', example: 'avatar_1642345678901_a1b2c3d4' },
                    totalStorageUsed: { type: 'number', example: 196608 },
                    sources: {
                      type: 'object',
                      properties: {
                        upload: { type: 'number', example: 2 },
                        gravatar: { type: 'number', example: 1 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: standardResponses[401],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const avatars = await avatarService.getUserAvatarHistory(user.id);

      // Calculate summary statistics
      const totalStorageUsed = avatars
        .filter(avatar => avatar.source === 'upload')
        .reduce((total, avatar) => total + avatar.size, 0);

      const sources = avatars.reduce((acc, avatar) => {
        acc[avatar.source] = (acc[avatar.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const activeAvatar = avatars.find(avatar => avatar.isActive);

      reply.send({
        success: true,
        data: {
          userId: user.id,
          avatars: avatars.map(avatar => ({
            avatarId: avatar.id,
            filename: avatar.filename,
            originalName: avatar.originalName,
            url: avatar.url,
            source: avatar.source,
            uploadedAt: avatar.uploadedAt.toISOString(),
            isActive: avatar.isActive,
            variantCount: avatar.variants.length,
            fileSize: avatar.size
          })),
          summary: {
            totalAvatars: avatars.length,
            activeAvatar: activeAvatar?.id || null,
            totalStorageUsed,
            sources
          }
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to get avatar history');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve avatar history'
      });
    }
  });

  /**
   * Set active avatar
   */
  fastify.put('/avatar/active', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Set active avatar',
      description: `
Set a specific avatar as the active avatar for the authenticated user.

**Process:**
1. Validates avatar ownership
2. Updates active avatar reference
3. Updates user profile avatar URL
4. Returns success confirmation

The avatar must belong to the authenticated user.
      `,
      tags: ['Avatar Management'],
      body: {
        type: 'object',
        properties: {
          avatarId: {
            type: 'string',
            minLength: 1,
            description: 'ID of the avatar to set as active',
            example: 'avatar_1642345678901_a1b2c3d4'
          }
        },
        required: ['avatarId']
      },
      response: {
        200: {
          description: 'Active avatar updated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Active avatar updated successfully' },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', example: 'user_123' },
                activeAvatarId: { type: 'string', example: 'avatar_1642345678901_a1b2c3d4' },
                avatarUrl: { type: 'string', example: '/api/avatars/user_123_1642345678901_a1b2c3d4_128.jpg' }
              }
            }
          }
        },
        400: standardResponses[400],
        401: standardResponses[401],
        404: {
          description: 'Avatar not found',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Not Found' },
            message: { type: 'string', example: 'Avatar not found' }
          }
        },
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: SetActiveAvatarRequest }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { avatarId } = request.body;

      await avatarService.setActiveAvatar(user.id, avatarId);

      // Get updated avatar info
      const avatar = await avatarService.getUserAvatar(user.id);

      reply.send({
        success: true,
        message: 'Active avatar updated successfully',
        data: {
          userId: user.id,
          activeAvatarId: avatarId,
          avatarUrl: avatar?.url || null
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to set active avatar');
      
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to set active avatar'
      });
    }
  });

  /**
   * Delete avatar
   */
  fastify.delete('/avatar/:avatarId', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Delete user avatar',
      description: `
Delete a specific avatar and its associated files.

**Process:**
1. Validates avatar ownership
2. Deletes all image files and variants
3. Removes database record
4. Updates active avatar if necessary
5. Cleans up storage

**Warning:** This action is irreversible. All image files will be permanently deleted.
      `,
      tags: ['Avatar Management'],
      params: {
        type: 'object',
        properties: {
          avatarId: {
            type: 'string',
            description: 'ID of the avatar to delete',
            example: 'avatar_1642345678901_a1b2c3d4'
          }
        },
        required: ['avatarId']
      },
      response: {
        200: {
          description: 'Avatar deleted successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Avatar deleted successfully' },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', example: 'user_123' },
                deletedAvatarId: { type: 'string', example: 'avatar_1642345678901_a1b2c3d4' },
                newActiveAvatarId: { type: 'string', nullable: true, example: 'avatar_1642345678902_b2c3d4e5' }
              }
            }
          }
        },
        401: standardResponses[401],
        404: {
          description: 'Avatar not found',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Not Found' },
            message: { type: 'string', example: 'Avatar not found' }
          }
        },
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Params: { avatarId: string } }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { avatarId } = request.params;

      await avatarService.deleteAvatar(user.id, avatarId);

      // Check if there's a new active avatar
      const currentAvatar = await avatarService.getUserAvatar(user.id);

      reply.send({
        success: true,
        message: 'Avatar deleted successfully',
        data: {
          userId: user.id,
          deletedAvatarId: avatarId,
          newActiveAvatarId: currentAvatar?.id || null
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to delete avatar');
      
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete avatar'
      });
    }
  });

  /**
   * Set Gravatar avatar
   */
  fastify.post('/avatar/gravatar', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Set Gravatar as avatar',
      description: `
Set a Gravatar image as the user's avatar.

**Features:**
- Automatic Gravatar URL generation
- Multiple size variants
- Email hash-based avatar retrieval
- Fallback to default avatar styles

**Process:**
1. Generates MD5 hash of email
2. Creates Gravatar URLs for all sizes
3. Sets as active avatar
4. Updates user profile

**Note:** The email address is hashed and not stored in plain text.
      `,
      tags: ['Avatar Management'],
      body: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'Email address for Gravatar lookup',
            example: 'user@example.com'
          }
        },
        required: ['email']
      },
      response: {
        201: {
          description: 'Gravatar avatar set successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Gravatar avatar set successfully' },
            data: {
              type: 'object',
              properties: {
                avatarId: { type: 'string', example: 'gravatar_1642345678901_a1b2c3d4' },
                userId: { type: 'string', example: 'user_123' },
                url: { type: 'string', example: 'https://www.gravatar.com/avatar/hash?s=128&d=identicon' },
                variants: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      size: { type: 'number', example: 128 },
                      url: { type: 'string', example: 'https://www.gravatar.com/avatar/hash?s=128&d=identicon' }
                    }
                  }
                },
                source: { type: 'string', example: 'gravatar' },
                isActive: { type: 'boolean', example: true }
              }
            }
          }
        },
        400: standardResponses[400],
        401: standardResponses[401],
        503: {
          description: 'Gravatar service unavailable',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Service Unavailable' },
            message: { type: 'string', example: 'Gravatar integration is disabled' }
          }
        },
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: SetGravatarRequest }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { email } = request.body;

      const avatar = await avatarService.setGravatarAvatar(user.id, email);

      reply.status(201).send({
        success: true,
        message: 'Gravatar avatar set successfully',
        data: {
          avatarId: avatar.id,
          userId: avatar.userId,
          url: avatar.url,
          variants: avatar.variants.map(variant => ({
            size: variant.size,
            url: variant.url
          })),
          source: avatar.source,
          isActive: avatar.isActive
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to set Gravatar avatar');
      
      if (error instanceof Error && error.message.includes('disabled')) {
        return reply.status(503).send({
          success: false,
          error: 'Service Unavailable',
          message: error.message
        });
      }

      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to set Gravatar avatar'
      });
    }
  });

  /**
   * Serve avatar files
   */
  fastify.get('/avatars/:filename', {
    schema: createRouteSchema({
      summary: 'Serve avatar file',
      description: `
Serve avatar image files directly.

**Features:**
- Direct file serving
- Proper MIME type headers
- Cache headers for optimization
- 404 handling for missing files

**Note:** This is a public endpoint for serving avatar images.
      `,
      tags: ['Avatar Management'],
      params: {
        type: 'object',
        properties: {
          filename: {
            type: 'string',
            description: 'Avatar filename to serve',
            example: 'user_123_1642345678901_a1b2c3d4_128.jpg'
          }
        },
        required: ['filename']
      },
      response: {
        200: {
          description: 'Avatar file served successfully',
          content: {
            'image/jpeg': { schema: { type: 'string', format: 'binary' } },
            'image/png': { schema: { type: 'string', format: 'binary' } },
            'image/webp': { schema: { type: 'string', format: 'binary' } }
          }
        },
        404: {
          description: 'Avatar file not found',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Not Found' },
            message: { type: 'string', example: 'Avatar file not found' }
          }
        }
      }
    })
  }, async (request: FastifyRequest<{ Params: { filename: string } }>, reply: FastifyReply) => {
    try {
      const { filename } = request.params;
      const config = avatarService.getConfig();
      const filePath = path.join(config.uploadDir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Avatar file not found'
        });
      }

      // Get file extension and set appropriate MIME type
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif'
      };

      const mimeType = mimeTypes[ext] || 'application/octet-stream';

      // Set cache headers
      reply.header('Content-Type', mimeType);
      reply.header('Cache-Control', 'public, max-age=31536000'); // 1 year
      reply.header('ETag', filename);

      // Send file
      return reply.sendFile(filename, config.uploadDir);

    } catch (error) {
      logger.error({ error, filename: request.params.filename }, 'Failed to serve avatar file');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to serve avatar file'
      });
    }
  });

  /**
   * Admin: Cleanup old avatars
   */
  fastify.post('/avatars/cleanup', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Cleanup old avatar files (Admin)',
      description: `
Clean up old, inactive avatar files to free up storage space.

**Admin Permission Required**

**Process:**
1. Identifies inactive avatars older than specified days
2. Deletes image files and variants
3. Updates database records
4. Returns cleanup statistics

**Default:** Cleans avatars older than 30 days
**Scope:** Only uploaded avatars (not Gravatar or social)
      `,
      tags: ['Avatar Management'],
      body: {
        type: 'object',
        properties: {
          daysOld: {
            type: 'number',
            minimum: 1,
            maximum: 365,
            default: 30,
            description: 'Delete avatars older than this many days',
            example: 30
          }
        }
      },
      response: {
        200: {
          description: 'Avatar cleanup completed successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Avatar cleanup completed successfully' },
            data: {
              type: 'object',
              properties: {
                cleanedCount: { type: 'number', example: 15 },
                daysOld: { type: 'number', example: 30 },
                storageFreed: { type: 'number', example: 1048576 },
                completedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        401: standardResponses[401],
        403: standardResponses[403],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: CleanupAvatarsRequest }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for avatar cleanup'
        });
      }

      const { daysOld = 30 } = request.body;

      const cleanedCount = await avatarService.cleanupOldAvatars(daysOld);

      // Log cleanup action
      await fastify.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'AVATAR_CLEANUP_EXECUTED',
          category: 'ADMIN',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            daysOld,
            cleanedCount,
            executedAt: new Date().toISOString()
          }
        }
      });

      reply.send({
        success: true,
        message: 'Avatar cleanup completed successfully',
        data: {
          cleanedCount,
          daysOld,
          storageFreed: cleanedCount * 65536, // Estimated average file size
          completedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to cleanup avatars');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to cleanup avatars'
      });
    }
  });
}