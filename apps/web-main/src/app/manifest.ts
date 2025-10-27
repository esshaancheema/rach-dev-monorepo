import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Zoptal - AI-Accelerated Development Platform',
    short_name: 'Zoptal',
    description: 'Transform your development workflow with intelligent code generation, automated testing, and AI-powered optimization. Build software 10x faster with our AI development platform.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en',
    categories: ['business', 'productivity', 'developer'],
    
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any'
      }
    ],
    
    shortcuts: [
      {
        name: 'Contact Us',
        short_name: 'Contact',
        description: 'Get in touch with our AI development experts',
        url: '/contact',
        icons: [
          {
            src: '/icons/contact-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Services',
        short_name: 'Services',
        description: 'Explore our AI-powered development services',
        url: '/services',
        icons: [
          {
            src: '/icons/services-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Pricing',
        short_name: 'Pricing',
        description: 'View our transparent pricing plans',
        url: '/pricing',
        icons: [
          {
            src: '/icons/pricing-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'AI Demo',
        short_name: 'Demo',
        description: 'Try our AI development platform',
        url: '/#demo',
        icons: [
          {
            src: '/icons/demo-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      }
    ],
    
    screenshots: [
      {
        src: '/screenshots/desktop-home.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Zoptal homepage on desktop'
      },
      {
        src: '/screenshots/mobile-home.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Zoptal homepage on mobile'
      },
      {
        src: '/screenshots/desktop-services.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Zoptal services page on desktop'
      },
      {
        src: '/screenshots/mobile-services.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Zoptal services page on mobile'
      }
    ],
    
    related_applications: [
      {
        platform: 'webapp',
        url: 'https://zoptal.com'
      }
    ],
    
    prefer_related_applications: false,
    
    edge_side_panel: {
      preferred_width: 400
    }
  };
}