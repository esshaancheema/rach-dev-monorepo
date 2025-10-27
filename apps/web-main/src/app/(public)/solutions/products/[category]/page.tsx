import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FunnelIcon,
  MagnifyingGlassIcon,
  StarIcon,
  ArrowPathIcon,
  CheckIcon,
  ShoppingCartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { SEOHead, StructuredData } from '@/components/seo';

interface Props {
  params: {
    category: string;
  };
}

// Static category data - in a real app, this would come from a database/CMS
const categoryData: Record<string, any> = {
  'web-applications': {
    title: 'Web Applications',
    description: 'Modern, responsive web applications built with cutting-edge technologies and AI-powered features',
    icon: '🌐',
    color: 'from-blue-500 to-cyan-500',
    totalProducts: 25,
    tags: ['React', 'Next.js', 'Vue.js', 'Angular', 'PWA', 'SPA'],
    industries: ['E-commerce', 'Healthcare', 'Finance', 'Education', 'Real Estate'],
    priceRange: '$299 - $2,999'
  },
  'mobile-apps': {
    title: 'Mobile Applications',
    description: 'Native and cross-platform mobile apps with AI-powered features and seamless user experiences',
    icon: '📱',
    color: 'from-purple-500 to-pink-500',
    totalProducts: 18,
    tags: ['React Native', 'Flutter', 'iOS', 'Android', 'Cross-platform'],
    industries: ['Fitness', 'Finance', 'Social', 'Productivity', 'Entertainment'],
    priceRange: '$499 - $4,999'
  },
  'api-solutions': {
    title: 'API & Backend Solutions',
    description: 'Scalable APIs and backend services with intelligent data processing and real-time capabilities',
    icon: '⚡',
    color: 'from-green-500 to-emerald-500',
    totalProducts: 32,
    tags: ['REST API', 'GraphQL', 'Microservices', 'Serverless', 'WebSockets'],
    industries: ['Fintech', 'Healthcare', 'E-commerce', 'Analytics', 'IoT'],
    priceRange: '$199 - $1,999'
  },
  'ai-tools': {
    title: 'AI-Powered Tools',
    description: 'Intelligent automation tools and AI-driven business solutions for enhanced productivity',
    icon: '🤖',
    color: 'from-orange-500 to-red-500',
    totalProducts: 15,
    tags: ['Machine Learning', 'NLP', 'Computer Vision', 'Automation', 'Analytics'],
    industries: ['Customer Service', 'Marketing', 'Operations', 'HR', 'Content'],
    priceRange: '$399 - $3,999'
  },
  'enterprise-solutions': {
    title: 'Enterprise Solutions',
    description: 'Comprehensive enterprise-grade software solutions with advanced security and scalability',
    icon: '🏢',
    color: 'from-indigo-500 to-purple-500',
    totalProducts: 22,
    tags: ['CRM', 'ERP', 'Workflow', 'Integration', 'Compliance'],
    industries: ['Manufacturing', 'Healthcare', 'Finance', 'Government', 'Retail'],
    priceRange: '$999 - $9,999'
  },
  'cloud-platforms': {
    title: 'Cloud Platforms',
    description: 'Cloud-native platforms and infrastructure management solutions for modern enterprises',
    icon: '☁️',
    color: 'from-teal-500 to-blue-500',
    totalProducts: 12,
    tags: ['DevOps', 'Monitoring', 'Auto-scaling', 'Container', 'Serverless'],
    industries: ['Technology', 'Startups', 'Enterprise', 'Government', 'Healthcare'],
    priceRange: '$199 - $2,499'
  }
};

// Mock products data
const generateProducts = (category: string, count: number) => {
  const baseProducts = [
    {
      id: 1,
      title: 'E-commerce Pro Platform',
      shortDescription: 'Complete e-commerce solution with AI recommendations',
      price: '$999',
      originalPrice: '$1,299',
      rating: 4.9,
      reviews: 124,
      tags: ['Bestseller', 'AI-Powered'],
      features: ['Payment Integration', 'Inventory Management', 'Analytics', 'Mobile Responsive'],
      deploymentTime: '2-3 days',
      supportIncluded: true,
      customizable: true
    },
    {
      id: 2,
      title: 'Social Network Starter',
      shortDescription: 'Full-featured social networking platform template',
      price: '$799',
      originalPrice: null,
      rating: 4.7,
      reviews: 89,
      tags: ['Popular', 'Real-time'],
      features: ['User Authentication', 'Real-time Chat', 'News Feed', 'Media Sharing'],
      deploymentTime: '3-5 days',
      supportIncluded: true,
      customizable: true
    },
    {
      id: 3,
      title: 'SaaS Dashboard Template',
      shortDescription: 'Modern dashboard with analytics and user management',
      price: '$599',
      originalPrice: '$799',
      rating: 4.8,
      reviews: 156,
      tags: ['New', 'Analytics'],
      features: ['User Management', 'Subscription Handling', 'Analytics', 'API Integration'],
      deploymentTime: '1-2 days',
      supportIncluded: true,
      customizable: true
    }
  ];

  return Array.from({ length: count }, (_, index) => ({
    ...baseProducts[index % baseProducts.length],
    id: index + 1,
    title: `${baseProducts[index % baseProducts.length].title} ${index > 2 ? `v${index}` : ''}`,
  }));
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = categoryData[params.category];
  
  if (!category) {
    return {
      title: 'Category Not Found | Zoptal',
      description: 'The requested product category was not found.'
    };
  }

  return {
    title: `${category.title} | AI-Powered Development Products | Zoptal`,
    description: `${category.description}. Browse ${category.totalProducts}+ ready-to-deploy solutions starting from ${category.priceRange.split(' - ')[0]}.`,
    keywords: [
      ...category.tags,
      ...category.industries,
      'AI development',
      'ready-built solutions',
      category.title.toLowerCase()
    ]
  };
}

