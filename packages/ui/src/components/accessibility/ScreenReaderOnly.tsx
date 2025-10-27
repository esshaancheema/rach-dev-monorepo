import React from 'react';
import { cn } from '../../lib/utils';

export interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Screen Reader Only Component
 * Hides content visually but keeps it available for screen readers
 */
export function ScreenReaderOnly({ 
  children, 
  className,
  as: Component = 'span'
}: ScreenReaderOnlyProps) {
  return (
    <Component
      className={cn('sr-only', className)}
    >
      {children}
    </Component>
  );
}

/**
 * Visually Hidden but focusable
 * Content is hidden until focused (useful for skip links)
 */
export function VisuallyHiddenFocusable({ 
  children, 
  className,
  as: Component = 'span'
}: ScreenReaderOnlyProps) {
  return (
    <Component
      className={cn('sr-only focus:not-sr-only', className)}
    >
      {children}
    </Component>
  );
}