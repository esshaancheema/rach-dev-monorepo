'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface RealEstateHeroImageProps {
  className?: string;
}

export default function RealEstateHeroImage({ className = '' }: RealEstateHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/real-estate-platform.png"
          alt="Real Estate Management Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}