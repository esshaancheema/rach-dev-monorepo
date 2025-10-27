import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createRouteSchema, securitySchemes, standardResponses } from '../utils/swagger-schemas';
import { logger } from '../utils/logger';
import { 
  emailTemplateService, 
  EmailTemplate, 
  EmailTemplateData, 
  EmailTemplateCategory 
} from '../services/email-template.service';
import { z } from 'zod';

// Schema definitions
const emailTemplateSchema = z.object({
  id: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/, 'ID must contain only lowercase letters, numbers, hyphens, and underscores'),
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  htmlContent: z.string().min(1),
  textContent: z.string().optional(),
  category: z.nativeEnum(EmailTemplateCategory),
  isActive: z.boolean().default(true),
  variables: z.array(z.string()).optional()
});

const updateTemplateSchema = emailTemplateSchema.partial().omit({ id: true });

const previewDataSchema = z.object({
  user: z.object({
    id: z.string().optional(),
    email: z.string().email().optional(),
    name: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional()
  }).optional(),
  app: z.object({
    name: z.string().optional(),
    url: z.string().url().optional(),
    supportEmail: z.string().email().optional(),
    logoUrl: z.string().url().optional()
  }).optional(),
  verification: z.object({
    token: z.string().optional(),
    url: z.string().url().optional(),
    expiresAt: z.string().datetime().optional(),
    expiresInHours: z.number().optional()
  }).optional(),
  reset: z.object({
    token: z.string().optional(),
    url: z.string().url().optional(),
    expiresAt: z.string().datetime().optional(),
    expiresInHours: z.number().optional()
  }).optional(),
  twoFactor: z.object({
    code: z.string().optional(),
    expiresInMinutes: z.number().optional()
  }).optional(),
  login: z.object({
    ip: z.string().optional(),
    location: z.string().optional(),
    device: z.string().optional(),
    timestamp: z.string().datetime().optional()
  }).optional(),
  security: z.object({
    action: z.string().optional(),
    ip: z.string().optional(),
    timestamp: z.string().datetime().optional(),
    details: z.any().optional()
  }).optional(),
  custom: z.record(z.any()).optional()
});

type CreateTemplateBody = z.infer<typeof emailTemplateSchema>;
type UpdateTemplateBody = z.infer<typeof updateTemplateSchema>;
type PreviewData = z.infer<typeof previewDataSchema>;

/**
 * Email template management routes
 */
