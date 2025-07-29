'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ChevronDown,
  Building2,
  DollarSign,
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface Product {
  id: string;
  name: string;
  size: string;
  fullName: string;
  currentPrice: number;
  lowStockThreshold: number;
  company: {
    id: string;
    name: string;
  };
}

interface InventoryItem {
  product: Product;
  inventory: {
    fullCylinders: number;
    emptyCylinders: number;
    totalCylinders: number;
    isLowStock: boolean;
    stockValue: number;
    stockHealth: 'good' | 'warning' | 'critical';
  };
}

interface InventoryMovement {
  id: string;
  date: string;
  type: string;
  quantity: number;
  description: string;
  reference: string;
  driver?: {
    name: string;
  };
}

interface InventorySummary {
  totalProducts: number;
  totalFullCylinders: number;
  totalEmptyCylinders: number;
  totalStockValue: number;
  lowStockItems: number;
  criticalStockItems: number;
  stockHealth: {
    good: number;
    warning: number;
    critical: number;
  };
}

interface InventoryData {
  inventory: InventoryItem[];
  summary: InventorySummary;
  lastUpdated: string;
}

interface ProductBreakdown {
  productId: string;
  productName: string;
  productSize: string;
  companyName: string;
  quantity: number;
}

interface SizeBreakdown {
  size: string;
  quantity: number;
}

interface DailyInventoryRecord {
  date: string;
  packageSalesQty: number;
  packageSalesProducts: ProductBreakdown[];
  refillSalesQty: number;
  refillSalesProducts: ProductBreakdown[];
  totalSalesQty: number;
  totalSalesProducts: ProductBreakdown[];
  packagePurchase: number;
  packagePurchaseProducts: ProductBreakdown[];
  refillPurchase: number;
  refillPurchaseProducts: ProductBreakdown[];
  fullCylinders: number;
  fullCylindersBySizes: SizeBreakdown[];
  outstandingShipments: number;
  outstandingShipmentsBySizes: SizeBreakdown[];
  emptyCylindersBuySell: number;
  emptyCylindersBuySellBySizes: SizeBreakdown[];
  emptyCylinderReceivables: number;
  emptyCylinderReceivablesBySizes: SizeBreakdown[];
  emptyCylindersInStock: number;
  emptyCylindersInStockBySizes: SizeBreakdown[];
  totalCylinders: number;
  totalCylindersBySizes: SizeBreakdown[];
  // Legacy fields for backward compatibility
  outstandingOrders?: number;
  outstandingOrdersProducts?: ProductBreakdown[];
  outstandingOrdersBySizes?: SizeBreakdown[];
  outstandingPackageOrders?: number;
  outstandingPackageOrdersProducts?: ProductBreakdown[];
  outstandingRefillOrders?: number;
  outstandingRefillOrdersProducts?: ProductBreakdown[];
  outstandingRefillOrdersBySizes?: SizeBreakdown[];
  emptyCylinders?: number;
  emptyCylindersBySizes?: SizeBreakdown[];
}

interface DailyInventoryData {
  dailyInventory: DailyInventoryRecord[];
  summary: {
    totalDays: number;
    currentFullCylinders: number;
    currentEmptyCylinders: number;
    currentTotalCylinders: number;
  };
}

interface FullCylinderData {
  company: string;
  size: string;
  quantity: number;
}

interface EmptyCylinderData {
  size: string;
  emptyCylinders: number;
  emptyCylindersInHand: number;
}

interface CylindersSummaryData {
  fullCylinders: FullCylinderData[];
  emptyCylinders: EmptyCylinderData[];
  totals: {
    fullCylinders: number;
    emptyCylinders: number;
    emptyCylindersInHand: number;
  };
  totalCylinderReceivables: number;
  lastUpdated: string;
}

