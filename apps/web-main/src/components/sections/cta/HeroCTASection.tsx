'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CTAGroup, SignupCTA, DemoCTA } from './CTAManager';

interface HeroCTASectionProps {
  primaryCTA?: ReactNode;
  secondaryCTA?: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'normal' | 'wide';
  className?: string;
}

export default function HeroCTASection({
  primaryCTA,
  secondaryCTA,
  orientation = 'horizontal',
  spacing = 'normal',
  className,
}: HeroCTASectionProps) {
  return (
    <CTAGroup
      orientation={orientation}
      spacing={spacing}
      alignment="center"
      className={cn('mt-8', className)}
    >
      {primaryCTA || <SignupCTA size="xl" />}
      {secondaryCTA || <DemoCTA size="xl" variant="outline" />}
    </CTAGroup>
  );
}