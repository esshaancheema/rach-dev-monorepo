'use client';

import { LeadData, LeadSource, LeadScoringRule, EmailSequence } from './types';
import { trackBusinessEvent } from '@/lib/analytics/google-analytics';

export class LeadManager {
  private static instance: LeadManager;
  private leads: Map<string, LeadData> = new Map();
  private scoringRules: LeadScoringRule[] = [];
  private emailSequences: EmailSequence[] = [];

  static getInstance(): LeadManager {
    if (!LeadManager.instance) {
      LeadManager.instance = new LeadManager();
    }
    return LeadManager.instance;
  }

  // Initialize lead tracking
  initializeTracking(): void {
    if (typeof window === 'undefined') return;

    this.trackPageViews();
    this.trackUserBehavior();
    this.loadStoredLeads();
    this.initializeScoring();
  }

  // Create new lead
  async createLead(data: Partial<LeadData>): Promise<LeadData> {
    const leadId = this.generateLeadId();
    const source = this.detectLeadSource();
    const utmParams = this.getUTMParameters();
    
    const lead: LeadData = {
      id: leadId,
      email: data.email || '',
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
      phone: data.phone,
      jobTitle: data.jobTitle,
      companySize: data.companySize,
      industry: data.industry,
      serviceInterest: data.serviceInterest || [],
      budget: data.budget,
      timeline: data.timeline,
      message: data.message,
      source,
      utm: utmParams,
      pages: this.getVisitedPages(),
      timeOnSite: this.getTimeOnSite(),
      sessionId: this.getSessionId(),
      ipAddress: await this.getIPAddress(),
      userAgent: navigator.userAgent,
      country: await this.getLocation('country'),
      city: await this.getLocation('city'),
      engagementScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'new',
      tags: data.tags || [],
      customFields: data.customFields || {},
      ...data
    };

    // Calculate engagement score
    lead.engagementScore = this.calculateEngagementScore(lead);

    // Store lead
    this.leads.set(leadId, lead);
    this.saveToStorage(lead);

    // Track lead creation
    trackBusinessEvent.leadGenerated(
      source.name,
      lead.serviceInterest.join(','),
      lead.engagementScore
    );

    // Send to backend
    await this.sendToBackend(lead);

    // Trigger email sequence
    await this.triggerEmailSequence(lead);

    return lead;
  }

  // Update lead
  async updateLead(leadId: string, updates: Partial<LeadData>): Promise<LeadData | null> {
    const lead = this.leads.get(leadId);
    if (!lead) return null;

    const updatedLead = {
      ...lead,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Recalculate engagement score
    updatedLead.engagementScore = this.calculateEngagementScore(updatedLead);

    this.leads.set(leadId, updatedLead);
    this.saveToStorage(updatedLead);

    // Send update to backend
    await this.sendToBackend(updatedLead, 'update');

    return updatedLead;
  }

  // Get lead by ID
  getLead(leadId: string): LeadData | null {
    return this.leads.get(leadId) || null;
  }

  // Get lead by email
  getLeadByEmail(email: string): LeadData | null {
    for (const lead of this.leads.values()) {
      if (lead.email === email) {
        return lead;
      }
    }
    return null;
  }

  // Get all leads
  getAllLeads(): LeadData[] {
    return Array.from(this.leads.values());
  }

  // Filter leads
  filterLeads(criteria: {
    status?: string[];
    serviceInterest?: string[];
    companySize?: string[];
    industry?: string[];
    source?: string[];
    minEngagementScore?: number;
    dateRange?: { start: string; end: string };
  }): LeadData[] {
    let filteredLeads = this.getAllLeads();

    if (criteria.status) {
      filteredLeads = filteredLeads.filter(lead => 
        criteria.status!.includes(lead.status)
      );
    }

    if (criteria.serviceInterest) {
      filteredLeads = filteredLeads.filter(lead =>
        lead.serviceInterest.some(service =>
          criteria.serviceInterest!.includes(service)
        )
      );
    }

    if (criteria.companySize) {
      filteredLeads = filteredLeads.filter(lead =>
        lead.companySize && criteria.companySize!.includes(lead.companySize)
      );
    }

    if (criteria.industry) {
      filteredLeads = filteredLeads.filter(lead =>
        lead.industry && criteria.industry!.includes(lead.industry)
      );
    }

    if (criteria.source) {
      filteredLeads = filteredLeads.filter(lead =>
        criteria.source!.includes(lead.source.name)
      );
    }

    if (criteria.minEngagementScore) {
      filteredLeads = filteredLeads.filter(lead =>
        lead.engagementScore >= criteria.minEngagementScore!
      );
    }

    if (criteria.dateRange) {
      const startDate = new Date(criteria.dateRange.start);
      const endDate = new Date(criteria.dateRange.end);
      filteredLeads = filteredLeads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= startDate && leadDate <= endDate;
      });
    }

