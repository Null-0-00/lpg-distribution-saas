'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  DollarSign,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Bell,
  Menu,
  RefreshCw,
  Eye,
  ChevronRight,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { CircularProgress } from './progress-indicator';

interface MobileDashboardProps {
  data: any;
  liveMetrics: any;
}

export function MobileDashboard({ data, liveMetrics }: MobileDashboardProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<any>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getGrowthIndicator = (value: number) => {
    if (value > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (value < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1000000) return `৳${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `৳${(value / 1000).toFixed(1)}K`;
    return formatCurrency(value);
  };

  const quickStats = [
    {
      title: 'Today\'s Revenue',
      value: liveMetrics?.today?.revenue || 0,
      growth: liveMetrics?.growth?.revenue || 0,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Orders',
      value: liveMetrics?.today?.orderCount || 0,
      growth: liveMetrics?.growth?.orders || 0,
      icon: <Package className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Drivers',
      value: liveMetrics?.drivers?.activeToday || 0,
      total: liveMetrics?.drivers?.total || 0,
      icon: <Users className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Stock Level',
      value: liveMetrics?.realTime?.inventory?.fullCylinders || 0,
      icon: <Package className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 lg:hidden">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <p className="text-sm text-gray-500">Real-time overview</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {quickStats.map((stat, index) => (
              <Card 
                key={index} 
                className="touch-manipulation cursor-pointer active:scale-95 transition-transform"
                onClick={() => setSelectedMetric(stat)}
              >
                <CardContent className="p-3">
                  <div className={`w-8 h-8 rounded-full ${stat.bgColor} flex items-center justify-center mb-2`}>
                    <div className={stat.color}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 truncate">{stat.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        {stat.title.includes('Revenue') ? formatCurrencyCompact(stat.value) : stat.value}
                      </span>
                      <div className="flex items-center space-x-1">
                        {stat.growth !== undefined && getGrowthIndicator(stat.growth)}
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                    {stat.total && (
                      <p className="text-xs text-gray-500">of {stat.total}</p>
                    )}
                    {stat.growth !== undefined && (
                      <p className={`text-xs ${stat.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.growth >= 0 ? '+' : ''}{stat.growth.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Live Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Last 15 minutes</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {liveMetrics?.realTime?.last15Minutes?.sales || 0} sales
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatCurrencyCompact(liveMetrics?.realTime?.last15Minutes?.revenue || 0)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Target Progress</span>
                </div>
                <div className="text-right">
                  <CircularProgress
                    value={liveMetrics?.today?.revenue || 0}
                    max={100000}
                    size={40}
                    strokeWidth={4}
                    showPercentage={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Inventory Health</span>
                  <Badge variant={data?.metrics?.inventory?.lowStockProducts > 0 ? 'destructive' : 'default'}>
                    {data?.metrics?.inventory?.lowStockProducts > 0 ? 'Attention Needed' : 'Good'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Collection Rate</span>
                  <Badge variant={data?.metrics?.receivables?.collectionRate > 90 ? 'default' : 'secondary'}>
                    {data?.metrics?.receivables?.collectionRate?.toFixed(1) || 0}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Profit Margin</span>
                  <Badge variant={data?.metrics?.financial?.profitMargin > 0 ? 'default' : 'destructive'}>
                    {data?.metrics?.financial?.profitMargin?.toFixed(1) || 0}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            <Drawer>
              <DrawerTrigger asChild>
                <Card className="cursor-pointer touch-manipulation active:scale-95 transition-transform">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Sales Details</h3>
                        <p className="text-sm text-gray-600">View detailed sales breakdown</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Sales Breakdown</DrawerTitle>
                  <DrawerDescription>Detailed sales analytics</DrawerDescription>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <p className="text-2xl font-bold text-green-600">
                        {data?.metrics?.sales?.packageSales || 0}
                      </p>
                      <p className="text-sm text-gray-600">Package Sales</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <p className="text-2xl font-bold text-blue-600">
                        {data?.metrics?.sales?.refillSales || 0}
                      </p>
                      <p className="text-sm text-gray-600">Refill Sales</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Average Order Value</span>
                      <span className="font-medium">
                        {formatCurrencyCompact(data?.metrics?.sales?.averageOrderValue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Quantity</span>
                      <span className="font-medium">{data?.metrics?.sales?.totalQuantity || 0}</span>
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>

            <Drawer>
              <DrawerTrigger asChild>
                <Card className="cursor-pointer touch-manipulation active:scale-95 transition-transform">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Driver Performance</h3>
                        <p className="text-sm text-gray-600">Top performers and rankings</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Driver Rankings</DrawerTitle>
                  <DrawerDescription>Performance leaderboard</DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {data?.metrics?.drivers?.rankings?.slice(0, 10).map((driver: any, index: number) => (
                        <div key={driver.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{driver.name}</p>
                            <p className="text-xs text-gray-600">
                              {driver.totalSales} sales • {formatCurrencyCompact(driver.totalRevenue)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          <div className="h-20"></div>
        </div>
      </ScrollArea>

      {selectedMetric && (
        <Sheet open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>{selectedMetric.title}</SheetTitle>
              <SheetDescription>Detailed view and trends</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full ${selectedMetric.bgColor} flex items-center justify-center mx-auto mb-4`}>
                  <div className={selectedMetric.color}>
                    {selectedMetric.icon}
                  </div>
                </div>
                <p className="text-3xl font-bold">
                  {selectedMetric.title.includes('Revenue') 
                    ? formatCurrencyCompact(selectedMetric.value) 
                    : selectedMetric.value
                  }
                </p>
                {selectedMetric.growth !== undefined && (
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    {getGrowthIndicator(selectedMetric.growth)}
                    <span className={`text-sm font-medium ${
                      selectedMetric.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedMetric.growth >= 0 ? '+' : ''}{selectedMetric.growth.toFixed(1)}% vs yesterday
                    </span>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}