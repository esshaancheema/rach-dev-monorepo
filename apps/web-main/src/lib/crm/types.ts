export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  message: string;
  urgency?: 'immediate' | 'within_month' | 'within_quarter' | 'exploring';
  source?: string;
  location?: string;
  industry?: string;
  score?: number;
}

export interface NewsletterData {
  email: string;
  name?: string;
  interests?: string[];
  source?: string;
}

export interface CRMContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  customProperties?: Record<string, any>;
}

export interface CRMDeal {
  id: string;
  name: string;
  value: number;
  stage: string;
  pipeline: string;
  closeDate?: string;
  contactId: string;
  createdAt: string;
  updatedAt: string;
  customProperties?: Record<string, any>;
}

export interface CRMTask {
  id: string;
  subject: string;
  body?: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'TODO';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'WAITING' | 'DEFERRED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  contactId?: string;
  dealId?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMIntegration {
  createContact(data: ContactFormData): Promise<{ success: boolean; contactId?: string; error?: string }>;
  updateContact(contactId: string, data: ContactFormData): Promise<{ success: boolean; error?: string }>;
  createDeal(contactId: string, data: ContactFormData): Promise<{ success: boolean; dealId?: string; error?: string }>;
  createTask(contactId: string, data: ContactFormData): Promise<{ success: boolean; taskId?: string; error?: string }>;
  subscribeToNewsletter(data: NewsletterData): Promise<{ success: boolean; error?: string }>;
}

export interface WebhookData {
  eventType: string;
  objectType: string;
  objectId: string;
  propertyName?: string;
  propertyValue?: any;
  subscriptionId: string;
  portalId: string;
  appId: string;
  occurredAt: number;
  subscriptionType: string;
  attemptNumber: number;
  changeSource: string;
}