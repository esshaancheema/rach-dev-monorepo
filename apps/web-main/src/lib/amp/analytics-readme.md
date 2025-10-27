# AMP Analytics Integration Guide

This guide explains how to implement comprehensive analytics tracking in AMP pages for the Zoptal website.

## Overview

The AMP analytics system provides:
- Google Analytics 4 (GA4) integration
- Universal Analytics support (legacy)
- Custom analytics providers
- Conversion tracking
- Enhanced measurement
- Event tracking for user interactions
- E-commerce tracking
- Form and video analytics

## Quick Start

### Basic Setup

```tsx
import { AMPAnalyticsProvider } from '@/components/amp/AMPAnalyticsProvider';

export default function AMPPage() {
  return (
    <AMPAnalyticsProvider
      ga4={{
        measurementId: 'G-XXXXXXXXXX',
        enableEnhancedMeasurement: true,
      }}
      page={{
        type: 'blog',
        category: 'Technology',
      }}
      features={{
        formTracking: true,
        socialTracking: true,
        scrollTracking: true,
      }}
    >
      {/* Your AMP page content */}
    </AMPAnalyticsProvider>
  );
}
```

### Using Predefined Configurations

```tsx
import { ZoptalAnalyticsConfigs } from '@/components/amp/AMPAnalyticsProvider';

const analyticsConfig = ZoptalAnalyticsConfigs.blogPost('G-XXXXXXXXXX', {
  category: 'Web Development',
  author: 'John Doe',
  tags: ['React', 'Next.js', 'AMP'],
  publishDate: '2024-01-15',
});

<AMPAnalyticsProvider {...analyticsConfig}>
  {/* Content */}
</AMPAnalyticsProvider>
```

## Configuration Options

### GA4 Configuration

```tsx
ga4: {
  measurementId: 'G-XXXXXXXXXX',
  enableEnhancedMeasurement: true,
  customDimensions: {
    content_group1: 'Blog',
    content_group2: 'Technology',
    author: 'John Doe',
  },
  customMetrics: {
    reading_time: 5,
    word_count: 1200,
  },
  conversionEvents: ['newsletter_signup', 'contact_form'],
}
```

### Page Context

```tsx
page: {
  type: 'blog' | 'case-study' | 'service' | 'landing' | 'ecommerce',
  category: 'Web Development',
  title: 'Page Title',
  author: 'Author Name',
  tags: ['tag1', 'tag2'],
  publishDate: '2024-01-15',
}
```

### Feature Flags

```tsx
features: {
  formTracking: true,        // Track form interactions
  videoTracking: true,       // Track video play/pause/complete
  socialTracking: true,      // Track social sharing
  ecommerceTracking: true,   // Track e-commerce events
  scrollTracking: true,      // Track scroll depth
  ctaTracking: true,         // Track CTA clicks
  downloadTracking: true,    // Track file downloads
  outboundTracking: true,    // Track external links
  timeTracking: true,        // Track time on page
}
```

## Event Tracking

### Automatic Event Tracking

The system automatically tracks:

- **Page Views**: When page becomes visible
- **Clicks**: All link clicks with context
- **Scroll Depth**: 25%, 50%, 75%, 90% milestones
- **Time on Page**: 30s, 60s, 2min, 5min intervals
- **Form Interactions**: Form starts and submissions
- **Video Events**: Play, pause, progress, complete
- **Social Shares**: Platform-specific sharing
- **Downloads**: PDF, DOC, ZIP file downloads
- **Outbound Links**: External website clicks

### Custom Event Tracking

Use data attributes to track custom events:

```html
<!-- CTA Click Tracking -->
<a href="/contact" data-cta="contact" class="cta-button">
  Contact Us
</a>

<!-- Newsletter Signup -->
<button data-cta="newsletter" class="newsletter-btn">
  Subscribe
</button>

<!-- Resource Download -->
<a href="/guide.pdf" data-download="true">
  Download Guide
</a>

<!-- Custom Action -->
<button data-action="bookmark" data-label="blog-post">
  Bookmark This
</button>
```

### Manual Event Configuration

```tsx
customTriggers: [
  {
    name: 'product_view',
    selector: '[data-product-id]',
    event: 'view_item',
    category: 'ecommerce',
    label: 'product_page',
  },
  {
    name: 'quote_request',
    selector: '[data-cta="quote"]',
    event: 'generate_lead',
    category: 'conversion',
  },
]
```

## Conversion Tracking

### Google Ads Conversion Tracking

```tsx
conversions: [
  {
    conversionId: 'AW-XXXXXXXXX',
    conversionLabel: 'newsletter_signup',
    conversionValue: 10,
    conversionCurrency: 'USD',
  },
  {
    conversionId: 'AW-XXXXXXXXX',
    conversionLabel: 'contact_form',
    conversionValue: 50,
    conversionCurrency: 'USD',
  },
]
```

### E-commerce Tracking

```tsx
// For e-commerce pages
features: {
  ecommerceTracking: true,
}

// Track purchase events
<button data-ecommerce="purchase" data-transaction-id="12345">
  Complete Purchase
</button>

// Track add to cart
<button data-ecommerce="add_to_cart" data-item-id="product-123">
  Add to Cart
</button>
```

## Page-Specific Implementations

### Blog Posts

```tsx
const blogAnalytics = ZoptalAnalyticsConfigs.blogPost('G-XXXXXXXXXX', {
  category: post.category,
  author: post.author,
  tags: post.tags,
  publishDate: post.publishDate,
});

// Tracks: reading time, scroll depth, social shares, related clicks
```

