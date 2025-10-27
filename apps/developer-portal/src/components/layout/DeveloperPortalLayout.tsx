'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  CubeIcon,
  BookOpenIcon,
  UserGroupIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { SearchModal } from '../search/SearchModal';
import { ThemeToggle } from '../ui/ThemeToggle';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Documentation',
    href: '/docs',
    icon: DocumentTextIcon,
    children: [
      { name: 'Getting Started', href: '/docs/getting-started', icon: BookOpenIcon },
      { name: 'Authentication', href: '/docs/authentication', icon: CodeBracketIcon },
      { name: 'Rate Limiting', href: '/docs/rate-limiting', icon: CodeBracketIcon },
      { name: 'Webhooks', href: '/docs/webhooks', icon: CodeBracketIcon },
      { name: 'Errors', href: '/docs/errors', icon: CodeBracketIcon },
    ]
  },
  {
    name: 'API Reference',
    href: '/docs/api',
    icon: CodeBracketIcon,
    children: [
      { name: 'Authentication API', href: '/docs/api/authentication', icon: CodeBracketIcon },
      { name: 'Users API', href: '/docs/api/users', icon: CodeBracketIcon },
      { name: 'Projects API', href: '/docs/api/projects', icon: CodeBracketIcon },
      { name: 'Files API', href: '/docs/api/files', icon: CodeBracketIcon },
      { name: 'AI Services API', href: '/docs/api/ai', icon: CodeBracketIcon },
      { name: 'Billing API', href: '/docs/api/billing', icon: CodeBracketIcon },
      { name: 'Notifications API', href: '/docs/api/notifications', icon: CodeBracketIcon },
    ]
  },
  {
    name: 'API Explorer',
    href: '/api-explorer',
    icon: CubeIcon,
  },
  {
    name: 'SDKs & Libraries',
    href: '/docs/sdks',
    icon: CubeIcon,
    children: [
      { name: 'JavaScript/TypeScript', href: '/docs/sdks/javascript', icon: CodeBracketIcon },
      { name: 'Python', href: '/docs/sdks/python', icon: CodeBracketIcon },
      { name: 'Go', href: '/docs/sdks/go', icon: CodeBracketIcon },
      { name: 'Java', href: '/docs/sdks/java', icon: CodeBracketIcon },
      { name: 'PHP', href: '/docs/sdks/php', icon: CodeBracketIcon },
      { name: 'Ruby', href: '/docs/sdks/ruby', icon: CodeBracketIcon },
    ]
  },
  {
    name: 'Guides & Examples',
    href: '/docs/guides',
    icon: BookOpenIcon,
    children: [
      { name: 'Quick Start', href: '/docs/guides/quickstart', icon: BookOpenIcon },
      { name: 'Building a Chat App', href: '/docs/guides/chat-app', icon: BookOpenIcon },
      { name: 'File Management', href: '/docs/guides/file-management', icon: BookOpenIcon },
      { name: 'AI Integration', href: '/docs/guides/ai-integration', icon: BookOpenIcon },
      { name: 'Webhooks Setup', href: '/docs/guides/webhooks', icon: BookOpenIcon },
    ]
  },
  {
    name: 'Community',
    href: '/community',
    icon: UserGroupIcon,
  },
];

interface DeveloperPortalLayoutProps {
  children: React.ReactNode;
}

export const DeveloperPortalLayout: React.FC<DeveloperPortalLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-xl lg:hidden"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Z</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    Zoptal Docs
                  </span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <nav className="mt-8 px-4 space-y-1 max-h-screen overflow-y-auto">
                {navigation.map((item) => (
                  <NavItem
                    key={item.name}
                    item={item}
                    isActive={isActiveLink(item.href)}
                    depth={0}
                  />
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Zoptal Docs
              </span>
            </Link>
          </div>
          <nav className="mt-8 px-4 space-y-1 flex-1">
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={isActiveLink(item.href)}
                depth={0}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors w-64"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span>Search documentation...</span>
                <div className="ml-auto flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                    ⌘
                  </kbd>
                  <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                    K
                  </kbd>
                </div>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/api-explorer"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Try API
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Search modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
};

interface NavItemProps {
  item: NavigationItem;
  isActive: boolean;
  depth: number;
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive, depth }) => {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const hasChildren = item.children && item.children.length > 0;

  React.useEffect(() => {
    if (isActive && hasChildren) {
      setIsExpanded(true);
    }
  }, [isActive, hasChildren]);

  return (
    <div>
      <Link
        href={item.href}
        className={`
          group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
          ${depth > 0 ? 'ml-6 pl-6 border-l border-gray-200 dark:border-gray-700' : ''}
          ${
            isActive
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
          }
        `}
        onClick={hasChildren ? (e) => {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        } : undefined}
      >
        <item.icon className={`
          mr-3 flex-shrink-0 h-5 w-5
          ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
        `} />
        <span className="flex-1">{item.name}</span>
        {hasChildren && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </motion.div>
        )}
      </Link>
      
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-1">
              {item.children?.map((child) => (
                <NavItem
                  key={child.name}
                  item={child}
                  isActive={isActive && child.href === usePathname()}
                  depth={depth + 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};