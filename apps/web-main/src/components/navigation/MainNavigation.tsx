'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { generateHreflangLinks, SUPPORTED_LOCALES } from '@/lib/seo/hreflang';

interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
  description?: string;
  featured?: boolean;
}

interface MainNavigationProps {
  className?: string;
  locale?: string;
  baseUrl?: string;
}

const navigationItems: NavItem[] = [
  {
    label: 'Services',
    children: [
      {
        label: 'Software Development',
        href: '/services/software-development',
        description: 'Custom software solutions tailored to your business needs',
        featured: true,
      },
      {
        label: 'AI Development',
        href: '/services/ai-development',
        description: 'AI-powered applications and machine learning solutions',
        featured: true,
      },
      {
        label: 'Web Development',
        href: '/services/web-development',
        description: 'Modern web applications and responsive websites',
      },
      {
        label: 'Mobile Apps',
        href: '/services/mobile-development',
        description: 'Native and cross-platform mobile applications',
      },
      {
        label: 'DevOps & Cloud',
        href: '/services/devops-cloud',
        description: 'Cloud infrastructure and deployment automation',
      },
      {
        label: 'Quality Assurance',
        href: '/services/quality-assurance',
        description: 'Comprehensive testing and QA services',
      },
    ],
  },
  {
    label: 'Solutions',
    children: [
      {
        label: 'Enterprise Solutions',
        href: '/solutions/enterprise',
        description: 'Scalable solutions for large organizations',
        featured: true,
      },
      {
        label: 'Startup Solutions',
        href: '/solutions/startup',
        description: 'Cost-effective solutions for growing businesses',
      },
      {
        label: 'E-commerce',
        href: '/solutions/ecommerce',
        description: 'Complete e-commerce platforms and integrations',
      },
      {
        label: 'Healthcare',
        href: '/solutions/healthcare',
        description: 'HIPAA-compliant healthcare technology solutions',
      },
      {
        label: 'FinTech',
        href: '/solutions/fintech',
        description: 'Secure financial technology applications',
      },
    ],
  },
  {
    label: 'AI Agents',
    children: [
      {
        label: 'AI Agent Development',
        href: '/ai-agents',
        description: 'Custom AI agents for business automation',
        featured: true,
      },
      {
        label: 'AI Agent Consulting',
        href: '/ai-agents/consulting',
        description: 'Strategic AI implementation consulting',
      },
      {
        label: 'AI Agent Integration',
        href: '/ai-agents/integration',
        description: 'Seamless AI agent integration services',
      },
    ],
  },
  {
    label: 'Company',
    children: [
      {
        label: 'About Us',
        href: '/about',
        description: 'Learn about our mission and team',
      },
      {
        label: 'Careers',
        href: '/careers',
        description: 'Join our growing team of experts',
      },
      {
        label: 'Blog',
        href: '/blog',
        description: 'Latest insights and industry trends',
      },
      {
        label: 'Case Studies',
        href: '/case-studies',
        description: 'Success stories from our clients',
      },
    ],
  },
  {
    label: 'Pricing',
    href: '/pricing',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

export default function MainNavigation({ 
  className, 
  locale = 'en',
  baseUrl = 'https://zoptal.com'
}: MainNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Handle dropdown hover
  const handleDropdownEnter = (label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // Check if link is active
  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Current locale info
  const currentLocale = SUPPORTED_LOCALES.find(l => l.code === locale) || SUPPORTED_LOCALES[0];
  const hreflangLinks = generateHreflangLinks(pathname, locale, baseUrl);

  return (
    <nav className={cn('bg-white shadow-sm border-b border-gray-200', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Z</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Zoptal</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navigationItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && handleDropdownEnter(item.label)}
                onMouseLeave={handleDropdownLeave}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md',
                      isActiveLink(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md',
                      activeDropdown === item.label
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    )}
                  >
                    {item.label}
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </button>
                )}

                {/* Dropdown Menu */}
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                      <div className="grid gap-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href!}
                            className={cn(
                              'block p-3 rounded-lg transition-colors duration-200',
                              isActiveLink(child.href!)
                                ? 'bg-blue-50 text-blue-600'
                                : 'hover:bg-gray-50',
                              child.featured && 'ring-1 ring-blue-200'
                            )}
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-900">
                                  {child.label}
                                  {child.featured && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      Popular
                                    </span>
                                  )}
                                </h3>
                                {child.description && (
                                  <p className="mt-1 text-xs text-gray-500">
                                    {child.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                <GlobeAltIcon className="h-4 w-4 mr-1" />
                {currentLocale.code.toUpperCase()}
                <ChevronDownIcon className="ml-1 h-3 w-3" />
              </button>

              {languageDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    {SUPPORTED_LOCALES.map((localeOption) => (
                      <Link
                        key={localeOption.code}
                        href={`/${localeOption.code === 'en' ? '' : localeOption.code}${pathname}`}
                        className={cn(
                          'block px-4 py-2 text-sm transition-colors duration-200',
                          localeOption.code === locale
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                        onClick={() => setLanguageDropdownOpen(false)}
                      >
                        <span className="mr-2">{localeOption.name}</span>
                        <span className="text-xs text-gray-500">
                          ({localeOption.code.toUpperCase()})
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <a 
                href="tel:+1-555-0123" 
                className="flex items-center hover:text-blue-600 transition-colors duration-200"
              >
                <PhoneIcon className="h-4 w-4 mr-1" />
                <span className="hidden xl:inline">+1 (555) 012-3456</span>
              </a>
              <a 
                href="mailto:contact@zoptal.com" 
                className="flex items-center hover:text-blue-600 transition-colors duration-200"
              >
                <EnvelopeIcon className="h-4 w-4 mr-1" />
                <span className="hidden xl:inline">contact@zoptal.com</span>
              </a>
            </div>

            {/* CTA Button */}
            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {navigationItems.map((item) => (
              <div key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200',
                      isActiveLink(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => setActiveDropdown(
                        activeDropdown === item.label ? null : item.label
                      )}
                      className="flex items-center justify-between w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                      {item.label}
                      <ChevronDownIcon 
                        className={cn(
                          'h-5 w-5 transition-transform duration-200',
                          activeDropdown === item.label && 'rotate-180'
                        )} 
                      />
                    </button>
                    
                    {activeDropdown === item.label && item.children && (
                      <div className="mt-2 ml-4 space-y-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href!}
                            className={cn(
                              'block px-3 py-2 text-sm rounded-md transition-colors duration-200',
                              isActiveLink(child.href!)
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {child.label}
                            {child.featured && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Popular
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile Language Selector */}
            <div className="pt-4 border-t border-gray-200">
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-900">Language</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_LOCALES.map((localeOption) => (
                  <Link
                    key={localeOption.code}
                    href={`/${localeOption.code === 'en' ? '' : localeOption.code}${pathname}`}
                    className={cn(
                      'block px-3 py-2 text-sm rounded-md transition-colors duration-200',
                      localeOption.code === locale
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {localeOption.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Contact Info */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <a 
                href="tel:+1-555-0123" 
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <PhoneIcon className="h-4 w-4 mr-2" />
                +1 (555) 012-3456
              </a>
              <a 
                href="mailto:contact@zoptal.com" 
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                contact@zoptal.com
              </a>
              <Link
                href="/contact"
                className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}