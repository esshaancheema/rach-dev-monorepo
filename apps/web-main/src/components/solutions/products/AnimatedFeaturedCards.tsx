'use client';

import { BeakerIcon } from '@heroicons/react/24/outline';
import { MotionDiv } from '@/components/motion';
import { useStaggeredScrollReveal } from '@/components/motion/hooks/useIntersectionAnimation';
import { AnimationErrorBoundary } from '@/components/motion/AnimationErrorBoundary';
import { useAnimationMetrics } from '@/components/motion/hooks/useAnimationMetrics';

interface FeaturedProduct {
  title: string;
  category: string;
  description: string;
  price: string;
  features: string[];
  image: string;
  tag?: string;
}

interface FeaturedCardsProps {
  featuredProducts: FeaturedProduct[];
}

export function AnimatedFeaturedCards({ featuredProducts }: FeaturedCardsProps) {
  const { containerProps, getItemProps } = useStaggeredScrollReveal(
    featuredProducts.length,
    0.1,
    { threshold: 0.2, once: true }
  );
  const { startTracking, endTracking } = useAnimationMetrics('featured_products_cards');

  return (
    <AnimationErrorBoundary
      animationName="featured_products_cards"
      fallback={<StaticFeaturedCards featuredProducts={featuredProducts} />}
      enableRetry={true}
      maxRetries={2}
    >
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our most popular and battle-tested solutions, ready for immediate deployment.
            </p>
          </div>

          <MotionDiv
            {...containerProps}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            onAnimationStart={startTracking}
            onAnimationComplete={endTracking}
          >
            {featuredProducts.map((product, index) => (
              <MotionDiv
                key={index}
                {...getItemProps(index)}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative">
                  <div className="bg-gradient-to-br from-primary-50 to-secondary-50 h-48 flex items-center justify-center">
                    <BeakerIcon className="w-16 h-16 text-primary-500" />
                  </div>
                  {product.tag && (
                    <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {product.tag}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-primary-600 font-medium">
                      {product.category}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {product.price}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">
                    {product.title}
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {product.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-3">
                    <button className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                      View Details
                    </button>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Demo
                    </button>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </MotionDiv>
        </div>
      </section>
    </AnimationErrorBoundary>
  );
}

// Static fallback for error boundary
function StaticFeaturedCards({ featuredProducts }: FeaturedCardsProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our most popular and battle-tested solutions, ready for immediate deployment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <div className="relative">
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 h-48 flex items-center justify-center">
                  <BeakerIcon className="w-16 h-16 text-primary-500" />
                </div>
                {product.tag && (
                  <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {product.tag}
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-primary-600 font-medium">
                    {product.category}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {product.price}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">
                  {product.title}
                </h3>

                <p className="text-gray-600 mb-4">
                  {product.description}
                </p>

                <div className="space-y-2 mb-6">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Demo
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}