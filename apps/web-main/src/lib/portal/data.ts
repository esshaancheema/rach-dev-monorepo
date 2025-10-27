import { ClientProject, ProjectMilestone, TeamMember, ClientUser, ProjectActivity, ProjectMeeting, ProjectFile } from './types';

// Mock team members
export const teamMembers: TeamMember[] = [
  {
    id: 'pm_1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@zoptal.com',
    role: 'Senior Project Manager',
    avatar: '/images/team/sarah-johnson.jpg',
    department: 'project_management',
    skills: ['Agile', 'Scrum', 'Risk Management', 'Client Relations'],
    isPublic: true
  },
  {
    id: 'dev_1',
    name: 'Alex Chen',
    email: 'alex.chen@zoptal.com',
    role: 'Lead Full-Stack Developer',
    avatar: '/images/team/alex-chen.jpg',
    department: 'development',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
    isPublic: true
  },
  {
    id: 'design_1',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@zoptal.com',
    role: 'Senior UI/UX Designer',
    avatar: '/images/team/maria-rodriguez.jpg',
    department: 'design',
    skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
    isPublic: true
  },
  {
    id: 'dev_2',
    name: 'David Kim',
    email: 'david.kim@zoptal.com',
    role: 'AI/ML Engineer',
    avatar: '/images/team/david-kim.jpg',
    department: 'development',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision'],
    isPublic: true
  },
  {
    id: 'qa_1',
    name: 'Emily Davis',
    email: 'emily.davis@zoptal.com',
    role: 'QA Engineer',
    avatar: '/images/team/emily-davis.jpg',
    department: 'qa',
    skills: ['Test Automation', 'Cypress', 'Jest', 'Performance Testing'],
    isPublic: false
  }
];

// Mock client users
export const clientUsers: ClientUser[] = [
  {
    id: 'client_1',
    email: 'john.smith@techcorp.com',
    firstName: 'John',
    lastName: 'Smith',
    company: 'TechCorp Solutions',
    title: 'CEO',
    avatar: '/images/clients/john-smith.jpg',
    phone: '+1-555-0123',
    timezone: 'America/New_York',
    role: 'primary_contact',
    status: 'active',
    lastLoginAt: '2024-01-20T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    permissions: {
      canViewProject: true,
      canViewFinancials: true,
      canDownloadFiles: true,
      canUploadFiles: true,
      canCreateTasks: false,
      canCommentOnTasks: true,
      canApproveDeliverables: true,
      canViewTeamMembers: true,
      canScheduleMeetings: false
    }
  },
  {
    id: 'client_2',
    email: 'lisa.wang@techcorp.com',
    firstName: 'Lisa',
    lastName: 'Wang',
    company: 'TechCorp Solutions',
    title: 'CTO',
    avatar: '/images/clients/lisa-wang.jpg',
    phone: '+1-555-0124',
    timezone: 'America/New_York',
    role: 'stakeholder',
    status: 'active',
    lastLoginAt: '2024-01-19T15:45:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    permissions: {
      canViewProject: true,
      canViewFinancials: false,
      canDownloadFiles: true,
      canUploadFiles: true,
      canCreateTasks: false,
      canCommentOnTasks: true,
      canApproveDeliverables: false,
      canViewTeamMembers: true,
      canScheduleMeetings: false
    }
  }
];

