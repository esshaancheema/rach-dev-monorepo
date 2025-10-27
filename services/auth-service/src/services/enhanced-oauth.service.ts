import { FastifyInstance } from 'fastify';
import { Provider } from 'oidc-provider';
import { SignJWT, jwtVerify, generateKeyPair, exportJWK, importJWK } from 'jose';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { prisma } from '@zoptal/database';
import { CryptoUtils } from '../utils/crypto';

// OAuth/OIDC Configuration Schema
const OAuthConfigSchema = z.object({
  issuer: z.string().url(),
  clients: z.array(z.object({
    client_id: z.string(),
    client_secret: z.string().optional(),
    redirect_uris: z.array(z.string().url()),
    response_types: z.array(z.string()).default(['code']),
    grant_types: z.array(z.string()).default(['authorization_code', 'refresh_token']),
    token_endpoint_auth_method: z.enum(['client_secret_basic', 'client_secret_post', 'none']).default('client_secret_basic'),
    scope: z.string().default('openid profile email'),
    application_type: z.enum(['web', 'native']).default('web'),
  })),
  features: z.object({
    devInteractions: z.boolean().default(false),
    deviceFlow: z.boolean().default(true),
    introspection: z.boolean().default(true),
    revocation: z.boolean().default(true),
    jwtIntrospection: z.boolean().default(true),
    registration: z.boolean().default(false),
    registrationManagement: z.boolean().default(false),
    requestObjects: z.boolean().default(true),
    pkce: z.boolean().default(true),
    dPoP: z.boolean().default(true),
    jwtUserinfo: z.boolean().default(true),
    webMessageResponseMode: z.boolean().default(true),
    backchannelLogout: z.boolean().default(true),
    frontchannelLogout: z.boolean().default(true),
  }).default({}),
  jwks: z.object({
    keys: z.array(z.record(z.unknown()))
  }).optional(),
  scopes: z.array(z.string()).default(['openid', 'profile', 'email', 'phone', 'address']),
  claims: z.record(z.array(z.string())).default({
    openid: ['sub'],
    profile: ['name', 'given_name', 'family_name', 'preferred_username', 'picture', 'website', 'gender', 'birthdate', 'zoneinfo', 'locale', 'updated_at'],
    email: ['email', 'email_verified'],
    phone: ['phone_number', 'phone_number_verified'],
    address: ['address'],
  }),
});

export type OAuthConfig = z.infer<typeof OAuthConfigSchema>;

const TokenExchangeSchema = z.object({
  grant_type: z.literal('urn:ietf:params:oauth:grant-type:token-exchange'),
  subject_token: z.string(),
  subject_token_type: z.string(),
  requested_token_type: z.string().optional(),
  audience: z.string().optional(),
  scope: z.string().optional(),
});

const DeviceFlowSchema = z.object({
  client_id: z.string(),
  scope: z.string().optional(),
});

