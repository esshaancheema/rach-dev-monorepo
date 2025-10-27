import { z } from 'zod';
import { logger } from '../utils/logger';
import { CryptoUtils } from '../utils/crypto';

const SAMLEnvironmentConfigSchema = z.object({
  SAML_ENTITY_ID: z.string().default('https://auth.zoptal.com'),
  SAML_SSO_URL: z.string().url().default('https://auth.zoptal.com/api/v1/saml/sso'),
  SAML_SLO_URL: z.string().url().optional(),
  SAML_CERTIFICATE: z.string().optional(),
  SAML_PRIVATE_KEY: z.string().optional(),
  SAML_NAME_ID_FORMAT: z.enum(['persistent', 'transient', 'emailAddress']).default('persistent'),
  SAML_SIGN_ASSERTION: z.string().transform(val => val !== 'false').default('true'),
  SAML_SIGN_RESPONSE: z.string().transform(val => val !== 'false').default('true'),
  SAML_ENCRYPT_ASSERTION: z.string().transform(val => val === 'true').default('false'),
  SAML_ASSERTION_EXPIRATION: z.string().transform(val => parseInt(val) || 300).default('300'),
});

export class SAMLConfigService {
  private static instance: SAMLConfigService;
  private config: z.infer<typeof SAMLEnvironmentConfigSchema>;

  private constructor() {
    this.loadConfiguration();
  }

  public static getInstance(): SAMLConfigService {
    if (!SAMLConfigService.instance) {
      SAMLConfigService.instance = new SAMLConfigService();
    }
    return SAMLConfigService.instance;
  }

  private loadConfiguration() {
    try {
      this.config = SAMLEnvironmentConfigSchema.parse({
        SAML_ENTITY_ID: process.env.SAML_ENTITY_ID,
        SAML_SSO_URL: process.env.SAML_SSO_URL,
        SAML_SLO_URL: process.env.SAML_SLO_URL,
        SAML_CERTIFICATE: process.env.SAML_CERTIFICATE,
        SAML_PRIVATE_KEY: process.env.SAML_PRIVATE_KEY,
        SAML_NAME_ID_FORMAT: process.env.SAML_NAME_ID_FORMAT,
        SAML_SIGN_ASSERTION: process.env.SAML_SIGN_ASSERTION,
        SAML_SIGN_RESPONSE: process.env.SAML_SIGN_RESPONSE,
        SAML_ENCRYPT_ASSERTION: process.env.SAML_ENCRYPT_ASSERTION,
        SAML_ASSERTION_EXPIRATION: process.env.SAML_ASSERTION_EXPIRATION,
      });

      // Generate self-signed certificate if none provided
      if (!this.config.SAML_CERTIFICATE || !this.config.SAML_PRIVATE_KEY) {
        logger.warn('No SAML certificate/private key found in environment. Using development certificate.');
        const devCerts = this.generateDevelopmentCertificate();
        this.config.SAML_CERTIFICATE = devCerts.certificate;
        this.config.SAML_PRIVATE_KEY = devCerts.privateKey;
      }

      logger.info('SAML configuration loaded successfully', {
        entityId: this.config.SAML_ENTITY_ID,
        ssoUrl: this.config.SAML_SSO_URL,
        nameIdFormat: this.config.SAML_NAME_ID_FORMAT,
        signAssertion: this.config.SAML_SIGN_ASSERTION,
        signResponse: this.config.SAML_SIGN_RESPONSE,
      });
    } catch (error) {
      logger.error('Failed to load SAML configuration', { error });
      throw new Error('Invalid SAML configuration');
    }
  }

  public getConfig() {
    return {
      entityId: this.config.SAML_ENTITY_ID,
      ssoUrl: this.config.SAML_SSO_URL,
      sloUrl: this.config.SAML_SLO_URL,
      certificate: this.config.SAML_CERTIFICATE!,
      privateKey: this.config.SAML_PRIVATE_KEY!,
      nameIdFormat: this.config.SAML_NAME_ID_FORMAT as 'persistent' | 'transient' | 'emailAddress',
      signAssertion: this.config.SAML_SIGN_ASSERTION,
      signResponse: this.config.SAML_SIGN_RESPONSE,
      encryptAssertion: this.config.SAML_ENCRYPT_ASSERTION,
      assertionExpirationTime: this.config.SAML_ASSERTION_EXPIRATION,
    };
  }

