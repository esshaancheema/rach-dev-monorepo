'use client';

interface ServiceWorkerUpdateEvent extends Event {
  detail: {
    isUpdate: boolean;
    registration: ServiceWorkerRegistration;
  };
}

interface PWAInstallEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': PWAInstallEvent;
    'appinstalled': Event;
    'swUpdate': ServiceWorkerUpdateEvent;
  }
}

export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private installPrompt: PWAInstallEvent | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    if ('serviceWorker' in navigator) {
      try {
        await this.registerServiceWorker();
        this.setupUpdateDetection();
        this.setupInstallPrompt();
        this.setupPeriodicSync();
        this.setupPushNotifications();
      } catch (error) {
        console.error('Service Worker initialization failed:', error);
      }
    }
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'imports'
      });

      console.info('Service Worker registered successfully:', this.registration);

      // Check for updates immediately and then every hour
      this.checkForUpdate();
      setInterval(() => this.checkForUpdate(), 60 * 60 * 1000);

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  private setupUpdateDetection(): void {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          this.updateAvailable = true;
          this.notifyUpdateAvailable();
        }
      });
    });

    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
        this.updateAvailable = true;
        this.notifyUpdateAvailable();
      }
    });
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt = event as PWAInstallEvent;
      this.notifyInstallAvailable();
    });

    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      this.notifyAppInstalled();
    });
  }

  private async setupPeriodicSync(): Promise<void> {
    if (!this.registration) return;

    try {
      // Register for periodic background sync (if supported)
      if ('periodicSync' in this.registration) {
        const status = await navigator.permissions.query({ name: 'periodic-background-sync' as any });
        if (status.state === 'granted') {
          await (this.registration as any).periodicSync.register('content-sync', {
            minInterval: 24 * 60 * 60 * 1000, // 24 hours
          });
        }
      }
    } catch (error) {
      console.warn('Periodic sync not supported:', error);
    }
  }

  private async setupPushNotifications(): Promise<void> {
    if (!this.registration) return;

    try {
      // Check if push notifications are supported
      if ('PushManager' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Subscribe to push notifications
          const subscription = await this.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(
              process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
            )
          });

          // Send subscription to server
          await this.sendSubscriptionToServer(subscription);
        }
      }
    } catch (error) {
      console.warn('Push notifications setup failed:', error);
    }
  }

  public async checkForUpdate(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      console.error('Service Worker update check failed:', error);
    }
  }

  public async applyUpdate(): Promise<void> {
    if (!this.registration || !this.updateAvailable) return;

    const newWorker = this.registration.waiting;
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to activate the new service worker
      window.location.reload();
    }
  }

  public async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) return false;

    try {
      const result = await this.installPrompt.prompt();
      this.installPrompt = null;
      return result.outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  public isInstallable(): boolean {
    return this.installPrompt !== null;
  }

  public isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  public async getNetworkStatus(): Promise<{
    online: boolean;
    connection?: NetworkInformation;
  }> {
    const online = navigator.onLine;
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      online,
      connection: connection ? {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      } : undefined
    };
  }

  public async getCacheStatus(): Promise<{
    cacheNames: string[];
    totalSize: number;
  }> {
    if (!('caches' in window)) {
      return { cacheNames: [], totalSize: 0 };
    }

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        // Estimate cache size (rough calculation)
        for (const request of keys.slice(0, 10)) {
          try {
            const response = await cache.match(request);
            if (response) {
              const text = await response.clone().text();
              totalSize += text.length;
            }
          } catch (error) {
            // Skip failed requests
          }
        }
        
        // Extrapolate for all keys
        totalSize = Math.round((totalSize * keys.length) / Math.min(keys.length, 10));
      }

      return { cacheNames, totalSize };
    } catch (error) {
      console.error('Failed to get cache status:', error);
      return { cacheNames: [], totalSize: 0 };
    }
  }

  public async clearCache(): Promise<void> {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  public async sendMessageToSW(message: any): Promise<any> {
    if (!this.registration) return null;

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      const sw = this.registration!.active;
      if (sw) {
        sw.postMessage(message, [messageChannel.port2]);
      } else {
        reject(new Error('No active service worker'));
      }
    });
  }

  private notifyUpdateAvailable(): void {
    const event = new CustomEvent('swUpdate', {
      detail: {
        isUpdate: true,
        registration: this.registration!
      }
    });
    window.dispatchEvent(event);
  }

  private notifyInstallAvailable(): void {
    const event = new CustomEvent('pwaInstallAvailable');
    window.dispatchEvent(event);
  }

  private notifyAppInstalled(): void {
    const event = new CustomEvent('pwaInstalled');
    window.dispatchEvent(event);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }
}

// Singleton instance
let swManager: ServiceWorkerManager | null = null;

export function getServiceWorkerManager(): ServiceWorkerManager {
  if (!swManager && typeof window !== 'undefined') {
    swManager = new ServiceWorkerManager();
  }
  return swManager!;
}

// React hook for service worker functionality
export function useServiceWorker() {
  const [isOnline, setIsOnline] = React.useState(true);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [installable, setInstallable] = React.useState(false);
  const [cacheStatus, setCacheStatus] = React.useState({ cacheNames: [], totalSize: 0 });

  React.useEffect(() => {
    const swManager = getServiceWorkerManager();

    // Network status
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // SW update available
    const handleUpdateAvailable = () => setUpdateAvailable(true);
    window.addEventListener('swUpdate', handleUpdateAvailable);

    // PWA installable
    const handleInstallAvailable = () => setInstallable(true);
    const handleInstalled = () => setInstallable(false);
    window.addEventListener('pwaInstallAvailable', handleInstallAvailable);
    window.addEventListener('pwaInstalled', handleInstalled);

    // Initial status
    setUpdateAvailable(swManager.isUpdateAvailable());
    setInstallable(swManager.isInstallable());

    // Cache status
    swManager.getCacheStatus().then(setCacheStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('swUpdate', handleUpdateAvailable);
      window.removeEventListener('pwaInstallAvailable', handleInstallAvailable);
      window.removeEventListener('pwaInstalled', handleInstalled);
    };
  }, []);

  return {
    isOnline,
    updateAvailable,
    installable,
    cacheStatus,
    applyUpdate: () => getServiceWorkerManager().applyUpdate(),
    showInstallPrompt: () => getServiceWorkerManager().showInstallPrompt(),
    clearCache: () => getServiceWorkerManager().clearCache(),
    checkForUpdate: () => getServiceWorkerManager().checkForUpdate(),
  };
}

// Import React for the hook
import React from 'react';