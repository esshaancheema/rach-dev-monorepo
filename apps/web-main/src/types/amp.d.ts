/**
 * AMP HTML type declarations
 * Extends React HTML elements with AMP-specific attributes
 */

import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    // AMP event handling
    on?: string;
    
    // AMP layout attributes
    fallback?: boolean;
    placeholder?: boolean;
    
    // Custom data attributes
    'data-tag'?: string;
    'data-cta'?: string;
    'data-related-article'?: string;
    'data-download'?: string;
    'data-video-title'?: string;
    'data-outbound'?: string;
    'data-param'?: string;
  }
  
  interface AnchorHTMLAttributes<T> {
    on?: string;
  }
  
  interface VideoHTMLAttributes<T> {
    on?: string;
    layout?: string;
    'data-video-title'?: string;
  }
}

// AMP component type declarations
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'amp-video': React.DetailedHTMLProps<
        React.VideoHTMLAttributes<HTMLVideoElement> & {
          width?: string | number;
          height?: string | number;
          poster?: string;
          layout?: string;
          autoplay?: boolean;
          loop?: boolean;
          muted?: boolean;
          controls?: boolean;
          'data-param'?: string;
          fallback?: boolean;
          on?: string;
        },
        HTMLVideoElement
      >;
      'amp-img': React.DetailedHTMLProps<
        React.ImgHTMLAttributes<HTMLImageElement> & {
          width?: string | number;
          height?: string | number;
          layout?: string;
          fallback?: boolean;
          placeholder?: boolean;
        },
        HTMLImageElement
      >;
      'amp-analytics': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          type?: string;
          config?: string;
          'data-credentials'?: string;
        },
        HTMLElement
      >;
      
      // AMP social sharing
      'amp-social-share': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          type?: string;
          width?: string | number;
          height?: string | number;
          'data-param-text'?: string;
          'data-param-url'?: string;
          'data-param-href'?: string;
          'data-param-title'?: string;
          'data-param-summary'?: string;
          'data-param-subject'?: string;
          'data-param-body'?: string;
        },
        HTMLElement
      >;

      // AMP media components
      'amp-youtube': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'data-videoid': string;
          width?: string | number;
          height?: string | number;
          layout?: string;
        },
        HTMLElement
      >;

      'amp-vimeo': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'data-videoid': string;
          width?: string | number;
          height?: string | number;
          layout?: string;
        },
        HTMLElement
      >;

      // AMP layout components
      'amp-carousel': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          type?: string;
          width?: string | number;
          height?: string | number;
          layout?: string;
          autoplay?: boolean;
          loop?: boolean;
          delay?: number;
        },
        HTMLElement
      >;

      'amp-sidebar': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id: string;
          layout?: string;
          side?: 'left' | 'right';
        },
        HTMLElement
      >;

      // AMP interactive components
      'amp-accordion': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'expand-single-section'?: boolean;
          animate?: boolean;
        },
        HTMLElement
      >;

      'amp-lightbox': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id: string;
          layout?: string;
          'animate-in'?: string;
        },
        HTMLElement
      >;

      // AMP utility components
      'amp-animation': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id?: string;
          layout?: string;
          trigger?: string;
        },
        HTMLElement
      >;

      'amp-fit-text': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          width?: string | number;
          height?: string | number;
          layout?: string;
          'min-font-size'?: number;
          'max-font-size'?: number;
        },
        HTMLElement
      >;

      'amp-call-tracking': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          config?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};