export default function CategoryPage({ params }: Props) {
  const category = categoryData[params.category];
  
  if (!category) {
    notFound();
  }

  const products = generateProducts(params.category, Math.min(category.totalProducts, 12));
  const filters = ['All Products', 'Bestsellers', 'New Arrivals', 'Most Popular', 'Price: Low to High', 'Price: High to Low'];
  const sortOptions = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Newest'];

  return (
    <>
      <SEOHead
        title={`${category.title} | AI-Powered Development Products | Zoptal`}
        description={`${category.description}. Browse ${category.totalProducts}+ ready-to-deploy solutions starting from ${category.priceRange.split(' - ')[0]}.`}
        canonicalUrl={`https://zoptal.com/solutions/products/${params.category}`}
        keywords={[...category.tags, ...category.industries]}
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${category.title} - Zoptal`,
          "description": category.description,
          "url": `https://zoptal.com/solutions/products/${params.category}`,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": category.totalProducts,
            "itemListElement": products.slice(0, 3).map((product, index) => ({
              "@type": "Product",
              "position": index + 1,
              "name": product.title,
              "description": product.shortDescription,
              "offers": {
                "@type": "Offer",
                "price": product.price.replace('$', ''),
                "priceCurrency": "USD"
              }
            }))
          }
        }}
      />

      <MainLayout>
        {/* Category Header */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                <span className="text-2xl">{category.icon}</span>
                <span>{category.totalProducts} Products Available</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
              >
                {category.title}
                <br />
                <span className={`bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                  Solutions
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-gray-600 mb-8"
              >
                {category.description}
              </motion.p>

              {/* Category Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {category.totalProducts}+
                  </div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {category.priceRange.split(' - ')[0]}
                  </div>
                  <div className="text-sm text-gray-600">Starting From</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    1-5
                  </div>
                  <div className="text-sm text-gray-600">Days Deploy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    24/7
                  </div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </motion.div>

              {/* Technology Tags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap justify-center gap-2"
              >
                {category.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Filters and Sort */}
              <div className="flex gap-4">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>All Categories</option>
                  {category.industries.map((industry: string) => (
                    <option key={industry}>{industry}</option>
                  ))}
                </select>
                
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  {sortOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Product Image Placeholder */}
                  <div className="relative bg-gradient-to-br from-primary-50 to-secondary-50 h-48 flex items-center justify-center">
                    <div className="text-6xl">{category.icon}</div>
                    {product.tags && product.tags.length > 0 && (
                      <div className="absolute top-3 left-3 flex gap-2">
                        {product.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {product.originalPrice && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Sale
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Product Header */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-center space-x-1 text-sm">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-gray-600">{product.rating}</span>
                        <span className="text-gray-400">({product.reviews})</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 text-sm">
                      {product.shortDescription}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-4">
                      {product.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-600">
                          <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Product Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <ArrowPathIcon className="w-4 h-4 mr-1" />
                        {product.deploymentTime}
                      </div>
                      {product.supportIncluded && (
                        <div className="flex items-center">
                          <CheckIcon className="w-4 h-4 text-green-500 mr-1" />
                          Support
                        </div>
                      )}
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {product.originalPrice}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link
                          href={`/solutions/products/${params.category}/${product.id}`}
                          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm">
                          Get Started
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="inline-flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                <span>Load More Products</span>
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Need a Custom {category.title.slice(0, -1)}?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Can't find exactly what you're looking for? Our AI development experts 
                can create a custom solution tailored to your specific requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <span>Request Custom Solution</span>
                  <ShoppingCartIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/solutions/products"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg border border-primary-200 hover:bg-primary-50 transition-all font-semibold"
                >
                  <span>Browse All Categories</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </MainLayout>
    </>
  );
}