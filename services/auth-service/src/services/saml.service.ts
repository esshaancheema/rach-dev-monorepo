import * as saml2 from 'saml2-js';
import * as forge from 'node-forge';
import { DOMParser, XMLSerializer } from 'xmldom';
import { SignedXml } from 'xmldsig';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { prisma } from '@zoptal/database';
import { CryptoUtils } from '../utils/crypto';

const SAMLProviderConfigSchema = z.object({
  entityId: z.string(),
  ssoUrl: z.string().url(),
  sloUrl: z.string().url().optional(),
  certificate: z.string(),
  privateKey: z.string(),
  nameIdFormat: z.enum(['persistent', 'transient', 'emailAddress']).default('persistent'),
  signAssertion: z.boolean().default(true),
  signResponse: z.boolean().default(true),
  encryptAssertion: z.boolean().default(false),
  assertionExpirationTime: z.number().default(300), // 5 minutes
});

export type SAMLProviderConfig = z.infer<typeof SAMLProviderConfigSchema>;

const SAMLRequestSchema = z.object({
  id: z.string(),
  issuer: z.string(),
  destination: z.string(),
  assertionConsumerServiceURL: z.string().url(),
  nameIdPolicy: z.object({
    format: z.string().optional(),
    allowCreate: z.boolean().optional(),
  }).optional(),
  forceAuthn: z.boolean().optional(),
  isPassive: z.boolean().optional(),
});

export type SAMLRequest = z.infer<typeof SAMLRequestSchema>;

const SAMLAttributeSchema = z.object({
  name: z.string(),
  friendlyName: z.string().optional(),
  nameFormat: z.string().optional(),
  values: z.array(z.string()),
});

export type SAMLAttribute = z.infer<typeof SAMLAttributeSchema>;

export class SAMLProvider {
  private config: SAMLProviderConfig;
  private certificate: forge.pki.Certificate;
  private privateKey: forge.pki.PrivateKey;

  constructor(config: SAMLProviderConfig) {
    this.config = SAMLProviderConfigSchema.parse(config);
    this.initializeCertificates();
  }

  private initializeCertificates() {
    try {
      // Load certificate
      const certPem = this.config.certificate.replace(/-----BEGIN CERTIFICATE-----/, '')
        .replace(/-----END CERTIFICATE-----/, '')
        .replace(/\s/g, '');
      this.certificate = forge.pki.certificateFromPem(
        `-----BEGIN CERTIFICATE-----\n${certPem}\n-----END CERTIFICATE-----`
      );

      // Load private key
      this.privateKey = forge.pki.privateKeyFromPem(this.config.privateKey);
    } catch (error) {
      logger.error('Failed to initialize SAML certificates', { error });
      throw new Error('Invalid SAML certificate or private key');
    }
  }

