import { BaseApiClient } from '../base-client';
import { 
  ApiClientConfig, 
  Subscription,
  PaginatedResponse,
  PaginationParams 
} from '../types';

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  currency: string;
  features: string[];
  limits: {
    apiRequests: number;
    codeGenerations: number;
    storageLimit: number;
    projects: number;
    users: number;
  };
  popular?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  periodStart: string;
  periodEnd: string;
  invoiceUrl?: string;
  pdfUrl?: string;
  createdAt: string;
  paidAt?: string;
}

export interface UsageRecord {
  id: string;
  subscriptionId: string;
  metric: string;
  quantity: number;
  timestamp: string;
  description?: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface TaxInfo {
  taxId?: string;
  taxExempt: boolean;
  country: string;
  region?: string;
}

export class BillingClient extends BaseApiClient {
  constructor(config: ApiClientConfig = {}) {
    super({
      baseURL: process.env.NEXT_PUBLIC_BILLING_SERVICE_URL || 'http://localhost:4004',
      ...config,
    });
  }

  // Plans
  async getPlans() {
    return this.get<Plan[]>('/billing/plans');
  }

  async getPlan(planId: string) {
    return this.get<Plan>(`/billing/plans/${planId}`);
  }

  // Subscriptions
  async getCurrentSubscription() {
    return this.get<Subscription>('/billing/subscription');
  }

  async createSubscription(data: {
    planId: string;
    paymentMethodId?: string;
    trialDays?: number;
    couponCode?: string;
  }) {
    return this.post<Subscription>('/billing/subscription', data);
  }

  async updateSubscription(data: {
    planId?: string;
    quantity?: number;
    prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
  }) {
    return this.put<Subscription>('/billing/subscription', data);
  }

  async cancelSubscription(data: {
    immediately?: boolean;
    reason?: string;
    feedback?: string;
  }) {
    return this.post('/billing/subscription/cancel', data);
  }

  async reactivateSubscription() {
    return this.post<Subscription>('/billing/subscription/reactivate');
  }

  async pauseSubscription(data: {
    resumeAt?: string;
  }) {
    return this.post('/billing/subscription/pause', data);
  }

  async resumeSubscription() {
    return this.post<Subscription>('/billing/subscription/resume');
  }

  // Payment methods
  async getPaymentMethods() {
    return this.get<PaymentMethod[]>('/billing/payment-methods');
  }

  async addPaymentMethod(data: {
    paymentMethodId: string;
    setAsDefault?: boolean;
  }) {
    return this.post<PaymentMethod>('/billing/payment-methods', data);
  }

  async setDefaultPaymentMethod(paymentMethodId: string) {
    return this.post(`/billing/payment-methods/${paymentMethodId}/set-default`);
  }

  async removePaymentMethod(paymentMethodId: string) {
    return this.delete(`/billing/payment-methods/${paymentMethodId}`);
  }

  // Billing address and tax info
  async getBillingAddress() {
    return this.get<BillingAddress>('/billing/address');
  }

  async updateBillingAddress(address: BillingAddress) {
    return this.put<BillingAddress>('/billing/address', address);
  }

  async getTaxInfo() {
    return this.get<TaxInfo>('/billing/tax-info');
  }

  async updateTaxInfo(taxInfo: TaxInfo) {
    return this.put<TaxInfo>('/billing/tax-info', taxInfo);
  }

  // Invoices
  async getInvoices(params: PaginationParams = {}) {
    return this.get<PaginatedResponse<Invoice>>('/billing/invoices', params);
  }

  async getInvoice(invoiceId: string) {
    return this.get<Invoice>(`/billing/invoices/${invoiceId}`);
  }

  async downloadInvoice(invoiceId: string) {
    return this.get<{ pdfUrl: string }>(`/billing/invoices/${invoiceId}/download`);
  }

  async payInvoice(invoiceId: string, paymentMethodId?: string) {
    return this.post(`/billing/invoices/${invoiceId}/pay`, { paymentMethodId });
  }

