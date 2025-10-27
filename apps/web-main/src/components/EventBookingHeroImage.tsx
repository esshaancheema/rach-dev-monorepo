'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';

interface EventBookingHeroImageProps {
  className?: string;
}

export default function EventBookingHeroImage({ className = '' }: EventBookingHeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-96 rounded-2xl overflow-hidden">
        <OptimizedImage
          src="/images/solutions/event-booking-platform.png"
          alt="Event & Venue Booking Platform"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}