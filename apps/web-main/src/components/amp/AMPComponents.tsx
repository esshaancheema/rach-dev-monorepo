// Comprehensive AMP component library for Zoptal website

import React from 'react';

// Base AMP component interfaces
export interface AMPComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// AMP Image Component
export interface AMPImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  layout?: 'responsive' | 'fixed' | 'fill' | 'fixed-height' | 'flex-item' | 'intrinsic';
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  fallback?: string;
}

export function AMPImage({
  src,
  alt,
  width,
  height,
  layout = 'responsive',
  className = '',
  objectFit = 'cover',
  placeholder,
  fallback,
}: AMPImageProps) {
  const style = objectFit !== 'cover' ? { objectFit } : undefined;
  
  return (
    <amp-img
      src={src}
      alt={alt}
      width={width}
      height={height}
      layout={layout}
      className={className}
      style={style}
      placeholder={placeholder}
    >
      {fallback && (
        <div fallback>
          <img src={fallback} alt={alt} />
        </div>
      )}
    </amp-img>
  );
}

// AMP Video Component
export interface AMPVideoProps {
  src: string;
  poster?: string;
  width: number;
  height: number;
  layout?: 'responsive' | 'fixed' | 'fill';
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
}

export function AMPVideo({
  src,
  poster,
  width,
  height,
  layout = 'responsive',
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  className = '',
}: AMPVideoProps) {
  return (
    <amp-video
      src={src}
      poster={poster}
      width={width}
      height={height}
      layout={layout}
      autoplay={autoplay}
      muted={muted}
      loop={loop}
      controls={controls}
      className={className}
    />
  );
}

// AMP YouTube Component
export interface AMPYouTubeProps {
  videoId: string;
  width?: number;
  height?: number;
  layout?: 'responsive' | 'fixed' | 'fill';
  autoplay?: boolean;
  className?: string;
}

export function AMPYouTube({
  videoId,
  width = 480,
  height = 270,
  layout = 'responsive',
  autoplay = false,
  className = '',
}: AMPYouTubeProps) {
  return (
    <amp-youtube
      data-videoid={videoId}
      width={width}
      height={height}
      layout={layout}
      autoplay={autoplay}
      className={className}
    />
  );
}

// AMP Vimeo Component
export interface AMPVimeoProps {
  videoId: string;
  width?: number;
  height?: number;
  layout?: 'responsive' | 'fixed' | 'fill';
  autoplay?: boolean;
  className?: string;
}

export function AMPVimeo({
  videoId,
  width = 500,
  height = 281,
  layout = 'responsive',
  autoplay = false,
  className = '',
}: AMPVimeoProps) {
  return (
    <amp-vimeo
      data-videoid={videoId}
      width={width}
      height={height}
      layout={layout}
      autoplay={autoplay}
      className={className}
    />
  );
}

// AMP Carousel Component
export interface AMPCarouselProps {
  type?: 'slides' | 'carousel';
  width: number;
  height: number;
  layout?: 'responsive' | 'fixed' | 'fill';
  autoplay?: boolean;
  delay?: number;
  loop?: boolean;
  controls?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function AMPCarousel({
  type = 'carousel',
  width,
  height,
  layout = 'responsive',
  autoplay = false,
  delay = 3000,
  loop = true,
  controls = true,
  className = '',
  children,
}: AMPCarouselProps) {
  return (
    <amp-carousel
      type={type}
      width={width}
      height={height}
      layout={layout}
      autoplay={autoplay}
      delay={delay}
      loop={loop}
      controls={controls}
      className={className}
    >
      {children}
    </amp-carousel>
  );
}

// AMP Sidebar Component
export interface AMPSidebarProps {
  id: string;
  side?: 'left' | 'right';
  className?: string;
  children: React.ReactNode;
}

export function AMPSidebar({
  id,
  side = 'left',
  className = '',
  children,
}: AMPSidebarProps) {
  return (
    <amp-sidebar
      id={id}
      layout="nodisplay"
      side={side}
      className={className}
    >
      {children}
    </amp-sidebar>
  );
}

// AMP Accordion Component
export interface AMPAccordionProps {
  animate?: boolean;
  expandSingleSection?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function AMPAccordion({
  animate = true,
  expandSingleSection = false,
  className = '',
  children,
}: AMPAccordionProps) {
  return (
    <amp-accordion
      animate={animate}
      expand-single-section={expandSingleSection}
      className={className}
    >
      {children}
    </amp-accordion>
  );
}

// AMP Accordion Section
export interface AMPAccordionSectionProps {
  expanded?: boolean;
  header: React.ReactNode;
  children: React.ReactNode;
}

export function AMPAccordionSection({
  expanded = false,
  header,
  children,
}: AMPAccordionSectionProps) {
  return (
    <section expanded={expanded}>
      <h3>{header}</h3>
      <div>{children}</div>
    </section>
  );
}

// AMP Form Component
export interface AMPFormProps {
  method: 'GET' | 'POST';
  action: string;
  actionXhr?: string;
  target?: '_top' | '_blank';
  customValidationReporting?: 'as-you-go' | 'interact-and-submit';
  className?: string;
  children: React.ReactNode;
  onSubmit?: string;
  onSubmitSuccess?: string;
  onSubmitError?: string;
}

export function AMPForm({
  method,
  action,
  actionXhr,
  target = '_top',
  customValidationReporting = 'as-you-go',
  className = '',
  children,
  onSubmit,
  onSubmitSuccess,
  onSubmitError,
}: AMPFormProps) {
  return (
    <form
      method={method}
      action={action}
      action-xhr={actionXhr}
      target={target}
      custom-validation-reporting={customValidationReporting}
      className={className}
      on={`submit:${onSubmit};submit-success:${onSubmitSuccess};submit-error:${onSubmitError}`}
    >
      {children}
    </form>
  );
}

// AMP Input Component
export interface AMPInputProps {
  type: 'text' | 'email' | 'tel' | 'password' | 'number' | 'url' | 'search';
  name: string;
  placeholder?: string;
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  className?: string;
  autoComplete?: string;
  value?: string;
}

export function AMPInput({
  type,
  name,
  placeholder,
  required = false,
  pattern,
  minLength,
  maxLength,
  className = '',
  autoComplete,
  value,
}: AMPInputProps) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      required={required}
      pattern={pattern}
      minLength={minLength}
      maxLength={maxLength}
      className={className}
      autoComplete={autoComplete}
      defaultValue={value}
    />
  );
}

