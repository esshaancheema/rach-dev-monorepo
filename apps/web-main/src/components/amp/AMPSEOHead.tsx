// AMP SEO Head component for optimal search engine optimization

import React from 'react';
import { ampSEO, AMPSEOConfig, AMPSEOPresets } from '../../lib/amp/seo';

export interface AMPSEOHeadProps extends Partial<AMPSEOConfig> {
  // Quick setup for common page types
  preset?: {
    type: 'blog' | 'case-study' | 'service' | 'landing';
    data: any;
  };
  
  // Additional structured data
  additionalSchemas?: Array<Record<string, any>>;
  
  // Custom robots directives
  noindex?: boolean;
  nofollow?: boolean;
  
  // Enable/disable features
  enableTwitterCard?: boolean;
  enableOpenGraph?: boolean;
  enableStructuredData?: boolean;
  
  // Development mode
  debug?: boolean;
}

export function AMPSEOHead({
  preset,
  additionalSchemas = [],
  noindex = false,
  nofollow = false,
  enableTwitterCard = true,
  enableOpenGraph = true,
  enableStructuredData = true,
  debug = false,
  ...seoConfig
}: AMPSEOHeadProps) {
  // Generate SEO configuration
  let config: AMPSEOConfig;
  
  if (preset) {
    // Use preset configuration
    switch (preset.type) {
      case 'blog':
        config = AMPSEOPresets.blogPost(preset.data);
        break;
      case 'case-study':
        config = AMPSEOPresets.caseStudy(preset.data);
        break;
      case 'service':
        config = AMPSEOPresets.servicePage(preset.data);
        break;
      case 'landing':
        config = AMPSEOPresets.landingPage(preset.data);
        break;
      default:
        throw new Error(`Unknown preset type: ${preset.type}`);
    }
    
    // Merge with additional config
    config = { ...config, ...seoConfig };
  } else {
    // Use provided configuration
    config = ampSEO.generateSEOConfig(seoConfig);
  }

  // Apply robots directives
  if (noindex || nofollow) {
    config.robots = {
      ...config.robots,
      index: !noindex,
      follow: !nofollow,
    };
  }

  // Filter features based on props
  if (!enableOpenGraph) {
    delete config.image;
  }
  
  if (!enableTwitterCard) {
    delete config.twitter;
  }

  // Validate configuration in development
  if (debug) {
    const validation = ampSEO.validateSEOConfig(config);
    if (!validation.valid) {
      console.error('SEO validation errors:', validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn('SEO validation warnings:', validation.warnings);
    }
  }

  // Generate structured data
  let structuredData = '';
  if (enableStructuredData) {
    try {
      // Add additional schemas to config
      if (additionalSchemas.length > 0) {
        config.schema = {
          '@graph': additionalSchemas,
        };
      }
      
      structuredData = ampSEO.generateStructuredData(config);
    } catch (error) {
      console.error('Error generating structured data:', error);
    }
  }

  return (
    <>
      {/* Basic meta tags */}
      <title>{config.title}</title>
      <meta name="description" content={config.description} />
      
      {config.keywords && config.keywords.length > 0 && (
        <meta name="keywords" content={config.keywords.join(', ')} />
      )}

      {config.author && (
        <meta name="author" content={config.author.name} />
      )}

      {/* Canonical and alternate URLs */}
      <link rel="canonical" href={config.canonical} />
      
      {config.ampUrl && (
        <link rel="amphtml" href={config.ampUrl} />
      )}

      {/* Language and locale */}
      {config.locale && (
        <meta name="language" content={config.locale} />
      )}

      {config.alternateLocales?.map((alt) => (
        <link
          key={alt.locale}
          rel="alternate"
          hrefLang={alt.locale}
          href={alt.url}
        />
      ))}

      {/* Robots meta */}
      {config.robots && (
        <meta
          name="robots"
          content={generateRobotsContent(config.robots)}
        />
      )}

      {/* Open Graph tags */}
      {enableOpenGraph && (
        <>
          <meta property="og:title" content={config.title} />
          <meta property="og:description" content={config.description} />
          <meta property="og:url" content={config.canonical} />
          <meta property="og:type" content={config.type || 'website'} />
          
          {config.locale && (
            <meta property="og:locale" content={config.locale} />
          )}

          {config.image && (
            <>
              <meta property="og:image" content={config.image.url} />
              <meta property="og:image:width" content={config.image.width.toString()} />
              <meta property="og:image:height" content={config.image.height.toString()} />
              <meta property="og:image:alt" content={config.image.alt} />
            </>
          )}

          {config.publisher && (
            <meta property="og:site_name" content={config.publisher.name} />
          )}

          {/* Article-specific Open Graph tags */}
          {config.type === 'article' && (
            <>
              {config.author && (
                <meta property="article:author" content={config.author.name} />
              )}
              {config.publishDate && (
                <meta property="article:published_time" content={config.publishDate} />
              )}
              {config.modifiedDate && (
                <meta property="article:modified_time" content={config.modifiedDate} />
              )}
              {config.category && (
                <meta property="article:section" content={config.category} />
              )}
              {config.tags?.map((tag) => (
                <meta key={tag} property="article:tag" content={tag} />
              ))}
            </>
          )}
        </>
      )}

      {/* Twitter Card tags */}
      {enableTwitterCard && config.twitter && (
        <>
          <meta name="twitter:card" content={config.twitter.card} />
          {config.twitter.site && (
            <meta name="twitter:site" content={config.twitter.site} />
          )}
          {config.twitter.creator && (
            <meta name="twitter:creator" content={config.twitter.creator} />
          )}
          {config.twitter.title && (
            <meta name="twitter:title" content={config.twitter.title} />
          )}
          {config.twitter.description && (
            <meta name="twitter:description" content={config.twitter.description} />
          )}
          {config.twitter.image && (
            <meta name="twitter:image" content={config.twitter.image} />
          )}
        </>
      )}

      {/* Facebook tags */}
      {config.facebook?.appId && (
        <meta property="fb:app_id" content={config.facebook.appId} />
      )}
      {config.facebook?.admins && (
        <meta property="fb:admins" content={config.facebook.admins.join(',')} />
      )}

      {/* Structured data */}
      {enableStructuredData && structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      )}

      {/* Additional meta tags for AMP */}
      <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
      <meta charSet="utf-8" />
      
      {/* AMP runtime */}
      <script async src="https://cdn.ampproject.org/v0.js" />
      
      {/* AMP boilerplate */}
      <style
        amp-boilerplate=""
        dangerouslySetInnerHTML={{
          __html: `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`
        }}
      />
      <noscript>
        <style
          amp-boilerplate=""
          dangerouslySetInnerHTML={{
            __html: `body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`
          }}
        />
      </noscript>
    </>
  );
}

