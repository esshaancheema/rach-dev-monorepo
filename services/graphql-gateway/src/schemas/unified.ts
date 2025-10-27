import { gql } from 'apollo-server-express';

// Unified GraphQL Schema combining all microservices
export const typeDefs = gql`
  # Scalars
  scalar DateTime
  scalar Upload
  scalar JSON
  scalar EmailAddress
  scalar UUID

  # Directives
  directive @auth on FIELD_DEFINITION
  directive @rateLimit(max: Int!, window: String!) on FIELD_DEFINITION
  directive @complexity(value: Int!) on FIELD_DEFINITION
  directive @cacheControl(maxAge: Int, scope: CacheControlScope) on FIELD_DEFINITION | OBJECT | INTERFACE

  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }

  # Common Types
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  interface Node {
    id: ID!
  }

  interface Error {
    message: String!
    code: String!
  }

  type ValidationError implements Error {
    message: String!
    code: String!
    field: String!
  }

  type UnauthorizedError implements Error {
    message: String!
    code: String!
  }

  type NotFoundError implements Error {
    message: String!
    code: String!
    resource: String!
  }

  # User Management
  type User implements Node {
    id: ID!
    email: EmailAddress!
    firstName: String
    lastName: String
    avatar: String
    role: UserRole!
    status: UserStatus!
    tenantId: String
    preferences: UserPreferences
    createdAt: DateTime!
    updatedAt: DateTime!
    lastLoginAt: DateTime
    
    # Relationships
    projects: ProjectConnection
    notifications: NotificationConnection
    billing: BillingInfo
  }

  enum UserRole {
    USER
    ADMIN
    SUPER_ADMIN
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
    PENDING_VERIFICATION
  }

  type UserPreferences {
    theme: String
    language: String
    timezone: String
    emailNotifications: Boolean
    pushNotifications: Boolean
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type UserEdge {
    node: User!
    cursor: String!
  }

  # Project Management
  type Project implements Node {
    id: ID!
    name: String!
    description: String
    status: ProjectStatus!
    visibility: ProjectVisibility!
    ownerId: ID!
    owner: User!
    
    # Project structure
    files: [ProjectFile!]!
    folders: [ProjectFolder!]!
    
    # Metadata
    tags: [String!]!
    language: String
    framework: String
    
    # Collaboration
    collaborators: [ProjectCollaborator!]!
    invitations: [ProjectInvitation!]!
    
    # AI Integration
    aiSessions: [AISession!]!
    
    # Analytics
    stats: ProjectStats
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ProjectStatus {
    ACTIVE
    ARCHIVED
    DELETED
  }

  enum ProjectVisibility {
    PRIVATE
    PUBLIC
    TEAM
  }

  type ProjectFile implements Node {
    id: ID!
    name: String!
    path: String!
    content: String
    size: Int!
    mimeType: String!
    checksum: String!
    projectId: ID!
    project: Project!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProjectFolder implements Node {
    id: ID!
    name: String!
    path: String!
    projectId: ID!
    project: Project!
    parent: ProjectFolder
    children: [ProjectFolder!]!
    files: [ProjectFile!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProjectCollaborator {
    userId: ID!
    user: User!
    projectId: ID!
    project: Project!
    role: CollaboratorRole!
    permissions: [Permission!]!
    joinedAt: DateTime!
  }

  enum CollaboratorRole {
    OWNER
    ADMIN
    EDITOR
    VIEWER
  }

  enum Permission {
    READ
    WRITE
    DELETE
    MANAGE_COLLABORATORS
    MANAGE_SETTINGS
  }

  type ProjectInvitation {
    id: ID!
    email: EmailAddress!
    role: CollaboratorRole!
    projectId: ID!
    project: Project!
    inviterId: ID!
    inviter: User!
    status: InvitationStatus!
    expiresAt: DateTime!
    createdAt: DateTime!
  }

  enum InvitationStatus {
    PENDING
    ACCEPTED
    REJECTED
    EXPIRED
  }

  type ProjectStats {
    totalFiles: Int!
    totalSize: Int!
    languageBreakdown: [LanguageStats!]!
    aiUsage: AIUsageStats!
    collaboratorCount: Int!
    lastActivity: DateTime
  }

  type LanguageStats {
    language: String!
    fileCount: Int!
    lineCount: Int!
    percentage: Float!
  }

  type ProjectConnection {
    edges: [ProjectEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ProjectEdge {
    node: Project!
    cursor: String!
  }

  # AI Integration
  type AISession implements Node {
    id: ID!
    type: AISessionType!
    projectId: ID
    project: Project
    userId: ID!
    user: User!
    
    # Conversation
    messages: [AIMessage!]!
    
    # Context
    context: JSON
    model: String!
    temperature: Float
    maxTokens: Int
    
    # Metadata
    title: String
    status: AISessionStatus!
    tokensUsed: Int!
    cost: Float
    
    createdAt: DateTime!
    updatedAt: DateTime!
    completedAt: DateTime
  }

  enum AISessionType {
    CHAT
    CODE_GENERATION
    CODE_REVIEW
    DOCUMENTATION
    DEBUGGING
    OPTIMIZATION
  }

  enum AISessionStatus {
    ACTIVE
    COMPLETED
    FAILED
    CANCELLED
  }

  type AIMessage {
    id: ID!
    sessionId: ID!
    role: MessageRole!
    content: String!
    tokens: Int
    timestamp: DateTime!
    metadata: JSON
  }

  enum MessageRole {
    USER
    ASSISTANT
    SYSTEM
  }

  type AIUsageStats {
    totalSessions: Int!
    totalTokens: Int!
    totalCost: Float!
    averageSessionLength: Float!
    mostUsedType: AISessionType
    monthlyUsage: [MonthlyUsage!]!
  }

  type MonthlyUsage {
    month: String!
    sessions: Int!
    tokens: Int!
    cost: Float!
  }

  # Notifications
  type Notification implements Node {
    id: ID!
    userId: ID!
    user: User!
    
    # Content
    title: String!
    message: String!
    type: NotificationType!
    priority: NotificationPriority!
    
    # Metadata
    data: JSON
    actionUrl: String
    
    # Status
    read: Boolean!
    readAt: DateTime
    
    # Delivery
    channels: [NotificationChannel!]!
    deliveryStatus: [DeliveryStatus!]!
    
    createdAt: DateTime!
    updatedAt: DateTime!
    expiresAt: DateTime
  }

  enum NotificationType {
    SYSTEM
    PROJECT_UPDATE
    COLLABORATION
    BILLING
    SECURITY
    AI_COMPLETION
    MAINTENANCE
  }

  enum NotificationPriority {
    LOW
    NORMAL
    HIGH
    URGENT
  }

  enum NotificationChannel {
    IN_APP
    EMAIL
    SMS
    PUSH
    WEBHOOK
  }

  type DeliveryStatus {
    channel: NotificationChannel!
    status: DeliveryStatusType!
    timestamp: DateTime!
    error: String
  }

  enum DeliveryStatusType {
    PENDING
    SENT
    DELIVERED
    FAILED
    BOUNCED
  }

  type NotificationConnection {
    edges: [NotificationEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
    unreadCount: Int!
  }

  type NotificationEdge {
    node: Notification!
    cursor: String!
  }

  # Billing
  type BillingInfo {
    userId: ID!
    user: User!
    
    # Subscription
    subscription: Subscription
    
    # Payment
    paymentMethods: [PaymentMethod!]!
    defaultPaymentMethod: PaymentMethod
    
    # Usage
    usage: UsageInfo!
    
    # History
    invoices: InvoiceConnection!
    transactions: TransactionConnection!
    
    # Settings
    billingAddress: BillingAddress
    taxInfo: TaxInfo
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Subscription {
    id: ID!
    plan: SubscriptionPlan!
    status: SubscriptionStatus!
    currentPeriodStart: DateTime!
    currentPeriodEnd: DateTime!
    cancelAtPeriodEnd: Boolean!
    canceledAt: DateTime
    trialStart: DateTime
    trialEnd: DateTime
    metadata: JSON
  }

  type SubscriptionPlan {
    id: ID!
    name: String!
    description: String
    amount: Int! # in cents
    currency: String!
    interval: BillingInterval!
    features: [PlanFeature!]!
    limits: PlanLimits!
    metadata: JSON
  }

  enum SubscriptionStatus {
    ACTIVE
    CANCELED
    INCOMPLETE
    INCOMPLETE_EXPIRED
    PAST_DUE
    TRIALING
    UNPAID
  }

  enum BillingInterval {
    MONTH
    YEAR
  }

  type PlanFeature {
    name: String!
    description: String
    included: Boolean!
    limit: Int
  }

  type PlanLimits {
    projects: Int
    storage: Int # in GB
    aiTokens: Int
    collaborators: Int
    apiCalls: Int
  }

  type PaymentMethod {
    id: ID!
    type: PaymentMethodType!
    card: CardInfo
    default: Boolean!
    expiresAt: DateTime
    createdAt: DateTime!
  }

  enum PaymentMethodType {
    CARD
    BANK_ACCOUNT
    PAYPAL
  }

  type CardInfo {
    brand: String!
    last4: String!
    expMonth: Int!
    expYear: Int!
    country: String
  }

  type UsageInfo {
    period: BillingPeriod!
    projects: UsageMetric!
    storage: UsageMetric!
    aiTokens: UsageMetric!
    apiCalls: UsageMetric!
    bandwidth: UsageMetric!
  }

  type BillingPeriod {
    start: DateTime!
    end: DateTime!
  }

  type UsageMetric {
    used: Int!
    limit: Int!
    percentage: Float!
    overage: Int!
  }

  type Invoice {
    id: ID!
    number: String!
    status: InvoiceStatus!
    amount: Int!
    currency: String!
    dueDate: DateTime!
    paidAt: DateTime
    items: [InvoiceItem!]!
    subtotal: Int!
    tax: Int!
    total: Int!
    pdfUrl: String
    createdAt: DateTime!
  }

  enum InvoiceStatus {
    DRAFT
    OPEN
    PAID
    VOID
    UNCOLLECTIBLE
  }

  type InvoiceItem {
    description: String!
    quantity: Int!
    unitAmount: Int!
    amount: Int!
    period: BillingPeriod
  }

  type InvoiceConnection {
    edges: [InvoiceEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type InvoiceEdge {
    node: Invoice!
    cursor: String!
  }

  type Transaction {
    id: ID!
    type: TransactionType!
    status: TransactionStatus!
    amount: Int!
    currency: String!
    description: String
    invoiceId: ID
    invoice: Invoice
    paymentMethodId: ID
    paymentMethod: PaymentMethod
    failureReason: String
    createdAt: DateTime!
  }

  enum TransactionType {
    PAYMENT
    REFUND
    ADJUSTMENT
    CREDIT
  }

  enum TransactionStatus {
    PENDING
    SUCCEEDED
    FAILED
    CANCELED
  }

  type TransactionConnection {
    edges: [TransactionEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type TransactionEdge {
    node: Transaction!
    cursor: String!
  }

  type BillingAddress {
    line1: String!
    line2: String
    city: String!
    state: String
    postalCode: String!
    country: String!
  }

  type TaxInfo {
    taxId: String
    taxExempt: Boolean!
    automaticTax: Boolean!
  }

  # Input Types
  input CreateProjectInput {
    name: String!
    description: String
    visibility: ProjectVisibility = PRIVATE
    language: String
    framework: String
    tags: [String!] = []
    template: String
  }

  input UpdateProjectInput {
    name: String
    description: String
    visibility: ProjectVisibility
    language: String
    framework: String
    tags: [String!]
  }

  input ProjectFiltersInput {
    status: ProjectStatus
    visibility: ProjectVisibility
    language: String
    framework: String
    tags: [String!]
    search: String
    ownerId: ID
  }

  input CreateAISessionInput {
    type: AISessionType!
    projectId: ID
    model: String = "gpt-3.5-turbo"
    temperature: Float = 0.7
    maxTokens: Int = 2000
    context: JSON
  }

  input SendAIMessageInput {
    sessionId: ID!
    content: String!
    metadata: JSON
  }

  input UpdateUserPreferencesInput {
    theme: String
    language: String
    timezone: String
    emailNotifications: Boolean
    pushNotifications: Boolean
  }

  input NotificationFiltersInput {
    type: NotificationType
    priority: NotificationPriority
    read: Boolean
    startDate: DateTime
    endDate: DateTime
  }

  input PaginationInput {
    first: Int
    after: String
    last: Int
    before: String
  }

  # Union Types
  union SearchResult = User | Project | AISession

  # Query Root
  type Query {
    # Authentication
    me: User @auth
    
    # Users
    user(id: ID!): User @auth
    users(
      filters: UserFiltersInput
      pagination: PaginationInput
    ): UserConnection @auth
    
    # Projects
    project(id: ID!): Project @auth
    projects(
      filters: ProjectFiltersInput
      pagination: PaginationInput
    ): ProjectConnection @auth
    myProjects(
      filters: ProjectFiltersInput
      pagination: PaginationInput
    ): ProjectConnection @auth
    
    # AI
    aiSession(id: ID!): AISession @auth
    aiSessions(
      filters: AISessionFiltersInput
      pagination: PaginationInput
    ): AISessionConnection @auth
    
    # Notifications
    notifications(
      filters: NotificationFiltersInput
      pagination: PaginationInput
    ): NotificationConnection @auth
    unreadNotificationCount: Int! @auth
    
    # Billing
    billingInfo: BillingInfo @auth
    subscriptionPlans: [SubscriptionPlan!]!
    invoice(id: ID!): Invoice @auth
    
    # Search
    search(
      query: String!
      type: SearchType
      pagination: PaginationInput
    ): [SearchResult!]! @auth
    
    # Analytics
    analyticsOverview: AnalyticsOverview @auth
    projectAnalytics(projectId: ID!): ProjectAnalytics @auth
  }

  # Mutation Root
  type Mutation {
    # Authentication
    login(email: EmailAddress!, password: String!): AuthPayload!
    register(input: RegisterInput!): AuthPayload!
    logout: Boolean!
    refreshToken: AuthPayload!
    
    # User Management
    updateProfile(input: UpdateProfileInput!): User! @auth
    updatePreferences(input: UpdateUserPreferencesInput!): User! @auth
    changePassword(currentPassword: String!, newPassword: String!): Boolean! @auth
    
    # Project Management
    createProject(input: CreateProjectInput!): Project! @auth
    updateProject(id: ID!, input: UpdateProjectInput!): Project! @auth
    deleteProject(id: ID!): Boolean! @auth
    
    # File Management
    uploadFile(projectId: ID!, file: Upload!, path: String): ProjectFile! @auth
    updateFile(id: ID!, content: String!): ProjectFile! @auth
    deleteFile(id: ID!): Boolean! @auth
    
    # Collaboration
    inviteCollaborator(projectId: ID!, email: EmailAddress!, role: CollaboratorRole!): ProjectInvitation! @auth
    respondToInvitation(invitationId: ID!, accept: Boolean!): Boolean! @auth
    updateCollaboratorRole(projectId: ID!, userId: ID!, role: CollaboratorRole!): ProjectCollaborator! @auth
    removeCollaborator(projectId: ID!, userId: ID!): Boolean! @auth
    
    # AI Integration
    createAISession(input: CreateAISessionInput!): AISession! @auth @rateLimit(max: 20, window: "1h")
    sendAIMessage(input: SendAIMessageInput!): AIMessage! @auth @rateLimit(max: 100, window: "1h")
    cancelAISession(sessionId: ID!): Boolean! @auth
    
    # Notifications
    markNotificationRead(id: ID!): Notification! @auth
    markAllNotificationsRead: Boolean! @auth
    deleteNotification(id: ID!): Boolean! @auth
    
    # Billing
    updateSubscription(planId: ID!): Subscription! @auth
    cancelSubscription: Subscription! @auth
    addPaymentMethod(input: PaymentMethodInput!): PaymentMethod! @auth
    updateDefaultPaymentMethod(paymentMethodId: ID!): Boolean! @auth
    removePaymentMethod(paymentMethodId: ID!): Boolean! @auth
    
    # Admin Operations
    adminDeleteUser(userId: ID!): Boolean! @auth
    adminUpdateUserStatus(userId: ID!, status: UserStatus!): User! @auth
    adminCreateSubscriptionPlan(input: CreateSubscriptionPlanInput!): SubscriptionPlan! @auth
  }

  # Subscription Root
  type Subscription {
    # Real-time updates
    projectUpdates(projectId: ID!): ProjectUpdate! @auth
    fileChanges(projectId: ID!): FileChange! @auth
    collaboratorUpdates(projectId: ID!): CollaboratorUpdate! @auth
    
    # Notifications
    notifications: Notification! @auth
    
    # AI Sessions
    aiMessageUpdates(sessionId: ID!): AIMessage! @auth
    aiSessionStatusUpdates(sessionId: ID!): AISessionStatus! @auth
  }

  # Additional Types for Subscriptions
  type ProjectUpdate {
    type: ProjectUpdateType!
    project: Project!
    user: User!
    timestamp: DateTime!
  }

  enum ProjectUpdateType {
    CREATED
    UPDATED
    DELETED
    ARCHIVED
  }

  type FileChange {
    type: FileChangeType!
    file: ProjectFile!
    user: User!
    timestamp: DateTime!
  }

  enum FileChangeType {
    CREATED
    UPDATED
    DELETED
    MOVED
  }

  type CollaboratorUpdate {
    type: CollaboratorUpdateType!
    collaborator: ProjectCollaborator!
    user: User!
    timestamp: DateTime!
  }

  enum CollaboratorUpdateType {
    ADDED
    REMOVED
    ROLE_CHANGED
  }

  # Missing Types
  input UserFiltersInput {
    role: UserRole
    status: UserStatus
    search: String
    tenantId: String
  }

  input AISessionFiltersInput {
    type: AISessionType
    status: AISessionStatus
    projectId: ID
    startDate: DateTime
    endDate: DateTime
  }

  type AISessionConnection {
    edges: [AISessionEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type AISessionEdge {
    node: AISession!
    cursor: String!
  }

  enum SearchType {
    ALL
    USERS
    PROJECTS
    AI_SESSIONS
  }

  type AnalyticsOverview {
    totalProjects: Int!
    totalUsers: Int!
    totalAISessions: Int!
    monthlyGrowth: Float!
    topLanguages: [LanguageStats!]!
  }

  type ProjectAnalytics {
    project: Project!
    fileCount: Int!
    totalSize: Int!
    languageBreakdown: [LanguageStats!]!
    collaboratorActivity: [CollaboratorActivity!]!
    aiUsage: AIUsageStats!
  }

  type CollaboratorActivity {
    user: User!
    commitsCount: Int!
    filesModified: Int!
    lastActivity: DateTime!
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
    user: User!
    expiresAt: DateTime!
  }

  input RegisterInput {
    email: EmailAddress!
    password: String!
    firstName: String!
    lastName: String!
  }

  input UpdateProfileInput {
    firstName: String
    lastName: String
    avatar: String
  }

  input PaymentMethodInput {
    type: PaymentMethodType!
    token: String!
  }

  input CreateSubscriptionPlanInput {
    name: String!
    description: String
    amount: Int!
    currency: String!
    interval: BillingInterval!
    features: [PlanFeatureInput!]!
    limits: PlanLimitsInput!
  }

  input PlanFeatureInput {
    name: String!
    description: String
    included: Boolean!
    limit: Int
  }

  input PlanLimitsInput {
    projects: Int!
    storage: Int!
    aiTokens: Int!
    collaborators: Int!
    apiCalls: Int!
  }
`;