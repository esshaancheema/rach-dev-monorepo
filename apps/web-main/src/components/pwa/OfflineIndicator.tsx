// Offline Status Indicator Component
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { analytics } from '@/lib/analytics/tracker';

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom';
  showOnlineMessage?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function OfflineIndicator({
  position = 'top',
  showOnlineMessage = true,
  autoHide = true,
  autoHideDelay = 3000
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);
  const [offlineDuration, setOfflineDuration] = useState(0);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      const wasOffline = !isOnline;
      setIsOnline(true);
      
      if (wasOffline && lastOfflineTime) {
        const duration = Date.now() - lastOfflineTime.getTime();
        setOfflineDuration(duration);
        
        analytics.track({
          name: 'connection_restored',
          category: 'user_interaction',
          properties: {
            offline_duration: Math.round(duration / 1000),
            offline_started: lastOfflineTime.toISOString()
          }
        });
      }

      if (showOnlineMessage) {
        setShowIndicator(true);
        
        if (autoHide) {
          setTimeout(() => setShowIndicator(false), autoHideDelay);
        }
      }
      
      // Clear offline time
      setLastOfflineTime(null);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      setLastOfflineTime(new Date());
      
      analytics.track({
        name: 'connection_lost',
        category: 'user_interaction',
        properties: {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        }
      });
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity check
    const checkConnectivity = async () => {
      try {
        // Try to fetch a small resource to verify actual connectivity
        const response = await fetch('/api/health-check', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        const actuallyOnline = response.ok;
        
        if (actuallyOnline !== isOnline) {
          if (actuallyOnline) {
            handleOnline();
          } else {
            handleOffline();
          }
        }
      } catch (error) {
        // Network request failed, we're likely offline
        if (isOnline) {
          handleOffline();
        }
      }
    };

    // Check connectivity every 30 seconds
    const connectivityInterval = setInterval(checkConnectivity, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectivityInterval);
    };
  }, [isOnline, lastOfflineTime, showOnlineMessage, autoHide, autoHideDelay]);

  const handleRetry = async () => {
    try {
      // Attempt to reconnect
      const response = await fetch('/api/health-check', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        setIsOnline(true);
        setShowIndicator(false);
        
        analytics.track({
          name: 'manual_reconnect_success',
          category: 'user_interaction'
        });
      }
    } catch (error) {
      analytics.track({
        name: 'manual_reconnect_failed',
        category: 'user_interaction'
      });
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0'
  };

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ 
            opacity: 0, 
            y: position === 'top' ? -100 : 100 
          }}
          animate={{ 
            opacity: 1, 
            y: 0 
          }}
          exit={{ 
            opacity: 0, 
            y: position === 'top' ? -100 : 100 
          }}
          className={`fixed ${positionClasses[position]} z-50`}
        >
          <div className={`
            px-4 py-3 text-center text-sm font-medium
            ${isOnline 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
            }
          `}>
            <div className="flex items-center justify-center space-x-2 max-w-4xl mx-auto">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>
                    Connection restored
                    {offlineDuration > 0 && (
                      <span className="ml-1 opacity-90">
                        (was offline for {formatDuration(offlineDuration)})
                      </span>
                    )}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>You're offline. Some features may not work.</span>
                  <button
                    onClick={handleRetry}
                    className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                </>
              )}
              
              {!isOnline && (
                <button
                  onClick={() => setShowIndicator(false)}
                  className="ml-2 text-white hover:text-gray-200 transition-colors"
                  aria-label="Dismiss"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for offline status
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setLastOfflineTime(null);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastOfflineTime(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, lastOfflineTime };
}

// Offline Notice Component for specific features
export function OfflineNotice({ 
  feature, 
  fallbackMessage 
}: { 
  feature: string; 
  fallbackMessage?: string;
}) {
  const { isOnline } = useOfflineStatus();

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Offline Mode
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            {fallbackMessage || `${feature} requires an internet connection. Please check your connection and try again.`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Offline Storage Hook
export function useOfflineStorage(key: string) {
  const [data, setData] = useState<any>(null);
  const { isOnline } = useOfflineStatus();

  const saveOffline = (value: any) => {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data: value,
        timestamp: Date.now()
      }));
      setData(value);
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  };

  const loadOffline = () => {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(parsed.data);
        return parsed.data;
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
    return null;
  };

  const clearOffline = () => {
    try {
      localStorage.removeItem(`offline_${key}`);
      setData(null);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  };

  useEffect(() => {
    loadOffline();
  }, [key]);

  return {
    data,
    saveOffline,
    loadOffline,
    clearOffline,
    isOnline
  };
}