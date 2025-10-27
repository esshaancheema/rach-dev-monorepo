import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

const swaggerPlugin = fp(async (fastify: FastifyInstance) => {
  // Register Swagger documentation
  await fastify.register(require('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'Zoptal Project Service API',
        description: 'API documentation for the Zoptal Project Management Service',
        version: '1.0.0',
      },
      host: 'localhost:4002',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Enter your bearer token in the format: Bearer <token>',
        },
      },
      security: [{ Bearer: [] }],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Projects', description: 'Project management endpoints' },
        { name: 'Tasks', description: 'Task management endpoints' },
        { name: 'Teams', description: 'Team management endpoints' },
        { name: 'Files', description: 'File management endpoints' },
        { name: 'Integrations', description: 'External integration endpoints' },
        { name: 'Analytics', description: 'Analytics and reporting endpoints' },
      ],
    },
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // Register Swagger UI
  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });

  fastify.log.info('Swagger documentation available at /docs');
});

export default swaggerPlugin;