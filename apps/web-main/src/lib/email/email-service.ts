// Comprehensive Email Service for Zoptal Platform
import { analytics } from '@/lib/analytics/tracker';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: EmailVariable[];
  category: EmailCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailVariable {
  key: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'url';
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  variables?: Record<string, any>;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface EmailMessage {
  id: string;
  templateId?: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  recipients: EmailRecipient[];
  sender: {
    email: string;
    name?: string;
  };
  replyTo?: string;
  attachments?: EmailAttachment[];
  tags?: string[];
  metadata?: Record<string, any>;
  scheduledAt?: string;
  status: EmailStatus;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bouncedAt?: string;
  unsubscribedAt?: string;
}

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded
  contentType: string;
  size: number;
}

export interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  audienceSegments: string[];
  sender: {
    email: string;
    name?: string;
  };
  subject: string;
  scheduledAt?: string;
  status: CampaignStatus;
  statistics: CampaignStatistics;
  settings: CampaignSettings;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStatistics {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  complained: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

export interface CampaignSettings {
  trackOpens: boolean;
  trackClicks: boolean;
  unsubscribeLink: boolean;
  suppressDuplicates: boolean;
  timezone: string;
  sendingWindow?: {
    startTime: string;
    endTime: string;
    days: string[];
  };
}

export interface EmailAudience {
  id: string;
  name: string;
  description: string;
  filters: AudienceFilter[];
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface EmailAutomation {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  conditions?: AutomationCondition[];
  isActive: boolean;
  statistics: AutomationStatistics;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationTrigger {
  type: 'user_signup' | 'purchase' | 'abandoned_cart' | 'form_submit' | 'date_based' | 'behavior' | 'api_event';
  config: Record<string, any>;
}

export interface AutomationAction {
  type: 'send_email' | 'wait' | 'update_contact' | 'add_tag' | 'remove_tag' | 'webhook';
  config: Record<string, any>;
  delay?: number; // in minutes
}

export interface AutomationCondition {
  field: string;
  operator: string;
  value: any;
}

export interface AutomationStatistics {
  triggered: number;
  completed: number;
  emailsSent: number;
  openRate: number;
  clickRate: number;
}

export type EmailStatus = 'draft' | 'queued' | 'sending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'unsubscribed';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'completed' | 'cancelled';
export type EmailCategory = 'transactional' | 'marketing' | 'notification' | 'welcome' | 'newsletter' | 'system';

export class EmailService {
  private static instance: EmailService;
  private templates: Map<string, EmailTemplate> = new Map();
  private campaigns: Map<string, EmailCampaign> = new Map();
  private automations: Map<string, EmailAutomation> = new Map();
  private audiences: Map<string, EmailAudience> = new Map();
  private messages: EmailMessage[] = [];
  private readonly API_ENDPOINT = '/api/email';

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Send a single email
   */
  async sendEmail(message: Omit<EmailMessage, 'id' | 'status' | 'createdAt'>): Promise<EmailMessage> {
    try {
      const emailMessage: EmailMessage = {
        ...message,
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'queued',
        createdAt: new Date().toISOString()
      };

      // If using template, merge template content
      if (message.templateId) {
        const template = this.templates.get(message.templateId);
        if (template) {
          emailMessage.htmlContent = this.processTemplate(template.htmlContent, message.recipients[0]?.variables || {});
          emailMessage.textContent = this.processTemplate(template.textContent, message.recipients[0]?.variables || {});
          emailMessage.subject = this.processTemplate(template.subject, message.recipients[0]?.variables || {});
        }
      }

      // Validate email
      this.validateEmail(emailMessage);

      // Queue for delivery
      await this.queueEmail(emailMessage);

      this.messages.push(emailMessage);

      analytics.track({
        name: 'email_sent',
        category: 'email',
        properties: {
          email_id: emailMessage.id,
          template_id: emailMessage.templateId,
          recipient_count: emailMessage.recipients.length,
          has_attachments: (emailMessage.attachments?.length || 0) > 0
        }
      });

      return emailMessage;
    } catch (error) {
      console.error('Failed to send email:', error);
      
      analytics.track({
        name: 'email_send_failed',
        category: 'email',
        properties: {
          error: error.message,
          template_id: message.templateId
        }
      });

      throw error;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(messages: Array<Omit<EmailMessage, 'id' | 'status' | 'createdAt'>>): Promise<EmailMessage[]> {
    try {
      const results: EmailMessage[] = [];

      for (const message of messages) {
        const result = await this.sendEmail(message);
        results.push(result);
      }

      analytics.track({
        name: 'bulk_emails_sent',
        category: 'email',
        properties: {
          email_count: results.length,
          total_recipients: results.reduce((sum, email) => sum + email.recipients.length, 0)
        }
      });

      return results;
    } catch (error) {
      console.error('Failed to send bulk emails:', error);
      throw error;
    }
  }

  /**
   * Create email template
   */
  async createTemplate(templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    try {
      const template: EmailTemplate = {
        ...templateData,
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.validateTemplate(template);
      this.templates.set(template.id, template);

      // In production, persist to database
      await this.persistTemplate(template);

      analytics.track({
        name: 'email_template_created',
        category: 'email',
        properties: {
          template_id: template.id,
          template_name: template.name,
          category: template.category
        }
      });

      return template;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }

  /**
   * Update email template
   */
  async updateTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    try {
      const existingTemplate = this.templates.get(templateId);
      if (!existingTemplate) {
        throw new Error(`Template ${templateId} not found`);
      }

      const updatedTemplate: EmailTemplate = {
        ...existingTemplate,
        ...updates,
        id: templateId,
        updatedAt: new Date().toISOString()
      };

      this.validateTemplate(updatedTemplate);
      this.templates.set(templateId, updatedTemplate);

      await this.persistTemplate(updatedTemplate);

      analytics.track({
        name: 'email_template_updated',
        category: 'email',
        properties: {
          template_id: templateId,
          template_name: updatedTemplate.name
        }
      });

      return updatedTemplate;
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }

  /**
   * Create email campaign
   */
  async createCampaign(campaignData: Omit<EmailCampaign, 'id' | 'statistics' | 'createdAt' | 'updatedAt'>): Promise<EmailCampaign> {
    try {
      const campaign: EmailCampaign = {
        ...campaignData,
        id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        statistics: {
          totalSent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0,
          complained: 0,
          deliveryRate: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0,
          unsubscribeRate: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.validateCampaign(campaign);
      this.campaigns.set(campaign.id, campaign);

      await this.persistCampaign(campaign);

      analytics.track({
        name: 'email_campaign_created',
        category: 'email',
        properties: {
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          template_id: campaign.templateId,
          audience_segments: campaign.audienceSegments.length
        }
      });

      return campaign;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  }

  /**
   * Send campaign
   */
  async sendCampaign(campaignId: string): Promise<void> {
    try {
      const campaign = this.campaigns.get(campaignId);
      if (!campaign) {
        throw new Error(`Campaign ${campaignId} not found`);
      }

      if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
        throw new Error(`Campaign cannot be sent from ${campaign.status} status`);
      }

      // Update campaign status
      campaign.status = 'sending';
      campaign.updatedAt = new Date().toISOString();

      // Get recipients from audience segments
      const recipients = await this.getAudienceRecipients(campaign.audienceSegments);

      // Send emails to all recipients
      const template = this.templates.get(campaign.templateId);
      if (!template) {
        throw new Error(`Template ${campaign.templateId} not found`);
      }

      const emails = recipients.map(recipient => ({
        templateId: campaign.templateId,
        subject: campaign.subject,
        recipients: [recipient],
        sender: campaign.sender,
        tags: [`campaign:${campaignId}`],
        metadata: {
          campaignId: campaignId,
          campaignName: campaign.name
        }
      }));

      await this.sendBulkEmails(emails);

      // Update campaign statistics
      campaign.statistics.totalSent = recipients.length;
      campaign.status = 'sent';
      campaign.updatedAt = new Date().toISOString();

      this.campaigns.set(campaignId, campaign);

      analytics.track({
        name: 'email_campaign_sent',
        category: 'email',
        properties: {
          campaign_id: campaignId,
          campaign_name: campaign.name,
          recipient_count: recipients.length
        }
      });

    } catch (error) {
      console.error('Failed to send campaign:', error);
      
      // Update campaign status to failed
      const campaign = this.campaigns.get(campaignId);
      if (campaign) {
        campaign.status = 'cancelled';
        campaign.updatedAt = new Date().toISOString();
        this.campaigns.set(campaignId, campaign);
      }

      throw error;
    }
  }

  /**
   * Create email automation
   */
  async createAutomation(automationData: Omit<EmailAutomation, 'id' | 'statistics' | 'createdAt' | 'updatedAt'>): Promise<EmailAutomation> {
    try {
      const automation: EmailAutomation = {
        ...automationData,
        id: `automation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        statistics: {
          triggered: 0,
          completed: 0,
          emailsSent: 0,
          openRate: 0,
          clickRate: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.validateAutomation(automation);
      this.automations.set(automation.id, automation);

      await this.persistAutomation(automation);

      analytics.track({
        name: 'email_automation_created',
        category: 'email',
        properties: {
          automation_id: automation.id,
          automation_name: automation.name,
          trigger_type: automation.trigger.type,
          action_count: automation.actions.length
        }
      });

      return automation;
    } catch (error) {
      console.error('Failed to create automation:', error);
      throw error;
    }
  }

  /**
   * Trigger automation
   */
  async triggerAutomation(automationId: string, context: Record<string, any>): Promise<void> {
    try {
      const automation = this.automations.get(automationId);
      if (!automation || !automation.isActive) {
        return;
      }

      // Check conditions
      if (automation.conditions && !this.evaluateConditions(automation.conditions, context)) {
        return;
      }

      // Execute actions
      for (const action of automation.actions) {
        if (action.delay) {
          // In production, this would schedule the action
          await this.scheduleAction(action, context, action.delay);
        } else {
          await this.executeAction(action, context);
        }
      }

      // Update statistics
      automation.statistics.triggered++;
      automation.updatedAt = new Date().toISOString();
      this.automations.set(automationId, automation);

      analytics.track({
        name: 'email_automation_triggered',
        category: 'email',
        properties: {
          automation_id: automationId,
          automation_name: automation.name,
          trigger_context: Object.keys(context)
        }
      });

    } catch (error) {
      console.error('Failed to trigger automation:', error);
      throw error;
    }
  }

  /**
   * Create audience segment
   */
  async createAudience(audienceData: Omit<EmailAudience, 'id' | 'size' | 'createdAt' | 'updatedAt'>): Promise<EmailAudience> {
    try {
      const audience: EmailAudience = {
        ...audienceData,
        id: `audience_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        size: await this.calculateAudienceSize(audienceData.filters),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.audiences.set(audience.id, audience);

      await this.persistAudience(audience);

      analytics.track({
        name: 'email_audience_created',
        category: 'email',
        properties: {
          audience_id: audience.id,
          audience_name: audience.name,
          audience_size: audience.size,
          filter_count: audience.filters.length
        }
      });

      return audience;
    } catch (error) {
      console.error('Failed to create audience:', error);
      throw error;
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStatistics(dateRange?: { start: string; end: string }): Promise<{
    totalSent: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    unsubscribeRate: number;
    topTemplates: Array<{ templateId: string; name: string; sent: number; openRate: number; }>;
    recentActivity: Array<{ timestamp: string; event: string; count: number; }>;
  }> {
    try {
      let messages = this.messages;

      if (dateRange) {
        messages = messages.filter(msg => 
          msg.createdAt >= dateRange.start && msg.createdAt <= dateRange.end
        );
      }

      const totalSent = messages.filter(msg => msg.status === 'sent' || msg.status === 'delivered').length;
      const delivered = messages.filter(msg => msg.status === 'delivered').length;
      const opened = messages.filter(msg => msg.openedAt).length;
      const clicked = messages.filter(msg => msg.clickedAt).length;
      const bounced = messages.filter(msg => msg.status === 'bounced').length;
      const unsubscribed = messages.filter(msg => msg.unsubscribedAt).length;

      const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
      const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
      const clickRate = opened > 0 ? (clicked / opened) * 100 : 0;
      const bounceRate = totalSent > 0 ? (bounced / totalSent) * 100 : 0;
      const unsubscribeRate = delivered > 0 ? (unsubscribed / delivered) * 100 : 0;

      // Calculate top templates
      const templateStats = new Map<string, { sent: number; opened: number; }>();
      messages.forEach(msg => {
        if (msg.templateId) {
          const stats = templateStats.get(msg.templateId) || { sent: 0, opened: 0 };
          stats.sent++;
          if (msg.openedAt) stats.opened++;
          templateStats.set(msg.templateId, stats);
        }
      });

      const topTemplates = Array.from(templateStats.entries()).map(([templateId, stats]) => {
        const template = this.templates.get(templateId);
        return {
          templateId,
          name: template?.name || 'Unknown',
          sent: stats.sent,
          openRate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0
        };
      }).sort((a, b) => b.sent - a.sent).slice(0, 5);

      return {
        totalSent,
        deliveryRate,
        openRate,
        clickRate,
        bounceRate,
        unsubscribeRate,
        topTemplates,
        recentActivity: [] // Would calculate from recent message events
      };
    } catch (error) {
      console.error('Failed to get email statistics:', error);
      throw error;
    }
  }

  /**
   * Get all templates
   */
  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get all campaigns
   */
  getAllCampaigns(): EmailCampaign[] {
    return Array.from(this.campaigns.values());
  }

  /**
   * Get campaign by ID
   */
  getCampaign(campaignId: string): EmailCampaign | undefined {
    return this.campaigns.get(campaignId);
  }

  /**
   * Get all automations
   */
  getAllAutomations(): EmailAutomation[] {
    return Array.from(this.automations.values());
  }

  /**
   * Get automation by ID
   */
  getAutomation(automationId: string): EmailAutomation | undefined {
    return this.automations.get(automationId);
  }

  /**
   * Get all audiences
   */
  getAllAudiences(): EmailAudience[] {
    return Array.from(this.audiences.values());
  }

  /**
   * Get audience by ID
   */
  getAudience(audienceId: string): EmailAudience | undefined {
    return this.audiences.get(audienceId);
  }

  /**
   * Private helper methods
   */
  private processTemplate(content: string, variables: Record<string, any>): string {
    let processed = content;

    // Replace variables with format {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    });

    // Remove unprocessed variables
    processed = processed.replace(/{{[^}]*}}/g, '');

    return processed;
  }

  private validateEmail(email: EmailMessage): void {
    if (!email.subject || email.subject.trim().length === 0) {
      throw new Error('Email subject is required');
    }

    if (!email.htmlContent && !email.textContent) {
      throw new Error('Email must have either HTML or text content');
    }

    if (email.recipients.length === 0) {
      throw new Error('Email must have at least one recipient');
    }

    email.recipients.forEach(recipient => {
      if (!this.isValidEmail(recipient.email)) {
        throw new Error(`Invalid email address: ${recipient.email}`);
      }
    });
  }

  private validateTemplate(template: EmailTemplate): void {
    if (!template.name || template.name.trim().length === 0) {
      throw new Error('Template name is required');
    }

    if (!template.subject || template.subject.trim().length === 0) {
      throw new Error('Template subject is required');
    }

    if (!template.htmlContent && !template.textContent) {
      throw new Error('Template must have either HTML or text content');
    }
  }

  private validateCampaign(campaign: EmailCampaign): void {
    if (!campaign.name || campaign.name.trim().length === 0) {
      throw new Error('Campaign name is required');
    }

    if (!this.templates.has(campaign.templateId)) {
      throw new Error(`Template ${campaign.templateId} not found`);
    }

    if (campaign.audienceSegments.length === 0) {
      throw new Error('Campaign must have at least one audience segment');
    }
  }

  private validateAutomation(automation: EmailAutomation): void {
    if (!automation.name || automation.name.trim().length === 0) {
      throw new Error('Automation name is required');
    }

    if (automation.actions.length === 0) {
      throw new Error('Automation must have at least one action');
    }
  }

  private async queueEmail(email: EmailMessage): Promise<void> {
    // In production, this would queue the email for delivery
    console.info('Queuing email for delivery:', email.id);
    
    // Simulate async delivery
    setTimeout(() => {
      email.status = 'sent';
      email.sentAt = new Date().toISOString();
      
      // Simulate delivery after a delay
      setTimeout(() => {
        email.status = 'delivered';
        email.deliveredAt = new Date().toISOString();
      }, Math.random() * 5000);
    }, Math.random() * 2000);
  }

  private async getAudienceRecipients(audienceSegmentIds: string[]): Promise<EmailRecipient[]> {
    const recipients: EmailRecipient[] = [];

    for (const segmentId of audienceSegmentIds) {
      const audience = this.audiences.get(segmentId);
      if (audience) {
        // In production, this would query the database based on filters
        const mockRecipients = this.generateMockRecipients(audience.size);
        recipients.push(...mockRecipients);
      }
    }

    // Remove duplicates
    const uniqueRecipients = recipients.filter((recipient, index, self) => 
      index === self.findIndex(r => r.email === recipient.email)
    );

    return uniqueRecipients;
  }

  private generateMockRecipients(count: number): EmailRecipient[] {
    const recipients: EmailRecipient[] = [];
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      recipients.push({
        email: `user${i}@example.com`,
        name: `User ${i}`,
        variables: {
          firstName: `User${i}`,
          lastName: 'Doe',
          company: 'Example Corp'
        },
        tags: ['customer']
      });
    }

    return recipients;
  }

  private async calculateAudienceSize(filters: AudienceFilter[]): Promise<number> {
    // In production, this would calculate based on actual user data
    return Math.floor(Math.random() * 1000) + 100;
  }

  private evaluateConditions(conditions: AutomationCondition[], context: Record<string, any>): boolean {
    return conditions.every(condition => {
      const value = context[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'not_equals':
          return value !== condition.value;
        case 'greater_than':
          return value > condition.value;
        case 'less_than':
          return value < condition.value;
        default:
          return false;
      }
    });
  }

  private async executeAction(action: AutomationAction, context: Record<string, any>): Promise<void> {
    switch (action.type) {
      case 'send_email':
        await this.executeSendEmailAction(action, context);
        break;
      case 'update_contact':
        await this.executeUpdateContactAction(action, context);
        break;
      case 'add_tag':
        await this.executeAddTagAction(action, context);
        break;
      case 'webhook':
        await this.executeWebhookAction(action, context);
        break;
      default:
        console.info(`Unknown action type: ${action.type}`);
    }
  }

  private async executeSendEmailAction(action: AutomationAction, context: Record<string, any>): Promise<void> {
    const { templateId, recipientEmail, variables } = action.config;
    
    if (templateId && recipientEmail) {
      await this.sendEmail({
        templateId,
        subject: '', // Will be filled from template
        recipients: [{
          email: recipientEmail,
          variables: { ...variables, ...context }
        }],
        sender: {
          email: 'noreply@zoptal.com',
          name: 'Zoptal'
        }
      });
    }
  }

  private async executeUpdateContactAction(action: AutomationAction, context: Record<string, any>): Promise<void> {
    // In production, this would update contact in CRM/database
    console.info('Updating contact:', action.config, context);
  }

  private async executeAddTagAction(action: AutomationAction, context: Record<string, any>): Promise<void> {
    // In production, this would add tag to contact
    console.info('Adding tag:', action.config, context);
  }

  private async executeWebhookAction(action: AutomationAction, context: Record<string, any>): Promise<void> {
    const { url, method = 'POST', headers = {} } = action.config;
    
    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(context)
      });
    } catch (error) {
      console.error('Webhook action failed:', error);
    }
  }

  private async scheduleAction(action: AutomationAction, context: Record<string, any>, delayMinutes: number): Promise<void> {
    // In production, this would use a job queue system
    setTimeout(() => {
      this.executeAction(action, context);
    }, delayMinutes * 60 * 1000);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to Zoptal, {{firstName}}!',
        htmlContent: `
          <h1>Welcome to Zoptal!</h1>
          <p>Hi {{firstName}},</p>
          <p>Thank you for joining Zoptal. We're excited to help you transform your ideas into digital reality.</p>
          <p><a href="{{dashboardUrl}}">Get Started</a></p>
          <p>Best regards,<br>The Zoptal Team</p>
        `,
        textContent: `
          Welcome to Zoptal!
          
          Hi {{firstName}},
          
          Thank you for joining Zoptal. We're excited to help you transform your ideas into digital reality.
          
          Get Started: {{dashboardUrl}}
          
          Best regards,
          The Zoptal Team
        `,
        variables: [
          { key: 'firstName', name: 'First Name', type: 'string', required: true },
          { key: 'dashboardUrl', name: 'Dashboard URL', type: 'url', required: true, defaultValue: 'https://zoptal.com/dashboard' }
        ],
        category: 'welcome',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'project_update',
        name: 'Project Update',
        subject: 'Project Update: {{projectName}}',
        htmlContent: `
          <h1>Project Update</h1>
          <p>Hi {{clientName}},</p>
          <p>We have an update on your project: <strong>{{projectName}}</strong></p>
          <p>Status: {{projectStatus}}</p>
          <p>{{updateMessage}}</p>
          <p><a href="{{projectUrl}}">View Project Details</a></p>
          <p>Best regards,<br>Your Development Team</p>
        `,
        textContent: `
          Project Update
          
          Hi {{clientName}},
          
          We have an update on your project: {{projectName}}
          Status: {{projectStatus}}
          
          {{updateMessage}}
          
          View Project Details: {{projectUrl}}
          
          Best regards,
          Your Development Team
        `,
        variables: [
          { key: 'clientName', name: 'Client Name', type: 'string', required: true },
          { key: 'projectName', name: 'Project Name', type: 'string', required: true },
          { key: 'projectStatus', name: 'Project Status', type: 'string', required: true },
          { key: 'updateMessage', name: 'Update Message', type: 'string', required: true },
          { key: 'projectUrl', name: 'Project URL', type: 'url', required: true }
        ],
        category: 'notification',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'newsletter',
        name: 'Monthly Newsletter',
        subject: 'Zoptal Newsletter - {{monthYear}}',
        htmlContent: `
          <h1>Zoptal Newsletter</h1>
          <h2>{{monthYear}}</h2>
          <p>Hi {{firstName}},</p>
          
          <h3>This Month's Highlights</h3>
          <ul>
            <li>{{highlight1}}</li>
            <li>{{highlight2}}</li>
            <li>{{highlight3}}</li>
          </ul>
          
          <h3>Featured Case Study</h3>
          <p>{{caseStudyDescription}}</p>
          <p><a href="{{caseStudyUrl}}">Read More</a></p>
          
          <p>Best regards,<br>The Zoptal Team</p>
          
          <p><small><a href="{{unsubscribeUrl}}">Unsubscribe</a></small></p>
        `,
        textContent: `
          Zoptal Newsletter - {{monthYear}}
          
          Hi {{firstName}},
          
          This Month's Highlights:
          - {{highlight1}}
          - {{highlight2}}
          - {{highlight3}}
          
          Featured Case Study:
          {{caseStudyDescription}}
          Read More: {{caseStudyUrl}}
          
          Best regards,
          The Zoptal Team
          
          Unsubscribe: {{unsubscribeUrl}}
        `,
        variables: [
          { key: 'firstName', name: 'First Name', type: 'string', required: true },
          { key: 'monthYear', name: 'Month Year', type: 'string', required: true },
          { key: 'highlight1', name: 'Highlight 1', type: 'string', required: true },
          { key: 'highlight2', name: 'Highlight 2', type: 'string', required: true },
          { key: 'highlight3', name: 'Highlight 3', type: 'string', required: true },
          { key: 'caseStudyDescription', name: 'Case Study Description', type: 'string', required: true },
          { key: 'caseStudyUrl', name: 'Case Study URL', type: 'url', required: true },
          { key: 'unsubscribeUrl', name: 'Unsubscribe URL', type: 'url', required: true }
        ],
        category: 'newsletter',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private async persistTemplate(template: EmailTemplate): Promise<void> {
    // In production, persist to database
    console.info('Persisting template:', template.id);
  }

  private async persistCampaign(campaign: EmailCampaign): Promise<void> {
    // In production, persist to database
    console.info('Persisting campaign:', campaign.id);
  }

  private async persistAutomation(automation: EmailAutomation): Promise<void> {
    // In production, persist to database
    console.info('Persisting automation:', automation.id);
  }

  private async persistAudience(audience: EmailAudience): Promise<void> {
    // In production, persist to database
    console.info('Persisting audience:', audience.id);
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();