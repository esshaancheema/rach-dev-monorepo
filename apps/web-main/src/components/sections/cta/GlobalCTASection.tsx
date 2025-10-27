'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CTAGroup, ConsultationCTA, SignupCTA, DemoCTA, SalesCTA } from './CTAManager';

interface GlobalCTASectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  variant?: 'default' | 'gradient' | 'dark' | 'minimal';
  layout?: 'center' | 'split' | 'inline';
  ctaTypes?: Array<'consultation' | 'signup' | 'demo' | 'sales' | 'contact'>;
  customCTAs?: ReactNode;
  showBackground?: boolean;
  className?: string;
  containerClassName?: string;
}

const variantStyles = {
  default: {
    background: 'bg-white',
    title: 'text-gray-900',
    subtitle: 'text-blue-600',
    description: 'text-gray-600',
  },
  gradient: {
    background: 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700',
    title: 'text-white',
    subtitle: 'text-blue-100',
    description: 'text-blue-50',
  },
  dark: {
    background: 'bg-gray-900',
    title: 'text-white',
    subtitle: 'text-blue-400',
    description: 'text-gray-300',
  },
  minimal: {
    background: 'bg-gray-50',
    title: 'text-gray-900',
    subtitle: 'text-blue-600',
    description: 'text-gray-600',
  },
};

export default function GlobalCTASection({
  title = 'Ready to Transform Your Business?',
  subtitle = 'Get Started Today',
  description = 'Join thousands of companies that trust Zoptal to deliver exceptional software solutions.',
  variant = 'gradient',
  layout = 'center',
  ctaTypes = ['consultation', 'demo'],
  customCTAs,
  showBackground = true,
  className,
  containerClassName,
}: GlobalCTASectionProps) {
  const styles = variantStyles[variant];

  const renderCTAs = () => {
    if (customCTAs) return customCTAs;

    const ctaComponents = ctaTypes.map((type, index) => {
      const props = {
        key: type,
        size: 'lg' as const,
        className: variant === 'gradient' || variant === 'dark' 
          ? 'text-white border-white hover:bg-white hover:text-gray-900' 
          : undefined,
      };

      switch (type) {
        case 'consultation':
          return <ConsultationCTA {...props} />;
        case 'signup':
          return <SignupCTA {...props} />;
        case 'demo':
          return <DemoCTA {...props} />;
        case 'sales':
          return <SalesCTA {...props} />;
        default:
          return null;
      }
    });

    return (
      <CTAGroup 
        orientation="horizontal"
        spacing="normal"
        alignment="center"
        className="flex-wrap"
      >
        {ctaComponents}
      </CTAGroup>
    );
  };

  if (layout === 'split') {
    return (
      <section className={cn(showBackground && styles.background, className)}>
        <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24', containerClassName)}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              {subtitle && (
                <p className={cn('text-sm font-semibold uppercase tracking-wide mb-3', styles.subtitle)}>
                  {subtitle}
                </p>
              )}
              <h2 className={cn('text-3xl md:text-4xl lg:text-5xl font-bold mb-6', styles.title)}>
                {title}
              </h2>
              {description && (
                <p className={cn('text-lg mb-8', styles.description)}>
                  {description}
                </p>
              )}
            </div>
            <div className="flex justify-center lg:justify-end">
              {renderCTAs()}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'inline') {
    return (
      <section className={cn(showBackground && styles.background, className)}>
        <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12', containerClassName)}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              {subtitle && (
                <p className={cn('text-sm font-semibold uppercase tracking-wide mb-2', styles.subtitle)}>
                  {subtitle}
                </p>
              )}
              <h2 className={cn('text-2xl md:text-3xl font-bold mb-2', styles.title)}>
                {title}
              </h2>
              {description && (
                <p className={cn('text-base', styles.description)}>
                  {description}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              {renderCTAs()}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default center layout
  return (
    <section className={cn(showBackground && styles.background, className)}>
      <div className={cn('max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center', containerClassName)}>
        {subtitle && (
          <p className={cn('text-sm font-semibold uppercase tracking-wide mb-4', styles.subtitle)}>
            {subtitle}
          </p>
        )}
        <h2 className={cn('text-3xl md:text-4xl lg:text-5xl font-bold mb-6', styles.title)}>
          {title}
        </h2>
        {description && (
          <p className={cn('text-lg md:text-xl mb-10 max-w-3xl mx-auto', styles.description)}>
            {description}
          </p>
        )}
        {renderCTAs()}
      </div>
      
      {/* Background Decorations for Gradient Variant */}
      {variant === 'gradient' && showBackground && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse" />
        </div>
      )}
    </section>
  );
}