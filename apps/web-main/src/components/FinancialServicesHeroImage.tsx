'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface FinancialServicesHeroImageProps {
  className?: string;
}

export default function FinancialServicesHeroImage({ className = '' }: FinancialServicesHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/financial-services-platform.png"
          alt="Financial Services Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}