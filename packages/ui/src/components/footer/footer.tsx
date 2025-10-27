import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Button } from '../button';
import { Separator } from '../separator';
import { Badge } from '../badge';

const footerVariants = cva(
  'w-full bg-background border-t border-border',
  {
    variants: {
      variant: {
        default: 'bg-background',
        muted: 'bg-muted',
        dark: 'bg-slate-900 text-slate-50 border-slate-800',
      },
      size: {
        sm: 'py-6',
        default: 'py-8',
        lg: 'py-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface FooterLink {
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface FooterProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof footerVariants> {
  logo?: React.ReactNode;
  description?: string;
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  copyright?: string;
  newsletter?: {
    title: string;
    description: string;
    placeholder: string;
    onSubscribe: (email: string) => void;
  };
  showBackToTop?: boolean;
  onBackToTop?: () => void;
  bottomLinks?: FooterLink[];
}

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  (
    {
      className,
      variant,
      size,
      logo,
      description,
      sections = [],
      socialLinks = [],
      copyright,
      newsletter,
      showBackToTop = false,
      onBackToTop,
      bottomLinks = [],
      children,
      ...props
    },
    ref
  ) => {
    const [email, setEmail] = React.useState('');

    const handleNewsletterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (email && newsletter?.onSubscribe) {
        newsletter.onSubscribe(email);
        setEmail('');
      }
    };

    const handleBackToTop = () => {
      if (onBackToTop) {
        onBackToTop();
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    return (
      <footer
        ref={ref}
        className={cn(footerVariants({ variant, size }), className)}
        {...props}
      >
        <div className="container">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company/Logo Section */}
            {(logo || description) && (
              <div className="space-y-4">
                {logo && <div className="flex items-center">{logo}</div>}
                {description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                )}
                {socialLinks.length > 0 && (
                  <div className="flex items-center space-x-4">
                    {socialLinks.map((social) => (
                      <Button
                        key={social.name}
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.name}
                        >
                          {social.icon}
                        </a>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer Sections */}
            {sections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-sm font-semibold tracking-wider uppercase">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {link.href ? (
                        <a
                          href={link.href}
                          onClick={link.onClick}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                        >
                          {link.label}
                          {link.badge && (
                            <Badge variant="secondary" size="sm">
                              {link.badge}
                            </Badge>
                          )}
                        </a>
                      ) : (
                        <button
                          onClick={link.onClick}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left inline-flex items-center gap-2"
                        >
                          {link.label}
                          {link.badge && (
                            <Badge variant="secondary" size="sm">
                              {link.badge}
                            </Badge>
                          )}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter Section */}
            {newsletter && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold tracking-wider uppercase">
                  {newsletter.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {newsletter.description}
                </p>
                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                  <input
                    type="email"
                    placeholder={newsletter.placeholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button type="submit" className="w-full" size="sm">
                    Subscribe
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Back to Top Button */}
          {showBackToTop && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToTop}
                className="rounded-full"
              >
                ↑ Back to Top
              </Button>
            </div>
          )}

          {/* Footer Bottom */}
          {(copyright || bottomLinks.length > 0) && (
            <>
              <Separator className="my-6" />
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                {copyright && (
                  <p className="text-sm text-muted-foreground">
                    {copyright}
                  </p>
                )}
                {bottomLinks.length > 0 && (
                  <div className="flex items-center space-x-6">
                    {bottomLinks.map((link, index) => (
                      <React.Fragment key={index}>
                        {link.href ? (
                          <a
                            href={link.href}
                            onClick={link.onClick}
                            target={link.external ? '_blank' : undefined}
                            rel={link.external ? 'noopener noreferrer' : undefined}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <button
                            onClick={link.onClick}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {link.label}
                          </button>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {children}
        </div>
      </footer>
    );
  }
);
Footer.displayName = 'Footer';

// Pre-built footer variants
const SimpleFooter: React.FC<{
  logo?: React.ReactNode;
  description?: string;
  sections?: FooterSection[];
  copyright?: string;
  className?: string;
}> = ({ logo, description, sections, copyright, className }) => (
  <Footer
    variant="default"
    logo={logo}
    description={description}
    sections={sections}
    copyright={copyright}
    className={className}
  />
);

const DarkFooter: React.FC<{
  logo?: React.ReactNode;
  description?: string;
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  copyright?: string;
  className?: string;
}> = ({ logo, description, sections, socialLinks, copyright, className }) => (
  <Footer
    variant="dark"
    logo={logo}
    description={description}
    sections={sections}
    socialLinks={socialLinks}
    copyright={copyright}
    className={className}
  />
);

const NewsletterFooter: React.FC<{
  logo?: React.ReactNode;
  description?: string;
  sections?: FooterSection[];
  newsletter: FooterProps['newsletter'];
  copyright?: string;
  className?: string;
}> = ({ logo, description, sections, newsletter, copyright, className }) => (
  <Footer
    variant="default"
    logo={logo}
    description={description}
    sections={sections}
    newsletter={newsletter}
    copyright={copyright}
    className={className}
  />
);

export {
  Footer,
  SimpleFooter,
  DarkFooter,
  NewsletterFooter,
  footerVariants,
  type FooterProps,
  type FooterSection,
  type FooterLink,
  type SocialLink,
};