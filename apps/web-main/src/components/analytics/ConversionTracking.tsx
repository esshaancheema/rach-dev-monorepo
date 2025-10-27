'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent, trackBusinessEvent } from '@/lib/analytics/google-analytics';

interface ConversionTrackingProps {
  children: React.ReactNode;
}

export default function ConversionTracking({ children }: ConversionTrackingProps) {
  const pathname = usePathname();
  const timeOnPageRef = useRef<NodeJS.Timeout>();
  const scrollDepthRef = useRef(new Set<number>());
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // Reset tracking state on page change
    scrollDepthRef.current.clear();
    startTimeRef.current = Date.now();

    // Time on page tracking
    const timeIntervals = [30, 60, 120, 300, 600]; // seconds
    let currentInterval = 0;

    const trackTimeOnPage = () => {
      if (currentInterval < timeIntervals.length) {
        const seconds = timeIntervals[currentInterval];
        timeOnPageRef.current = setTimeout(() => {
          trackBusinessEvent.timeOnPage(seconds, pathname);
          currentInterval++;
          trackTimeOnPage();
        }, seconds * 1000);
      }
    };

    trackTimeOnPage();

    // Scroll depth tracking
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      const milestones = [25, 50, 75, 90, 100];
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !scrollDepthRef.current.has(milestone)) {
          scrollDepthRef.current.add(milestone);
          trackBusinessEvent.scrollDepth(milestone, pathname);
        }
      });
    };

    // Click tracking for important elements
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const linkElement = target.closest('a');
      const buttonElement = target.closest('button');

      if (linkElement) {
        const href = linkElement.getAttribute('href') || '';
        const text = linkElement.textContent || '';

        // Track external links
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
          trackEvent('external_link_click', {
            category: 'outbound',
            label: href,
            link_text: text,
            page_location: pathname,
          });
        }

        // Track internal navigation
        if (href.startsWith('/')) {
          trackEvent('internal_link_click', {
            category: 'navigation',
            label: href,
            link_text: text,
            source_page: pathname,
            destination_page: href,
          });
        }

        // Track service page clicks
        if (href.includes('/services/')) {
          const serviceName = href.split('/services/')[1]?.split('/')[0] || 'unknown';
          trackBusinessEvent.serviceInterest(serviceName, 'link_click');
        }

        // Track contact actions
        if (href.includes('/contact') || href.includes('mailto:') || href.includes('tel:')) {
          trackEvent('contact_action', {
            category: 'conversion',
            label: href.includes('mailto:') ? 'email' : href.includes('tel:') ? 'phone' : 'contact_page',
            action_type: href.includes('mailto:') ? 'email' : href.includes('tel:') ? 'phone' : 'contact_page',
            source_page: pathname,
          });
        }

        // Track case study clicks
        if (href.includes('/case-studies/')) {
          const studySlug = href.split('/case-studies/')[1]?.split('/')[0] || 'unknown';
          trackBusinessEvent.caseStudyView(studySlug, 'link_click');
        }

        // Track blog clicks
        if (href.includes('/blog/')) {
          const postSlug = href.split('/blog/')[1]?.split('/')[0] || 'unknown';
          trackBusinessEvent.blogEngagement(postSlug, 'link_click');
        }
      }

      if (buttonElement) {
        const buttonText = buttonElement.textContent || '';
        const buttonType = buttonElement.getAttribute('type') || 'button';

        // Track CTA button clicks
        if (buttonText.toLowerCase().includes('get quote') || 
            buttonText.toLowerCase().includes('contact') ||
            buttonText.toLowerCase().includes('start project')) {
          trackBusinessEvent.trackEvent('cta_click', {
            category: 'conversion',
            label: buttonText,
            button_text: buttonText,
            button_type: buttonType,
            page_location: pathname,
            value: 100,
          });
        }

        // Track pricing button clicks
        if (buttonText.toLowerCase().includes('choose plan') || 
            buttonText.toLowerCase().includes('get started')) {
          trackBusinessEvent.pricingInteraction(buttonText, 'button_click');
        }

        // Track newsletter signup
        if (buttonText.toLowerCase().includes('subscribe') || 
            buttonText.toLowerCase().includes('newsletter')) {
          trackBusinessEvent.newsletterSignup(pathname);
        }
      }
    };

    // Form submission tracking
    const handleFormSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || form.className || 'unknown';
      const formAction = form.action || window.location.href;

      // Determine form type
      let formType = 'unknown';
      if (formId.includes('contact') || formAction.includes('contact')) {
        formType = 'contact';
      } else if (formId.includes('newsletter') || formAction.includes('newsletter')) {
        formType = 'newsletter';
      } else if (formId.includes('quote') || formAction.includes('quote')) {
        formType = 'quote';
      }

      trackBusinessEvent.contactFormSubmit(formType, pathname);

      // Track conversion funnel
      trackBusinessEvent.funnelStep('form_submit', formType, 200);
    };

    // Error tracking
    const handleError = (event: ErrorEvent) => {
      trackBusinessEvent.errorOccurred(
        'javascript_error',
        event.message,
        pathname
      );
    };

    // Unhandled promise rejection tracking
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackBusinessEvent.errorOccurred(
        'unhandled_promise_rejection',
        event.reason?.toString() || 'Unknown rejection',
        pathname
      );
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleFormSubmit);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      if (timeOnPageRef.current) {
        clearTimeout(timeOnPageRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleFormSubmit);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [pathname]);

  return <>{children}</>;
}