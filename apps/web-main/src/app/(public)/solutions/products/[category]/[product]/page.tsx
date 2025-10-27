import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  StarIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckIcon,
  PlayIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { SEOHead, StructuredData } from '@/components/seo';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/generateMetadata';
import { generateProductSchema } from '@/lib/seo/schemas';

interface Props {
  params: {
    category: string;
    product: string;
  };
}

// Mock product data - in a real app, this would come from a database/CMS
const getProductData = (category: string, productId: string) => {
  const products: Record<string, any> = {
    'web-applications': {
      '1': {
        title: 'E-commerce Pro Platform',
        tagline: 'Complete AI-powered e-commerce solution',
        description: 'A comprehensive e-commerce platform with AI-powered product recommendations, advanced analytics, and seamless payment integration. Built for scalability and performance.',
        longDescription: 'Transform your online business with our cutting-edge e-commerce platform. Featuring AI-driven product recommendations, real-time inventory management, advanced customer analytics, and seamless multi-payment gateway integration. Perfect for businesses ready to scale.',
        price: { amount: '999', currency: 'USD' },
        originalPrice: { amount: '1299', currency: 'USD' },
        category: 'E-commerce',
        tags: ['Bestseller', 'AI-Powered', 'Scalable'],
        rating: 4.9,
        reviewCount: 124,
        deploymentTime: '2-3 days',
        supportIncluded: true,
        customizable: true,
        demoUrl: 'https://demo.zoptal.com/ecommerce-pro',
        features: [
          'AI Product Recommendations',
          'Multi-vendor Support',
          'Advanced Analytics Dashboard',
          'Payment Gateway Integration',
          'Inventory Management',
          'SEO Optimization',
          'Mobile Responsive Design',
          'Customer Review System',
          'Wishlist & Favorites',
          'Order Tracking',
          'Coupon & Discount System',
          'Multi-language Support'
        ],
        technicalSpecs: {
          'Frontend': 'React, Next.js, Tailwind CSS',
          'Backend': 'Node.js, Express, GraphQL',
          'Database': 'PostgreSQL, Redis',
          'Payments': 'Stripe, PayPal, Square',
          'Hosting': 'Vercel, AWS, Google Cloud',
          'CDN': 'Cloudflare, AWS CloudFront'
        },
        screenshots: [
          '/images/products/ecommerce-pro/dashboard.png',
          '/images/products/ecommerce-pro/storefront.png',
          '/images/products/ecommerce-pro/analytics.png',
          '/images/products/ecommerce-pro/mobile.png'
        ],
        testimonials: [
          {
            name: 'Sarah Johnson',
            role: 'CEO, Fashion Forward',
            rating: 5,
            comment: 'Increased our online sales by 300% within the first month. The AI recommendations are incredibly accurate.',
            avatar: '/images/testimonials/sarah.jpg'
          },
          {
            name: 'Michael Chen',
            role: 'CTO, TechGear',
            rating: 5,
            comment: 'The platform is robust, scalable, and the deployment was seamless. Excellent support team.',
            avatar: '/images/testimonials/michael.jpg'
          }
        ],
        faqs: [
          {
            question: 'How long does deployment take?',
            answer: 'Typical deployment takes 2-3 business days, including setup, configuration, and testing.'
          },
          {
            question: 'Is the source code included?',
            answer: 'Yes, you receive full access to the source code with documentation and deployment guides.'
          },
          {
            question: 'What payment gateways are supported?',
            answer: 'We support Stripe, PayPal, Square, and can integrate additional gateways as needed.'
          }
        ]
      }
    }
  };

  return products[category]?.[productId] || null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductData(params.category, params.product);
  
  if (!product) {
    return {
      title: 'Product Not Found | Zoptal',
      description: 'The requested product was not found.'
    };
  }

  return generateSEOMetadata({
    title: `${product.title} | AI-Powered ${product.category} Solution | Zoptal`,
    description: `${product.tagline}. ${product.description.substring(0, 120)}...`,
    canonicalUrl: `/solutions/products/${params.category}/${params.product}`,
    keywords: [
      product.title.toLowerCase(),
      product.category.toLowerCase(),
      'AI-powered solution',
      'ready-to-deploy',
      'custom development'
    ],
    type: 'product',
    price: product.price,
    brand: 'Zoptal',
    category: product.category
  });
}