  /**
   * Generate SAML metadata for the Identity Provider
   */
  generateMetadata(): string {
    const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="${this.config.entityId}">
  <md:IDPSSODescriptor WantAuthnRequestsSigned="true"
                       protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>${this.getCertificateData()}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:${this.config.nameIdFormat}</md:NameIDFormat>
    <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                            Location="${this.config.ssoUrl}"/>
    <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                            Location="${this.config.ssoUrl}"/>
    ${this.config.sloUrl ? `
    <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                           Location="${this.config.sloUrl}"/>
    <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                           Location="${this.config.sloUrl}"/>
    ` : ''}
  </md:IDPSSODescriptor>
</md:EntityDescriptor>`;

    return this.config.signResponse ? this.signXML(metadata) : metadata;
  }

  /**
   * Parse and validate SAML Authentication Request
   */
  async parseAuthRequest(samlRequest: string, relayState?: string): Promise<{
    request: SAMLRequest;
    relayState?: string;
    requestId: string;
  }> {
    try {
      // Decode and parse SAML request
      const decodedRequest = Buffer.from(samlRequest, 'base64').toString('utf-8');
      const parser = new DOMParser();
      const doc = parser.parseFromString(decodedRequest, 'text/xml');

      // Extract request information
      const authnRequest = doc.getElementsByTagName('samlp:AuthnRequest')[0] || 
                          doc.getElementsByTagName('AuthnRequest')[0];

      if (!authnRequest) {
        throw new Error('Invalid SAML AuthnRequest');
      }

      const requestId = authnRequest.getAttribute('ID') || '';
      const issuer = doc.getElementsByTagName('saml:Issuer')[0]?.textContent || '';
      const destination = authnRequest.getAttribute('Destination') || '';
      const assertionConsumerServiceURL = authnRequest.getAttribute('AssertionConsumerServiceURL') || '';

      const request: SAMLRequest = {
        id: requestId,
        issuer,
        destination,
        assertionConsumerServiceURL,
        forceAuthn: authnRequest.getAttribute('ForceAuthn') === 'true',
        isPassive: authnRequest.getAttribute('IsPassive') === 'true',
      };

      // Validate request
      SAMLRequestSchema.parse(request);

      // Store request for later validation
      await this.storeSAMLRequest(requestId, request, relayState);

      return { request, relayState, requestId };
    } catch (error) {
      logger.error('Failed to parse SAML AuthnRequest', { error });
      throw new Error('Invalid SAML AuthnRequest');
    }
  }

  /**
   * Generate SAML Response after successful authentication
   */
  async generateResponse(
    userId: string,
    requestId: string,
    attributes?: SAMLAttribute[]
  ): Promise<string> {
    try {
      // Get stored request
      const storedRequest = await this.getSAMLRequest(requestId);
      if (!storedRequest) {
        throw new Error('Invalid or expired SAML request');
      }

      // Get user information
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const responseId = `_${CryptoUtils.generateSecureToken(32)}`;
      const assertionId = `_${CryptoUtils.generateSecureToken(32)}`;
      const issueInstant = new Date().toISOString();
      const notBefore = new Date().toISOString();
      const notOnOrAfter = new Date(Date.now() + this.config.assertionExpirationTime * 1000).toISOString();

      // Generate NameID
      const nameId = this.generateNameId(user);

      // Prepare attributes
      const attributeStatements = this.generateAttributeStatements(user, attributes);

      const response = `<?xml version="1.0" encoding="UTF-8"?>
<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                ID="${responseId}"
                Version="2.0"
                IssueInstant="${issueInstant}"
                Destination="${storedRequest.assertionConsumerServiceURL}"
                InResponseTo="${requestId}">
  <saml:Issuer>${this.config.entityId}</saml:Issuer>
  <samlp:Status>
    <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
  </samlp:Status>
  <saml:Assertion xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  xmlns:xs="http://www.w3.org/2001/XMLSchema"
                  ID="${assertionId}"
                  Version="2.0"
                  IssueInstant="${issueInstant}">
    <saml:Issuer>${this.config.entityId}</saml:Issuer>
    <saml:Subject>
      <saml:NameID Format="urn:oasis:names:tc:SAML:2.0:nameid-format:${this.config.nameIdFormat}">${nameId}</saml:NameID>
      <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
        <saml:SubjectConfirmationData NotOnOrAfter="${notOnOrAfter}"
                                      Recipient="${storedRequest.assertionConsumerServiceURL}"
                                      InResponseTo="${requestId}"/>
      </saml:SubjectConfirmation>
    </saml:Subject>
    <saml:Conditions NotBefore="${notBefore}" NotOnOrAfter="${notOnOrAfter}">
      <saml:AudienceRestriction>
        <saml:Audience>${storedRequest.issuer}</saml:Audience>
      </saml:AudienceRestriction>
    </saml:Conditions>
    <saml:AuthnStatement AuthnInstant="${issueInstant}" SessionIndex="${responseId}">
      <saml:AuthnContext>
        <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef>
      </saml:AuthnContext>
    </saml:AuthnStatement>
    ${attributeStatements}
  </saml:Assertion>
</samlp:Response>`;

      // Sign the response and/or assertion
      let signedResponse = response;
      if (this.config.signAssertion || this.config.signResponse) {
        signedResponse = this.signXML(response);
      }

      // Clean up stored request
      await this.removeSAMLRequest(requestId);

      // Log successful response generation
      logger.info('SAML response generated successfully', {
        userId,
        requestId,
        responseId,
        destination: storedRequest.assertionConsumerServiceURL,
      });

      return signedResponse;
    } catch (error) {
      logger.error('Failed to generate SAML response', { error, userId, requestId });
      throw error;
    }
  }

  /**
   * Generate SAML LogoutResponse
   */
  async generateLogoutResponse(
    logoutRequestId: string,
    destination: string,
    issuer: string
  ): Promise<string> {
    const responseId = `_${CryptoUtils.generateSecureToken(32)}`;
    const issueInstant = new Date().toISOString();

    const response = `<?xml version="1.0" encoding="UTF-8"?>
<samlp:LogoutResponse xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                      ID="${responseId}"
                      Version="2.0"
                      IssueInstant="${issueInstant}"
                      Destination="${destination}"
                      InResponseTo="${logoutRequestId}">
  <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${this.config.entityId}</saml:Issuer>
  <samlp:Status>
    <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
  </samlp:Status>
</samlp:LogoutResponse>`;

    return this.config.signResponse ? this.signXML(response) : response;
  }

  private getCertificateData(): string {
    return forge.util.encode64(forge.asn1.toDer(forge.pki.certificateToAsn1(this.certificate)).getBytes());
  }

  private generateNameId(user: any): string {
    switch (this.config.nameIdFormat) {
      case 'emailAddress':
        return user.email;
      case 'persistent':
        return `zoptal-${user.id}`;
      case 'transient':
        return `trans-${CryptoUtils.generateSecureToken(16)}`;
      default:
        return user.email;
    }
  }

  private generateAttributeStatements(user: any, customAttributes?: SAMLAttribute[]): string {
    const defaultAttributes: SAMLAttribute[] = [
      {
        name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        friendlyName: 'Email',
        values: [user.email],
      },
      {
        name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
        friendlyName: 'Given Name',
        values: [user.firstName || ''],
      },
      {
        name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
        friendlyName: 'Surname',
        values: [user.lastName || ''],
      },
      {
        name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
        friendlyName: 'User ID',
        values: [user.id],
      },
    ];

    const allAttributes = [...defaultAttributes, ...(customAttributes || [])];

    const attributeElements = allAttributes.map(attr => {
      const valueElements = attr.values.map(value => 
        `<saml:AttributeValue xsi:type="xs:string">${this.escapeXml(value)}</saml:AttributeValue>`
      ).join('\n      ');

      return `    <saml:Attribute Name="${attr.name}"${attr.friendlyName ? ` FriendlyName="${attr.friendlyName}"` : ''}${attr.nameFormat ? ` NameFormat="${attr.nameFormat}"` : ''}>
      ${valueElements}
    </saml:Attribute>`;
    }).join('\n');

    return allAttributes.length > 0 ? `
    <saml:AttributeStatement>
${attributeElements}
    </saml:AttributeStatement>` : '';
  }

  private signXML(xml: string): string {
    try {
      const sig = new SignedXml();
      sig.signingKey = this.config.privateKey;
      sig.addReference("//*[local-name(.)='Assertion']");
      sig.computeSignature(xml);
      return sig.getSignedXml();
    } catch (error) {
      logger.error('Failed to sign XML', { error });
      throw new Error('XML signing failed');
    }
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  private async storeSAMLRequest(requestId: string, request: SAMLRequest, relayState?: string): Promise<void> {
    // Store in Redis or database for later validation
    const key = `saml:request:${requestId}`;
    const data = JSON.stringify({ request, relayState, timestamp: Date.now() });
    
    // Assuming Redis client is available
    // await redis.setex(key, 300, data); // 5 minute expiration
    
    // For now, we'll use in-memory storage (should be Redis in production)
    logger.info('SAML request stored', { requestId, issuer: request.issuer });
  }

  private async getSAMLRequest(requestId: string): Promise<SAMLRequest | null> {
    // Retrieve from Redis or database
    const key = `saml:request:${requestId}`;
    
    // This would be implemented with actual Redis in production
    // const data = await redis.get(key);
    // if (data) {
    //   const parsed = JSON.parse(data);
    //   return parsed.request;
    // }
    
    return null;
  }

  private async removeSAMLRequest(requestId: string): Promise<void> {
    // Remove from Redis or database
    const key = `saml:request:${requestId}`;
    
    // This would be implemented with actual Redis in production
    // await redis.del(key);
    
    logger.info('SAML request cleaned up', { requestId });
  }
}

export const createSAMLProvider = (config: SAMLProviderConfig): SAMLProvider => {
  return new SAMLProvider(config);
};