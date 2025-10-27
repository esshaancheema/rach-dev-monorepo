'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamically import Lucide icons to prevent hydration mismatch
const TwitterIcon = dynamic(() => import('lucide-react').then(mod => ({ default: mod.TwitterIcon })), { ssr: false });
const LinkedinIcon = dynamic(() => import('lucide-react').then(mod => ({ default: mod.LinkedinIcon })), { ssr: false });
const GithubIcon = dynamic(() => import('lucide-react').then(mod => ({ default: mod.GithubIcon })), { ssr: false });
const FacebookIcon = dynamic(() => import('lucide-react').then(mod => ({ default: mod.FacebookIcon })), { ssr: false });
const InstagramIcon = dynamic(() => import('lucide-react').then(mod => ({ default: mod.InstagramIcon })), { ssr: false });
import { FooterNewsletterSignup } from '@/components/newsletter/NewsletterSignup';
import { cn } from '@/lib/utils';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  className?: string;
  theme?: 'light' | 'dark';
  showNewsletter?: boolean;
  showSocial?: boolean;
  companyInfo?: {
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
  };
}

const footerSections: FooterSection[] = [
  {
    title: 'Services',
    links: [
      { label: 'Software Development', href: '/services/software-development' },
      { label: 'AI Development', href: '/services/ai-development' },
      { label: 'Web Development', href: '/services/web-development' },
      { label: 'Mobile Development', href: '/services/mobile-development' },
      { label: 'DevOps & Cloud', href: '/services/devops-cloud' },
      { label: 'Quality Assurance', href: '/services/quality-assurance' },
      { label: 'UI/UX Design', href: '/services/ui-ux-design' },
      { label: 'Consulting', href: '/services/consulting' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Enterprise Solutions', href: '/solutions/enterprise' },
      { label: 'Startup Solutions', href: '/solutions/startup' },
      { label: 'E-commerce', href: '/solutions/ecommerce' },
      { label: 'Healthcare', href: '/solutions/healthcare' },
      { label: 'FinTech', href: '/solutions/fintech' },
      { label: 'Education', href: '/solutions/education' },
      { label: 'Real Estate', href: '/solutions/real-estate' },
      { label: 'Non-Profit', href: '/solutions/non-profit' },
    ],
  },
  {
    title: 'AI Agents',
    links: [
      { label: 'AI Agent Development', href: '/ai-agents' },
      { label: 'Custom AI Agents', href: '/ai-agents/custom' },
      { label: 'AI Agent Consulting', href: '/ai-agents/consulting' },
      { label: 'AI Agent Integration', href: '/ai-agents/integration' },
      { label: 'AI Agent Maintenance', href: '/ai-agents/maintenance' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Team', href: '/about/team' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Partners', href: '/partners' },
      { label: 'Investors', href: '/investors' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Whitepapers', href: '/resources/whitepapers' },
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/docs/api' },
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Support', href: '/support' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Cookie Policy', href: '/legal/cookies' },
      { label: 'Security', href: '/legal/security' },
      { label: 'Compliance', href: '/legal/compliance' },
      { label: 'GDPR', href: '/legal/gdpr' },
    ],
  },
];

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/zoptal',
    icon: TwitterIcon,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/zoptal',
    icon: LinkedinIcon,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/zoptal',
    icon: GithubIcon,
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/zoptal',
    icon: FacebookIcon,
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/zoptal',
    icon: InstagramIcon,
  },
];

const defaultCompanyInfo = {
  name: 'Zoptal',
  description: 'Leading software development company specializing in AI-powered solutions, custom software development, and digital transformation services.',
  address: '123 Tech Street, Innovation District, San Francisco, CA 94105',
  phone: '+1 (555) 012-3456',
  email: 'contact@zoptal.com',
};

