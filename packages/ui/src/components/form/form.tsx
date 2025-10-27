import * as React from 'react';
import { cn } from '../../lib/utils';
import { Label } from '../label';

// Form root component
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, onSubmit, ...props }, ref) => (
    <form
      ref={ref}
      className={cn('space-y-6', className)}
      onSubmit={onSubmit}
      {...props}
    />
  )
);
Form.displayName = 'Form';

// Form field wrapper
interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ children, className }) => (
  <div className={cn('space-y-2', className)}>{children}</div>
);

// Form label - using the imported Label component
const FormLabel = Label;

// Form control wrapper (for inputs, selects, etc.)
const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('relative', className)} {...props} />
));
FormControl.displayName = 'FormControl';

// Form description
const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
FormDescription.displayName = 'FormDescription';

// Form error message
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: 'error' | 'warning' | 'info';
  }
>(({ className, variant = 'error', ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm font-medium',
      variant === 'error' && 'text-destructive',
      variant === 'warning' && 'text-yellow-600',
      variant === 'info' && 'text-blue-600',
      className
    )}
    {...props}
  />
));
FormMessage.displayName = 'FormMessage';

// Form section for grouping related fields
const FormSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    description?: string;
  }
>(({ className, title, description, children, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-4', className)} {...props}>
    {(title || description) && (
      <div className="space-y-1">
        {title && (
          <h3 className="text-lg font-medium leading-6 text-foreground">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    )}
    <div className="space-y-4">{children}</div>
  </div>
));
FormSection.displayName = 'FormSection';

// Form grid for responsive layouts
const FormGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    cols?: 1 | 2 | 3 | 4 | 6 | 12;
    gap?: 'sm' | 'md' | 'lg';
  }
>(({ className, cols = 1, gap = 'md', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'grid',
      cols === 1 && 'grid-cols-1',
      cols === 2 && 'grid-cols-1 md:grid-cols-2',
      cols === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      cols === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      cols === 6 && 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
      cols === 12 && 'grid-cols-12',
      gap === 'sm' && 'gap-4',
      gap === 'md' && 'gap-6',
      gap === 'lg' && 'gap-8',
      className
    )}
    {...props}
  />
));
FormGrid.displayName = 'FormGrid';

// Form item that spans multiple columns
const FormGridItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    colSpan?: 1 | 2 | 3 | 4 | 6 | 12 | 'full';
  }
>(({ className, colSpan = 1, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      colSpan === 1 && 'col-span-1',
      colSpan === 2 && 'col-span-1 md:col-span-2',
      colSpan === 3 && 'col-span-1 md:col-span-2 lg:col-span-3',
      colSpan === 4 && 'col-span-1 md:col-span-2 lg:col-span-4',
      colSpan === 6 && 'col-span-1 md:col-span-3 lg:col-span-6',
      colSpan === 12 && 'col-span-12',
      colSpan === 'full' && 'col-span-full',
      className
    )}
    {...props}
  />
));
FormGridItem.displayName = 'FormGridItem';

// Form group for inline fields (like first name + last name)
const FormGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical';
    gap?: 'sm' | 'md' | 'lg';
  }
>(({ className, orientation = 'horizontal', gap = 'md', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex',
      orientation === 'horizontal' ? 'flex-row items-end' : 'flex-col',
      gap === 'sm' && 'gap-2',
      gap === 'md' && 'gap-4',
      gap === 'lg' && 'gap-6',
      className
    )}
    {...props}
  />
));
FormGroup.displayName = 'FormGroup';

// Form actions (submit, cancel buttons)
const FormActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    alignment?: 'left' | 'center' | 'right';
    orientation?: 'horizontal' | 'vertical';
  }
>(
  (
    { className, alignment = 'left', orientation = 'horizontal', ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'flex gap-3',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        alignment === 'left' && 'justify-start',
        alignment === 'center' && 'justify-center',
        alignment === 'right' && 'justify-end',
        'pt-4 border-t border-border',
        className
      )}
      {...props}
    />
  )
);
FormActions.displayName = 'FormActions';

// Higher-order component for form validation
interface ValidatedFormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
  children: React.ReactElement;
}

const ValidatedFormField: React.FC<ValidatedFormFieldProps> = ({
  name,
  label,
  description,
  required = false,
  error,
  children,
}) => {
  const id = React.useId();
  
  return (
    <FormField>
      {label && (
        <FormLabel
          htmlFor={id}
          required={required}
        >
          {label}
        </FormLabel>
      )}
      <FormControl>
        {React.cloneElement(children, {
          id,
          name,
          'aria-describedby': description ? `${id}-description` : undefined,
          'aria-invalid': error ? 'true' : 'false',
        })}
      </FormControl>
      {description && (
        <FormDescription id={`${id}-description`}>
          {description}
        </FormDescription>
      )}
      {error && <FormMessage>{error}</FormMessage>}
    </FormField>
  );
};

export {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormSection,
  FormGrid,
  FormGridItem,
  FormGroup,
  FormActions,
  ValidatedFormField,
};