import { logger } from '../utils/logger';
import { AnalyticsEngine, AnalyticsQuery } from './analytics-engine.service';
import { CacheService } from './cache.service';
import { EmailService } from './email.service';
import { SlackService } from './slack.service';

export interface Alert {
  id: string;
  name: string;
  description?: string;
  query: AnalyticsQuery;
  conditions: AlertCondition[];
  actions: AlertAction[];
  schedule: AlertSchedule;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastChecked?: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AlertCondition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte' | 'contains' | 'not_contains';
  value: number | string;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

export interface AlertAction {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: {
    // Email config
    recipients?: string[];
    subject?: string;
    template?: string;
    
    // Slack config
    channel?: string;
    webhook?: string;
    
    // Webhook config
    url?: string;
    method?: 'POST' | 'PUT';
    headers?: Record<string, string>;
    
    // SMS config
    phoneNumbers?: string[];
  };
}

export interface AlertSchedule {
  type: 'real_time' | 'interval';
  interval?: number; // in minutes for interval type
  timezone: string;
}

export interface AlertExecution {
  id: string;
  alertId: string;
  status: 'checking' | 'triggered' | 'resolved' | 'failed';
  triggeredAt: Date;
  resolvedAt?: Date;
  conditions: Array<{
    field: string;
    expected: any;
    actual: any;
    met: boolean;
  }>;
  actions: Array<{
    type: string;
    status: 'pending' | 'sent' | 'failed';
    error?: string;
  }>;
  data: any;
}

export class AlertService {
  private scheduledAlerts: Map<string, NodeJS.Timeout> = new Map();
  private realTimeAlerts: Map<string, Alert> = new Map();

  constructor(
    private analyticsEngine: AnalyticsEngine,
    private cacheService?: CacheService,
    private emailService?: EmailService,
    private slackService?: SlackService
  ) {
    this.initializeAlertScheduler();
  }

  public async createAlert(
    alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'triggerCount'>,
    userId: string
  ): Promise<Alert> {
    const alert: Alert = {
      ...alertData,
      id: this.generateAlertId(),
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      triggerCount: 0,
    };

    // Validate alert configuration
    await this.validateAlert(alert);

    // Store alert (in a real implementation, this would go to a database)
    await this.storeAlert(alert);

    // Schedule the alert if active
    if (alert.isActive) {
      this.scheduleAlert(alert);
    }

    logger.info('Alert created successfully', { alertId: alert.id, userId });
    return alert;
  }

  public async updateAlert(
    alertId: string,
    updates: Partial<Alert>,
    userId: string
  ): Promise<Alert> {
    const alert = await this.getAlert(alertId);
    
    if (!alert) {
      throw new Error('Alert not found');
    }

    // Check permissions
    if (alert.createdBy !== userId) {
      throw new Error('Insufficient permissions to update alert');
    }

    const updatedAlert: Alert = {
      ...alert,
      ...updates,
      updatedAt: new Date(),
    };

    // Validate updated alert
    await this.validateAlert(updatedAlert);

    // Store updated alert
    await this.storeAlert(updatedAlert);

    // Update scheduling
    this.unscheduleAlert(alertId);
    if (updatedAlert.isActive) {
      this.scheduleAlert(updatedAlert);
    }

    logger.info('Alert updated successfully', { alertId, userId });
    return updatedAlert;
  }

  public async getAlert(alertId: string): Promise<Alert | null> {
    // In a real implementation, this would fetch from a database
    const cacheKey = `alert:${alertId}`;
    
    if (this.cacheService) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Simulate database fetch
    const alert = null; // Placeholder

    if (alert && this.cacheService) {
      await this.cacheService.set(cacheKey, alert, 300); // 5 minutes cache
    }

    return alert;
  }

  public async getUserAlerts(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    } = {}
  ): Promise<{ alerts: Alert[]; total: number }> {
    const { page = 1, limit = 20, search, isActive } = options;

    // In a real implementation, this would query the database
    return {
      alerts: [], // Placeholder
      total: 0,
    };
  }

