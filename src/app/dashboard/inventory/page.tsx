"use client";

import { useState, useEffect } from 'react';
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
  DollarSign
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

interface DailyInventoryRecord {
  date: string;
  packageSalesQty: number;
  refillSalesQty: number;
  totalSalesQty: number;
  packagePurchase: number;
  refillPurchase: number;
  emptyCylindersBuySell: number;
  fullCylinders: number;
  emptyCylinders: number;
  totalCylinders: number;
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
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);
  const [dailyInventoryData, setDailyInventoryData] = useState<DailyInventoryData | null>(null);
  const [cylindersSummaryData, setCylindersSummaryData] = useState<CylindersSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
          'Cache-Control': 'no-cache'
        }
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
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyInventoryData = async () => {
    try {
      const response = await fetch('/api/inventory/daily', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDailyInventoryData(data);
      }
    } catch (error) {
      console.error('Error fetching daily inventory data:', error);
    }
  };

  const fetchCylindersSummaryData = async () => {
    try {
      console.log('Fetching cylinders summary data...');
      const response = await fetch('/api/inventory/cylinders-summary', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      console.log('Cylinders summary response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Cylinders summary data received:', data);
        setCylindersSummaryData(data);
      } else {
        const errorText = await response.text();
        console.error('Cylinders summary API error:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching cylinders summary data:', error);
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
      case 'good': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStockHealthBg = (health: string) => {
    switch (health) {
      case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };


  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-muted-foreground">{t('loadingInventoryData')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!inventoryData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">{t('failedToLoadInventoryData')}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('inventoryManagement')}</h1>
          <p className="text-muted-foreground">
            {t('realTimeInventoryTracking')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('refresh')}
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={() => alert(t('exportFunctionalityComingSoon'))}
          >
            <Download className="h-4 w-4 mr-2" />
            {t('export')}
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {inventoryData.summary.criticalStockItems > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-800 dark:text-red-200 font-medium">
              {t('criticalAlert')}: {inventoryData.summary.criticalStockItems} {t('productsOutOfStock')}
            </span>
          </div>
        </div>
      )}
      
      {inventoryData.summary.lowStockItems > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-yellow-800 dark:text-yellow-200 font-medium">
              {t('lowStockWarning')}: {inventoryData.summary.lowStockItems} {t('productsBelowMinimumThreshold')}
            </span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('fullCylinders')}</p>
              <p className="text-2xl font-bold text-foreground">
                {dailyInventoryData?.summary.currentFullCylinders || inventoryData.summary.totalFullCylinders}
              </p>
              <p className="text-xs text-muted-foreground">{t('currentStock')}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-gray-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('emptyCylinders')}</p>
              <p className="text-2xl font-bold text-foreground">
                {dailyInventoryData?.summary.currentEmptyCylinders || inventoryData.summary.totalEmptyCylinders}
              </p>
              <p className="text-xs text-muted-foreground">{t('currentStock')}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('todaysSales')}</p>
              <p className="text-2xl font-bold text-foreground">
                {dailyInventoryData?.dailyInventory[0]?.totalSalesQty || 0}
              </p>
              <p className="text-xs text-muted-foreground">{t('cylindersSold')}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('todaysPurchases')}</p>
              <p className="text-2xl font-bold text-foreground">
                {(dailyInventoryData?.dailyInventory[0]?.packagePurchase || 0) + (dailyInventoryData?.dailyInventory[0]?.refillPurchase || 0)}
              </p>
              <p className="text-xs text-muted-foreground">{t('cylindersReceived')}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('totalCylinders')}</p>
              <p className="text-2xl font-bold text-foreground">
                {dailyInventoryData?.summary.currentTotalCylinders || (inventoryData.summary.totalFullCylinders + inventoryData.summary.totalEmptyCylinders)}
              </p>
              <p className="text-xs text-muted-foreground">{t('allCylinders')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cylinder Summary Tables */}
      {cylindersSummaryData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Full Cylinders Table */}
          <div className="bg-card rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{t('fullCylinders')}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('currentFullCylinderInventory')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('company')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('size')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('quantity')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {cylindersSummaryData.fullCylinders && cylindersSummaryData.fullCylinders.length > 0 ? (
                    cylindersSummaryData.fullCylinders.map((item, index) => (
                      <tr key={`${item.company}-${item.size}`} className="hover:bg-muted/50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">
                          {item.company}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                          {item.size}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">
                          {item.quantity}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-muted-foreground">{t('noFullCylindersInInventory')}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty Cylinders Table */}
          <div className="bg-card rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{t('emptyCylinders')}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('emptyCylinderInventoryAvailability')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('size')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('emptyCylinders')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('emptyCylindersInHand')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {cylindersSummaryData.emptyCylinders && cylindersSummaryData.emptyCylinders.length > 0 ? (
                    cylindersSummaryData.emptyCylinders.map((item, index) => (
                      <tr key={item.size} className="hover:bg-muted/50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">
                          {item.size}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                          {item.emptyCylinders}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">
                          {item.emptyCylindersInHand}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-muted-foreground">{t('noEmptyCylindersInInventory')}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {cylindersSummaryData.totalCylinderReceivables > 0 && (
              <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{t('note')}:</strong> {t('totalCylinderReceivables')}: {cylindersSummaryData.totalCylinderReceivables} {t('cylinders')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}






      {/* Daily Inventory Tracking Table */}
      {dailyInventoryData && (
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">{t('dailyInventoryTracking')}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('automatedCalculationsExactFormulas')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('packageSalesQty')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('refillSalesQty')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('totalSalesQty')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('packagePurchase')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('refillPurchase')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('emptyCylindersBuySell')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('fullCylinders')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('emptyCylinders')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('totalCylinders')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {dailyInventoryData.dailyInventory.map((record, index) => (
                  <tr key={record.date} className={`hover:bg-muted/50 ${
                    index === 0 ? 'bg-blue-50 dark:bg-blue-900/20 font-medium' : ''
                  }`}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {formatDate(record.date)}
                      {index === 0 && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {t('latest')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                      {record.packageSalesQty}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                      {record.refillSalesQty}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {record.totalSalesQty}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                      {record.packagePurchase > 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">+{record.packagePurchase}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                      {record.refillPurchase > 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">+{record.refillPurchase}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                      <span className={record.emptyCylindersBuySell >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {record.emptyCylindersBuySell >= 0 ? '+' : ''}{record.emptyCylindersBuySell}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">
                      {record.fullCylinders}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-600 dark:text-gray-400">
                      {record.emptyCylinders}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-purple-600 dark:text-purple-400">
                      {record.totalCylinders}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dailyInventoryData.dailyInventory.length === 0 && (
              <div className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">{t('noDailyInventoryDataAvailable')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Business Formula Explanations */}
      <div className="bg-card rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">{t('businessFormulaImplementation')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-3">{t('dailyCalculations')}</h4>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <strong className="text-foreground">{t('todaysFullCylinders')} =</strong>
                <span className="text-muted-foreground"> {t('yesterdaysFull')} + {t('packagePurchase')} + {t('refillPurchase')} - {t('totalSales')}</span>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <strong className="text-foreground">{t('todaysEmptyCylinders')} =</strong>
                <span className="text-muted-foreground"> {t('yesterdaysEmpty')} + {t('refillSales')} + {t('emptyCylindersBuySell')}</span>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                <strong className="text-foreground">{t('totalCylinders')} =</strong>
                <span className="text-muted-foreground"> {t('fullCylinders')} + {t('emptyCylinders')}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-3">{t('dataSources')}</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>• <strong className="text-foreground">{t('packageRefillSales')}:</strong> {t('sumAllDriversSalesForDate')}</div>
              <div>• <strong className="text-foreground">{t('packageRefillPurchase')}:</strong> {t('sumCompletedShipmentsFromShipmentsPage')}</div>
              <div>• <strong className="text-foreground">{t('emptyCylindersBuySell')}:</strong> {t('sumCompletedEmptyCylinderShipments')}</div>
              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <strong className="text-foreground">{t('note')}:</strong>
                <span className="text-muted-foreground"> {t('allCalculationsUpdatedRealTime')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Health Summary */}
      <div className="bg-card rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">{t('currentStockHealth')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {inventoryData.summary.stockHealth.good}
            </div>
            <div className="text-sm text-muted-foreground">{t('productsInGoodStock')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
              {inventoryData.summary.stockHealth.warning}
            </div>
            <div className="text-sm text-muted-foreground">{t('productsWithLowStockWarning')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {inventoryData.summary.stockHealth.critical}
            </div>
            <div className="text-sm text-muted-foreground">{t('productsInCriticalStock')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}