import { logger } from '../utils/logger';
import { config } from '../config';
import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: EmailTemplateCategory;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface EmailTemplateData {
  // User data
  user?: {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  
  // Application data
  app?: {
    name: string;
    url: string;
    supportEmail: string;
    logoUrl?: string;
  };
  
  // Action-specific data
  verification?: {
    token: string;
    url: string;
    expiresAt: Date;
    expiresInHours: number;
  };
  
  reset?: {
    token: string;
    url: string;
    expiresAt: Date;
    expiresInHours: number;
  };
  
  twoFactor?: {
    code: string;
    expiresInMinutes: number;
  };
  
  login?: {
    ip: string;
    location?: string;
    device?: string;
    timestamp: Date;
  };
  
  security?: {
    action: string;
    ip: string;
    timestamp: Date;
    details?: any;
  };
  
  // Custom data
  custom?: Record<string, any>;
}

export enum EmailTemplateCategory {
  AUTHENTICATION = 'authentication',
  VERIFICATION = 'verification',
  SECURITY = 'security',
  NOTIFICATION = 'notification',
  MARKETING = 'marketing',
  SYSTEM = 'system'
}

export interface TemplateRenderResult {
  subject: string;
  html: string;
  text: string;
}

export interface EmailTemplateService {
  getTemplate(templateId: string): Promise<EmailTemplate | null>;
  renderTemplate(templateId: string, data: EmailTemplateData): Promise<TemplateRenderResult>;
  createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate>;
  updateTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate>;
  deleteTemplate(templateId: string): Promise<void>;
  listTemplates(category?: EmailTemplateCategory): Promise<EmailTemplate[]>;
  previewTemplate(templateId: string, data: EmailTemplateData): Promise<TemplateRenderResult>;
}

export class EmailTemplateManager implements EmailTemplateService {
  private templates: Map<string, EmailTemplate> = new Map();
  private compiledTemplates: Map<string, {
    subject: HandlebarsTemplateDelegate;
    html: HandlebarsTemplateDelegate;
    text: HandlebarsTemplateDelegate;
  }> = new Map();
  private templateDir: string;

  constructor(templateDir = './src/templates/email') {
    this.templateDir = templateDir;
    this.registerHelpers();
    this.loadDefaultTemplates();
  }

  /**
   * Register Handlebars helpers for email templates
   */
  private registerHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper('formatDate', (date: Date, format: string = 'MMMM DD, YYYY') => {
      if (!date) return '';
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: format.includes('h') ? '2-digit' : undefined,
        minute: format.includes('h') ? '2-digit' : undefined,
      }).format(new Date(date));
    });

    // Time from now helper
    Handlebars.registerHelper('fromNow', (date: Date) => {
      if (!date) return '';
      const now = new Date();
      const diffMs = new Date(date).getTime() - now.getTime();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      
      if (diffHours < 1) {
        const diffMinutes = Math.round(diffMs / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    });

    // URL helper
    Handlebars.registerHelper('url', (path: string) => {
      const baseUrl = config.FRONTEND_URL || 'http://localhost:3001';
      return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    });

    // Conditional helper
    Handlebars.registerHelper('ifEquals', function(arg1: any, arg2: any, options: any) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    });

    // Uppercase helper
    Handlebars.registerHelper('uppercase', (str: string) => {
      return str ? str.toUpperCase() : '';
    });

    // Truncate helper
    Handlebars.registerHelper('truncate', (str: string, length: number = 100) => {
      if (!str) return '';
      return str.length > length ? str.substring(0, length) + '...' : str;
    });
  }

  /**
   * Load default email templates
   */
  private async loadDefaultTemplates(): Promise<void> {
    const defaultTemplates: Partial<EmailTemplate>[] = [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to {{app.name}}!',
        category: EmailTemplateCategory.AUTHENTICATION,
        htmlContent: this.getWelcomeHtmlTemplate(),
        textContent: this.getWelcomeTextTemplate(),
        variables: ['user.name', 'user.email', 'app.name', 'app.url'],
        isActive: true
      },
      {
        id: 'email_verification',
        name: 'Email Verification',
        subject: 'Verify your email address for {{app.name}}',
        category: EmailTemplateCategory.VERIFICATION,
        htmlContent: this.getEmailVerificationHtmlTemplate(),
        textContent: this.getEmailVerificationTextTemplate(),
        variables: ['user.name', 'verification.url', 'verification.expiresInHours', 'app.name'],
        isActive: true
      },
      {
        id: 'password_reset',
        name: 'Password Reset',
        subject: 'Reset your {{app.name}} password',
        category: EmailTemplateCategory.SECURITY,
        htmlContent: this.getPasswordResetHtmlTemplate(),
        textContent: this.getPasswordResetTextTemplate(),
        variables: ['user.name', 'reset.url', 'reset.expiresInHours', 'app.name'],
        isActive: true
      },
      {
        id: 'login_notification',
        name: 'Login Notification',
        subject: 'New login to your {{app.name}} account',
        category: EmailTemplateCategory.SECURITY,
        htmlContent: this.getLoginNotificationHtmlTemplate(),
        textContent: this.getLoginNotificationTextTemplate(),
        variables: ['user.name', 'login.ip', 'login.location', 'login.device', 'login.timestamp'],
        isActive: true
      },
      {
        id: 'two_factor_code',
        name: 'Two-Factor Authentication Code',
        subject: 'Your {{app.name}} verification code',
        category: EmailTemplateCategory.SECURITY,
        htmlContent: this.getTwoFactorHtmlTemplate(),
        textContent: this.getTwoFactorTextTemplate(),
        variables: ['user.name', 'twoFactor.code', 'twoFactor.expiresInMinutes', 'app.name'],
        isActive: true
      }
    ];

    for (const templateData of defaultTemplates) {
      const template: EmailTemplate = {
        id: templateData.id!,
        name: templateData.name!,
        subject: templateData.subject!,
        htmlContent: templateData.htmlContent!,
        textContent: templateData.textContent!,
        variables: templateData.variables!,
        category: templateData.category!,
        isActive: templateData.isActive!,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      };

      this.templates.set(template.id, template);
      this.compileTemplate(template);
    }

    logger.info(`📧 Loaded ${defaultTemplates.length} default email templates`);
  }

  /**
   * Compile a template for faster rendering
   */
  private compileTemplate(template: EmailTemplate): void {
    try {
      const compiled = {
        subject: Handlebars.compile(template.subject),
        html: Handlebars.compile(template.htmlContent),
        text: Handlebars.compile(template.textContent)
      };

      this.compiledTemplates.set(template.id, compiled);
    } catch (error) {
      logger.error({ error, templateId: template.id }, 'Failed to compile email template');
      throw new Error(`Failed to compile template ${template.id}: ${error}`);
    }
  }

  /**
   * Get a template by ID
   */
  async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  /**
   * Render a template with data
   */
  async renderTemplate(templateId: string, data: EmailTemplateData): Promise<TemplateRenderResult> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    if (!template.isActive) {
      throw new Error(`Template is inactive: ${templateId}`);
    }

    const compiled = this.compiledTemplates.get(templateId);
    if (!compiled) {
      throw new Error(`Template not compiled: ${templateId}`);
    }

    try {
      // Prepare template data with defaults
      const templateData = {
        app: {
          name: 'Zoptal',
          url: config.FRONTEND_URL || 'http://localhost:3001',
          supportEmail: config.SENDGRID_FROM_EMAIL || 'support@zoptal.com',
          logoUrl: `${config.FRONTEND_URL}/logo.png`,
          ...data.app
        },
        ...data
      };

      const result: TemplateRenderResult = {
        subject: compiled.subject(templateData),
        html: compiled.html(templateData),
        text: compiled.text(templateData)
      };

      logger.debug({ templateId, dataKeys: Object.keys(data) }, 'Email template rendered successfully');

      return result;
    } catch (error) {
      logger.error({ error, templateId }, 'Failed to render email template');
      throw new Error(`Failed to render template ${templateId}: ${error}`);
    }
  }

  /**
   * Create a new template
   */
  async createTemplate(templateData: Partial<EmailTemplate>): Promise<EmailTemplate> {
    if (!templateData.id || !templateData.name || !templateData.subject || !templateData.htmlContent) {
      throw new Error('Missing required template fields: id, name, subject, htmlContent');
    }

    if (this.templates.has(templateData.id)) {
      throw new Error(`Template already exists: ${templateData.id}`);
    }

    const template: EmailTemplate = {
      id: templateData.id,
      name: templateData.name,
      subject: templateData.subject,
      htmlContent: templateData.htmlContent,
      textContent: templateData.textContent || this.generateTextFromHtml(templateData.htmlContent),
      variables: templateData.variables || this.extractVariables(templateData.subject + templateData.htmlContent),
      category: templateData.category || EmailTemplateCategory.SYSTEM,
      isActive: templateData.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };

    this.templates.set(template.id, template);
    this.compileTemplate(template);

    logger.info({ templateId: template.id }, 'Email template created');

    return template;
  }

  /**
   * Update an existing template
   */
  async updateTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const existing = this.templates.get(templateId);
    if (!existing) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const updated: EmailTemplate = {
      ...existing,
      ...updates,
      id: existing.id, // Prevent ID changes
      updatedAt: new Date(),
      version: existing.version + 1
    };

    // Re-extract variables if content changed
    if (updates.subject || updates.htmlContent) {
      updated.variables = this.extractVariables(updated.subject + updated.htmlContent);
    }

    // Generate text content if HTML changed but text wasn't provided
    if (updates.htmlContent && !updates.textContent) {
      updated.textContent = this.generateTextFromHtml(updated.htmlContent);
    }

    this.templates.set(templateId, updated);
    this.compileTemplate(updated);

    logger.info({ templateId }, 'Email template updated');

    return updated;
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    if (!this.templates.has(templateId)) {
      throw new Error(`Template not found: ${templateId}`);
    }

    this.templates.delete(templateId);
    this.compiledTemplates.delete(templateId);

    logger.info({ templateId }, 'Email template deleted');
  }

  /**
   * List all templates, optionally filtered by category
   */
  async listTemplates(category?: EmailTemplateCategory): Promise<EmailTemplate[]> {
    const templates = Array.from(this.templates.values());
    
    if (category) {
      return templates.filter(template => template.category === category);
    }
    
    return templates;
  }

  /**
   * Preview a template with sample data
   */
  async previewTemplate(templateId: string, data: EmailTemplateData): Promise<TemplateRenderResult> {
    const sampleData: EmailTemplateData = {
      user: {
        id: 'user_123',
        email: 'john.doe@example.com',
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe'
      },
      app: {
        name: 'Zoptal',
        url: 'https://zoptal.com',
        supportEmail: 'support@zoptal.com',
        logoUrl: 'https://zoptal.com/logo.png'
      },
      verification: {
        token: 'sample_verification_token',
        url: 'https://zoptal.com/verify-email?token=sample_verification_token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        expiresInHours: 24
      },
      reset: {
        token: 'sample_reset_token',
        url: 'https://zoptal.com/reset-password?token=sample_reset_token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        expiresInHours: 1
      },
      twoFactor: {
        code: '123456',
        expiresInMinutes: 10
      },
      login: {
        ip: '192.168.1.1',
        location: 'San Francisco, CA',
        device: 'Chrome on Windows',
        timestamp: new Date()
      },
      security: {
        action: 'Password Changed',
        ip: '192.168.1.1',
        timestamp: new Date()
      },
      ...data
    };

    return this.renderTemplate(templateId, sampleData);
  }

  /**
   * Extract variables from template content
   */
  private extractVariables(content: string): string[] {
    const variables = new Set<string>();
    const regex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const variable = match[1].trim();
      // Skip helpers and conditionals
      if (!variable.startsWith('#') && !variable.startsWith('/') && !variable.includes(' ')) {
        variables.add(variable);
      }
    }

    return Array.from(variables);
  }

  /**
   * Generate text content from HTML (basic implementation)
   */
  private generateTextFromHtml(html: string): string {
    // Basic HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Default template content methods
  private getWelcomeHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome to {{app.name}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 150px; height: auto; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        {{#if app.logoUrl}}
        <img src="{{app.logoUrl}}" alt="{{app.name}}" class="logo">
        {{/if}}
        <h1>Welcome to {{app.name}}!</h1>
    </div>
    
    <div class="content">
        <p>Hi {{user.name}},</p>
        
        <p>Welcome to {{app.name}}! We're excited to have you on board.</p>
        
        <p>Your account has been successfully created with the email address: <strong>{{user.email}}</strong></p>
        
        <p>You can now access all the features and start exploring our platform.</p>
        
        <p style="text-align: center;">
            <a href="{{url '/dashboard'}}" class="button">Get Started</a>
        </p>
        
        <p>If you have any questions or need assistance, feel free to reach out to our support team at {{app.supportEmail}}.</p>
        
        <p>Best regards,<br>The {{app.name}} Team</p>
    </div>
    
    <div class="footer">
        <p>© {{app.name}}. All rights reserved.</p>
        <p><a href="{{app.url}}">Visit our website</a> | <a href="{{url '/unsubscribe'}}">Unsubscribe</a></p>
    </div>
</body>
</html>`;
  }

  private getWelcomeTextTemplate(): string {
    return `
Welcome to {{app.name}}!

Hi {{user.name}},

Welcome to {{app.name}}! We're excited to have you on board.

Your account has been successfully created with the email address: {{user.email}}

You can now access all the features and start exploring our platform.

Get started: {{url '/dashboard'}}

If you have any questions or need assistance, feel free to reach out to our support team at {{app.supportEmail}}.

Best regards,
The {{app.name}} Team

© {{app.name}}. All rights reserved.
Visit our website: {{app.url}}
Unsubscribe: {{url '/unsubscribe'}}`;
  }

  private getEmailVerificationHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Verify your email address</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
        .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Verify your email address</h1>
    </div>
    
    <div class="content">
        <p>Hi {{user.name}},</p>
        
        <p>Thank you for signing up for {{app.name}}! To complete your registration, please verify your email address by clicking the button below:</p>
        
        <p style="text-align: center;">
            <a href="{{verification.url}}" class="button">Verify Email Address</a>
        </p>
        
        <div class="warning">
            <strong>Important:</strong> This verification link will expire in {{verification.expiresInHours}} hours ({{formatDate verification.expiresAt}}).
        </div>
        
        <p>If you didn't create an account with {{app.name}}, you can safely ignore this email.</p>
        
        <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
        <p style="word-break: break-all; font-size: 14px; color: #666;">{{verification.url}}</p>
        
        <p>Best regards,<br>The {{app.name}} Team</p>
    </div>
    
    <div class="footer">
        <p>© {{app.name}}. All rights reserved.</p>
    </div>
</body>
</html>`;
  }

  private getEmailVerificationTextTemplate(): string {
    return `
Verify your email address

Hi {{user.name}},

Thank you for signing up for {{app.name}}! To complete your registration, please verify your email address by visiting the following link:

{{verification.url}}

IMPORTANT: This verification link will expire in {{verification.expiresInHours}} hours ({{formatDate verification.expiresAt}}).

If you didn't create an account with {{app.name}}, you can safely ignore this email.

Best regards,
The {{app.name}} Team

© {{app.name}}. All rights reserved.`;
  }

  private getPasswordResetHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset your password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reset your password</h1>
    </div>
    
    <div class="content">
        <p>Hi {{user.name}},</p>
        
        <p>We received a request to reset the password for your {{app.name}} account. Click the button below to reset your password:</p>
        
        <p style="text-align: center;">
            <a href="{{reset.url}}" class="button">Reset Password</a>
        </p>
        
        <div class="warning">
            <strong>Security Notice:</strong> This password reset link will expire in {{reset.expiresInHours}} hour{{#ifEquals reset.expiresInHours 1}}{{else}}s{{/ifEquals}} ({{formatDate reset.expiresAt}}).
        </div>
        
        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        
        <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
        <p style="word-break: break-all; font-size: 14px; color: #666;">{{reset.url}}</p>
        
        <p>Best regards,<br>The {{app.name}} Team</p>
    </div>
    
    <div class="footer">
        <p>© {{app.name}}. All rights reserved.</p>
    </div>
</body>
</html>`;
  }

  private getPasswordResetTextTemplate(): string {
    return `
Reset your password

Hi {{user.name}},

We received a request to reset the password for your {{app.name}} account. Visit the following link to reset your password:

{{reset.url}}

SECURITY NOTICE: This password reset link will expire in {{reset.expiresInHours}} hour{{#ifEquals reset.expiresInHours 1}}{{else}}s{{/ifEquals}} ({{formatDate reset.expiresAt}}).

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

Best regards,
The {{app.name}} Team

© {{app.name}}. All rights reserved.`;
  }

  private getLoginNotificationHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New login to your account</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
        .info-box { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>New login to your account</h1>
    </div>
    
    <div class="content">
        <p>Hi {{user.name}},</p>
        
        <p>We detected a new login to your {{app.name}} account. Here are the details:</p>
        
        <div class="info-box">
            <strong>Login Details:</strong><br>
            <strong>Time:</strong> {{formatDate login.timestamp}}<br>
            <strong>IP Address:</strong> {{login.ip}}<br>
            {{#if login.location}}<strong>Location:</strong> {{login.location}}<br>{{/if}}
            {{#if login.device}}<strong>Device:</strong> {{login.device}}<br>{{/if}}
        </div>
        
        <p>If this was you, you can safely ignore this email.</p>
        
        <p><strong>If this wasn't you:</strong> Your account may be compromised. Please change your password immediately and enable two-factor authentication for additional security.</p>
        
        <p style="text-align: center;">
            <a href="{{url '/security'}}" class="button">Review Account Security</a>
        </p>
        
        <p>If you need assistance, contact our support team at {{app.supportEmail}}.</p>
        
        <p>Best regards,<br>The {{app.name}} Security Team</p>
    </div>
    
    <div class="footer">
        <p>© {{app.name}}. All rights reserved.</p>
    </div>
</body>
</html>`;
  }

  private getLoginNotificationTextTemplate(): string {
    return `
New login to your account

Hi {{user.name}},

We detected a new login to your {{app.name}} account. Here are the details:

Login Details:
Time: {{formatDate login.timestamp}}
IP Address: {{login.ip}}
{{#if login.location}}Location: {{login.location}}{{/if}}
{{#if login.device}}Device: {{login.device}}{{/if}}

If this was you, you can safely ignore this email.

If this wasn't you: Your account may be compromised. Please change your password immediately and enable two-factor authentication for additional security.

Review your account security: {{url '/security'}}

If you need assistance, contact our support team at {{app.supportEmail}}.

Best regards,
The {{app.name}} Security Team

© {{app.name}}. All rights reserved.`;
  }

  private getTwoFactorHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Your verification code</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
        .code-box { background: #ffffff; border: 2px solid #007bff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .code { font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #007bff; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Your verification code</h1>
    </div>
    
    <div class="content">
        <p>Hi {{user.name}},</p>
        
        <p>Here's your verification code for {{app.name}}:</p>
        
        <div class="code-box">
            <div class="code">{{twoFactor.code}}</div>
        </div>
        
        <div class="warning">
            <strong>Important:</strong> This code will expire in {{twoFactor.expiresInMinutes}} minutes. Do not share this code with anyone.
        </div>
        
        <p>Enter this code in the verification form to complete your login.</p>
        
        <p>If you didn't request this code, please ignore this email and check your account security.</p>
        
        <p>Best regards,<br>The {{app.name}} Team</p>
    </div>
    
    <div class="footer">
        <p>© {{app.name}}. All rights reserved.</p>
    </div>
</body>
</html>`;
  }

  private getTwoFactorTextTemplate(): string {
    return `
Your verification code

Hi {{user.name}},

Here's your verification code for {{app.name}}:

{{twoFactor.code}}

IMPORTANT: This code will expire in {{twoFactor.expiresInMinutes}} minutes. Do not share this code with anyone.

Enter this code in the verification form to complete your login.

If you didn't request this code, please ignore this email and check your account security.

Best regards,
The {{app.name}} Team

© {{app.name}}. All rights reserved.`;
  }
}

// Create default instance
export const emailTemplateService = new EmailTemplateManager();

// Export factory function
export function createEmailTemplateService(templateDir?: string): EmailTemplateService {
  return new EmailTemplateManager(templateDir);
}