import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva('animate-spin', {
  variants: {
    variant: {
      default: 'text-primary',
      secondary: 'text-secondary',
      muted: 'text-muted-foreground',
      destructive: 'text-destructive',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      white: 'text-white',
    },
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      default: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  loading?: boolean;
  children?: React.ReactNode;
  text?: string;
  overlay?: boolean;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      variant,
      size,
      loading = true,
      children,
      text,
      overlay = false,
      ...props
    },
    ref
  ) => {
    if (!loading && children) {
      return <>{children}</>;
    }

    const spinner = (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center',
          overlay && 'absolute inset-0 bg-background/80 backdrop-blur-sm z-50',
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className={cn(spinnerVariants({ variant, size }))} />
          {text && (
            <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
          )}
        </div>
      </div>
    );

    if (overlay && children) {
      return (
        <div className="relative">
          {children}
          {loading && spinner}
        </div>
      );
    }

    return spinner;
  }
);

Spinner.displayName = 'Spinner';

// Predefined spinner patterns
const SpinnerOverlay: React.FC<{
  loading: boolean;
  text?: string;
  children: React.ReactNode;
}> = ({ loading, text, children }) => (
  <Spinner loading={loading} overlay text={text}>
    {children}
  </Spinner>
);

const SpinnerButton: React.FC<{
  loading?: boolean;
  size?: 'xs' | 'sm' | 'default';
  variant?: 'default' | 'white';
}> = ({ loading = false, size = 'sm', variant = 'default' }) => (
  <Spinner loading={loading} size={size} variant={variant} />
);

const SpinnerPage: React.FC<{
  text?: string;
  size?: 'default' | 'lg' | 'xl';
}> = ({ text = 'Loading...', size = 'lg' }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
    <Spinner size={size} />
    <p className="text-muted-foreground">{text}</p>
  </div>
);

export { Spinner, SpinnerOverlay, SpinnerButton, SpinnerPage, spinnerVariants };