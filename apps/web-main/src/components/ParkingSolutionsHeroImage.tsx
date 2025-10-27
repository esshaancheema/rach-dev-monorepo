'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface ParkingSolutionsHeroImageProps {
  className?: string;
}

export default function ParkingSolutionsHeroImage({ className = '' }: ParkingSolutionsHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/parking-solutions.png"
          alt="Parking Solutions Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}