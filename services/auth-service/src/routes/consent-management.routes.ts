import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createRouteSchema, securitySchemes, standardResponses } from '../utils/swagger-schemas';
import { logger } from '../utils/logger';
import { createConsentManagementService } from '../services/consent-management.service';
import { createEmailService } from '../services/email.service';
import { z } from 'zod';

// Request schemas
const recordConsentSchema = z.object({
  consentType: z.enum([
    'cookies_essential',
    'cookies_analytics',
    'cookies_marketing',
    'cookies_personalization',
    'email_marketing',
    'sms_marketing',
    'push_notifications',
    'data_processing',
    'third_party_sharing',
    'profiling',
    'location_tracking',
    'biometric_data',
    'sensitive_data'
  ]),
  purpose: z.string().min(1).max(200),
  granted: z.boolean(),
  legalBasis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interest']),
  source: z.enum(['banner', 'preferences_center', 'registration', 'profile_update', 'checkout', 'import', 'admin', 'api']),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional()
});

const updatePreferencesSchema = z.object({
  preferences: z.record(z.boolean()),
  source: z.enum(['banner', 'preferences_center', 'registration', 'profile_update', 'checkout', 'import', 'admin', 'api']),
  metadata: z.record(z.any()).optional()
});

const withdrawConsentSchema = z.object({
  consentType: z.enum([
    'cookies_essential',
    'cookies_analytics',
    'cookies_marketing',
    'cookies_personalization',
    'email_marketing',
    'sms_marketing',
    'push_notifications',
    'data_processing',
    'third_party_sharing',
    'profiling',
    'location_tracking',
    'biometric_data',
    'sensitive_data'
  ]),
  reason: z.string().max(500).optional(),
  metadata: z.record(z.any()).optional()
});

const complianceReportSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  includeDetails: z.boolean().default(false)
});

type RecordConsentRequest = z.infer<typeof recordConsentSchema>;
type UpdatePreferencesRequest = z.infer<typeof updatePreferencesSchema>;
type WithdrawConsentRequest = z.infer<typeof withdrawConsentSchema>;
type ComplianceReportRequest = z.infer<typeof complianceReportSchema>;

/**
 * Consent management routes for privacy compliance
 */
