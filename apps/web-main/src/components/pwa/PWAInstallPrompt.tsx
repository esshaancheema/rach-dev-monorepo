// PWA Install Prompt Component
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Chrome } from 'lucide-react';
import { analytics } from '@/lib/analytics/tracker';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  showDelay?: number;
  autoShow?: boolean;
  position?: 'top' | 'bottom' | 'center';
  theme?: 'light' | 'dark' | 'auto';
}

export function PWAInstallPrompt({ 
  showDelay = 3000,
  autoShow = true,
  position = 'bottom',
  theme = 'auto'
}: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);

  useEffect(() => {
    // Check if PWA is already installed
    const checkInstallation = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    // Check PWA support
    const checkSupport = () => {
      setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
    };

    checkInstallation();
    checkSupport();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      if (autoShow) {
        setTimeout(() => {
          setShowPrompt(true);
        }, showDelay);
      }

      analytics.track({
        name: 'pwa_install_prompt_available',
        category: 'user_interaction',
        properties: {
          platform: (e as BeforeInstallPromptEvent).platforms
        }
      });
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);

      analytics.track({
        name: 'pwa_installed',
        category: 'user_interaction',
        properties: {
          source: 'browser_prompt'
        }
      });

      // Show success message
      showInstallSuccessMessage();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [autoShow, showDelay]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback to manual install guide
      setInstallGuideOpen(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      analytics.track({
        name: 'pwa_install_prompt_response',
        category: 'user_interaction',
        properties: {
          outcome,
          source: 'custom_prompt'
        }
      });

      if (outcome === 'accepted') {
        setShowPrompt(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install prompt failed:', error);
      setInstallGuideOpen(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    
    analytics.track({
      name: 'pwa_install_prompt_dismissed',
      category: 'user_interaction'
    });

    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const showInstallSuccessMessage = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('App Installed Successfully!', {
        body: 'Zoptal has been added to your home screen. Access it anytime!',
        icon: '/images/icons/icon-192x192.png'
      });
    }
  };

  // Don't show if already installed, not supported, or dismissed this session
  if (isInstalled || !isSupported || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  const positionClasses = {
    top: 'top-4 left-4 right-4',
    bottom: 'bottom-4 left-4 right-4',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  return (
    <>
      {/* Install Prompt */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: position === 'bottom' ? 100 : -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: position === 'bottom' ? 100 : -100 }}
            className={`fixed z-50 ${positionClasses[position]} max-w-md mx-auto`}
          >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Install Zoptal App
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get faster access and offline support
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Works offline and loads faster
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Monitor className="w-4 h-4 mr-2" />
                  Native app-like experience
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Chrome className="w-4 h-4 mr-2" />
                  Push notifications for updates
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  Install App
                </button>
                <button
                  onClick={() => setInstallGuideOpen(true)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  How to Install
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Install Guide Modal */}
      <AnimatePresence>
        {installGuideOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setInstallGuideOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Install Zoptal App
                  </h2>
                  <button
                    onClick={() => setInstallGuideOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Chrome/Edge Instructions */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Chrome, Edge, or Samsung Internet
                    </h3>
                    <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                        Tap the menu button (⋮) in the top right corner
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                        Select "Add to Home screen" or "Install app"
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                        Tap "Add" to confirm the installation
                      </li>
                    </ol>
                  </div>

                  {/* Safari Instructions */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Safari (iOS)
                    </h3>
                    <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                        Tap the share button (□↑) at the bottom of the screen
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                        Scroll down and tap "Add to Home Screen"
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                        Tap "Add" to install the app
                      </li>
                    </ol>
                  </div>

                  {/* Firefox Instructions */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Firefox
                    </h3>
                    <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                        Tap the menu button (⋮) in the top right corner
                      </li>
                      <li className="flex items-start">
                        <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                        Select "Install" from the menu options
                      </li>
                      <li className="flex items-start">
                        <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                        Confirm the installation when prompted
                      </li>
                    </ol>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> The installed app will work offline and receive push notifications for updates and new features.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setInstallGuideOpen(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook for programmatic PWA install prompt
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      setDeferredPrompt(null);
      setCanInstall(false);
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Install failed:', error);
      return false;
    }
  };

  return { canInstall, install };
}