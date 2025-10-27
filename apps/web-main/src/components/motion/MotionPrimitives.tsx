'use client';

import React from 'react';
import { motion, type MotionProps } from 'framer-motion';

// Base motion components with performance optimizations
// These components are optimized for GPU acceleration and reduced reflows

/**
 * MotionDiv - Optimized motion.div with performance defaults
 */
export const MotionDiv = React.forwardRef<HTMLDivElement, MotionProps>(
  (props, ref) => (
    <motion.div
      ref={ref}
      style={{
        // Performance optimizations
        willChange: 'transform',
        transform: 'translateZ(0)', // Force GPU layer
        ...props.style,
      }}
      {...props}
    />
  )
);

MotionDiv.displayName = 'MotionDiv';

/**
 * MotionSection - Semantic section with motion capabilities
 */
export const MotionSection = React.forwardRef<HTMLElement, MotionProps>(
  (props, ref) => (
    <motion.section
      ref={ref}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        ...props.style,
      }}
      {...props}
    />
  )
);

MotionSection.displayName = 'MotionSection';

/**
 * MotionArticle - Semantic article with motion capabilities
 */
export const MotionArticle = React.forwardRef<HTMLElement, MotionProps>(
  (props, ref) => (
    <motion.article
      ref={ref}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        ...props.style,
      }}
      {...props}
    />
  )
);

MotionArticle.displayName = 'MotionArticle';

/**
 * MotionHeader - Header element with motion capabilities
 */
export const MotionHeader = React.forwardRef<HTMLElement, MotionProps>(
  (props, ref) => (
    <motion.header
      ref={ref}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        ...props.style,
      }}
      {...props}
    />
  )
);

MotionHeader.displayName = 'MotionHeader';

/**
 * MotionNav - Navigation element with motion capabilities
 */
export const MotionNav = React.forwardRef<HTMLElement, MotionProps>(
  (props, ref) => (
    <motion.nav
      ref={ref}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        ...props.style,
      }}
      {...props}
    />
  )
);

MotionNav.displayName = 'MotionNav';

/**
 * MotionUL - List element with motion capabilities
 */
export const MotionUL = React.forwardRef<HTMLUListElement, MotionProps>(
  (props, ref) => (
    <motion.ul
      ref={ref}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        ...props.style,
      }}
      {...props}
    />
  )
);

MotionUL.displayName = 'MotionUL';

/**
 * MotionLI - List item element with motion capabilities
 */
export const MotionLI = React.forwardRef<HTMLLIElement, MotionProps>(
  (props, ref) => (
    <motion.li
      ref={ref}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        ...props.style,
      }}
      {...props}
    />
  )
);

MotionLI.displayName = 'MotionLI';

/**
 * MotionButton - Button element with motion capabilities
 */
export const MotionButton = React.forwardRef<HTMLButtonElement, MotionProps>(
  (props, ref) => (
    <motion.button
      ref={ref}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        ...props.style,
      }}
      {...props}
    />
  )
);

MotionButton.displayName = 'MotionButton';

/**
 * MotionSpan - Inline element with motion capabilities
 */
export const MotionSpan = React.forwardRef<HTMLSpanElement, MotionProps>(
  (props, ref) => (
    <motion.span
      ref={ref}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        ...props.style,
      }}
      {...props}
    />
  )
);

MotionSpan.displayName = 'MotionSpan';

// Re-export motion for components that need direct access
export { motion } from 'framer-motion';