    return filteredLeads;
  }

  // Lead scoring
  private calculateEngagementScore(lead: LeadData): number {
    let score = 0;

    // Base scoring
    if (lead.email) score += 10;
    if (lead.firstName) score += 5;
    if (lead.lastName) score += 5;
    if (lead.company) score += 10;
    if (lead.phone) score += 15;
    if (lead.jobTitle) score += 8;

    // Service interest scoring
    score += lead.serviceInterest.length * 5;

    // Company size scoring
    if (lead.companySize === 'enterprise') score += 20;
    else if (lead.companySize === 'smb') score += 10;
    else if (lead.companySize === 'startup') score += 5;

    // Page engagement scoring
    score += Math.min(lead.pages.length * 2, 20);

    // Time on site scoring
    const timeMinutes = lead.timeOnSite / 60000;
    if (timeMinutes > 5) score += 10;
    if (timeMinutes > 10) score += 10;
    if (timeMinutes > 20) score += 15;

    // Source scoring
    switch (lead.source.type) {
      case 'organic': score += 10; break;
      case 'referral': score += 15; break;
      case 'email': score += 12; break;
      case 'social': score += 8; break;
      case 'paid': score += 5; break;
      case 'direct': score += 20; break;
    }

    // Apply custom scoring rules
    for (const rule of this.scoringRules) {
      if (rule.active && this.evaluateRule(lead, rule)) {
        score += rule.score;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private evaluateRule(lead: LeadData, rule: LeadScoringRule): boolean {
    const { field, operator, value } = rule.condition;
    const leadValue = this.getNestedValue(lead, field);

    switch (operator) {
      case 'equals':
        return leadValue === value;
      case 'not_equals':
        return leadValue !== value;
      case 'contains':
        return typeof leadValue === 'string' && leadValue.includes(value);
      case 'greater_than':
        return typeof leadValue === 'number' && leadValue > value;
      case 'less_than':
        return typeof leadValue === 'number' && leadValue < value;
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Lead source detection
  private detectLeadSource(): LeadSource {
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');

    if (utmSource && utmMedium) {
      return {
        id: `${utmSource}-${utmMedium}`,
        name: `${utmSource} (${utmMedium})`,
        type: this.mapUTMToType(utmMedium)
      };
    }

    if (referrer) {
      const domain = new URL(referrer).hostname;
      if (domain.includes('google')) {
        return { id: 'google-organic', name: 'Google Search', type: 'organic' };
      } else if (domain.includes('facebook')) {
        return { id: 'facebook', name: 'Facebook', type: 'social' };
      } else if (domain.includes('linkedin')) {
        return { id: 'linkedin', name: 'LinkedIn', type: 'social' };
      } else if (domain.includes('twitter')) {
        return { id: 'twitter', name: 'Twitter', type: 'social' };
      } else {
        return { id: 'referral', name: domain, type: 'referral' };
      }
    }

    return { id: 'direct', name: 'Direct', type: 'direct' };
  }

  private mapUTMToType(medium: string): LeadSource['type'] {
    const mediumLower = medium.toLowerCase();
    if (mediumLower.includes('email')) return 'email';
    if (mediumLower.includes('social')) return 'social';
    if (mediumLower.includes('cpc') || mediumLower.includes('paid')) return 'paid';
    if (mediumLower.includes('organic')) return 'organic';
    if (mediumLower.includes('referral')) return 'referral';
    return 'direct';
  }

  // UTM parameter extraction
  private getUTMParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      campaign: urlParams.get('utm_campaign') || undefined,
      source: urlParams.get('utm_source') || undefined,
      medium: urlParams.get('utm_medium') || undefined,
      term: urlParams.get('utm_term') || undefined,
      content: urlParams.get('utm_content') || undefined,
    };
  }

  // Page tracking
  private trackPageViews(): void {
    const pages = this.getStoredPages();
    pages.push({
      url: window.location.pathname,
      timestamp: Date.now(),
      title: document.title
    });
    localStorage.setItem('zoptal_visited_pages', JSON.stringify(pages));
  }

  private getVisitedPages(): string[] {
    const pages = this.getStoredPages();
    return [...new Set(pages.map(p => p.url))];
  }

  private getStoredPages() {
    try {
      return JSON.parse(localStorage.getItem('zoptal_visited_pages') || '[]');
    } catch {
      return [];
    }
  }

  // Time tracking
  private trackUserBehavior(): void {
    const startTime = Date.now();
    
    // Track time on site
    window.addEventListener('beforeunload', () => {
      const timeOnSite = Date.now() - startTime;
      localStorage.setItem('zoptal_time_on_site', timeOnSite.toString());
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      maxScroll = Math.max(maxScroll, scrollPercent);
      localStorage.setItem('zoptal_max_scroll', maxScroll.toString());
    });
  }

  private getTimeOnSite(): number {
    return parseInt(localStorage.getItem('zoptal_time_on_site') || '0', 10);
  }

  // Session management
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('zoptal_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('zoptal_session_id', sessionId);
    }
    return sessionId;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLeadId(): string {
    return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Location detection
  private async getLocation(type: 'country' | 'city'): Promise<string | undefined> {
    try {
      const response = await fetch('/api/location');
      const data = await response.json();
      return data[type];
    } catch {
      return undefined;
    }
  }

  private async getIPAddress(): Promise<string | undefined> {
    try {
      const response = await fetch('/api/ip');
      const data = await response.json();
      return data.ip;
    } catch {
      return undefined;
    }
  }

  // Storage management
  private saveToStorage(lead: LeadData): void {
    try {
      const leads = this.getStoredLeads();
      leads[lead.id] = lead;
      localStorage.setItem('zoptal_leads', JSON.stringify(leads));
    } catch (error) {
      console.error('Failed to save lead to storage:', error);
    }
  }

  private loadStoredLeads(): void {
    try {
      const stored = this.getStoredLeads();
      for (const [id, lead] of Object.entries(stored)) {
        this.leads.set(id, lead as LeadData);
      }
    } catch (error) {
      console.error('Failed to load stored leads:', error);
    }
  }

  private getStoredLeads(): Record<string, LeadData> {
    try {
      return JSON.parse(localStorage.getItem('zoptal_leads') || '{}');
    } catch {
      return {};
    }
  }

  // Backend integration
  private async sendToBackend(lead: LeadData, action: 'create' | 'update' = 'create'): Promise<void> {
    try {
      const endpoint = action === 'create' ? '/api/leads' : `/api/leads/${lead.id}`;
      const method = action === 'create' ? 'POST' : 'PUT';

      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
    } catch (error) {
      console.error('Failed to send lead to backend:', error);
      // Store for retry when online
      this.storeForRetry(lead, action);
    }
  }

  private storeForRetry(lead: LeadData, action: 'create' | 'update'): void {
    try {
      const pending = JSON.parse(localStorage.getItem('zoptal_pending_leads') || '[]');
      pending.push({ lead, action, timestamp: Date.now() });
      localStorage.setItem('zoptal_pending_leads', JSON.stringify(pending));
    } catch (error) {
      console.error('Failed to store lead for retry:', error);
    }
  }

  // Email sequence triggers
  private async triggerEmailSequence(lead: LeadData): Promise<void> {
    for (const sequence of this.emailSequences) {
      if (sequence.active && this.shouldTriggerSequence(lead, sequence)) {
        try {
          await fetch('/api/email-sequences/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              leadId: lead.id,
              sequenceId: sequence.id
            })
          });
        } catch (error) {
          console.error('Failed to trigger email sequence:', error);
        }
      }
    }
  }

  private shouldTriggerSequence(lead: LeadData, sequence: EmailSequence): boolean {
    if (sequence.trigger !== 'form_submit') return false;

    // Check segment criteria
    if (sequence.segmentCriteria) {
      const criteria = sequence.segmentCriteria;
      
      if (criteria.serviceInterest && 
          !lead.serviceInterest.some(s => criteria.serviceInterest!.includes(s))) {
        return false;
      }
      
      if (criteria.companySize && 
          (!lead.companySize || !criteria.companySize.includes(lead.companySize))) {
        return false;
      }
      
      if (criteria.industry && 
          (!lead.industry || !criteria.industry.includes(lead.industry))) {
        return false;
      }
      
      if (criteria.engagementScore) {
        const { min, max } = criteria.engagementScore;
        if ((min !== undefined && lead.engagementScore < min) ||
            (max !== undefined && lead.engagementScore > max)) {
          return false;
        }
      }
    }

    return true;
  }

  // Initialize scoring rules
  private initializeScoring(): void {
    this.scoringRules = [
      {
        id: 'enterprise-company',
        name: 'Enterprise Company',
        condition: { field: 'companySize', operator: 'equals', value: 'enterprise' },
        score: 25,
        active: true
      },
      {
        id: 'multiple-services',
        name: 'Multiple Service Interest',
        condition: { field: 'serviceInterest.length', operator: 'greater_than', value: 2 },
        score: 15,
        active: true
      },
      {
        id: 'high-engagement',
        name: 'High Page Engagement',
        condition: { field: 'pages.length', operator: 'greater_than', value: 5 },
        score: 10,
        active: true
      }
    ];
  }

  // Analytics integration
  getLeadMetrics(dateRange?: { start: string; end: string }) {
    const leads = dateRange ? 
      this.filterLeads({ dateRange }) : 
      this.getAllLeads();

    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(l => l.engagementScore >= 50).length;
    const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

    const sourceBreakdown = leads.reduce((acc, lead) => {
      acc[lead.source.name] = (acc[lead.source.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageEngagementScore = totalLeads > 0 ?
      leads.reduce((sum, lead) => sum + lead.engagementScore, 0) / totalLeads : 0;

    return {
      totalLeads,
      qualifiedLeads,
      conversionRate,
      averageEngagementScore,
      sourceBreakdown,
      statusBreakdown: leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}