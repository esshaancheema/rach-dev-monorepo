'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  CpuChipIcon,
  CloudIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useIndustryDetection } from '@/hooks/useIndustryDetection';
import { useAnalytics } from '@/hooks/useAnalytics';
import { HeroImage } from '@/components/ui/OptimizedImage';

interface ServiceShowcaseProps {
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
}

interface ServiceDemo {
  id: string;
  title: string;
  description: string;
  icon: any;
  features: string[];
  tech: string[];
  image: string;
  video?: string;
  cta: {
    text: string;
    href: string;
  };
  metrics: {
    label: string;
    value: string;
  }[];
}

const services: ServiceDemo[] = [
  {
    id: 'web-development',
    title: 'Custom Web Development',
    description: 'Responsive, scalable web applications built with modern frameworks and best practices.',
    icon: GlobeAltIcon,
    features: [
      'Responsive Design',
      'SEO Optimized',
      'Performance Focused',
      'Modern Frameworks',
      'API Integration',
      'Security First'
    ],
    tech: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    image: '/images/services/web-development-hero.jpg',
    cta: {
      text: 'Start Web Project',
      href: '/services/web-development'
    },
    metrics: [
      { label: 'Load Time', value: '<2s' },
      { label: 'Performance Score', value: '99/100' },
      { label: 'Projects', value: '200+' }
    ]
  },
  {
    id: 'mobile-development',
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile apps that deliver exceptional user experiences.',
    icon: DevicePhoneMobileIcon,
    features: [
      'Cross-Platform',
      'Native Performance',
      'Offline Support',
      'Push Notifications',
      'In-App Purchases',
      'App Store Ready'
    ],
    tech: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'GraphQL'],
    image: '/images/services/mobile-app-showcase.jpg',
    cta: {
      text: 'Build Mobile App',
      href: '/services/mobile-development'
    },
    metrics: [
      { label: 'App Store Rating', value: '4.8★' },
      { label: 'Downloads', value: '1M+' },
      { label: 'Apps Built', value: '150+' }
    ]
  },
  {
    id: 'ai-development',
    title: 'AI & Machine Learning',
    description: 'Intelligent solutions powered by cutting-edge AI and machine learning technologies.',
    icon: CpuChipIcon,
    features: [
      'Custom AI Models',
      'Natural Language Processing',
      'Computer Vision',
      'Predictive Analytics',
      'Recommendation Systems',
      'MLOps Pipeline'
    ],
    tech: ['Python', 'TensorFlow', 'PyTorch', 'Hugging Face', 'OpenAI', 'AWS ML'],
    image: '/images/services/ai-development-hero.jpg',
    cta: {
      text: 'Explore AI Solutions',
      href: '/services/ai-development'
    },
    metrics: [
      { label: 'Accuracy', value: '96%' },
      { label: 'Models Trained', value: '50+' },
      { label: 'AI Projects', value: '80+' }
    ]
  },
  {
    id: 'cloud-solutions',
    title: 'Cloud Infrastructure',
    description: 'Scalable, secure cloud solutions with automated deployment and monitoring.',
    icon: CloudIcon,
    features: [
      'Auto Scaling',
      'Load Balancing',
      'CI/CD Pipeline',
      '99.9% Uptime',
      'Disaster Recovery',
      'Cost Optimization'
    ],
    tech: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Monitoring'],
    image: '/images/services/cloud-infrastructure.jpg',
    cta: {
      text: 'Migrate to Cloud',
      href: '/services/cloud-solutions'
    },
    metrics: [
      { label: 'Uptime', value: '99.99%' },
      { label: 'Cost Reduction', value: '40%' },
      { label: 'Deployments', value: '1000+' }
    ]
  },
  {
    id: 'custom-software',
    title: 'Enterprise Software',
    description: 'Tailored enterprise solutions designed to streamline your business operations.',
    icon: CodeBracketIcon,
    features: [
      'Custom Workflows',
      'Integration Ready',
      'Scalable Architecture',
      'User Management',
      'Reporting & Analytics',
      'Security Compliance'
    ],
    tech: ['Java', 'Spring', 'PostgreSQL', 'Redis', 'Elasticsearch', 'Microservices'],
    image: '/images/services/enterprise-software.jpg',
    cta: {
      text: 'Custom Solution',
      href: '/services/custom-software-development'
    },
    metrics: [
      { label: 'Efficiency Gain', value: '60%' },
      { label: 'Users Served', value: '10K+' },
      { label: 'Systems Built', value: '100+' }
    ]
  }
];

