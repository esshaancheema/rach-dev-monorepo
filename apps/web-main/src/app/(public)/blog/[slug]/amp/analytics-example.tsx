// Example of AMP analytics integration in a blog post page

import React from 'react';
import { AMPAnalyticsProvider, ZoptalAnalyticsConfigs } from '../../../../../components/amp/AMPAnalyticsProvider';
import { AMPSocialShare } from '../../../../../components/amp/AMPComponents';

// Example blog post with analytics integration
export default function AMPBlogPostWithAnalytics({
  post,
  measurementId = 'G-XXXXXXXXXX', // Replace with actual GA4 measurement ID
}: {
  post: {
    title: string;
    slug: string;
    category: string;
    author: string;
    tags: string[];
    publishDate: string;
    content: string;
  };
  measurementId?: string;
}) {
  // Configure analytics for this blog post
  const analyticsConfig = ZoptalAnalyticsConfigs.blogPost(measurementId, {
    category: post.category,
    author: post.author,
    tags: post.tags,
    publishDate: post.publishDate,
  });

  return (
    <AMPAnalyticsProvider {...analyticsConfig}>
      <article className="amp-article">
        {/* Blog post header */}
        <header className="amp-article-header">
          <h1 className="amp-article-title">{post.title}</h1>
          
          <div className="amp-article-meta">
            <span>By {post.author}</span>
            <span>{new Date(post.publishDate).toLocaleDateString()}</span>
            <span>Category: {post.category}</span>
          </div>

          {/* Tags with analytics tracking */}
          {post.tags.length > 0 && (
            <div className="amp-article-tags">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="amp-badge amp-badge-outline"
                  data-tag={tag}
                  on="tap:analytics.track(event.tag_click, {tag_name: event.tag})"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article content */}
        <div className="amp-article-content">
          {/* This would normally be rendered from rich text content */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Social sharing with analytics */}
        <div className="amp-social-share">
          <h3 className="amp-social-title">Share this article</h3>
          <div className="amp-social-buttons">
            <AMPSocialShare
              type="twitter"
              dataParam={{
                text: post.title,
                url: `https://zoptal.com/blog/${post.slug}`,
                via: 'zoptal',
              }}
            />
            <AMPSocialShare
              type="facebook"
              dataParam={{
                href: `https://zoptal.com/blog/${post.slug}`,
              }}
            />
            <AMPSocialShare
              type="linkedin"
              dataParam={{
                url: `https://zoptal.com/blog/${post.slug}`,
                text: post.title,
              }}
            />
          </div>
        </div>

        {/* Newsletter signup CTA with conversion tracking */}
        <div className="amp-cta">
          <h3 className="amp-cta-title">Stay Updated</h3>
          <p className="amp-cta-description">
            Get the latest insights and tips delivered to your inbox.
          </p>
          <a
            href="/newsletter"
            className="amp-cta-button"
            data-cta="newsletter"
            on="tap:analytics.track(event.newsletter_signup_click)"
          >
            Subscribe to Newsletter
          </a>
        </div>

        {/* Contact CTA with tracking */}
        <div className="amp-cta">
          <h3 className="amp-cta-title">Need Help with Your Project?</h3>
          <p className="amp-cta-description">
            Let's discuss how we can help you achieve your goals.
          </p>
          <a
            href="/contact"
            className="amp-cta-button"
            data-cta="contact"
            on="tap:analytics.track(event.contact_cta_click)"
          >
            Get in Touch
          </a>
        </div>

        {/* Related articles section with click tracking */}
        <section className="amp-related-articles">
          <h3>Related Articles</h3>
          <div className="amp-article-grid">
            {/* This would be populated with related articles */}
            <article className="amp-card">
              <h4 className="amp-card-title">
                <a
                  href="/blog/related-article-1"
                  data-related-article="true"
                  on="tap:analytics.track(event.related_article_click, {article_title: 'Related Article 1'})"
                >
                  Related Article 1
                </a>
              </h4>
              <p className="amp-card-content">Brief description...</p>
            </article>
          </div>
        </section>

        {/* Download tracking example */}
        <div className="amp-download-section">
          <h3>Download Resources</h3>
          <a
            href="/resources/guide.pdf"
            className="amp-btn amp-btn-secondary"
            data-download="true"
            on="tap:analytics.track(event.resource_download, {resource_name: 'guide.pdf'})"
          >
            Download Free Guide (PDF)
          </a>
        </div>

        {/* Video content with tracking */}
        <div className="amp-video-section">
          <h3>Watch Our Video</h3>
          <amp-video
            src="/videos/explainer.mp4"
            width="800"
            height="450"
            layout="responsive"
            controls
            data-video-title="Product Explainer"
            on="video-play:analytics.track(event.video_start, {video_title: event.videoTitle});
                video-ended:analytics.track(event.video_complete, {video_title: event.videoTitle})"
          >
            <div fallback>
              <p>Your browser doesn't support HTML5 video.</p>
            </div>
          </amp-video>
        </div>

        {/* Time-based engagement tracking */}
        <div
          className="amp-engagement-tracker"
          on="scroll:analytics.track(event.content_engagement, {engagement_type: 'scroll'});
              timer:analytics.track(event.time_on_page, {time_spent: '30s'})"
        />

        {/* External link tracking */}
        <div className="amp-external-links">
          <h3>External Resources</h3>
          <ul>
            <li>
              <a
                href="https://external-site.com/resource"
                target="_blank"
                rel="noopener noreferrer"
                data-outbound="true"
                on="tap:analytics.track(event.outbound_click, {destination: 'external-site.com'})"
              >
                External Resource
              </a>
            </li>
          </ul>
        </div>
      </article>
    </AMPAnalyticsProvider>
  );
}

// Example of custom analytics configuration for specific use cases
export function AMPBlogPostWithCustomAnalytics({ post }: { post: any }) {
  return (
    <AMPAnalyticsProvider
      ga4={{
        measurementId: 'G-XXXXXXXXXX',
        enableEnhancedMeasurement: true,
        customDimensions: {
          content_type: 'blog_post',
          author: post.author,
          word_count: post.wordCount?.toString() || '0',
          reading_time: post.estimatedReadingTime?.toString() || '0',
        },
        conversionEvents: ['newsletter_signup', 'contact_form_submit', 'resource_download'],
      }}
      page={{
        type: 'blog',
        category: post.category,
        title: post.title,
        author: post.author,
        tags: post.tags,
        publishDate: post.publishDate,
      }}
      features={{
        formTracking: true,
        videoTracking: true,
        socialTracking: true,
        scrollTracking: true,
        downloadTracking: true,
        outboundTracking: true,
        timeTracking: true,
      }}
      customTriggers={[
        {
          name: 'copy_code_snippet',
          selector: '[data-action="copy-code"]',
          event: 'code_copy',
          category: 'engagement',
        },
        {
          name: 'expand_code_block',
          selector: '[data-action="expand-code"]',
          event: 'code_expand',
          category: 'engagement',
        },
        {
          name: 'bookmark_article',
          selector: '[data-action="bookmark"]',
          event: 'bookmark_article',
          category: 'engagement',
        },
      ]}
      conversions={[
        {
          conversionId: 'AW-XXXXXXXXX',
          conversionLabel: 'newsletter_signup',
        },
        {
          conversionId: 'AW-XXXXXXXXX',
          conversionLabel: 'contact_form',
        },
      ]}
    >
      {/* Blog post content here */}
      <div>Blog post content with enhanced analytics...</div>
    </AMPAnalyticsProvider>
  );
}