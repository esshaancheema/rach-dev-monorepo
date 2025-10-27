import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const separatorVariants = cva('shrink-0 bg-border', {
  variants: {
    orientation: {
      horizontal: 'h-[1px] w-full',
      vertical: 'h-full w-[1px]',
    },
    variant: {
      default: 'bg-border',
      muted: 'bg-muted',
      accent: 'bg-accent',
      destructive: 'bg-destructive',
      success: 'bg-green-200',
      warning: 'bg-yellow-200',
      info: 'bg-blue-200',
    },
    size: {
      default: '',
      sm: '',
      lg: '',
    },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      size: 'sm',
      className: 'h-[0.5px]',
    },
    {
      orientation: 'horizontal',
      size: 'lg',
      className: 'h-[2px]',
    },
    {
      orientation: 'vertical',
      size: 'sm',
      className: 'w-[0.5px]',
    },
    {
      orientation: 'vertical',
      size: 'lg',
      className: 'w-[2px]',
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'default',
    size: 'default',
  },
});

export interface SeparatorProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>, 'orientation'>,
    VariantProps<typeof separatorVariants> {
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      className,
      orientation = 'horizontal',
      variant,
      size,
      label,
      labelPosition = 'center',
      decorative = true,
      ...props
    },
    ref
  ) => {
    if (label && orientation === 'horizontal') {
      return (
        <div className="relative flex items-center">
          <div
            className={cn(
              'flex-1',
              separatorVariants({ orientation, variant, size })
            )}
          />
          <div
            className={cn(
              'px-3 text-sm text-muted-foreground bg-background',
              labelPosition === 'left' && 'order-first',
              labelPosition === 'right' && 'order-last'
            )}
          >
            {label}
          </div>
          <div
            className={cn(
              'flex-1',
              separatorVariants({ orientation, variant, size })
            )}
          />
        </div>
      );
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation || 'horizontal'}
        className={cn(separatorVariants({ orientation: orientation || 'horizontal', variant, size }), className)}
        {...props}
      />
    );
  }
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

// Predefined separator components
const SeparatorWithText: React.FC<{
  children: React.ReactNode;
  position?: 'left' | 'center' | 'right';
  className?: string;
}> = ({ children, position = 'center', className }) => (
  <Separator
    label={typeof children === 'string' ? children : undefined}
    labelPosition={position}
    className={className}
  >
    {typeof children !== 'string' && children}
  </Separator>
);

const VerticalSeparator: React.FC<{
  className?: string;
  variant?: VariantProps<typeof separatorVariants>['variant'];
  size?: VariantProps<typeof separatorVariants>['size'];
}> = ({ className, variant, size }) => (
  <Separator
    orientation="vertical"
    variant={variant}
    size={size}
    className={className}
  />
);

const DottedSeparator: React.FC<{
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}> = ({ orientation = 'horizontal', className }) => (
  <div
    className={cn(
      'border-dashed',
      orientation === 'horizontal' ? 'border-t w-full' : 'border-l h-full',
      className
    )}
  />
);

const GradientSeparator: React.FC<{
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}> = ({ orientation = 'horizontal', className }) => (
  <div
    className={cn(
      'bg-gradient-to-r from-transparent via-border to-transparent',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'w-[1px] h-full bg-gradient-to-b',
      className
    )}
  />
);

export {
  Separator,
  SeparatorWithText,
  VerticalSeparator,
  DottedSeparator,
  GradientSeparator,
  separatorVariants,
};