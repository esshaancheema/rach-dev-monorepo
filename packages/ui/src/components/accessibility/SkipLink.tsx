import React from 'react';
import { cn } from '../../lib/utils';

export interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Skip Link Component for keyboard navigation
 * Allows users to skip repetitive content and jump to main sections
 */
export function SkipLink({ href, children, className }: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target instanceof HTMLElement) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        // Base styles
        'sr-only focus:not-sr-only',
        'fixed top-4 left-4 z-50',
        'bg-primary text-primary-foreground',
        'px-4 py-2 rounded-md',
        'font-medium text-sm',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        // Ensure it's above everything when focused
        'focus:z-[100]',
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * Skip Links Container
 * Provides multiple skip links for better navigation
 */
export interface SkipLinksProps {
  links?: Array<{
    href: string;
    label: string;
  }>;
}

export function SkipLinks({ links }: SkipLinksProps) {
  const defaultLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#main-navigation', label: 'Skip to navigation' },
    { href: '#footer', label: 'Skip to footer' }
  ];

  const skipLinks = links || defaultLinks;

  return (
    <div className="skip-links">
      {skipLinks.map((link, index) => (
        <SkipLink key={index} href={link.href}>
          {link.label}
        </SkipLink>
      ))}
    </div>
  );
}