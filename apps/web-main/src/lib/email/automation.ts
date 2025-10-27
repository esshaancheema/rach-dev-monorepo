import { EmailSequence, EmailRecipient, EmailSequenceStep, EmailCondition } from './types';
import { getSequenceById, getSequencesByType } from './sequences';
import { getTemplateById } from './templates';
import { emailService } from './providers';

export class EmailAutomationEngine {
  private activeSubscriptions: Map<string, {
    recipientId: string;
    sequenceId: string;
    currentStep: number;
    startedAt: string;
    nextExecutionAt: string;
    variables: Record<string, any>;
  }> = new Map();

  constructor() {
    // In a real implementation, you would load active subscriptions from database
    this.loadActiveSubscriptions();
  }

  /**
   * Subscribe a recipient to an email sequence
   */
  async subscribeToSequence(
    recipient: EmailRecipient,
    sequenceId: string,
    variables: Record<string, any> = {}
  ): Promise<boolean> {
    const sequence = getSequenceById(sequenceId);
    if (!sequence || !sequence.isActive) {
      console.error(`Sequence ${sequenceId} not found or inactive`);
      return false;
    }

    // Check if already subscribed
    const existingSubscription = this.findActiveSubscription(recipient.id, sequenceId);
    if (existingSubscription) {
      console.info(`Recipient ${recipient.id} already subscribed to sequence ${sequenceId}`);
      return true;
    }

    // Check if recipient matches target segment
    if (sequence.targetSegment && !this.matchesSegment(recipient, sequence.targetSegment)) {
      console.info(`Recipient ${recipient.id} doesn't match target segment ${sequence.targetSegment}`);
      return false;
    }

    const subscriptionId = `${recipient.id}_${sequenceId}_${Date.now()}`;
    const startedAt = new Date().toISOString();
    
    // Calculate first email execution time
    const firstStep = sequence.emails[0];
    const nextExecutionAt = this.calculateNextExecution(startedAt, firstStep.delay);

    this.activeSubscriptions.set(subscriptionId, {
      recipientId: recipient.id,
      sequenceId,
      currentStep: 0,
      startedAt,
      nextExecutionAt,
      variables: {
        ...this.getDefaultVariables(recipient),
        ...variables
      }
    });

    console.info(`Subscribed recipient ${recipient.id} to sequence ${sequenceId}`);
    
    // If first email has no delay, send immediately
    if (firstStep.delay === 0) {
      await this.executeStep(subscriptionId);
    }

    return true;
  }

  /**
   * Unsubscribe a recipient from a sequence
   */
  async unsubscribeFromSequence(recipientId: string, sequenceId: string): Promise<boolean> {
    const subscription = this.findActiveSubscription(recipientId, sequenceId);
    if (!subscription) {
      return false;
    }

    this.activeSubscriptions.delete(subscription.subscriptionId);
    console.info(`Unsubscribed recipient ${recipientId} from sequence ${sequenceId}`);
    return true;
  }

  /**
   * Process all pending email sends
   */
  async processPendingEmails(): Promise<void> {
    const now = new Date().toISOString();
    const pendingSubscriptions: string[] = [];

    // Find subscriptions ready for execution
    for (const [subscriptionId, subscription] of this.activeSubscriptions) {
      if (subscription.nextExecutionAt <= now) {
        pendingSubscriptions.push(subscriptionId);
      }
    }

    console.info(`Processing ${pendingSubscriptions.length} pending emails`);

    // Execute pending emails
    for (const subscriptionId of pendingSubscriptions) {
      try {
        await this.executeStep(subscriptionId);
      } catch (error) {
        console.error(`Failed to execute step for subscription ${subscriptionId}:`, error);
      }
    }
  }

