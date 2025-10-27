'use client';

import { cn } from '@/lib/utils';
import { CTAGroup, ConsultationCTA, ContactCTA } from './CTAManager';

interface ServiceCTASectionProps {
  serviceName?: string;
  className?: string;
}

export default function ServiceCTASection({
  serviceName,
  className,
}: ServiceCTASectionProps) {
  return (
    <div className={cn('bg-blue-50 rounded-xl p-8 text-center', className)}>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Ready to get started{serviceName ? ` with ${serviceName}` : ''}?
      </h3>
      <p className="text-gray-600 mb-6">
        Let's discuss your project requirements and create a custom solution for your needs.
      </p>
      <CTAGroup spacing="normal" alignment="center">
        <ConsultationCTA size="lg" />
        <ContactCTA size="lg" variant="outline" />
      </CTAGroup>
    </div>
  );
}