'use client';

import { useEffect } from 'react';
import Script from 'next/script';

const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID || '';
const MICROSOFT_CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || '';

interface HeatmapTrackingProps {
  enabled?: boolean;
}

export default function HeatmapTracking({ enabled = true }: HeatmapTrackingProps) {
  useEffect(() => {
    if (!enabled) return;

    // Initialize Hotjar
    if (HOTJAR_ID && typeof window !== 'undefined') {
      // @ts-ignore
      window.hj = window.hj || function () {
        // @ts-ignore
        (window.hj.q = window.hj.q || []).push(arguments);
      };
      // @ts-ignore
      window._hjSettings = { hjid: parseInt(HOTJAR_ID), hjsv: 6 };
    }

    // Initialize Microsoft Clarity
    if (MICROSOFT_CLARITY_ID && typeof window !== 'undefined') {
      // @ts-ignore
      window.clarity = window.clarity || function () {
        // @ts-ignore
        (window.clarity.q = window.clarity.q || []).push(arguments);
      };
    }
  }, [enabled]);

  if (!enabled || (!HOTJAR_ID && !MICROSOFT_CLARITY_ID)) {
    return null;
  }

  return (
    <>
      {/* Hotjar Tracking Code */}
      {HOTJAR_ID && (
        <Script
          id="hotjar-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${HOTJAR_ID},hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />
      )}

      {/* Microsoft Clarity Tracking Code */}
      {MICROSOFT_CLARITY_ID && (
        <Script
          id="clarity-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${MICROSOFT_CLARITY_ID}");
            `,
          }}
        />
      )}

      {/* Custom heatmap event tracking */}
      <Script
        id="custom-heatmap-tracking"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Custom event tracking for heatmap tools
            document.addEventListener('DOMContentLoaded', function() {
              // Track form interactions
              const forms = document.querySelectorAll('form');
              forms.forEach(form => {
                form.addEventListener('focus', function(e) {
                  if (window.hj) {
                    window.hj('event', 'form_field_focus');
                  }
                  if (window.clarity) {
                    window.clarity('event', 'form_field_focus');
                  }
                }, true);

                form.addEventListener('submit', function(e) {
                  if (window.hj) {
                    window.hj('event', 'form_submit');
                  }
                  if (window.clarity) {
                    window.clarity('event', 'form_submit');
                  }
                });
              });

              // Track CTA button clicks
              const ctaButtons = document.querySelectorAll('button, a[href*="contact"], a[href*="quote"]');
              ctaButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                  const buttonText = this.textContent || this.innerText || '';
                  if (window.hj) {
                    window.hj('event', 'cta_click');
                  }
                  if (window.clarity) {
                    window.clarity('event', 'cta_click');
                  }
                });
              });

              // Track service page interactions
              const serviceLinks = document.querySelectorAll('a[href*="/services/"]');
              serviceLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                  if (window.hj) {
                    window.hj('event', 'service_page_click');
                  }
                  if (window.clarity) {
                    window.clarity('event', 'service_page_click');
                  }
                });
              });

              // Track pricing interactions
              const pricingElements = document.querySelectorAll('[data-pricing], .pricing-card, .pricing-plan');
              pricingElements.forEach(element => {
                element.addEventListener('click', function(e) {
                  if (window.hj) {
                    window.hj('event', 'pricing_interaction');
                  }
                  if (window.clarity) {
                    window.clarity('event', 'pricing_interaction');
                  }
                });
              });

              // Track scroll depth milestones
              let scrollDepthTracked = new Set();
              window.addEventListener('scroll', function() {
                const scrollTop = window.pageYOffset;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = Math.round((scrollTop / docHeight) * 100);

                [25, 50, 75, 90].forEach(milestone => {
                  if (scrollPercent >= milestone && !scrollDepthTracked.has(milestone)) {
                    scrollDepthTracked.add(milestone);
                    if (window.hj) {
                      window.hj('event', 'scroll_depth_' + milestone);
                    }
                    if (window.clarity) {
                      window.clarity('event', 'scroll_depth_' + milestone);
                    }
                  }
                });
              });

              // Track time on page milestones
              let timeTracked = new Set();
              [30, 60, 120, 300].forEach(seconds => {
                setTimeout(() => {
                  if (!timeTracked.has(seconds)) {
                    timeTracked.add(seconds);
                    if (window.hj) {
                      window.hj('event', 'time_on_page_' + seconds + 's');
                    }
                    if (window.clarity) {
                      window.clarity('event', 'time_on_page_' + seconds + 's');
                    }
                  }
                }, seconds * 1000);
              });

              // Track mobile vs desktop behavior
              const isMobile = window.innerWidth <= 768;
              if (window.hj) {
                window.hj('event', isMobile ? 'mobile_user' : 'desktop_user');
              }
              if (window.clarity) {
                window.clarity('event', isMobile ? 'mobile_user' : 'desktop_user');
              }

              // Track page type for segmentation
              const pathname = window.location.pathname;
              let pageType = 'other';
              
              if (pathname === '/') pageType = 'homepage';
              else if (pathname.includes('/services/')) pageType = 'service_page';
              else if (pathname.includes('/case-studies/')) pageType = 'case_study';
              else if (pathname.includes('/blog/')) pageType = 'blog';
              else if (pathname.includes('/pricing')) pageType = 'pricing';
              else if (pathname.includes('/contact')) pageType = 'contact';
              else if (pathname.includes('/enterprise')) pageType = 'enterprise';

              if (window.hj) {
                window.hj('event', 'page_type_' + pageType);
              }
              if (window.clarity) {
                window.clarity('event', 'page_type_' + pageType);
              }
            });
          `,
        }}
      />
    </>
  );
}