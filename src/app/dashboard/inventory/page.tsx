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
  emptyCylindersBuySell: number;
  emptyCylindersBuySellBySizes: SizeBreakdown[];
  fullCylinders: number;
  fullCylindersBySizes: SizeBreakdown[];
  emptyCylinders: number;
  emptyCylindersBySizes: SizeBreakdown[];
  totalCylinders: number;
  totalCylindersBySizes: SizeBreakdown[];
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
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [includeMovements, setIncludeMovements] = useState(false);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);

  useEffect(() => {
    fetchInventoryData();
    fetchDailyInventoryData();
    fetchCylindersSummaryData();
  }, [includeMovements]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (includeMovements) {
        params.append('includeMovements', 'true');
      }

      const response = await fetch(`/api/inventory?${params}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInventoryData(data);

        // Extract movements from the first product if available
        if (data.inventory.length > 0 && data.inventory[0].movements) {
          setMovements(data.inventory[0].movements);
        }
      }
    } catch (error) {
      console.error(t('errorFetchingInventoryData'), error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyInventoryData = async () => {
    try {
      console.log('🔄 Fetching daily inventory data...');
      const startTime = performance.now();

      // Add reduced date range for faster loading - default to 7 days instead of 30
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = (() => {
        const date = new Date();
        date.setDate(date.getDate() - 7); // Reduced from 30 to 7 days
        return date.toISOString().split('T')[0];
      })();

      const response = await fetch(
        `/api/inventory/daily?startDate=${startDate}&endDate=${endDate}&_t=${Date.now()}`,
        {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const endTime = performance.now();
        console.log(
          `✅ Daily inventory data loaded in ${(endTime - startTime).toFixed(2)}ms`
        );
        console.log(
          `📊 Daily inventory records:`,
          data.dailyInventory?.length || 0
        );
        setDailyInventoryData(data);
      } else {
        console.error(
          '❌ Failed to fetch daily inventory data:',
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error(t('errorFetchingDailyInventoryData'), error);
    }
  };

  const fetchCylindersSummaryData = async () => {
    try {
      console.log(t('fetchingCylindersSummaryData'));
      const response = await fetch('/api/inventory/cylinders-summary', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      console.log(t('cylindersSummaryResponseStatus'), response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(t('cylindersSummaryDataReceived'), data);
        setCylindersSummaryData(data);
      } else {
        const errorText = await response.text();
        console.error(
          t('cylindersSummaryApiError'),
          response.status,
          errorText
        );
      }
    } catch (error) {
      console.error(t('errorFetchingCylindersSummaryData'), error);
    }
  };

  const handleRefresh = () => {
    fetchInventoryData();
    fetchDailyInventoryData();
    fetchCylindersSummaryData();
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

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-muted-foreground">
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
      {cylindersSummaryData && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Full Cylinders Table */}
          <div className="bg-card overflow-hidden rounded-lg shadow">
            <div className="border-border border-b px-6 py-4">
              <h2 className="text-foreground text-lg font-semibold">
                {t('fullCylinders')}
              </h2>
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
                  {cylindersSummaryData.fullCylinders &&
                  cylindersSummaryData.fullCylinders.length > 0 ? (
                    cylindersSummaryData.fullCylinders.map((item, index) => (
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
                    ))
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
              </table>
            </div>
          </div>

          {/* Empty Cylinders Table */}
          <div className="bg-card overflow-hidden rounded-lg shadow">
            <div className="border-border border-b px-6 py-4">
              <h2 className="text-foreground text-lg font-semibold">
                {t('emptyCylinders')}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('emptyCylinderInventoryAvailability')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      {t('size')}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      {t('emptyCylinders')}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      {t('emptyCylindersInHand')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-border divide-y">
                  {cylindersSummaryData.emptyCylinders &&
                  cylindersSummaryData.emptyCylinders.length > 0 ? (
                    cylindersSummaryData.emptyCylinders.map((item, index) => (
                      <tr key={item.size} className="hover:bg-muted/50">
                        <td className="text-foreground whitespace-nowrap px-4 py-3 text-sm font-medium">
                          {item.size}
                        </td>
                        <td className="text-foreground whitespace-nowrap px-4 py-3 text-sm">
                          {item.emptyCylinders}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400">
                          {item.emptyCylindersInHand}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center">
                        <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <p className="text-muted-foreground">
                          {t('noEmptyCylindersInInventory')}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {cylindersSummaryData.totalCylinderReceivables > 0 && (
              <div className="border-t border-blue-200 bg-blue-50 px-6 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{t('note')}:</strong> {t('totalCylinderReceivables')}:{' '}
                  {cylindersSummaryData.totalCylinderReceivables}{' '}
                  {t('cylinders')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily Inventory Tracking Table */}
      {dailyInventoryData && (
        <div className="bg-card overflow-hidden rounded-lg shadow">
          <div className="border-border border-b px-6 py-4">
            <h2 className="text-foreground text-lg font-semibold">
              {t('dailyInventoryTracking')}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('automatedCalculationsExactFormulas')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-muted">
                <tr>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('packageSalesQty')}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('refillSalesQty')}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('totalSalesQty')}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('packagePurchase')}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('refillPurchase')}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('emptyCylindersBuySell')}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('fullCylinders')}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('emptyCylinders')}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
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
                      <td className="text-foreground whitespace-nowrap border-r border-gray-200 px-4 py-4 text-sm font-medium dark:border-gray-700">
                        {formatDate(record.date)}
                        {index === 0 && (
                          <span className="ml-2 inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {t('latest')}
                          </span>
                        )}
                      </td>
                      <td className="border-r border-gray-200 px-4 py-4 dark:border-gray-700">
                        <div className="mb-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                          {record.packageSalesQty}
                        </div>
                        {record.packageSalesProducts.map((product) => (
                          <div
                            key={product.productId}
                            className="py-0.5 text-xs text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {product.companyName}
                            </span>
                            <span className="mx-1">-</span>
                            <span>
                              {product.productName} ({product.productSize})
                            </span>
                            <span className="ml-1 font-semibold">
                              {product.quantity}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="border-r border-gray-200 px-4 py-4 dark:border-gray-700">
                        <div className="mb-1 text-sm font-bold text-green-600 dark:text-green-400">
                          {record.refillSalesQty}
                        </div>
                        {record.refillSalesProducts.map((product) => (
                          <div
                            key={product.productId}
                            className="py-0.5 text-xs text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {product.companyName}
                            </span>
                            <span className="mx-1">-</span>
                            <span>
                              {product.productName} ({product.productSize})
                            </span>
                            <span className="ml-1 font-semibold">
                              {product.quantity}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="border-r border-gray-200 px-4 py-4 dark:border-gray-700">
                        <div className="mb-1 text-sm font-bold text-purple-600 dark:text-purple-400">
                          {record.totalSalesQty}
                        </div>
                        {record.totalSalesProducts.map((product) => (
                          <div
                            key={product.productId}
                            className="py-0.5 text-xs text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {product.companyName}
                            </span>
                            <span className="mx-1">-</span>
                            <span>
                              {product.productName} ({product.productSize})
                            </span>
                            <span className="ml-1 font-semibold">
                              {product.quantity}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="border-r border-gray-200 px-4 py-4 dark:border-gray-700">
                        <div className="mb-1 text-sm font-bold text-green-600 dark:text-green-400">
                          {record.packagePurchase > 0
                            ? `+${record.packagePurchase}`
                            : '0'}
                        </div>
                        {record.packagePurchaseProducts.map((product) => (
                          <div
                            key={product.productId}
                            className="py-0.5 text-xs text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {product.companyName}
                            </span>
                            <span className="mx-1">-</span>
                            <span>
                              {product.productName} ({product.productSize})
                            </span>
                            <span className="ml-1 font-semibold text-green-600">
                              +{product.quantity}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="border-r border-gray-200 px-4 py-4 dark:border-gray-700">
                        <div className="mb-1 text-sm font-bold text-green-600 dark:text-green-400">
                          {record.refillPurchase > 0
                            ? `+${record.refillPurchase}`
                            : '0'}
                        </div>
                        {record.refillPurchaseProducts.map((product) => (
                          <div
                            key={product.productId}
                            className="py-0.5 text-xs text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {product.companyName}
                            </span>
                            <span className="mx-1">-</span>
                            <span>
                              {product.productName} ({product.productSize})
                            </span>
                            <span className="ml-1 font-semibold text-green-600">
                              +{product.quantity}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="border-r border-gray-200 px-4 py-4 dark:border-gray-700">
                        <div className="mb-1 text-sm font-bold text-orange-600 dark:text-orange-400">
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
                              className="py-0.5 text-xs text-gray-600 dark:text-gray-400"
                            >
                              <span className="font-medium">
                                {sizeBreakdown.size}
                              </span>
                              <span className="ml-2 font-semibold">
                                {sizeBreakdown.quantity >= 0 ? '+' : ''}
                                {sizeBreakdown.quantity}
                              </span>
                            </div>
                          )
                        )}
                      </td>
                      <td className="border-r border-gray-200 px-4 py-4 dark:border-gray-700">
                        <div className="mb-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                          {record.fullCylinders}
                        </div>
                        {record.fullCylindersBySizes?.map((sizeBreakdown) => (
                          <div
                            key={sizeBreakdown.size}
                            className="py-0.5 text-xs text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {sizeBreakdown.size}
                            </span>
                            <span className="ml-2 font-semibold text-blue-600">
                              {sizeBreakdown.quantity}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="border-r border-gray-200 px-4 py-4 dark:border-gray-700">
                        <div className="mb-1 text-sm font-bold text-gray-600 dark:text-gray-400">
                          {record.emptyCylinders}
                        </div>
                        {record.emptyCylindersBySizes?.map((sizeBreakdown) => (
                          <div
                            key={sizeBreakdown.size}
                            className="py-0.5 text-xs text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {sizeBreakdown.size}
                            </span>
                            <span className="ml-2 font-semibold text-gray-600">
                              {sizeBreakdown.quantity}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-4">
                        <div className="mb-1 text-sm font-bold text-purple-600 dark:text-purple-400">
                          {record.totalCylinders}
                        </div>
                        {record.totalCylindersBySizes?.map((sizeBreakdown) => (
                          <div
                            key={sizeBreakdown.size}
                            className="py-0.5 text-xs text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {sizeBreakdown.size}
                            </span>
                            <span className="ml-2 font-semibold text-purple-600">
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
      )}

      {/* Business Formula Explanations */}
      <div className="bg-card rounded-lg p-6 shadow">
        <h3 className="text-foreground mb-4 text-lg font-semibold">
          {t('businessFormulaImplementation')}
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-foreground mb-3 font-medium">
              {t('dailyCalculations')}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="rounded bg-blue-50 p-2 dark:bg-blue-900/20">
                <strong className="text-foreground">
                  {t('todaysFullCylinders')} =
                </strong>
                <span className="text-muted-foreground">
                  {' '}
                  {t('yesterdaysFull')} + {t('packagePurchase')} +{' '}
                  {t('refillPurchase')} - {t('totalSales')}
                </span>
              </div>
              <div className="rounded bg-green-50 p-2 dark:bg-green-900/20">
                <strong className="text-foreground">
                  {t('todaysEmptyCylinders')} =
                </strong>
                <span className="text-muted-foreground">
                  {' '}
                  {t('yesterdaysEmpty')} + {t('refillSales')} +{' '}
                  {t('emptyCylindersBuySell')}
                </span>
              </div>
              <div className="rounded bg-purple-50 p-2 dark:bg-purple-900/20">
                <strong className="text-foreground">
                  {t('totalCylinders')} =
                </strong>
                <span className="text-muted-foreground">
                  {' '}
                  {t('fullCylinders')} + {t('emptyCylinders')}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-foreground mb-3 font-medium">
              {t('dataSources')}
            </h4>
            <div className="text-muted-foreground space-y-2 text-sm">
              <div>
                •{' '}
                <strong className="text-foreground">
                  {t('packageRefillSales')}:
                </strong>{' '}
                {t('sumAllDriversSalesForDate')}
              </div>
              <div>
                •{' '}
                <strong className="text-foreground">
                  {t('packageRefillPurchase')}:
                </strong>{' '}
                {t('sumCompletedShipmentsFromShipmentsPage')}
              </div>
              <div>
                •{' '}
                <strong className="text-foreground">
                  {t('emptyCylindersBuySell')}:
                </strong>{' '}
                {t('sumCompletedEmptyCylinderShipments')}
              </div>
              <div className="mt-3 rounded border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-800 dark:bg-yellow-900/20">
                <strong className="text-foreground">{t('note')}:</strong>
                <span className="text-muted-foreground">
                  {' '}
                  {t('allCalculationsUpdatedRealTime')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Health Summary */}
      <div className="bg-card rounded-lg p-6 shadow">
        <h3 className="text-foreground mb-4 text-lg font-semibold">
          {t('currentStockHealth')}
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-green-600 dark:text-green-400">
              {inventoryData.summary.stockHealth.good}
            </div>
            <div className="text-muted-foreground text-sm">
              {t('productsInGoodStock')}
            </div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {inventoryData.summary.stockHealth.warning}
            </div>
            <div className="text-muted-foreground text-sm">
              {t('producentsWithLowStockWarning')}
            </div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-red-600 dark:text-red-400">
              {inventoryData.summary.stockHealth.critical}
            </div>
            <div className="text-muted-foreground text-sm">
              {t('productsInCriticalStock')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
