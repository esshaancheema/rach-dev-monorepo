import { logger } from '../utils/logger';
import { AnalyticsEngine, AnalyticsQuery } from './analytics-engine.service';
import { CacheService } from './cache.service';
import { EmailService } from './email.service';

export interface Report {
  id: string;
  name: string;
  description?: string;
  query: AnalyticsQuery;
  schedule: ReportSchedule;
  format: 'pdf' | 'csv' | 'json' | 'xlsx';
  recipients: string[];
  template?: string;
  filters: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export interface ReportSchedule {
  type: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string; // HH:mm format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  timezone: string;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  filePath?: string;
  fileSize?: number;
  executionTime?: number;
}

export class ReportService {
  private scheduledReports: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private analyticsEngine: AnalyticsEngine,
    private cacheService?: CacheService,
    private emailService?: EmailService
  ) {
    this.initializeScheduler();
  }

  public async createReport(
    reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>,
    userId: string
  ): Promise<Report> {
    const report: Report = {
      ...reportData,
      id: this.generateReportId(),
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextRun: this.calculateNextRun(reportData.schedule),
    };

    // Validate report configuration
    await this.validateReport(report);

    // Store report (in a real implementation, this would go to a database)
    await this.storeReport(report);

    // Schedule the report if active
    if (report.isActive) {
      this.scheduleReport(report);
    }

    logger.info('Report created successfully', { reportId: report.id, userId });
    return report;
  }

  public async updateReport(
    reportId: string,
    updates: Partial<Report>,
    userId: string
  ): Promise<Report> {
    const report = await this.getReport(reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }

    // Check permissions
    if (report.createdBy !== userId) {
      throw new Error('Insufficient permissions to update report');
    }

    const updatedReport: Report = {
      ...report,
      ...updates,
      updatedAt: new Date(),
    };

    // Recalculate next run if schedule changed
    if (updates.schedule) {
      updatedReport.nextRun = this.calculateNextRun(updates.schedule);
    }

    // Validate updated report
    await this.validateReport(updatedReport);

    // Store updated report
    await this.storeReport(updatedReport);

    // Update scheduling
    this.unscheduleReport(reportId);
    if (updatedReport.isActive) {
      this.scheduleReport(updatedReport);
    }

    logger.info('Report updated successfully', { reportId, userId });
    return updatedReport;
  }

  public async getReport(reportId: string): Promise<Report | null> {
    // In a real implementation, this would fetch from a database
    const cacheKey = `report:${reportId}`;
    
    if (this.cacheService) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Simulate database fetch
    const report = null; // Placeholder

    if (report && this.cacheService) {
      await this.cacheService.set(cacheKey, report, 300); // 5 minutes cache
    }

    return report;
  }

