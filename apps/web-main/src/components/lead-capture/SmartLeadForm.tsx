'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LeadManager } from '@/lib/lead-capture/lead-manager';
import { useAnalytics } from '@/components/analytics/AnalyticsProvider';
import { trackBusinessEvent } from '@/lib/analytics/google-analytics';

// Dynamic validation schema based on form configuration
const createLeadSchema = (requiredFields: string[]) => {
  const baseSchema = {
    email: z.string().email('Please enter a valid email address'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    company: z.string().optional(),
    phone: z.string().optional(),
    jobTitle: z.string().optional(),
    companySize: z.enum(['startup', 'smb', 'enterprise']).optional(),
    industry: z.string().optional(),
    serviceInterest: z.array(z.string()).min(1, 'Please select at least one service'),
    budget: z.string().optional(),
    timeline: z.string().optional(),
    message: z.string().optional(),
  };

  // Make required fields non-optional
  const schema: any = { ...baseSchema };
  requiredFields.forEach(field => {
    if (field in schema) {
      if (field === 'serviceInterest') {
        schema[field] = z.array(z.string()).min(1, `${field} is required`);
      } else {
        schema[field] = z.string().min(1, `${field} is required`);
      }
    }
  });

  return z.object(schema);
};

type LeadFormData = {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  jobTitle?: string;
  companySize?: 'startup' | 'smb' | 'enterprise';
  industry?: string;
  serviceInterest: string[];
  budget?: string;
  timeline?: string;
  message?: string;
};

interface SmartLeadFormProps {
  variant?: 'contact' | 'newsletter' | 'quote' | 'demo' | 'consultation';
  title?: string;
  description?: string;
  submitButtonText?: string;
  successMessage?: string;
  redirectUrl?: string;
  showProgressIndicator?: boolean;
  enableSmartValidation?: boolean;
  preSelectedServices?: string[];
  compactMode?: boolean;
  className?: string;
  onSubmit?: (data: LeadFormData) => void;
  onSuccess?: (leadId: string) => void;
}

const serviceOptions = [
  { value: 'ai-development', label: 'AI Development' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'software-development', label: 'Custom Software Development' },
  { value: 'ai-integration', label: 'AI Integration' },
  { value: 'api-development', label: 'API Development' },
  { value: 'devops', label: 'DevOps & Automation' },
  { value: 'consulting', label: 'Technical Consulting' },
];

const industryOptions = [
  'Healthcare', 'Finance', 'E-commerce', 'Education', 'Manufacturing',
  'Real Estate', 'Technology', 'Media', 'Government', 'Non-profit', 'Other'
];

const budgetOptions = [
  'Under $10k', '$10k - $25k', '$25k - $50k', '$50k - $100k',
  '$100k - $250k', '$250k - $500k', '$500k+', 'Not sure yet'
];

const timelineOptions = [
  'ASAP', '1-3 months', '3-6 months', '6-12 months', '12+ months', 'Just exploring'
];

export default function SmartLeadForm({
  variant = 'contact',
  title,
  description,
  submitButtonText,
  successMessage,
  redirectUrl,
  showProgressIndicator = false,
  enableSmartValidation = true,
  preSelectedServices = [],
  compactMode = false,
  className = '',
  onSubmit,
  onSuccess
}: SmartLeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [leadManager] = useState(() => LeadManager.getInstance());
  const { trackConversion, userSegment } = useAnalytics();

  // Determine required fields based on variant
  const getRequiredFields = () => {
    switch (variant) {
      case 'newsletter':
        return ['email'];
      case 'quote':
      case 'consultation':
        return ['email', 'firstName', 'company', 'serviceInterest'];
      case 'demo':
        return ['email', 'firstName', 'company'];
      default:
        return ['email', 'serviceInterest'];
    }
  };

  const requiredFields = getRequiredFields();
  const leadSchema = createLeadSchema(requiredFields);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      serviceInterest: preSelectedServices,
    },
    mode: 'onChange'
  });

  const watchedFields = watch();

  // Initialize lead tracking
  useEffect(() => {
    leadManager.initializeTracking();
    
    // Track form view
    trackBusinessEvent.trackEvent('form_view', {
      form_variant: variant,
      user_segment: userSegment,
    });
  }, [leadManager, variant, userSegment]);

  // Smart field suggestions based on user behavior
  useEffect(() => {
    if (!enableSmartValidation) return;

    // Auto-suggest company size based on email domain
    if (watchedFields.email && watchedFields.email.includes('@')) {
      const domain = watchedFields.email.split('@')[1];
      const companySize = suggestCompanySize(domain);
      if (companySize && !watchedFields.companySize) {
        setValue('companySize', companySize);
      }
    }

    // Auto-suggest services based on current page
    if (preSelectedServices.length === 0) {
      const suggestedServices = suggestServicesFromPage();
      if (suggestedServices.length > 0) {
        setValue('serviceInterest', suggestedServices);
      }
    }
  }, [watchedFields.email, setValue, enableSmartValidation, preSelectedServices.length]);

  const suggestCompanySize = (domain: string): 'startup' | 'smb' | 'enterprise' | null => {
    // Known enterprise domains
    const enterpriseDomains = [
      'microsoft.com', 'google.com', 'amazon.com', 'apple.com', 'facebook.com',
      'salesforce.com', 'oracle.com', 'ibm.com', 'accenture.com'
    ];
    
    if (enterpriseDomains.includes(domain)) {
      return 'enterprise';
    }

    // Common startup/small business domains
    const smallDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    if (smallDomains.includes(domain)) {
      return 'startup';
    }

    return null;
  };

  const suggestServicesFromPage = (): string[] => {
    const pathname = window.location.pathname;
    
    if (pathname.includes('ai')) return ['ai-development'];
    if (pathname.includes('web')) return ['web-development'];
    if (pathname.includes('mobile')) return ['mobile-development'];
    if (pathname.includes('software')) return ['software-development'];
    if (pathname.includes('enterprise')) return ['software-development', 'ai-integration'];
    
    return [];
  };

  const onSubmitHandler: SubmitHandler<LeadFormData> = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Create lead through lead manager
      const lead = await leadManager.createLead({
        ...data,
        tags: [variant, userSegment || 'unknown'].filter(Boolean)
      });

      // Track conversion
      trackConversion('lead', calculateLeadValue(data));

      // Track form submission
      trackBusinessEvent.contactFormSubmit(variant, window.location.pathname);

      // Call custom onSubmit handler
      if (onSubmit) {
        onSubmit(data);
      }

      setIsSuccess(true);

      // Call success callback
      if (onSuccess) {
        onSuccess(lead.id);
      }

      // Redirect if specified
      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);
      }

    } catch (error) {
      console.error('Form submission error:', error);
      // Handle error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateLeadValue = (data: LeadFormData): number => {
    let value = 100; // Base lead value

    if (data.companySize === 'enterprise') value += 300;
    else if (data.companySize === 'smb') value += 150;

    if (data.serviceInterest.length > 1) value += 50;
    if (data.phone) value += 50;
    if (data.company) value += 25;

    return value;
  };

  const getStepFields = (step: number): (keyof LeadFormData)[] => {
    if (compactMode) return Object.keys(watchedFields) as (keyof LeadFormData)[];

    switch (step) {
      case 1:
        return ['email', 'firstName', 'lastName'];
      case 2:
        return ['company', 'jobTitle', 'companySize', 'industry'];
      case 3:
        return ['serviceInterest', 'budget', 'timeline'];
      case 4:
        return ['message'];
      default:
        return [];
    }
  };

  const nextStep = async () => {
    const stepFields = getStepFields(currentStep);
    const isStepValid = await trigger(stepFields);
    
    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getProgressPercentage = () => {
    if (compactMode) return 100;
    return (currentStep / 4) * 100;
  };

  if (isSuccess) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="mb-4 text-4xl">✅</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {variant === 'newsletter' ? 'Subscribed!' : 'Thank You!'}
        </h3>
        <p className="text-gray-600 mb-6">
          {successMessage || 
           (variant === 'newsletter' 
             ? "You've been subscribed to our newsletter. Check your email for confirmation!"
             : "We've received your message and will get back to you within 24 hours.")}
        </p>
        {redirectUrl && (
          <p className="text-sm text-gray-500">
            Redirecting you in a moment...
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          {description && (
            <p className="text-lg text-gray-600">{description}</p>
          )}
        </div>
      )}

      {showProgressIndicator && !compactMode && (
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep} of 4</span>
            <span>{Math.round(getProgressPercentage())}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
        {/* Step 1: Basic Information */}
        {(compactMode || currentStep === 1) && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {!compactMode && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name {requiredFields.includes('firstName') && '*'}
                    </label>
                    <input
                      {...register('firstName')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      {...register('lastName')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Smith"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Company Information */}
        {(compactMode || currentStep === 2) && variant !== 'newsletter' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company {requiredFields.includes('company') && '*'}
                </label>
                <input
                  {...register('company')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Company Name"
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  {...register('jobTitle')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="CTO, VP Engineering, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  {...register('companySize')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select size</option>
                  <option value="startup">Startup (1-50 employees)</option>
                  <option value="smb">SMB (51-500 employees)</option>
                  <option value="enterprise">Enterprise (500+ employees)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  {...register('industry')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select industry</option>
                  {industryOptions.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              {variant !== 'demo' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Project Information */}
        {(compactMode || currentStep === 3) && variant !== 'newsletter' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Services of Interest *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {serviceOptions.map(service => (
                  <label key={service.value} className="flex items-center">
                    <input
                      {...register('serviceInterest')}
                      type="checkbox"
                      value={service.value}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{service.label}</span>
                  </label>
                ))}
              </div>
              {errors.serviceInterest && (
                <p className="mt-1 text-sm text-red-600">{errors.serviceInterest.message}</p>
              )}
            </div>

            {variant === 'quote' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    {...register('budget')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select budget</option>
                    {budgetOptions.map(budget => (
                      <option key={budget} value={budget}>{budget}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline
                  </label>
                  <select
                    {...register('timeline')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select timeline</option>
                    {timelineOptions.map(timeline => (
                      <option key={timeline} value={timeline}>{timeline}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Message */}
        {(compactMode || currentStep === 4) && variant !== 'newsletter' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              {...register('message')}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell us about your project or any specific requirements..."
            />
          </div>
        )}

        {/* Navigation and Submit */}
        <div className="flex justify-between items-center pt-6">
          {!compactMode && currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          )}

          <div className="ml-auto">
            {!compactMode && currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {isSubmitting 
                  ? 'Submitting...' 
                  : (submitButtonText || 
                     (variant === 'newsletter' ? 'Subscribe' : 
                      variant === 'quote' ? 'Get Quote' :
                      variant === 'demo' ? 'Book Demo' : 'Send Message'))}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}