import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      'relative z-10 flex max-w-max flex-1 items-center justify-center',
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      'group flex flex-1 list-none items-center justify-center space-x-1',
      className
    )}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50'
);

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), 'group', className)}
    {...props}
  >
    {children}{' '}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      'left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto',
      className
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn('absolute left-0 top-full flex justify-center')}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        'origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]',
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      'top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in',
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

// Breadcrumb Navigation Component
const breadcrumbVariants = cva(
  'flex items-center space-x-1 text-sm text-muted-foreground'
);

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  maxItems?: number;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className,
  maxItems = 5,
  onItemClick,
}) => {
  const displayItems = React.useMemo(() => {
    if (items.length <= maxItems) return items;
    
    const firstItem = items[0];
    const lastItems = items.slice(-2);
    
    if (!firstItem) return items;
    
    return [
      firstItem,
      { label: '...', href: undefined },
      ...lastItems,
    ];
  }, [items, maxItems]);

  return (
    <nav className={cn(breadcrumbVariants(), className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          if (!item) return null;
          return (
            <li key={index} className="flex items-center space-x-1">
              {index > 0 && (
                <span className="text-muted-foreground">{separator}</span>
              )}
              {item.href && !item.current ? (
                <button
                  onClick={() => onItemClick?.(item, index)}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span
                  className={cn(
                    item.current && 'text-foreground font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Sidebar Navigation Component
interface SidebarNavItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
  children?: SidebarNavItem[];
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  onItemClick?: (item: SidebarNavItem) => void;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

const SidebarNav: React.FC<SidebarNavProps> = ({
  items,
  onItemClick,
  className,
  collapsible = true,
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  const renderItem = (item: SidebarNavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div key={item.title}>
        <button
          onClick={() => {
            if (hasChildren) {
              setIsOpen(!isOpen);
            } else {
              onItemClick?.(item);
            }
          }}
          disabled={item.disabled}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            item.active && 'bg-accent text-accent-foreground',
            item.disabled && 'opacity-50 cursor-not-allowed',
            level > 0 && 'ml-4'
          )}
        >
          {item.icon && (
            <span className="flex h-4 w-4 items-center justify-center">
              {item.icon}
            </span>
          )}
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          )}
        </button>
        {hasChildren && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={cn('space-y-1', className)}>
      {items.map((item) => renderItem(item))}
    </nav>
  );
};

// Nav Tab Navigation Component
interface NavTabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface NavTabsProps {
  items: NavTabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

const NavTabs: React.FC<NavTabsProps> = ({
  items,
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  variant = 'default',
  className,
}) => {
  const [activeTab, setActiveTab] = React.useState(
    value || defaultValue || items[0]?.id
  );

  React.useEffect(() => {
    if (value) setActiveTab(value);
  }, [value]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onValueChange?.(tabId);
  };

  const activeItem = items.find((item) => item.id === activeTab);

  return (
    <div
      className={cn(
        'w-full',
        orientation === 'vertical' && 'flex gap-6',
        className
      )}
    >
      <div
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'border-b' : 'flex-col border-r',
          variant === 'pills' && 'bg-muted p-1 rounded-lg',
          variant === 'underline' && 'border-b-0'
        )}
        role="tablist"
        aria-orientation={orientation}
      >
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeTab === item.id}
            aria-controls={`panel-${item.id}`}
            disabled={item.disabled}
            onClick={() => handleTabChange(item.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
              'hover:text-foreground disabled:pointer-events-none disabled:opacity-50',
              variant === 'default' && [
                'border-b-2 border-transparent',
                activeTab === item.id && 'border-primary text-primary',
              ],
              variant === 'pills' && [
                'rounded-md',
                activeTab === item.id && 'bg-background text-foreground shadow-sm',
              ],
              variant === 'underline' && [
                'border-b-2 border-transparent',
                activeTab === item.id && 'border-foreground text-foreground',
              ],
              activeTab !== item.id && 'text-muted-foreground'
            )}
          >
            <span>{item.label}</span>
            {item.badge && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {activeItem?.content && (
        <div
          role="tabpanel"
          id={`panel-${activeItem.id}`}
          aria-labelledby={activeItem.id}
          className={cn(
            'flex-1',
            orientation === 'horizontal' ? 'mt-6' : 'ml-6'
          )}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
};

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
  Breadcrumb,
  SidebarNav,
  NavTabs,
  type BreadcrumbItem,
  type BreadcrumbProps,
  type SidebarNavItem,
  type SidebarNavProps,
  type NavTabItem,
  type NavTabsProps,
};