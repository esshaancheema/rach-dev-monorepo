import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import Stripe from 'stripe';
import { logger } from '../utils/logger';
import { config } from '../config';

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler(async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.id;
    const organizationId = request.user?.organizationId;
    
    // Log the error with context
    logger.error({
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode,
      },
      userId,
      organizationId,
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
    }, 'Request failed with error');

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return handleStripeError(error, reply);
    }

    // Handle validation errors
    if (error.validation) {
      return reply.code(400).send({
        success: false,
        error: 'Validation Error',
        details: error.validation,
        code: 'VALIDATION_ERROR',
      });
    }

    // Handle authentication errors
    if (error.statusCode === 401) {
      return reply.code(401).send({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
    }

    // Handle authorization errors
    if (error.statusCode === 403) {
      return reply.code(403).send({
        success: false,
        error: 'Access forbidden',
        code: 'FORBIDDEN',
      });
    }

    // Handle not found errors
    if (error.statusCode === 404) {
      return reply.code(404).send({
        success: false,
        error: 'Resource not found',
        code: 'NOT_FOUND',
      });
    }

    // Handle rate limiting errors
    if (error.statusCode === 429) {
      return reply.code(429).send({
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMITED',
        retryAfter: 3600,
      });
    }

    // Handle billing-specific errors
    if (error.message.includes('subscription') && error.message.includes('not found')) {
      return reply.code(404).send({
        success: false,
        error: 'Subscription not found',
        code: 'SUBSCRIPTION_NOT_FOUND',
      });
    }

    if (error.message.includes('customer') && error.message.includes('not found')) {
      return reply.code(404).send({
        success: false,
        error: 'Customer not found',
        code: 'CUSTOMER_NOT_FOUND',
      });
    }

    if (error.message.includes('payment') && error.message.includes('failed')) {
      return reply.code(402).send({
        success: false,
        error: 'Payment processing failed',
        code: 'PAYMENT_FAILED',
      });
    }

    // Handle database errors
    if (error.message.includes('connection') || error.message.includes('timeout')) {
      return reply.code(503).send({
        success: false,
        error: 'Service temporarily unavailable',
        code: 'SERVICE_UNAVAILABLE',
      });
    }

    // Handle JWT errors
    if (error.message.includes('jwt') || error.message.includes('token')) {
      return reply.code(401).send({
        success: false,
        error: 'Invalid or expired authentication token',
        code: 'INVALID_TOKEN',
      });
    }

    // Handle file size errors
    if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
      return reply.code(413).send({
        success: false,
        error: 'Request payload too large',
        code: 'PAYLOAD_TOO_LARGE',
      });
    }

    // Handle JSON parsing errors
    if (error.message.includes('JSON') || error.message.includes('syntax')) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid JSON in request body',
        code: 'INVALID_JSON',
      });
    }

    // Default internal server error
    const statusCode = error.statusCode || 500;
    const isDevelopment = config.NODE_ENV === 'development';
    
    return reply.code(statusCode).send({
      success: false,
      error: isDevelopment ? error.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...(isDevelopment && { 
        stack: error.stack,
        details: error 
      }),
    });
  });

  // Handle 404 errors for unmatched routes
  app.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    logger.warn({
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    }, 'Route not found');

    return reply.code(404).send({
      success: false,
      error: `Route ${request.method} ${request.url} not found`,
      code: 'ROUTE_NOT_FOUND',
    });
  });
}

function handleStripeError(error: Stripe.errors.StripeError, reply: FastifyReply) {
  logger.error({ stripeError: error }, 'Stripe API error');

  switch (error.type) {
    case 'StripeCardError':
      return reply.code(402).send({
        success: false,
        error: 'Card was declined',
        code: 'CARD_DECLINED',
        details: {
          decline_code: (error as Stripe.errors.StripeCardError).decline_code,
          message: error.message,
        },
      });

    case 'StripeRateLimitError':
      return reply.code(429).send({
        success: false,
        error: 'Too many requests to Stripe API',
        code: 'STRIPE_RATE_LIMIT',
        retryAfter: 30,
      });

    case 'StripeInvalidRequestError':
      return reply.code(400).send({
        success: false,
        error: 'Invalid request to payment processor',
        code: 'INVALID_PAYMENT_REQUEST',
        details: error.message,
      });

    case 'StripeAPIError':
      return reply.code(502).send({
        success: false,
        error: 'Payment processor error',
        code: 'PAYMENT_PROCESSOR_ERROR',
      });

    case 'StripeConnectionError':
      return reply.code(503).send({
        success: false,
        error: 'Payment processor unavailable',
        code: 'PAYMENT_PROCESSOR_UNAVAILABLE',
      });

    case 'StripeAuthenticationError':
      return reply.code(500).send({
        success: false,
        error: 'Payment processor authentication failed',
        code: 'PAYMENT_PROCESSOR_AUTH_ERROR',
      });

    default:
      return reply.code(500).send({
        success: false,
        error: 'Payment processing error',
        code: 'PAYMENT_ERROR',
        details: config.NODE_ENV === 'development' ? error.message : undefined,
      });
  }
}

// Custom error classes
export class BillingError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'BILLING_ERROR', details?: any) {
    super(message);
    this.name = 'BillingError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class SubscriptionError extends BillingError {
  constructor(message: string, details?: any) {
    super(message, 400, 'SUBSCRIPTION_ERROR', details);
    this.name = 'SubscriptionError';
  }
}

export class PaymentError extends BillingError {
  constructor(message: string, details?: any) {
    super(message, 402, 'PAYMENT_ERROR', details);
    this.name = 'PaymentError';
  }
}

export class UsageError extends BillingError {
  constructor(message: string, details?: any) {
    super(message, 400, 'USAGE_ERROR', details);
    this.name = 'UsageError';
  }
}

export class InvoiceError extends BillingError {
  constructor(message: string, details?: any) {
    super(message, 400, 'INVOICE_ERROR', details);
    this.name = 'InvoiceError';
  }
}