// Mock project files
export const projectFiles: ProjectFile[] = [
  {
    id: 'file_1',
    name: 'ui-design-system-v2.fig',
    originalName: 'TechCorp UI Design System v2.fig',
    size: 15728640, // 15MB
    type: 'application/figma',
    url: '/files/projects/techcorp/ui-design-system-v2.fig',
    thumbnailUrl: '/files/projects/techcorp/thumbnails/ui-design-system-v2.jpg',
    description: 'Complete UI design system with components, tokens, and guidelines',
    category: 'design',
    version: 2,
    isLatest: true,
    uploadedBy: 'design_1',
    uploadedAt: '2024-01-18T14:20:00Z',
    downloadCount: 12,
    tags: ['design-system', 'ui-components', 'tokens'],
    public: true
  },
  {
    id: 'file_2', 
    name: 'api-documentation-v1.pdf',
    originalName: 'TechCorp Platform API Documentation v1.pdf',
    size: 2097152, // 2MB
    type: 'application/pdf',
    url: '/files/projects/techcorp/api-documentation-v1.pdf',
    description: 'Complete API documentation with endpoints, authentication, and examples',
    category: 'document',
    version: 1,
    isLatest: true,
    uploadedBy: 'dev_1',
    uploadedAt: '2024-01-17T10:15:00Z',
    downloadCount: 8,
    tags: ['api', 'documentation', 'endpoints'],
    public: true
  },
  {
    id: 'file_3',
    name: 'user-acceptance-testing-plan.docx',
    originalName: 'User Acceptance Testing Plan - Phase 1.docx',
    size: 524288, // 512KB
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    url: '/files/projects/techcorp/uat-plan-phase1.docx',
    description: 'Comprehensive UAT plan for Phase 1 features',
    category: 'document',
    version: 1,
    isLatest: true,
    uploadedBy: 'qa_1',
    uploadedAt: '2024-01-16T16:30:00Z',
    downloadCount: 5,
    tags: ['testing', 'uat', 'phase1'],
    public: true
  }
];

// Mock project activities
export const projectActivities: ProjectActivity[] = [
  {
    id: 'activity_1',
    type: 'deliverable_approved',
    title: 'UI Design System Approved',
    description: 'John Smith approved the UI Design System deliverable',
    entityId: 'deliverable_1',
    entityType: 'deliverable',
    authorId: 'client_1',
    authorName: 'John Smith',
    authorAvatar: '/images/clients/john-smith.jpg',
    metadata: { deliverableName: 'UI Design System v2' },
    createdAt: '2024-01-20T10:30:00Z',
    isImportant: true
  },
  {
    id: 'activity_2',
    type: 'file_uploaded',
    title: 'New File Uploaded',
    description: 'Maria Rodriguez uploaded UI Design System v2.fig',
    entityId: 'file_1',
    entityType: 'file',
    authorId: 'design_1',
    authorName: 'Maria Rodriguez',
    authorAvatar: '/images/team/maria-rodriguez.jpg',
    metadata: { fileName: 'ui-design-system-v2.fig', fileSize: '15 MB' },
    createdAt: '2024-01-18T14:20:00Z',
    isImportant: false
  },
  {
    id: 'activity_3',
    type: 'milestone_completed',
    title: 'Discovery Phase Completed',
    description: 'Discovery and Research milestone has been completed ahead of schedule',
    entityId: 'milestone_1',
    entityType: 'milestone',
    authorId: 'pm_1',
    authorName: 'Sarah Johnson',
    authorAvatar: '/images/team/sarah-johnson.jpg',
    metadata: { milestoneName: 'Discovery & Research' },
    createdAt: '2024-01-15T17:00:00Z',
    isImportant: true
  },
  {
    id: 'activity_4',
    type: 'meeting_scheduled',
    title: 'Design Review Meeting Scheduled',
    description: 'Weekly design review meeting scheduled for January 25th',
    entityId: 'meeting_1',
    entityType: 'meeting',
    authorId: 'pm_1',
    authorName: 'Sarah Johnson',
    authorAvatar: '/images/team/sarah-johnson.jpg',
    metadata: { meetingDate: '2024-01-25T15:00:00Z', meetingType: 'review' },
    createdAt: '2024-01-18T09:15:00Z',
    isImportant: false
  }
];

