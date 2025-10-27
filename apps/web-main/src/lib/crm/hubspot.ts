import { ContactFormData, NewsletterData, CRMIntegration } from './types';

export class HubSpotIntegration implements CRMIntegration {
  private apiKey: string;
  private baseUrl = 'https://api.hubapi.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createContact(data: ContactFormData): Promise<{ success: boolean; contactId?: string; error?: string }> {
    try {
      const hubspotData = this.transformContactData(data);
      
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hubspotData),
      });

      const result = await response.json();

      if (response.ok) {
        // Create a deal for this contact
        if (data.budget && data.service) {
          await this.createDeal(result.id, data);
        }

        // Add to appropriate lists
        await this.addToLists(result.id, data);

        return { success: true, contactId: result.id };
      } else {
        // Handle duplicate contact
        if (result.category === 'CONFLICT') {
          const existingContactId = result.message.match(/Existing ID: (\d+)/)?.[1];
          if (existingContactId) {
            await this.updateContact(existingContactId, data);
            return { success: true, contactId: existingContactId };
          }
        }
        
        throw new Error(`HubSpot API error: ${result.message}`);
      }
    } catch (error) {
      console.error('HubSpot create contact error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async updateContact(contactId: string, data: ContactFormData): Promise<{ success: boolean; error?: string }> {
    try {
      const hubspotData = this.transformContactData(data);
      
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hubspotData),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const result = await response.json();
        throw new Error(`HubSpot API error: ${result.message}`);
      }
    } catch (error) {
      console.error('HubSpot update contact error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async createDeal(contactId: string, data: ContactFormData): Promise<{ success: boolean; dealId?: string; error?: string }> {
    try {
      const dealValue = this.estimateDealValue(data.budget);
      const dealName = `${data.name} - ${data.service || 'General Inquiry'}`;

      const dealData = {
        properties: {
          dealname: dealName,
          dealstage: 'appointmentscheduled', // Adjust based on your pipeline
          pipeline: 'default', // Adjust based on your pipeline
          amount: dealValue.toString(),
          closedate: this.getEstimatedCloseDate(data.urgency),
          hubspot_owner_id: process.env.HUBSPOT_DEFAULT_OWNER_ID || '',
          deal_type: this.getDealType(data.service),
          lead_source: data.source || 'website',
          deal_currency_code: 'USD',
        },
        associations: [
          {
            to: { id: contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] // Contact to Deal
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealData),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, dealId: result.id };
      } else {
        throw new Error(`HubSpot API error: ${result.message}`);
      }
    } catch (error) {
      console.error('HubSpot create deal error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async addToLists(contactId: string, data: ContactFormData): Promise<void> {
    try {
      const listIds = this.getRelevantLists(data);
      
      for (const listId of listIds) {
        await fetch(`${this.baseUrl}/contacts/v1/lists/${listId}/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vids: [contactId]
          }),
        });
      }
    } catch (error) {
      console.error('HubSpot add to lists error:', error);
    }
  }

  async createTask(contactId: string, data: ContactFormData): Promise<{ success: boolean; taskId?: string; error?: string }> {
    try {
      const taskData = {
        properties: {
          hs_task_subject: `Follow up with ${data.name}`,
          hs_task_body: `Follow up regarding: ${data.message}\n\nService Interest: ${data.service || 'Not specified'}\nBudget: ${data.budget || 'Not specified'}`,
          hs_task_status: 'NOT_STARTED',
          hs_task_priority: this.getTaskPriority(data),
          hs_task_type: 'CALL',
          hs_timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Due tomorrow
        },
        associations: [
          {
            to: { id: contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 204 }] // Contact to Task
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, taskId: result.id };
      } else {
        throw new Error(`HubSpot API error: ${result.message}`);
      }
    } catch (error) {
      console.error('HubSpot create task error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async subscribeToNewsletter(data: NewsletterData): Promise<{ success: boolean; error?: string }> {
    try {
      // First, create or update the contact
      const contactData = {
        properties: {
          email: data.email,
          firstname: data.name?.split(' ')[0] || '',
          lastname: data.name?.split(' ').slice(1).join(' ') || '',
          lead_source: data.source || 'newsletter',
          newsletter_subscription: 'true',
          subscription_interests: data.interests?.join(', ') || 'general',
        }
      };

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      let contactId: string;

      if (response.ok) {
        const result = await response.json();
        contactId = result.id;
      } else {
        const result = await response.json();
        
        // Handle duplicate contact
        if (result.category === 'CONFLICT') {
          const existingContactId = result.message.match(/Existing ID: (\d+)/)?.[1];
          if (existingContactId) {
            contactId = existingContactId;
            
            // Update the existing contact
            await fetch(`${this.baseUrl}/crm/v3/objects/contacts/${contactId}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(contactData),
            });
          } else {
            throw new Error('Could not resolve duplicate contact');
          }
        } else {
          throw new Error(`HubSpot API error: ${result.message}`);
        }
      }

      // Add to newsletter list
      const newsletterListId = process.env.HUBSPOT_NEWSLETTER_LIST_ID;
      if (newsletterListId) {
        await fetch(`${this.baseUrl}/contacts/v1/lists/${newsletterListId}/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vids: [contactId]
          }),
        });
      }

      return { success: true };
    } catch (error) {
      console.error('HubSpot newsletter subscription error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private transformContactData(data: ContactFormData) {
    const nameParts = data.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      properties: {
        email: data.email,
        firstname: firstName,
        lastname: lastName,
        phone: data.phone || '',
        company: data.company || '',
        message: data.message,
        lead_source: data.source || 'website',
        service_interest: data.service || '',
        budget_range: data.budget || '',
        project_urgency: data.urgency || '',
        location: data.location || '',
        industry: data.industry || '',
        lead_score: data.score?.toString() || '0',
        lifecyclestage: 'lead',
        hs_lead_status: 'NEW',
      }
    };
  }

  private estimateDealValue(budget?: string): number {
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

  private getDealType(service?: string): string {
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

  private getRelevantLists(data: ContactFormData): string[] {
    const lists: string[] = [];

    // Add to general leads list
    const generalListId = process.env.HUBSPOT_LEADS_LIST_ID;
    if (generalListId) lists.push(generalListId);

    // Add to service-specific lists
    const serviceListIds: Record<string, string> = {
      'web-development': process.env.HUBSPOT_WEB_DEV_LIST_ID || '',
      'mobile-development': process.env.HUBSPOT_MOBILE_DEV_LIST_ID || '',
      'ai-development': process.env.HUBSPOT_AI_DEV_LIST_ID || '',
    };

    const serviceListId = serviceListIds[data.service || ''];
    if (serviceListId) lists.push(serviceListId);

    // Add to budget-based lists
    if (data.budget) {
      const budgetListIds: Record<string, string> = {
        '50k_100k': process.env.HUBSPOT_HIGH_VALUE_LIST_ID || '',
        '100k_plus': process.env.HUBSPOT_ENTERPRISE_LIST_ID || '',
      };

      const budgetListId = budgetListIds[data.budget];
      if (budgetListId) lists.push(budgetListId);
    }

    return lists.filter(id => id !== '');
  }

  private getTaskPriority(data: ContactFormData): string {
    if (data.budget === '100k_plus') return 'HIGH';
    if (data.urgency === 'immediate') return 'HIGH';
    if (data.budget === '50k_100k') return 'MEDIUM';
    return 'LOW';
  }
}