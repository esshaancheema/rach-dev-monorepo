'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface TruckingLogisticsHeroImageProps {
  className?: string;
}

export default function TruckingLogisticsHeroImage({ className = '' }: TruckingLogisticsHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/trucking-logistics-platform.png"
          alt="Trucking & Logistics Management Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}