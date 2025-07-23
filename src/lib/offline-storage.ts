import * as React from 'react';

interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiry: number;
}

interface OfflineMetrics {
  sales: any;
  inventory: any;
  drivers: any;
  financial: any;
  lastSync: number;
}

class OfflineStorage {
  private dbName = 'lpg-dashboard-offline';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('dashboard-cache')) {
          const store = db.createObjectStore('dashboard-cache', {
            keyPath: 'key',
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('metrics-cache')) {
          db.createObjectStore('metrics-cache', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('chart-data')) {
          db.createObjectStore('chart-data', { keyPath: 'key' });
        }
      };
    });
  }

  async storeData(
    storeName: string,
    key: string,
    data: any,
    expiryMinutes = 60
  ): Promise<void> {
    if (!this.db) await this.init();

    const cachedData: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiryMinutes * 60 * 1000,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(cachedData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getData(storeName: string, key: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CachedData;
        if (!result) {
          resolve(null);
          return;
        }

        if (Date.now() > result.expiry) {
          this.deleteData(storeName, key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
    });
  }

  async deleteData(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearExpiredData(): Promise<void> {
    if (!this.db) await this.init();

    const stores = ['dashboard-cache', 'metrics-cache', 'chart-data'];
    const now = Date.now();

    for (const storeName of stores) {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const data = cursor.value as CachedData;
          if (now > data.expiry) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    }
  }

  async getOfflineMetrics(): Promise<OfflineMetrics | null> {
    const [sales, inventory, drivers, financial] = await Promise.all([
      this.getData('metrics-cache', 'sales'),
      this.getData('metrics-cache', 'inventory'),
      this.getData('metrics-cache', 'drivers'),
      this.getData('metrics-cache', 'financial'),
    ]);

    if (!sales && !inventory && !drivers && !financial) {
      return null;
    }

    return {
      sales,
      inventory,
      drivers,
      financial,
      lastSync: Math.min(
        ...[sales, inventory, drivers, financial]
          .filter(Boolean)
          .map((data) => data.timestamp || 0)
      ),
    };
  }

  async storeMetrics(metrics: any): Promise<void> {
    const promises = [];

    if (metrics.sales) {
      promises.push(
        this.storeData('metrics-cache', 'sales', metrics.sales, 120)
      );
    }
    if (metrics.inventory) {
      promises.push(
        this.storeData('metrics-cache', 'inventory', metrics.inventory, 120)
      );
    }
    if (metrics.drivers) {
      promises.push(
        this.storeData('metrics-cache', 'drivers', metrics.drivers, 120)
      );
    }
    if (metrics.financial) {
      promises.push(
        this.storeData('metrics-cache', 'financial', metrics.financial, 120)
      );
    }

    await Promise.all(promises);
  }

  async storeChartData(chartType: string, data: any): Promise<void> {
    await this.storeData('chart-data', chartType, data, 180);
  }

  async getChartData(chartType: string): Promise<any | null> {
    return this.getData('chart-data', chartType);
  }

  async storeDashboardSnapshot(data: any): Promise<void> {
    await this.storeData('dashboard-cache', 'latest-snapshot', data, 240);
  }

  async getLatestSnapshot(): Promise<any | null> {
    return this.getData('dashboard-cache', 'latest-snapshot');
  }

  async isOnline(): Promise<boolean> {
    if (!navigator.onLine) return false;

    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async syncWhenOnline(callback: () => Promise<void>): Promise<void> {
    if (await this.isOnline()) {
      await callback();
    } else {
      const handleOnline = async () => {
        window.removeEventListener('online', handleOnline);
        if (await this.isOnline()) {
          await callback();
        }
      };
      window.addEventListener('online', handleOnline);
    }
  }

  async getDiskUsage(): Promise<{ used: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0,
      };
    }
    return { used: 0, available: 0 };
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();

    const stores = ['dashboard-cache', 'metrics-cache', 'chart-data'];

    for (const storeName of stores) {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }
  }
}

export const offlineStorage = new OfflineStorage();

export async function withOfflineSupport<T>(
  fetchFunction: () => Promise<T>,
  cacheKey: string,
  storeName: string = 'dashboard-cache',
  fallbackData?: T
): Promise<T> {
  try {
    if (await offlineStorage.isOnline()) {
      const data = await fetchFunction();
      await offlineStorage.storeData(storeName, cacheKey, data);
      return data;
    }
  } catch (error) {
    console.warn('Online fetch failed, trying offline cache:', error);
  }

  const cachedData = await offlineStorage.getData(storeName, cacheKey);
  if (cachedData) {
    return cachedData;
  }

  if (fallbackData) {
    return fallbackData;
  }

  throw new Error('No data available offline');
}

export function useOfflineDetection() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkConnection = async () => {
      const online = await offlineStorage.isOnline();
      setIsOnline(online);
    };

    const interval = setInterval(checkConnection, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return isOnline;
}
