'use client';

import { 
  HomeIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  CubeIcon,
  BookOpenIcon,
  KeyIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  {
    name: 'Overview',
    href: '/docs',
    icon: HomeIcon,
  },
  {
    name: 'Quick Start',
    href: '/docs/quickstart',
    icon: DocumentTextIcon,
  },
  {
    name: 'Authentication',
    href: '/docs/authentication',
    icon: KeyIcon,
  },
  {
    name: 'API Reference',
    icon: CodeBracketIcon,
    children: [
      { name: 'Code Generation', href: '/docs/api/code-generation' },
      { name: 'Code Optimization', href: '/docs/api/optimization' },
      { name: 'Projects', href: '/docs/api/projects' },
      { name: 'Analytics', href: '/docs/api/analytics' },
    ],
  },
  {
    name: 'SDKs & Libraries',
    icon: CubeIcon,
    children: [
      { name: 'JavaScript/Node.js', href: '/docs/sdks/javascript' },
      { name: 'Python', href: '/docs/sdks/python' },
      { name: 'Go', href: '/docs/sdks/go' },
      { name: 'Rust', href: '/docs/sdks/rust' },
      { name: 'PHP', href: '/docs/sdks/php' },
    ],
  },
  {
    name: 'Guides',
    icon: BookOpenIcon,
    children: [
      { name: 'Building Your First App', href: '/docs/guides/first-app' },
      { name: 'Best Practices', href: '/docs/guides/best-practices' },
      { name: 'Error Handling', href: '/docs/guides/error-handling' },
      { name: 'Rate Limiting', href: '/docs/guides/rate-limiting' },
    ],
  },
];

export default function DocsNavigation() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['API Reference']);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (href: string) => {
    return pathname === href;
  };

  const isParentActive = (children: { href: string }[]) => {
    return children.some(child => pathname === child.href);
  };

  return (
    <nav className="docs-sidebar h-screen sticky top-16 overflow-y-auto">
      <div className="p-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isExpanded = expandedItems.includes(item.name);
            const hasChildren = !!item.children;
            const isActive = item.href ? isItemActive(item.href) : isParentActive(item.children || []);

            return (
              <div key={item.name}>
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className={`docs-nav-item w-full text-left ${
                      isActive ? 'docs-nav-item-active' : 'docs-nav-item-inactive'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                        {item.name}
                      </div>
                      {isExpanded ? (
                        <ChevronDownIcon className="w-4 h-4" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ) : (
                  <Link
                    href={item.href!}
                    className={`docs-nav-item ${
                      isActive ? 'docs-nav-item-active' : 'docs-nav-item-inactive'
                    }`}
                  >
                    <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                    {item.name}
                  </Link>
                )}

                {/* Submenu */}
                {hasChildren && isExpanded && (
                  <div className="ml-7 mt-1 space-y-1">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`docs-nav-item text-sm ${
                          isItemActive(child.href) 
                            ? 'docs-nav-item-active' 
                            : 'docs-nav-item-inactive'
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="space-y-2">
            <Link 
              href="/support" 
              className="docs-nav-item docs-nav-item-inactive text-sm"
            >
              Support
            </Link>
            <Link 
              href="/status" 
              className="docs-nav-item docs-nav-item-inactive text-sm"
            >
              API Status
            </Link>
            <a 
              href="https://github.com/zoptal/sdk" 
              target="_blank"
              className="docs-nav-item docs-nav-item-inactive text-sm"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}