import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/5',
        success: 'border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-600 bg-green-50 dark:bg-green-900/20',
        warning: 'border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
        info: 'border-blue-500/50 text-blue-700 dark:text-blue-400 [&>svg]:text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      },
      size: {
        default: 'p-4',
        sm: 'p-3 text-sm',
        lg: 'p-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const getDefaultIcon = (variant: 'default' | 'destructive' | 'success' | 'warning' | 'info' | undefined) => {
  switch (variant) {
    case 'destructive':
      return <AlertCircle className="h-4 w-4" />;
    case 'success':
      return <CheckCircle className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'info':
      return <Info className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
  title?: string;
  closable?: boolean;
  onClose?: () => void;
  showDefaultIcon?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      title,
      closable,
      onClose,
      showDefaultIcon = true,
      children,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = React.useState(true);

    const handleClose = () => {
      setVisible(false);
      onClose?.();
    };

    if (!visible) return null;

    const displayIcon = icon || (showDefaultIcon ? getDefaultIcon(variant || 'default') : null);

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant, size }), className)}
        {...props}
      >
        {displayIcon}
        <div className="flex-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          {children && <AlertDescription>{children}</AlertDescription>}
        </div>
        {closable && (
          <button
            type="button"
            className="absolute right-2 top-2 rounded-md p-1 hover:bg-muted transition-colors"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

// Predefined alert components
const AlertSuccess: React.FC<{
  title?: string;
  children: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
}> = ({ title, children, closable, onClose }) => (
  <Alert variant="success" title={title} closable={closable} onClose={onClose}>
    {children}
  </Alert>
);

const AlertError: React.FC<{
  title?: string;
  children: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
}> = ({ title, children, closable, onClose }) => (
  <Alert variant="destructive" title={title} closable={closable} onClose={onClose}>
    {children}
  </Alert>
);

const AlertWarning: React.FC<{
  title?: string;
  children: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
}> = ({ title, children, closable, onClose }) => (
  <Alert variant="warning" title={title} closable={closable} onClose={onClose}>
    {children}
  </Alert>
);

const AlertInfo: React.FC<{
  title?: string;
  children: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
}> = ({ title, children, closable, onClose }) => (
  <Alert variant="info" title={title} closable={closable} onClose={onClose}>
    {children}
  </Alert>
);

export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertSuccess,
  AlertError,
  AlertWarning,
  AlertInfo,
  alertVariants,
};