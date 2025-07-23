'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

interface SalesTrendChartProps {
  data: Array<{
    date: string;
    revenue: number;
    quantity: number;
    orders: number;
  }>;
  height?: number;
}

export function SalesTrendChart({ data, height = 300 }: SalesTrendChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend</CardTitle>
        <CardDescription>Revenue and order trends over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              fontSize={12}
            />
            <YAxis 
              yAxisId="revenue"
              orientation="left"
              tickFormatter={formatCurrency}
              fontSize={12}
            />
            <YAxis 
              yAxisId="orders"
              orientation="right"
              fontSize={12}
            />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(Number(value)) : value,
                name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Quantity'
              ]}
              labelFormatter={(label) => formatDate(label)}
            />
            <Legend />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Revenue"
            />
            <Area
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              stackId="2"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
              name="Orders"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface InventoryMovementChartProps {
  data: Array<{
    date: string;
    fullCylinders: number;
    emptyCylinders: number;
    sales: number;
    purchases: number;
  }>;
  height?: number;
}

export function InventoryMovementChart({ data, height = 300 }: InventoryMovementChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Movement</CardTitle>
        <CardDescription>Cylinder inventory levels and movement</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })}
              fontSize={12}
            />
            <YAxis fontSize={12} />
            <Tooltip 
              labelFormatter={(label) => new Date(label).toLocaleDateString('bn-BD')}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="fullCylinders"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Full Cylinders"
            />
            <Line
              type="monotone"
              dataKey="emptyCylinders"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Empty Cylinders"
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Sales"
            />
            <Line
              type="monotone"
              dataKey="purchases"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Purchases"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ReceivablesAgingChartProps {
  data: {
    current: number;
    days31to60: number;
    days61to90: number;
    over90days: number;
  };
  height?: number;
}

export function ReceivablesAgingChart({ data, height = 300 }: ReceivablesAgingChartProps) {
  const pieData = [
    { name: '0-30 days', value: data.current, fill: '#10b981' },
    { name: '31-60 days', value: data.days31to60, fill: '#f59e0b' },
    { name: '61-90 days', value: data.days61to90, fill: '#ef4444' },
    { name: '90+ days', value: data.over90days, fill: '#7c2d12' }
  ].filter(item => item.value > 0);

  const total = data.current + data.days31to60 + data.days61to90 + data.over90days;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receivables Aging</CardTitle>
        <CardDescription>Outstanding receivables by age</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col space-y-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm">{item.name}</span>
                <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-bold">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DriverPerformanceChartProps {
  data: Array<{
    name: string;
    totalRevenue: number;
    totalSales: number;
    totalQuantity: number;
    performance: number;
  }>;
  height?: number;
}

export function DriverPerformanceChart({ data, height = 300 }: DriverPerformanceChartProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Performance</CardTitle>
        <CardDescription>Top performing drivers by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              tickFormatter={formatCurrency}
              fontSize={12}
            />
            <YAxis 
              type="category"
              dataKey="name"
              width={100}
              fontSize={12}
            />
            <Tooltip 
              formatter={(value, name) => [
                name === 'totalRevenue' ? formatCurrency(Number(value)) : value,
                name === 'totalRevenue' ? 'Revenue' : name === 'totalSales' ? 'Sales' : 'Quantity'
              ]}
            />
            <Bar dataKey="totalRevenue" fill="#3b82f6" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface FinancialRatiosChartProps {
  data: {
    profitMargin: number;
    currentRatio: number;
    returnOnAssets: number;
    healthScore: number;
  };
  height?: number;
}

export function FinancialRatiosChart({ data, height = 200 }: FinancialRatiosChartProps) {
  const ratioData = [
    { 
      name: 'Profit Margin', 
      value: Math.min(100, Math.max(0, data.profitMargin)),
      fill: data.profitMargin > 0 ? '#10b981' : '#ef4444'
    },
    { 
      name: 'Current Ratio', 
      value: Math.min(100, (data.currentRatio / 3) * 100),
      fill: data.currentRatio > 1.5 ? '#10b981' : data.currentRatio > 1 ? '#f59e0b' : '#ef4444'
    },
    { 
      name: 'ROA', 
      value: Math.min(100, Math.max(0, data.returnOnAssets)),
      fill: data.returnOnAssets > 0 ? '#10b981' : '#ef4444'
    },
    { 
      name: 'Health Score', 
      value: data.healthScore,
      fill: data.healthScore > 70 ? '#10b981' : data.healthScore > 50 ? '#f59e0b' : '#ef4444'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Health Indicators</CardTitle>
        <CardDescription>Key financial performance ratios</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="20%" 
            outerRadius="80%" 
            data={ratioData}
          >
            <RadialBar
              minAngle={15}
              label={{ position: 'insideStart', fill: 'white', fontSize: 12 }}
              background
              clockWise
              dataKey="value"
            />
            <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {ratioData.map((ratio, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm">{ratio.name}</span>
              <Badge variant={ratio.value > 70 ? 'default' : ratio.value > 50 ? 'secondary' : 'destructive'}>
                {ratio.value.toFixed(1)}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface TrendIndicatorProps {
  value: number;
  label: string;
  showPercentage?: boolean;
}

export function TrendIndicator({ value, label, showPercentage = true }: TrendIndicatorProps) {
  const getTrendIcon = () => {
    if (value > 0.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < -0.1) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (value > 0.1) return 'text-green-500';
    if (value < -0.1) return 'text-red-500';
    return 'text-gray-500';
  };

  const formatValue = () => {
    if (showPercentage) {
      return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    }
    return value > 0 ? `+${value}` : `${value}`;
  };

  return (
    <div className="flex items-center space-x-1">
      {getTrendIcon()}
      <span className={`text-xs font-medium ${getTrendColor()}`}>
        {formatValue()}
      </span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}