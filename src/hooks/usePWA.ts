/**
 * React hook for PWA functionality
 */

import { useState, useEffect } from 'react';
import { offlineStorage } from '@/lib/offline/storage';
import { offlineSync } from '@/lib/offline/sync';

export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  serviceWorkerReady: boolean;
  updateAvailable: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

export interface PWAActions {
  install: () => Promise<boolean>;
  update: () => void;
  clearCache: () => Promise<void>;
  toggleNotifications: () => Promise<boolean>;
  forceSync: () => Promise<void>;
  getStorageInfo: () => Promise<{ used: number; available: number }>;
}

export interface PWAHookReturn extends PWAState, PWAActions {}

// Extend the Window interface for PWA events
declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent;
  }

  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }
}

/**
 * PWA Hook for managing Progressive Web App functionality
 */
export function usePWA(): PWAHookReturn {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    serviceWorkerReady: false,
    updateAvailable: false,
    installPrompt: null,
  });

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      const isInstalled =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');

      setState((prev) => ({ ...prev, isInstalled }));
    };

    // Check service worker status
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          setState((prev) => ({ ...prev, serviceWorkerReady: true }));

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  setState((prev) => ({ ...prev, updateAvailable: true }));
                }
              });
            }
          });
        } catch (error) {
          console.error('Service Worker not ready:', error);
        }
      }
    };

    // Handle install prompt
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setState((prev) => ({
        ...prev,
        isInstallable: true,
        installPrompt: event,
      }));
    };

    // Handle app installed
    const handleAppInstalled = () => {
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
      }));
    };

    // Handle network status
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    // Setup event listeners
    checkInstalled();
    checkServiceWorker();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => checkInstalled();
    mediaQuery.addListener(handleDisplayModeChange);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      mediaQuery.removeListener(handleDisplayModeChange);
    };
  }, []);

  /**
   * Install the PWA
   */
  const install = async (): Promise<boolean> => {
    if (!state.installPrompt) {
      return false;
    }

    try {
      await state.installPrompt.prompt();
      const choiceResult = await state.installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setState((prev) => ({
          ...prev,
          isInstallable: false,
          installPrompt: null,
        }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to install app:', error);
      return false;
    }
  };

  /**
   * Update the service worker
   */
  const update = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          // Send message to service worker to skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });

          // Listen for controlling change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
        }
      });
    }
  };

  /**
   * Clear all caches
   */
  const clearCache = async (): Promise<void> => {
    try {
      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }

      // Clear offline storage
      await offlineStorage.resetOfflineData();

      // Clear localStorage items related to PWA
      const keysToRemove = ['pwa-settings', 'cache-timestamp', 'offline-data'];
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      console.log('All caches cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  };

  /**
   * Toggle notification permissions
   */
  const toggleNotifications = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } else if (Notification.permission === 'granted') {
        // Can't programmatically revoke, user needs to do it in browser settings
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      return false;
    }
  };

  /**
   * Force sync all offline data
   */
  const forceSync = async (): Promise<void> => {
    if (!state.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    try {
      await offlineSync.forceSyncAll();
      console.log('Force sync completed');
    } catch (error) {
      console.error('Force sync failed:', error);
      throw error;
    }
  };

  /**
   * Get storage information
   */
  const getStorageInfo = async (): Promise<{
    used: number;
    available: number;
  }> => {
    try {
      return await offlineStorage.getStorageUsage();
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0 };
    }
  };

  return {
    // State
    ...state,

    // Actions
    install,
    update,
    clearCache,
    toggleNotifications,
    forceSync,
    getStorageInfo,
  };
}

/**
 * Hook for PWA installation banner
 */
export function useInstallBanner() {
  const { isInstallable, isInstalled, install } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const wasDismissed =
      localStorage.getItem('install-banner-dismissed') === 'true';
    setDismissed(wasDismissed);

    // Show banner if installable and not dismissed
    if (isInstallable && !isInstalled && !wasDismissed) {
      // Delay showing banner to avoid interrupting user
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000); // 3 seconds delay

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const dismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('install-banner-dismissed', 'true');
  };

  const installAndDismiss = async () => {
    const success = await install();
    if (success) {
      setShowBanner(false);
    }
  };

  return {
    showBanner: showBanner && !dismissed,
    dismiss,
    install: installAndDismiss,
    isInstallable,
    isInstalled,
  };
}

/**
 * Hook for managing app updates
 */
export function useAppUpdate() {
  const { updateAvailable, update } = usePWA();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setShowUpdatePrompt(true);
    }
  }, [updateAvailable]);

  const applyUpdate = () => {
    update();
    setShowUpdatePrompt(false);
  };

  const dismissUpdate = () => {
    setShowUpdatePrompt(false);
  };

  return {
    showUpdatePrompt,
    applyUpdate,
    dismissUpdate,
    updateAvailable,
  };
}

/**
 * Hook for offline status and sync management
 */
export function useOfflineSync() {
  const { isOnline, forceSync } = usePWA();
  const [syncStatus, setSyncStatus] = useState({
    pendingItems: 0,
    lastSync: 0,
    syncing: false,
    errors: [],
  });

  useEffect(() => {
    const updateSyncStatus = async () => {
      try {
        const status = await offlineStorage.getSyncStatus();
        setSyncStatus((prev) => ({
          ...prev,
          pendingItems: status.pendingItems,
          lastSync: status.lastSync,
        }));
      } catch (error) {
        console.error('Failed to update sync status:', error);
      }
    };

    // Update immediately
    updateSyncStatus();

    // Listen for offline storage events
    const handleDataStored = () => updateSyncStatus();
    const handleDataSynced = () => updateSyncStatus();

    offlineStorage.addEventListener('dataStored', handleDataStored);
    offlineStorage.addEventListener('dataSynced', handleDataSynced);

    // Update sync status every 30 seconds
    const interval = setInterval(updateSyncStatus, 30000);

    return () => {
      offlineStorage.removeEventListener('dataStored', handleDataStored);
      offlineStorage.removeEventListener('dataSynced', handleDataSynced);
      clearInterval(interval);
    };
  }, []);

  const triggerSync = async () => {
    if (!isOnline) {
      throw new Error('Cannot sync while offline');
    }

    setSyncStatus((prev) => ({ ...prev, syncing: true }));

    try {
      await forceSync();
      // Update status after sync
      const status = await offlineStorage.getSyncStatus();
      setSyncStatus((prev) => ({
        ...prev,
        pendingItems: status.pendingItems,
        lastSync: status.lastSync,
        syncing: false,
      }));
    } catch (error) {
      setSyncStatus((prev) => ({ ...prev, syncing: false }));
      throw error;
    }
  };

  return {
    isOnline,
    syncStatus,
    triggerSync,
  };
}