export default function ServiceShowcase({ 
  className, 
  autoPlay = true, 
  showControls = true 
}: ServiceShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  
  const { industry, industryContent } = useIndustryDetection();
  const { trackEvent } = useAnalytics();

  const currentService = services[currentIndex];

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % services.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Preload images
  useEffect(() => {
    services.forEach((service, index) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, index]));
      };
      img.src = service.image;
    });
  }, []);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % services.length);
    trackEvent('service_showcase_next', 'engagement', 'service_showcase', currentService.id);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
    trackEvent('service_showcase_prev', 'engagement', 'service_showcase', currentService.id);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    trackEvent('service_showcase_select', 'engagement', 'service_showcase', services[index].id);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    trackEvent(isPlaying ? 'service_showcase_pause' : 'service_showcase_play', 'engagement', 'service_showcase');
  };

  const handleCTAClick = (service: ServiceDemo) => {
    trackEvent('service_cta_click', 'conversion', 'service_showcase', service.id, 1, {
      service: service.title,
      industry
    });
  };

  return (
    <div className={cn("relative w-full max-w-7xl mx-auto", className)}>
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
        >
          Interactive Service Showcase
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600 max-w-3xl mx-auto"
        >
          Explore our comprehensive development services with live previews and real project metrics
        </motion.p>
      </div>

      <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left Column - Service Info */}
          <div className="p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="text-white"
              >
                {/* Service Icon & Title */}
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mr-4">
                    <currentService.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">{currentService.title}</h3>
                    <div className="flex items-center space-x-2">
                      <ShieldCheckIcon className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-400">Enterprise Ready</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  {currentService.description}
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {currentService.features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + (index * 0.05) }}
                      className="flex items-center text-sm text-gray-300"
                    >
                      <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                      {feature}
                    </motion.div>
                  ))}
                </div>

                {/* Tech Stack */}
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">TECHNOLOGY STACK</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentService.tech.map((tech, index) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + (index * 0.05) }}
                        className="px-3 py-1 bg-blue-600/20 text-blue-300 text-xs font-medium rounded-full border border-blue-600/30"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {currentService.metrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (index * 0.1) }}
                      className="text-center p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="text-2xl font-bold text-white mb-1">
                        {metric.value}
                      </div>
                      <div className="text-xs text-gray-400">
                        {metric.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.a
                  href={currentService.cta.href}
                  onClick={() => handleCTAClick(currentService)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  {currentService.cta.text}
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </motion.a>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column - Visual Preview */}
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-200">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                {loadedImages.has(currentIndex) ? (
                  <HeroImage
                    src={currentService.image}
                    alt={currentService.title}
                    fill
                    className="object-cover"
                    priority={currentIndex === 0}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 animate-pulse flex items-center justify-center">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                )}
                
                {/* Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Industry-Specific Badge */}
            <div className="absolute top-6 right-6 z-10">
              <div className="px-3 py-2 bg-black/70 backdrop-blur-sm text-white text-sm font-medium rounded-lg border border-white/20">
                Perfect for {industryContent.title}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        {showControls && (
          <>
            {/* Navigation Arrows */}
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Previous service"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Next service"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>

            {/* Bottom Controls */}
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <div className="flex items-center justify-between">
                {/* Slide Indicators */}
                <div className="flex space-x-2">
                  {services.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all duration-300",
                        index === currentIndex
                          ? "bg-blue-500 scale-125"
                          : "bg-white/50 hover:bg-white/70"
                      )}
                      aria-label={`Go to service ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <PauseIcon className="h-5 w-5" />
                  ) : (
                    <PlayIcon className="h-5 w-5 ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentIndex + 1) / services.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}