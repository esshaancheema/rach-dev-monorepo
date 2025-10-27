import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog | Zoptal - AI & Software Development Insights',
  description: 'Latest insights on AI-powered development, software engineering best practices, and digital transformation strategies from Zoptal experts.',
};

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: 'Getting Started with AI-Powered Development',
      excerpt: 'Learn how AI tools can accelerate your development workflow and improve code quality.',
      date: '2024-01-15',
      author: 'Zoptal Team',
      category: 'AI Development',
      slug: 'getting-started-ai-powered-development'
    },
    {
      id: 2,
      title: 'Building Scalable Microservices Architecture',
      excerpt: 'Best practices for designing and implementing microservices that can handle enterprise scale.',
      date: '2024-01-10',
      author: 'Zoptal Team',
      category: 'Architecture',
      slug: 'scalable-microservices-architecture'
    },
    {
      id: 3,
      title: 'The Future of Mobile App Development',
      excerpt: 'Exploring emerging trends and technologies shaping the future of mobile applications.',
      date: '2024-01-05',
      author: 'Zoptal Team',
      category: 'Mobile Development',
      slug: 'future-mobile-app-development'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Zoptal Blog
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Insights, tutorials, and best practices for AI-powered software development
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-blue-600 to-indigo-600"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                      <span className="text-gray-500 text-sm">{post.date}</span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                        {post.title}
                      </Link>
                    </h2>
                    
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">By {post.author}</span>
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8">Get the latest insights delivered to your inbox</p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}