  public async getUserReports(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    } = {}
  ): Promise<{ reports: Report[]; total: number }> {
    const { page = 1, limit = 20, search, isActive } = options;

    // In a real implementation, this would query the database
    // with pagination, search, and filters
    
    return {
      reports: [], // Placeholder
      total: 0,
    };
  }

  public async executeReport(reportId: string): Promise<ReportExecution> {
    const report = await this.getReport(reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }

    const execution: ReportExecution = {
      id: this.generateExecutionId(),
      reportId,
      status: 'pending',
      startedAt: new Date(),
    };

    try {
      // Store execution record
      await this.storeExecution(execution);

      // Update status to running
      execution.status = 'running';
      await this.storeExecution(execution);

      // Execute the analytics query
      const startTime = Date.now();
      const queryResult = await this.analyticsEngine.query(report.query);
      const executionTime = Date.now() - startTime;

      // Generate report file
      const filePath = await this.generateReportFile(report, queryResult);
      const fileSize = await this.getFileSize(filePath);

      // Update execution record
      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.filePath = filePath;
      execution.fileSize = fileSize;
      execution.executionTime = executionTime;

      await this.storeExecution(execution);

      // Send report to recipients
      if (report.recipients.length > 0) {
        await this.sendReportToRecipients(report, execution);
      }

      // Update report's last run
      report.lastRun = new Date();
      report.nextRun = this.calculateNextRun(report.schedule);
      await this.storeReport(report);

      logger.info('Report executed successfully', { 
        reportId, 
        executionId: execution.id,
        executionTime,
        fileSize 
      });

    } catch (error) {
      // Update execution record with error
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.error = error.message;
      await this.storeExecution(execution);

      logger.error('Report execution failed', { 
        reportId, 
        executionId: execution.id,
        error: error.message 
      });

      throw error;
    }

    return execution;
  }

  public async getReportExecutions(
    reportId: string,
    options: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ executions: ReportExecution[]; total: number }> {
    const { page = 1, limit = 20 } = options;

    // In a real implementation, this would query the database
    return {
      executions: [], // Placeholder
      total: 0,
    };
  }

  public async downloadReportFile(executionId: string): Promise<Buffer> {
    const execution = await this.getExecution(executionId);
    
    if (!execution) {
      throw new Error('Execution not found');
    }

    if (execution.status !== 'completed' || !execution.filePath) {
      throw new Error('Report file not available');
    }

    // In a real implementation, this would read from file system or cloud storage
    // return fs.readFileSync(execution.filePath);
    return Buffer.from(''); // Placeholder
  }

  public async deleteReport(reportId: string, userId: string): Promise<void> {
    const report = await this.getReport(reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }

    // Check permissions
    if (report.createdBy !== userId) {
      throw new Error('Insufficient permissions to delete report');
    }

    // Unschedule the report
    this.unscheduleReport(reportId);

    // Delete report and related executions
    await this.deleteReportData(reportId);

    logger.info('Report deleted successfully', { reportId, userId });
  }

  private async validateReport(report: Report): Promise<void> {
    // Validate basic structure
    if (!report.name || report.name.trim() === '') {
      throw new Error('Report name is required');
    }

    if (!report.query) {
      throw new Error('Report query is required');
    }

    if (!report.schedule) {
      throw new Error('Report schedule is required');
    }

    if (!report.format) {
      throw new Error('Report format is required');
    }

    if (!['pdf', 'csv', 'json', 'xlsx'].includes(report.format)) {
      throw new Error(`Invalid report format: ${report.format}`);
    }

    // Validate schedule
    this.validateSchedule(report.schedule);

    // Validate query
    await this.validateQuery(report.query);
  }

  private validateSchedule(schedule: ReportSchedule): void {
    if (!['once', 'daily', 'weekly', 'monthly', 'quarterly'].includes(schedule.type)) {
      throw new Error(`Invalid schedule type: ${schedule.type}`);
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(schedule.time)) {
      throw new Error('Invalid time format. Use HH:mm format');
    }

    // Validate day of week for weekly schedules
    if (schedule.type === 'weekly') {
      if (schedule.dayOfWeek === undefined || schedule.dayOfWeek < 0 || schedule.dayOfWeek > 6) {
        throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
      }
    }

    // Validate day of month for monthly schedules
    if (schedule.type === 'monthly') {
      if (schedule.dayOfMonth === undefined || schedule.dayOfMonth < 1 || schedule.dayOfMonth > 31) {
        throw new Error('Day of month must be between 1 and 31');
      }
    }
  }

  private async validateQuery(query: AnalyticsQuery): Promise<void> {
    // Validate that metrics exist and are accessible
    if (!query.metrics || query.metrics.length === 0) {
      throw new Error('Query must include at least one metric');
    }

    // Additional query validation could be added here
  }

  private calculateNextRun(schedule: ReportSchedule): Date {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);

    switch (schedule.type) {
      case 'once':
        // For one-time reports, set next run to the specified time today or tomorrow
        const onceDate = new Date();
        onceDate.setHours(hours, minutes, 0, 0);
        if (onceDate <= now) {
          onceDate.setDate(onceDate.getDate() + 1);
        }
        return onceDate;

      case 'daily':
        const dailyDate = new Date();
        dailyDate.setHours(hours, minutes, 0, 0);
        if (dailyDate <= now) {
          dailyDate.setDate(dailyDate.getDate() + 1);
        }
        return dailyDate;

      case 'weekly':
        const weeklyDate = new Date();
        const currentDay = weeklyDate.getDay();
        const targetDay = schedule.dayOfWeek!;
        const daysUntilTarget = (targetDay - currentDay + 7) % 7;
        
        weeklyDate.setDate(weeklyDate.getDate() + daysUntilTarget);
        weeklyDate.setHours(hours, minutes, 0, 0);
        
        // If it's the same day but time has passed, schedule for next week
        if (daysUntilTarget === 0 && weeklyDate <= now) {
          weeklyDate.setDate(weeklyDate.getDate() + 7);
        }
        
        return weeklyDate;

      case 'monthly':
        const monthlyDate = new Date();
        monthlyDate.setDate(schedule.dayOfMonth!);
        monthlyDate.setHours(hours, minutes, 0, 0);
        
        // If the date has passed this month, schedule for next month
        if (monthlyDate <= now) {
          monthlyDate.setMonth(monthlyDate.getMonth() + 1);
        }
        
        return monthlyDate;

      case 'quarterly':
        const quarterlyDate = new Date();
        const currentMonth = quarterlyDate.getMonth();
        const nextQuarterMonth = Math.floor(currentMonth / 3) * 3 + 3;
        
        quarterlyDate.setMonth(nextQuarterMonth);
        quarterlyDate.setDate(1);
        quarterlyDate.setHours(hours, minutes, 0, 0);
        
        return quarterlyDate;

      default:
        throw new Error(`Unsupported schedule type: ${schedule.type}`);
    }
  }

  private scheduleReport(report: Report): void {
    if (!report.nextRun) {
      return;
    }

    const timeUntilRun = report.nextRun.getTime() - Date.now();
    
    if (timeUntilRun <= 0) {
      // If the time has passed, execute immediately and reschedule
      this.executeReport(report.id).catch(error => {
        logger.error('Scheduled report execution failed', { 
          reportId: report.id, 
          error: error.message 
        });
      });
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        await this.executeReport(report.id);
        
        // Reschedule if it's a recurring report
        if (report.schedule.type !== 'once') {
          const updatedReport = await this.getReport(report.id);
          if (updatedReport && updatedReport.isActive) {
            this.scheduleReport(updatedReport);
          }
        }
      } catch (error) {
        logger.error('Scheduled report execution failed', { 
          reportId: report.id, 
          error: error.message 
        });
      }
    }, timeUntilRun);

    this.scheduledReports.set(report.id, timeout);
    
    logger.debug('Report scheduled', { 
      reportId: report.id, 
      nextRun: report.nextRun.toISOString() 
    });
  }

  private unscheduleReport(reportId: string): void {
    const timeout = this.scheduledReports.get(reportId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledReports.delete(reportId);
      logger.debug('Report unscheduled', { reportId });
    }
  }

  private async generateReportFile(
    report: Report,
    queryResult: any
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${report.format}`;
    const filePath = `/tmp/reports/${filename}`;

    switch (report.format) {
      case 'json':
        await this.generateJSONReport(filePath, queryResult);
        break;
      case 'csv':
        await this.generateCSVReport(filePath, queryResult);
        break;
      case 'xlsx':
        await this.generateExcelReport(filePath, queryResult);
        break;
      case 'pdf':
        await this.generatePDFReport(filePath, report, queryResult);
        break;
      default:
        throw new Error(`Unsupported report format: ${report.format}`);
    }

    return filePath;
  }

  private async generateJSONReport(filePath: string, data: any): Promise<void> {
    // In a real implementation, this would write to file system
    logger.debug('Generated JSON report', { filePath });
  }

  private async generateCSVReport(filePath: string, data: any): Promise<void> {
    // In a real implementation, this would generate CSV using a library like csv-writer
    logger.debug('Generated CSV report', { filePath });
  }

  private async generateExcelReport(filePath: string, data: any): Promise<void> {
    // In a real implementation, this would generate Excel using a library like exceljs
    logger.debug('Generated Excel report', { filePath });
  }

  private async generatePDFReport(filePath: string, report: Report, data: any): Promise<void> {
    // In a real implementation, this would generate PDF using a library like puppeteer or pdfkit
    logger.debug('Generated PDF report', { filePath });
  }

  private async getFileSize(filePath: string): Promise<number> {
    // In a real implementation, this would get file size from file system
    return 0; // Placeholder
  }

  private async sendReportToRecipients(
    report: Report,
    execution: ReportExecution
  ): Promise<void> {
    if (!this.emailService) {
      logger.warn('Email service not available, skipping report delivery');
      return;
    }

    const subject = `Report: ${report.name}`;
    const body = `
      Your scheduled report "${report.name}" has been generated.
      
      Execution Details:
      - Execution Time: ${execution.executionTime}ms
      - File Size: ${execution.fileSize} bytes
      - Generated At: ${execution.completedAt?.toISOString()}
      
      Please find the report attached.
    `;

    for (const recipient of report.recipients) {
      try {
        await this.emailService.sendEmail({
          to: recipient,
          subject,
          body,
          attachments: execution.filePath ? [{
            filename: `report.${report.format}`,
            path: execution.filePath,
          }] : [],
        });
      } catch (error) {
        logger.error('Failed to send report to recipient', { 
          reportId: report.id,
          recipient,
          error: error.message 
        });
      }
    }
  }

  private async initializeScheduler(): Promise<void> {
    // In a real implementation, this would load active reports from database
    // and schedule them
    logger.info('Report scheduler initialized');
  }

  private async storeReport(report: Report): Promise<void> {
    // In a real implementation, this would store to a database
    logger.debug('Storing report', { reportId: report.id });
  }

  private async storeExecution(execution: ReportExecution): Promise<void> {
    // In a real implementation, this would store to a database
    logger.debug('Storing execution', { executionId: execution.id });
  }

  private async getExecution(executionId: string): Promise<ReportExecution | null> {
    // In a real implementation, this would fetch from a database
    return null; // Placeholder
  }

  private async deleteReportData(reportId: string): Promise<void> {
    // In a real implementation, this would delete from database
    logger.debug('Deleting report data', { reportId });
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}