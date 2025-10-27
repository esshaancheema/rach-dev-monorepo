import { logger } from '../utils/logger';

export interface SlackMessage {
  text: string;
  channel?: string;
  username?: string;
  icon_emoji?: string;
  attachments?: SlackAttachment[];
  blocks?: SlackBlock[];
}

export interface SlackAttachment {
  color?: string;
  pretext?: string;
  author_name?: string;
  author_link?: string;
  author_icon?: string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
  image_url?: string;
  thumb_url?: string;
  footer?: string;
  footer_icon?: string;
  ts?: number;
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  elements?: any[];
  accessory?: any;
}

export class SlackService {
  private botToken: string;
  private webhookUrl: string;

  constructor(botToken?: string, webhookUrl?: string) {
    this.botToken = botToken || process.env.SLACK_BOT_TOKEN || '';
    this.webhookUrl = webhookUrl || process.env.SLACK_WEBHOOK_URL || '';
  }

  public async sendMessage(channel: string, text: string, options: Partial<SlackMessage> = {}): Promise<void> {
    try {
      const message: SlackMessage = {
        text,
        channel,
        ...options,
      };

      // In a real implementation, this would use the Slack Web API
      await this.sendSlackMessage(message);

      logger.info('Slack message sent successfully', {
        channel,
        textLength: text.length,
      });

    } catch (error) {
      logger.error('Failed to send Slack message', {
        channel,
        error: error.message,
      });
      throw error;
    }
  }

  public async sendWebhook(webhookUrl: string, message: SlackMessage): Promise<void> {
    try {
      // In a real implementation, this would make an HTTP POST to the webhook URL
      await this.simulateWebhookRequest(webhookUrl, message);

      logger.info('Slack webhook sent successfully', {
        webhookUrl: webhookUrl.substring(0, 50) + '...',
        textLength: message.text.length,
      });

    } catch (error) {
      logger.error('Failed to send Slack webhook', {
        webhookUrl: webhookUrl.substring(0, 50) + '...',
        error: error.message,
      });
      throw error;
    }
  }

  public async sendRichMessage(
    channel: string,
    title: string,
    message: string,
    fields: Array<{ title: string; value: string; short?: boolean }> = [],
    color: string = 'good'
  ): Promise<void> {
    const attachment: SlackAttachment = {
      color,
      title,
      text: message,
      fields,
      footer: 'Zoptal Analytics',
      ts: Math.floor(Date.now() / 1000),
    };

    await this.sendMessage(channel, '', {
      attachments: [attachment],
    });
  }

  public async sendAlertMessage(
    channel: string,
    alertName: string,
    status: 'triggered' | 'resolved',
    conditions: Array<{ field: string; expected: any; actual: any; met: boolean }>,
    data: any
  ): Promise<void> {
    const color = status === 'triggered' ? 'danger' : 'good';
    const emoji = status === 'triggered' ? '🚨' : '✅';
    
    const fields = conditions.map(condition => ({
      title: condition.field,
      value: `Expected: ${condition.expected}, Actual: ${condition.actual}`,
      short: true,
    }));

    const title = `${emoji} Alert: ${alertName}`;
    const text = `Status: ${status.toUpperCase()}`;

    await this.sendRichMessage(channel, title, text, fields, color);
  }

  public async sendReportNotification(
    channel: string,
    reportName: string,
    executionTime: number,
    fileSize: number,
    downloadUrl?: string
  ): Promise<void> {
    const fields = [
      {
        title: 'Execution Time',
        value: `${executionTime}ms`,
        short: true,
      },
      {
        title: 'File Size',
        value: this.formatFileSize(fileSize),
        short: true,
      },
    ];

    if (downloadUrl) {
      fields.push({
        title: 'Download',
        value: `<${downloadUrl}|Download Report>`,
        short: false,
      });
    }

    await this.sendRichMessage(
      channel,
      `📊 Report Generated: ${reportName}`,
      'Your scheduled report has been generated and is ready for download.',
      fields,
      'good'
    );
  }

  public async sendMetricUpdate(
    channel: string,
    metricName: string,
    currentValue: number,
    previousValue: number,
    trend: 'up' | 'down' | 'flat'
  ): Promise<void> {
    const trendEmoji = {
      up: '📈',
      down: '📉',
      flat: '➡️',
    }[trend];

    const change = currentValue - previousValue;
    const percentChange = previousValue !== 0 ? ((change / previousValue) * 100).toFixed(2) : 'N/A';

    const fields = [
      {
        title: 'Current Value',
        value: currentValue.toLocaleString(),
        short: true,
      },
      {
        title: 'Previous Value',
        value: previousValue.toLocaleString(),
        short: true,
      },
      {
        title: 'Change',
        value: `${change > 0 ? '+' : ''}${change.toLocaleString()} (${percentChange}%)`,
        short: true,
      },
    ];

    await this.sendRichMessage(
      channel,
      `${trendEmoji} Metric Update: ${metricName}`,
      `Latest metric update for ${metricName}`,
      fields,
      trend === 'up' ? 'good' : trend === 'down' ? 'warning' : '#439FE0'
    );
  }

  private async sendSlackMessage(message: SlackMessage): Promise<void> {
    // In a real implementation, this would use the Slack Web API
    // Example with node-slack-sdk:
    // const result = await this.client.chat.postMessage(message);
    
    await this.simulateSlackAPI(message);
  }

  private async simulateWebhookRequest(webhookUrl: string, message: SlackMessage): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Simulate occasional failures
    if (Math.random() < 0.02) { // 2% failure rate
      throw new Error('Slack webhook request failed');
    }

    logger.debug('Slack webhook simulation completed', {
      webhookUrl: webhookUrl.substring(0, 50) + '...',
      messageLength: message.text.length,
    });
  }

  private async simulateSlackAPI(message: SlackMessage): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 150));

    // Simulate occasional failures
    if (Math.random() < 0.02) { // 2% failure rate
      throw new Error('Slack API request failed');
    }

    logger.debug('Slack API simulation completed', {
      channel: message.channel,
      messageLength: message.text.length,
    });
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}