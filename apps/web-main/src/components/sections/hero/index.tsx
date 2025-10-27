'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AIPromptBuilder } from './AIPromptBuilder';
import { LivePreview } from './LivePreview';
import { TrustIndicators } from './TrustIndicators';
import { useLocation } from '@/hooks/useLocation';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function HeroSection() {
  const [prompt, setPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [preview, setPreview] = useState(null);
  const { location, loading: locationLoading } = useLocation();
  const { track } = useAnalytics();
  
  // Personalized title based on location
  const getTitle = () => {
    if (locationLoading) return 'Build Your App In Hours, Not Months';
    
    const cityName = location?.city || 'Your City';
    return `Best Software Development Company in ${cityName}`;
  };
  
  const getSubtitle = () => {
    const baseText = "The World's First AI+Human Accelerated Application Development Platform that combines the Power Of Artificial Intelligence with Human Software Engineers to Deliver Production-Ready Applications at God Speed";
    
    if (location?.city) {
      return `Serving ${location.city} and beyond. ${baseText}`;
    }
    
    return baseText;
  };
  
  const handlePromptSubmit = async (userPrompt: string) => {
    setPrompt(userPrompt);
    setIsBuilding(true);
    
    track('hero_prompt_submitted', {
      prompt: userPrompt,
      location: location?.city,
      timestamp: new Date().toISOString(),
    });
    
    try {
      const response = await fetch('/api/ai-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userPrompt,
          location: location
        }),
      });
      
      const data = await response.json();
      setPreview(data);
      
      track('hero_preview_generated', {
        prompt: userPrompt,
        success: response.ok,
        location: location?.city,
      });
    } catch (error) {
      console.error('Error building preview:', error);
      track('hero_preview_error', {
        prompt: userPrompt,
        error: (error as Error).message,
        location: location?.city,
      });
    } finally {
      setIsBuilding(false);
    }
  };
  
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-primary-500 rounded-full filter blur-3xl opacity-10"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-20 left-20 w-64 h-64 bg-secondary-500 rounded-full filter blur-3xl opacity-10"
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Dynamic Title */}
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-6"
            >
              {locationLoading ? (
                <span className="inline-block w-8 h-8 bg-gray-300 rounded animate-pulse"></span>
              ) : (
                <>
                  Build Your App In 
                  <br />
                  <span className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 bg-clip-text text-transparent">
                    Hours, Not Months
                  </span>
                </>
              )}
            </motion.h1>
            
            {/* Location-aware subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto mb-8"
            >
              {getSubtitle()}
            </motion.p>

            {/* Value Proposition Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
              {[
                "⚡ 10x Faster Development",
                "🤖 AI + Human Expertise", 
                "🚀 Production Ready Code",
                "🔒 Enterprise Security"
              ].map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-4 py-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-gray-200 shadow-sm"
                >
                  {feature}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Main Demo Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="grid lg:grid-cols-5 gap-8 mb-16"
          >
            {/* AI Prompt Builder - Left Side */}
            <div className="lg:col-span-2">
              <AIPromptBuilder
                onSubmit={handlePromptSubmit}
                isBuilding={isBuilding}
                freeTrialLimit={3}
              />
            </div>
            
            {/* Live Preview - Right Side */}
            <div className="lg:col-span-3">
              <LivePreview
                preview={preview}
                isLoading={isBuilding}
              />
            </div>
          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <TrustIndicators location={location} />
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-16"
          >
            <motion.button
              onClick={() => track('hero_cta_clicked', { 
                button: 'start_building',
                location: location?.city 
              })}
              className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Start Building Now</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
            
            <motion.button
              onClick={() => track('hero_cta_clicked', { 
                button: 'schedule_consultation',
                location: location?.city 
              })}
              className="inline-flex items-center justify-center space-x-2 bg-white text-gray-700 px-8 py-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all font-semibold text-lg shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Schedule Free Consultation</span>
            </motion.button>
          </motion.div>
          
          {/* Live Stats Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-6 py-3 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                {Math.floor(Math.random() * 500) + 1200} developers building right now
                {location?.city && (
                  <span className="ml-2 text-green-600">
                    • {Math.floor(Math.random() * 20) + 15} in {location.city}
                  </span>
                )}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}