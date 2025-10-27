'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useAnimation, type AnimationControls } from 'framer-motion';
import { useReducedMotion } from './useReducedMotion';

/**
 * Intersection Observer Options for Animation
 */
export interface IntersectionAnimationOptions {
  /** Trigger animation when element is this much in view (0-1) */
  threshold?: number;
  /** Root margin for the intersection observer */
  rootMargin?: string;
  /** Only trigger animation once */
  once?: boolean;
  /** Delay before starting animation (in ms) */
  delay?: number;
  /** Disable animation (useful for debugging) */
  disabled?: boolean;
}

/**
 * useIntersectionAnimation Hook
 * 
 * Triggers animations when an element enters the viewport.
 * Automatically respects reduced motion preferences and provides
 * performance optimizations for scroll-based animations.
 * 
 * @param options - Configuration options
 * @returns Object with ref, inView state, and animation controls
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { ref, inView, controls } = useIntersectionAnimation({
 *     threshold: 0.3,
 *     once: true
 *   });
 * 
 *   return (
 *     <MotionDiv
 *       ref={ref}
 *       animate={controls}
 *       initial={{ opacity: 0, y: 50 }}
 *       variants={{
 *         visible: { opacity: 1, y: 0 },
 *         hidden: { opacity: 0, y: 50 }
 *       }}
 *     >
 *       Content appears when scrolled into view
 *     </MotionDiv>
 *   );
 * };
 * ```
 */
export function useIntersectionAnimation(
  options: IntersectionAnimationOptions = {}
) {
  const {
    threshold = 0.3,
    rootMargin = '-50px',
    once = true,
    delay = 0,
    disabled = false,
  } = options;

  const ref = useRef<Element>(null);
  const [inView, setInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();

  // Memoize observer options to prevent unnecessary re-creation
  const observerOptions = useMemo(
    () => ({
      threshold,
      rootMargin,
    }),
    [threshold, rootMargin]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return;

    // Handle reduced motion - immediate visibility without animation
    if (shouldReduceMotion) {
      setInView(true);
      controls.start('visible');
      return;
    }

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;
          
          if (isIntersecting && (!once || !hasTriggered)) {
            // Element is in view - trigger animation after delay
            if (delay > 0) {
              setTimeout(() => {
                setInView(true);
                controls.start('visible');
                setHasTriggered(true);
              }, delay);
            } else {
              setInView(true);
              controls.start('visible');
              setHasTriggered(true);
            }
          } else if (!isIntersecting && !once) {
            // Element is out of view and we allow repeated animations
            setInView(false);
            controls.start('hidden');
          }
        });
      },
      observerOptions
    );

    observer.observe(element);

    // Cleanup observer
    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [
    controls,
    delay,
    disabled,
    hasTriggered,
    observerOptions,
    once,
    shouldReduceMotion,
  ]);

  return {
    ref,
    inView,
    controls,
    hasTriggered,
  };
}

/**
 * useScrollReveal Hook
 * 
 * A simplified hook specifically for scroll-reveal animations.
 * Provides common animation patterns out of the box.
 * 
 * @param animationType - Type of reveal animation
 * @param options - Configuration options
 * @returns Motion props ready to spread on a component
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const motionProps = useScrollReveal('fadeUp', { delay: 200 });
 *   
 *   return (
 *     <MotionDiv {...motionProps}>
 *       Content reveals on scroll
 *     </MotionDiv>
 *   );
 * };
 * ```
 */
