import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const tooltipContentVariants = cva(
  'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      variant: {
        default: 'bg-popover text-popover-foreground border-border',
        dark: 'bg-gray-900 text-white border-gray-800',
        light: 'bg-white text-gray-900 border-gray-200',
        destructive: 'bg-destructive text-destructive-foreground border-destructive',
        success: 'bg-green-600 text-white border-green-600',
        warning: 'bg-yellow-600 text-white border-yellow-600',
        info: 'bg-blue-600 text-white border-blue-600',
      },
      size: {
        default: 'px-3 py-1.5 text-sm',
        sm: 'px-2 py-1 text-xs',
        lg: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipContentVariants> {
  hideArrow?: boolean;
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    {
      className,
      sideOffset = 4,
      variant,
      size,
      hideArrow = false,
      children,
      ...props
    },
    ref
  ) => (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(tooltipContentVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {!hideArrow && <TooltipPrimitive.Arrow className="fill-current" />}
    </TooltipPrimitive.Content>
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Compound component for easier usage
export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  variant?: VariantProps<typeof tooltipContentVariants>['variant'];
  size?: VariantProps<typeof tooltipContentVariants>['size'];
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
  hideArrow?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  contentClassName?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  align = 'center',
  variant = 'default',
  size = 'default',
  delayDuration = 300,
  skipDelayDuration = 300,
  disableHoverableContent = false,
  hideArrow = false,
  open,
  defaultOpen,
  onOpenChange,
  className,
  contentClassName,
}) => {
  return (
    <TooltipProvider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      <TooltipRoot
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          variant={variant}
          size={size}
          hideArrow={hideArrow}
          className={contentClassName}
        >
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
};

// Simple tooltip wrapper for common use cases
const SimpleTooltip: React.FC<{
  tooltip: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}> = ({ tooltip, children, side = 'top' }) => (
  <Tooltip content={tooltip} side={side}>
    {children}
  </Tooltip>
);

// Predefined tooltip variants
const TooltipInfo: React.FC<{
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}> = ({ content, children, side = 'top' }) => (
  <Tooltip content={content} variant="info" side={side}>
    {children}
  </Tooltip>
);

const TooltipWarning: React.FC<{
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}> = ({ content, children, side = 'top' }) => (
  <Tooltip content={content} variant="warning" side={side}>
    {children}
  </Tooltip>
);

const TooltipError: React.FC<{
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}> = ({ content, children, side = 'top' }) => (
  <Tooltip content={content} variant="destructive" side={side}>
    {children}
  </Tooltip>
);

export {
  Tooltip,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  SimpleTooltip,
  TooltipInfo,
  TooltipWarning,
  TooltipError,
  tooltipContentVariants,
};