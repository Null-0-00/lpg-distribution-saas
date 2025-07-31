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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSettings } from '@/contexts/SettingsContext';
import {
  DynamicBarChart as BarChart,
  DynamicPieChart as PieChart,
  DynamicLineChart as LineChart,
  DynamicResponsiveContainer as ResponsiveContainer,
} from '@/components/optimization/DynamicComponents';

// These remain as regular imports since they're lightweight
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Pie,
  Cell,
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
  Plus,
  Edit,
  Trash2,
  Save,
} from 'lucide-react';

interface ProductAnalytics {
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
  saleType: 'REFILL' | 'PACKAGE';
  fifoData?: {
    totalSoldQuantity: number;
    totalCOGS: number;
    totalSalesRevenue: number;
    remainingInventoryValue: number;
  };
}

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
    refillRevenue: number;
    packageRevenue: number;
    refillProfit: number;
    packageProfit: number;
  };
  refillProducts: ProductAnalytics[];
  packageProducts: ProductAnalytics[];
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

interface Product {
  id: string;
  name: string;
  size: string;
  company: { name: string };
  currentPrice: number;
  costPrice?: number;
}

interface CommissionStructure {
  id: string;
  productId: string;
  month: number;
  year: number;
  commission: number;
  description?: string;
  product: Product;
}

interface FixedCostStructure {
  id: string;
  productId: string | null;
  month: number;
  year: number;
  costPerUnit: number;
  costType: 'MANUAL' | 'CALCULATED';
  description?: string;
  product?: Product;
}

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#000000']; // Blue, Green, Red, Black

