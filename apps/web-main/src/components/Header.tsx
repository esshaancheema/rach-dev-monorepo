'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuthRedirect } from '@/components/navigation/AuthRedirectHandler';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { handleSignIn, handleRegister, isDashboardAuthEnabled, getSignInUrl } = useAuthRedirect();

  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gradient">
            Zoptal
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
              Documentation
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">
              Blog
            </Link>
            <div className="flex items-center space-x-4">
              {isDashboardAuthEnabled ? (
                <>
                  <button 
                    onClick={() => handleSignIn()}
                    className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => handleRegister()}
                    className="btn-primary cursor-pointer"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">
                Documentation
              </Link>
              <Link href="/blog" className="text-gray-600 hover:text-gray-900">
                Blog
              </Link>
              <div className="pt-4 border-t space-y-4">
                {isDashboardAuthEnabled ? (
                  <>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignIn();
                      }}
                      className="block w-full text-left text-gray-600 hover:text-gray-900 cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleRegister();
                      }}
                      className="btn-primary inline-block cursor-pointer"
                    >
                      Get Started
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block text-gray-600 hover:text-gray-900">
                      Sign In
                    </Link>
                    <Link href="/register" className="btn-primary inline-block">
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