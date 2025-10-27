export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  type: 'welcome' | 'nurture' | 'promotional' | 'transactional' | 'follow-up';
  category: string;
  tags: string[];
  variables: EmailVariable[];
  previewText?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  stats?: EmailTemplateStats;
}

export interface EmailVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'url' | 'email';
  description: string;
  required: boolean;
  defaultValue?: string;
  example?: string;
}

export interface EmailTemplateStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export interface EmailSequence {
  id: string;
  name: string;
  description: string;
  type: 'welcome' | 'nurture' | 'onboarding' | 'abandoned-cart' | 'reactivation';
  trigger: EmailTrigger;
  emails: EmailSequenceStep[];
  isActive: boolean;
  targetSegment?: LeadSegment;
  stats?: EmailSequenceStats;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTrigger {
  type: 'form_submission' | 'signup' | 'download' | 'page_visit' | 'inactivity' | 'manual';
  conditions: Record<string, any>;
  delay?: number; // minutes
}

export interface EmailSequenceStep {
  id: string;
  templateId: string;
  delay: number; // hours after previous step or trigger
  conditions?: EmailCondition[];
  abTest?: {
    enabled: boolean;
    variants: Array<{
      templateId: string;
      weight: number; // percentage
    }>;
  };
}

export interface EmailCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
  value: any;
}

export interface EmailSequenceStats {
  subscribers: number;
  completed: number;
  dropped: number;
  avgOpenRate: number;
  avgClickRate: number;
  conversionRate: number;
  revenue?: number;
}

export interface LeadSegment {
  id: string;
  name: string;
  description: string;
  conditions: EmailCondition[];
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  segmentIds: string[];
  scheduledAt?: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  stats?: EmailCampaignStats;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaignStats {
  recipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  complained: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  revenue?: number;
}

export interface EmailRecipient {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  source: string;
  status: 'active' | 'unsubscribed' | 'bounced' | 'complained';
  tags: string[];
  customFields: Record<string, any>;
  segments: string[];
  emailActivity: EmailActivity[];
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
}

export interface EmailActivity {
  id: string;
  type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'complained';
  campaignId?: string;
  templateId?: string;
  timestamp: string;
  details?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface EmailProvider {
  name: 'sendgrid' | 'mailgun' | 'ses' | 'resend' | 'smtp';
  config: Record<string, any>;
  isActive: boolean;
  priority: number;
  limits?: {
    daily?: number;
    hourly?: number;
    monthly?: number;
  };
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
  timestamp: string;
  deliveryTime?: number; // milliseconds
}

export interface EmailAnalytics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    complained: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    unsubscribeRate: number;
    deliverabilityScore: number;
    revenue?: number;
    roi?: number;
  };
  trends: Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }>;
  topPerformers: {
    templates: Array<{
      id: string;
      name: string;
      openRate: number;
      clickRate: number;
    }>;
    segments: Array<{
      id: string;
      name: string;
      engagement: number;
    }>;
  };
}