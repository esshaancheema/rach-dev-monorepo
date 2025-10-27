'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface NewsMediaHeroImageProps {
  className?: string;
}

export default function NewsMediaHeroImage({ className = '' }: NewsMediaHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/news-media-platform.png"
          alt="News & Media Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}