'use client';

import { Button } from '@/components/ui/Button';

interface PreviewBannerProps {
  isPreview: boolean;
  onExit?: () => void;
}

export function PreviewBanner({ isPreview, onExit }: PreviewBannerProps) {
  if (!isPreview) return null;

  const handleExitPreview = () => {
    if (onExit) {
      onExit();
    } else {
      // Default exit preview behavior
      window.location.href = `/api/exit-preview?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-600 text-white px-4 py-2 text-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Preview Mode</span>
          <span className="text-orange-100">
            You're viewing unpublished content from Contentful
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExitPreview}
          className="bg-white text-orange-600 border-white hover:bg-orange-50"
        >
          Exit Preview
        </Button>
      </div>
    </div>
  );
}

// Hook to detect preview mode
export function usePreviewMode() {
  const [isPreview, setIsPreview] = React.useState(false);

  React.useEffect(() => {
    // Check if we're in preview mode
    const checkPreviewMode = async () => {
      try {
        const response = await fetch('/api/preview-status');
        const { isEnabled } = await response.json();
        setIsPreview(isEnabled);
      } catch (error) {
        console.error('Failed to check preview mode:', error);
        
        // Fallback: check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        setIsPreview(urlParams.get('preview') === 'true');
      }
    };

    checkPreviewMode();
  }, []);

  return isPreview;
}