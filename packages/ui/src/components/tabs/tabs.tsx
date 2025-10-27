import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva(
  'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        outline: 'bg-transparent border border-border',
        ghost: 'bg-transparent',
        pills: 'bg-muted rounded-full',
      },
      size: {
        default: 'h-10 p-1',
        sm: 'h-8 p-0.5',
        lg: 'h-12 p-1.5',
      },
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col w-fit h-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      orientation: 'horizontal',
    },
  }
);

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsListVariants>
>(({ className, variant, size, orientation, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant, size, orientation }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
  {
    variants: {
      variant: {
        default: 'data-[state=active]:bg-background data-[state=active]:shadow-sm',
        outline: 'border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none',
        ghost: 'data-[state=active]:bg-accent data-[state=active]:text-accent-foreground',
        pills: 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full',
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

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
    VariantProps<typeof tabsTriggerVariants> & {
      icon?: React.ReactNode;
      badge?: React.ReactNode;
    }
>(({ className, variant, size, icon, badge, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant, size }), className)}
    {...props}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {children}
    {badge && <span className="ml-2">{badge}</span>}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const tabsContentVariants = cva(
  'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: '',
        bordered: 'border border-border rounded-md p-4',
        filled: 'bg-muted rounded-md p-4',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> &
    VariantProps<typeof tabsContentVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(tabsContentVariants({ variant }), className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Compound component for easier usage
export interface TabItem {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface SimpleTabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: VariantProps<typeof tabsListVariants>['variant'];
  triggerVariant?: VariantProps<typeof tabsTriggerVariants>['variant'];
  contentVariant?: VariantProps<typeof tabsContentVariants>['variant'];
  size?: VariantProps<typeof tabsListVariants>['size'];
  orientation?: VariantProps<typeof tabsListVariants>['orientation'];
  className?: string;
  listClassName?: string;
  contentClassName?: string;
}

const SimpleTabs: React.FC<SimpleTabsProps> = ({
  items,
  defaultValue,
  value,
  onValueChange,
  variant = 'default',
  triggerVariant = 'default',
  contentVariant = 'default',
  size = 'default',
  orientation = 'horizontal',
  className,
  listClassName,
  contentClassName,
}) => {
  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      orientation={orientation || 'horizontal'}
      className={className}
    >
      <TabsList
        variant={variant}
        size={size}
        orientation={orientation || 'horizontal'}
        className={listClassName}
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            variant={triggerVariant}
            size={size}
            icon={item.icon}
            badge={item.badge}
            disabled={item.disabled}
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent
          key={item.value}
          value={item.value}
          variant={contentVariant}
          className={contentClassName}
        >
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

// Predefined tab variants
const OutlineTabs: React.FC<Omit<SimpleTabsProps, 'variant' | 'triggerVariant'>> = (props) => (
  <SimpleTabs {...props} variant="outline" triggerVariant="outline" />
);

const PillTabs: React.FC<Omit<SimpleTabsProps, 'variant' | 'triggerVariant'>> = (props) => (
  <SimpleTabs {...props} variant="pills" triggerVariant="pills" />
);

const VerticalTabs: React.FC<Omit<SimpleTabsProps, 'orientation'>> = (props) => (
  <SimpleTabs {...props} orientation="vertical" />
);

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  SimpleTabs,
  OutlineTabs,
  PillTabs,
  VerticalTabs,
  tabsListVariants,
  tabsTriggerVariants,
  tabsContentVariants,
};