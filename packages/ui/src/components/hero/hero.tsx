import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Button } from '../button';
import { Badge } from '../badge';

const heroVariants = cva(
  'relative w-full flex items-center justify-center text-center overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-background',
        gradient: 'bg-gradient-to-br from-primary/10 via-background to-secondary/10',
        dark: 'bg-slate-900 text-slate-50',
        image: 'bg-cover bg-center bg-no-repeat',
        video: 'relative',
      },
      size: {
        sm: 'min-h-[400px] py-16',
        default: 'min-h-[600px] py-24',
        lg: 'min-h-[800px] py-32',
        full: 'min-h-screen py-32',
      },
      alignment: {
        center: 'text-center items-center',
        left: 'text-left items-center justify-start',
        right: 'text-right items-center justify-end',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      alignment: 'center',
    },
  }
);

const heroContentVariants = cva(
  'relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  {
    variants: {
      alignment: {
        center: 'text-center',
        left: 'text-left',
        right: 'text-right',
      },
    },
    defaultVariants: {
      alignment: 'center',
    },
  }
);

interface HeroAction {
  label: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  onClick?: () => void;
  href?: string;
  external?: boolean;
}

interface HeroProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof heroVariants> {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  };
  actions?: HeroAction[];
  backgroundImage?: string;
  backgroundVideo?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  features?: string[];
  stats?: Array<{
    value: string;
    label: string;
  }>;
}

const Hero = React.forwardRef<HTMLDivElement, HeroProps>(
  (
    {
      className,
      variant,
      size,
      alignment,
      title,
      subtitle,
      description,
      badge,
      actions = [],
      backgroundImage,
      backgroundVideo,
      overlay = false,
      overlayOpacity = 0.5,
      features = [],
      stats = [],
      children,
      style,
      ...props
    },
    ref
  ) => {
    const backgroundStyle = React.useMemo(() => {
      if (variant === 'image' && backgroundImage) {
        return {
          ...style,
          backgroundImage: `url(${backgroundImage})`,
        };
      }
      return style;
    }, [variant, backgroundImage, style]);

    return (
      <section
        ref={ref}
        className={cn(heroVariants({ variant, size, alignment }), className)}
        style={backgroundStyle}
        {...props}
      >
        {/* Background Video */}
        {variant === 'video' && backgroundVideo && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        )}

        {/* Overlay */}
        {overlay && (variant === 'image' || variant === 'video') && (
          <div
            className="absolute inset-0 bg-black z-0"
            style={{ opacity: overlayOpacity }}
          />
        )}

        {/* Content */}
        <div className={cn(heroContentVariants({ alignment }))}>
          <div className="space-y-6">
            {/* Badge */}
            {badge && (
              <div className="flex justify-center">
                <Badge variant={badge.variant || 'secondary'} size="default">
                  {badge.text}
                </Badge>
              </div>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className="text-sm font-medium text-primary tracking-wider uppercase">
                {subtitle}
              </p>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {description}
              </p>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {actions.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'default'}
                    size={action.size || 'lg'}
                    onClick={action.onClick}
                    asChild={!!action.href}
                  >
                    {action.href ? (
                      <a
                        href={action.href}
                        target={action.external ? '_blank' : undefined}
                        rel={action.external ? 'noopener noreferrer' : undefined}
                      >
                        {action.label}
                      </a>
                    ) : (
                      action.label
                    )}
                  </Button>
                ))}
              </div>
            )}

            {/* Stats */}
            {stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-primary">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {children}
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-secondary/5 to-transparent rounded-full blur-3xl" />
        </div>
      </section>
    );
  }
);
Hero.displayName = 'Hero';

// Pre-built hero variants
const SimpleHero: React.FC<{
  title: string;
  description?: string;
  actions?: HeroAction[];
  className?: string;
}> = ({ title, description, actions, className }) => (
  <Hero
    variant="default"
    size="default"
    title={title}
    description={description}
    actions={actions}
    className={className}
  />
);

const GradientHero: React.FC<{
  title: string;
  subtitle?: string;
  description?: string;
  badge?: HeroProps['badge'];
  actions?: HeroAction[];
  className?: string;
}> = ({ title, subtitle, description, badge, actions, className }) => (
  <Hero
    variant="gradient"
    size="lg"
    title={title}
    subtitle={subtitle}
    description={description}
    badge={badge}
    actions={actions}
    className={className}
  />
);

const ImageHero: React.FC<{
  title: string;
  description?: string;
  backgroundImage: string;
  overlay?: boolean;
  overlayOpacity?: number;
  actions?: HeroAction[];
  className?: string;
}> = ({ title, description, backgroundImage, overlay = true, overlayOpacity, actions, className }) => (
  <Hero
    variant="image"
    size="full"
    title={title}
    description={description}
    backgroundImage={backgroundImage}
    overlay={overlay}
    overlayOpacity={overlayOpacity}
    actions={actions}
    className={className}
  />
);

const VideoHero: React.FC<{
  title: string;
  description?: string;
  backgroundVideo: string;
  overlay?: boolean;
  overlayOpacity?: number;
  actions?: HeroAction[];
  className?: string;
}> = ({ title, description, backgroundVideo, overlay = true, overlayOpacity, actions, className }) => (
  <Hero
    variant="video"
    size="full"
    title={title}
    description={description}
    backgroundVideo={backgroundVideo}
    overlay={overlay}
    overlayOpacity={overlayOpacity}
    actions={actions}
    className={className}
  />
);

const StatsHero: React.FC<{
  title: string;
  description?: string;
  stats: HeroProps['stats'];
  actions?: HeroAction[];
  className?: string;
}> = ({ title, description, stats, actions, className }) => (
  <Hero
    variant="gradient"
    size="lg"
    title={title}
    description={description}
    stats={stats}
    actions={actions}
    className={className}
  />
);

export {
  Hero,
  SimpleHero,
  GradientHero,
  ImageHero,
  VideoHero,
  StatsHero,
  heroVariants,
  heroContentVariants,
  type HeroProps,
  type HeroAction,
};