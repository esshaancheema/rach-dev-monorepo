'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface ProfessionalServicesHeroImageProps {
  className?: string;
}

export default function ProfessionalServicesHeroImage({ className = '' }: ProfessionalServicesHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/professional-services-platform.png"
          alt="Professional Services Marketplace Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}