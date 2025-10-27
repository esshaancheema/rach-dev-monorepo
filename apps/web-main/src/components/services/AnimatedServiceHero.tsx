'use client';

import { motion } from 'framer-motion';
import { RocketLaunchIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface AnimatedServiceHeroProps {
  title: string;
  subtitle: string;
  description: string;
}

export default function AnimatedServiceHero({ title, subtitle, description }: AnimatedServiceHeroProps) {
  return (
    <div className="text-center max-w-4xl mx-auto">
      <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
        <span>Our Services</span>
      </div>

      <motion.h1
        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {title}
        <br />
        <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          {subtitle}
        </span>
      </motion.h1>

      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        {description}
      </p>

      {/* Service Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
          <div className="text-gray-600 text-sm">Projects Delivered</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">98%</div>
          <div className="text-gray-600 text-sm">Client Satisfaction</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
          <div className="text-gray-600 text-sm">Expert Developers</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
          <div className="text-gray-600 text-sm">Support</div>
        </div>
      </motion.div>

      <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link
          href="/contact"
          className="inline-flex items-center justify-center space-x-2 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl"
        >
          <span>Start Your Project</span>
          <RocketLaunchIcon className="w-5 h-5" />
        </Link>
        <Link
          href="#services"
          className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg border border-primary-200 hover:bg-primary-50 transition-all font-semibold"
        >
          <span>Explore Services</span>
          <ArrowRightIcon className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  );
}