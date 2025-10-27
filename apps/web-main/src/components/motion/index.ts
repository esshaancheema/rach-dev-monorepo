// Motion Component Library - Centralized Exports
// Enterprise-grade animation components for Zoptal platform

export * from './MotionPrimitives';
export * from './AnimationVariants';
export * from './AnimationErrorBoundary';
export * from './hooks/useAnimationMetrics';
export * from './hooks/useReducedMotion';
export * from './hooks/useIntersectionAnimation';

// Re-export framer-motion types for convenience
export type { 
  MotionProps, 
  Variants, 
  Transition,
  AnimationControls,
  TargetAndTransition 
} from 'framer-motion';