'use client';

import { 
  MagnifyingGlassIcon, 
  Bars3Icon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';

export default function DocsHeader() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <Link href="/docs" className="text-xl font-bold text-gradient">
            Zoptal Docs
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
              Documentation
            </Link>
            <Link href="/docs/api" className="text-gray-600 hover:text-gray-900 transition-colors">
              API Reference
            </Link>
            <Link href="/docs/guides" className="text-gray-600 hover:text-gray-900 transition-colors">
              Guides
            </Link>
            <Link href="/docs/sdks" className="text-gray-600 hover:text-gray-900 transition-colors">
              SDKs
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-8">
          <div className={`relative transition-all duration-200 ${
            isSearchFocused ? 'ring-2 ring-primary-500' : ''
          }`}>
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-transparent"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <kbd className="px-2 py-1 text-xs text-gray-500 bg-gray-100 border border-gray-300 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* GitHub Link */}
          <Link 
            href="https://github.com/zoptal/sdk" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
            target="_blank"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
          </Link>

          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <UserCircleIcon className="w-6 h-6 text-gray-600" />
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
          </div>

          {/* Mobile Menu */}
          <button className="md:hidden p-2">
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}