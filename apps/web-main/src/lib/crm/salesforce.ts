import { ContactFormData, NewsletterData, CRMIntegration } from './types';

interface SalesforceConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  securityToken: string;
  sandbox?: boolean;
}

export class SalesforceIntegration implements CRMIntegration {
  private config: SalesforceConfig;
  private accessToken: string | null = null;
  private instanceUrl: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: SalesforceConfig) {
    this.config = config;
  }

  private get loginUrl(): string {
    return this.config.sandbox 
      ? 'https://test.salesforce.com' 
      : 'https://login.salesforce.com';
  }

  private async authenticate(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return; // Token is still valid
    }

    try {
      const response = await fetch(`${this.loginUrl}/services/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          username: this.config.username,
          password: this.config.password + this.config.securityToken,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        this.accessToken = result.access_token;
        this.instanceUrl = result.instance_url;
        this.tokenExpiry = Date.now() + (2 * 60 * 60 * 1000); // 2 hours
      } else {
        throw new Error(`Salesforce authentication failed: ${result.error_description}`);
      }
    } catch (error) {
      console.error('Salesforce authentication error:', error);
      throw error;
    }
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PATCH', data?: any): Promise<any> {
    await this.authenticate();

    const response = await fetch(`${this.instanceUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${result[0]?.message || 'Unknown error'}`);
    }

    return result;
  }

  async createContact(data: ContactFormData): Promise<{ success: boolean; contactId?: string; error?: string }> {
    try {
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || 'Unknown';

      const contactData = {
        FirstName: firstName,
        LastName: lastName,
        Email: data.email,
        Phone: data.phone || '',
        Company: data.company || 'Unknown',
        Description: data.message,
        LeadSource: data.source || 'Website',
        // Custom fields
        Service_Interest__c: data.service || '',
        Budget_Range__c: data.budget || '',
        Project_Urgency__c: data.urgency || '',
        Location__c: data.location || '',
        Industry__c: data.industry || '',
        Lead_Score__c: data.score || 0,
      };

      const result = await this.makeRequest('/services/data/v58.0/sobjects/Contact', 'POST', contactData);

      if (result.success) {
        // Create opportunity if budget and service are specified
        if (data.budget && data.service) {
          await this.createOpportunity(result.id, data);
        }

        // Create task for follow-up
        await this.createTask(result.id, data);

        return { success: true, contactId: result.id };
      } else {
        throw new Error('Contact creation failed');
      }
    } catch (error) {
      console.error('Salesforce create contact error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async updateContact(contactId: string, data: ContactFormData): Promise<{ success: boolean; error?: string }> {
    try {
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || 'Unknown';

      const contactData = {
        FirstName: firstName,
        LastName: lastName,
        Email: data.email,
        Phone: data.phone || '',
        Company: data.company || '',
        Description: data.message,
        Service_Interest__c: data.service || '',
        Budget_Range__c: data.budget || '',
        Project_Urgency__c: data.urgency || '',
        Location__c: data.location || '',
        Industry__c: data.industry || '',
        Lead_Score__c: data.score || 0,
      };

      const result = await this.makeRequest(`/services/data/v58.0/sobjects/Contact/${contactId}`, 'PATCH', contactData);
      
      return { success: true };
    } catch (error) {
      console.error('Salesforce update contact error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async createDeal(contactId: string, data: ContactFormData): Promise<{ success: boolean; dealId?: string; error?: string }> {
    return this.createOpportunity(contactId, data);
  }

  private async createOpportunity(contactId: string, data: ContactFormData): Promise<{ success: boolean; dealId?: string; error?: string }> {
    try {
      const opportunityValue = this.estimateOpportunityValue(data.budget);
      const opportunityName = `${data.name} - ${data.service || 'General Inquiry'}`;
      const closeDate = this.getEstimatedCloseDate(data.urgency);

      const opportunityData = {
        Name: opportunityName,
        Amount: opportunityValue,
        CloseDate: closeDate,
        StageName: 'Prospecting',
        ContactId: contactId,
        LeadSource: data.source || 'Website',
        Type: this.getOpportunityType(data.service),
        Description: data.message,
        // Custom fields
        Service_Type__c: data.service || '',
        Budget_Range__c: data.budget || '',
        Project_Urgency__c: data.urgency || '',
      };

      const result = await this.makeRequest('/services/data/v58.0/sobjects/Opportunity', 'POST', opportunityData);

      if (result.success) {
        // Create opportunity contact role
        await this.createOpportunityContactRole(result.id, contactId);
        
        return { success: true, dealId: result.id };
      } else {
        throw new Error('Opportunity creation failed');
      }
    } catch (error) {
      console.error('Salesforce create opportunity error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async createOpportunityContactRole(opportunityId: string, contactId: string): Promise<void> {
    try {
      const roleData = {
        OpportunityId: opportunityId,
        ContactId: contactId,
        Role: 'Decision Maker',
        IsPrimary: true,
      };

      await this.makeRequest('/services/data/v58.0/sobjects/OpportunityContactRole', 'POST', roleData);
    } catch (error) {
      console.error('Failed to create opportunity contact role:', error);
    }
  }

  async createTask(contactId: string, data: ContactFormData): Promise<{ success: boolean; taskId?: string; error?: string }> {
    try {
      const taskData = {
        Subject: `Follow up with ${data.name}`,
        Description: `Follow up regarding: ${data.message}\n\nService Interest: ${data.service || 'Not specified'}\nBudget: ${data.budget || 'Not specified'}`,
        Status: 'Not Started',
        Priority: this.getTaskPriority(data),
        ActivityDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due tomorrow
        WhoId: contactId,
        Type: 'Call',
      };

      const result = await this.makeRequest('/services/data/v58.0/sobjects/Task', 'POST', taskData);

      if (result.success) {
        return { success: true, taskId: result.id };
      } else {
        throw new Error('Task creation failed');
      }
    } catch (error) {
      console.error('Salesforce create task error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async subscribeToNewsletter(data: NewsletterData): Promise<{ success: boolean; error?: string }> {
    try {
      // Create or update contact for newsletter subscription
      const nameParts = data.name?.split(' ') || ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || 'Newsletter Subscriber';

      const contactData = {
        FirstName: firstName,
        LastName: lastName,
        Email: data.email,
        LeadSource: data.source || 'Newsletter',
        Newsletter_Subscription__c: true,
        Subscription_Interests__c: data.interests?.join(', ') || 'general',
      };

      // Try to find existing contact first
      const existingContacts = await this.makeRequest(
        `/services/data/v58.0/query/?q=SELECT Id FROM Contact WHERE Email = '${data.email}' LIMIT 1`,
        'GET'
      );

      if (existingContacts.records.length > 0) {
        // Update existing contact
        const contactId = existingContacts.records[0].Id;
        await this.makeRequest(`/services/data/v58.0/sobjects/Contact/${contactId}`, 'PATCH', contactData);
      } else {
        // Create new contact
        await this.makeRequest('/services/data/v58.0/sobjects/Contact', 'POST', contactData);
      }

      return { success: true };
    } catch (error) {
      console.error('Salesforce newsletter subscription error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private estimateOpportunityValue(budget?: string): number {
    const budgetValues: Record<string, number> = {
      'under_10k': 7500,
      '10k_25k': 17500,
      '25k_50k': 37500,
      '50k_100k': 75000,
      '100k_plus': 150000,
    };

    return budgetValues[budget || ''] || 25000;
  }

  private getEstimatedCloseDate(urgency?: string): string {
    const now = new Date();
    let daysToAdd = 90; // Default 3 months

    switch (urgency) {
      case 'immediate':
        daysToAdd = 30;
        break;
      case 'within_month':
        daysToAdd = 45;
        break;
      case 'within_quarter':
        daysToAdd = 90;
        break;
      case 'exploring':
        daysToAdd = 180;
        break;
    }

    const closeDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return closeDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  private getOpportunityType(service?: string): string {
    const serviceTypes: Record<string, string> = {
      'web-development': 'Web Development',
      'mobile-development': 'Mobile Development',
      'software-development': 'Custom Software Development',
      'ai-development': 'AI Development',
      'ecommerce-development': 'E-commerce',
      'cloud-services': 'Cloud Services',
      'ui-ux-design': 'Design Services',
      'digital-marketing': 'Marketing Services',
      'consulting': 'Consulting',
    };

    return serviceTypes[service || ''] || 'General Services';
  }

  private getTaskPriority(data: ContactFormData): string {
    if (data.budget === '100k_plus') return 'High';
    if (data.urgency === 'immediate') return 'High';
    if (data.budget === '50k_100k') return 'Normal';
    return 'Low';
  }
}