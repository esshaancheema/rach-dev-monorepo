'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOBILE_NAVIGATION, CTA_NAVIGATION, type NavigationItem } from '@/lib/constants/navigation';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MobileMenuItemProps {
  item: NavigationItem;
  onClose: () => void;
  level?: number;
}

function MobileMenuItem({ item, onClose, level = 0 }: MobileMenuItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname.startsWith(item.href) && item.href !== '/';
  
  const handleItemClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      onClose();
    }
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div
        className={cn(
          'flex items-center justify-between py-4 px-4 transition-colors',
          level > 0 && 'pl-8 py-3 text-sm',
          isActive && 'bg-blue-50 text-blue-600'
        )}
      >
        {hasChildren ? (
          <button
            onClick={handleItemClick}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-3">
              <span className={cn('font-medium', level > 0 && 'font-normal')}>
                {item.label}
              </span>
              {item.badge && (
                <Badge 
                  variant={item.badge === 'New' ? 'success' : 'primary'} 
                  size="sm"
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            <svg
              className={cn(
                'w-5 h-5 text-gray-400 transition-transform duration-200',
                isExpanded ? 'rotate-180' : ''
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
            onClick={onClose}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-3">
              <span className={cn('font-medium', level > 0 && 'font-normal')}>
                {item.label}
              </span>
              {item.badge && (
                <Badge 
                  variant={item.badge === 'New' ? 'success' : 'primary'} 
                  size="sm"
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            {item.external && (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            )}
          </Link>
        )}
      </div>
      
      {/* Submenu */}
      {hasChildren && (
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out bg-gray-50',
            isExpanded ? 'max-h-96' : 'max-h-0'
          )}
        >
          {item.children?.map((child) => (
            <MobileMenuItem
              key={child.label}
              item={child}
              onClose={onClose}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileMenuOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <div
      className={cn(
        'fixed inset-0 bg-black/50 transition-opacity duration-300 z-40 lg:hidden',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={onClose}
    />
  );
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <>
      <MobileMenuOverlay isOpen={isOpen} onClose={onClose} />
      
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link href="/" onClick={onClose}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Zoptal</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            {MOBILE_NAVIGATION.map((item) => (
              <MobileMenuItem
                key={item.label}
                item={item}
                onClose={onClose}
              />
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Ready to get started?
          </div>
          {CTA_NAVIGATION.map((cta) => (
            <Link key={cta.label} href={cta.href} onClick={onClose}>
              <Button 
                variant={cta.variant} 
                size="sm" 
                className="w-full justify-center"
              >
                {cta.label}
              </Button>
            </Link>
          ))}
          
          {/* Quick Links */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link
                href="/resources/help-center"
                onClick={onClose}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Help</span>
              </Link>
              <Link
                href="/contact"
                onClick={onClose}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Contact</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Mobile menu button for the header
export function MobileMenuButton({ 
  onClick, 
  isOpen 
}: { 
  onClick: () => void; 
  isOpen: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      <div className="w-6 h-6 relative">
        <span
          className={cn(
            'absolute h-0.5 w-6 bg-gray-600 transform transition-all duration-300 ease-in-out',
            isOpen ? 'rotate-45 top-3' : 'top-1'
          )}
        />
        <span
          className={cn(
            'absolute h-0.5 w-6 bg-gray-600 transform transition-all duration-300 ease-in-out top-3',
            isOpen ? 'opacity-0' : 'opacity-100'
          )}
        />
        <span
          className={cn(
            'absolute h-0.5 w-6 bg-gray-600 transform transition-all duration-300 ease-in-out',
            isOpen ? '-rotate-45 top-3' : 'top-5'
          )}
        />
      </div>
    </button>
  );
}

// Hook for managing mobile menu state
export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  
  return {
    isOpen,
    toggle,
    open,
    close,
  };
}