  // Usage tracking
  async getCurrentUsage() {
    return this.get<{
      period: {
        start: string;
        end: string;
      };
      usage: {
        apiRequests: number;
        codeGenerations: number;
        storageUsed: number;
      };
      limits: {
        apiRequests: number;
        codeGenerations: number;
        storageLimit: number;
      };
      overages: {
        apiRequests: number;
        codeGenerations: number;
        storage: number;
      };
    }>('/billing/usage');
  }

  async getUsageHistory(params: {
    startDate: string;
    endDate: string;
    metric?: string;
  }) {
    return this.get<UsageRecord[]>('/billing/usage/history', params);
  }

  async reportUsage(data: {
    metric: string;
    quantity: number;
    timestamp?: string;
    idempotencyKey?: string;
  }) {
    return this.post<UsageRecord>('/billing/usage/report', data);
  }

  // Coupons and discounts
  async validateCoupon(code: string) {
    return this.post<{
      valid: boolean;
      discount: {
        type: 'percent' | 'amount';
        value: number;
        duration: 'once' | 'repeating' | 'forever';
        durationInMonths?: number;
      };
      restrictions?: {
        minimumAmount?: number;
        plans?: string[];
      };
    }>('/billing/coupons/validate', { code });
  }

  async applyCoupon(code: string) {
    return this.post('/billing/coupons/apply', { code });
  }

  async removeCoupon() {
    return this.delete('/billing/coupons');
  }

  // Billing portal
  async createPortalSession(returnUrl?: string) {
    return this.post<{ url: string }>('/billing/portal', { returnUrl });
  }

  // Webhooks (for admin)
  async getWebhookEvents(params: PaginationParams = {}) {
    return this.get<PaginatedResponse<{
      id: string;
      type: string;
      data: any;
      processed: boolean;
      createdAt: string;
    }>>('/billing/webhooks/events', params);
  }

  async retryWebhook(eventId: string) {
    return this.post(`/billing/webhooks/events/${eventId}/retry`);
  }

  // Analytics (for admin)
  async getBillingAnalytics(params: {
    startDate: string;
    endDate: string;
    granularity?: 'day' | 'week' | 'month';
  }) {
    return this.get<{
      revenue: Array<{
        date: string;
        amount: number;
        currency: string;
      }>;
      subscriptions: {
        active: number;
        new: number;
        canceled: number;
        churned: number;
      };
      mrr: number;
      churnRate: number;
      avgRevenuePerUser: number;
    }>('/billing/analytics', params);
  }

  async getRevenueBreakdown(params: {
    startDate: string;
    endDate: string;
    groupBy?: 'plan' | 'interval' | 'country';
  }) {
    return this.get<Array<{
      category: string;
      revenue: number;
      subscriptions: number;
      percentage: number;
    }>>('/billing/analytics/revenue-breakdown', params);
  }

  // Tax calculation
  async calculateTax(data: {
    amount: number;
    currency: string;
    country: string;
    region?: string;
    postalCode?: string;
  }) {
    return this.post<{
      taxAmount: number;
      taxRate: number;
      totalAmount: number;
      breakdown: Array<{
        type: string;
        rate: number;
        amount: number;
      }>;
    }>('/billing/tax/calculate', data);
  }

  // Credits and balance
  async getBalance() {
    return this.get<{
      credits: number;
      balance: number;
      currency: string;
    }>('/billing/balance');
  }

  async addCredits(data: {
    amount: number;
    description?: string;
    paymentMethodId?: string;
  }) {
    return this.post('/billing/credits/add', data);
  }

  async getCreditHistory(params: PaginationParams = {}) {
    return this.get<PaginatedResponse<{
      id: string;
      type: 'purchase' | 'usage' | 'refund' | 'bonus';
      amount: number;
      description: string;
      createdAt: string;
    }>>('/billing/credits/history', params);
  }
}