export async function emailTemplatesRoutes(fastify: FastifyInstance) {

  /**
   * List all email templates
   */
  fastify.get('/templates', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'List email templates',
      description: `
Get a list of all email templates, optionally filtered by category.

**Admin Permission Required**

**Features:**
- Filter by template category
- View template metadata and variables
- Check active status
- Sort by creation/update date

**Template Categories:**
- authentication: Login, registration, account setup
- verification: Email/phone verification
- security: Password reset, login notifications, security alerts
- notification: General user notifications
- marketing: Promotional emails, newsletters
- system: System announcements, maintenance notices

**Use Cases:**
- Template management dashboard
- Template selection for customization
- Template status monitoring
- Template inventory and organization
      `,
      tags: ['Email Templates'],
      querystring: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: Object.values(EmailTemplateCategory),
            description: 'Filter templates by category'
          },
          active: {
            type: 'boolean',
            description: 'Filter by active status'
          }
        }
      },
      response: {
        200: {
          description: 'Templates retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                templates: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'welcome' },
                      name: { type: 'string', example: 'Welcome Email' },
                      subject: { type: 'string', example: 'Welcome to {{app.name}}!' },
                      category: { type: 'string', enum: Object.values(EmailTemplateCategory) },
                      isActive: { type: 'boolean', example: true },
                      variables: { 
                        type: 'array', 
                        items: { type: 'string' },
                        example: ['user.name', 'app.name', 'app.url']
                      },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                      version: { type: 'number', example: 1 }
                    }
                  }
                },
                total: { type: 'number', example: 5 },
                categories: {
                  type: 'object',
                  additionalProperties: { type: 'number' },
                  example: {
                    authentication: 2,
                    verification: 1,
                    security: 2
                  }
                }
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
  }, async (request: FastifyRequest<{ Querystring: { category?: EmailTemplateCategory; active?: boolean } }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to manage email templates'
        });
      }

      const { category, active } = request.query;

      let templates = await emailTemplateService.listTemplates(category);

      // Filter by active status if specified
      if (typeof active === 'boolean') {
        templates = templates.filter(template => template.isActive === active);
      }

      // Calculate category counts
      const allTemplates = await emailTemplateService.listTemplates();
      const categories = allTemplates.reduce((acc, template) => {
        acc[template.category] = (acc[template.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      reply.send({
        success: true,
        data: {
          templates: templates.map(template => ({
            id: template.id,
            name: template.name,
            subject: template.subject,
            category: template.category,
            isActive: template.isActive,
            variables: template.variables,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
            version: template.version
          })),
          total: templates.length,
          categories
        }
      });

    } catch (error) {
      logger.error({ error }, 'Failed to list email templates');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve email templates'
      });
    }
  });

  /**
   * Get a specific email template
   */
  fastify.get('/templates/:templateId', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get email template by ID',
      description: `
Retrieve a specific email template with full content and metadata.

**Admin Permission Required**

**Includes:**
- Complete HTML and text content
- Template variables and their usage
- Template metadata and version history
- Compilation status and errors

**Use Cases:**
- Template editing and customization
- Template preview and testing
- Template debugging and troubleshooting
- Template content analysis
      `,
      tags: ['Email Templates'],
      params: {
        type: 'object',
        properties: {
          templateId: { type: 'string', description: 'Template ID' }
        },
        required: ['templateId']
      },
      response: {
        200: {
          description: 'Template retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                template: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    subject: { type: 'string' },
                    htmlContent: { type: 'string' },
                    textContent: { type: 'string' },
                    category: { type: 'string', enum: Object.values(EmailTemplateCategory) },
                    isActive: { type: 'boolean' },
                    variables: { type: 'array', items: { type: 'string' } },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    version: { type: 'number' }
                  }
                }
              }
            }
          }
        },
        404: standardResponses[404],
        401: standardResponses[401],
        403: standardResponses[403],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Params: { templateId: string } }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to view email templates'
        });
      }

      const { templateId } = request.params;
      const template = await emailTemplateService.getTemplate(templateId);

      if (!template) {
        return reply.status(404).send({
          success: false,
          error: 'Template not found',
          message: `Email template '${templateId}' not found`
        });
      }

      reply.send({
        success: true,
        data: { template }
      });

    } catch (error) {
      logger.error({ error, templateId: request.params.templateId }, 'Failed to get email template');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve email template'
      });
    }
  });

  /**
   * Create a new email template
   */
  fastify.post('/templates', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Create email template',
      description: `
Create a new email template with HTML and text content.

**Admin Permission Required**

**Features:**
- Handlebars template compilation and validation
- Automatic variable extraction from content
- HTML to text conversion (if text not provided)
- Template preview and testing capabilities

**Template Variables:**
Templates support Handlebars syntax with predefined helpers:
- {{user.name}}, {{user.email}} - User information
- {{app.name}}, {{app.url}} - Application details
- {{formatDate date}}, {{fromNow date}} - Date formatting
- {{url path}} - URL generation with base URL
- {{#if condition}} - Conditional content

**Validation:**
- Template ID must be unique and URL-safe
- HTML content is required, text is optional
- Subject line supports template variables
- Variables are automatically extracted and validated
      `,
      tags: ['Email Templates'],
      body: {
        type: 'object',
        properties: {
          id: { 
            type: 'string', 
            pattern: '^[a-z0-9_-]+$',
            minLength: 1,
            maxLength: 50,
            description: 'Unique template ID (lowercase, alphanumeric, hyphens, underscores)',
            example: 'welcome_email'
          },
          name: { 
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Human-readable template name',
            example: 'Welcome Email'
          },
          subject: { 
            type: 'string',
            minLength: 1,
            maxLength: 200,
            description: 'Email subject line (supports Handlebars)',
            example: 'Welcome to {{app.name}}!'
          },
          htmlContent: { 
            type: 'string',
            minLength: 1,
            description: 'HTML email content (supports Handlebars)',
            example: '<h1>Welcome {{user.name}}!</h1><p>Thank you for joining {{app.name}}.</p>'
          },
          textContent: { 
            type: 'string',
            description: 'Plain text content (optional, auto-generated if not provided)',
            example: 'Welcome {{user.name}}! Thank you for joining {{app.name}}.'
          },
          category: { 
            type: 'string',
            enum: Object.values(EmailTemplateCategory),
            description: 'Template category for organization'
          },
          isActive: { 
            type: 'boolean',
            default: true,
            description: 'Whether the template is active and can be used'
          }
        },
        required: ['id', 'name', 'subject', 'htmlContent', 'category']
      },
      response: {
        201: {
          description: 'Template created successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Email template created successfully' },
            data: {
              type: 'object',
              properties: {
                template: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    subject: { type: 'string' },
                    category: { type: 'string' },
                    isActive: { type: 'boolean' },
                    variables: { type: 'array', items: { type: 'string' } },
                    createdAt: { type: 'string', format: 'date-time' },
                    version: { type: 'number', example: 1 }
                  }
                }
              }
            }
          }
        },
        400: standardResponses[400],
        401: standardResponses[401],
        403: standardResponses[403],
        409: {
          description: 'Template ID already exists',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Template already exists' },
            message: { type: 'string', example: 'A template with this ID already exists' }
          }
        },
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: CreateTemplateBody }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to create email templates'
        });
      }

      const templateData = request.body;

      // Validate the request body
      const validation = emailTemplateSchema.safeParse(templateData);
      if (!validation.success) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          message: 'Invalid template data',
          details: validation.error.issues
        });
      }

      // Check if template ID already exists
      const existingTemplate = await emailTemplateService.getTemplate(templateData.id);
      if (existingTemplate) {
        return reply.status(409).send({
          success: false,
          error: 'Template already exists',
          message: `A template with ID '${templateData.id}' already exists`
        });
      }

      const template = await emailTemplateService.createTemplate(templateData);

      // Log the creation
      logger.info({
        templateId: template.id,
        adminId: user.id,
        adminEmail: user.email
      }, 'Email template created');

      reply.status(201).send({
        success: true,
        message: 'Email template created successfully',
        data: { template }
      });

    } catch (error) {
      logger.error({ error, templateData: request.body }, 'Failed to create email template');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to create email template'
      });
    }
  });

  /**
   * Update an existing email template
   */
  fastify.put('/templates/:templateId', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Update email template',
      description: `
Update an existing email template with new content or settings.

**Admin Permission Required**

**Features:**
- Partial updates (only provide fields to change)
- Automatic recompilation of template
- Variable re-extraction on content changes
- Version increment tracking
- Rollback capability (future feature)

**Update Behavior:**
- Template ID cannot be changed
- Variables are automatically re-extracted if content changes
- Text content is auto-generated if HTML changes but text isn't provided
- Template is automatically recompiled after updates
- Version number is incremented
      `,
      tags: ['Email Templates'],
      params: {
        type: 'object',
        properties: {
          templateId: { type: 'string', description: 'Template ID' }
        },
        required: ['templateId']
      },
      body: {
        type: 'object',
        properties: {
          name: { 
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Template name'
          },
          subject: { 
            type: 'string',
            minLength: 1,
            maxLength: 200,
            description: 'Email subject line'
          },
          htmlContent: { 
            type: 'string',
            minLength: 1,
            description: 'HTML email content'
          },
          textContent: { 
            type: 'string',
            description: 'Plain text content'
          },
          category: { 
            type: 'string',
            enum: Object.values(EmailTemplateCategory),
            description: 'Template category'
          },
          isActive: { 
            type: 'boolean',
            description: 'Template active status'
          }
        }
      },
      response: {
        200: {
          description: 'Template updated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Email template updated successfully' },
            data: {
              type: 'object',
              properties: {
                template: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    subject: { type: 'string' },
                    category: { type: 'string' },
                    isActive: { type: 'boolean' },
                    variables: { type: 'array', items: { type: 'string' } },
                    updatedAt: { type: 'string', format: 'date-time' },
                    version: { type: 'number' }
                  }
                }
              }
            }
          }
        },
        400: standardResponses[400],
        401: standardResponses[401],
        403: standardResponses[403],
        404: standardResponses[404],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Params: { templateId: string }; Body: UpdateTemplateBody }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to update email templates'
        });
      }

      const { templateId } = request.params;
      const updates = request.body;

      // Validate the request body
      const validation = updateTemplateSchema.safeParse(updates);
      if (!validation.success) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          message: 'Invalid update data',
          details: validation.error.issues
        });
      }

      // Check if template exists
      const existingTemplate = await emailTemplateService.getTemplate(templateId);
      if (!existingTemplate) {
        return reply.status(404).send({
          success: false,
          error: 'Template not found',
          message: `Email template '${templateId}' not found`
        });
      }

      const template = await emailTemplateService.updateTemplate(templateId, updates);

      // Log the update
      logger.info({
        templateId,
        updates: Object.keys(updates),
        adminId: user.id,
        adminEmail: user.email
      }, 'Email template updated');

      reply.send({
        success: true,
        message: 'Email template updated successfully',
        data: { template }
      });

    } catch (error) {
      logger.error({ error, templateId: request.params.templateId, updates: request.body }, 'Failed to update email template');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to update email template'
      });
    }
  });

  /**
   * Delete an email template
   */
  fastify.delete('/templates/:templateId', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Delete email template',
      description: `
Delete an email template permanently.

**Admin Permission Required**

**Warning:** This action is irreversible. Consider deactivating the template instead if you might need it later.

**Safety Measures:**
- Cannot delete templates that are currently in use
- Default system templates cannot be deleted
- Audit log entry is created for compliance
- Backup recommendation before deletion

**Use Cases:**
- Remove unused custom templates
- Clean up development/test templates
- Template lifecycle management
      `,
      tags: ['Email Templates'],
      params: {
        type: 'object',
        properties: {
          templateId: { type: 'string', description: 'Template ID' }
        },
        required: ['templateId']
      },
      response: {
        200: {
          description: 'Template deleted successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Email template deleted successfully' }
          }
        },
        401: standardResponses[401],
        403: standardResponses[403],
        404: standardResponses[404],
        409: {
          description: 'Template cannot be deleted',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Template in use' },
            message: { type: 'string', example: 'Cannot delete template that is currently in use' }
          }
        },
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Params: { templateId: string } }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to delete email templates'
        });
      }

      const { templateId } = request.params;

      // Check if template exists
      const template = await emailTemplateService.getTemplate(templateId);
      if (!template) {
        return reply.status(404).send({
          success: false,
          error: 'Template not found',
          message: `Email template '${templateId}' not found`
        });
      }

      // Prevent deletion of default system templates
      const defaultTemplateIds = ['welcome', 'email_verification', 'password_reset', 'login_notification', 'two_factor_code'];
      if (defaultTemplateIds.includes(templateId)) {
        return reply.status(409).send({
          success: false,
          error: 'Cannot delete system template',
          message: 'Default system templates cannot be deleted. Consider deactivating instead.'
        });
      }

      await emailTemplateService.deleteTemplate(templateId);

      // Log the deletion
      logger.warn({
        templateId,
        templateName: template.name,
        adminId: user.id,
        adminEmail: user.email
      }, 'Email template deleted');

      reply.send({
        success: true,
        message: 'Email template deleted successfully'
      });

    } catch (error) {
      logger.error({ error, templateId: request.params.templateId }, 'Failed to delete email template');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to delete email template'
      });
    }
  });

  /**
   * Preview an email template with sample data
   */
  fastify.post('/templates/:templateId/preview', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Preview email template',
      description: `
Generate a preview of an email template with custom or sample data.

**Admin Permission Required**

**Features:**
- Render template with real data for testing
- Automatic sample data generation for missing fields
- HTML and text content preview
- Variable substitution validation
- Template error detection and reporting

**Preview Data:**
Provide custom data or use default sample data:
- User information (name, email, etc.)
- Application settings (name, URLs, branding)
- Action-specific data (verification links, codes, etc.)
- Custom variables for specialized templates

**Use Cases:**
- Template design and testing
- Content validation before deployment
- A/B testing different template versions
- Template debugging and troubleshooting
      `,
      tags: ['Email Templates'],
      params: {
        type: 'object',
        properties: {
          templateId: { type: 'string', description: 'Template ID' }
        },
        required: ['templateId']
      },
      body: {
        type: 'object',
        description: 'Preview data (optional, sample data used if not provided)',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'user_123' },
              email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
              name: { type: 'string', example: 'John Doe' },
              firstName: { type: 'string', example: 'John' },
              lastName: { type: 'string', example: 'Doe' }
            }
          },
          app: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Zoptal' },
              url: { type: 'string', format: 'uri', example: 'https://zoptal.com' },
              supportEmail: { type: 'string', format: 'email', example: 'support@zoptal.com' },
              logoUrl: { type: 'string', format: 'uri', example: 'https://zoptal.com/logo.png' }
            }
          },
          verification: {
            type: 'object',
            properties: {
              token: { type: 'string', example: 'verification_token_123' },
              url: { type: 'string', format: 'uri', example: 'https://zoptal.com/verify?token=abc123' },
              expiresAt: { type: 'string', format: 'date-time' },
              expiresInHours: { type: 'number', example: 24 }
            }
          },
          custom: {
            type: 'object',
            additionalProperties: true,
            description: 'Custom variables for specialized templates'
          }
        }
      },
      response: {
        200: {
          description: 'Template preview generated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                preview: {
                  type: 'object',
                  properties: {
                    subject: { type: 'string', example: 'Welcome to Zoptal!' },
                    html: { type: 'string', example: '<html><body><h1>Welcome John!</h1></body></html>' },
                    text: { type: 'string', example: 'Welcome John! Thank you for joining Zoptal.' }
                  }
                },
                template: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    variables: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        },
        401: standardResponses[401],
        403: standardResponses[403],
        404: standardResponses[404],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Params: { templateId: string }; Body: PreviewData }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to preview email templates'
        });
      }

      const { templateId } = request.params;
      const previewData = request.body || {};

      // Validate preview data
      const validation = previewDataSchema.safeParse(previewData);
      if (!validation.success) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          message: 'Invalid preview data',
          details: validation.error.issues
        });
      }

      // Check if template exists
      const template = await emailTemplateService.getTemplate(templateId);
      if (!template) {
        return reply.status(404).send({
          success: false,
          error: 'Template not found',
          message: `Email template '${templateId}' not found`
        });
      }

      // Convert string dates to Date objects
      const processedData: EmailTemplateData = {
        ...previewData,
        verification: previewData.verification ? {
          ...previewData.verification,
          expiresAt: previewData.verification.expiresAt ? new Date(previewData.verification.expiresAt) : undefined
        } : undefined,
        reset: previewData.reset ? {
          ...previewData.reset,
          expiresAt: previewData.reset.expiresAt ? new Date(previewData.reset.expiresAt) : undefined
        } : undefined,
        login: previewData.login ? {
          ...previewData.login,
          timestamp: previewData.login.timestamp ? new Date(previewData.login.timestamp) : undefined
        } : undefined,
        security: previewData.security ? {
          ...previewData.security,
          timestamp: previewData.security.timestamp ? new Date(previewData.security.timestamp) : undefined
        } : undefined
      };

      const preview = await emailTemplateService.previewTemplate(templateId, processedData);

      reply.send({
        success: true,
        data: {
          preview,
          template: {
            id: template.id,
            name: template.name,
            variables: template.variables
          }
        }
      });

    } catch (error) {
      logger.error({ error, templateId: request.params.templateId }, 'Failed to preview email template');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to preview email template'
      });
    }
  });
}