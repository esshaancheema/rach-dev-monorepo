'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface GroceryDeliveryHeroImageProps {
  className?: string;
}

export default function GroceryDeliveryHeroImage({ className = '' }: GroceryDeliveryHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/grocery-delivery-platform.webp"
          alt="Grocery & Hyperlocal Delivery Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}