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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FallbackDataService,
  type TrendData,
} from '@/lib/services/fallback-data';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  Maximize,
  Filter,
} from 'lucide-react';

// Using TrendData from centralized service

interface ChartProps {
  timeRange: '7d' | '30d' | '90d';
  metric: 'sales' | 'revenue' | 'drivers' | 'efficiency';
}

export function InteractiveTrendChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [metric, setMetric] = useState<
    'sales' | 'revenue' | 'drivers' | 'efficiency'
  >('sales');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadTrendData();
  }, [timeRange, metric]);

  const loadTrendData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/dashboard/trends?range=${timeRange}&metric=${metric}`
      );

      if (response.ok) {
        const trendData = await response.json();
        setData(trendData.data || []);
      } else {
        // Use centralized fallback data
        setData(FallbackDataService.getTrendData(timeRange));
      }
    } catch (error) {
      console.error('Failed to load trend data:', error);
      setData(FallbackDataService.getTrendData(timeRange));
    } finally {
      setLoading(false);
    }
  };

  const getMetricConfig = () => {
    const configs = {
      sales: {
        label: 'Sales Volume',
        color: 'bg-blue-500',
        lightColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        unit: 'cylinders',
        icon: <BarChart3 className="h-4 w-4" />,
      },
      revenue: {
        label: 'Revenue',
        color: 'bg-green-500',
        lightColor: 'bg-green-100',
        textColor: 'text-green-600',
        unit: '৳',
        icon: <TrendingUp className="h-4 w-4" />,
      },
      drivers: {
        label: 'Active Drivers',
        color: 'bg-purple-500',
        lightColor: 'bg-purple-100',
        textColor: 'text-purple-600',
        unit: 'drivers',
        icon: <Calendar className="h-4 w-4" />,
      },
      efficiency: {
        label: 'Efficiency',
        color: 'bg-orange-500',
        lightColor: 'bg-orange-100',
        textColor: 'text-orange-600',
        unit: '%',
        icon: <TrendingUp className="h-4 w-4" />,
      },
    };
    return configs[metric];
  };

  const config = getMetricConfig();
  const maxValue = Math.max(...data.map((d) => d[metric]));
  const minValue = Math.min(...data.map((d) => d[metric]));
  const avgValue = data.reduce((sum, d) => sum + d[metric], 0) / data.length;

  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };

    const recent = data.slice(-3).reduce((sum, d) => sum + d[metric], 0) / 3;
    const previous =
      data.slice(0, 3).reduce((sum, d) => sum + d[metric], 0) / 3;

    const change = ((recent - previous) / previous) * 100;

    return {
      direction: Math.abs(change) < 5 ? 'stable' : change > 0 ? 'up' : 'down',
      percentage: Math.abs(change),
    };
  };

  const trend = calculateTrend();

  const formatValue = (value: number) => {
    if (metric === 'revenue') {
      return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString();
    }
    return value.toFixed(1);
  };

  return (
    <Card className={isExpanded ? 'col-span-full' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              {config.icon}
              <span className="ml-2">{config.label} Trends</span>
            </CardTitle>
            <CardDescription>
              Interactive performance analytics over time
            </CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            <Badge
              variant={
                trend.direction === 'up'
                  ? 'default'
                  : trend.direction === 'down'
                    ? 'destructive'
                    : 'secondary'
              }
              className="flex items-center"
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : trend.direction === 'down' ? (
                <TrendingDown className="mr-1 h-3 w-3" />
              ) : null}
              {trend.percentage.toFixed(1)}%
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Select
            value={timeRange}
            onValueChange={(value: any) => setTimeRange(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={metric}
            onValueChange={(value: any) => setMetric(value)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales Volume</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="drivers">Active Drivers</SelectItem>
              <SelectItem value="efficiency">Efficiency</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={loadTrendData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
            <span>Loading trend data...</span>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div
                className={`${config.lightColor} rounded-lg p-3 text-center`}
              >
                <div className={`text-lg font-bold ${config.textColor}`}>
                  {metric === 'revenue' ? '৳' : ''}
                  {formatValue(maxValue)}
                  {metric === 'efficiency' ? '%' : ''}
                </div>
                <div className="text-xs text-gray-600">Peak</div>
              </div>
              <div
                className={`${config.lightColor} rounded-lg p-3 text-center`}
              >
                <div className={`text-lg font-bold ${config.textColor}`}>
                  {metric === 'revenue' ? '৳' : ''}
                  {formatValue(avgValue)}
                  {metric === 'efficiency' ? '%' : ''}
                </div>
                <div className="text-xs text-gray-600">Average</div>
              </div>
              <div
                className={`${config.lightColor} rounded-lg p-3 text-center`}
              >
                <div className={`text-lg font-bold ${config.textColor}`}>
                  {metric === 'revenue' ? '৳' : ''}
                  {formatValue(minValue)}
                  {metric === 'efficiency' ? '%' : ''}
                </div>
                <div className="text-xs text-gray-600">Lowest</div>
              </div>
            </div>

            {/* Chart */}
            <div className="space-y-4">
              {/* X-axis labels */}
              <div
                className="grid gap-1 text-center text-xs text-gray-500"
                style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}
              >
                {data.map((item, index) => (
                  <div key={index}>{item.period}</div>
                ))}
              </div>

              {/* Chart bars */}
              <div
                className={`grid items-end gap-1 ${isExpanded ? 'h-64' : 'h-32'}`}
                style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}
              >
                {data.map((item, index) => {
                  const height =
                    maxValue > 0 ? (item[metric] / maxValue) * 100 : 0;
                  const isHighest = item[metric] === maxValue;

                  return (
                    <div
                      key={index}
                      className="group relative flex flex-col items-center"
                    >
                      <div
                        className={`w-full rounded-t transition-all duration-300 hover:opacity-80 ${
                          isHighest ? config.color : 'bg-gray-300'
                        }`}
                        style={{ height: `${height}%` }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {metric === 'revenue' ? '৳' : ''}
                          {item[metric].toLocaleString()}
                          {metric === 'efficiency' ? '%' : ''}
                        </div>
                      </div>

                      {/* Value label */}
                      <div className="mt-1 text-xs text-gray-600">
                        {formatValue(item[metric])}
                        {metric === 'efficiency' ? '%' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
