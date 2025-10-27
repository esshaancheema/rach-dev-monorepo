import { AMPRichTextRenderer } from './AMPRichTextRenderer';
import type { Entry } from 'contentful';

interface AMPBlogPostProps {
  post: Entry<any>;
}

export default function AMPBlogPost({ post }: AMPBlogPostProps) {
  const { fields } = post;

  return (
    <>
      {/* Header */}
      <header className="amp-header">
        <a href="/" className="amp-logo">
          Zoptal
        </a>
      </header>

      {/* Main Article */}
      <article className="amp-article">
        <header className="amp-article-header">
          {/* Breadcrumbs */}
          <nav className="amp-breadcrumbs">
            <a href="/">Home</a> / <a href="/blog">Blog</a> / {fields.title}
          </nav>

          {/* Meta Information */}
          <div className="amp-article-meta">
            <span className="amp-badge primary">{fields.categoryName}</span>
            {fields.featured && <span className="amp-badge">Featured</span>}
          </div>

          {/* Title */}
          <h1 className="amp-article-title">{fields.title}</h1>

          {/* Excerpt */}
          <p className="amp-article-excerpt">{fields.excerpt}</p>

          {/* Article Meta */}
          <div className="amp-article-meta">
            <span>By {fields.authorName}</span>
            <span>{fields.formattedDate}</span>
            <span>{fields.readingTime} min read</span>
          </div>

          {/* Featured Image */}
          {fields.featuredImageUrl && (
            <amp-img
              src={fields.featuredImageUrl}
              width="800"
              height="450"
              layout="responsive"
              alt={fields.title}
            />
          )}
        </header>

        {/* Article Content */}
        <div className="amp-article-content">
          <AMPRichTextRenderer content={fields.content} />
        </div>

        {/* Tags */}
        {fields.tagNames && fields.tagNames.length > 0 && (
          <div className="amp-article-tags">
            <h3>Tags</h3>
            <div className="amp-tags">
              {fields.tagNames.map((tag: string) => (
                <span key={tag} className="amp-badge">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social Sharing */}
        <div className="amp-social-share">
          <h3 className="amp-social-title">Share this article</h3>
          <div className="amp-social-buttons">
            <amp-social-share
              type="twitter"
              width="45"
              height="33"
              data-param-text={fields.title}
              data-param-url={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${fields.slug}`}
            />
            <amp-social-share
              type="facebook"
              width="45"
              height="33"
              data-param-href={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${fields.slug}`}
            />
            <amp-social-share
              type="linkedin"
              width="45"
              height="33"
              data-param-url={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${fields.slug}`}
              data-param-title={fields.title}
              data-param-summary={fields.excerpt}
            />
            <amp-social-share
              type="email"
              width="45"
              height="33"
              data-param-subject={fields.title}
              data-param-body={`Check out this article: ${fields.title} - ${process.env.NEXT_PUBLIC_SITE_URL}/blog/${fields.slug}`}
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="amp-cta">
          <h2 className="amp-cta-title">Ready to Transform Your Business?</h2>
          <p className="amp-cta-description">
            Let's discuss how our expertise can help you achieve your goals.
          </p>
          <a href="/contact" className="amp-cta-button">
            Get Started
          </a>
        </div>
      </article>

      {/* Footer */}
      <footer className="amp-footer">
        <p>&copy; 2024 Zoptal. All rights reserved.</p>
        <p>
          <a href="/legal/privacy">Privacy Policy</a> | 
          <a href="/legal/terms">Terms of Service</a>
        </p>
      </footer>
    </>
  );
}