'use client';

import { useCallback, useRef, useEffect } from 'react';

/**
 * Animation Performance Metrics Interface
 */
interface AnimationMetrics {
  name: string;
  duration: number;
  fps: number;
  startTime: number;
  endTime: number;
  frameCount: number;
  droppedFrames: number;
  memoryUsage?: number;
  viewport: {
    width: number;
    height: number;
  };
  userAgent: string;
  reducedMotion: boolean;
}

/**
 * Performance Tracking State
 */
interface PerformanceState {
  startTime: number;
  endTime: number;
  frameCount: number;
  lastFrameTime: number;
  isTracking: boolean;
  frameCallback?: number;
}

/**
 * Google Analytics 4 Event Structure for Animations
 */
interface GA4AnimationEvent {
  event_name: 'animation_performance' | 'animation_error' | 'animation_completion';
  animation_name: string;
  duration_ms: number;
  fps?: number;
  dropped_frames?: number;
  page_path: string;
  timestamp: number;
  user_preference: 'motion' | 'reduced_motion';
  device_type: 'mobile' | 'tablet' | 'desktop';
  performance_grade: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * useAnimationMetrics Hook
 * 
 * Comprehensive animation performance monitoring for enterprise applications.
 * Tracks frame rates, durations, memory usage, and sends data to Google Analytics 4.
 * 
 * @param animationName - Unique identifier for the animation
 * @param options - Configuration options
 * @returns Object with tracking methods and current metrics
 * 
 * @example
 * ```tsx
 * const MyAnimatedComponent = () => {
 *   const { startTracking, endTracking, metrics } = useAnimationMetrics('product_card_hover');
 *   
 *   return (
 *     <MotionDiv
 *       onAnimationStart={startTracking}
 *       onAnimationComplete={endTracking}
 *       whileHover={{ scale: 1.05 }}
 *     >
 *       Content
 *     </MotionDiv>
 *   );
 * };
 * ```
 */
export function useAnimationMetrics(
  animationName: string,
  options: {
    trackFrameRate?: boolean;
    trackMemoryUsage?: boolean;
    enableLogging?: boolean;
    sendToGA4?: boolean;
  } = {}
) {
  const {
    trackFrameRate = true,
    trackMemoryUsage = true,
    enableLogging = process.env.NODE_ENV === 'development',
    sendToGA4 = process.env.NODE_ENV === 'production',
  } = options;

  const performanceRef = useRef<PerformanceState>({
    startTime: 0,
    endTime: 0,
    frameCount: 0,
    lastFrameTime: 0,
    isTracking: false,
  });

  const metricsRef = useRef<Partial<AnimationMetrics>>({});

  /**
   * Start tracking animation performance
   */
  const startTracking = useCallback(() => {
    const startTime = performance.now();
    performanceRef.current = {
      startTime,
      endTime: 0,
      frameCount: 0,
      lastFrameTime: startTime,
      isTracking: true,
    };

    // Initialize metrics
    metricsRef.current = {
      name: animationName,
      startTime,
      frameCount: 0,
      droppedFrames: 0,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      userAgent: navigator.userAgent,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };

    // Start frame rate tracking
    if (trackFrameRate) {
      const trackFrame = () => {
        if (!performanceRef.current.isTracking) return;

        performanceRef.current.frameCount++;
        performanceRef.current.lastFrameTime = performance.now();
        performanceRef.current.frameCallback = requestAnimationFrame(trackFrame);
      };
      performanceRef.current.frameCallback = requestAnimationFrame(trackFrame);
    }

    if (enableLogging) {
      console.debug(`🎬 Animation tracking started: ${animationName}`);
    }
  }, [animationName, trackFrameRate, enableLogging]);

  /**
   * End tracking and calculate metrics
   */
  const endTracking = useCallback(() => {
    if (!performanceRef.current.isTracking) return;

    const endTime = performance.now();
    const duration = endTime - performanceRef.current.startTime;
    const frameCount = performanceRef.current.frameCount;

    // Cancel frame tracking
    if (performanceRef.current.frameCallback) {
      cancelAnimationFrame(performanceRef.current.frameCallback);
    }

    // Calculate frame rate (frames per second)
    const fps = frameCount > 0 ? (frameCount / (duration / 1000)) : 0;
    
    // Estimate dropped frames (assuming 60fps target)
    const expectedFrames = Math.round((duration / 1000) * 60);
    const droppedFrames = Math.max(0, expectedFrames - frameCount);

    // Get memory usage if available and requested
    let memoryUsage: number | undefined;
    if (trackMemoryUsage && 'memory' in performance) {
      memoryUsage = (performance as any).memory?.usedJSHeapSize;
    }

    // Complete metrics object
    const metrics: AnimationMetrics = {
      name: animationName,
      duration,
      fps,
      startTime: performanceRef.current.startTime,
      endTime,
      frameCount,
      droppedFrames,
      memoryUsage,
      viewport: metricsRef.current.viewport!,
      userAgent: metricsRef.current.userAgent!,
      reducedMotion: metricsRef.current.reducedMotion!,
    };

    // Update refs
    performanceRef.current.isTracking = false;
    performanceRef.current.endTime = endTime;
    metricsRef.current = metrics;

    // Log performance data
    if (enableLogging) {
      console.group(`🎯 Animation Performance: ${animationName}`);
      console.log(`Duration: ${duration.toFixed(2)}ms`);
      console.log(`Frame Rate: ${fps.toFixed(1)} fps`);
      console.log(`Dropped Frames: ${droppedFrames}`);
      if (memoryUsage) {
        console.log(`Memory Usage: ${(memoryUsage / 1048576).toFixed(2)}MB`);
      }
      console.groupEnd();
    }

    // Send to Google Analytics 4
    if (sendToGA4) {
      sendAnimationMetricsToGA4(metrics);
    }

    return metrics;
  }, [animationName, trackMemoryUsage, enableLogging, sendToGA4]);

  /**
   * Get current metrics (useful for real-time monitoring)
   */
  const getCurrentMetrics = useCallback(() => {
    if (!performanceRef.current.isTracking) {
      return metricsRef.current;
    }

    const currentTime = performance.now();
    const duration = currentTime - performanceRef.current.startTime;
    const fps = performanceRef.current.frameCount > 0 
      ? (performanceRef.current.frameCount / (duration / 1000)) 
      : 0;

    return {
      ...metricsRef.current,
      duration,
      fps,
      frameCount: performanceRef.current.frameCount,
    };
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (performanceRef.current.frameCallback) {
        cancelAnimationFrame(performanceRef.current.frameCallback);
      }
    };
  }, []);

