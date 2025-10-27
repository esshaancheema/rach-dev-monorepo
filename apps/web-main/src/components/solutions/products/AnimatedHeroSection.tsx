'use client';

import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { MotionDiv } from '@/components/motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/components/motion/AnimationVariants';
import { AnimationErrorBoundary } from '@/components/motion/AnimationErrorBoundary';
import { useAnimationMetrics } from '@/components/motion/hooks/useAnimationMetrics';

interface HeroSectionProps {
  stats: Array<{
    label: string;
    value: string;
  }>;
}

export function AnimatedHeroSection({ stats }: HeroSectionProps) {
  const { startTracking, endTracking } = useAnimationMetrics('products_hero_section');

  return (
    <AnimationErrorBoundary
      animationName="products_hero_section"
      fallback={<StaticHeroSection stats={stats} />}
      enableRetry={true}
      maxRetries={2}
    >
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <MotionDiv
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
              onAnimationStart={startTracking}
              onAnimationComplete={endTracking}
            >
              <RocketLaunchIcon className="w-4 h-4" />
              <span>Ready-Built Solutions</span>
            </MotionDiv>

            <MotionDiv
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              AI-Powered Development
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Products & Solutions
              </span>
            </MotionDiv>

            <MotionDiv
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Accelerate your development with our comprehensive suite of pre-built, 
              AI-enhanced products. Deploy enterprise-grade solutions in days, not months.
            </MotionDiv>

            {/* Animated Stats */}
            <MotionDiv
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
            >
              {stats.map((stat, index) => (
                <MotionDiv
                  key={index}
                  variants={staggerItem}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {stat.label}
                  </div>
                </MotionDiv>
              ))}
            </MotionDiv>
          </div>
        </div>
      </section>
    </AnimationErrorBoundary>
  );
}

// Static fallback for error boundary
function StaticHeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <RocketLaunchIcon className="w-4 h-4" />
            <span>Ready-Built Solutions</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Development
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Products & Solutions
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Accelerate your development with our comprehensive suite of pre-built, 
            AI-enhanced products. Deploy enterprise-grade solutions in days, not months.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}