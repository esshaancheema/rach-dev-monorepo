import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createHealthCheckMiddleware } from '../middleware/health-check.middleware';
import { createRouteSchema, securitySchemes, standardResponses } from '../utils/swagger-schemas';
import { logger } from '../utils/logger';

/**
 * Health check routes for monitoring and diagnostics
 */
export async function healthRoutes(fastify: FastifyInstance) {
  const { basicHealthCheck, detailedHealthCheck, livenessProbe, readinessProbe } = 
    createHealthCheckMiddleware({
      prisma: fastify.prisma,
      redis: fastify.redis,
      fastify
    });

  /**
   * Basic health check endpoint
   * Returns minimal health information for load balancers
   */
  fastify.get('/health', {
    schema: createRouteSchema({
      summary: 'Basic health check',
      description: `
Check the basic health status of the authentication service.

**Purpose:**
- Load balancer health checks
- Basic service availability monitoring
- Quick status verification

**Response Codes:**
- 200: Service is healthy or degraded but functional
- 503: Service is unhealthy and should not receive traffic

**Use Cases:**
- Load balancer health checks
- Container orchestration (Docker Compose, Kubernetes)
- Basic monitoring systems
- CI/CD pipeline health verification
      `,
      tags: ['Health'],
      response: {
        200: {
          description: 'Service is healthy or degraded',
          type: 'object',
          properties: {
            status: { 
              type: 'string', 
              enum: ['healthy', 'degraded', 'unhealthy'],
              example: 'healthy',
              description: 'Overall service health status'
            },
            timestamp: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
              description: 'When the health check was performed'
            },
            uptime: { 
              type: 'number',
              example: 86400000,
              description: 'Service uptime in milliseconds'
            },
            version: { 
              type: 'string',
              example: '1.0.0',
              description: 'Service version'
            }
          }
        },
        503: {
          description: 'Service is unhealthy',
          type: 'object',
          properties: {
            status: { 
              type: 'string', 
              enum: ['unhealthy'],
              example: 'unhealthy'
            },
            timestamp: { 
              type: 'string', 
              format: 'date-time'
            },
            error: { 
              type: 'string',
              example: 'Health check failed'
            }
          }
        }
      },
      security: securitySchemes.none
    })
  }, basicHealthCheck);

  /**
   * Detailed health check endpoint
   * Returns comprehensive health information for monitoring systems
   */
  fastify.get('/health/detailed', {
    schema: createRouteSchema({
      summary: 'Detailed health check with diagnostics',
      description: `
Get comprehensive health status including system metrics, dependency status, and performance data.

**Includes:**
- Service health status
- Database connectivity and performance
- Redis connectivity and performance  
- External service dependencies (SendGrid, Twilio)
- System resource usage (memory, CPU)
- Application metrics (requests, errors, authentication stats)
- Uptime and version information

**Security:**
- This endpoint provides detailed internal information
- Should be protected in production environments
- Intended for monitoring systems and operations teams

**Performance:**
- May take longer than basic health check
- Performs actual connectivity tests to all dependencies
- Results are not cached to ensure real-time status
      `,
      tags: ['Health'],
      response: {
        200: {
          description: 'Detailed health information',
          type: 'object',
          properties: {
            status: { 
              type: 'string', 
              enum: ['healthy', 'degraded', 'unhealthy'],
              example: 'healthy'
            },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number', example: 86400000 },
            version: { type: 'string', example: '1.0.0' },
            environment: { type: 'string', example: 'production' },
            services: {
              type: 'object',
              properties: {
                database: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                    responseTime: { type: 'number', example: 15 },
                    lastCheck: { type: 'string', format: 'date-time' },
                    details: {
                      type: 'object',
                      properties: {
                        userCount: { type: 'number', example: 1250 },
                        version: { type: 'string', example: 'PostgreSQL 15+' },
                        connectionString: { type: 'string', example: 'localhost:5432/zoptal_auth' }
                      }
                    }
                  }
                },
                redis: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                    responseTime: { type: 'number', example: 8 },
                    lastCheck: { type: 'string', format: 'date-time' },
                    details: {
                      type: 'object',
                      properties: {
                        version: { type: 'string', example: '7.0.0' },
                        memoryUsed: { type: 'string', example: '2.5M' },
                        connectedClients: { type: 'string', example: '5' }
                      }
                    }
                  }
                }
              }
            },
            system: {
              type: 'object',
              properties: {
                memory: {
                  type: 'object',
                  properties: {
                    used: { type: 'number', example: 134217728 },
                    free: { type: 'number', example: 402653184 },
                    total: { type: 'number', example: 536870912 },
                    usage: { type: 'number', example: 25.0 }
                  }
                },
                uptime: { type: 'number', example: 86400 },
                nodeVersion: { type: 'string', example: 'v18.17.0' },
                pid: { type: 'number', example: 1234 }
              }
            },
            dependencies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'SendGrid' },
                  status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                  responseTime: { type: 'number', example: 245 },
                  details: { type: 'object' }
                }
              }
            },
            metrics: {
              type: 'object',
              properties: {
                requests: {
                  type: 'object',
                  properties: {
                    total: { type: 'number', example: 15420 },
                    perSecond: { type: 'number', example: 12.5 },
                    errors: { type: 'number', example: 23 },
                    errorRate: { type: 'number', example: 0.15 }
                  }
                },
                authentication: {
                  type: 'object',
                  properties: {
                    activeUsers: { type: 'number', example: 156 },
                    activeSessions: { type: 'number', example: 89 },
                    loginAttempts: {
                      type: 'object',
                      properties: {
                        total: { type: 'number', example: 1250 },
                        successful: { type: 'number', example: 1200 },
                        failed: { type: 'number', example: 45 },
                        blocked: { type: 'number', example: 5 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        503: standardResponses[503]
      },
      security: securitySchemes.none
    })
  }, detailedHealthCheck);

  /**
   * Kubernetes liveness probe
   * Simple endpoint to verify the application is running
   */
  fastify.get('/health/live', {
    schema: createRouteSchema({
      summary: 'Liveness probe for Kubernetes',
      description: `
Kubernetes liveness probe endpoint to determine if the application should be restarted.

**Purpose:**
- Kubernetes liveness probe
- Container orchestration health checks
- Process monitoring

**Behavior:**
- Always returns 200 if the application is running
- Does not check dependencies
- Minimal overhead for frequent polling

**Kubernetes Configuration:**
\`\`\`yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
\`\`\`
      `,
      tags: ['Health'],
      response: {
        200: {
          description: 'Application is alive',
          type: 'object',
          properties: {
            status: { 
              type: 'string',
              example: 'alive',
              description: 'Application liveness status'
            }
          }
        }
      },
      security: securitySchemes.none
    })
  }, livenessProbe);

  /**
   * Kubernetes readiness probe
   * Endpoint to verify the application is ready to serve traffic
   */
  fastify.get('/health/ready', {
    schema: createRouteSchema({
      summary: 'Readiness probe for Kubernetes',
      description: `
Kubernetes readiness probe endpoint to determine if the application is ready to receive traffic.

**Purpose:**
- Kubernetes readiness probe
- Load balancer routing decisions
- Service mesh traffic management

**Checks:**
- Database connectivity
- Redis connectivity
- Critical service dependencies

**Behavior:**
- Returns 200 if ready to serve traffic
- Returns 503 if not ready (dependencies unavailable)
- Removes pod from service endpoints when not ready

**Kubernetes Configuration:**
\`\`\`yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
\`\`\`
      `,
      tags: ['Health'],
      response: {
        200: {
          description: 'Application is ready to serve traffic',
          type: 'object',
          properties: {
            status: { 
              type: 'string',
              example: 'ready',
              description: 'Application readiness status'
            }
          }
        },
        503: {
          description: 'Application is not ready to serve traffic',
          type: 'object',
          properties: {
            status: { 
              type: 'string',
              example: 'not ready',
              description: 'Application readiness status'
            }
          }
        }
      },
      security: securitySchemes.none
    })
  }, readinessProbe);

  /**
   * Health metrics endpoint
   * Returns metrics in Prometheus format for scraping
   */
  fastify.get('/health/metrics', {
    schema: createRouteSchema({
      summary: 'Health metrics in Prometheus format',
      description: `
Export health and performance metrics in Prometheus format for monitoring systems.

**Metrics Included:**
- HTTP request metrics (total, rate, errors)
- Authentication metrics (users, sessions, login attempts)
- System metrics (memory, CPU usage)
- Database metrics (connection pool, query performance)
- Redis metrics (memory usage, connection count)

**Integration:**
Configure Prometheus to scrape this endpoint:
\`\`\`yaml
scrape_configs:
  - job_name: 'auth-service'
    static_configs:
      - targets: ['auth-service:3000']
    metrics_path: '/health/metrics'
    scrape_interval: 15s
\`\`\`

**Format:**
Returns metrics in Prometheus exposition format with help text and type information.
      `,
      tags: ['Health'],
      response: {
        200: {
          description: 'Metrics in Prometheus format',
          type: 'string',
          example: `# HELP auth_requests_total Total number of HTTP requests
# TYPE auth_requests_total counter
auth_requests_total 15420

# HELP auth_request_duration_seconds Request duration in seconds
# TYPE auth_request_duration_seconds histogram
auth_request_duration_seconds_bucket{le="0.1"} 12450
auth_request_duration_seconds_bucket{le="0.5"} 15200
auth_request_duration_seconds_bucket{le="1.0"} 15400
auth_request_duration_seconds_bucket{le="+Inf"} 15420`
        }
      },
      security: securitySchemes.none
    })
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { healthCheckService } = createHealthCheckMiddleware({
        prisma: fastify.prisma,
        redis: fastify.redis,
        fastify
      });
      
      const healthData = await healthCheckService.performHealthCheck(true);
      
      // Convert health data to Prometheus format
      let metrics = '';
      
      // Request metrics
      metrics += '# HELP auth_requests_total Total number of HTTP requests\n';
      metrics += '# TYPE auth_requests_total counter\n';
      metrics += `auth_requests_total ${healthData.metrics.requests.total}\n\n`;
      
      metrics += '# HELP auth_request_errors_total Total number of HTTP request errors\n';
      metrics += '# TYPE auth_request_errors_total counter\n';
      metrics += `auth_request_errors_total ${healthData.metrics.requests.errors}\n\n`;
      
      metrics += '# HELP auth_requests_per_second Current requests per second\n';
      metrics += '# TYPE auth_requests_per_second gauge\n';
      metrics += `auth_requests_per_second ${healthData.metrics.requests.perSecond}\n\n`;
      
      // Authentication metrics
      metrics += '# HELP auth_active_users Number of active users (last 24h)\n';
      metrics += '# TYPE auth_active_users gauge\n';
      metrics += `auth_active_users ${healthData.metrics.authentication.activeUsers}\n\n`;
      
      metrics += '# HELP auth_active_sessions Number of active sessions\n';
      metrics += '# TYPE auth_active_sessions gauge\n';
      metrics += `auth_active_sessions ${healthData.metrics.authentication.activeSessions}\n\n`;
      
      metrics += '# HELP auth_login_attempts_total Total login attempts by result\n';
      metrics += '# TYPE auth_login_attempts_total counter\n';
      metrics += `auth_login_attempts_total{result="successful"} ${healthData.metrics.authentication.loginAttempts.successful}\n`;
      metrics += `auth_login_attempts_total{result="failed"} ${healthData.metrics.authentication.loginAttempts.failed}\n`;
      metrics += `auth_login_attempts_total{result="blocked"} ${healthData.metrics.authentication.loginAttempts.blocked}\n\n`;
      
      // System metrics
      metrics += '# HELP auth_memory_usage_bytes Memory usage in bytes\n';
      metrics += '# TYPE auth_memory_usage_bytes gauge\n';
      metrics += `auth_memory_usage_bytes ${healthData.system.memory.used}\n\n`;
      
      metrics += '# HELP auth_uptime_seconds Service uptime in seconds\n';
      metrics += '# TYPE auth_uptime_seconds gauge\n';
      metrics += `auth_uptime_seconds ${Math.floor(healthData.uptime / 1000)}\n\n`;
      
      // Service health status
      Object.entries(healthData.services).forEach(([service, health]) => {
        const statusValue = health.status === 'healthy' ? 1 : health.status === 'degraded' ? 0.5 : 0;
        metrics += `# HELP auth_service_health Service health status (1=healthy, 0.5=degraded, 0=unhealthy)\n`;
        metrics += `# TYPE auth_service_health gauge\n`;
        metrics += `auth_service_health{service="${service}"} ${statusValue}\n\n`;
        
        metrics += `# HELP auth_service_response_time_ms Service response time in milliseconds\n`;
        metrics += `# TYPE auth_service_response_time_ms gauge\n`;
        metrics += `auth_service_response_time_ms{service="${service}"} ${health.responseTime}\n\n`;
      });
      
      reply.type('text/plain').send(metrics);
    } catch (error) {
      logger.error({ error }, 'Failed to generate metrics');
      reply.status(500).send('# Error generating metrics\n');
    }
  });

  /**
   * Service info endpoint
   * Returns service information and capabilities
   */
  fastify.get('/health/info', {
    schema: createRouteSchema({
      summary: 'Service information and capabilities',
      description: `
Get detailed information about the authentication service including version, configuration, and capabilities.

**Information Included:**
- Service version and build information
- Environment configuration
- Feature flags and capabilities
- API version compatibility
- Deployment information

**Use Cases:**
- Service discovery
- Configuration verification
- Debugging and troubleshooting
- Documentation and API exploration
      `,
      tags: ['Health'],
      response: {
        200: {
          description: 'Service information',
          type: 'object',
          properties: {
            service: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'zoptal-auth-service' },
                version: { type: 'string', example: '1.0.0' },
                description: { type: 'string', example: 'Zoptal Authentication Service' },
                environment: { type: 'string', example: 'production' },
                nodeVersion: { type: 'string', example: 'v18.17.0' }
              }
            },
            api: {
              type: 'object',
              properties: {
                version: { type: 'string', example: 'v1' },
                documentation: { type: 'string', example: '/documentation' },
                openapi: { type: 'string', example: '/documentation/json' }
              }
            },
            features: {
              type: 'object',
              properties: {
                twoFactorAuth: { type: 'boolean', example: true },
                oauth: { type: 'boolean', example: true },
                passwordHistory: { type: 'boolean', example: true },
                deviceFingerprinting: { type: 'boolean', example: true },
                i18n: { type: 'boolean', example: true }
              }
            },
            configuration: {
              type: 'object',
              properties: {
                sessionTimeout: { type: 'number', example: 3600000 },
                refreshTokenExpiry: { type: 'number', example: 604800000 },
                rateLimiting: { type: 'boolean', example: true },
                corsEnabled: { type: 'boolean', example: true }
              }
            }
          }
        }
      },
      security: securitySchemes.none
    })
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const info = {
      service: {
        name: 'zoptal-auth-service',
        version: process.env.npm_package_version || '1.0.0',
        description: 'Zoptal Authentication Service - Secure authentication and authorization',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        buildDate: process.env.BUILD_DATE || 'unknown',
        gitCommit: process.env.GIT_COMMIT || 'unknown'
      },
      api: {
        version: 'v1',
        documentation: '/documentation',
        openapi: '/documentation/json',
        baseUrl: process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`
      },
      features: {
        authentication: true,
        twoFactorAuth: true,
        oauth: true,
        passwordHistory: true,
        deviceFingerprinting: true,
        sessionManagement: true,
        i18n: true,
        rateLimiting: true,
        auditLogging: true,
        healthChecks: true,
        metrics: true
      },
      configuration: {
        sessionTimeout: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '60') * 60 * 1000,
        refreshTokenExpiry: parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || '7') * 24 * 60 * 60 * 1000,
        rateLimiting: process.env.RATE_LIMIT_ENABLED !== 'false',
        corsEnabled: true,
        swaggerEnabled: process.env.NODE_ENV !== 'production',
        logLevel: process.env.LOG_LEVEL || 'info'
      },
      dependencies: {
        database: 'PostgreSQL 15+',
        cache: 'Redis 7+',
        email: process.env.SENDGRID_API_KEY ? 'SendGrid' : 'disabled',
        sms: process.env.TWILIO_ACCOUNT_SID ? 'Twilio' : 'disabled'
      }
    };
    
    reply.send(info);
  });
}