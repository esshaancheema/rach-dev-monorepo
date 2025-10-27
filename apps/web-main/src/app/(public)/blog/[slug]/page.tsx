import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPost, getBlogPosts, generateStaticParams as generateCMSParams } from '@/lib/cms/server';
import { transformBlogPost } from '@/lib/cms/utils';
import { generateBlogPostSchema } from '@/lib/seo/schemaMarkup';
import { generateMetaTitle, generateMetaDescription } from '@/lib/cms/utils';
import BlogPostContent from '@/components/cms/BlogPostContent';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return await generateCMSParams.blogPosts();
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
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
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${fields.slug}`;
  
  const schema = generateBlogPostSchema({
    title: fields.title,
    description: fields.excerpt,
    url,
    author: fields.authorName,
    datePublished: fields.publishDate,
    dateModified: post.sys.updatedAt,
    image: fields.featuredImageUrl,
    category: fields.categoryName,
    tags: fields.tagNames,
    wordCount: fields.content ? JSON.stringify(fields.content).length / 5 : undefined,
    readingTime: `${fields.readingTime} min`,
  });

  return {
    title,
    description,
    keywords: fields.tagNames.join(', '),
    authors: [{ name: fields.authorName }],
    openGraph: {
      title,
      description,
      type: 'article',
      url,
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
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: fields.featuredImageUrl ? [fields.featuredImageUrl] : undefined,
      creator: '@zoptal',
    },
    alternates: {
      canonical: url,
    },
    other: {
      'article:author': fields.authorName,
      'article:published_time': fields.publishDate,
      'article:modified_time': post.sys.updatedAt,
      'article:section': fields.categoryName,
      'article:tag': fields.tagNames.join(', '),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
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
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${fields.slug}`,
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <BlogPostContent post={transformedPost} />
    </>
  );
}