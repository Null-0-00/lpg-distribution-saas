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
  DynamicResponsiveContainer as ResponsiveContainer 
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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

      // Update product buying price
      if (newEntry.buyingPrice > 0) {
        await fetch(`/api/products/${newEntry.productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            costPrice: newEntry.buyingPrice,
          }),
        });
      }

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
      if (newEntry.fixedExpense > 0) {
        await fetch('/api/fixed-cost-structures', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: newEntry.productId,
            costPerUnit: newEntry.fixedExpense,
            month: selectedMonth,
            year: selectedYear,
            costType: 'MANUAL',
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
            fixedCostDescription: structure.description,
          });
        } else {
          const existing = combinedData.get(key);
          existing.fixedCost = structure.costPerUnit;
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
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
                    <Label htmlFor="buying-price">Buying Price</Label>
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
                    <Label htmlFor="fixed-expense">Fixed Expense</Label>
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
                  <div className="flex items-end space-x-2">
                    <Button
                      onClick={saveEntry}
                      disabled={
                        !newEntry.productId ||
                        (newEntry.buyingPrice === 0 &&
                          newEntry.commission === 0 &&
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
                            Buying Price
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
                                buyingPrice: structure.product.costPrice || 0,
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
                                  buyingPrice:
                                    structure.product?.costPrice || 0,
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
                                {entry.fixedCost > 0
                                  ? formatCurrency(entry.fixedCost)
                                  : '-'}
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
    </div>
  );
}
