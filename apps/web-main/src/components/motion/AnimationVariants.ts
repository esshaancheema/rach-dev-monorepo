import { type Variants, type Transition } from 'framer-motion';

/**
 * Enterprise Animation Variants Configuration
 * Standardized animation patterns for consistent user experience
 * Optimized for performance and accessibility
 */

// ===== TIMING CONSTANTS =====
export const ANIMATION_DURATION = {
  fast: 0.3,
  normal: 0.6,
  slow: 0.9,
  extra_slow: 1.2,
} as const;

export const EASING = {
  ease_out: [0.4, 0, 0.2, 1],
  ease_in: [0.4, 0, 1, 1],
  ease_in_out: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;

// ===== BASE TRANSITIONS =====
export const baseTransition: Transition = {
  duration: ANIMATION_DURATION.normal,
  ease: EASING.ease_out,
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

export const bounceTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 10,
};

// ===== FADE ANIMATIONS =====
export const fadeIn: Variants = {
  initial: { 
    opacity: 0 
  },
  animate: { 
    opacity: 1,
    transition: baseTransition,
  },
  exit: { 
    opacity: 0,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

export const fadeInUp: Variants = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: baseTransition,
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

export const fadeInDown: Variants = {
  initial: { 
    opacity: 0, 
    y: -20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: baseTransition,
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

export const fadeInLeft: Variants = {
  initial: { 
    opacity: 0, 
    x: -20 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: baseTransition,
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

export const fadeInRight: Variants = {
  initial: { 
    opacity: 0, 
    x: 20 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: baseTransition,
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

// ===== SCALE ANIMATIONS =====
export const scaleIn: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.95 
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: springTransition,
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

export const scaleInCenter: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.8,
    transformOrigin: 'center',
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: bounceTransition,
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

// ===== SLIDE ANIMATIONS =====
export const slideInUp: Variants = {
  initial: { 
    y: 30,
    opacity: 0 
  },
  animate: { 
    y: 0,
    opacity: 1,
    transition: baseTransition,
  },
  exit: { 
    y: -30,
    opacity: 0,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

export const slideInDown: Variants = {
  initial: { 
    y: -30,
    opacity: 0 
  },
  animate: { 
    y: 0,
    opacity: 1,
    transition: baseTransition,
  },
  exit: { 
    y: 30,
    opacity: 0,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

export const slideInLeft: Variants = {
  initial: { 
    x: -30,
    opacity: 0 
  },
  animate: { 
    x: 0,
    opacity: 1,
    transition: baseTransition,
  },
  exit: { 
    x: 30,
    opacity: 0,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

export const slideInRight: Variants = {
  initial: { 
    x: 30,
    opacity: 0 
  },
  animate: { 
    x: 0,
    opacity: 1,
    transition: baseTransition,
  },
  exit: { 
    x: -30,
    opacity: 0,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

// ===== STAGGER ANIMATIONS =====
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: baseTransition,
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

// ===== SPECIALIZED ANIMATIONS =====
export const cardHover: Variants = {
  initial: { 
    scale: 1,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  hover: { 
    scale: 1.02,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
  tap: { 
    scale: 0.98,
    transition: { ...baseTransition, duration: 0.1 },
  },
};

export const buttonHover: Variants = {
  initial: { 
    scale: 1 
  },
  hover: { 
    scale: 1.05,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
  tap: { 
    scale: 0.95,
    transition: { ...baseTransition, duration: 0.1 },
  },
};

export const iconBounce: Variants = {
  initial: { 
    scale: 1 
  },
  animate: { 
    scale: [1, 1.2, 1],
    transition: { 
      duration: 0.6,
      ease: EASING.bounce,
      times: [0, 0.5, 1],
    },
  },
};

// ===== SCROLL-TRIGGERED ANIMATIONS =====
export const scrollReveal: Variants = {
  initial: { 
    opacity: 0, 
    y: 50 
  },
  whileInView: { 
    opacity: 1, 
    y: 0,
    transition: baseTransition,
  },
  exit: { 
    opacity: 0, 
    y: -50,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

export const scrollRevealLeft: Variants = {
  initial: { 
    opacity: 0, 
    x: -50 
  },
  whileInView: { 
    opacity: 1, 
    x: 0,
    transition: baseTransition,
  },
  exit: { 
    opacity: 0, 
    x: 50,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

export const scrollRevealRight: Variants = {
  initial: { 
    opacity: 0, 
    x: 50 
  },
  whileInView: { 
    opacity: 1, 
    x: 0,
    transition: baseTransition,
  },
  exit: { 
    opacity: 0, 
    x: -50,
    transition: { ...baseTransition, duration: ANIMATION_DURATION.fast },
  },
};

// ===== VIEWPORT CONFIGURATION =====
export const viewportConfig = {
  once: true,
  margin: '-100px',
  amount: 0.3,
} as const;

export const viewportConfigSoft = {
  once: true,
  margin: '-50px',
  amount: 0.1,
} as const;

// ===== UTILITY FUNCTIONS =====
export function createDelayedVariant(baseVariant: Variants, delay: number): Variants {
  return {
    ...baseVariant,
    animate: {
      ...baseVariant.animate,
      transition: {
        ...baseTransition,
        delay,
      },
    },
  };
}

export function createCustomStagger(staggerDelay: number, childDelay: number = 0): Variants {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: childDelay,
      },
    },
    exit: {
      transition: {
        staggerChildren: staggerDelay / 2,
        staggerDirection: -1,
      },
    },
  };
}