/**
 * Offline Storage Manager
 * Handles local storage for critical data and offline operations
 */

export interface OfflineData {
  id: string;
  type: 'sale' | 'inventory' | 'driver' | 'product' | 'action' | 'report';
  data: any;
  timestamp: number;
  synced: boolean;
  conflictResolved?: boolean;
  retryCount: number;
  lastError?: string;
}

export interface OfflineConfig {
  maxRetries: number;
  syncInterval: number;
  maxStorage: number; // MB
  autoCleanup: boolean;
  cleanupAfterDays: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: number;
  pendingItems: number;
  syncing: boolean;
  errors: Array<{ id: string; error: string; timestamp: number }>;
}

/**
 * Offline Storage Manager
 */
export class OfflineStorageManager {
  private static instance: OfflineStorageManager;
  private db: IDBDatabase | null = null;
  private config: OfflineConfig = {
    maxRetries: 3,
    syncInterval: 30000, // 30 seconds
    maxStorage: 50, // 50MB
    autoCleanup: true,
    cleanupAfterDays: 30,
  };
  private syncTimer: NodeJS.Timeout | null = null;
  private listeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeDB();
    this.startSyncTimer();
    this.setupNetworkListener();
  }

  static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  /**
   * Initialize IndexedDB
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LPGDistributorOfflineDB', 2);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create offline data store
        if (!db.objectStoreNames.contains('offline')) {
          const store = db.createObjectStore('offline', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }

        // Create cache store for critical data
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('type', 'type', { unique: false });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }

        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Store data offline
   */
  async storeOffline(type: OfflineData['type'], data: any): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const id = this.generateId();
    const offlineData: OfflineData = {
      id,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
      retryCount: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline'], 'readwrite');
      const store = transaction.objectStore('offline');
      const request = store.add(offlineData);

      request.onsuccess = () => {
        this.notifyListeners('dataStored', { type, id });
        resolve(id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get pending offline data
   */
  async getPendingData(type?: OfflineData['type']): Promise<OfflineData[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline'], 'readonly');
      const store = transaction.objectStore('offline');
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => {
        let data = request.result as OfflineData[];

        if (type) {
          data = data.filter((item) => item.type === type);
        }

        // Sort by timestamp (oldest first)
        data.sort((a, b) => a.timestamp - b.timestamp);
        resolve(data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark data as synced
   */
  async markSynced(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline'], 'readwrite');
      const store = transaction.objectStore('offline');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          data.conflictResolved = true;
          const updateRequest = store.put(data);
          updateRequest.onsuccess = () => {
            this.notifyListeners('dataSynced', { id });
            resolve();
          };
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Update retry count for failed sync
   */
  async updateRetryCount(id: string, error?: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline'], 'readwrite');
      const store = transaction.objectStore('offline');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.retryCount = (data.retryCount || 0) + 1;
          if (error) {
            data.lastError = error;
          }

          const updateRequest = store.put(data);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Cache critical data for offline access
   */
  async cacheData(
    key: string,
    data: any,
    type: string,
    ttl: number = 3600000
  ): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const cacheItem = {
      key,
      data,
      type,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(cacheItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached data
   */
  async getCachedData(key: string): Promise<any> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expiry > Date.now()) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store essential data for offline operation
   */
  async storeEssentialData(): Promise<void> {
    try {
      // Cache active drivers
      const driversResponse = await fetch(
        '/api/drivers?active=true&driverType=RETAIL'
      );
      if (driversResponse.ok) {
        const driversData = await driversResponse.json();
        await this.cacheData(
          'active-drivers',
          driversData.drivers,
          'drivers',
          86400000
        ); // 24 hours
      }

      // Cache products with inventory
      const productsResponse = await fetch('/api/products?inventory=true');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        await this.cacheData(
          'products-inventory',
          productsData.products,
          'products',
          3600000
        ); // 1 hour
      }

      // Cache company info
      const companyResponse = await fetch('/api/companies/current');
      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        await this.cacheData('company-info', companyData, 'company', 86400000); // 24 hours
      }

      // Cache dashboard metrics
      const metricsResponse = await fetch('/api/dashboard/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        await this.cacheData(
          'dashboard-metrics',
          metricsData,
          'metrics',
          300000
        ); // 5 minutes
      }

      this.notifyListeners('essentialDataCached', {});
    } catch (error) {
      console.error('Failed to store essential data:', error);
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const pendingData = await this.getPendingData();
    const settings = await this.getSetting('lastSync');

    return {
      isOnline: navigator.onLine,
      lastSync: settings || 0,
      pendingItems: pendingData.length,
      syncing: false, // This would be managed by the sync process
      errors: pendingData
        .filter((item) => item.lastError)
        .map((item) => ({
          id: item.id,
          error: item.lastError!,
          timestamp: item.timestamp,
        })),
    };
  }

  /**
   * Sync pending data
   */
  async syncPendingData(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Device is offline, skipping sync');
      return;
    }

    const pendingData = await this.getPendingData();
    let successCount = 0;
    let errorCount = 0;

    for (const item of pendingData) {
      if (item.retryCount >= this.config.maxRetries) {
        continue; // Skip items that have exceeded retry limit
      }

      try {
        const success = await this.syncItem(item);
        if (success) {
          await this.markSynced(item.id);
          successCount++;
        } else {
          await this.updateRetryCount(item.id, 'Sync failed');
          errorCount++;
        }
      } catch (error) {
        await this.updateRetryCount(
          item.id,
          error instanceof Error ? error.message : 'Unknown error'
        );
        errorCount++;
      }
    }

    // Update last sync time
    await this.setSetting('lastSync', Date.now());

    this.notifyListeners('syncCompleted', {
      success: successCount,
      errors: errorCount,
      timestamp: Date.now(),
    });
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: OfflineData): Promise<boolean> {
    try {
      let endpoint = '';
      let method = 'POST';

      switch (item.type) {
        case 'sale':
          endpoint = '/api/sales';
          break;
        case 'inventory':
          endpoint = '/api/inventory';
          break;
        case 'action':
          endpoint = item.data.endpoint;
          method = item.data.method || 'POST';
          break;
        default:
          console.warn('Unknown item type for sync:', item.type);
          return false;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Offline-Sync': 'true',
          'X-Offline-ID': item.id,
        },
        body:
          item.type === 'action' ? item.data.body : JSON.stringify(item.data),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to sync item:', item.id, error);
      return false;
    }
  }

  /**
   * Setup network status listener
   */
  private setupNetworkListener(): void {
    window.addEventListener('online', () => {
      console.log('Device is online, starting sync...');
      this.syncPendingData();
      this.storeEssentialData();
      this.notifyListeners('networkStatusChanged', { online: true });
    });

    window.addEventListener('offline', () => {
      console.log('Device is offline');
      this.notifyListeners('networkStatusChanged', { online: false });
    });
  }

  /**
   * Start automatic sync timer
   */
  private startSyncTimer(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(async () => {
      if (navigator.onLine) {
        await this.syncPendingData();
      }
    }, this.config.syncInterval);
  }

  /**
   * Clean up old data
   */
  async cleanup(): Promise<void> {
    if (!this.db || !this.config.autoCleanup) {
      return;
    }

    const cutoffTime =
      Date.now() - this.config.cleanupAfterDays * 24 * 60 * 60 * 1000;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline'], 'readwrite');
      const store = transaction.objectStore('offline');
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const data = cursor.value as OfflineData;
          if (data.synced) {
            cursor.delete();
          }
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(): Promise<{ used: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0,
      };
    }

    return { used: 0, available: 0 };
  }

  /**
   * Settings management
   */
  async setSetting(key: string, value: any): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Event listeners
   */
  addEventListener(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  removeEventListener(event: string, listener: Function): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  /**
   * Utility methods
   */
  private generateId(): string {
    return (
      'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Export data for debugging
   */
  async exportDebugData(): Promise<any> {
    const pendingData = await this.getPendingData();
    const syncStatus = await this.getSyncStatus();
    const storageUsage = await this.getStorageUsage();

    return {
      pendingData,
      syncStatus,
      storageUsage,
      config: this.config,
      timestamp: Date.now(),
    };
  }

  /**
   * Reset all offline data (for debugging/reset)
   */
  async resetOfflineData(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ['offline', 'cache'],
        'readwrite'
      );

      const offlineStore = transaction.objectStore('offline');
      const cacheStore = transaction.objectStore('cache');

      const clearOffline = offlineStore.clear();
      const clearCache = cacheStore.clear();

      transaction.oncomplete = () => {
        this.notifyListeners('dataReset', {});
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// Export singleton instance
export const offlineStorage = OfflineStorageManager.getInstance();
