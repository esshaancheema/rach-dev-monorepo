'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality = 85,
  sizes,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  
  // Intersection Observer for lazy loading
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px', // Start loading 50px before image enters viewport
  });

  // Use original src directly (disable automatic WebP conversion)
  useEffect(() => {
    setOptimizedSrc(src);
  }, [src]);

  // Generate default blur placeholder
  const generateBlurDataURL = (w: number = 10, h: number = 10) => {
    if (typeof document === 'undefined') return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTVlN2ViIi8+Cjwvc3ZnPgo=';
    
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    // Create a simple gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#e5e7eb');
    gradient.addColorStop(1, '#f3f4f6');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    return canvas.toDataURL();
  };

  const [defaultBlurDataURL, setDefaultBlurDataURL] = useState(
    blurDataURL || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KUmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU3ZWIiLz4KPC9zdmc+Cg=='
  );

  // Generate blur placeholder on client-side
  useEffect(() => {
    if (!blurDataURL && typeof document !== 'undefined') {
      setDefaultBlurDataURL(generateBlurDataURL());
    }
  }, [blurDataURL]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Default sizes for responsive images
  const defaultSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  
  // Auto-detect if we should use blur placeholder based on image size
  const shouldUseBlur = () => {
    if (placeholder !== 'empty') return placeholder === 'blur';
    
    // Only use blur for images larger than 40x40
    if (width && height) {
      return width >= 40 && height >= 40;
    }
    
    // For fill images or unknown sizes, default to blur
    return fill;
  };
  
  const finalPlaceholder = shouldUseBlur() ? 'blur' : 'empty';

  // Error fallback component
  const ErrorFallback = () => (
    <div 
      className={`bg-gray-200 flex items-center justify-center ${className}`}
      style={{ 
        width: fill ? '100%' : width, 
        height: fill ? '100%' : height,
        ...style 
      }}
    >
      <svg 
        className="w-8 h-8 text-gray-400" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
        />
      </svg>
    </div>
  );

  if (hasError) {
    return <ErrorFallback />;
  }

  return (
    <div ref={ref} className={`relative ${!isLoaded ? 'animate-pulse' : ''}`}>
      {(inView || priority) && (
        <Image
          src={optimizedSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          priority={priority}
          quality={quality}
          sizes={fill ? defaultSizes : undefined}
          placeholder={finalPlaceholder}
          blurDataURL={finalPlaceholder === 'blur' ? defaultBlurDataURL : undefined}
          onLoad={handleLoad}
          onError={handleError}
          style={style}
          {...props}
        />
      )}
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
          style={{ 
            width: fill ? '100%' : width, 
            height: fill ? '100%' : height 
          }}
        />
      )}
    </div>
  );
}

// Default export
export default OptimizedImage;

// Specialized components for common use cases
export function HeroImage(props: Omit<OptimizedImageProps, 'priority' | 'sizes'>) {
  return (
    <OptimizedImage
      {...props}
      priority={true}
      sizes="100vw"
      quality={90}
    />
  );
}

export function ThumbnailImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      quality={75}
      sizes="(max-width: 768px) 50vw, 25vw"
    />
  );
}

export function ProfileImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      quality={80}
      sizes="(max-width: 768px) 25vw, 15vw"
      className={`rounded-full ${props.className || ''}`}
    />
  );
}

// Hook for programmatic image optimization
export function useImageOptimization() {
  const [webpSupported, setWebpSupported] = useState(false);
  
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };
    
    setWebpSupported(checkWebPSupport());
  }, []);
  
  const getOptimizedSrc = (src: string, format?: 'webp' | 'avif') => {
    // Return original src to prevent automatic format conversion
    return src;
  };
  
  return {
    webpSupported,
    getOptimizedSrc,
  };
}