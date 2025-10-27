'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface FitnessWellnessHeroImageProps {
  className?: string;
}

export default function FitnessWellnessHeroImage({ className = '' }: FitnessWellnessHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/fitness-wellness-platform.png"
          alt="Fitness & Wellness Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}