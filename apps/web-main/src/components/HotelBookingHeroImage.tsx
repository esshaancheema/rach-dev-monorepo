'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface HotelBookingHeroImageProps {
  className?: string;
}

export default function HotelBookingHeroImage({ className = '' }: HotelBookingHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/hotel-booking-platform.png"
          alt="Hotel & Accommodation Booking Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}