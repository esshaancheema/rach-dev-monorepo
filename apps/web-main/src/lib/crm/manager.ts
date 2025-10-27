import { HubSpotIntegration } from './hubspot';
import { SalesforceIntegration } from './salesforce';
import { ContactFormData, NewsletterData, CRMIntegration } from './types';

export class CRMManager {
  private integrations: CRMIntegration[] = [];
  private primaryCRM: CRMIntegration | null = null;

  constructor() {
    this.initializeIntegrations();
  }

  private initializeIntegrations() {
    // Initialize HubSpot if API key is available
    if (process.env.HUBSPOT_API_KEY) {
      const hubspot = new HubSpotIntegration(process.env.HUBSPOT_API_KEY);
      this.integrations.push(hubspot);
      
      // Set as primary if no primary is set
      if (!this.primaryCRM) {
        this.primaryCRM = hubspot;
      }
    }

    // Initialize Salesforce if credentials are available
    if (process.env.SALESFORCE_CLIENT_ID && process.env.SALESFORCE_CLIENT_SECRET) {
      const salesforce = new SalesforceIntegration({
        clientId: process.env.SALESFORCE_CLIENT_ID,
        clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
        username: process.env.SALESFORCE_USERNAME || '',
        password: process.env.SALESFORCE_PASSWORD || '',
        securityToken: process.env.SALESFORCE_SECURITY_TOKEN || '',
        sandbox: process.env.SALESFORCE_SANDBOX === 'true',
      });
      
      this.integrations.push(salesforce);
      
      // Set as primary if configured as primary
      if (process.env.PRIMARY_CRM === 'salesforce') {
        this.primaryCRM = salesforce;
      }
    }

    if (this.integrations.length === 0) {
      console.warn('No CRM integrations configured. Lead capture will work but data won\'t be synced to CRM.');
    }
  }

