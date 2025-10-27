'use client';

import { useState, useEffect } from 'react';

/**
 * useReducedMotion Hook
 * 
 * Respects user's motion preferences for accessibility compliance.
 * Returns true if user prefers reduced motion (per system settings).
 * 
 * This ensures our animations are accessible to users with vestibular disorders
 * or those who simply prefer reduced motion for better focus.
 * 
 * @returns boolean - true if user prefers reduced motion
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const shouldReduceMotion = useReducedMotion();
 *   
 *   return (
 *     <MotionDiv
 *       animate={shouldReduceMotion ? {} : { x: 100, opacity: 1 }}
 *       transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5 }}
 *     >
 *       Content
 *     </MotionDiv>
 *   );
 * };
 * ```
 */
export function useReducedMotion(): boolean {
  // Server-side rendering safe default
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return;
    }

    // Create media query for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setShouldReduceMotion(mediaQuery.matches);

    // Create event handler for preference changes
    const handleChange = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches);
    };

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup listener
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return shouldReduceMotion;
}

/**
 * useMotionConfig Hook
 * 
 * Returns animation configuration based on user's motion preference.
 * Provides a more comprehensive approach to handling reduced motion.
 * 
 * @returns Object with motion configuration
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { shouldAnimate, duration, ease } = useMotionConfig();
 *   
 *   return (
 *     <MotionDiv
 *       animate={shouldAnimate ? { x: 100 } : {}}
 *       transition={{ duration, ease }}
 *     >
 *       Content
 *     </MotionDiv>
 *   );
 * };
 * ```
 */
export function useMotionConfig() {
  const shouldReduceMotion = useReducedMotion();

  return {
    // Core animation control
    shouldAnimate: !shouldReduceMotion,
    shouldReduceMotion,
    
    // Timing adjustments
    duration: shouldReduceMotion ? 0 : 0.6,
    fastDuration: shouldReduceMotion ? 0 : 0.3,
    slowDuration: shouldReduceMotion ? 0 : 0.9,
    
    // Easing - simplified for reduced motion
    ease: shouldReduceMotion ? 'linear' : [0.4, 0, 0.2, 1],
    
    // Transform adjustments
    scale: shouldReduceMotion ? 1 : 1.02,
    translateY: shouldReduceMotion ? 0 : 20,
    translateX: shouldReduceMotion ? 0 : 20,
    
    // Opacity (still allowed in reduced motion for fade effects)
    opacity: shouldReduceMotion ? 1 : 0,
  } as const;
}

/**
 * createAccessibleVariants
 * 
 * Utility function to create motion variants that respect reduced motion preferences.
 * Automatically adjusts animations based on user preference.
 * 
 * @param variants - Standard animation variants
 * @param shouldReduceMotion - Whether to reduce motion
 * @returns Adjusted variants object
 * 
 * @example
 * ```tsx
 * const variants = createAccessibleVariants({
 *   initial: { opacity: 0, y: 20 },
 *   animate: { opacity: 1, y: 0 },
 * }, shouldReduceMotion);
 * ```
 */
export function createAccessibleVariants(
  variants: Record<string, any>,
  shouldReduceMotion: boolean
): Record<string, any> {
  if (!shouldReduceMotion) {
    return variants;
  }

  // For reduced motion, remove transforms but keep opacity changes
  const accessibleVariants: Record<string, any> = {};
  
  Object.entries(variants).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      accessibleVariants[key] = {
        // Keep opacity changes (they're less disruptive)
        ...(value.opacity !== undefined && { opacity: value.opacity }),
        
        // Remove transforms
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        
        // Set instant transitions
        transition: { duration: 0 },
      };
    } else {
      accessibleVariants[key] = value;
    }
  });

  return accessibleVariants;
}

/**
 * useWithReducedMotion
 *
 * Hook that wraps animation properties with reduced motion support.
 * Provides a clean way to make any animation accessible.
 *
 * @param animationProps - Standard animation props
 * @param fallbackProps - Props to use when motion is reduced (optional)
 * @returns Animation props with reduced motion support
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const motionProps = useWithReducedMotion({
 *     initial: { opacity: 0, scale: 0.9 },
 *     animate: { opacity: 1, scale: 1 },
 *     transition: { duration: 0.5 }
 *   });
 *
 *   return <MotionDiv {...motionProps}>Content</MotionDiv>;
 * };
 * ```
 */
export function useWithReducedMotion(
  animationProps: Record<string, any>,
  fallbackProps?: Record<string, any>
) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return fallbackProps || {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0 },
    };
  }
  
  return animationProps;
}

/**
 * Accessibility constants for consistent reduced motion handling
 */
export const REDUCED_MOTION_CONFIG = {
  // Safe animations that work well with reduced motion
  SAFE_PROPERTIES: ['opacity', 'color', 'backgroundColor', 'borderColor'],
  
  // Properties to avoid or minimize in reduced motion
  AVOID_PROPERTIES: ['x', 'y', 'scale', 'rotate', 'skew'],
  
  // Recommended durations
  DURATIONS: {
    instant: 0,
    fast: 0.15,
    normal: 0.3,
  },
} as const;