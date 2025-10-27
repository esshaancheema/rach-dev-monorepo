'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface FantasySportsHeroImageProps {
  className?: string;
}

export default function FantasySportsHeroImage({ className = '' }: FantasySportsHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/fantasy-sports-platform.png"
          alt="Fantasy Sports & Gaming Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}