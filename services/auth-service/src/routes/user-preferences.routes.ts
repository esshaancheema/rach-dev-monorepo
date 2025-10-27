import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createRouteSchema, securitySchemes, standardResponses } from '../utils/swagger-schemas';
import { logger } from '../utils/logger';
import { createUserPreferencesService } from '../services/user-preferences.service';
import { z } from 'zod';
import {
  notificationPreferencesSchema,
  privacyPreferencesSchema,
  accessibilityPreferencesSchema,
  appearancePreferencesSchema,
  communicationPreferencesSchema,
  securityPreferencesSchema,
  contentPreferencesSchema,
  userPreferencesSchema
} from '../services/user-preferences.service';

// Request schemas
const updatePreferencesSchema = z.object({
  notifications: notificationPreferencesSchema.partial().optional(),
  privacy: privacyPreferencesSchema.partial().optional(),
  accessibility: accessibilityPreferencesSchema.partial().optional(),
  appearance: appearancePreferencesSchema.partial().optional(),
  communication: communicationPreferencesSchema.partial().optional(),
  security: securityPreferencesSchema.partial().optional(),
  content: contentPreferencesSchema.partial().optional()
});

const privacyPresetSchema = z.object({
  preset: z.enum(['minimal', 'balanced', 'maximum'])
});

const resetPreferencesSchema = z.object({
  sections: z.array(z.enum(['notifications', 'privacy', 'accessibility', 'appearance', 'communication', 'security', 'content'])).optional(),
  confirmReset: z.boolean()
});

type UpdatePreferencesRequest = z.infer<typeof updatePreferencesSchema>;
type PrivacyPresetRequest = z.infer<typeof privacyPresetSchema>;
type ResetPreferencesRequest = z.infer<typeof resetPreferencesSchema>;

/**
 * User preferences management routes
 */