export default function Footer({
  className,
  theme = 'dark',
  showNewsletter = true,
  showSocial = true,
  companyInfo = defaultCompanyInfo,
}: FooterProps) {
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const themeClasses = {
    light: {
      background: 'bg-gray-50',
      text: 'text-gray-900',
      textMuted: 'text-gray-600',
      border: 'border-gray-200',
      link: 'text-gray-600 hover:text-blue-600',
      linkActive: 'text-blue-600',
    },
    dark: {
      background: 'bg-gray-900',
      text: 'text-white',
      textMuted: 'text-gray-300',
      border: 'border-gray-700',
      link: 'text-gray-300 hover:text-white',
      linkActive: 'text-white',
    },
  };

  return (
    <footer className={cn(themeClasses[theme].background, className)}>
      {/* Newsletter Section */}
      {showNewsletter && (
        <div className={cn('border-b', themeClasses[theme].border)}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="lg:col-span-1">
                <h3 className={cn('text-2xl font-bold mb-4', themeClasses[theme].text)}>
                  Stay Updated with Zoptal
                </h3>
                <p className={cn('text-lg mb-6 lg:mb-0', themeClasses[theme].textMuted)}>
                  Get the latest insights on AI, software development, and digital transformation delivered to your inbox weekly.
                </p>
              </div>
              <div className="lg:col-span-1">
                <FooterNewsletterSignup />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {footerSections.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className={cn('text-sm font-semibold uppercase tracking-wider mb-4', themeClasses[theme].text)}>
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'text-sm transition-colors duration-200',
                          isActiveLink(link.href) 
                            ? themeClasses[theme].linkActive 
                            : themeClasses[theme].link
                        )}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className={cn(
                          'text-sm transition-colors duration-200',
                          isActiveLink(link.href) 
                            ? themeClasses[theme].linkActive 
                            : themeClasses[theme].link
                        )}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Company Info Section */}
        <div className={cn('mt-12 pt-8 border-t', themeClasses[theme].border)}>
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">Z</span>
                </div>
                <span className={cn('text-2xl font-bold', themeClasses[theme].text)}>
                  {companyInfo.name}
                </span>
              </div>
              <p className={cn('text-sm mb-6 max-w-md', themeClasses[theme].textMuted)}>
                {companyInfo.description}
              </p>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPinIcon className={cn('h-5 w-5 mt-0.5 mr-3 flex-shrink-0', themeClasses[theme].textMuted)} />
                  <span className={cn('text-sm', themeClasses[theme].textMuted)}>
                    {companyInfo.address}
                  </span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className={cn('h-5 w-5 mr-3', themeClasses[theme].textMuted)} />
                  <a 
                    href={`tel:${companyInfo.phone}`}
                    className={cn('text-sm', themeClasses[theme].link)}
                  >
                    {companyInfo.phone}
                  </a>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className={cn('h-5 w-5 mr-3', themeClasses[theme].textMuted)} />
                  <a 
                    href={`mailto:${companyInfo.email}`}
                    className={cn('text-sm', themeClasses[theme].link)}
                  >
                    {companyInfo.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links & Additional Info */}
            <div className="lg:col-span-1 mt-8 lg:mt-0">
              {showSocial && (
                <div className="mb-8">
                  <h3 className={cn('text-sm font-semibold uppercase tracking-wider mb-4', themeClasses[theme].text)}>
                    Follow Us
                  </h3>
                  <div className="flex space-x-4">
                    {socialLinks.map((social) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'p-2 rounded-lg transition-colors duration-200',
                            theme === 'dark' 
                              ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                          )}
                          aria-label={`Follow us on ${social.name}`}
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Additional Links */}
              <div className="space-y-4">
                <div>
                  <h4 className={cn('text-sm font-semibold mb-2', themeClasses[theme].text)}>
                    Certifications
                  </h4>
                  <div className="flex space-x-4">
                    <div className={cn('text-xs px-2 py-1 rounded border', themeClasses[theme].border, themeClasses[theme].textMuted)}>
                      ISO 27001
                    </div>
                    <div className={cn('text-xs px-2 py-1 rounded border', themeClasses[theme].border, themeClasses[theme].textMuted)}>
                      SOC 2
                    </div>
                    <div className={cn('text-xs px-2 py-1 rounded border', themeClasses[theme].border, themeClasses[theme].textMuted)}>
                      GDPR
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={cn('text-sm font-semibold mb-2', themeClasses[theme].text)}>
                    Languages
                  </h4>
                  <div className="flex items-center space-x-2">
                    <GlobeAltIcon className={cn('h-4 w-4', themeClasses[theme].textMuted)} />
                    <span className={cn('text-sm', themeClasses[theme].textMuted)}>
                      English, Spanish, French, German, Arabic, Hindi, Chinese
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={cn('mt-8 pt-8 border-t', themeClasses[theme].border)}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              {/* Logo */}
              <div className="flex items-center space-x-3 max-w-fit">
                <Image
                  src="/images/logo/zoptal-full.svg"
                  alt="Zoptal"
                  width={40}
                  height={13}
                  className="h-4 w-10 flex-shrink-0"
                  sizes="40px"
                />
              </div>
              <p className={cn('text-sm', themeClasses[theme].textMuted)}>
                © {new Date().getFullYear()} {companyInfo.name}. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/legal/privacy" 
                  className={cn('text-sm', themeClasses[theme].link)}
                >
                  Privacy
                </Link>
                <Link 
                  href="/legal/terms" 
                  className={cn('text-sm', themeClasses[theme].link)}
                >
                  Terms
                </Link>
                <Link 
                  href="/legal/cookies" 
                  className={cn('text-sm', themeClasses[theme].link)}
                >
                  Cookies
                </Link>
                <Link 
                  href="/sitemap.xml" 
                  className={cn('text-sm', themeClasses[theme].link)}
                >
                  Sitemap
                </Link>
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              <p className={cn('text-sm', themeClasses[theme].textMuted)}>
                Made with ❤️ in San Francisco
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Pre-configured footer variants
export function MainFooter(props: Omit<FooterProps, 'theme'>) {
  return (
    <Footer
      {...props}
      theme="dark"
      showNewsletter={true}
      showSocial={true}
    />
  );
}

export function MinimalFooter(props: Omit<FooterProps, 'showNewsletter' | 'showSocial'>) {
  return (
    <Footer
      {...props}
      showNewsletter={false}
      showSocial={false}
    />
  );
}

export function LightFooter(props: Omit<FooterProps, 'theme'>) {
  return (
    <Footer
      {...props}
      theme="light"
    />
  );
}