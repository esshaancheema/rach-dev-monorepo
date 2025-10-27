import { EmailSequence, LeadSegment } from './types';

export const leadSegments: LeadSegment[] = [
  {
    id: 'new-leads',
    name: 'New Leads',
    description: 'Users who just submitted a contact form or signed up for newsletter',
    conditions: [
      { field: 'created_at', operator: 'greater_than', value: '7_days_ago' },
      { field: 'status', operator: 'equals', value: 'active' }
    ],
    size: 1247,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-30T12:00:00Z'
  },
  {
    id: 'enterprise-prospects',
    name: 'Enterprise Prospects',
    description: 'Large companies with 500+ employees interested in enterprise solutions',
    conditions: [
      { field: 'company_size', operator: 'greater_than', value: 500 },
      { field: 'project_budget', operator: 'greater_than', value: 100000 },
      { field: 'interest', operator: 'contains', value: 'enterprise' }
    ],
    size: 89,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-30T12:00:00Z'
  },
  {
    id: 'startup-founders',
    name: 'Startup Founders',
    description: 'Early-stage startup founders looking to build their MVP',
    conditions: [
      { field: 'company_stage', operator: 'equals', value: 'startup' },
      { field: 'role', operator: 'contains', value: 'founder' },
      { field: 'project_type', operator: 'contains', value: 'mvp' }
    ],
    size: 423,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-30T12:00:00Z'
  },
  {
    id: 'fintech-leads',
    name: 'FinTech Leads',
    description: 'Companies in financial services looking for specialized solutions',
    conditions: [
      { field: 'industry', operator: 'equals', value: 'fintech' },
      { field: 'project_type', operator: 'contains', value: 'financial' }
    ],
    size: 156,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-30T12:00:00Z'
  },
  {
    id: 'proposal-sent',
    name: 'Proposal Sent',
    description: 'Leads who have received a project proposal but haven\'t responded',
    conditions: [
      { field: 'proposal_sent', operator: 'equals', value: true },
      { field: 'proposal_response', operator: 'not_exists', value: null },
      { field: 'proposal_sent_at', operator: 'greater_than', value: '3_days_ago' }
    ],
    size: 67,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-30T12:00:00Z'
  }
];