  return {
    startTracking,
    endTracking,
    getCurrentMetrics,
    metrics: metricsRef.current,
    isTracking: performanceRef.current.isTracking,
  };
}

/**
 * Send animation metrics to Google Analytics 4
 */
function sendAnimationMetricsToGA4(metrics: AnimationMetrics) {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  // Determine performance grade
  const performanceGrade = getPerformanceGrade(metrics.fps, metrics.droppedFrames);
  
  // Determine device type
  const deviceType = getDeviceType(metrics.viewport.width);

  // Create GA4 event
  const ga4Event: GA4AnimationEvent = {
    event_name: 'animation_performance',
    animation_name: metrics.name,
    duration_ms: Math.round(metrics.duration),
    fps: Math.round(metrics.fps),
    dropped_frames: metrics.droppedFrames,
    page_path: window.location.pathname,
    timestamp: Date.now(),
    user_preference: metrics.reducedMotion ? 'reduced_motion' : 'motion',
    device_type: deviceType,
    performance_grade: performanceGrade,
  };

  // Send to Google Analytics 4
  window.gtag('event', 'animation_performance', {
    custom_parameter_1: ga4Event.animation_name,
    custom_parameter_2: ga4Event.duration_ms,
    custom_parameter_3: ga4Event.fps,
    custom_parameter_4: ga4Event.performance_grade,
    custom_parameter_5: ga4Event.device_type,
  });

  // Also send as custom event for detailed tracking
  window.gtag('event', 'custom_animation_metrics', ga4Event);
}

/**
 * Determine performance grade based on FPS and dropped frames
 */
function getPerformanceGrade(
  fps: number, 
  droppedFrames: number
): 'excellent' | 'good' | 'fair' | 'poor' {
  if (fps >= 55 && droppedFrames <= 2) return 'excellent';
  if (fps >= 45 && droppedFrames <= 5) return 'good';
  if (fps >= 30 && droppedFrames <= 10) return 'fair';
  return 'poor';
}

/**
 * Determine device type based on viewport width
 */
function getDeviceType(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * useAnimationHealth Hook
 * 
 * Monitors overall animation health across the application.
 * Useful for detecting performance issues and optimizing animations.
 * 
 * @returns Object with health metrics and monitoring functions
 */
export function useAnimationHealth() {
  const healthMetrics = useRef({
    totalAnimations: 0,
    averageFPS: 0,
    totalDroppedFrames: 0,
    performanceGrades: {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
    },
  });

  const recordAnimation = useCallback((metrics: AnimationMetrics) => {
    const health = healthMetrics.current;
    
    health.totalAnimations++;
    health.averageFPS = 
      (health.averageFPS * (health.totalAnimations - 1) + metrics.fps) / health.totalAnimations;
    health.totalDroppedFrames += metrics.droppedFrames;
    
    const grade = getPerformanceGrade(metrics.fps, metrics.droppedFrames);
    health.performanceGrades[grade]++;

    // Send health summary to GA4 periodically
    if (health.totalAnimations % 10 === 0) {
      sendHealthSummaryToGA4(health);
    }
  }, []);

  const getHealthSummary = useCallback(() => {
    return { ...healthMetrics.current };
  }, []);

  return {
    recordAnimation,
    getHealthSummary,
    healthMetrics: healthMetrics.current,
  };
}

/**
 * Send animation health summary to GA4
 */
function sendHealthSummaryToGA4(health: typeof healthMetrics.current) {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', 'animation_health_summary', {
    total_animations: health.totalAnimations,
    average_fps: Math.round(health.averageFPS),
    total_dropped_frames: health.totalDroppedFrames,
    excellent_count: health.performanceGrades.excellent,
    good_count: health.performanceGrades.good,
    fair_count: health.performanceGrades.fair,
    poor_count: health.performanceGrades.poor,
    timestamp: Date.now(),
  });
}

/**
 * Track Core Web Vitals impact from animations
 */
export function trackAnimationCLS(animationName: string) {
  if (typeof window === 'undefined') return;

  // Observe layout shifts during animations
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'layout-shift' && entry.value > 0) {
        // Send CLS impact to GA4
        if (window.gtag) {
          window.gtag('event', 'animation_cls_impact', {
            animation_name: animationName,
            cls_value: entry.value,
            page_path: window.location.pathname,
            timestamp: Date.now(),
          });
        }
      }
    });
  });

  observer.observe({ entryTypes: ['layout-shift'] });

  // Return cleanup function
  return () => observer.disconnect();
}