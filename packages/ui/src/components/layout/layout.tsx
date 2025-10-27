import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Container component for consistent page widths
const containerVariants = cva('mx-auto w-full', {
  variants: {
    size: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
    },
    padding: {
      none: '',
      sm: 'px-4',
      md: 'px-6',
      lg: 'px-8',
      xl: 'px-12',
    },
  },
  defaultVariants: {
    size: 'lg',
    padding: 'md',
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(containerVariants({ size, padding }), className)}
      {...props}
    />
  )
);
Container.displayName = 'Container';

// Grid system
const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
      12: 'grid-cols-12',
    },
    gap: {
      none: 'gap-0',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12',
    },
  },
  defaultVariants: {
    cols: 1,
    gap: 'md',
  },
});

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(gridVariants({ cols, gap }), className)}
      {...props}
    />
  )
);
Grid.displayName = 'Grid';

// Grid item
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6;
  rowStart?: 1 | 2 | 3 | 4 | 5 | 6;
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, colStart, rowSpan, rowStart, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Column span
        colSpan === 1 && 'col-span-1',
        colSpan === 2 && 'col-span-2',
        colSpan === 3 && 'col-span-3',
        colSpan === 4 && 'col-span-4',
        colSpan === 5 && 'col-span-5',
        colSpan === 6 && 'col-span-6',
        colSpan === 7 && 'col-span-7',
        colSpan === 8 && 'col-span-8',
        colSpan === 9 && 'col-span-9',
        colSpan === 10 && 'col-span-10',
        colSpan === 11 && 'col-span-11',
        colSpan === 12 && 'col-span-12',
        colSpan === 'full' && 'col-span-full',
        // Column start
        colStart === 1 && 'col-start-1',
        colStart === 2 && 'col-start-2',
        colStart === 3 && 'col-start-3',
        colStart === 4 && 'col-start-4',
        colStart === 5 && 'col-start-5',
        colStart === 6 && 'col-start-6',
        colStart === 7 && 'col-start-7',
        colStart === 8 && 'col-start-8',
        colStart === 9 && 'col-start-9',
        colStart === 10 && 'col-start-10',
        colStart === 11 && 'col-start-11',
        colStart === 12 && 'col-start-12',
        // Row span
        rowSpan === 1 && 'row-span-1',
        rowSpan === 2 && 'row-span-2',
        rowSpan === 3 && 'row-span-3',
        rowSpan === 4 && 'row-span-4',
        rowSpan === 5 && 'row-span-5',
        rowSpan === 6 && 'row-span-6',
        // Row start
        rowStart === 1 && 'row-start-1',
        rowStart === 2 && 'row-start-2',
        rowStart === 3 && 'row-start-3',
        rowStart === 4 && 'row-start-4',
        rowStart === 5 && 'row-start-5',
        rowStart === 6 && 'row-start-6',
        className
      )}
      {...props}
    />
  )
);
GridItem.displayName = 'GridItem';

// Flexbox utilities
const flexVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      col: 'flex-col',
      'col-reverse': 'flex-col-reverse',
    },
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
    },
    justify: {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    align: {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
  },
  defaultVariants: {
    direction: 'row',
    wrap: 'nowrap',
    justify: 'start',
    align: 'stretch',
    gap: 'none',
  },
});

export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, direction, wrap, justify, align, gap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        flexVariants({ direction, wrap, justify, align, gap }),
        className
      )}
      {...props}
    />
  )
);
Flex.displayName = 'Flex';

// Stack component (simplified flex column)
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, gap = 'md', align = 'stretch', ...props }, ref) => (
    <Flex
      ref={ref}
      direction="col"
      align={align}
      gap={gap}
      className={className}
      {...props}
    />
  )
);
Stack.displayName = 'Stack';

// Center component
export interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
  inline?: boolean;
}

const Center = React.forwardRef<HTMLDivElement, CenterProps>(
  ({ className, inline = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        inline ? 'inline-flex' : 'flex',
        'items-center justify-center',
        className
      )}
      {...props}
    />
  )
);
Center.displayName = 'Center';

// Spacer component
export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  axis?: 'horizontal' | 'vertical' | 'both';
}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size = 'md', axis = 'vertical', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Vertical spacing
        axis === 'vertical' && size === 'xs' && 'h-1',
        axis === 'vertical' && size === 'sm' && 'h-2',
        axis === 'vertical' && size === 'md' && 'h-4',
        axis === 'vertical' && size === 'lg' && 'h-6',
        axis === 'vertical' && size === 'xl' && 'h-8',
        axis === 'vertical' && size === '2xl' && 'h-12',
        axis === 'vertical' && size === '3xl' && 'h-16',
        axis === 'vertical' && size === '4xl' && 'h-24',
        // Horizontal spacing
        axis === 'horizontal' && size === 'xs' && 'w-1',
        axis === 'horizontal' && size === 'sm' && 'w-2',
        axis === 'horizontal' && size === 'md' && 'w-4',
        axis === 'horizontal' && size === 'lg' && 'w-6',
        axis === 'horizontal' && size === 'xl' && 'w-8',
        axis === 'horizontal' && size === '2xl' && 'w-12',
        axis === 'horizontal' && size === '3xl' && 'w-16',
        axis === 'horizontal' && size === '4xl' && 'w-24',
        // Both axes
        axis === 'both' && size === 'xs' && 'w-1 h-1',
        axis === 'both' && size === 'sm' && 'w-2 h-2',
        axis === 'both' && size === 'md' && 'w-4 h-4',
        axis === 'both' && size === 'lg' && 'w-6 h-6',
        axis === 'both' && size === 'xl' && 'w-8 h-8',
        axis === 'both' && size === '2xl' && 'w-12 h-12',
        axis === 'both' && size === '3xl' && 'w-16 h-16',
        axis === 'both' && size === '4xl' && 'w-24 h-24',
        className
      )}
      {...props}
    />
  )
);
Spacer.displayName = 'Spacer';

// AspectRatio component
export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
  asChild?: boolean;
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ className, ratio = 1, asChild = false, children, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: `${100 / ratio}%`,
        ...style,
      }}
      className={className}
      {...props}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    </div>
  )
);
AspectRatio.displayName = 'AspectRatio';

// Divider/Separator component
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = 'horizontal', decorative, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  )
);
Divider.displayName = 'Divider';

export {
  Container,
  Grid,
  GridItem,
  Flex,
  Stack,
  Center,
  Spacer,
  AspectRatio,
  Divider,
  containerVariants,
  gridVariants,
  flexVariants,
};