// Mock project meetings
export const projectMeetings: ProjectMeeting[] = [
  {
    id: 'meeting_1',
    title: 'Weekly Design Review',
    description: 'Review latest design iterations and gather client feedback',
    type: 'review',
    scheduledAt: '2024-01-25T15:00:00Z',
    duration: 60,
    status: 'scheduled',
    meetingUrl: 'https://zoom.us/j/1234567890',
    agenda: [
      'Review UI Design System v2',
      'Discuss mobile responsive layouts',
      'Gather feedback on user flows',
      'Plan next iteration'
    ],
    attendees: [
      {
        userId: 'client_1',
        name: 'John Smith',
        email: 'john.smith@techcorp.com',
        type: 'required',
        status: 'accepted'
      },
      {
        userId: 'client_2',
        name: 'Lisa Wang',
        email: 'lisa.wang@techcorp.com',
        type: 'required',
        status: 'pending'
      },
      {
        userId: 'design_1',
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@zoptal.com',
        type: 'required',
        status: 'accepted'
      },
      {
        userId: 'pm_1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@zoptal.com',
        type: 'required',
        status: 'accepted'
      }
    ],
    createdBy: 'pm_1',
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-18T09:15:00Z'
  }
];

// Mock project milestones
export const projectMilestones: ProjectMilestone[] = [
  {
    id: 'milestone_1',
    name: 'Discovery & Research',
    description: 'User research, competitor analysis, and technical requirements gathering',
    dueDate: '2024-01-15T23:59:59Z',
    status: 'completed',
    progress: 100,
    deliverables: [
      {
        id: 'deliverable_1',
        name: 'User Research Report',
        description: 'Comprehensive user research findings and personas',
        type: 'document',
        status: 'approved',
        dueDate: '2024-01-10T23:59:59Z',
        files: [projectFiles[1]],
        feedback: [],
        approvalRequired: true,
        approvedBy: 'client_1',
        approvedAt: '2024-01-12T14:30:00Z',
        priority: 'high',
        estimatedHours: 40,
        actualHours: 38,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-12T14:30:00Z'
      },
      {
        id: 'deliverable_2',
        name: 'Technical Architecture Document',
        description: 'System architecture, technology stack, and infrastructure plan',
        type: 'document',
        status: 'approved',
        dueDate: '2024-01-15T23:59:59Z',
        files: [],
        feedback: [],
        approvalRequired: true,
        approvedBy: 'client_2',
        approvedAt: '2024-01-15T16:20:00Z',
        priority: 'high',
        estimatedHours: 32,
        actualHours: 35,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T16:20:00Z'
      }
    ],
    estimatedHours: 120,
    actualHours: 115,
    priority: 'high',
    assignedTeam: [teamMembers[0], teamMembers[1], teamMembers[2]],
    completedAt: '2024-01-15T17:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T17:00:00Z'
  },
  {
    id: 'milestone_2',
    name: 'Design & Prototyping',
    description: 'UI/UX design, design system creation, and interactive prototypes',
    dueDate: '2024-02-15T23:59:59Z',
    status: 'in_progress',
    progress: 75,
    deliverables: [
      {
        id: 'deliverable_3',
        name: 'UI Design System',
        description: 'Complete design system with components, tokens, and guidelines',
        type: 'design',
        status: 'approved',
        dueDate: '2024-01-25T23:59:59Z',
        files: [projectFiles[0]],
        feedback: [
          {
            id: 'feedback_1',
            authorId: 'client_1',
            authorName: 'John Smith',
            authorAvatar: '/images/clients/john-smith.jpg',
            content: 'Great work on the design system! The color palette and typography work perfectly with our brand. Just a few minor adjustments needed on the button styles.',
            type: 'approval',
            status: 'resolved',
            createdAt: '2024-01-20T10:30:00Z',
            resolvedAt: '2024-01-20T15:45:00Z',
            resolvedBy: 'design_1'
          }
        ],
        approvalRequired: true,
        approvedBy: 'client_1',
        approvedAt: '2024-01-20T10:30:00Z',
        priority: 'high',
        estimatedHours: 80,
        actualHours: 85,
        createdAt: '2024-01-16T00:00:00Z',
        updatedAt: '2024-01-20T10:30:00Z'
      },
      {
        id: 'deliverable_4',
        name: 'Interactive Prototype',
        description: 'High-fidelity interactive prototype of key user flows',
        type: 'design',
        status: 'in_review',
        dueDate: '2024-02-10T23:59:59Z',
        files: [],
        feedback: [],
        approvalRequired: true,
        priority: 'medium',
        estimatedHours: 60,
        createdAt: '2024-01-16T00:00:00Z',
        updatedAt: '2024-01-18T12:00:00Z'
      }
    ],
    estimatedHours: 200,
    actualHours: 140,
    priority: 'high',
    assignedTeam: [teamMembers[2], teamMembers[0]],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 'milestone_3',
    name: 'Frontend Development',
    description: 'React application development with responsive design implementation',
    dueDate: '2024-03-30T23:59:59Z',
    status: 'pending',
    progress: 0,
    deliverables: [
      {
        id: 'deliverable_5',
        name: 'Core Components Library',
        description: 'Reusable React components based on design system',
        type: 'development',
        status: 'pending',
        dueDate: '2024-03-01T23:59:59Z',
        files: [],
        feedback: [],
        approvalRequired: false,
        priority: 'high',
        estimatedHours: 120,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'deliverable_6',
        name: 'User Dashboard Implementation',
        description: 'Complete user dashboard with all features and integrations',
        type: 'development',
        status: 'pending',
        dueDate: '2024-03-20T23:59:59Z',
        files: [],
        feedback: [],
        approvalRequired: true,
        priority: 'high',
        estimatedHours: 160,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ],
    estimatedHours: 400,
    priority: 'high',
    assignedTeam: [teamMembers[1], teamMembers[3]],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Mock project data
export const mockProject: ClientProject = {
  id: 'project_techcorp_2024',
  name: 'TechCorp AI-Powered Business Platform',
  description: 'Enterprise-grade business automation platform with AI-powered analytics, customer management, and workflow optimization.',
  type: 'enterprise_software',
  status: 'in_progress',
  priority: 'high',
  
  client: {
    companyName: 'TechCorp Solutions',
    contactPerson: 'John Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1-555-0123',
    address: '123 Business Ave, New York, NY 10001',
    logo: '/images/clients/techcorp-logo.png'
  },
  
  projectManager: teamMembers[0],
  teamMembers: teamMembers,
  clientUsers: clientUsers,
  
  timeline: {
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-06-30T23:59:59Z',
    estimatedEndDate: '2024-06-30T23:59:59Z',
    phases: [
      {
        id: 'phase_1',
        name: 'Discovery & Planning',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        status: 'completed',
        milestones: ['milestone_1'],
        progress: 100
      },
      {
        id: 'phase_2',
        name: 'Design & Prototyping',
        startDate: '2024-02-01T00:00:00Z',
        endDate: '2024-03-15T23:59:59Z',
        status: 'in_progress',
        milestones: ['milestone_2'],
        progress: 75
      },
      {
        id: 'phase_3',
        name: 'Development',
        startDate: '2024-03-16T00:00:00Z',
        endDate: '2024-05-31T23:59:59Z',
        status: 'not_started',
        milestones: ['milestone_3'],
        progress: 0
      }
    ],
    criticalPath: ['milestone_1', 'milestone_2', 'milestone_3'],
    risks: [
      {
        id: 'risk_1',
        description: 'Third-party API integration delays',
        impact: 'medium',
        probability: 'low',
        mitigation: 'Prepared fallback API options and buffer time in schedule',
        status: 'identified'
      }
    ]
  },
  
  milestones: projectMilestones,
  
  budget: {
    totalBudget: 285000,
    spentAmount: 95000,
    remainingAmount: 190000,
    currency: 'USD',
    breakdown: [
      { category: 'Discovery & Research', budgeted: 45000, spent: 42000, remaining: 3000 },
      { category: 'Design & Prototyping', budgeted: 65000, spent: 53000, remaining: 12000 },
      { category: 'Frontend Development', budgeted: 85000, spent: 0, remaining: 85000 },
      { category: 'Backend Development', budgeted: 70000, spent: 0, remaining: 70000 },
      { category: 'Testing & QA', budgeted: 20000, spent: 0, remaining: 20000 }
    ],
    milestonePayments: [
      {
        milestoneId: 'milestone_1',
        milestoneName: 'Discovery & Research',
        amount: 45000,
        dueDate: '2024-01-31T23:59:59Z',
        status: 'paid',
        invoiceNumber: 'INV-2024-001',
        paidAt: '2024-02-05T10:00:00Z'
      },
      {
        milestoneId: 'milestone_2',
        milestoneName: 'Design & Prototyping',
        amount: 65000,
        dueDate: '2024-03-15T23:59:59Z',
        status: 'invoiced',
        invoiceNumber: 'INV-2024-002'
      }
    ],
    expenses: [
      {
        id: 'expense_1',
        description: 'UI Design Tools & Assets',
        amount: 2500,
        category: 'Software & Tools',
        date: '2024-01-15T00:00:00Z',
        approvedBy: 'pm_1',
        receiptUrl: '/files/receipts/expense_1.pdf'
      }
    ]
  },
  
  technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'AI/ML'],
  services: ['Web Development', 'AI Integration', 'Cloud Architecture', 'UI/UX Design'],
  
  activities: projectActivities,
  meetings: projectMeetings,
  files: projectFiles,
  
  overallProgress: 58,
  health: 'healthy',
  lastActivity: '2024-01-20T10:30:00Z',
  
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-20T10:30:00Z',
  
  settings: {
    clientCanViewBudget: true,
    clientCanViewTeam: true,
    clientCanUploadFiles: true,
    clientCanScheduleMeetings: false,
    emailNotifications: true,
    slackIntegration: false
  }
};

// Utility functions
export function getProjectById(id: string): ClientProject | null {
  return id === mockProject.id ? mockProject : null;
}

export function getProjectMilestones(projectId: string): ProjectMilestone[] {
  if (projectId === mockProject.id) {
    return mockProject.milestones;
  }
  return [];
}

export function getProjectActivities(projectId: string, limit: number = 10): ProjectActivity[] {
  if (projectId === mockProject.id) {
    return mockProject.activities.slice(0, limit);
  }
  return [];
}

export function getProjectFiles(projectId: string, category?: string): ProjectFile[] {
  if (projectId === mockProject.id) {
    let files = mockProject.files;
    if (category) {
      files = files.filter(file => file.category === category);
    }
    return files;
  }
  return [];
}

export function getUpcomingMeetings(projectId: string): ProjectMeeting[] {
  if (projectId === mockProject.id) {
    const now = new Date();
    return mockProject.meetings.filter(meeting => 
      new Date(meeting.scheduledAt) > now && meeting.status === 'scheduled'
    );
  }
  return [];
}

export function getProjectHealth(project: ClientProject): 'healthy' | 'at_risk' | 'critical' {
  // Calculate health based on various factors
  const now = new Date();
  const overdueMilestones = project.milestones.filter(milestone => 
    new Date(milestone.dueDate) < now && milestone.status !== 'completed'
  ).length;
  
  const budgetUtilization = project.budget.spentAmount / project.budget.totalBudget;
  const timeElapsed = (now.getTime() - new Date(project.timeline.startDate).getTime()) / 
                      (new Date(project.timeline.endDate).getTime() - new Date(project.timeline.startDate).getTime());
  
  if (overdueMilestones > 0 || budgetUtilization > 0.9 || 
      (timeElapsed > 0.8 && project.overallProgress < 80)) {
    return 'critical';
  }
  
  if (budgetUtilization > 0.7 || (timeElapsed > 0.6 && project.overallProgress < 60)) {
    return 'at_risk';
  }
  
  return 'healthy';
}