export interface LeadSource {
  id: string;
  name: string;
  type: 'organic' | 'paid' | 'social' | 'email' | 'referral' | 'direct';
}

export interface LeadData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  jobTitle?: string;
  companySize?: 'startup' | 'smb' | 'enterprise';
  industry?: string;
  serviceInterest: string[];
  budget?: string;
  timeline?: string;
  message?: string;
  source: LeadSource;
  utm: {
    campaign?: string;
    source?: string;
    medium?: string;
    term?: string;
    content?: string;
  };
  pages: string[];
  timeOnSite: number;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  engagementScore: number;
  createdAt: string;
  updatedAt: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed-won' | 'closed-lost';
  assignedTo?: string;
  tags: string[];
  customFields: Record<string, any>;
}

export interface EmailSequence {
  id: string;
  name: string;
  trigger: 'form_submit' | 'page_visit' | 'time_delay' | 'behavior' | 'manual';
  emails: EmailTemplate[];
  active: boolean;
  segmentCriteria?: {
    serviceInterest?: string[];
    companySize?: string[];
    industry?: string[];
    engagementScore?: { min?: number; max?: number };
  };
}

export interface EmailTemplate {
  id: string;
  subject: string;
  content: string;
  delay: number; // Hours after trigger or previous email
  conditions?: {
    opened?: boolean;
    clicked?: boolean;
    replied?: boolean;
  };
  personalizations: {
    [key: string]: string;
  };
}

export interface LeadMagnet {
  id: string;
  title: string;
  description: string;
  type: 'ebook' | 'whitepaper' | 'checklist' | 'template' | 'webinar' | 'demo';
  downloadUrl: string;
  landingPage: string;
  emailSequenceId?: string;
  requirements: {
    email: boolean;
    firstName?: boolean;
    lastName?: boolean;
    company?: boolean;
    phone?: boolean;
    jobTitle?: boolean;
  };
  tags: string[];
  active: boolean;
}

export interface CampaignPerformance {
  id: string;
  name: string;
  period: { start: string; end: string };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    leads: number;
    cost: number;
    revenue: number;
    ctr: number;
    conversionRate: number;
    costPerLead: number;
    roas: number;
  };
  channels: {
    [channel: string]: {
      impressions: number;
      clicks: number;
      conversions: number;
      cost: number;
    };
  };
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox' | 'radio';
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  options?: Array<{ value: string; label: string }>;
  conditional?: {
    field: string;
    value: string;
    operator: 'equals' | 'not_equals' | 'contains';
  };
}

export interface FormConfig {
  id: string;
  name: string;
  title: string;
  description?: string;
  fields: FormField[];
  submitButton: {
    text: string;
    loadingText: string;
  };
  successMessage: string;
  redirectUrl?: string;
  emailSequenceId?: string;
  tags: string[];
  trackingEvents: {
    view: string;
    submit: string;
    success: string;
  };
}

export interface LeadScoringRule {
  id: string;
  name: string;
  condition: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };
  score: number;
  active: boolean;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  secret?: string;
  active: boolean;
  retryAttempts: number;
  retryDelay: number;
}