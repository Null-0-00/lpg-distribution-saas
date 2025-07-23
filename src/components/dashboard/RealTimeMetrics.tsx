"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, RefreshCw, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MetricData {
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
}

interface RealTimeMetrics {
  salesVelocity: MetricData;
  revenueRate: MetricData;
  driverEfficiency: MetricData;
  stockTurnover: MetricData;
  lastUpdated: string;
}

export function RealTimeMetrics() {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/dashboard/real-time-metrics');
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to load real-time metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading && !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Real-Time Business Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading real-time data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metricsData = metrics || {
    salesVelocity: { current: 2.3, previous: 1.8, trend: 'up', change: 0.5, changePercent: 27.8 },
    revenueRate: { current: 1250, previous: 980, trend: 'up', change: 270, changePercent: 27.6 },
    driverEfficiency: { current: 85.2, previous: 82.1, trend: 'up', change: 3.1, changePercent: 3.8 },
    stockTurnover: { current: 4.2, previous: 3.9, trend: 'up', change: 0.3, changePercent: 7.7 },
    lastUpdated: new Date().toISOString()
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-500" />
              Real-Time Business Metrics
            </CardTitle>
            <CardDescription>
              Live performance indicators updated every 30 seconds
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              LIVE
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMetrics}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sales Velocity */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Sales Velocity</span>
              {getTrendIcon(metricsData.salesVelocity.trend)}
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {metricsData.salesVelocity.current.toFixed(1)}
            </div>
            <div className="text-xs text-blue-600">
              cylinders/hour
            </div>
            <div className={`text-xs mt-1 ${getTrendColor(metricsData.salesVelocity.trend)}`}>
              {metricsData.salesVelocity.trend === 'up' ? '+' : ''}
              {metricsData.salesVelocity.changePercent.toFixed(1)}% from last hour
            </div>
          </div>

          {/* Revenue Rate */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Revenue Rate</span>
              {getTrendIcon(metricsData.revenueRate.trend)}
            </div>
            <div className="text-2xl font-bold text-green-900">
              ৳{formatNumber(metricsData.revenueRate.current)}
            </div>
            <div className="text-xs text-green-600">
              per hour
            </div>
            <div className={`text-xs mt-1 ${getTrendColor(metricsData.revenueRate.trend)}`}>
              {metricsData.revenueRate.trend === 'up' ? '+' : ''}
              {metricsData.revenueRate.changePercent.toFixed(1)}% from last hour
            </div>
          </div>

          {/* Driver Efficiency */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">Driver Efficiency</span>
              {getTrendIcon(metricsData.driverEfficiency.trend)}
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {metricsData.driverEfficiency.current.toFixed(1)}%
            </div>
            <div className="text-xs text-purple-600">
              target achievement
            </div>
            <div className={`text-xs mt-1 ${getTrendColor(metricsData.driverEfficiency.trend)}`}>
              {metricsData.driverEfficiency.trend === 'up' ? '+' : ''}
              {metricsData.driverEfficiency.changePercent.toFixed(1)}% from yesterday
            </div>
          </div>

          {/* Stock Turnover */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700">Stock Turnover</span>
              {getTrendIcon(metricsData.stockTurnover.trend)}
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {metricsData.stockTurnover.current.toFixed(1)}x
            </div>
            <div className="text-xs text-orange-600">
              weekly rate
            </div>
            <div className={`text-xs mt-1 ${getTrendColor(metricsData.stockTurnover.trend)}`}>
              {metricsData.stockTurnover.trend === 'up' ? '+' : ''}
              {metricsData.stockTurnover.changePercent.toFixed(1)}% from last week
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <span>
              Next refresh in {30 - (new Date().getSeconds() % 30)}s
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}