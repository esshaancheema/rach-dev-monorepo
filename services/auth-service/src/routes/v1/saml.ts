import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { createSAMLProvider } from '../../services/saml.service';
import { samlConfigService } from '../../services/saml-config.service';
import { logger } from '../../utils/logger';
import { prisma } from '@zoptal/database';

const SAMLLoginRequestSchema = z.object({
  SAMLRequest: z.string(),
  RelayState: z.string().optional(),
  SigAlg: z.string().optional(),
  Signature: z.string().optional(),
});

const SAMLLoginCallbackSchema = z.object({
  userId: z.string(),
  requestId: z.string(),
  attributes: z.array(z.object({
    name: z.string(),
    friendlyName: z.string().optional(),
    nameFormat: z.string().optional(),
    values: z.array(z.string()),
  })).optional(),
});

const SAMLLogoutRequestSchema = z.object({
  SAMLRequest: z.string(),
  RelayState: z.string().optional(),
  SigAlg: z.string().optional(),
  Signature: z.string().optional(),
});

export async function samlRoutes(fastify: FastifyInstance) {
  // Check if SAML is enabled via environment
  const isSAMLEnabled = process.env.ENABLE_SAML === 'true';
  if (!isSAMLEnabled) {
    logger.info('SAML is disabled, skipping SAML provider initialization');
    return; // Exit early if SAML is disabled
  }

  // Initialize SAML provider
  let samlProvider: ReturnType<typeof createSAMLProvider>;
  
  try {
    const samlConfig = samlConfigService.getConfig();
    samlProvider = createSAMLProvider(samlConfig);
    logger.info('SAML provider initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize SAML provider', { error });
    throw new Error('SAML provider initialization failed');
  }

  // SAML Metadata endpoint
  fastify.get('/metadata', {
    schema: {
      description: 'Get SAML IdP metadata',
      tags: ['SAML'],
      response: {
        200: {
          type: 'string',
          description: 'SAML metadata XML',
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const metadata = samlProvider.generateMetadata();
      
      reply
        .type('application/xml')
        .send(metadata);
    } catch (error) {
      logger.error('Failed to generate SAML metadata', { error });
      reply.code(500).send({ error: 'Failed to generate metadata' });
    }
  });

  // SAML SSO endpoint - Handles authentication requests
  fastify.post('/sso', {
    schema: {
      description: 'SAML Single Sign-On endpoint',
      tags: ['SAML'],
      body: {
        type: 'object',
        properties: {
          SAMLRequest: { type: 'string' },
          RelayState: { type: 'string' },
          SigAlg: { type: 'string' },
          Signature: { type: 'string' },
        },
        required: ['SAMLRequest'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            requestId: { type: 'string' },
            loginUrl: { type: 'string' },
            relayState: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const { SAMLRequest, RelayState, SigAlg, Signature } = SAMLLoginRequestSchema.parse(request.body);

      // Parse and validate SAML request
      const { request: samlRequest, relayState, requestId } = await samlProvider.parseAuthRequest(
        SAMLRequest, 
        RelayState
      );

      // Log authentication request
      logger.info('SAML authentication request received', {
        requestId,
        issuer: samlRequest.issuer,
        destination: samlRequest.destination,
      });

      // Store SAML request context in session/database for later use
      await prisma.sAMLRequest.create({
        data: {
          id: requestId,
          issuer: samlRequest.issuer,
          destination: samlRequest.destination,
          assertionConsumerServiceURL: samlRequest.assertionConsumerServiceURL,
          relayState: relayState || null,
          forceAuthn: samlRequest.forceAuthn || false,
          isPassive: samlRequest.isPassive || false,
          expiresAt: new Date(Date.now() + 300000), // 5 minutes
        },
      });

      // Generate login URL with request context
      const loginUrl = `${process.env.FRONTEND_URL}/auth/login?samlRequestId=${requestId}${relayState ? `&relayState=${encodeURIComponent(relayState)}` : ''}`;

      reply.send({
        requestId,
        loginUrl,
        relayState: relayState || null,
      });
    } catch (error) {
      logger.error('SAML SSO request failed', { error });
      reply.code(400).send({ error: 'Invalid SAML request' });
    }
  });

  // SAML SSO GET endpoint - For HTTP-Redirect binding
  fastify.get('/sso', {
    schema: {
      description: 'SAML Single Sign-On endpoint (HTTP-Redirect)',
      tags: ['SAML'],
      querystring: {
        type: 'object',
        properties: {
          SAMLRequest: { type: 'string' },
          RelayState: { type: 'string' },
          SigAlg: { type: 'string' },
          Signature: { type: 'string' },
        },
        required: ['SAMLRequest'],
      },
    },
  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      const { SAMLRequest, RelayState, SigAlg, Signature } = SAMLLoginRequestSchema.parse(request.query);

      // Parse and validate SAML request
      const { request: samlRequest, relayState, requestId } = await samlProvider.parseAuthRequest(
        SAMLRequest, 
        RelayState
      );

      // Store SAML request context
      await prisma.sAMLRequest.create({
        data: {
          id: requestId,
          issuer: samlRequest.issuer,
          destination: samlRequest.destination,
          assertionConsumerServiceURL: samlRequest.assertionConsumerServiceURL,
          relayState: relayState || null,
          forceAuthn: samlRequest.forceAuthn || false,
          isPassive: samlRequest.isPassive || false,
          expiresAt: new Date(Date.now() + 300000),
        },
      });

      // Redirect to login page
      const loginUrl = `${process.env.FRONTEND_URL}/auth/login?samlRequestId=${requestId}${relayState ? `&relayState=${encodeURIComponent(relayState)}` : ''}`;
      
      reply.redirect(loginUrl);
    } catch (error) {
      logger.error('SAML SSO redirect failed', { error });
      reply.code(400).send({ error: 'Invalid SAML request' });
    }
  });

  // SAML Response generation endpoint - Called after successful authentication
  fastify.post('/response', {
    schema: {
      description: 'Generate SAML response after authentication',
      tags: ['SAML'],
      body: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          requestId: { type: 'string' },
          attributes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                friendlyName: { type: 'string' },
                nameFormat: { type: 'string' },
                values: { type: 'array', items: { type: 'string' } },
              },
              required: ['name', 'values'],
            },
          },
        },
        required: ['userId', 'requestId'],
      },
    },
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const { userId, requestId, attributes } = SAMLLoginCallbackSchema.parse(request.body);

      // Verify SAML request exists and is valid
      const storedRequest = await prisma.sAMLRequest.findUnique({
        where: { id: requestId },
      });

      if (!storedRequest || storedRequest.expiresAt < new Date()) {
        return reply.code(400).send({ error: 'Invalid or expired SAML request' });
      }

      // Generate SAML response
      const samlResponse = await samlProvider.generateResponse(userId, requestId, attributes);

      // Clean up stored request
      await prisma.sAMLRequest.delete({
        where: { id: requestId },
      });

      // Encode response for POST binding
      const encodedResponse = Buffer.from(samlResponse).toString('base64');

      // Generate auto-submit form for POST binding
      const formHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>SAML Response</title>
    <meta charset="utf-8">
</head>
<body onload="document.forms[0].submit()">
    <form method="post" action="${storedRequest.assertionConsumerServiceURL}">
        <input type="hidden" name="SAMLResponse" value="${encodedResponse}" />
        ${storedRequest.relayState ? `<input type="hidden" name="RelayState" value="${storedRequest.relayState}" />` : ''}
        <noscript>
            <p>JavaScript is disabled. Please click the submit button to continue.</p>
            <input type="submit" value="Submit" />
        </noscript>
    </form>
</body>
</html>`;

      reply
        .type('text/html')
        .send(formHtml);
    } catch (error) {
      logger.error('SAML response generation failed', { error });
      reply.code(500).send({ error: 'Failed to generate SAML response' });
    }
  });

  // SAML Single Logout endpoint
  fastify.post('/slo', {
    schema: {
      description: 'SAML Single Logout endpoint',
      tags: ['SAML'],
      body: {
        type: 'object',
        properties: {
          SAMLRequest: { type: 'string' },
          RelayState: { type: 'string' },
          SigAlg: { type: 'string' },
          Signature: { type: 'string' },
        },
        required: ['SAMLRequest'],
      },
    },
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const { SAMLRequest, RelayState } = SAMLLogoutRequestSchema.parse(request.body);

      // Parse logout request
      const decodedRequest = Buffer.from(SAMLRequest, 'base64').toString('utf-8');
      // Parse XML and extract logout request details (simplified)
      
      // Generate logout response
      const logoutResponse = await samlProvider.generateLogoutResponse(
        'logout-req-id', // Extract from parsed request
        'https://sp.example.com/logout', // Extract from parsed request
        'https://sp.example.com' // Extract from parsed request
      );

      const encodedResponse = Buffer.from(logoutResponse).toString('base64');

      // Return logout response
      reply.send({
        SAMLResponse: encodedResponse,
        RelayState: RelayState || null,
      });
    } catch (error) {
      logger.error('SAML logout failed', { error });
      reply.code(400).send({ error: 'Invalid logout request' });
    }
  });

  // SAML Status endpoint
  fastify.get('/status', {
    schema: {
      description: 'Get SAML provider status',
      tags: ['SAML'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            entityId: { type: 'string' },
            ssoUrl: { type: 'string' },
            sloUrl: { type: 'string' },
            certificate: { type: 'boolean' },
            configuration: {
              type: 'object',
              properties: {
                signAssertion: { type: 'boolean' },
                signResponse: { type: 'boolean' },
                encryptAssertion: { type: 'boolean' },
                nameIdFormat: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const config = samlConfigService.getConfig();
    reply.send({
      status: 'active',
      entityId: config.entityId,
      ssoUrl: config.ssoUrl,
      sloUrl: config.sloUrl,
      certificate: !!config.certificate,
      configuration: {
        signAssertion: config.signAssertion,
        signResponse: config.signResponse,
        encryptAssertion: config.encryptAssertion,
        nameIdFormat: config.nameIdFormat,
      },
    });
  });
}