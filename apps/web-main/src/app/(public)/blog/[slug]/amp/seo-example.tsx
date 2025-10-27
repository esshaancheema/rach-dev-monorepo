// Complete example of AMP page with comprehensive SEO optimization

import React from 'react';
import { getBlogPost } from '../../../../../lib/contentful/api';
import AMPSEOHead, { AMPBreadcrumbs, AMPFAQ, AMPOrganization } from '../../../../../components/amp/AMPSEOHead';
import { AMPAnalyticsProvider, ZoptalAnalyticsConfigs } from '../../../../../components/amp/AMPAnalyticsProvider';
import { AMPBlogPost } from '../../../../../components/amp/AMPBlogPost';
import { ampSEO, AMPSEOPresets } from '../../../../../lib/amp/seo';

interface BlogPostPageProps {
  params: { slug: string };
}

// Complete AMP blog post page with SEO optimization
export default async function AMPBlogPostPage({ params }: BlogPostPageProps) {
  // Fetch blog post data from Contentful
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    return <div>Post not found</div>;
  }

  // Extract post data for SEO
  const postData = {
    title: post.fields.title,
    description: post.fields.excerpt || `Read about ${post.fields.title} on Zoptal's blog`,
    slug: post.fields.slug,
    category: post.fields.category?.fields.name || 'Technology',
    author: {
      name: post.fields.author?.fields.name || 'Zoptal Team',
      url: post.fields.author?.fields.website || 'https://zoptal.com/team',
    },
    publishDate: post.fields.publishDate,
    modifiedDate: post.sys.updatedAt,
    tags: post.fields.tags?.map((tag: any) => tag.fields.name) || [],
    image: post.fields.featuredImage ? {
      url: `https:${post.fields.featuredImage.fields.file.url}`,
      width: post.fields.featuredImage.fields.file.details.image.width,
      height: post.fields.featuredImage.fields.file.details.image.height,
      alt: post.fields.featuredImage.fields.description || post.fields.title,
    } : undefined,
  };

  // Generate breadcrumb data
  const breadcrumbs = [
    { name: 'Home', url: 'https://zoptal.com' },
    { name: 'Blog', url: 'https://zoptal.com/blog' },
    { name: postData.category, url: `https://zoptal.com/blog/category/${postData.category.toLowerCase()}` },
    { name: postData.title, url: `https://zoptal.com/blog/${postData.slug}` },
  ];

  // Generate FAQ data (if available in post content)
  const faqs = post.fields.faqs?.map((faq: any) => ({
    question: faq.fields.question,
    answer: faq.fields.answer,
  })) || [];

  // Zoptal organization data
  const organization = {
    name: 'Zoptal',
    url: 'https://zoptal.com',
    logo: 'https://zoptal.com/images/logo.png',
    description: 'Leading digital agency specializing in web development, design, and digital marketing solutions.',
    address: {
      streetAddress: '123 Tech Street',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94105',
      addressCountry: 'US',
    },
    contactPoint: [
      {
        contactType: 'customer service',
        telephone: '+1-415-555-0123',
        email: 'hello@zoptal.com',
      },
      {
        contactType: 'sales',
        email: 'sales@zoptal.com',
      },
    ],
    sameAs: [
      'https://twitter.com/zoptal',
      'https://linkedin.com/company/zoptal',
      'https://github.com/zoptal',
    ],
  };

  // Configure analytics
  const analyticsConfig = ZoptalAnalyticsConfigs.blogPost('G-XXXXXXXXXX', {
    category: postData.category,
    author: postData.author.name,
    tags: postData.tags,
    publishDate: postData.publishDate,
  });

  // Estimate reading time
  const wordCount = post.fields.content?.content?.reduce((count: number, block: any) => {
    if (block.nodeType === 'paragraph') {
      const text = block.content?.map((c: any) => c.value).join('') || '';
      return count + text.split(/\s+/).length;
    }
    return count;
  }, 0) || 0;
  
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  // Additional structured data schemas
  const additionalSchemas = [
    // BlogPosting schema with enhanced details
    {
      '@type': 'BlogPosting',
      '@id': `https://zoptal.com/blog/${postData.slug}#blogpost`,
      headline: postData.title,
      description: postData.description,
      url: `https://zoptal.com/blog/${postData.slug}`,
      datePublished: postData.publishDate,
      dateModified: postData.modifiedDate,
      author: {
        '@type': 'Person',
        name: postData.author.name,
        url: postData.author.url,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Zoptal',
        logo: {
          '@type': 'ImageObject',
          url: 'https://zoptal.com/images/logo.png',
        },
        url: 'https://zoptal.com',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://zoptal.com/blog/${postData.slug}`,
      },
      image: postData.image ? {
        '@type': 'ImageObject',
        url: postData.image.url,
        width: postData.image.width,
        height: postData.image.height,
      } : undefined,
      articleSection: postData.category,
      keywords: postData.tags.join(', '),
      wordCount,
      timeRequired: `PT${readingTime}M`,
      about: {
        '@type': 'Thing',
        name: postData.category,
      },
    },
    
    // WebSite schema for site search
    {
      '@type': 'WebSite',
      '@id': 'https://zoptal.com#website',
      url: 'https://zoptal.com',
      name: 'Zoptal',
      description: 'Leading digital agency specializing in web development, design, and digital marketing solutions.',
      publisher: {
        '@id': 'https://zoptal.com#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://zoptal.com/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <html amp="" lang="en">
      <head>
        {/* Comprehensive SEO setup using preset */}
        <AMPSEOHead
          preset={{
            type: 'blog',
            data: postData,
          }}
          additionalSchemas={additionalSchemas}
          enableTwitterCard={true}
          enableOpenGraph={true}
          enableStructuredData={true}
          debug={process.env.NODE_ENV === 'development'}
        />

        {/* Organization structured data */}
        <AMPOrganization organization={organization} />

        {/* Custom AMP CSS would go here */}
        <style amp-custom>{`
          .amp-article {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }
          
          .amp-breadcrumbs {
            margin-bottom: 2rem;
            font-size: 0.875rem;
            color: #6b7280;
          }
          
          .breadcrumb-list {
            display: flex;
            list-style: none;
            padding: 0;
            margin: 0;
            flex-wrap: wrap;
          }
          
          .breadcrumb-item {
            display: flex;
            align-items: center;
          }
          
          .breadcrumb-separator {
            margin: 0 0.5rem;
          }
          
          .amp-article-header {
            margin-bottom: 2rem;
            text-align: center;
          }
          
          .amp-article-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .amp-article-title {
            font-size: 2.5rem;
            font-weight: bold;
            line-height: 1.2;
            margin-bottom: 1rem;
            color: #111827;
          }
          
          .amp-article-excerpt {
            font-size: 1.125rem;
            color: #6b7280;
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          
          .amp-reading-time {
            background: #f3f4f6;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            display: inline-block;
            font-size: 0.875rem;
            color: #374151;
            margin-bottom: 1rem;
          }
          
          .amp-faq {
            margin: 2rem 0;
            padding: 2rem;
            background: #f9fafb;
            border-radius: 0.5rem;
          }
          
          .faq-item {
            margin-bottom: 1.5rem;
          }
          
          .faq-question {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #111827;
          }
          
          .faq-answer {
            color: #4b5563;
            line-height: 1.6;
          }
          
          @media (max-width: 767px) {
            .amp-article {
              padding: 1rem 0.5rem;
            }
            
            .amp-article-title {
              font-size: 2rem;
            }
            
            .amp-article-excerpt {
              font-size: 1rem;
            }
            
            .amp-article-meta {
              flex-direction: column;
              gap: 0.5rem;
            }
          }
        `}</style>
      </head>
      
      <body>
        <AMPAnalyticsProvider {...analyticsConfig}>
          {/* Breadcrumb navigation */}
          <AMPBreadcrumbs items={breadcrumbs} />
          
          <article className="amp-article">
            <header className="amp-article-header">
              <h1 className="amp-article-title">{postData.title}</h1>
              
              <div className="amp-article-meta">
                <span>By {postData.author.name}</span>
                <span>{new Date(postData.publishDate).toLocaleDateString()}</span>
                <span>Category: {postData.category}</span>
              </div>
              
              <div className="amp-reading-time">
                ⏱ {readingTime} min read • {wordCount} words
              </div>

              {postData.description && (
                <p className="amp-article-excerpt">{postData.description}</p>
              )}
            </header>

            {/* Main article content */}
            <AMPBlogPost post={post} />

            {/* FAQ section if available */}
            {faqs.length > 0 && (
              <>
                <h2>Frequently Asked Questions</h2>
                <AMPFAQ faqs={faqs} />
              </>
            )}

            {/* Related articles section */}
            <section className="amp-related-articles">
              <h2>Related Articles</h2>
              <p>Discover more insights on our blog.</p>
              <a href="/blog" className="amp-btn amp-btn-primary">
                View All Articles
              </a>
            </section>

            {/* Call-to-action section */}
            <section className="amp-cta">
              <h2>Ready to Start Your Project?</h2>
              <p>Let's discuss how we can help you achieve your goals.</p>
              <a 
                href="/contact" 
                className="amp-btn amp-btn-primary amp-btn-large"
                data-cta="contact"
              >
                Get in Touch
              </a>
            </section>
          </article>
        </AMPAnalyticsProvider>
      </body>
    </html>
  );
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  // This would fetch all blog post slugs from Contentful
  // For now, return empty array
  return [];
}

// Alternative: Static blog post page with minimal SEO
export function StaticAMPBlogPost({
  title,
  description,
  slug,
  content,
}: {
  title: string;
  description: string;
  slug: string;
  content: string;
}) {
  return (
    <html amp="" lang="en">
      <head>
        <AMPSEOHead
          title={title}
          description={description}
          canonical={`https://zoptal.com/blog/${slug}`}
          ampUrl={`https://zoptal.com/blog/${slug}/amp`}
          type="article"
          author={{
            name: 'Zoptal Team',
            url: 'https://zoptal.com/team',
          }}
          publisher={{
            name: 'Zoptal',
            logo: 'https://zoptal.com/images/logo.png',
            url: 'https://zoptal.com',
          }}
          twitter={{
            card: 'summary_large_image',
            site: '@zoptal',
          }}
          robots={{
            index: true,
            follow: true,
            maxImagePreview: 'large',
          }}
        />
      </head>
      
      <body>
        <article className="amp-article">
          <h1>{title}</h1>
          <p>{description}</p>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </article>
      </body>
    </html>
  );
}