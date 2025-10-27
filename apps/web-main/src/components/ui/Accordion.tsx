'use client';

import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface AccordionContextType {
  openItems: string[];
  toggleItem: (value: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = React.createContext<AccordionContextType | undefined>(undefined);

function useAccordion() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion provider');
  }
  return context;
}

interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  collapsible?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Accordion({ 
  type = 'single', 
  defaultValue = [], 
  collapsible = false,
  className, 
  children 
}: AccordionProps) {
  const initialValue = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  const [openItems, setOpenItems] = useState<string[]>(initialValue.filter(Boolean));

  const toggleItem = (value: string) => {
    if (type === 'single') {
      setOpenItems(prev => {
        const isCurrentlyOpen = prev.includes(value);
        if (isCurrentlyOpen && collapsible) {
          return [];
        }
        return isCurrentlyOpen ? prev : [value];
      });
    } else {
      setOpenItems(prev => 
        prev.includes(value) 
          ? prev.filter(item => item !== value)
          : [...prev, value]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

// Context for accordion item value  
interface AccordionItemContextType {
  value: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextType | undefined>(undefined);

export function AccordionItem({ value, className, children }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={cn('border-b border-gray-200', className)}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps {
  className?: string;
  children: React.ReactNode;
}

export function AccordionTrigger({ className, children }: AccordionTriggerProps) {
  const { openItems, toggleItem } = useAccordion();
  const accordionItem = React.useContext(AccordionItemContext);
  
  if (!accordionItem) {
    throw new Error('AccordionTrigger must be used within an AccordionItem');
  }

  const isOpen = openItems.includes(accordionItem.value);

  return (
    <button
      type="button"
      onClick={() => toggleItem(accordionItem.value)}
      className={cn(
        'flex w-full items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
    >
      {children}
      <ChevronDownIcon className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} />
    </button>
  );
}

interface AccordionContentProps {
  className?: string;
  children: React.ReactNode;
}

export function AccordionContent({ className, children }: AccordionContentProps) {
  const { openItems } = useAccordion();
  const accordionItem = React.useContext(AccordionItemContext);
  
  if (!accordionItem) {
    throw new Error('AccordionContent must be used within an AccordionItem');
  }

  const isOpen = openItems.includes(accordionItem.value);

  return (
    <div
      className={cn(
        'overflow-hidden text-sm transition-all',
        isOpen ? 'animate-accordion-down' : 'animate-accordion-up',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
    >
      <div className="pb-4 pt-0">
        {children}
      </div>
    </div>
  );
}

