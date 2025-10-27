import React, { useState, useEffect } from 'react';
import { Button } from '../button/button';
import { Card, CardContent } from '../card/card';
import { Switch } from '../form/form';
import { Separator } from '../separator/separator';
import { ChevronDown, ChevronUp, Settings, Shield, Cookie } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ConsentPreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export interface ConsentBannerProps {
  onAcceptAll: (preferences: ConsentPreferences) => void;
  onAcceptSelected: (preferences: ConsentPreferences) => void;
  onRejectAll: () => void;
  privacyPolicyUrl?: string;
  cookiePolicyUrl?: string;
  className?: string;
}

/**
 * GDPR Consent Banner Component
 * 
 * Provides granular consent management for data processing activities
 */
export function ConsentBanner({
  onAcceptAll,
  onAcceptSelected,
  onRejectAll,
  privacyPolicyUrl = '/privacy-policy',
  cookiePolicyUrl = '/cookie-policy',
  className
}: ConsentBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true, // Always true, cannot be disabled
    functional: false,
    analytics: false,
    marketing: false,
    personalization: false
  });

  const handleAcceptAll = () => {
    const allAccepted: ConsentPreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
      personalization: true
    };
    onAcceptAll(allAccepted);
  };

  const handleAcceptSelected = () => {
    onAcceptSelected(preferences);
  };

  const handleRejectAll = () => {
    const essentialOnly: ConsentPreferences = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
      personalization: false
    };
    onRejectAll();
  };

  const updatePreference = (key: keyof ConsentPreferences, value: boolean) => {
    if (key === 'essential') return; // Cannot change essential cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const consentCategories = [
    {
      key: 'essential' as const,
      title: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services.',
      examples: 'Authentication, security, load balancing',
      required: true,
      icon: Shield
    },
    {
      key: 'functional' as const,
      title: 'Functional Cookies',
      description: 'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers.',
      examples: 'Language preferences, region selection, accessibility features',
      required: false,
      icon: Settings
    },
    {
      key: 'analytics' as const,
      title: 'Analytics Cookies',
      description: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.',
      examples: 'Google Analytics, performance monitoring, error tracking',
      required: false,
      icon: Cookie
    },
    {
      key: 'marketing' as const,
      title: 'Marketing Cookies',
      description: 'These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant adverts.',
      examples: 'Ad targeting, social media integration, marketing campaigns',
      required: false,
      icon: Cookie
    },
    {
      key: 'personalization' as const,
      title: 'Personalization Cookies',
      description: 'These cookies help us provide personalized content and recommendations based on your usage patterns and preferences.',
      examples: 'Content recommendations, personalized dashboard, custom themes',
      required: false,
      icon: Cookie
    }
  ];

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg',
        className
      )}
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="consent-description"
    >
      <Card className="border-0 rounded-none">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">
                  We value your privacy
                </h2>
                <p id="consent-description" className="text-sm text-muted-foreground mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze site traffic, 
                  and personalize content. You can choose which categories to allow. Essential cookies are 
                  always active as they're necessary for the site to function.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            {!isExpanded && (
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={handleAcceptAll}
                    aria-label="Accept all cookies"
                  >
                    Accept All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRejectAll}
                    aria-label="Reject non-essential cookies"
                  >
                    Reject All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsExpanded(true)}
                    aria-label="Customize cookie preferences"
                    className="gap-1"
                  >
                    Customize
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2 text-xs">
                  <a
                    href={privacyPolicyUrl}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                  <span className="text-muted-foreground">•</span>
                  <a
                    href={cookiePolicyUrl}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Cookie Policy
                  </a>
                </div>
              </div>
            )}

            {/* Detailed Preferences */}
            {isExpanded && (
              <div className="space-y-4">
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium">Cookie Preferences</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsExpanded(false)}
                      aria-label="Collapse cookie preferences"
                      className="gap-1"
                    >
                      Collapse
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>

                  {consentCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div key={category.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {category.title}
                            </span>
                            {category.required && (
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <Switch
                            checked={preferences[category.key]}
                            onCheckedChange={(checked) => 
                              updatePreference(category.key, checked)
                            }
                            disabled={category.required}
                            aria-label={`Toggle ${category.title}`}
                          />
                        </div>
                        
                        <div className="text-xs text-muted-foreground pl-6">
                          <p className="mb-1">{category.description}</p>
                          <p>
                            <span className="font-medium">Examples:</span> {category.examples}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      onClick={handleAcceptSelected}
                      aria-label="Accept selected cookie preferences"
                    >
                      Accept Selected
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAcceptAll}
                      aria-label="Accept all cookies"
                    >
                      Accept All
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRejectAll}
                      aria-label="Reject non-essential cookies"
                    >
                      Reject All
                    </Button>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <a
                      href={privacyPolicyUrl}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                    <span className="text-muted-foreground">•</span>
                    <a
                      href={cookiePolicyUrl}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cookie Policy
                    </a>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                  <p className="mb-1">
                    <strong>Your rights:</strong> You can change your preferences at any time 
                    through your account settings or by clearing your browser cookies.
                  </p>
                  <p>
                    <strong>Data processing:</strong> We process data based on your consent, 
                    contractual necessity, and legitimate interests as outlined in our Privacy Policy.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Hook for managing consent state
 */
export function useConsent() {
  const [consentGiven, setConsentGiven] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);

  useEffect(() => {
    // Check for existing consent
    const savedConsent = localStorage.getItem('gdpr-consent');
    if (savedConsent) {
      try {
        const consent = JSON.parse(savedConsent);
        setConsentGiven(true);
        setPreferences(consent.preferences);
      } catch (error) {
        console.error('Error parsing saved consent:', error);
      }
    }
  }, []);

  const saveConsent = (consentPreferences: ConsentPreferences) => {
    const consent = {
      timestamp: new Date().toISOString(),
      preferences: consentPreferences,
      version: '1.0'
    };

    localStorage.setItem('gdpr-consent', JSON.stringify(consent));
    setConsentGiven(true);
    setPreferences(consentPreferences);

    // Send consent to backend
    // This would integrate with the GDPR service
    // recordConsent(consentPreferences);
  };

  const clearConsent = () => {
    localStorage.removeItem('gdpr-consent');
    setConsentGiven(false);
    setPreferences(null);
  };

  const hasConsent = (category: keyof ConsentPreferences) => {
    return preferences?.[category] ?? false;
  };

  return {
    consentGiven,
    preferences,
    saveConsent,
    clearConsent,
    hasConsent
  };
}