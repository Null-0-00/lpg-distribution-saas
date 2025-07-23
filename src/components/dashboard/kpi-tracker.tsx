'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  Users,
  Activity,
  BarChart3,
  Zap,
  Award,
  Calendar,
  Filter
} from 'lucide-react';
import { CircularProgress, ProgressIndicator } from './progress-indicator';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface KPI {
  id: string;
  name: string;
  category: 'sales' | 'inventory' | 'financial' | 'operational';
  current: number;
  target: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  status: 'on-track' | 'behind' | 'ahead' | 'at-risk';
  trend: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
    period: string;
  };
  threshold: {
    warning: number;
    critical: number;
  };
  history: Array<{
    date: string;
    value: number;
    target: number;
  }>;
}

interface KPITrackerProps {
  dashboardData: any;
  liveMetrics: any;
}

export function KPITracker({ dashboardData, liveMetrics }: KPITrackerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('daily');
  const [kpis, setKpis] = useState<KPI[]>([]);

  useEffect(() => {
    if (dashboardData && liveMetrics) {
      generateKPIs();
    }
  }, [dashboardData, liveMetrics]);

  const generateKPIs = () => {
    const generatedKPIs: KPI[] = [
      {
        id: 'daily-revenue',
        name: 'Daily Revenue',
        category: 'sales',
        current: liveMetrics?.today?.revenue || 0,
        target: 100000,
        unit: '৳',
        period: 'daily',
        status: getKPIStatus(liveMetrics?.today?.revenue || 0, 100000),
        trend: {
          direction: liveMetrics?.growth?.revenue > 0 ? 'up' : liveMetrics?.growth?.revenue < 0 ? 'down' : 'neutral',
          percentage: Math.abs(liveMetrics?.growth?.revenue || 0),
          period: 'vs yesterday'
        },
        threshold: {
          warning: 70000,
          critical: 50000
        },
        history: generateHistoryData(liveMetrics?.today?.revenue || 0, 7)
      },
      {
        id: 'monthly-sales',
        name: 'Monthly Sales Target',
        category: 'sales',
        current: dashboardData?.metrics?.sales?.totalRevenue || 0,
        target: 3000000,
        unit: '৳',
        period: 'monthly',
        status: getKPIStatus(dashboardData?.metrics?.sales?.totalRevenue || 0, 3000000),
        trend: {
          direction: dashboardData?.metrics?.sales?.revenueGrowth > 0 ? 'up' : 'down',
          percentage: Math.abs(dashboardData?.metrics?.sales?.revenueGrowth || 0),
          period: 'vs last month'
        },
        threshold: {
          warning: 2100000,
          critical: 1500000
        },
        history: generateHistoryData(dashboardData?.metrics?.sales?.totalRevenue || 0, 30)
      },
      {
        id: 'inventory-turnover',
        name: 'Inventory Turnover',
        category: 'inventory',
        current: dashboardData?.metrics?.inventory?.turnoverRate || 0,
        target: 15,
        unit: 'days',
        period: 'monthly',
        status: getKPIStatus(dashboardData?.metrics?.inventory?.turnoverRate || 0, 15, true),
        trend: {
          direction: 'neutral',
          percentage: 0,
          period: 'vs last month'
        },
        threshold: {
          warning: 20,
          critical: 25
        },
        history: generateHistoryData(dashboardData?.metrics?.inventory?.turnoverRate || 0, 30)
      },
      {
        id: 'collection-rate',
        name: 'Collection Rate',
        category: 'financial',
        current: dashboardData?.metrics?.receivables?.collectionRate || 0,
        target: 95,
        unit: '%',
        period: 'monthly',
        status: getKPIStatus(dashboardData?.metrics?.receivables?.collectionRate || 0, 95),
        trend: {
          direction: 'neutral',
          percentage: 0,
          period: 'vs last month'
        },
        threshold: {
          warning: 85,
          critical: 75
        },
        history: generateHistoryData(dashboardData?.metrics?.receivables?.collectionRate || 0, 30)
      },
      {
        id: 'driver-efficiency',
        name: 'Driver Efficiency',
        category: 'operational',
        current: dashboardData?.metrics?.drivers?.averagePerformance || 0,
        target: 50000,
        unit: '৳',
        period: 'daily',
        status: getKPIStatus(dashboardData?.metrics?.drivers?.averagePerformance || 0, 50000),
        trend: {
          direction: 'neutral',
          percentage: 0,
          period: 'vs yesterday'
        },
        threshold: {
          warning: 35000,
          critical: 25000
        },
        history: generateHistoryData(dashboardData?.metrics?.drivers?.averagePerformance || 0, 7)
      },
      {
        id: 'profit-margin',
        name: 'Profit Margin',
        category: 'financial',
        current: dashboardData?.metrics?.financial?.profitMargin || 0,
        target: 20,
        unit: '%',
        period: 'monthly',
        status: getKPIStatus(dashboardData?.metrics?.financial?.profitMargin || 0, 20),
        trend: {
          direction: 'neutral',
          percentage: 0,
          period: 'vs last month'
        },
        threshold: {
          warning: 15,
          critical: 10
        },
        history: generateHistoryData(dashboardData?.metrics?.financial?.profitMargin || 0, 30)
      }
    ];

    setKpis(generatedKPIs);
  };

  const getKPIStatus = (current: number, target: number, inverse = false): 'on-track' | 'behind' | 'ahead' | 'at-risk' => {
    const percentage = (current / target) * 100;
    
    if (inverse) {
      if (percentage <= 100) return 'ahead';
      if (percentage <= 120) return 'on-track';
      if (percentage <= 140) return 'behind';
      return 'at-risk';
    } else {
      if (percentage >= 100) return 'ahead';
      if (percentage >= 90) return 'on-track';
      if (percentage >= 70) return 'behind';
      return 'at-risk';
    }
  };

  const generateHistoryData = (current: number, days: number) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.3;
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, current * (1 + variation)),
        target: current * 1.1
      });
    }
    return data;
  };

  const filteredKPIs = kpis.filter(kpi => 
    selectedCategory === 'all' || kpi.category === selectedCategory
  ).filter(kpi =>
    selectedPeriod === 'all' || kpi.period === selectedPeriod
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales': return <DollarSign className="h-4 w-4" />;
      case 'inventory': return <Package className="h-4 w-4" />;
      case 'financial': return <BarChart3 className="h-4 w-4" />;
      case 'operational': return <Users className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-600 bg-green-50 border-green-200';
      case 'on-track': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'behind': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'at-risk': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ahead': return <Badge className="bg-green-100 text-green-800">Ahead</Badge>;
      case 'on-track': return <Badge className="bg-blue-100 text-blue-800">On Track</Badge>;
      case 'behind': return <Badge className="bg-yellow-100 text-yellow-800">Behind</Badge>;
      case 'at-risk': return <Badge variant="destructive">At Risk</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const calculateOverallScore = () => {
    if (kpis.length === 0) return 0;
    const scores = {
      'ahead': 100,
      'on-track': 80,
      'behind': 60,
      'at-risk': 30
    };
    const totalScore = kpis.reduce((sum, kpi) => sum + scores[kpi.status], 0);
    return Math.round(totalScore / kpis.length);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">KPI Tracker</h2>
          <p className="text-muted-foreground">Monitor key performance indicators and targets</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <CircularProgress
                value={calculateOverallScore()}
                max={100}
                size={60}
                strokeWidth={6}
                color={calculateOverallScore() > 80 ? '#10b981' : calculateOverallScore() > 60 ? '#f59e0b' : '#ef4444'}
              />
              <div>
                <div className="text-2xl font-bold">{calculateOverallScore()}%</div>
                <p className="text-xs text-muted-foreground">Performance score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {kpis.filter(k => k.status === 'on-track' || k.status === 'ahead').length}
            </div>
            <p className="text-xs text-muted-foreground">of {kpis.length} KPIs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Behind</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {kpis.filter(k => k.status === 'behind').length}
            </div>
            <p className="text-xs text-muted-foreground">need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {kpis.filter(k => k.status === 'at-risk').length}
            </div>
            <p className="text-xs text-muted-foreground">critical issues</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredKPIs.map((kpi) => (
          <Card key={kpi.id} className={`border-l-4 ${getStatusColor(kpi.status).split(' ')[2]}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(kpi.category)}
                  <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
                </div>
                {getStatusBadge(kpi.status)}
              </div>
              <CardDescription className="capitalize">{kpi.period} target</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {kpi.unit === '৳' ? `৳${kpi.current.toLocaleString()}` : 
                     kpi.unit === '%' ? `${kpi.current.toFixed(1)}%` : 
                     `${kpi.current.toLocaleString()}${kpi.unit}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Target: {kpi.unit === '৳' ? `৳${kpi.target.toLocaleString()}` : 
                            kpi.unit === '%' ? `${kpi.target}%` : 
                            `${kpi.target.toLocaleString()}${kpi.unit}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    {kpi.trend.direction === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : kpi.trend.direction === 'down' ? (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    ) : null}
                    <span className={`text-xs font-medium ${
                      kpi.trend.direction === 'up' ? 'text-green-500' : 
                      kpi.trend.direction === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {kpi.trend.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{kpi.trend.period}</div>
                </div>
              </div>

              <Progress 
                value={Math.min(100, (kpi.current / kpi.target) * 100)} 
                className="h-2"
              />

              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpi.history.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).getDate().toString()}
                      fontSize={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: any) => [
                        kpi.unit === '৳' ? `৳${value.toLocaleString()}` : 
                        kpi.unit === '%' ? `${value.toFixed(1)}%` : 
                        `${value.toLocaleString()}${kpi.unit}`,
                        'Value'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      strokeWidth={1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}