import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  {
    variants: {
      variant: {
        default: 'border-input',
        destructive: 'border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:ring-green-500',
        warning: 'border-yellow-500 focus-visible:ring-yellow-500',
      },
      size: {
        default: 'min-h-[80px]',
        sm: 'min-h-[60px] text-xs',
        lg: 'min-h-[120px] text-base',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      resize: 'vertical',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  description?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      size,
      resize,
      label,
      description,
      error,
      maxLength,
      showCount,
      value,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        <div className="relative">
          <textarea
            className={cn(
              textareaVariants({
                variant: hasError ? 'destructive' : variant,
                size,
                resize,
                className,
              })
            )}
            ref={ref}
            value={value}
            maxLength={maxLength}
            {...props}
          />
          {(showCount || maxLength) && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {maxLength ? `${currentLength}/${maxLength}` : currentLength}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };