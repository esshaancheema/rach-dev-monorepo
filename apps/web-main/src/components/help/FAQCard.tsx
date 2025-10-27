'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { FAQ } from '@/lib/help/types';
import { getHelpCategoryBySlug } from '@/lib/help/data';

interface FAQCardProps {
  faq: FAQ;
  showCategory?: boolean;
  defaultOpen?: boolean;
}

export default function FAQCard({ faq, showCategory = true, defaultOpen = false }: FAQCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const category = getHelpCategoryBySlug(faq.categoryId);
  const helpfulPercentage = Math.round((faq.helpful / (faq.helpful + faq.notHelpful)) * 100);

  const handleHelpfulClick = (isHelpful: boolean) => {
    setHelpful(isHelpful);
    // In a real app, you'd send this to your analytics
    console.info(`FAQ ${faq.id} marked as ${isHelpful ? 'helpful' : 'not helpful'}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* FAQ Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {showCategory && category && (
              <div className="flex items-center mb-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.color.replace('bg-', 'bg-').replace('-500', '-100')} ${category.color.replace('bg-', 'text-').replace('-500', '-800')}`}>
                  {category.icon} {category.name}
                </span>
                {faq.featured && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ml-2">
                    ⭐ Popular
                  </span>
                )}
              </div>
            )}
            
            <h3 className="text-lg font-semibold text-gray-900 pr-4">
              {faq.question}
            </h3>
            
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <div className="flex items-center mr-4">
                <HandThumbUpIcon className="h-3 w-3 mr-1" />
                {helpfulPercentage}% helpful
              </div>
              <time dateTime={faq.lastUpdated}>
                Updated {new Date(faq.lastUpdated).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </div>
          </div>
          
          <div className="flex-shrink-0 ml-4">
            {isOpen ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
      </button>

      {/* FAQ Answer */}
      {isOpen && (
        <div className="border-t border-gray-200">
          <div className="px-6 py-4">
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-700 whitespace-pre-line">
                {faq.answer}
              </div>
            </div>
            
            {/* Tags */}
            {faq.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t border-gray-100">
                {faq.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Helpful Feedback */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Was this helpful?
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleHelpfulClick(true)}
                  className={`inline-flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                    helpful === true
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  <HandThumbUpIcon className="h-4 w-4 mr-1" />
                  Yes
                </button>
                
                <button
                  onClick={() => handleHelpfulClick(false)}
                  className={`inline-flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                    helpful === false
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  <HandThumbDownIcon className="h-4 w-4 mr-1" />
                  No
                </button>
                
                {helpful !== null && (
                  <span className="text-xs text-gray-500 ml-2">
                    Thank you for your feedback!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}