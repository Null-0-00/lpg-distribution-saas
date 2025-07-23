'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FallbackDataService,
  type LiveDataPoint,
} from '@/lib/services/fallback-data';
import {
  Activity,
  TrendingUp,
  Package,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
} from 'lucide-react';

export function LiveDataFeed() {
  const [dataFeed, setDataFeed] = useState<LiveDataPoint[]>(
    FallbackDataService.LIVE_DATA_FEED
  );
  const [isConnected, setIsConnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize with some data
    loadInitialData();

    // Simulate real-time updates only after mounting
    const interval = setInterval(simulateRealTimeUpdate, 15000); // Every 15 seconds
    setIsConnected(true);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const response = await fetch('/api/dashboard/live-feed');

      if (response.ok) {
        const data = await response.json();
        setDataFeed(data.feed || []);
      }
    } catch (error) {
      console.error('Failed to load live data feed:', error);
      // Use centralized fallback data
      setDataFeed(FallbackDataService.LIVE_DATA_FEED);
    }
  };

  const simulateRealTimeUpdate = () => {
    // Only generate data after component has mounted to avoid hydration issues
    if (!mounted) return;

    // Use deterministic data generation for consistency
    const currentIndex = dataFeed.length;
    const newDataPoint = FallbackDataService.getDataPointForIndex(currentIndex);
    setDataFeed((prev) => [newDataPoint, ...prev.slice(0, 19)]); // Keep only latest 20 items
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <TrendingUp className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'stock':
        return <Package className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      case 'driver':
        return <Truck className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getIconColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-500';
    if (priority === 'low') return 'text-green-500';

    switch (type) {
      case 'sale':
        return 'text-blue-500';
      case 'payment':
        return 'text-green-500';
      case 'stock':
        return 'text-orange-500';
      case 'alert':
        return 'text-yellow-500';
      case 'driver':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'destructive',
      medium: 'secondary',
      low: 'outline',
    } as const;

    return (
      <Badge
        variant={variants[priority as keyof typeof variants]}
        className="text-xs"
      >
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return time.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Card className="h-96">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Live Data Feed
            </CardTitle>
            <CardDescription>
              Real-time business activity stream
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}
            ></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {dataFeed.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>Waiting for live data...</p>
              </div>
            ) : (
              dataFeed.map((item) => (
                <div
                  key={item.id}
                  className="hover:bg-muted/50 flex items-start space-x-3 rounded-lg border border-gray-100 p-3 transition-colors"
                >
                  <div
                    className={`rounded-full bg-gray-100 p-2 ${getIconColor(item.type, item.priority)}`}
                  >
                    {getIcon(item.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="truncate text-sm font-medium text-gray-900">
                        {item.message}
                      </span>
                      {getPriorityBadge(item.priority)}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatTimeAgo(item.timestamp)}</span>

                      {item.driverName && (
                        <>
                          <span>•</span>
                          <span>{item.driverName}</span>
                        </>
                      )}

                      {item.location && (
                        <>
                          <span>•</span>
                          <span>{item.location}</span>
                        </>
                      )}

                      {item.value && (
                        <>
                          <span>•</span>
                          <span className="font-medium">
                            ৳{item.value.toFixed(0)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