### Case Studies

```tsx
const caseStudyAnalytics = ZoptalAnalyticsConfigs.caseStudy('G-XXXXXXXXXX', {
  industry: 'Healthcare',
  client: 'Enterprise',
  services: ['Web Development', 'UX Design'],
});

// Tracks: industry engagement, service interest, contact inquiries
```

### Service Pages

```tsx
const serviceAnalytics = ZoptalAnalyticsConfigs.servicePage('G-XXXXXXXXXX', {
  serviceName: 'Web Development',
  serviceCategory: 'Development',
  pricing: 'enterprise',
});

// Tracks: quote requests, consultation bookings, pricing views
```

### Landing Pages

```tsx
const landingAnalytics = ZoptalAnalyticsConfigs.landingPage('G-XXXXXXXXXX', {
  campaignName: 'Q1-2024-WebDev',
  source: 'google',
  medium: 'cpc',
});

// Tracks: conversion optimization, campaign performance
```

## Advanced Configuration

### Custom Analytics Provider

```tsx
import { ampAnalytics } from '@/lib/amp/analytics';

// Create custom configuration
const customConfig = ampAnalytics.createCustomConfig({
  requests: {
    pageview: 'https://analytics.example.com/collect?page=${canonicalUrl}',
    event: 'https://analytics.example.com/event?action=${eventAction}&category=${eventCategory}',
  },
  triggers: [
    {
      on: 'visible',
      request: 'pageview',
    },
    {
      on: 'click',
      request: 'event',
      selector: 'a',
      vars: {
        eventAction: 'click',
        eventCategory: 'navigation',
      },
    },
  ],
});
```

### Multiple Analytics Providers

```tsx
<AMPAnalyticsProvider
  ga4={{ measurementId: 'G-XXXXXXXXXX' }}
  custom={[
    {
      id: 'mixpanel',
      config: mixpanelConfig,
    },
    {
      id: 'hotjar',
      config: hotjarConfig,
    },
  ]}
>
  {/* Content */}
</AMPAnalyticsProvider>
```

## Data Layer and Variables

### Available Variables

The system provides these variables for use in tracking:

- `${canonicalUrl}` - Current page URL
- `${title}` - Page title
- `${referrer}` - Referrer URL
- `${clickUrl}` - Clicked link URL
- `${scrollBoundary}` - Scroll percentage
- `${videoTitle}` - Video title
- `${formName}` - Form identifier

### Custom Variables

```tsx
// Set global variables
ampAnalytics.setGlobalVars({
  userId: 'user123',
  userType: 'premium',
  contentVersion: 'v2.1',
});
```

## Performance Considerations

### Optimization Tips

1. **Use Predefined Configs**: Leverage `ZoptalAnalyticsConfigs` for common patterns
2. **Selective Feature Enablement**: Only enable needed tracking features
3. **Batch Events**: Group related triggers when possible
4. **Transport Methods**: Use beacon transport for better performance

```tsx
// Optimized configuration
features: {
  formTracking: true,      // Essential for conversions
  scrollTracking: true,    // Good for engagement
  socialTracking: false,   // Disable if not needed
  timeTracking: false,     // Can be resource intensive
}
```

### Debug Mode

For development and testing:

```tsx
// Enable debug mode (development only)
const debugConfig = {
  ...baseConfig,
  vars: {
    ...baseConfig.vars,
    debug_mode: true,
  },
};
```

## Privacy and Compliance

### GDPR Compliance

```tsx
// Conditional analytics loading based on consent
const hasAnalyticsConsent = checkUserConsent();

{hasAnalyticsConsent && (
  <AMPAnalyticsProvider {...analyticsConfig}>
    {/* Content */}
  </AMPAnalyticsProvider>
)}
```

### Data Anonymization

```tsx
ua: {
  trackingId: 'UA-XXXXXXXXX-X',
  anonymizeIp: true,
  customDimensions: {
    // Avoid PII in custom dimensions
    user_type: 'anonymous',
  },
}
```

## Testing and Validation

### Testing Analytics

1. **AMP Validator**: Ensures AMP compliance
2. **Google Analytics Debugger**: Verify event firing
3. **Real User Monitoring**: Check actual user data
4. **A/B Testing**: Test different configurations

### Common Issues

- **Missing triggers**: Check selector specificity
- **Duplicate events**: Avoid multiple identical triggers
- **Performance impact**: Monitor page load times
- **Data accuracy**: Validate against other sources

## Troubleshooting

### Debug Event Firing

```html
<!-- Add debug attributes -->
<button 
  data-cta="contact"
  data-debug="true"
  on="tap:analytics.track(event.contact_click, {debug: true})"
>
  Contact Us
</button>
```

### Validate Configuration

```tsx
import { ampAnalytics } from '@/lib/amp/analytics';

// Validate analytics configuration
const validation = ampAnalytics.validateComponents();
if (!validation.valid) {
  console.error('Analytics validation errors:', validation.issues);
}
```

## Best Practices

1. **Start Simple**: Begin with basic tracking, add complexity gradually
2. **Test Thoroughly**: Validate all events before production
3. **Monitor Performance**: Check impact on page speed
4. **Regular Audits**: Review and clean up unused triggers
5. **Documentation**: Document custom implementations
6. **Privacy First**: Always respect user preferences
7. **Consistent Naming**: Use standard event and parameter names

## Support

For questions or issues with AMP analytics implementation:

- Check the AMP Analytics documentation
- Review Google Analytics 4 AMP integration guide
- Test with AMP validation tools
- Monitor analytics data for accuracy