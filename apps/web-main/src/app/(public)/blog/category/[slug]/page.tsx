import { Metadata } from 'next';
import Link from 'next/link';

interface BlogCategoryPageProps {
  params: {
    slug: string;
  };
}

// Helper function to format category names
function formatCategoryName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generate metadata based on category
export async function generateMetadata({ params }: BlogCategoryPageProps): Promise<Metadata> {
  const categoryName = formatCategoryName(params.slug);
  
  return {
    title: `${categoryName} Articles | Zoptal Blog`,
    description: `Explore our latest ${categoryName.toLowerCase()} articles, tutorials, and insights. Stay updated with the latest trends and best practices in ${categoryName.toLowerCase()}.`,
    keywords: [
      `${categoryName.toLowerCase()} articles`,
      `${categoryName.toLowerCase()} blog`,
      `${categoryName.toLowerCase()} tutorials`,
      'tech blog',
      'software development',
      'zoptal blog'
    ]
  };
}

export default function BlogCategoryPage({ params }: BlogCategoryPageProps) {
  const categoryName = formatCategoryName(params.slug);
  
  // Mock articles data - in a real app this would come from a CMS or API
  const articles = [
    {
      id: 1,
      title: `Getting Started with ${categoryName}`,
      excerpt: `A comprehensive guide to understanding the fundamentals of ${categoryName.toLowerCase()} and how to get started.`,
      author: 'Zoptal Team',
      date: '2024-01-15',
      readTime: '8 min read',
      tags: [categoryName.toLowerCase(), 'tutorial', 'beginner'],
      slug: `getting-started-with-${params.slug}`
    },
    {
      id: 2,
      title: `Advanced ${categoryName} Techniques`,
      excerpt: `Deep dive into advanced concepts and techniques for mastering ${categoryName.toLowerCase()}.`,
      author: 'John Developer',
      date: '2024-01-10',
      readTime: '12 min read',
      tags: [categoryName.toLowerCase(), 'advanced', 'techniques'],
      slug: `advanced-${params.slug}-techniques`
    },
    {
      id: 3,
      title: `${categoryName} Best Practices`,
      excerpt: `Industry best practices and patterns for effective ${categoryName.toLowerCase()} implementation.`,
      author: 'Jane Tech Lead',
      date: '2024-01-05',
      readTime: '10 min read',
      tags: [categoryName.toLowerCase(), 'best-practices', 'guide'],
      slug: `${params.slug}-best-practices`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex items-center mb-6">
              <Link 
                href="/blog" 
                className="text-purple-300 hover:text-white transition-colors mr-4"
              >
                ← Back to Blog
              </Link>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {categoryName} Articles
            </h1>
            
            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              Discover the latest insights, tutorials, and best practices in {categoryName.toLowerCase()}. 
              Stay ahead with expert knowledge and practical guides.
            </p>
            
            <div className="flex items-center space-x-6 text-purple-200">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                {articles.length} Articles
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Updated Weekly
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Filter and Sort */}
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Sort by:</span>
                <select className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option>Latest</option>
                  <option>Most Popular</option>
                  <option>Alphabetical</option>
                </select>
              </div>
              
              <div className="text-gray-600">
                Showing {articles.length} articles
              </div>
            </div>

            {/* Articles List */}
            <div className="space-y-8">
              {articles.map((article) => (
                <article 
                  key={article.id}
                  className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-purple-600 transition-colors">
                        <Link href={`/blog/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h2>
                      
                      <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <span>By {article.author}</span>
                        <span>•</span>
                        <span>{new Date(article.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                        <span>•</span>
                        <span>{article.readTime}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors cursor-pointer"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href={`/blog/${article.slug}`}
                    className="inline-flex items-center text-purple-600 hover:text-purple-800 font-semibold"
                  >
                    Read Article →
                  </Link>
                </article>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                Load More Articles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Categories */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Explore Other Categories
            </h3>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                'web-development',
                'ai-integration', 
                'mobile-development',
                'devops',
                'api-development',
                'cloud-computing',
                'cybersecurity',
                'ui-ux'
              ].filter(cat => cat !== params.slug).slice(0, 6).map((category) => (
                <Link
                  key={category}
                  href={`/blog/category/${category}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                >
                  <div className="font-semibold text-gray-900 mb-1">
                    {formatCategoryName(category)}
                  </div>
                  <div className="text-sm text-gray-600">
                    View Articles
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Stay Updated with {categoryName} Content
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Get the latest {categoryName.toLowerCase()} articles, tutorials, and insights 
            delivered directly to your inbox. Never miss an update!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <button className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}