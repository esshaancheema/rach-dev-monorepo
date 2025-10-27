'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Switch({ 
  checked = false, 
  defaultChecked = false,
  onCheckedChange, 
  disabled = false, 
  className,
  id 
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const isControlled = checked !== undefined;
  const switchChecked = isControlled ? checked : internalChecked;
  const handleChange = () => {
    if (!disabled) {
      const newChecked = !switchChecked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      if (onCheckedChange) {
        onCheckedChange(newChecked);
      }
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={switchChecked}
      disabled={disabled}
      onClick={handleChange}
      id={id}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        switchChecked ? 'bg-blue-600' : 'bg-gray-200',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition duration-200 ease-in-out',
          switchChecked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}