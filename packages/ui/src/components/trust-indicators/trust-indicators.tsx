import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Badge } from '../badge';
import { Star, Shield, Award, Users, CheckCircle, Zap } from 'lucide-react';

const trustIndicatorsVariants = cva(
  'w-full py-8',
  {
    variants: {
      variant: {
        default: 'bg-background',
        muted: 'bg-muted/50',
        transparent: 'bg-transparent',
      },
      layout: {
        horizontal: '',
        grid: '',
        carousel: '',
      },
      alignment: {
        center: 'text-center',
        left: 'text-left',
        right: 'text-right',
      },
    },
    defaultVariants: {
      variant: 'default',
      layout: 'horizontal',
      alignment: 'center',
    },
  }
);

interface TrustIndicator {
  type: 'logo' | 'rating' | 'stat' | 'badge' | 'testimonial';
  content: {
    logo?: {
      src: string;
      alt: string;
      width?: number;
      height?: number;
    };
    rating?: {
      value: number;
      max: number;
      source: string;
      reviews?: number;
    };
    stat?: {
      value: string;
      label: string;
      description?: string;
    };
    badge?: {
      text: string;
      variant?: 'default' | 'secondary' | 'outline' | 'success';
      icon?: React.ReactNode;
    };
    testimonial?: {
      quote: string;
      author: string;
      company?: string;
      avatar?: string;
    };
  };
}

interface TrustIndicatorsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof trustIndicatorsVariants> {
  title?: string;
  subtitle?: string;
  indicators: TrustIndicator[];
  autoplay?: boolean;
  autoplayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
}

