/**
 * Offline Sync Manager
 * Handles conflict resolution and data synchronization
 */

import { offlineStorage, OfflineData } from './storage';

export interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  clientData: any;
  serverData: any;
  mergedData?: any;
  timestamp: number;
}

export interface SyncConflict {
  id: string;
  type: string;
  clientData: any;
  serverData: any;
  field: string;
  clientValue: any;
  serverValue: any;
  timestamp: number;
}

export interface SyncResult {
  success: boolean;
  conflicts: SyncConflict[];
  synced: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

/**
 * Offline Sync Manager
 */
export class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private syncing = false;
  private conflictResolvers: Map<
    string,
    (conflict: SyncConflict) => ConflictResolution
  > = new Map();

  private constructor() {
    this.setupDefaultResolvers();
  }

  static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  /**
   * Perform full sync with conflict resolution
   */
  async performSync(): Promise<SyncResult> {
    if (this.syncing) {
      throw new Error('Sync already in progress');
    }

    if (!navigator.onLine) {
      throw new Error('Device is offline');
    }

    this.syncing = true;
    const result: SyncResult = {
      success: false,
      conflicts: [],
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      const pendingData = await offlineStorage.getPendingData();

      for (const item of pendingData) {
        try {
          const syncResult = await this.syncWithConflictResolution(item);

          if (syncResult.success) {
            await offlineStorage.markSynced(item.id);
            result.synced++;
          } else {
            result.failed++;
            result.errors.push({
              id: item.id,
              error: syncResult.error || 'Unknown error',
            });

            if (syncResult.conflicts) {
              result.conflicts.push(...syncResult.conflicts);
            }
          }
        } catch (error) {
          result.failed++;
          result.errors.push({
            id: item.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      result.success = result.failed === 0;
      return result;
    } finally {
      this.syncing = false;
    }
  }

  /**
   * Sync individual item with conflict resolution
   */
  private async syncWithConflictResolution(item: OfflineData): Promise<{
    success: boolean;
    error?: string;
    conflicts?: SyncConflict[];
  }> {
    try {
      // First, try to check if the resource exists on server
      const serverData = await this.fetchServerData(item);

      if (serverData && this.hasConflict(item.data, serverData)) {
        // Handle conflict
        const conflicts = this.detectConflicts(item, serverData);
        const resolution = await this.resolveConflicts(
          item,
          serverData,
          conflicts
        );

        if (resolution.strategy === 'manual') {
          return {
            success: false,
            conflicts,
            error: 'Manual conflict resolution required',
          };
        }

        // Apply resolution and sync
        const resolvedData = this.applyResolution(
          item.data,
          serverData,
          resolution
        );
        const success = await this.syncResolvedData(item, resolvedData);

        return {
          success,
          conflicts: success ? [] : conflicts,
        };
      } else {
        // No conflict, proceed with normal sync
        const success = await this.performDirectSync(item);
        return { success };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Fetch server data for comparison
   */
  private async fetchServerData(item: OfflineData): Promise<any> {
    let endpoint = '';

    switch (item.type) {
      case 'sale':
        // For sales, we might check by driver and timestamp
        endpoint = `/api/sales/check?driverId=${item.data.driverId}&timestamp=${item.timestamp}`;
        break;
      case 'inventory':
        endpoint = `/api/inventory/${item.data.productId}`;
        break;
      default:
        return null;
    }

    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch server data:', error);
      return null;
    }
  }

  /**
   * Check if there's a conflict between client and server data
   */
  private hasConflict(clientData: any, serverData: any): boolean {
    // Basic conflict detection - timestamps
    if (serverData.updatedAt && clientData.updatedAt) {
      return new Date(serverData.updatedAt) > new Date(clientData.updatedAt);
    }

    // Check specific fields that commonly conflict
    const conflictFields = ['quantity', 'unitPrice', 'discount', 'status'];

    for (const field of conflictFields) {
      if (
        clientData[field] !== undefined &&
        serverData[field] !== undefined &&
        clientData[field] !== serverData[field]
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Detect specific conflicts
   */
  private detectConflicts(item: OfflineData, serverData: any): SyncConflict[] {
    const conflicts: SyncConflict[] = [];
    const clientData = item.data;

    // Compare all relevant fields
    const fieldsToCheck = Object.keys(clientData);

    for (const field of fieldsToCheck) {
      if (
        serverData[field] !== undefined &&
        clientData[field] !== serverData[field]
      ) {
        conflicts.push({
          id: item.id,
          type: item.type,
          clientData,
          serverData,
          field,
          clientValue: clientData[field],
          serverValue: serverData[field],
          timestamp: item.timestamp,
        });
      }
    }

    return conflicts;
  }

  /**
   * Resolve conflicts based on configured strategies
   */
  private async resolveConflicts(
    item: OfflineData,
    serverData: any,
    conflicts: SyncConflict[]
  ): Promise<ConflictResolution> {
    const resolver = this.conflictResolvers.get(item.type);

    if (resolver) {
      // Use custom resolver for this data type
      const mainConflict = conflicts[0]; // Use first conflict for resolver
      return resolver(mainConflict);
    }

    // Default resolution strategy
    return this.getDefaultResolution(item, serverData, conflicts);
  }

  /**
   * Get default conflict resolution
   */
  private getDefaultResolution(
    item: OfflineData,
    serverData: any,
    conflicts: SyncConflict[]
  ): ConflictResolution {
    // For sales data, prefer client data if it's newer
    if (item.type === 'sale') {
      const serverTime = new Date(serverData.createdAt || 0).getTime();
      const clientTime = item.timestamp;

      return {
        strategy: clientTime > serverTime ? 'client-wins' : 'server-wins',
        clientData: item.data,
        serverData,
        timestamp: Date.now(),
      };
    }

    // For inventory, prefer server data (more likely to be accurate)
    if (item.type === 'inventory') {
      return {
        strategy: 'server-wins',
        clientData: item.data,
        serverData,
        timestamp: Date.now(),
      };
    }

    // Default to client wins for offline data
    return {
      strategy: 'client-wins',
      clientData: item.data,
      serverData,
      timestamp: Date.now(),
    };
  }

  /**
   * Apply conflict resolution
   */
  private applyResolution(
    clientData: any,
    serverData: any,
    resolution: ConflictResolution
  ): any {
    switch (resolution.strategy) {
      case 'client-wins':
        return clientData;

      case 'server-wins':
        return serverData;

      case 'merge':
        return resolution.mergedData || { ...serverData, ...clientData };

      default:
        return clientData;
    }
  }

  /**
   * Sync resolved data to server
   */
  private async syncResolvedData(
    item: OfflineData,
    resolvedData: any
  ): Promise<boolean> {
    try {
      let endpoint = '';
      let method = 'POST';

      switch (item.type) {
        case 'sale':
          endpoint = '/api/sales';
          break;
        case 'inventory':
          endpoint = '/api/inventory';
          method = 'PUT';
          break;
        default:
          return false;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Conflict-Resolved': 'true',
          'X-Original-Timestamp': item.timestamp.toString(),
        },
        body: JSON.stringify(resolvedData),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to sync resolved data:', error);
      return false;
    }
  }

  /**
   * Perform direct sync without conflict resolution
   */
  private async performDirectSync(item: OfflineData): Promise<boolean> {
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
      console.error('Failed to perform direct sync:', error);
      return false;
    }
  }

  /**
   * Setup default conflict resolvers
   */
  private setupDefaultResolvers(): void {
    // Sales conflict resolver
    this.conflictResolvers.set(
      'sale',
      (conflict: SyncConflict): ConflictResolution => {
        // For sales, prioritize the latest data based on timestamp
        const clientTime = conflict.clientData.timestamp || 0;
        const serverTime = new Date(
          conflict.serverData.updatedAt || 0
        ).getTime();

        return {
          strategy: clientTime > serverTime ? 'client-wins' : 'server-wins',
          clientData: conflict.clientData,
          serverData: conflict.serverData,
          timestamp: Date.now(),
        };
      }
    );

    // Inventory conflict resolver
    this.conflictResolvers.set(
      'inventory',
      (conflict: SyncConflict): ConflictResolution => {
        // For inventory, merge quantities (take the lower value for safety)
        if (
          conflict.field === 'quantity' ||
          conflict.field === 'fullCylinders'
        ) {
          const mergedData = {
            ...conflict.serverData,
            [conflict.field]: Math.min(
              conflict.clientValue,
              conflict.serverValue
            ),
          };

          return {
            strategy: 'merge',
            clientData: conflict.clientData,
            serverData: conflict.serverData,
            mergedData,
            timestamp: Date.now(),
          };
        }

        // For other inventory fields, prefer server data
        return {
          strategy: 'server-wins',
          clientData: conflict.clientData,
          serverData: conflict.serverData,
          timestamp: Date.now(),
        };
      }
    );
  }

  /**
   * Register custom conflict resolver
   */
  registerConflictResolver(
    type: string,
    resolver: (conflict: SyncConflict) => ConflictResolution
  ): void {
    this.conflictResolvers.set(type, resolver);
  }

  /**
   * Get pending conflicts that require manual resolution
   */
  async getPendingConflicts(): Promise<SyncConflict[]> {
    const pendingData = await offlineStorage.getPendingData();
    const conflicts: SyncConflict[] = [];

    for (const item of pendingData) {
      if (item.retryCount > 0 && item.lastError?.includes('conflict')) {
        const serverData = await this.fetchServerData(item);
        if (serverData && this.hasConflict(item.data, serverData)) {
          const itemConflicts = this.detectConflicts(item, serverData);
          conflicts.push(...itemConflicts);
        }
      }
    }

    return conflicts;
  }

  /**
   * Manually resolve a specific conflict
   */
  async manuallyResolveConflict(
    conflictId: string,
    resolution: ConflictResolution
  ): Promise<boolean> {
    try {
      const pendingData = await offlineStorage.getPendingData();
      const item = pendingData.find((d) => d.id === conflictId);

      if (!item) {
        throw new Error('Conflict item not found');
      }

      const resolvedData = this.applyResolution(
        item.data,
        resolution.serverData,
        resolution
      );

      const success = await this.syncResolvedData(item, resolvedData);

      if (success) {
        await offlineStorage.markSynced(item.id);
      }

      return success;
    } catch (error) {
      console.error('Failed to manually resolve conflict:', error);
      return false;
    }
  }

  /**
   * Check sync status
   */
  isSyncing(): boolean {
    return this.syncing;
  }

  /**
   * Force sync all pending data (bypass conflict resolution)
   */
  async forceSyncAll(): Promise<SyncResult> {
    if (!navigator.onLine) {
      throw new Error('Device is offline');
    }

    const pendingData = await offlineStorage.getPendingData();
    const result: SyncResult = {
      success: false,
      conflicts: [],
      synced: 0,
      failed: 0,
      errors: [],
    };

    for (const item of pendingData) {
      try {
        const success = await this.performDirectSync(item);

        if (success) {
          await offlineStorage.markSynced(item.id);
          result.synced++;
        } else {
          result.failed++;
          result.errors.push({
            id: item.id,
            error: 'Force sync failed',
          });
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          id: item.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    result.success = result.failed === 0;
    return result;
  }
}

// Export singleton instance
export const offlineSync = OfflineSyncManager.getInstance();
