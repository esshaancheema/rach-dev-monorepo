'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';

interface TrustIndicatorsProps {
  location?: {
    city: string;
    country: string;
    region?: string;
  };
}

const globalStats = {
  projectsDelivered: 847,
  happyClients: 312,
  countries: 25,
  averageRating: 4.9,
  uptime: 99.9,
  teamSize: 156
};

const locationStats = {
  'new-york': { projects: 89, clients: 34, teamSize: 12 },
  'san-francisco': { projects: 76, clients: 28, teamSize: 15 },
  'london': { projects: 45, clients: 18, teamSize: 8 },
  'dubai': { projects: 34, clients: 14, teamSize: 6 },
  'singapore': { projects: 28, clients: 11, teamSize: 5 },
  'mumbai': { projects: 67, clients: 25, teamSize: 18 },
  'bangalore': { projects: 78, clients: 32, teamSize: 22 },
  'default': { projects: 15, clients: 8, teamSize: 3 }
};

const testimonials = [
  {
    text: "Zoptal built our entire SaaS platform in just 3 days. Incredible speed and quality!",
    author: "Sarah Chen",
    position: "CTO, TechStartup",
    company: "GrowthLabs",
    rating: 5,
    location: "San Francisco"
  },
  {
    text: "The AI-powered development is revolutionary. What used to take months now takes hours.",
    author: "Michael Rodriguez", 
    position: "Lead Developer",
    company: "InnovateInc",
    rating: 5,
    location: "New York"
  },
  {
    text: "Outstanding quality and speed. Our mobile app launched 3 months ahead of schedule.",
    author: "Emily Watson",
    position: "Product Manager", 
    company: "RetailPro",
    rating: 5,
    location: "London"
  }
];

const trustedCompanies = [
  { name: 'Microsoft', logo: '🏢' },
  { name: 'Google', logo: '🔍' },
  { name: 'Amazon', logo: '📦' },
  { name: 'Stripe', logo: '💳' },
  { name: 'Shopify', logo: '🛒' },
  { name: 'Airbnb', logo: '🏠' }
];

export function TrustIndicators({ location }: TrustIndicatorsProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [localStats, setLocalStats] = useState(locationStats.default);

  // Get location-specific stats
  useEffect(() => {
    if (location?.city) {
      const cityKey = location.city.toLowerCase().replace(/\s+/g, '-');
      setLocalStats(locationStats[cityKey as keyof typeof locationStats] || locationStats.default);
    }
  }, [location]);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="space-y-12">
      {/* Live Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(globalStats.projectsDelivered)}+
          </div>
          <div className="text-sm text-gray-600">Projects Delivered</div>
          {location && (
            <div className="text-xs text-blue-600 mt-1">
              {localStats.projects}+ in {location.city}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <UserGroupIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(globalStats.happyClients)}+
          </div>
          <div className="text-sm text-gray-600">Happy Clients</div>
          {location && (
            <div className="text-xs text-green-600 mt-1">
              {localStats.clients}+ in {location.city}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <GlobeAltIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {globalStats.countries}+
          </div>
          <div className="text-sm text-gray-600">Countries</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <StarIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {globalStats.averageRating}/5
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
          <div className="flex justify-center mt-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-3 h-3 text-yellow-400" />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <ClockIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {globalStats.uptime}%
          </div>
          <div className="text-sm text-gray-600">Uptime</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(globalStats.teamSize)}+
          </div>
          <div className="text-sm text-gray-600">Team Members</div>
          {location && (
            <div className="text-xs text-indigo-600 mt-1">
              {localStats.teamSize}+ local
            </div>
          )}
        </motion.div>
      </div>

      {/* Featured Testimonial */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
        <motion.div
          key={currentTestimonial}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
              <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
            ))}
          </div>
          
          <blockquote className="text-lg text-gray-700 italic mb-6 max-w-2xl mx-auto">
            "{testimonials[currentTestimonial].text}"
          </blockquote>
          
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {testimonials[currentTestimonial].author.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">
                {testimonials[currentTestimonial].author}
              </div>
              <div className="text-sm text-gray-600">
                {testimonials[currentTestimonial].position}, {testimonials[currentTestimonial].company}
              </div>
              <div className="text-xs text-blue-600">
                📍 {testimonials[currentTestimonial].location}
              </div>
            </div>
          </div>

          {/* Testimonial Navigation Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Trusted By Companies */}
      <div className="text-center">
        <p className="text-gray-600 mb-6">Trusted by leading companies worldwide</p>
        <div className="flex items-center justify-center space-x-8 opacity-60">
          {trustedCompanies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span className="text-2xl">{company.logo}</span>
              <span className="font-semibold">{company.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Security & Compliance Badge */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-6 bg-white rounded-full px-6 py-3 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">SOC 2 Certified</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">GDPR Compliant</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">ISO 27001</span>
          </div>
        </div>
      </div>

      {/* Live Activity Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">
            {Math.floor(Math.random() * 500) + 800} developers building right now
          </span>
        </div>
      </div>
    </div>
  );
}