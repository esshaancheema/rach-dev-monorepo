import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const skeletonVariants = cva(
  'animate-pulse rounded-md bg-muted',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        card: 'bg-muted rounded-lg',
        text: 'bg-muted rounded',
        circle: 'rounded-full bg-muted',
        avatar: 'rounded-full bg-muted',
      },
      size: {
        default: 'h-4 w-full',
        sm: 'h-2 w-full',
        md: 'h-4 w-full',
        lg: 'h-6 w-full',
        xl: 'h-8 w-full',
        avatar: 'h-10 w-10',
        'avatar-sm': 'h-8 w-8',
        'avatar-lg': 'h-12 w-12',
        'avatar-xl': 'h-16 w-16',
        button: 'h-10 w-20',
        card: 'h-32 w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  loading?: boolean;
  children?: React.ReactNode;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, loading = true, children, ...props }, ref) => {
    if (!loading && children) {
      return <>{children}</>;
    }

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Predefined skeleton patterns
const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        className={i === lines - 1 ? 'w-3/4' : 'w-full'}
      />
    ))}
  </div>
);

const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3', className)}>
    <Skeleton variant="card" size="card" />
    <div className="space-y-2">
      <Skeleton variant="text" size="md" />
      <Skeleton variant="text" size="sm" className="w-3/4" />
    </div>
  </div>
);

const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'default' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
}> = ({ size = 'default', withText = false, className }) => {
  const avatarSize = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : size === 'xl' ? 'avatar-xl' : 'avatar';
  
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <Skeleton variant="avatar" size={avatarSize} />
      {withText && (
        <div className="space-y-1">
          <Skeleton variant="text" size="sm" className="w-24" />
          <Skeleton variant="text" size="sm" className="w-16" />
        </div>
      )}
    </div>
  );
};

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, skeletonVariants };