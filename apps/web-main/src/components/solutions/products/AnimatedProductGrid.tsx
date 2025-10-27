'use client';

import Link from 'next/link';
import { 
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  CodeBracketIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import { MotionDiv } from '@/components/motion';
import { fadeInUp } from '@/components/motion/AnimationVariants';
import { useStaggeredScrollReveal } from '@/components/motion/hooks/useIntersectionAnimation';
import { AnimationErrorBoundary } from '@/components/motion/AnimationErrorBoundary';
import { useAnimationMetrics } from '@/components/motion/hooks/useAnimationMetrics';

const iconMap = {
  'web-applications': GlobeAltIcon,
  'mobile-apps': DevicePhoneMobileIcon,
  'api-solutions': CodeBracketIcon,
  'ai-tools': CpuChipIcon,
  'enterprise-solutions': ShieldCheckIcon,
  'cloud-platforms': CloudIcon,
};

interface ProductCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  count: number;
  features: string[];
  examples: string[];
}

interface ProductGridProps {
  productCategories: ProductCategory[];
}

export function AnimatedProductGrid({ productCategories }: ProductGridProps) {
  const { containerProps, getItemProps } = useStaggeredScrollReveal(
    productCategories.length,
    0.1,
    { threshold: 0.2, once: true }
  );
  const { startTracking, endTracking } = useAnimationMetrics('product_category_grid');

  return (
    <AnimationErrorBoundary
      animationName="product_category_grid"
      fallback={<StaticProductGrid productCategories={productCategories} />}
      enableRetry={true}
      maxRetries={2}
    >
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Product Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From web applications to AI tools, discover pre-built solutions 
              tailored to your industry and use case.
            </p>
          </div>

          <MotionDiv
            {...containerProps}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            onAnimationStart={startTracking}
            onAnimationComplete={endTracking}
          >
            {productCategories.map((category, index) => {
              const IconComponent = iconMap[category.iconName as keyof typeof iconMap];
              return (
                <MotionDiv
                  key={category.id}
                  {...getItemProps(index)}
                  className="group"
                >
                  <Link href={`/solutions/products/${category.id}`}>
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-300 group-hover:border-primary-200 h-full">
                      <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
                      </div>

                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                        {category.title}
                      </h3>
                      <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                        {category.count} products
                      </span>
                    </div>

                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {category.description}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features:</h4>
                        <div className="flex flex-wrap gap-2">
                          {category.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Examples:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {category.examples.slice(0, 2).map((example, idx) => (
                            <li key={idx} className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Link>
              </MotionDiv>
              );
            })}
          </MotionDiv>
        </div>
      </section>
    </AnimationErrorBoundary>
  );
}

// Static fallback for error boundary
function StaticProductGrid({ productCategories }: ProductGridProps) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Product Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From web applications to AI tools, discover pre-built solutions 
            tailored to your industry and use case.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productCategories.map((category) => {
            const IconComponent = iconMap[category.iconName as keyof typeof iconMap];
            return (
              <div key={category.id} className="group">
                <Link href={`/solutions/products/${category.id}`}>
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-300 group-hover:border-primary-200 h-full">
                    <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
                    </div>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                      {category.title}
                    </h3>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                      {category.count} products
                    </span>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {category.description}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Examples:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {category.examples.slice(0, 2).map((example, idx) => (
                          <li key={idx} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}