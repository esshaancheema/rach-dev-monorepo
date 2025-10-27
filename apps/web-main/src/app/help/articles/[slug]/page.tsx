import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeftIcon,
  ClockIcon,
  EyeIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ShareIcon,
  BookmarkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { getHelpArticleBySlug, getHelpCategoryBySlug, helpArticles } from '@/lib/help/data';
import ArticleContent from '@/components/help/ArticleContent';
import ArticleCard from '@/components/help/ArticleCard';
import HelpfulFeedback from '@/components/help/HelpfulFeedback';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return helpArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getHelpArticleBySlug(params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found | Zoptal Help Center',
    };
  }

  return {
    title: article.seo.title,
    description: article.seo.description,
    keywords: article.seo.keywords,
    authors: [{ name: article.author.name }],
    openGraph: {
      title: article.seo.title,
      description: article.seo.description,
      url: `https://zoptal.com/help/articles/${article.slug}`,
      siteName: 'Zoptal',
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seo.title,
      description: article.seo.description,
      creator: '@ZoptalTech',
    },
  };
}

export default function HelpArticlePage({ params }: Props) {
  const article = getHelpArticleBySlug(params.slug);
  
  if (!article) {
    notFound();
  }

  const category = getHelpCategoryBySlug(article.categoryId);
  const helpfulPercentage = Math.round((article.helpful / (article.helpful + article.notHelpful)) * 100);
  
  // Get related articles
  const relatedArticles = helpArticles
    .filter(a => a.id !== article.id && (
      a.categoryId === article.categoryId ||
      a.tags.some(tag => article.tags.includes(tag))
    ))
    .slice(0, 3);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/help"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-2" />
              Back to Help Center
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Article Header */}
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  {category && (
                    <Link
                      href={`/help/categories/${category.slug}`}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${category.color.replace('bg-', 'bg-').replace('-500', '-100')} ${category.color.replace('bg-', 'text-').replace('-500', '-800')} hover:opacity-80 transition-opacity`}
                    >
                      {category.icon} {category.name}
                    </Link>
                  )}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(article.difficulty)}`}>
                    {article.difficulty}
                  </span>
                  {article.featured && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {article.title}
                </h1>

                <p className="text-lg text-gray-600 mb-6">
                  {article.excerpt}
                </p>

                {/* Article Meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {article.estimatedReadTime}
                    </div>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {article.views.toLocaleString()} views
                    </div>
                    <div className="flex items-center">
                      <HandThumbUpIcon className="h-4 w-4 mr-1" />
                      {helpfulPercentage}% helpful
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <ShareIcon className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <BookmarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center mt-6 pt-6 border-t border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-medium">
                      {article.author.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{article.author.name}</p>
                    <p className="text-sm text-gray-500">{article.author.role}</p>
                  </div>
                  <div className="ml-auto text-sm text-gray-500">
                    <p>Published {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}</p>
                    {article.updatedAt !== article.publishedAt && (
                      <p>Updated {new Date(article.updatedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-8">
                <ArticleContent content={article.content} />
              </div>

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="px-8 py-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/help/search?tag=${encodeURIComponent(tag)}`}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Helpful Feedback */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                <HelpfulFeedback articleId={article.id} />
              </div>
            </article>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedArticles.map((relatedArticle) => (
                    <ArticleCard key={relatedArticle.id} article={relatedArticle} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Table of Contents */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">In This Article</h3>
                <nav className="text-sm space-y-2">
                  {/* This would be generated from the article content headings */}
                  <a href="#getting-started" className="block text-gray-600 hover:text-blue-600 transition-colors">
                    Getting Started
                  </a>
                  <a href="#next-steps" className="block text-gray-600 hover:text-blue-600 transition-colors">
                    Next Steps
                  </a>
                  <a href="#contact-support" className="block text-gray-600 hover:text-blue-600 transition-colors">
                    Contact Support
                  </a>
                </nav>
              </div>

              {/* Need Help */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Need More Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.excerpt,
            author: {
              '@type': 'Person',
              name: article.author.name,
              jobTitle: article.author.role,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Zoptal',
              url: 'https://zoptal.com',
            },
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            url: `https://zoptal.com/help/articles/${article.slug}`,
            keywords: article.tags.join(', '),
            articleSection: category?.name,
            wordCount: article.content.split(' ').length,
            timeRequired: article.estimatedReadTime,
          }),
        }}
      />
    </div>
  );
}