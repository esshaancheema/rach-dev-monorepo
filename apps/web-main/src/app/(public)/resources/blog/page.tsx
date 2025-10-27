import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getBlogPosts } from '@/lib/cms/server';

export const metadata: Metadata = {
  title: 'Tech Blog | AI & Development Insights | Zoptal',
  description: 'Latest AI & software development insights, tutorials & industry news. Expert content from Zoptal\'s engineering team on tech trends.',
  keywords: [
    'software development blog',
    'AI technology blog',
    'mobile app development insights',
    'tech trends 2024',
    'software engineering best practices',
    'AI implementation guides',
    'development tutorials',
  ],
  alternates: {
    canonical: 'https://zoptal.com/resources/blog',
  },
};

interface BlogPageProps {
  searchParams: {
    category?: string;
    tag?: string;
    page?: string;
    search?: string;
  };
}

async function FeaturedPost() {
  const posts = await getBlogPosts({ featured: true, limit: 1 });
  const featuredPost = posts[0];
  
  if (!featuredPost) return null;
  
  return (
    <section className="mb-16">
      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-0">
          {featuredPost.coverImage && (
            <div className="aspect-video lg:aspect-auto relative">
              <Image
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="primary">Featured</Badge>
              <Badge variant="outline">{featuredPost.category}</Badge>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <Link 
                href={`/resources/blog/${featuredPost.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {featuredPost.title}
              </Link>
            </h2>
            <p className="text-lg text-gray-600 mb-6 line-clamp-3">
              {featuredPost.excerpt}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                {featuredPost.author.avatar && (
                  <Image
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span>{featuredPost.author.name}</span>
              </div>
              <span>•</span>
              <time>{formatDate(featuredPost.publishedAt)}</time>
              <span>•</span>
              <span>{featuredPost.readTime} min read</span>
            </div>
            <div>
              <Link href={`/resources/blog/${featuredPost.slug}`}>
                <Button variant="primary">
                  Read Article →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = parseInt(searchParams.page || '1');
  const postsPerPage = 12;
  
  const [posts, categories, popularTags] = await Promise.all([
    getBlogPosts({
      category: searchParams.category,
      tag: searchParams.tag,
      search: searchParams.search,
      page,
      limit: postsPerPage,
    }),
    getCategories(),
    getTags({ limit: 10 }),
  ]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Zoptal Engineering Blog
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Insights, tutorials, and best practices from our engineering team. 
              Stay updated with the latest in AI, software development, and technology.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form action="/resources/blog" method="get" className="relative">
                <Input
                  type="search"
                  name="search"
                  placeholder="Search articles..."
                  defaultValue={searchParams.search}
                  className="pl-12 pr-4 py-3 text-gray-900 bg-white"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Featured Post (only on first page without filters) */}
          {page === 1 && !searchParams.category && !searchParams.tag && !searchParams.search && (
            <FeaturedPost />
          )}
          
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/resources/blog"
                      className={`block py-2 px-3 rounded-lg transition-colors ${
                        !searchParams.category
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      All Articles
                    </Link>
                  </li>
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/resources/blog?category=${category.slug}`}
                        className={`block py-2 px-3 rounded-lg transition-colors ${
                          searchParams.category === category.slug
                            ? 'bg-blue-50 text-blue-600'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className="flex justify-between items-center">
                          {category.name}
                          <span className="text-sm text-gray-500">
                            ({category.count})
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Popular Tags */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Link
                      key={tag.slug}
                      href={`/resources/blog?tag=${tag.slug}`}
                    >
                      <Badge
                        variant={searchParams.tag === tag.slug ? 'primary' : 'outline'}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Newsletter Signup */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <h3 className="text-lg font-semibold mb-3">
                  Subscribe to Our Newsletter
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get the latest articles delivered to your inbox weekly.
                </p>
                <form className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Your email"
                    required
                  />
                  <Button variant="primary" className="w-full">
                    Subscribe
                  </Button>
                </form>
              </Card>
            </aside>
            
            {/* Blog Posts Grid */}
            <div className="lg:col-span-3">
              {/* Active Filters */}
              {(searchParams.category || searchParams.tag || searchParams.search) && (
                <div className="mb-6 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600">Filtering by:</span>
                  {searchParams.category && (
                    <Badge variant="primary" className="flex items-center gap-1">
                      Category: {searchParams.category}
                      <Link
                        href="/resources/blog"
                        className="ml-1 hover:text-white"
                      >
                        ×
                      </Link>
                    </Badge>
                  )}
                  {searchParams.tag && (
                    <Badge variant="primary" className="flex items-center gap-1">
                      Tag: {searchParams.tag}
                      <Link
                        href="/resources/blog"
                        className="ml-1 hover:text-white"
                      >
                        ×
                      </Link>
                    </Badge>
                  )}
                  {searchParams.search && (
                    <Badge variant="primary" className="flex items-center gap-1">
                      Search: "{searchParams.search}"
                      <Link
                        href="/resources/blog"
                        className="ml-1 hover:text-white"
                      >
                        ×
                      </Link>
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Posts Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {posts.items.map((post) => (
                  <Card key={post.slug} className="hover:shadow-lg transition-shadow">
                    {post.coverImage && (
                      <Link href={`/resources/blog/${post.slug}`}>
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" size="sm">
                          {post.category}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {post.readTime} min read
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold mb-3">
                        <Link
                          href={`/resources/blog/${post.slug}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {post.author.avatar && (
                            <Image
                              src={post.author.avatar}
                              alt={post.author.name}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          )}
                          <span>{post.author.name}</span>
                          <span>•</span>
                          <time>{formatDate(post.publishedAt)}</time>
                        </div>
                        <Link
                          href={`/resources/blog/${post.slug}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Read →
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {posts.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/resources/blog?${new URLSearchParams({
                        ...searchParams,
                        page: (page - 1).toString(),
                      })}`}
                    >
                      <Button variant="outline">
                        ← Previous
                      </Button>
                    </Link>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: posts.totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === posts.totalPages || Math.abs(p - page) <= 2)
                      .map((p, index, array) => (
                        <React.Fragment key={p}>
                          {index > 0 && array[index - 1] !== p - 1 && (
                            <span className="px-2">...</span>
                          )}
                          <Link
                            href={`/resources/blog?${new URLSearchParams({
                              ...searchParams,
                              page: p.toString(),
                            })}`}
                          >
                            <Button
                              variant={p === page ? 'primary' : 'outline'}
                              size="sm"
                            >
                              {p}
                            </Button>
                          </Link>
                        </React.Fragment>
                      ))}
                  </div>
                  
                  {page < posts.totalPages && (
                    <Link
                      href={`/resources/blog?${new URLSearchParams({
                        ...searchParams,
                        page: (page + 1).toString(),
                      })}`}
                    >
                      <Button variant="outline">
                        Next →
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}