export default function AnalyticsPage() {
  const { t, formatCurrency, formatDate } = useSettings();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [commissionStructures, setCommissionStructures] = useState<
    CommissionStructure[]
  >([]);
  const [fixedCostStructures, setFixedCostStructures] = useState<
    FixedCostStructure[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [managementLoading, setManagementLoading] = useState(false);
  const [newEntry, setNewEntry] = useState({
    productId: '',
    buyingPrice: 0,
    commission: 0,
    fixedExpense: 0,
    fixedCostType: 'MANUAL' as 'MANUAL' | 'CALCULATED',
    description: '',
  });
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

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
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchAnalytics();
    fetchManagementData();
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

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchManagementData = async () => {
    try {
      setManagementLoading(true);
      const params = new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
      });

      const [commissionResponse, fixedCostResponse] = await Promise.all([
        fetch(`/api/commission-structures?${params}`),
        fetch(`/api/fixed-cost-structures?${params}&includeGlobal=true`),
      ]);

      if (commissionResponse.ok) {
        const commissionData = await commissionResponse.json();
        setCommissionStructures(
          Array.isArray(commissionData) ? commissionData : []
        );
      }

      if (fixedCostResponse.ok) {
        const fixedCostData = await fixedCostResponse.json();
        setFixedCostStructures(
          Array.isArray(fixedCostData) ? fixedCostData : []
        );
      }
    } catch (error) {
      console.error('Error fetching management data:', error);
    } finally {
      setManagementLoading(false);
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

  const saveEntry = async () => {
    if (!newEntry.productId) return;

    try {
      const product = products.find((p) => p.id === newEntry.productId);
      if (!product) return;

      // Note: Buying prices are now auto-calculated via FIFO, no need to update product.costPrice

      // If editing, delete existing structures first
      if (editingRowId) {
        const commissionStructure = commissionStructures.find(
          (s) => s.productId === editingRowId
        );
        const fixedCostStructure = fixedCostStructures.find(
          (s) => s.productId === editingRowId
        );

        const deletePromises = [];

        if (commissionStructure) {
          deletePromises.push(
            fetch(`/api/commission-structures/${commissionStructure.id}`, {
              method: 'DELETE',
            })
          );
        }

        if (fixedCostStructure) {
          deletePromises.push(
            fetch(`/api/fixed-cost-structures/${fixedCostStructure.id}`, {
              method: 'DELETE',
            })
          );
        }

        await Promise.all(deletePromises);
      }

      // Save commission structure
      if (newEntry.commission > 0) {
        await fetch('/api/commission-structures', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: newEntry.productId,
            commission: newEntry.commission,
            month: selectedMonth,
            year: selectedYear,
            description: newEntry.description,
          }),
        });
      }

      // Save fixed cost structure
      if (
        newEntry.fixedExpense > 0 ||
        newEntry.fixedCostType === 'CALCULATED'
      ) {
        const costPerUnit =
          newEntry.fixedCostType === 'CALCULATED'
            ? analyticsData?.overview.costPerUnit || 0
            : newEntry.fixedExpense;

        await fetch('/api/fixed-cost-structures', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: newEntry.productId,
            costPerUnit: costPerUnit,
            month: selectedMonth,
            year: selectedYear,
            costType: newEntry.fixedCostType,
            description: newEntry.description,
          }),
        });
      }

      // Reset form and refresh data
      setNewEntry({
        productId: '',
        buyingPrice: 0,
        commission: 0,
        fixedExpense: 0,
        fixedCostType: 'MANUAL',
        description: '',
      });
      setEditingRowId(null);

      await Promise.all([fetchProducts(), fetchManagementData()]);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const deleteCommissionStructure = async (id: string) => {
    try {
      await fetch(`/api/commission-structures/${id}`, {
        method: 'DELETE',
      });
      await fetchManagementData();
    } catch (error) {
      console.error('Error deleting commission structure:', error);
    }
  };

  const deleteFixedCostStructure = async (id: string) => {
    try {
      await fetch(`/api/fixed-cost-structures/${id}`, {
        method: 'DELETE',
      });
      await fetchManagementData();
    } catch (error) {
      console.error('Error deleting fixed cost structure:', error);
    }
  };

  const editRow = (productId: string) => {
    // Find the combined data for this product
    const combinedData = new Map();

    // Add commission structures
    commissionStructures.forEach((structure) => {
      const key = structure.productId;
      if (!combinedData.has(key)) {
        combinedData.set(key, {
          productId: structure.productId,
          product: structure.product,
          commission: structure.commission,
          commissionDescription: structure.description,
          fixedCost: 0,
          fixedCostDescription: null,
        });
      } else {
        const existing = combinedData.get(key);
        existing.commission = structure.commission;
        existing.commissionDescription = structure.description;
      }
    });

    // Add fixed cost structures
    fixedCostStructures.forEach((structure) => {
      if (structure.productId) {
        const key = structure.productId;
        if (!combinedData.has(key)) {
          combinedData.set(key, {
            productId: structure.productId,
            product: structure.product,
            commission: 0,
            commissionDescription: null,
            fixedCost: structure.costPerUnit,
            fixedCostType: structure.costType,
            fixedCostDescription: structure.description,
          });
        } else {
          const existing = combinedData.get(key);
          existing.fixedCost = structure.costPerUnit;
          existing.fixedCostType = structure.costType;
          existing.fixedCostDescription = structure.description;
        }
      }
    });

    const entry = combinedData.get(productId);
    if (entry) {
      const product = products.find((p) => p.id === productId);
      setNewEntry({
        productId: productId,
        buyingPrice: product?.costPrice || 0,
        commission: entry.commission || 0,
        fixedExpense: entry.fixedCost || 0,
        fixedCostType: entry.fixedCostType || 'MANUAL',
        description:
          entry.commissionDescription || entry.fixedCostDescription || '',
      });
      setEditingRowId(productId);
    }
  };

  const deleteRow = async (productId: string) => {
    try {
      // Find and delete both commission and fixed cost structures for this product
      const commissionStructure = commissionStructures.find(
        (s) => s.productId === productId
      );
      const fixedCostStructure = fixedCostStructures.find(
        (s) => s.productId === productId
      );

      const deletePromises = [];

      if (commissionStructure) {
        deletePromises.push(
          fetch(`/api/commission-structures/${commissionStructure.id}`, {
            method: 'DELETE',
          })
        );
      }

      if (fixedCostStructure) {
        deletePromises.push(
          fetch(`/api/fixed-cost-structures/${fixedCostStructure.id}`, {
            method: 'DELETE',
          })
        );
      }

      await Promise.all(deletePromises);
      await fetchManagementData();
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setNewEntry({
      productId: '',
      buyingPrice: 0,
      commission: 0,
      fixedExpense: 0,
      fixedCostType: 'MANUAL',
      description: '',
    });
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
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="bg-muted h-8 w-80 animate-pulse rounded"></div>
            <div className="bg-muted mt-2 h-5 w-96 animate-pulse rounded"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-muted h-10 w-24 animate-pulse rounded"></div>
            <div className="bg-muted h-10 w-28 animate-pulse rounded"></div>
          </div>
        </div>

        {/* Filter Controls Skeleton */}
        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2">
              <div className="bg-muted h-4 w-12 animate-pulse rounded"></div>
              <div className="bg-muted h-10 w-32 animate-pulse rounded"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-muted h-4 w-10 animate-pulse rounded"></div>
              <div className="bg-muted h-10 w-24 animate-pulse rounded"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-muted h-4 w-16 animate-pulse rounded"></div>
              <div className="bg-muted h-10 w-40 animate-pulse rounded"></div>
            </div>
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-card border-border rounded-lg border p-6 shadow transition-colors"
            >
              <div className="flex items-center">
                <div className="bg-muted h-8 w-8 animate-pulse rounded"></div>
                <div className="ml-4 flex-1">
                  <div className="bg-muted mb-2 h-4 w-24 animate-pulse rounded"></div>
                  <div className="bg-muted mb-1 h-8 w-32 animate-pulse rounded"></div>
                  <div className="bg-muted h-3 w-20 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="bg-muted flex w-fit space-x-1 rounded-lg p-1">
            <div className="bg-background h-10 w-32 animate-pulse rounded"></div>
            <div className="bg-muted h-10 w-32 animate-pulse rounded"></div>
          </div>

          {/* Product Analytics Tables Skeleton */}
          <div className="space-y-6">
            {[...Array(2)].map((_, tableIndex) => (
              <div
                key={tableIndex}
                className="bg-card border-border rounded-lg border shadow transition-colors"
              >
                <div className="border-border border-b p-6">
                  <div className="bg-muted mb-2 h-6 w-64 animate-pulse rounded"></div>
                  <div className="bg-muted h-4 w-80 animate-pulse rounded"></div>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          {[...Array(9)].map((_, i) => (
                            <th key={i} className="px-6 py-3">
                              <div className="bg-background h-4 w-20 animate-pulse rounded"></div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-border divide-y">
                        {[...Array(5)].map((_, rowIndex) => (
                          <tr key={rowIndex}>
                            {[...Array(9)].map((_, colIndex) => (
                              <td key={colIndex} className="px-6 py-4">
                                {colIndex === 0 ? (
                                  <div>
                                    <div className="bg-muted mb-1 h-4 w-32 animate-pulse rounded"></div>
                                    <div className="bg-muted h-3 w-24 animate-pulse rounded"></div>
                                  </div>
                                ) : (
                                  <div className="bg-muted ml-auto h-4 w-16 animate-pulse rounded"></div>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}

            {/* Chart Skeleton */}
            <div className="bg-card border-border rounded-lg border shadow transition-colors">
              <div className="border-border border-b p-6">
                <div className="bg-muted mb-2 h-6 w-48 animate-pulse rounded"></div>
                <div className="bg-muted h-4 w-64 animate-pulse rounded"></div>
              </div>
              <div className="p-6">
                <div className="mb-4 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-pulse rounded bg-green-500"></div>
                    <div className="bg-muted h-4 w-32 animate-pulse rounded"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-pulse rounded bg-blue-500"></div>
                    <div className="bg-muted h-4 w-32 animate-pulse rounded"></div>
                  </div>
                </div>
                <div className="bg-muted h-96 animate-pulse rounded"></div>
              </div>
            </div>
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
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Commission & Fixed Cost Management</DialogTitle>
                <DialogDescription>
                  Manage buying prices, commissions, and fixed expenses for{' '}
                  {getMonthName(selectedMonth)} {selectedYear}
                </DialogDescription>
              </DialogHeader>

              {/* Management Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                  <div>
                    <Label htmlFor="product-select">Product</Label>
                    <Select
                      value={newEntry.productId}
                      onValueChange={(value) =>
                        setNewEntry({ ...newEntry, productId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.size}) -{' '}
                            {product.company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="buying-price">
                      Buying Price
                      <span className="text-muted-foreground ml-1 text-xs">
                        (Auto-calculated via FIFO)
                      </span>
                    </Label>
                    <Input
                      id="buying-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newEntry.buyingPrice}
                      onChange={(e) =>
                        setNewEntry({
                          ...newEntry,
                          buyingPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled
                      className="bg-muted cursor-not-allowed"
                      title="Buying prices are automatically calculated using FIFO inventory management based on shipments data"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commission">Commission</Label>
                    <Input
                      id="commission"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newEntry.commission}
                      onChange={(e) =>
                        setNewEntry({
                          ...newEntry,
                          commission: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="fixed-cost-type">স্থির খরচ Type</Label>
                    <Select
                      value={newEntry.fixedCostType}
                      onValueChange={(value: 'MANUAL' | 'CALCULATED') =>
                        setNewEntry({
                          ...newEntry,
                          fixedCostType: value,
                          fixedExpense:
                            value === 'CALCULATED' ? 0 : newEntry.fixedExpense,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANUAL">Manual</SelectItem>
                        <SelectItem value="CALCULATED">
                          Automatic (ইউনিট প্রতি খরচ)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newEntry.fixedCostType === 'MANUAL' && (
                    <div>
                      <Label htmlFor="fixed-expense">স্থির খরচ Amount</Label>
                      <Input
                        id="fixed-expense"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newEntry.fixedExpense}
                        onChange={(e) =>
                          setNewEntry({
                            ...newEntry,
                            fixedExpense: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  )}
                  {newEntry.fixedCostType === 'CALCULATED' && (
                    <div>
                      <Label htmlFor="calculated-cost">
                        Auto ইউনিট প্রতি খরচ
                      </Label>
                      <Input
                        id="calculated-cost"
                        type="text"
                        value={
                          analyticsData
                            ? `${analyticsData.overview.costPerUnit.toFixed(2)}`
                            : '0.00'
                        }
                        disabled
                        className="bg-muted cursor-not-allowed font-medium text-blue-600"
                        title="Automatically calculated from total expenses divided by total sales quantity"
                      />
                    </div>
                  )}
                  <div className="flex items-end space-x-2">
                    <Button
                      onClick={saveEntry}
                      disabled={
                        !newEntry.productId ||
                        (newEntry.commission === 0 &&
                          newEntry.fixedCostType === 'MANUAL' &&
                          newEntry.fixedExpense === 0)
                      }
                      className="flex-1"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {editingRowId ? 'Update' : 'Save'}
                    </Button>
                    {editingRowId && (
                      <Button
                        variant="outline"
                        onClick={cancelEdit}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newEntry.description}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        description: e.target.value,
                      })
                    }
                    placeholder="Optional description..."
                  />
                </div>
              </div>

              {/* Commission Structures Table */}
              <div className="mt-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Commission Structures
                </h3>
                {managementLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Product
                          </th>
                          <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                            Buying Price (FIFO)
                          </th>
                          <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                            Commission
                          </th>
                          <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                            Fixed Expense
                          </th>
                          <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Description
                          </th>
                          <th className="text-muted-foreground px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-border divide-y">
                        {(() => {
                          // Combine data from both structures
                          const combinedData = new Map();

                          // Add commission structures
                          commissionStructures.forEach((structure) => {
                            const key = structure.productId;
                            if (!combinedData.has(key)) {
                              combinedData.set(key, {
                                productId: structure.productId,
                                product: structure.product,
                                buyingPrice: 0, // Will be calculated via FIFO
                                commission: structure.commission,
                                commissionId: structure.id,
                                commissionDescription: structure.description,
                                fixedCost: 0,
                                fixedCostId: null,
                                fixedCostDescription: null,
                              });
                            } else {
                              const existing = combinedData.get(key);
                              existing.commission = structure.commission;
                              existing.commissionId = structure.id;
                              existing.commissionDescription =
                                structure.description;
                            }
                          });

                          // Add fixed cost structures
                          fixedCostStructures.forEach((structure) => {
                            if (structure.productId) {
                              const key = structure.productId;
                              if (!combinedData.has(key)) {
                                combinedData.set(key, {
                                  productId: structure.productId,
                                  product: structure.product,
                                  buyingPrice: 0, // Will be calculated via FIFO
                                  commission: 0,
                                  commissionId: null,
                                  commissionDescription: null,
                                  fixedCost: structure.costPerUnit,
                                  fixedCostId: structure.id,
                                  fixedCostDescription: structure.description,
                                });
                              } else {
                                const existing = combinedData.get(key);
                                existing.fixedCost = structure.costPerUnit;
                                existing.fixedCostId = structure.id;
                                existing.fixedCostDescription =
                                  structure.description;
                              }
                            }
                          });

                          const combinedEntries = Array.from(
                            combinedData.values()
                          );

                          if (combinedEntries.length === 0) {
                            return (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="text-muted-foreground py-8 text-center"
                                >
                                  No commission or fixed cost structures found
                                  for this month.
                                </td>
                              </tr>
                            );
                          }

                          return combinedEntries.map((entry) => (
                            <tr
                              key={entry.productId}
                              className="hover:bg-muted/50 transition-colors"
                            >
                              <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                                <div>
                                  <div className="text-foreground font-medium">
                                    {entry.product.name}
                                  </div>
                                  <div className="text-muted-foreground text-sm">
                                    {entry.product.size} -{' '}
                                    {entry.product.company.name}
                                  </div>
                                </div>
                              </td>
                              <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                                {formatCurrency(entry.buyingPrice)}
                              </td>
                              <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                                {entry.commission > 0
                                  ? formatCurrency(entry.commission)
                                  : '-'}
                              </td>
                              <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                                {entry.fixedCost > 0 ? (
                                  <div className="text-right">
                                    <div className="font-medium">
                                      {formatCurrency(entry.fixedCost)}
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                      {entry.fixedCostType === 'CALCULATED'
                                        ? 'Auto'
                                        : 'Manual'}
                                    </div>
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="text-foreground px-6 py-4 text-sm">
                                <div className="max-w-xs">
                                  {entry.commissionDescription && (
                                    <div className="text-muted-foreground mb-1 text-xs">
                                      Commission: {entry.commissionDescription}
                                    </div>
                                  )}
                                  {entry.fixedCostDescription && (
                                    <div className="text-muted-foreground text-xs">
                                      Fixed Cost: {entry.fixedCostDescription}
                                    </div>
                                  )}
                                  {!entry.commissionDescription &&
                                    !entry.fixedCostDescription &&
                                    '-'}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                                <div className="flex items-center justify-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editRow(entry.productId)}
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4 text-blue-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteRow(entry.productId)}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
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
                {t('monthlyExpenses')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('totalProfit')}
              </p>
              <p
                className={`text-2xl font-bold ${getProfitColor(analyticsData.overview.totalProfit)}`}
              >
                {formatCurrency(analyticsData.overview.totalProfit)}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('monthlyProfit')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex items-center">
            <Calculator className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('costPerUnit')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(analyticsData.overview.costPerUnit)}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('avgCostPerUnit')}
              </p>
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
          {/* Refill Sales Analytics Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground text-lg font-semibold">
                রিফিল বিক্রয় বিশ্লেষণ (Refill Sales Analytics)
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                রিফিল বিক্রয়ের লাভজনকতা বিশ্লেষণ (Refill Sales Profitability
                Analysis)
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
                        <span className="ml-1 text-[10px] font-normal text-blue-500">
                          (FIFO)
                        </span>
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
                        {t('profit')}/{t('unit')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {t('quantity')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {t('totalProfit')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {analyticsData.refillProducts.map((product, index) => (
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
                          <span
                            title={
                              product.fifoData
                                ? `FIFO Calculation:\nTotal Sold: ${product.fifoData.totalSoldQuantity} units\nTotal COGS: ${formatCurrency(product.fifoData.totalCOGS)}\nRemaining Inventory Value: ${formatCurrency(product.fifoData.remainingInventoryValue)}`
                                : 'FIFO-calculated average buying price'
                            }
                            className="cursor-help border-b border-dotted border-blue-400"
                          >
                            {formatCurrency(product.buyingPrice)}
                          </span>
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
                    {/* Total Row for Refill Sales */}
                    <tr className="bg-muted/30 border-primary border-t-2 font-semibold">
                      <td className="text-foreground px-6 py-4 text-sm font-bold">
                        {t('total')} ({t('refillSales')})
                      </td>
                      <td className="px-6 py-4 text-right text-sm">-</td>
                      <td className="px-6 py-4 text-right text-sm">-</td>
                      <td className="px-6 py-4 text-right text-sm">-</td>
                      <td className="px-6 py-4 text-right text-sm">-</td>
                      <td className="px-6 py-4 text-right text-sm">-</td>
                      <td className="px-6 py-4 text-right text-sm">-</td>
                      <td className="text-foreground px-6 py-4 text-right text-sm font-bold">
                        {analyticsData.refillProducts.reduce(
                          (sum, product) => sum + product.salesQuantity,
                          0
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <span
                          className={`font-bold ${getProfitColor(
                            analyticsData.refillProducts.reduce(
                              (sum, product) => sum + product.totalProfit,
                              0
                            )
                          )}`}
                        >
                          {formatCurrency(
                            analyticsData.refillProducts.reduce(
                              (sum, product) => sum + product.totalProfit,
                              0
                            )
                          )}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Package Sales Analytics Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground text-lg font-semibold">
                প্যাকেজ বিক্রয় বিশ্লেষণ (Package Sales Analytics)
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                প্যাকেজ বিক্রয়ের লাভজনকতা বিশ্লেষণ (Package Sales Profitability
                Analysis)
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
                        <span className="ml-1 text-[10px] font-normal text-blue-500">
                          (FIFO)
                        </span>
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
                        {t('profit')}/{t('unit')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {t('quantity')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {t('totalProfit')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {analyticsData.packageProducts.map((product, index) => (
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
                          <span
                            title={
                              product.fifoData
                                ? `FIFO Calculation:\nTotal Sold: ${product.fifoData.totalSoldQuantity} units\nTotal COGS: ${formatCurrency(product.fifoData.totalCOGS)}\nTotal Sales Revenue: ${formatCurrency(product.fifoData.totalSalesRevenue)}\nRemaining Inventory Value: ${formatCurrency(product.fifoData.remainingInventoryValue)}`
                                : 'FIFO-calculated average buying price'
                            }
                            className="cursor-help border-b border-dotted border-blue-400"
                          >
                            {formatCurrency(product.buyingPrice)}
                          </span>
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
                    {/* Total Row for Package Sales */}
                    <tr className="bg-muted/30 border-primary border-t-2 font-semibold">
                      <td className="text-foreground px-6 py-4 text-sm font-bold">
                        {t('total')} ({t('packageSales')})
                      </td>
                      <td className="px-6 py-4 text-right text-sm">-</td>
                      <td className="px-6 py-4 text-right text-sm">-</td>
                      <td className="px-6 py-4 text-right text-sm">-</td>
                      <td className="px-6 py-4 text-right text-sm">-</td>
                      <td className="px-6 py-4 text-right text-sm">-</td>
                      <td className="px-6 py-4 text-right text-sm">-</td>
                      <td className="text-foreground px-6 py-4 text-right text-sm font-bold">
                        {analyticsData.packageProducts.reduce(
                          (sum, product) => sum + product.salesQuantity,
                          0
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <span
                          className={`font-bold ${getProfitColor(
                            analyticsData.packageProducts.reduce(
                              (sum, product) => sum + product.totalProfit,
                              0
                            )
                          )}`}
                        >
                          {formatCurrency(
                            analyticsData.packageProducts.reduce(
                              (sum, product) => sum + product.totalProfit,
                              0
                            )
                          )}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Profit by Product Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">
                {t('revenue')} {t('products')}
              </CardTitle>
              <CardDescription className="text-sm text-white">
                {t('visualRepresentationProfitByProduct')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="mb-4 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-green-500"></div>
                  <span className="text-sm text-white">
                    রিফিল বিক্রয় (Refill Sales)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-blue-500"></div>
                  <span className="text-sm text-white">
                    প্যাকেজ বিক্রয় (Package Sales)
                  </span>
                </div>
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      ...analyticsData.refillProducts,
                      ...analyticsData.packageProducts,
                    ].map((product) => ({
                      ...product,
                      displayName: `${product.product.name}`,
                      fullLabel: `${product.product.name} (${product.product.size}) - ${product.product.company}`,
                      saleTypeLabel:
                        product.saleType === 'REFILL' ? 'রিফিল' : 'প্যাকেজ',
                      barColor:
                        product.saleType === 'REFILL' ? '#10b981' : '#3b82f6', // Green for refill, blue for package
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="displayName"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      interval={0}
                      tick={{ fill: 'white' }}
                    />
                    <YAxis
                      tickFormatter={formatCurrency}
                      fontSize={11}
                      tick={{ fill: 'white' }}
                    />
                    <Tooltip
                      formatter={(value, name, props) => [
                        <span style={{ color: '#10b981' }}>
                          {formatCurrency(Number(value))}
                        </span>,
                        <span
                          style={{ color: '#3b82f6' }}
                        >{`${props.payload.saleTypeLabel} ${t('revenue')}`}</span>,
                      ]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          const data = payload[0].payload;
                          return (
                            <span style={{ color: '#3b82f6' }}>
                              {`${data.fullLabel} | ${data.saleTypeLabel} বিক্রয় • ${data.salesQuantity} ইউনিট`}
                            </span>
                          );
                        }
                        return (
                          <span style={{ color: '#3b82f6' }}>{label}</span>
                        );
                      }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: '#3b82f6',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar
                      dataKey="totalProfit"
                      radius={[4, 4, 0, 0]}
                      name="Revenue"
                    >
                      {[
                        ...analyticsData.refillProducts,
                        ...analyticsData.packageProducts,
                      ].map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.saleType === 'REFILL' ? '#10b981' : '#3b82f6'
                          }
                        />
                      ))}
                    </Bar>
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
                <CardTitle className="text-lg font-semibold text-white">
                  {t('revenue')} {t('drivers')}
                </CardTitle>
                <CardDescription className="text-sm text-white">
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
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        type="number"
                        tickFormatter={formatCurrency}
                        fontSize={11}
                        tick={{ fill: 'white' }}
                      />
                      <YAxis
                        type="category"
                        dataKey="driver.name"
                        fontSize={11}
                        width={100}
                        tick={{ fill: 'white' }}
                      />
                      <Tooltip
                        formatter={(value) => [
                          <span style={{ color: '#10b981' }}>
                            {formatCurrency(Number(value))}
                          </span>,
                          <span style={{ color: '#3b82f6' }}>
                            {t('revenue')}
                          </span>,
                        ]}
                        labelFormatter={(label) => (
                          <span
                            style={{ color: '#3b82f6' }}
                          >{`${t('driver')}: ${label}`}</span>
                        )}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          color: '#3b82f6',
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
    </div>
  );
}
