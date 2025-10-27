'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RichTextRenderer } from './RichTextRenderer';
import { ShareButtons } from './ShareButtons';
import { generateContentShareUrls } from '@/lib/cms/utils';
import type { Entry } from 'contentful';

interface BlogPostContentProps {
  post: Entry<any>;
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
  const { fields } = post;
  const shareUrls = generateContentShareUrls(
    fields.title,
    `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${fields.slug}`,
    fields.excerpt
  );

  return (
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
              <Link href="/blog" className="hover:text-gray-900">
                Blog
              </Link>
              <span>/</span>
              <span className="text-gray-900">{fields.title}</span>
            </nav>
            
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="primary" size="sm">
                  {fields.categoryName}
                </Badge>
                {fields.featured && (
                  <Badge variant="secondary" size="sm">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {fields.title}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {fields.excerpt}
              </p>
              
              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>{fields.authorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span>{fields.formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>{fields.readingTime} min read</span>
                </div>
              </div>
            </div>
            
            {/* Featured Image */}
            {fields.featuredImageUrl && (
              <div className="aspect-video relative rounded-xl overflow-hidden shadow-xl mb-12">
                <Image
                  src={fields.featuredImageUrl}
                  alt={fields.title}
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-12">
              {/* Article Content */}
              <div className="flex-1">
                <div className="prose prose-lg max-w-none">
                  <RichTextRenderer content={fields.content} />
                </div>
                
                {/* Tags */}
                {fields.tagNames && fields.tagNames.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {fields.tagNames.map((tag: string) => (
                        <Badge key={tag} variant="outline" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Share Buttons */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <ShareButtons
                    title={fields.title}
                    url={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${fields.slug}`}
                    description={fields.excerpt}
                  />
                </div>
              </div>
              
              {/* Sidebar */}
              <aside className="w-80 hidden lg:block">
                <div className="sticky top-24 space-y-8">
                  {/* Author Info */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">About the Author</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">{fields.authorName}</div>
                        <div className="text-sm text-gray-600">Content Writer</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Expert in software development and technology trends.
                    </p>
                  </Card>
                  
                  {/* Table of Contents */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Table of Contents</h3>
                    <nav className="space-y-2 text-sm">
                      <Link href="#introduction" className="block text-gray-600 hover:text-gray-900">
                        Introduction
                      </Link>
                      <Link href="#main-points" className="block text-gray-600 hover:text-gray-900">
                        Main Points
                      </Link>
                      <Link href="#conclusion" className="block text-gray-600 hover:text-gray-900">
                        Conclusion
                      </Link>
                    </nav>
                  </Card>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
      
      {/* Related Posts */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Related Posts</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Related posts would be fetched and rendered here */}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Let's discuss how our expertise can help you achieve your goals.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/contact">
                <Button variant="white" size="lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline-white" size="lg">
                  Our Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}