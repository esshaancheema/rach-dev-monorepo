'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface AutomobileServicesHeroImageProps {
  className?: string;
}

export default function AutomobileServicesHeroImage({ className = '' }: AutomobileServicesHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/automobile-services-platform.png"
          alt="On-Demand Automobile Services Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}