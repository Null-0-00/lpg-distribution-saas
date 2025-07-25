'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSettings } from '@/contexts/SettingsContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  Settings,
  Download,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Package,
  Users,
  Target,
} from 'lucide-react';
import CommissionManagement from '@/components/analytics/CommissionManagement';

interface AnalyticsData {
  month: number;
  year: number;
  driverId?: string;
  overview: {
    totalExpenses: number;
    totalRevenue: number;
    totalSalesQuantity: number;
    costPerUnit: number;
    totalProfit: number;
    profitMargin: number;
  };
  products: Array<{
    product: {
      id: string;
      name: string;
      size: string;
      company: string;
    };
    buyingPrice: number;
    sellingPrice: number;
    commission: number;
    fixedCostPerUnit: number;
    breakevenPrice: number;
    profitPerUnit: number;
    salesQuantity: number;
    revenue: number;
    totalProfit: number;
  }>;
  drivers: Array<{
    driver: {
      id: string;
      name: string;
    };
    totalQuantity: number;
    totalRevenue: number;
    costPerUnit: number;
  }>;
}

interface Driver {
  id: string;
  name: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const { t, formatCurrency, formatDate } = useSettings();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const months = [
    { value: 1, label: t('january') },
    { value: 2, label: t('february') },
    { value: 3, label: t('march') },
    { value: 4, label: t('april') },
    { value: 5, label: t('may') },
    { value: 6, label: t('june') },
    { value: 7, label: t('july') },
    { value: 8, label: t('august') },
    { value: 9, label: t('september') },
    { value: 10, label: t('october') },
    { value: 11, label: t('november') },
    { value: 12, label: t('december') },
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedYear, selectedDriver]);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setDrivers(data.filter((driver: any) => driver.status === 'ACTIVE'));
        } else if (data && Array.isArray(data.drivers)) {
          setDrivers(
            data.drivers.filter((driver: any) => driver.status === 'ACTIVE')
          );
        } else {
          setDrivers([]);
        }
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setDrivers([]);
    }
  };

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
      });

      if (selectedDriver !== 'all') {
        params.append('driverId', selectedDriver);
      }

      const response = await fetch(`/api/analytics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        setError(t('failedToLoadData'));
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(t('errorLoadingData'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMonthName = (month: number) => {
    return months.find((m) => m.value === month)?.label || '';
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600';
    if (profit < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getProfitBadgeVariant = (profit: number) => {
    if (profit > 0) return 'default';
    if (profit < 0) return 'destructive';
    return 'secondary';
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 h-6 w-6 animate-spin text-blue-600" />
            <p className="text-muted-foreground">{t('loadingData')}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-muted-foreground mb-4">
              {error || t('noDataAvailable')}
            </p>
            <button
              onClick={() => fetchAnalytics()}
              className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <RefreshCw className="mr-2 inline h-4 w-4" />
              {t('tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">
            {t('analytics')} {t('dashboard')}
          </h1>
          <p className="text-muted-foreground">
            {t('analytics')} {t('performance')} {t('reports')}{' '}
            {getMonthName(selectedMonth)} {selectedYear}
            {selectedDriver !== 'all' && (
              <span className="ml-2">
                - {drivers.find((d) => d.id === selectedDriver)?.name}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => fetchAnalytics(true)}
            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            {t('refresh')}
          </button>
          <button
            onClick={() => setShowCommissionModal(true)}
            className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <Settings className="mr-2 h-4 w-4" />
            {t('settings')}
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center space-x-2">
            <label className="text-muted-foreground text-sm font-medium">
              {t('month')}:
            </label>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-muted-foreground text-sm font-medium">
              {t('year')}:
            </label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-muted-foreground text-sm font-medium">
              {t('drivers')}:
            </label>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allDrivers')}</SelectItem>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('totalRevenue')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(analyticsData.overview.totalRevenue)}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('monthlyRevenue')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('totalExpenses')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(analyticsData.overview.totalExpenses)}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('allExpenses')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">{t('revenue')}</p>
              <p
                className={`text-2xl font-bold ${getProfitColor(analyticsData.overview.totalProfit)}`}
              >
                {formatCurrency(analyticsData.overview.totalProfit)}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('totalProfit')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex items-center">
            <Calculator className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">{t('revenue')} %</p>
              <p
                className={`text-2xl font-bold ${getProfitColor(analyticsData.overview.profitMargin)}`}
              >
                {analyticsData.overview.profitMargin.toFixed(1)}%
              </p>
              <p className="text-muted-foreground text-xs">{t('revenue')}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">
            {t('products')} {t('analytics')}
          </TabsTrigger>
          {selectedDriver === 'all' && (
            <TabsTrigger value="drivers">
              {t('drivers')} {t('analytics')}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {/* Product Analytics Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground text-lg font-semibold">
                {t('products')} {t('analytics')}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                {t('comprehensiveProfitabilityAnalysis')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        {t('products')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {t('buyingPrice')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {t('commission')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {t('fixedCost')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {t('breakevenPrice')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {t('sellingPrice')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {t('revenue')}/{t('unit')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {t('quantity')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {t('total')} {t('revenue')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {analyticsData.products.map((product, index) => (
                      <tr
                        key={product.product.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                          <div>
                            <div className="text-foreground font-medium">
                              {product.product.name}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {product.product.size} - {product.product.company}
                            </div>
                          </div>
                        </td>
                        <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                          {formatCurrency(product.buyingPrice)}
                        </td>
                        <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                          {formatCurrency(product.commission)}
                        </td>
                        <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                          {formatCurrency(product.fixedCostPerUnit)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(product.breakevenPrice)}
                          </span>
                        </td>
                        <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                          {formatCurrency(product.sellingPrice)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <span
                            className={`font-medium ${getProfitColor(product.profitPerUnit)}`}
                          >
                            {formatCurrency(product.profitPerUnit)}
                          </span>
                        </td>
                        <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                          {product.salesQuantity}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <span
                            className={`font-medium ${getProfitColor(product.totalProfit)}`}
                          >
                            {formatCurrency(product.totalProfit)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Profit by Product Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground text-lg font-semibold">
                {t('revenue')} {t('products')}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                {t('visualRepresentationProfitByProduct')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.products}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="product.name"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis
                      tickFormatter={formatCurrency}
                      fontSize={11}
                      tick={{ fill: '#64748b' }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        t('total') + ' ' + t('revenue'),
                      ]}
                      labelFormatter={(label) => `${t('product')}: ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Bar
                      dataKey="totalProfit"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      name={`${t('total')} ${t('revenue')}`}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedDriver === 'all' && (
          <TabsContent value="drivers" className="space-y-6">
            {/* Driver Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground text-lg font-semibold">
                  {t('drivers')} {t('performance')} {t('analytics')}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  {t('individualDriverPerformanceMetrics')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          {t('drivers')}
                        </th>
                        <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                          {t('totalQuantity')}
                        </th>
                        <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                          {t('totalRevenue')}
                        </th>
                        <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                          {t('costPerUnit')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {analyticsData.drivers.map((driver, index) => (
                        <tr
                          key={driver.driver.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                            <div className="text-foreground font-medium">
                              {driver.driver.name}
                            </div>
                          </td>
                          <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                            <span className="font-medium">
                              {driver.totalQuantity}
                            </span>
                            <span className="text-muted-foreground ml-1 text-sm">
                              {t('units')}
                            </span>
                          </td>
                          <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                            <span className="font-medium text-green-600">
                              {formatCurrency(driver.totalRevenue)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                            <span className="font-medium text-orange-600">
                              {formatCurrency(driver.costPerUnit)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Driver Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground text-lg font-semibold">
                  {t('revenue')} {t('drivers')}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  {t('comparativeAnalysisRevenueByDriver')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.drivers}
                      layout="horizontal"
                      margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        tickFormatter={formatCurrency}
                        fontSize={11}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis
                        type="category"
                        dataKey="driver.name"
                        fontSize={11}
                        width={100}
                        tick={{ fill: '#64748b' }}
                      />
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(Number(value)),
                          t('revenue'),
                        ]}
                        labelFormatter={(label) => `${t('driver')}: ${label}`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          color: 'hsl(var(--foreground))',
                        }}
                      />
                      <Bar
                        dataKey="totalRevenue"
                        fill="#10b981"
                        radius={[0, 4, 4, 0]}
                        name={t('revenue')}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <CommissionManagement
        isOpen={showCommissionModal}
        onClose={() => setShowCommissionModal(false)}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </div>
  );
}
