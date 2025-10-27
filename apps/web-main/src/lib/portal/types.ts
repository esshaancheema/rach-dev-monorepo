// Client Portal types for project management and collaboration

export interface ClientUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  title?: string;
  avatar?: string;
  phone?: string;
  timezone?: string;
  role: 'primary_contact' | 'stakeholder' | 'viewer';
  status: 'active' | 'inactive' | 'pending_invitation';
  lastLoginAt?: string;
  createdAt: string;
  permissions: ClientPermissions;
}

export interface ClientPermissions {
  canViewProject: boolean;
  canViewFinancials: boolean;
  canDownloadFiles: boolean;
  canUploadFiles: boolean;
  canCreateTasks: boolean;
  canCommentOnTasks: boolean;
  canApproveDeliverables: boolean;
  canViewTeamMembers: boolean;
  canScheduleMeetings: boolean;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  progress: number; // 0-100
  deliverables: Deliverable[];
  dependencies?: string[]; // milestone IDs
  estimatedHours: number;
  actualHours?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTeam: TeamMember[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  type: 'design' | 'development' | 'document' | 'approval' | 'testing' | 'deployment';
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed';
  dueDate: string;
  files: ProjectFile[];
  feedback?: DeliverableFeedback[];
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliverableFeedback {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  type: 'comment' | 'change_request' | 'approval' | 'rejection';
  status: 'open' | 'resolved' | 'closed';
  attachments?: ProjectFile[];
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  category: 'design' | 'document' | 'code' | 'asset' | 'approval' | 'other';
  version: number;
  isLatest: boolean;
  uploadedBy: string;
  uploadedAt: string;
  downloadCount: number;
  tags?: string[];
  public: boolean; // Can client download
  parentId?: string; // For versioning
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  department: 'development' | 'design' | 'project_management' | 'qa' | 'devops';
  skills?: string[];
  hourlyRate?: number;
  isPublic: boolean; // Visible to client
}

export interface ProjectActivity {
  id: string;
  type: 'milestone_created' | 'milestone_completed' | 'deliverable_submitted' | 
        'deliverable_approved' | 'deliverable_rejected' | 'file_uploaded' | 
        'comment_added' | 'meeting_scheduled' | 'team_member_added' | 'status_changed';
  title: string;
  description: string;
  entityId?: string; // ID of related milestone, deliverable, etc.
  entityType?: 'milestone' | 'deliverable' | 'file' | 'comment' | 'meeting';
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  isImportant: boolean;
}

export interface ProjectMeeting {
  id: string;
  title: string;
  description?: string;
  type: 'kickoff' | 'review' | 'planning' | 'demo' | 'retrospective' | 'sync';
  scheduledAt: string;
  duration: number; // minutes
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  location?: string;
  meetingUrl?: string;
  agenda?: string[];
  attendees: Array<{
    userId: string;
    name: string;
    email: string;
    type: 'required' | 'optional';
    status: 'accepted' | 'declined' | 'pending';
  }>;
  recordingUrl?: string;
  notes?: string;
  actionItems?: Array<{
    id: string;
    description: string;
    assigneeId: string;
    assigneeName: string;
    dueDate?: string;
    status: 'pending' | 'completed';
  }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectBudget {
  totalBudget: number;
  spentAmount: number;
  remainingAmount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD';
  breakdown: Array<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
  }>;
  milestonePayments: Array<{
    milestoneId: string;
    milestoneName: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'invoiced' | 'paid' | 'overdue';
    invoiceNumber?: string;
    paidAt?: string;
  }>;
  expenses: Array<{
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    approvedBy?: string;
    receiptUrl?: string;
  }>;
}

export interface ProjectTimeline {
  startDate: string;
  endDate: string;
  estimatedEndDate: string;
  phases: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
    milestones: string[]; // milestone IDs
    progress: number;
  }>;
  criticalPath: string[]; // milestone IDs
  risks: Array<{
    id: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    probability: 'low' | 'medium' | 'high';
    mitigation: string;
    status: 'identified' | 'mitigated' | 'resolved';
  }>;
}

export interface ClientProject {
  id: string;
  name: string;
  description: string;
  type: 'web_development' | 'mobile_app' | 'ai_solution' | 'enterprise_software' | 'consulting';
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Client information
  client: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone?: string;
    address?: string;
    logo?: string;
  };
  
  // Team and access
  projectManager: TeamMember;
  teamMembers: TeamMember[];
  clientUsers: ClientUser[];
  
  // Project details
  timeline: ProjectTimeline;
  milestones: ProjectMilestone[];
  budget: ProjectBudget;
  technologies: string[];
  services: string[];
  
  // Communication and collaboration
  activities: ProjectActivity[];
  meetings: ProjectMeeting[];
  files: ProjectFile[];
  
  // Progress tracking
  overallProgress: number; // 0-100
  health: 'healthy' | 'at_risk' | 'critical' | 'completed';
  lastActivity: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Settings
  settings: {
    clientCanViewBudget: boolean;
    clientCanViewTeam: boolean;
    clientCanUploadFiles: boolean;
    clientCanScheduleMeetings: boolean;
    emailNotifications: boolean;
    slackIntegration?: boolean;
  };
}

export interface ProjectDashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  upcomingDeadlines: number;
  overallHealth: 'healthy' | 'at_risk' | 'critical';
  budgetUtilization: number;
  teamUtilization: number;
  clientSatisfactionScore?: number;
  avgProjectDuration: number;
  onTimeDeliveryRate: number;
}

export interface ProjectNotification {
  id: string;
  projectId: string;
  projectName: string;
  type: 'milestone_due' | 'deliverable_ready' | 'approval_needed' | 'meeting_reminder' | 
        'file_shared' | 'comment_mention' | 'budget_alert' | 'timeline_change';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface ProjectMessage {
  id: string;
  projectId: string;
  threadId?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  attachments?: ProjectFile[];
  mentions?: string[]; // user IDs
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
  editedAt?: string;
  createdAt: string;
  replies?: ProjectMessage[];
}

export interface ProjectSearch {
  query: string;
  filters: {
    projects?: string[];
    types?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    authors?: string[];
    categories?: string[];
  };
  results: {
    projects: ClientProject[];
    files: ProjectFile[];
    messages: ProjectMessage[];
    activities: ProjectActivity[];
    total: number;
  };
}

// API Response Types
export interface ProjectAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    totalPages?: number;
    limit?: number;
  };
}

export type ProjectResponse = ProjectAPIResponse<ClientProject>;
export type ProjectListResponse = ProjectAPIResponse<ClientProject[]>;
export type ProjectStatsResponse = ProjectAPIResponse<ProjectDashboardStats>;
export type ProjectActivitiesResponse = ProjectAPIResponse<ProjectActivity[]>;
export type ProjectFilesResponse = ProjectAPIResponse<ProjectFile[]>;
export type ProjectNotificationsResponse = ProjectAPIResponse<ProjectNotification[]>;