export default function InventoryPage() {
  const { formatCurrency, formatDate, t } = useSettings();
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(
    null
  );
  const [dailyInventoryData, setDailyInventoryData] =
    useState<DailyInventoryData | null>(null);
  const [cylindersSummaryData, setCylindersSummaryData] =
    useState<CylindersSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cylindersLoading, setCylindersLoading] = useState(true);
  const [dailyTrackingLoading, setDailyTrackingLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [includeMovements, setIncludeMovements] = useState(false);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);

  // PROGRESSIVE LOADING: Load cylinder summary first, then daily tracking
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setCylindersLoading(true);
      setDailyTrackingLoading(true);
      console.log('🚀 Starting progressive dashboard data loading...');

      const today = new Date();
      const fourDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
      const startDate = fourDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      // PHASE 1: Load cylinder summary and basic inventory first (fastest)
      console.log('📊 Phase 1: Loading cylinder summary and basic inventory...');
      try {
        const [inventoryResponse, cylindersResponse] = await Promise.all([
          fetch(`/api/inventory?includeMovements=${includeMovements}`),
          fetch('/api/inventory/cylinders-summary'),
        ]);

        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json();
          setInventoryData(inventoryData);
          if (inventoryData.inventory?.[0]?.movements) {
            setMovements(inventoryData.inventory[0].movements);
          }
        }

        if (cylindersResponse.ok) {
          const cylindersData = await cylindersResponse.json();
          setCylindersSummaryData(cylindersData);
        }

        setCylindersLoading(false);
        console.log('✅ Phase 1 complete: Cylinder tables loaded');
      } catch (error) {
        console.error('❌ Phase 1 failed:', error);
        setCylindersLoading(false);
      }

      // PHASE 2: Load daily tracking data (slower)
      console.log('📈 Phase 2: Loading daily tracking data...');
      try {
        const dailyResponse = await fetch(
          `/api/inventory/daily?startDate=${startDate}&endDate=${endDate}`
        );

        if (dailyResponse.ok) {
          const dailyData = await dailyResponse.json();
          setDailyInventoryData(dailyData);
          console.log('✅ Phase 2 complete: Daily tracking loaded');
        }
      } catch (error) {
        console.error('❌ Phase 2 failed:', error);
      } finally {
        setDailyTrackingLoading(false);
      }

    } catch (error) {
      console.error('Error in progressive loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    const params = new URLSearchParams();
    if (includeMovements) {
      params.append('includeMovements', 'true');
    }

    const response = await fetch(`/api/inventory?${params}`);
    if (response.ok) {
      const data = await response.json();
      setInventoryData(data);

      if (data.inventory.length > 0 && data.inventory[0].movements) {
        setMovements(data.inventory[0].movements);
      }
    }
  };

  const fetchDailyInventoryData = async () => {
    const today = new Date();
    const fourDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago + today = 4 days total
    const startDate = fourDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const response = await fetch(
      `/api/inventory/daily?startDate=${startDate}&endDate=${endDate}`
    );
    if (response.ok) {
      const data = await response.json();
      setDailyInventoryData(data);
    }
  };

  const fetchCylindersSummaryData = async () => {
    const response = await fetch('/api/inventory/cylinders-summary');
    if (response.ok) {
      const data = await response.json();
      setCylindersSummaryData(data);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [includeMovements]);

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchDashboardData();
  };

  const filteredInventory = inventoryData?.inventory || [];

  const getStockHealthColor = (health: string) => {
    switch (health) {
      case 'good':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStockHealthBg = (health: string) => {
    switch (health) {
      case 'good':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (
    loading &&
    !inventoryData &&
    !cylindersSummaryData &&
    !dailyInventoryData
  ) {
    return (
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">
              {t('inventoryManagement')}
            </h1>
            <p className="text-muted-foreground">
              {t('realTimeInventoryTracking')}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              {t('refresh')}
            </button>
            <button className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              <Download className="mr-2 h-4 w-4" />
              {t('export')}
            </button>
          </div>
        </div>

        {/* Loading Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-card animate-pulse rounded-lg p-6 shadow"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded bg-gray-300"></div>
                <div className="ml-4 flex-1">
                  <div className="mb-2 h-4 w-20 rounded bg-gray-300"></div>
                  <div className="mb-1 h-8 w-12 rounded bg-gray-300"></div>
                  <div className="h-3 w-16 rounded bg-gray-300"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Cylinder Summary Tables */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Full Cylinders Table Skeleton */}
          <div className="bg-card overflow-hidden rounded-lg shadow">
            <div className="border-border border-b px-6 py-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <h2 className="text-foreground text-lg font-semibold">
                  {t('fullCylinders')}
                </h2>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('currentFullCylinderInventory')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      {t('company')}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      {t('size')}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      {t('quantity')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-border divide-y">
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-4 w-20 rounded bg-gray-300"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-12 rounded bg-gray-300"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-8 rounded bg-gray-300"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty Cylinders Table Skeleton */}
          <div className="bg-card overflow-hidden rounded-lg shadow">
            <div className="border-border border-b px-6 py-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <h2 className="text-foreground text-lg font-semibold">
                  {t('emptyCylinders')}
                </h2>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('emptyCylinderInventoryAvailability')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      আকার
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      স্টকে খালি সিলিন্ডার
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      খালি সিলিন্ডার প্রাপ্য
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      অসমাপ্ত চালান
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      মোট খালি সিলিন্ডার
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-border divide-y">
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-4 w-12 rounded bg-gray-300"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-8 rounded bg-gray-300"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-8 rounded bg-gray-300"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-8 rounded bg-gray-300"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-8 rounded bg-gray-300"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Daily Inventory Tracking Table Skeleton */}
        <div className="bg-card overflow-hidden rounded-lg shadow">
          <div className="border-border border-b px-6 py-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <h2 className="text-foreground text-lg font-semibold">
                {t('dailyInventoryTracking')}
              </h2>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('automatedCalculationsExactFormulas')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-muted">
                <tr>
                  <th className="text-muted-foreground w-20 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th className="text-muted-foreground w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('packageSalesQty')}
                  </th>
                  <th className="text-muted-foreground w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('refillSalesQty')}
                  </th>
                  <th className="text-muted-foreground w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('totalSalesQty')}
                  </th>
                  <th className="text-muted-foreground w-36 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('packagePurchase')}
                  </th>
                  <th className="text-muted-foreground w-36 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('refillPurchase')}
                  </th>
                  <th className="text-muted-foreground w-32 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('fullCylinders')}
                  </th>
                  <th className="text-muted-foreground w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('outstandingShipments')}
                  </th>
                  <th className="text-muted-foreground w-24 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('emptyCylindersBuySell')}
                  </th>
                  <th className="text-muted-foreground w-24 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('emptyCylinderReceivables')}
                  </th>
                  <th className="text-muted-foreground w-24 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('emptyCylindersInStock')}
                  </th>
                  <th className="text-muted-foreground w-24 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('totalCylinders')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-border divide-y">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((j) => (
                      <td key={j} className="px-2 py-4">
                        <div className="mb-1 h-4 w-8 rounded bg-gray-300"></div>
                        <div className="h-3 w-12 rounded bg-gray-200"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loading Message */}
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-muted-foreground text-lg">
              {t('loadingInventoryData')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!inventoryData) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-muted-foreground">
              {t('failedToLoadInventoryData')}
            </p>
            <button
              onClick={handleRefresh}
              className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
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
            {t('inventoryManagement')}
          </h1>
          <p className="text-muted-foreground">
            {t('realTimeInventoryTracking')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('refresh')}
          </button>
          <button
            className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            onClick={() => alert(t('exportFunctionalityComingSoon'))}
          >
            <Download className="mr-2 h-4 w-4" />
            {t('export')}
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {inventoryData.summary.criticalStockItems > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            <span className="font-medium text-red-800 dark:text-red-200">
              {t('criticalAlert')}: {inventoryData.summary.criticalStockItems}{' '}
              {t('productsOutOfStock')}
            </span>
          </div>
        </div>
      )}

      {inventoryData.summary.lowStockItems > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
            <span className="font-medium text-yellow-800 dark:text-yellow-200">
              {t('lowStockWarning')}: {inventoryData.summary.lowStockItems}{' '}
              {t('productsBelowMinimumThreshold')}
            </span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('fullCylinders')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {dailyInventoryData?.summary.currentFullCylinders ||
                  inventoryData.summary.totalFullCylinders}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('currentStock')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-gray-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('emptyCylinders')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {dailyInventoryData?.summary.currentEmptyCylinders ||
                  inventoryData.summary.totalEmptyCylinders}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('currentStock')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('todaysSales')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {dailyInventoryData?.dailyInventory[0]?.totalSalesQty || 0}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('cylindersSold')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('todaysPurchases')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {(dailyInventoryData?.dailyInventory[0]?.packagePurchase || 0) +
                  (dailyInventoryData?.dailyInventory[0]?.refillPurchase || 0)}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('cylindersReceived')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('totalCylinders')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {dailyInventoryData?.summary.currentTotalCylinders ||
                  inventoryData.summary.totalFullCylinders +
                    inventoryData.summary.totalEmptyCylinders}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('allCylinders')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cylinder Summary Tables */}
      {cylindersLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Full Cylinders Table Skeleton */}
          <div className="bg-card overflow-hidden rounded-lg shadow">
            <div className="border-border border-b px-6 py-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <h2 className="text-foreground text-lg font-semibold">
                  {t('fullCylinders')}
                </h2>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('currentFullCylinderInventory')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      {t('company')}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      {t('size')}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      {t('quantity')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-border divide-y">
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-4 w-20 rounded bg-gray-300"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-12 rounded bg-gray-300"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-8 rounded bg-gray-300"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty Cylinders Table Skeleton */}
          <div className="bg-card overflow-hidden rounded-lg shadow">
            <div className="border-border border-b px-6 py-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <h2 className="text-foreground text-lg font-semibold">
                  {t('emptyCylinders')}
                </h2>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('emptyCylinderInventoryAvailability')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      আকার
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      স্টকে খালি সিলিন্ডার
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      খালি সিলিন্ডার প্রাপ্য
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      অসমাপ্ত চালান
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      মোট খালি সিলিন্ডার
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-border divide-y">
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-4 w-12 rounded bg-gray-300"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-8 rounded bg-gray-300"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-8 rounded bg-gray-300"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-8 rounded bg-gray-300"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-8 rounded bg-gray-300"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : cylindersSummaryData ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Full Cylinders Table */}
          <div className="bg-card flex flex-col overflow-hidden rounded-lg shadow">
            <div className="border-border border-b px-6 py-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-foreground text-lg font-semibold">
                  {t('fullCylinders')}
                </h2>
                <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                  ✓ Loaded
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('currentFullCylinderInventory')}
              </p>
            </div>
            <div className="flex flex-1 flex-col overflow-x-auto">
              <table className="min-w-full flex-1 divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      {t('company')}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      {t('size')}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      {t('quantity')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-border flex-1 divide-y">
                  {cylindersSummaryData.fullCylinders &&
                  cylindersSummaryData.fullCylinders.length > 0 ? (
                    <>
                      {cylindersSummaryData.fullCylinders.map((item, index) => (
                        <tr
                          key={`${item.company}-${item.size}`}
                          className="hover:bg-muted/50"
                        >
                          <td className="text-foreground whitespace-nowrap px-4 py-3 text-sm font-medium">
                            {item.company}
                          </td>
                          <td className="text-foreground whitespace-nowrap px-4 py-3 text-sm">
                            {item.size}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400">
                            {item.quantity}
                          </td>
                        </tr>
                      ))}
                      {/* Add empty rows to match the height of empty cylinders table */}
                      {Array.from({
                        length: Math.max(
                          0,
                          (cylindersSummaryData.emptyCylinders?.length || 0) -
                            (cylindersSummaryData.fullCylinders?.length || 0)
                        ),
                      }).map((_, index) => (
                        <tr key={`empty-${index}`} className="h-12">
                          <td className="px-4 py-3">&nbsp;</td>
                          <td className="px-4 py-3">&nbsp;</td>
                          <td className="px-4 py-3">&nbsp;</td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center">
                        <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <p className="text-muted-foreground">
                          {t('noFullCylindersInInventory')}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                    <td className="text-foreground whitespace-nowrap px-4 py-3 text-sm font-bold">
                      {t('total')}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-4 py-3 text-sm font-bold">
                      -
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-blue-700 dark:text-blue-300">
                      {cylindersSummaryData.totals?.fullCylinders || 0}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Empty Cylinders Table */}
          <div className="bg-card flex flex-col overflow-hidden rounded-lg shadow">
            <div className="border-border border-b px-6 py-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-foreground text-lg font-semibold">
                  {t('emptyCylinders')}
                </h2>
                <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                  ✓ Loaded
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('emptyCylinderInventoryAvailability')}
              </p>
            </div>
            <div className="flex flex-1 flex-col overflow-x-auto">
              <table className="min-w-full flex-1 divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      আকার
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      স্টকে খালি সিলিন্ডার
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      খালি সিলিন্ডার প্রাপ্য
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      অসমাপ্ত চালান
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      মোট খালি সিলিন্ডার
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-border flex-1 divide-y">
                  {cylindersSummaryData.emptyCylinders &&
                  cylindersSummaryData.emptyCylinders.length > 0 ? (
                    <>
                      {cylindersSummaryData.emptyCylinders.map(
                        (item, index) => {
                          const receivablesForSize =
                            (cylindersSummaryData as any)
                              .receivablesBreakdown?.[item.size] || 0;
                          const outstandingShipmentsForSize =
                            dailyInventoryData?.dailyInventory[0]?.outstandingRefillOrdersBySizes?.find(
                              (s: any) => s.size === item.size
                            )?.quantity || 0;
                          // Use correct empty cylinders in stock from daily inventory data
                          const correctEmptyCylindersInStock =
                            dailyInventoryData?.dailyInventory[0]?.emptyCylindersInStockBySizes?.find(
                              (s: any) => s.size === item.size
                            )?.quantity ||
                            dailyInventoryData?.dailyInventory[0]?.emptyCylindersBySizes?.find(
                              (s: any) => s.size === item.size
                            )?.quantity ||
                            0;
                          const totalEmptyCylinders =
                            correctEmptyCylindersInStock +
                            receivablesForSize +
                            outstandingShipmentsForSize;

                          return (
                            <tr key={item.size} className="hover:bg-muted/50">
                              <td className="text-foreground whitespace-nowrap px-4 py-3 text-sm font-medium">
                                {item.size}
                              </td>
                              <td className="text-foreground whitespace-nowrap px-4 py-3 text-sm">
                                {correctEmptyCylindersInStock}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-orange-600 dark:text-orange-400">
                                {receivablesForSize}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400">
                                {outstandingShipmentsForSize}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400">
                                {totalEmptyCylinders}
                              </td>
                            </tr>
                          );
                        }
                      )}
                      {/* Add empty rows to match the height of full cylinders table */}
                      {Array.from({
                        length: Math.max(
                          0,
                          (cylindersSummaryData.fullCylinders?.length || 0) -
                            (cylindersSummaryData.emptyCylinders?.length || 0)
                        ),
                      }).map((_, index) => (
                        <tr key={`empty-${index}`} className="h-12">
                          <td className="px-4 py-3">&nbsp;</td>
                          <td className="px-4 py-3">&nbsp;</td>
                          <td className="px-4 py-3">&nbsp;</td>
                          <td className="px-4 py-3">&nbsp;</td>
                          <td className="px-4 py-3">&nbsp;</td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center">
                        <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <p className="text-muted-foreground">
                          {t('noEmptyCylindersInInventory')}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                    <td className="text-foreground whitespace-nowrap px-4 py-3 text-sm font-bold">
                      মোট
                    </td>
                    <td className="text-foreground whitespace-nowrap px-4 py-3 text-sm font-bold">
                      {dailyInventoryData?.dailyInventory[0]
                        ?.emptyCylindersInStock ||
                        dailyInventoryData?.dailyInventory[0]?.emptyCylinders ||
                        0}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-orange-700 dark:text-orange-300">
                      {cylindersSummaryData.totalCylinderReceivables || 0}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-blue-700 dark:text-blue-300">
                      {dailyInventoryData?.dailyInventory[0]
                        ?.outstandingRefillOrders || 0}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-green-700 dark:text-green-300">
                      {(dailyInventoryData?.dailyInventory[0]
                        ?.emptyCylindersInStock ||
                        dailyInventoryData?.dailyInventory[0]?.emptyCylinders ||
                        0) +
                        (cylindersSummaryData.totalCylinderReceivables || 0) +
                        (dailyInventoryData?.dailyInventory[0]
                          ?.outstandingRefillOrders || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {/* Daily Inventory Tracking Table */}
      {dailyTrackingLoading ? (
        <div className="bg-card overflow-hidden rounded-lg shadow">
          <div className="border-border border-b px-6 py-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <h2 className="text-foreground text-lg font-semibold">
                {t('dailyInventoryTracking')}
              </h2>
              <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Loading...
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('automatedCalculationsExactFormulas')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-muted">
                <tr>
                  <th className="text-muted-foreground w-20 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th className="text-muted-foreground w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('packageSalesQty')}
                  </th>
                  <th className="text-muted-foreground w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('refillSalesQty')}
                  </th>
                  <th className="text-muted-foreground w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('totalSalesQty')}
                  </th>
                  <th className="text-muted-foreground w-36 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('packagePurchase')}
                  </th>
                  <th className="text-muted-foreground w-36 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('refillPurchase')}
                  </th>
                  <th className="text-muted-foreground w-32 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('fullCylinders')}
                  </th>
                  <th className="text-muted-foreground w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('outstandingShipments')}
                  </th>
                  <th className="text-muted-foreground w-24 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('emptyCylindersBuySell')}
                  </th>
                  <th className="text-muted-foreground w-24 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('emptyCylinderReceivables')}
                  </th>
                  <th className="text-muted-foreground w-24 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('emptyCylindersInStock')}
                  </th>
                  <th className="text-muted-foreground w-24 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('totalCylinders')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-border divide-y">
                {[1, 2].map((i) => (
                  <tr key={i} className="animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((j) => (
                      <td key={j} className="px-2 py-4">
                        <div className="mb-1 h-4 w-8 rounded bg-gray-300"></div>
                        <div className="h-3 w-12 rounded bg-gray-200"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : dailyInventoryData ? (
        <div className="bg-card overflow-hidden rounded-lg shadow">
          <div className="border-border border-b px-6 py-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-foreground text-lg font-semibold">
                {t('dailyInventoryTracking')}
              </h2>
              <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                ✓ Loaded
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('automatedCalculationsExactFormulas')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-muted">
                <tr>
                  <th className="text-muted-foreground w-20 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th className="text-muted-foreground w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('packageSalesQty')}
                  </th>
                  <th className="text-muted-foreground w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('refillSalesQty')}
                  </th>
                  <th className="text-muted-foreground w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('totalSalesQty')}
                  </th>
                  <th className="text-muted-foreground w-36 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('packagePurchase')}
                  </th>
                  <th className="text-muted-foreground w-36 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('refillPurchase')}
                  </th>
                  <th className="text-muted-foreground w-32 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('fullCylinders')}
                  </th>
                  <th className="text-muted-foreground w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('outstandingShipments')}
                  </th>
                  <th className="text-muted-foreground w-24 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('emptyCylindersBuySell')}
                  </th>
                  <th className="text-muted-foreground w-24 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('emptyCylinderReceivables')}
                  </th>
                  <th className="text-muted-foreground w-24 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('emptyCylindersInStock')}
                  </th>
                  <th className="text-muted-foreground w-24 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('totalCylinders')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-border divide-y">
                {dailyInventoryData.dailyInventory.map((record, index) => (
                  <React.Fragment key={record.date}>
                    {/* Main row with totals */}
                    <tr
                      className={`hover:bg-muted/50 ${
                        index === 0
                          ? 'bg-blue-50 font-medium dark:bg-blue-900/20'
                          : ''
                      }`}
                    >
                      {/* Date Column */}
                      <td className="text-foreground whitespace-nowrap border-r border-gray-200 px-2 py-4 text-sm font-medium dark:border-gray-700">
                        {formatDate(record.date)}
                        {index === 0 && (
                          <div className="mt-1">
                            <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {t('latest')}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Package Sales(Qty) - Wider */}
                      <td className="border-r border-gray-200 px-4 py-4 dark:border-gray-700">
                        <div className="mb-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                          {record.packageSalesQty}
                        </div>
                        {record.packageSalesProducts.map((product, index) => (
                          <div
                            key={`package-sales-${product.productId}-${index}`}
                            className="text-xs leading-tight text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {product.companyName}
                            </span>{' '}
                            -
                            <span className="mx-1">
                              {product.productName} ({product.productSize})
                            </span>
                            <span className="font-semibold text-blue-600">
                              {' '}
                              {product.quantity}
                            </span>
                          </div>
                        ))}
                      </td>

                      {/* Refill Sales(Qty) - Wider */}
                      <td className="border-r border-gray-200 px-4 py-4 dark:border-gray-700">
                        <div className="mb-2 text-sm font-bold text-green-600 dark:text-green-400">
                          {record.refillSalesQty}
                        </div>
                        {record.refillSalesProducts.map((product, index) => (
                          <div
                            key={`refill-sales-${product.productId}-${index}`}
                            className="text-xs leading-tight text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {product.companyName}
                            </span>{' '}
                            -
                            <span className="mx-1">
                              {product.productName} ({product.productSize})
                            </span>
                            <span className="font-semibold text-green-600">
                              {' '}
                              {product.quantity}
                            </span>
                          </div>
                        ))}
                      </td>

                      {/* Total Sales (Qty) - Wider */}
                      <td className="border-r border-gray-200 px-4 py-4 dark:border-gray-700">
                        <div className="mb-2 text-sm font-bold text-purple-600 dark:text-purple-400">
                          {record.totalSalesQty}
                        </div>
                        {record.totalSalesProducts.map((product, index) => (
                          <div
                            key={`total-sales-${product.productId}-${index}`}
                            className="text-xs leading-tight text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {product.companyName}
                            </span>{' '}
                            -
                            <span className="mx-1">
                              {product.productName} ({product.productSize})
                            </span>
                            <span className="font-semibold text-purple-600">
                              {' '}
                              {product.quantity}
                            </span>
                          </div>
                        ))}
                      </td>

                      {/* Package Purchase - Wider */}
                      <td className="border-r border-gray-200 px-4 py-4 dark:border-gray-700">
                        <div className="mb-2 text-sm font-bold text-orange-600 dark:text-orange-400">
                          {record.packagePurchase > 0
                            ? `+${record.packagePurchase}`
                            : '0'}
                        </div>
                        {record.packagePurchaseProducts.map(
                          (product, index) => (
                            <div
                              key={`package-purchase-${product.productId}-${index}`}
                              className="text-xs leading-tight text-gray-600 dark:text-gray-400"
                            >
                              <span className="font-medium">
                                {product.companyName}
                              </span>{' '}
                              -
                              <span className="mx-1">
                                {product.productName} ({product.productSize})
                              </span>
                              <span className="font-semibold text-green-600">
                                {' '}
                                +{product.quantity}
                              </span>
                            </div>
                          )
                        )}
                      </td>

                      {/* Refill Purchase - Wider */}
                      <td className="border-r border-gray-200 px-4 py-4 dark:border-gray-700">
                        <div className="mb-2 text-sm font-bold text-green-600 dark:text-green-400">
                          {record.refillPurchase > 0
                            ? `+${record.refillPurchase}`
                            : '0'}
                        </div>
                        {record.refillPurchaseProducts.map((product, index) => (
                          <div
                            key={`refill-purchase-${product.productId}-${index}`}
                            className="text-xs leading-tight text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {product.companyName}
                            </span>{' '}
                            -
                            <span className="mx-1">
                              {product.productName} ({product.productSize})
                            </span>
                            <span className="font-semibold text-green-600">
                              {' '}
                              +{product.quantity}
                            </span>
                          </div>
                        ))}
                      </td>

                      {/* Full Cylinders */}
                      <td className="border-r border-gray-200 px-3 py-4 dark:border-gray-700">
                        <div className="mb-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                          {record.fullCylinders}
                        </div>
                        {record.fullCylindersBySizes?.map((sizeBreakdown) => (
                          <div
                            key={sizeBreakdown.size}
                            className="text-xs leading-tight text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {sizeBreakdown.size}:
                            </span>
                            <span className="ml-1 font-semibold text-blue-600">
                              {sizeBreakdown.quantity}
                            </span>
                          </div>
                        ))}
                      </td>

                      {/* Outstanding Shipments - Wider */}
                      <td className="border-r border-gray-200 px-4 py-4 dark:border-gray-700">
                        <div className="mb-2 text-sm font-bold text-orange-600 dark:text-orange-400">
                          {record.outstandingShipments ||
                            record.outstandingOrders ||
                            0}
                        </div>

                        {/* Package Outstanding Orders */}
                        {(record.outstandingPackageOrders || 0) > 0 && (
                          <div className="mb-1">
                            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                              Package: {record.outstandingPackageOrders}
                            </div>
                            {record.outstandingPackageOrdersProducts?.map(
                              (product, index) => (
                                <div
                                  key={`outstanding-package-${product.productId}-${index}`}
                                  className="ml-2 text-xs leading-tight text-gray-600 dark:text-gray-400"
                                >
                                  <span className="font-medium">
                                    {product.companyName}
                                  </span>{' '}
                                  -
                                  <span className="mx-1">
                                    {product.productName} ({product.productSize}
                                    )
                                  </span>
                                  <span className="font-semibold text-blue-600">
                                    {' '}
                                    {product.quantity}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {/* Refill Outstanding Orders */}
                        {(record.outstandingRefillOrders || 0) > 0 && (
                          <div className="mb-1">
                            <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                              Refill: {record.outstandingRefillOrders}
                            </div>
                            {record.outstandingRefillOrdersProducts?.map(
                              (product, index) => (
                                <div
                                  key={`outstanding-refill-${product.productId}-${index}`}
                                  className="ml-2 text-xs leading-tight text-gray-600 dark:text-gray-400"
                                >
                                  <span className="font-medium">
                                    {product.companyName}
                                  </span>{' '}
                                  -
                                  <span className="mx-1">
                                    {product.productName} ({product.productSize}
                                    )
                                  </span>
                                  <span className="font-semibold text-green-600">
                                    {' '}
                                    {product.quantity}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {/* Show message if no outstanding orders */}
                        {(record.outstandingShipments ||
                          record.outstandingOrders ||
                          0) === 0 && (
                          <div className="text-xs italic text-gray-500 dark:text-gray-400">
                            {t('noOutstandingOrders')}
                          </div>
                        )}
                      </td>

                      {/* Empty Cylinders Buy/Sell - Narrower */}
                      <td className="border-r border-gray-200 px-2 py-4 dark:border-gray-700">
                        <div className="mb-1 text-sm font-bold">
                          <span
                            className={
                              record.emptyCylindersBuySell >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }
                          >
                            {record.emptyCylindersBuySell >= 0 ? '+' : ''}
                            {record.emptyCylindersBuySell}
                          </span>
                        </div>
                        {record.emptyCylindersBuySellBySizes?.map(
                          (sizeBreakdown) => (
                            <div
                              key={sizeBreakdown.size}
                              className="text-xs leading-tight text-gray-600 dark:text-gray-400"
                            >
                              <span className="font-medium">
                                {sizeBreakdown.size}:
                              </span>
                              <span className="ml-1 font-semibold">
                                {sizeBreakdown.quantity >= 0 ? '+' : ''}
                                {sizeBreakdown.quantity}
                              </span>
                            </div>
                          )
                        )}
                      </td>

                      {/* Empty Cylinder Receivables - Narrower */}
                      <td className="border-r border-gray-200 px-2 py-4 dark:border-gray-700">
                        <div className="mb-1 text-sm font-bold text-red-600 dark:text-red-400">
                          {record.emptyCylinderReceivables || 0}
                        </div>
                        {record.emptyCylinderReceivablesBySizes?.map(
                          (sizeBreakdown) => (
                            <div
                              key={sizeBreakdown.size}
                              className="text-xs leading-tight text-gray-600 dark:text-gray-400"
                            >
                              <span className="font-medium">
                                {sizeBreakdown.size}:
                              </span>
                              <span className="ml-1 font-semibold text-red-600">
                                {sizeBreakdown.quantity}
                              </span>
                            </div>
                          )
                        )}
                      </td>

                      {/* Empty Cylinders in Stock - Narrower */}
                      <td className="border-r border-gray-200 px-2 py-4 dark:border-gray-700">
                        <div className="mb-1 text-sm font-bold text-gray-600 dark:text-gray-400">
                          {record.emptyCylindersInStock ||
                            record.emptyCylinders ||
                            0}
                        </div>
                        {(
                          record.emptyCylindersInStockBySizes ||
                          record.emptyCylindersBySizes
                        )?.map((sizeBreakdown) => (
                          <div
                            key={sizeBreakdown.size}
                            className="text-xs leading-tight text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {sizeBreakdown.size}:
                            </span>
                            <span className="ml-1 font-semibold text-gray-600">
                              {sizeBreakdown.quantity}
                            </span>
                          </div>
                        ))}
                      </td>

                      {/* Total Cylinders - Narrower */}
                      <td className="px-2 py-4">
                        <div className="mb-1 text-sm font-bold text-purple-600 dark:text-purple-400">
                          {record.totalCylinders}
                        </div>
                        {record.totalCylindersBySizes?.map((sizeBreakdown) => (
                          <div
                            key={sizeBreakdown.size}
                            className="text-xs leading-tight text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {sizeBreakdown.size}:
                            </span>
                            <span className="ml-1 font-semibold text-purple-600">
                              {sizeBreakdown.quantity}
                            </span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {dailyInventoryData.dailyInventory.length === 0 && (
              <div className="p-8 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-muted-foreground">
                  {t('noDailyInventoryDataAvailable')}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