export class EnhancedOAuthService {
  private provider: Provider;
  private jwks: any;
  private config: OAuthConfig;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance, config: OAuthConfig) {
    this.fastify = fastify;
    this.config = OAuthConfigSchema.parse(config);
    this.initializeJWKS();
    this.initializeProvider();
  }

  private async initializeJWKS() {
    try {
      // Try to load existing JWKS from database or generate new ones
      let storedJWKS = await this.loadJWKSFromDatabase();
      
      if (!storedJWKS) {
        logger.info('Generating new JWKS for OAuth provider');
        storedJWKS = await this.generateJWKS();
        await this.saveJWKSToDatabase(storedJWKS);
      }

      this.jwks = storedJWKS;
      this.config.jwks = storedJWKS;
    } catch (error) {
      logger.error('Failed to initialize JWKS', { error });
      throw new Error('JWKS initialization failed');
    }
  }

  private async generateJWKS() {
    const { publicKey, privateKey } = await generateKeyPair('RS256');
    
    const publicJWK = await exportJWK(publicKey);
    const privateJWK = await exportJWK(privateKey);

    // Add key ID and algorithm
    const kid = CryptoUtils.generateSecureToken(16);
    publicJWK.kid = kid;
    publicJWK.alg = 'RS256';
    publicJWK.use = 'sig';
    
    privateJWK.kid = kid;
    privateJWK.alg = 'RS256';
    privateJWK.use = 'sig';

    return {
      keys: [privateJWK] // Provider needs private key for signing
    };
  }

  private async loadJWKSFromDatabase(): Promise<any> {
    try {
      const jwksRecord = await prisma.oAuthJWKS.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });

      return jwksRecord ? JSON.parse(jwksRecord.keys) : null;
    } catch (error) {
      logger.warn('Could not load JWKS from database', { error });
      return null;
    }
  }

  private async saveJWKSToDatabase(jwks: any) {
    try {
      // Deactivate old JWKS
      await prisma.oAuthJWKS.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });

      // Save new JWKS
      await prisma.oAuthJWKS.create({
        data: {
          keys: JSON.stringify(jwks),
          keyId: jwks.keys[0].kid,
          algorithm: jwks.keys[0].alg,
          isActive: true,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        }
      });

      logger.info('JWKS saved to database successfully');
    } catch (error) {
      logger.error('Failed to save JWKS to database', { error });
    }
  }

  private initializeProvider() {
    const configuration = {
      issuer: this.config.issuer,
      
      // Client registration
      clients: this.config.clients,

      // Supported features
      features: {
        devInteractions: { enabled: this.config.features.devInteractions },
        deviceFlow: { enabled: this.config.features.deviceFlow },
        introspection: { enabled: this.config.features.introspection },
        revocation: { enabled: this.config.features.revocation },
        jwtIntrospection: { enabled: this.config.features.jwtIntrospection },
        registration: { enabled: this.config.features.registration },
        registrationManagement: { enabled: this.config.features.registrationManagement },
        requestObjects: { enabled: this.config.features.requestObjects },
        pkce: { enabled: this.config.features.pkce, required: () => true },
        dPoP: { enabled: this.config.features.dPoP },
        jwtUserinfo: { enabled: this.config.features.jwtUserinfo },
        webMessageResponseMode: { enabled: this.config.features.webMessageResponseMode },
        backchannelLogout: { enabled: this.config.features.backchannelLogout },
        frontchannelLogout: { enabled: this.config.features.frontchannelLogout },
        
        // Token Exchange (RFC 8693)
        tokenExchange: {
          enabled: true,
          exchangeableTokens: ['access_token', 'refresh_token', 'id_token']
        },

        // Resource Indicators (RFC 8707)
        resourceIndicators: {
          enabled: true,
          defaultResource: (ctx: any) => {
            return ctx.oidc.client?.metadata?.default_audience || this.config.issuer;
          },
          getResourceServerInfo: (ctx: any, resource: string) => {
            return {
              scope: 'read write',
              audience: resource,
            };
          },
        },

        // JWT Secured Authorization Response Mode (JARM)
        jarm: {
          enabled: true,
        },
      },

      // JWKS
      jwks: this.config.jwks,

      // Scopes and Claims
      scopes: this.config.scopes,
      claims: this.config.claims,

      // Token configuration
      ttl: {
        AccessToken: 60 * 60, // 1 hour
        AuthorizationCode: 10 * 60, // 10 minutes
        ClientCredentials: 60 * 60, // 1 hour
        DeviceCode: 10 * 60, // 10 minutes
        Grant: 14 * 24 * 60 * 60, // 14 days
        IdToken: 60 * 60, // 1 hour
        Interaction: 60 * 60, // 1 hour
        RefreshToken: 14 * 24 * 60 * 60, // 14 days
        Session: 14 * 24 * 60 * 60, // 14 days
      },

      // Response modes
      responseModes: ['query', 'fragment', 'form_post', 'web_message', 'jwt'],

      // Grant types
      grantTypes: new Set([
        'authorization_code',
        'client_credentials',
        'refresh_token',
        'urn:ietf:params:oauth:grant-type:device_code',
        'urn:ietf:params:oauth:grant-type:token-exchange',
      ]),

      // Custom grant types
      extraTokenEndpointAuth: ['urn:ietf:params:oauth:grant-type:token-exchange'],

      // Interaction URL for login/consent
      interactions: {
        url: (ctx: any, interaction: any) => {
          return `/oauth/interaction/${interaction.uid}`;
        },
      },

      // Custom token formats
      formats: {
        AccessToken: 'jwt',
        ClientCredentials: 'jwt',
      },

      // Adapter for data persistence
      adapter: this.createAdapter(),

      // Find account by ID
      findAccount: this.findAccount.bind(this),

      // Custom hooks
      extraParams: ['max_age', 'ui_locales', 'id_token_hint'],

      // Proof Key for Code Exchange (PKCE)
      pkceMethods: ['S256'],

      // JWT configuration
      jwks: {
        keys: this.config.jwks?.keys || []
      },
    };

    this.provider = new Provider(this.config.issuer, configuration);
    this.setupProviderEvents();
  }

  private createAdapter() {
    // Custom adapter for data persistence using Prisma
    return (model: string) => ({
      upsert: async (id: string, payload: any, expiresIn: number) => {
        const data = {
          modelType: model,
          modelId: id,
          payload: JSON.stringify(payload),
          grantId: payload.grantId,
          userCode: payload.userCode,
          uid: payload.uid,
          expiresAt: new Date(Date.now() + expiresIn * 1000),
        };

        await prisma.oAuthToken.upsert({
          where: { modelType_modelId: { modelType: model, modelId: id } },
          update: data,
          create: data,
        });
      },

      find: async (id: string) => {
        const token = await prisma.oAuthToken.findUnique({
          where: { modelType_modelId: { modelType: model, modelId: id } },
        });

        if (!token || token.expiresAt < new Date()) {
          return null;
        }

        return JSON.parse(token.payload);
      },

      findByUserCode: async (userCode: string) => {
        const token = await prisma.oAuthToken.findFirst({
          where: { modelType: model, userCode },
        });

        if (!token || token.expiresAt < new Date()) {
          return null;
        }

        return JSON.parse(token.payload);
      },

      findByUid: async (uid: string) => {
        const token = await prisma.oAuthToken.findFirst({
          where: { modelType: model, uid },
        });

        if (!token || token.expiresAt < new Date()) {
          return null;
        }

        return JSON.parse(token.payload);
      },

      destroy: async (id: string) => {
        await prisma.oAuthToken.delete({
          where: { modelType_modelId: { modelType: model, modelId: id } },
        }).catch(() => {});
      },

      revokeByGrantId: async (grantId: string) => {
        await prisma.oAuthToken.deleteMany({
          where: { modelType: model, grantId },
        });
      },

      consume: async (id: string) => {
        const token = await prisma.oAuthToken.findUnique({
          where: { modelType_modelId: { modelType: model, modelId: id } },
        });

        if (!token) return;

        const payload = JSON.parse(token.payload);
        payload.consumed = Math.floor(Date.now() / 1000);

        await prisma.oAuthToken.update({
          where: { modelType_modelId: { modelType: model, modelId: id } },
          data: { payload: JSON.stringify(payload) },
        });
      },
    });
  }

  private async findAccount(ctx: any, sub: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: sub },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          phone: true,
          image: true,
          emailVerified: true,
          phoneVerified: true,
          country: true,
          timezone: true,
          language: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return null;
      }

      return {
        accountId: user.id,
        claims: async (use: string, scope: string, claims: any, rejected: string[]) => {
          const userClaims: any = {
            sub: user.id,
          };

          // Add claims based on scope
          if (scope.includes('profile')) {
            userClaims.name = user.name || `${user.firstName} ${user.lastName}`.trim();
            userClaims.given_name = user.firstName;
            userClaims.family_name = user.lastName;
            userClaims.preferred_username = user.email;
            userClaims.picture = user.image;
            userClaims.zoneinfo = user.timezone;
            userClaims.locale = user.language;
            userClaims.updated_at = Math.floor(Date.now() / 1000);
          }

          if (scope.includes('email')) {
            userClaims.email = user.email;
            userClaims.email_verified = !!user.emailVerified;
          }

          if (scope.includes('phone')) {
            userClaims.phone_number = user.phone;
            userClaims.phone_number_verified = !!user.phoneVerified;
          }

          if (scope.includes('address')) {
            userClaims.address = {
              country: user.country,
            };
          }

          // Add custom enterprise claims
          userClaims.tenant = 'zoptal';
          userClaims.organization = 'Zoptal Technologies';

          return userClaims;
        },
      };
    } catch (error) {
      logger.error('Failed to find account', { error, sub });
      return null;
    }
  }

  private setupProviderEvents() {
    // Grant events
    this.provider.on('grant.success', (ctx) => {
      logger.info('OAuth grant successful', {
        clientId: ctx.oidc.client?.clientId,
        grantType: ctx.oidc.params?.grant_type,
        accountId: ctx.oidc.account?.accountId,
        scope: ctx.oidc.params?.scope,
      });
    });

    this.provider.on('grant.error', (ctx, error) => {
      logger.error('OAuth grant failed', {
        clientId: ctx.oidc.client?.clientId,
        grantType: ctx.oidc.params?.grant_type,
        error: error.message,
      });
    });

    // Token events
    this.provider.on('access_token.issued', (ctx, token) => {
      logger.info('Access token issued', {
        clientId: ctx.oidc.client?.clientId,
        accountId: ctx.oidc.account?.accountId,
        scope: token.scope,
        tokenId: token.jti,
      });
    });

    this.provider.on('refresh_token.consumed', (ctx, token) => {
      logger.info('Refresh token consumed', {
        clientId: ctx.oidc.client?.clientId,
        accountId: ctx.oidc.account?.accountId,
        tokenId: token.jti,
      });
    });

    // Authorization events
    this.provider.on('authorization.accepted', (ctx) => {
      logger.info('Authorization accepted', {
        clientId: ctx.oidc.client?.clientId,
        accountId: ctx.oidc.account?.accountId,
        scope: ctx.oidc.params?.scope,
      });
    });

    this.provider.on('authorization.error', (ctx, error) => {
      logger.error('Authorization error', {
        clientId: ctx.oidc.client?.clientId,
        error: error.message,
        errorDescription: error.error_description,
      });
    });

    // Backchannel logout events
    this.provider.on('backchannel.success', (ctx, sid, clientId) => {
      logger.info('Backchannel logout successful', {
        sessionId: sid,
        clientId,
      });
    });

    this.provider.on('backchannel.error', (ctx, error, clientId, sid) => {
      logger.error('Backchannel logout failed', {
        sessionId: sid,
        clientId,
        error: error.message,
      });
    });
  }

  // Token Exchange implementation (RFC 8693)
  async handleTokenExchange(params: any) {
    try {
      const { grant_type, subject_token, subject_token_type, requested_token_type, audience, scope } = 
        TokenExchangeSchema.parse(params);

      // Verify the subject token
      const { payload } = await jwtVerify(subject_token, await importJWK(this.config.jwks!.keys[0]));

      if (!payload.sub) {
        throw new Error('Invalid subject token');
      }

      // Find the user account
      const account = await this.findAccount(null, payload.sub as string);
      if (!account) {
        throw new Error('Account not found');
      }

      // Generate new token with requested properties
      const newTokenPayload = {
        sub: payload.sub,
        aud: audience || this.config.issuer,
        scope: scope || 'openid profile email',
        iss: this.config.issuer,
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        iat: Math.floor(Date.now() / 1000),
        jti: CryptoUtils.generateSecureToken(16),
        token_type: requested_token_type || 'access_token',
      };

      const newToken = await new SignJWT(newTokenPayload)
        .setProtectedHeader({ alg: 'RS256', kid: this.config.jwks!.keys[0].kid })
        .sign(await importJWK(this.config.jwks!.keys[0]));

      logger.info('Token exchange successful', {
        subject: payload.sub,
        audience,
        requestedTokenType: requested_token_type,
      });

      return {
        access_token: newToken,
        issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: scope || 'openid profile email',
      };
    } catch (error) {
      logger.error('Token exchange failed', { error });
      throw error;
    }
  }

  // Device Authorization Flow
  async handleDeviceFlow(params: any) {
    try {
      const { client_id, scope } = DeviceFlowSchema.parse(params);

      const deviceCode = CryptoUtils.generateSecureToken(32);
      const userCode = CryptoUtils.generateSecureCode(8);
      const verificationUri = `${this.config.issuer}/device`;
      const verificationUriComplete = `${verificationUri}?user_code=${userCode}`;

      // Store device authorization request
      await prisma.oAuthDeviceCode.create({
        data: {
          deviceCode,
          userCode,
          clientId: client_id,
          scope: scope || 'openid profile email',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          interval: 5, // Poll every 5 seconds
        },
      });

      logger.info('Device authorization request initiated', {
        clientId: client_id,
        userCode,
        deviceCode: deviceCode.substring(0, 8) + '...',
      });

      return {
        device_code: deviceCode,
        user_code: userCode,
        verification_uri: verificationUri,
        verification_uri_complete: verificationUriComplete,
        expires_in: 600, // 10 minutes
        interval: 5,
      };
    } catch (error) {
      logger.error('Device flow initiation failed', { error });
      throw error;
    }
  }

  // Pushed Authorization Requests (PAR) - RFC 9126
  async handlePushedAuthorizationRequest(params: any) {
    try {
      const requestUri = `urn:ietf:params:oauth:request_uri:${CryptoUtils.generateSecureToken(32)}`;
      
      // Store the authorization request parameters
      await prisma.oAuthPushedAuthRequest.create({
        data: {
          requestUri,
          parameters: JSON.stringify(params),
          clientId: params.client_id,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });

      logger.info('Pushed authorization request created', {
        clientId: params.client_id,
        requestUri,
      });

      return {
        request_uri: requestUri,
        expires_in: 600, // 10 minutes
      };
    } catch (error) {
      logger.error('Pushed authorization request failed', { error });
      throw error;
    }
  }

  // JWT Secured Authorization Response Mode (JARM)
  async createJARMResponse(params: any, authResult: any) {
    try {
      const jarmPayload = {
        ...authResult,
        iss: this.config.issuer,
        aud: params.client_id,
        exp: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        iat: Math.floor(Date.now() / 1000),
      };

      const jarmToken = await new SignJWT(jarmPayload)
        .setProtectedHeader({ alg: 'RS256', kid: this.config.jwks!.keys[0].kid })
        .sign(await importJWK(this.config.jwks!.keys[0]));

      return jarmToken;
    } catch (error) {
      logger.error('JARM response creation failed', { error });
      throw error;
    }
  }

  // Get provider instance
  getProvider(): Provider {
    return this.provider;
  }

  // Get JWKS public keys for clients
  getPublicJWKS() {
    const publicKeys = this.config.jwks?.keys.map(key => {
      const { d, p, q, dp, dq, qi, ...publicKey } = key;
      return publicKey;
    });

    return { keys: publicKeys };
  }

  // Dynamic client registration
  async registerClient(clientMetadata: any) {
    try {
      const clientId = `client_${CryptoUtils.generateSecureToken(16)}`;
      const clientSecret = CryptoUtils.generateSecureToken(32);

      const client = await prisma.oAuthClient.create({
        data: {
          clientId,
          clientSecret,
          metadata: JSON.stringify(clientMetadata),
          isActive: true,
        },
      });

      logger.info('OAuth client registered', {
        clientId,
        applicationType: clientMetadata.application_type,
      });

      return {
        client_id: clientId,
        client_secret: clientSecret,
        client_id_issued_at: Math.floor(Date.now() / 1000),
        client_secret_expires_at: 0, // Never expires
        ...clientMetadata,
      };
    } catch (error) {
      logger.error('Client registration failed', { error });
      throw error;
    }
  }

  // Rich Authorization Requests (RAR) support
  async processAuthorizationDetails(authorizationDetails: any[]) {
    try {
      const processedDetails = authorizationDetails.map(detail => ({
        type: detail.type,
        locations: detail.locations,
        actions: detail.actions,
        datatypes: detail.datatypes,
        identifier: detail.identifier,
        privileges: detail.privileges,
      }));

      return processedDetails;
    } catch (error) {
      logger.error('Authorization details processing failed', { error });
      throw error;
    }
  }
}

export default EnhancedOAuthService;