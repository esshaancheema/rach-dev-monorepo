// AMP Link Component for including AMP links in regular pages
'use client';

import { usePathname } from 'next/navigation';

interface AMPLinkProps {
  slug?: string;
  type?: 'blog' | 'case-study';
  className?: string;
}

export function AMPLink({ slug, type = 'blog', className }: AMPLinkProps) {
  const pathname = usePathname();
  
  // Determine AMP URL based on current path or provided slug
  const getAMPUrl = (): string => {
    if (slug) {
      return `/${type === 'blog' ? 'blog' : 'case-studies'}/${slug}/amp`;
    }
    
    // Try to extract slug from current pathname
    const pathSegments = pathname.split('/');
    if (pathSegments.length >= 3) {
      const extractedSlug = pathSegments[2];
      return `${pathname}/amp`;
    }
    
    return '';
  };

  const ampUrl = getAMPUrl();
  
  if (!ampUrl) {
    return null;
  }

  return (
    <>
      {/* AMP link for discovery */}
      <link
        rel="amphtml"
        href={ampUrl}
      />
      
      {/* Optional visible AMP link */}
      <a
        href={ampUrl}
        className={className}
        aria-label="View AMP version"
        title="View AMP (Accelerated Mobile Pages) version"
      >
        ⚡ AMP
      </a>
    </>
  );
}

// Hook for getting AMP URL programmatically
export function useAMPUrl(slug?: string, type: 'blog' | 'case-study' = 'blog'): string {
  const pathname = usePathname();
  
  if (slug) {
    return `/${type === 'blog' ? 'blog' : 'case-studies'}/${slug}/amp`;
  }
  
  // Try to extract slug from current pathname
  const pathSegments = pathname.split('/');
  if (pathSegments.length >= 3) {
    return `${pathname}/amp`;
  }
  
  return '';
}