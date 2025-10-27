'use client';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getBlogPost, getBlogPosts } from '@/lib/cms/server';
import { generateBlogPostSchema } from '@/lib/seo/schemaMarkup';

interface PageProps {
  params: {
    slug: string;
  };
}


function TableOfContents({ content }: { content: string }) {
  // Extract headings from content
  const headings = content.match(/^#{2,3}\s.+$/gm) || [];
  
  if (headings.length === 0) return null;
  
  const toc = headings.map((heading) => {
    const level = heading.match(/^#{2,3}/)?.[0].length || 2;
    const text = heading.replace(/^#{2,3}\s/, '');
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    return { level, text, id };
  });
  
  return (
    <Card className="p-6 sticky top-24">
      <h3 className="font-semibold mb-4">Table of Contents</h3>
      <nav>
        <ul className="space-y-2">
          {toc.map((item, index) => (
            <li
              key={index}
              className={`${item.level === 3 ? 'ml-4' : ''}`}
            >
              <a
                href={`#${item.id}`}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Card>
  );
}

function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = `https://zoptal.com/resources/blog/${slug}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-600">Share:</span>
      <div className="flex gap-2">
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Share on Twitter"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        </a>
        <a
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Share on LinkedIn"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
        <button
          onClick={() => navigator.clipboard.writeText(url)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Copy link"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getBlogPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }
  
  const relatedPosts = await getRelatedPosts(params.slug);
  
  const structuredData = generateArticleSchema({
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      name: 'Zoptal',
      logo: 'https://zoptal.com/logo.png',
    },
    url: `https://zoptal.com/resources/blog/${params.slug}`,
  });
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <article className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                <Link href="/" className="hover:text-gray-900">
                  Home
                </Link>
                <span>/</span>
                <Link href="/resources" className="hover:text-gray-900">
                  Resources
                </Link>
                <span>/</span>
                <Link href="/resources/blog" className="hover:text-gray-900">
                  Blog
                </Link>
                <span>/</span>
                <span className="text-gray-900 truncate">{post.title}</span>
              </nav>
              
              {/* Header */}
              <header className="mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="primary" size="sm">
                    {post.category}
                  </Badge>
                  {post.featured && (
                    <Badge variant="secondary" size="sm">
                      Featured
                    </Badge>
                  )}
                  <Badge variant="outline" size="sm">
                    {post.readTime} min read
                  </Badge>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  {post.title}
                </h1>
                
                <p className="text-xl text-gray-600 mb-8">
                  {post.excerpt}
                </p>
                
                {/* Author Info */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {post.author.avatar && (
                      <Image
                        src={post.author.avatar}
                        alt={post.author.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium">{post.author.name}</div>
                      <div className="text-sm text-gray-600">
                        {post.author.role} • {formatDate(post.publishedAt)}
                        {post.updatedAt !== post.publishedAt && (
                          <span> • Updated {formatDate(post.updatedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <ShareButtons title={post.title} slug={params.slug} />
                </div>
              </header>
              
              {/* Hero Image */}
              {post.coverImage && (
                <div className="aspect-video relative rounded-xl overflow-hidden shadow-xl mb-12">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Main Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-4 gap-12">
                {/* Table of Contents - Desktop */}
                <aside className="hidden lg:block lg:col-span-1">
                  <TableOfContents content={post.content} />
                </aside>
                
                {/* Article Content */}
                <div className="lg:col-span-3">
                  <div className="prose prose-lg max-w-none">
                    {/* This would typically render markdown/rich content */}
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  </div>
                  
                  {/* Tags */}
                  <div className="mt-12 pt-8 border-t">
                    <h3 className="text-sm font-medium text-gray-600 mb-3">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/resources/blog?tag=${tag}`}
                        >
                          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                            {tag}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                  
                  {/* Author Bio */}
                  {post.author.bio && (
                    <Card className="mt-12 p-6 bg-gray-50">
                      <div className="flex items-start gap-4">
                        {post.author.avatar && (
                          <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            width={64}
                            height={64}
                            className="rounded-full"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">
                            About {post.author.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {post.author.role}
                          </p>
                          <p className="text-gray-700">
                            {post.author.bio}
                          </p>
                          {post.author.social && (
                            <div className="flex gap-3 mt-3">
                              {post.author.social.twitter && (
                                <a
                                  href={`https://twitter.com/${post.author.social.twitter}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-600 hover:text-blue-600"
                                >
                                  Twitter
                                </a>
                              )}
                              {post.author.social.linkedin && (
                                <a
                                  href={`https://linkedin.com/in/${post.author.social.linkedin}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-600 hover:text-blue-600"
                                >
                                  LinkedIn
                                </a>
                              )}
                              {post.author.social.github && (
                                <a
                                  href={`https://github.com/${post.author.social.github}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-600 hover:text-blue-600"
                                >
                                  GitHub
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost) => (
                    <Card key={relatedPost.slug} className="hover:shadow-lg transition-shadow">
                      {relatedPost.coverImage && (
                        <Link href={`/resources/blog/${relatedPost.slug}`}>
                          <div className="aspect-video relative overflow-hidden rounded-t-lg">
                            <Image
                              src={relatedPost.coverImage}
                              alt={relatedPost.title}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                      )}
                      <div className="p-6">
                        <Badge variant="outline" size="sm" className="mb-3">
                          {relatedPost.category}
                        </Badge>
                        <h3 className="text-xl font-semibold mb-3">
                          <Link
                            href={`/resources/blog/${relatedPost.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {relatedPost.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <div className="text-sm text-gray-500">
                          {formatDate(relatedPost.publishedAt)} • {relatedPost.readTime} min read
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Newsletter CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Stay Updated with Our Latest Insights
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Subscribe to our newsletter and get the latest articles on AI, software development, and technology delivered to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="flex-1 bg-white text-gray-900"
                />
                <Button variant="white" type="submit">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}