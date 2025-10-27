'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface HomeServicesHeroImageProps {
  className?: string;
}

export default function HomeServicesHeroImage({ className = '' }: HomeServicesHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/home-services-platform.png"
          alt="Home Services Marketplace Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}