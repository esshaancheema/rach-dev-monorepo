'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface DatingPlatformHeroImageProps {
  className?: string;
}

export default function DatingPlatformHeroImage({ className = '' }: DatingPlatformHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/dating-platform.png"
          alt="Dating Platform Development"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}