export function useScrollReveal(
  animationType: 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'scale' | 'fade' = 'fadeUp',
  options: IntersectionAnimationOptions = {}
) {
  const { ref, controls } = useIntersectionAnimation(options);
  const shouldReduceMotion = useReducedMotion();

  // Define animation variants based on type
  const variants = useMemo(() => {
    // For reduced motion, only use opacity changes
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { duration: 0.3 }
        },
      };
    }

    // Full animations for users who prefer motion
    const animationMap = {
      fadeUp: {
        hidden: { opacity: 0, y: 30 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }
        },
      },
      fadeDown: {
        hidden: { opacity: 0, y: -30 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }
        },
      },
      fadeLeft: {
        hidden: { opacity: 0, x: -30 },
        visible: { 
          opacity: 1, 
          x: 0,
          transition: { 
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }
        },
      },
      fadeRight: {
        hidden: { opacity: 0, x: 30 },
        visible: { 
          opacity: 1, 
          x: 0,
          transition: { 
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }
        },
      },
      scale: {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
          opacity: 1, 
          scale: 1,
          transition: { 
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }
        },
      },
      fade: {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { 
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }
        },
      },
    };

    return animationMap[animationType];
  }, [animationType, shouldReduceMotion]);

  return {
    ref,
    initial: 'hidden',
    animate: controls,
    variants,
    viewport: { once: options.once ?? true, margin: options.rootMargin ?? '-50px' },
  };
}

/**
 * useStaggeredScrollReveal Hook
 * 
 * Creates staggered animations for lists of items that reveal on scroll.
 * Perfect for product grids, feature lists, etc.
 * 
 * @param itemCount - Number of items to animate
 * @param staggerDelay - Delay between each item animation (in seconds)
 * @param options - Configuration options
 * @returns Object with container and item animation props
 * 
 * @example
 * ```tsx
 * const ProductGrid = ({ products }) => {
 *   const { containerProps, getItemProps } = useStaggeredScrollReveal(
 *     products.length, 
 *     0.1
 *   );
 *   
 *   return (
 *     <MotionDiv {...containerProps}>
 *       {products.map((product, index) => (
 *         <MotionDiv key={product.id} {...getItemProps(index)}>
 *           {product.name}
 *         </MotionDiv>
 *       ))}
 *     </MotionDiv>
 *   );
 * };
 * ```
 */
export function useStaggeredScrollReveal(
  itemCount: number,
  staggerDelay: number = 0.1,
  options: IntersectionAnimationOptions = {}
) {
  const { ref, controls } = useIntersectionAnimation(options);
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0,
            delayChildren: 0,
          },
        },
      };
    }

    return {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: 0.2,
        },
      },
    };
  }, [staggerDelay, shouldReduceMotion]);

  const itemVariants = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { duration: 0.3 }
        },
      };
    }

    return {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1]
        }
      },
    };
  }, [shouldReduceMotion]);

  const getItemProps = (index: number) => ({
    variants: itemVariants,
    initial: 'hidden',
    // Add slight delay variation for more natural feel
    custom: index,
  });

  const containerProps = {
    ref,
    variants: containerVariants,
    initial: 'hidden',
    animate: controls,
    viewport: { once: options.once ?? true, margin: options.rootMargin ?? '-50px' },
  };

  return {
    containerProps,
    getItemProps,
    itemVariants,
  };
}

/**
 * Performance monitoring for intersection animations
 * Tracks animation performance and provides insights
 */
export function useAnimationPerformance(name: string) {
  const performanceRef = useRef<{
    startTime: number;
    endTime: number;
  }>({
    startTime: 0,
    endTime: 0,
  });

  const startTracking = () => {
    performanceRef.current.startTime = performance.now();
  };

  const endTracking = () => {
    performanceRef.current.endTime = performance.now();
    const duration = performanceRef.current.endTime - performanceRef.current.startTime;
    
    // Log performance data (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Animation "${name}" completed in ${duration.toFixed(2)}ms`);
    }
    
    // Send to analytics in production
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'animation_performance', {
        animation_name: name,
        duration_ms: Math.round(duration),
        timestamp: Date.now(),
      });
    }
  };

  return {
    startTracking,
    endTracking,
    getDuration: () => 
      performanceRef.current.endTime - performanceRef.current.startTime,
  };
}