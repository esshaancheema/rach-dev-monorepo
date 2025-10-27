import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPost } from '@/lib/cms/server';
import { transformBlogPost } from '@/lib/cms/utils';
import { generateBlogPostSchema } from '@/lib/seo/schemaMarkup';
import { generateMetaTitle, generateMetaDescription } from '@/lib/cms/utils';
import AMPBlogPost from '@/components/amp/AMPBlogPost';

interface AMPBlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: AMPBlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  const transformedPost = transformBlogPost(post);
  const { fields } = transformedPost;
  
  const title = generateMetaTitle(fields.title);
  const description = generateMetaDescription(fields.excerpt);
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${fields.slug}`;
  const ampUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${fields.slug}/amp`;
  
  return {
    title,
    description,
    keywords: fields.tagNames.join(', '),
    authors: [{ name: fields.authorName }],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: ampUrl,
      siteName: 'Zoptal',
      images: fields.featuredImageUrl ? [{
        url: fields.featuredImageUrl,
        width: 1200,
        height: 630,
        alt: fields.title,
      }] : undefined,
      publishedTime: fields.publishDate,
      modifiedTime: post.sys.updatedAt,
      authors: [fields.authorName],
      section: fields.categoryName,
      tags: fields.tagNames,
    },
    other: {
      // AMP-specific meta tags
      'amp-link-variable-allowed-origin': process.env.NEXT_PUBLIC_SITE_URL,
      'amp-google-client-id-api': 'googleanalytics',
    },
  };
}