// AMP Button Component
export interface AMPButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  on?: string;
}

export function AMPButton({
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  children,
  on,
}: AMPButtonProps) {
  const variantClass = `amp-btn-${variant}`;
  const sizeClass = size !== 'medium' ? `amp-btn-${size}` : '';
  const classes = `amp-btn ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      on={on}
    >
      {children}
    </button>
  );
}

// AMP Social Share Component
export interface AMPSocialShareProps {
  type: 'twitter' | 'facebook' | 'linkedin' | 'email' | 'pinterest' | 'whatsapp';
  width?: number;
  height?: number;
  dataParam?: Record<string, string>;
  className?: string;
}

export function AMPSocialShare({
  type,
  width = 45,
  height = 33,
  dataParam = {},
  className = '',
}: AMPSocialShareProps) {
  const dataProps = Object.entries(dataParam).reduce((acc, [key, value]) => {
    acc[`data-param-${key}`] = value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <amp-social-share
      type={type}
      width={width}
      height={height}
      className={className}
      {...dataProps}
    />
  );
}

// AMP Analytics Component
export interface AMPAnalyticsProps {
  type?: 'googleanalytics' | 'gtag' | 'custom';
  config?: Record<string, any>;
  triggers?: Record<string, any>;
  className?: string;
}

export function AMPAnalytics({
  type = 'googleanalytics',
  config = {},
  triggers = {},
  className = '',
}: AMPAnalyticsProps) {
  const configScript = {
    vars: config,
    triggers,
  };

  return (
    <amp-analytics
      type={type}
      className={className}
    >
      <script
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(configScript) }}
      />
    </amp-analytics>
  );
}

// AMP Lightbox Component
export interface AMPLightboxProps {
  id: string;
  layout?: 'nodisplay';
  scrollable?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function AMPLightbox({
  id,
  layout = 'nodisplay',
  scrollable = false,
  className = '',
  children,
}: AMPLightboxProps) {
  return (
    <amp-lightbox
      id={id}
      layout={layout}
      scrollable={scrollable}
      className={className}
    >
      {children}
    </amp-lightbox>
  );
}

// AMP Animation Component
export interface AMPAnimationProps {
  id: string;
  animation: Record<string, any>;
  trigger?: 'visibility';
  className?: string;
}

export function AMPAnimation({
  id,
  animation,
  trigger = 'visibility',
  className = '',
}: AMPAnimationProps) {
  return (
    <amp-animation
      id={id}
      layout="nodisplay"
      trigger={trigger}
      className={className}
    >
      <script
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(animation) }}
      />
    </amp-animation>
  );
}

// AMP Fit Text Component
export interface AMPFitTextProps {
  width: number;
  height: number;
  minFontSize?: number;
  maxFontSize?: number;
  className?: string;
  children: React.ReactNode;
}

export function AMPFitText({
  width,
  height,
  minFontSize = 6,
  maxFontSize = 72,
  className = '',
  children,
}: AMPFitTextProps) {
  return (
    <amp-fit-text
      width={width}
      height={height}
      min-font-size={minFontSize}
      max-font-size={maxFontSize}
      className={className}
    >
      {children}
    </amp-fit-text>
  );
}

// AMP Call Tracking Component
export interface AMPCallTrackingProps {
  config: Record<string, any>;
  className?: string;
}

export function AMPCallTracking({
  config,
  className = '',
}: AMPCallTrackingProps) {
  return (
    <amp-call-tracking
      className={className}
    >
      <script
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(config) }}
      />
    </amp-call-tracking>
  );
}

// Composite Components for common patterns

// AMP Header with Navigation
export interface AMPHeaderProps {
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
    href?: string;
  };
  navigation?: Array<{
    label: string;
    href: string;
    active?: boolean;
  }>;
  sidebarId?: string;
  className?: string;
}

export function AMPHeader({
  logo,
  navigation = [],
  sidebarId,
  className = '',
}: AMPHeaderProps) {
  return (
    <header className={`amp-header ${className}`}>
      <div className="container">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href={logo.href || '/'} className="amp-logo">
            <AMPImage
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              layout="fixed"
            />
          </a>

          {/* Desktop Navigation */}
          {navigation.length > 0 && (
            <nav className="amp-nav hidden md:flex">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`amp-nav-link ${item.active ? 'active' : ''}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          {/* Mobile Menu Toggle */}
          {sidebarId && (
            <button
              className="md:hidden"
              on={`tap:${sidebarId}.toggle`}
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// AMP Footer
export interface AMPFooterProps {
  company: string;
  year: number;
  links?: Array<{
    label: string;
    href: string;
  }>;
  social?: Array<{
    type: AMPSocialShareProps['type'];
    href: string;
    label: string;
  }>;
  className?: string;
}

export function AMPFooter({
  company,
  year,
  links = [],
  social = [],
  className = '',
}: AMPFooterProps) {
  return (
    <footer className={`amp-footer ${className}`}>
      <div className="container">
        <div className="text-center">
          <p>&copy; {year} {company}. All rights reserved.</p>
          
          {links.length > 0 && (
            <p>
              {links.map((link, index) => (
                <React.Fragment key={link.href}>
                  {index > 0 && ' | '}
                  <a href={link.href}>{link.label}</a>
                </React.Fragment>
              ))}
            </p>
          )}

          {social.length > 0 && (
            <div className="amp-social-links">
              {social.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

// AMP Hero Section
export interface AMPHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  cta?: {
    label: string;
    href: string;
    variant?: AMPButtonProps['variant'];
  };
  className?: string;
}

export function AMPHero({
  title,
  subtitle,
  backgroundImage,
  cta,
  className = '',
}: AMPHeroProps) {
  return (
    <section className={`amp-hero ${className}`}>
      {backgroundImage && (
        <AMPImage
          src={backgroundImage}
          alt=""
          width={1200}
          height={600}
          layout="fill"
          className="amp-hero-bg"
        />
      )}
      
      <div className="container">
        <div className="amp-hero-content">
          <h1 className="amp-hero-title">{title}</h1>
          {subtitle && <p className="amp-hero-subtitle">{subtitle}</p>}
          {cta && (
            <a
              href={cta.href}
              className={`amp-btn amp-btn-${cta.variant || 'primary'} amp-btn-large`}
            >
              {cta.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// AMP Contact Form
export interface AMPContactFormProps {
  action: string;
  actionXhr?: string;
  title?: string;
  fields?: Array<{
    name: string;
    type: AMPInputProps['type'];
    label: string;
    placeholder?: string;
    required?: boolean;
  }>;
  submitLabel?: string;
  className?: string;
}

export function AMPContactForm({
  action,
  actionXhr,
  title = 'Contact Us',
  fields = [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'message', type: 'text', label: 'Message', required: true },
  ],
  submitLabel = 'Send Message',
  className = '',
}: AMPContactFormProps) {
  return (
    <div className={`amp-contact-form ${className}`}>
      <h2>{title}</h2>
      
      <AMPForm
        method="POST"
        action={action}
        actionXhr={actionXhr}
        className="amp-form"
      >
        {fields.map((field) => (
          <div key={field.name} className="amp-form-field">
            <label htmlFor={field.name}>{field.label}</label>
            {field.name === 'message' ? (
              <textarea
                name={field.name}
                id={field.name}
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
              />
            ) : (
              <AMPInput
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
          </div>
        ))}
        
        <AMPButton type="submit" variant="primary" size="large">
          {submitLabel}
        </AMPButton>
      </AMPForm>
    </div>
  );
}

// Export all components for easy importing
export {
  AMPImage,
  AMPVideo,
  AMPYouTube,
  AMPVimeo,
  AMPCarousel,
  AMPSidebar,
  AMPAccordion,
  AMPAccordionSection,
  AMPForm,
  AMPInput,
  AMPButton,
  AMPSocialShare,
  AMPAnalytics,
  AMPLightbox,
  AMPAnimation,
  AMPFitText,
  AMPCallTracking,
  AMPHeader,
  AMPFooter,
  AMPHero,
  AMPContactForm,
};