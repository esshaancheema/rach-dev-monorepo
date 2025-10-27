'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MAIN_NAVIGATION, CTA_NAVIGATION, type NavigationItem } from '@/lib/constants/navigation';
import { cn } from '@/lib/utils';

interface NavigationProps {
  className?: string;
}

interface MegaMenuProps {
  item: NavigationItem;
  isOpen: boolean;
  onClose: () => void;
}

function MegaMenu({ item, isOpen, onClose }: MegaMenuProps) {
  if (!item.children || item.children.length === 0) return null;

  return (
    <div
      className={cn(
        'absolute left-0 top-full w-screen bg-white shadow-xl border-t transition-all duration-200 z-50',
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      )}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-8">
          {item.children.map((section) => (
            <div key={section.label}>
              <div className="flex items-center gap-2 mb-4">
                <Link
                  href={section.href}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  onClick={onClose}
                >
                  {section.label}
                </Link>
                {section.badge && (
                  <Badge 
                    variant={section.badge === 'New' ? 'success' : 'primary'} 
                    size="sm"
                  >
                    {section.badge}
                  </Badge>
                )}
              </div>
              {section.description && (
                <p className="text-sm text-gray-600 mb-4">{section.description}</p>
              )}
              {section.children && (
                <ul className="space-y-2">
                  {section.children.map((child) => (
                    <li key={child.label}>
                      <Link
                        href={child.href}
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors block py-1"
                        onClick={onClose}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        
        {/* Featured items for Resources menu */}
        {item.label === 'Resources' && (
          <div className="mt-8 pt-8 border-t">
            <div className="grid grid-cols-2 gap-6">
              {item.children
                .filter(child => child.featured)
                .map((featured) => (
                  <Link
                    key={featured.label}
                    href={featured.href}
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                    onClick={onClose}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {featured.label}
                      </h3>
                      <p className="text-sm text-gray-600">{featured.description}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface DropdownMenuProps {
  item: NavigationItem;
  isOpen: boolean;
  onClose: () => void;
}

function DropdownMenu({ item, isOpen, onClose }: DropdownMenuProps) {
  if (!item.children || item.children.length === 0) return null;

  return (
    <div
      className={cn(
        'absolute left-0 top-full w-64 bg-white shadow-lg border rounded-lg transition-all duration-200 z-50',
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      )}
    >
      <div className="py-2">
        {item.children.map((child) => (
          <Link
            key={child.label}
            href={child.href}
            className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            onClick={onClose}
          >
            <span>{child.label}</span>
            {child.badge && (
              <Badge 
                variant={child.badge === 'New' ? 'success' : 'primary'} 
                size="sm"
              >
                {child.badge}
              </Badge>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Navigation({ className }: NavigationProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();

  const handleMenuToggle = (label: string) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  const handleMenuClose = () => {
    setOpenMenu(null);
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const shouldUseMegaMenu = (item: NavigationItem) => {
    return ['Solutions', 'Services', 'Resources'].includes(item.label);
  };

  return (
    <nav className={cn('relative', className)}>
      <div className="flex items-center space-x-8">
        {/* Main Navigation Items */}
        <div className="hidden lg:flex items-center space-x-8">
          {MAIN_NAVIGATION.map((item) => (
            <div key={item.label} className="relative">
              {item.children ? (
                <button
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md',
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  )}
                  onClick={() => handleMenuToggle(item.label)}
                  onMouseEnter={() => setOpenMenu(item.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  {item.label}
                  <svg
                    className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      openMenu === item.label ? 'rotate-180' : ''
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium transition-colors rounded-md',
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  {item.label}
                </Link>
              )}

              {/* Mega Menu or Dropdown */}
              {item.children && (
                <div
                  onMouseEnter={() => setOpenMenu(item.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  {shouldUseMegaMenu(item) ? (
                    <MegaMenu
                      item={item}
                      isOpen={openMenu === item.label}
                      onClose={handleMenuClose}
                    />
                  ) : (
                    <DropdownMenu
                      item={item}
                      isOpen={openMenu === item.label}
                      onClose={handleMenuClose}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center space-x-3">
          {CTA_NAVIGATION.map((cta) => (
            <Link key={cta.label} href={cta.href}>
              <Button 
                variant={cta.variant} 
                size="sm"
                className={cn(
                  cta.variant === 'primary' && 'shadow-sm hover:shadow-md'
                )}
              >
                {cta.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Background overlay for mega menus */}
      {openMenu && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={handleMenuClose}
        />
      )}
    </nav>
  );
}

// Utility component for highlighting current section
export function NavigationIndicator({ currentPath }: { currentPath: string }) {
  const getActiveSection = () => {
    for (const item of MAIN_NAVIGATION) {
      if (currentPath.startsWith(item.href) && item.href !== '/') {
        return item.label;
      }
    }
    return null;
  };

  const activeSection = getActiveSection();

  if (!activeSection) return null;

  return (
    <div className="bg-blue-50 border-b">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">You're in:</span>
          <span className="font-medium text-blue-600">{activeSection}</span>
        </div>
      </div>
    </div>
  );
}