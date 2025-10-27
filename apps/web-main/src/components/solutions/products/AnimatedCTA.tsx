'use client';

import Link from 'next/link';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { MotionDiv } from '@/components/motion';
import { useIntersectionAnimation } from '@/components/motion/hooks/useIntersectionAnimation';
import { fadeInUp } from '@/components/motion/AnimationVariants';
import { AnimationErrorBoundary } from '@/components/motion/AnimationErrorBoundary';
import { useAnimationMetrics } from '@/components/motion/hooks/useAnimationMetrics';

export function AnimatedCTA() {
  const { ref, controls } = useIntersectionAnimation({
    threshold: 0.3,
    once: true,
  });
  const { startTracking, endTracking } = useAnimationMetrics('products_cta_section');

  return (
    <AnimationErrorBoundary
      animationName="products_cta_section"
      fallback={<StaticCTA />}
      enableRetry={true}
      maxRetries={2}
    >
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MotionDiv
            ref={ref}
            initial="initial"
            animate={controls}
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
            onAnimationStart={startTracking}
            onAnimationComplete={endTracking}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Our AI development experts can create custom solutions tailored to your exact requirements. 
              Get a personalized consultation and quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                <span>Request Custom Solution</span>
                <WrenchScrewdriverIcon className="w-5 h-5" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center space-x-2 bg-primary-700 text-white px-8 py-4 rounded-lg hover:bg-primary-800 transition-all font-semibold border border-primary-500"
              >
                <span>View All Services</span>
              </Link>
            </div>
          </MotionDiv>
        </div>
      </section>
    </AnimationErrorBoundary>
  );
}

// Static fallback for error boundary
function StaticCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Our AI development experts can create custom solutions tailored to your exact requirements. 
            Get a personalized consultation and quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              <span>Request Custom Solution</span>
              <WrenchScrewdriverIcon className="w-5 h-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center space-x-2 bg-primary-700 text-white px-8 py-4 rounded-lg hover:bg-primary-800 transition-all font-semibold border border-primary-500"
            >
              <span>View All Services</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}