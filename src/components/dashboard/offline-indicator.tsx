'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Wifi,
  WifiOff,
  Download,
  RefreshCw,
  Database,
  Clock,
  CheckCircle,
  AlertTriangle,
  HardDrive,
} from 'lucide-react';
import { offlineStorage } from '@/lib/offline-storage';

interface OfflineIndicatorProps {
  onSyncRequest?: () => void;
}

export function OfflineIndicator({ onSyncRequest }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [cacheSize, setCacheSize] = useState({ used: 0, available: 0 });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkCacheStatus();
    const interval = setInterval(checkCacheStatus, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const checkCacheStatus = async () => {
    try {
      const snapshot = await offlineStorage.getLatestSnapshot();
      if (snapshot?.lastUpdated) {
        setLastSync(new Date(snapshot.lastUpdated));
      }

      const usage = await offlineStorage.getDiskUsage();
      setCacheSize(usage);
    } catch (error) {
      console.error('Failed to check cache status:', error);
    }
  };

  const handleSync = async () => {
    if (!isOnline) return;

    setIsSyncing(true);
    try {
      if (onSyncRequest) {
        await onSyncRequest();
      }
      await checkCacheStatus();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearCache = async () => {
    try {
      await offlineStorage.clearAllData();
      setCacheSize({ used: 0, available: 0 });
      setLastSync(null);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getConnectionStatus = () => {
    if (isOnline) {
      return {
        icon: <Wifi className="h-4 w-4 text-green-500" />,
        text: 'Online',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      };
    } else {
      return {
        icon: <WifiOff className="h-4 w-4 text-red-500" />,
        text: 'Offline',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      };
    }
  };

  const status = getConnectionStatus();
  const cacheUsagePercent =
    cacheSize.available > 0 ? (cacheSize.used / cacheSize.available) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card
        className={`border-l-4 ${isOnline ? 'border-l-green-500' : 'border-l-red-500'}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {status.icon}
              <CardTitle className="text-sm font-medium">
                Connection Status
              </CardTitle>
            </div>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {status.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOnline && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You're offline. Viewing cached data from your last sync.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1 flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Last Sync</span>
              </div>
              <div className="font-medium">{formatLastSync(lastSync)}</div>
            </div>

            <div>
              <div className="text-muted-foreground mb-1 flex items-center space-x-1">
                <Database className="h-3 w-3" />
                <span>Cache Status</span>
              </div>
              <div className="font-medium">
                {lastSync ? 'Available' : 'No data cached'}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className="flex-1"
            >
              <RefreshCw
                className={`mr-1 h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`}
              />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={clearCache}
              disabled={cacheSize.used === 0}
            >
              <HardDrive className="mr-1 h-3 w-3" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {cacheSize.available > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm font-medium">
              <HardDrive className="h-4 w-4" />
              <span>Storage Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Cache Size</span>
              <span className="font-medium">
                {formatBytes(cacheSize.used)} of{' '}
                {formatBytes(cacheSize.available)}
              </span>
            </div>

            <Progress value={cacheUsagePercent} className="h-2" />

            <div className="text-muted-foreground text-xs">
              {cacheUsagePercent.toFixed(1)}% of available storage used
            </div>

            {cacheUsagePercent > 80 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Storage is running low. Consider clearing old cache data.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function OfflineDataViewer() {
  const [offlineData, setOfflineData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOfflineData();
  }, []);

  const loadOfflineData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [snapshot, metrics] = await Promise.all([
        offlineStorage.getLatestSnapshot(),
        offlineStorage.getOfflineMetrics(),
      ]);

      if (!snapshot && !metrics) {
        setError('No offline data available');
        return;
      }

      setOfflineData({
        snapshot,
        metrics,
        availableCharts: {
          sales: await offlineStorage.getChartData('sales-trend'),
          inventory: await offlineStorage.getChartData('inventory-movement'),
          financial: await offlineStorage.getChartData('financial-ratios'),
        },
      });
    } catch (err) {
      setError('Failed to load offline data');
      console.error('Offline data load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading offline data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !offlineData) {
    return (
      <Card>
        <CardContent className="flex h-32 flex-col items-center justify-center space-y-2">
          <Database className="text-muted-foreground h-8 w-8" />
          <div className="text-center">
            <p className="text-sm font-medium">No Offline Data</p>
            <p className="text-muted-foreground text-xs">
              {error ||
                'Connect to the internet to cache data for offline viewing'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { snapshot, metrics } = offlineData;
  const syncDate = snapshot?.lastUpdated
    ? new Date(snapshot.lastUpdated)
    : null;

  return (
    <div className="space-y-4">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          Viewing cached data from{' '}
          {syncDate ? syncDate.toLocaleString() : 'unknown time'}. Some
          information may be outdated.
        </AlertDescription>
      </Alert>

      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.sales && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sales (Cached)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  ৳{metrics.sales.totalRevenue?.toLocaleString() || 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  {metrics.sales.totalOrders || 0} orders
                </p>
              </CardContent>
            </Card>
          )}

          {metrics.inventory && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Inventory (Cached)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {metrics.inventory.fullCylinders || 0}
                </div>
                <p className="text-muted-foreground text-xs">Full cylinders</p>
              </CardContent>
            </Card>
          )}

          {metrics.drivers && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Drivers (Cached)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {metrics.drivers.totalActiveDrivers || 0}
                </div>
                <p className="text-muted-foreground text-xs">Active drivers</p>
              </CardContent>
            </Card>
          )}

          {metrics.financial && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Financial (Cached)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {metrics.financial.profitMargin?.toFixed(1) || 0}%
                </div>
                <p className="text-muted-foreground text-xs">Profit margin</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Button onClick={loadOfflineData} variant="outline" className="w-full">
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh Offline Data
      </Button>
    </div>
  );
}