export default async function AMPBlogPostPage({ params }: AMPBlogPostPageProps) {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    notFound();
  }

  const transformedPost = transformBlogPost(post);
  const { fields } = transformedPost;
  
  // Generate schema markup
  const schema = generateBlogPostSchema({
    title: fields.title,
    description: fields.excerpt,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${fields.slug}/amp`,
    author: fields.authorName,
    datePublished: fields.publishDate,
    dateModified: post.sys.updatedAt,
    image: fields.featuredImageUrl,
    category: fields.categoryName,
    tags: fields.tagNames,
    wordCount: fields.content ? JSON.stringify(fields.content).length / 5 : undefined,
    readingTime: `${fields.readingTime} min`,
  });

  return (
    <html amp="" lang="en">
      <head>
        <meta charSet="utf-8" />
        <script async src="https://cdn.ampproject.org/v0.js"></script>
        <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
        <script async custom-element="amp-social-share" src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js"></script>
        <script async custom-element="amp-sidebar" src="https://cdn.ampproject.org/v0/amp-sidebar-0.1.js"></script>
        <script async custom-element="amp-img" src="https://cdn.ampproject.org/v0/amp-img-0.1.js"></script>
        <script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>
        
        <title>{generateMetaTitle(fields.title)}</title>
        <meta name="description" content={generateMetaDescription(fields.excerpt)} />
        <meta name="keywords" content={fields.tagNames.join(', ')} />
        <meta name="author" content={fields.authorName} />
        
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${fields.slug}`} />
        <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
        
        {/* Open Graph */}
        <meta property="og:title" content={fields.title} />
        <meta property="og:description" content={fields.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${fields.slug}/amp`} />
        <meta property="og:site_name" content="Zoptal" />
        {fields.featuredImageUrl && (
          <meta property="og:image" content={fields.featuredImageUrl} />
        )}
        <meta property="article:author" content={fields.authorName} />
        <meta property="article:published_time" content={fields.publishDate} />
        <meta property="article:section" content={fields.categoryName} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fields.title} />
        <meta name="twitter:description" content={fields.excerpt} />
        <meta name="twitter:creator" content="@zoptal" />
        {fields.featuredImageUrl && (
          <meta name="twitter:image" content={fields.featuredImageUrl} />
        )}
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        
        {/* AMP Custom Styles */}
        <style amp-custom dangerouslySetInnerHTML={{
          __html: `
            /* AMP-optimized CSS will be injected here */
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 16px;
            }
            
            .amp-header {
              background: #fff;
              border-bottom: 1px solid #e5e5e5;
              padding: 16px 0;
              margin-bottom: 24px;
            }
            
            .amp-logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              text-decoration: none;
            }
            
            .amp-article {
              max-width: 100%;
            }
            
            .amp-article-header {
              margin-bottom: 32px;
            }
            
            .amp-article-meta {
              display: flex;
              gap: 16px;
              font-size: 14px;
              color: #666;
              margin-bottom: 16px;
            }
            
            .amp-article-title {
              font-size: 32px;
              font-weight: bold;
              line-height: 1.2;
              margin-bottom: 16px;
              color: #111;
            }
            
            .amp-article-excerpt {
              font-size: 18px;
              color: #666;
              margin-bottom: 24px;
            }
            
            .amp-article-content {
              font-size: 16px;
              line-height: 1.7;
            }
            
            .amp-article-content h2 {
              font-size: 24px;
              font-weight: bold;
              margin: 32px 0 16px 0;
              color: #111;
            }
            
            .amp-article-content h3 {
              font-size: 20px;
              font-weight: bold;
              margin: 24px 0 12px 0;
              color: #111;
            }
            
            .amp-article-content p {
              margin-bottom: 16px;
            }
            
            .amp-article-content ul,
            .amp-article-content ol {
              margin-bottom: 16px;
              padding-left: 24px;
            }
            
            .amp-article-content li {
              margin-bottom: 8px;
            }
            
            .amp-article-content blockquote {
              border-left: 4px solid #2563eb;
              margin: 24px 0;
              padding: 16px 24px;
              background: #f8fafc;
              font-style: italic;
            }
            
            .amp-article-content code {
              background: #f1f5f9;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 14px;
              font-family: 'Monaco', 'Consolas', monospace;
            }
            
            .amp-article-content pre {
              background: #1f2937;
              color: #f9fafb;
              padding: 16px;
              border-radius: 8px;
              overflow-x: auto;
              margin: 16px 0;
            }
            
            .amp-article-content pre code {
              background: none;
              padding: 0;
              color: inherit;
            }
            
            .amp-badge {
              display: inline-block;
              background: #e5e7eb;
              color: #374151;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              margin-right: 8px;
            }
            
            .amp-badge.primary {
              background: #2563eb;
              color: white;
            }
            
            .amp-social-share {
              margin: 32px 0;
              padding: 24px 0;
              border-top: 1px solid #e5e5e5;
              border-bottom: 1px solid #e5e5e5;
            }
            
            .amp-social-title {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 16px;
              color: #111;
            }
            
            .amp-social-buttons {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            }
            
            .amp-footer {
              margin-top: 48px;
              padding-top: 24px;
              border-top: 1px solid #e5e5e5;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            
            .amp-cta {
              background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
              color: white;
              padding: 32px;
              border-radius: 12px;
              text-align: center;
              margin: 32px 0;
            }
            
            .amp-cta-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 12px;
            }
            
            .amp-cta-description {
              margin-bottom: 20px;
              opacity: 0.9;
            }
            
            .amp-cta-button {
              background: white;
              color: #2563eb;
              padding: 12px 24px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              display: inline-block;
              transition: transform 0.2s;
            }
            
            .amp-cta-button:hover {
              transform: translateY(-2px);
            }
            
            @media (max-width: 768px) {
              body {
                padding: 12px;
              }
              
              .amp-article-title {
                font-size: 28px;
              }
              
              .amp-article-excerpt {
                font-size: 16px;
              }
              
              .amp-article-meta {
                flex-direction: column;
                gap: 8px;
              }
              
              .amp-social-buttons {
                justify-content: center;
              }
              
              .amp-cta {
                padding: 24px 16px;
              }
              
              .amp-cta-title {
                font-size: 20px;
              }
            }
          `
        }} />
        
        {/* AMP Boilerplate */}
        <style amp-boilerplate dangerouslySetInnerHTML={{
          __html: `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`
        }} />
        <noscript>
          <style amp-boilerplate dangerouslySetInnerHTML={{
            __html: `body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`
          }} />
        </noscript>
      </head>
      
      <body>
        <AMPBlogPost post={transformedPost} />
        
        {/* AMP Analytics */}
        <amp-analytics type="googleanalytics" id="analytics1">
          <script type="application/json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              vars: {
                account: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
              },
              triggers: {
                trackPageview: {
                  on: 'visible',
                  request: 'pageview'
                }
              }
            })
          }} />
        </amp-analytics>
      </body>
    </html>
  );
}