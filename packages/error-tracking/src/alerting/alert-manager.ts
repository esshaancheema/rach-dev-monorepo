import { EventEmitter } from 'events';
import nodemailer from 'nodemailer';
import { IncomingWebhook } from 'slack-webhook';
import { Client as DiscordClient, TextChannel, EmbedBuilder } from 'discord.js';
import axios from 'axios';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  conditions: AlertCondition[];
  actions: AlertAction[];
  enabled: boolean;
  priority: AlertPriority;
  cooldownMs: number; // Minimum time between alerts
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface AlertCondition {
  type: 'error_rate' | 'error_count' | 'response_time' | 'custom';
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
  threshold: number;
  timeWindowMs: number;
  field?: string; // For custom conditions
}

export interface AlertAction {
  type: 'email' | 'slack' | 'discord' | 'webhook' | 'sms' | 'pagerduty';
  config: Record<string, any>;
  enabled: boolean;
}

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  priority: AlertPriority;
  message: string;
  description?: string;
  timestamp: Date;
  service?: string;
  environment?: string;
  tags: string[];
  metadata: Record<string, any>;
  conditions: AlertCondition[];
  resolved: boolean;
  resolvedAt?: Date;
}

export interface MetricData {
  service: string;
  environment: string;
  timestamp: Date;
  errorCount: number;
  totalRequests: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  customMetrics: Record<string, number>;
}

export class AlertManager extends EventEmitter {
  private rules: Map<string, AlertRule> = new Map();
  private alertHistory: Map<string, AlertEvent> = new Map();
  private lastAlertTimes: Map<string, number> = new Map();
  private metricBuffer: MetricData[] = [];
  private emailTransporter?: nodemailer.Transporter;
  private slackWebhook?: IncomingWebhook;
  private discordClient?: DiscordClient;

  constructor(private config: AlertManagerConfig) {
    super();
    this.initializeTransports();
    this.startMetricProcessor();
  }

  private initializeTransports(): void {
    // Initialize email transporter
    if (this.config.email) {
      this.emailTransporter = nodemailer.createTransport({
        host: this.config.email.host,
        port: this.config.email.port,
        secure: this.config.email.secure,
        auth: {
          user: this.config.email.user,
          pass: this.config.email.password,
        },
      });
    }

    // Initialize Slack webhook
    if (this.config.slack?.webhookUrl) {
      this.slackWebhook = new IncomingWebhook(this.config.slack.webhookUrl);
    }

    // Initialize Discord client
    if (this.config.discord?.token) {
      this.discordClient = new DiscordClient({
        intents: ['Guilds', 'GuildMessages'],
      });
      this.discordClient.login(this.config.discord.token);
    }
  }

