import type { WebContainer } from '@webcontainer/api';
import { atom } from 'nanostores';

// Extend Window interface to include our custom property
declare global {
  interface Window {
    _tabId?: string;
  }
}

export interface PreviewInfo {
  port: number;
  ready: boolean;
  baseUrl: string;
}

// Create a broadcast channel for preview updates
const PREVIEW_CHANNEL = 'preview-updates';

export class PreviewsStore {
  #availablePreviews = new Map<number, PreviewInfo>();
  #webcontainer: Promise<WebContainer>;
  #broadcastChannel: BroadcastChannel;
  #lastUpdate = new Map<string, number>();
  #watchedFiles = new Set<string>();
  #refreshTimeouts = new Map<string, NodeJS.Timeout>();
  #REFRESH_DELAY = 300;
  #storageChannel: BroadcastChannel;

  previews = atom<PreviewInfo[]>([]);

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise;
    this.#broadcastChannel = new BroadcastChannel(PREVIEW_CHANNEL);
    this.#storageChannel = new BroadcastChannel('storage-sync-channel');

    // Listen for preview updates from other tabs
    this.#broadcastChannel.onmessage = (event) => {
      const { type, previewId } = event.data;

      if (type === 'file-change') {
        const timestamp = event.data.timestamp;
        const lastUpdate = this.#lastUpdate.get(previewId) || 0;

        if (timestamp > lastUpdate) {
          this.#lastUpdate.set(previewId, timestamp);
          this.refreshPreview(previewId);
        }
      }
    };

    // Listen for storage sync messages
    this.#storageChannel.onmessage = (event) => {
      const { storage, source } = event.data;

      if (storage && source !== this._getTabId()) {
        this._syncStorage(storage);
      }
    };

    // Override localStorage setItem to catch all changes
    if (typeof window !== 'undefined') {
      const originalSetItem = localStorage.setItem;

      localStorage.setItem = (...args) => {
        originalSetItem.apply(localStorage, args);
        this._broadcastStorageSync();
      };
    }

    this.#init();
  }

  // Generate a unique ID for this tab
  private _getTabId(): string {
    if (typeof window !== 'undefined') {
      if (!window._tabId) {
        window._tabId = Math.random().toString(36).substring(2, 15);
      }

      return window._tabId;
    }

    return '';
  }

  // Sync storage data between tabs
  private _syncStorage(storage: Record<string, string>) {
    if (typeof window !== 'undefined') {
      Object.entries(storage).forEach(([key, value]) => {
        try {
          const originalSetItem = Object.getPrototypeOf(localStorage).setItem;
          originalSetItem.call(localStorage, key, value);
        } catch (error) {
          console.error('[Preview] Error syncing storage:', error);
        }
      });

      // Force a refresh after syncing storage
      const previews = this.previews.get();
      previews.forEach((preview) => {
        const previewId = this.getPreviewId(preview.baseUrl);

        if (previewId) {
          this.refreshPreview(previewId);
        }
      });

      // Reload the page content
      if (typeof window !== 'undefined' && window.location) {
        const iframe = document.querySelector('iframe');

        if (iframe) {
          iframe.src = iframe.src;
        }
      }
    }
  }

  // Broadcast storage state to other tabs
  private _broadcastStorageSync() {
    if (typeof window !== 'undefined') {
      const storage: Record<string, string> = {};

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key) {
          storage[key] = localStorage.getItem(key) || '';
        }
      }

      this.#storageChannel.postMessage({
        type: 'storage-sync',
        storage,
        source: this._getTabId(),
        timestamp: Date.now(),
      });
    }
  }

  async #init() {
    const webcontainer = await this.#webcontainer;

    // Listen for server ready events
    webcontainer.on('server-ready', (port, url) => {
      console.log('[Preview Debug] 🟢 Server ready event received:', { port, url });
      this.broadcastUpdate(url);

      // Initial storage sync when preview is ready
      this._broadcastStorageSync();
    });

    try {
      // Watch for file changes - only if webcontainer.internal exists
      if (webcontainer.internal && typeof webcontainer.internal.watchPaths === 'function') {
        webcontainer.internal.watchPaths(
          {
            // Only watch specific file types that affect the preview
            include: ['**/*.html', '**/*.css', '**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.json'],
            exclude: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/coverage/**'],
          },
          async (_events) => {
            const previews = this.previews.get();

            for (const preview of previews) {
              const previewId = this.getPreviewId(preview.baseUrl);

              if (previewId) {
                this.broadcastFileChange(previewId);
              }
            }
          },
        );
      } else {
        console.log('[Preview Debug] ⚠️ WebContainer.internal.watchPaths not available, skipping file watching');
      }

      // Watch for DOM changes that might affect storage
      if (typeof window !== 'undefined') {
        const observer = new MutationObserver((_mutations) => {
          // Broadcast storage changes when DOM changes
          this._broadcastStorageSync();
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
        });
      }
    } catch (error) {
      console.warn('[Preview Debug] ⚠️ Error setting up watchers (non-critical):', error);
    }

    // Listen for port events
    webcontainer.on('port', (port, type, url) => {
      console.log('[Preview Debug] 🔌 Port event received:', { port, type, url });

      let previewInfo = this.#availablePreviews.get(port);

      if (type === 'close' && previewInfo) {
        console.log(`[Preview Debug] ❌ Port ${port} closed`);
        this.#availablePreviews.delete(port);
        this.previews.set(this.previews.get().filter((preview) => preview.port !== port));

        return;
      }

      const previews = this.previews.get();

      if (!previewInfo) {
        console.log(`[Preview Debug] ✨ New preview registered on port ${port}`);
        previewInfo = { port, ready: type === 'open', baseUrl: url };
        this.#availablePreviews.set(port, previewInfo);
        previews.push(previewInfo);
      }

      previewInfo.ready = type === 'open';
      previewInfo.baseUrl = url;

      this.previews.set([...previews]);
      console.log(`[Preview Debug] 📋 Total active previews:`, this.previews.get().length);

      if (type === 'open') {
        console.log(`[Preview Debug] 🚀 Broadcasting preview URL for port ${port}:`, url);
        this.broadcastUpdate(url);
      }
    });
  }

  // Helper to extract preview ID from URL
  getPreviewId(url: string): string | null {
    const match = url.match(/^https?:\/\/([^.]+)\.local-credentialless\.webcontainer-api\.io/);
    return match ? match[1] : null;
  }

  // Broadcast state change to all tabs
  broadcastStateChange(previewId: string) {
    const timestamp = Date.now();
    this.#lastUpdate.set(previewId, timestamp);

    this.#broadcastChannel.postMessage({
      type: 'state-change',
      previewId,
      timestamp,
    });
  }

  // Broadcast file change to all tabs
  broadcastFileChange(previewId: string) {
    const timestamp = Date.now();
    this.#lastUpdate.set(previewId, timestamp);

    this.#broadcastChannel.postMessage({
      type: 'file-change',
      previewId,
      timestamp,
    });
  }

  // Broadcast update to all tabs
  broadcastUpdate(url: string) {
    const previewId = this.getPreviewId(url);

    if (previewId) {
      const timestamp = Date.now();
      this.#lastUpdate.set(previewId, timestamp);

      this.#broadcastChannel.postMessage({
        type: 'file-change',
        previewId,
        timestamp,
      });
    }
  }

  // Method to refresh a specific preview
  refreshPreview(previewId: string) {
    // Clear any pending refresh for this preview
    const existingTimeout = this.#refreshTimeouts.get(previewId);

    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set a new timeout for this refresh
    const timeout = setTimeout(() => {
      const previews = this.previews.get();
      const preview = previews.find((p) => this.getPreviewId(p.baseUrl) === previewId);

      if (preview) {
        preview.ready = false;
        this.previews.set([...previews]);

        requestAnimationFrame(() => {
          preview.ready = true;
          this.previews.set([...previews]);
        });
      }

      this.#refreshTimeouts.delete(previewId);
    }, this.#REFRESH_DELAY);

    this.#refreshTimeouts.set(previewId, timeout);
  }

  refreshAllPreviews() {
    const previews = this.previews.get();

    for (const preview of previews) {
      const previewId = this.getPreviewId(preview.baseUrl);

      if (previewId) {
        this.broadcastFileChange(previewId);
      }
    }
  }

  // Fallback port scanner for detecting dev servers when events don't fire
  async detectRunningServers() {
    console.log('[Preview Debug] 🔍 Running fallback port scanner...');

    const commonPorts = [3000, 5173, 8080, 4200, 3001, 5000, 8000];

    for (const port of commonPorts) {
      try {
        // Try to construct the preview URL manually
        const previewUrl = `https://localhost-${port}.local-credentialless.webcontainer-api.io`;

        // Check if this port is already in our previews
        const existingPreview = Array.from(this.#availablePreviews.values()).find((p) => p.port === port);

        if (!existingPreview) {
          console.log(`[Preview Debug] 🔎 Checking port ${port}...`);

          // Add the preview speculatively
          const previewInfo: PreviewInfo = {
            port,
            ready: true,
            baseUrl: previewUrl,
          };

          this.#availablePreviews.set(port, previewInfo);

          const previews = this.previews.get();

          previews.push(previewInfo);
          this.previews.set([...previews]);

          console.log(`[Preview Debug] ✅ Added preview for port ${port}:`, previewUrl);
        }
      } catch (error) {
        console.log(`[Preview Debug] ❌ Port ${port} check failed:`, error);
      }
    }

    console.log(`[Preview Debug] 📊 Fallback scan complete. Total previews: ${this.previews.get().length}`);
  }

  // Start periodic port scanning as a fallback
  startFallbackScanning() {
    console.log('[Preview Debug] 🔄 Starting periodic fallback port scanner...');

    // Initial scan after 3 seconds
    setTimeout(() => {
      this.detectRunningServers();
    }, 3000);

    // Scan every 10 seconds
    setInterval(() => {
      if (this.previews.get().length === 0) {
        console.log('[Preview Debug] 🔄 No previews detected, running fallback scan...');
        this.detectRunningServers();
      }
    }, 10000);
  }
}

// Create a singleton instance
let previewsStore: PreviewsStore | null = null;

export function usePreviewStore() {
  if (!previewsStore) {
    /*
     * Initialize with a Promise that resolves to WebContainer
     * This should match how you're initializing WebContainer elsewhere
     */
    previewsStore = new PreviewsStore(Promise.resolve({} as WebContainer));
  }

  return previewsStore;
}