export const emailSequences: EmailSequence[] = [
  {
    id: 'welcome-series',
    name: 'Welcome Series',
    description: 'Complete onboarding series for new leads and newsletter subscribers',
    type: 'welcome',
    trigger: {
      type: 'form_submission',
      conditions: {
        form_type: ['contact', 'newsletter', 'consultation']
      }
    },
    targetSegment: 'new-leads',
    emails: [
      {
        id: 'step-1',
        templateId: 'welcome-01',
        delay: 0, // Immediate
        conditions: []
      },
      {
        id: 'step-2',
        templateId: 'welcome-02',
        delay: 24, // 1 day later
        conditions: [
          { field: 'email_opened', operator: 'equals', value: true }
        ]
      },
      {
        id: 'step-3',
        templateId: 'nurture-01',
        delay: 120, // 5 days later
        conditions: [
          { field: 'link_clicked', operator: 'equals', value: false }
        ]
      }
    ],
    isActive: true,
    stats: {
      subscribers: 1247,
      completed: 892,
      dropped: 355,
      avgOpenRate: 72.4,
      avgClickRate: 34.7,
      conversionRate: 12.8
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-25T10:30:00Z'
  },
  
  {
    id: 'startup-nurture',
    name: 'Startup Founder Nurture',
    description: 'Specialized sequence for startup founders focusing on MVP development and scaling',
    type: 'nurture',
    trigger: {
      type: 'manual',
      conditions: {
        segment: 'startup-founders'
      }
    },
    targetSegment: 'startup-founders',
    emails: [
      {
        id: 'startup-1',
        templateId: 'nurture-startup-mvp',
        delay: 0,
        conditions: []
      },
      {
        id: 'startup-2',
        templateId: 'nurture-startup-scaling',
        delay: 72, // 3 days
        conditions: [
          { field: 'email_opened', operator: 'equals', value: true }
        ]
      },
      {
        id: 'startup-3',
        templateId: 'nurture-startup-funding',
        delay: 168, // 7 days
        conditions: []
      },
      {
        id: 'startup-4',
        templateId: 'followup-01',
        delay: 336, // 14 days
        conditions: [
          { field: 'consultation_booked', operator: 'equals', value: false }
        ]
      }
    ],
    isActive: true,
    stats: {
      subscribers: 423,
      completed: 312,
      dropped: 111,
      avgOpenRate: 68.9,
      avgClickRate: 41.2,
      conversionRate: 18.4
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-28T14:15:00Z'
  },

  {
    id: 'enterprise-nurture',
    name: 'Enterprise Sales Sequence',
    description: 'High-touch sequence for enterprise prospects with personalized content',
    type: 'nurture',
    trigger: {
      type: 'manual',
      conditions: {
        segment: 'enterprise-prospects'
      }
    },
    targetSegment: 'enterprise-prospects',
    emails: [
      {
        id: 'enterprise-1',
        templateId: 'nurture-enterprise-intro',
        delay: 0,
        conditions: []
      },
      {
        id: 'enterprise-2',
        templateId: 'nurture-enterprise-security',
        delay: 48, // 2 days
        conditions: []
      },
      {
        id: 'enterprise-3',
        templateId: 'nurture-enterprise-scalability',
        delay: 120, // 5 days
        conditions: [
          { field: 'email_opened', operator: 'equals', value: true }
        ]
      },
      {
        id: 'enterprise-4',
        templateId: 'nurture-enterprise-roi',
        delay: 192, // 8 days
        conditions: []
      },
      {
        id: 'enterprise-5',
        templateId: 'followup-enterprise',
        delay: 336, // 14 days
        conditions: [
          { field: 'meeting_scheduled', operator: 'equals', value: false }
        ]
      }
    ],
    isActive: true,
    stats: {
      subscribers: 89,
      completed: 67,
      dropped: 22,
      avgOpenRate: 84.3,
      avgClickRate: 52.7,
      conversionRate: 31.5,
      revenue: 2450000
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-30T09:45:00Z'
  },

  {
    id: 'fintech-specialized',
    name: 'FinTech Specialist Sequence',
    description: 'Industry-specific sequence highlighting FinTech expertise and compliance',
    type: 'nurture',
    trigger: {
      type: 'form_submission',
      conditions: {
        industry: 'fintech',
        interest: ['payment-processing', 'trading-platform', 'banking-app']
      }
    },
    targetSegment: 'fintech-leads',
    emails: [
      {
        id: 'fintech-1',
        templateId: 'welcome-01',
        delay: 0,
        conditions: []
      },
      {
        id: 'fintech-2',
        templateId: 'nurture-01', // PayFlow case study
        delay: 24, // 1 day
        conditions: []
      },
      {
        id: 'fintech-3',
        templateId: 'nurture-fintech-compliance',
        delay: 96, // 4 days
        conditions: [
          { field: 'case_study_viewed', operator: 'equals', value: true }
        ]
      },
      {
        id: 'fintech-4',
        templateId: 'nurture-fintech-security',
        delay: 168, // 7 days
        conditions: []
      },
      {
        id: 'fintech-5',
        templateId: 'followup-01',
        delay: 264, // 11 days
        conditions: [
          { field: 'consultation_booked', operator: 'equals', value: false }
        ]
      }
    ],
    isActive: true,
    stats: {
      subscribers: 156,
      completed: 128,
      dropped: 28,
      avgOpenRate: 79.2,
      avgClickRate: 47.3,
      conversionRate: 24.4,
      revenue: 1890000
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-29T16:20:00Z'
  },

  {
    id: 'proposal-followup',
    name: 'Proposal Follow-up Sequence',
    description: 'Gentle follow-up sequence for leads who received proposals but haven\'t responded',
    type: 'nurture',
    trigger: {
      type: 'manual',
      conditions: {
        proposal_sent: true,
        days_since_proposal: 3
      },
      delay: 72 // 3 days after proposal sent
    },
    targetSegment: 'proposal-sent',
    emails: [
      {
        id: 'proposal-f1',
        templateId: 'followup-01',
        delay: 0,
        conditions: []
      },
      {
        id: 'proposal-f2',
        templateId: 'followup-value-add',
        delay: 120, // 5 days later
        conditions: [
          { field: 'proposal_opened', operator: 'equals', value: false }
        ]
      },
      {
        id: 'proposal-f3',
        templateId: 'followup-final',
        delay: 336, // 14 days later
        conditions: [
          { field: 'consultation_booked', operator: 'equals', value: false }
        ]
      }
    ],
    isActive: true,
    stats: {
      subscribers: 67,
      completed: 45,
      dropped: 22,
      avgOpenRate: 65.7,
      avgClickRate: 38.9,
      conversionRate: 22.4
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-30T11:10:00Z'
  },

  {
    id: 'reactivation-campaign',
    name: 'Re-engagement Campaign',
    description: 'Win-back sequence for inactive subscribers who haven\'t engaged in 60+ days',
    type: 'reactivation',
    trigger: {
      type: 'inactivity',
      conditions: {
        days_inactive: 60,
        last_open: null
      }
    },
    emails: [
      {
        id: 'reactivation-1',
        templateId: 'reactivation-miss-you',
        delay: 0,
        conditions: []
      },
      {
        id: 'reactivation-2',
        templateId: 'reactivation-exclusive-offer',
        delay: 168, // 7 days
        conditions: [
          { field: 'email_opened', operator: 'equals', value: false }
        ]
      },
      {
        id: 'reactivation-3',
        templateId: 'reactivation-final-attempt',
        delay: 336, // 14 days
        conditions: [
          { field: 'email_opened', operator: 'equals', value: false }
        ]
      }
    ],
    isActive: true,
    stats: {
      subscribers: 234,
      completed: 89,
      dropped: 145,
      avgOpenRate: 23.1,
      avgClickRate: 12.4,
      conversionRate: 5.7
    },
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-30T13:25:00Z'
  }
];

export function getSequenceById(id: string): EmailSequence | undefined {
  return emailSequences.find(sequence => sequence.id === id);
}

export function getSequencesByType(type: EmailSequence['type']): EmailSequence[] {
  return emailSequences.filter(sequence => sequence.type === type && sequence.isActive);
}

export function getActiveSequences(): EmailSequence[] {
  return emailSequences.filter(sequence => sequence.isActive);
}

export function getSequencesBySegment(segmentId: string): EmailSequence[] {
  return emailSequences.filter(sequence => 
    sequence.targetSegment === segmentId && sequence.isActive
  );
}

export function getSegmentById(id: string): LeadSegment | undefined {
  return leadSegments.find(segment => segment.id === id);
}

export function getAllSegments(): LeadSegment[] {
  return leadSegments;
}