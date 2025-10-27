import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
  clearDelay?: number;
}

/**
 * Live Region Component for dynamic content announcements
 * Announces changes to screen readers automatically
 */
export function LiveRegion({
  message,
  priority = 'polite',
  atomic = true,
  relevant = 'all',
  className,
  clearDelay = 1000
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && regionRef.current) {
      regionRef.current.textContent = message;

      // Clear the message after delay to allow re-announcement
      if (clearDelay > 0) {
        const timer = setTimeout(() => {
          if (regionRef.current) {
            regionRef.current.textContent = '';
          }
        }, clearDelay);

        return () => clearTimeout(timer);
      }
    }
  }, [message, clearDelay]);

  return (
    <div
      ref={regionRef}
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={cn('sr-only', className)}
    />
  );
}

/**
 * Status Message Component
 * For non-urgent status updates
 */
export interface StatusMessageProps {
  message: string;
  className?: string;
}

export function StatusMessage({ message, className }: StatusMessageProps) {
  return (
    <LiveRegion
      message={message}
      priority="polite"
      className={className}
    />
  );
}

/**
 * Alert Message Component
 * For urgent alerts that need immediate attention
 */
export interface AlertMessageProps {
  message: string;
  className?: string;
}

export function AlertMessage({ message, className }: AlertMessageProps) {
  return (
    <LiveRegion
      message={message}
      priority="assertive"
      className={className}
    />
  );
}