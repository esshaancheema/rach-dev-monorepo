'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRightIcon, SparklesIcon, FireIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export interface MegaMenuItem {
  name: string;
  href: string;
  description?: string;
  isNew?: boolean;
  isPopular?: boolean;
  icon?: React.ComponentType<any>;
}

export interface MegaMenuSection {
  title: string;
  items: MegaMenuItem[];
  featured?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

interface MegaMenuProps {
  sections: MegaMenuSection[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  layout?: 'default' | 'wide' | 'compact';
}

const colorVariants = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  red: 'bg-red-50 border-red-200 text-red-700',
};

const MegaMenu = ({ 
  sections, 
  isOpen, 
  onClose, 
  className = '', 
  layout = 'default' 
}: MegaMenuProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const getGridCols = () => {
    switch (layout) {
      case 'wide': return 'grid-cols-4';
      case 'compact': return 'grid-cols-2';
      default: return 'grid-cols-3';
    }
  };

  const menuVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.25,
        ease: [0.04, 0.62, 0.23, 0.98]
      }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
        ease: 'easeOut'
      }
    }),
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 z-40"
            onClick={onClose}
          />

          {/* Mega Menu */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
            className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden ${className}`}
            style={{
              width: layout === 'wide' ? '1200px' : layout === 'compact' ? '600px' : '900px',
              maxWidth: '95vw',
            }}
          >
            <div className="p-8">
              <div className={`grid ${getGridCols()} gap-8`}>
                {sections.map((section, sectionIndex) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: sectionIndex * 0.1 }
                    }}
                    className="relative"
                  >
                    {/* Section Header */}
                    <div className="mb-4">
                      <h3 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${
                        section.featured 
                          ? 'text-primary-600' 
                          : 'text-gray-500'
                      }`}>
                        {section.title}
                        {section.featured && (
                          <SparklesIcon className="inline-block w-4 h-4 ml-1 text-primary-500" />
                        )}
                      </h3>
                      {section.featured && (
                        <div className="w-12 h-0.5 bg-gradient-to-r from-primary-500 to-transparent mb-3" />
                      )}
                    </div>

                    {/* Section Items */}
                    <div className="space-y-1">
                      {section.items.map((item, itemIndex) => (
                        <motion.div
                          key={item.href}
                          custom={itemIndex}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Link
                            href={item.href}
                            className={`group block p-3 -m-3 rounded-lg transition-all duration-200 ${
                              hoveredItem === item.href
                                ? 'bg-gray-50 shadow-sm'
                                : 'hover:bg-gray-50'
                            }`}
                            onMouseEnter={() => setHoveredItem(item.href)}
                            onMouseLeave={() => setHoveredItem(null)}
                            onClick={onClose}
                          >
                            <span className="flex items-center justify-between">
                              <span className="flex-1 min-w-0">
                                <span className="flex items-center space-x-2">
                                  {item.icon && (
                                    <item.icon className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                  )}
                                  <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                                    {item.name}
                                  </span>

                                  {/* Badges */}
                                  <span className="flex items-center space-x-1">
                                    {item.isNew && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        New
                                      </span>
                                    )}
                                    {item.isPopular && (
                                      <FireIcon className="w-3 h-3 text-orange-500" />
                                    )}
                                  </span>
                                </span>

                                {item.description && (
                                  <span className="text-xs text-gray-500 mt-1 line-clamp-2 block">
                                    {item.description}
                                  </span>
                                )}
                              </span>

                              <ChevronRightIcon
                                className={`w-4 h-4 text-gray-300 group-hover:text-primary-400 transition-all duration-200 ${
                                  hoveredItem === item.href ? 'translate-x-1' : ''
                                }`}
                              />
                            </span>
                          </Link>
                        </motion.div>
                      ))}
                    </div>

                    {/* Featured Section Badge */}
                    {section.featured && section.color && (
                      <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium border ${colorVariants[section.color]}`}>
                        Featured
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Call to Action Footer */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Need a custom solution?
                    </p>
                    <p className="text-xs text-gray-500">
                      Get a personalized quote for your project
                    </p>
                  </div>
                  <Link
                    href="/get-quote"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    Get Quote
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MegaMenu;