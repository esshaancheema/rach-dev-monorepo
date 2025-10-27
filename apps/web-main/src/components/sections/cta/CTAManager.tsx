'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// CTA Types and Configurations
export type CTAVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
export type CTASize = 'sm' | 'md' | 'lg' | 'xl';
export type CTAIntent = 'sales' | 'demo' | 'consultation' | 'support' | 'signup' | 'contact' | 'custom';

interface BaseCTAProps {
  variant?: CTAVariant;
  size?: CTASize;
  intent?: CTAIntent;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  analytics?: {
    event: string;
    category: string;
    label?: string;
  };
}

interface LinkCTAProps extends BaseCTAProps {
  href: string;
  external?: boolean;
  newTab?: boolean;
}

interface ButtonCTAProps extends BaseCTAProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export type CTAProps = LinkCTAProps | ButtonCTAProps;

// Predefined CTA configurations based on intent
const ctaIntentConfigs: Record<CTAIntent, {
  href?: string;
  text: string;
  variant: CTAVariant;
  icon?: string;
  analytics: { event: string; category: string; label: string };
}> = {
  sales: {
    href: '/contact?type=sales',
    text: 'Talk to Sales',
    variant: 'primary',
    analytics: { event: 'cta_click', category: 'sales', label: 'talk_to_sales' }
  },
  demo: {
    href: '/demos',
    text: 'View Demo',
    variant: 'outline',
    analytics: { event: 'cta_click', category: 'engagement', label: 'view_demo' }
  },
  consultation: {
    href: '/contact?type=consultation',
    text: 'Free Consultation',
    variant: 'gradient',
    analytics: { event: 'cta_click', category: 'lead_generation', label: 'free_consultation' }
  },
  support: {
    href: '/help',
    text: 'Get Support',
    variant: 'secondary',
    analytics: { event: 'cta_click', category: 'support', label: 'get_support' }
  },
  signup: {
    href: '/register',
    text: 'Sign Up Free',
    variant: 'primary',
    analytics: { event: 'cta_click', category: 'conversion', label: 'sign_up_free' }
  },
  contact: {
    href: '/contact',
    text: 'Contact Us',
    variant: 'outline',
    analytics: { event: 'cta_click', category: 'engagement', label: 'contact_us' }
  },
  custom: {
    text: 'Get Started',
    variant: 'primary',
    analytics: { event: 'cta_click', category: 'engagement', label: 'custom_cta' }
  }
};

// Styling configurations
const variantStyles: Record<CTAVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600 hover:border-blue-700 shadow-sm hover:shadow-md',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-gray-300 hover:border-gray-400',
  outline: 'bg-transparent text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700',
  ghost: 'bg-transparent text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900',
  gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 border-0 shadow-md hover:shadow-lg',
};

const sizeStyles: Record<CTASize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

function isLinkCTA(props: CTAProps): props is LinkCTAProps {
  return 'href' in props;
}

// Main CTA Component
export function CTA(props: CTAProps) {
  const {
    variant = 'primary',
    size = 'md',
    intent,
    className,
    children,
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    analytics,
  } = props;

  // Use intent configuration if provided and no custom children
  const config = intent && !children ? ctaIntentConfigs[intent] : null;
  const finalVariant = config?.variant || variant;
  const finalAnalytics = analytics || config?.analytics;

  const handleAnalytics = () => {
    if (finalAnalytics && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', finalAnalytics.event, {
        event_category: finalAnalytics.category,
        event_label: finalAnalytics.label,
      });
    }
  };

  const baseStyles = cn(
    'inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    variantStyles[finalVariant],
    sizeStyles[size],
    fullWidth && 'w-full',
    disabled && 'opacity-50 cursor-not-allowed',
    loading && 'cursor-wait',
    className
  );

  const content = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children || config?.text}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </>
  );

  if (isLinkCTA(props)) {
    const { href, external = false, newTab = false } = props;
    const finalHref = config?.href || href;

    if (external || newTab) {
      return (
        <a
          href={finalHref}
          target={newTab ? '_blank' : undefined}
          rel={external || newTab ? 'noopener noreferrer' : undefined}
          className={baseStyles}
          onClick={handleAnalytics}
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={finalHref} className={baseStyles} onClick={handleAnalytics}>
        {content}
      </Link>
    );
  } else {
    const { onClick, type = 'button' } = props;

    return (
      <button
        type={type}
        disabled={disabled || loading}
        onClick={() => {
          handleAnalytics();
          onClick?.();
        }}
        className={baseStyles}
      >
        {content}
      </button>
    );
  }
}

// Pre-configured CTA components for common use cases
export function PrimaryCTA(props: Omit<CTAProps, 'variant'>) {
  return <CTA {...props} variant="primary" />;
}

export function SecondaryCTA(props: Omit<CTAProps, 'variant'>) {
  return <CTA {...props} variant="secondary" />;
}

export function OutlineCTA(props: Omit<CTAProps, 'variant'>) {
  return <CTA {...props} variant="outline" />;
}

export function GradientCTA(props: Omit<CTAProps, 'variant'>) {
  return <CTA {...props} variant="gradient" />;
}

// Intent-based CTAs
export function SalesCTA(props: Omit<LinkCTAProps, 'intent' | 'href'> & { href?: string }) {
  const config = ctaIntentConfigs.sales;
  return <CTA {...props} intent="sales" href={props.href || config.href!} />;
}

export function DemoCTA(props: Omit<LinkCTAProps, 'intent' | 'href'> & { href?: string }) {
  const config = ctaIntentConfigs.demo;
  return <CTA {...props} intent="demo" href={props.href || config.href!} />;
}

export function ConsultationCTA(props: Omit<LinkCTAProps, 'intent' | 'href'> & { href?: string }) {
  const config = ctaIntentConfigs.consultation;
  return <CTA {...props} intent="consultation" href={props.href || config.href!} />;
}

export function SignupCTA(props: Omit<LinkCTAProps, 'intent' | 'href'> & { href?: string }) {
  const config = ctaIntentConfigs.signup;
  return <CTA {...props} intent="signup" href={props.href || config.href!} />;
}

export function ContactCTA(props: Omit<LinkCTAProps, 'intent' | 'href'> & { href?: string }) {
  const config = ctaIntentConfigs.contact;
  return <CTA {...props} intent="contact" href={props.href || config.href!} />;
}

// CTA Group component for displaying multiple CTAs together
interface CTAGroupProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'wide';
  alignment?: 'left' | 'center' | 'right';
  className?: string;
}

export function CTAGroup({
  children,
  orientation = 'horizontal',
  spacing = 'normal',
  alignment = 'left',
  className,
}: CTAGroupProps) {
  const spacingStyles = {
    tight: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
    normal: orientation === 'horizontal' ? 'gap-4' : 'gap-3',
    wide: orientation === 'horizontal' ? 'gap-6' : 'gap-4',
  };

  const alignmentStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
        spacingStyles[spacing],
        alignmentStyles[alignment],
        className
      )}
    >
      {children}
    </div>
  );
}