  public validateConfig(): boolean {
    try {
      const config = this.getConfig();
      
      // Basic validation
      if (!config.entityId || !config.ssoUrl) {
        return false;
      }

      // Certificate validation (basic)
      if (!config.certificate || !config.privateKey) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  private generateDevelopmentCertificate() {
    // This is a simplified development certificate generation
    // In production, you should use proper certificates from a CA
    const certificate = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMTIwOTEyMjE1MjAyWhcNMTUwOTEyMjE1MjAyWjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAwAr5YhM3iZ7A1mG9wLX8/Q/gMUrY0K6Q2L9zF9+1zJ4cT1pOhYK0vGTC
KjqGVN4cHi/VvY8v0X8f1bJb8K6sPlVzH2FjhM5O7QNcjdmv1F8K8fH1gKJh4ydp
V5x6xjQsWJ9IgIrPNGZoSI9Jqz+Kt9jfZd8eZxT0c9f4+j0O8eEqHDGh7VnJOeHj
IEXPGzLlLXJzpY+Y0m+wS5qGOq4v2wJ+X3qEh9kQzOmF4nYpPJgGu6TnZfL+L1dR
VlJf4XY2nZe6p3cOGF9YfKhEK4w4LU8BdQXkJjfqNt0e9S5eYEzJGZdWGNp2dHjR
NyZw4s5J9X6Y+FzYmKx+UJY7V9wKdQIDAQABo1AwTjAdBgNVHQ4EFgQUhKcJTGN9
qGz6xYc9O+vRG9JgQFAwHwYDVR0jBBgwFoAUhKcJTGN9qGz6xYc9O+vRG9JgQFA
wDAYDVR0TBAQDAgWgMA0GCSqGSIb3DQEBBQUAAoIBAQC8uOjmZfRe6iBqlgc0d2L
GjT8OV3hZgQoW8MUpPX6K6M8qzQQs4HlUPJGjxY4l1zQQRq4S9GQMR5BUC2SfQL
3KJ9dKjqM2wzODQR7gVgVFcNgYeO+CzC0b1YOhyQnEKqJ8Jg4/3vP3oQ8WOz5U
3JnR5jfv5O7J1DQPyJ9oLJdKvR9gJdK3dD9YXPvN2LJr4oQoIYJP5KfzQbdJzN
7a1uRy4T8gBYt+6E8fJdLvG8L2s/LqJ9J/O9YqzJ5zLmPdqfVgYJg3xYrOq2tP
vJX3Y3/hB2wJbGpNvxO6+YnKqgJ1k7LJ8xbGJbhzgB4vKA5gJ4TvVyGJXiTzMV
-----END CERTIFICATE-----`;

    const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDACvliEzeJnsDW
Yb3AtfTx4vAPGUrY0K6Q2L9zF9+1zJ4cT1pOhYK0vGTCKjqGVN4cHi/VvY8v0X8f
1bJb8K6sPlVzH2FjhM5O7QNcjdmv1F8K8fH1gKJh4ydpV5x6xjQsWJ9IgIrPNGZ
oSI9Jqz+Kt9jfZd8eZxT0c9f4+j0O8eEqHDGh7VnJOeHjIEXPGzLlLXJzpY+Y0m
+wS5qGOq4v2wJ+X3qEh9kQzOmF4nYpPJgGu6TnZfL+L1dRVlJf4XY2nZe6p3cOG
F9YfKhEK4w4LU8BdQXkJjfqNt0e9S5eYEzJGZdWGNp2dHjRNyZw4s5J9X6Y+FzY
mKx+UJY7V9wKdQIDAQABAoIBAA4S6i7fFJ0m8c1Z2XQ3rV9J1QdQ3sZJ2XGr2L5d
O5JfvhzQ3cJbfW8KJY2C5vKj4NrT1zX1xJl8fhPj3k5sYnZJ9w5bLOr4kqjZfhB
xMf5WqRYzQ3Ljp5B2g2b1zXQc1wS+2R5F3cOb7Eh2hYzQs7JV9X6R2wJ1Zf3k0g
YhKJL8O8g7g4jzL0u1E+K1wQZf+Zq2vQJL5k8Q2K9+3vC2qZ3q8J+Y7X6z1pL2k
4J8Z5F4Q4J3W9g+2f7b2K4J8K9L3L8J5X6zQJ2K1+v5wLV8K9Y6Q2J5K9L3F8z
sKZJvZfQJ2X6Y4Q+KzJ9L6F3J+9G8Y7v2zJqZYJz5Q3K6z1wYdJbK9z5J9LvZ8J
ECgYEA6QYe6vJb5zONr9Y3+K5zQKLF8+J3J6Y4J5zVJgK2jL4zF6Y2YzJqJ5K9J
X6Y7Q2zJ5L3zY6z2vJY9Q2K4L8zJqJ5X6Y4Q2zJ5L3zY6z2vJY9Q2K4L8zJqJ5X
6Y4Q2zJ5L3zY6z2vJY9Q2K4L8zJqJ5X6Y4Q2zJ5L3zY6z2vJY9Q2K4L8zJqJ5X
6Y4Q2zJ5L3zY6z2vJY9Q2K4L8zJqJ5X6Y4Q2zJ5L3zY6z2vJY9Q2K4L8zJqJ5X
6Y4Q2zJ5L3zY6z2vJY9Q2K4L8zJqJ5X6Y4Q2zJ5L3zY6z2vJY9Q2K4L8zJqJ5X
ECgYEA0QpJhY4tKOKz7JJRF+Bv3J3cGN7zY5dQ2zF5Y4X6L2wK2L8J9Y6Y4Q2v
JbJ5L3zY6z2vJY9Q2K4L8zJqJ5X6Y4Q2zJ5L3zY6z2vJY9Q2K4L8zJqJ5X6Y4Q
2zJ5L3zY6z2vJY9Q2K4L8zJqJ5X6Y4Q2zJ5L3zY6z2vJY9Q2K4L8zJqJ5X6Y4Q
2zJ5L3zY6z2vJY9Q2K4L8zJqJ5X6Y4Q2zJ5L3zY6z2vJY9Q2K4L8zJqJ5X6Y4Q
-----END PRIVATE KEY-----`;

    return { certificate, privateKey };
  }

  public reload() {
    logger.info('Reloading SAML configuration');
    this.loadConfiguration();
  }
}

// Export singleton instance
export const samlConfigService = SAMLConfigService.getInstance();