  /**
   * Execute a single step in an email sequence
   */
  private async executeStep(subscriptionId: string): Promise<void> {
    const subscription = this.activeSubscriptions.get(subscriptionId);
    if (!subscription) {
      console.error(`Subscription ${subscriptionId} not found`);
      return;
    }

    const sequence = getSequenceById(subscription.sequenceId);
    if (!sequence) {
      console.error(`Sequence ${subscription.sequenceId} not found`);
      this.activeSubscriptions.delete(subscriptionId);
      return;
    }

    const currentStep = sequence.emails[subscription.currentStep];
    if (!currentStep) {
      console.info(`Sequence ${subscription.sequenceId} completed for recipient ${subscription.recipientId}`);
      this.activeSubscriptions.delete(subscriptionId);
      return;
    }

    // Check step conditions
    if (!this.evaluateConditions(currentStep.conditions || [], subscription.variables)) {
      console.info(`Conditions not met for step ${subscription.currentStep} in sequence ${subscription.sequenceId}`);
      this.moveToNextStep(subscriptionId);
      return;
    }

    // Get the email template
    const template = getTemplateById(currentStep.templateId);
    if (!template) {
      console.error(`Template ${currentStep.templateId} not found`);
      this.moveToNextStep(subscriptionId);
      return;
    }

    // Get recipient data (in real implementation, fetch from database)
    const recipient = this.getRecipientById(subscription.recipientId);
    if (!recipient) {
      console.error(`Recipient ${subscription.recipientId} not found`);
      this.activeSubscriptions.delete(subscriptionId);
      return;
    }

    try {
      // Send the email
      const result = await emailService.sendEmail(recipient, template, subscription.variables);
      
      if (result.success) {
        console.info(`Email sent successfully: ${result.messageId}`);
        
        // Track the send event
        await this.trackSequenceEvent(
          subscription.recipientId,
          subscription.sequenceId,
          subscription.currentStep,
          'sent',
          { messageId: result.messageId, templateId: template.id }
        );
        
        // Move to next step
        this.moveToNextStep(subscriptionId);
      } else {
        console.error(`Failed to send email: ${result.error}`);
        
        // Track the failure
        await this.trackSequenceEvent(
          subscription.recipientId,
          subscription.sequenceId,
          subscription.currentStep,
          'failed',
          { error: result.error, templateId: template.id }
        );
      }
    } catch (error) {
      console.error(`Error sending email for subscription ${subscriptionId}:`, error);
    }
  }

  /**
   * Move subscription to the next step
   */
  private moveToNextStep(subscriptionId: string): void {
    const subscription = this.activeSubscriptions.get(subscriptionId);
    if (!subscription) return;

    const sequence = getSequenceById(subscription.sequenceId);
    if (!sequence) return;

    const nextStepIndex = subscription.currentStep + 1;
    
    if (nextStepIndex >= sequence.emails.length) {
      // Sequence completed
      this.activeSubscriptions.delete(subscriptionId);
      console.info(`Sequence ${subscription.sequenceId} completed for recipient ${subscription.recipientId}`);
      return;
    }

    const nextStep = sequence.emails[nextStepIndex];
    const nextExecutionAt = this.calculateNextExecution(new Date().toISOString(), nextStep.delay);

    subscription.currentStep = nextStepIndex;
    subscription.nextExecutionAt = nextExecutionAt;

    console.info(`Moved to step ${nextStepIndex} for subscription ${subscriptionId}, next execution: ${nextExecutionAt}`);
  }

  /**
   * Calculate when the next email should be sent
   */
  private calculateNextExecution(fromTime: string, delayHours: number): string {
    const fromDate = new Date(fromTime);
    const nextDate = new Date(fromDate.getTime() + (delayHours * 60 * 60 * 1000));
    return nextDate.toISOString();
  }

  /**
   * Evaluate conditions for a step
   */
  private evaluateConditions(conditions: EmailCondition[], variables: Record<string, any>): boolean {
    if (conditions.length === 0) return true;

    return conditions.every(condition => {
      const value = variables[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'not_equals':
          return value !== condition.value;
        case 'contains':
          return typeof value === 'string' && value.includes(condition.value);
        case 'not_contains':
          return typeof value === 'string' && !value.includes(condition.value);
        case 'greater_than':
          return Number(value) > Number(condition.value);
        case 'less_than':
          return Number(value) < Number(condition.value);
        case 'exists':
          return value !== undefined && value !== null;
        case 'not_exists':
          return value === undefined || value === null;
        default:
          console.warn(`Unknown condition operator: ${condition.operator}`);
          return true;
      }
    });
  }

  /**
   * Check if recipient matches a segment
   */
  private matchesSegment(recipient: EmailRecipient, segmentId: string): boolean {
    // In a real implementation, you would evaluate segment conditions
    // For now, return true for active recipients
    return recipient.status === 'active';
  }

