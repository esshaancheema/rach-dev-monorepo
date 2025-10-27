import { EmailProvider, EmailDeliveryResult, EmailRecipient, EmailTemplate } from './types';

export const emailProviders: EmailProvider[] = [
  {
    name: 'sendgrid',
    config: {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: 'hello@zoptal.com',
      fromName: 'Zoptal Team',
      replyTo: 'hello@zoptal.com'
    },
    isActive: true,
    priority: 1,
    limits: {
      daily: 10000,
      hourly: 1000,
      monthly: 300000
    }
  },
  {
    name: 'resend',
    config: {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: 'hello@zoptal.com',
      fromName: 'Zoptal Team',
      replyTo: 'hello@zoptal.com'
    },
    isActive: true,
    priority: 2,
    limits: {
      daily: 5000,
      hourly: 500,
      monthly: 150000
    }
  },
  {
    name: 'ses',
    config: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      fromEmail: 'hello@zoptal.com',
      fromName: 'Zoptal Team'
    },
    isActive: false,
    priority: 3,
    limits: {
      daily: 50000,
      hourly: 2000,
      monthly: 1500000
    }
  }
];

export class EmailService {
  private providers: EmailProvider[];
  
  constructor() {
    this.providers = emailProviders.filter(provider => provider.isActive)
      .sort((a, b) => a.priority - b.priority);
  }

  async sendEmail(
    recipient: EmailRecipient,
    template: EmailTemplate,
    variables: Record<string, any> = {}
  ): Promise<EmailDeliveryResult> {
    const startTime = Date.now();
    
    // Get the primary provider
    const provider = this.providers[0];
    
    if (!provider) {
      return {
        success: false,
        error: 'No active email providers configured',
        provider: 'none',
        timestamp: new Date().toISOString(),
        deliveryTime: Date.now() - startTime
      };
    }

    try {
      // Render the template with variables
      const renderedTemplate = this.renderTemplate(template, variables);
      
      // Send email based on provider
      const result = await this.sendWithProvider(provider, recipient, renderedTemplate);
      
      return {
        ...result,
        deliveryTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Email delivery failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: provider.name,
        timestamp: new Date().toISOString(),
        deliveryTime: Date.now() - startTime
      };
    }
  }

  async sendBulkEmail(
    recipients: EmailRecipient[],
    template: EmailTemplate,
    baseVariables: Record<string, any> = {}
  ): Promise<EmailDeliveryResult[]> {
    const results: EmailDeliveryResult[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 100;
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(recipient => {
        const personalizedVariables = {
          ...baseVariables,
          firstName: recipient.firstName || 'there',
          lastName: recipient.lastName || '',
          email: recipient.email,
          company: recipient.company || '',
          ...recipient.customFields
        };
        
        return this.sendEmail(recipient, template, personalizedVariables);
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason?.message || 'Unknown error',
            provider: this.providers[0]?.name || 'unknown',
            timestamp: new Date().toISOString()
          });
        }
      });
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  private renderTemplate(template: EmailTemplate, variables: Record<string, any>): {
    subject: string;
    htmlContent: string;
    textContent: string;
  } {
    const renderText = (text: string, vars: Record<string, any>): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return vars[key] !== undefined ? String(vars[key]) : match;
      });
    };

    return {
      subject: renderText(template.subject, variables),
      htmlContent: renderText(template.htmlContent, variables),
      textContent: renderText(template.textContent, variables)
    };
  }

  private async sendWithProvider(
    provider: EmailProvider,
    recipient: EmailRecipient,
    renderedTemplate: { subject: string; htmlContent: string; textContent: string }
  ): Promise<EmailDeliveryResult> {
    const timestamp = new Date().toISOString();
    
    switch (provider.name) {
      case 'sendgrid':
        return this.sendWithSendGrid(provider, recipient, renderedTemplate, timestamp);
      
      case 'resend':
        return this.sendWithResend(provider, recipient, renderedTemplate, timestamp);
      
      case 'ses':
        return this.sendWithSES(provider, recipient, renderedTemplate, timestamp);
      
      default:
        throw new Error(`Unsupported provider: ${provider.name}`);
    }
  }

  private async sendWithSendGrid(
    provider: EmailProvider,
    recipient: EmailRecipient,
    template: { subject: string; htmlContent: string; textContent: string },
    timestamp: string
  ): Promise<EmailDeliveryResult> {
    // In a real implementation, you would use the SendGrid SDK
    console.info('Sending email via SendGrid:', {
      to: recipient.email,
      subject: template.subject,
      provider: 'sendgrid'
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Simulate success (in real implementation, handle actual API response)
    return {
      success: true,
      messageId: `sg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider: 'sendgrid',
      timestamp
    };
  }

  private async sendWithResend(
    provider: EmailProvider,
    recipient: EmailRecipient,
    template: { subject: string; htmlContent: string; textContent: string },
    timestamp: string
  ): Promise<EmailDeliveryResult> {
    // In a real implementation, you would use the Resend SDK
    console.info('Sending email via Resend:', {
      to: recipient.email,
      subject: template.subject,
      provider: 'resend'
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return {
      success: true,
      messageId: `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider: 'resend',
      timestamp
    };
  }

  private async sendWithSES(
    provider: EmailProvider,
    recipient: EmailRecipient,
    template: { subject: string; htmlContent: string; textContent: string },
    timestamp: string
  ): Promise<EmailDeliveryResult> {
    // In a real implementation, you would use the AWS SDK
    console.info('Sending email via AWS SES:', {
      to: recipient.email,
      subject: template.subject,
      provider: 'ses'
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      messageId: `ses_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider: 'ses',
      timestamp
    };
  }

  async trackEmailEvent(
    recipientId: string,
    eventType: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'complained',
    metadata: Record<string, any> = {}
  ): Promise<void> {
    // In a real implementation, you would save this to your database
    console.info('Email event tracked:', {
      recipientId,
      eventType,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  async getEmailAnalytics(
    startDate: string,
    endDate: string
  ): Promise<{
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  }> {
    // In a real implementation, you would query your database
    // This is mock data for demonstration
    return {
      sent: 5247,
      delivered: 5198,
      opened: 3456,
      clicked: 1289,
      bounced: 49,
      unsubscribed: 23
    };
  }

  validateEmailTemplate(template: EmailTemplate): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Check required fields
    if (!template.subject.trim()) {
      errors.push('Subject is required');
    }
    
    if (!template.htmlContent.trim()) {
      errors.push('HTML content is required');
    }
    
    if (!template.textContent.trim()) {
      errors.push('Text content is required');
    }
    
    // Check for required variables
    const requiredVars = template.variables.filter(v => v.required);
    for (const variable of requiredVars) {
      const pattern = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
      
      if (!pattern.test(template.htmlContent) && !pattern.test(template.textContent)) {
        errors.push(`Required variable {{${variable.name}}} not found in template content`);
      }
    }
    
    // Check for unsubscribe link (required for marketing emails)
    if (template.type !== 'transactional') {
      if (!template.htmlContent.includes('{{unsubscribeUrl}}') && 
          !template.textContent.includes('{{unsubscribeUrl}}')) {
        errors.push('Unsubscribe link is required for marketing emails');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();