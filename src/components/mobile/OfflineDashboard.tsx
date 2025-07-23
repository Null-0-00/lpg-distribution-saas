'use client';

import React, { useState, useEffect } from 'react';
import { offlineStorage } from '@/lib/offline/storage';
import { MobileCard } from '@/components/ui/mobile-optimized';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  Wifi,
  WifiOff,
  CloudOff,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface DashboardMetrics {
  todaySales: {
    count: number;
    revenue: number;
    packageSales: number;
    refillSales: number;
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    totalCylinders: number;
  };
  drivers: {
    active: number;
    onRoute: number;
  };
  receivables: {
    cash: number;
    cylinders: number;
  };
  lastUpdated: string;
}

interface SyncStatus {
  isOnline: boolean;
  pendingItems: number;
  lastSync: number;
  syncing: boolean;
}

export function OfflineDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    pendingItems: 0,
    lastSync: 0,
    syncing: false,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  const loadDashboardData = async (forceRefresh = false) => {
    try {
      setLoading(!metrics); // Only show loading if no cached data

      // First, try to get cached data
      const cachedMetrics =
        await offlineStorage.getCachedData('dashboard-metrics');
      if (cachedMetrics && !forceRefresh) {
        setMetrics(cachedMetrics);
      }

      // If online, try to get fresh data
      if (navigator.onLine && (forceRefresh || !cachedMetrics)) {
        try {
          const response = await fetch('/api/dashboard/metrics');
          if (response.ok) {
            const freshMetrics = await response.json();
            setMetrics(freshMetrics);

            // Cache the fresh data
            await offlineStorage.cacheData(
              'dashboard-metrics',
              freshMetrics,
              'metrics',
              300000
            ); // 5 minutes
          }
        } catch (fetchError) {
          console.log('Failed to fetch fresh metrics, using cached data');
        }
      }

      // Update sync status
      const status = await offlineStorage.getSyncStatus();
      setSyncStatus({
        isOnline: navigator.onLine,
        pendingItems: status.pendingItems,
        lastSync: status.lastSync,
        syncing: false,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData(true);
  };

  // Setup network listeners and initial load
  useEffect(() => {
    loadDashboardData();

    const handleOnline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: true }));
      loadDashboardData(true); // Refresh data when coming online
    };

    const handleOffline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-refresh every 5 minutes when online
    const refreshInterval = setInterval(() => {
      if (navigator.onLine) {
        loadDashboardData(true);
      }
    }, 300000); // 5 minutes

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(refreshInterval);
    };
  }, []);

  const formatLastSync = (timestamp: number) => {
    if (!timestamp) return 'Never';

    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading && !metrics) {
    return (
      <div className="space-y-6">
        {/* Status Card Skeleton */}
        <MobileCard>
          <Skeleton className="h-16 w-full" />
        </MobileCard>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <MobileCard key={i}>
              <Skeleton className="h-20 w-full" />
            </MobileCard>
          ))}
        </div>

        {/* Additional Cards Skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <MobileCard key={i}>
              <Skeleton className="h-16 w-full" />
            </MobileCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Network Status & Sync Info */}
      <MobileCard padding="sm" className="bg-gray-50">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {syncStatus.isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            <span className="text-sm font-medium">
              {syncStatus.isOnline ? 'Online' : 'Offline Mode'}
            </span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || !syncStatus.isOnline}
            className="hover:bg-muted/50 rounded-full p-1 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last sync: {formatLastSync(syncStatus.lastSync)}</span>

          {syncStatus.pendingItems > 0 && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <CloudOff className="h-3 w-3" />
              <span>{syncStatus.pendingItems} pending</span>
            </Badge>
          )}
        </div>
      </MobileCard>

      {/* Today's Sales Summary */}
      <MobileCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Today's Sales</h3>
          <TrendingUp className="h-5 w-5 text-green-600" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.todaySales.count || 0}
            </div>
            <div className="text-sm text-gray-500">Total Sales</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics?.todaySales.revenue || 0)}
            </div>
            <div className="text-sm text-gray-500">Revenue</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
          <div className="text-center">
            <div className="text-lg font-semibold">
              {metrics?.todaySales.packageSales || 0}
            </div>
            <div className="text-xs text-gray-500">Package Sales</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold">
              {metrics?.todaySales.refillSales || 0}
            </div>
            <div className="text-xs text-gray-500">Refill Sales</div>
          </div>
        </div>
      </MobileCard>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Inventory Status */}
        <MobileCard padding="sm">
          <div className="mb-2 flex items-center space-x-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Inventory</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Products:</span>
              <span className="font-semibold">
                {metrics?.inventory.totalProducts || 0}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Cylinders:</span>
              <span className="font-semibold">
                {metrics?.inventory.totalCylinders || 0}
              </span>
            </div>
            {(metrics?.inventory.lowStockCount || 0) > 0 && (
              <div className="flex justify-between text-xs text-orange-600">
                <span>Low Stock:</span>
                <span className="font-semibold">
                  {metrics?.inventory.lowStockCount}
                </span>
              </div>
            )}
          </div>
        </MobileCard>

        {/* Drivers Status */}
        <MobileCard padding="sm">
          <div className="mb-2 flex items-center space-x-2">
            <Truck className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Drivers</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Active:</span>
              <span className="font-semibold">
                {metrics?.drivers.active || 0}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>On Route:</span>
              <span className="font-semibold">
                {metrics?.drivers.onRoute || 0}
              </span>
            </div>
          </div>
        </MobileCard>

        {/* Cash Receivables */}
        <MobileCard padding="sm">
          <div className="mb-2 flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">Cash Due</span>
          </div>

          <div className="text-lg font-bold text-yellow-600">
            {formatCurrency(metrics?.receivables.cash || 0)}
          </div>
        </MobileCard>

        {/* Cylinder Receivables */}
        <MobileCard padding="sm">
          <div className="mb-2 flex items-center space-x-2">
            <Package className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Cylinders Due</span>
          </div>

          <div className="text-lg font-bold text-purple-600">
            {metrics?.receivables.cylinders || 0}
          </div>
        </MobileCard>
      </div>

      {/* Alerts & Notifications */}
      {(metrics?.inventory.lowStockCount || 0) > 0 && (
        <MobileCard className="border-orange-200 bg-orange-50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <div className="text-sm font-medium text-orange-800">
                Low Stock Alert
              </div>
              <div className="text-xs text-orange-600">
                {metrics?.inventory.lowStockCount} products running low
              </div>
            </div>
          </div>
        </MobileCard>
      )}

      {/* Offline Mode Notice */}
      {!syncStatus.isOnline && (
        <MobileCard className="border-blue-200 bg-blue-50">
          <div className="flex items-center space-x-2">
            <CloudOff className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-blue-800">
                Working Offline
              </div>
              <div className="text-xs text-blue-600">
                Data will sync when connection is restored
              </div>
            </div>
          </div>
        </MobileCard>
      )}

      {/* Sync Success */}
      {syncStatus.isOnline &&
        syncStatus.pendingItems === 0 &&
        syncStatus.lastSync > 0 && (
          <MobileCard className="border-green-200 bg-green-50">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-green-800">
                  All Data Synced
                </div>
                <div className="text-xs text-green-600">
                  Last sync: {formatLastSync(syncStatus.lastSync)}
                </div>
              </div>
            </div>
          </MobileCard>
        )}

      {/* Data Freshness Info */}
      <div className="text-center text-xs text-gray-500">
        {metrics?.lastUpdated && (
          <span>
            Data updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