  /**
   * Get default variables for a recipient
   */
  private getDefaultVariables(recipient: EmailRecipient): Record<string, any> {
    return {
      firstName: recipient.firstName || 'there',
      lastName: recipient.lastName || '',
      email: recipient.email,
      company: recipient.company || '',
      websiteUrl: 'https://zoptal.com',
      helpUrl: 'https://zoptal.com/help',
      unsubscribeUrl: `https://zoptal.com/unsubscribe?email=${encodeURIComponent(recipient.email)}`,
      portalUrl: 'https://portal.zoptal.com',
      scheduleUrl: 'https://calendly.com/zoptal/consultation',
      consultationUrl: 'https://calendly.com/zoptal/consultation',
      portfolioUrl: 'https://zoptal.com/portfolio',
      caseStudyUrl: 'https://zoptal.com/case-studies',
      ...recipient.customFields
    };
  }

  /**
   * Find active subscription for recipient and sequence
   */
  private findActiveSubscription(recipientId: string, sequenceId: string): {
    subscriptionId: string;
    subscription: any;
  } | null {
    for (const [subscriptionId, subscription] of this.activeSubscriptions) {
      if (subscription.recipientId === recipientId && subscription.sequenceId === sequenceId) {
        return { subscriptionId, subscription };
      }
    }
    return null;
  }

  /**
   * Get recipient by ID (mock implementation)
   */
  private getRecipientById(recipientId: string): EmailRecipient | null {
    // In a real implementation, this would fetch from database
    return {
      id: recipientId,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      company: 'Acme Corp',
      phone: '+1234567890',
      source: 'website_form',
      status: 'active',
      tags: ['lead', 'interested'],
      customFields: {},
      segments: ['new-leads'],
      emailActivity: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-30T12:00:00Z'
    };
  }

  /**
   * Track sequence events
   */
  private async trackSequenceEvent(
    recipientId: string,
    sequenceId: string,
    stepIndex: number,
    eventType: string,
    metadata: Record<string, any>
  ): Promise<void> {
    // In a real implementation, save to database
    console.info('Sequence event tracked:', {
      recipientId,
      sequenceId,
      stepIndex,
      eventType,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Load active subscriptions from database
   */
  private loadActiveSubscriptions(): void {
    // In a real implementation, load from database
    console.info('Loading active email subscriptions...');
  }

  /**
   * Handle email events (opens, clicks, etc.)
   */
  async handleEmailEvent(
    recipientId: string,
    eventType: 'opened' | 'clicked' | 'bounced' | 'unsubscribed',
    metadata: Record<string, any> = {}
  ): Promise<void> {
    // Update recipient variables for condition evaluation
    const subscriptions = Array.from(this.activeSubscriptions.values())
      .filter(sub => sub.recipientId === recipientId);

    for (const subscription of subscriptions) {
      switch (eventType) {
        case 'opened':
          subscription.variables.email_opened = true;
          subscription.variables.last_open_at = new Date().toISOString();
          break;
        case 'clicked':
          subscription.variables.link_clicked = true;
          subscription.variables.last_click_at = new Date().toISOString();
          break;
        case 'bounced':
          subscription.variables.email_bounced = true;
          break;
        case 'unsubscribed':
          // Remove from all sequences
          const sequenceId = subscription.sequenceId;
          await this.unsubscribeFromSequence(recipientId, sequenceId);
          break;
      }
    }

    console.info(`Handled ${eventType} event for recipient ${recipientId}`);
  }

  /**
   * Get automation statistics
   */
  getAutomationStats(): {
    activeSubscriptions: number;
    totalSequences: number;
    pendingEmails: number;
  } {
    const now = new Date().toISOString();
    const pendingCount = Array.from(this.activeSubscriptions.values())
      .filter(sub => sub.nextExecutionAt <= now).length;

    return {
      activeSubscriptions: this.activeSubscriptions.size,
      totalSequences: getSequencesByType('welcome').length + 
                     getSequencesByType('nurture').length + 
                     getSequencesByType('onboarding').length,
      pendingEmails: pendingCount
    };
  }
}

// Export singleton instance
export const emailAutomation = new EmailAutomationEngine();

// Helper function to start automation processing
export function startEmailAutomation(): void {
  console.info('Starting email automation engine...');
  
  // Process pending emails every minute
  setInterval(async () => {
    try {
      await emailAutomation.processPendingEmails();
    } catch (error) {
      console.error('Error processing pending emails:', error);
    }
  }, 60000); // 1 minute

  console.info('Email automation engine started');
}