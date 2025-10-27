import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardFooter } from '../card';
import { Button } from '../button';
import { Badge } from '../badge';
import { Check, X, Star, Zap } from 'lucide-react';

const pricingCardVariants = cva(
  'relative transition-all duration-200 hover:shadow-lg',
  {
    variants: {
      variant: {
        default: 'bg-background border',
        popular: 'bg-primary text-primary-foreground border-primary shadow-lg scale-105',
        enterprise: 'bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50 border-slate-700',
        minimal: 'bg-transparent border-dashed border-2',
      },
      size: {
        sm: '',
        default: '',
        lg: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface PricingFeature {
  name: string;
  included: boolean;
  description?: string;
  limit?: string | number;
}

interface PricingCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pricingCardVariants> {
  name: string;
  description?: string;
  price: {
    amount: number | string;
    currency?: string;
    period?: string;
    originalAmount?: number | string;
    discountPercentage?: number;
  };
  features: PricingFeature[];
  cta: {
    text: string;
    onClick?: () => void;
    href?: string;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost';
    disabled?: boolean;
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'outline' | 'success' | 'destructive';
  };
  popular?: boolean;
  trial?: {
    days: number;
    text?: string;
  };
  guarantee?: string;
  additionalInfo?: string;
  customIcon?: React.ReactNode;
}

const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  (
    {
      className,
      variant,
      size,
      name,
      description,
      price,
      features,
      cta,
      badge,
      popular = false,
      trial,
      guarantee,
      additionalInfo,
      customIcon,
      children,
      ...props
    },
    ref
  ) => {
    const isPopular = popular || variant === 'popular';
    const currency = price.currency || '$';
    
    const renderPrice = () => {
      const isCustomPrice = typeof price.amount === 'string' && isNaN(Number(price.amount));
      
      return (
        <div className="text-center space-y-2">
          <div className="flex items-baseline justify-center space-x-2">
            {/* Original Price (if discounted) */}
            {price.originalAmount && (
              <span className="text-lg text-muted-foreground line-through">
                {currency}{price.originalAmount}
              </span>
            )}
            
            {/* Main Price */}
            <div className="flex items-baseline">
              {!isCustomPrice && (
                <span className="text-2xl font-medium">{currency}</span>
              )}
              <span className="text-4xl font-bold tracking-tight">
                {price.amount}
              </span>
            </div>
            
            {/* Discount Badge */}
            {price.discountPercentage && (
              <Badge variant="success" size="sm">
                -{price.discountPercentage}%
              </Badge>
            )}
          </div>
          
          {/* Period */}
          {price.period && (
            <p className="text-sm text-muted-foreground">
              per {price.period}
            </p>
          )}
        </div>
      );
    };

    const renderFeatures = () => {
      return (
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {feature.included ? (
                  <Check
                    className={cn(
                      'h-4 w-4',
                      isPopular
                        ? 'text-primary-foreground'
                        : 'text-green-500'
                    )}
                  />
                ) : (
                  <X
                    className={cn(
                      'h-4 w-4',
                      isPopular
                        ? 'text-primary-foreground/50'
                        : 'text-red-500'
                    )}
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-sm',
                      !feature.included && 'text-muted-foreground line-through'
                    )}
                  >
                    {feature.name}
                  </span>
                  
                  {feature.limit && (
                    <Badge
                      variant="outline"
                      size="sm"
                      className={cn(
                        'ml-2',
                        isPopular && 'border-primary-foreground/20 text-primary-foreground'
                      )}
                    >
                      {feature.limit}
                    </Badge>
                  )}
                </div>
                
                {feature.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      );
    };

    return (
      <div className="relative">
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <Badge variant="default" className="px-3 py-1">
              <Star className="h-3 w-3 mr-1" />
              Most Popular
            </Badge>
          </div>
        )}

        <Card
          ref={ref}
          className={cn(pricingCardVariants({ variant, size }), className)}
          {...props}
        >
          {/* Header */}
          <CardHeader className="text-center space-y-4">
            {/* Custom Badge */}
            {badge && (
              <div className="flex justify-center">
                <Badge variant={badge.variant || 'secondary'}>
                  {badge.text}
                </Badge>
              </div>
            )}

            {/* Plan Name */}
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                {customIcon}
                <h3 className="text-xl font-semibold">{name}</h3>
              </div>
              
              {description && (
                <p
                  className={cn(
                    'text-sm',
                    isPopular
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground'
                  )}
                >
                  {description}
                </p>
              )}
            </div>

            {/* Pricing */}
            {renderPrice()}

            {/* Trial Info */}
            {trial && (
              <div className="flex items-center justify-center space-x-1 text-sm">
                <Zap
                  className={cn(
                    'h-4 w-4',
                    isPopular
                      ? 'text-primary-foreground'
                      : 'text-primary'
                  )}
                />
                <span>
                  {trial.text || `${trial.days}-day free trial`}
                </span>
              </div>
            )}
          </CardHeader>

          {/* Features */}
          <CardContent className="space-y-6">
            {renderFeatures()}

            {/* Additional Info */}
            {additionalInfo && (
              <p
                className={cn(
                  'text-xs text-center',
                  isPopular
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground'
                )}
              >
                {additionalInfo}
              </p>
            )}
          </CardContent>

          {/* Footer */}
          <CardFooter className="space-y-4">
            {/* CTA Button */}
            <Button
              variant={cta.variant || (isPopular ? 'secondary' : 'default')}
              size="lg"
              className="w-full"
              onClick={cta.onClick}
              disabled={cta.disabled}
              asChild={!!cta.href}
            >
              {cta.href ? (
                <a href={cta.href}>{cta.text}</a>
              ) : (
                cta.text
              )}
            </Button>

            {/* Guarantee */}
            {guarantee && (
              <p
                className={cn(
                  'text-xs text-center',
                  isPopular
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground'
                )}
              >
                {guarantee}
              </p>
            )}
          </CardFooter>

          {children}
        </Card>
      </div>
    );
  }
);
PricingCard.displayName = 'PricingCard';

// Pre-built pricing card variants
const BasicPricingCard: React.FC<{
  name: string;
  price: PricingCardProps['price'];
  features: PricingFeature[];
  cta: PricingCardProps['cta'];
  className?: string;
}> = ({ name, price, features, cta, className }) => (
  <PricingCard
    variant="default"
    name={name}
    price={price}
    features={features}
    cta={cta}
    className={className}
  />
);

const PopularPricingCard: React.FC<{
  name: string;
  description?: string;
  price: PricingCardProps['price'];
  features: PricingFeature[];
  cta: PricingCardProps['cta'];
  trial?: PricingCardProps['trial'];
  className?: string;
}> = ({ name, description, price, features, cta, trial, className }) => (
  <PricingCard
    variant="popular"
    name={name}
    description={description}
    price={price}
    features={features}
    cta={cta}
    trial={trial}
    popular
    className={className}
  />
);

const EnterprisePricingCard: React.FC<{
  name: string;
  description?: string;
  price: PricingCardProps['price'];
  features: PricingFeature[];
  cta: PricingCardProps['cta'];
  customIcon?: React.ReactNode;
  className?: string;
}> = ({ name, description, price, features, cta, customIcon, className }) => (
  <PricingCard
    variant="enterprise"
    name={name}
    description={description}
    price={price}
    features={features}
    cta={cta}
    customIcon={customIcon}
    className={className}
  />
);

// Pricing Table Component
interface PricingTableProps extends React.HTMLAttributes<HTMLDivElement> {
  plans: Array<{
    id: string;
    name: string;
    description?: string;
    price: PricingCardProps['price'];
    features: PricingFeature[];
    cta: PricingCardProps['cta'];
    badge?: PricingCardProps['badge'];
    popular?: boolean;
    trial?: PricingCardProps['trial'];
    guarantee?: string;
  }>;
  title?: string;
  subtitle?: string;
  description?: string;
  columns?: 2 | 3 | 4;
}

const PricingTable = React.forwardRef<HTMLDivElement, PricingTableProps>(
  (
    {
      className,
      plans,
      title,
      subtitle,
      description,
      columns = 3,
      children,
      ...props
    },
    ref
  ) => {
    const gridCols = {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    return (
      <section ref={ref} className={cn('py-16', className)} {...props}>
        <div className="container">
          {/* Header */}
          {(title || subtitle || description) && (
            <div className="text-center mb-16 space-y-4">
              {subtitle && (
                <p className="text-sm font-medium text-primary tracking-wider uppercase">
                  {subtitle}
                </p>
              )}
              
              {title && (
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {title}
                </h2>
              )}
              
              {description && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Pricing Cards */}
          <div className={cn('grid gap-8 max-w-7xl mx-auto', gridCols[columns])}>
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                variant={plan.popular ? 'popular' : 'default'}
                name={plan.name}
                description={plan.description}
                price={plan.price}
                features={plan.features}
                cta={plan.cta}
                badge={plan.badge}
                popular={plan.popular}
                trial={plan.trial}
                guarantee={plan.guarantee}
              />
            ))}
          </div>

          {children}
        </div>
      </section>
    );
  }
);
PricingTable.displayName = 'PricingTable';

export {
  PricingCard,
  BasicPricingCard,
  PopularPricingCard,
  EnterprisePricingCard,
  PricingTable,
  pricingCardVariants,
  type PricingCardProps,
  type PricingFeature,
  type PricingTableProps,
};