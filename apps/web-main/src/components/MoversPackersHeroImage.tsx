'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface MoversPackersHeroImageProps {
  className?: string;
}

export default function MoversPackersHeroImage({ className = '' }: MoversPackersHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/movers-packers-platform.png"
          alt="Movers & Packers Services Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}