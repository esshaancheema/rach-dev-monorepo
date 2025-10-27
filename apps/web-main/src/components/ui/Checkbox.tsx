'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Checkbox({ 
  checked = false, 
  onCheckedChange, 
  disabled = false, 
  className,
  id 
}: CheckboxProps) {
  const handleChange = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleChange}
      id={id}
      className={cn(
        'flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        checked && 'bg-blue-600 border-blue-600',
        className
      )}
    >
      {checked && (
        <CheckIcon className="h-3 w-3 text-white" />
      )}
    </button>
  );
}