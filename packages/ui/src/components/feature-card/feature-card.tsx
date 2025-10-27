import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader } from '../card';
import { Button } from '../button';
import { Badge } from '../badge';
import { ArrowRight, ExternalLink } from 'lucide-react';

const featureCardVariants = cva(
  'group transition-all duration-200 hover:shadow-lg',
  {
    variants: {
      variant: {
        default: 'bg-background border hover:border-primary/20',
        gradient: 'bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10',
        outline: 'bg-transparent border-2 border-dashed hover:border-solid hover:bg-muted/50',
        minimal: 'bg-transparent border-none shadow-none hover:bg-muted/30',
        featured: 'bg-primary text-primary-foreground border-primary',
      },
      size: {
        sm: '',
        default: '',
        lg: 'p-2',
      },
      orientation: {
        vertical: 'text-center',
        horizontal: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      orientation: 'vertical',
    },
  }
);

interface FeatureCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof featureCardVariants> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: {
    src: string;
    alt: string;
    position?: 'top' | 'left' | 'right' | 'background';
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'outline' | 'success' | 'destructive';
  };
  action?: {
    text: string;
    onClick?: () => void;
    href?: string;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link';
    external?: boolean;
    showArrow?: boolean;
  };
  stats?: Array<{
    value: string;
    label: string;
  }>;
  features?: string[];
  comingSoon?: boolean;
  new?: boolean;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  (
    {
      className,
      variant,
      size,
      orientation,
      title,
      description,
      icon,
      image,
      badge,
      action,
      stats = [],
      features = [],
      comingSoon = false,
      new: isNew = false,
      children,
      ...props
    },
    ref
  ) => {
    const renderIcon = () => {
      if (!icon) return null;

      return (
        <div
          className={cn(
            'flex items-center justify-center rounded-lg p-3 mb-4',
            variant === 'featured'
              ? 'bg-primary-foreground/10'
              : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors'
          )}
        >
          <div className="h-6 w-6">{icon}</div>
        </div>
      );
    };

    const renderImage = () => {
      if (!image) return null;

      const imageElement = (
        <img
          src={image.src}
          alt={image.alt}
          className={cn(
            'object-cover',
            image.position === 'top' && 'w-full h-48 rounded-t-lg',
            image.position === 'left' && 'w-24 h-24 rounded-lg',
            image.position === 'right' && 'w-24 h-24 rounded-lg',
            image.position === 'background' && 'absolute inset-0 w-full h-full opacity-10'
          )}
        />
      );

      if (image.position === 'background') {
        return <div className="absolute inset-0 overflow-hidden">{imageElement}</div>;
      }

      return imageElement;
    };

    const renderBadges = () => {
      const badges = [];

      if (badge) {
        badges.push(
          <Badge key="custom-badge" variant={badge.variant || 'secondary'}>
            {badge.text}
          </Badge>
        );
      }

      if (isNew) {
        badges.push(
          <Badge key="new-badge" variant="success">
            New
          </Badge>
        );
      }

      if (comingSoon) {
        badges.push(
          <Badge key="coming-soon-badge" variant="outline">
            Coming Soon
          </Badge>
        );
      }

      if (badges.length === 0) return null;

      return (
        <div className="flex items-center gap-2 mb-4 justify-center">
          {badges}
        </div>
      );
    };

    const renderStats = () => {
      if (stats.length === 0) return null;

      return (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-lg font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      );
    };

    const renderFeatures = () => {
      if (features.length === 0) return null;

      return (
        <ul className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-2 text-sm">
              <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      );
    };

    const renderAction = () => {
      if (!action || comingSoon) return null;

      return (
        <Button
          variant={action.variant || 'outline'}
          size="sm"
          className="group/btn"
          onClick={action.onClick}
          disabled={comingSoon}
          asChild={!!action.href}
        >
          {action.href ? (
            <a
              href={action.href}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-2"
            >
              {action.text}
              {action.showArrow !== false && (
                action.external ? (
                  <ExternalLink className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                ) : (
                  <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                )
              )}
            </a>
          ) : (
            <span className="flex items-center gap-2">
              {action.text}
              {action.showArrow !== false && (
                <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
              )}
            </span>
          )}
        </Button>
      );
    };

    const isHorizontal = orientation === 'horizontal';

    return (
      <Card
        ref={ref}
        className={cn(featureCardVariants({ variant, size, orientation }), className)}
        {...props}
      >
        {/* Background Image */}
        {image?.position === 'background' && renderImage()}

        {/* Top Image */}
        {image?.position === 'top' && renderImage()}

        <div className={cn('relative', isHorizontal && 'flex items-start space-x-4')}>
          {/* Left Image */}
          {image?.position === 'left' && isHorizontal && (
            <div className="flex-shrink-0">{renderImage()}</div>
          )}

          <div className="flex-1">
            <CardHeader className={cn(isHorizontal ? 'pb-2' : 'pb-4')}>
              {/* Badges */}
              {renderBadges()}

              {/* Icon */}
              {!isHorizontal && renderIcon()}

              {/* Title */}
              <h3 className="text-lg font-semibold leading-tight mb-2">
                {title}
              </h3>

              {/* Description */}
              <p
                className={cn(
                  'text-sm leading-relaxed',
                  variant === 'featured'
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                )}
              >
                {description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Horizontal Icon */}
              {isHorizontal && renderIcon()}

              {/* Stats */}
              {renderStats()}

              {/* Features */}
              {renderFeatures()}

              {/* Action */}
              {renderAction()}

              {children}
            </CardContent>
          </div>

          {/* Right Image */}
          {image?.position === 'right' && isHorizontal && (
            <div className="flex-shrink-0">{renderImage()}</div>
          )}
        </div>
      </Card>
    );
  }
);
FeatureCard.displayName = 'FeatureCard';