  public async executeAlert(alertId: string): Promise<AlertExecution> {
    const alert = await this.getAlert(alertId);
    
    if (!alert) {
      throw new Error('Alert not found');
    }

    const execution: AlertExecution = {
      id: this.generateExecutionId(),
      alertId,
      status: 'checking',
      triggeredAt: new Date(),
      conditions: [],
      actions: [],
      data: null,
    };

    try {
      // Execute the analytics query
      const queryResult = await this.analyticsEngine.query(alert.query);
      execution.data = queryResult;

      // Check conditions
      const conditionResults = await this.checkConditions(alert.conditions, queryResult);
      execution.conditions = conditionResults;

      const isTriggered = conditionResults.every(condition => condition.met);

      if (isTriggered) {
        execution.status = 'triggered';
        
        // Execute actions
        execution.actions = await this.executeActions(alert.actions, alert, execution);

        // Update alert statistics
        alert.lastTriggered = new Date();
        alert.triggerCount += 1;
        await this.storeAlert(alert);

        logger.info('Alert triggered', { 
          alertId, 
          executionId: execution.id,
          triggerCount: alert.triggerCount 
        });
      } else {
        execution.status = 'resolved';
        execution.resolvedAt = new Date();
        
        logger.debug('Alert conditions not met', { 
          alertId, 
          executionId: execution.id 
        });
      }

      // Update alert's last checked time
      alert.lastChecked = new Date();
      await this.storeAlert(alert);

      // Store execution record
      await this.storeExecution(execution);

    } catch (error) {
      execution.status = 'failed';
      logger.error('Alert execution failed', { 
        alertId, 
        executionId: execution.id,
        error: error.message 
      });

      await this.storeExecution(execution);
      throw error;
    }

    return execution;
  }