export async function userPreferencesRoutes(fastify: FastifyInstance) {
  const preferencesService = createUserPreferencesService({ prisma: fastify.prisma });

  /**
   * Get all user preferences
   */
  fastify.get('/preferences', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get user preferences',
      description: `
Retrieve all preference settings for the authenticated user.

**Preference Categories:**
- **Notifications**: Email, SMS, and push notification settings
- **Privacy**: Profile visibility, data collection, and sharing settings
- **Accessibility**: High contrast, screen reader, and other accessibility options
- **Appearance**: Theme, colors, layout preferences
- **Communication**: Language, timezone, date/time formats
- **Security**: 2FA, login alerts, session settings
- **Content**: Interests, content filtering, autoplay settings

**Default Values:**
If preferences have not been set, default values are returned based on privacy-first principles.
      `,
      tags: ['User Preferences'],
      response: {
        200: {
          description: 'Preferences retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                preferences: {
                  type: 'object',
                  properties: {
                    notifications: { $ref: '#/components/schemas/NotificationPreferences' },
                    privacy: { $ref: '#/components/schemas/PrivacyPreferences' },
                    accessibility: { $ref: '#/components/schemas/AccessibilityPreferences' },
                    appearance: { $ref: '#/components/schemas/AppearancePreferences' },
                    communication: { $ref: '#/components/schemas/CommunicationPreferences' },
                    security: { $ref: '#/components/schemas/SecurityPreferences' },
                    content: { $ref: '#/components/schemas/ContentPreferences' }
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
      const preferences = await preferencesService.getUserPreferences(user.id);

      reply.send({
        success: true,
        data: { preferences }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user.id }, 'Failed to get user preferences');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve preferences'
      });
    }
  });

  /**
   * Update user preferences
   */
  fastify.put('/preferences', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Update user preferences',
      description: `
Update one or more preference categories for the authenticated user.

**Update Behavior:**
- Only provided fields are updated
- Nested objects are merged, not replaced
- Invalid values are rejected with validation errors
- Changes are logged for audit purposes

**Example:**
To update only email notification settings:
\`\`\`json
{
  "notifications": {
    "email": {
      "marketing": false,
      "updates": true
    }
  }
}
\`\`\`
      `,
      tags: ['User Preferences'],
      body: {
        type: 'object',
        properties: {
          notifications: { $ref: '#/components/schemas/NotificationPreferences' },
          privacy: { $ref: '#/components/schemas/PrivacyPreferences' },
          accessibility: { $ref: '#/components/schemas/AccessibilityPreferences' },
          appearance: { $ref: '#/components/schemas/AppearancePreferences' },
          communication: { $ref: '#/components/schemas/CommunicationPreferences' },
          security: { $ref: '#/components/schemas/SecurityPreferences' },
          content: { $ref: '#/components/schemas/ContentPreferences' }
        }
      },
      response: {
        200: {
          description: 'Preferences updated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Preferences updated successfully' },
            data: {
              type: 'object',
              properties: {
                preferences: { $ref: '#/components/schemas/UserPreferences' },
                updatedSections: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['notifications', 'privacy']
                }
              }
            }
          }
        },
        400: standardResponses[400],
        401: standardResponses[401],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: UpdatePreferencesRequest }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const updates = request.body;

      // Validate the update request
      const validation = updatePreferencesSchema.safeParse(updates);
      if (!validation.success) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          message: 'Invalid preference values',
          details: validation.error.issues
        });
      }

      const preferences = await preferencesService.updateUserPreferences(user.id, updates);
      const updatedSections = Object.keys(updates);

      reply.send({
        success: true,
        message: 'Preferences updated successfully',
        data: {
          preferences,
          updatedSections
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user.id }, 'Failed to update user preferences');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update preferences'
      });
    }
  });

  /**
   * Get specific preference section
   */
  fastify.get('/preferences/:section', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get specific preference section',
      description: `
Retrieve a specific section of user preferences.

**Available Sections:**
- notifications
- privacy
- accessibility
- appearance
- communication
- security
- content
      `,
      tags: ['User Preferences'],
      params: {
        type: 'object',
        properties: {
          section: {
            type: 'string',
            enum: ['notifications', 'privacy', 'accessibility', 'appearance', 'communication', 'security', 'content']
          }
        },
        required: ['section']
      },
      response: {
        200: {
          description: 'Preference section retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              additionalProperties: true
            }
          }
        },
        401: standardResponses[401],
        404: standardResponses[404],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Params: { section: keyof UpdatePreferencesRequest } }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { section } = request.params;

      const preferences = await preferencesService.getUserPreferences(user.id);
      
      if (!(section in preferences)) {
        return reply.status(404).send({
          success: false,
          error: 'Not found',
          message: `Preference section '${section}' not found`
        });
      }

      reply.send({
        success: true,
        data: preferences[section]
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user.id, section: request.params.section }, 'Failed to get preference section');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve preference section'
      });
    }
  });

  /**
   * Update specific preference section
   */
  fastify.put('/preferences/:section', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Update specific preference section',
      description: `
Update a specific section of user preferences.

**Merge Behavior:**
Updates are merged with existing values in the section, not replaced entirely.
      `,
      tags: ['User Preferences'],
      params: {
        type: 'object',
        properties: {
          section: {
            type: 'string',
            enum: ['notifications', 'privacy', 'accessibility', 'appearance', 'communication', 'security', 'content']
          }
        },
        required: ['section']
      },
      body: {
        type: 'object',
        additionalProperties: true
      },
      response: {
        200: {
          description: 'Preference section updated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Preference section updated successfully' },
            data: {
              type: 'object',
              additionalProperties: true
            }
          }
        },
        400: standardResponses[400],
        401: standardResponses[401],
        404: standardResponses[404],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Params: { section: keyof UpdatePreferencesRequest }; Body: any }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { section } = request.params;
      const updates = request.body;

      const sectionData = await preferencesService.updatePreferenceSection(user.id, section, updates);

      reply.send({
        success: true,
        message: 'Preference section updated successfully',
        data: sectionData
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user.id, section: request.params.section }, 'Failed to update preference section');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update preference section'
      });
    }
  });

  /**
   * Apply privacy preset
   */
  fastify.post('/preferences/privacy/preset', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Apply privacy preset',
      description: `
Apply a predefined privacy configuration preset.

**Available Presets:**

**Minimal Privacy (Public Profile):**
- Profile visible to everyone
- Email visible
- Location and activity visible
- Search engine indexing allowed
- All data collection enabled
- Third-party sharing enabled

**Balanced Privacy (Default):**
- Profile visible to friends only
- Contact info hidden
- Limited data collection
- No third-party sharing
- Search indexing disabled

**Maximum Privacy:**
- Private profile
- All information hidden
- No data collection
- No third-party sharing
- Maximum privacy protection
      `,
      tags: ['User Preferences'],
      body: {
        type: 'object',
        properties: {
          preset: {
            type: 'string',
            enum: ['minimal', 'balanced', 'maximum'],
            description: 'Privacy preset to apply'
          }
        },
        required: ['preset']
      },
      response: {
        200: {
          description: 'Privacy preset applied successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Privacy preset applied successfully' },
            data: {
              type: 'object',
              properties: {
                privacy: { $ref: '#/components/schemas/PrivacyPreferences' },
                preset: { type: 'string', example: 'balanced' }
              }
            }
          }
        },
        400: standardResponses[400],
        401: standardResponses[401],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: PrivacyPresetRequest }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { preset } = request.body;

      const privacy = await preferencesService.applyPrivacyPreset(user.id, preset);

      reply.send({
        success: true,
        message: 'Privacy preset applied successfully',
        data: {
          privacy,
          preset
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user.id, preset: request.body.preset }, 'Failed to apply privacy preset');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to apply privacy preset'
      });
    }
  });

  /**
   * Reset preferences to defaults
   */
  fastify.post('/preferences/reset', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Reset preferences to defaults',
      description: `
Reset user preferences to default values.

**Options:**
- Reset all preferences
- Reset specific sections only

**Warning:** This action cannot be undone. User must confirm the reset.
      `,
      tags: ['User Preferences'],
      body: {
        type: 'object',
        properties: {
          sections: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['notifications', 'privacy', 'accessibility', 'appearance', 'communication', 'security', 'content']
            },
            description: 'Specific sections to reset (omit to reset all)'
          },
          confirmReset: {
            type: 'boolean',
            description: 'Must be true to confirm reset'
          }
        },
        required: ['confirmReset']
      },
      response: {
        200: {
          description: 'Preferences reset successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Preferences reset to defaults' },
            data: {
              type: 'object',
              properties: {
                preferences: { $ref: '#/components/schemas/UserPreferences' },
                resetSections: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['notifications', 'privacy']
                }
              }
            }
          }
        },
        400: {
          description: 'Reset not confirmed',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Reset not confirmed' },
            message: { type: 'string', example: 'You must confirm the reset action' }
          }
        },
        401: standardResponses[401],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: ResetPreferencesRequest }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { sections, confirmReset } = request.body;

      if (!confirmReset) {
        return reply.status(400).send({
          success: false,
          error: 'Reset not confirmed',
          message: 'You must confirm the reset action'
        });
      }

      const preferences = await preferencesService.resetPreferences(user.id, sections);

      reply.send({
        success: true,
        message: 'Preferences reset to defaults',
        data: {
          preferences,
          resetSections: sections || 'all'
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user.id }, 'Failed to reset preferences');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to reset preferences'
      });
    }
  });

  /**
   * Export preferences
   */
  fastify.get('/preferences/export', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Export user preferences',
      description: `
Export all user preferences in a portable format.

**Use Cases:**
- Backup preferences
- Transfer to another account
- Archive for records

**Format:** JSON with version information for compatibility.
      `,
      tags: ['User Preferences'],
      response: {
        200: {
          description: 'Preferences exported successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  version: { type: 'string', example: '1.0' },
                  exportDate: { type: 'string', format: 'date-time' },
                  preferences: { $ref: '#/components/schemas/UserPreferences' }
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
      const exportData = await preferencesService.exportPreferences(user.id);

      reply.header('Content-Type', 'application/json');
      reply.header('Content-Disposition', `attachment; filename="preferences-${user.id}-${Date.now()}.json"`);
      reply.send(exportData);

    } catch (error) {
      logger.error({ error, userId: (request as any).user.id }, 'Failed to export preferences');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to export preferences'
      });
    }
  });

  /**
   * Import preferences
   */
  fastify.post('/preferences/import', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Import user preferences',
      description: `
Import previously exported user preferences.

**Requirements:**
- Must be valid export format
- Version compatibility is checked
- Invalid values are rejected

**Warning:** This will overwrite all current preferences.
      `,
      tags: ['User Preferences'],
      body: {
        type: 'object',
        properties: {
          version: { type: 'string' },
          exportDate: { type: 'string', format: 'date-time' },
          preferences: { $ref: '#/components/schemas/UserPreferences' }
        },
        required: ['version', 'preferences']
      },
      response: {
        200: {
          description: 'Preferences imported successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Preferences imported successfully' },
            data: {
              type: 'object',
              properties: {
                preferences: { $ref: '#/components/schemas/UserPreferences' },
                importedFrom: {
                  type: 'object',
                  properties: {
                    version: { type: 'string', example: '1.0' },
                    exportDate: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        },
        400: standardResponses[400],
        401: standardResponses[401],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const importData = request.body;

      const preferences = await preferencesService.importPreferences(user.id, importData);

      reply.send({
        success: true,
        message: 'Preferences imported successfully',
        data: {
          preferences,
          importedFrom: {
            version: importData.version,
            exportDate: importData.exportDate
          }
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user.id }, 'Failed to import preferences');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to import preferences'
      });
    }
  });
}