// Pre-built feature card variants
const SimpleFeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}> = ({ title, description, icon, className }) => (
  <FeatureCard
    variant="default"
    title={title}
    description={description}
    icon={icon}
    className={className}
  />
);

const ActionFeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  action: FeatureCardProps['action'];
  className?: string;
}> = ({ title, description, icon, action, className }) => (
  <FeatureCard
    variant="default"
    title={title}
    description={description}
    icon={icon}
    action={action}
    className={className}
  />
);

const ImageFeatureCard: React.FC<{
  title: string;
  description: string;
  image: NonNullable<FeatureCardProps['image']>;
  action?: FeatureCardProps['action'];
  className?: string;
}> = ({ title, description, image, action, className }) => (
  <FeatureCard
    variant="default"
    title={title}
    description={description}
    image={image}
    action={action}
    className={className}
  />
);

const HorizontalFeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  features?: string[];
  action?: FeatureCardProps['action'];
  className?: string;
}> = ({ title, description, icon, features, action, className }) => (
  <FeatureCard
    variant="default"
    orientation="horizontal"
    title={title}
    description={description}
    icon={icon}
    features={features}
    action={action}
    className={className}
  />
);

const FeaturedFeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: FeatureCardProps['badge'];
  stats?: FeatureCardProps['stats'];
  action?: FeatureCardProps['action'];
  className?: string;
}> = ({ title, description, icon, badge, stats, action, className }) => (
  <FeatureCard
    variant="featured"
    size="lg"
    title={title}
    description={description}
    icon={icon}
    badge={badge}
    stats={stats}
    action={action}
    className={className}
  />
);

// Feature Grid Component
interface FeatureGridProps extends React.HTMLAttributes<HTMLDivElement> {
  features: Array<{
    id: string;
    title: string;
    description: string;
    icon?: React.ReactNode;
    image?: FeatureCardProps['image'];
    badge?: FeatureCardProps['badge'];
    action?: FeatureCardProps['action'];
    stats?: FeatureCardProps['stats'];
    features?: string[];
    comingSoon?: boolean;
    new?: boolean;
  }>;
  columns?: 1 | 2 | 3 | 4;
  variant?: FeatureCardProps['variant'];
  orientation?: FeatureCardProps['orientation'];
  title?: string;
  subtitle?: string;
  description?: string;
}

const FeatureGrid = React.forwardRef<HTMLDivElement, FeatureGridProps>(
  (
    {
      className,
      features,
      columns = 3,
      variant = 'default',
      orientation = 'vertical',
      title,
      subtitle,
      description,
      children,
      ...props
    },
    ref
  ) => {
    const gridCols = {
      1: 'grid-cols-1',
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

          {/* Features Grid */}
          <div className={cn('grid gap-8', gridCols[columns])}>
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                variant={variant}
                orientation={orientation}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                image={feature.image}
                badge={feature.badge}
                action={feature.action}
                stats={feature.stats}
                features={feature.features}
                comingSoon={feature.comingSoon}
                new={feature.new}
              />
            ))}
          </div>

          {children}
        </div>
      </section>
    );
  }
);
FeatureGrid.displayName = 'FeatureGrid';

export {
  FeatureCard,
  SimpleFeatureCard,
  ActionFeatureCard,
  ImageFeatureCard,
  HorizontalFeatureCard,
  FeaturedFeatureCard,
  FeatureGrid,
  featureCardVariants,
  type FeatureCardProps,
  type FeatureGridProps,
};