  public async getAlertExecutions(
    alertId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
    } = {}
  ): Promise<{ executions: AlertExecution[]; total: number }> {
    const { page = 1, limit = 20, status } = options;

    // In a real implementation, this would query the database
    return {
      executions: [], // Placeholder
      total: 0,
    };
  }

  public async deleteAlert(alertId: string, userId: string): Promise<void> {
    const alert = await this.getAlert(alertId);
    
    if (!alert) {
      throw new Error('Alert not found');
    }

    // Check permissions
    if (alert.createdBy !== userId) {
      throw new Error('Insufficient permissions to delete alert');
    }

    // Unschedule the alert
    this.unscheduleAlert(alertId);

    // Delete alert and related executions
    await this.deleteAlertData(alertId);

    logger.info('Alert deleted successfully', { alertId, userId });
  }

  public async testAlert(alertId: string): Promise<AlertExecution> {
    // Execute alert immediately for testing purposes
    return this.executeAlert(alertId);
  }

  private async validateAlert(alert: Alert): Promise<void> {
    // Validate basic structure
    if (!alert.name || alert.name.trim() === '') {
      throw new Error('Alert name is required');
    }

    if (!alert.query) {
      throw new Error('Alert query is required');
    }

    if (!alert.conditions || alert.conditions.length === 0) {
      throw new Error('Alert must have at least one condition');
    }

    if (!alert.actions || alert.actions.length === 0) {
      throw new Error('Alert must have at least one action');
    }

    // Validate conditions
    for (const condition of alert.conditions) {
      this.validateCondition(condition);
    }

    // Validate actions
    for (const action of alert.actions) {
      this.validateAction(action);
    }

    // Validate schedule
    this.validateSchedule(alert.schedule);
  }

  private validateCondition(condition: AlertCondition): void {
    if (!condition.field || condition.field.trim() === '') {
      throw new Error('Condition field is required');
    }

    const validOperators = ['gt', 'lt', 'eq', 'ne', 'gte', 'lte', 'contains', 'not_contains'];
    if (!validOperators.includes(condition.operator)) {
      throw new Error(`Invalid condition operator: ${condition.operator}`);
    }

    if (condition.value === undefined || condition.value === null) {
      throw new Error('Condition value is required');
    }

    if (condition.aggregation) {
      const validAggregations = ['sum', 'avg', 'min', 'max', 'count'];
      if (!validAggregations.includes(condition.aggregation)) {
        throw new Error(`Invalid aggregation: ${condition.aggregation}`);
      }
    }
  }

  private validateAction(action: AlertAction): void {
    const validTypes = ['email', 'slack', 'webhook', 'sms'];
    if (!validTypes.includes(action.type)) {
      throw new Error(`Invalid action type: ${action.type}`);
    }

    switch (action.type) {
      case 'email':
        if (!action.config.recipients || action.config.recipients.length === 0) {
          throw new Error('Email action requires recipients');
        }
        break;
      
      case 'slack':
        if (!action.config.channel && !action.config.webhook) {
          throw new Error('Slack action requires either channel or webhook');
        }
        break;
      
      case 'webhook':
        if (!action.config.url) {
          throw new Error('Webhook action requires URL');
        }
        break;
      
      case 'sms':
        if (!action.config.phoneNumbers || action.config.phoneNumbers.length === 0) {
          throw new Error('SMS action requires phone numbers');
        }
        break;
    }
  }

  private validateSchedule(schedule: AlertSchedule): void {
    if (!['real_time', 'interval'].includes(schedule.type)) {
      throw new Error(`Invalid schedule type: ${schedule.type}`);
    }

    if (schedule.type === 'interval') {
      if (!schedule.interval || schedule.interval < 1) {
        throw new Error('Interval schedule requires positive interval in minutes');
      }
    }
  }

  private async checkConditions(
    conditions: AlertCondition[],
    queryResult: any
  ): Promise<Array<{
    field: string;
    expected: any;
    actual: any;
    met: boolean;
  }>> {
    const results = [];

    for (const condition of conditions) {
      let actualValue = this.extractFieldValue(queryResult.data, condition.field);
      
      // Apply aggregation if specified
      if (condition.aggregation && Array.isArray(actualValue)) {
        actualValue = this.applyAggregation(actualValue, condition.aggregation);
      }

      const met = this.evaluateCondition(actualValue, condition.operator, condition.value);

      results.push({
        field: condition.field,
        expected: condition.value,
        actual: actualValue,
        met,
      });
    }

    return results;
  }

  private extractFieldValue(data: Array<Record<string, any>>, field: string): any {
    if (!data || data.length === 0) {
      return null;
    }

    // For single row results, return the field value directly
    if (data.length === 1) {
      return data[0][field];
    }

    // For multiple rows, return array of values
    return data.map(row => row[field]);
  }

  private applyAggregation(values: number[], aggregation: string): number {
    const numericValues = values.filter(v => typeof v === 'number');
    
    if (numericValues.length === 0) {
      return 0;
    }

    switch (aggregation) {
      case 'sum':
        return numericValues.reduce((sum, val) => sum + val, 0);
      case 'avg':
        return numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
      case 'min':
        return Math.min(...numericValues);
      case 'max':
        return Math.max(...numericValues);
      case 'count':
        return numericValues.length;
      default:
        return 0;
    }
  }

  private evaluateCondition(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'gt':
        return Number(actual) > Number(expected);
      case 'lt':
        return Number(actual) < Number(expected);
      case 'gte':
        return Number(actual) >= Number(expected);
      case 'lte':
        return Number(actual) <= Number(expected);
      case 'eq':
        return actual == expected;
      case 'ne':
        return actual != expected;
      case 'contains':
        return String(actual).includes(String(expected));
      case 'not_contains':
        return !String(actual).includes(String(expected));
      default:
        return false;
    }
  }

  private async executeActions(
    actions: AlertAction[],
    alert: Alert,
    execution: AlertExecution
  ): Promise<Array<{ type: string; status: string; error?: string }>> {
    const results = [];

    for (const action of actions) {
      try {
        await this.executeAction(action, alert, execution);
        results.push({ type: action.type, status: 'sent' });
      } catch (error) {
        results.push({ 
          type: action.type, 
          status: 'failed', 
          error: error.message 
        });
        
        logger.error('Alert action failed', { 
          alertId: alert.id,
          actionType: action.type,
          error: error.message 
        });
      }
    }

    return results;
  }

  private async executeAction(
    action: AlertAction,
    alert: Alert,
    execution: AlertExecution
  ): Promise<void> {
    switch (action.type) {
      case 'email':
        await this.executeEmailAction(action, alert, execution);
        break;
      case 'slack':
        await this.executeSlackAction(action, alert, execution);
        break;
      case 'webhook':
        await this.executeWebhookAction(action, alert, execution);
        break;
      case 'sms':
        await this.executeSMSAction(action, alert, execution);
        break;
      default:
        throw new Error(`Unsupported action type: ${action.type}`);
    }
  }

  private async executeEmailAction(
    action: AlertAction,
    alert: Alert,
    execution: AlertExecution
  ): Promise<void> {
    if (!this.emailService) {
      throw new Error('Email service not configured');
    }

    const subject = action.config.subject || `Alert: ${alert.name}`;
    const body = this.generateAlertMessage(alert, execution);

    for (const recipient of action.config.recipients!) {
      await this.emailService.sendEmail({
        to: recipient,
        subject,
        body,
      });
    }
  }

  private async executeSlackAction(
    action: AlertAction,
    alert: Alert,
    execution: AlertExecution
  ): Promise<void> {
    if (!this.slackService) {
      throw new Error('Slack service not configured');
    }

    const message = this.generateAlertMessage(alert, execution);

    if (action.config.webhook) {
      await this.slackService.sendWebhook(action.config.webhook, {
        text: message,
      });
    } else if (action.config.channel) {
      await this.slackService.sendMessage(action.config.channel, message);
    }
  }

  private async executeWebhookAction(
    action: AlertAction,
    alert: Alert,
    execution: AlertExecution
  ): Promise<void> {
    const payload = {
      alertId: alert.id,
      alertName: alert.name,
      status: execution.status,
      triggeredAt: execution.triggeredAt,
      conditions: execution.conditions,
      data: execution.data,
    };

    const response = await fetch(action.config.url!, {
      method: action.config.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...action.config.headers,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.statusText}`);
    }
  }

  private async executeSMSAction(
    action: AlertAction,
    alert: Alert,
    execution: AlertExecution
  ): Promise<void> {
    // In a real implementation, this would use an SMS service like Twilio
    const message = this.generateAlertMessage(alert, execution);
    
    logger.info('SMS alert would be sent', { 
      alertId: alert.id,
      phoneNumbers: action.config.phoneNumbers,
      message 
    });
  }

  private generateAlertMessage(alert: Alert, execution: AlertExecution): string {
    const conditionSummary = execution.conditions
      .map(c => `${c.field}: ${c.actual} (expected ${c.expected})`)
      .join(', ');

    return `
🚨 Alert: ${alert.name}

Status: ${execution.status}
Triggered: ${execution.triggeredAt.toISOString()}

Conditions:
${conditionSummary}

Description: ${alert.description || 'No description provided'}
    `.trim();
  }

  private scheduleAlert(alert: Alert): void {
    if (alert.schedule.type === 'real_time') {
      this.realTimeAlerts.set(alert.id, alert);
      logger.debug('Alert configured for real-time monitoring', { alertId: alert.id });
      return;
    }

    if (alert.schedule.type === 'interval' && alert.schedule.interval) {
      const intervalMs = alert.schedule.interval * 60 * 1000; // Convert minutes to milliseconds
      
      const intervalId = setInterval(async () => {
        try {
          await this.executeAlert(alert.id);
        } catch (error) {
          logger.error('Scheduled alert execution failed', { 
            alertId: alert.id, 
            error: error.message 
          });
        }
      }, intervalMs);

      this.scheduledAlerts.set(alert.id, intervalId as any);
      
      logger.debug('Alert scheduled with interval', { 
        alertId: alert.id, 
        intervalMinutes: alert.schedule.interval 
      });
    }
  }

  private unscheduleAlert(alertId: string): void {
    // Remove from real-time alerts
    this.realTimeAlerts.delete(alertId);

    // Clear interval if exists
    const intervalId = this.scheduledAlerts.get(alertId);
    if (intervalId) {
      clearInterval(intervalId);
      this.scheduledAlerts.delete(alertId);
      logger.debug('Alert unscheduled', { alertId });
    }
  }

  private async initializeAlertScheduler(): Promise<void> {
    // In a real implementation, this would load active alerts from database
    // and schedule them
    logger.info('Alert scheduler initialized');
  }

  private async storeAlert(alert: Alert): Promise<void> {
    // In a real implementation, this would store to a database
    logger.debug('Storing alert', { alertId: alert.id });
  }

  private async storeExecution(execution: AlertExecution): Promise<void> {
    // In a real implementation, this would store to a database
    logger.debug('Storing execution', { executionId: execution.id });
  }

  private async deleteAlertData(alertId: string): Promise<void> {
    // In a real implementation, this would delete from database
    logger.debug('Deleting alert data', { alertId });
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateExecutionId(): string {
    return `alertexec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}