  // Add alert rule
  public addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    console.log(`📋 Alert rule added: ${rule.name}`);
  }

  // Remove alert rule
  public removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    console.log(`🗑️ Alert rule removed: ${ruleId}`);
  }

  // Update alert rule
  public updateRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    console.log(`📝 Alert rule updated: ${rule.name}`);
  }

  // Get all rules
  public getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  // Get rule by ID
  public getRule(ruleId: string): AlertRule | undefined {
    return this.rules.get(ruleId);
  }

  // Process incoming metrics
  public processMetrics(metrics: MetricData): void {
    this.metricBuffer.push(metrics);
    this.emit('metricsReceived', metrics);
    
    // Check alert rules
    this.checkAlertRules(metrics);
  }

  // Check all alert rules against current metrics
  private checkAlertRules(currentMetrics: MetricData): void {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const shouldTrigger = this.evaluateRule(rule, currentMetrics);
      
      if (shouldTrigger) {
        const canAlert = this.canTriggerAlert(rule.id, rule.cooldownMs);
        
        if (canAlert) {
          this.triggerAlert(rule, currentMetrics);
        }
      }
    }
  }

  // Evaluate if a rule should trigger
  private evaluateRule(rule: AlertRule, metrics: MetricData): boolean {
    return rule.conditions.every(condition => {
      return this.evaluateCondition(condition, metrics);
    });
  }

  // Evaluate individual condition
  private evaluateCondition(condition: AlertCondition, metrics: MetricData): boolean {
    let value: number;

    switch (condition.type) {
      case 'error_rate':
        value = metrics.totalRequests > 0 ? 
          (metrics.errorCount / metrics.totalRequests) * 100 : 0;
        break;
      case 'error_count':
        value = metrics.errorCount;
        break;
      case 'response_time':
        value = metrics.avgResponseTime;
        break;
      case 'custom':
        value = condition.field ? 
          metrics.customMetrics[condition.field] || 0 : 0;
        break;
      default:
        return false;
    }

    switch (condition.operator) {
      case 'gt': return value > condition.threshold;
      case 'gte': return value >= condition.threshold;
      case 'lt': return value < condition.threshold;
      case 'lte': return value <= condition.threshold;
      case 'eq': return value === condition.threshold;
      case 'neq': return value !== condition.threshold;
      default: return false;
    }
  }

  // Check if alert can be triggered (considering cooldown)
  private canTriggerAlert(ruleId: string, cooldownMs: number): boolean {
    const lastAlertTime = this.lastAlertTimes.get(ruleId) || 0;
    const now = Date.now();
    return (now - lastAlertTime) >= cooldownMs;
  }

  // Trigger alert
  private async triggerAlert(rule: AlertRule, metrics: MetricData): Promise<void> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const alertEvent: AlertEvent = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      priority: rule.priority,
      message: this.generateAlertMessage(rule, metrics),
      description: rule.description,
      timestamp: new Date(),
      service: metrics.service,
      environment: metrics.environment,
      tags: rule.tags || [],
      metadata: {
        ...rule.metadata,
        metrics: {
          errorCount: metrics.errorCount,
          totalRequests: metrics.totalRequests,
          errorRate: metrics.totalRequests > 0 ? 
            (metrics.errorCount / metrics.totalRequests) * 100 : 0,
          avgResponseTime: metrics.avgResponseTime,
          p95ResponseTime: metrics.p95ResponseTime,
        },
      },
      conditions: rule.conditions,
      resolved: false,
    };

    // Store alert
    this.alertHistory.set(alertId, alertEvent);
    this.lastAlertTimes.set(rule.id, Date.now());

    // Execute alert actions
    await this.executeAlertActions(rule, alertEvent);

    // Emit alert event
    this.emit('alertTriggered', alertEvent);

    console.log(`🚨 Alert triggered: ${rule.name} (${alertEvent.priority})`);
  }

  // Generate alert message
  private generateAlertMessage(rule: AlertRule, metrics: MetricData): string {
    const errorRate = metrics.totalRequests > 0 ? 
      ((metrics.errorCount / metrics.totalRequests) * 100).toFixed(2) : '0.00';

    return `🚨 ${rule.name}\n` +
           `Service: ${metrics.service}\n` +
           `Environment: ${metrics.environment}\n` +
           `Error Rate: ${errorRate}%\n` +
           `Error Count: ${metrics.errorCount}\n` +
           `Avg Response Time: ${metrics.avgResponseTime}ms\n` +
           `P95 Response Time: ${metrics.p95ResponseTime}ms`;
  }

  // Execute all actions for an alert
  private async executeAlertActions(rule: AlertRule, alert: AlertEvent): Promise<void> {
    const promises = rule.actions
      .filter(action => action.enabled)
      .map(action => this.executeAction(action, alert));

    await Promise.allSettled(promises);
  }

  // Execute individual alert action
  private async executeAction(action: AlertAction, alert: AlertEvent): Promise<void> {
    try {
      switch (action.type) {
        case 'email':
          await this.sendEmailAlert(action.config, alert);
          break;
        case 'slack':
          await this.sendSlackAlert(action.config, alert);
          break;
        case 'discord':
          await this.sendDiscordAlert(action.config, alert);
          break;
        case 'webhook':
          await this.sendWebhookAlert(action.config, alert);
          break;
        case 'sms':
          await this.sendSMSAlert(action.config, alert);
          break;
        case 'pagerduty':
          await this.sendPagerDutyAlert(action.config, alert);
          break;
        default:
          console.warn(`Unknown alert action type: ${action.type}`);
      }
    } catch (error) {
      console.error(`Failed to execute ${action.type} alert:`, error);
    }
  }

  // Send email alert
  private async sendEmailAlert(config: any, alert: AlertEvent): Promise<void> {
    if (!this.emailTransporter) {
      throw new Error('Email transporter not configured');
    }

    const priorityColors = {
      low: '#36a64f',
      medium: '#ff9500',
      high: '#ff0000',
      critical: '#8b0000',
    };

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background-color: ${priorityColors[alert.priority]}; color: white; padding: 20px;">
          <h2>🚨 Alert: ${alert.ruleName}</h2>
          <p><strong>Priority:</strong> ${alert.priority.toUpperCase()}</p>
        </div>
        <div style="padding: 20px; background-color: #f5f5f5;">
          <h3>Details</h3>
          <p><strong>Service:</strong> ${alert.service}</p>
          <p><strong>Environment:</strong> ${alert.environment}</p>
          <p><strong>Time:</strong> ${alert.timestamp.toISOString()}</p>
          <p><strong>Description:</strong> ${alert.description || 'N/A'}</p>
          
          <h3>Metrics</h3>
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Error Rate</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${alert.metadata.metrics.errorRate.toFixed(2)}%</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Error Count</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${alert.metadata.metrics.errorCount}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Avg Response Time</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${alert.metadata.metrics.avgResponseTime}ms</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7;">
            <p><strong>Action Required:</strong> Please investigate this alert immediately.</p>
          </div>
        </div>
      </div>
    `;

    await this.emailTransporter.sendMail({
      from: config.from || this.config.email?.from,
      to: config.to,
      cc: config.cc,
      subject: `🚨 ${alert.priority.toUpperCase()} Alert: ${alert.ruleName}`,
      html: htmlContent,
      text: alert.message,
    });
  }

  // Send Slack alert
  private async sendSlackAlert(config: any, alert: AlertEvent): Promise<void> {
    if (!this.slackWebhook) {
      throw new Error('Slack webhook not configured');
    }

    const priorityColors = {
      low: 'good',
      medium: 'warning',
      high: 'danger',
      critical: 'danger',
    };

    const attachment = {
      color: priorityColors[alert.priority],
      title: `🚨 ${alert.ruleName}`,
      text: alert.description,
      fields: [
        {
          title: 'Service',
          value: alert.service,
          short: true,
        },
        {
          title: 'Environment',
          value: alert.environment,
          short: true,
        },
        {
          title: 'Priority',
          value: alert.priority.toUpperCase(),
          short: true,
        },
        {
          title: 'Error Rate',
          value: `${alert.metadata.metrics.errorRate.toFixed(2)}%`,
          short: true,
        },
        {
          title: 'Error Count',
          value: alert.metadata.metrics.errorCount.toString(),
          short: true,
        },
        {
          title: 'Avg Response Time',
          value: `${alert.metadata.metrics.avgResponseTime}ms`,
          short: true,
        },
      ],
      timestamp: Math.floor(alert.timestamp.getTime() / 1000),
      footer: 'Zoptal Alert System',
    };

    await this.slackWebhook.send({
      username: 'Zoptal Alerts',
      channel: config.channel || '#alerts',
      attachments: [attachment],
    });
  }

  // Send Discord alert
  private async sendDiscordAlert(config: any, alert: AlertEvent): Promise<void> {
    if (!this.discordClient || !this.discordClient.isReady()) {
      throw new Error('Discord client not ready');
    }

    const channel = await this.discordClient.channels.fetch(config.channelId) as TextChannel;
    
    const priorityColors = {
      low: 0x36a64f,
      medium: 0xff9500,
      high: 0xff0000,
      critical: 0x8b0000,
    };

    const embed = new EmbedBuilder()
      .setTitle(`🚨 ${alert.ruleName}`)
      .setDescription(alert.description || 'Alert triggered')
      .setColor(priorityColors[alert.priority])
      .addFields([
        { name: 'Service', value: alert.service || 'Unknown', inline: true },
        { name: 'Environment', value: alert.environment || 'Unknown', inline: true },
        { name: 'Priority', value: alert.priority.toUpperCase(), inline: true },
        { name: 'Error Rate', value: `${alert.metadata.metrics.errorRate.toFixed(2)}%`, inline: true },
        { name: 'Error Count', value: alert.metadata.metrics.errorCount.toString(), inline: true },
        { name: 'Avg Response Time', value: `${alert.metadata.metrics.avgResponseTime}ms`, inline: true },
      ])
      .setTimestamp(alert.timestamp)
      .setFooter({ text: 'Zoptal Alert System' });

    await channel.send({ embeds: [embed] });
  }

  // Send webhook alert
  private async sendWebhookAlert(config: any, alert: AlertEvent): Promise<void> {
    const payload = {
      alert,
      timestamp: alert.timestamp.toISOString(),
      webhook_version: '1.0',
    };

    await axios.post(config.url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Zoptal-AlertManager/1.0',
        ...(config.headers || {}),
      },
      timeout: config.timeout || 10000,
    });
  }

  // Send SMS alert (placeholder - integrate with Twilio/AWS SNS)
  private async sendSMSAlert(config: any, alert: AlertEvent): Promise<void> {
    // This would integrate with SMS service like Twilio
    console.log(`SMS Alert to ${config.phoneNumber}: ${alert.message}`);
  }

  // Send PagerDuty alert
  private async sendPagerDutyAlert(config: any, alert: AlertEvent): Promise<void> {
    const payload = {
      routing_key: config.integrationKey,
      event_action: 'trigger',
      payload: {
        summary: `${alert.ruleName} - ${alert.service}`,
        source: alert.service,
        severity: this.mapPriorityToSeverity(alert.priority),
        component: alert.service,
        group: alert.environment,
        class: 'error_tracking',
        custom_details: {
          alert_id: alert.id,
          error_rate: alert.metadata.metrics.errorRate,
          error_count: alert.metadata.metrics.errorCount,
          response_time: alert.metadata.metrics.avgResponseTime,
        },
      },
    };

    await axios.post('https://events.pagerduty.com/v2/enqueue', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private mapPriorityToSeverity(priority: AlertPriority): string {
    const mapping = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'critical',
    };
    return mapping[priority];
  }

  // Resolve alert
  public resolveAlert(alertId: string, reason?: string): void {
    const alert = this.alertHistory.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      alert.metadata.resolutionReason = reason;
      
      this.emit('alertResolved', alert);
      console.log(`✅ Alert resolved: ${alert.ruleName}`);
    }
  }

  // Get alert history
  public getAlertHistory(
    limit: number = 100,
    service?: string,
    priority?: AlertPriority
  ): AlertEvent[] {
    let alerts = Array.from(this.alertHistory.values());
    
    if (service) {
      alerts = alerts.filter(a => a.service === service);
    }
    
    if (priority) {
      alerts = alerts.filter(a => a.priority === priority);
    }
    
    return alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Start metric processor
  private startMetricProcessor(): void {
    setInterval(() => {
      // Clean old metrics from buffer
      const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
      this.metricBuffer = this.metricBuffer.filter(
        m => m.timestamp.getTime() > cutoff
      );
    }, 60 * 60 * 1000); // Clean every hour
  }

  // Get metrics summary
  public getMetricsSummary(timeRangeMs: number = 60 * 60 * 1000): Record<string, any> {
    const cutoff = Date.now() - timeRangeMs;
    const recentMetrics = this.metricBuffer.filter(
      m => m.timestamp.getTime() > cutoff
    );

    if (recentMetrics.length === 0) {
      return {};
    }

    const summary: Record<string, any> = {};
    
    for (const metric of recentMetrics) {
      const key = `${metric.service}-${metric.environment}`;
      
      if (!summary[key]) {
        summary[key] = {
          service: metric.service,
          environment: metric.environment,
          totalErrors: 0,
          totalRequests: 0,
          avgResponseTime: 0,
          dataPoints: 0,
        };
      }
      
      summary[key].totalErrors += metric.errorCount;
      summary[key].totalRequests += metric.totalRequests;
      summary[key].avgResponseTime += metric.avgResponseTime;
      summary[key].dataPoints++;
    }

    // Calculate averages
    for (const key in summary) {
      const data = summary[key];
      data.avgResponseTime = data.avgResponseTime / data.dataPoints;
      data.errorRate = data.totalRequests > 0 ? 
        (data.totalErrors / data.totalRequests) * 100 : 0;
    }

    return summary;
  }
}

export interface AlertManagerConfig {
  email?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
  };
  slack?: {
    webhookUrl: string;
  };
  discord?: {
    token: string;
  };
}

// Default alert rules
export const defaultAlertRules: AlertRule[] = [
  {
    id: 'high-error-rate',
    name: 'High Error Rate',
    description: 'Error rate exceeds 5% for more than 5 minutes',
    conditions: [
      {
        type: 'error_rate',
        operator: 'gt',
        threshold: 5.0,
        timeWindowMs: 5 * 60 * 1000,
      },
    ],
    actions: [
      {
        type: 'email',
        enabled: true,
        config: {
          to: ['devops@zoptal.com', 'alerts@zoptal.com'],
        },
      },
      {
        type: 'slack',
        enabled: true,
        config: {
          channel: '#alerts',
        },
      },
    ],
    enabled: true,
    priority: 'high',
    cooldownMs: 15 * 60 * 1000, // 15 minutes
    tags: ['error-rate', 'performance'],
  },
  {
    id: 'critical-error-rate',
    name: 'Critical Error Rate',
    description: 'Error rate exceeds 15% - immediate attention required',
    conditions: [
      {
        type: 'error_rate',
        operator: 'gt',
        threshold: 15.0,
        timeWindowMs: 2 * 60 * 1000,
      },
    ],
    actions: [
      {
        type: 'email',
        enabled: true,
        config: {
          to: ['devops@zoptal.com', 'cto@zoptal.com'],
        },
      },
      {
        type: 'slack',
        enabled: true,
        config: {
          channel: '#critical-alerts',
        },
      },
      {
        type: 'pagerduty',
        enabled: true,
        config: {
          integrationKey: process.env.PAGERDUTY_INTEGRATION_KEY,
        },
      },
    ],
    enabled: true,
    priority: 'critical',
    cooldownMs: 5 * 60 * 1000, // 5 minutes
    tags: ['error-rate', 'critical'],
  },
  {
    id: 'slow-response-time',
    name: 'Slow Response Time',
    description: 'Average response time exceeds 2 seconds',
    conditions: [
      {
        type: 'response_time',
        operator: 'gt',
        threshold: 2000,
        timeWindowMs: 10 * 60 * 1000,
      },
    ],
    actions: [
      {
        type: 'email',
        enabled: true,
        config: {
          to: ['performance@zoptal.com'],
        },
      },
      {
        type: 'slack',
        enabled: true,
        config: {
          channel: '#performance',
        },
      },
    ],
    enabled: true,
    priority: 'medium',
    cooldownMs: 30 * 60 * 1000, // 30 minutes
    tags: ['performance', 'response-time'],
  },
];