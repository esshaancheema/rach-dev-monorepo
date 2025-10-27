import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Button } from '../button';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from '../navigation';
import { Badge } from '../badge';
import { Menu, X, ChevronDown, User, Search, Bell } from 'lucide-react';

const headerVariants = cva(
  'w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
  {
    variants: {
      variant: {
        default: 'border-border',
        transparent: 'border-transparent bg-transparent backdrop-blur-none',
        solid: 'bg-background border-border',
        floating: 'mx-4 mt-4 rounded-lg border bg-background shadow-lg',
      },
      size: {
        sm: 'h-12',
        default: 'h-16',
        lg: 'h-20',
      },
      sticky: {
        true: 'sticky top-0 z-50',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      sticky: true,
    },
  }
);

interface NavigationItem {
  label: string;
  href?: string;
  badge?: string;
  children?: NavigationItem[];
  onClick?: () => void;
}

interface HeaderProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof headerVariants> {
  logo?: React.ReactNode;
  navigation?: NavigationItem[];
  actions?: React.ReactNode;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
  user?: {
    name: string;
    avatar?: string;
    email?: string;
  };
  onUserClick?: () => void;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  (
    {
      className,
      variant,
      size,
      sticky,
      logo,
      navigation = [],
      actions,
      searchPlaceholder = 'Search...',
      onSearch,
      showSearch = false,
      showNotifications = false,
      notificationCount = 0,
      onNotificationClick,
      user,
      onUserClick,
      mobileMenuOpen = false,
      onMobileMenuToggle,
      children,
      ...props
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(mobileMenuOpen);

    const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(searchQuery);
    };

    const handleMobileMenuToggle = () => {
      const newState = !isMobileMenuOpen;
      setIsMobileMenuOpen(newState);
      onMobileMenuToggle?.();
    };

    React.useEffect(() => {
      setIsMobileMenuOpen(mobileMenuOpen);
    }, [mobileMenuOpen]);

    const renderNavigationItem = (item: NavigationItem, isMobile = false) => {
      if (item.children && item.children.length > 0) {
        return (
          <NavigationMenuItem key={item.label}>
            <NavigationMenuTrigger className={cn(isMobile && 'w-full justify-start')}>
              {item.label}
              {item.badge && (
                <Badge variant="secondary" size="sm" className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className={cn('grid gap-3 p-6', isMobile ? 'w-full' : 'w-[400px]')}>
                {item.children.map((child) => (
                  <NavigationMenuLink
                    key={child.label}
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    href={child.href}
                    onClick={child.onClick}
                  >
                    <div className="text-sm font-medium leading-none">{child.label}</div>
                    {child.badge && (
                      <Badge variant="secondary" size="sm" className="mt-1">
                        {child.badge}
                      </Badge>
                    )}
                  </NavigationMenuLink>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        );
      }

      return (
        <NavigationMenuItem key={item.label}>
          <NavigationMenuLink
            className={cn(
              'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
              isMobile && 'w-full justify-start'
            )}
            href={item.href}
            onClick={item.onClick}
          >
            {item.label}
            {item.badge && (
              <Badge variant="secondary" size="sm" className="ml-2">
                {item.badge}
              </Badge>
            )}
          </NavigationMenuLink>
        </NavigationMenuItem>
      );
    };

    return (
      <header
        ref={ref}
        className={cn(headerVariants({ variant, size, sticky }), className)}
        {...props}
      >
        <div className="container flex h-full items-center">
          {/* Logo */}
          {logo && (
            <div className="flex items-center">
              {logo}
            </div>
          )}

          {/* Desktop Navigation */}
          {navigation.length > 0 && (
            <NavigationMenu className="hidden md:flex ml-6">
              <NavigationMenuList>
                {navigation.map((item) => renderNavigationItem(item))}
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          {showSearch && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center mr-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 rounded-md border border-input bg-transparent pl-10 pr-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </form>
          )}

          {/* Notifications */}
          {showNotifications && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex relative mr-2"
              onClick={onNotificationClick}
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  size="sm"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </Button>
          )}

          {/* User Menu */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center gap-2 mr-2"
              onClick={onUserClick}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span className="text-sm">{user.name}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          )}

          {/* Custom Actions */}
          {actions && (
            <div className="hidden md:flex items-center gap-2">
              {actions}
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={handleMobileMenuToggle}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container py-4">
              {/* Mobile Search */}
              {showSearch && (
                <form onSubmit={handleSearchSubmit} className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-md border border-input bg-transparent pl-10 pr-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </form>
              )}

              {/* Mobile Navigation */}
              {navigation.length > 0 && (
                <NavigationMenu className="mb-4" orientation="vertical">
                  <NavigationMenuList className="flex-col items-start space-x-0 space-y-2">
                    {navigation.map((item) => renderNavigationItem(item, true))}
                  </NavigationMenuList>
                </NavigationMenu>
              )}

              {/* Mobile User & Actions */}
              <div className="flex flex-col gap-2">
                {showNotifications && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={onNotificationClick}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                    {notificationCount > 0 && (
                      <Badge variant="destructive" size="sm" className="ml-auto">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </Badge>
                    )}
                  </Button>
                )}

                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={onUserClick}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-4 w-4 rounded-full mr-2"
                      />
                    ) : (
                      <User className="h-4 w-4 mr-2" />
                    )}
                    {user.name}
                  </Button>
                )}

                {actions && (
                  <div className="flex flex-col gap-2 mt-2">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {children}
      </header>
    );
  }
);
Header.displayName = 'Header';

// Pre-built header variants
const SimpleHeader: React.FC<{
  logo: React.ReactNode;
  navigation?: NavigationItem[];
  className?: string;
}> = ({ logo, navigation, className }) => (
  <Header variant="default" logo={logo} navigation={navigation} className={className} />
);

const TransparentHeader: React.FC<{
  logo: React.ReactNode;
  navigation?: NavigationItem[];
  className?: string;
}> = ({ logo, navigation, className }) => (
  <Header variant="transparent" logo={logo} navigation={navigation} className={className} />
);

const FloatingHeader: React.FC<{
  logo: React.ReactNode;
  navigation?: NavigationItem[];
  className?: string;
}> = ({ logo, navigation, className }) => (
  <Header variant="floating" logo={logo} navigation={navigation} className={className} />
);

export {
  Header,
  SimpleHeader,
  TransparentHeader,
  FloatingHeader,
  headerVariants,
  type HeaderProps,
  type NavigationItem,
};