export async function consentManagementRoutes(fastify: FastifyInstance) {
  const emailService = createEmailService();
  const consentService = createConsentManagementService({
    prisma: fastify.prisma,
    emailService
  });

  /**
   * Record user consent
   */
  fastify.post('/consent/record', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Record user consent',
      description: `
Record a user's consent for specific data processing purposes.

**Features:**
- GDPR/CCPA compliant consent recording
- Legal basis tracking and audit trail
- Expiration date support for time-limited consent
- Source tracking for consent origin
- Metadata support for additional context

**Legal Bases:**
- **Consent**: User explicitly agrees to processing
- **Contract**: Processing necessary for contract performance
- **Legal Obligation**: Required by law
- **Vital Interests**: Necessary to protect life
- **Public Task**: Performed in public interest
- **Legitimate Interest**: Necessary for legitimate business purposes

**Consent Types:**
- Cookie categories (essential, analytics, marketing, personalization)
- Communication preferences (email, SMS, push notifications)
- Data processing types (profiling, third-party sharing, location tracking)
- Sensitive data processing (biometric, health data)
      `,
      tags: ['Consent Management'],
      body: {
        type: 'object',
        properties: {
          consentType: {
            type: 'string',
            enum: [
              'cookies_essential',
              'cookies_analytics', 
              'cookies_marketing',
              'cookies_personalization',
              'email_marketing',
              'sms_marketing',
              'push_notifications',
              'data_processing',
              'third_party_sharing',
              'profiling',
              'location_tracking',
              'biometric_data',
              'sensitive_data'
            ],
            description: 'Type of consent being recorded'
          },
          purpose: {
            type: 'string',
            minLength: 1,
            maxLength: 200,
            description: 'Specific purpose for data processing',
            example: 'Website analytics and performance optimization'
          },
          granted: {
            type: 'boolean',
            description: 'Whether consent is granted or denied'
          },
          legalBasis: {
            type: 'string',
            enum: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interest'],
            description: 'Legal basis for processing under GDPR'
          },
          source: {
            type: 'string',
            enum: ['banner', 'preferences_center', 'registration', 'profile_update', 'checkout', 'import', 'admin', 'api'],
            description: 'Source where consent was collected'
          },
          expiresAt: {
            type: 'string',
            format: 'date-time',
            description: 'Optional expiration date for consent'
          },
          metadata: {
            type: 'object',
            description: 'Additional metadata about the consent'
          }
        },
        required: ['consentType', 'purpose', 'granted', 'legalBasis', 'source']
      },
      response: {
        201: {
          description: 'Consent recorded successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Consent recorded successfully' },
            data: {
              type: 'object',
              properties: {
                consentId: { type: 'string', example: 'consent_1642345678901_a1b2c3d4' },
                userId: { type: 'string', example: 'user_123' },
                consentType: { type: 'string', example: 'cookies_analytics' },
                granted: { type: 'boolean', example: true },
                timestamp: { type: 'string', format: 'date-time' },
                legalBasis: { type: 'string', example: 'consent' },
                version: { type: 'string', example: '1.0.0' },
                source: { type: 'string', example: 'banner' }
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
  }, async (request: FastifyRequest<{ Body: RecordConsentRequest }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { consentType, purpose, granted, legalBasis, source, expiresAt, metadata } = request.body;

      const consentRecord = await consentService.recordConsent({
        userId: user.id,
        consentType,
        purpose,
        granted,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || 'Unknown',
        legalBasis,
        source,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        metadata
      });

      reply.status(201).send({
        success: true,
        message: 'Consent recorded successfully',
        data: {
          consentId: consentRecord.id,
          userId: consentRecord.userId,
          consentType: consentRecord.consentType,
          granted: consentRecord.granted,
          timestamp: consentRecord.timestamp.toISOString(),
          legalBasis: consentRecord.legalBasis,
          version: consentRecord.version,
          source: consentRecord.source
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to record consent');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to record consent'
      });
    }
  });

  /**
   * Update user consent preferences
   */
  fastify.put('/consent/preferences', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Update consent preferences',
      description: `
Update user's consent preferences for multiple categories at once.

**Use Cases:**
- Privacy preference center updates
- Consent banner "Accept All" or "Reject All" actions
- Bulk preference updates during registration
- Admin-initiated preference changes

**Features:**
- Batch update multiple consent categories
- Automatic consent history tracking
- Source attribution for audit compliance
- Real-time preference validation
      `,
      tags: ['Consent Management'],
      body: {
        type: 'object',
        properties: {
          preferences: {
            type: 'object',
            additionalProperties: { type: 'boolean' },
            description: 'Map of consent category IDs to boolean values',
            example: {
              'cookies_analytics': true,
              'cookies_marketing': false,
              'email_marketing': true,
              'sms_marketing': false
            }
          },
          source: {
            type: 'string',
            enum: ['banner', 'preferences_center', 'registration', 'profile_update', 'checkout', 'import', 'admin', 'api'],
            description: 'Source of the preference update'
          },
          metadata: {
            type: 'object',
            description: 'Additional metadata about the update'
          }
        },
        required: ['preferences', 'source']
      },
      response: {
        200: {
          description: 'Preferences updated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Consent preferences updated successfully' },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', example: 'user_123' },
                updatedCategories: { type: 'number', example: 4 },
                lastUpdated: { type: 'string', format: 'date-time' },
                privacyPolicyVersion: { type: 'string', example: '1.0.0' },
                preferences: {
                  type: 'object',
                  additionalProperties: {
                    type: 'object',
                    properties: {
                      granted: { type: 'boolean' },
                      lastUpdated: { type: 'string', format: 'date-time' },
                      source: { type: 'string' }
                    }
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
  }, async (request: FastifyRequest<{ Body: UpdatePreferencesRequest }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { preferences, source, metadata } = request.body;

      const consentPreferences = await consentService.updateConsentPreferences({
        userId: user.id,
        preferences,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || 'Unknown',
        source,
        metadata
      });

      reply.send({
        success: true,
        message: 'Consent preferences updated successfully',
        data: {
          userId: consentPreferences.userId,
          updatedCategories: Object.keys(preferences).length,
          lastUpdated: consentPreferences.lastUpdated.toISOString(),
          privacyPolicyVersion: consentPreferences.privacyPolicyVersion,
          preferences: consentPreferences.categories
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to update consent preferences');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update consent preferences'
      });
    }
  });

  /**
   * Get user consent preferences
   */
  fastify.get('/consent/preferences', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get user consent preferences',
      description: `
Retrieve the current consent preferences for the authenticated user.

**Response includes:**
- Current consent status for all categories
- Last update timestamps and sources
- Privacy policy version compliance
- Available consent categories and their descriptions
      `,
      tags: ['Consent Management'],
      response: {
        200: {
          description: 'Consent preferences retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', example: 'user_123' },
                preferences: {
                  type: 'object',
                  additionalProperties: {
                    type: 'object',
                    properties: {
                      granted: { type: 'boolean' },
                      lastUpdated: { type: 'string', format: 'date-time' },
                      source: { type: 'string' }
                    }
                  }
                },
                privacyPolicyVersion: { type: 'string', example: '1.0.0' },
                lastUpdated: { type: 'string', format: 'date-time' },
                availableCategories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'cookies_analytics' },
                      name: { type: 'string', example: 'Analytics Cookies' },
                      description: { type: 'string', example: 'These cookies help us understand how visitors interact with our website.' },
                      required: { type: 'boolean', example: false },
                      purposes: { type: 'array', items: { type: 'string' } },
                      legalBasis: { type: 'string', example: 'consent' },
                      userControlled: { type: 'boolean', example: true }
                    }
                  }
                },
                requiresUpdate: {
                  type: 'object',
                  properties: {
                    required: { type: 'boolean', example: false },
                    reason: { type: 'string', example: 'Privacy policy updated' },
                    newVersion: { type: 'string', example: '1.1.0' }
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
      
      const preferences = await consentService.getUserConsentPreferences(user.id);
      const categories = consentService.getConsentCategories();
      const updateRequired = await consentService.requiresConsentUpdate(user.id);

      reply.send({
        success: true,
        data: {
          userId: user.id,
          preferences: preferences?.categories || {},
          privacyPolicyVersion: preferences?.privacyPolicyVersion || await consentService.getCurrentPrivacyPolicyVersion(),
          lastUpdated: preferences?.lastUpdated?.toISOString(),
          availableCategories: categories,
          requiresUpdate: updateRequired
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to get consent preferences');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve consent preferences'
      });
    }
  });

  /**
   * Withdraw consent
   */
  fastify.post('/consent/withdraw', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Withdraw user consent',
      description: `
Withdraw user consent for a specific data processing purpose.

**GDPR Compliance:**
- Users have the right to withdraw consent at any time
- Withdrawal must be as easy as giving consent
- Previous processing based on consent remains lawful
- System must stop processing data for the withdrawn purpose

**Process:**
1. Records the consent withdrawal with timestamp
2. Stops relevant data processing activities
3. Updates user preferences automatically
4. Sends confirmation to user (optional)
      `,
      tags: ['Consent Management'],
      body: {
        type: 'object',
        properties: {
          consentType: {
            type: 'string',
            enum: [
              'cookies_essential',
              'cookies_analytics',
              'cookies_marketing', 
              'cookies_personalization',
              'email_marketing',
              'sms_marketing',
              'push_notifications',
              'data_processing',
              'third_party_sharing',
              'profiling',
              'location_tracking',
              'biometric_data',
              'sensitive_data'
            ],
            description: 'Type of consent to withdraw'
          },
          reason: {
            type: 'string',
            maxLength: 500,
            description: 'Optional reason for withdrawal'
          },
          metadata: {
            type: 'object',
            description: 'Additional metadata about the withdrawal'
          }
        },
        required: ['consentType']
      },
      response: {
        200: {
          description: 'Consent withdrawn successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Consent withdrawn successfully' },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', example: 'user_123' },
                consentType: { type: 'string', example: 'email_marketing' },
                withdrawnAt: { type: 'string', format: 'date-time' },
                withdrawnBy: { type: 'string', example: 'user' },
                actionsPerformed: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['Unsubscribed from email marketing', 'Removed from marketing segments']
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
  }, async (request: FastifyRequest<{ Body: WithdrawConsentRequest }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { consentType, reason, metadata } = request.body;

      await consentService.withdrawConsent({
        userId: user.id,
        consentType,
        withdrawnBy: 'user',
        reason,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || 'Unknown',
        metadata
      });

      // Define actions performed based on consent type
      const actionsPerformed = [];
      switch (consentType) {
        case 'email_marketing':
          actionsPerformed.push('Unsubscribed from email marketing', 'Removed from marketing segments');
          break;
        case 'sms_marketing':
          actionsPerformed.push('Unsubscribed from SMS marketing');
          break;
        case 'cookies_analytics':
          actionsPerformed.push('Disabled analytics tracking', 'Removed analytics cookies');
          break;
        case 'cookies_marketing':
          actionsPerformed.push('Disabled marketing cookies', 'Removed advertising profiles');
          break;
        default:
          actionsPerformed.push(`Stopped ${consentType} processing`);
      }

      reply.send({
        success: true,
        message: 'Consent withdrawn successfully',
        data: {
          userId: user.id,
          consentType,
          withdrawnAt: new Date().toISOString(),
          withdrawnBy: 'user',
          actionsPerformed
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to withdraw consent');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to withdraw consent'
      });
    }
  });

  /**
   * Get consent history
   */
  fastify.get('/consent/history', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get user consent history',
      description: `
Retrieve the complete consent history for the authenticated user.

**Features:**
- Chronological consent record history
- Consent grants, updates, and withdrawals
- Source attribution and legal basis tracking
- Privacy policy version compliance
- Audit trail for compliance reporting
      `,
      tags: ['Consent Management'],
      querystring: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            default: 20,
            description: 'Maximum number of history records to return'
          },
          consentType: {
            type: 'string',
            enum: [
              'cookies_essential',
              'cookies_analytics',
              'cookies_marketing',
              'cookies_personalization', 
              'email_marketing',
              'sms_marketing',
              'push_notifications',
              'data_processing',
              'third_party_sharing',
              'profiling',
              'location_tracking',
              'biometric_data',
              'sensitive_data'
            ],
            description: 'Filter by specific consent type'
          }
        }
      },
      response: {
        200: {
          description: 'Consent history retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', example: 'user_123' },
                history: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'consent_1642345678901_a1b2c3d4' },
                      consentType: { type: 'string', example: 'email_marketing' },
                      purpose: { type: 'string', example: 'Marketing email communications' },
                      granted: { type: 'boolean', example: true },
                      timestamp: { type: 'string', format: 'date-time' },
                      legalBasis: { type: 'string', example: 'consent' },
                      source: { type: 'string', example: 'preferences_center' },
                      version: { type: 'string', example: '1.0.0' },
                      withdrawnAt: { type: 'string', format: 'date-time', nullable: true },
                      withdrawnBy: { type: 'string', nullable: true }
                    }
                  }
                },
                summary: {
                  type: 'object',
                  properties: {
                    totalRecords: { type: 'number', example: 15 },
                    consentGrants: { type: 'number', example: 8 },
                    consentWithdrawals: { type: 'number', example: 2 },
                    lastActivity: { type: 'string', format: 'date-time' }
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
  }, async (request: FastifyRequest<{ 
    Querystring: { limit?: number; consentType?: string } 
  }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { limit = 20, consentType } = request.query;
      
      let history = await consentService.getConsentHistory(user.id, limit);
      
      // Filter by consent type if specified
      if (consentType) {
        history = history.filter(record => record.consentType === consentType);
      }

      // Calculate summary statistics
      const consentGrants = history.filter(record => record.granted).length;
      const consentWithdrawals = history.filter(record => !record.granted).length;
      const lastActivity = history.length > 0 ? history[0].timestamp : null;

      reply.send({
        success: true,
        data: {
          userId: user.id,
          history,
          summary: {
            totalRecords: history.length,
            consentGrants,
            consentWithdrawals,
            lastActivity: lastActivity?.toISOString()
          }
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to get consent history');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve consent history'
      });
    }
  });

  /**
   * Get consent banner configuration
   */
  fastify.get('/consent/banner', {
    schema: createRouteSchema({
      summary: 'Get consent banner configuration',
      description: `
Get the consent banner configuration based on user region and type.

**Features:**
- Region-specific banner content (GDPR vs non-GDPR)
- User type customization (anonymous vs registered)
- Customizable styling and positioning
- Multi-language support ready
- A/B testing support via targeting rules

**No authentication required** - Public endpoint for banner display.
      `,
      tags: ['Consent Management'],
      querystring: {
        type: 'object',
        properties: {
          region: {
            type: 'string',
            pattern: '^[A-Z]{2}$',
            description: 'ISO 3166-1 alpha-2 country code',
            example: 'US'
          },
          userType: {
            type: 'string',
            enum: ['anonymous', 'registered'],
            description: 'Type of user viewing the banner'
          },
          language: {
            type: 'string',
            pattern: '^[a-z]{2}$',
            description: 'ISO 639-1 language code',
            example: 'en'
          }
        }
      },
      response: {
        200: {
          description: 'Banner configuration retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                bannerId: { type: 'string', example: 'default_banner' },
                content: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', example: 'We value your privacy' },
                    description: { type: 'string', example: 'We use cookies and similar technologies...' },
                    acceptAllText: { type: 'string', example: 'Accept All' },
                    rejectAllText: { type: 'string', example: 'Reject All' },
                    manageText: { type: 'string', example: 'Manage Preferences' },
                    privacyPolicyLink: { type: 'string', example: '/privacy-policy' },
                    cookiePolicyLink: { type: 'string', example: '/cookie-policy' }
                  }
                },
                styling: {
                  type: 'object',
                  properties: {
                    position: { type: 'string', enum: ['top', 'bottom', 'modal'], example: 'bottom' },
                    theme: { type: 'string', enum: ['light', 'dark', 'custom'], example: 'light' },
                    colors: {
                      type: 'object',
                      properties: {
                        background: { type: 'string', example: '#ffffff' },
                        text: { type: 'string', example: '#333333' },
                        buttonPrimary: { type: 'string', example: '#007bff' },
                        buttonSecondary: { type: 'string', example: '#6c757d' }
                      }
                    }
                  }
                },
                categories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'cookies_analytics' },
                      name: { type: 'string', example: 'Analytics Cookies' },
                      description: { type: 'string', example: 'Help us understand usage patterns' },
                      required: { type: 'boolean', example: false },
                      defaultValue: { type: 'boolean', example: false },
                      userControlled: { type: 'boolean', example: true }
                    }
                  }
                },
                isGDPRRegion: { type: 'boolean', example: false },
                version: { type: 'string', example: '1.0.0' }
              }
            }
          }
        },
        500: standardResponses[500]
      }
    })
  }, async (request: FastifyRequest<{ 
    Querystring: { region?: string; userType?: string; language?: string } 
  }>, reply: FastifyReply) => {
    try {
      const { region, userType = 'anonymous', language = 'en' } = request.query;
      
      const bannerConfig = consentService.getConsentBannerConfig(region, userType);
      const categories = consentService.getConsentCategories();
      const isGDPRRegion = region ? consentService.isGDPRRegion(region) : false;

      reply.send({
        success: true,
        data: {
          bannerId: bannerConfig.id,
          content: bannerConfig.content,
          styling: bannerConfig.styling,
          categories: categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            required: cat.required,
            defaultValue: cat.defaultValue,
            userControlled: cat.userControlled
          })),
          isGDPRRegion,
          version: bannerConfig.version
        }
      });

    } catch (error) {
      logger.error({ error }, 'Failed to get consent banner configuration');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve banner configuration'
      });
    }
  });

  /**
   * Generate compliance report (Admin only)
   */
  fastify.post('/consent/compliance-report', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Generate compliance report',
      description: `
Generate a comprehensive consent compliance report for the specified date range.

**Admin Permission Required**

**Report includes:**
- Consent metrics and statistics
- Regional compliance breakdown
- Category-wise consent rates
- Withdrawal patterns and trends
- GDPR/CCPA compliance assessment
- Recommendations for improvement

**Use Cases:**
- Regular compliance audits
- Regulatory reporting requirements
- Privacy impact assessments
- Management dashboards
      `,
      tags: ['Consent Management'],
      body: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            format: 'date-time',
            description: 'Start date for the report period'
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            description: 'End date for the report period'
          },
          includeDetails: {
            type: 'boolean',
            default: false,
            description: 'Include detailed consent records in the report'
          }
        },
        required: ['startDate', 'endDate']
      },
      response: {
        200: {
          description: 'Compliance report generated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                generatedAt: { type: 'string', format: 'date-time' },
                period: {
                  type: 'object',
                  properties: {
                    start: { type: 'string', format: 'date-time' },
                    end: { type: 'string', format: 'date-time' }
                  }
                },
                metrics: {
                  type: 'object',
                  properties: {
                    totalUsers: { type: 'number', example: 10000 },
                    consentedUsers: { type: 'number', example: 8500 },
                    consentRate: { type: 'number', example: 85.0 },
                    withdrawalRate: { type: 'number', example: 2.3 },
                    categoryBreakdown: {
                      type: 'object',
                      additionalProperties: {
                        type: 'object',
                        properties: {
                          consented: { type: 'number' },
                          total: { type: 'number' },
                          rate: { type: 'number' }
                        }
                      }
                    },
                    regionalBreakdown: {
                      type: 'object',
                      additionalProperties: {
                        type: 'object',
                        properties: {
                          consented: { type: 'number' },
                          total: { type: 'number' },
                          rate: { type: 'number' }
                        }
                      }
                    }
                  }
                },
                compliance: {
                  type: 'object',
                  properties: {
                    gdprCompliant: { type: 'boolean', example: true },
                    ccpaCompliant: { type: 'boolean', example: true },
                    issues: {
                      type: 'array',
                      items: { type: 'string' },
                      example: []
                    },
                    recommendations: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['Consider A/B testing consent banner design']
                    }
                  }
                }
              }
            }
          }
        },
        400: standardResponses[400],
        401: standardResponses[401],
        403: standardResponses[403],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: ComplianceReportRequest }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for compliance reports'
        });
      }

      const { startDate, endDate, includeDetails } = request.body;

      const report = await consentService.generateComplianceReport(
        new Date(startDate),
        new Date(endDate)
      );

      // Log report generation
      await fastify.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'COMPLIANCE_REPORT_GENERATED',
          category: 'ADMIN',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            reportPeriod: { startDate, endDate },
            includeDetails,
            metrics: report.metrics
          }
        }
      });

      reply.send({
        success: true,
        data: report
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to generate compliance report');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to generate compliance report'
      });
    }
  });
}