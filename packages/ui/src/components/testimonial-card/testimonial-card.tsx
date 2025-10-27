import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../card';
import { Badge } from '../badge';
import { Star, Quote } from 'lucide-react';

const testimonialCardVariants = cva(
  'group transition-all duration-200 hover:shadow-lg',
  {
    variants: {
      variant: {
        default: 'bg-background border',
        featured: 'bg-primary text-primary-foreground border-primary',
        minimal: 'bg-transparent border-none shadow-none',
        quote: 'bg-muted/50 border-muted',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface TestimonialCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof testimonialCardVariants> {
  testimonial: string;
  author: {
    name: string;
    title?: string;
    company?: string;
    avatar?: string;
    verified?: boolean;
  };
  rating?: {
    value: number;
    max?: number;
    showStars?: boolean;
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'outline' | 'success';
  };
  date?: string;
  showQuotes?: boolean;
  source?: {
    name: string;
    logo?: string;
  };
}

const TestimonialCard = React.forwardRef<HTMLDivElement, TestimonialCardProps>(
  (
    {
      className,
      variant,
      size,
      testimonial,
      author,
      rating,
      badge,
      date,
      showQuotes = true,
      source,
      children,
      ...props
    },
    ref
  ) => {
    const renderRating = () => {
      if (!rating) return null;

      const maxStars = rating.max || 5;
      
      return (
        <div className="flex items-center space-x-1 mb-4">
          {rating.showStars !== false && (
            <div className="flex">
              {Array.from({ length: maxStars }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < rating.value
                      ? 'text-yellow-400 fill-yellow-400'
                      : variant === 'featured'
                      ? 'text-primary-foreground/30'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
          )}
          <span className="text-sm font-medium ml-2">{rating.value}/{maxStars}</span>
        </div>
      );
    };

    const renderAuthor = () => {
      return (
        <div className="flex items-center space-x-3">
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-medium">
                {author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium truncate">{author.name}</p>
              {author.verified && (
                <Badge variant="success" size="sm" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            
            {(author.title || author.company) && (
              <p className="text-xs text-muted-foreground truncate">
                {author.title}
                {author.title && author.company && ' at '}
                {author.company}
              </p>
            )}
          </div>
        </div>
      );
    };

    const renderSource = () => {
      if (!source) return null;

      return (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50">
          <div className="flex items-center space-x-2">
            {source.logo && (
              <img
                src={source.logo}
                alt={source.name}
                className="h-4 w-4 opacity-60"
              />
            )}
            <span className="text-xs text-muted-foreground">
              via {source.name}
            </span>
          </div>
          
          {date && (
            <span className="text-xs text-muted-foreground">
              {date}
            </span>
          )}
        </div>
      );
    };

    return (
      <Card
        ref={ref}
        className={cn(testimonialCardVariants({ variant, size }), className)}
        {...props}
      >
        <CardContent className="p-6">
          {/* Badge */}
          {badge && (
            <div className="mb-4">
              <Badge variant={badge.variant || 'secondary'}>
                {badge.text}
              </Badge>
            </div>
          )}

          {/* Rating */}
          {renderRating()}

          {/* Testimonial */}
          <div className="mb-6">
            <div className="relative">
              {showQuotes && (
                <Quote
                  className={cn(
                    'absolute -top-2 -left-1 h-8 w-8 opacity-20',
                    variant === 'featured'
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground'
                  )}
                />
              )}
              
              <blockquote
                className={cn(
                  'text-sm leading-relaxed',
                  showQuotes && 'pl-6',
                  variant === 'featured'
                    ? 'text-primary-foreground/90'
                    : 'text-foreground'
                )}
              >
                "{testimonial}"
              </blockquote>
            </div>
          </div>

          {/* Author */}
          {renderAuthor()}

          {/* Source */}
          {renderSource()}

          {children}
        </CardContent>
      </Card>
    );
  }
);
TestimonialCard.displayName = 'TestimonialCard';

// Pre-built testimonial card variants
const SimpleTestimonialCard: React.FC<{
  testimonial: string;
  author: TestimonialCardProps['author'];
  className?: string;
}> = ({ testimonial, author, className }) => (
  <TestimonialCard
    variant="default"
    testimonial={testimonial}
    author={author}
    className={className}
  />
);

const FeaturedTestimonialCard: React.FC<{
  testimonial: string;
  author: TestimonialCardProps['author'];
  rating?: TestimonialCardProps['rating'];
  badge?: TestimonialCardProps['badge'];
  className?: string;
}> = ({ testimonial, author, rating, badge, className }) => (
  <TestimonialCard
    variant="featured"
    size="lg"
    testimonial={testimonial}
    author={author}
    rating={rating}
    badge={badge}
    className={className}
  />
);

const MinimalTestimonialCard: React.FC<{
  testimonial: string;
  author: TestimonialCardProps['author'];
  showQuotes?: boolean;
  className?: string;
}> = ({ testimonial, author, showQuotes = false, className }) => (
  <TestimonialCard
    variant="minimal"
    testimonial={testimonial}
    author={author}
    showQuotes={showQuotes}
    className={className}
  />
);

const RatedTestimonialCard: React.FC<{
  testimonial: string;
  author: TestimonialCardProps['author'];
  rating: NonNullable<TestimonialCardProps['rating']>;
  source?: TestimonialCardProps['source'];
  date?: string;
  className?: string;
}> = ({ testimonial, author, rating, source, date, className }) => (
  <TestimonialCard
    variant="default"
    testimonial={testimonial}
    author={author}
    rating={rating}
    source={source}
    date={date}
    className={className}
  />
);

// Testimonial Grid Component
interface TestimonialGridProps extends React.HTMLAttributes<HTMLDivElement> {
  testimonials: Array<{
    id: string;
    testimonial: string;
    author: TestimonialCardProps['author'];
    rating?: TestimonialCardProps['rating'];
    badge?: TestimonialCardProps['badge'];
    date?: string;
    source?: TestimonialCardProps['source'];
  }>;
  columns?: 1 | 2 | 3 | 4;
  variant?: TestimonialCardProps['variant'];
  size?: TestimonialCardProps['size'];
  title?: string;
  subtitle?: string;
}

const TestimonialGrid = React.forwardRef<HTMLDivElement, TestimonialGridProps>(
  (
    {
      className,
      testimonials,
      columns = 3,
      variant = 'default',
      size = 'default',
      title,
      subtitle,
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
      <section ref={ref} className={cn('py-12', className)} {...props}>
        <div className="container">
          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center mb-12">
              {subtitle && (
                <p className="text-sm font-medium text-primary tracking-wider uppercase mb-2">
                  {subtitle}
                </p>
              )}
              {title && (
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {title}
                </h2>
              )}
            </div>
          )}

          {/* Testimonials Grid */}
          <div className={cn('grid gap-6', gridCols[columns])}>
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                variant={variant}
                size={size}
                testimonial={testimonial.testimonial}
                author={testimonial.author}
                rating={testimonial.rating}
                badge={testimonial.badge}
                date={testimonial.date}
                source={testimonial.source}
              />
            ))}
          </div>

          {children}
        </div>
      </section>
    );
  }
);
TestimonialGrid.displayName = 'TestimonialGrid';

export {
  TestimonialCard,
  SimpleTestimonialCard,
  FeaturedTestimonialCard,
  MinimalTestimonialCard,
  RatedTestimonialCard,
  TestimonialGrid,
  testimonialCardVariants,
  type TestimonialCardProps,
  type TestimonialGridProps,
};