// Breadcrumb component for AMP pages
export interface AMPBreadcrumbsProps {
  items: Array<{
    name: string;
    url: string;
  }>;
  className?: string;
}

export function AMPBreadcrumbs({ items, className = '' }: AMPBreadcrumbsProps) {
  // Generate breadcrumb structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      <nav className={`amp-breadcrumbs ${className}`} aria-label="Breadcrumb">
        <ol className="breadcrumb-list">
          {items.map((item, index) => (
            <li key={item.url} className="breadcrumb-item">
              {index < items.length - 1 ? (
                <a href={item.url}>{item.name}</a>
              ) : (
                <span aria-current="page">{item.name}</span>
              )}
              {index < items.length - 1 && (
                <span className="breadcrumb-separator" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

// FAQ structured data component
export interface AMPFAQProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  className?: string;
}

export function AMPFAQ({ faqs, className = '' }: AMPFAQProps) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <div className={`amp-faq ${className}`}>
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <h3 className="faq-question">{faq.question}</h3>
            <div className="faq-answer">{faq.answer}</div>
          </div>
        ))}
      </div>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

// Organization structured data component
export interface AMPOrganizationProps {
  organization: {
    name: string;
    url: string;
    logo: string;
    description?: string;
    address?: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    contactPoint?: Array<{
      contactType: string;
      telephone?: string;
      email?: string;
    }>;
    sameAs?: string[];
  };
}

export function AMPOrganization({ organization }: AMPOrganizationProps) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    ...organization,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
    />
  );
}

// Utility function to generate robots content
function generateRobotsContent(robots: NonNullable<AMPSEOConfig['robots']>): string {
  const directives: string[] = [];

  if (robots.index === false) directives.push('noindex');
  if (robots.follow === false) directives.push('nofollow');
  if (robots.noarchive) directives.push('noarchive');
  if (robots.nosnippet) directives.push('nosnippet');
  if (robots.maxSnippet) directives.push(`max-snippet:${robots.maxSnippet}`);
  if (robots.maxImagePreview) directives.push(`max-image-preview:${robots.maxImagePreview}`);
  if (robots.maxVideoPreview) directives.push(`max-video-preview:${robots.maxVideoPreview}`);

  return directives.join(', ');
}

export default AMPSEOHead;