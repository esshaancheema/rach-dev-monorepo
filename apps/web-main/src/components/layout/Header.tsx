'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuthRedirect } from '@/components/navigation/AuthRedirectHandler';
import MegaMenu from '@/components/navigation/MegaMenu';
import SearchBar from '@/components/navigation/SearchBar';
import { mainNavigation, servicesMenuData, solutionsMenuData, resourcesMenuData } from '@/data/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { handleSignIn, handleRegister, isDashboardAuthEnabled, getSignInUrl } = useAuthRedirect();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
          >
            {/* Desktop Logo - Full text wordmark */}
            <Image
              src="/images/logo/zoptal-text.svg"
              alt="Zoptal"
              width={160}
              height={40}
              className="hidden sm:block h-8 w-auto max-w-[160px]"
              style={{ height: 'auto' }}
              priority
            />
            {/* Mobile Logo - Icon only */}
            <Image
              src="/images/logo/zoptal-icon.svg"
              alt="Zoptal"
              width={32}
              height={32}
              className="sm:hidden h-8 w-8 flex-shrink-0"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8 relative">
            {mainNavigation.map((item) => (
              <div key={item.name} className="relative">
                {item.hasDropdown ? (
                  <>
                    <button
                      className={`flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors ${
                        isActive(item.href) ? 'text-primary-600 font-medium' : ''
                      }`}
                      onMouseEnter={() => setActiveDropdown(item.name.toLowerCase())}
                      onMouseLeave={() => {
                        // Small delay to allow moving to mega menu
                        setTimeout(() => {
                          setActiveDropdown(null);
                        }, 300);
                      }}
                    >
                      <span>{item.name}</span>
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                    
                    {/* Mega Menu */}
                    {item.megaMenu && (
                      <div
                        className="absolute left-1/2 transform -translate-x-1/2"
                        onMouseEnter={() => setActiveDropdown(item.name.toLowerCase())}
                        onMouseLeave={() => {
                          setTimeout(() => {
                            setActiveDropdown(null);
                          }, 100);
                        }}
                      >
                        <MegaMenu
                          sections={item.megaMenu}
                          isOpen={activeDropdown === item.name.toLowerCase()}
                          onClose={() => setActiveDropdown(null)}
                          layout={item.name === 'Solutions' ? 'wide' : 'default'}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <Link 
                    href={item.href} 
                    className={`text-gray-700 hover:text-primary-600 transition-colors ${
                      isActive(item.href) ? 'text-primary-600 font-medium' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            {/* Search Bar */}
            <SearchBar className="mx-4" />

            {/* Contact */}
            <Link 
              href="/contact" 
              className={`text-gray-700 hover:text-primary-600 transition-colors ${
                isActive('/contact') ? 'text-primary-600 font-medium' : ''
              }`}
            >
              Contact
            </Link>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4 ml-8">
              {isDashboardAuthEnabled ? (
                <>
                  <button 
                    onClick={() => handleSignIn()}
                    className="text-gray-700 hover:text-primary-600 transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => handleRegister()}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium cursor-pointer"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Search and Menu */}
          <div className="lg:hidden flex items-center space-x-2">
            <SearchBar />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {/* Mobile Navigation Items */}
              {mainNavigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  
                  {/* Mobile Submenu Items */}
                  {item.megaMenu && (
                    <div className="pl-4 space-y-1">
                      {item.megaMenu.flatMap(section => 
                        section.items.map(subItem => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile Contact */}
              <Link
                href="/contact"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/contact')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Mobile CTA Buttons */}
              <div className="mt-4 flex flex-col space-y-2 px-3">
                {isDashboardAuthEnabled ? (
                  <>
                    <button 
                      onClick={() => {
                        handleSignIn();
                        setIsMenuOpen(false);
                      }}
                      className="text-gray-700 hover:text-primary-600 transition-colors cursor-pointer text-left py-2"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => {
                        handleRegister();
                        setIsMenuOpen(false);
                      }}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium cursor-pointer text-center"
                    >
                      Get Started
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="text-gray-700 hover:text-primary-600 transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/register" 
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium text-center block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}