export default function ProductPage({ params }: Props) {
  const product = getProductData(params.category, params.product);
  
  if (!product) {
    notFound();
  }

  const structuredData = generateProductSchema({
    name: product.title,
    description: product.description,
    url: `https://zoptal.com/solutions/products/${params.category}/${params.product}`,
    image: `https://zoptal.com${product.screenshots[0]}`,
    brand: 'Zoptal',
    category: product.category,
    price: product.price,
    availability: 'InStock',
    aggregateRating: {
      ratingValue: product.rating,
      reviewCount: product.reviewCount
    },
    reviews: product.testimonials.map((testimonial: any) => ({
      author: testimonial.name,
      datePublished: '2024-01-15',
      reviewBody: testimonial.comment,
      reviewRating: {
        ratingValue: testimonial.rating
      }
    }))
  });

  return (
    <>
      <SEOHead
        title={`${product.title} | AI-Powered ${product.category} Solution | Zoptal`}
        description={`${product.tagline}. ${product.description}`}
        canonicalUrl={`https://zoptal.com/solutions/products/${params.category}/${params.product}`}
        keywords={[product.title.toLowerCase(), product.category.toLowerCase(), 'AI-powered solution']}
        type="product"
        structuredData={structuredData}
      />

      <MainLayout>
        {/* Product Header */}
        <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm">
              <ol className="flex items-center space-x-2 text-gray-500">
                <li><Link href="/solutions" className="hover:text-primary-600">Solutions</Link></li>
                <li>/</li>
                <li><Link href="/solutions/products" className="hover:text-primary-600">Products</Link></li>
                <li>/</li>
                <li><Link href={`/solutions/products/${params.category}`} className="hover:text-primary-600 capitalize">{params.category.replace('-', ' ')}</Link></li>
                <li>/</li>
                <li className="text-gray-900">{product.title}</li>
              </ol>
            </nav>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Product Info */}
              <div>
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
                >
                  {product.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-xl text-gray-600 mb-6"
                >
                  {product.tagline}
                </motion.p>

                {/* Rating and Reviews */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarSolidIcon
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* Pricing */}
                <div className="flex items-center space-x-4 mb-8">
                  <span className="text-4xl font-bold text-gray-900">
                    ${product.price.amount}
                  </span>
                  {product.originalPrice && (
                    <span className="text-2xl text-gray-500 line-through">
                      ${product.originalPrice.amount}
                    </span>
                  )}
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                    Save ${parseInt(product.originalPrice?.amount || '0') - parseInt(product.price.amount)}
                  </span>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">{product.deploymentTime}</div>
                    <div className="text-xs text-gray-600">Deployment</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <ShieldCheckIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">24/7</div>
                    <div className="text-xs text-gray-600">Support</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Cog6ToothIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Full</div>
                    <div className="text-xs text-gray-600">Customizable</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center">
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                    Get Started Now
                  </button>
                  <Link
                    href={product.demoUrl}
                    target="_blank"
                    className="flex-1 bg-white border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center"
                  >
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Live Demo
                  </Link>
                </div>
              </div>

              {/* Product Screenshots */}
              <div>
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 h-96 flex items-center justify-center mb-4">
                  <div className="text-8xl">{params.category === 'web-applications' ? '🌐' : '📱'}</div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.screenshots.slice(0, 4).map((screenshot: string, index: number) => (
                    <div key={index} className="bg-gray-100 rounded-lg h-16 flex items-center justify-center">
                      <span className="text-xs text-gray-500">Preview {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Details */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Description */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Overview</h2>
                  <p className="text-gray-600 leading-relaxed text-lg mb-6">
                    {product.longDescription}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {product.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {Object.entries(product.technicalSpecs).map(([key, value]) => (
                        <div key={key}>
                          <dt className="font-semibold text-gray-900 mb-1">{key}:</dt>
                          <dd className="text-gray-600">{value as string}</dd>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Testimonials */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
                  <div className="space-y-6">
                    {product.testimonials.map((testimonial: any, index: number) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <UserGroupIcon className="w-6 h-6 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-600 text-sm">{testimonial.role}</span>
                            </div>
                            <div className="flex items-center space-x-1 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <StarSolidIcon
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-700">{testimonial.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQs */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {product.faqs.map((faq: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div>
                {/* Pricing Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 sticky top-8">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      ${product.price.amount}
                    </div>
                    <div className="text-gray-600">One-time purchase</div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Source Code</span>
                      <CheckIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Documentation</span>
                      <CheckIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">6 Months Support</span>
                      <CheckIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Free Updates</span>
                      <CheckIcon className="w-5 h-5 text-green-500" />
                    </div>
                  </div>

                  <button className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold mb-4">
                    Purchase Now
                  </button>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                      <HeartIcon className="w-4 h-4 mr-1" />
                      Save
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                      <ShareIcon className="w-4 h-4 mr-1" />
                      Share
                    </button>
                  </div>
                </div>

                {/* Support Card */}
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
                  <h3 className="font-semibold text-primary-900 mb-4 flex items-center">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                    Need Help?
                  </h3>
                  <p className="text-primary-700 text-sm mb-4">
                    Our experts are ready to help you choose the right solution and get started quickly.
                  </p>
                  <Link
                    href="/contact"
                    className="block text-center bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Related Products
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg h-32 flex items-center justify-center mb-4">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Related Product {item}</h3>
                  <p className="text-gray-600 text-sm mb-4">Brief description of this related product and its key benefits.</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary-600">$599</span>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </MainLayout>
    </>
  );
}