const TrustIndicators = React.forwardRef<HTMLDivElement, TrustIndicatorsProps>(
  (
    {
      className,
      variant,
      layout,
      alignment,
      title,
      subtitle,
      indicators,
      autoplay = false,
      autoplayInterval = 5000,
      showArrows = true,
      showDots = true,
      children,
      ...props
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    React.useEffect(() => {
      if (autoplay && layout === 'carousel' && indicators.length > 1) {
        const interval = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % indicators.length);
        }, autoplayInterval);
        return () => clearInterval(interval);
      }
    }, [autoplay, autoplayInterval, indicators.length, layout]);

    const renderRating = (indicator: TrustIndicator) => {
      const { rating } = indicator.content;
      if (!rating) return null;

      return (
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-1">
            {Array.from({ length: rating.max }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < rating.value
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                )}
              />
            ))}
            <span className="ml-2 text-sm font-medium">{rating.value}</span>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            <span className="font-medium">{rating.source}</span>
            {rating.reviews && (
              <span className="ml-1">({rating.reviews.toLocaleString()} reviews)</span>
            )}
          </div>
        </div>
      );
    };

    const renderStat = (indicator: TrustIndicator) => {
      const { stat } = indicator.content;
      if (!stat) return null;

      return (
        <div className="text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-bold text-primary">
            {stat.value}
          </div>
          <div className="text-sm font-medium">{stat.label}</div>
          {stat.description && (
            <div className="text-xs text-muted-foreground">{stat.description}</div>
          )}
        </div>
      );
    };

    const renderBadge = (indicator: TrustIndicator) => {
      const { badge } = indicator.content;
      if (!badge) return null;

      return (
        <div className="flex justify-center">
          <Badge variant={badge.variant || 'default'} className="gap-2">
            {badge.icon}
            {badge.text}
          </Badge>
        </div>
      );
    };

    const renderTestimonial = (indicator: TrustIndicator) => {
      const { testimonial } = indicator.content;
      if (!testimonial) return null;

      return (
        <div className="text-center space-y-3 max-w-md">
          <blockquote className="text-sm italic">"{testimonial.quote}"</blockquote>
          <div className="flex items-center justify-center space-x-3">
            {testimonial.avatar && (
              <img
                src={testimonial.avatar}
                alt={testimonial.author}
                className="h-8 w-8 rounded-full"
              />
            )}
            <div className="text-xs">
              <div className="font-medium">{testimonial.author}</div>
              {testimonial.company && (
                <div className="text-muted-foreground">{testimonial.company}</div>
              )}
            </div>
          </div>
        </div>
      );
    };

    const renderLogo = (indicator: TrustIndicator) => {
      const { logo } = indicator.content;
      if (!logo) return null;

      return (
        <div className="flex justify-center items-center">
          <img
            src={logo.src}
            alt={logo.alt}
            width={logo.width || 120}
            height={logo.height || 60}
            className="max-h-12 w-auto opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
          />
        </div>
      );
    };

    const renderIndicator = (indicator: TrustIndicator, index: number) => {
      const key = `indicator-${index}`;
      
      switch (indicator.type) {
        case 'logo':
          return <div key={key}>{renderLogo(indicator)}</div>;
        case 'rating':
          return <div key={key}>{renderRating(indicator)}</div>;
        case 'stat':
          return <div key={key}>{renderStat(indicator)}</div>;
        case 'badge':
          return <div key={key}>{renderBadge(indicator)}</div>;
        case 'testimonial':
          return <div key={key}>{renderTestimonial(indicator)}</div>;
        default:
          return null;
      }
    };

    const getLayoutClasses = () => {
      if (layout === 'grid') {
        return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8';
      }
      if (layout === 'carousel') {
        return 'relative';
      }
      return 'flex flex-wrap justify-center items-center gap-8 lg:gap-12';
    };

    return (
      <section
        ref={ref}
        className={cn(trustIndicatorsVariants({ variant, layout, alignment }), className)}
        {...props}
      >
        <div className="container">
          {/* Header */}
          {(title || subtitle) && (
            <div className={cn('mb-8', alignment === 'center' && 'text-center')}>
              {subtitle && (
                <p className="text-sm font-medium text-primary tracking-wider uppercase mb-2">
                  {subtitle}
                </p>
              )}
              {title && (
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {title}
                </h2>
              )}
            </div>
          )}

          {/* Indicators */}
          <div className={getLayoutClasses()}>
            {layout === 'carousel' ? (
              <>
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{
                      transform: `translateX(-${currentIndex * 100}%)`,
                    }}
                  >
                    {indicators.map((indicator, index) => (
                      <div
                        key={index}
                        className="w-full flex-shrink-0 flex justify-center"
                      >
                        {renderIndicator(indicator, index)}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Carousel Controls */}
                {indicators.length > 1 && (
                  <>
                    {showArrows && (
                      <div className="flex justify-center space-x-4 mt-6">
                        <button
                          onClick={() =>
                            setCurrentIndex(
                              (prev) => (prev - 1 + indicators.length) % indicators.length
                            )
                          }
                          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                          aria-label="Previous"
                        >
                          ←
                        </button>
                        <button
                          onClick={() =>
                            setCurrentIndex((prev) => (prev + 1) % indicators.length)
                          }
                          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                          aria-label="Next"
                        >
                          →
                        </button>
                      </div>
                    )}
                    
                    {showDots && (
                      <div className="flex justify-center space-x-2 mt-4">
                        {indicators.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                              'w-2 h-2 rounded-full transition-colors',
                              currentIndex === index
                                ? 'bg-primary'
                                : 'bg-muted hover:bg-muted/80'
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              indicators.map((indicator, index) => renderIndicator(indicator, index))
            )}
          </div>

          {children}
        </div>
      </section>
    );
  }
);
TrustIndicators.displayName = 'TrustIndicators';

// Pre-built trust indicator variants
const LogoTrustIndicators: React.FC<{
  title?: string;
  logos: Array<{ src: string; alt: string; width?: number; height?: number }>;
  className?: string;
}> = ({ title, logos, className }) => (
  <TrustIndicators
    title={title}
    indicators={logos.map((logo) => ({
      type: 'logo' as const,
      content: { logo },
    }))}
    layout="horizontal"
    className={className}
  />
);

const StatsTrustIndicators: React.FC<{
  title?: string;
  stats: Array<{ value: string; label: string; description?: string }>;
  className?: string;
}> = ({ title, stats, className }) => (
  <TrustIndicators
    title={title}
    indicators={stats.map((stat) => ({
      type: 'stat' as const,
      content: { stat },
    }))}
    layout="grid"
    className={className}
  />
);

const RatingTrustIndicators: React.FC<{
  title?: string;
  ratings: Array<{
    value: number;
    max: number;
    source: string;
    reviews?: number;
  }>;
  className?: string;
}> = ({ title, ratings, className }) => (
  <TrustIndicators
    title={title}
    indicators={ratings.map((rating) => ({
      type: 'rating' as const,
      content: { rating },
    }))}
    layout="horizontal"
    className={className}
  />
);

const BadgeTrustIndicators: React.FC<{
  title?: string;
  badges: Array<{
    text: string;
    variant?: 'default' | 'secondary' | 'outline' | 'success';
    icon?: React.ReactNode;
  }>;
  className?: string;
}> = ({ title, badges, className }) => (
  <TrustIndicators
    title={title}
    indicators={badges.map((badge) => ({
      type: 'badge' as const,
      content: { badge },
    }))}
    layout="horizontal"
    className={className}
  />
);

// Common trust indicator presets
const SecurityBadges: React.FC<{ className?: string }> = ({ className }) => (
  <BadgeTrustIndicators
    title="Security & Compliance"
    badges={[
      { text: 'SOC 2 Certified', icon: <Shield className="h-3 w-3" />, variant: 'success' },
      { text: 'GDPR Compliant', icon: <CheckCircle className="h-3 w-3" />, variant: 'success' },
      { text: 'ISO 27001', icon: <Award className="h-3 w-3" />, variant: 'success' },
      { text: '99.9% Uptime', icon: <Zap className="h-3 w-3" />, variant: 'default' },
    ]}
    className={className}
  />
);

export {
  TrustIndicators,
  LogoTrustIndicators,
  StatsTrustIndicators,
  RatingTrustIndicators,
  BadgeTrustIndicators,
  SecurityBadges,
  trustIndicatorsVariants,
  type TrustIndicatorsProps,
  type TrustIndicator,
};