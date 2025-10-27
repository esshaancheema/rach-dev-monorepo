'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { generateContentShareUrls } from '@/lib/cms/utils';

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
  className?: string;
}

export function ShareButtons({ title, url, description, className = '' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrls = generateContentShareUrls(title, url, description);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleShare = (platform: string, shareUrl: string) => {
    // Track share event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        event_category: 'engagement',
        event_label: platform,
        value: 1,
      });
    }

    // Open share URL
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Share this:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Twitter */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter', shareUrls.twitter)}
          className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
          Twitter
        </Button>

        {/* Facebook */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook', shareUrls.facebook)}
          className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
          </svg>
          Facebook
        </Button>

        {/* LinkedIn */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('linkedin', shareUrls.linkedin)}
          className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </Button>

        {/* Email */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = shareUrls.email}
          className="flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email
        </Button>

        {/* Copy Link */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Utility component for social sharing with customizable buttons
interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
  platforms?: ('twitter' | 'facebook' | 'linkedin' | 'email')[];
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  className?: string;
}

export function SocialShare({ 
  title, 
  url, 
  description, 
  platforms = ['twitter', 'facebook', 'linkedin', 'email'],
  size = 'md',
  layout = 'horizontal',
  showLabels = true,
  className = ''
}: SocialShareProps) {
  const shareUrls = generateContentShareUrls(title, url, description);

  const platformConfig = {
    twitter: {
      url: shareUrls.twitter,
      label: 'Twitter',
      color: 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    facebook: {
      url: shareUrls.facebook,
      label: 'Facebook',
      color: 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
    },
    linkedin: {
      url: shareUrls.linkedin,
      label: 'LinkedIn',
      color: 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    email: {
      url: shareUrls.email,
      label: 'Email',
      color: 'hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  };

  const containerClass = layout === 'vertical' ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2';

  return (
    <div className={`${containerClass} ${className}`}>
      {platforms.map((platform) => {
        const config = platformConfig[platform];
        return (
          <Button
            key={platform}
            variant="outline"
            size={size}
            onClick={() => {
              if (platform === 'email') {
                window.location.href = config.url;
              } else {
                window.open(config.url, '_blank', 'width=600,height=400');
              }
            }}
            className={`flex items-center gap-2 ${config.color}`}
          >
            {config.icon}
            {showLabels && <span>{config.label}</span>}
          </Button>
        );
      })}
    </div>
  );
}