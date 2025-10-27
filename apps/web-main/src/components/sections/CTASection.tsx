'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface CTAAction {
  label: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  external?: boolean;
  icon?: React.ReactNode;
}

interface CTASectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions: CTAAction[];
  variant?: 'default' | 'gradient' | 'centered' | 'split' | 'card' | 'minimal';
  badge?: string;
  features?: string[];
  stats?: Array<{
    label: string;
    value: string;
  }>;
  testimonialQuote?: string;
  testimonialAuthor?: string;
  backgroundImage?: string;
  className?: string;
}

const DEFAULT_ACTIONS: CTAAction[] = [
  {
    label: 'Start Building Free',
    href: '/signup',
    variant: 'primary',
  },
  {
    label: 'Schedule Demo',
    href: '/demo',
    variant: 'outline',
  },
];

function CTACard({ 
  title, 
  subtitle, 
  description, 
  actions, 
  features, 
  className 
}: {
  title: string;
  subtitle?: string;
  description?: string;
  actions: CTAAction[];
  features?: string[];
  className?: string;
}) {
  return (
    <Card className={cn('p-8 text-center', className)}>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      {subtitle && (
        <p className="text-lg text-gray-600 mb-4">{subtitle}</p>
      )}
      {description && (
        <p className="text-gray-600 mb-6">{description}</p>
      )}
      
      {features && (
        <ul className="space-y-2 mb-6 text-left">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Button variant={action.variant} size="lg" className="w-full sm:w-auto">
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
              {action.external && (
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function CTASection({
  title,
  subtitle,
  description,
  actions = DEFAULT_ACTIONS,
  variant = 'default',
  badge,
  features,
  stats,
  testimonialQuote,
  testimonialAuthor,
  backgroundImage,
  className,
}: CTASectionProps) {
  
  if (variant === 'minimal') {
    return (
      <section className={cn('py-12 text-center', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            {subtitle && (
              <p className="text-gray-600 mb-6">{subtitle}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {actions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Button variant={action.variant} size="lg" className="w-full sm:w-auto">
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'card') {
    return (
      <section className={cn('py-16', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <CTACard
              title={title}
              subtitle={subtitle}
              description={description}
              actions={actions}
              features={features}
              className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200"
            />
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'split') {
    return (
      <section className={cn('py-20', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                {badge && (
                  <Badge variant="primary" className="mb-4">
                    {badge}
                  </Badge>
                )}
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
                {subtitle && (
                  <p className="text-xl text-gray-600 mb-6">{subtitle}</p>
                )}
                {description && (
                  <p className="text-gray-600 mb-8">{description}</p>
                )}
                
                {features && (
                  <ul className="space-y-3 mb-8">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {actions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Button variant={action.variant} size="lg" className="w-full sm:w-auto">
                        {action.icon && <span className="mr-2">{action.icon}</span>}
                        {action.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                {stats ? (
                  <div className="grid grid-cols-2 gap-6">
                    {stats.map((stat, index) => (
                      <Card key={index} className="p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {stat.value}
                        </div>
                        <div className="text-gray-600">{stat.label}</div>
                      </Card>
                    ))}
                  </div>
                ) : testimonialQuote ? (
                  <Card className="p-8">
                    <svg className="w-8 h-8 text-blue-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <blockquote className="text-lg text-gray-700 mb-4">
                      "{testimonialQuote}"
                    </blockquote>
                    {testimonialAuthor && (
                      <cite className="text-sm text-gray-600">
                        — {testimonialAuthor}
                      </cite>
                    )}
                  </Card>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                    <div className="text-6xl">🚀</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'gradient') {
    return (
      <section 
        className={cn(
          'py-20 text-white relative overflow-hidden',
          backgroundImage ? '' : 'bg-gradient-to-r from-blue-600 to-purple-600',
          className
        )}
        style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
      >
        {backgroundImage && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90" />
        )}
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {badge && (
              <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
                {badge}
              </Badge>
            )}
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{title}</h2>
            {subtitle && (
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">{subtitle}</p>
            )}
            {description && (
              <p className="text-blue-100 mb-10 max-w-2xl mx-auto">{description}</p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {actions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Button 
                    variant={action.variant === 'primary' ? 'white' : 'outline-white'} 
                    size="lg" 
                    className="w-full sm:w-auto text-lg px-8 py-4"
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
            
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                    <div className="text-blue-200 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'centered') {
    return (
      <section className={cn('py-20 text-center', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {badge && (
              <Badge variant="primary" className="mb-6">
                {badge}
              </Badge>
            )}
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
            {subtitle && (
              <p className="text-xl text-gray-600 mb-8">{subtitle}</p>
            )}
            {description && (
              <p className="text-gray-600 mb-10">{description}</p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {actions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Button variant={action.variant} size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
            
            {features && (
              <div className="grid md:grid-cols-3 gap-4 mt-12 text-sm">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className={cn('py-16 bg-gray-50', className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {badge && (
            <Badge variant="primary" className="mb-6">
              {badge}
            </Badge>
          )}
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
          {subtitle && (
            <p className="text-xl text-gray-600 mb-8">{subtitle}</p>
          )}
          {description && (
            <p className="text-gray-600 mb-10">{description}</p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {actions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Button variant={action.variant} size="lg" className="w-full sm:w-auto">
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Pre-built CTA sections for common use cases
export const CTASections = {
  GetStarted: () => (
    <CTASection
      title="Ready to Transform Your Development?"
      subtitle="Join thousands of developers building faster with AI"
      variant="gradient"
      badge="Get Started"
      actions={[
        { label: 'Start Free Trial', href: '/signup', variant: 'primary' },
        { label: 'Schedule Demo', href: '/demo', variant: 'secondary' },
      ]}
      stats={[
        { label: 'Active Users', value: '10K+' },
        { label: 'Apps Built', value: '500K+' },
        { label: 'Countries', value: '50+' },
        { label: 'Uptime', value: '99.9%' },
      ]}
    />
  ),
  
  Enterprise: () => (
    <CTASection
      title="Scale with Enterprise Features"
      subtitle="Advanced security, compliance, and dedicated support for your organization"
      variant="split"
      actions={[
        { label: 'Contact Sales', href: '/contact', variant: 'primary' },
        { label: 'View Enterprise', href: '/enterprise', variant: 'outline' },
      ]}
      features={[
        'SOC 2 Type II compliance',
        'Dedicated customer success manager',
        'On-premise deployment options',
        'Custom SLA agreements',
      ]}
    />
  ),
  
  Newsletter: () => (
    <CTASection
      title="Stay Updated"
      subtitle="Get weekly insights on AI and development trends"
      variant="card"
      actions={[
        { label: 'Subscribe Now', href: '#newsletter', variant: 'primary' },
      ]}
      features={[
        'Weekly AI development insights',
        'Early access to new features',
        'Exclusive tutorials and guides',
        'No spam, unsubscribe anytime',
      ]}
    />
  ),
  
  Support: () => (
    <CTASection
      title="Need Help?"
      subtitle="Our team is here to support your success"
      variant="centered"
      actions={[
        { label: 'Get Support', href: '/resources/help-center', variant: 'primary' },
        { label: 'Join Community', href: '/community', variant: 'outline' },
        { label: 'Contact Us', href: '/contact', variant: 'ghost' },
      ]}
    />
  ),
};