  async processContactForm(data: ContactFormData): Promise<{
    success: boolean;
    contactId?: string;
    dealId?: string;
    taskId?: string;
    errors: string[];
  }> {
    const errors: string[] = [];
    let contactId: string | undefined;
    let dealId: string | undefined;
    let taskId: string | undefined;

    if (!this.primaryCRM) {
      return {
        success: false,
        errors: ['No CRM integration available'],
      };
    }

    try {
      // Create contact in primary CRM
      const contactResult = await this.primaryCRM.createContact(data);
      
      if (contactResult.success && contactResult.contactId) {
        contactId = contactResult.contactId;
        
        // Create deal if budget and service are specified
        if (data.budget && data.service) {
          const dealResult = await this.primaryCRM.createDeal(contactId, data);
          if (dealResult.success) {
            dealId = dealResult.dealId;
          } else if (dealResult.error) {
            errors.push(`Deal creation failed: ${dealResult.error}`);
          }
        }

        // Create follow-up task
        const taskResult = await this.primaryCRM.createTask(contactId, data);
        if (taskResult.success) {
          taskId = taskResult.taskId;
        } else if (taskResult.error) {
          errors.push(`Task creation failed: ${taskResult.error}`);
        }

        // Sync to other CRMs (if any)
        await this.syncToOtherCRMs(data, contactId);

      } else if (contactResult.error) {
        errors.push(`Contact creation failed: ${contactResult.error}`);
      }

      return {
        success: contactResult.success,
        contactId,
        dealId,
        taskId,
        errors,
      };

    } catch (error) {
      console.error('CRM processing error:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown CRM error'],
      };
    }
  }

  async processNewsletterSubscription(data: NewsletterData): Promise<{
    success: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    if (!this.primaryCRM) {
      return {
        success: false,
        errors: ['No CRM integration available'],
      };
    }

    try {
      const result = await this.primaryCRM.subscribeToNewsletter(data);
      
      if (result.success) {
        // Sync to other CRMs
        await this.syncNewsletterToOtherCRMs(data);
      } else if (result.error) {
        errors.push(`Newsletter subscription failed: ${result.error}`);
      }

      return {
        success: result.success,
        errors,
      };

    } catch (error) {
      console.error('Newsletter CRM processing error:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown CRM error'],
      };
    }
  }

  private async syncToOtherCRMs(data: ContactFormData, primaryContactId: string): Promise<void> {
    const otherCRMs = this.integrations.filter(crm => crm !== this.primaryCRM);
    
    const syncPromises = otherCRMs.map(async (crm) => {
      try {
        const result = await crm.createContact(data);
        if (!result.success) {
          console.warn(`Failed to sync contact to secondary CRM: ${result.error}`);
        }
      } catch (error) {
        console.warn('Secondary CRM sync error:', error);
      }
    });

    await Promise.allSettled(syncPromises);
  }

  private async syncNewsletterToOtherCRMs(data: NewsletterData): Promise<void> {
    const otherCRMs = this.integrations.filter(crm => crm !== this.primaryCRM);
    
    const syncPromises = otherCRMs.map(async (crm) => {
      try {
        const result = await crm.subscribeToNewsletter(data);
        if (!result.success) {
          console.warn(`Failed to sync newsletter subscription to secondary CRM: ${result.error}`);
        }
      } catch (error) {
        console.warn('Secondary CRM newsletter sync error:', error);
      }
    });

    await Promise.allSettled(syncPromises);
  }

  // Webhook processing
  async processWebhook(webhookData: any, source: 'hubspot' | 'salesforce'): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.info(`Processing ${source} webhook:`, webhookData);

      // Process different webhook events
      switch (webhookData.eventType || webhookData.type) {
        case 'contact.creation':
        case 'contact.updated':
          await this.handleContactWebhook(webhookData, source);
          break;
        case 'deal.creation':
        case 'deal.updated':
          await this.handleDealWebhook(webhookData, source);
          break;
        case 'task.creation':
        case 'task.updated':
          await this.handleTaskWebhook(webhookData, source);
          break;
        default:
          console.info(`Unhandled webhook event: ${webhookData.eventType || webhookData.type}`);
      }

      return { success: true };
    } catch (error) {
      console.error(`${source} webhook processing error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown webhook error',
      };
    }
  }

  private async handleContactWebhook(webhookData: any, source: string): Promise<void> {
    // Handle contact-related webhook events
    console.info(`Processing contact webhook from ${source}:`, webhookData);
    
    // You can implement custom logic here, such as:
    // - Sending internal notifications
    // - Updating internal databases
    // - Triggering marketing automation
    // - Syncing to other systems
  }

  private async handleDealWebhook(webhookData: any, source: string): Promise<void> {
    // Handle deal-related webhook events
    console.info(`Processing deal webhook from ${source}:`, webhookData);
    
    // You can implement custom logic here, such as:
    // - Notifying the sales team
    // - Updating project management tools
    // - Triggering invoicing processes
  }

  private async handleTaskWebhook(webhookData: any, source: string): Promise<void> {
    // Handle task-related webhook events
    console.info(`Processing task webhook from ${source}:`, webhookData);
    
    // You can implement custom logic here, such as:
    // - Sending task notifications
    // - Updating team collaboration tools
    // - Creating calendar events
  }

  // Health check
  async healthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    integrations: Array<{
      name: string;
      status: 'healthy' | 'unhealthy';
      error?: string;
    }>;
  }> {
    const integrationResults = await Promise.allSettled(
      this.integrations.map(async (integration, index) => {
        try {
          // Perform a simple health check (e.g., fetch a single contact)
          // This is integration-specific and would need to be implemented
          return {
            name: `Integration ${index + 1}`,
            status: 'healthy' as const,
          };
        } catch (error) {
          return {
            name: `Integration ${index + 1}`,
            status: 'unhealthy' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    const integrations = integrationResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: `Integration ${index + 1}`,
          status: 'unhealthy' as const,
          error: 'Health check failed',
        };
      }
    });

    const healthyCount = integrations.filter(i => i.status === 'healthy').length;
    const overall = healthyCount === integrations.length ? 'healthy' :
                   healthyCount > 0 ? 'degraded' : 'unhealthy';

    return {
      overall,
      integrations,
    };
  }
}

// Singleton instance
let crmManager: CRMManager | null = null;

export function getCRMManager(): CRMManager {
  if (!crmManager) {
    crmManager = new CRMManager();
  }
  return crmManager;
}