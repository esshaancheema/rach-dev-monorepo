'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { useServiceWorker } from '@/lib/pwa/service-worker-manager';

interface PWAPromptProps {
  autoShow?: boolean;
  className?: string;
}

export default function PWAPrompt({ autoShow = true, className = '' }: PWAPromptProps) {
  const { installable, showInstallPrompt } = useServiceWorker();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const hasDeclined = localStorage.getItem('pwa-install-declined');
    const lastDeclined = localStorage.getItem('pwa-install-declined-time');
    
    if (hasDeclined && lastDeclined) {
      const daysSinceDeclined = (Date.now() - parseInt(lastDeclined)) / (1000 * 60 * 60 * 24);
      if (daysSinceDeclined < 30) { // Don't show again for 30 days
        setDismissed(true);
        return;
      }
    }

    // Auto-show prompt if installable and conditions are met
    if (installable && autoShow && !dismissed) {
      // Delay showing prompt to avoid interrupting user
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [installable, autoShow, dismissed]);

  const handleInstall = async () => {
    if (!installable) return;

    setIsInstalling(true);
    try {
      const accepted = await showInstallPrompt();
      if (accepted) {
        setShowPrompt(false);
        // Track successful installation
        localStorage.setItem('pwa-installed', 'true');
      } else {
        // User declined installation
        handleDismiss();
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-declined', 'true');
    localStorage.setItem('pwa-install-declined-time', Date.now().toString());
  };

  if (!installable || !showPrompt || dismissed) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DevicePhoneMobileIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Install Zoptal App</h3>
              <p className="text-sm text-gray-600">Get quick access to our services</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Works offline
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Fast access from home screen
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Push notifications
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isInstalling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Installing...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Install
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

// Update notification component
export function UpdatePrompt() {
  const { updateAvailable, applyUpdate } = useServiceWorker();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setShowPrompt(true);
    }
  }, [updateAvailable]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await applyUpdate();
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!updateAvailable || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowDownTrayIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Update Available</h3>
              <p className="text-sm text-green-700">A new version is ready to install</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-green-400 hover:text-green-600"
            aria-label="Dismiss"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Updating...
              </>
            ) : (
              'Update Now'
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-green-600 hover:text-green-800 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

// Offline status indicator
export function OfflineIndicator() {
  const { isOnline } = useServiceWorker();
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
    } else {
      // Hide offline indicator with a delay when back online
      const timer = setTimeout(() => {
        setShowOffline(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showOffline) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
      !isOnline ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className={`py-2 px-4 text-center text-sm font-medium ${
        isOnline 
          ? 'bg-green-600 text-white' 
          : 'bg-yellow-600 text-white'
      }`}>
        {isOnline ? (
          <>
            <span className="inline-block w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></span>
            Back online
          </>
        ) : (
          <>
            <span className="inline-block w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
            You're offline. Some features may be limited.
          </>
        )}
      </div>
    </div>
  );
}

// PWA features showcase component
export function PWAFeatures() {
  const { cacheStatus, clearCache } = useServiceWorker();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearCache();
      // Refresh cache status
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">PWA Status</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Cached Content</span>
          <span className="text-sm font-medium text-gray-900">
            {formatBytes(cacheStatus.totalSize)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Cache Stores</span>
          <span className="text-sm font-medium text-gray-900">
            {cacheStatus.cacheNames.length}
          </span>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleClearCache}
            disabled={isClearing}
            className="w-full px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isClearing ? 'Clearing...' : 'Clear Cache'}
          </button>
        </div>
      </div>
    </div>
  );
}