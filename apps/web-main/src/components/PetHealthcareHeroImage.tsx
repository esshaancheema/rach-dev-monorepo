'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface PetHealthcareHeroImageProps {
  className?: string;
}

export default function PetHealthcareHeroImage({ className = '' }: PetHealthcareHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/pet-healthcare-platform.png"
          alt="Pet Healthcare & Veterinary Services Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}